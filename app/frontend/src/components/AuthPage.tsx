import { useState } from 'react';
import { Ticket, Eye, EyeOff, Building2, User, ArrowRight, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserRole } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Esquemas de validación Zod
const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['EMPRESA', 'EMPLEADO'] as const),
  companyName: z.string().optional(),
}).refine((data) => {
  if (data.role === 'EMPRESA' && (!data.companyName || data.companyName.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "El nombre de la empresa es requerido",
  path: ["companyName"],
});

const joinSchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 caracteres').regex(/^[A-Z0-9]+$/, 'Formato de código inválido'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type JoinFormData = z.infer<typeof joinSchema>;

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string, role: UserRole, companyName?: string) => Promise<boolean>;
  onJoinCompany: (code: string) => Promise<boolean>;
  onBack?: () => void;
}

export function AuthPage({ onLogin, onRegister, onJoinCompany, onBack }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Forms
  const { 
    register: registerLogin, 
    handleSubmit: handleSubmitLogin, 
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const { 
    register: registerRegister, 
    handleSubmit: handleSubmitRegister, 
    setValue: setValueRegister,
    watch: watchRegister,
    formState: { errors: errorsRegister, isSubmitting: isSubmittingRegister } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'EMPLEADO',
      companyName: '',
    }
  });

  const { 
    register: registerJoin, 
    handleSubmit: handleSubmitJoin, 
    formState: { errors: errorsJoin, isSubmitting: isSubmittingJoin },
    reset: resetJoin
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema)
  });

  const selectedRole = watchRegister('role');

  const onLoginSubmit = async (data: LoginFormData) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      const success = await onLogin(data.email, data.password);
      if (!success) {
        setGeneralError('Correo o contraseña incorrectos');
      }
    } catch (err) {
      setGeneralError('Ocurrió un error al intentar iniciar sesión');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      const success = await onRegister(
        data.name,
        data.email,
        data.password,
        data.role,
        data.companyName
      );
      
      if (success) {
        setSuccessMessage('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        setActiveTab('login');
      } else {
        setGeneralError('El correo ya está registrado');
      }
    } catch (err) {
      setGeneralError('Ocurrió un error al registrar la cuenta');
    }
  };

  const onJoinSubmit = async (data: JoinFormData) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      const success = await onJoinCompany(data.code);
      if (success) {
        setSuccessMessage('¡Te has unido a la empresa exitosamente!');
        resetJoin();
      } else {
        setGeneralError('Código de invitación inválido');
      }
    } catch (err) {
      setGeneralError('Ocurrió un error al intentar unirte');
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#1a73e8] via-[#4285f4] to-[#34a853] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">TicketClass</h1>
            <p className="text-xl text-white/90 mb-6">
              Gestión de tickets simplificada para tu equipo
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Organiza tu equipo</p>
                <p className="text-sm text-white/70">Como en un aula virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Gestiona tickets fácilmente</p>
                <p className="text-sm text-white/70">Crea, asigna y resuelve</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Únete con un código</p>
                <p className="text-sm text-white/70">Rápido y sencillo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-[#f8f9fa]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a73e8] to-[#1557b0] rounded-xl flex items-center justify-center mr-3">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#202124]">TicketClass</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
              <TabsTrigger value="join">Unirse</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#202124]">Bienvenido de nuevo</h2>
                  <p className="text-[#5f6368] mt-1">Ingresa tus credenciales para continuar</p>
                </div>

                {generalError && activeTab === 'login' && (
                  <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm text-center">
                    {generalError}
                  </div>
                )}

                {successMessage && activeTab === 'login' && (
                  <div className="mb-4 p-3 bg-[#e6f4ea] text-[#34a853] rounded-lg text-sm text-center">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@empresa.com"
                      {...registerLogin('email')}
                      className={`mt-1 ${errorsLogin.email ? 'border-red-500' : ''}`}
                      disabled={isSubmittingLogin}
                    />
                    {errorsLogin.email && <p className="text-red-500 text-xs mt-1">{errorsLogin.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...registerLogin('password')}
                        className={errorsLogin.password ? 'border-red-500' : ''}
                        disabled={isSubmittingLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368]"
                        disabled={isSubmittingLogin}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errorsLogin.password && <p className="text-red-500 text-xs mt-1">{errorsLogin.password.message}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0]"
                    disabled={isSubmittingLogin}
                  >
                    {isSubmittingLogin ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        Iniciar sesión
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#202124]">Crear cuenta</h2>
                  <p className="text-[#5f6368] mt-1">Elige tu tipo de cuenta</p>
                </div>

                {generalError && activeTab === 'register' && (
                  <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm text-center">
                    {generalError}
                  </div>
                )}

                <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValueRegister('role', 'EMPRESA')}
                      disabled={isSubmittingRegister}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedRole === 'EMPRESA'
                          ? 'border-[#1a73e8] bg-[#e8f0fe]'
                          : 'border-[#dadce0] hover:border-[#1a73e8]'
                      }`}
                    >
                      <Building2 className={`h-6 w-6 mx-auto mb-2 ${
                        selectedRole === 'EMPRESA' ? 'text-[#1a73e8]' : 'text-[#5f6368]'
                      }`} />
                      <p className={`text-sm font-medium ${
                        selectedRole === 'EMPRESA' ? 'text-[#1a73e8]' : 'text-[#202124]'
                      }`}>Empresa</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setValueRegister('role', 'EMPLEADO')}
                      disabled={isSubmittingRegister}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedRole === 'EMPLEADO'
                          ? 'border-[#1a73e8] bg-[#e8f0fe]'
                          : 'border-[#dadce0] hover:border-[#1a73e8]'
                      }`}
                    >
                      <User className={`h-6 w-6 mx-auto mb-2 ${
                        selectedRole === 'EMPLEADO' ? 'text-[#1a73e8]' : 'text-[#5f6368]'
                      }`} />
                      <p className={`text-sm font-medium ${
                        selectedRole === 'EMPLEADO' ? 'text-[#1a73e8]' : 'text-[#202124]'
                      }`}>Empleado</p>
                    </button>
                  </div>

                  {selectedRole === 'EMPRESA' && (
                    <div>
                      <Label htmlFor="company-name">Nombre de la empresa</Label>
                      <Input
                        id="company-name"
                        placeholder="Mi Empresa SA"
                        {...registerRegister('companyName')}
                        className={`mt-1 ${errorsRegister.companyName ? 'border-red-500' : ''}`}
                        disabled={isSubmittingRegister}
                      />
                      {errorsRegister.companyName && <p className="text-red-500 text-xs mt-1">{errorsRegister.companyName.message}</p>}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <Input
                      id="register-name"
                      placeholder="Juan Pérez"
                      {...registerRegister('name')}
                      className={`mt-1 ${errorsRegister.name ? 'border-red-500' : ''}`}
                      disabled={isSubmittingRegister}
                    />
                     {errorsRegister.name && <p className="text-red-500 text-xs mt-1">{errorsRegister.name.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@empresa.com"
                      {...registerRegister('email')}
                      className={`mt-1 ${errorsRegister.email ? 'border-red-500' : ''}`}
                      disabled={isSubmittingRegister}
                    />
                    {errorsRegister.email && <p className="text-red-500 text-xs mt-1">{errorsRegister.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      {...registerRegister('password')}
                      className={`mt-1 ${errorsRegister.password ? 'border-red-500' : ''}`}
                      disabled={isSubmittingRegister}
                    />
                    {errorsRegister.password && <p className="text-red-500 text-xs mt-1">{errorsRegister.password.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0]"
                    disabled={isSubmittingRegister}
                  >
                    {isSubmittingRegister ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Crear cuenta
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Join Company Tab */}
            <TabsContent value="join">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#202124]">Unirse a empresa</h2>
                  <p className="text-[#5f6368] mt-1">Ingresa el código de invitación</p>
                </div>

                {generalError && activeTab === 'join' && (
                  <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm text-center">
                    {generalError}
                  </div>
                )}

                {successMessage && activeTab === 'join' && (
                  <div className="mb-4 p-3 bg-[#e6f4ea] text-[#34a853] rounded-lg text-sm text-center">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitJoin(onJoinSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="join-code">Código de invitación</Label>
                    <Input
                      id="join-code"
                      placeholder="ABC123"
                      {...registerJoin('code', {
                        onChange: (e) => {
                          e.target.value = e.target.value.toUpperCase();
                        }
                      })}
                      className={`mt-1 text-center text-2xl tracking-widest font-mono uppercase ${errorsJoin.code ? 'border-red-500' : ''}`}
                      maxLength={6}
                      disabled={isSubmittingJoin}
                    />
                    {errorsJoin.code && <p className="text-red-500 text-xs mt-1 text-center">{errorsJoin.code.message}</p>}
                    <p className="text-xs text-[#5f6368] mt-2 text-center">
                      Solicita el código a tu administrador
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#34a853] hover:bg-[#2e7d32]"
                    disabled={isSubmittingJoin}
                  >
                    {isSubmittingJoin ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uniéndote...
                      </>
                    ) : (
                      <>
                        Unirse a la empresa
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-[#f8f9fa] rounded-lg">
                  <p className="text-sm text-[#5f6368] text-center">
                    ¿No tienes un código?{' '}
                    <button 
                      onClick={() => setActiveTab('register')} 
                      className="text-[#1a73e8] font-medium hover:underline"
                      disabled={isSubmittingJoin}
                    >
                      Crea una cuenta
                    </button>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}