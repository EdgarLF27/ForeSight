import { useState } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Bell, 
  Lock,
  Save,
  Camera,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type { User as UserType, Company } from '@/types';

interface SettingsPageProps {
  user: UserType;
  company: Company | null;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export function SettingsPage({ user, company, onUpdateUser }: SettingsPageProps) {
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#202124]">Configuración</h1>
        <p className="text-[#5f6368]">Gestiona tu perfil y preferencias</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#202124] flex items-center gap-2">
            <User className="h-5 w-5 text-[#1a73e8]" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-[#1a73e8] to-[#1557b0] text-white text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a73e8] rounded-full flex items-center justify-center text-white hover:bg-[#1557b0] transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="font-medium text-[#202124]">Foto de perfil</p>
              <p className="text-sm text-[#5f6368]">JPG, PNG o GIF. Máximo 2MB.</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#202124] flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-[#5f6368]" />
                Nombre completo
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#202124] flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-[#5f6368]" />
                Correo electrónico
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@empresa.com"
              />
            </div>
          </div>

          {/* Rol y Área */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Rol asignado</p>
                <p className="text-sm text-[#5f6368]">Tus permisos actuales</p>
              </div>
              <Badge 
                variant={(user.role as any)?.name === 'Administrador' || (user.role as any)?.name === 'Dueño' ? 'default' : 'secondary'} 
                className="text-sm px-3 py-1"
              >
                {(user.role as any)?.name || 'Sin rol'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Área de Trabajo</p>
                <p className="text-sm text-[#5f6368]">Departamento vinculado</p>
              </div>
              <div className="flex items-center gap-2">
                {(user as any).area ? (
                  <div className="flex items-center gap-2 text-[#1a73e8] bg-[#e8f0fe] px-3 py-1 rounded-full text-sm font-medium">
                    <MapPin className="h-3 w-3" />
                    {(user as any).area.name}
                  </div>
                ) : (
                  <span className="text-xs text-[#5f6368] italic bg-gray-100 px-3 py-1 rounded-full">
                    No asignada
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-[#1a73e8] hover:bg-[#1557b0]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saved ? '¡Guardado!' : 'Guardar cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      {company && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#202124] flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#1a73e8]" />
              Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#202124] mb-2 block">
                  Nombre de la empresa
                </label>
                <Input value={company.name} disabled />
              </div>
              <div>
                <label className="text-sm font-medium text-[#202124] mb-2 block">
                  Código de invitación
                </label>
                <Input value={company.inviteCode} disabled className="font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#202124] flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#1a73e8]" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#202124]">Notificaciones por email</p>
              <p className="text-sm text-[#5f6368]">Recibe actualizaciones en tu correo</p>
            </div>
            <Switch 
              checked={notifications.emailNotifications}
              onCheckedChange={(v) => setNotifications({ ...notifications, emailNotifications: v })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#202124]">Actualizaciones de tickets</p>
              <p className="text-sm text-[#5f6368]">Notificaciones sobre cambios de estado</p>
            </div>
            <Switch 
              checked={notifications.ticketUpdates}
              onCheckedChange={(v) => setNotifications({ ...notifications, ticketUpdates: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#202124] flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#1a73e8]" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#202124] mb-2 block">
                Cambiar contraseña
              </label>
              <Button variant="outline" className="w-full sm:w-auto">
                Enviar enlace de restablecimiento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
