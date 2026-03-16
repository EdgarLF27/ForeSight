import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Building2,
  Users,
  Ticket,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAreas } from '@/hooks/useAreas';
import type { Area } from '@/types';

export function AreasPage() {
  const { areas, isLoading, error, loadAreas, createArea, updateArea, deleteArea } = useAreas();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedMember] = useState<Area | null>(null);
  
  // Estado para formularios
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  // Búsqueda funcional (Filtrado local)
  const filteredAreas = useMemo(() => {
    return areas.filter(area => 
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [areas, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '' });
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (area: Area) => {
    setSelectedMember(area);
    setFormData({ name: area.name, description: area.description || '' });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (area: Area) => {
    setSelectedMember(area);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('El nombre es obligatorio');

    setIsActionLoading(true);
    try {
      let success;
      if (isAddDialogOpen) {
        success = await createArea(formData);
        if (success) {
          toast.success('Área creada exitosamente');
          setIsAddDialogOpen(false);
        }
      } else {
        success = await updateArea(selectedArea!.id, formData);
        if (success) {
          toast.success('Área actualizada');
          setIsEditDialogOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedArea) return;
    
    setIsActionLoading(true);
    const success = await deleteArea(selectedArea.id);
    setIsActionLoading(false);
    
    if (success) {
      toast.success('Área eliminada');
      setIsDeleteDialogOpen(false);
    } else {
      // El error lo maneja el hook, pero mostramos un toast extra
      toast.error('No se pudo eliminar el área', {
        description: 'Verifica si tiene tickets o empleados asociados.'
      });
    }
  };

  if (isLoading && areas.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Administración de Áreas</h1>
          <p className="text-[#5f6368]">Organiza tu empresa en departamentos y unidades</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#1a73e8] hover:bg-[#1557b0] shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Área
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
        <Input
          placeholder="Buscar áreas por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white border-[#dadce0] focus:ring-2 focus:ring-[#1a73e8] transition-all"
        />
      </div>

      {/* Grid de Áreas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAreas.map((area) => (
          <Card key={area.id} className="group border-[#dadce0] hover:border-[#1a73e8] hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#e8f0fe] rounded-lg flex items-center justify-center text-[#1a73e8]">
                  <Building2 className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(area)} className="cursor-pointer">
                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenDelete(area)} className="text-[#ea4335] focus:text-[#ea4335] cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-semibold text-[#202124] mb-1">{area.name}</h3>
              <p className="text-sm text-[#5f6368] line-clamp-2 min-h-[40px] mb-4">
                {area.description || 'Sin descripción'}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-[#f1f3f4]">
                <div className="flex items-center gap-1.5 text-xs text-[#5f6368]">
                  <Users className="h-3.5 w-3.5" />
                  <span>{(area as any)._count?.users || 0} Miembros</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5f6368]">
                  <Ticket className="h-3.5 w-3.5" />
                  <span>{(area as any)._count?.tickets || 0} Tickets</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAreas.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-[#dadce0]">
            <Building2 className="h-12 w-12 text-[#dadce0] mx-auto mb-3" />
            <p className="text-[#5f6368]">No se encontraron áreas. ¡Crea la primera!</p>
          </div>
        )}
      </div>

      {/* Diálogo Añadir/Editar */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onOpenChange={(v) => {
          if (!v) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? 'Nueva Área' : 'Editar Área'}</DialogTitle>
            <DialogDescription>
              Define el nombre y la descripción para organizar las solicitudes de soporte.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#202124]">Nombre del área</label>
              <Input
                placeholder="Ej: Soporte Técnico, Redes, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#202124]">Descripción (opcional)</label>
              <textarea
                placeholder="¿De qué se encarga este departamento?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] min-h-[100px] resize-none text-sm"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isActionLoading} className="bg-[#1a73e8] hover:bg-[#1557b0] min-w-[100px]">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#ea4335]" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el área <strong>{selectedArea?.name}</strong> permanentemente. 
              No podrás eliminarla si tiene empleados o tickets vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-[#ea4335] hover:bg-[#b31412] text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar Área'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
