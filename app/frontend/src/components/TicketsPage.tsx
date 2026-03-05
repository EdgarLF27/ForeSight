import { useState } from 'react';
import { 
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Ticket, UserStatus } from '@/types';

interface TicketsPageProps {
  tickets: Ticket[];
  onCreateTicket: (ticket: any) => void;
  onViewTicket: (ticket: Ticket) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

export function TicketsPage({ tickets, onCreateTicket, onViewTicket }: TicketsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
  });

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">Tickets</h1>
          <p className="text-[#5f6368]">Listado completo de incidencias y solicitudes</p>
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
    </div>
  );
}
