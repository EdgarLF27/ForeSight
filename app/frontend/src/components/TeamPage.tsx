import { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  RefreshCw, 
  UserPlus,
  Mail,
  MoreVertical,
  Search,
  CheckCircle,
  Building2,
  ChevronRight,
  Loader2,
  Trash2,
  AlertTriangle
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
  DropdownMenuSeparator,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  onDeleteMember?: (userId: string) => Promise<boolean>; 
}

export function TeamPage({ 
  user, 
  company, 
  teamMembers, 
  onRegenerateCode, 
  onChangeRole,
  onChangeArea,
  onDeleteMember
}: TeamPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState(company.inviteCode);
  
  const { roles, loadData: loadRoles } = useRoles();
  const { areas, loadAreas } = useAreas();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [newAreaId, setNewAreaId] = useState<string>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAreas();
    loadRoles();
  }, [loadAreas, loadRoles]);

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Código copiado al portapapeles');
  };

  const handleRegenerateCode = async () => {
    const newCode = await onRegenerateCode();
    if (newCode) {
      setInviteCode(newCode);
      toast.success('Código de invitación actualizado');
    }
  };

  const handleOpenEditDialog = (member: User) => {
    setSelectedMember(member);
    const currentRoleId = typeof member.role === 'object' ? (member.role as any).id : '';
    setNewRoleId(currentRoleId || '');
    setNewAreaId((member as any).areaId || 'none');
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (member: User) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
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
      toast.success('Cambios guardados correctamente');
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember || !onDeleteMember) return;
    setIsDeleting(true);
    const success = await onDeleteMember(selectedMember.id);
    setIsDeleting(false);
    if (success) {
      toast.success('Miembro eliminado del equipo');
      setIsDeleteDialogOpen(false);
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
          <h1 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-foreground uppercase italic">Miembros del Equipo</h1>
          <p className="text-slate-500 dark:text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-300 dark:bg-white/20"></span> Gestiona los miembros y organiza tu empresa por áreas.
          </p>
        </div>
      </div>

      {/* Invite Code Card */}
      <Card className="bg-[#f8fafc] dark:bg-card border-none shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] dark:shadow-none rounded-[2.5rem] overflow-hidden relative group">
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-blue-600 dark:bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <CardContent className="p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-800 dark:text-foreground flex items-center gap-3 uppercase tracking-tight italic">
                <div className="p-2.5 bg-white dark:bg-primary/10 rounded-xl shadow-sm dark:shadow-none"><UserPlus className="h-5 w-5 text-blue-600 dark:text-primary" strokeWidth={3} /></div>
                Acceso Corporativo
              </h2>
              <p className="text-slate-500 dark:text-muted-foreground text-sm font-medium italic max-w-md leading-relaxed">
                Comparte este código para que nuevos empleados se unan automáticamente a <span className="text-blue-600 dark:text-primary font-black uppercase">{company.name}</span>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white dark:bg-muted/30 px-8 py-4 rounded-[1.5rem] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none group-hover:scale-105 transition-all duration-500">
                <code className="text-3xl font-mono font-black tracking-[0.4em] text-blue-600 dark:text-primary">
                  {inviteCode}
                </code>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" title="Copiar código" onClick={handleCopyCode} className="h-14 w-14 rounded-2xl border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none bg-white dark:bg-card hover:bg-blue-50 dark:hover:bg-primary/10 hover:text-blue-600 dark:hover:text-primary transition-all active:scale-95">
                  {copied ? <CheckCircle className="h-6 w-6 text-emerald-500" strokeWidth={3} /> : <Copy className="h-6 w-6" strokeWidth={3} />}
                </Button>
                <Button variant="outline" size="icon" title="Regenerar código" onClick={handleRegenerateCode} className="h-14 w-14 rounded-2xl border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none bg-white dark:bg-card hover:bg-blue-50 dark:hover:bg-primary/10 hover:text-blue-600 dark:hover:text-primary transition-all active:scale-95">
                  <RefreshCw className="h-6 w-6" strokeWidth={3} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="border-none shadow-[10px_10px_30px_#d1d9e6,-10px_-10px_30px_#ffffff] dark:shadow-2xl bg-[#f8fafc] dark:bg-card rounded-[2.5rem] overflow-hidden">
        <CardHeader className="px-10 py-8 border-b border-slate-100 dark:border-border bg-white/50 dark:bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <CardTitle className="text-xl font-black text-slate-800 dark:text-foreground uppercase tracking-tight italic">Directorio de Miembros</CardTitle>
            <div className="relative group w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-card border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-slate-800 dark:text-foreground transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 dark:divide-border/50">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-24 opacity-20"><Users className="h-12 w-12 mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-[0.5em]">Sector Seguro / Sin Miembros</p></div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-6 p-8 hover:bg-blue-50/30 dark:hover:bg-muted/30 transition-all group relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-600 dark:bg-primary opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <Avatar className="h-14 w-14 ring-4 ring-white dark:ring-white/5 shadow-lg flex-shrink-0 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform">
                    <AvatarImage src={getFileUrl(member.avatar) || ''} className="object-cover" />
                    <AvatarFallback className={`text-white text-base font-black italic ${isAdminMember(member) ? 'bg-emerald-600' : 'bg-blue-600 dark:bg-primary'}`}>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <p className="text-base font-black text-slate-800 dark:text-foreground truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">{member.name}</p>
                      {member.id === user.id && <Badge className="text-[8px] h-4 px-2 font-black uppercase bg-blue-100 dark:bg-primary/10 text-blue-600 dark:text-primary border-none shadow-sm">Tú</Badge>}
                      {member.id === company.ownerId && <Badge className="text-[8px] h-4 px-2 font-black uppercase bg-amber-100 text-amber-600 border-none shadow-sm">Propietario</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground flex items-center gap-2 font-medium italic"><Mail className="h-3 w-3 text-blue-400/40" />{member.email}</p>
                      {(member as any).area && <p className="text-[11px] text-blue-600 dark:text-primary flex items-center gap-2 font-black uppercase tracking-widest"><Building2 className="h-3 w-3 text-blue-400/40" />{(member as any).area.name}</p>}
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2 px-6">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.01] shadow-sm dark:shadow-none ${isAdminMember(member) ? 'text-emerald-600' : 'text-blue-600 dark:text-primary'}`}>
                      {getRoleName(member)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(user.role === 'EMPRESA' || isAdminMember(user)) && member.id !== company.ownerId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-white/5 transition-all"><MoreVertical className="h-4 w-4 text-slate-400" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl bg-white dark:bg-[#050505]/95 backdrop-blur-xl p-1.5">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(member)} className="rounded-xl py-3 cursor-pointer font-black text-[10px] uppercase flex items-center text-slate-600 dark:text-slate-300">
                            <RefreshCw className="h-4 w-4 mr-3 text-blue-600 dark:text-primary" /> Editar Miembro
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => handleOpenDeleteDialog(member)} 
                            className="rounded-xl py-3 cursor-pointer font-black text-[10px] uppercase text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-3" /> Eliminar Nodo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <ChevronRight className="h-5 w-5 text-slate-300/50 group-hover:text-blue-600 transition-all hidden sm:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[3rem] p-0 overflow-hidden bg-[#f8fafc] dark:bg-card border-none shadow-2xl">
          <div className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] p-10 text-white relative">
            <div className="absolute -right-6 -top-6 opacity-10 rotate-12"><Users size={120} /></div>
            <DialogTitle className="text-3xl font-extrabold uppercase italic tracking-tighter">Editar Perfil</DialogTitle>
            <DialogDescription className="text-white/80 mt-2 font-medium italic">Ajusta los privilegios y el sector asignado.</DialogDescription>
          </div>
          <div className="p-10 space-y-10">
            <div className="flex items-center gap-6 p-6 bg-white dark:bg-muted/30 rounded-[2rem] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none">
              <Avatar className="h-16 w-14 shadow-lg rounded-2xl overflow-hidden">
                <AvatarImage src={getFileUrl(selectedMember?.avatar) || ''} className="object-cover" />
                <AvatarFallback className="bg-blue-600 text-white text-lg font-black italic">{selectedMember ? getInitials(selectedMember.name) : ''}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-800 dark:text-foreground truncate uppercase italic tracking-tighter">{selectedMember?.name}</p>
                <p className="text-[11px] text-slate-400 font-medium italic truncate">{selectedMember?.email}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-foreground/40 uppercase tracking-widest ml-1 italic">Rango Operativo</label>
                <Select value={newRoleId} onValueChange={setNewRoleId}>
                  <SelectTrigger className="bg-white dark:bg-muted/30 border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl h-14 font-black text-xs uppercase text-slate-800 dark:text-white"><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-none bg-white dark:bg-[#050505] shadow-2xl">
                    {roles.map((role) => (<SelectItem key={role.id} value={role.id} className="font-black text-[10px] uppercase italic py-3">{role.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-foreground/40 uppercase tracking-widest ml-1 italic">Sector Asignado</label>
                <Select value={newAreaId} onValueChange={setNewAreaId}>
                  <SelectTrigger className="bg-white dark:bg-muted/30 border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none rounded-2xl h-14 font-black text-xs uppercase text-slate-800 dark:text-white"><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-none bg-white dark:bg-[#050505] shadow-2xl">
                    <SelectItem value="none" className="font-black text-[10px] uppercase italic py-3 text-slate-400">Sin área específica</SelectItem>
                    {areas.map((area) => (<SelectItem key={area.id} value={area.id} className="font-black text-[10px] uppercase italic py-3">{area.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 pt-0 flex gap-4">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-2xl h-14 px-8 font-black text-slate-400 dark:text-muted-foreground uppercase text-xs hover:text-slate-800 dark:hover:text-white transition-all">Cancelar</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white h-14 px-10 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-500/20 flex-1">
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Sincronizar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[3rem] border-none bg-[#f8fafc] dark:bg-card shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-2xl p-12">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-lg shadow-rose-500/10"><AlertTriangle className="h-8 w-8" strokeWidth={3} /></div>
            <AlertDialogTitle className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">¿Eliminar miembro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed italic mt-4">
              Esta acción eliminará a <span className="font-black text-slate-800 dark:text-white">{selectedMember?.name}</span> de la empresa. 
              Perderá el acceso instantáneo a <span className="text-blue-600 dark:text-primary font-black">{company.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-none bg-white dark:bg-transparent shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-800 dark:hover:text-white transition-all">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }} 
              disabled={isDeleting}
              className="bg-rose-600 text-white hover:opacity-90 h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20"
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
