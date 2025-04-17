# SF Projects Daily Report

Automatically generates and posts a daily report of active SF Hub projects and their designers to Slack.

## Features

- Fetches active projects from Airtable
- Identifies SF Hub designers
- Posts a formatted message to Slack with project names and designer mentions
- Runs automatically at 8am PST every weekday

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   AIRTABLE_PERSONAL_ACCESS_TOKEN=your_pat_token
   AIRTABLE_BASE_ID=your_base_id
   SLACK_BOT_TOKEN=your_bot_token
   SLACK_CHANNEL_ID=your_channel_id
   ```
4. Build the TypeScript code:
   ```bash
   npm run build
   ```

## GitHub Actions Setup

The script is configured to run automatically via GitHub Actions. To set this up:

1. Add the following secrets to your GitHub repository:
   - `AIRTABLE_PERSONAL_ACCESS_TOKEN`
   - `AIRTABLE_BASE_ID`
   - `SLACK_BOT_TOKEN`
   - `SLACK_CHANNEL_ID`

2. The workflow will run automatically at 8am PST every weekday.

## Manual Execution

You can also run the script manually:

```bash
npm run build && node dist/listSFProjects.js
```

## Development

The main script is in `src/listSFProjects.ts`. It:
1. Fetches projects and designers from Airtable
2. Filters for active projects with SF Hub designers
3. Looks up Slack user IDs for designers
4. Posts a formatted message to Slack 