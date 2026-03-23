import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme } from 'next-themes';
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

const DataLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-20 transition-opacity">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" className="text-blue-600 dark:text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {Array.from({ length: 12 }).map((_, i) => {
          const xPos = (i * 8.5) + Math.random() * 5;
          return (
            <motion.path
              key={i}
              d={`M ${xPos} -10 L ${xPos} 110`}
              stroke="currentColor"
              className="text-blue-600 dark:text-primary"
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
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  );
};

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
            className="absolute w-1 h-1 bg-blue-600 dark:bg-primary rounded-full"
            style={{ left: `${node.x}%`, top: `${node.y}%`, boxShadow: '0 0 10px hsl(var(--primary))' }}
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
  const { theme, setTheme } = useTheme();

  const handleGoogleClick = useGoogleLogin({
    use_fedcm: true,
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
    formState: { errors: errorsRegister, isSubmitting: isSubmittingRegister } 
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {}
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
    <div className="min-h-screen bg-background flex font-sans text-foreground selection:bg-blue-600/30 overflow-hidden relative transition-colors duration-300">
      <div className="fixed top-0 left-0 w-[500px] h-full bg-gradient-to-br from-blue-200/40 to-purple-200/30 blur-[120px] pointer-events-none z-0 opacity-100 dark:opacity-0 transition-opacity duration-500" />
      <DataLines />

      {/* Botón de Cambio de Tema */}
      <div className="absolute top-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-3 bg-white dark:bg-card/50 rounded-2xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none text-slate-400 hover:text-blue-600 dark:hover:text-primary transition-all border border-slate-100 dark:border-white/5"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </motion.button>
      </div>

      {onBack && (
        <motion.button 
          whileHover={{ x: -4, color: '#3b82f6' }}
          onClick={onBack}
          className="absolute top-8 left-8 z-50 p-3 bg-white dark:bg-card/50 rounded-2xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none text-slate-400 transition-all"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={3} />
        </motion.button>
      )}

      {/* Lado Izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center px-24 border-r border-slate-100 dark:border-white/5 bg-white/20 dark:bg-black/40">
        <PlexusEffect />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center"
        >
          <motion.h1 
            className="text-9xl font-black tracking-tighter mb-6 text-slate-800 dark:text-white relative italic drop-shadow-sm"
            animate={{ 
              opacity: [0.9, 1, 0.9],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            FORESIGHT
          </motion.h1>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-md mx-auto font-black uppercase tracking-[0.2em] italic opacity-60">
            Inteligencia en Infraestructura
          </p>
        </motion.div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <motion.div 
            className="absolute w-[1000px] h-[1000px] bg-blue-600/5 blur-[200px] rounded-full pointer-events-none" 
            animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          <div className="lg:hidden text-center mb-12">
            <h1 className="text-5xl font-black tracking-tighter text-slate-800 dark:text-white italic">FORESIGHT</h1>
          </div>

          <div className="flex p-1.5 bg-[#f8fafc] dark:bg-card/50 backdrop-blur-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl mb-10 relative">
            <motion.div 
              className="absolute inset-y-1.5 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] rounded-xl shadow-lg"
              initial={false}
              animate={{ x: activeTab === 'login' ? '0%' : '100%', width: '50%' }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
            />
            <button onClick={() => setActiveTab('login')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest z-10 transition-all duration-500 ${activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              Autenticación
            </button>
            <button onClick={() => setActiveTab('register')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest z-10 transition-all duration-500 ${activeTab === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              Registro
            </button>
          </div>

          <div className="bg-[#f8fafc] dark:bg-card/40 backdrop-blur-3xl border-none rounded-[3rem] p-10 lg:p-12 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 border border-white dark:border-white/5 rounded-[3rem] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div key="login" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} transition={{ duration: 0.5, ease: "anticipate" }}>
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter uppercase italic">Bienvenido</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Inicia sesión para continuar.</p>
                  </div>

                  {(generalError || successMessage) && (
                    <div className={`mb-8 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${generalError ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
                      {generalError || successMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Identificador Digital</label>
                      <input {...registerLogin('email')} type="email" placeholder="usuario@foresight.io" className="w-full bg-white dark:bg-white/[0.02] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder:text-slate-300 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                      {errorsLogin.email && <p className="text-rose-500 text-[9px] mt-1 ml-1 font-black uppercase tracking-tighter">{errorsLogin.email.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Clave de Encriptación</label>
                      <div className="relative">
                        <input {...registerLogin('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-white dark:bg-white/[0.02] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder:text-slate-300 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors">
                          {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={3} /> : <Eye className="h-5 w-5" strokeWidth={3} />}
                        </button>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmittingLogin} className="w-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 mt-8 shadow-xl shadow-blue-500/30 uppercase text-[10px] tracking-[0.2em] relative overflow-hidden">
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" animate={{ x: ["100%", "-100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                      {isSubmittingLogin ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : "Acceder al Sistema"}
                    </motion.button>
                  </form>

                  <div className="mt-10">
                    <div className="relative mb-8 text-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
                      <span className="relative bg-[#f8fafc] dark:bg-card px-4 text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Red Externa</span>
                    </div>
                    
                    <button type="button" onClick={() => handleGoogleClick()} className="w-full bg-white dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-white/5 border-none shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] dark:shadow-none rounded-2xl py-4 flex items-center justify-center gap-4 transition-all group active:scale-95">
                      <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white">Continuar con Google</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="register" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} transition={{ duration: 0.5, ease: "anticipate" }}>
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter uppercase italic">Registro</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Crea un nuevo nodo de acceso.</p>
                  </div>

                  <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <input {...registerRegister('name')} placeholder="Nombre y Apellidos" className="w-full bg-white dark:bg-white/[0.02] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder:text-slate-300 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                      {errorsRegister.name && <p className="text-rose-500 text-[9px] font-black uppercase italic ml-1">{errorsRegister.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <input {...registerRegister('email')} type="email" placeholder="Email Corporativo" className="w-full bg-white dark:bg-white/[0.02] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder:text-slate-300 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                      {errorsRegister.email && <p className="text-rose-500 text-[9px] font-black uppercase italic ml-1">{errorsRegister.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <input {...registerRegister('password')} type="password" placeholder="Clave de Acceso (mín. 8 caracteres)" className="w-full bg-white dark:bg-white/[0.02] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder:text-slate-300 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                      {errorsRegister.password && <p className="text-rose-500 text-[9px] font-black uppercase italic ml-1">{errorsRegister.password.message}</p>}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmittingRegister} className="w-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white font-black py-5 rounded-2xl mt-6 shadow-xl shadow-blue-500/30 uppercase text-[10px] tracking-[0.2em]">
                      {isSubmittingRegister ? <Loader2 className="h-5 w-5 animate-spin mx-auto" strokeWidth={3} /> : "Generar Credenciales"}
                    </motion.button>
                  </form>

                  <div className="mt-8">
                    <div className="relative mb-8 text-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
                      <span className="relative bg-[#f8fafc] dark:bg-card px-4 text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Red Externa</span>
                    </div>
                    
                    <button type="button" onClick={() => handleGoogleClick()} className="w-full bg-white dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-white/5 border-none shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none rounded-2xl py-4 flex items-center justify-center gap-4 transition-all group active:scale-95">
                      <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white">Continuar con Google</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-400 dark:text-slate-600 text-[9px] font-black tracking-[0.4em] uppercase italic">
              &copy; {new Date().getFullYear()} FORESIGHT OPS
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
