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
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const { areas, isLoading, loadAreas, createArea, updateArea, deleteArea } = useAreas();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  
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
      (area.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [areas, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '' });
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (area: Area) => {
    setSelectedArea(area);
    setFormData({ name: area.name, description: area.description || '' });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (area: Area) => {
    setSelectedArea(area);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('El nombre es obligatorio');
    if (formData.name.trim().length < 2) return toast.error('El nombre debe tener al menos 2 caracteres');

    setIsActionLoading(true);
    try {
      if (isAddDialogOpen) {
        await createArea(formData);
        toast.success('Área creada exitosamente');
        setIsAddDialogOpen(false);
      } else if (selectedArea) {
        await updateArea(selectedArea.id, formData);
        toast.success('Área actualizada');
        setIsEditDialogOpen(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al procesar la solicitud';
      toast.error(msg);
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
      toast.success('Área eliminada exitosamente');
      setIsDeleteDialogOpen(false);
    } else {
      toast.error('No se pudo eliminar el área', {
        description: 'Asegúrate de que no tenga tickets ni empleados asociados.'
      });
    }
  };

  if (isLoading && areas.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Building2 className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Áreas</h1>
          </div>
          <p className="text-muted-foreground font-medium">Organiza tu empresa en departamentos y unidades.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 h-11 px-6 font-bold">
          <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
          Nueva Área
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2} />
        <Input
          placeholder="Buscar áreas por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-card border-border rounded-xl focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
        />
      </div>

      {/* Grid de Áreas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAreas.map((area) => (
          <Card key={area.id} className="group border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card rounded-3xl overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center text-primary border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Building2 className="h-5 w-5" strokeWidth={2} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-1 border-border bg-card shadow-xl">
                    <DropdownMenuItem onClick={() => handleOpenEdit(area)} className="rounded-lg cursor-pointer py-2 px-3 focus:bg-primary/10 focus:text-primary">
                      <Edit2 className="h-3.5 w-3.5 mr-2.5" /> 
                      <span className="font-bold text-xs uppercase tracking-tight">Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenDelete(area)} className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2 px-3">
                      <Trash2 className="h-3.5 w-3.5 mr-2.5" /> 
                      <span className="font-bold text-xs uppercase tracking-tight">Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors uppercase tracking-tight">{area.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-6 font-medium leading-relaxed">
                {area.description || 'Sin descripción'}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  <Users className="h-3.5 w-3.5 text-primary/40" strokeWidth={2} />
                  <span>{(area as any)._count?.users || 0} Miembros</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  <Ticket className="h-3.5 w-3.5 text-primary/40" strokeWidth={2} />
                  <span>{(area as any)._count?.tickets || 0} Tickets</span>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                  <ChevronRight className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAreas.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border-2 border-dashed border-border">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
              <Building2 className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No se encontraron áreas</p>
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
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-border bg-card shadow-2xl">
          <div className="bg-primary p-8 text-primary-foreground relative">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
              <Building2 size={100} strokeWidth={1} />
            </div>
            <DialogTitle className="text-2xl font-bold">{isAddDialogOpen ? 'Nueva Área' : 'Editar Área'}</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">
              Define el nombre y la descripción del departamento.
            </DialogDescription>
          </div>
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-widest">Nombre del área</label>
              <Input
                placeholder="Ej: Soporte Técnico, Redes, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11 bg-muted/30 border-border rounded-xl focus:ring-primary/20 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-widest">Descripción</label>
              <textarea
                placeholder="¿De qué se encarga este departamento?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 min-h-[120px] resize-none text-sm transition-all font-medium text-foreground"
              />
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} className="rounded-xl h-11 px-6 font-bold text-muted-foreground">
                Cancelar
              </Button>
              <Button type="submit" disabled={isActionLoading} className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20 min-w-[120px]">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Área'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-border bg-card shadow-2xl p-6">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4 border border-destructive/20">
              <AlertCircle className="h-6 w-6" strokeWidth={2} />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground uppercase tracking-tight">
              ¿Eliminar esta área?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium leading-relaxed">
              Esta acción eliminará el área <strong>{selectedArea?.name}</strong> permanentemente. 
              No podrás eliminarla si tiene empleados o tickets vinculados por integridad del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="rounded-xl h-11 px-6 font-bold border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:opacity-90 rounded-xl h-11 px-6 font-bold shadow-lg shadow-destructive/20"
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
