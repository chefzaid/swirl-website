# Public DNS

This repository owns `swirlit.dev` and `www.swirlit.dev` by default, including DNS, Kubernetes Ingress routing
and application redirects. The platform supplies the shared zone, TLS,
ingress and optional HA Tunnel. [Repository onboarding](onboarding.md) asks the
platform to reconcile the primary host and redirect alias declared by this
application.
For a customized deployment, use the primary host, alias and zone saved by
onboarding instead of the default examples below.

## Direct ingress

In Cloudflare DNS, create or update a **proxied A** record for each hostname
above with the public ingress IPv4. Obtain the address from the platform operator
or the ingress Service:

```sh
kubectl get service ingress-nginx-controller -n infra \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## HA ingress

After the platform's HA activation succeeds, switch each owned hostname to a
**proxied CNAME** with target `<publishedTunnelID>.cfargotunnel.com`. Verify the
published checkpoint belongs to this zone before changing DNS:

```sh
kubectl get configmap bm-cluster-public-ingress -n infra -o json | \
  jq -er '.data | select(.mode == "tunnel" and .domain == "swirlit.dev" and
    .publishedTunnelID != null and .publishedTunnelID != "" and
    .publishedTunnelID == .tunnelID) | .publishedTunnelID + ".cfargotunnel.com"'
```

No output or a nonzero exit means the target is not ready. Do not infer readiness
from a prepared Tunnel ID or keep pointing at the original host after the direct
listener is retired. The platform's zone-wide Tunnel routes preserve the request
hostname; the application Ingress selects the backend.

Review conflicting A/AAAA/CNAME records before changing targets, preserving MX,
TXT and unrelated records. Cloudflare supports the apex CNAME through flattening;
see [Tunnel DNS routing](https://developers.cloudflare.com/tunnel/routing/).

Both names must reach the same application and have valid TLS certificates.
After a change, verify public access, health and the `www` redirect with paths
and queries. Complete the [HA acceptance checks](high-availability.md#verification)
when switching ingress modes.
