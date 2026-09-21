# AI Course API

Express and MySQL backend for secure student authentication.

## Included flows

- Signup with password hashing and email verification OTP
- Password login followed by email OTP
- HTTP-only JWT session cookie
- Forgot password and OTP-based reset
- OTP expiration and attempt limits
- Login attempt lockout and API rate limits
- CORS, Helmet security headers and request-size limits

## Local setup

1. Copy `.env.example` to `.env` and enter your local values.
2. Create the MySQL database named in `DB_NAME`.
3. Run `npm install` and `npm run dev`.

The `users` table is created automatically. `scripts/schema.sql` is also provided for manual import in phpMyAdmin.

## Production variables

Set the required variables shown in `.env.example` in cPanel. Set `NODE_ENV=production`. `FRONTEND_URL` may contain comma-separated allowed origins.

Never expose `DB_PASS`, `JWT_SECRET` or `OTP_EMAIL_PASS` to frontend code or prefix them with `NEXT_PUBLIC_`.
