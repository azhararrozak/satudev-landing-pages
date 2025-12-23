# Database Setup Guide

## Prerequisites
- Neon PostgreSQL database
- Node.js installed

## Setup Steps

### 1. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
DATABASE_URL="your_neon_database_url_here"
```

Replace `your_neon_database_url_here` with your actual Neon PostgreSQL connection string.

### 2. Push Schema to Database

Run the following command to create all required tables:

```bash
npm run db:push
```

This will create three tables:
- `users` - User accounts
- `sessions` - User sessions
- `accounts` - Authentication provider accounts

### 3. Verify Setup

You can open Drizzle Studio to verify the tables were created:

```bash
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

## Database Schema

### Users Table
- `id` (text, primary key)
- `name` (text)
- `email` (text, unique)
- `email_verified` (boolean)
- `image` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Sessions Table
- `id` (text, primary key)
- `expires_at` (timestamp)
- `token` (text, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `ip_address` (text, nullable)
- `user_agent` (text, nullable)
- `user_id` (text, foreign key)

### Accounts Table
- `id` (text, primary key)
- `account_id` (text)
- `provider_id` (text)
- `user_id` (text, foreign key)
- `access_token` (text, nullable)
- `refresh_token` (text, nullable)
- `id_token` (text, nullable)
- `access_token_expires_at` (timestamp, nullable)
- `refresh_token_expires_at` (timestamp, nullable)
- `scope` (text, nullable)
- `password` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Available Database Commands

- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Troubleshooting

If you encounter any database errors:

1. Make sure your `DATABASE_URL` is correct in `.env.local`
2. Run `npm run db:push` to sync the schema
3. Restart your development server

## Notes

- This project uses Better Auth with Drizzle ORM
- Database provider: Neon PostgreSQL
- Schema is configured to use plural table names (`users`, `sessions`, `accounts`)
