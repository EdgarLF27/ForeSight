import { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Building2, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin
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

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
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

  // Filtrar tickets para estadísticas y lista basándose en el rol
  const visibleTickets = tickets.filter(ticket => {
    if (isAdmin) return true;
    if (isTechnician) {
      return !ticket.assignedToId || ticket.assignedToId === currentUser.id;
    }
    return false; // Por seguridad, aunque DashboardAdmin solo se muestra a Admin/Técnico
  });

  const stats = {
    total: visibleTickets.length,
    open: visibleTickets.filter(t => t.status === 'OPEN').length,
    inProgress: visibleTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: visibleTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const canCreateTicket = isAdmin; // Solo administradores pueden crear desde este panel (o Empleados desde su panel)
  // Nota: El usuario pidió que el técnico NO pueda crearlos. El admin sí debería poder.

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground font-medium">Gestiona los tickets de {company?.name}</p>
        </div>
        {canCreateTicket && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-700 rounded-2xl shadow-lg shadow-primary/20 h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95">
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-primary p-8 text-white relative">
                <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
                  <Ticket size={120} />
                </div>
                <DialogTitle className="text-2xl font-black">Nueva Incidencia</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">
                  Registra un nuevo ticket en el sistema.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Título</label>
                  <Input
                    placeholder="Título descriptivo"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="h-12 bg-slate-50/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Descripción</label>
                  <textarea
                    placeholder="Detalles del problema..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full h-32 px-4 py-3 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-base transition-all bg-slate-50/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground ml-1">Área (opcional)</label>
                    <select
                      value={newTicket.areaId}
                      onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                      className="w-full h-12 px-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50 cursor-pointer font-medium appearance-none"
                    >
                      <option value="">Selecciona área</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground ml-1">Prioridad</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full h-12 px-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50 cursor-pointer font-medium appearance-none"
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
                    className="bg-primary hover:bg-blue-700 rounded-xl h-12 px-10 font-bold shadow-lg shadow-primary/20"
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
        <StatCard title="Total Tickets" value={stats.total} icon={<Ticket className="h-6 w-6 text-primary" />} color="bg-primary/10" />
        <StatCard title="Abiertos" value={stats.open} icon={<AlertCircle className="h-6 w-6 text-destructive" />} color="bg-destructive/10" />
        <StatCard title="En Progreso" value={stats.inProgress} icon={<Clock className="h-6 w-6 text-amber-500" />} color="bg-amber-50" />
        <StatCard title="Resueltos" value={stats.resolved} icon={<CheckCircle className="h-6 w-6 text-emerald-500" />} color="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-border p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              Tickets Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {visibleTickets.slice(0, 6).map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => onViewTicket(ticket)}
                  className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[ticket.status].color} shadow-sm ring-4 ring-white dark:ring-slate-900`} />
                    <div>
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{ticket.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                        </span>
                        <span>•</span>
                        <span>{typeof ticket.createdBy === 'object' ? ticket.createdBy.name : 'Usuario'}</span>
                        {ticket.area && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                              <MapPin className="h-3 w-3" />
                              {ticket.area.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].textColor} border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl`}>
                    {statusConfig[ticket.status].label}
                  </Badge>
                </div>
              ))}
              {visibleTickets.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border">
                    <Ticket className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground font-bold">No hay tickets registrados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary to-blue-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 font-bold opacity-90">
                <Building2 className="h-5 w-5" />
                Mi Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-2xl font-black">{company?.name}</p>
                  <p className="text-sm opacity-70 font-medium">
                    {isAdmin ? 'Panel de administración' : 'Información de la empresa'}
                  </p>
                </div>
                {isAdmin && (
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Código de Invitación</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-mono font-black tracking-widest">{company?.inviteCode}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/20 text-white rounded-lg">
                        <BarChart3 className="h-4 w-4" />
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
