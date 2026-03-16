import { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Building2, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  ChevronRight
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
import type { Ticket as TicketType, Company, Area } from '@/types';

import { toast } from 'sonner';

interface DashboardAdminProps {
  company: Company | null;
  tickets: TicketType[];
  areas: Area[];
  currentUser: any;
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onUpdateTicket: (ticketId: string, updates: any) => void;
  onViewTicket: (ticket: TicketType) => void;
}

const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  OPEN: { label: 'Abierto', variant: 'destructive' },
  IN_PROGRESS: { label: 'En progreso', variant: 'warning' },
  RESOLVED: { label: 'Resuelto', variant: 'success' },
  CLOSED: { label: 'Secondary' },
};

export function DashboardAdmin({ 
  company, 
  tickets, 
  areas,
  currentUser,
  onCreateTicket, 
  onViewTicket 
}: DashboardAdminProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
    areaId: '',
  });

  const isAdmin = currentUser.role === 'Administrador' || (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Administrador') || currentUser.role === 'EMPRESA';
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Técnico');

  const visibleTickets = tickets.filter(ticket => {
    if (isAdmin) return true;
    if (isTechnician) {
      return !ticket.assignedToId || ticket.assignedToId === currentUser.id;
    }
    return false;
  });

  const stats = {
    total: visibleTickets.length,
    open: visibleTickets.filter(t => t.status === 'OPEN').length,
    inProgress: visibleTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: visibleTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const canCreateTicket = isAdmin;

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) return;

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
    <div className="space-y-8 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground">Gestiona los tickets de {company?.name}</p>
        </div>
        {canCreateTicket && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-sm h-11 px-6 font-semibold transition-all">
                <Plus className="h-5 w-5 mr-2" strokeWidth={2} />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl border-border bg-card shadow-lg p-0 overflow-hidden">
               <div className="bg-primary p-8 text-primary-foreground relative">
                <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
                  <Ticket size={120} strokeWidth={1} />
                </div>
                <DialogTitle className="text-2xl font-bold">Nueva Incidencia</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1">
                  Registra un nuevo ticket en el sistema.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1">Título</label>
                  <Input
                    placeholder="Título descriptivo"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="h-11 bg-muted/50 border-border rounded-xl focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1">Descripción</label>
                  <textarea
                    placeholder="Detalles del problema..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full h-32 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base transition-all bg-muted/50 resize-none font-normal text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Área (opcional)</label>
                    <select
                      value={newTicket.areaId}
                      onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                      className="w-full h-11 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/50 cursor-pointer font-medium appearance-none text-foreground"
                    >
                      <option value="">Selecciona área</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Prioridad</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full h-11 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/50 cursor-pointer font-medium appearance-none text-foreground"
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl h-11 px-6 font-semibold">
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-10 font-semibold"
                    onClick={handleCreateTicket}
                    disabled={!newTicket.title || !newTicket.description}
                  >
                    Crear ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tickets" value={stats.total} icon={<Ticket className="h-5 w-5 text-primary" strokeWidth={2} />} />
        <StatCard title="Abiertos" value={stats.open} icon={<AlertCircle className="h-5 w-5 text-destructive" strokeWidth={2} />} />
        <StatCard title="En Progreso" value={stats.inProgress} icon={<Clock className="h-5 w-5 text-amber-500" strokeWidth={2} />} />
        <StatCard title="Resueltos" value={stats.resolved} icon={<CheckCircle className="h-5 w-5 text-emerald-500" strokeWidth={2} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-md">
          <CardHeader className="border-b border-border/50 p-6 bg-muted/20">
            <CardTitle className="text-lg font-bold flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" strokeWidth={2} />
              Tickets Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {visibleTickets.slice(0, 6).map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => onViewTicket(ticket)}
                  className="flex items-center justify-between p-5 hover:bg-muted/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                    ticket.priority === 'URGENT' ? 'bg-destructive' : 
                    ticket.priority === 'HIGH' ? 'bg-amber-500' : 
                    ticket.priority === 'MEDIUM' ? 'bg-primary' : 'bg-muted'
                  }`} />
                  
                  <div className="flex items-center gap-4 pl-2">
                    <div>
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{ticket.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={2} />
                          {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                        </span>
                        <span>•</span>
                        <span>{typeof ticket.createdBy === 'object' ? ticket.createdBy.name : 'Usuario'}</span>
                        {ticket.area && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary font-bold">
                              <MapPin className="h-3 w-3" strokeWidth={2} />
                              {ticket.area.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusConfig[ticket.status].variant}>
                      {statusConfig[ticket.status].label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
              {visibleTickets.length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-muted w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
                    <Ticket className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                  <p className="text-muted-foreground font-medium">No hay tickets registrados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-muted/20 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-foreground">
                <Building2 className="h-5 w-5 text-primary" strokeWidth={2} />
                Mi Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{company?.name}</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {isAdmin ? 'Panel de administración' : 'Información de la empresa'}
                  </p>
                </div>
                {isAdmin && (
                  <div className="p-4 bg-muted/50 rounded-xl border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Código de Invitación</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-bold tracking-widest text-primary">{company?.inviteCode}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted text-muted-foreground rounded-lg">
                        <BarChart3 className="h-4 w-4" strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6 flex items-center gap-5 relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
           {icon}
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/50 border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
