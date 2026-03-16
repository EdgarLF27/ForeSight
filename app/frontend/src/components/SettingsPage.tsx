import { useState } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Bell, 
  Lock,
  Save,
  Camera,
  MapPin,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import type { User as UserType, Company } from '@/types';

interface SettingsPageProps {
  user: UserType;
  company: Company | null;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export function SettingsPage({ user, company, onUpdateUser }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    ticketUpdates: true,
    newComments: true,
    teamActivity: false,
  });
  const [saved, setSaved] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    onUpdateUser(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 px-1">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil, preferencias y apariencia del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar for Settings Navigation (Optional, but makes it feel minimalist) */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-4">Preferencias</p>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary transition-colors">
              <User className="h-4 w-4" /> Mi Perfil
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" /> Notificaciones
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Lock className="h-4 w-4" /> Seguridad
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* Theme Section - New! */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
                >
                  <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold">Claro</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
                >
                  <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold">Oscuro</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
                >
                  <Monitor className={`h-5 w-5 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold">Sistema</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Section */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-muted shadow-xl transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:opacity-90 transition-all shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">Tu Fotografía</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG o GIF. Máximo 2MB.</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">
                    Nombre completo
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre"
                    className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">
                    Correo electrónico
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@empresa.com"
                    className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Rol y Área */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Rol asignado</p>
                  <Badge className="text-xs px-3 py-1 font-bold">
                    {(user.role as any)?.name || 'Sin rol'}
                  </Badge>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Área de Trabajo</p>
                  {(user as any).area ? (
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <MapPin className="h-4 w-4" />
                      {(user as any).area.name}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No asignada</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave}
                  className="bg-primary text-primary-foreground hover:opacity-90 h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saved ? '¡Guardado!' : 'Guardar cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between py-3 px-1 rounded-xl hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-bold text-foreground">Notificaciones por email</p>
                  <p className="text-sm text-muted-foreground">Recibe actualizaciones en tu correo</p>
                </div>
                <Switch 
                  checked={notifications.emailNotifications}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailNotifications: v })}
                />
              </div>
              <div className="flex items-center justify-between py-3 px-1 rounded-xl hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-bold text-foreground">Actualizaciones de tickets</p>
                  <p className="text-sm text-muted-foreground">Notificaciones sobre cambios de estado</p>
                </div>
                <Switch 
                  checked={notifications.ticketUpdates}
                  onCheckedChange={(v) => setNotifications({ ...notifications, ticketUpdates: v })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
