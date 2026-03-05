import { useState } from 'react';
import { 
<<<<<<< HEAD
  Plus, 
  Search, 
  Filter, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
=======
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
<<<<<<< HEAD
import type { Ticket, UserStatus } from '@/types';

interface TicketsPageProps {
  tickets: Ticket[];
  onCreateTicket: (ticket: any) => void;
  onViewTicket: (ticket: Ticket) => void;
=======
import type { Ticket, User, TicketStatus, TicketPriority } from '@/types';

interface TicketsPageProps {
  user: User;
  tickets: Ticket[];
  teamMembers: User[];
  onCreateTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onViewTicket: (ticket: Ticket) => void;
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

<<<<<<< HEAD
export function TicketsPage({ tickets, onCreateTicket, onViewTicket }: TicketsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
=======
const priorityConfig = {
  LOW: { label: 'Baja', color: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  MEDIUM: { label: 'Media', color: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  HIGH: { label: 'Alta', color: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  URGENT: { label: 'Urgente', color: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
};

export function TicketsPage({ 
  user, 
  tickets, 
  teamMembers, 
  onCreateTicket, 
  onViewTicket,
  onUpdateTicket 
}: TicketsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
<<<<<<< HEAD
  });

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
=======
    assignedTo: '',
  });

  // Filtrar y ordenar tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

<<<<<<< HEAD
    // LIMPIEZA DE DATOS: Solo enviamos lo que el DTO espera
    onCreateTicket({
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category,
=======
    onCreateTicket({
      ...newTicket,
      status: 'OPEN',
      createdBy: user.id,
      companyId: user.companyId!,
      attachments: [],
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
    });

    setNewTicket({
      title: '',
      description: '',
      priority: 'MEDIUM',
      category: 'General',
<<<<<<< HEAD
=======
      assignedTo: '',
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
    });
    setIsCreateDialogOpen(false);
  };

<<<<<<< HEAD
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Tickets</h1>
          <p className="text-[#5f6368]">Listado completo de incidencias y solicitudes</p>
=======
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Tickets</h1>
          <p className="text-[#5f6368]">Gestiona todos los tickets de tu empresa</p>
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
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
<<<<<<< HEAD
              <DialogDescription>
                Detalla la incidencia para que el equipo de soporte pueda atenderla rápidamente.
              </DialogDescription>
=======
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-[#202124]">Título</label>
                <Input
<<<<<<< HEAD
                  placeholder="Ej: Fallo en el acceso al correo"
=======
                  placeholder="¿Qué problema necesitas reportar?"
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#202124]">Descripción</label>
                <textarea
<<<<<<< HEAD
                  placeholder="Describe qué sucede..."
=======
                  placeholder="Describe el problema en detalle..."
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] min-h-[100px] resize-none"
                />
              </div>
<<<<<<< HEAD
=======
              <div className="grid grid-cols-2 gap-4">
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
                {user.role === 'EMPRESA' && (
                  <div>
                    <label className="text-sm font-medium text-[#202124]">Asignar a</label>
                    <select
                      value={newTicket.assignedTo}
                      onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    >
                      <option value="">Sin asignar</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
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

<<<<<<< HEAD
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
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                <th className="px-6 py-3 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Ticket</th>
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
                    <Badge className={`${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].textColor} border-0 text-xs`}>
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {ticket.createdBy.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="h-4 w-4 text-[#dadce0] group-hover:text-[#1a73e8] transition-colors ml-auto" />
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#5f6368]">
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
=======
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input
                placeholder="Buscar tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="OPEN">Abiertos</SelectItem>
                  <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                  <SelectItem value="RESOLVED">Resueltos</SelectItem>
                  <SelectItem value="CLOSED">Cerrados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Por fecha</SelectItem>
                  <SelectItem value="priority">Por prioridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#5f6368]">Ticket</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#5f6368]">Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#5f6368]">Prioridad</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#5f6368]">Asignado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#5f6368]">Fecha</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#5f6368]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#f1f3f4] rounded-full flex items-center justify-center mb-3">
                          <Search className="h-8 w-8 text-[#dadce0]" />
                        </div>
                        <p className="text-[#5f6368]">No se encontraron tickets</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const status = statusConfig[ticket.status];
                    const priority = priorityConfig[ticket.priority];
                    const assignee = teamMembers.find(m => m.id === ticket.assignedTo);
                    
                    return (
                      <tr 
                        key={ticket.id} 
                        className="border-b border-[#dadce0] hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                        onClick={() => onViewTicket(ticket)}
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-[#202124]">{ticket.title}</p>
                            <p className="text-sm text-[#5f6368] line-clamp-1">{ticket.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={`${status.bgColor} ${status.textColor} border-0`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={`${priority.color} ${priority.bgColor} border-0`}>
                            {priority.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#1a73e8] rounded-full flex items-center justify-center text-white text-xs">
                                {getInitials(assignee.name)}
                              </div>
                              <span className="text-sm text-[#202124]">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#80868b]">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-[#5f6368]">
                            {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewTicket(ticket); }}>
                                Ver detalles
                              </DropdownMenuItem>
                              {user.role === 'EMPRESA' && (
                                <>
                                  <DropdownMenuItem onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onUpdateTicket(ticket.id, { status: 'IN_PROGRESS' }); 
                                  }}>
                                    Marcar en progreso
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onUpdateTicket(ticket.id, { status: 'RESOLVED' }); 
                                  }}>
                                    Marcar resuelto
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-[#5f6368]">
        Mostrando {filteredTickets.length} de {tickets.length} tickets
      </p>
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
    </div>
  );
}
