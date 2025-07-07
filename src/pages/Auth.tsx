import React, { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return <AuthForm mode={mode} onToggleMode={toggleMode} />;
};

export default Auth;