import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock,
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
  DialogHeader,
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
    areaId: '',
  });

  const isAdmin = currentUser.role === 'Administrador' || (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Administrador') || currentUser.role === 'EMPRESA';
  const isEmployee = (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Empleado') || currentUser.role === 'EMPLEADO';

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (currentUser.role === 'Técnico' || (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Técnico')) {
      return !ticket.assignedToId || ticket.assignedToId === currentUser.id;
    }

    if (isEmployee) {
      return ticket.createdById === currentUser.id || ticket.createdBy?.id === currentUser.id;
    }

    return true;
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Tickets</h1>
          <p className="text-muted-foreground">Administra y haz seguimiento de todas las incidencias</p>
        </div>
        {(isAdmin || isEmployee) && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 px-6 h-11 font-bold transition-all">
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-3xl border-border bg-card shadow-2xl p-0 overflow-hidden">
              <div className="bg-primary p-8 text-primary-foreground relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Inbox size={100} />
                </div>
                <DialogTitle className="text-2xl font-bold">Nueva Incidencia</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1">
                  Completa los detalles para reportar un nuevo problema.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 ml-1">Asunto</label>
                  <Input
                    placeholder="Título descriptivo del problema"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="h-11 rounded-xl border-border bg-muted/30 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 ml-1">Descripción</label>
                  <textarea
                    placeholder="Proporciona detalles técnicos sobre la incidencia..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 min-h-[120px] resize-none text-sm font-medium transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 ml-1">Área</label>
                    <select
                      value={newTicket.areaId}
                      onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                      className="w-full h-11 px-4 border border-border rounded-xl bg-muted/30 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      <option value="">Seleccionar área...</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 ml-1">Prioridad</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full h-11 px-4 border border-border rounded-xl bg-muted/30 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold text-muted-foreground">Cancelar</Button>
                  <Button 
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-8 font-bold"
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

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por título o descripción..." 
            className="pl-11 h-12 rounded-2xl border-border bg-card/50 shadow-sm focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-card shadow-sm hover:bg-muted font-bold gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Lista de Tickets - Minimalista */}
      <Card className="border-none shadow-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Área</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
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
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                        {ticket.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {ticket.area ? (
                      <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                        <MapPin size={12} className="text-primary/40" />
                        {ticket.area.name}
                      </div>
                    ) : <span className="text-xs text-muted-foreground/50 italic">N/A</span>}
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={statusConfig[ticket.status].variant} className="font-bold">
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityConfig[ticket.priority].color.replace('text-', 'bg-')}`} />
                      <span className={`text-xs font-bold ${priorityConfig[ticket.priority].color}`}>{priorityConfig[ticket.priority].label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
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
                      <div className="p-4 rounded-full bg-muted">
                         <Inbox className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium">No se encontraron tickets</p>
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
