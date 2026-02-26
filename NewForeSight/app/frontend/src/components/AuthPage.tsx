import { useState } from 'react';
import { Ticket, Eye, EyeOff, Building2, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserRole } from '@/types';

interface AuthPageProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (name: string, email: string, password: string, role: UserRole, companyName?: string) => boolean;
  onJoinCompany: (code: string) => boolean;
}

export function AuthPage({ onLogin, onRegister, onJoinCompany }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLEADO' as UserRole,
    companyName: '',
  });
  const [joinCode, setJoinCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.email || !loginData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = onLogin(loginData.email, loginData.password);
    if (!success) {
      setError('Correo o contraseña incorrectos');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (registerData.role === 'EMPRESA' && !registerData.companyName) {
      setError('Por favor ingresa el nombre de tu empresa');
      return;
    }

    const success = onRegister(
      registerData.name,
      registerData.email,
      registerData.password,
      registerData.role,
      registerData.companyName
    );
    
    if (!success) {
      setError('El correo ya está registrado');
    }
  };

  const handleJoinCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!joinCode) {
      setError('Por favor ingresa el código de invitación');
      return;
    }

    const success = onJoinCompany(joinCode);
    if (success) {
      setSuccess('¡Te has unido a la empresa exitosamente!');
      setJoinCode('');
    } else {
      setError('Código de invitación inválido');
    }
  };

  return (
    <div className="min-h-screen flex">
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

                {error && activeTab === 'login' && (
                  <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@empresa.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0]"
                  >
                    Iniciar sesión
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-[#e8f0fe] rounded-lg">
                  <p className="text-xs text-[#1a73e8] font-medium">Cuentas de demo:</p>
                  <p className="text-xs text-[#5f6368] mt-1">Admin: admin@techsolutions.com / password123</p>
                  <p className="text-xs text-[#5f6368]">Empleado: juan@techsolutions.com / password123</p>
                </div>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#202124]">Crear cuenta</h2>
                  <p className="text-[#5f6368] mt-1">Elige tu tipo de cuenta</p>
                </div>

                {error && activeTab === 'register' && (
                  <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisterData({ ...registerData, role: 'EMPRESA' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        registerData.role === 'EMPRESA'
                          ? 'border-[#1a73e8] bg-[#e8f0fe]'
                          : 'border-[#dadce0] hover:border-[#1a73e8]'
                      }`}
                    >
                      <Building2 className={`h-6 w-6 mx-auto mb-2 ${
                        registerData.role === 'EMPRESA' ? 'text-[#1a73e8]' : 'text-[#5f6368]'
                      }`} />
                      <p className={`text-sm font-medium ${
                        registerData.role === 'EMPRESA' ? 'text-[#1a73e8]' : 'text-[#202124]'
                      }`}>Empresa</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setRegisterData({ ...registerData, role: 'EMPLEADO' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        registerData.role === 'EMPLEADO'
                          ? 'border-[#1a73e8] bg-[#e8f0fe]'
                          : 'border-[#dadce0] hover:border-[#1a73e8]'
                      }`}
                    >
                      <User className={`h-6 w-6 mx-auto mb-2 ${
                        registerData.role === 'EMPLEADO' ? 'text-[#1a73e8]' : 'text-[#5f6368]'
                      }`} />
                      <p className={`text-sm font-medium ${
                        registerData.role === 'EMPLEADO' ? 'text-[#1a73e8]' : 'text-[#202124]'
                      }`}>Empleado</p>
                    </button>
                  </div>

                  {registerData.role === 'EMPRESA' && (
                    <div>
                      <Label htmlFor="company-name">Nombre de la empresa</Label>
                      <Input
                        id="company-name"
                        placeholder="Mi Empresa SA"
                        value={registerData.companyName}
                        onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <Input
                      id="register-name"
                      placeholder="Juan Pérez"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@empresa.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0]"
                  >
                    Crear cuenta
                    <ArrowRight className="h-4 w-4 ml-2" />
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

                {error && activeTab === 'join' && (
                  <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-[#e6f4ea] text-[#34a853] rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleJoinCompany} className="space-y-4">
                  <div>
                    <Label htmlFor="join-code">Código de invitación</Label>
                    <Input
                      id="join-code"
                      placeholder="ABC123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="mt-1 text-center text-2xl tracking-widest font-mono uppercase"
                      maxLength={6}
                    />
                    <p className="text-xs text-[#5f6368] mt-2 text-center">
                      Solicita el código a tu administrador
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#34a853] hover:bg-[#2e7d32]"
                  >
                    Unirse a la empresa
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-[#f8f9fa] rounded-lg">
                  <p className="text-sm text-[#5f6368] text-center">
                    ¿No tienes un código?{' '}
                    <button 
                      onClick={() => setActiveTab('register')} 
                      className="text-[#1a73e8] font-medium hover:underline"
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
