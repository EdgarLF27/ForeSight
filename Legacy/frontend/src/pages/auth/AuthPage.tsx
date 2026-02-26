import { useState } from 'react';
import { LoginForm } from '../../modules/auth/components/LoginForm';
import { RegisterForm } from '../../modules/auth/components/RegisterForm';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthPage = ({ onLoginSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex flex-col font-sans">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {isLogin ? (
          <LoginForm 
            onSuccess={onLoginSuccess} 
            onRegisterClick={() => setIsLogin(false)} 
          />
        ) : (
          <RegisterForm 
            onLoginClick={() => setIsLogin(true)} 
          />
        )}
        
        {/* Footer Copyright */}
        <p className="mt-8 text-xs text-gray-400">
          © 2026 ForeSight. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
