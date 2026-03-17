import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Inbox,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Ticket, Area, User } from '@/types';
import { toast } from 'sonner';

interface TicketsPageProps {
  tickets: Ticket[];
  areas: Area[];
  teamMembers: User[];
  currentUser: User;
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: Ticket) => void;
  onUpdateTicket: (id: string, data: any) => Promise<boolean>;
}

const statusConfig = {
  OPEN: { label: 'Abierto', variant: 'destructive' as const },
  IN_PROGRESS: { label: 'En progreso', variant: 'warning' as const },
  RESOLVED: { label: 'Resuelto', variant: 'success' as const },
  CLOSED: { label: 'Cerrado', variant: 'secondary' as const },
  CANCELLED: { label: 'Cancelado', variant: 'secondary' as const },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'text-muted-foreground' },
  MEDIUM: { label: 'Media', color: 'text-primary' },
  HIGH: { label: 'Alta', color: 'text-amber-500' },
  URGENT: { label: 'Urgente', color: 'text-destructive' },
};

export function TicketsPage({ 
  tickets, 
  areas, 
  currentUser,
  onCreateTicket, 
  onViewTicket 
}: TicketsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
    areaId: '',
  });

  const isAdmin = currentUser.role === 'EMPRESA' || (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Administrador');
  const isEmployee = (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Empleado') || currentUser.role === 'EMPLEADO';
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Técnico');

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
      if (areaFilter !== 'all' && ticket.areaId !== areaFilter) return false;

      if (isTechnician) {
        return !ticket.assignedToId || ticket.assignedToId === currentUser.id;
      }

      if (isEmployee) {
        return ticket.createdById === currentUser.id || ticket.createdBy?.id === currentUser.id;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') {
        const priorityMap = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityMap[b.priority as keyof typeof priorityMap] - priorityMap[a.priority as keyof typeof priorityMap];
      }
      return 0;
    });

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.areaId) return;
    const success = await onCreateTicket(newTicket);
    if (success) {
      toast.success('Ticket creado correctamente');
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', category: 'General', areaId: '' });
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Gestión de Tickets</h1>
          <p className="text-muted-foreground font-medium">Administra y haz seguimiento de todas las incidencias</p>
        </div>
        {(isAdmin || isEmployee) && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 px-6 h-11 font-bold transition-all">
                <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-3xl border-border bg-card shadow-2xl p-0 overflow-hidden">
              <div className="bg-primary p-8 text-primary-foreground relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Inbox size={100} />
                </div>
                <DialogTitle className="text-2xl font-bold uppercase tracking-tight">Nueva Incidencia</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">
                  Completa los detalles para reportar un nuevo problema.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-widest">Asunto</label>
                  <Input
                    placeholder="Título descriptivo del problema"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="h-11 rounded-xl border-border bg-muted/30 focus:ring-primary/20 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-widest">Descripción</label>
                  <textarea
                    placeholder="Proporciona detalles técnicos sobre la incidencia..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 min-h-[120px] resize-none text-sm font-medium transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-widest">Área</label>
                    <select
                      value={newTicket.areaId}
                      onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                      className="w-full h-11 px-4 border border-border rounded-xl bg-muted/30 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none uppercase"
                    >
                      <option value="">Seleccionar área...</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/80 ml-1 uppercase tracking-widest">Prioridad</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full h-11 px-4 border border-border rounded-xl bg-muted/30 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none uppercase"
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold text-muted-foreground uppercase text-xs tracking-widest">Cancelar</Button>
                  <Button 
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-8 font-bold uppercase text-xs tracking-widest"
                    onClick={handleCreateTicket}
                    disabled={!newTicket.title || !newTicket.description || !newTicket.areaId}
                  >
                    Crear Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por título o descripción..." 
            className="pl-11 h-12 rounded-2xl border-border bg-card shadow-sm focus:ring-primary/20 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            className={`h-12 px-6 rounded-2xl border-border bg-card shadow-sm font-bold gap-2 transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 px-4 rounded-2xl border border-border bg-card shadow-sm font-bold text-sm focus:ring-primary/20 transition-all outline-none"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="priority">Prioridad alta</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <Card className="p-6 border-none shadow-md bg-card rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-border bg-muted/30 uppercase"
            >
              <option value="all">Todos</option>
              <option value="OPEN">Abiertos</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="RESOLVED">Resueltos</option>
              <option value="CLOSED">Cerrados</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Prioridad</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-border bg-muted/30 uppercase"
            >
              <option value="all">Todas</option>
              <option value="URGENT">Urgente</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Área</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-border bg-muted/30 uppercase"
            >
              <option value="all">Todas las áreas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="ghost" 
              className="w-full h-10 font-bold text-xs text-primary uppercase"
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setAreaFilter('all'); }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </Card>
      )}

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ticket</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Área</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prioridad</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-muted/30 transition-all cursor-pointer group"
                  onClick={() => onViewTicket(ticket)}
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs font-medium">
                        {ticket.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {ticket.area ? (
                      <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase">
                        <MapPin size={12} className="text-primary/40" />
                        {ticket.area.name}
                      </div>
                    ) : <span className="text-[10px] text-muted-foreground/50 italic font-bold">N/A</span>}
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={statusConfig[ticket.status].variant} className="font-bold text-[9px] uppercase tracking-wider">
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityConfig[ticket.priority].color.replace('text-', 'bg-')}`} />
                      <span className={`text-[10px] font-bold uppercase ${priorityConfig[ticket.priority].color}`}>{priorityConfig[ticket.priority].label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-foreground uppercase">
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {ticket.createdBy?.name?.split(' ')[0] || 'Sistema'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="p-1.5 rounded-lg text-muted-foreground/30 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-3xl bg-muted/50">
                         <Inbox className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No hay tickets</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
