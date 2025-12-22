# Contributing to SatuDev Landing Pages

## Project Structure

```
satudev-landing-pages/
├── app/                      # Next.js App Router pages
│   ├── api/auth/            # Better Auth API routes
│   ├── auth/                # Authentication pages (signin, register)
│   └── page.tsx             # Home page
├── components/
│   ├── animations/          # Animation components (FadeIn, ScrollReveal)
│   ├── layouts/             # Layout components
│   ├── organisms/           # Complex components (Header, Footer, Forms)
│   ├── providers/           # Context providers
│   ├── templates/           # Page templates
│   └── ui/                  # UI components (shadcn/ui)
├── data/                    # Static data (portfolio, services, translations)
├── lib/
│   ├── backend/             # Backend utilities (auth, db)
│   └── utils.ts             # Utility functions
├── schema/
│   └── auth-schema.ts       # Database schema (Drizzle ORM)
└── drizzle/                 # Database migrations

## Tech Stack

- **Framework:** Next.js 15.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Authentication:** Better Auth
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **UI Components:** Radix UI + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Email:** EmailJS

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd satudev-landing-pages
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

4. **Setup database**
   ```bash
   npm run db:push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Database Schema

The project uses Better Auth which requires three tables:

1. **users** - User accounts
2. **sessions** - Authentication sessions
3. **accounts** - OAuth provider accounts

Schema is defined in `schema/auth-schema.ts`.

## Making Changes

### Adding a New Component

1. Create component in appropriate folder:
   - `components/ui/` for basic UI elements
   - `components/organisms/` for complex components
   - `components/templates/` for page sections

2. Use TypeScript for type safety

3. Follow existing naming conventions

### Modifying Database Schema

1. Edit `schema/auth-schema.ts`
2. Generate migration: `npm run db:generate`
3. Push to database: `npm run db:push`

### Adding New Features

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Create a pull request

## Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting (if configured)
- Keep components small and focused
- Use meaningful variable and function names

## Authentication

The project uses Better Auth with email/password authentication:

- Auth configuration: `lib/backend/auth.ts`
- Auth routes: `app/api/auth/[...all]/route.ts`
- Client setup: `lib/auth-client.ts`

## Multilingual Support

The project supports multiple languages:

- Translations: `data/translations.ts`
- Language provider: `components/providers/LanguageProvider.tsx`

## Questions?

If you have questions about the codebase, feel free to:
- Open an issue
- Check existing documentation
- Review similar implementations in the codebase
