import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useAreas } from '@/hooks/useAreas';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function AreasPage() {
  const { areas, isLoading, loadAreas, createArea, updateArea, deleteArea } = useAreas();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{ id: string; name: string; description: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArea = async () => {
    if (!formData.name.trim()) return;
    const success = await createArea(formData.name, formData.description);
    if (success) {
      toast.success('Área creada correctamente');
      setIsAddDialogOpen(false);
      setFormData({ name: '', description: '' });
    }
  };

  const handleEditArea = async () => {
    if (!selectedArea || !formData.name.trim()) return;
    const success = await updateArea(selectedArea.id, formData.name, formData.description);
    if (success) {
      toast.success('Área actualizada correctamente');
      setIsEditDialogOpen(false);
      setSelectedArea(null);
      setFormData({ name: '', description: '' });
    }
  };

  const handleDeleteArea = async () => {
    if (!selectedArea) return;
    const success = await deleteArea(selectedArea.id);
    if (success) {
      toast.success('Área eliminada correctamente');
      setIsDeleteDialogOpen(false);
      setSelectedArea(null);
    }
  };

  const openEditDialog = (area: any) => {
    setSelectedArea(area);
    setFormData({ name: area.name, description: area.description || '' });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (area: any) => {
    setSelectedArea(area);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">Áreas</h1>
          <p className="text-[#5f6368]">Gestiona las áreas de tu empresa para organizar los tickets</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#1a73e8] hover:bg-[#1557b0] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Área
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input
                placeholder="Buscar áreas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-[#f8f9fa] h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-[#5f6368]" />
              </div>
              <h3 className="text-lg font-medium text-[#202124]">No hay áreas</h3>
              <p className="text-[#5f6368] max-w-sm mx-auto">
                {searchTerm ? 'No se encontraron áreas con ese término de búsqueda.' : 'Comienza añadiendo la primera área de tu empresa.'}
              </p>
              {searchTerm && (
                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-[#1a73e8]">
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map((area) => (
                <Card key={area.id} className="overflow-hidden border-[#e0e0e0] hover:border-[#1a73e8] transition-colors">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#e8f0fe] p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-[#1a73e8]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#202124]">{area.name}</h3>
                          <p className="text-xs text-[#5f6368]">ID: {area.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(area)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(area)}
                            className="text-[#ea4335] focus:text-[#ea4335]"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {area.description && (
                      <p className="mt-4 text-sm text-[#5f6368] line-clamp-2">
                        {area.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Área</DialogTitle>
            <DialogDescription>
              Crea una nueva área para categorizar los fallos reportados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del área</label>
              <Input 
                placeholder="Ej. Servidores, Desarrollo, Soporte Técnico..." 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Input 
                placeholder="Breve descripción de las responsabilidades..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddArea} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">Crear Área</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Área</DialogTitle>
            <DialogDescription>
              Modifica la información del área seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del área</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditArea} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el área "{selectedArea?.name}" permanentemente.
              Los tickets asociados a esta área ya no tendrán un área asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArea} className="bg-[#ea4335] hover:bg-[#b31412] text-white">
              Eliminar Área
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
