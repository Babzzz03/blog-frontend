import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign In | My Blog' };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Or{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            create a new account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
