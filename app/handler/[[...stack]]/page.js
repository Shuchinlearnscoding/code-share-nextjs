import { StackHandler } from '@stackframe/stack';
import { stackServerApp } from '@/lib/stack';

export default function Handler(props) {
  return <StackHandler app={stackServerApp} {...props} />;
}
