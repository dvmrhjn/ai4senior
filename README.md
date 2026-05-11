# AI4Seniors Wizard

Static chat UI (`index.html`) and a Pages Function at **`/api/chat`** (`functions/api/chat.js`) that proxies requests to Anthropic’s Messages API using the **`ANTHROPIC_API_KEY`** secret (never exposed to the browser).

## Deploy to Cloudflare Pages

### Option A — Git integration (recommended)

1. Push this repo to GitHub (or GitLab). This project’s source is at `https://github.com/dvmrhjn/ai4senior`.
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select the repo. Configure the build:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/` (root)
4. Under **Settings** → **Environment variables** → **Production** (and **Preview** if you use previews), add:
   - **Variable name:** `ANTHROPIC_API_KEY`  
   - **Value:** your Anthropic API key  
   - **Type:** *Secret* (encrypted)
5. Save and deploy. Production URL will look like `https://ai4seniors-wizard.pages.dev` (or your custom domain).

Functions in `functions/` are picked up automatically; no extra build step is required.

### Option B — Wrangler CLI (manual upload)

Requires [Node.js](https://nodejs.org/) (includes `npm`).

```bash
npm install
npx wrangler login
```

`wrangler login` opens a browser once to authorize this machine. Then:

```bash
npx wrangler pages deploy . --project-name=ai4seniors-wizard
```

Set the secret for production (and preview if needed):

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name=ai4seniors-wizard
```

Redeploy after changing secrets or static files by running `pages deploy` again (or push, if using Git).

To use a different Pages project name, change `--project-name` and update `wrangler.toml` `name` to match.

## Local preview

```bash
npm install
npx wrangler pages dev .
```

Create a `.dev.vars` file in the project root (do not commit it):

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| Chat always shows an error about **ANTHROPIC_API_KEY** | In Pages → your project → **Settings** → **Variables and Secrets**, confirm the secret name is exactly `ANTHROPIC_API_KEY` (same spelling as in `functions/api/chat.js`). Redeploy after adding or renaming. |
| **404** on `/api/chat` | Confirm `functions/api/chat.js` exists and the deployed branch includes the `functions/` folder. Root-only uploads without `functions/` will not serve the API. |
| **CORS** errors | The function allows `*` for this app’s same-origin use. If you call the API from another origin, extend `Access-Control-Allow-Headers` in `chat.js` as needed. |
| **Invalid model** or 400 from Anthropic | The UI uses `claude-sonnet-4-6` in `index.html`. If your account does not have access, change the `model` field in the `fetch` body to a model your key supports (see [Anthropic model docs](https://docs.anthropic.com/en/docs/about-claude/models)). |
| Broken logo | Add `AI4seniors_logo_1.png` next to `index.html`, or rely on the built-in title fallback when the image is missing. |

## Logs

- **Dashboard:** Workers & Pages → your project → **Deployments** → a deployment → **Functions** / **View logs**.
- **CLI:** `npx wrangler pages deployment tail --project-name=ai4seniors-wizard`

## Repo layout

- `index.html` — UI and client logic (`POST /api/chat` with JSON body for Anthropic Messages API).
- `functions/api/chat.js` — Worker: forwards JSON to `https://api.anthropic.com/v1/messages` with `env.ANTHROPIC_API_KEY`.
