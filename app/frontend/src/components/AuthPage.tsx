import { useState } from 'react';
import { Ticket, Eye, EyeOff, Building2, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserRole } from '@/types';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (data: any) => Promise<boolean>;
  onJoinCompany: (code: string) => Promise<boolean>;
}

export function AuthPage({ onLogin, onRegister, onJoinCompany }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados de los formularios
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'EMPLEADO' as UserRole,
    companyName: '',
    companyTaxId: '',
    companyAddress: '',
  });
  const [joinCode, setJoinCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await onLogin(loginData.email, loginData.password);
    if (!ok) setError('Correo o contraseña incorrectos');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await onRegister(registerData);
    if (!ok) setError('Error al registrarse. Verifique los datos.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] font-sans p-4">
      
      {/* Logo superior igual al PDF */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 bg-[#6B9E8A] rounded-lg flex items-center justify-center shadow-sm">
          <Ticket className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-semibold text-gray-700 tracking-tight">ForeSight</span>
      </div>

      <div className="w-full max-w-[440px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 p-1 rounded-xl border border-gray-100">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#6B9E8A] data-[state=active]:shadow-sm">Entrar</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#6B9E8A] data-[state=active]:shadow-sm">Registro</TabsTrigger>
            <TabsTrigger value="join" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#6B9E8A] data-[state=active]:shadow-sm">Unirse</TabsTrigger>
          </TabsList>

          {/* LOGIN - COPIA EXACTA DEL BOCETO PDF */}
          <TabsContent value="login">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 lg:p-10">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Iniciar Sesión</h2>
              </div>

              {error && activeTab === 'login' && <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-lg text-sm text-center border border-red-100">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm">Correo Electrónico</Label>
                  <Input 
                    type="email" 
                    placeholder="correo@ejemplo.com" 
                    value={loginData.email} 
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="h-12 border-gray-200 focus:border-[#6B9E8A] focus:ring-[#6B9E8A]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm">Contraseña</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="mínimo 8 caracteres" 
                      value={loginData.password} 
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-12 border-gray-200 focus:border-[#6B9E8A] focus:ring-[#6B9E8A]/20 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="text-left">
                  <button type="button" className="text-xs text-[#6B9E8A] font-medium hover:underline">¿Olvidaste tu contraseña?</button>
                </div>

                <Button type="submit" className="w-full h-12 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-bold rounded-lg shadow-md shadow-[#6B9E8A]/20 transition-all text-base">
                  Iniciar Sesión
                </Button>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => setActiveTab('register')} className="text-sm text-gray-400 hover:text-[#6B9E8A] transition-colors">Crear cuenta</button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* REGISTRO - CON ROL Y CAMPOS NECESARIOS */}
          <TabsContent value="register">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 max-h-[75vh] overflow-y-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Crear Cuenta</h2>
              </div>

              {/* Selector de Rol (Empresa o Empleado) */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button type="button" onClick={() => setRegisterData({ ...registerData, role: 'EMPRESA' })} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${registerData.role === 'EMPRESA' ? 'border-[#6B9E8A] bg-[#6B9E8A]/5 text-[#6B9E8A]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <Building2 className="h-5 w-5" /> <span className="text-xs font-bold uppercase tracking-wider">Empresa</span>
                </button>
                <button type="button" onClick={() => setRegisterData({ ...registerData, role: 'EMPLEADO' })} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${registerData.role === 'EMPLEADO' ? 'border-[#6B9E8A] bg-[#6B9E8A]/5 text-[#6B9E8A]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <User className="h-5 w-5" /> <span className="text-xs font-bold uppercase tracking-wider">Empleado</span>
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs">Nombre</Label><Input value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Apellido</Label><Input value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Email Personal</Label><Input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Contraseña</Label><Input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} /></div>

                {registerData.role === 'EMPRESA' && (
                  <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[#6B9E8A] font-bold text-xs uppercase tracking-widest">Datos de Empresa</Label>
                    <Input placeholder="Razón Social" value={registerData.companyName} onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })} />
                    <Input placeholder="ID Fiscal (RFC)" value={registerData.companyTaxId} onChange={(e) => setRegisterData({ ...registerData, companyTaxId: e.target.value })} />
                    <Input placeholder="Dirección Fiscal" value={registerData.companyAddress} onChange={(e) => setRegisterData({ ...registerData, companyAddress: e.target.value })} />
                  </div>
                )}
                
                <Button type="submit" className="w-full h-12 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-bold rounded-lg transition-all mt-4">Crear cuenta</Button>
              </form>
            </div>
          </TabsContent>

          {/* UNIRSE */}
          <TabsContent value="join">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Unirse a Empresa</h2>
                <p className="text-sm text-gray-400 mt-1">Ingresa el código de tu equipo</p>
              </div>
              <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="text-center text-3xl font-mono h-16 tracking-[0.3em] mb-8 border-2" maxLength={6} placeholder="ABC123" />
              <Button onClick={() => onJoinCompany(joinCode)} className="w-full h-12 bg-[#34a853] hover:bg-[#2e7d32] text-white font-bold rounded-lg">Vincularme Ahora</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer igual al PDF */}
        <p className="text-center mt-12 text-xs text-gray-400">
          © 2026 ForeSight. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
