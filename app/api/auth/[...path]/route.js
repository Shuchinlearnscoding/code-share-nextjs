import { getAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

let handlers;

function dispatch(method) {
  return (request, context) => {
    handlers ??= getAuth().handler();
    return handlers[method](request, context);
  };
}

export const GET = dispatch('GET');
export const POST = dispatch('POST');
export const PUT = dispatch('PUT');
export const DELETE = dispatch('DELETE');
export const PATCH = dispatch('PATCH');
