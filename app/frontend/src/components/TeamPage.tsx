import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Building2, 
  MoreVertical, 
  RefreshCw,
  ChevronRight,
  Loader2,
  ShieldCheck,
  MapPin
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
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getFileUrl } from '@/services/api';
import { useRoles } from '@/hooks/useRoles';
import { useAreas } from '@/hooks/useAreas';
import type { User, Company } from '@/types';

interface TeamPageProps {
  user: User;
  company: Company;
  teamMembers: User[];
  onRegenerateCode: () => void;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const { roles, loading: rolesLoading } = useRoles();
  const { areas, isLoading: areasLoading } = useAreas();

  const [editData, setEditData] = useState({
    roleId: '',
    areaId: ''
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isAdminMember = (u: User) => {
    return u.role === 'EMPRESA' || (typeof u.role === 'object' && (u.role as any).name === 'Administrador');
  };

  const getRoleName = (u: User) => {
    if (u.role === 'EMPRESA') return 'Propietario';
    return typeof u.role === 'object' ? (u.role as any).name : u.role;
  };

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMembers, searchTerm]);

  const handleOpenEditDialog = (member: User) => {
    setSelectedMember(member);
    setEditData({
      roleId: typeof member.role === 'object' ? (member.role as any).id : '',
      areaId: member.areaId || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;
    setIsActionLoading(true);
    
    try {
      if (editData.roleId) await onChangeRole(selectedMember.id, editData.roleId);
      await onChangeArea(selectedMember.id, editData.areaId || null);
      
      toast.success('Miembro actualizado correctamente');
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error('Error al actualizar miembro');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-1 pb-10">
      {/* Header con Código */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">Mi Equipo</h1>
          </div>
          <p className="text-muted-foreground font-medium">Gestiona los colaboradores y accesos de tu empresa.</p>
        </div>

        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-3xl shadow-lg">
          <div className="px-4 border-r border-border">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Código de Invitación</p>
            <p className="text-xl font-mono font-black tracking-[0.4em] text-primary">{company.inviteCode}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onRegenerateCode} className="h-10 rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerar
          </Button>
        </div>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Buscar por nombre o correo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11 h-12 rounded-2xl border-border bg-card shadow-sm focus:ring-primary/20 font-medium"
        />
      </div>

      <Card className="border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border p-8 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Directorio de Colaboradores</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-muted text-muted-foreground font-black px-3 py-1 rounded-full text-[10px]">{filteredMembers.length} MIEMBROS</Badge>
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

      {/* Diálogo Editar Miembro */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden bg-card border-border shadow-2xl mx-4">
          <div className="bg-slate-950 p-8 md:p-10 text-white relative">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><ShieldCheck size={140} /></div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Gestionar Miembro</DialogTitle>
            <DialogDescription className="text-slate-500 mt-1 font-bold uppercase text-[10px] tracking-[0.2em]">Ajusta el rol y departamento del colaborador.</DialogDescription>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={getFileUrl(selectedMember?.avatar) || ''} className="object-cover" />
                <AvatarFallback className="bg-primary text-white font-bold">{selectedMember ? getInitials(selectedMember.name) : '??'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-black text-sm uppercase truncate leading-none">{selectedMember?.name}</p>
                <p className="text-[10px] text-muted-foreground font-bold truncate mt-1">{selectedMember?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Nivel de Acceso</label>
                <select 
                  value={editData.roleId} 
                  onChange={(e) => setEditData({...editData, roleId: e.target.value})}
                  disabled={rolesLoading}
                  className="w-full h-14 px-5 border border-border rounded-2xl bg-muted/30 font-black uppercase text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin className="h-3 w-3" /> Departamento / Área</label>
                <select 
                  value={editData.areaId} 
                  onChange={(e) => setEditData({...editData, areaId: e.target.value})}
                  disabled={areasLoading}
                  className="w-full h-14 px-5 border border-border rounded-2xl bg-muted/30 font-black uppercase text-xs appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  <option value="">Sin área asignada</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3 flex-col sm:flex-row">
              <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-2xl h-12 px-6 font-black text-muted-foreground uppercase text-xs tracking-widest">Cancelar</Button>
              <Button onClick={handleUpdateMember} disabled={isActionLoading} className="bg-primary text-primary-foreground h-12 px-10 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 flex-1">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Actualizar Miembro
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
