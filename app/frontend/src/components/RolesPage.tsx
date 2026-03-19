import React, { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import type { Role } from '../hooks/useRoles';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Plus, Trash2, Edit2, XCircle, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
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
} from "./ui/alert-dialog";

export const RolesPage: React.FC = () => {
  const { roles, permissions, loading, error, createRole, updateRole, deleteRole } = useRoles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[]
  });

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissionIds: [] });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.id)
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        toast.success('Rol actualizado');
      } else {
        await createRole(formData);
        toast.success('Rol creado');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Error al guardar', {
        description: err instanceof Error ? err.message : 'No se pudo guardar el rol.'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter(pid => pid !== id)
        : [...prev.permissionIds, id]
    }));
  };

  const handleDeleteClick = (id: string) => {
    setRoleToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    setIsActionLoading(true);
    try {
      await deleteRole(roleToDelete);
      toast.success('Rol eliminado');
    } catch (err) {
      toast.error('Error al eliminar', {
        description: err instanceof Error ? err.message : 'No se pudo eliminar el rol.'
      });
    } finally {
      setIsActionLoading(false);
      setIsDeleteAlertOpen(false);
      setRoleToDelete(null);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={2} />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Shield className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Roles</h1>
          </div>
          <p className="text-muted-foreground font-medium">Define qué acciones pueden realizar los diferentes perfiles.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 h-11 px-6 font-bold">
          <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
          Nuevo Rol
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
          <XCircle className="h-5 w-5" strokeWidth={2} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(roles) && roles.map((role) => (
          <Card key={role.id} className={`group border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card rounded-2xl overflow-hidden relative ${role.isSystem ? 'bg-muted/30' : ''}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${role.isSystem ? 'bg-muted-foreground/30' : 'bg-primary'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                      {role.name}
                    </CardTitle>
                    {role.isSystem && <Badge variant="secondary" className="text-[9px] uppercase font-bold px-1.5 py-0 rounded-md">Sistema</Badge>}
                  </div>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] font-medium leading-relaxed">
                    {role.description || 'Sin descripción'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 4).map(p => (
                    <Badge key={p.id} variant="outline" className="text-[9px] font-bold uppercase border-border bg-muted/50 text-muted-foreground">
                      {p.name}
                    </Badge>
                  ))}
                  {role.permissions.length > 4 && (
                    <Badge variant="outline" className="text-[9px] font-bold uppercase border-border bg-muted/50 text-muted-foreground">
                      +{role.permissions.length - 4} más
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-5 border-t border-border">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {role._count?.users || 0} usuarios
                  </span>
                  <div className="flex gap-1">
                    {!role.isSystem ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(role)} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(role.id)} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>
                      </>
                    ) : (
                      <div className="h-8 px-2 flex items-center">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl p-0 border-border bg-card shadow-2xl flex flex-col">
          <div className="bg-primary p-8 text-primary-foreground relative flex-shrink-0">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
              <Shield size={100} strokeWidth={1} />
            </div>
            <DialogTitle className="text-2xl font-bold">{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">
              Configura el nombre, descripción y permisos del perfil.
            </DialogDescription>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-bold text-foreground/80 ml-1">Nombre del Rol</Label>
                <Input
                  id="name"
                  placeholder="Ej: Técnico de Nivel 1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="h-11 bg-muted/30 border-border rounded-xl focus:ring-primary/20 font-bold"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-bold text-foreground/80 ml-1">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción de las responsabilidades..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="h-11 bg-muted/30 border-border rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-bold text-foreground ml-1 uppercase tracking-wide">Permisos Asociados</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border p-6 rounded-2xl bg-muted/20">
                {permissions.map((p) => (
                  <div key={p.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => togglePermission(p.id)}>
                    <Checkbox
                      id={`p-${p.id}`}
                      checked={formData.permissionIds.includes(p.id)}
                      onCheckedChange={() => togglePermission(p.id)}
                      className="mt-1 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="grid gap-1 leading-none">
                      <label
                        htmlFor={`p-${p.id}`}
                        className="text-sm font-bold text-foreground cursor-pointer group-hover:text-primary transition-colors"
                      >
                        {p.name}
                      </label>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <DialogFooter className="p-8 border-t border-border bg-muted/10 flex gap-3 flex-shrink-0">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold text-muted-foreground">
              Cancelar
            </Button>
            <Button type="submit" disabled={isActionLoading} className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-10 font-bold shadow-lg shadow-primary/20 min-w-[140px]">
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (editingRole ? 'Actualizar Rol' : 'Crear Rol')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-border bg-card shadow-2xl p-6">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4 border border-destructive/20">
              <AlertCircle className="h-6 w-6" strokeWidth={2} />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium leading-relaxed">
              Esta acción no se puede deshacer. Esto eliminará permanentemente el rol del sistema. 
              Los usuarios con este rol perderán sus permisos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="rounded-xl h-11 px-6 font-bold border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:opacity-90 rounded-xl h-11 px-6 font-bold shadow-lg shadow-destructive/20" disabled={isActionLoading}>
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar Rol'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
