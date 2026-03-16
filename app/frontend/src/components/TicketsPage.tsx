import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-gray-100', textColor: 'text-gray-600' },
  MEDIUM: { label: 'Media', color: 'bg-blue-100', textColor: 'text-blue-600' },
  HIGH: { label: 'Alta', color: 'bg-orange-100', textColor: 'text-orange-600' },
  URGENT: { label: 'Urgente', color: 'bg-red-100', textColor: 'text-red-600' },
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
  const [dateFilter, setDateFilter] = useState<string>('all');
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

  const isAdmin = currentUser.role === 'Administrador' || (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Administrador') || currentUser.role === 'EMPRESA';
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Técnico');
  const isEmployee = (typeof currentUser.role === 'object' && (currentUser.role as any)?.name === 'Empleado') || currentUser.role === 'EMPLEADO';

  const filteredTickets = tickets
    .filter(ticket => {
      // Búsqueda por palabra clave
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Filtro de Estado
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;

      // Filtro de Prioridad
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;

      // Filtro de Área
      if (areaFilter !== 'all' && ticket.areaId !== areaFilter) return false;

      // Filtro de Fecha
      if (dateFilter !== 'all') {
        const ticketDate = new Date(ticket.createdAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateFilter === 'today') {
          if (ticketDate < startOfToday) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (ticketDate < weekAgo) return false;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          if (ticketDate < monthAgo) return false;
        }
      }

      // Lógica de visibilidad para Técnicos
      if (isTechnician) {
        const isUnclaimed = !ticket.assignedToId;
        const isMyClaimed = ticket.assignedToId === currentUser.id;
        return isUnclaimed || isMyClaimed;
      }

      // Para Empleados, solo sus propios tickets
      if (isEmployee) {
        return ticket.createdById === currentUser.id || ticket.createdBy?.id === currentUser.id;
      }

      // Admins ven todo
      return true;
    })
    .sort((a, b) => {
      // Lógica de ordenamiento
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      
      if (sortBy === 'priority') {
        const priorityMap = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityMap[b.priority as keyof typeof priorityMap] - priorityMap[a.priority as keyof typeof priorityMap];
      }

      if (sortBy === 'status') {
        const statusMap = { OPEN: 4, IN_PROGRESS: 3, RESOLVED: 2, CLOSED: 1 };
        return statusMap[b.status as keyof typeof statusMap] - statusMap[a.status as keyof typeof statusMap];
      }

      return 0;
    });

  const canCreateTicket = isAdmin || isEmployee;

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) return;

    if (!newTicket.areaId) {
      toast.error('Debes asignar el ticket a un área específica');
      return;
    }

    const success = await onCreateTicket({
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category,
      areaId: newTicket.areaId,
    });

    if (success) {
      toast.success('Ticket creado correctamente');
      setNewTicket({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'General',
        areaId: '',
      });
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Tickets</h1>
          <p className="text-[#5f6368]">Listado completo de incidencias y solicitudes</p>
        </div>
        {canCreateTicket && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1a73e8] hover:bg-[#1557b0] rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-primary p-6 text-white">
                <DialogTitle className="text-xl font-bold">Crear nuevo ticket</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1">
                  Detalla la incidencia para que el equipo de soporte pueda atenderla rápidamente.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-sm font-bold text-foreground ml-1">Título</label>
                  <Input
                    placeholder="Ej: Fallo en el acceso al correo"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="mt-1.5 h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground ml-1">Descripción</label>
                  <textarea
                    placeholder="Describe qué sucede..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none text-base transition-all bg-slate-50/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-foreground ml-1">Área Responsable</label>
                    <select
                      value={newTicket.areaId}
                      onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                      className="w-full mt-1.5 h-12 px-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50 appearance-none cursor-pointer font-medium"
                      required
                    >
                      <option value="">Seleccionar área</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground ml-1">Prioridad</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full mt-1.5 h-12 px-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50 appearance-none cursor-pointer font-medium"
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl h-12 px-6 font-bold">
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-blue-700 rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
                    onClick={handleCreateTicket}
                    disabled={!newTicket.title || !newTicket.description || !newTicket.areaId}
                  >
                    Crear ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
          <Input 
            placeholder="Buscar por título o descripción..." 
            className="pl-10 h-10 border-[#dadce0] focus:ring-[#1a73e8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            className={`flex items-center gap-2 h-10 ${showFilters ? 'bg-blue-50 text-[#1a73e8] border-blue-200' : 'text-[#5f6368]'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {(statusFilter !== 'all' || priorityFilter !== 'all' || areaFilter !== 'all') && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-[#1a73e8]">
                !
              </Badge>
            )}
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 py-2 text-sm border border-[#dadce0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8] bg-white text-[#5f6368] font-medium"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="priority">Por Prioridad</option>
            <option value="status">Por Estado</option>
          </select>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="p-4 bg-gray-50/50 border border-[#dadce0] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5f6368] uppercase ml-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-[#1a73e8] bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="OPEN">Abiertos</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="RESOLVED">Resueltos</option>
              <option value="CLOSED">Cerrados</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5f6368] uppercase ml-1">Prioridad</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-[#1a73e8] bg-white"
            >
              <option value="all">Todas las prioridades</option>
              <option value="URGENT">Urgente</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5f6368] uppercase ml-1">Área</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-[#1a73e8] bg-white"
            >
              <option value="all">Todas las áreas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5f6368] uppercase ml-1">Fecha de creación</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-[#1a73e8] bg-white"
            >
              <option value="all">Cualquier fecha</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
          
          <div className="sm:col-span-1 flex justify-end items-end pb-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-[#1a73e8] h-7 hover:bg-blue-50"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setAreaFilter('all');
                setDateFilter('all');
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                <th className="px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">Área</th>
                <th className="px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f4]">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => onViewTicket(ticket)}
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors truncate">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-[#5f6368] line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.area ? (
                      <div className="flex items-center gap-1.5 text-[#1a73e8]">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{ticket.area.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No asignada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].textColor} border-0 text-[10px] font-bold uppercase tracking-wider h-5`}>
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`${priorityConfig[ticket.priority].color} ${priorityConfig[ticket.priority].textColor} border-none text-[10px] h-5`}>
                      {priorityConfig[ticket.priority].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#202124] font-medium">
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                      </span>
                      <span className="text-[10px] text-[#5f6368]">
                        por {ticket.createdBy?.name || 'Usuario desconocido'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="h-4 w-4 text-[#dadce0] group-hover:text-[#1a73e8] transition-all transform group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-[#dadce0]" />
                      <p className="text-[#5f6368] text-sm">No se encontraron tickets que coincidan con tu búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
