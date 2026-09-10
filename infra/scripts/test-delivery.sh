#!/usr/bin/env bash
set -euo pipefail
repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
for script in "$repository_root"/infra/scripts/*.sh; do bash -n "$script"; done

python3 - "$repository_root" <<'PY'
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import yaml

source = Path(sys.argv[1])
documents = list(yaml.safe_load_all((source / 'infra/k8s/website.yaml').read_text()))
deployment = next(doc for doc in documents if doc['kind'] == 'Deployment')
pvc = next(doc for doc in documents if doc['kind'] == 'PersistentVolumeClaim')
assert deployment['spec']['replicas'] == 1 and deployment['spec']['strategy']['type'] == 'Recreate'
assert pvc['metadata']['annotations']['argocd.argoproj.io/sync-options'] == 'Prune=false'
pod = deployment['spec']['template']['spec']
assert not pod['automountServiceAccountToken'] and pod['securityContext']['runAsUser'] == 10001
assert pod['containers'][0]['readinessProbe']['httpGet']['path'] == '/healthz'
mail_env = {item['name']: item for item in pod['containers'][0]['env']}
assert mail_env['CONTACT_SENDER']['value'] == 'noreply@swirlit.dev'
mail_ref = mail_env['RESEND_API_KEY']['valueFrom']['secretKeyRef']
mail_secret = yaml.safe_load((source / 'infra/k8s/contact-notifications.yaml').read_text())
assert mail_ref['name'] == mail_secret['spec']['target']['name']
assert mail_ref['key'] == mail_secret['spec']['data'][0]['secretKey']
assert mail_secret['spec']['data'][0]['remoteRef'] == {'key': 'apps/website/contact', 'property': 'RESEND_API_KEY'}
assert 'contact-notifications.yaml' in yaml.safe_load((source / 'infra/k8s/kustomization.yaml').read_text())['resources']
ingress = yaml.safe_load((source / 'infra/k8s/ingress.yaml').read_text())
assert [rule['host'] for rule in ingress['spec']['rules']] == ['swirlit.dev', 'www.swirlit.dev']
assert ingress['spec']['ingressClassName'] == 'nginx'
assert ingress['metadata']['annotations']['nginx.ingress.kubernetes.io/force-ssl-redirect'] == 'true'
assert ingress['metadata']['annotations']['nginx.ingress.kubernetes.io/preserve-trailing-slash'] == 'true'
assert set(ingress['spec']['tls'][0]['hosts']) == {'swirlit.dev', 'www.swirlit.dev'}
assert ingress['spec']['tls'][0]['secretName'] == 'swirlit-dev-tls'
assert mail_env['PUBLIC_ORIGIN']['value'] == 'https://' + ingress['spec']['rules'][0]['host']
assert ingress['spec']['rules'][1]['http']['paths'] == ingress['spec']['rules'][0]['http']['paths']
assert 'nginx.ingress.kubernetes.io/permanent-redirect' not in ingress['metadata']['annotations']
credentials = yaml.safe_load((source / 'infra/argocd/repository-credentials.yaml').read_text())
assert credentials['metadata']['namespace'] == 'infra'
assert credentials['spec']['target']['template']['metadata']['labels']['argocd.argoproj.io/secret-type'] == 'repository'
assert all(item['remoteRef']['key'] == 'apps/website/registry' for item in credentials['spec']['data'])
role, binding = list(yaml.safe_load_all((source / 'infra/k8s/delivery-rbac.yaml').read_text()))
assert role['rules'] == [{'apiGroups':['apps'], 'resources':['deployments'],
                          'resourceNames':['website'], 'verbs':['get','list','watch']}]
assert binding['subjects'] == [{'kind':'ServiceAccount', 'name':'gitlab-ci-job', 'namespace':'gitlab-runners'}]
pipeline = yaml.safe_load((source / '.gitlab-ci.yml').read_text())
assert not pipeline['verify'].get('allow_failure', False)
assert pipeline['release']['resource_group'] == 'website-production'
assert pipeline['image-build']['needs'] == [{'job': 'verify', 'artifacts': True}]
assert pipeline['release']['needs'] == [{'job': 'image-build', 'artifacts': True}]
assert pipeline['image-build']['image']['entrypoint'] == ['']

mock = r'''#!/usr/bin/env python3
import json, os, pathlib, subprocess, sys
name = pathlib.Path(sys.argv[0]).name
args = sys.argv[1:]
with open(os.environ['MOCK_LOG'], 'a') as log:
    log.write(json.dumps({'tool':name,'args':args})+'\n')
if name == 'kaniko':
    # Regression: a private credential umask must not produce root-only image
    # parent directories. Check both sides of that boundary at execution time.
    inherited_umask = os.umask(0)
    os.umask(inherited_umask)
    assert inherited_umask == 0o022, f'Kaniko inherited unsafe image umask {inherited_umask:04o}'
    docker_config = pathlib.Path(os.environ['DOCKER_CONFIG'])
    assert docker_config.stat().st_mode & 0o777 == 0o700
    assert (docker_config/'config.json').stat().st_mode & 0o777 == 0o600
    pathlib.Path(args[args.index('--digest-file')+1]).write_text(os.environ['MOCK_DIGEST'])
    if os.environ.get('MOCK_ADVANCE_REPO'):
        repository = pathlib.Path(os.environ['MOCK_ADVANCE_REPO'])
        (repository/'new-source.txt').write_text('A newer source push during the image build\n')
        for command in (['git','add','.'], ['git','commit','-qm','newer source'], ['git','push','-q','origin','HEAD:main']):
            subprocess.run(command,cwd=repository,check=True)
elif name == 'kubectl' and args[:3] == ['get','application','website']:
    revision = subprocess.check_output(['git','rev-parse','HEAD'], text=True).strip()
    print(json.dumps({'status':{'sync':{'revision':revision,'status':'Synced'},'health':{'status':'Healthy'}}}))
elif name == 'kubectl' and args[:3] == ['get','deployment','website']:
    print(json.dumps({'spec':{'template':{'spec':{'containers':[{'name':'website','image':os.environ['MOCK_IMAGE']}]}}}}))
elif name == 'curl':
    print('{"ok":true}')
'''

def git(directory, *args):
    return subprocess.check_output(['git', *args], cwd=directory, text=True, stderr=subprocess.DEVNULL).strip()

with tempfile.TemporaryDirectory(prefix='website-delivery-test.') as directory:
    temporary = Path(directory)
    remote = temporary / 'remote.git'
    workspace = temporary / 'workspace'
    workspace.mkdir()
    git(temporary, 'init', '--bare', str(remote))
    git(workspace, 'init', '-b', 'main')
    git(workspace, 'config', 'user.name', 'Delivery test')
    git(workspace, 'config', 'user.email', 'test@example.invalid')
    git(workspace, 'remote', 'add', 'origin', str(remote))
    shutil.copytree(source / 'infra', workspace / 'infra')
    (workspace / 'dist/server').mkdir(parents=True)
    (workspace / 'dist/client').mkdir(parents=True)
    (workspace / 'dist/server/index.js').write_text('// verified worker artifact\n')
    (workspace / 'dist/client/site.css').write_text('body{}\n')
    (workspace / 'Dockerfile').write_text('FROM scratch\n')
    git(workspace, 'add', '.')
    git(workspace, 'commit', '-qm', 'source fixture')
    git(workspace, 'push', '-q', '-u', 'origin', 'main')
    revision = git(workspace, 'rev-parse', 'HEAD')
    commands = temporary / 'bin'
    commands.mkdir()
    for name in ('kaniko', 'kubectl', 'curl'):
        path = commands / name
        path.write_text(mock)
        path.chmod(0o700)
    digest = 'sha256:' + 'a' * 64
    image = 'registry.swirlit.dev/swirlit/website/site@' + digest
    log = temporary / 'calls.jsonl'
    environment = dict(os.environ, PATH=str(commands)+':'+os.environ['PATH'], MOCK_LOG=str(log),
                       MOCK_DIGEST=digest, MOCK_IMAGE=image, CI_COMMIT_SHA=revision,
                       CI_PROJECT_DIR=str(workspace), DOCKER_CONFIG=str(temporary / 'docker-config'),
                       CI_DEFAULT_BRANCH='main', CI_PROJECT_PATH='swirlit/website',
                       CI_REGISTRY_USER='fixture', CI_REGISTRY_PASSWORD='fixture-secret',
                       REGISTRY_PUSH_HOST='registry.internal:5050',
                       REGISTRY_PULL_IMAGE='registry.swirlit.dev/swirlit/website/site',
                       KANIKO_EXECUTOR=str(commands / 'kaniko'))

    def execute(script, shell='bash'):
        log.write_text('')
        result = subprocess.run([shell, 'infra/scripts/'+script], cwd=workspace,
                                env=environment, capture_output=True, text=True)
        assert result.returncode == 0, result.stdout + result.stderr
        assert 'fixture-secret' not in result.stdout + result.stderr + log.read_text()
        return [json.loads(line) for line in log.read_text().splitlines()]

    image_calls = execute('ci-build-image.sh', 'sh')
    assert not (temporary / 'docker-config/config.json').exists()
    calls = execute('ci-release.sh')
    assert 'DEPLOY_SKIPPED=false' in (workspace / 'release.env').read_text()
    assert image in (workspace / 'release.env').read_text()
    assert '[skip ci]' in git(workspace, 'log', '-1', '--format=%s')
    assert git(workspace, 'rev-parse', 'HEAD') == git(remote, 'rev-parse', 'refs/heads/main')
    builder = next(call for call in image_calls if call['tool'] == 'kaniko')
    assert builder['args'][builder['args'].index('--target')+1] == 'prebuilt'
    assert builder['args'][builder['args'].index('--destination')+1].endswith(':'+revision)
    assert any(call['tool'] == 'curl' and call['args'][-1].endswith('/healthz') for call in calls)

    # Retrying an old pipeline never overwrites the newer GitOps commit.
    git(workspace, 'checkout', '-q', '--detach', revision)
    calls = execute('ci-release.sh')
    assert 'DEPLOY_SKIPPED=true' in (workspace / 'release.env').read_text()
    assert not calls

    # A source push while the image is being built also prevents deployment.
    git(workspace, 'checkout', '-q', '-B', 'main', 'origin/main')
    environment['CI_COMMIT_SHA'] = git(workspace, 'rev-parse', 'HEAD')
    racing = temporary / 'racing-source'
    git(temporary, 'clone', '-q', '-b', 'main', str(remote), str(racing))
    git(racing, 'config', 'user.name', 'Delivery test')
    git(racing, 'config', 'user.email', 'test@example.invalid')
    environment['MOCK_ADVANCE_REPO'] = str(racing)
    image_calls = execute('ci-build-image.sh', 'sh')
    assert [call['tool'] for call in image_calls] == ['kaniko']
    calls = execute('ci-release.sh')
    assert 'DEPLOY_SKIPPED=true' in (workspace / 'release.env').read_text()
    assert not calls
    assert git(remote, 'rev-parse', 'refs/heads/main') == git(racing, 'rev-parse', 'HEAD')

print('PASS: canonical www redirect, persistent single-writer deployment, private repository credentials, immutable delivery, and stale-pipeline guards')
PY
