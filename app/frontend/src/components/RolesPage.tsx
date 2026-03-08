import React, { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import type { Role } from '../hooks/useRoles';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Plus, Trash2, Edit2, XCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
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
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        toast.success('Rol actualizado', {
          description: `El rol "${formData.name}" se ha actualizado correctamente.`
        });
      } else {
        await createRole(formData);
        toast.success('Rol creado', {
          description: `El rol "${formData.name}" se ha creado correctamente.`
        });
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Error al guardar', {
        description: err instanceof Error ? err.message : 'No se pudo guardar el rol.'
      });
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
    try {
      await deleteRole(roleToDelete);
      toast.success('Rol eliminado', {
        description: 'El rol se ha eliminado permanentemente.'
      });
    } catch (err) {
      toast.error('Error al eliminar', {
        description: err instanceof Error ? err.message : 'No se pudo eliminar el rol.'
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setRoleToDelete(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando roles y permisos...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Gestión de Roles y Permisos
          </h1>
          <p className="text-slate-500 mt-1">
            Define qué acciones pueden realizar los diferentes perfiles en tu empresa.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <XCircle className="h-5 w-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(roles) && roles.map((role) => (
          <Card key={role.id} className={role.isSystem ? 'bg-slate-50 border-slate-200' : 'hover:shadow-md transition-shadow'}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    {role.name}
                    {role.isSystem && <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-slate-200">Sistema</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2 min-h-[40px]">
                    {role.description || 'Sin descripción'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 5).map(p => (
                    <Badge key={p.id} variant="outline" className="text-[11px] bg-white">
                      {p.name}
                    </Badge>
                  ))}
                  {role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-[11px] bg-white">
                      +{role.permissions.length - 5} más
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {role._count?.users || 0} usuarios asignados
                  </span>
                  <div className="flex gap-2">
                    {!role.isSystem && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(role)}>
                          <Edit2 className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(role.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Rol</Label>
                <Input
                  id="name"
                  placeholder="Ej: Técnico de Nivel 1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción de las responsabilidades..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Permisos Asociados</Label>
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
                {permissions.map((p) => (
                  <div key={p.id} className="flex items-start space-x-3 space-y-0">
                    <Checkbox
                      id={`p-${p.id}`}
                      checked={formData.permissionIds.includes(p.id)}
                      onCheckedChange={() => togglePermission(p.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`p-${p.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {p.name}
                      </label>
                      <p className="text-xs text-slate-500">
                        {p.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingRole ? 'Actualizar Rol' : 'Crear Rol'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el rol
              y no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar Rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
