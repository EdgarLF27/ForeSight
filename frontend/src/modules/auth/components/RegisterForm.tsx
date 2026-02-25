import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../../services/auth.service';

// Esquema base: Reglas que aplican a cualquier usuario del sistema
const baseSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  phone: z.string().optional(),
});

// Esquema para Administradores: Hereda de base y añade campos de la organización
const adminSchema = baseSchema.extend({
  role: z.literal('COMPANY_ADMIN'),
  companyName: z.string().min(1, 'La razón social es obligatoria').max(100),
  companyTaxId: z.string()
    .min(1, 'El ID Fiscal es obligatorio')
    .regex(/^[0-9A-Z-]+$/, 'Formato de ID Fiscal inválido (solo números, letras y guiones)'),
  companyAddress: z.string().min(1, 'La dirección es obligatoria').max(200),
  companyPhone: z.string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^\+?[0-9\s-]{7,15}$/, 'Formato de teléfono inválido'),
  companyEmail: z.string().email('Email corporativo inválido'),
});

// Esquema para Empleados: Ahora solo requiere los datos base
const employeeSchema = baseSchema.extend({
  role: z.literal('EMPLOYEE'),
});

// Esquema para Técnicos: Añade el nivel de experiencia como campo obligatorio
const techSchema = baseSchema.extend({
  role: z.literal('SUPPORT_TECH'),
  experienceLevel: z.string().min(1, 'Selecciona tu nivel de experiencia'),
});

// Unión discriminada: Zod elige automáticamente qué esquema validar basándose en el campo 'role'
const registerSchema = z.discriminatedUnion('role', [
  adminSchema,
  employeeSchema,
  techSchema
]);

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onLoginClick: () => void;
}

export const RegisterForm = ({ onLoginClick }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'COMPANY_ADMIN' }
  });

  const currentRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register(data);
      alert("¡Registro exitoso! Ya puedes iniciar sesión.");
      onLoginClick();
    } catch (err) {
      alert("Error en el registro. Verifica los datos e intenta de nuevo.");
    }
  };

  const inputClass = "w-full px-3 py-2 border rounded-md outline-none transition-all text-gray-800 bg-white placeholder:text-gray-300";
  const errorInputClass = "border-red-500 focus:ring-1 focus:ring-red-500";
  const normalInputClass = "border-gray-300 focus:ring-1 focus:ring-[#6B9E8A] focus:border-[#6B9E8A]";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";
  const errorTextClass = "text-red-500 text-[10px] mt-0.5";

  const getFieldError = (fieldName: string) => {
    const error = (errors as any)[fieldName];
    return error ? <p className={errorTextClass}>{error.message}</p> : null;
  };

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Crear Cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Completa los datos para unirte a la plataforma</p>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
        {[
          { id: 'COMPANY_ADMIN', label: 'Nueva Empresa' },
          { id: 'EMPLOYEE', label: 'Empleado' },
          { id: 'SUPPORT_TECH', label: 'Técnico' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setValue('role' as any, tab.id as any)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              currentRole === tab.id ? 'bg-white text-[#6B9E8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-gray-50/50 p-4 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Información Personal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input {...register('firstName')} className={`${inputClass} ${errors.firstName ? errorInputClass : normalInputClass}`} />
              {errors.firstName && <p className={errorTextClass}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input {...register('lastName')} className={`${inputClass} ${errors.lastName ? errorInputClass : normalInputClass}`} />
              {errors.lastName && <p className={errorTextClass}>{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email Personal</label>
              <input {...register('email')} type="email" className={`${inputClass} ${errors.email ? errorInputClass : normalInputClass}`} />
              {errors.email && <p className={errorTextClass}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Teléfono de Contacto</label>
              <input {...register('phone')} className={`${inputClass} ${errors.phone ? errorInputClass : normalInputClass}`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Contraseña</label>
            <input {...register('password')} type="password" placeholder="Mínimo 8 caracteres" className={`${inputClass} ${errors.password ? errorInputClass : normalInputClass}`} />
            {errors.password && <p className={errorTextClass}>{errors.password.message}</p>}
          </div>
        </div>

        {currentRole === 'COMPANY_ADMIN' && (
          <div className="bg-[#6B9E8A]/5 p-4 rounded-lg space-y-4 border border-[#6B9E8A]/10">
            <h3 className="text-sm font-semibold text-[#5a8a77] border-b border-[#6B9E8A]/20 pb-2">Datos de la Organización</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Razón Social</label>
                <input {...register('companyName' as any)} className={`${inputClass} ${(errors as any).companyName ? errorInputClass : normalInputClass}`} />
                {getFieldError('companyName')}
              </div>
              <div>
                <label className={labelClass}>ID Fiscal (CUIT/RFC)</label>
                <input {...register('companyTaxId' as any)} className={`${inputClass} ${(errors as any).companyTaxId ? errorInputClass : normalInputClass}`} />
                {getFieldError('companyTaxId')}
              </div>
            </div>
            <div>
              <label className={labelClass}>Dirección Principal</label>
              <input {...register('companyAddress' as any)} className={`${inputClass} ${(errors as any).companyAddress ? errorInputClass : normalInputClass}`} />
              {getFieldError('companyAddress')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Teléfono Corporativo</label>
                <input {...register('companyPhone' as any)} className={`${inputClass} ${(errors as any).companyPhone ? errorInputClass : normalInputClass}`} />
                {getFieldError('companyPhone')}
              </div>
              <div>
                <label className={labelClass}>Email de Contacto</label>
                <input {...register('companyEmail' as any)} type="email" className={`${inputClass} ${(errors as any).companyEmail ? errorInputClass : normalInputClass}`} />
                {getFieldError('companyEmail')}
              </div>
            </div>
          </div>
        )}

        {currentRole === 'SUPPORT_TECH' && (
          <div className="bg-[#6B9E8A]/5 p-4 rounded-lg space-y-4 border border-[#6B9E8A]/10">
            <div>
              <label className={labelClass}>Nivel de Experiencia</label>
              <select {...register('experienceLevel' as any)} className={`${inputClass} ${(errors as any).experienceLevel ? errorInputClass : normalInputClass}`}>
                <option value="">-- Seleccionar Nivel --</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid-Level</option>
                <option value="SENIOR">Senior</option>
                <option value="EXPERT">Experto</option>
              </select>
              {getFieldError('experienceLevel')}
            </div>
          </div>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-bold rounded-md shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Procesando...' : 'Completar Registro'}
          </button>
          <button
            type="button"
            onClick={onLoginClick}
            className="w-full mt-4 text-xs text-gray-500 hover:text-[#6B9E8A] transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </button>
        </div>
      </form>
    </div>
  );
};