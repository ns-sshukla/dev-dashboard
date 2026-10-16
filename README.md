# Developer Dashboard

A local React + Vite dashboard that shows your Jira tickets, GitHub PRs, Confluence pages, notes and on-call alerts in one place. API tokens stay server-side in the Vite dev proxy, so the browser never sees them.

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8)
- npm (bundled with Node)

## Install dependencies

This is a Node project, so there is no `requirements.txt`. [package.json](package.json) lists the dependencies and [package-lock.json](package-lock.json) pins their exact versions.

```bash
npm ci
```

## Configure

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` | Jira Cloud access |
| `CONFLUENCE_BASE_URL`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN` | Confluence Cloud access (usually the same as Jira) |
| `GITHUB_TOKEN` | GitHub personal access token |
| `VITE_JIRA_BASE_URL`, `VITE_CONFLUENCE_BASE_URL` | Base URLs for deep links |
| `VITE_GITHUB_USERNAME` | Your GitHub username |
| `VITE_GITHUB_ORG` | Optional: show only PRs from this org |
| `VITE_CONFLUENCE_ACCOUNT_ID` | Optional: your Atlassian account ID (see `<your-site>/rest/api/3/myself`) |
| `VITE_DISPLAY_NAME`, `VITE_DESIGNATION` | Optional: name and title in the welcome banner |
| `SLACK_BOT_TOKEN`, `VITE_SLACK_CHANNEL_ID` | Optional: on-call alerts from a Slack channel |
| `ANTHROPIC_API_KEY` | Optional: AI features on the On-Call page |

Restart the dev server after you change `.env`.

## Run

```bash
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # serve the production build
npm run lint      # run ESLint
```
