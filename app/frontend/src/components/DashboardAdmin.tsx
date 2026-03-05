import { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Users, 
  Building2, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Ticket as TicketType, User, Company } from '@/types';

interface DashboardAdminProps {
  user: User;
  company: Company | null;
  tickets: TicketType[];
  onCreateTicket: (ticket: any) => void;
  onViewTicket: (ticket: TicketType) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

export function DashboardAdmin({ 
  user, 
  company, 
  tickets, 
  onCreateTicket, 
  onViewTicket 
}: DashboardAdminProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    // LIMPIEZA DE DATOS: Solo enviamos lo que el DTO espera
    onCreateTicket({
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category,
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              )}
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}

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
