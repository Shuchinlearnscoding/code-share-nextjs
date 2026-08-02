import { StackHandler } from '@stackframe/stack';
import { isStackAuthConfigured, stackServerApp } from '@/lib/stack';

function AuthNotConfigured() {
  return (
    <section style={{ maxWidth: 680, margin: '80px auto', padding: 24, lineHeight: 1.7 }}>
      <h1>登入功能暫時無法使用</h1>
      <p>
        會員登入與註冊正在整理中。您仍然可以先搜尋並使用邀請碼。
      </p>
    </section>
  );
}

export default function Handler(props) {
  if (!isStackAuthConfigured()) {
    return <AuthNotConfigured />;
  }

  return <StackHandler app={stackServerApp} {...props} />;
}
