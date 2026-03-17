import { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Loader2,
  Save,
  Lock,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getFileUrl } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { User as UserType, Company } from '@/types';

interface SettingsPageProps {
  user: UserType;
  company: Company | null;
  onUpdateUser: (updates: { name?: string; email?: string }) => Promise<boolean>;
}

export function SettingsPage({ user, company, onUpdateUser }: SettingsPageProps) {
  const { updatePassword, uploadAvatar } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const success = await onUpdateUser(profileData);
    if (success) toast.success('Perfil actualizado correctamente');
    setIsUpdatingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Las contraseñas no coinciden');
    }
    
    setIsUpdatingPassword(true);
    const success = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    
    if (success) {
      toast.success('Contraseña actualizada');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setIsUpdatingPassword(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const success = await uploadAvatar(file);
    if (success) toast.success('Foto de perfil actualizada');
    setIsUploadingAvatar(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleName = typeof user.role === 'object' ? (user.role as any).name : user.role;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500 px-1">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">Configuración</h1>
        <p className="text-muted-foreground font-medium">Gestiona tu identidad y seguridad en la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Lado Izquierdo: Perfil y Avatar */}
        <div className="md:col-span-4 space-y-8">
          <Card className="border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden group">
            <div className="h-24 bg-primary/10 relative">
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-[6px] border-card shadow-2xl rounded-3xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={handleAvatarClick}>
                      <AvatarImage src={getFileUrl(user.avatar) || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-card active:scale-95"
                    >
                      {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
               </div>
            </div>
            <CardContent className="pt-16 pb-10 px-8 text-center space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{roleName}</span>
                </div>
              </div>
              
              {company && (
                <div className="p-4 bg-muted/30 rounded-2xl border border-border border-dashed space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Organización</p>
                  <div className="flex items-center justify-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-foreground/40" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">{company.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lado Derecho: Formularios */}
        <div className="md:col-span-8 space-y-8">
          {/* Perfil */}
          <Card className="border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border p-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Información Personal</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Actualiza tus datos de contacto.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={profileData.name} 
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="pl-11 h-12 rounded-2xl bg-muted/30 border-border font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={profileData.email} 
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="pl-11 h-12 rounded-2xl bg-muted/30 border-border font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-primary text-primary-foreground h-12 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                    {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border p-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Seguridad</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Protege el acceso a tu cuenta.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Contraseña Actual</label>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="h-12 rounded-2xl bg-muted/30 border-border font-bold px-5"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                    <Input 
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="h-12 rounded-2xl bg-muted/30 border-border font-bold px-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                    <Input 
                      type="password"
                      placeholder="Repite la contraseña"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="h-12 rounded-2xl bg-muted/30 border-border font-bold px-5"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingPassword || !passwordData.newPassword} className="bg-amber-500 text-white h-12 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all">
                    {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    Cambiar Contraseña
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
