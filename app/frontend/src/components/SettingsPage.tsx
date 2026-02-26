import { useState } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Bell, 
  Lock,
  Save,
  Camera
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
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    ticketUpdates: true,
    newComments: true,
    teamActivity: false,
  });
  const [saved, setSaved] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const handleSave = () => {
    onUpdateUser(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
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
                  {getInitials(user.firstName, user.lastName)}
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
                Nombre
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#202124] flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-[#5f6368]" />
                Apellido
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Tu apellido"
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

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#202124]">Rol</p>
              <p className="text-sm text-[#5f6368]">Tu rol en la plataforma</p>
            </div>
            <Badge variant={user.role === 'EMPRESA' ? 'default' : 'secondary'} className="text-sm">
              {user.role === 'EMPRESA' ? 'Administrador' : 'Empleado'}
            </Badge>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-[#1a73e8] hover:bg-[#1557b0]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saved ? 'Guardado!' : 'Guardar cambios'}
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
            {company.description && (
              <div>
                <label className="text-sm font-medium text-[#202124] mb-2 block">
                  Descripción
                </label>
                <p className="text-[#5f6368]">{company.description}</p>
              </div>
            )}
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
              <p className="text-sm text-[#5f6368]">Notificaciones cuando cambie el estado de un ticket</p>
            </div>
            <Switch 
              checked={notifications.ticketUpdates}
              onCheckedChange={(v) => setNotifications({ ...notifications, ticketUpdates: v })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#202124]">Nuevos comentarios</p>
              <p className="text-sm text-[#5f6368]">Notificaciones cuando alguien comente en tus tickets</p>
            </div>
            <Switch 
              checked={notifications.newComments}
              onCheckedChange={(v) => setNotifications({ ...notifications, newComments: v })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#202124]">Actividad del equipo</p>
              <p className="text-sm text-[#5f6368]">Notificaciones sobre nuevos miembros y cambios</p>
            </div>
            <Switch 
              checked={notifications.teamActivity}
              onCheckedChange={(v) => setNotifications({ ...notifications, teamActivity: v })}
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
          <div>
            <label className="text-sm font-medium text-[#202124] mb-2 block">
              Contraseña actual
            </label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#202124] mb-2 block">
                Nueva contraseña
              </label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#202124] mb-2 block">
                Confirmar contraseña
              </label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline">
              Cambiar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
