import { useState } from 'react';
import { 
  Users, 
  Copy, 
  RefreshCw, 
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Search,
  CheckCircle
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
import type { User, Company } from '@/types';

interface TeamPageProps {
  user: User;
  company: Company;
  teamMembers: User[];
  onRegenerateCode: () => Promise<string | null>;
  onChangeRole: (userId: string, roleId: string) => Promise<boolean>;
}

export function TeamPage({ user, company, teamMembers, onRegenerateCode, onChangeRole }: TeamPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState(company.inviteCode);
  
  // Estado para el cambio de rol
  const { roles } = useRoles();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleOpenRoleDialog = (member: User) => {
    setSelectedMember(member);
    const currentRoleId = typeof member.role === 'object' ? member.role.id : '';
    setNewRoleId(currentRoleId);
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedMember || !newRoleId) return;
    
    setIsSaving(true);
    const success = await onChangeRole(selectedMember.id, newRoleId);
    setIsSaving(false);
    
    if (success) {
      toast.success('Rol actualizado', {
        description: `El rol de ${selectedMember.name} ha sido actualizado.`
      });
      setIsRoleDialogOpen(false);
    } else {
      toast.error('Error', {
        description: 'No se pudo actualizar el rol.'
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isAdmin = (u: User) => {
    return typeof u.role === 'object' ? u.role?.name === 'Administrador' : u.role === 'EMPRESA';
  };

  const getRoleName = (u: User) => {
    if (typeof u.role === 'object') return u.role?.name || 'Sin rol';
    return u.role === 'EMPRESA' ? 'Administrador' : 'Empleado';
  };

  return (
    <div className="space-y-6">
      {/* ... (resto del componente Header, Stats, List) ... */}
      <div>
        <h1 className="text-2xl font-semibold text-[#202124]">Equipo</h1>
        <p className="text-[#5f6368]">Gestiona los miembros de {company.name}</p>
      </div>

      {/* Invite Code Card */}
      <Card className="bg-gradient-to-br from-[#1a73e8] to-[#1557b0] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Código de invitación</h2>
              <p className="text-white/80 text-sm">
                Comparte este código para que nuevos empleados se unan a tu empresa
              </p>
            </div>
            <div className="flex items-center gap-3">
              <code className="bg-white/20 backdrop-blur px-6 py-3 rounded-xl text-2xl font-mono tracking-widest">
                {inviteCode}
              </code>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopyCode}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRegenerateCode}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e8f0fe] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-[#1a73e8]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">{teamMembers.length}</p>
              <p className="text-sm text-[#5f6368]">Miembros totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e6f4ea] rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#34a853]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">
                {teamMembers.filter(m => isAdmin(m)).length}
              </p>
              <p className="text-sm text-[#5f6368]">Administradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#fef3e8] rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-[#f9ab00]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">
                {teamMembers.filter(m => !isAdmin(m)).length}
              </p>
              <p className="text-sm text-[#5f6368]">Empleados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-[#202124]">Miembros del equipo</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input
                placeholder="Buscar miembros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-[#dadce0] mx-auto mb-3" />
                <p className="text-[#5f6368]">No se encontraron miembros</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 p-4 border border-[#dadce0] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`text-white ${
                      isAdmin(member) 
                        ? 'bg-gradient-to-br from-[#34a853] to-[#2e7d32]' 
                        : 'bg-gradient-to-br from-[#1a73e8] to-[#1557b0]'
                    }`}>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#202124]">{member.name}</p>
                      {member.id === user.id && (
                        <Badge variant="secondary" className="text-xs">Tú</Badge>
                      )}
                      {member.id === company.ownerId && (
                        <Badge className="bg-[#f9ab00] text-white text-xs">Dueño</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#5f6368] flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                  </div>

                  <Badge variant={isAdmin(member) ? 'default' : 'secondary'}>
                    {getRoleName(member)}
                  </Badge>

                  {(user.role === 'EMPRESA' || isAdmin(user)) && member.id !== company.ownerId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenRoleDialog(member)}>
                          Cambiar rol
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[#ea4335]">
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

      {/* Role Selection Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar rol de usuario</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-slate-200 text-slate-600">
                  {selectedMember ? getInitials(selectedMember.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{selectedMember?.name}</p>
                <p className="text-xs text-slate-500">{selectedMember?.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar nuevo rol</label>
              <Select value={newRoleId} onValueChange={setNewRoleId}>
                <SelectTrigger>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRole} 
              disabled={isSaving || !newRoleId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
