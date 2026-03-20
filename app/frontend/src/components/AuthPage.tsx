import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Building2, 
  User, 
  ArrowRight, 
  Loader2, 
  ArrowLeft
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
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
});

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string, role: UserRole, companyName?: string) => Promise<boolean>;
  onJoinCompany: (code: string) => Promise<boolean>;
  onGoogleLogin?: (token: string) => Promise<boolean>;
  onBack?: () => void;
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

export function AuthPage({ onLogin, onRegister, onGoogleLogin, onBack }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (onGoogleLogin) {
        const success = await onGoogleLogin(tokenResponse.access_token);
        if (!success) setGeneralError('Fallo en el inicio de sesión con Google');
      }
    },
    onError: () => setGeneralError('Error al conectar con Google'),
  });

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
    formState: { errors: errorsRegister, isSubmitting: isSubmittingRegister } 
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'EMPLEADO', companyName: '' }
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      const result = await onLogin(data.email, data.password) as any;
      if (result.success === false) {
        setGeneralError(result.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setGeneralError('Error inesperado en el sistema');
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setGeneralError('');
    setSuccessMessage('');
    try {
      // Enviamos el registro simplificado
      const success = await onRegister(data.name, data.email, data.password, 'EMPLEADO'); 
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

      {onBack && (
        <motion.button 
          whileHover={{ x: -4, color: '#00f2ff' }}
          onClick={onBack}
          className="absolute top-6 left-6 z-50 p-2 text-slate-400 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </motion.button>
      )}

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
            className="text-8xl font-black tracking-tighter mb-4 text-white relative drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]"
            animate={{ 
              opacity: [0.9, 1, 0.9],
              scale: [1, 1.01, 1],
              dropShadow: ["0 0 10px rgba(0,242,255,0.3)", "0 0 25px rgba(0,242,255,0.6)", "0 0 10px rgba(0,242,255,0.3)"]
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

                  <div className="mt-8">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-500"><span className="bg-[#000000] px-4">O continuar con</span></div>
                    </div>
                    
                    <button type="button" onClick={() => handleGoogleClick()} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3.5 flex items-center justify-center gap-3 transition-all group/google">
                      <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Continuar con Google</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                  <div className="mb-6 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-white mb-1">Registro</h2>
                    <p className="text-slate-400 text-sm">Crea una nueva identidad en Foresight.</p>
                  </div>

                  <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="space-y-4">
                    <div className="group/input">
                      <input {...registerRegister('name')} placeholder="Nombre y Apellidos" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff] transition-all" />
                      {errorsRegister.name && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold italic">{errorsRegister.name.message}</p>}
                    </div>

                    <div className="group/input">
                      <input {...registerRegister('email')} type="email" placeholder="Email Corporativo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff] transition-all" />
                      {errorsRegister.email && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold italic">{errorsRegister.email.message}</p>}
                    </div>

                    <div className="group/input">
                      <input {...registerRegister('password')} type="password" placeholder="Contraseña Segura (mín. 8 caracteres)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00f2ff] transition-all" />
                      {errorsRegister.password && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold italic">{errorsRegister.password.message}</p>}
                    </div>

                    <motion.button whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(0, 112, 243, 0.5)" }} whileTap={{ scale: 0.99 }} disabled={isSubmittingRegister} className="w-full bg-[#0070f3] text-white font-black py-4 rounded-xl mt-4">
                      {isSubmittingRegister ? <Loader2 className="h-5 w-5 animate-spin" /> : "GENERAR CREDENCIALES"}
                    </motion.button>
                  </form>

                  <div className="mt-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-500"><span className="bg-black/20 backdrop-blur-md px-4">O continuar con</span></div>
                    </div>
                    
                    <button type="button" onClick={() => handleGoogleClick()} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3.5 flex items-center justify-center gap-3 transition-all group/google">
                      <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Continuar con Google</span>
                    </button>
                  </div>
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
