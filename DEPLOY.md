# Deploying Your Gateway (Railway or Render)

This fork ships with everything needed for a one-service PaaS deploy:

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build (bun → go → debian) + `entrypoint.sh` |
| `entrypoint.sh` | Runs `setup.sh` in background, then starts new-api |
| `setup.sh` | Auto-creates your admin account via `POST /api/setup` (idempotent) |
| `railway.toml` | Railway: pins builder + `/api/status` healthcheck |
| `render.yaml` | Render Blueprint: web service + 1 GB persistent disk |
| `.env.production.example` | Every env var, with safe defaults documented |

---

## What you need before starting

1. A GitHub account (the fork must live there — both platforms build from GitHub).
2. An AI provider API key or two (OpenAI / Anthropic / DeepSeek / Zhipu …) to add as channels **after** deploy.
3. ~10 minutes.

---

## Option A — Railway

1. **Push this repo to GitHub**
   ```bash
   cd new-api
   git remote set-url origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
   (Or fork on GitHub and add your changes as a branch.)

2. **Create the service**
   - Railway dashboard → **New Project** → **Deploy from GitHub repo** → pick your fork.
   - Railway reads `railway.toml` and builds the Dockerfile.

3. **Attach a volume (important — keeps your database across deploys)**
   - Service → **Volumes** → **New Volume** → mount at `/data`.

4. **Set environment variables** (Service → Variables). Minimum set:
   | Variable | Value |
   |---|---|
   | `SESSION_SECRET` | `openssl rand -hex 32` output (Railway can also generate) |
   | `ADMIN_USERNAME` | your chosen admin name (≤ 12 chars) |
   | `ADMIN_PASSWORD` | a strong password (8–128 chars) |
   | `SETUP_MODE` | `self` |

5. **Deploy** — Railway builds (5–10 min first time), then the container boots:
   `entrypoint.sh` → `setup.sh` creates your admin in the background → new-api starts serving.

6. **Open the app** — Service → Settings → Networking → **Generate Domain**.
   Log in at `https://<your-app>.up.railway.app/login` with the admin credentials you set.

7. **Add your first AI channel**
   Console → Channels → Add:
   - Type: your provider (OpenAI / Claude / DeepSeek / Zhipu / …)
   - Base URL + API key of that provider
   - Models: e.g. `gpt-5.6-sol`, `claude-opus-5`, `glm-5.3`, `deepseek-v4-flash`
   
   Then Console → Keys → create a gateway token. Point your tools at
   `https://<your-app>.up.railway.app` (add `/v1` for OpenAI-compatible clients).

---

## Option B — Render (has a free tier, but it sleeps)

1. **Push to GitHub** (same as above).

2. Render dashboard → **New** → **Blueprint** → select your fork.
   Render reads `render.yaml` and prompts for the `sync: false` vars:
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — your admin login.
   - `SESSION_SECRET` is auto-generated for you.

3. **Apply** — Render provisions:
   - Web service (Docker runtime, from this repo's Dockerfile)
   - 1 GB persistent disk mounted at `/data` (SQLite lives here)

4. Wait for the build (~10 min), then open the generated `onrender.com` URL.
   Log in at `/login` with your admin credentials — same as Railway from here on.

> Free-tier note: free web services spin down after 15 min of inactivity and
> cold-start in ~30–60 s. The disk and database persist regardless.

---

## Verifying the admin bootstrap worked

Check the service logs for these `setup.sh` lines:

```
[setup] Backend healthy
[setup] Posting /api/setup with username='admin', mode='self'
[setup] Bootstrap OK — admin 'admin' created
```

If instead you see `Already initialized — nothing to do`, that's also fine —
it means a previous boot created the admin. Forgot the password? Delete the
volume (destroys data!) or use the console user management.

Prefer the manual wizard? Set `SETUP_SKIP=1` and visit `/setup` yourself.

---

## Using your gateway from coding tools

Same pattern AgentRouter.org documents, but with **your** domain:

| Client config | Value |
|---|---|
| `ANTHROPIC_BASE_URL` (Claude Code) | `https://<your-domain>` — no `/v1` |
| OpenAI-compatible base URL | `https://<your-domain>/v1` |
| API key | a token created in Console → Keys |
| Model | whatever you configured on your channels |

---

## Post-deploy checklist

- [ ] Changed `ADMIN_PASSWORD` from the value you first typed in the dashboard
- [ ] `SESSION_SECRET` is set and stable (never regenerate on a live instance)
- [ ] Volume attached at `/data` (Railway) / disk provisioned (Render)
- [ ] Added at least one working channel + tested it in Console → Playground
- [ ] Optional: custom domain + `SESSION_COOKIE_SECURE=true` and
      `SESSION_COOKIE_TRUSTED_URL=https://your-domain`

## License obligations (AGPLv3 §7)

This fork keeps the required attribution: the landing-page footer and console
credit "Frontend design and development by New API contributors" with a link
to https://github.com/QuantumNous/new-api. Do not remove these if you redeploy
or further modify — see `LICENSE`, `NOTICE`, and `THIRD-PARTY-LICENSES.md`.
