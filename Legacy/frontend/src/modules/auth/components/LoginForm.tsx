import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../../services/auth.service';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo es obligatorio')
    .email('Formato de correo inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onRegisterClick: () => void;
}

export const LoginForm = ({ onSuccess, onRegisterClick }: LoginFormProps) => {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      const user = await authService.login(data);
      onSuccess(user);
    } catch (err) {
      setServerError('Credenciales incorrectas o error de servidor');
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
      </div>

      {serverError && <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            {...register('email')}
            type="email"
            placeholder="correo@ejemplo.com"
            className={`w-full px-3 py-2 border rounded-md outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#6B9E8A]'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            {...register('password')}
            type="password"
            placeholder="mínimo 8 caracteres"
            className={`w-full px-3 py-2 border rounded-md outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#6B9E8A]'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-semibold rounded-md transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Cargando...' : 'Iniciar Sesión'}
        </button>

        <div className="text-center pt-2">
          <button type="button" onClick={onRegisterClick} className="text-xs text-gray-500 hover:text-[#6B9E8A]">
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
};
