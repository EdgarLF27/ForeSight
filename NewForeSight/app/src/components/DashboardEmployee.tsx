import { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Ticket as TicketType, User, Company } from '@/types';

interface DashboardEmployeeProps {
  user: User;
  company: Company | null;
  tickets: TicketType[];
  onCreateTicket: (ticket: Omit<TicketType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onViewTicket: (ticket: TicketType) => void;
  onJoinCompany: (code: string) => boolean;
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

export function DashboardEmployee({ 
  user, 
  company, 
  tickets, 
  onCreateTicket, 
  onViewTicket,
  onJoinCompany 
}: DashboardEmployeeProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
  });

  // Si el usuario no tiene empresa, mostrar pantalla de unión
  if (!company) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-[#e8f0fe] rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-[#1a73e8]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#202124] mb-2">Únete a una empresa</h2>
            <p className="text-[#5f6368] mb-6">
              Para comenzar a usar TicketClass, necesitas unirte a una empresa usando un código de invitación.
            </p>
            
            {joinError && (
              <div className="mb-4 p-3 bg-[#fce8e6] text-[#ea4335] rounded-lg text-sm">
                {joinError}
              </div>
            )}
            
            {joinSuccess ? (
              <div className="p-4 bg-[#e6f4ea] rounded-lg">
                <CheckCircle className="h-8 w-8 text-[#34a853] mx-auto mb-2" />
                <p className="text-[#34a853] font-medium">¡Te has unido exitosamente!</p>
                <p className="text-sm text-[#5f6368] mt-1">Recarga la página para continuar</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  placeholder="Ingresa el código de invitación"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl tracking-widest font-mono uppercase"
                  maxLength={6}
                />
                <Button 
                  className="w-full bg-[#1a73e8] hover:bg-[#1557b0]"
                  onClick={() => {
                    setJoinError('');
                    if (!joinCode) {
                      setJoinError('Por favor ingresa un código');
                      return;
                    }
                    const success = onJoinCompany(joinCode);
                    if (success) {
                      setJoinSuccess(true);
                    } else {
                      setJoinError('Código de invitación inválido');
                    }
                  }}
                >
                  Unirse a la empresa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Agrupar tickets por estado
  const ticketsByStatus = {
    OPEN: tickets.filter(t => t.status === 'OPEN'),
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS'),
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED'),
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description || !company) return;

    onCreateTicket({
      ...newTicket,
      status: 'OPEN',
      createdBy: user.id,
      companyId: company.id,
      attachments: [],
    });

    setNewTicket({
      title: '',
      description: '',
      priority: 'MEDIUM',
      category: 'General',
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Mis Tickets</h1>
          <p className="text-[#5f6368]">Gestiona tus reportes y solicitudes</p>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-[#ea4335]">{ticketsByStatus.OPEN.length}</p>
            <p className="text-sm text-[#5f6368]">Abiertos</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-[#f9ab00]">{ticketsByStatus.IN_PROGRESS.length}</p>
            <p className="text-sm text-[#5f6368]">En progreso</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-[#34a853]">{ticketsByStatus.RESOLVED.length}</p>
            <p className="text-sm text-[#5f6368]">Resueltos</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Tickets */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-[#ea4335]" />
            <h2 className="font-semibold text-[#202124]">Abiertos</h2>
            <Badge variant="secondary" className="ml-auto">{ticketsByStatus.OPEN.length}</Badge>
          </div>
          <div className="space-y-3">
            {ticketsByStatus.OPEN.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onClick={() => onViewTicket(ticket)} 
              />
            ))}
            {ticketsByStatus.OPEN.length === 0 && (
              <EmptyState message="No hay tickets abiertos" />
            )}
          </div>
        </div>

        {/* In Progress Tickets */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-[#f9ab00]" />
            <h2 className="font-semibold text-[#202124]">En Progreso</h2>
            <Badge variant="secondary" className="ml-auto">{ticketsByStatus.IN_PROGRESS.length}</Badge>
          </div>
          <div className="space-y-3">
            {ticketsByStatus.IN_PROGRESS.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onClick={() => onViewTicket(ticket)} 
              />
            ))}
            {ticketsByStatus.IN_PROGRESS.length === 0 && (
              <EmptyState message="No hay tickets en progreso" />
            )}
          </div>
        </div>

        {/* Resolved Tickets */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-[#34a853]" />
            <h2 className="font-semibold text-[#202124]">Resueltos</h2>
            <Badge variant="secondary" className="ml-auto">{ticketsByStatus.RESOLVED.length}</Badge>
          </div>
          <div className="space-y-3">
            {ticketsByStatus.RESOLVED.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onClick={() => onViewTicket(ticket)} 
              />
            ))}
            {ticketsByStatus.RESOLVED.length === 0 && (
              <EmptyState message="No hay tickets resueltos" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: TicketType; onClick: () => void }) {
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  return (
    <div 
      onClick={onClick}
      className="p-4 bg-white border border-[#dadce0] rounded-xl hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <Badge className={`${status.bgColor} ${status.textColor} border-0 text-xs`}>
          {status.label}
        </Badge>
        <span className={`w-2 h-2 rounded-full ${priority.color}`} title={`Prioridad: ${priority.label}`} />
      </div>
      <h3 className="font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors text-sm mb-1 line-clamp-2">
        {ticket.title}
      </h3>
      <p className="text-xs text-[#5f6368] line-clamp-2 mb-3">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-[#80868b]">
        <span>{new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 border border-dashed border-[#dadce0] rounded-xl text-center">
      <Ticket className="h-8 w-8 text-[#dadce0] mx-auto mb-2" />
      <p className="text-sm text-[#5f6368]">{message}</p>
    </div>
  );
}
