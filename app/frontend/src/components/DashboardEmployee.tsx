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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getFileUrl } from '@/services/api';
import type { Ticket as TicketType, Company, Area } from '@/types';
import { toast } from 'sonner';

interface DashboardEmployeeProps {
  company: Company | null;
  tickets: TicketType[];
  areas: Area[];
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: TicketType) => void;
  onJoinCompany: (code: string) => Promise<boolean>;
  onCreateCompany?: (name: string) => Promise<boolean>; 
}

const priorityConfig = {
  LOW: { label: 'Baja', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  MEDIUM: { label: 'Media', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  HIGH: { label: 'Alta', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  URGENT: { label: 'Urgente', color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

function GlassCard({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardEmployee({ 
  company, 
  tickets = [], 
  areas = [],
  onCreateTicket,
  onViewTicket,
  onJoinCompany,
  onCreateCompany 
}: DashboardEmployeeProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [companyName, setCompanyName] = useState(''); 
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [onboardingView, setOnboardingView] = useState<'selection' | 'join' | 'create'>('selection');

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

  if (!company) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full">
          {onboardingView === 'selection' && (
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Bienvenido a ForeSight</h1>
                <p className="text-slate-500 text-lg font-medium italic">Vincular cuenta a una organización jerárquica.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard onClick={() => setOnboardingView('join')} className="p-10 text-center cursor-pointer group hover:bg-white/[0.05]">
                    <div className="w-20 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <Inbox className="h-10 w-10 text-blue-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic mb-2">Unirme a un Equipo</h3>
                    <p className="text-slate-500 text-sm italic mb-8">Tengo un código de invitación corporativa.</p>
                    <Button variant="outline" className="rounded-full px-8 font-black text-[10px] uppercase border-white/10 hover:bg-blue-600 hover:text-white">Seleccionar</Button>
                </GlassCard>

                <GlassCard onClick={() => setOnboardingView('create')} className="p-10 text-center cursor-pointer group hover:bg-white/[0.05]">
                    <div className="w-20 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <Building2 className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic mb-2">Crear mi Empresa</h3>
                    <p className="text-slate-500 text-sm italic mb-8">Registrar nueva organización como administrador.</p>
                    <Button variant="outline" className="rounded-full px-8 font-black text-[10px] uppercase border-white/10 hover:bg-emerald-600 hover:text-white">Seleccionar</Button>
                </GlassCard>
              </div>
            </div>
          )}

          {onboardingView === 'join' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
               <GlassCard className="p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setOnboardingView('selection')} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Unirse a Equipo</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ingresa el código de 6 dígitos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input 
                      placeholder="CÓDIGO-ID" 
                      value={joinCode} 
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="bg-white/[0.03] border-white/10 rounded-2xl h-14 text-center text-xl font-mono tracking-[0.5em] text-blue-400"
                    />
                    <Button 
                      disabled={isLoadingAction || joinCode.length < 3}
                      onClick={async () => {
                        setIsLoadingAction(true);
                        const success = await onJoinCompany(joinCode);
                        if (success) toast.success("Te has unido al equipo correctamente");
                        else toast.error("Código inválido o error al unirse");
                        setIsLoadingAction(false);
                      }}
                      className="w-full bg-blue-600 h-14 rounded-2xl font-black uppercase tracking-widest"
                    >
                      {isLoadingAction ? 'Procesando...' : 'Vincular Nodo'}
                    </Button>
                  </div>
               </GlassCard>
            </motion.div>
          )}

          {onboardingView === 'create' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
               <GlassCard className="p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setOnboardingView('selection')} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Nueva Entidad</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Registra tu infraestructura</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input 
                      placeholder="Nombre de la Empresa" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-white/[0.03] border-white/10 rounded-2xl h-14 text-white font-bold"
                    />
                    <Button 
                      disabled={isLoadingAction || companyName.length < 3}
                      onClick={async () => {
                        setIsLoadingAction(true);
                        if (onCreateCompany) {
                          await onCreateCompany(companyName);
                        }
                        setIsLoadingAction(false);
                      }}
                      className="w-full bg-emerald-600 h-14 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      {isLoadingAction ? 'Inicializando...' : 'Fundar Organización'}
                    </Button>
                  </div>
               </GlassCard>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Mis Tickets</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Soporte Operativo de {company.name}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={3} /> Nuevo Reporte
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0b]/95 backdrop-blur-2xl border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
             <div className="bg-white/[0.02] p-10 border-b border-white/5">
                <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-white">Reportar Incidencia</DialogTitle>
                <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Describe el problema detectado</DialogDescription>
             </div>
             <div className="p-10 space-y-6">
                <div className="space-y-4">
                  <Input 
                    placeholder="Asunto..." 
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="bg-white/[0.03] border-white/10 rounded-xl h-12 text-white font-bold" 
                  />
                  <Textarea 
                    placeholder="Describe el problema detalladamente..." 
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="bg-white/[0.03] border-white/10 rounded-xl min-h-[120px] text-white italic" 
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(val: any) => setNewTicket({ ...newTicket, priority: val })}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-white">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0b] border-white/10 text-white">
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
                      <SelectTrigger className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-white">
                        <SelectValue placeholder="Seleccionar Área" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0b] border-white/10 text-white">
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
                    className="bg-blue-600 hover:bg-blue-500 w-full rounded-xl h-14 font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                  >
                    {isLoadingAction ? 'Enviando...' : 'Enviar Reporte Oficial'}
                  </Button>
                </DialogFooter>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Flujo de Trabajo Activo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <GlassCard key={ticket.id} onClick={() => onViewTicket(ticket)} className="p-6 cursor-pointer hover:bg-white/[0.05] group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].color}`}>
                    {priorityConfig[ticket.priority].label}
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 uppercase italic">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-white font-black uppercase tracking-tight italic group-hover:text-blue-400 transition-colors">{ticket.title}</h4>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic leading-relaxed">"{ticket.description}"</p>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-400/60 uppercase">
                    <MapPin size={10} /> {ticket.area?.name || 'Gral.'}
                  </div>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                </div>
              </GlassCard>
            ))}
            {tickets.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Inbox className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No hay tickets registrados</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <GlassCard className="p-8 h-full flex flex-col justify-between">
            <div className="space-y-8">
              <div className="w-20 h-20 bg-white/[0.05] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden mx-auto shadow-lg">
                {company.logo ? <img src={getFileUrl(company.logo) || ''} className="w-full h-full object-cover" /> : <Building2 size={32} className="text-blue-400/20" />}
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{company.name}</h2>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Sede Corporativa</p>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic text-center border-t border-white/5 pt-8">
                {company.description || 'Sector seguro de gestión técnica.'}
              </p>
            </div>
            <div className="mt-10 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={14} className="text-slate-600" />
                <span className="text-[9px] font-black text-slate-500 uppercase">Estado:</span>
              </div>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Verificado</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
