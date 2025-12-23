This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

✨ **Modern Stack**
- Next.js 15.2 with App Router
- TypeScript for type safety
- Tailwind CSS 4 for styling
- Framer Motion for animations

🔐 **Authentication & Authorization**
- Better Auth integration
- Role-Based Access Control (RBAC)
- 3 User Roles: Admin, Penulis, User
- Zustand for state management

📊 **Database**
- Neon PostgreSQL
- Drizzle ORM
- Automated migrations

🎨 **UI Components**
- Radix UI primitives
- shadcn/ui components
- Responsive design

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Follow the instructions in [DATABASE_SETUP.md](DATABASE_SETUP.md) to configure your database.

**Quick setup:**
1. Create `.env.local` with your `DATABASE_URL`
2. Run `npm run db:push` to create tables

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- 📖 [Database Setup](DATABASE_SETUP.md) - Database configuration guide
- 🔒 [RBAC Guide](RBAC_GUIDE.md) - Role-Based Access Control documentation
- 🤝 [Contributing](CONTRIBUTING.md) - Development guide

## Role-Based Access Control

This project implements RBAC with three roles:

- **Admin** - Full system access
- **Penulis** (Writer) - Can create and edit content  
- **User** - Basic access

Quick example:

```tsx
import { AdminOnly, ContentCreatorOnly } from '@/components/auth/RoleGuard';

<AdminOnly>
  <button>Admin Only Button</button>
</AdminOnly>

<ContentCreatorOnly>
  <button>Create Content</button>
</ContentCreatorOnly>
```

See [RBAC_GUIDE.md](RBAC_GUIDE.md) for complete documentation.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
