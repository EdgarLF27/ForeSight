import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Inbox,
  ChevronRight,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Ticket, Area, User } from '@/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TicketsPageProps {
  tickets: Ticket[];
  areas: Area[];
  teamMembers: User[];
  currentUser: User;
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: Ticket) => void;
  onUpdateTicket: (id: string, data: any) => Promise<boolean>;
}

const statusConfig: any = {
  OPEN: { label: 'Abierto', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  IN_PROGRESS: { label: 'En Proceso', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  RESOLVED: { label: 'Resuelto', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  CLOSED: { label: 'Cerrado', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  CANCELLED: { label: 'Cancelado', color: 'text-rose-500', bg: 'bg-rose-500/10' },
};

const priorityConfig: any = {
  LOW: { label: 'Baja', color: 'text-emerald-400', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' },
  MEDIUM: { label: 'Media', color: 'text-blue-400', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]' },
  HIGH: { label: 'Alta', color: 'text-amber-400', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.4)]' },
  URGENT: { label: 'Urgente', color: 'text-rose-400', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.4)]' },
};

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function TicketsPage({ 
  tickets = [], 
  areas = [],
  currentUser,
  onCreateTicket,
  onViewTicket 
}: TicketsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    areaId: '',
  });

  const handleCreateTicketSubmit = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.areaId) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    
    setIsLoadingAction(true);
    const success = await onCreateTicket(newTicket);
    if (success) {
      setIsCreateDialogOpen(false);
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', areaId: '' });
    }
    setIsLoadingAction(false);
  };

  const filteredTickets = tickets.filter(ticket => 
    (ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ticket.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = currentUser.role === 'EMPRESA' || (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Administrador');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase italic">Central de Tickets</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Gestión de incidencias y nodos de soporte</p>
        </div>
        
        {!isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] px-8 h-12 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#0a0a0b] backdrop-blur-2xl border-slate-200 dark:border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
               <div className="bg-slate-50 dark:bg-white/[0.02] p-10 border-b border-slate-100 dark:border-white/5">
                  <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">Reportar Incidencia</DialogTitle>
                  <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Describe el problema detectado</DialogDescription>
               </div>
               <div className="p-10 space-y-6">
                  <div className="space-y-4">
                    <Input 
                      placeholder="Asunto..." 
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-xl h-12 text-slate-800 dark:text-white font-bold" 
                    />
                    <Textarea 
                      placeholder="Describe el problema detalladamente..." 
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-xl min-h-[120px] text-slate-800 dark:text-white italic" 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(val: any) => setNewTicket({ ...newTicket, priority: val })}
                      >
                        <SelectTrigger className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-800 dark:text-white">
                          <SelectValue placeholder="Prioridad" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0a0a0b] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select 
                        value={newTicket.areaId} 
                        onValueChange={(val) => setNewTicket({ ...newTicket, areaId: val })}
                      >
                        <SelectTrigger className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-800 dark:text-white">
                          <SelectValue placeholder="Seleccionar Área" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0a0a0b] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                          {areas.map(area => (
                            <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button 
                      onClick={handleCreateTicketSubmit}
                      disabled={isLoadingAction}
                      className="bg-blue-600 hover:bg-blue-500 w-full rounded-xl h-14 font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white"
                    >
                      {isLoadingAction ? 'Enviando...' : 'Enviar Reporte Oficial'}
                    </Button>
                  </DialogFooter>
               </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Buscar en la red..." 
            className="pl-12 h-12 bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-blue-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white">
          <Filter className="h-4 w-4 mr-2" /> Filtros Avanzados
        </Button>
      </div>

      <GlassCard>
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <History className="h-4 w-4 text-blue-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Flujo de Incidencias</h3>
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredTickets.length} Registros Encontrados</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-4">Asunto / Nodo</th>
                <th className="px-8 py-4">Prioridad</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredTickets.map((ticket) => {
                const config = statusConfig[ticket.status] || statusConfig.OPEN;
                return (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => onViewTicket(ticket)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight italic">{ticket.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={10} className="text-slate-400" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{ticket.area?.name || 'Gral.'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-2 ${priorityConfig[ticket.priority]?.color || 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${priorityConfig[ticket.priority]?.glow || ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{priorityConfig[ticket.priority]?.label || 'Media'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                        {config.label}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all">
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Inbox size={48} className="text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sector Vacío</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
