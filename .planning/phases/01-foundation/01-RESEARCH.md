# Phase 1: Foundation - Research

**Researched:** 2026-01-17
**Domain:** Authentication, Internationalization, Accessibility
**Confidence:** HIGH

## Summary

This phase establishes the foundation for a multilingual, accessible tax platform with persistent authentication. The research covers five key areas: Supabase Auth with Next.js 15 App Router (using `@supabase/ssr`), next-intl for internationalization with localized routes, shadcn/ui accessibility customization for elderly users (18px+ fonts, 48px touch targets), Supabase email template customization for 4 languages, and session persistence configuration for 30+ day sessions.

The standard approach uses cookie-based authentication via `@supabase/ssr`, middleware composition for both Supabase and next-intl, and Tailwind CSS customization for accessibility requirements. The elderly-friendly design requirements (AUTH-05, A11Y-01 to A11Y-09) are achievable through CSS configuration and shadcn/ui component customization.

**Primary recommendation:** Use the combined middleware pattern for Supabase + next-intl, configure 18px base font size in globals.css, and customize shadcn/ui components with accessible size variants.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.5.x | SSR Auth with cookies | Official Supabase package for App Router |
| @supabase/supabase-js | ^2.x | Supabase client | Official client library |
| next-intl | ^4.x | i18n for Next.js | Best i18n solution for App Router |
| drizzle-orm | ^0.37.x | Database ORM | Type-safe, lightweight ORM |
| react-hook-form | ^7.x | Form management | Best performance, minimal re-renders |
| zod | ^3.x | Schema validation | TypeScript-first validation |
| @hookform/resolvers | ^3.x | Connect Zod to RHF | Official resolver package |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| postgres | ^3.x | PostgreSQL driver | Drizzle connection to Supabase |
| drizzle-kit | ^0.29.x | Migration tooling | Schema push and migrations |
| drizzle-zod | ^0.5.x | Zod from Drizzle schemas | Auto-generate form validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | next-i18next | next-intl has better App Router support |
| Drizzle | Prisma | Drizzle is lighter weight, better edge runtime support |
| React Hook Form | Formik | RHF has better performance, less re-renders |

**Installation:**
```bash
npm install @supabase/ssr @supabase/supabase-js next-intl drizzle-orm postgres react-hook-form zod @hookform/resolvers
npm install -D drizzle-kit @types/pg
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── [locale]/                  # Locale segment for all pages
│       ├── layout.tsx             # Root locale layout
│       ├── page.tsx               # Home page
│       └── (auth)/                # Auth route group
│           ├── login/
│           ├── register/
│           └── reset-password/
├── components/
│   └── ui/                        # shadcn/ui components (customized)
├── db/
│   ├── index.ts                   # Drizzle client
│   └── schema.ts                  # Database schema
├── i18n/
│   ├── routing.ts                 # Locale routing config
│   ├── navigation.ts              # Localized navigation APIs
│   └── request.ts                 # Request configuration
├── lib/
│   └── supabase/
│       ├── client.ts              # Browser client
│       ├── server.ts              # Server client
│       └── middleware.ts          # Middleware client
├── messages/
│   ├── en.json                    # English translations
│   ├── es.json                    # Spanish translations
│   ├── de.json                    # German translations
│   └── fr.json                    # French translations
└── middleware.ts                  # Combined middleware
```

### Pattern 1: Combined Middleware (Supabase + next-intl)
**What:** Integrate both i18n routing and auth session refresh in a single middleware
**When to use:** Always - this is the required pattern for SSR auth with localized routes
**Example:**
```typescript
// Source: https://github.com/amannn/next-intl/discussions/422
// middleware.ts
import { type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Handle i18n routing first
  const response = handleI18nRouting(request);

  // Step 2: Create Supabase client with cookie sync
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        }
      }
    }
  );

  // Step 3: Refresh session (use getUser, NOT getSession for security)
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/', '/(es|en|de|fr)/:path*']
};
```

### Pattern 2: Supabase Client Utilities
**What:** Separate browser and server client creation
**When to use:** All Supabase operations
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

### Pattern 3: next-intl Routing Configuration
**What:** Central routing configuration with 4 locales
**When to use:** Setting up i18n from scratch
**Example:**
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en', 'de', 'fr'],
  defaultLocale: 'es'  // Spanish as default per requirements
});

// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

### Pattern 4: Zod Schema with i18n Error Messages
**What:** Create validation schemas that use translated error messages
**When to use:** All form validation
**Example:**
```typescript
// Source: https://github.com/amannn/next-intl/discussions/437
// hooks/useAuthSchemas.ts
import { z } from 'zod';
import { useTranslations } from 'next-intl';

export const useLoginSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
    password: z
      .string()
      .min(1, { message: t('passwordRequired') })
      .min(8, { message: t('passwordMinLength') })
  });
};

export const useRegisterSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
    password: z
      .string()
      .min(8, { message: t('passwordMinLength') }),
    confirmPassword: z
      .string()
      .min(1, { message: t('confirmPasswordRequired') })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('passwordsMustMatch'),
    path: ['confirmPassword']
  });
};
```

### Pattern 5: Accessible Form with shadcn/ui
**What:** Form component with 18px fonts, 48px touch targets, WCAG AA contrast
**When to use:** All forms in the application
**Example:**
```typescript
// components/ui/button.tsx (customized)
// Source: https://ui.shadcn.com/docs/components/button
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles with accessible focus
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-12 min-w-[48px] px-6 text-lg',  // 48px height, 18px+ text
        sm: 'h-12 min-w-[48px] px-4 text-base',     // Still 48px for touch
        lg: 'h-14 min-w-[56px] px-8 text-xl',       // Larger for primary CTAs
        icon: 'h-12 w-12 text-lg',                   // Square 48px touch target
      },
      // ... rest of variants
    },
    defaultVariants: {
      size: 'default',
    },
  }
);
```

### Anti-Patterns to Avoid
- **Using getSession() in middleware:** Never trust `getSession()` server-side; always use `getUser()` which validates with Supabase Auth server
- **Storing tokens in localStorage for SSR:** Use cookie-based auth via `@supabase/ssr` instead
- **Creating Drizzle client in client components:** Drizzle clients only work server-side
- **Hardcoding error messages in Zod schemas:** Use schema factory functions with `useTranslations`
- **Using relative URLs in redirectTo:** Supabase email links require absolute URLs with domain

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session refresh | Custom JWT refresh logic | `@supabase/ssr` middleware | Handles cookie sync, token refresh, PKCE automatically |
| Locale detection | Custom Accept-Language parsing | `next-intl` middleware | Handles detection, fallback, cookies correctly |
| Form state | useState for each field | React Hook Form | Performance, validation, accessibility built-in |
| Password validation | Custom regex | Zod schema | Type inference, composable, tested |
| Contrast checking | Manual color calculations | WebAIM Contrast Checker / InclusiveColors | WCAG compliance requires precision |
| Email templates | Plain text emails | Supabase Go templates | Handles token injection, secure links |

**Key insight:** Authentication and i18n have subtle edge cases (token expiry, locale negotiation, cookie security) that are easy to get wrong. The standard packages handle these correctly.

## Common Pitfalls

### Pitfall 1: Using getSession() Instead of getUser() Server-Side
**What goes wrong:** Session appears valid but JWT is expired/tampered
**Why it happens:** `getSession()` only reads local data, doesn't validate with server
**How to avoid:** Always use `getUser()` in middleware and server components for auth checks
**Warning signs:** Users staying "logged in" after session should expire, security audit failures

### Pitfall 2: Missing Cookie Sync in Combined Middleware
**What goes wrong:** Auth tokens not refreshed, users logged out unexpectedly
**Why it happens:** Response from i18n middleware returned without Supabase cookie updates
**How to avoid:** Sync cookies to BOTH request and response in middleware cookie handlers
**Warning signs:** "Session expired" errors after page navigation, intermittent auth failures

### Pitfall 3: Relative redirectTo URLs in Password Reset
**What goes wrong:** Password reset links don't work, redirect to wrong domain
**Why it happens:** Supabase emails require absolute URLs with protocol and domain
**How to avoid:** Always use full URLs: `https://yourdomain.com/reset-password`
**Warning signs:** Email links going to localhost, 404 errors after clicking reset link

### Pitfall 4: Zod Schemas Defined Outside Components
**What goes wrong:** Error messages not translated, always show in default language
**Why it happens:** `useTranslations` hook only works inside React components
**How to avoid:** Use schema factory hooks like `useLoginSchema()` inside components
**Warning signs:** Validation errors in wrong language, static English messages

### Pitfall 5: Session Timeout Confusion
**What goes wrong:** Sessions expire before 30 days despite configuration
**Why it happens:** Total duration = Time-boxed timeout + JWT expiry time
**How to avoid:** Set JWT expiry to 1 hour, inactivity timeout to 30 days
**Warning signs:** Users complaining about frequent re-logins, inconsistent session lengths

### Pitfall 6: Missing Locale in Layout/Page
**What goes wrong:** Static rendering fails, always dynamic
**Why it happens:** `setRequestLocale()` not called in server components
**How to avoid:** Call `setRequestLocale(locale)` at top of all layouts and pages
**Warning signs:** Slow page loads, missing static generation, increased server costs

## Code Examples

Verified patterns from official sources:

### Password Reset Flow (PKCE)
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
// app/[locale]/(auth)/reset-password/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const t = await getTranslations('auth');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/update`,
  });

  if (error) {
    return { error: t('resetError') };
  }

  return { success: t('resetEmailSent') };
}

// After user clicks email link and lands on /reset-password/update
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;
  const t = await getTranslations('auth');

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: t('updatePasswordError') };
  }

  return { success: t('passwordUpdated') };
}
```

### User Registration with Language Preference
```typescript
// Source: https://supabase.com/docs/guides/troubleshooting/customizing-emails-by-language-KZ_38Q
// app/[locale]/(auth)/register/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { getLocale, getTranslations } from 'next-intl/server';

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations('auth');

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        language: locale,  // Store for email templates
        preferred_locale: locale
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/confirm`
    }
  });

  if (error) {
    return { error: t('signUpError') };
  }

  return { success: t('confirmationEmailSent') };
}
```

### Multilingual Email Template (Supabase Dashboard)
```html
<!-- Source: https://supabase.com/docs/guides/troubleshooting/customizing-emails-by-language-KZ_38Q -->
<!-- Supabase Dashboard > Authentication > Email Templates > Reset Password -->

{{if eq .Data.language "es" }}
<h2>Restablecer Contrasena</h2>
<p>Haga clic en el enlace de abajo para restablecer su contrasena:</p>
{{ else if eq .Data.language "de" }}
<h2>Passwort zurucksetzen</h2>
<p>Klicken Sie auf den Link unten, um Ihr Passwort zuruckzusetzen:</p>
{{ else if eq .Data.language "fr" }}
<h2>Reinitialiser le mot de passe</h2>
<p>Cliquez sur le lien ci-dessous pour reinitialiser votre mot de passe:</p>
{{ else }}
<h2>Reset Password</h2>
<p>Click the link below to reset your password:</p>
{{end}}

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
    {{if eq .Data.language "es" }}Restablecer Contrasena
    {{ else if eq .Data.language "de" }}Passwort zurucksetzen
    {{ else if eq .Data.language "fr" }}Reinitialiser
    {{ else }}Reset Password
    {{end}}
  </a>
</p>
```

### Accessible Base Styles (globals.css)
```css
/* Source: https://dev.to/vivgui/how-to-change-tailwind-css-base-font-size-o33 */
/* globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Elderly-friendly base font size: 18px minimum */
html {
  font-size: 18px;
}

/* Ensure focus visibility for keyboard navigation */
@layer base {
  :focus-visible {
    outline: 3px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  /* High contrast text */
  body {
    @apply text-foreground bg-background;
    /* Ensure 4.5:1 contrast ratio minimum */
  }
}

/* Touch target minimum: 48px */
@layer components {
  .touch-target {
    @apply min-h-[48px] min-w-[48px];
  }
}
```

### Drizzle Database Client
```typescript
// Source: https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use connection pooling with Transaction mode (disable prepare)
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false
});

export const db = drizzle(client, { schema });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Deprecated package, migrate to ssr |
| next-i18next | next-intl | 2023-2024 | Better App Router support |
| localStorage auth tokens | Cookie-based auth | 2024 | Required for SSR |
| Prisma | Drizzle gaining ground | 2024-2025 | Edge runtime compatibility |
| FormField component | Field component | 2025 | New shadcn/ui recommended approach |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Use `@supabase/ssr` instead
- `getSession()` for auth validation: Use `getUser()` which validates with server
- Storing locale in URL params only: Use `NEXT_LOCALE` cookie for persistence

## Open Questions

Things that couldn't be fully resolved:

1. **Email template subject line translation**
   - What we know: Email body can use Go template conditionals based on user metadata
   - What's unclear: Subject line is defined in config.toml, may not support conditionals
   - Recommendation: Test with Supabase dashboard; may need Edge Functions for full control

2. **Static rendering with next-intl in Next.js 15**
   - What we know: `setRequestLocale()` is required, `generateStaticParams()` needed
   - What's unclear: Full static export compatibility with all pages
   - Recommendation: Test build output, may need some pages as dynamic

3. **Exact session duration with time-boxed sessions**
   - What we know: Duration = time-box setting + JWT expiry
   - What's unclear: Pro plan required for time-boxed feature
   - Recommendation: Verify Supabase plan includes feature, otherwise use default refresh token behavior (effectively indefinite with auto-refresh)

## Sources

### Primary (HIGH confidence)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR setup, middleware pattern
- [Supabase Sessions Documentation](https://supabase.com/docs/guides/auth/sessions) - JWT expiry, refresh tokens
- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) - Complete i18n configuration
- [Supabase Password-Based Auth](https://supabase.com/docs/guides/auth/passwords) - Sign up, sign in, reset flows
- [Supabase Email Templates](https://supabase.com/docs/guides/troubleshooting/customizing-emails-by-language-KZ_38Q) - Multilingual Go templates
- [Drizzle with Supabase](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase) - Database setup

### Secondary (MEDIUM confidence)
- [GitHub Discussion #422](https://github.com/amannn/next-intl/discussions/422) - Combined middleware pattern verified by maintainer
- [GitHub Discussion #437](https://github.com/amannn/next-intl/discussions/437) - Zod + next-intl integration patterns
- [shadcn/ui Button Documentation](https://ui.shadcn.com/docs/components/button) - Component variants
- [Tailwind Font Size Customization](https://dev.to/vivgui/how-to-change-tailwind-css-base-font-size-o33) - Base font configuration

### Tertiary (LOW confidence)
- Touch target size recommendations (44-48px) from various WCAG guides - verify with WCAG 2.1 spec
- WCAG 2.1 AA contrast ratio (4.5:1) - use WebAIM Contrast Checker for validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation and maintained packages
- Architecture: HIGH - Patterns from official docs and verified discussions
- Auth flow: HIGH - Official Supabase documentation
- i18n setup: HIGH - Official next-intl documentation
- Accessibility customization: MEDIUM - Principles established, implementation needs testing
- Email templates: MEDIUM - Go template syntax confirmed, multi-language tested pattern

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable libraries with infrequent breaking changes)
