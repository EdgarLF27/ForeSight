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
  Inbox,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getFileUrl } from '@/services/api';
import type { Ticket as TicketType, Company, Area } from '@/types';

interface DashboardEmployeeProps {
  company: Company | null;
  tickets: TicketType[];
  areas: Area[];
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: TicketType) => void;
  onJoinCompany: (code: string) => Promise<boolean>;
}

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
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card id="join-company-card" className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"><Building2 className="h-12 w-12 text-primary" strokeWidth={1.5} /></div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Acceso Corporativo</h2>
              <p className="text-muted-foreground font-medium mb-10 leading-relaxed italic text-sm">Introduce el código de invitación para vincularte a tu organización.</p>
              {joinError && <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-2xl text-xs font-bold border border-destructive/20 uppercase tracking-widest">{joinError}</div>}
              {joinSuccess ? (
                <div className="p-8 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-foreground text-xl font-black mb-1 uppercase tracking-tight">¡Éxito!</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">Recargando sistema...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Input id="invite-code-input" placeholder="CÓDIGO" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="text-center text-3xl tracking-[0.5em] font-black h-16 rounded-2xl border-border bg-muted/30 focus:ring-primary/20 uppercase" maxLength={6} />
                  <Button id="join-btn" className="w-full h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-xs font-black shadow-xl shadow-primary/20 uppercase tracking-[0.2em]" onClick={async () => {
                    setJoinError('');
                    if (!joinCode) return setJoinError('Código requerido');
                    const success = await onJoinCompany(joinCode);
                    if (success) { setJoinSuccess(true); setTimeout(() => window.location.reload(), 1500); }
                    else setJoinError('Código no válido');
                  }}>Vincular cuenta</Button>
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
    if (!newTicket.title || !newTicket.description) return;
    const success = await onCreateTicket(newTicket);
    if (success) {
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', category: 'General', areaId: '' });
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 px-1 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground uppercase italic">Mis Tickets</h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Centro de soporte de {company.name}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild id="create-ticket-btn">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-2xl shadow-lg shadow-primary/20 h-12 md:h-14 px-8 text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto">
              <Plus className="h-5 w-5 mr-2" strokeWidth={3} /> Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-[2rem] border-border shadow-2xl p-0 overflow-hidden bg-card mx-4 sm:mx-0">
             <div className="bg-primary p-8 md:p-10 text-primary-foreground relative">
                <div className="absolute -right-6 -top-6 opacity-10 rotate-12"><Ticket size={140} /></div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Reportar Incidencia</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 font-medium italic">Describe el problema para asignarte un técnico.</DialogDescription>
              </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Asunto</label>
                <Input placeholder="Título del problema" value={newTicket.title} onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })} className="h-12 rounded-2xl bg-muted/30 border-border font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Detalles técnicos</label>
                <textarea placeholder="Explica detalladamente lo ocurrido..." value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} className="w-full h-40 px-5 py-5 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all bg-muted/30 resize-none font-medium text-foreground" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Departamento</label>
                  <select value={newTicket.areaId} onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })} className="w-full h-12 px-4 border border-border rounded-2xl bg-muted/30 font-bold appearance-none uppercase text-[10px]">
                    <option value="">Seleccionar área</option>
                    {areas.map(area => (<option key={area.id} value={area.id}>{area.name}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Urgencia</label>
                  <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })} className="w-full h-12 px-4 border border-border rounded-2xl bg-muted/30 font-bold appearance-none uppercase text-[10px]">
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 flex-col sm:flex-row">
                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-2xl h-12 px-6 font-black text-muted-foreground uppercase text-xs">Cancelar</Button>
                <Button className="bg-primary text-primary-foreground h-12 px-10 rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20" onClick={handleCreateTicket} disabled={!newTicket.title || !newTicket.description}>Enviar Reporte</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div id="stats-overview" className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
        <StatSummaryCard label="Abiertos" count={ticketsByStatus.OPEN.length} icon={<AlertCircle className="h-6 w-6 text-destructive" />} />
        <StatSummaryCard label="En proceso" count={ticketsByStatus.IN_PROGRESS.length} icon={<Clock className="h-6 w-6 text-amber-500" />} />
        <StatSummaryCard label="Finalizados" count={ticketsByStatus.RESOLVED.length} icon={<CheckCircle className="h-6 w-6 text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10 order-2 lg:order-1">
          <Column title="Para Atender" icon={<AlertCircle className="h-4 w-4 text-destructive" />} count={ticketsByStatus.OPEN.length} tickets={ticketsByStatus.OPEN} onViewTicket={onViewTicket} />
          <Column title="Trabajando" icon={<Clock className="h-4 w-4 text-amber-500" />} count={ticketsByStatus.IN_PROGRESS.length} tickets={ticketsByStatus.IN_PROGRESS} onViewTicket={onViewTicket} />
          <Column title="Completados" icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} count={ticketsByStatus.RESOLVED.length} tickets={ticketsByStatus.RESOLVED} onViewTicket={onViewTicket} />
        </div>

        <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
          <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden group">
            <div className="h-32 bg-slate-950 relative">
               <div className="absolute -bottom-12 left-10">
                  <div className="w-24 h-24 bg-card rounded-3xl border-[6px] border-card shadow-2xl flex items-center justify-center overflow-hidden">
                    {company?.logo ? (
                      <img src={getFileUrl(company.logo) || ''} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <Building2 className="h-12 w-12 text-primary/20" />
                    )}
                  </div>
               </div>
            </div>
            <CardContent className="pt-16 pb-10 px-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">{company?.name}</h2>
                <p className="text-xs text-primary font-bold italic uppercase tracking-widest">{company?.description || 'División Corporativa'}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[10px] font-black text-primary uppercase tracking-widest">
                  <Info className="h-4 w-4" /> Sobre la Empresa
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                  {(company as any)?.information || 'Sin descripción corporativa adicional.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ label, count, icon }: { label: string, count: number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-xl bg-card hover:shadow-2xl transition-all duration-500 group rounded-[2rem] overflow-hidden border border-transparent hover:border-primary/5">
      <CardContent className="p-8 flex items-center gap-6">
        <div className="p-5 rounded-2xl bg-muted/50 border border-border group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">{icon}</div>
        <div>
          <p className="text-4xl font-black text-foreground tracking-tighter leading-none">{count}</p>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-3">{label}</p>
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
          <div className="p-2 bg-card rounded-xl shadow-sm border border-border">{icon}</div>
          <h2 className="font-black text-foreground text-[11px] uppercase tracking-[0.2em]">{title}</h2>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground font-black px-3 py-1 rounded-full text-[10px]">{count}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket, index) => (
          <motion.div key={ticket.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <div onClick={() => onViewTicket(ticket)} className="p-6 bg-card border border-border rounded-[1.75rem] shadow-md hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col">
              <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${ticket.priority === 'URGENT' ? 'bg-destructive' : ticket.priority === 'HIGH' ? 'bg-amber-500' : 'bg-primary'}`} />
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest ${priorityConfig[ticket.priority].color.replace('bg-', 'text-')}`}>{priorityConfig[ticket.priority].label}</span>
                <span className="text-[9px] font-bold text-muted-foreground opacity-50">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-black text-foreground group-hover:text-primary transition-colors text-sm mb-2 uppercase tracking-tight line-clamp-2 leading-tight flex-1">{ticket.title}</h3>
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed italic mb-4">"{ticket.description}"</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase">
                    <MapPin className="h-3 w-3" /> {ticket.area?.name || 'Gral.'}
                 </div>
                 <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        ))}
        {tickets.length === 0 && (
          <div className="col-span-full py-16 text-center bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/50">
            <Inbox className="h-10 w-10 text-muted-foreground/10 mx-auto mb-3" />
            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Sin actividad</p>
          </div>
        )}
      </div>
    </div>
  );
}
