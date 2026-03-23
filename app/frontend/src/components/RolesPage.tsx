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
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-primary" strokeWidth={2} />
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-foreground uppercase italic">Gestión de Roles</h1>
          <p className="text-slate-500 dark:text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-300 dark:bg-white/20"></span> Define qué acciones pueden realizar los diferentes perfiles.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white rounded-2xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] px-8 h-12 font-black uppercase text-xs tracking-widest transition-all active:scale-95">
          <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
          Nuevo Rol
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest italic">
          <XCircle className="h-5 w-5" strokeWidth={3} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(roles) && roles.map((role) => (
          <Card key={role.id} className={`group border-none shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] dark:shadow-none bg-[#f8fafc] dark:bg-card rounded-[2rem] overflow-hidden relative transition-all duration-500 hover:scale-[1.02] ${role.isSystem ? 'opacity-80' : ''}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${role.isSystem ? 'bg-slate-300 dark:bg-muted-foreground/30' : 'bg-blue-600 dark:bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
            
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-black text-slate-800 dark:text-foreground group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">
                      {role.name}
                    </CardTitle>
                    {role.isSystem && <div className="px-2 py-0.5 rounded-full text-[8px] font-black bg-slate-100 text-slate-400 uppercase tracking-widest shadow-sm">Sistema</div>}
                  </div>
                  <CardDescription className="text-xs text-slate-400 dark:text-muted-foreground line-clamp-2 min-h-[40px] font-medium leading-relaxed italic">
                    "{role.description || 'Sin descripción corporativa'}"
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 4).map(p => (
                    <div key={p.id} className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 dark:text-muted-foreground shadow-sm">
                      {p.name}
                    </div>
                  ))}
                  {role.permissions.length > 4 && (
                    <div className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 dark:text-muted-foreground shadow-sm">
                      +{role.permissions.length - 4}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-primary shadow-[0_0_5px_currentColor]" />
                    {role._count?.users || 0} Miembros
                  </div>
                  <div className="flex gap-2">
                    {!role.isSystem ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(role)} className="h-10 w-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-primary/10 transition-all">
                          <Edit2 className="h-4 w-4" strokeWidth={3} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(role.id)} className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                          <Trash2 className="h-4 w-4" strokeWidth={3} />
                        </Button>
                      </>
                    ) : (
                      <div className="h-10 px-2 flex items-center">
                        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-blue-600 transition-all translate-x-[-4px] group-hover:translate-x-0" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[3rem] p-0 border-none bg-[#f8fafc] dark:bg-card shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] p-10 text-white relative flex-shrink-0">
            <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
              <Shield size={140} strokeWidth={1} />
            </div>
            <DialogTitle className="text-3xl font-extrabold uppercase italic tracking-tighter">{editingRole ? 'Editar Rango' : 'Nuevo Rango'}</DialogTitle>
            <DialogDescription className="text-white/80 mt-2 font-medium italic">
              Configura los privilegios operativos del perfil.
            </DialogDescription>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
            <div className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-[10px] font-black text-slate-400 dark:text-foreground/40 uppercase tracking-widest ml-1 italic">Identificador del Rol</Label>
                <Input
                  id="name"
                  placeholder="Ej: Técnico Senior"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description" className="text-[10px] font-black text-slate-400 dark:text-foreground/40 uppercase tracking-widest ml-1 italic">Definición Operativa</Label>
                <textarea
                  id="description"
                  placeholder="Responsabilidades del perfil..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-medium text-sm text-slate-600 dark:text-slate-300 p-6 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none italic"
                />
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1 uppercase tracking-[0.2em] italic">Matriz de Permisos</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none p-8 rounded-[2rem] bg-white dark:bg-muted/20">
                {permissions.map((p) => (
                  <div key={p.id} className="flex items-start space-x-4 group cursor-pointer" onClick={() => togglePermission(p.id)}>
                    <Checkbox
                      id={`p-${p.id}`}
                      checked={formData.permissionIds.includes(p.id)}
                      onCheckedChange={() => togglePermission(p.id)}
                      className="mt-1 rounded-md border-slate-200 dark:border-white/10 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`p-${p.id}`}
                        className="text-xs font-black text-slate-700 dark:text-foreground cursor-pointer group-hover:text-blue-600 transition-colors uppercase tracking-tight"
                      >
                        {p.name}
                      </label>
                      <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-medium leading-relaxed italic">
                        {p.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <DialogFooter className="p-10 border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-muted/10 flex gap-4 flex-shrink-0">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-14 px-8 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-800 transition-all">
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={isActionLoading} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white rounded-2xl h-14 px-12 font-black uppercase text-xs tracking-widest shadow-lg min-w-[180px] transition-transform active:scale-95">
              {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (editingRole ? 'Guardar Cambios' : 'Generar Rol')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-[3rem] border-none bg-[#f8fafc] dark:bg-card shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-2xl p-12">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <AlertCircle className="h-8 w-8" strokeWidth={3} />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">¿Eliminar Rango?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed italic mt-4">
              Esta acción es irreversible. Se eliminará el nodo de permisos permanentemente. Los usuarios vinculados perderán su matriz de acceso actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 flex gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-none bg-white dark:bg-transparent shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-800 transition-all">Regresar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 text-white hover:opacity-90 rounded-2xl h-14 px-10 font-black shadow-xl shadow-rose-500/20 uppercase text-[10px] tracking-widest" disabled={isActionLoading}>
              {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirmar Baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
