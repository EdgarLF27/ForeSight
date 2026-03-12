import { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  RefreshCw, 
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Search,
  CheckCircle,
  Building2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRoles } from '@/hooks/useRoles';
import { useAreas } from '@/hooks/useAreas';
import type { User, Company } from '@/types';

interface TeamPageProps {
  user: User;
  company: Company;
  teamMembers: User[];
  onRegenerateCode: () => Promise<string | null>;
  onChangeRole: (userId: string, roleId: string) => Promise<boolean>;
  onChangeArea: (userId: string, areaId: string | null) => Promise<boolean>;
}

export function TeamPage({ 
  user, 
  company, 
  teamMembers, 
  onRegenerateCode, 
  onChangeRole,
  onChangeArea 
}: TeamPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState(company.inviteCode);
  
  // Hooks
  const { roles } = useRoles();
  const { areas, loadAreas } = useAreas();
  
  // Estado para el modal de edición
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [newAreaId, setNewAreaId] = useState<string>('none');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCode = async () => {
    const newCode = await onRegenerateCode();
    if (newCode) {
      setInviteCode(newCode);
      toast.success('Código regenerado');
    }
  };

  const handleOpenEditDialog = (member: User) => {
    setSelectedMember(member);
    const currentRoleId = typeof member.role === 'object' ? member.role?.id : '';
    setNewRoleId(currentRoleId || '');
    setNewAreaId((member as any).areaId || 'none');
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedMember) return;
    
    setIsSaving(true);
    let success = true;

    // 1. Guardar Rol si cambió
    const currentRoleId = typeof selectedMember.role === 'object' ? selectedMember.role?.id : '';
    if (newRoleId && newRoleId !== currentRoleId) {
      const roleSuccess = await onChangeRole(selectedMember.id, newRoleId);
      if (!roleSuccess) success = false;
    }

    // 2. Guardar Área si cambió
    const currentAreaId = (selectedMember as any).areaId || 'none';
    if (newAreaId !== currentAreaId) {
      const areaIdToSave = newAreaId === 'none' ? null : newAreaId;
      const areaSuccess = await onChangeArea(selectedMember.id, areaIdToSave);
      if (!areaSuccess) success = false;
    }

    setIsSaving(false);
    
    if (success) {
      toast.success('Cambios guardados', {
        description: `El perfil de ${selectedMember.name} ha sido actualizado.`
      });
      setIsEditDialogOpen(false);
    } else {
      toast.error('Error', {
        description: 'Algunos cambios no se pudieron guardar.'
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isAdmin = (u: User) => {
    return typeof u.role === 'object' ? u.role?.name === 'Administrador' || u.role?.name === 'Dueño' : u.role === 'EMPRESA';
  };

  const getRoleName = (u: User) => {
    if (typeof u.role === 'object') return u.role?.name || 'Sin rol';
    return u.role === 'EMPRESA' ? 'Administrador' : 'Empleado';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Equipo</h1>
          <p className="text-[#5f6368]">Gestiona los miembros y organiza tu empresa por áreas</p>
        </div>
      </div>

      {/* Invite Code Card */}
      <Card className="bg-gradient-to-br from-[#1a73e8] to-[#1557b0] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Código de invitación
              </h2>
              <p className="text-white/80 text-sm">
                Comparte este código para que nuevos empleados se unan a {company.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <code className="bg-white/20 backdrop-blur px-6 py-3 rounded-xl text-2xl font-mono tracking-widest border border-white/20">
                {inviteCode}
              </code>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopyCode}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white border border-white/10"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRegenerateCode}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white border border-white/10"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e8f0fe] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-[#1a73e8]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">{teamMembers.length}</p>
              <p className="text-xs text-[#5f6368] uppercase font-bold tracking-wider">Miembros</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e6f4ea] rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#34a853]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">
                {teamMembers.filter(m => isAdmin(m)).length}
              </p>
              <p className="text-xs text-[#5f6368] uppercase font-bold tracking-wider">Administradores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#fef3e8] rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-[#f9ab00]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">{areas.length}</p>
              <p className="text-xs text-[#5f6368] uppercase font-bold tracking-wider">Áreas activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="border-[#dadce0] shadow-sm">
        <CardHeader className="pb-4 border-b border-[#f1f3f4]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-[#202124]">Miembros de la Organización</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-80 bg-[#f8f9fa] border-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#f1f3f4]">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#dadce0] mx-auto mb-3" />
                <p className="text-[#5f6368]">No se encontraron miembros registrados</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 p-4 hover:bg-[#f8f9fa] transition-colors group"
                >
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarFallback className={`text-white text-sm font-bold ${
                      isAdmin(member) 
                        ? 'bg-gradient-to-br from-[#34a853] to-[#2e7d32]' 
                        : 'bg-gradient-to-br from-[#1a73e8] to-[#1557b0]'
                    }`}>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#202124] truncate">{member.name}</p>
                      {member.id === user.id && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">Tú</Badge>
                      )}
                      {member.id === company.ownerId && (
                        <Badge className="bg-[#f9ab00] text-white text-[10px] h-4 px-1 border-none">Dueño</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <p className="text-xs text-[#5f6368] flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                      {(member as any).area && (
                        <p className="text-xs text-[#1a73e8] flex items-center gap-1 font-medium">
                          <Building2 className="h-3 w-3" />
                          {(member as any).area.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <Badge variant={isAdmin(member) ? 'default' : 'secondary'} className="font-medium">
                      {getRoleName(member)}
                    </Badge>
                  </div>

                  {(user.role === 'EMPRESA' || isAdmin(user)) && member.id !== company.ownerId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(member)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Editar miembro
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[#ea4335] focus:text-[#ea4335]">
                          Eliminar del equipo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Miembro del Equipo</DialogTitle>
            <DialogDescription>
              Ajusta el rol y el área de trabajo de {selectedMember?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Perfil resumido */}
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-xl border border-[#f1f3f4]">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#e8f0fe] text-[#1a73e8] text-xs font-bold">
                  {selectedMember ? getInitials(selectedMember.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#202124] truncate">{selectedMember?.name}</p>
                <p className="text-xs text-[#5f6368] truncate">{selectedMember?.email}</p>
              </div>
            </div>
            
            {/* Selector de Rol */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#1a73e8]" />
                Rol del Usuario
              </label>
              <Select value={newRoleId} onValueChange={setNewRoleId}>
                <SelectTrigger className="bg-white border-[#dadce0] rounded-lg">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} {role.isSystem ? '(Sistema)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[#5f6368]">
                Define qué permisos tendrá el usuario dentro de la plataforma.
              </p>
            </div>

            {/* Selector de Área */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#1a73e8]" />
                Área de Trabajo
              </label>
              <Select value={newAreaId} onValueChange={setNewAreaId}>
                <SelectTrigger className="bg-white border-[#dadce0] rounded-lg">
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin área asignada</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[#5f6368]">
                Vincular al usuario a un área ayuda a filtrar los tickets automáticamente.
              </p>
            </div>
          </div>
          <DialogFooter className="bg-[#f8f9fa] -mx-6 -mb-6 p-4 mt-2">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-[#5f6368]">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 rounded-lg shadow-sm"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
