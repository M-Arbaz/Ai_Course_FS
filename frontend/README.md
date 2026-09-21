# AI Course frontend

Editable Next.js and Tailwind CSS course-selling interface connected to the Express API.

## Run locally

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`. Copy `.env.example` to `.env.local` when the API uses a different URL.

## Easy content changes

- Brand, prices, courses and categories: `src/data/site.js`
- Colors and full visual styling: `src/app/globals.css`
- Homepage: `src/app/page.js`
- Course list: `src/app/courses/page.js`
- Course detail template: `src/app/courses/[slug]/page.js`
- Login/signup and OTP screens: `src/components/AuthForm.js`
- Forgot/reset password: `src/app/forgot-password/page.js`
- Student dashboard: `src/app/dashboard/page.js`
- API connection: `src/lib/api.js`

There is no demo account. Users must register, verify their email, and complete an email OTP challenge at login.

## Checks

```bash
npm run lint
npm run build
```
