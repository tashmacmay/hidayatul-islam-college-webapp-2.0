# Executive Summary

This report describes the implementation found in the repository as inspected on 2026-10-27. It is an evidence-based handover document; it does not propose a replacement design.

The application is a Next.js 14 App Router application. Authentication is client-side Firebase Authentication (email/password and Google popup). The browser retains Firebase's current user/session state through the Firebase Auth SDK. Each protected API request carries a Firebase ID token in the HTTP Authorization header using the token scheme.

The server does not use a Next.js middleware file. Instead, API handlers call either:

- `verifyUser()` in `src/lib/auth.js`, which validates the Firebase JWT and then looks up `firebase_uid` in Azure SQL `Users`; or
- `requireAdmin()` in `src/lib/auth.js`, which additionally requires `role === 'staff'` and `is_admin === true`.

The principal authorization record is therefore `Users.role` plus `Users.is_admin`. No separate role, permission, claims, policy, stored procedure, view, migration, or SQL schema file was found. Firebase custom claims are not read by the application.

Important implementation facts:

1. Page protection is primarily client-side and inconsistent. There is no `middleware.js`/`middleware.ts`, and route groups/layouts do not enforce roles.
2. API protection is stronger but not uniform. Administrative content APIs use `requireAdmin`; staff APIs use `user.role`; public content APIs are unauthenticated.
3. `POST /api/users/link` intentionally authenticates only the Firebase token because the SQL row may not yet contain `firebase_uid`; it links an existing invitation by email.
4. `GET/PUT/DELETE /api/notices/[id]` call `verifyUser()` but do not perform an admin/staff check.
5. Firebase Admin SDK is initialized in `src/lib/firebase-admin.js`, but the only observed consumer is the unauthenticated diagnostic `GET /api/test-admin`.
6. There are no verified password-reset calls (`sendPasswordResetEmail`), session-cookie implementation, server actions, or Next.js middleware.

# Authentication Architecture

## Firebase configuration and initialization

The browser SDK is initialized once in [`src/lib/firebase.js`](./src/lib/firebase.js):

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "hidayatul-islam-college-webapp.firebaseapp.com",
  projectId: "hidayatul-islam-college-webapp",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

The configuration is hard-coded in the client module. The Firebase web API key is not treated as a server secret by Firebase, but it is still part of the deployed client bundle.

The Admin SDK is initialized in [`src/lib/firebase-admin.js`](./src/lib/firebase-admin.js) with an imported `src/serviceAccountKey.json`. That file is not present in the repository inventory, so the availability and deployment behavior of that import are **NOT VERIFIED IN CODE**. `authAdmin` is only observed in [`src/app/api/test-admin/route.js`](./src/app/api/test-admin/route.js).

## Login

The routed login page is [`src/app/(auth)/login/page.js`](./src/app/(auth)/login/page.js), component `LoginPage`.

### Email/password

`LoginPage.handleSubmit()`:

1. Prevents the form submission and sets local `loading`.
2. Calls `signInWithEmailAndPassword(auth, email.trim(), password)`.
3. Passes `userCredential.user` to `redirectBasedOnRole()`.
4. `redirectBasedOnRole()` calls `user.getIdToken()`.
5. It calls `GET /api/user-role` with the Firebase ID token as a bearer token.
6. It redirects:
   - `role === "parent"` to `/dashboard`;
   - `role === "staff"` and `is_admin` true to `/staff/notices`;
   - other staff to `/staff/dashboard`;
   - unknown/missing role causes an error and `signOut(auth)`.

Firebase errors handled by the page include `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`, `auth/invalid-email`, `auth/user-disabled`, and `auth/too-many-requests`.

The `rememberMe` state exists in the component, but no persistence selection or other use of it was verified.

### Google

`LoginPage.handleGoogleSignIn()` calls `signInWithPopup(auth, googleProvider)`, then follows the same SQL role-resolution path. Successful Google authentication alone does not grant application access; `/api/user-role` must resolve the Firebase UID to a SQL row.

## Registration/account activation

The routed activation page is [`src/app/(auth)/activate-account/page.js`](./src/app/(auth)/activate-account/page.js), component `ActivateAccountPage`.

There is also a second, apparently duplicate activation component in [`src/app/(auth)/login/activate-account.js`](./src/app/(auth)/login/activate-account.js). It is not a `page.js` route and therefore is not independently exposed by the App Router; its actual usage is **NOT VERIFIED IN CODE**.

The routed activation flow:

1. Validates password confirmation and a six-character minimum in the browser.
2. Calls `createUserWithEmailAndPassword(auth, email.trim(), password)`.
3. Obtains `firebaseUser.getIdToken()`.
4. Calls `POST /api/users/link` with the bearer token and no UID in the body.
5. The server verifies the token, takes `uid` from `decoded.sub`, takes email from `decoded.email`, finds an existing SQL invitation by email, and updates `Users.firebase_uid`.
6. The client calls `/api/user-role` and redirects using the SQL role.
7. Failure signs the Firebase user out.

The duplicate component differs: it tries `createUserWithEmailAndPassword`, and if the email already exists it signs in with `signInWithEmailAndPassword` before linking.

The activation endpoint contains a commented-out email verification check (`decoded.email_verified === true`); the check is not active.

## Password reset

No `sendPasswordResetEmail`, reset-token route, reset page, or reset API was found. Password-reset functionality is **NOT VERIFIED IN CODE**.

## Logout

`ParentSidebar` and `StaffSidebar` call `signOut(auth)` and then `router.push("/")`. The login and activation error paths also call `signOut(auth)` when Firebase succeeded but SQL role/link resolution failed.

Relevant components:

- [`src/components/parent/ParentSidebar.js`](./src/components/parent/ParentSidebar.js), `ParentSidebar.handleLogout`
- [`src/components/staff/StaffSidebar.js`](./src/components/staff/StaffSidebar.js), `StaffSidebar.handleLogout`
- [`src/app/(auth)/login/page.js`](./src/app/(auth)/login/page.js)
- [`src/app/(auth)/activate-account/page.js`](./src/app/(auth)/activate-account/page.js)

## Authentication state and session maintenance

There is no application session cookie or server session table. Firebase Auth maintains the browser-side current user. The application subscribes with `onAuthStateChanged` in:

- [`src/hooks/useAuth.js`](./src/hooks/useAuth.js), `useAuth()`;
- [`src/providers/RoleProvider.js`](./src/providers/RoleProvider.js), `RoleProvider`;
- `ParentSidebar`;
- `StaffSidebar`;
- several page components, including parent dashboard, staff dashboard, staff bookings, staff profile, and admin management pages.

`RoleProvider` calls `user.getIdToken()` and `GET /api/user-role`, then stores `role`, `isAdmin`, and `loading` in React context. It does not create a server session.

## Token generation and validation

Client code obtains a Firebase ID token with `FirebaseUser.getIdToken()`. Server validation is implemented in [`src/lib/verifyToken.js`](./src/lib/verifyToken.js), function `verifyFirebaseToken(token)`:

```js
await jwtVerify(token, JWKS, {
  issuer: `https://securetoken.google.com/${PROJECT_ID}`,
  audience: PROJECT_ID,
});
```

The JWKS is Firebase's Google secure-token JWKS URL. The project ID and expected issuer/audience are hard-coded. The decoded JWT payload is returned; the server does not read Firebase custom role/permission claims.

`verifyUser(req)` in [`src/lib/auth.js`](./src/lib/auth.js):

1. Reads `req.headers.get("authorization")`.
2. Requires the token scheme and a non-empty token.
3. Calls `verifyFirebaseToken`.
4. Uses `decoded.uid || decoded.sub`.
5. Queries:

```sql
SELECT id, role, is_admin
FROM Users
WHERE firebase_uid = @uid
```

6. Returns decoded claims plus `id`, `role`, and boolean `isAdmin`.

`verifyUser` errors include `MISSING_AUTH_HEADER`, `EMPTY_TOKEN`, `INVALID_TOKEN`, `NO_UID_IN_TOKEN`, `DB_LOOKUP_FAILED`, and `USER_NOT_FOUND`.

## Middleware

No `middleware.js` or `middleware.ts` exists. Authentication and authorization are implemented in client components and API route handlers. Page requests can therefore reach page components before client-side auth state is resolved; enforcement of protected data is expected to occur at API boundaries.

# Authorization Architecture

## Role model

The verified role model is a single `Users` table:

- `role`: application role string observed as `parent` or `staff`.
- `is_admin`: SQL bit used for administrative access.
- `firebase_uid`: link to the Firebase identity.

`requireAdmin(req)` calls `verifyUser(req)` and rejects unless both conditions hold:

```js
if (user.role !== 'staff' || !user.isAdmin) {
  const err = new Error('Admin access required');
  err.code = 'NOT_ADMIN';
  throw err;
}
```

No role table, user-role junction table, permission table, policy table, or claims-based authorization implementation was found. These are **NOT VERIFIED IN CODE**.

## Authorization decision points

| Decision | Source | Logic | Observed consumers |
|---|---|---|---|
| Authenticated application user | Firebase JWT + `Users.firebase_uid` | `verifyUser()` | Most protected APIs |
| Parent/staff redirect | `Users.role`, `Users.is_admin` via `/api/user-role` | Parent dashboard; admin/staff dashboard | Login and activation pages |
| Staff API | `Users.role` | `user.role === "staff"` | Staff dashboard, staff bookings, staff profile |
| Admin API | `Users.role`, `Users.is_admin` | `requireAdmin()` or equivalent `role === "staff" && isAdmin` | User/content management and reporting |
| Booking ownership | Firebase token email versus Graph appointment customer email | Exact normalized email equality | `DELETE /api/bookings/[id]` |
| Staff booking ownership | Graph staff lookup by authenticated email and appointment staff IDs | Membership check | `DELETE /api/staff/bookings/[id]` |

`GET /api/notices` authenticates with `verifyUser()` but the shown query filters publication status, grade, search, and status; it does not use `user.role` to apply a separate parent/staff permission rule. `PUT` and `DELETE` on `/api/notices/[id]` authenticate but do not call `requireAdmin()`; the caller's role is not used in those decisions.

## Redirect and UI authorization

`StaffSidebar` hides its Admin navigation section unless `RoleProvider.isAdmin` is true. This is a presentation control, not a server authorization boundary. Direct navigation to `/staff/admin/...` is not blocked by a Next.js middleware or route layout in the verified code. The API handlers are the effective authorization boundary for data mutations.

`ParentSidebar` and `StaffSidebar` listen to Firebase auth state and render shell state, but they do not call `/api/user-role` to deny or redirect a user based on role.

# Database Schema Summary

## Connection and access layer

[`src/lib/db.js`](./src/lib/db.js) creates a singleton `mssql.ConnectionPool` configured from `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_NAME`, with Azure SQL encryption enabled and `trustServerCertificate: false`. It uses bounded retries for transient connection failures and `getConnection()` is used by route handlers. The complete pool helper is the only shared SQL connection abstraction observed.

Queries use parameter binding for user-controlled values in the inspected code. Some constant reporting/content queries are direct SQL strings.

## Verified tables

| Table | Purpose | Key columns observed | Relationships/usage |
|---|---|---|---|
| `Users` | Application identity link, role, admin flag, profile, invitations | `id`, `firebase_uid`, `email`, `display_name`, `role`, `is_admin`, `profile_picture_url`, timestamps | Referenced by `verifyUser`, user management, profiles, dashboard counts; content tables join to `Users.id` |
| `dbo.Notices` / `Notices` | Notices and scheduled publication | `id`, `title`, `type`/`category`, `content`, `grade`, `status`, `scheduled_for`, `created_by_uid`, timestamps | Admin notices write; public/authenticated notices read |
| `dbo.bookings` | Synchronized Microsoft Bookings reporting data | `ms_booking_id`, `reference`, `start_at`, `end_at`, `appointment_type`, learner/customer/staff fields, `status`, sync timestamps | Reporting routes and `bookingsRepository`; Graph is the live booking source for portal bookings |
| `LearningResources` | Published learning content | `id`, title/caption/description, category, grade, resource/file URLs, `is_published`, `created_by`, timestamps | Public read; admin CRUD; `created_by` joins `Users.id` |
| `NewsAnnouncements` | Public news/articles | `id`, title, slug, category, content, publication/consent fields, `created_by`, timestamps | Public read; admin CRUD; creator relationship inferred by column but FK is not verified |
| `GalleryImages` | Public gallery images | `id`, image/title/caption/alt/category, consent/publication fields, `uploaded_by`, timestamps | Public read; admin CRUD; uploader relationship inferred by column but FK is not verified |
| `dbo.TermCalendars` | Term/grade calendar files | `id`, `term`, `grade`, file fields, timestamps | Parent read; admin CRUD |

Table names vary between `dbo.X` and `X` in queries. The physical schema, exact data types, indexes, constraints, foreign keys, views, and stored procedures are not included in the repository and are **NOT VERIFIED IN CODE**.

## Stored procedures, views, and foreign keys

No stored procedure execution, `EXEC`, view name, `CREATE VIEW`, migration, or DDL definition was found. Foreign-key relationships are **NOT VERIFIED IN CODE**. The joins from `LearningResources.created_by` and `GalleryImages.uploaded_by` to `Users.id` are application-level SQL joins, not proof of an FK.

# Route Inventory

There is no server-side route middleware. The following inventory reflects route files and observed component behavior.

## Page routes

| URL | Page/component | Auth | Role/UI control | API/data dependencies |
|---|---|---:|---|---|
| `/` | `(public)/page.js` | No | None | Public content as used by page |
| `/about` | `(public)/about/page.js` | No | None | None verified |
| `/academics` | `(public)/academics/page.js` | No | None | None verified |
| `/contact` | `(public)/contact/page.js` | No | None | None verified |
| `/gallery` | `(public)/gallery/page.js` | No | None | `/api/gallery` |
| `/news` | `(public)/news/page.js` | No | None | `/api/news` |
| `/news/[slug]` | `(public)/news/[slug]/page.js` | No | None | `/api/news/[slug]` |
| `/resources` | `(public)/resources/page.js` | No | None | `/api/resources` |
| `/login` | `(auth)/login/page.js` | No | Firebase login | Firebase; `/api/user-role` |
| `/activate-account` | `(auth)/activate-account/page.js` | No | Firebase activation | Firebase; `/api/users/link`; `/api/user-role` |
| `/dashboard` | `(parent)/dashboard/page.js` | Intended yes | Client auth listener; no route middleware | `/api/notices`, `/api/resources`, `/api/bookings` |
| `/my-bookings` | `(parent)/my-bookings/page.js` | Intended yes | `useAuth`; no server page guard | `/api/bookings`, `/api/bookings/[id]` |
| `/my-bookings/create` | `(parent)/my-bookings/create/page.js` | Intended yes | UI shell; exact auth guard **NOT VERIFIED IN CODE** | Booking/Graph dependencies **NOT VERIFIED IN CODE** |
| `/calendar` | `(parent)/calendar/page.js` | Intended yes | `CalendarView`; API verifies token | `/api/calendar` |
| `/notices` | `(parent)/notices/page.js` | Intended yes | `NoticesView`; client redirect on missing auth | `/api/notices` |
| `/learning-resources` | `(parent)/learning-resources/page.js` | Intended yes | `LearningResourcesView` | Resource API dependency |
| `/profile` | `(parent)/profile/page.js` | Intended yes | Page implementation **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/dashboard` | `staff/dashboard/page.js` | Intended yes | Client Firebase listener; comment says auth intentionally commented out | `/api/staff/dashboard` |
| `/staff/bookings` | `staff/bookings/page.js` | Intended staff | Client listener; API enforces staff | `/api/staff/bookings`, `/api/staff/bookings/[id]` |
| `/staff/profile` | `staff/profile/page.js` | Intended staff | Client listener; API enforces staff | `/api/staff/profile` |
| `/staff/notices` | `staff/notices/page.js` | Intended staff | Client token calls | `/api/notices`, `/api/notices/[id]` |
| `/staff/school-notices` | `staff/school-notices/page.js` | Intended staff | Exact page guard **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/calendar` | `staff/calendar/page.js` | Intended staff | Exact page guard **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/learning-resources` | `staff/learning-resources/page.js` | Intended staff | Exact page guard **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/users` | `staff/users/page.js` | Intended staff | Shell only; admin distinction **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/content` | `staff/content/page.js` | Intended staff | **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/reports` | `staff/reports/page.js` | Intended staff/admin | **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/settings` | `staff/settings/page.js` | Intended staff | **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |
| `/staff/admin/user-management` | `staff/admin/user-management/page.js` | Intended admin | Admin UI uses `/api/users`; direct page guard **NOT VERIFIED IN CODE** | `/api/users` |
| `/staff/admin/notice-management` | `staff/admin/notice-management/page.js` | Intended admin | Admin API enforcement | `/api/staff/admin/notices`, `/api/staff/admin/notices/[id]` |
| `/staff/admin/Learning-resources` | `staff/admin/Learning-resources/page.js` | Intended admin | Admin API enforcement | `/api/staff/admin/resources`, upload |
| `/staff/admin/media-management` | `staff/admin/media-management/page.js` | Intended admin | Admin API enforcement | Admin news/gallery/upload APIs |
| `/staff/admin/term-calendar-management` | `staff/admin/term-calendar-management/page.js` | Intended admin | Admin API enforcement | Admin calendar/upload APIs |
| `/staff/admin/school-bookings` | `staff/admin/school-bookings/page.js` | Intended admin | Admin API enforcement | `/api/admin/bookings`, reporting/sync APIs |
| `/staff/admin/school-bookings/create-booking` | `staff/admin/school-bookings/create-booking/page.js` | Intended admin | **NOT VERIFIED IN CODE** | **NOT VERIFIED IN CODE** |

The `(parent)` route group layout is [`src/app/(parent)/layout.js`](./src/app/(parent)/layout.js) and simply returns `children`; it is not an authorization boundary. No `src/app/staff/layout.js` was found.

## API route inventory

| Endpoint(s) | Methods | Auth/authorization | Database/external dependencies |
|---|---|---|---|
| `/api/user-role` | GET | `verifyUser` | `Users`; returns `role`, boolean `is_admin` |
| `/api/users/link` | POST | Firebase JWT only; invitation email lookup | `Users`; links `firebase_uid` |
| `/api/users` | GET/POST/PUT/DELETE | `verifyAdmin` local helper (`verifyUser` + `is_admin`; it does not explicitly require `role === staff`) | `Users`; creates invitation rows with `firebase_uid = NULL`, edits role/admin, deletes rows |
| `/api/bookings` | GET | `verifyUser`; filters Graph appointments by token email | Microsoft Graph Bookings |
| `/api/bookings/[id]` | DELETE | `verifyUser`; normalized token email must own Graph appointment | Microsoft Graph |
| `/api/staff/bookings` | GET | `verifyUser`, `role === staff` | Microsoft Graph |
| `/api/staff/bookings/[id]` | DELETE | `verifyUser`, `role === staff`, staff assignment check | Microsoft Graph |
| `/api/admin/bookings` | GET | `verifyUser`, `role === staff`, `isAdmin` | `dbo.bookings` |
| `/api/admin/bookings/[id]` | GET/DELETE | `verifyUser`, staff/admin checks | `dbo.bookings` and Graph |
| `/api/admin/reporting/bookings` | GET | staff/admin | `dbo.bookings` |
| `/api/admin/reporting/bookings.csv` | GET | staff/admin | `dbo.bookings`, CSV response |
| `/api/admin/reporting/last-sync` | GET | staff/admin | `dbo.bookings` sync timestamps |
| `/api/admin/reporting/sync` | POST | staff/admin | Graph and `bookingsSync`/`bookingsRepository` |
| `/api/notices` | GET | `verifyUser` only | `dbo.Notices`; publishes due scheduled notices and returns filtered published notices |
| `/api/notices/[id]` | PUT/DELETE | `verifyUser` only; no admin check | `Notices` |
| `/api/staff/admin/notices` and `/[id]` | GET/POST and GET/PUT/DELETE | `requireAdmin` | `dbo.Notices` |
| `/api/calendar` | GET | `verifyUser` | `dbo.TermCalendars` |
| `/api/staff/admin/calendar` and `/[id]` | GET/POST and PUT/DELETE | `requireAdmin` | `dbo.TermCalendars` |
| `/api/news`, `/api/news/[slug]` | GET | Public | `NewsAnnouncements` |
| `/api/gallery`, `/api/gallery/[id]` | GET | Public | `GalleryImages` |
| `/api/resources` | GET | Public | `LearningResources` |
| `/api/staff/admin/news` and `/[slug]` | GET/POST and GET/PUT/DELETE | `requireAdmin` | `NewsAnnouncements` |
| `/api/staff/admin/gallery` and `/[id]` | GET/POST/PUT/DELETE and GET/PUT/DELETE | `requireAdmin` | `GalleryImages`, `Users` joins |
| `/api/staff/admin/resources` | GET/POST/PUT/DELETE | `requireAdmin` | `LearningResources`, `Users` join |
| `/api/staff/admin/*/upload` | POST | `requireAdmin` | File parsing/storage and related content tables; exact storage persistence **NOT VERIFIED IN CODE** |
| `/api/staff/dashboard` | GET | `verifyUser`, `role === staff` | Graph; `dbo.Notices`, `LearningResources`, `Users` |
| `/api/staff/profile` | GET/PUT | `verifyUser`, `role === staff` | `Users`; only display name/profile image writable |
| `/api/health/db` | GET | Public | Azure SQL `SELECT 1` |
| `/api/test-admin` | GET | Public | Firebase Admin SDK readiness only |
| `/api/notices-test` | GET | Public | `Notices` |

No server actions were found. The API route files are the controller layer.

# API Details and Identity/Authorization Payloads

## `/api/user-role`

`GET` has no request body. It requires the Firebase bearer token, queries `Users` by `firebase_uid`, and returns:

```json
{ "role": "parent", "is_admin": false }
```

The route calls `verifyUser()` and then repeats the `Users` role query by UID. Missing/invalid auth is mapped to 401; other failures to 500.

## `/api/users/link`

`POST` has no required body. It validates the bearer token directly with `verifyFirebaseToken`, reads `sub` and `email`, then:

1. selects an existing row by `firebase_uid`;
2. otherwise selects an invitation by normalized email;
3. rejects if the invitation is linked to a different UID;
4. updates `Users.firebase_uid` and returns the linked user.

This is the only observed pre-link identity path and is deliberately not compatible with `verifyUser()` until the link exists.

## User administration

`/api/users` accepts JSON fields `email`, `display_name`, `role`, and `is_admin`; PUT additionally accepts `id`; DELETE accepts query `id`. Responses are user rows or generic error JSON. POST creates an SQL invitation with `firebase_uid = NULL`; it does not create a Firebase account.

## Booking identity

The live booking APIs use Microsoft Graph application credentials from `MS_TENANT_ID`, `MS_CLIENT_ID`, and `MS_CLIENT_SECRET` in [`src/lib/graph/graphHelper.js`](./src/lib/graph/graphHelper.js). The portal user is authenticated by Firebase, but the parent booking filter is email equality against the Graph customer email. The reporting sync writes Graph data into `dbo.bookings`.

# Login Flow Diagram

```text
Browser /login
  -> LoginPage.handleSubmit()
  -> Firebase signInWithEmailAndPassword(auth, email, password)
     or signInWithPopup(auth, googleProvider)
  -> Firebase User object and SDK-managed auth state
  -> user.getIdToken()
  -> GET /api/user-role
     -> verifyUser(req)
        -> verifyFirebaseToken()
           -> Firebase Google JWKS + issuer/audience validation
        -> SELECT id, role, is_admin FROM Users WHERE firebase_uid = @uid
  -> role/is_admin response
  -> router.push("/dashboard" | "/staff/dashboard" | "/staff/notices")
```

Activation adds:

```text
/activate-account
  -> createUserWithEmailAndPassword()
  -> getIdToken()
  -> POST /api/users/link
     -> verifyFirebaseToken()
     -> SELECT Users by firebase_uid/email
     -> UPDATE Users SET firebase_uid = @uid
  -> GET /api/user-role
  -> role-based redirect
```

There is no verified server-side session creation step. The â€œsessionâ€ is Firebase Auth's client persistence plus repeated bearer-token presentation.

# Authorization Flow Diagram

## Protected API request

```text
Client page/component
  -> auth.currentUser or onAuthStateChanged
  -> currentUser.getIdToken()
  -> fetch("/api/...", { Authorization: token scheme + token })
  -> Next.js route handler
  -> verifyUser(req)
     -> parse Authorization header
     -> verifyFirebaseToken(token)
     -> SELECT id, role, is_admin FROM Users WHERE firebase_uid = @uid
  -> optional role decision:
       user.role === "staff"
       user.role === "staff" && user.isAdmin
       requireAdmin()
       email/booking ownership comparison
  -> SQL/Graph operation
  -> JSON response
```

## Page request

```text
Browser requests /staff/... or /dashboard
  -> no Next.js middleware found
  -> page renders
  -> client Firebase listener and/or API call runs
  -> API boundary may return 401/403
  -> individual component decides whether to redirect or show an error
```

The exact â€œpermission evaluationâ€ step is therefore route-specific; there is no centralized permission evaluator.

# User Management Components

## Create and invite

[`src/app/staff/admin/user-management/page.js`](./src/app/staff/admin/user-management/page.js) calls `POST /api/users`. The server inserts a `Users` row with `firebase_uid = NULL`. Firebase account creation is deferred to the activation page.

## Link identity

[`src/app/(auth)/activate-account/page.js`](./src/app/(auth)/activate-account/page.js) calls `POST /api/users/link`, which binds the Firebase UID to the administrator-created SQL row by email.

## Update role/status

The admin UI calls `PUT /api/users`. The route updates `email`, `display_name`, `role`, and `is_admin`. There is no separate `status` column or status API observed. Firebase disabled-user state is handled by Firebase and surfaced as `auth/user-disabled` on login; no application API changes it.

## Delete

The admin UI calls `DELETE /api/users?id=...`, which deletes the SQL row. No Firebase Admin delete call was found, so whether the Firebase account is deleted or disabled when an SQL user is deleted is **NOT VERIFIED IN CODE**.

## Profile update

`PUT /api/staff/profile` allows a staff user to update only `display_name` and `profile_picture_url` by their verified Firebase UID. It explicitly does not update `role` or `is_admin`.

## Role assignment/removal

Role assignment/removal occurs through `PUT /api/users`, by changing `Users.role` and `Users.is_admin`. No separate role-assignment service or role table was found.

# Dependency Map

```text
Firebase Web SDK
  src/lib/firebase.js
        |
        v
Login/activation and auth listeners
  src/app/(auth)/login/page.js
  src/app/(auth)/activate-account/page.js
  src/hooks/useAuth.js
  src/providers/RoleProvider.js
  src/components/parent/ParentSidebar.js
  src/components/staff/StaffSidebar.js
        |
        | getIdToken() -> Authorization header carrying token
        v
Next.js API route handlers
  src/app/api/**/route.js
        |
        +--> src/lib/verifyToken.js
        |       Firebase JWKS + jose jwtVerify
        |
        +--> src/lib/auth.js
        |       verifyUser() / requireAdmin()
        |
        +--> src/lib/db.js
        |       mssql ConnectionPool
        |              |
        |              v
        |       Azure SQL Users and application tables
        |
        +--> src/lib/graph/graphHelper.js
                Azure Identity client credentials
                         |
                         v
                Microsoft Graph Bookings
```

The Firebase Admin branch is separate:

```text
src/lib/firebase-admin.js -> firebase-admin SDK -> authAdmin
                                      ^
                                      |
                         /api/test-admin only (observed)
```

# Migration Impact Assessment

This section identifies code coupled to the current SQL-backed authorization/identity model. It intentionally does not redesign the replacement.

## Every observed assumption that a Firebase user exists in Azure SQL

- `src/lib/auth.js`, `verifyUser()`: every bearer-authenticated protected API requires `Users.firebase_uid`.
- `src/app/api/user-role/route.js`: repeats the UID-to-Users lookup.
- `src/app/(auth)/login/page.js`, `redirectBasedOnRole()`: login is rejected/signs out if SQL role lookup fails.
- `src/app/(auth)/activate-account/page.js`: linking requires an existing invitation in `Users` and role lookup after linking.
- `src/app/api/users/link/route.js`: email invitation and `firebase_uid` linking.
- `src/app/api/bookings/route.js`: `verifyUser()` plus token email.
- `src/app/api/bookings/[id]/route.js`: `verifyUser()` plus token email ownership.
- all staff/admin APIs that call `verifyUser()` or `requireAdmin()`.
- `src/app/api/staff/profile/route.js`: profile lookup/update by `Users.firebase_uid`.
- `src/app/api/staff/dashboard/route.js`: `Users` count by role.
- `src/lib/reporting/bookingsRepository.js`: maps customer emails to `dbo.Users.id` during booking sync.

## Every observed role/admin query or role check

- `src/lib/auth.js`: `SELECT id, role, is_admin FROM Users WHERE firebase_uid = @uid`.
- `src/app/api/user-role/route.js`: role/admin query by Firebase UID.
- `src/app/api/users/route.js`: admin verification and CRUD of `role`/`is_admin`.
- `src/app/api/staff/dashboard/route.js`: `WHERE role = 'parent'`.
- `src/app/api/staff/profile/route.js`: `role === "staff"`.
- `src/app/api/staff/bookings/route.js` and `[id]`: `role === "staff"`.
- `src/app/api/admin/bookings/route.js` and `[id]`: staff plus admin checks.
- `src/app/api/admin/reporting/*`: staff plus admin checks.
- `src/app/api/staff/admin/*`: `requireAdmin()`.
- `src/components/staff/StaffSidebar.js`: `isAdmin` controls Admin link visibility.
- login and activation redirects: `role` and `is_admin`.

## Files affected by a CSV allow-list source

At minimum, a CSV authorization source would intersect the current SQL assumptions in:

- [`src/lib/auth.js`](./src/lib/auth.js): `verifyUser()` and `requireAdmin()`;
- [`src/lib/verifyToken.js`](./src/lib/verifyToken.js), only if the allow-list changes token/identity validation (the current token cryptographic validation is independent);
- [`src/app/api/user-role/route.js`](./src/app/api/user-role/route.js);
- login and activation redirect functions;
- [`src/providers/RoleProvider.js`](./src/providers/RoleProvider.js);
- all APIs listed above that check `user.role`/`user.isAdmin`;
- [`src/app/api/users/route.js`](./src/app/api/users/route.js) and the admin user-management page, because they currently persist and edit the authority source;
- `src/app/api/users/link/route.js`, because invitation/link eligibility is SQL email matching;
- staff/admin page navigation and any page that displays `isAdmin`;
- `src/lib/reporting/bookingsRepository.js` if user IDs or parent associations remain SQL-backed.

The precise CSV loading location, refresh policy, identity column, and role representation do not exist currently and are **NOT VERIFIED IN CODE**.

## Files affected by a PDF allow-list source

The same authorization call sites would be affected, plus a new parsing/integrity boundary would be required in whichever module replaces SQL role resolution. In the current repository, no PDF allow-list parser or authorization file exists. Therefore the following are impact locations, not implementation recommendations:

- `verifyUser()`/`requireAdmin()`;
- `/api/user-role`;
- login, activation, `RoleProvider`, and `StaffSidebar`;
- every staff/admin API role check;
- `/api/users`, `/api/users/link`, and admin user management;
- any SQL query that assumes `Users` is the authoritative identity/role row;
- `bookingsRepository.js` where SQL `Users.id` is used for booking parent association.

PDF-specific extraction, OCR, document versioning, malformed-document behavior, and identity matching are **NOT VERIFIED IN CODE**.

## Tables/modules/pages potentially impacted

| Area | Current dependency |
|---|---|
| `Users` | Firebase UID link, email invitation, role, admin bit, profile, creator/parent joins |
| `dbo.bookings` sync | `parent_id` lookup through `Users` email |
| Staff/admin pages | Admin links and API calls assume SQL-resolved `isAdmin` |
| Auth pages | SQL role lookup determines whether authentication is accepted for application use |
| RoleProvider | `/api/user-role` response is the client role source |
| API auth helper | Centralized SQL lookup is used by nearly every protected API |

# High-Risk Areas

These are current architectural risks or inconsistencies documented from code, not proposed fixes:

1. **No route middleware.** Protected pages are rendered without a server-side route gate; enforcement depends on client listeners and API handlers.
2. **Inconsistent page guards.** The staff dashboard contains a comment that authentication has intentionally been commented out. Several pages rely on APIs rather than an explicit page guard.
3. **Inconsistent API authorization.** `/api/notices/[id]` authenticates but does not require staff/admin for mutation. The generic `/api/notices` endpoint is authenticated but does not apply a role-specific visibility policy.
4. **Two authority checks.** Some routes use `requireAdmin()` (staff plus admin); `/api/users` uses a local `verifyAdmin()` that checks only `is_admin`, allowing any row with the bit set regardless of `role`.
5. **Email as booking ownership identity.** Booking access and cancellation use the Firebase token email compared to Microsoft Graph customer email, not a stable Firebase UID.
6. **Activation invitation trust.** The email verification check is commented out in `/api/users/link`; actual enforcement of email ownership before linking is **NOT VERIFIED IN CODE**.
7. **SQL/Firebase lifecycle split.** SQL user deletion does not visibly delete or disable the Firebase account.
8. **Sensitive diagnostic surface.** `/api/health/db`, `/api/test-admin`, and `/api/notices-test` are public diagnostic/data endpoints in the observed code.
9. **Credential/configuration coupling.** Firebase client configuration and Firebase Admin service-account import are separate mechanisms; the service-account file's deployment and protection are **NOT VERIFIED IN CODE**.
10. **No schema source of truth.** Tables, foreign keys, views, and stored procedures are external to this repository, preventing repository-level verification of the database contract.

# Questions Raised By The Existing Design

These are questions the code leaves unanswered; they are not implementation recommendations:

1. Is `Users.email` guaranteed to equal the Firebase account email after activation and after an email change?
2. Is `Users.role` constrained to `parent` and `staff` in Azure SQL, or is validation only in the UI?
3. Is `is_admin = 1` intended to imply staff, given the mismatch between `requireAdmin()` and `/api/users`'s local `verifyAdmin()`?
4. Are `/api/notices/[id]` mutations intentionally available to every authenticated SQL user?
5. Are page-level role checks implemented outside the files inspected, or are API checks the only enforcement?
6. What is the physical schema and what foreign keys exist between `Users`, content tables, and `dbo.bookings`?
7. Does deleting a SQL `Users` row leave an active Firebase account?
8. Is the duplicate `src/app/(auth)/login/activate-account.js` imported anywhere?
9. Is Firebase email verification enforced operationally despite the commented-out server check?
10. Is `dbo.bookings` authoritative for reporting only, while Microsoft Graph is authoritative for live booking actions?
11. Are the public diagnostic endpoints intentionally exposed in production?
12. What exact persistence and refresh semantics are expected for an external allow-list? This is not represented by the current code.

Where the repository does not answer these questions, the answer is **NOT VERIFIED IN CODE**.

