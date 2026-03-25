import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useMeetings } from '@/hooks/useMeetings';
import { useTickets } from '@/hooks/useTickets';
import { socketService } from '@/services/socket';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Ticket as TicketIcon, 
  Video, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Ticket, Meeting } from '@/types';
import { toast } from 'sonner';
import { VideoCallDialog } from './VideoCallDialog';

interface AgendaPageProps {
  onViewTicket?: (ticket: Ticket) => void;
  currentUser?: any;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-card/50 dark:bg-white/[0.03] backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function AgendaPage({ onViewTicket, currentUser }: AgendaPageProps) {
  const { agenda, isLoading, loadAgenda } = useMeetings();
  const { getTicketById } = useTickets();
  const [date, setDate] = React.useState<Date>(new Date());
  const [direction, setDirection] = useState(0);
  const [activeCall, setActiveCall] = useState<{ room: string; title: string } | null>(null);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  // ESCUCHAR ACTUALIZACIONES DE AGENDA EN TIEMPO REAL
  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      const handleMeetingUpdate = () => {
        console.log('📅 Agenda actualizada vía WebSocket');
        loadAgenda();
      };

      socket.on('meetingUpdated', handleMeetingUpdate);
      return () => {
        socket.off('meetingUpdated', handleMeetingUpdate);
      };
    }
  }, [loadAgenda]);

  const handlePrevDay = () => {
    setDirection(-1);
    setDate((prev) => subDays(prev, 1));
  };
  
  const handleNextDay = () => {
    setDirection(1);
    setDate((prev) => addDays(prev, 1));
  };

  const filteredMeetings = agenda.filter(meeting => {
    const meetingDate = new Date(meeting.scheduledAt);
    return (
      meetingDate.getDate() === date.getDate() &&
      meetingDate.getMonth() === date.getMonth() &&
      meetingDate.getFullYear() === date.getFullYear()
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Agenda Operativa</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Sincronización de sesiones técnicas</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card/50 dark:bg-white/[0.03] p-1.5 rounded-xl border border-border dark:border-white/10 shadow-lg">
          <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-9 w-9 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronLeft size={18} /></Button>
          <div className="px-4 py-1.5 bg-blue-600/10 rounded-lg text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-500/20 italic">
            {format(date, "d 'de' MMMM", { locale: es })}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-9 w-9 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronRight size={18} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-10 text-center relative overflow-hidden bg-white dark:bg-card/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
            <span className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic block mb-2">{format(date, 'd')}</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight italic">{format(date, 'EEEE', { locale: es })}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">{format(date, 'MMMM yyyy', { locale: es })}</p>
            
            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Citas</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{filteredMeetings.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Estado</p>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[8px] uppercase">Disponible</Badge>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-white dark:bg-card/50">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              locale={es}
              className="w-full text-slate-900 dark:text-white"
            />
          </GlassCard>
        </div>

        <div className="lg:col-span-8">
          <GlassCard className="h-full min-h-[500px] bg-white dark:bg-card/50">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Itinerario del Ciclo</h3>
              </div>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Canal Encriptado</span>
            </div>
            
            <div className="p-8 space-y-6">
              {isLoading ? (
                <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" /></div>
              ) : filteredMeetings.length === 0 ? (
                <div className="py-24 text-center opacity-40">
                  <CalendarDays size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Sin Colisiones en Agenda</p>
                </div>
              ) : (
                filteredMeetings.map((m) => (
                  <div key={m.id} className="group relative flex items-center gap-6 p-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-white dark:hover:bg-white/[0.04] transition-all shadow-sm dark:shadow-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-white/[0.03] rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-white/5">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">{format(new Date(m.scheduledAt), 'HH:mm')}</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase">Inicio</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight italic truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{m.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><TicketIcon size={10} className="text-blue-600/40 dark:text-blue-500/40" /> {m.ticket?.title}</span>
                        <span className="flex items-center gap-1.5"><User size={10} className="text-blue-600/40 dark:text-blue-500/40" /> {m.employee?.name}</span>
                      </div>
                    </div>
                    {m.type === 'VIRTUAL' && (
                      <Button onClick={() => setActiveCall({ room: m.meetingLink!, title: m.title })} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg h-9 px-4 font-black uppercase text-[9px] gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95">
                        <Video size={14} /> Conectar
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <VideoCallDialog
        isOpen={!!activeCall}
        onClose={() => setActiveCall(null)}
        roomName={activeCall?.room || ''}
        userName={currentUser?.name || 'Usuario ForeSight'}
      />
    </div>
  );
}
