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
documents = list(yaml.safe_load_all((source / 'infra/k8s/swirl-website.yaml').read_text()))
deployment = next(doc for doc in documents if doc['kind'] == 'Deployment')
pvc = next(doc for doc in documents if doc['kind'] == 'PersistentVolumeClaim')
assert deployment['spec']['replicas'] == 1 and deployment['spec']['strategy']['type'] == 'Recreate'
assert pvc['metadata']['annotations']['argocd.argoproj.io/sync-options'] == 'Prune=false'
pod = deployment['spec']['template']['spec']
assert not pod['automountServiceAccountToken'] and pod['securityContext']['runAsUser'] == 10001
assert pod['containers'][0]['readinessProbe']['httpGet']['path'] == '/healthz'


def tolerates_load(container):
    # Kubernetes' 1-second default timeout restarts a working server on a loaded node.
    liveness, readiness = container['livenessProbe'], container['readinessProbe']
    return (liveness.get('timeoutSeconds', 1) >= 5 and container['startupProbe'].get('timeoutSeconds', 1) >= 5
            and liveness.get('periodSeconds', 10) * liveness.get('failureThreshold', 3) >= 60
            and readiness.get('timeoutSeconds', 1) >= 3)


assert tolerates_load(pod['containers'][0])
mail_env = {item['name']: item for item in pod['containers'][0]['env']}
assert mail_env['CONTACT_SENDER']['value'] == 'noreply@swirlit.dev'
mail_ref = mail_env['RESEND_API_KEY']['valueFrom']['secretKeyRef']
mail_secret = yaml.safe_load((source / 'infra/k8s/contact-notifications.yaml').read_text())
assert mail_ref['name'] == mail_secret['spec']['target']['name']
assert mail_ref['key'] == mail_secret['spec']['data'][0]['secretKey']
assert mail_secret['spec']['data'][0]['remoteRef'] == {'key': 'apps/swirl-website/contact', 'property': 'RESEND_API_KEY'}
assert 'contact-notifications.yaml' in yaml.safe_load((source / 'infra/k8s/kustomization.yaml').read_text())['resources']
routes = list(yaml.safe_load_all((source / 'infra/k8s/ingress.yaml').read_text()))
ingress = next(doc for doc in routes if doc['kind'] == 'Ingress')
hosts = [rule['host'] for rule in ingress['spec']['rules']]
assert len(hosts) == len(set(hosts)) == 2
assert ingress['spec']['ingressClassName'] == 'traefik'
assert ingress['metadata']['annotations']['traefik.ingress.kubernetes.io/router.entrypoints'] == 'websecure'
assert ingress['metadata']['annotations']['traefik.ingress.kubernetes.io/router.tls'] == 'true'
assert ingress['metadata']['annotations']['traefik.ingress.kubernetes.io/router.middlewares'] == 'apps-swirl-website-upload-limit@kubernetescrd'
assert next(doc for doc in routes if doc['kind'] == 'Middleware')['spec'] == {'buffering': {'maxRequestBodyBytes': 18432}}
assert set(ingress['spec']['tls'][0]['hosts']) == set(hosts)
assert ingress['spec']['tls'][0]['secretName']
assert mail_env['PUBLIC_ORIGIN']['value'] == 'https://' + ingress['spec']['rules'][0]['host']
assert mail_env['PUBLIC_ALIAS_HOST']['value'] == hosts[1]
assert ingress['spec']['rules'][1]['http']['paths'] == ingress['spec']['rules'][0]['http']['paths']
# Both hosts and the original path reach the app, which owns alias redirects.
assert all(not key.startswith('nginx.ingress.kubernetes.io/') for key in ingress['metadata']['annotations'])
credentials = yaml.safe_load((source / 'infra/argocd/repository-credentials.yaml').read_text())
assert credentials['metadata']['namespace'] == 'infra'
assert credentials['spec']['target']['template']['metadata']['labels']['argocd.argoproj.io/secret-type'] == 'repository'
assert all(item['remoteRef']['key'] == 'apps/swirl-website/registry' for item in credentials['spec']['data'])
role, binding = list(yaml.safe_load_all((source / 'infra/k8s/delivery-rbac.yaml').read_text()))
assert role['rules'] == [{'apiGroups':['apps'], 'resources':['deployments'],
                          'resourceNames':['swirl-website'], 'verbs':['get','list','watch']}]
assert binding['subjects'] == [{'kind':'ServiceAccount', 'name':'gitlab-ci-job', 'namespace':'gitlab-runners'}]
pipeline = yaml.safe_load((source / '.gitlab-ci.yml').read_text())
# Every check the site ran before versioned releases stays in a blocking job.
for name in ('01-build', '02-test', '03-package', '01-e2e'):
    assert not pipeline[name].get('allow_failure', False), name
assert pipeline['01-build']['script'] == ['infra/scripts/ci-verify.sh build']
assert pipeline['02-test']['script'] == ['infra/scripts/ci-verify.sh test']
assert pipeline['01-e2e']['script'][-1].startswith('npm run test:e2e')
# Jobs start once their inputs exist; heavy ones size their workers to the job's CPUs.
assert pipeline['02-test']['needs'] == [] and pipeline['02-test']['parallel']['matrix'] == [
    {'SUITE': ['static', 'unit', 'delivery', 'audit']}]
assert pipeline['02-quality']['needs'] == [{'job': '02-test', 'parallel': {'matrix': [{'SUITE': 'unit'}]}, 'artifacts': True}]
for name in ('01-build', '02-test', '01-e2e'):
    assert pipeline[name]['variables']['KUBERNETES_CPU_LIMIT'] == '8', name
assert 'job-cpus.sh' in pipeline['01-e2e']['script'][-1]
verify = (source / 'infra/scripts/ci-verify.sh').read_text()
for check in ('npm run check', 'npm run build', 'scripts/check-built-security.py', 'scripts/check-built-seo.py',
              'infra/scripts/test-delivery.sh', 'infra/scripts/test-onboarding.py', 'npm run lint',
              'npm run format:check', 'npm run test:coverage', 'node scripts/audit.mjs'):
    assert check in verify, check
if shutil.which('kubectl'):
    rendered = list(yaml.safe_load_all(subprocess.check_output(['kubectl', 'kustomize', str(source/'infra/overlays/ha')], text=True)))
    ha = next(doc for doc in rendered if doc['kind'] == 'Deployment')
    assert ha['spec']['replicas'] == 2 and ha['spec']['strategy']['type'] == 'RollingUpdate'
    ha_pod = ha['spec']['template']['spec']
    spread = ha_pod['topologySpreadConstraints'][0]
    assert spread['minDomains'] == 2 and spread['whenUnsatisfiable'] == 'DoNotSchedule'
    assert spread['topologyKey'] == 'kubernetes.io/hostname'
    assert spread['labelSelector'] == ha['spec']['selector']
    assert all(volume['name'] != 'data' for volume in ha_pod['volumes'])
    app_container = ha_pod['containers'][0]
    assert app_container['livenessProbe']['httpGet']['path'] == '/livez' and tolerates_load(app_container)
    assert any(env['name'] == 'DATABASE_URL' and not env['valueFrom']['secretKeyRef'].get('optional') for env in app_container['env'])
    budget = next(doc for doc in rendered if doc['kind'] == 'PodDisruptionBudget')
    assert budget['spec']['minAvailable'] == 1 and budget['spec']['selector'] == ha['spec']['selector']
    for hook_name in ('swirl-website-db-setup', 'swirl-website-schema-migration'):
        hook = next(doc for doc in rendered if doc['kind'] == 'Job' and doc['metadata']['name'] == hook_name)
        assert hook['metadata']['annotations']['argocd.argoproj.io/hook'] == 'PreSync'
        assert hook['spec']['template']['spec']['containers'][0]['image'] == app_container['image']
for name in ('01-release', '02-deploy', 'set-major-version'):
    assert pipeline[name]['resource_group'] == 'swirl-website-production' and pipeline[name]['interruptible'] is False, name
assert pipeline['03-package']['needs'] == [{'job': '01-build', 'artifacts': True}]
assert pipeline['01-e2e']['needs'] == [{'job': '01-build', 'artifacts': True}]
# Every check still gates the release.
assert pipeline['01-release']['needs'] == [{'job': '01-build', 'artifacts': True}, {'job': '02-test', 'artifacts': False},
                                           {'job': '03-package', 'artifacts': False}, {'job': '01-e2e', 'artifacts': False}]
assert pipeline['02-deploy']['needs'] == [{'job': '01-release', 'artifacts': True}]
assert pipeline['01-release']['artifacts']['reports']['dotenv'] == 'release.env'

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
    if '--digest-file' in args:
        docker_config = pathlib.Path(os.environ['DOCKER_CONFIG'])
        assert docker_config.stat().st_mode & 0o777 == 0o700
        assert (docker_config/'config.json').stat().st_mode & 0o777 == 0o600
        pathlib.Path(args[args.index('--digest-file')+1]).write_text(os.environ['MOCK_DIGEST'])
    if os.environ.get('MOCK_ADVANCE_REPO'):
        repository = pathlib.Path(os.environ['MOCK_ADVANCE_REPO'])
        (repository/'new-source.txt').write_text('A newer source push during the image build\n')
        for command in (['git','add','.'], ['git','commit','-qm','newer source'], ['git','push','-q','origin','HEAD:main']):
            subprocess.run(command,cwd=repository,check=True)
elif name == 'kubectl' and args[:3] == ['get','application','swirl-website']:
    revision = subprocess.check_output(['git','rev-parse','origin/main'], text=True).strip()
    print(json.dumps({'status':{'sync':{'revision':revision,'status':'Synced'},'health':{'status':'Healthy'}}}))
elif name == 'kubectl' and args[:3] == ['get','deployment','swirl-website']:
    print(json.dumps({'spec':{'template':{'spec':{'containers':[{'name':'swirl-website','image':os.environ['MOCK_IMAGE']}]}}}}))
elif name == 'curl':
    print('{}')
'''

def git(directory, *args):
    return subprocess.check_output(['git', *args], cwd=directory, text=True, stderr=subprocess.DEVNULL).strip()

with tempfile.TemporaryDirectory(prefix='swirl-website-delivery-test.') as directory:
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
    (workspace / 'VERSION').write_text('1.0.0\n')
    (workspace / 'package.json').write_text('{\n  "name": "swirl-website",\n  "version": "1.0.0"\n}\n')
    (workspace / 'package-lock.json').write_text(
        '{\n  "name": "swirl-website",\n  "version": "1.0.0",\n  "lockfileVersion": 3,\n  "packages": {\n'
        '    "": {\n      "name": "swirl-website",\n      "version": "1.0.0"\n    }\n  }\n}\n')
    (workspace / 'dist/client').mkdir(parents=True)
    (workspace / 'dist/runtime').mkdir(parents=True)
    (workspace / 'dist/runtime/main.js').write_text('// verified runtime artifact\n')
    (workspace / 'dist/runtime/migrate-postgres.js').write_text('// verified migration artifact\n')
    (workspace / 'dist/client/site.css').write_text('body{}\n')
    (workspace / 'Dockerfile.runtime').write_text('FROM scratch\n')
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
    image_name = yaml.safe_load((source/'infra/k8s/kustomization.yaml').read_text())['images'][0]['name']
    image = image_name + ':1.0.0@' + digest
    log = temporary / 'calls.jsonl'
    environment = dict(os.environ, PATH=str(commands)+':'+os.environ['PATH'], MOCK_LOG=str(log),
                       MOCK_DIGEST=digest, MOCK_IMAGE=image, CI_COMMIT_SHA=revision,
                       APP_ONBOARDING='true', ONBOARDING_EXPECTED_SHA=revision,
                       CI_PIPELINE_SOURCE='api', CI_PIPELINE_ID='73', CI_COMMIT_BRANCH='main',
                       CI_PROJECT_DIR=str(workspace), DOCKER_CONFIG=str(temporary / 'docker-config'),
                       CI_DEFAULT_BRANCH='main', CI_PROJECT_PATH='swirl/swirl-website', CI_PROJECT_ID='42',
                       CI_SERVER_URL='https://gitlab.example', CI_API_V4_URL='https://gitlab.example/api/v4',
                       CI_JOB_TOKEN='fixture-job-token',
                       CI_REGISTRY_USER='fixture', CI_REGISTRY_PASSWORD='fixture-secret',
                       REGISTRY_PUSH_HOST='registry.internal:5050',
                       REGISTRY_PULL_IMAGE=image_name,
                       KANIKO_EXECUTOR=str(commands / 'kaniko'))
    for stale in ('APP_VERSION', 'DEPLOY_REVISION', 'IMAGE', 'NEW_MAJOR_VERSION'):
        environment.pop(stale, None)

    def execute(script, *arguments, succeed=True):
        log.write_text('')
        result = subprocess.run(['bash', 'infra/scripts/'+script, *arguments], cwd=workspace,
                                env=environment, capture_output=True, text=True)
        assert (result.returncode == 0) == succeed, result.stdout + result.stderr
        assert 'fixture-secret' not in result.stdout + result.stderr + log.read_text()
        return [json.loads(line) for line in log.read_text().splitlines()]

    # The commit that sets VERSION is its baseline.
    version = subprocess.check_output(['sh', 'infra/scripts/current-version.sh'], cwd=workspace,
                                      env=environment, text=True).strip()
    assert version == '1.0.0', version
    environment['APP_VERSION'] = version

    # 03-package builds the verified dist/ without pushing.
    calls = execute('ci-container-build.sh', 'verify')
    builder = next(call for call in calls if call['tool'] == 'kaniko')
    assert '--no-push' in builder['args'] and '--digest-file' not in builder['args']
    assert builder['args'][builder['args'].index('--dockerfile')+1].endswith('/Dockerfile.runtime')
    assert builder['args'][builder['args'].index('--destination')+1] == 'registry.internal:5050/swirl/swirl-website/site:1.0.0'

    # 01-release pushes <version>, records it with the digest, tags it and prepares the next minor.
    calls = execute('ci-release.sh', 'publish')
    assert not (temporary / 'docker-config/config.json').exists()
    builder = next(call for call in calls if call['tool'] == 'kaniko')
    assert '--no-push' not in builder['args']
    assert builder['args'][builder['args'].index('--destination')+1] == 'registry.internal:5050/swirl/swirl-website/site:1.0.0'
    tip = git(remote, 'rev-parse', 'refs/heads/main')
    release = git(remote, 'rev-parse', 'v1.0.0^{commit}')
    assert git(remote, 'log', '-1', '--format=%s', release) == 'release: 1.0.0 [skip ci]'
    assert git(remote, 'log', '-1', '--format=%s', tip) == 'chore: prepare 1.1.0 [skip ci]'
    assert git(remote, 'rev-parse', tip + '^') == release and git(remote, 'rev-parse', release + '^') == revision
    assert 'Onboarding-Source: ' + revision in git(remote, 'show', '-s', '--format=%B', tip)
    released = yaml.safe_load(git(remote, 'show', release + ':infra/k8s/kustomization.yaml'))['images'][0]
    assert (released['name'], released['newTag'], released['digest']) == (image_name, '1.0.0', digest)
    assert git(remote, 'show', release + ':VERSION') == '1.0.0' and git(remote, 'show', tip + ':VERSION') == '1.1.0'
    assert '"version": "1.1.0"' in git(remote, 'show', tip + ':package.json')
    published = (workspace / 'release.env').read_text().splitlines()
    assert 'DEPLOY_REVISION=' + tip in published and 'IMAGE=' + image in published and 'RELEASE_TAG=v1.0.0' in published
    gitlab = next(call for call in calls if call['tool'] == 'curl')
    assert gitlab['args'][-1] == 'https://gitlab.example/api/v4/projects/42/releases'
    assert json.loads(gitlab['args'][gitlab['args'].index('--data')+1])['tag_name'] == 'v1.0.0'

    # 02-deploy starts from the pipeline's source checkout with the release artifact.
    git(workspace, 'checkout', '-q', '--detach', revision)
    calls = execute('ci-release.sh', 'deploy')
    assert next(call for call in calls if call['tool'] == 'kubectl')['args'] == ['apply', '-f', 'infra/argocd/application.yaml']
    assert any(call['tool'] == 'curl' and call['args'][-1].endswith('/healthz') for call in calls)

    # Retrying the released pipeline cannot publish again: main has moved.
    environment['APP_ONBOARDING'] = 'false'
    (workspace / 'release.env').unlink()
    calls = execute('ci-release.sh', 'publish', succeed=False)
    assert not calls
    assert git(remote, 'rev-parse', 'refs/heads/main') == tip
    assert not (workspace / 'release.env').exists()

    # A source push while the image is being built also stops the release.
    git(workspace, 'checkout', '-q', '-B', 'main', 'origin/main')
    environment['CI_COMMIT_SHA'] = git(workspace, 'rev-parse', 'HEAD')
    environment['APP_VERSION'] = '1.1.0'
    racing = temporary / 'racing-source'
    git(temporary, 'clone', '-q', '-b', 'main', str(remote), str(racing))
    git(racing, 'config', 'user.name', 'Delivery test')
    git(racing, 'config', 'user.email', 'test@example.invalid')
    environment['MOCK_ADVANCE_REPO'] = str(racing)
    calls = execute('ci-release.sh', 'publish', succeed=False)
    assert [call['tool'] for call in calls] == ['kaniko']
    assert git(remote, 'rev-parse', 'refs/heads/main') == git(racing, 'rev-parse', 'HEAD')
    assert 'v1.1.0' not in git(remote, 'tag').split()
    assert not (workspace / 'release.env').exists()
    environment.pop('MOCK_ADVANCE_REPO')

    # Each later first-parent commit adds one to the patch; set-major-version starts a new major.
    counter = temporary / 'version-check'
    git(temporary, 'clone', '-q', '-b', 'main', str(remote), str(counter))
    environment['CI_COMMIT_SHA'] = git(counter, 'rev-parse', 'HEAD')
    version = subprocess.check_output(['sh', 'infra/scripts/current-version.sh'], cwd=counter,
                                      env=environment, text=True).strip()
    assert version == '1.1.1', version
    environment['NEW_MAJOR_VERSION'] = '2'
    result = subprocess.run(['bash', 'infra/scripts/ci-set-major-version.sh'], cwd=counter,
                            env=environment, capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    assert git(remote, 'show', 'main:VERSION') == '2.0.0'
    assert git(remote, 'log', '-1', '--format=%s', 'main') == 'chore: set version 2.0.0 [skip ci]'

print('PASS: canonical www redirect, persistent single-writer deployment, private repository credentials, versioned immutable releases, and stale-pipeline guards')
PY
