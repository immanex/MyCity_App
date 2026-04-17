# MyCity App

Premium Real Estate Platform for the Nigerian Market.

## Roles and Login

### Regular Users
Regular users can authenticate using Google Sign-In. You must enable the Google provider in your authentication dashboard (Supabase, Firebase, or whichever auth provider you are using).

### Agents
Agents must first register via `/agent/register`. They go through an approval process. To log in as an agent, an admin must set the user's role to `AGENT` in the database.

### Admins
Admins have access to the `/admin` dashboard. To set up an admin user:
1. Log in via Google to create your initial user account.
2. In the `User` table in your Postgres database, manually set your user's `role` to `ADMIN` using a database client or SQL query. Example: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';`
3. Log in again to access the admin portal.

## Setting Up Google Auth
The app expects Google OAuth to be enabled on your auth service.
1. Go to your Supabase/Firebase project settings.
2. Under Authentication > Providers, enable **Google**.
3. Set your Google OAuth Client ID and Secret (obtainable from Google Cloud Console).
4. Save and retry signing in.
