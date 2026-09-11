# Repository onboarding

Run `./add-repos.sh` from the `bm-cluster` checkout on an operator host, enter this
GitHub repository, and select it for deployment. The installer offers the same
flow. Re-selecting an imported repository reconciles its configuration again.

The platform reads [`infra/onboarding.json`](../infra/onboarding.json) to configure registry/Vault credentials,
the repository credential and delivery observation permissions, public DNS,
and an automatic first pipeline. `verify`, `image-build` and `release` must
succeed, followed by the Website Deployment readiness check.

The public inputs are:

| Input | Default | Purpose |
|---|---|---|
| `APP_SUBDOMAIN` | `@` | Primary host; `@` means the platform's zone apex |
| `APP_ALIAS` | `www` | A distinct subdomain redirected to the primary host |
| `TRUSTED_PROXY_CIDRS` | Platform pod CIDR | Networks from which the runtime accepts ingress-validated client IPs |

The alias must be a subdomain, not `@`, and cannot equal the primary host.
Ingress, TLS hosts, runtime origin/alias, build-time canonical URLs, GitLab and
registry locations are updated together. Public settings and replacement
bindings are committed to `infra/onboarding-values.json`; repeat runs offer
those choices and update the same application. Resource names and Vault paths
remain Website's, so this contract supports one installation per cluster.

DNS uses proxied A records with direct ingress, or the published same-zone HA
Tunnel CNAME. The runtime redirects the chosen alias to the primary host while
preserving paths and queries. The default remains `swirlit.dev` with
`www.swirlit.dev` when using that platform zone.

The default deployment keeps one SQLite writer and its existing PVC. Onboarding
never selects PostgreSQL HA or imports old data. Those remain explicit steps in
the [HA guide](high-availability.md).

The platform initializes the optional `apps/website/contact` Vault contract
with an empty `RESEND_API_KEY` if missing, preserving any existing value. Contact
storage works without email. Configure sender, recipient and company contact details separately using the
[deployment guide](deployment.md#contact-email-credentials).

Onboarding pins the requested revision with `APP_ONBOARDING=true` and
`ONBOARDING_EXPECTED_SHA`. An outdated revision fails rather than replacing newer
source. The GitOps commit records `Onboarding-Pipeline` and `Onboarding-Source`
trailers. If rollout fails after publication, retry the release job while that
commit is still the default-branch tip; it resumes the existing publication.

Validate locally with:

```sh
python3 infra/scripts/test-onboarding.py
bash infra/scripts/test-delivery.sh
npm test
```

The onboarding and delivery tests use temporary repositories and mock tools,
without changing DNS, Vault, GitLab or a cluster.
