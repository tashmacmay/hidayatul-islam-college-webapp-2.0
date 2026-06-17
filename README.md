IF3003W TEAM 1 YEAR PROJECT

Title:
Hidayatul Islam College Webapp

Sponsor/Client:
Principal A. Fridie | Hidayatul Islam College

Team Members:
PM - Taslimah Emjedi (EMJTAS001)
SD - Tasha Maclay-Mayers (MCLTAS001)
BA - Lindani Xaba (XBXLIN006)
SS - Khensani Baloyi (BLYMIT001)

Description:
The Hidayatul Islam College web application serves to renovate the school's abandoned Wix website, maintaining legacy content while adding login functionality and user-specific dashboards. With the introduction of user authorisation, the webapp aims to introduce online booking functionality and announcement posting functionality directly within the app.

Techstack:
- Next.js 14
- Tailwind CSS: styling
- React Hook Form + Zod: form validation
- Lucide React: icons
- Framer Motion: animations

- MySQL: user information
- Firebase Auth: email/password + Google OAuth
- Firebase Storage (file uploads)

- Microsoft Graph API: create/reference Outlook calendar events
- Nodemailer (SMTP): confirmation/cancellation/reminder emails with .ics calendar attachments
- iCalendar generator: produce calendar invite files (compatible with Outlook, Apple and Google Calendars)

- Vercel: hosting (Afrihost fallback)

---

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
