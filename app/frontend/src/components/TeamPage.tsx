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
  MapPin,
  ChevronRight,
  Loader2,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { getFileUrl } from '@/services/api';
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
  
  const { roles } = useRoles();
  const { areas, loadAreas } = useAreas();
  
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
    const currentRoleId = typeof member.role === 'object' ? (member.role as any).id : '';
    setNewRoleId(currentRoleId || '');
    setNewAreaId((member as any).areaId || 'none');
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedMember) return;
    setIsSaving(true);
    let success = true;

    const currentRoleId = typeof selectedMember.role === 'object' ? (selectedMember.role as any).id : '';
    if (newRoleId && newRoleId !== currentRoleId) {
      const roleSuccess = await onChangeRole(selectedMember.id, newRoleId);
      if (!roleSuccess) success = false;
    }

    const currentAreaId = (selectedMember as any).areaId || 'none';
    if (newAreaId !== currentAreaId) {
      const areaIdToSave = newAreaId === 'none' ? null : newAreaId;
      const areaSuccess = await onChangeArea(selectedMember.id, areaIdToSave);
      if (!areaSuccess) success = false;
    }

    setIsSaving(false);
    if (success) {
      toast.success('Cambios guardados');
      setIsEditDialogOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isAdminMember = (u: User) => {
    return typeof u.role === 'object' ? (u.role as any).name === 'Administrador' || (u.role as any).name === 'Dueño' : u.role === 'EMPRESA';
  };

  const getRoleName = (u: User) => {
    if (typeof u.role === 'object') return (u.role as any).name || 'Sin rol';
    return u.role === 'EMPRESA' ? 'Administrador' : 'Empleado';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Users className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Equipo</h1>
          </div>
          <p className="text-muted-foreground font-medium">Gestiona los miembros y organiza tu empresa por áreas.</p>
        </div>
      </div>

      {/* Invite Code Card */}
      <Card className="bg-card border-none shadow-md rounded-3xl overflow-hidden relative group">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary" />
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5 uppercase tracking-tight">
                <UserPlus className="h-5 w-5 text-primary" strokeWidth={2} />
                Invitación de Equipo
              </h2>
              <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
                Comparte este código para que nuevos empleados se unan automáticamente a <span className="text-primary font-bold">{company.name}</span>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted/50 px-6 py-3 rounded-2xl border border-border group-hover:border-primary/30 transition-colors">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] text-primary">
                  {inviteCode}
                </code>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopyCode} className="h-12 w-12 rounded-xl border-border bg-card hover:bg-primary/10 hover:text-primary transition-all">
                  {copied ? <CheckCircle className="h-5 w-5 text-emerald-500" strokeWidth={2} /> : <Copy className="h-5 w-5" strokeWidth={2} />}
                </Button>
                <Button variant="outline" size="icon" onClick={handleRegenerateCode} className="h-12 w-12 rounded-xl border-border bg-card hover:bg-primary/10 hover:text-primary transition-all">
                  <RefreshCw className="h-5 w-5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="border-none shadow-md bg-card rounded-3xl overflow-hidden">
        <CardHeader className="px-8 py-6 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <CardTitle className="text-lg font-bold text-foreground uppercase tracking-tight">Directorio de Miembros</CardTitle>
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-card border-border rounded-xl focus:ring-primary/20 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-20"><Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No hay miembros</p></div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-5 p-6 hover:bg-muted/30 transition-all group relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="h-12 w-12 ring-2 ring-border shadow-sm flex-shrink-0">
                    <AvatarImage src={getFileUrl(member.avatar) || ''} className="object-cover" />
                    <AvatarFallback className={`text-white text-sm font-bold ${isAdminMember(member) ? 'bg-emerald-600' : 'bg-primary'}`}>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors uppercase tracking-tight">{member.name}</p>
                      {member.id === user.id && <Badge className="text-[9px] h-4 px-1.5 font-bold uppercase bg-primary/10 text-primary border-none">Tú</Badge>}
                      {member.id === company.ownerId && <Badge variant="warning" className="text-[9px] h-4 px-1.5 font-bold uppercase">Dueño</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold"><Mail className="h-3 w-3 text-primary/40" />{member.email}</p>
                      {(member as any).area && <p className="text-xs text-primary flex items-center gap-1.5 font-bold"><Building2 className="h-3 w-3" />{(member as any).area.name}</p>}
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-1 px-4">
                    <Badge variant={isAdminMember(member) ? 'success' : 'secondary'} className="font-bold text-[10px] px-2.5 py-0.5 rounded-lg uppercase">{getRoleName(member)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {(user.role === 'EMPRESA' || isAdminMember(user)) && member.id !== company.ownerId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 bg-card border-border shadow-xl">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(member)} className="rounded-lg py-2 cursor-pointer font-bold text-xs uppercase"><RefreshCw className="h-4 w-4 mr-2.5" /> Editar miembro</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all hidden sm:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden bg-card border-border shadow-2xl">
          <div className="bg-primary p-8 text-primary-foreground relative">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><Users size={100} /></div>
            <DialogTitle className="text-2xl font-bold uppercase">Editar Miembro</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">Ajusta el perfil de este colaborador.</DialogDescription>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
              <Avatar className="h-12 w-12 shadow-sm ring-2 ring-card">
                <AvatarImage src={getFileUrl(selectedMember?.avatar) || ''} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{selectedMember ? getInitials(selectedMember.name) : ''}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate uppercase">{selectedMember?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedMember?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-widest ml-1">Rol</label>
                <Select value={newRoleId} onValueChange={setNewRoleId}>
                  <SelectTrigger className="bg-muted/30 border-border rounded-xl h-11 font-bold text-xs uppercase"><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-card shadow-xl">
                    {roles.map((role) => (<SelectItem key={role.id} value={role.id} className="font-bold text-[10px] uppercase">{role.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-widest ml-1">Área</label>
                <Select value={newAreaId} onValueChange={setNewAreaId}>
                  <SelectTrigger className="bg-muted/30 border-border rounded-xl h-11 font-bold text-xs uppercase"><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-card shadow-xl">
                    <SelectItem value="none" className="font-bold text-[10px] uppercase">Sin área</SelectItem>
                    {areas.map((area) => (<SelectItem key={area.id} value={area.id} className="font-bold text-[10px] uppercase">{area.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-3">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold text-muted-foreground uppercase text-xs">Cancelar</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-primary text-primary-foreground h-11 px-8 rounded-xl font-bold uppercase text-xs shadow-lg shadow-primary/20">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatSummaryCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-md bg-card hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-muted/50 border border-border group-hover:bg-primary/10 transition-colors">{icon}</div>
        <div><p className="text-3xl font-bold text-foreground tracking-tight">{value}</p><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{title}</p></div>
      </CardContent>
    </Card>
  );
}
