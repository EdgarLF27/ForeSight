import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'bg-destructive', textColor: 'text-destructive', bgColor: 'bg-destructive/10' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-amber-500', textColor: 'text-amber-500', bgColor: 'bg-amber-50' },
  RESOLVED: { label: 'Resuelto', color: 'bg-emerald-500', textColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  CLOSED: { label: 'Cerrado', color: 'bg-slate-500', textColor: 'text-slate-500', bgColor: 'bg-slate-50' },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-emerald-500' },
  MEDIUM: { label: 'Media', color: 'bg-amber-500' },
  HIGH: { label: 'Alta', color: 'bg-destructive' },
  URGENT: { label: 'Urgente', color: 'bg-destructive' },
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Únete a una empresa</h2>
              <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                Para comenzar a usar <span className="text-primary font-bold">ForeSight</span>, necesitas unirte a una organización usando un código de invitación válido.
              </p>
              
              {joinError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-destructive/10 text-destructive rounded-2xl text-sm font-bold border border-destructive/20"
                >
                  {joinError}
                </motion.div>
              )}
              
              {joinSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-emerald-700 text-xl font-black mb-1">¡Bienvenido!</p>
                  <p className="text-sm text-emerald-600 font-bold opacity-75">Recarga la página para comenzar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative group">
                    <Input
                      placeholder="CÓDIGO"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="text-center text-3xl tracking-[0.5em] font-black h-16 rounded-2xl border-2 border-border focus:border-primary transition-all bg-slate-50/50 uppercase"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-blue-700 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
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
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Mis Tickets</h1>
          <p className="text-muted-foreground font-semibold text-lg">Gestiona tus reportes y solicitudes personales</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-700 rounded-2xl shadow-xl shadow-primary/20 h-14 px-8 text-lg font-black transition-all hover:scale-105 active:scale-95">
              <Plus className="h-6 w-6 mr-2 stroke-[3px]" />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
             <div className="bg-primary p-8 text-white relative">
                <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
                  <Ticket size={120} />
                </div>
                <DialogTitle className="text-2xl font-black">Reportar Problema</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 font-bold">
                  Cuéntanos qué sucede para ayudarte pronto.
                </DialogDescription>
              </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground ml-1 uppercase tracking-wider">¿Qué sucede?</label>
                <Input
                  placeholder="Título descriptivo del problema"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="h-14 bg-slate-50/50 border-border text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground ml-1 uppercase tracking-wider">Detalles</label>
                <textarea
                  placeholder="Describe el problema con el mayor detalle posible..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full h-40 px-4 py-4 border border-border rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary text-base transition-all bg-slate-50/50 resize-none font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-foreground ml-1 uppercase tracking-wider">Área</label>
                  <select
                    value={newTicket.areaId}
                    onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                    className="w-full h-14 px-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50 cursor-pointer font-bold appearance-none"
                  >
                    <option value="">Selecciona área</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-foreground ml-1 uppercase tracking-wider">Urgencia</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full h-14 px-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50 cursor-pointer font-bold appearance-none"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-2xl h-14 px-8 font-black text-muted-foreground">
                  Cancelar
                </Button>
                <Button 
                  className="bg-primary hover:bg-blue-700 rounded-2xl h-14 px-12 font-black text-lg shadow-xl shadow-primary/20"
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
        <StatSummaryCard label="Abiertos" count={ticketsByStatus.OPEN.length} icon={<AlertCircle className="h-6 w-6 text-destructive" />} color="bg-destructive/10" />
        <StatSummaryCard label="En progreso" count={ticketsByStatus.IN_PROGRESS.length} icon={<Clock className="h-6 w-6 text-amber-500" />} color="bg-amber-50" />
        <StatSummaryCard label="Resueltos" count={ticketsByStatus.RESOLVED.length} icon={<CheckCircle className="h-6 w-6 text-emerald-500" />} color="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Column title="Por Atender" icon={<AlertCircle className="h-5 w-5 text-destructive" />} count={ticketsByStatus.OPEN.length} tickets={ticketsByStatus.OPEN} onViewTicket={onViewTicket} />
        <Column title="Trabajando" icon={<Clock className="h-5 w-5 text-amber-500" />} count={ticketsByStatus.IN_PROGRESS.length} tickets={ticketsByStatus.IN_PROGRESS} onViewTicket={onViewTicket} />
        <Column title="Finalizados" icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} count={ticketsByStatus.RESOLVED.length} tickets={ticketsByStatus.RESOLVED} onViewTicket={onViewTicket} />
      </div>
    </div>
  );
}

function StatSummaryCard({ label, count, icon, color }: { label: string, count: number, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden hover:scale-[1.02] transition-transform cursor-default">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
            {icon}
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{count}</p>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Column({ title, icon, count, tickets, onViewTicket }: { title: string, icon: React.ReactNode, count: number, tickets: TicketType[], onViewTicket: (t: TicketType) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border">
            {icon}
          </div>
          <h2 className="font-black text-foreground uppercase tracking-widest text-sm">{title}</h2>
        </div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black px-3 py-1 rounded-lg">{count}</Badge>
      </div>
      
      <div className="space-y-4 min-h-[200px] p-2 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-border/50">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TicketCard ticket={ticket} onClick={() => onViewTicket(ticket)} />
          </motion.div>
        ))}
        {tickets.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-sm opacity-50">
              <Ticket className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-muted-foreground/40">Sin actividades</p>
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
      className="p-6 bg-white dark:bg-slate-900 border border-border/50 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/20 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity -mr-4 -mt-4`}>
        <Ticket size={64} />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${priority.color} shadow-sm ring-4 ring-white dark:ring-slate-900`} />
           <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{priority.label}</span>
        </div>
        <span className="text-[10px] font-black text-muted-foreground/50">{new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
      </div>

      <h3 className="font-black text-foreground group-hover:text-primary transition-colors text-base mb-2 line-clamp-2 leading-tight">
        {ticket.title}
      </h3>
      
      <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-4 leading-relaxed">{ticket.description}</p>
      
      {ticket.area && (
        <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/5 w-fit px-3 py-1 rounded-xl font-black uppercase tracking-wider">
          <MapPin className="h-3 w-3" />
          <span>{ticket.area.name}</span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="flex -space-x-2">
           <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white">
             {ticket.createdBy.name[0]}
           </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
