# Local development and Docker preview

Read this before starting or replacing a preview. The laptop, sandbox and nested
container have different network namespaces: their `127.0.0.1` addresses are not
interchangeable. These instructions are for development HTTP, not production.
Keep production Nginx/Caddy, Cloudflare, DNS and Pages configuration unchanged.

## Inspect first

Inside the sandbox, from the intended release worktree:

```sh
pwd
git branch --show-current
git rev-parse HEAD
git worktree list
git status --short
docker ps -a --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
```

Inspect the specific existing preview before replacing it (substitute its name):

```sh
docker inspect <preview-name> --format 'image={{.Image}} ports={{json .HostConfig.PortBindings}} mounts={{json .Mounts}}'
docker port <preview-name>
```

Check listeners with `ss -ltnp` if installed. Minimal Linux sandboxes may lack it;
this standard-library fallback lists listening addresses and ports without relying
on Docker metadata alone:

```sh
python3 - <<'PY'
from pathlib import Path
for filename in ('/proc/net/tcp', '/proc/net/tcp6'):
    for line in Path(filename).read_text().splitlines()[1:]:
        fields = line.split()
        if fields[3] == '0A':
            address, port = fields[1].split(':')
            print(filename, address, int(port, 16))
PY
```

For `/proc/net/tcp`, `00000000` means all IPv4 interfaces; `0100007F` means
127.0.0.1. A stopped container may retain configured port bindings in inspect/ps
output; it does not own an active listener. Inspect running state and listeners.
Do not stop unrelated containers or choose a new port without tracing the current
route. Preserve unrelated work, private configuration and backups.

## Verified route and evidence

The working route inspected on 2026-10-17 is:

| Layer | Address / port | How established |
| --- | --- | --- |
| Nginx inside container | `0.0.0.0:8080` | Explicit development HTTP config, inspected and syntax-checked. |
| Nested Docker on sandbox | `0.0.0.0:8080` → container `8080` | Docker port inspection and sandbox listener/HTTP checks. |
| Laptop Sandbox router | `127.0.0.1:18080` → sandbox `8080` | Established forwarding from the prior working preview; laptop access and subsequent v0.6.2 manual review reported by the user. |
| User's browser | `http://127.0.0.1:18080/` | User-confirmed preview URL, not a request executed from inside the sandbox. |

At that inspection the supplying release worktree was on **`review/v0.6.2`**, based on
`9c6afe41e47563e1bd58d077d2eecfef67964484`, with release edits pending at the time
of inspection. Locate its
actual path with `git worktree list`; do not copy a path from another machine.
The then-inspected container was `stemtape-v062-preview`, image tag `stemtape:0.6.2`.
All 28 served `dist/` assets matched that worktree byte-for-byte. The current
read-only HTTP config mount is discoverable through `docker inspect` above.
The stopped former `stemtape-review-http` preview is retained; its settings used
the same sandbox/container 8080 mapping. Its exit reason is not established.

An initial v0.6.2 launch incorrectly published **sandbox loopback 18062**. That did
not feed the established laptop 18080 → sandbox 8080 route. It was replaced with
the mapping above. Do not publish the laptop's 18080 in nested Docker, and do not
propose another laptop mapping simply because the sandbox's loopback works.
Internal HTTP/Chromium success proves neither router state nor laptop reachability.
The user subsequently reported a passing final preview check on 2026-10-18,
including the right-aligned Help button. This is user-reported laptop testing,
not independently observed laptop access or physical printing.

## Current v0.7.0 candidate preview (2026-10-18)

The supplying branch is now **`review/v0.7.0`**, based on verified public main
`bf6fb4736745f0306ead5dac64744d07fb9dcb43`. Locate the worktree with
`git worktree list`; no machine-specific absolute path is a shared default.
Image **`stemtape:0.7.0`** was built from that worktree using the pinned Nginx base
below. Only the inspected v0.6.2 preview was stopped/replaced, by
**`stemtape-v070-preview`**, reusing the existing read-only development HTTP config
mount and **`-p 0.0.0.0:8080:8080`**. All **29** served assets matched the candidate
worktree byte-for-byte; Nginx syntax and Docker/browser checks passed inside the
sandbox. The v0.6.2 image and unrelated stopped previews were retained.

The established laptop route remains **127.0.0.1:18080 → sandbox 8080 → container
8080**, and the URL remains **http://127.0.0.1:18080/**. No host-side forwarding was
changed. The user reports passing manual testing of the v0.7.0 preview on
2026-10-18, confirming laptop access for that review. The subsequent Undo/Redo
placement adjustment and complete v0.7.0 work were finally accepted by the user
on 2026-10-18. Physical printing,
screen-reader and exhaustive device coverage are not inferred. Internal HTTP
and Chromium results remain separate evidence.

## Current v0.8.0 candidate preview (2026-10-18)

The supplying branch is **`review/v0.8.0`**, based on verified public main
`9203a0872465aafb3dd963ae310eddfea0111063` (merged/tagged v0.7.0). Find the actual
worktree using `git worktree list`. Image **`stemtape:0.8.0`** was built there using
this document's pinned Nginx base, then only the inspected v0.7.0 preview was
replaced by **`stemtape-v080-preview`**. Existing images, unrelated containers,
worktrees, README edits and backups were preserved.

The existing read-only development HTTP configuration and **0.0.0.0:8080 →
container 8080** publication were reused. All **30** served assets match the
candidate worktree; Nginx syntax, native Chromium and container checks pass
inside the sandbox. The established laptop route remains **127.0.0.1:18080 →
sandbox 8080 → container 8080** and the URL **http://127.0.0.1:18080/**. No host-side
command or forwarding change was made. New laptop access and v0.8.0 manual
acceptance are not independently established; prior user-confirmed access is
recorded separately above. See [candidate validation](VALIDATION.md).

The v0.8.0 preview was refreshed again for the user-found preset-name collision
fix on 2026-10-18 using the same container name, HTTP mount and sandbox 8080
publication. All 30 asset bytes, container smoke and native Chromium checks pass
inside the sandbox. The user reported an issue during manual testing; this is
not final acceptance or a new laptop reachability claim. Forwarding is unchanged.

The Event name / Preset name follow-up refreshed that same preview again on
2026-10-18. All **31** served assets (including the new local naming module) match
`review/v0.8.0`; Nginx syntax, container smoke and focused native browser checks
pass inside the sandbox. The read-only HTTP mount, sandbox/container 8080 mapping
and laptop **http://127.0.0.1:18080/** forwarding are unchanged. No new laptop
reachability or user manual acceptance is claimed.

The final button-layout follow-up on 2026-10-18 rebuilt and refreshed only
`stemtape-v080-preview` from `review/v0.8.0`. The same HTTP mount and sandbox
8080/container 8080 mapping remain; all 31 assets match the worktree and smoke/
Chromium checks pass internally. Laptop URL/forwarding is unchanged and final
manual acceptance was pending at that stage.

The user subsequently reported final manual preview acceptance on **2026-10-18**,
including the final button layout and Tour of Flanders preset. This confirms
user-reported laptop access for that review; it does not establish physical
printing or exhaustive device/accessibility coverage. The existing preview and
forwarding are retained for the final branch/bundle handoff.

## Current v0.9.0 candidate preview (2026-10-18)

The supplying branch is **`review/v0.9.0`**, based on verified public main
`76ccab4be602743c492c92330fac9151da1ee2ca` (merged/tagged v0.8.0). Find its actual
path using `git worktree list`. Build/start/update commands below apply; the
current image is **`stemtape:0.9.0`**, container **`stemtape-v090-preview`**.
Only the inspected v0.8.0 preview was replaced, after building this worktree
using the pinned Nginx base below. Prior images, worktrees and backups remain.

The existing read-only development HTTP config mount was reused, with container
**0.0.0.0:8080**, nested Docker **0.0.0.0:8080 → container 8080**, and established
laptop forwarding **127.0.0.1:18080 → sandbox 8080** unchanged. The user opens
**http://127.0.0.1:18080/**. No host-side command was needed or executed.
All **34** served assets match the v0.9.0 worktree; Nginx syntax, container smoke,
complete native Chromium and actual 200% zoom checks pass inside the sandbox.
These do not prove new laptop access or user manual acceptance for v0.9.0.
The earlier user-reported v0.8.0 acceptance remains a separate historical record.

The fill/Banana/cell-padding follow-up rebuilds the same image and replaces only
this preview, using the same read-only HTTP mount and port mapping. User feedback
on the earlier preview was positive overall; final acceptance remains pending.

The 2026-10-19 final orientation follow-up rebuilds/replaces only that same
v0.9.0 preview, with the same HTTP mount and forwarding. All 34 assets match;
focused native icon checks and container smoke pass internally. The user reports
acceptance of the preceding preview apart from this final orientation change,
which still awaits visual acceptance. Physical printing is unverified and is
non-blocking for this candidate at the user's request.

Final user-reported manual acceptance dated **2026-10-19** includes the corrected
upright Bar/Gel/Bottle orientations. This supersedes the pending visual-check
notes above. The working preview and established forwarding remain available;
physical printing remains unverified and non-blocking at the user's request.

## Current v0.10.0 candidate preview (2026-10-19)

The supplying branch is **`review/v0.10.0`**, based on public main/tag v0.9.0
`0a0dc8c73cf74a270610f3c7644413f6c998d5f2`. Find its actual worktree using
`git worktree list`. Image **`stemtape:0.10.0`**, container
**`stemtape-v0100-preview`**, uses the build/start procedure below. Only the
inspected v0.9.0 preview is replaced; previous images and unrelated work remain.
The read-only development HTTP configuration is reused without production edits.

Mapping remains container **0.0.0.0:8080**, nested Docker **0.0.0.0:8080 →
container 8080**, established laptop **127.0.0.1:18080 → sandbox 8080**. Open
**http://127.0.0.1:18080/**. No host-side forwarding command or change is needed.
All **36** served assets match this worktree byte-for-byte after replacement. Native
Chromium/Firefox and Docker HTTP checks are sandbox evidence; new laptop access
and v0.10.0 manual acceptance remain for the user to confirm. The user separately
confirms deployed v0.9.0 works and uses Firefox for manual testing.

The icon-only follow-up reuses this same image/container, HTTP mount and port
mapping. The refreshed worktree now supplies **37** matching assets. The user
reports positive manual feedback on alignment/duplicate row, while final
acceptance remains pending this addition. New sandbox Chromium/Docker evidence is
recorded in [validation](VALIDATION.md); it does not establish fresh laptop access
or physical printing. Forwarding remains unchanged.

### Plan-wide fit follow-up (2026-10-22)

The user accepted the preceding implementation and reports a measured physical
print on 2026-10-22; that does not validate the new content-fit behaviour. Only
`stemtape-v0100-preview` was replaced after building from `review/v0.10.0`, using
the same pinned base, read-only HTTP config and sandbox 8080/container 8080 mapping.
All 37 assets match; Nginx syntax, healthy container, smoke and focused Chromium
checks pass internally. Established laptop **http://127.0.0.1:18080/** forwarding
is unchanged. No new laptop access or final acceptance of fitting is claimed.
See the dated [validation record](VALIDATION.md).

### Final v0.10.0 user acceptance (2026-10-22)

Separately from the earlier measured print, the user reports passing final manual
review and physical print testing, accepting the final implementation including
content fitting. No new measurements or exhaustive device/browser coverage are
inferred. Finalization changes documentation only; the existing healthy preview,
37 matching assets and forwarding remain unchanged. No rebuild/restart is required.

## Build and start inside the sandbox

All commands in this section run **inside the sandbox**. First inspect the current
setup as above. Reuse its sandbox port, container name and forwarding. The
placeholders below are values you must inspect or choose deliberately, not commands
to paste literally. Trusted local shell assignments can be kept in ignored
`.env.preview`; never store credentials there or commit machine-specific paths.
The existing `.gitignore` excludes `.env.preview` and `artifacts/`.

```sh
PREVIEW_WORKTREE='<absolute path to intended worktree>'
PREVIEW_NAME='<inspected preview container name>'
PREVIEW_IMAGE='stemtape:0.10.0'
SANDBOX_PORT=8080
NGINX_IMAGE='nginx@sha256:<verified Alpine image digest>'
cd "$PREVIEW_WORKTREE"
```

Recheck `pwd`, branch/status and Docker ports after loading local assignments.
The base digest used successfully for this preview was
`nginx@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5`.
This is reproducibility evidence, not a claim that the image was fully scanned or
will remain current. `sh scripts/resolve-images.sh` pulls and prints current
Nginx/Caddy digests; review a new digest before adopting it. Never silently upgrade
or retag an image used by another preview.

The existing Dockerfile copies checked-in `dist/`; there is no application build
step. Build from this worktree, not a stale checkout or a different branch:

```sh
docker build --build-arg NGINX_IMAGE="$NGINX_IMAGE" -t "$PREVIEW_IMAGE" .
```

For an update, **reuse the inspected development HTTP config mount**. If starting
a fresh setup without one, create a development-only copy in ignored artifacts:

```sh
mkdir -p artifacts
python3 - <<'PY'
from pathlib import Path
source = Path('deploy/nginx.conf').read_text()
assert source.count('listen 8080;') == 1
source = source.replace('listen 8080;',
                        'listen 0.0.0.0:8080;\n        server_name localhost 127.0.0.1;')
path = Path('artifacts/preview-http.conf')
if path.exists():
    raise SystemExit('Config exists: inspect and reuse it instead of overwriting')
path.write_text('# Local development HTTP only; laptop forwarding is separate.\n' + source)
PY
```

Set `PREVIEW_HTTP_CONFIG` to the absolute path of that new file, or the existing
verified mount. The copy preserves CSP and security headers, static-path checks,
no-cache and disabled access logs. There is no HTTPS redirect/HSTS added for local
HTTP. Binding all interfaces is inside the isolated sandbox; laptop publication
must remain loopback-only. Do not use this recipe to expose a production app port.

```sh
PREVIEW_HTTP_CONFIG='<absolute path of inspected development HTTP config>'
docker run --rm --init -d --name "$PREVIEW_NAME" \
  --user 10001:10001 --read-only --cap-drop ALL \
  --security-opt no-new-privileges \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777 \
  --pids-limit 100 --memory 128m --cpus .5 \
  -p "0.0.0.0:$SANDBOX_PORT:8080" \
  --mount "type=bind,src=$PREVIEW_HTTP_CONFIG,dst=/etc/nginx/nginx.conf,readonly" \
  "$PREVIEW_IMAGE"
```

This is the verified start command with machine-specific paths replaced by
variables. It does not configure the laptop router. Container metadata may also
show `80/tcp` inherited from the base image; only `docker port`/PortBindings identify
published ports. Nginx listens on 8080, not that inherited metadata port.

## Replace only the preview after edits

1. Inspect the intended worktree, current preview and listeners again. Confirm its
   image, HTTP mount, sandbox port and name. Do not replace a container merely
   because it occupies your preferred port.
2. Build the updated image **before** stopping the current preview. Record the old
   image ID with `docker inspect`; image tags alone can move. Keep existing backups.
3. Stop only the inspected preview with `docker stop "$PREVIEW_NAME"`. A container
   started with `--rm` removes itself on stop. If a stopped container still owns
   that name, retain/rename it or remove only that reviewed disposable preview;
   do not prune containers/images/volumes globally.
4. Run the start command above with the same sandbox publish and config mount.
   Do not restart the sandbox or change laptop forwarding for a normal app update.
5. Check health, served version, all assets and relevant browser regressions.
   Ask for a laptop retry at the established URL without claiming it is verified
   by a sandbox request.

There is no new preview launcher: the existing image resolver and smoke scripts
remain the checks, and the explicit Docker commands above are the persistent
preview procedure. The smoke script starts and removes its own temporary test
container; it must not be used as the persistent browser preview.

## Verify inside the sandbox

```sh
docker exec "$PREVIEW_NAME" nginx -t
docker port "$PREVIEW_NAME"
curl --fail --silent --show-error "http://127.0.0.1:$SANDBOX_PORT/healthz"
curl --fail --silent --show-error "http://127.0.0.1:$SANDBOX_PORT/" | rg 'class="version"'
```

Check every asset, not just the version label (which can also appear in a stale
build). From the supplying worktree, set the inspected sandbox port explicitly:

```sh
PREVIEW_BASE_URL="http://127.0.0.1:$SANDBOX_PORT/" python3 - <<'PY'
import os
from pathlib import Path
from urllib.parse import quote
from urllib.request import ProxyHandler, build_opener
base = os.environ['PREVIEW_BASE_URL'].rstrip('/') + '/'
opener = build_opener(ProxyHandler({}))  # direct local HTTP, no external proxy
count = 0
for path in sorted(Path('dist').rglob('*')):
    if path.is_file():
        with opener.open(base + quote(path.relative_to('dist').as_posix()), timeout=10) as response:
            assert response.status == 200
            assert response.read() == path.read_bytes(), f'Stale asset: {path}'
        count += 1
print(f'PASS: {count} served assets match this worktree')
PY
```

Run relevant tests using the existing README instructions. Against the running
Docker preview, use `BASE_URL="http://127.0.0.1:$SANDBOX_PORT/" npm run test:browser`.
Keep `/StemTape/` coverage via `scripts/browser-checks.sh` as well: it starts its
own server on 8080, so do not launch it over the active preview's port. Schedule
that full two-mount check separately or test the project-path server on a free
port. Do not stop unrelated listeners to run it.

For a disposable container smoke check, choose an unoccupied sandbox test port,
for example `STEMTAPE_TEST_PORT=18081 sh scripts/container-smoke.sh "$PREVIEW_IMAGE"`.
Avoid its default 18080 in this Sandbox setup: that is the laptop route's port,
not a reason to publish a second nested service there. Smoke success, PDFs,
screenshots and Chromium are separate from user review and physical printing.

## Laptop-side forwarding and troubleshooting

These commands, if needed, run **on the laptop**, not inside nested Docker.
Do not alter a working mapping. First use installed help for the installed CLI:

```sh
sbx --help
sbx ports --help
sbx ls
sbx ports <actual-sandbox-name>
```

The current official [local development guide](https://docs.docker.com/ai/sandboxes/workflows/development/)
and the environment's parent AGENTS instructions document `sbx ports NAME
--publish [[HOST_IP:]HOST_PORT:]SANDBOX_PORT[/PROTOCOL]`. For a genuinely missing
mapping, after checking the installed help, the equivalent loopback example is:

```sh
sbx ports <actual-sandbox-name> --publish 127.0.0.1:18080:8080
```

The syntax was checked against official documentation and parent instructions;
it was **not executed here**, because host-side `sbx` is not installed/accessible
inside this sandbox. Do not substitute the guest hostname for the sandbox name
without verifying it with host `sbx ls`. Do not assume an older `docker sandbox`
command exists or uses equivalent arguments. No host-side action is required
merely to replace the current working preview.

- **Port occupied:** inspect running containers and listeners. A Python test
  server can also own sandbox 8080. If it is unrelated, leave it alone and resolve
  ownership before any change. Retained stopped previews do not bind a socket.
- **Stale preview:** compare the serving image ID and all asset bytes with the
  intended worktree. Build again from the correct directory, then replace only
  that preview. Browser `no-cache` requires revalidation; it does not clear plans.
  Do not clear localStorage to troubleshoot a stale image.
- **Connection refused inside sandbox:** check container state, `docker logs
  <preview-name>`, `nginx -t`, read-only config mount and 8080 publication. Keep
  diagnostics free of secrets. A listener bound only to sandbox 127.0.0.1 cannot
  feed the established external Sandbox router.
- **Sandbox works, laptop fails:** verify the existing host route, exact sandbox
  name, local host port ownership and IPv4/IPv6 choice on the laptop. Use explicit
  `http://127.0.0.1:18080/`. Host router state and the user's browser are not
  inspectable from inside the sandbox; report that limit instead of inventing a
  new mapping or declaring laptop access successful.
- **Different laptop port:** trace a user-confirmed mapping, update ignored local
  assignments/notes and reuse it. Never mirror that laptop port into nested Docker
  automatically. A new port is a deliberate host-side choice, not a container fix.

## Scoped cleanup

Stop only the confirmed preview with `docker stop "$PREVIEW_NAME"`. For the
verified `--rm` setup this removes the container, not its image, worktree, local
config or backups. Remove a retained stopped preview or its exact image only
when separately intended and after checking other containers do not need it.
Leave prior-version backups and unrelated containers intact. Do not use global
Docker prune, Compose down on an unknown project, volume deletion, or wildcard
cleanup. Leave the laptop forwarding in place for the next preview update unless
the user explicitly requests removing it; verify host CLI help before any such
host-side change. Never delete plans/browser storage as preview cleanup.

## Documentation validation

On 2026-10-17, the documented shell/embedded-Python snippets passed syntax
checks and local documentation links passed existence checks. The running
preview container was left unchanged, its port mapping was inspected again,
and all 28 served assets matched the release worktree. Existing application/
Chromium evidence remains separate; no new laptop or physical-print pass is
claimed for this documentation-only change.
