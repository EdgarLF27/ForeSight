import { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock,
  Save,
  Camera,
  Moon,
  Sun,
  Monitor,
  ShieldCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { getFileUrl } from '@/services/api';
import { toast } from 'sonner';
import type { User as UserType, Company } from '@/types';

interface SettingsPageProps {
  user: UserType;
  company: Company | null;
  onUpdateUser: (updates: Partial<UserType>) => Promise<boolean>;
}

export function SettingsPage({ user, company, onUpdateUser }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const { updatePassword, uploadAvatar } = useAuth();
  
  const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    const success = await onUpdateUser(profileData);
    if (success) toast.success('Perfil actualizado correctamente');
    else toast.error('Error al actualizar perfil');
    setIsUpdatingProfile(false);
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Las contraseñas no coinciden');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Contraseña cambiada con éxito');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const success = await uploadAvatar(file);
    if (success) toast.success('Foto de perfil actualizada');
    else toast.error('Error al subir la imagen');
    setIsUploading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-1 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-foreground uppercase italic">Configuración</h1>
        <p className="text-slate-500 dark:text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-6 h-[1px] bg-slate-300 dark:bg-white/20"></span> Personaliza tu cuenta y seguridad del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LADO IZQUIERDO: PERFIL Y TEMA */}
        <div className="lg:col-span-4 space-y-8">
          {/* Tarjeta de Avatar */}
          <Card className="border-none shadow-[10px_10px_30px_#d1d9e6,-10px_-10px_30px_#ffffff] dark:shadow-2xl bg-[#f8fafc] dark:bg-card rounded-[3rem] overflow-hidden group">
            <div className="h-28 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] relative">
               <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <Avatar className="h-32 w-28 ring-[8px] ring-[#f8fafc] dark:ring-card shadow-2xl rounded-[2.5rem] overflow-hidden">
                      <AvatarImage src={getFileUrl(user.avatar) || ''} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 dark:bg-muted text-blue-600 dark:text-primary text-4xl font-black italic">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-12 h-12 bg-white dark:bg-primary text-blue-600 dark:text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all active:scale-95 border-4 border-[#f8fafc] dark:border-card"
                    >
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <Camera className="h-6 w-6" strokeWidth={3} />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
               </div>
            </div>
            <CardContent className="pt-20 pb-10 text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 dark:text-foreground uppercase tracking-tight italic">{user.name}</h2>
                <p className="text-xs text-slate-400 dark:text-muted-foreground font-bold italic">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary border-none font-black text-[9px] uppercase px-4 py-1.5 rounded-full shadow-sm">
                  {typeof user.role === 'object' ? (user.role as any).name : user.role}
                </div>
                {company && (
                  <div className="bg-white dark:bg-white/5 text-slate-400 font-black text-[9px] uppercase px-4 py-1.5 rounded-full shadow-sm border border-white dark:border-none">
                    {company.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selector de Tema */}
          <Card className="border-none shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] dark:shadow-none bg-[#f8fafc] dark:bg-card rounded-[2.5rem] p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground mb-8 flex items-center gap-3 italic">
              <Sun className="h-4 w-4 text-blue-600 dark:text-primary" strokeWidth={3} /> Apariencia del Sistema
            </CardTitle>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Claro', icon: Sun },
                { id: 'dark', label: 'Oscuro', icon: Moon },
                { id: 'system', label: 'Auto', icon: Monitor }
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-none transition-all ${theme === t.id ? 'bg-white dark:bg-primary/10 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none ring-2 ring-blue-600/20' : 'bg-transparent hover:bg-white dark:hover:bg-white/5 opacity-50'}`}
                >
                  <t.icon className={`h-6 w-6 ${theme === t.id ? 'text-blue-600 dark:text-primary' : 'text-slate-400'}`} strokeWidth={3} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${theme === t.id ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* LADO DERECHO: FORMULARIOS */}
        <div className="lg:col-span-8 space-y-10">
          {/* Editar Datos Básicos */}
          <Card className="border-none shadow-[10px_10px_30px_#d1d9e6,-10px_-10px_30px_#ffffff] dark:shadow-2xl bg-[#f8fafc] dark:bg-card rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-muted/30 border-b border-slate-100 dark:border-border p-10">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-800 dark:text-white italic">
                <User className="h-6 w-6 text-blue-600 dark:text-primary" strokeWidth={3} /> Perfil Operativo
              </CardTitle>
              <CardDescription className="font-medium text-slate-400 italic">Actualiza tu identidad en la red corporativa.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-foreground/60 uppercase tracking-widest ml-1 italic">Nombre de Usuario</label>
                  <Input 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-foreground/60 uppercase tracking-widest ml-1 italic">Enlace de Comunicación</label>
                  <Input 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdatingProfile}
                  className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white h-14 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
                >
                  {isUpdatingProfile ? <Loader2 className="h-5 w-5 animate-spin mx-auto" strokeWidth={3} /> : <><Save className="h-5 w-5 mr-3" strokeWidth={3} /> Sincronizar Datos</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cambio de Contraseña */}
          <Card className="border-none shadow-[10px_10px_30px_#d1d9e6,-10px_-10px_30px_#ffffff] dark:shadow-2xl bg-[#f8fafc] dark:bg-card rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-muted/30 border-b border-slate-100 dark:border-border p-10">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-800 dark:text-white italic">
                <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-primary" strokeWidth={3} /> Protocolos de Seguridad
              </CardTitle>
              <CardDescription className="font-medium text-slate-400 italic">Gestión de credenciales y encriptación de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-foreground/60 uppercase tracking-widest ml-1 italic">Clave de Acceso Actual</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-foreground/60 uppercase tracking-widest ml-1 italic">Nuevo Identificador</label>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-foreground/60 uppercase tracking-widest ml-1 italic">Confirmar Nueva Clave</label>
                  <Input 
                    type="password" 
                    placeholder="Repite el identificador" 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isUpdatingPassword || !passwords.currentPassword || !passwords.newPassword}
                  className="bg-white dark:bg-transparent border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none dark:border-2 dark:border-primary text-blue-600 dark:text-primary h-14 px-12 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-blue-50 dark:hover:bg-primary/10"
                >
                  {isUpdatingPassword ? <Loader2 className="h-5 w-5 animate-spin mx-auto" strokeWidth={3} /> : <><CheckCircle2 className="h-5 w-5 mr-3" strokeWidth={3} /> Actualizar Seguridad</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
