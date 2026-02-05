import { useState } from 'react';
import { authService } from '../../../services/auth.service';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onRegisterClick: () => void; // Nueva prop para navegar
}

export const LoginForm = ({ onSuccess, onRegisterClick }: LoginFormProps) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await authService.login(formData);
      onSuccess(user);
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white p-8 rounded-lg shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
      {/* Logo y Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#6B9E8A] rounded flex items-center justify-center">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
          </div>
          <span className="text-xl font-semibold text-gray-700">ForeSight</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
      </div>

      {error && <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#6B9E8A] focus:border-[#6B9E8A] outline-none transition-all placeholder:text-gray-300 text-gray-800"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="mínimo 8 caracteres"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#6B9E8A] focus:border-[#6B9E8A] outline-none transition-all placeholder:text-gray-300 text-gray-800"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        <div className="text-left">
          <a href="#" className="text-xs text-[#6B9E8A] hover:underline">¿Olvidaste tu contraseña?</a>
        </div>

        <button 
          type="submit" 
          className="w-full py-2.5 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-semibold rounded-md transition-colors shadow-sm"
        >
          Iniciar Sesión
        </button>

        <div className="text-center pt-2">
          <button 
            type="button" 
            onClick={onRegisterClick}
            className="text-xs text-gray-500 hover:text-[#6B9E8A] transition-colors"
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
};
