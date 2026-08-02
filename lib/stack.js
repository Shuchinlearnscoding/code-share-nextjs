import { StackServerApp } from '@stackframe/stack';

const PLACEHOLDER_PROJECT_IDS = new Set([
  '123e4567-e89b-42d3-a456-426614174000',
]);

function isPlaceholderValue(value) {
  return !value || value.includes('placeholder') || value.includes('000000000000') || PLACEHOLDER_PROJECT_IDS.has(value);
}

export function isStackAuthConfigured() {
  return (
    !isPlaceholderValue(process.env.NEXT_PUBLIC_STACK_PROJECT_ID) &&
    !isPlaceholderValue(process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) &&
    !isPlaceholderValue(process.env.STACK_SECRET_SERVER_KEY)
  );
}

export const stackServerApp = isStackAuthConfigured() ? new StackServerApp({
  tokenStore: 'nextjs-cookie',
  urls: {
    handler: '/handler',
    home: '/',
    afterSignIn: '/',
    afterSignUp: '/',
    afterSignOut: '/',
  },
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
}) : null;
