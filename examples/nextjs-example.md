# Claude Context with Next.js - Example Setup

This example shows how to set up Claude Context for a Next.js project with TypeScript.

## Installation

```bash
npx create-claude-context --type nextjs
```

## Example CLAUDE.md for Next.js

```markdown
# CLAUDE.md

# NextStore - E-commerce Platform Development Guidelines

Essential guidelines for Claude Code when working on NextStore.

## Project Overview

NextStore is a modern e-commerce platform built with Next.js 14, featuring:
- Server-side rendering for SEO
- Edge functions for performance  
- PostgreSQL with Prisma ORM
- Stripe payment integration
- Real-time inventory updates

**Stack**: Next.js 14, TypeScript, PostgreSQL, Prisma, Tailwind CSS, Stripe

## Current Sprint Focus

- **Active**: Shopping cart implementation
- **Progress**: 65% complete
- **Next**: Checkout flow with Stripe
- **Ready**: Product listing, User authentication, Search
- **Blocked**: Need: Payment provider API keys

## Architecture Overview

```
app/                    # Next.js 14 app directory
├── (shop)/            # Shopping routes group
│   ├── products/      # Product pages
│   ├── cart/          # Cart functionality  
│   └── checkout/      # Checkout flow
├── (auth)/            # Auth routes group
│   ├── login/
│   └── register/
├── api/               # API routes
│   ├── products/
│   ├── cart/
│   └── webhook/       # Stripe webhooks
├── components/        # Shared components
├── lib/              # Utilities and configs
└── prisma/           # Database schema
```

### Key Decisions
- Using App Router for better performance
- Server Components by default, Client Components when needed
- Prisma for type-safe database access
- Edge runtime for API routes where possible

## Development Workflow

### 1. Branch Strategy
```bash
git checkout -b feature/cart-[specific-feature]
```

### 2. Component Pattern
```typescript
// Always use this pattern for components
import { FC } from 'react';

interface Props {
  // Define all props with TypeScript
}

export const ComponentName: FC<Props> = ({ prop1, prop2 }) => {
  // Implementation
};
```

### 3. API Route Pattern
```typescript
// app/api/products/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany();
  return Response.json(products);
}
```

### 4. Data Fetching Pattern
```typescript
// Server Component (default)
async function ProductList() {
  const products = await prisma.product.findMany();
  return <div>{/* render products */}</div>;
}

// Client Component (when needed)
'use client';
import useSWR from 'swr';

function CartCount() {
  const { data } = useSWR('/api/cart/count');
  return <span>{data?.count || 0}</span>;
}
```

## Common Patterns

### Server Actions
```typescript
// app/actions/cart.ts
'use server';

export async function addToCart(productId: string) {
  // Validate user session
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  // Add to cart
  await prisma.cartItem.create({
    data: {
      userId: session.userId,
      productId,
      quantity: 1
    }
  });
  
  revalidatePath('/cart');
}
```

### Error Handling
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Loading States
```typescript
// app/loading.tsx
export default function Loading() {
  return <CartSkeleton />;
}
```

## Testing Requirements

- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical user flows (checkout)
- Visual regression tests for components

```bash
npm run test        # Unit + Integration
npm run test:e2e    # Playwright E2E tests
```

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Hydration errors | Check for client-only code in Server Components |
| Type errors | Run `npm run type-check` before committing |
| Prisma errors | Run `npx prisma generate` after schema changes |
| Build fails | Check for dynamic imports and 'use client' directives |

## Performance Considerations

1. Use Server Components by default
2. Implement proper caching strategies
3. Optimize images with next/image
4. Use dynamic imports for large components
5. Enable ISR for product pages

## Security Checklist

- [ ] Validate all user inputs
- [ ] Use Prisma's parameterized queries
- [ ] Implement CSRF protection
- [ ] Secure API routes with authentication
- [ ] Validate webhook signatures

## Remember

1. **Server Components first** - Only use Client Components when necessary
2. **Type everything** - No `any` types allowed
3. **Test critical paths** - Especially payment flows
4. **Optimize for Core Web Vitals** - Performance matters
5. **Follow Next.js conventions** - App Router patterns
```

## Example Configuration

```json
// .claude/config.json
{
  "project": {
    "name": "nextstore",
    "type": "nextjs",
    "description": "E-commerce platform with Next.js"
  },
  "context": {
    "excludePatterns": [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.env*",
      "**/prisma/migrations/**"
    ]
  },
  "features": {
    "healthChecks": true,
    "customChecks": true
  },
  "scripts": {
    "claude:build-check": "next build && npm run claude:update",
    "claude:type-check": "tsc --noEmit && npm run claude:update"
  }
}
```

## Custom Health Checks

```javascript
// .claude/health-checks/nextjs.js
module.exports = [
  {
    name: 'Next.js Build',
    check: async () => {
      try {
        const { execSync } = require('child_process');
        execSync('next build', { stdio: 'ignore' });
        return { passed: true, message: 'Build successful' };
      } catch (error) {
        return { passed: false, message: 'Build failed' };
      }
    }
  },
  {
    name: 'TypeScript',
    check: async () => {
      try {
        const { execSync } = require('child_process');
        execSync('tsc --noEmit', { stdio: 'ignore' });
        return { passed: true, message: 'No type errors' };
      } catch (error) {
        return { passed: false, message: 'Type errors found' };
      }
    }
  }
];
```

## Typical Session

```bash
# Start your day
npm run claude:start

# Check current status
npm run claude:dashboard

# After making changes
npm run claude:type-check
npm run claude:build-check

# End of day
npm run claude:end
```