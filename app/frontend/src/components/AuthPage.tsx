import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Building2, 
  User, 
  Loader2, 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserRole } from '@/types';

// Esquemas de validación
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

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string, role: UserRole, companyName?: string) => Promise<boolean>;
  onJoinCompany: (code: string) => Promise<boolean>;
}

// Componente: Red de Líneas de Datos Tecnológicas
const DataLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#00f2ff" strokeWidth="0.5" strokeOpacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {Array.from({ length: 12 }).map((_, i) => {
          const xPos = (i * 8.5) + Math.random() * 5;
          return (
            <motion.path
              key={i}
              d={`M ${xPos} -10 L ${xPos} 110`}
              stroke="#00f2ff"
              strokeWidth="0.5"
              strokeDasharray="10, 20"
              initial={{ pathLength: 0, opacity: 0, pathOffset: 0 }}
              animate={{ 
                pathLength: [0, 0.4, 0],
                opacity: [0, 0.4, 0],
                pathOffset: [0, 1.5]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
    </div>
  );
};

// Componente: Animación de Red de Nodos (Plexus)
const PlexusEffect = () => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
  
    return (
      <div className="absolute inset-0 opacity-40">
        {nodes.map(node => (
          <motion.div
            key={node.id}
            className="absolute w-1 h-1 bg-[#00f2ff] rounded-full"
            style={{ left: `${node.x}%`, top: `${node.y}%`, boxShadow: '0 0 10px #00f2ff' }}
            animate={{
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

export function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { 
    register: registerLogin, 
    handleSubmit: handleSubmitLogin, 
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin } 
  } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  const { 
    register: registerRegister, 
    handleSubmit: handleSubmitRegister, 
    setValue: setValueRegister,
    watch: watchRegister,
    formState: { isSubmitting: isSubmittingRegister } 
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'EMPLEADO', companyName: '' }
  });

  const selectedRole = watchRegister('role');

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      const success = await onLogin(data.email, data.password);
      if (!success) setGeneralError('Credenciales inválidas');
    } catch (err) {
      setGeneralError('Error de conexión con el servidor');
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      const success = await onRegister(data.name, data.email, data.password, data.role, data.companyName);
      if (success) {
        setSuccessMessage('Registro completado con éxito');
        setTimeout(() => setActiveTab('login'), 1500);
      } else {
        setGeneralError('El correo ya está en uso');
      }
    } catch (err) {
      setGeneralError('Error al crear la cuenta');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex font-sans text-slate-200 selection:bg-[#00f2ff]/30 overflow-hidden relative">
      <DataLines />

      {/* Lado Izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center px-20 border-r border-white/5 bg-black/40">
        <PlexusEffect />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center"
        >
          <motion.h1 
            className="text-8xl font-black tracking-tighter mb-4 text-white relative"
            animate={{ 
              opacity: [0.9, 1, 0.9],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            FORESIGHT
          </motion.h1>
          
          <p className="text-lg text-slate-400 max-w-md mx-auto font-light tracking-wide">
            LA PLATAFORMA DE INTELIGENCIA PARA LA INFRAESTRUCTURA DEL MAÑANA
          </p>
        </motion.div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div 
            className="absolute w-[800px] h-[800px] bg-[#0070f3]/10 blur-[180px] rounded-full pointer-events-none" 
            animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">FORESIGHT</h1>
          </div>

          <div className="flex p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-8 relative">
            <motion.div 
              className="absolute inset-y-1 bg-[#0070f3] rounded-xl shadow-[0_0_25px_rgba(0,112,243,0.6)]"
              initial={false}
              animate={{ x: activeTab === 'login' ? '0%' : '100%', width: '50%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button onClick={() => setActiveTab('login')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest z-10 transition-colors duration-300 ${activeTab === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              Iniciar Sesión
            </button>
            <button onClick={() => setActiveTab('register')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest z-10 transition-colors duration-300 ${activeTab === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              Registrarse
            </button>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border-[0.5px] border-white/20 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none group-hover:border-[#00f2ff]/20 transition-colors duration-700" />
            
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Acceso Seguro</h2>
                    <p className="text-slate-400 text-sm">Autenticación de nivel corporativo.</p>
                  </div>

                  {(generalError || successMessage) && (
                    <div className={`mb-6 p-4 border rounded-xl text-sm text-center ${generalError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                      {generalError || successMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-5">
                    <div className="group/input">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block group-focus-within/input:text-[#00f2ff]">Email-Correo</label>
                      <input {...registerLogin('email')} type="email" placeholder="usuario@foresight.io" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 outline-none focus:border-[#00f2ff] focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all duration-500" />
                      {errorsLogin.email && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold">{errorsLogin.email.message}</p>}
                    </div>

                    <div className="group/input">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block group-focus-within/input:text-[#00f2ff]">Contraseña</label>
                      <div className="relative">
                        <input {...registerLogin('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 outline-none focus:border-[#00f2ff] transition-all duration-500" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00f2ff]">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(0, 242, 255, 0.4)", backgroundColor: "#ffffff" }} whileTap={{ scale: 0.99 }} disabled={isSubmittingLogin} className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 mt-6 relative overflow-hidden">
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-full" animate={{ x: ["100%", "-100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }} />
                      {isSubmittingLogin ? <Loader2 className="h-5 w-5 animate-spin" /> : "ACCEDER AL SISTEMA"}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                  <div className="mb-6 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-white mb-1">Registro</h2>
                    <p className="text-slate-400 text-sm">Crea una nueva identidad en Foresight.</p>
                  </div>

                  <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setValueRegister('role', 'EMPRESA')} className={`py-4 rounded-xl border transition-all duration-500 flex flex-col items-center gap-1 ${ selectedRole === 'EMPRESA' ? 'bg-[#0070f3]/20 border-[#0070f3] text-white' : 'bg-white/5 border-white/10 text-slate-500' }`}>
                        <Building2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Empresa</span>
                      </button>
                      <button type="button" onClick={() => { setValueRegister('role', 'EMPLEADO'); setValueRegister('companyName', ''); }} className={`py-4 rounded-xl border transition-all duration-500 flex flex-col items-center gap-1 ${ selectedRole === 'EMPLEADO' ? 'bg-[#0070f3]/20 border-[#0070f3] text-white' : 'bg-white/5 border-white/10 text-slate-500' }`}>
                        <User className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Empleado</span>
                      </button>
                    </div>

                    {selectedRole === 'EMPRESA' && (
                      <input {...registerRegister('companyName')} placeholder="Nombre de la Compañía" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff]" />
                    )}

                    <input {...registerRegister('name')} placeholder="Nombre y Apellidos" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff]" />
                    <input {...registerRegister('email')} type="email" placeholder="Email Corporativo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff]" />
                    <input {...registerRegister('password')} type="password" placeholder="Contraseña Segura" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff]" />

                    <motion.button whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(0, 112, 243, 0.5)" }} whileTap={{ scale: 0.99 }} disabled={isSubmittingRegister} className="w-full bg-[#0070f3] text-white font-black py-4 rounded-xl mt-4">
                      {isSubmittingRegister ? <Loader2 className="h-5 w-5 animate-spin" /> : "GENERAR CREDENCIALES"}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase">
              &copy; {new Date().getFullYear()} 
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
