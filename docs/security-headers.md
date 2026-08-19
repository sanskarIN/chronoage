# Deployment Security Headers

ChronoAge ships a restrictive Content Security Policy in `index.html` so the browser has a useful baseline even on a simple static host. Production hosting should additionally send security headers at the HTTP layer because several protections cannot be fully expressed through HTML metadata.

## Recommended production headers

A production host should send at least:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()
Cross-Origin-Opener-Policy: same-origin
```

When ChronoAge is served exclusively over HTTPS, also configure an appropriate `Strict-Transport-Security` policy at the host after confirming the domain/subdomain deployment model. Do not copy an HSTS `includeSubDomains` or preload directive onto a domain unless every affected subdomain is ready for HTTPS-only operation.

## Why `style-src` permits inline styles

The current duration visualization uses a React-generated inline `flex-grow` value to represent relative calendar components. Scripts remain restricted to same-origin resources; the inline allowance is limited to CSS. If the visualization is refactored to avoid dynamic style attributes, remove `'unsafe-inline'` from `style-src` and tighten both the HTML policy and deployment header together.

## Host configuration

The repository deliberately does not commit a provider-specific `_headers`, `vercel.json`, CDN rule, or reverse-proxy configuration because no single hosting provider is part of the project contract. When a production deployment target is chosen, add provider configuration and an automated header check for that target.

## Verification

For a release deployment:

1. Inspect the final document response in browser developer tools.
2. Confirm the HTTP CSP is at least as restrictive as the policy in `index.html`.
3. Confirm scripts, service worker, manifest, styles, and local assets still load without CSP violations.
4. Confirm external GitHub/Buy Me a Coffee links still navigate normally; they do not require `connect-src` permission.
5. Confirm the site cannot be embedded in another origin when `frame-ancestors 'none'` is present.
6. Confirm MIME sniffing is disabled.
7. Confirm denied Permissions Policy features are not unexpectedly enabled.
8. Re-run the PWA offline/install/update journeys after header changes.

Do not relax `script-src`, `object-src`, or `frame-ancestors` to work around unrelated deployment mistakes. Fix the deployment or explicitly document the required exception and its security impact.
