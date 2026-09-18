# Hidayatul Islam College Webapp — Agent Instructions

## Project Overview

**Hidayatul Islam College Web Application** is a Next.js 14 school portal replacing a legacy Wix site. It provides role-based dashboards for parents and staff, with features including:

- **Authentication**: Firebase (email/password + Google OAuth)
- **Booking System**: Online appointment/resource bookings (Microsoft Graph calendar integration)
- **Announcements**: Staff posting, parent viewing
- **Parent Dashboard**: Bookings, notices, calendar, learning resources
- **Staff Dashboard**: Booking management, content creation, reports
- **Database**: MS SQL Server for user roles and persistent data

See [README.md](README.md) for full tech stack and team details.

---

## Architecture & Routing

### Route Groups & Layouts

The app uses **Next.js 14 App Router with route groups** for role-based UX separation:

| Route Group | Access | Layout | Key Pages |
|---|---|---|---|
| `(auth)` | Public | Minimal (no navbar/sidebar) | `/login` |
| `(public)` | Public | Navbar + Footer | Home, About, Academics, Gallery, News, Resources |
| `(parent)` | Parent role | **ParentSidebar** (left nav) | Dashboard, My Bookings, Calendar, Notices, Learning Resources |
| `staff/` | Staff role | **StaffSidebar** (left nav) | Dashboard, Create Bookings, Notices, Content, Reports, Settings, Users |

**Key pattern**: Each route group has its own `layout.js` that wraps children. Sidebars are fixed 240px left panels with role-specific navigation using Lucide React icons.

### API Routes

Located in `src/app/api/`:
- `bookings/` — GET/POST bookings, DELETE/PUT by ID
- `notices/` — GET/POST notices, DELETE/PUT by ID
- `staff/dashboard/` — GET staff dashboard stats
- `user-role/` — GET current user's role
- `test-db/`, `test-dashboard-db/` — Database connectivity tests

**Auth requirement**: Every API route must call `verifyUser(req)` to validate Firebase JWT and fetch user role from DB.

---

## Authentication Flow

### Server-Side Verification

Every API route follows this pattern:

```javascript
import { verifyUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const user = await verifyUser(req);  // Throws if invalid
    // user object: { uid, role, is_admin }
    
    // Your logic here
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === 'USER_NOT_FOUND' ? 403 : 401 }
    );
  }
}
```

### JWT Verification Steps

1. Extract `Authorization: Bearer <token>` from request headers
2. Verify JWT signature using Firebase public keys (JWKS)
3. Extract Firebase UID from token payload
4. Query MS SQL `Users` table: `SELECT role, is_admin FROM Users WHERE firebase_uid = @uid`
5. Return user object or throw error with specific status code

**Key files**:
- [src/lib/auth.js](src/lib/auth.js) — `verifyUser()` function
- [src/lib/verifyToken.js](src/lib/verifyToken.js) — JWT verification with JWKS caching

### Client-Side Auth

- Firebase SDK initialized in [src/lib/firebase.js](src/lib/firebase.js) (hardcoded config)
- Sidebars use Firebase auth listeners to detect login/logout in real-time
- See [src/components/parent/ParentSidebar.js](src/components/parent/ParentSidebar.js) for pattern

---

## Database Patterns

### Connection

**File**: [src/lib/db.js](src/lib/db.js)

MS SQL Server (local, port 62729) with singleton connection pool:

```javascript
const pool = await getConnection();
```

**Env vars required**: `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Query Pattern — Parameterized Queries

Always use `.input()` to prevent SQL injection:

```javascript
const result = await pool.request()
  .input('uid', sql.NVarChar, uid)
  .input('limit', sql.Int, 10)
  .query('SELECT * FROM Notices WHERE posted_by = @uid LIMIT @limit');

// Access results
const notices = result.recordset;
```

### Tables

- **Users**: `firebase_uid` (PK), `role`, `is_admin`, email, name, etc.
- **Notices**: `id`, `title`, `content`, `posted_by`, `created_at`, `audience` (parent/staff/all)
- **Bookings**: `id`, `resource_id`, `user_id`, `start_time`, `end_time`, `status`
- **Resources**: `id`, `name`, `description`, `availability`

### ⚠️ Known Issues

1. **Connection pool never closed** → Potential memory leak. Add `pool.close()` on app shutdown.
2. **Booking API incomplete** → `/api/bookings/[id]` marked "TODO: connectBookingTable"
3. **No migrations** → Database schema is manual (not version-controlled)

---

## Component Patterns

### Reusable Components

Located in [src/components/](src/components/):

- **`components.js`** — Exports: Button, Card, HeroBanner, Input, Select, TextArea
- **`navbar.js`** — Top navigation (public pages)
- **`footer.js`** — Footer (public pages)
- **`GradeExplorer.jsx`** — Parent-specific: Browse child's grades
- **`parent/ParentSidebar.js`** — Left nav for parents (client component, auth listener)
- **`staff/StaffSidebar.js`** — Left nav for staff (client component, auth listener)

### Client vs. Server Components

- Use `"use client"` for:
  - Components with hooks (`useState`, `useEffect`, `useCallback`)
  - Components with form interactivity
  - Sidebars with auth listeners
- Server components (default) for:
  - Static layouts
  - Data fetching (via API routes, not direct DB)
  - Page wrappers

### Form Validation

Use **React Hook Form + Zod**:

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

### Notifications

Use **React Hot Toast**:

```javascript
import toast from 'react-hot-toast';

toast.success('Booking created!');
toast.error('Failed to create booking');
```

---

## Styling & Tailwind

### Custom Tailwind Config

[tailwind.config.js](tailwind.config.js) defines custom color tokens. When writing CSS, use semantic names like:

- `navy`, `gold`, `off-white` (brand colors)
- `text-muted`, `bg-light` (utility palette)

### Responsive Design

Mobile-first approach. Always start with mobile styles, then add `md:`, `lg:` breakpoints:

```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## Development Conventions

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | `PascalCase.js` or `camelCase.js` | `ParentSidebar.js`, `navbar.js` |
| Utility functions | `camelCase` | `verifyUser()`, `getConnection()` |
| Database columns | `snake_case` | `firebase_uid`, `is_admin`, `created_at` |
| URL paths | `kebab-case` | `/my-bookings`, `/learning-resources` |
| CSS classes | Tailwind conventions | `flex items-center justify-between` |

### Console Logging

Use emoji prefixes for quick scanning in logs:

- ✅ Success
- ❌ Error
- 🔑 Auth/Keys
- 🔍 Query/Lookup
- 📋 List/Data
- ⚠️ Warning

Example:
```javascript
console.log('✅ User authenticated:', uid);
console.error('❌ Database connection failed:', error);
console.log('🔍 Looking up user with UID:', uid);
```

### Error Handling

Include specific error codes for API routes:

```javascript
const error = new Error('User not found in database');
error.code = 'USER_NOT_FOUND';
throw error;
```

Then catch and return appropriate HTTP status:

```javascript
} catch (error) {
  const status = error.code === 'USER_NOT_FOUND' ? 403 : 401;
  return NextResponse.json({ error: error.message }, { status });
}
```

---

## Build & Run Commands

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint check
```

**Development workflow**:
1. Start dev server: `npm run dev`
2. Edit files in `src/`
3. Hot reload applies automatically
4. Check console for errors (emoji prefixes)

---

## Environment Variables

Required for deployment (see `.env.local`):

```
# MS SQL Server
DB_USER=
DB_PASSWORD=
DB_NAME=

# Microsoft Graph (Bookings integration)
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=

# Firebase (hardcoded in lib/firebase.js; update there if needed)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# ...
```

---

## Key Files for Pattern Reference

| File | Purpose | Example Pattern |
|---|---|---|
| [src/lib/auth.js](src/lib/auth.js) | Server-side JWT verification & role lookup | How to verify Bearer tokens and fetch user role |
| [src/lib/verifyToken.js](src/lib/verifyToken.js) | Firebase JWKS verification | How to validate Firebase JWT signatures |
| [src/lib/db.js](src/lib/db.js) | MS SQL connection pool | Singleton connection pattern |
| [src/lib/graph/graphHelper.js](src/lib/graph/graphHelper.js) | Microsoft Graph API calls | How to integrate Outlook calendar |
| [src/app/api/notices/route.js](src/app/api/notices/route.js) | Exemplary API route | Auth check → Query → Filter by role → Return |
| [src/app/(parent)/layout.js](src/app/(parent)/layout.js) | Parent role layout wrapper | How route groups organize layouts |
| [src/components/parent/ParentSidebar.js](src/components/parent/ParentSidebar.js) | Client component with auth listener | Firebase auth state management pattern |

---

## ⚠️ Known Issues & Incomplete Features

**Track these when making changes**:

1. **Booking API incomplete**  
   `/api/bookings/[id]` route marked "TODO: connectBookingTable" — SQL integration not done

2. **Staff Bookings UI shell**  
   `/staff/bookings` page exists but shows "Coming soon" — needs backend integration

3. **Admin routes referenced but not implemented**  
   Code references `/admin/*` paths that don't exist yet

4. **Auth temporarily disabled on some pages**  
   Some page routes have auth checks commented out (search for "TODO" or "FIXME")

5. **Connection pool memory leak**  
   Pool in [src/lib/db.js](src/lib/db.js) never explicitly closed — add graceful shutdown

6. **No graceful login fallback**  
   If user's Firebase UID isn't in DB, request fails with 403 (no sign-up flow yet)

---

## Common Tasks

### Add a New API Route

1. Create file: `src/app/api/myfeature/route.js`
2. Import and call `verifyUser(req)` at start
3. Fetch data using parameterized queries
4. Return `NextResponse.json(data)`
5. Add error handling with specific error codes

See [src/app/api/notices/route.js](src/app/api/notices/route.js) as example.

### Add a New Page in Parent Dashboard

1. Create folder: `src/app/(parent)/my-page/`
2. Create file: `src/app/(parent)/my-page/page.js`
3. Import navbar components and use ParentSidebar in layout
4. Use client-side fetching with `useCallback` + `useEffect`
5. Add navigation link to [src/components/parent/ParentSidebar.js](src/components/parent/ParentSidebar.js)

### Validate Form Input

Use Zod schemas for validation:

```javascript
const bookingSchema = z.object({
  resourceId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
});
```

### Send Email with Calendar Attachment

See [src/lib/graph/graphHelper.js](src/lib/graph/graphHelper.js) for Nodemailer + iCalendar pattern.

---

## Tips for Productivity

1. **Always use parameterized queries** to prevent SQL injection
2. **Check emoji prefixes in console** — they highlight important events and errors
3. **Test with `test-db` route** before deploying: `/api/test-db` and `/api/test-dashboard-db`
4. **Use React DevTools** to inspect client component state
5. **Check role filtering** — Most pages and API routes respect the `role` field from auth
6. **Reference existing patterns** — The codebase follows consistent conventions; reuse existing code snippets

---

## Next Steps & Improvements

Suggested future enhancements for AI agents working on this codebase:

- [ ] Add database migration system (e.g., Flyway, Knex)
- [ ] Fix connection pool cleanup (graceful shutdown)
- [ ] Complete booking API and staff booking UI
- [ ] Implement admin dashboard
- [ ] Add audit logging for sensitive operations
- [ ] Create E2E tests (Playwright/Cypress)

---

**Last updated**: 2026-08-27  
**Branch**: LogIn  
**Repository**: [tashmacmay/hidayatul-islam-college-webapp-2.0](https://github.com/tashmacmay/hidayatul-islam-college-webapp-2.0)
