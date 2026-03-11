import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowRight,
  MapPin,
  ClipboardList,
  UserCheck
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { Ticket, Area, User } from '@/types';

import { toast } from 'sonner';

interface TicketsPageProps {
  tickets: Ticket[];
  areas: Area[];
  teamMembers: any[];
  currentUser: User; // Añadido para filtrar por usuario actual
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticketId: string, updates: any) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

export function TicketsPage({ tickets, areas, currentUser, onCreateTicket, onViewTicket }: TicketsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const isTechnician = (typeof currentUser.role === 'object' && currentUser.role?.name === 'Técnico');
  const isAdmin = currentUser.role === 'Administrador' || (typeof currentUser.role === 'object' && currentUser.role?.name === 'Administrador') || currentUser.role === 'EMPRESA';

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
    areaId: '',
  });

  const getFilteredTickets = (tab: string) => {
    return tickets.filter(ticket => {
      // Filtro por pestaña (solo si es técnico)
      if (tab === 'claimed' && ticket.assignedToId !== currentUser.id) return false;

      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesArea = areaFilter === 'all' || ticket.areaId === areaFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesArea;
    });
  };

  const filteredTickets = getFilteredTickets(activeTab);
  const claimedCount = tickets.filter(t => t.assignedToId === currentUser.id).length;

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) return;

    // Solo enviamos exactamente lo que el DTO espera
    const ticketPayload: any = {
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
    };

    if (newTicket.category) ticketPayload.category = newTicket.category;
    if (newTicket.areaId) ticketPayload.areaId = newTicket.areaId;

    const success = await onCreateTicket(ticketPayload);

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
          <h1 className="text-2xl font-semibold text-[#202124]">
            {(!isTechnician && !isAdmin) ? 'Tus tickets creados' : 'Tickets'}
          </h1>
          <p className="text-[#5f6368]">
            {(!isTechnician && !isAdmin) 
              ? 'Listado de incidencias que has reportado' 
              : 'Listado completo de incidencias y solicitudes'}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a73e8] hover:bg-[#1557b0]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear nuevo ticket</DialogTitle>
              <DialogDescription>
                Detalla la incidencia para que el equipo de soporte pueda atenderla rápidamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-[#202124]">Título</label>
                <Input
                  placeholder="Ej: Fallo en el acceso al correo"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#202124]">Descripción</label>
                <textarea
                  placeholder="Describe qué sucede..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#202124]">Área (opcional)</label>
                  <select
                    value={newTicket.areaId}
                    onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#202124]">Prioridad</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#1a73e8] hover:bg-[#1557b0]"
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title || !newTicket.description}
                >
                  Crear ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isTechnician && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-[#dadce0] w-full justify-start rounded-none h-auto p-0 gap-6">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a73e8] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 h-auto text-sm font-medium"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Todos los tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger 
              value="claimed" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a73e8] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 h-auto text-sm font-medium text-[#1a73e8]"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Mis reclamados ({claimedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
            <Input 
              placeholder="Buscar por título o descripción..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || areaFilter !== 'all' || searchTerm) && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setAreaFilter('all');
              }}
              className="text-[#5f6368]"
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-[#dadce0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
          >
            <option value="all">Todos los estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="RESOLVED">Resueltos</option>
            <option value="CLOSED">Cerrados</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm border border-[#dadce0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
          >
            <option value="all">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="text-sm border border-[#dadce0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
          >
            <option value="all">Todas las áreas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Área</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Creado por</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y border-[#dadce0]">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onViewTicket(ticket)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors">{ticket.title}</p>
                      <p className="text-xs text-[#5f6368] line-clamp-1">{ticket.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.area ? (
                      <div className="flex items-center gap-1 text-sm text-[#1a73e8]">
                        <MapPin className="h-3 w-3" />
                        <span>{ticket.area.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#80868b] italic">Sin área</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].textColor} border-0 text-xs`}>
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {typeof ticket.createdBy === 'object' ? ticket.createdBy.name : 'Usuario'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="h-4 w-4 text-[#dadce0] group-hover:text-[#1a73e8] transition-colors ml-auto" />
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#5f6368]">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-[#dadce0]" />
                      <p>No se encontraron tickets que coincidan con tu búsqueda</p>
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
