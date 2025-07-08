import React, { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // No Firebase functionality - just pass through children
  // All authentication is now handled by Zustand stores with local storage
  return <>{children}</>;
};

export default AuthProvider;