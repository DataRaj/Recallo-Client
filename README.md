# Recallo-Client

This is the frontend client for Recallo, a real-time audio and video-based communication and streaming platform featuring a rich set of premium functionalities.
added new color layout
## Authentication Architecture

Recallo uses a robust Next.js frontend to Go backend authentication flow designed for high security and a seamless user experience. The system integrates standard Email/Password authentication along with GitHub OAuth.

### Key Features

- **Modern Security**: The access token is stored entirely in memory (via Zustand), meaning it is never exposed to `localStorage` or `sessionStorage`.
- **Secure Token Refresh**: The `refresh_token` is stored exclusively in a secure, `httpOnly` cookie (`lax` same-site) managed by the Next.js API layer.
- **Go Backend Integration**: Internal Next.js proxy API routes (`/api/auth/*`) act as a bridge, translating the frontend's cookie-based refresh tokens into JSON payloads required by the Go backend endpoints.
- **OAuth Integration**: Complete flow for GitHub OAuth, seamlessly capturing callback redirects, parsing tokens, persisting secure cookies, and populating client state.
- **Form Validation**: Complete type-safe validation utilizing `zod` and `react-hook-form` for login and registration.
- **Dynamic Layout & Design**: Uses modern, aesthetic CSS features with glassmorphism, responsive components, and custom gradients (`rc-purple`, `rc-indigo`).

## Project Structure (Auth Modules)

- `src/app/[locale]/(auth)`: Contains login, register, and OAuth success landing pages.
- `src/app/api/auth/`: Next.js proxy endpoints (`set-cookie`, `refresh`, `me`, `logout`) bridging cookies and JSON backend.
- `src/stores/use-auth-store.ts`: Memory-only Zustand store handling client-side authentication state.
- `src/hooks/`:
  - `use-auth.ts`: Provides actions for login, register, and logout.
  - `use-current-user.ts`: Hydrates user state on mount using React Query.
- `src/libs/api-client.ts`: Reusable Axios client intercepting requests to attach tokens and silently handling 401 token refreshes.
- `src/schemas/auth.schema.ts`: Zod schema definitions for frontend forms.
- `src/types/auth.ts`: Shared TypeScript interfaces mapping precisely to the Go backend representations.

## Local Development Environment

Make sure to set the following environment variables in your `.env` or `.env.local` for local development:

```env
# Next.js
NEXT_TELEMETRY_DISABLED=1

# Go backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Starting the Client

Use the following commands to spin up the development environment:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The app is built on top of Next.js App Router, using Tailwind CSS, Radix UI primitives, React Query, and Zustand.
