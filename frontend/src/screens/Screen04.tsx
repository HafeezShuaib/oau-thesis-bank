import React from 'react';
import { Mail } from 'lucide-react';
import { useAppRouter, Button, AuthContainer } from '../components/shared';

const Screen04PasswordReset = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthContainer title="Reset Password" subtitle="Password recovery is managed by the connected backend">
      <div className="space-y-6 text-center">
        <Mail className="mx-auto h-12 w-12 text-[#00502F] opacity-50" />
        <p className="text-sm leading-6 text-slate-600">The current Django API does not expose a password-reset email endpoint, so this screen will not claim that a reset link was sent. Contact an administrator to recover access.</p>
        <Button className="w-full" onClick={() => navigate('login')}>Return to Login</Button>
      </div>
    </AuthContainer>
  );
};

export default Screen04PasswordReset;
