import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  Send,
  MapPin,
  Calendar,
  ChevronDown,
  History,
  Circle,
  Loader2,
  Sparkles,
  Zap,
  Target,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMeetings } from '@/hooks/useMeetings';
import { getFileUrl } from '@/services/api';
import type { Ticket, Comment, User, TicketStatus } from '@/types';
import { toast } from 'sonner';
import { VideoCallDialog } from './VideoCallDialog';
import { cn } from '@/lib/utils';

interface TicketDetailProps {
  ticket: Ticket;
  comments: Comment[];
  currentUser: User;
  teamMembers: User[];
  technicians?: any[]; 
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => void;
  onAssign: (userId: string) => void;
  onClaim?: () => void;
  onAddComment: (content: string) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'text-rose-500', bg: 'bg-rose-500/10', variant: 'destructive' as const },
  IN_PROGRESS: { label: 'En proceso', color: 'text-amber-500', bg: 'bg-amber-500/10', variant: 'warning' as const },
  RESOLVED: { label: 'Resuelto', color: 'text-blue-600 dark:text-cyan-400', bg: 'bg-blue-500/10 dark:bg-cyan-400/10', variant: 'success' as const },
  CLOSED: { label: 'Cerrado', color: 'text-slate-500', bg: 'bg-slate-500/10', variant: 'secondary' as const },
  CANCELLED: { label: 'Cancelado', color: 'text-slate-500', bg: 'bg-slate-500/10', variant: 'secondary' as const },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-emerald-500' },
  MEDIUM: { label: 'Media', color: 'bg-blue-500' },
  HIGH: { label: 'Alta', color: 'bg-amber-500' },
  URGENT: { label: 'Urgente', color: 'bg-rose-500' },
};

const sentimentConfig: Record<string, { label: string, icon: string, color: string, bg: string }> = {
  calm: { label: 'Calmado', icon: '😊', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  frustrated: { label: 'Frustrado', icon: '😐', color: 'text-amber-600', bg: 'bg-amber-50' },
  angry: { label: 'Enojado', icon: '😡', color: 'text-red-600', bg: 'bg-red-50' },
};

export function TicketDetail({
  ticket,
  comments,
  currentUser,
  teamMembers,
  onBack,
  onUpdateStatus,
  onClaim,
  onAddComment,
}: TicketDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const { meetings, loadMeetingsByTicket, createProposal, updateStatus, repropose } = useMeetings();
  
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [reproposingMeetingId, setReproposingMeetingId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [meetingData, setMeetingData] = useState({
    title: `Reunión: ${ticket.title}`,
    description: '',
    date: '',
    time: '',
    type: 'VIRTUAL',
    duration: 60
  });

  const [activeCall, setActiveCall] = useState<{ room: string; title: string } | null>(null);

  useEffect(() => {
    loadMeetingsByTicket(ticket.id);
  }, [ticket.id, loadMeetingsByTicket]);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />;
      case 'STATUS_CHANGE': return <History className="h-3.5 w-3.5 text-amber-500" />;
      case 'ASSIGNED': return <UserIcon className="h-3.5 w-3.5 text-emerald-500" />;
      case 'PRIORITY_CHANGE': return <Clock className="h-3.5 w-3.5 text-rose-500" />;
      case 'AREA_CHANGE': return <MapPin className="h-3.5 w-3.5 text-blue-500" />;
      default: return <Circle className="h-3 w-3 text-slate-400" />;
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const handleCancelTicket = () => {
    onUpdateStatus('CANCELLED' as TicketStatus);
    setIsCancelAlertOpen(false);
    toast.success('Ticket cancelado correctamente');
  };

  const openReproposeDialog = (meeting: any) => {
    setReproposingMeetingId(meeting.id);
    setMeetingData({
      ...meetingData,
      title: meeting.title,
      description: meeting.description || '',
      duration: meeting.duration
    });
    setIsMeetingDialogOpen(true);
  };

  const handleCreateOrReproposeMeeting = async () => {
    if (!meetingData.date || !meetingData.time) return;
    setIsActionLoading(true);
    const scheduledAt = new Date(`${meetingData.date}T${meetingData.time}`).toISOString();
    
    try {
      let success = false;
      if (reproposingMeetingId) {
        success = await repropose(reproposingMeetingId, { scheduledAt, duration: Number(meetingData.duration) });
      } else {
        success = await createProposal({
          title: meetingData.title,
          description: meetingData.description,
          scheduledAt,
          type: meetingData.type,
          duration: Number(meetingData.duration),
          ticketId: ticket.id
        });
      }

      if (success) {
        setIsMeetingDialogOpen(false);
        setReproposingMeetingId(null);
      }
    } catch (err) {
      // Error manejado por el hook
    } finally {
      setIsActionLoading(false);
    }
  };

  const currentStatus = statusConfig[ticket.status] || statusConfig.OPEN;
  const currentPriority = priorityConfig[ticket.priority];
  const assignedTech = useMemo(() => teamMembers.find(m => m.id === ticket.assignedToId), [teamMembers, ticket.assignedToId]);

  const isAdmin = currentUser.role === 'EMPRESA' || (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Administrador');
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Técnico');
  const isAssignedToMe = ticket.assignedToId === currentUser.id;
  const isCreator = ticket.createdById === currentUser.id || (typeof ticket.createdBy === 'object' && (ticket.createdBy as any).id === currentUser.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 relative">
      {/* HEADER DE ACCIÓN SUPERIOR */}
      <div className="sticky top-0 z-30 -mx-4 px-6 py-4 bg-background/60 dark:bg-[#050505]/60 backdrop-blur-md border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black tracking-tighter uppercase text-slate-800 dark:text-white truncate italic">{ticket.title}</h1>
              <div className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm dark:shadow-none border border-white dark:border-none ${currentStatus.bg} ${currentStatus.color}`}>
                {currentStatus.label}
              </div>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1.5 text-blue-500/60 dark:text-cyan-500/60"><Hash size={10} /> {ticket.id.slice(-8).toUpperCase()}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar size={10} /> {new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isCreator && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
            <Button variant="ghost" onClick={() => setIsCancelAlertOpen(true)} className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-10 font-bold uppercase text-[10px] tracking-widest gap-2">
              <XCircle className="h-4 w-4" /> Cancelar
            </Button>
          )}
          {isTechnician && isAssignedToMe && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <Button onClick={() => { setReproposingMeetingId(null); setMeetingData({ title: `Reunión: ${ticket.title}`, description: '', date: '', time: '', type: 'VIRTUAL', duration: 60 }); setIsMeetingDialogOpen(true); }} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white hover:opacity-90 rounded-full h-10 px-5 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-blue-500/20">
              <CalendarPlus className="h-4 w-4" /> Proponer Reunión
            </Button>
          )}
          {isTechnician && !ticket.assignedToId && onClaim && (
            <Button onClick={onClaim} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white hover:opacity-90 rounded-full h-10 px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20">
              Reclamar Ticket
            </Button>
          )}
          {(isAdmin || isAssignedToMe) && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none bg-white dark:bg-white/[0.02] font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-white/50 dark:hover:bg-white/[0.05] text-slate-500">
                  Estado <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl bg-white dark:bg-[#050505]/95 backdrop-blur-xl p-1.5">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onUpdateStatus('OPEN')} className="rounded-xl cursor-pointer py-2.5 font-bold text-[10px] uppercase text-slate-600 dark:text-slate-300"><Clock className="h-4 w-4 mr-2.5 text-slate-400" /> Abrir</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onUpdateStatus('IN_PROGRESS')} className="rounded-xl cursor-pointer py-2.5 font-bold text-[10px] uppercase text-slate-600 dark:text-slate-300"><PlayCircle className="h-4 w-4 mr-2.5 text-amber-500" /> En progreso</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('RESOLVED')} className="rounded-xl cursor-pointer py-2.5 font-bold text-[10px] uppercase text-slate-600 dark:text-slate-300"><CheckCircle className="h-4 w-4 mr-2.5 text-blue-500 dark:text-cyan-400" /> Resolver</DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
                    <DropdownMenuItem onClick={() => onUpdateStatus('CLOSED')} className="rounded-xl cursor-pointer py-2.5 text-slate-400 font-bold text-[10px] uppercase"><XCircle className="h-4 w-4 mr-2.5 text-slate-400" /> Cerrar definitivo</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="bg-[#f8fafc] dark:bg-white/[0.02] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none p-1 rounded-2xl w-fit mb-10">
              <TabsTrigger value="comments" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3b82f6] data-[state=active]:to-[#1d4ed8] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all text-slate-400">Conversación ({comments.length})</TabsTrigger>
              <TabsTrigger value="meetings" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3b82f6] data-[state=active]:to-[#1d4ed8] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all text-slate-400">Reuniones ({meetings.length})</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3b82f6] data-[state=active]:to-[#1d4ed8] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all text-slate-400">Historial</TabsTrigger>
            </TabsList>

            {/* TAB: CONVERSACIÓN (TIMELINE) */}
            <TabsContent value="comments" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
              <div className="absolute left-[23px] top-4 bottom-0 w-[1px] bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
              
              {/* DESCRIPCIÓN ORIGINAL */}
              <div className="flex gap-6 relative">
                <div className="z-10">
                  <Avatar className="h-12 w-12 border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <AvatarImage src={getFileUrl(ticket.createdBy?.avatar) || ''} />
                    <AvatarFallback className="bg-white dark:bg-[#050505] text-blue-600 dark:text-cyan-400 text-xs font-black">{getInitials(ticket.createdBy?.name || 'US')}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0 bg-blue-500/[0.03] dark:bg-cyan-500/[0.03] backdrop-blur-xl border border-blue-500/10 border-l-4 border-l-blue-600 dark:border-l-cyan-500 p-8 rounded-r-[2rem] rounded-bl-[2rem] shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-[0.3em]">REPORTE ORIGINAL</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 dark:text-white font-medium text-base leading-relaxed whitespace-pre-wrap italic">"{ticket.description}"</p>
                </div>
              </div>

              {/* COMENTARIOS */}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-6 relative group animate-in slide-in-from-left-2">
                  <div className="z-10">
                    <Avatar className="h-12 w-12 border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none group-hover:scale-105 transition-all">
                      <AvatarImage src={getFileUrl(comment.user?.avatar) || ''} />
                      <AvatarFallback className="bg-white dark:bg-[#050505] text-slate-400 text-xs font-black">{getInitials(comment.user?.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 bg-[#f8fafc] dark:bg-white/[0.02] backdrop-blur-xl border-none shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] dark:shadow-xl p-8 rounded-r-[2rem] rounded-bl-[2rem] hover:scale-[1.01] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight italic">{comment.user?.name}</span>
                        <div className="px-3 py-0.5 rounded-full text-[8px] font-black bg-white/50 dark:bg-white/5 border border-white dark:border-none text-slate-400 uppercase tracking-widest shadow-sm">
                          {typeof comment.user?.role === 'object' ? (comment.user.role as any).name : 'MIEMBRO'}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed italic">"{comment.content}"</p>
                  </div>
                </div>
              ))}

              {/* INPUT DE RESPUESTA FIJO */}
              <div className="pt-10">
                <form onSubmit={handleSubmitComment} className="sticky bottom-6 z-20">
                  <div className="flex items-center gap-4 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl p-2.5 rounded-full border-none shadow-[10px_10px_30px_#bebebe,-10px_-10px_30px_#ffffff] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Avatar className="h-10 w-10 border-none shadow-sm ml-1">
                      <AvatarImage src={getFileUrl(currentUser.avatar) || ''} />
                      <AvatarFallback className="bg-[#f8fafc] dark:bg-[#050505] text-blue-600 dark:text-cyan-400 text-[10px] font-black">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <Input placeholder="Escribir respuesta..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm font-bold h-12 shadow-none placeholder:text-slate-400 text-slate-800 dark:text-white" />
                    <Button type="submit" size="icon" disabled={!newComment.trim()} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white rounded-full h-12 w-12 shadow-lg hover:scale-105 transition-all"><Send className="h-5 w-5" /></Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* TAB: REUNIONES */}
            <TabsContent value="meetings" className="space-y-6 animate-in fade-in">
              {meetings.length === 0 ? (
                <GlassContainer className="py-24 text-center border-dashed border-2 border-slate-200 dark:border-white/5 bg-transparent shadow-none">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sin sesiones programadas</p>
                </GlassContainer>
              ) : (
                meetings.map((m) => (
                  <GlassContainer key={m.id} className="p-8 group hover:scale-[1.01] transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                      <div className="flex gap-6">
                        <div className={`p-5 rounded-[1.5rem] shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-white/[0.01] ${m.status === 'ACCEPTED' ? 'text-emerald-500' : 'text-blue-600 dark:text-cyan-400'}`}>
                          {m.type === 'VIRTUAL' ? <Video size={28} /> : <MapPin size={28} />}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-black text-slate-800 dark:text-white text-lg uppercase tracking-tighter italic">{m.title}</h3>
                          <div className="flex flex-wrap items-center gap-5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-2 text-blue-600 dark:text-cyan-500"><Calendar size={12} /> {new Date(m.scheduledAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2"><Clock size={12} /> {new Date(m.scheduledAt).toLocaleTimeString()}</span>
                            <Badge className={`${m.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'} border-none rounded-lg text-[8px] font-black shadow-sm`}>{m.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {m.status === 'ACCEPTED' && m.type === 'VIRTUAL' && m.meetingLink && (
                          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl h-11 px-6 font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none gap-2" onClick={() => setActiveCall({ room: m.meetingLink!, title: m.title })}>
                            <Video className="h-4 w-4" /> Unirse a la llamada
                          </Button>
                        )}
                        {m.status === 'PROPOSED' && m.lastProposedById !== currentUser.id && (
                          <>
                            <Button size="sm" variant="ghost" className="rounded-xl h-11 font-black text-[10px] uppercase text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" onClick={() => openReproposeDialog(m)}>Ajustar</Button>
                            <Button size="sm" variant="ghost" className="rounded-xl h-11 text-rose-500 hover:bg-rose-500/10 font-black text-[10px] uppercase" onClick={() => updateStatus(m.id, 'REJECTED')}>Rechazar</Button>
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl h-11 px-8 font-black text-[10px] uppercase shadow-lg flex-1 sm:flex-none" onClick={() => updateStatus(m.id, 'ACCEPTED')}>Aceptar</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </GlassContainer>
                ))
              )}
            </TabsContent>

            {/* TAB: HISTORIAL */}
            <TabsContent value="history" className="animate-in fade-in">
              <div className="relative pl-12 space-y-12 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-white/5">
                {!ticket.activities || ticket.activities.length === 0 ? (
                  <div className="py-20 text-center opacity-10"><History size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sector Seguro / Sin Logs</p></div>
                ) : (
                  ticket.activities.map((activity) => (
                    <div key={activity.id} className="relative group">
                      <div className="absolute -left-[32px] top-1 bg-white dark:bg-[#050505] p-1.5 rounded-full border-none shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] dark:shadow-none dark:border dark:border-white/10 z-10">{getActionIcon(activity.action)}</div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{activity.user?.name || 'Sistema'}</span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 p-5 rounded-2xl italic text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed group-hover:border-blue-100 dark:group-hover:border-white/10 transition-all shadow-sm">"{activity.details}"</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* AI INSIGHTS CARD */}
          {(ticket.aiSentiment || ticket.aiSummary) && (
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-950 text-white relative">
              <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12">
                <Sparkles size={80} className="text-primary" />
              </div>
              <CardHeader className="p-8 pb-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
                    AI Powered
                  </Badge>
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8 relative z-10">
                {ticket.aiSentiment && (
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Análisis de Sentimiento</label>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                      sentimentConfig[ticket.aiSentiment]?.bg || 'bg-slate-800',
                      sentimentConfig[ticket.aiSentiment]?.color || 'text-slate-300'
                    )}>
                      <span className="text-lg">{sentimentConfig[ticket.aiSentiment]?.icon}</span>
                      {sentimentConfig[ticket.aiSentiment]?.label}
                    </div>
                  </div>
                )}

                {ticket.aiSummary && (
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Resumen Ejecutivo</label>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl italic text-sm text-slate-300 font-medium leading-relaxed">
                      "{ticket.aiSummary}"
                    </div>
                  </div>
                )}

                {ticket.aiReasoning && (
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Razonamiento de Prioridad</label>
                    <div className="flex gap-3 text-xs text-slate-400 font-medium leading-tight bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <Target size={16} className="text-primary shrink-0" />
                      {ticket.aiReasoning}
                    </div>
                  </div>
                )}

                {(ticket.aiSuggestedArea || ticket.aiSuggestedPriority) && (
                  <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                    {ticket.aiSuggestedArea && (
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-500 uppercase">Área Sugerida</label>
                        <p className="text-[10px] font-black uppercase text-primary tracking-wider">{ticket.aiSuggestedArea}</p>
                      </div>
                    )}
                    {ticket.aiSuggestedPriority && (
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-500 uppercase">Prioridad Sugerida</label>
                        <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider">{ticket.aiSuggestedPriority}</p>
                      </div>
                    )}
                  </div>
                )}

                {ticket.aiEstimatedTime && (
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Estimado</span>
                      </div>
                      <span className="text-lg font-black text-white">
                        {ticket.aiEstimatedTime < 60 
                          ? `${ticket.aiEstimatedTime}m` 
                          : `${(ticket.aiEstimatedTime / 60).toFixed(1)}h`}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
                        <span className="text-slate-500">Confianza del Modelo</span>
                        <span className={cn(
                          ticket.aiConfidence && ticket.aiConfidence > 0.7 ? "text-emerald-500" : "text-amber-500"
                        )}>
                          {Math.round((ticket.aiConfidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(ticket.aiConfidence || 0) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full shadow-[0_0_10px_rgba(0,242,255,0.3)]",
                            ticket.aiConfidence && ticket.aiConfidence > 0.7 ? "bg-emerald-500" : "bg-primary"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card border border-border/50">
            <CardHeader className="bg-muted/30 border-b border-border p-8 pb-6"><CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-4 bg-primary rounded-full" /> Atributos de Gestión</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Estado actual</label><Badge variant={status.variant} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none shadow-sm">{status.label}</Badge></div>
              <div className="space-y-3"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Nivel de Prioridad</label><div className="flex items-center gap-3 bg-muted/20 p-3 rounded-2xl border border-border/50"><div className={`w-3 h-3 rounded-full ${priority.color.replace('bg-', 'bg-')}`} /><span className="text-xs font-black text-foreground uppercase tracking-tight">{priority.label}</span></div></div>
              <div className="space-y-3"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Área Técnica</label>{ticket.area ? (<div className="flex items-center gap-3 text-primary font-black text-xs uppercase bg-primary/5 p-3 rounded-2xl border border-primary/10"><MapPin size={16} strokeWidth={3} /> {ticket.area.name}</div>) : <span className="text-xs text-muted-foreground italic font-bold uppercase p-3 block">No asignada</span>}</div>
            </CardContent>
          </Card>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block ml-1">Prioridad del Vector</label>
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none dark:border dark:border-white/5 flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${currentPriority.color} shadow-[0_0_10px_currentColor]`} />
                <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">{currentPriority.label}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block ml-1">Área Técnica</label>
              <div className="p-4 rounded-2xl bg-blue-500/[0.03] dark:bg-cyan-500/[0.03] border border-blue-500/10 dark:border-cyan-500/10 flex items-center gap-4 text-blue-600 dark:text-cyan-400">
                <MapPin size={14} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-tighter italic">{ticket.area?.name || 'Soporte'}</span>
              </div>
            </div>
          </GlassContainer>

          <GlassContainer className="p-8">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block ml-1 mb-5 italic">Personal Asignado</label>
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-white/[0.03] rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none dark:border dark:border-white/5 transition-all hover:scale-105">
              <Avatar className="h-12 w-12 border-none rounded-xl overflow-hidden shadow-md">
                <AvatarImage src={getFileUrl(assignedTech?.avatar) || ''} />
                <AvatarFallback className="bg-slate-100 dark:bg-neutral-900 text-slate-400 text-[10px] font-black">??</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate italic">
                  {assignedTech?.name || 'Sin Asignar'}
                </p>
                <p className="text-[8px] font-bold text-blue-600 dark:text-cyan-500 uppercase tracking-widest mt-1 italic">TECHNICAL LEAD</p>
              </div>
            </div>
          </GlassContainer>
        </div>
      </div>

      {/* DIÁLOGOS Y ALERTAS */}
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent className="rounded-[3rem] border-none bg-[#f8fafc] dark:bg-[#050505]/95 backdrop-blur-2xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-2xl p-12">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-lg shadow-rose-500/10"><AlertTriangle className="h-8 w-8" strokeWidth={3} /></div>
            <AlertDialogTitle className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">¿Abortar Operación?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed italic mt-4">Esta acción marcará el ticket como CANCELADO permanentemente. El técnico actual dejará de procesar esta incidencia.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-none bg-white dark:bg-transparent shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-800 dark:hover:text-white transition-all">Regresar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelTicket} className="bg-rose-600 text-white hover:opacity-90 rounded-2xl h-14 px-10 font-black shadow-xl shadow-rose-500/20 uppercase text-[10px] tracking-widest">Confirmar Aborto</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden bg-[#f8fafc] dark:bg-[#050505]/95 backdrop-blur-3xl border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-2xl mx-4">
           <DialogHeader className="bg-white/50 dark:bg-white/[0.02] p-12 text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/5">
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic text-blue-600 dark:text-cyan-400">Nueva Propuesta</DialogTitle>
                <DialogDescription className="text-slate-400 mt-2 font-bold uppercase text-[9px] tracking-[0.4em] max-w-xs leading-relaxed italic">Sincronización de espacio de trabajo síncrono.</DialogDescription>
            </DialogHeader>
          <div className="p-12 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest ml-1">Fecha Programada</label>
                <Input type="date" value={meetingData.date} onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })} className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-white/[0.02] font-black px-6 text-slate-800 dark:text-white" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest ml-1">Hora de Inicio</label>
                <Input type="time" value={meetingData.time} onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })} className="h-14 rounded-2xl border-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none bg-white dark:bg-white/[0.02] font-black px-6 text-slate-800 dark:text-white" />
              </div>
            </div>
            <DialogFooter className="pt-6 gap-5">
              <Button variant="ghost" onClick={() => setIsMeetingDialogOpen(false)} className="rounded-2xl h-14 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cerrar</Button>
              <Button onClick={handleCreateOrReproposeMeeting} disabled={isActionLoading} className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white rounded-2xl h-14 px-12 font-black shadow-lg shadow-blue-500/20 uppercase text-[10px] tracking-widest flex-1 transition-transform active:scale-95">
                {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Sincronizar Sesión'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <VideoCallDialog
        isOpen={!!activeCall}
        onClose={() => setActiveCall(null)}
        roomName={activeCall?.room || ''}
        userName={currentUser?.name || 'Usuario ForeSight'}
      />
    </div>
  );
}
