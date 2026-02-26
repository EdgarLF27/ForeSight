import { useState } from 'react';
import { 
  Ticket, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  MoreVertical,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import type { Ticket as TicketType, User, Company, TicketStatus } from '@/types';

interface DashboardAdminProps {
  user: User;
  company: Company;
  tickets: TicketType[];
  teamMembers: User[]; // Esperamos un array
  onCreateTicket: (ticket: Omit<TicketType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTicket: (id: string, updates: Partial<TicketType>) => void;
  onViewTicket: (ticket: TicketType) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-[#34a853]' },
  MEDIUM: { label: 'Media', color: 'bg-[#f9ab00]' },
  HIGH: { label: 'Alta', color: 'bg-[#ea4335]' },
  URGENT: { label: 'Urgente', color: 'bg-[#ea4335]' },
};

export function DashboardAdmin({ 
  user, 
  company, 
  tickets = [], 
  teamMembers = [], // Valor por defecto para evitar el error .map
  onCreateTicket, 
  onUpdateTicket,
  onViewTicket 
}: DashboardAdminProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
    assignedTo: '',
  });

  // Asegurarnos de que teamMembers sea siempre un array antes de usarlo
  const membersList = Array.isArray(teamMembers) ? teamMembers : [];
  const ticketsList = Array.isArray(tickets) ? tickets : [];

  const stats = {
    total: ticketsList.length,
    open: ticketsList.filter(t => t.status === 'OPEN').length,
    inProgress: ticketsList.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: ticketsList.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const filteredTickets = ticketsList.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const recentTickets = filteredTickets.slice(0, 5);

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;
    onCreateTicket({
      ...newTicket,
      status: 'OPEN',
      createdBy: user.id,
      companyId: company.id,
      attachments: [],
    });
    setNewTicket({ title: '', description: '', priority: 'MEDIUM', category: 'General', assignedTo: '' });
    setIsCreateDialogOpen(false);
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Dashboard</h1>
          <p className="text-[#5f6368]">Bienvenido de vuelta, {user.firstName} {user.lastName}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#1a73e8] hover:bg-[#1557b0]">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={stats.total} icon={<Ticket className="text-[#1a73e8]" />} bgColor="bg-[#e8f0fe]" />
        <StatCard title="Abiertos" value={stats.open} icon={<AlertCircle className="text-[#ea4335]" />} bgColor="bg-[#fce8e6]" />
        <StatCard title="En Progreso" value={stats.inProgress} icon={<Clock className="text-[#f9ab00]" />} bgColor="bg-[#fef3e8]" />
        <StatCard title="Resueltos" value={stats.resolved} icon={<CheckCircle className="text-[#34a853]" />} bgColor="bg-[#e6f4ea]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Tickets Recientes</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No hay tickets</p>
              ) : (
                recentTickets.map((ticket) => (
                  <TicketItem key={ticket.id} ticket={ticket} members={membersList} onView={onViewTicket} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">Equipo</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {membersList.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold">
                    {getInitials(member.firstName, member.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Código de invitación</p>
              <code className="text-lg font-mono font-bold text-[#6B9E8A]">{company?.inviteCode}</code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogo de Creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <h2 className="text-xl font-bold mb-4">Nuevo Ticket</h2>
          <div className="space-y-4">
            <Input placeholder="Título" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
            <textarea placeholder="Descripción" className="w-full p-2 border rounded-md h-32" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
            <select className="w-full p-2 border rounded-md" value={newTicket.assignedTo} onChange={e => setNewTicket({...newTicket, assignedTo: e.target.value})}>
              <option value="">Asignar a...</option>
              {membersList.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
            </select>
            <Button onClick={handleCreateTicket} className="w-full bg-[#1a73e8]">Crear Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }: any) {
  return (
    <Card><CardContent className="p-6 flex items-center justify-between">
      <div><p className="text-sm text-gray-500">{title}</p><p className="text-3xl font-bold">{value}</p></div>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>{icon}</div>
    </CardContent></Card>
  );
}

function TicketItem({ ticket, members, onView }: any) {
  const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.OPEN;
  const assignee = members.find((m: any) => m.id === ticket.assignedToId);
  return (
    <div onClick={() => onView(ticket)} className="p-4 border rounded-xl hover:shadow-sm cursor-pointer transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800">{ticket.title}</h3>
        <Badge className={`${status.bgColor} ${status.textColor} border-0 text-[10px]`}>{status.label}</Badge>
      </div>
      <p className="text-xs text-gray-500 line-clamp-1 mb-3">{ticket.description}</p>
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        {assignee && <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {assignee.firstName}</span>}
      </div>
    </div>
  );
}
