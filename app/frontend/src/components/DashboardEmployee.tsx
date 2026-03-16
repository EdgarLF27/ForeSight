import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  MapPin,
  ChevronRight,
  Inbox
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

interface DashboardEmployeeProps {
  company: Company | null;
  tickets: TicketType[];
  areas: Area[];
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: TicketType) => void;
  onJoinCompany: (code: string) => Promise<boolean>;
}

const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  OPEN: { label: 'Abierto', variant: 'destructive' },
  IN_PROGRESS: { label: 'En progreso', variant: 'warning' },
  RESOLVED: { label: 'Resuelto', variant: 'success' },
  CLOSED: { label: 'Cerrado', variant: 'secondary' },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'text-muted-foreground' },
  MEDIUM: { label: 'Media', color: 'text-primary' },
  HIGH: { label: 'Alta', color: 'text-amber-500' },
  URGENT: { label: 'Urgente', color: 'text-destructive' },
};

export function DashboardEmployee({ 
  company, 
  tickets, 
  areas,
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
    areaId: '',
  });

  if (!company) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Building2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Únete a una empresa</h2>
              <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                Para comenzar a usar <span className="text-primary font-bold">ForeSight</span>, necesitas unirte a una organización usando un código de invitación.
              </p>
              
              {joinError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-bold border border-destructive/20"
                >
                  {joinError}
                </motion.div>
              )}
              
              {joinSuccess ? (
                <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4" strokeWidth={2} />
                  <p className="text-foreground text-lg font-bold mb-1">¡Bienvenido!</p>
                  <p className="text-sm text-emerald-500 font-bold">Recarga la página para comenzar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative group">
                    <Input
                      placeholder="CÓDIGO"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="text-center text-2xl tracking-[0.4em] font-bold h-14 rounded-xl border-border bg-muted/30 focus:ring-primary/20 transition-all uppercase"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all"
                    onClick={async () => {
                      setJoinError('');
                      if (!joinCode) {
                        setJoinError('Por favor ingresa un código');
                        return;
                      }
                      const success = await onJoinCompany(joinCode);
                      if (success) {
                        setJoinSuccess(true);
                        toast.success('¡Te has unido exitosamente!');
                      } else {
                        setJoinError('Código de invitación inválido');
                      }
                    }}
                  >
                    Unirse ahora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const ticketsByStatus = {
    OPEN: tickets.filter(t => t.status === 'OPEN'),
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS'),
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED'),
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description || !company) return;

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
    <div className="space-y-10 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis Tickets</h1>
          <p className="text-muted-foreground font-medium text-base">Gestiona tus reportes y solicitudes personales</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 h-12 px-6 text-base font-bold transition-all">
              <Plus className="h-5 w-5 mr-2" strokeWidth={2} />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-3xl border-border shadow-2xl p-0 overflow-hidden bg-card">
             <div className="bg-primary p-8 text-primary-foreground relative">
                <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
                  <Ticket size={120} strokeWidth={1} />
                </div>
                <DialogTitle className="text-2xl font-bold">Reportar Problema</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">
                  Cuéntanos qué sucede para ayudarte pronto.
                </DialogDescription>
              </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 ml-1">¿Qué sucede?</label>
                <Input
                  placeholder="Título descriptivo del problema"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="h-11 bg-muted/30 border-border rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 ml-1">Detalles</label>
                <textarea
                  placeholder="Describe el problema con el mayor detalle posible..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full h-40 px-4 py-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base transition-all bg-muted/30 resize-none font-normal text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 ml-1">Área</label>
                  <select
                    value={newTicket.areaId}
                    onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                    className="w-full h-11 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 cursor-pointer font-bold appearance-none text-foreground"
                  >
                    <option value="">Selecciona área</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 ml-1">Urgencia</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full h-11 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 cursor-pointer font-bold appearance-none text-foreground"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold text-muted-foreground">
                  Cancelar
                </Button>
                <Button 
                  className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-10 font-bold"
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title || !newTicket.description}
                >
                  Enviar Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatSummaryCard label="Abiertos" count={ticketsByStatus.OPEN.length} icon={<AlertCircle className="h-5 w-5 text-destructive" strokeWidth={2} />} />
        <StatSummaryCard label="En progreso" count={ticketsByStatus.IN_PROGRESS.length} icon={<Clock className="h-5 w-5 text-amber-500" strokeWidth={2} />} />
        <StatSummaryCard label="Resueltos" count={ticketsByStatus.RESOLVED.length} icon={<CheckCircle className="h-5 w-5 text-emerald-500" strokeWidth={2} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Column title="Por Atender" icon={<AlertCircle className="h-4 w-4 text-destructive" strokeWidth={2} />} count={ticketsByStatus.OPEN.length} tickets={ticketsByStatus.OPEN} onViewTicket={onViewTicket} />
        <Column title="En Proceso" icon={<Clock className="h-4 w-4 text-amber-500" strokeWidth={2} />} count={ticketsByStatus.IN_PROGRESS.length} tickets={ticketsByStatus.IN_PROGRESS} onViewTicket={onViewTicket} />
        <Column title="Finalizados" icon={<CheckCircle className="h-4 w-4 text-emerald-500" strokeWidth={2} />} count={ticketsByStatus.RESOLVED.length} tickets={ticketsByStatus.RESOLVED} onViewTicket={onViewTicket} />
      </div>
    </div>
  );
}

function StatSummaryCard({ label, count, icon }: { label: string, count: number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
            {icon}
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{count}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Column({ title, icon, count, tickets, onViewTicket }: { title: string, icon: React.ReactNode, count: number, tickets: TicketType[], onViewTicket: (t: TicketType) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-card rounded-lg shadow-sm border border-border">
            {icon}
          </div>
          <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{title}</h2>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-md text-[10px]">{count}</Badge>
      </div>
      
      <div className="space-y-4 min-h-[300px] p-1 rounded-2xl">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <TicketCard ticket={ticket} onClick={() => onViewTicket(ticket)} />
          </motion.div>
        ))}
        {tickets.length === 0 && (
          <div className="py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-border">
            <Inbox className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Sin actividades</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: TicketType; onClick: () => void }) {
  const priority = priorityConfig[ticket.priority];

  return (
    <div 
      onClick={onClick}
      className="p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${
        ticket.priority === 'URGENT' ? 'bg-destructive' : 
        ticket.priority === 'HIGH' ? 'bg-amber-500' : 
        ticket.priority === 'MEDIUM' ? 'bg-primary' : 'bg-muted'
      }`} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
           <span className={`text-[10px] font-bold uppercase tracking-wider ${priority.color}`}>{priority.label}</span>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
      </div>

      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm mb-2 line-clamp-1">
        {ticket.title}
      </h3>
      
      <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-4 leading-relaxed">{ticket.description}</p>
      
      <div className="flex items-center justify-between">
        {ticket.area ? (
          <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold">
            <MapPin className="h-3 w-3" />
            <span>{ticket.area.name}</span>
          </div>
        ) : <div />}

        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold uppercase">Ver más</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
