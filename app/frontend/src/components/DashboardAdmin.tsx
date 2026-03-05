import { useState } from 'react';
import { 
  Ticket, 
<<<<<<< HEAD
  Plus, 
  Users, 
  Building2, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
=======
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  MoreVertical,
  Search
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
<<<<<<< HEAD
  Dialog,
  DialogContent,
  DialogDescription,
=======
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
<<<<<<< HEAD
import type { Ticket as TicketType, User, Company } from '@/types';

interface DashboardAdminProps {
  user: User;
  company: Company | null;
  tickets: TicketType[];
  onCreateTicket: (ticket: any) => void;
=======
import type { Ticket as TicketType, User, Company, TicketStatus } from '@/types';

interface DashboardAdminProps {
  user: User;
  company: Company;
  tickets: TicketType[];
  teamMembers: User[];
  onCreateTicket: (ticket: Omit<TicketType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTicket: (id: string, updates: Partial<TicketType>) => void;
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  onViewTicket: (ticket: TicketType) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

<<<<<<< HEAD
=======
const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-[#34a853]' },
  MEDIUM: { label: 'Media', color: 'bg-[#f9ab00]' },
  HIGH: { label: 'Alta', color: 'bg-[#ea4335]' },
  URGENT: { label: 'Urgente', color: 'bg-[#ea4335]' },
};

>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
export function DashboardAdmin({ 
  user, 
  company, 
  tickets, 
<<<<<<< HEAD
  onCreateTicket, 
  onViewTicket 
}: DashboardAdminProps) {
=======
  teamMembers, 
  onCreateTicket, 
  onUpdateTicket,
  onViewTicket 
}: DashboardAdminProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
<<<<<<< HEAD
  });

=======
    assignedTo: '',
  });

  // Estadísticas
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

<<<<<<< HEAD
  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    // LIMPIEZA DE DATOS: Solo enviamos lo que el DTO espera
    onCreateTicket({
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category,
=======
  // Filtrar tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Tickets recientes (últimos 5)
  const recentTickets = filteredTickets.slice(0, 5);

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    onCreateTicket({
      ...newTicket,
      status: 'OPEN',
      createdBy: user.id,
      companyId: company.id,
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
=======
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-semibold text-[#202124]">Panel de Control</h1>
          <p className="text-[#5f6368]">Gestiona los tickets de {company?.name}</p>
        </div>
        <div className="flex gap-2">
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
                  Completa los campos para registrar una nueva solicitud de soporte en el sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-[#202124]">Título</label>
                  <Input
                    placeholder="Título descriptivo"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#202124]">Descripción</label>
                  <textarea
                    placeholder="Detalles del problema..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] min-h-[100px] resize-none"
                  />
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
=======
          <h1 className="text-2xl font-semibold text-[#202124]">Dashboard</h1>
          <p className="text-[#5f6368]">Bienvenido de vuelta, {user.name}</p>
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
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-[#202124]">Título</label>
                <Input
                  placeholder="¿Qué problema necesitas reportar?"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#202124]">Descripción</label>
                <textarea
                  placeholder="Describe el problema en detalle..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#dadce0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] min-h-[100px] resize-none"
                />
              </div>
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<<<<<<< HEAD
        <StatCard title="Total Tickets" value={stats.total} icon={<Ticket className="h-5 w-5 text-[#1a73e8]" />} color="bg-[#e8f0fe]" />
        <StatCard title="Abiertos" value={stats.open} icon={<AlertCircle className="h-5 w-5 text-[#ea4335]" />} color="bg-[#fce8e6]" />
        <StatCard title="En Progreso" value={stats.inProgress} icon={<Clock className="h-5 w-5 text-[#f9ab00]" />} color="bg-[#fef3e8]" />
        <StatCard title="Resueltos" value={stats.resolved} icon={<CheckCircle className="h-5 w-5 text-[#34a853]" />} color="bg-[#e6f4ea]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#5f6368]" />
              Tickets Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => onViewTicket(ticket)}
                  className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-[#dadce0] hover:bg-gray-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[ticket.status].color}`} />
                    <div>
                      <p className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors">{ticket.title}</p>
                      <p className="text-xs text-[#5f6368]">
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES')} • {ticket.createdBy.name}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].textColor} border-0 text-xs`}>
                    {statusConfig[ticket.status].label}
                  </Badge>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-8 text-[#5f6368]">
                  No hay tickets registrados
                </div>
=======
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6368]">Total Tickets</p>
                <p className="text-3xl font-semibold text-[#202124] mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-[#e8f0fe] rounded-xl flex items-center justify-center">
                <Ticket className="h-6 w-6 text-[#1a73e8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6368]">Abiertos</p>
                <p className="text-3xl font-semibold text-[#ea4335] mt-1">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-[#fce8e6] rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#ea4335]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6368]">En Progreso</p>
                <p className="text-3xl font-semibold text-[#f9ab00] mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-[#fef3e8] rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#f9ab00]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6368]">Resueltos</p>
                <p className="text-3xl font-semibold text-[#34a853] mt-1">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-[#e6f4ea] rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#34a853]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-[#202124]">Tickets Recientes</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
                  <Input
                    placeholder="Buscar tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                >
                  <option value="ALL">Todos</option>
                  <option value="OPEN">Abiertos</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="RESOLVED">Resueltos</option>
                  <option value="CLOSED">Cerrados</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-[#dadce0] mx-auto mb-3" />
                  <p className="text-[#5f6368]">No hay tickets para mostrar</p>
                </div>
              ) : (
                recentTickets.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  const priority = priorityConfig[ticket.priority];
                  const assignee = teamMembers.find(m => m.id === ticket.assignedTo);
                  
                  return (
                    <div 
                      key={ticket.id} 
                      onClick={() => onViewTicket(ticket)}
                      className="p-4 border border-[#dadce0] rounded-xl hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors truncate">
                              {ticket.title}
                            </h3>
                            <Badge className={`${status.bgColor} ${status.textColor} border-0 text-xs`}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#5f6368] line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-xs text-[#5f6368]">
                              <span className={`w-2 h-2 rounded-full ${priority.color}`} />
                              {priority.label}
                            </span>
                            <span className="text-xs text-[#80868b]">
                              {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                            </span>
                            {assignee && (
                              <span className="text-xs text-[#5f6368] flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {assignee.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewTicket(ticket); }}>
                              Ver detalles
                            </DropdownMenuItem>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
              )}
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        {/* Info Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#5f6368]" />
                Mi Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#202124]">{company?.name}</p>
                <div className="flex items-center justify-between p-2 bg-[#f8f9fa] rounded-lg border border-[#dadce0]">
                  <span className="text-xs text-[#5f6368]">Código:</span>
                  <span className="text-sm font-mono font-bold text-[#1a73e8]">{company?.inviteCode}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-[#5f6368]" />
                Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#5f6368]">Gestiona los miembros de tu organización.</p>
              <Button variant="outline" className="w-full mt-4 text-[#1a73e8] border-[#1a73e8] hover:bg-[#e8f0fe]">
                Ver Miembros
              </Button>
            </CardContent>
          </Card>
        </div>
=======
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#202124]">Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a73e8] to-[#4285f4] rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#202124] text-sm truncate">{member.name}</p>
                    <p className="text-xs text-[#5f6368] truncate">{member.email}</p>
                  </div>
                  <Badge variant={member.role === 'EMPRESA' ? 'default' : 'secondary'} className="text-xs">
                    {member.role === 'EMPRESA' ? 'Admin' : 'Miembro'}
                  </Badge>
                </div>
              ))}
            </div>
            
            {/* Invite Code */}
            <div className="mt-6 p-4 bg-[#e8f0fe] rounded-xl">
              <p className="text-sm font-medium text-[#1a73e8] mb-2">Código de invitación</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded-lg text-lg font-mono text-[#202124] tracking-widest">
                  {company.inviteCode}
                </code>
              </div>
              <p className="text-xs text-[#5f6368] mt-2">
                Comparte este código para que nuevos empleados se unan
              </p>
            </div>
          </CardContent>
        </Card>
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      </div>
    </div>
  );
}
<<<<<<< HEAD

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold text-[#202124]">{value}</p>
          <p className="text-xs text-[#5f6368] font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
=======
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
