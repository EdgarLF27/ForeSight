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
  ChevronRight,
  Inbox
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-primary" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 px-1 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-foreground uppercase italic">Gestión de Áreas</h1>
          <p className="text-slate-500 dark:text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-300 dark:bg-white/20"></span> Organiza tu empresa en departamentos y unidades.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white rounded-2xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] px-8 h-12 font-black uppercase text-xs tracking-widest transition-all active:scale-95">
          <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
          Nueva Área
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <Input
          placeholder="Buscar áreas por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-card focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-slate-800 dark:text-foreground transition-all"
        />
      </div>

      {/* Grid de Áreas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAreas.map((area) => (
          <Card key={area.id} className="group border-none shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] dark:shadow-none bg-[#f8fafc] dark:bg-card rounded-[2rem] overflow-hidden relative transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-blue-600 dark:bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-blue-600 dark:text-primary border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none group-hover:scale-110 transition-all duration-500">
                  <Building2 className="h-6 w-6" strokeWidth={3} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/5 transition-all">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl border-none shadow-2xl bg-white dark:bg-[#050505]/95 backdrop-blur-xl p-1.5">
                    <DropdownMenuItem onClick={() => handleOpenEdit(area)} className="rounded-xl py-3 cursor-pointer font-black text-[10px] uppercase text-slate-600 dark:text-slate-300 flex items-center">
                      <Edit2 className="h-4 w-4 mr-3 text-blue-600 dark:text-primary" /> Editar Área
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenDelete(area)} className="rounded-xl py-3 cursor-pointer font-black text-[10px] uppercase text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 flex items-center">
                      <Trash2 className="h-4 w-4 mr-3" /> Eliminar Área
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-xl font-black text-slate-800 dark:text-foreground mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">{area.name}</h3>
              <p className="text-xs text-slate-400 dark:text-muted-foreground line-clamp-2 min-h-[40px] mb-8 font-medium leading-relaxed italic">
                "{area.description || 'Sin definición operativa'}"
              </p>

              <div className="flex items-center gap-6 pt-6 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">
                  <Users className="h-3.5 w-3.5 text-blue-400/40 dark:text-primary/40" strokeWidth={3} />
                  <span>{(area as any)._count?.users || 0} Nodos</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">
                  <Ticket className="h-3.5 w-3.5 text-blue-400/40 dark:text-primary/40" strokeWidth={3} />
                  <span>{(area as any)._count?.tickets || 0} Flujos</span>
                </div>
                <div className="ml-auto text-slate-200 group-hover:text-blue-600 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                  <ChevronRight className="h-5 w-5" strokeWidth={3} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAreas.length === 0 && !isLoading && (
          <div className="col-span-full py-24 text-center bg-white/20 dark:bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-border/50">
            <div className="w-20 h-20 bg-white dark:bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] dark:shadow-none">
              <Inbox className="h-10 w-10 text-slate-300 dark:text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <p className="text-slate-400 dark:text-muted-foreground font-black uppercase tracking-[0.5em] text-xs">No hay sectores configurados</p>
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
        <DialogContent className="sm:max-w-[480px] rounded-[3rem] p-0 overflow-hidden bg-[#f8fafc] dark:bg-card border-none shadow-2xl">
          <div className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] p-10 text-white relative">
            <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
              <Building2 size={120} strokeWidth={1} />
            </div>
            <DialogTitle className="text-3xl font-extrabold uppercase italic tracking-tighter">{isAddDialogOpen ? 'Nueva Área' : 'Editar Área'}</DialogTitle>
            <DialogDescription className="text-white/80 mt-2 font-medium italic">
              Define los parámetros del sector operativo.
            </DialogDescription>
          </div>
          <form onSubmit={handleSave} className="p-10 space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-foreground/40 uppercase tracking-widest ml-1 italic">Nombre del Sector</label>
              <Input
                placeholder="Ej: Operaciones, Infraestructura..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-black text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-foreground/40 uppercase tracking-widest ml-1 italic">Descripción</label>
              <textarea
                placeholder="¿Cuál es el alcance de este sector?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-40 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-muted/30 font-medium text-sm text-slate-600 dark:text-slate-300 p-6 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none italic"
              />
            </div>
            <DialogFooter className="pt-4 flex gap-4">
              <Button type="button" variant="ghost" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} className="rounded-2xl h-14 px-8 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-800 transition-all">
                Cancelar
              </Button>
              <Button type="submit" disabled={isActionLoading} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white rounded-2xl h-14 px-10 font-black uppercase text-xs shadow-lg shadow-blue-500/20 flex-1 transition-transform active:scale-95">
                {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Guardar Sector'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[3rem] border-none bg-[#f8fafc] dark:bg-card shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-2xl p-12">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <AlertCircle className="h-8 w-8" strokeWidth={3} />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
              ¿Eliminar sector?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed italic mt-4">
              Esta acción eliminará el sector <strong>{selectedArea?.name}</strong> permanentemente. Los flujos vinculados quedarán sin asignación jerárquica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 flex gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-none bg-white dark:bg-transparent shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-800 transition-all">Regresar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-rose-600 text-white hover:opacity-90 h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20"
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirmar Baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
