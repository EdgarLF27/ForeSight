import React, { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import type { Role } from '../hooks/useRoles';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Plus, Trash2, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription
} from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const RolesPage = () => {
  const { roles, permissions, loading, createRole, updateRole, deleteRole } = useRoles();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissionIds([]);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissionIds(role.permissions?.map(p => p.id) || []);
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return toast.error('El nombre del rol es obligatorio');

    setIsActionLoading(true);
    try {
      if (isAddDialogOpen) {
        await createRole({
          name: roleName,
          description: roleDescription,
          permissionIds: selectedPermissionIds
        });
        toast.success('Rol creado exitosamente');
        setIsAddDialogOpen(false);
      } else if (selectedRole) {
        await updateRole(selectedRole.id, {
          name: roleName,
          description: roleDescription,
          permissionIds: selectedPermissionIds
        });
        toast.success('Rol actualizado correctamente');
        setIsEditDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el rol');
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;
    setIsActionLoading(true);
    try {
      await deleteRole(selectedRole.id);
      toast.success('Rol eliminado permanentemente');
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar rol');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading && roles.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-1 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Shield className="h-6 w-6 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">Seguridad & Roles</h1>
          </div>
          <p className="text-muted-foreground font-medium">Controla los niveles de acceso y permisos de tu equipo.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:opacity-90 rounded-2xl shadow-lg shadow-primary/20 h-12 px-8 font-black uppercase text-xs tracking-widest">
          <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Nuevo Rol
        </Button>
      </div>

      {/* Grid de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card rounded-[2rem] overflow-hidden relative border border-border/50">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary border border-border/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <Shield className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(role)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(role)} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16} /></Button>
                </div>
              </div>
              <CardTitle className="text-xl font-black text-foreground uppercase tracking-tight mb-1">{role.name}</CardTitle>
              <CardDescription className="font-medium text-xs text-muted-foreground/70 uppercase tracking-widest">{(role.permissions?.length || 0)} Permisos Activos</CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-6 font-medium italic">
                "{role.description || 'Sin descripción técnica disponible.'}"
              </p>

              <div className="flex flex-wrap gap-2">
                {role.permissions?.slice(0, 3).map(p => (
                  <Badge key={p.id} variant="secondary" className="bg-muted text-muted-foreground border-none font-bold text-[9px] px-2 py-0.5 uppercase tracking-tighter">
                    {p.name.split(':')[1] || p.name}
                  </Badge>
                ))}
                {(role.permissions?.length || 0) > 3 && (
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black text-[9px] px-2 uppercase">
                    +{(role.permissions?.length || 0) - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo Añadir/Editar */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onOpenChange={(v) => {
          if (!v) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] rounded-[2.5rem] p-0 overflow-hidden border-border bg-card shadow-2xl flex flex-col mx-4 sm:mx-0">
          <div className="bg-slate-950 p-8 md:p-10 text-white relative flex-shrink-0">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
              <Shield size={140} strokeWidth={1} />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">{isAddDialogOpen ? 'Nueva Definición' : 'Ajustar Perfil'}</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">Configuración de políticas de acceso granular.</DialogDescription>
          </div>

          <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Etiqueta del Rol</label>
                  <Input
                    placeholder="Ej: Auditor Sénior"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-muted/30 border-border font-black uppercase text-sm px-5"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Descripción Breve</label>
                  <Input
                    placeholder="Resumen de responsabilidades"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-xs px-5"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">Matriz de Permisos</h3>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">{selectedPermissionIds.length} seleccionados</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 max-h-[300px] pr-4">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => handleTogglePermission(perm.id)}>
                      <Checkbox 
                        id={perm.id} 
                        checked={selectedPermissionIds.includes(perm.id)}
                        onCheckedChange={() => handleTogglePermission(perm.id)}
                        className="rounded-lg h-5 w-5 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all mt-0.5"
                      />
                      <div className="grid gap-1 leading-none">
                        <Label htmlFor={perm.id} className="text-xs font-black uppercase tracking-tight cursor-pointer group-hover:text-primary transition-colors">{perm.name}</Label>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">{perm.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-border mt-8 flex-col sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} className="rounded-2xl h-14 px-8 font-black text-muted-foreground uppercase text-xs tracking-widest">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isActionLoading} className="bg-primary text-primary-foreground hover:opacity-90 rounded-2xl h-14 px-12 font-black shadow-2xl shadow-primary/30 uppercase text-xs tracking-widest flex-1">
                  {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Sincronizar Acceso'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerta de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-border bg-card shadow-2xl p-10 mx-4">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mb-8 border border-destructive/20 shadow-lg shadow-destructive/10">
              <AlertCircle className="h-8 w-8" strokeWidth={3} />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">¿Revocar este Perfil?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-base leading-relaxed italic">
              Esta acción eliminará el rol <strong>{selectedRole?.name}</strong> permanentemente de la infraestructura. Los usuarios con este rol perderán sus privilegios de inmediato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4 flex-col sm:flex-row">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-border text-muted-foreground uppercase text-xs tracking-widest hover:bg-muted transition-all">Regresar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:opacity-90 rounded-2xl h-14 px-10 font-black shadow-xl shadow-destructive/20 uppercase text-xs tracking-widest flex-1"
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar Baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
