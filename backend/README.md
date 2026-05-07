# Njangi Sure - Backend

This is the backend for Njangi Sure, built with **Supabase Edge Functions** (Deno runtime).

## Prerequisites

- [Supabase CLI](https://github.com/supabase/cli) (v1.165.0+)
- [Deno](https://deno.land/) (optional, included with Supabase CLI)
- Node.js 18+ (for Supabase CLI)

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your actual Supabase and Fapshi credentials.

3. **Link to your Supabase project:**

```bash
npx supabase link --project-ref your-project-ref
```

## Development

### Start local Supabase instance:

```bash
npm run supabase:start
```

### Serve Edge Functions locally:

```bash
npm run dev
```

This runs all functions at `http://localhost:54321/functions/v1/`

## Deployment

### Deploy all functions:

```bash
npm run supabase:functions:deploy:all
```

### Deploy a specific function:

```bash
npx supabase functions deploy function-name
```

## Database

### Push schema changes:

```bash
npm run db:push
```

### Reset database:

```bash
npm run db:reset
```

### Create new migration:

```bash
npm run migration:new migration-name
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key |
| `FAPSHI_API_KEY` | Fapshi payment API key |
| `FAPSHI_BASE_URL` | Fapshi API endpoint |
| `FAPSHI_WEBHOOK_SECRET` | Webhook verification secret |
| `FAPSHI_WEBHOOK_URL` | Your webhook URL |

## Available Functions

| Function | Description |
|----------|-------------|
| `apply-commission` | Apply commission to transactions |
| `create-payment` | Create Fapshi payment |
| `fapshi-webhook` | Handle Fapshi payment webhooks |
| `get-contributions` | Get group contributions |
| `get-group-details` | Get group information |
| `get-messages` | Get chat messages |
| `get-next-beneficiary` | Get next beneficiary |
| `get-notifications` | Get user notifications |
| `get-transactions` | Get transaction history |
| `get-user-profile` | Get user profile |
| `join-group` | Join a group |
| `list-groups` | List available groups |
| `mark-notification-read` | Mark notification as read |
| `send-message` | Send chat message |
| `send-reminders` | Send contribution reminders |
| `update-user-profile` | Update user profile |

## Tech Stack

- **Runtime:** Deno
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Payments:** Fapshi API
- **Functions:** Supabase Edge Functions