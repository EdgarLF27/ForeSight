import { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock,
  Save,
  Camera,
  MapPin,
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
import { Badge } from '@/components/ui/badge';
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
  
  // Estados de formularios
  const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // Estados de carga
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
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-1 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase italic">Configuración</h1>
        <p className="text-muted-foreground font-medium text-lg">Personaliza tu cuenta y seguridad del sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LADO IZQUIERDO: PERFIL Y TEMA */}
        <div className="lg:col-span-4 space-y-8">
          {/* Tarjeta de Avatar */}
          <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden group">
            <div className="h-24 bg-primary relative">
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <Avatar className="h-28 w-24 ring-8 ring-card shadow-2xl rounded-3xl overflow-hidden">
                      <AvatarImage src={getFileUrl(user.avatar) || ''} className="object-cover" />
                      <AvatarFallback className="bg-muted text-primary text-3xl font-black">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95 border-4 border-card"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
               </div>
            </div>
            <CardContent className="pt-16 pb-8 text-center space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{user.name}</h2>
                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase px-3 py-1">
                  {typeof user.role === 'object' ? (user.role as any).name : user.role}
                </Badge>
                {company && (
                  <Badge variant="outline" className="border-border text-muted-foreground font-bold text-[10px] uppercase px-3 py-1">
                    {company.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selector de Tema */}
          <Card className="border-none shadow-md bg-card rounded-3xl p-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Sun className="h-4 w-4" /> Apariencia
            </CardTitle>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Claro', icon: Sun },
                { id: 'dark', label: 'Oscuro', icon: Moon },
                { id: 'system', label: 'Auto', icon: Monitor }
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === t.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:bg-muted'}`}
                >
                  <t.icon className={`h-5 w-5 ${theme === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-[10px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* LADO DERECHO: FORMULARIOS */}
        <div className="lg:col-span-8 space-y-8">
          {/* Editar Datos Básicos */}
          <Card className="border-none shadow-md bg-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="text-lg font-bold uppercase tracking-tight flex items-center gap-3 text-foreground">
                <User className="h-5 w-5 text-primary" /> Perfil de Usuario
              </CardTitle>
              <CardDescription className="font-medium">Actualiza tu información pública y correo de contacto.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="h-12 pl-11 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={profileData.email} 
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="h-12 pl-11 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdatingProfile}
                  className="bg-primary text-primary-foreground h-12 px-10 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                >
                  {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cambio de Contraseña */}
          <Card className="border-none shadow-md bg-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="text-lg font-bold uppercase tracking-tight flex items-center gap-3 text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" /> Seguridad de Cuenta
              </CardTitle>
              <CardDescription className="font-medium">Cambia tu contraseña periódicamente para mantener tu cuenta segura.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Contraseña Actual</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="h-12 pl-11 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="h-12 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                  <Input 
                    type="password" 
                    placeholder="Repite la contraseña" 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="h-12 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isUpdatingPassword || !passwords.currentPassword || !passwords.newPassword}
                  variant="outline"
                  className="h-12 px-10 rounded-2xl border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase text-xs tracking-widest transition-all"
                >
                  {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
