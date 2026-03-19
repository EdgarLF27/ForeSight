import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Send,
  CheckCircle,
  PlayCircle,
  XCircle,
  MapPin,
  Video,
  CalendarPlus,
  Check,
  X,
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronDown,
  History,
  Circle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import type { Ticket, Comment, User, TicketStatus, Meeting } from '@/types';
import { toast } from 'sonner';
import { VideoCallDialog } from './VideoCallDialog';

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
  OPEN: { label: 'Abierto', variant: 'destructive' as const },
  IN_PROGRESS: { label: 'En progreso', variant: 'warning' as const },
  RESOLVED: { label: 'Resuelto', variant: 'success' as const },
  CLOSED: { label: 'Cerrado', variant: 'secondary' as const },
  CANCELLED: { label: 'Cancelado', variant: 'secondary' as const },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-slate-200' },
  MEDIUM: { label: 'Media', color: 'bg-primary' },
  HIGH: { label: 'Alta', color: 'bg-amber-500' },
  URGENT: { label: 'Urgente', color: 'bg-destructive' },
};

export function TicketDetail({
  ticket,
  comments,
  currentUser,
  teamMembers,
  technicians,
  onBack,
  onUpdateStatus,
  onAssign,
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

  const status = statusConfig[ticket.status] || statusConfig.OPEN;
  const priority = priorityConfig[ticket.priority];
  const assignee = teamMembers.find(m => m.id === ticket.assignedToId);
  const creator = typeof ticket.createdBy === 'object' ? ticket.createdBy : { id: ticket.createdBy as string, name: 'Usuario' };

  const isAdmin = currentUser.role === 'EMPRESA' || (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Administrador');
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Técnico');
  const isAssignedToMe = ticket.assignedToId === currentUser.id;
  const isCreator = ticket.createdById === currentUser.id || (typeof ticket.createdBy === 'object' && ticket.createdBy.id === currentUser.id);

  const getInitials = (name?: any) => {
    if (typeof name !== 'string' || !name.trim()) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <Circle className="h-3 w-3 fill-primary text-primary" />;
      case 'STATUS_CHANGE': return <History className="h-3.5 w-3.5 text-amber-500" />;
      case 'ASSIGNED': return <UserIcon className="h-3.5 w-3.5 text-emerald-500" />;
      case 'PRIORITY_CHANGE': return <Clock className="h-3.5 w-3.5 text-destructive" />;
      case 'AREA_CHANGE': return <MapPin className="h-3.5 w-3.5 text-primary" />;
      default: return <Circle className="h-3 w-3 text-muted-foreground" />;
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

  const handleCreateOrReproposeMeeting = async () => {
    if (!meetingData.date || !meetingData.time) return;
    setIsActionLoading(true);
    const scheduledAt = new Date(`${meetingData.date}T${meetingData.time}`).toISOString();
    
    let success = false;
    try {
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
      // El error ya lo maneja el hook o el servicio
    } finally {
      setIsActionLoading(false);
    }
  };

  const openReproposeDialog = (meeting: Meeting) => {
    const d = new Date(meeting.scheduledAt);
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0].slice(0, 5);

    setMeetingData({
      title: meeting.title,
      description: meeting.description || '',
      date,
      time,
      type: meeting.type,
      duration: meeting.duration
    });
    setReproposingMeetingId(meeting.id);
    setIsMeetingDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-1 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl border border-border bg-card shadow-sm hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">{ticket.title}</h1>
              <Badge variant={status.variant} className="px-3 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">{status.label}</Badge>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">#{ticket.id.slice(-6).toUpperCase()} • {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {isCreator && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
            <Button variant="outline" onClick={() => setIsCancelAlertOpen(true)} className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl h-11 font-bold uppercase text-xs tracking-widest gap-2">
              <XCircle className="h-4 w-4" /> Cancelar
            </Button>
          )}
          {isTechnician && isAssignedToMe && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <Button onClick={() => { setReproposingMeetingId(null); setMeetingData({ title: `Reunión: ${ticket.title}`, description: '', date: '', time: '', type: 'VIRTUAL', duration: 60 }); setIsMeetingDialogOpen(true); }} className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-5 font-bold uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/20">
              <CalendarPlus className="h-4 w-4" /> Proponer Reunión
            </Button>
          )}
          {isTechnician && !ticket.assignedToId && onClaim && (
            <Button onClick={onClaim} className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-11 px-6 font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
              Reclamar Ticket
            </Button>
          )}
          {(isAdmin || isAssignedToMe) && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl border-border font-bold uppercase text-xs tracking-widest gap-2 bg-card shadow-sm hover:bg-muted">
                  Estado <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 border-border bg-card shadow-2xl">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onUpdateStatus('OPEN')} className="rounded-xl cursor-pointer py-2.5 font-bold text-xs uppercase"><Clock className="h-4 w-4 mr-2.5 text-muted-foreground" /> Abrir ticket</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onUpdateStatus('IN_PROGRESS')} className="rounded-xl cursor-pointer py-2.5 font-bold text-xs uppercase"><PlayCircle className="h-4 w-4 mr-2.5 text-amber-500" /> En progreso</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('RESOLVED')} className="rounded-xl cursor-pointer py-2.5 font-bold text-xs uppercase"><CheckCircle className="h-4 w-4 mr-2.5 text-emerald-500" /> Resolver</DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={() => onUpdateStatus('CLOSED')} className="rounded-xl cursor-pointer py-2.5 text-foreground font-bold text-xs uppercase"><XCircle className="h-4 w-4 mr-2.5 text-muted-foreground" /> Cerrar definitivo</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-md bg-card rounded-3xl overflow-hidden relative">
             <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary" />
             <CardContent className="p-8 md:p-10">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Descripción de Incidencia</h2>
              <p className="text-foreground font-medium text-base md:text-lg leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl w-fit mb-8 overflow-x-auto">
              <TabsTrigger value="comments" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-black uppercase tracking-widest">Conversación ({comments.length})</TabsTrigger>
              <TabsTrigger value="meetings" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-black uppercase tracking-widest">Reuniones ({meetings.length})</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-black uppercase tracking-widest">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="py-16 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">No hay mensajes</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-5 group">
                      <Avatar className="h-12 w-12 ring-4 ring-border/50 shadow-sm flex-shrink-0 rounded-2xl overflow-hidden">
                        <AvatarImage src={getFileUrl(comment.user?.avatar) || ''} className="object-cover" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-black">{getInitials(comment.user?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 bg-card p-6 rounded-[2rem] border border-border group-hover:border-primary/20 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-foreground uppercase tracking-tight">{comment.user?.name || 'Usuario'}</span>
                            <Badge variant="secondary" className="text-[9px] px-2 h-5 bg-muted text-muted-foreground font-black uppercase tracking-tighter">
                              {typeof comment.user?.role === 'object' ? (comment.user.role as any).name : comment.user?.role}
                            </Badge>
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                            {new Date(comment.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">"{comment.content}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitComment} className="relative pt-4">
                 <div className="flex items-center gap-4 bg-card p-2 md:p-3 rounded-2xl border border-border shadow-xl focus-within:border-primary/40 transition-all">
                    <Avatar className="h-10 w-10 ring-2 ring-muted ml-1 rounded-xl overflow-hidden">
                      <AvatarImage src={getFileUrl(currentUser.avatar) || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-black">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <Input placeholder="Escribir respuesta..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm font-bold h-12 shadow-none" />
                    <Button type="submit" size="icon" disabled={!newComment.trim()} className="bg-primary text-primary-foreground rounded-xl h-12 w-12 shadow-lg shadow-primary/20 transition-all active:scale-95"><Send className="h-5 w-5" /></Button>
                 </div>
              </form>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Sin sesiones programadas</h3>
                  </div>
                ) : (
                  meetings.map((m) => (
                    <Card key={m.id} className="overflow-hidden border-border bg-card hover:bg-muted/30 transition-all shadow-sm rounded-[2rem]">
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                          <div className="flex gap-5">
                            <div className={`p-4 rounded-2xl ${m.status === 'ACCEPTED' ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                              {m.type === 'VIRTUAL' ? <Video className={`h-7 w-7 ${m.status === 'ACCEPTED' ? 'text-emerald-500' : 'text-primary'}`} /> : <MapPin className={`h-7 w-7 ${m.status === 'ACCEPTED' ? 'text-emerald-500' : 'text-primary'}`} />}
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-black text-foreground text-lg uppercase tracking-tight">{m.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 text-primary"><CalendarIcon className="h-4 w-4" /> {new Date(m.scheduledAt).toLocaleDateString('es-ES')}</span>
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {new Date(m.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                <Badge variant={m.status === 'ACCEPTED' ? 'success' : 'secondary'} className="px-3 h-5 rounded-lg text-[9px] font-black">{m.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {m.status === 'ACCEPTED' && m.type === 'VIRTUAL' && m.meetingLink && (
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 text-white rounded-xl h-10 px-5 font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none gap-2"
                                onClick={() => setActiveCall({ room: m.meetingLink!, title: m.title })}
                              >
                                <Video className="h-4 w-4" /> Unirse a la llamada
                              </Button>
                            )}
                            {m.status === 'PROPOSED' && m.lastProposedById !== currentUser.id && (
                              <>
                                <Button size="sm" variant="outline" className="rounded-xl h-10 font-black text-[10px] uppercase flex-1 sm:flex-none" onClick={() => openReproposeDialog(m)}>Reprogramar</Button>
                                <Button size="sm" variant="outline" className="rounded-xl h-10 border-destructive/20 text-destructive hover:bg-destructive/10 font-black text-[10px] uppercase flex-1 sm:flex-none" onClick={() => updateStatus(m.id, 'REJECTED')}>Rechazar</Button>
                                <Button size="sm" className="bg-emerald-600 text-white rounded-xl h-10 px-6 font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none" onClick={() => updateStatus(m.id, 'ACCEPTED')}>Aceptar</Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-8">
              <div className="relative pl-10 space-y-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                {!ticket.activities || ticket.activities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground/30"><History className="h-12 w-12 mx-auto mb-3 opacity-10" /><p className="text-[10px] font-black uppercase tracking-[0.3em]">Sin registros de actividad</p></div>
                ) : (
                  ticket.activities.map((activity) => (
                    <div key={activity.id} className="relative">
                      <div className="absolute -left-[32px] top-1 bg-card p-1.5 rounded-2xl border-2 border-border shadow-sm z-10">{getActionIcon(activity.action)}</div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-black text-foreground uppercase tracking-tight">{activity.user?.name || 'Sistema'}</span>
                          <span className="text-[9px] text-muted-foreground font-black uppercase bg-muted px-2.5 py-1 rounded-lg tracking-widest">{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium bg-muted/20 p-4 rounded-[1.25rem] border border-border/50 leading-relaxed italic">"{activity.details}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card border border-border/50">
            <CardHeader className="bg-muted/30 border-b border-border p-8 pb-6"><CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-4 bg-primary rounded-full" /> Atributos de Gestión</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Estado actual</label><Badge variant={status.variant} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none shadow-sm">{status.label}</Badge></div>
              <div className="space-y-3"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Nivel de Prioridad</label><div className="flex items-center gap-3 bg-muted/20 p-3 rounded-2xl border border-border/50"><div className={`w-3 h-3 rounded-full ${priority.color.replace('bg-', 'bg-')}`} /><span className="text-xs font-black text-foreground uppercase tracking-tight">{priority.label}</span></div></div>
              <div className="space-y-3"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Área Técnica</label>{ticket.area ? (<div className="flex items-center gap-3 text-primary font-black text-xs uppercase bg-primary/5 p-3 rounded-2xl border border-primary/10"><MapPin size={16} strokeWidth={3} /> {ticket.area.name}</div>) : <span className="text-xs text-muted-foreground italic font-bold uppercase p-3 block">No asignada</span>}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card border border-border/50">
            <CardHeader className="bg-muted/30 border-b border-border p-8 pb-6"><CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-4 bg-primary rounded-full" /> Personal Involucrado</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Autor del Reporte</label>
                <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-2xl border border-border/50">
                  <Avatar className="h-10 w-10 ring-2 ring-card shadow-md rounded-xl overflow-hidden">
                    <AvatarImage src={getFileUrl(creator.avatar) || ''} className="object-cover" />
                    <AvatarFallback className="bg-emerald-600 text-white text-xs font-black">{getInitials(creator.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0"><p className="text-xs font-black text-foreground uppercase truncate leading-none">{creator.name}</p><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">EMPLEADO</p></div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Técnico Responsable</label>
                {isAdmin ? (
                  <Select value={ticket.assignedToId || 'unassigned'} onValueChange={(val) => onAssign(val === 'unassigned' ? '' : val)}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border-border bg-muted/20 font-black text-xs uppercase focus:ring-primary/20"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent className="rounded-[1.5rem] border-border shadow-2xl bg-card">
                      <SelectItem value="unassigned" className="font-black text-[10px] uppercase">Sin asignar</SelectItem>
                      {technicians && technicians.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-[9px] font-black text-primary bg-primary/5 uppercase tracking-widest">Sugeridos (Área)</div>
                          {technicians.map(tech => (<SelectItem key={tech.id} value={tech.id} className="font-black text-[10px] uppercase">{tech.name} <span className="text-[8px] opacity-50">({tech._count?.assignedTickets || 0})</span></SelectItem>))}
                          <div className="h-px bg-border my-2" />
                        </>
                      )}
                      <div className="px-3 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Todo el equipo</div>
                      {teamMembers.filter(m => !technicians?.some(t => t.id === m.id)).map(member => (<SelectItem key={member.id} value={member.id} className="font-black text-[10px] uppercase">{member.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-2xl border border-border/50">
                    {assignee ? (
                      <>
                        <Avatar className="h-10 w-10 ring-2 ring-card shadow-md rounded-xl overflow-hidden">
                          <AvatarImage src={getFileUrl(assignee?.avatar) || ''} className="object-cover" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-black">{getInitials(assignee?.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0"><p className="text-xs font-black text-foreground uppercase truncate leading-none">{assignee?.name}</p><p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">TÉCNICO</p></div>
                      </>
                    ) : (<span className="text-xs text-muted-foreground/40 font-black uppercase italic py-2 pl-2 tracking-widest">Esperando asignación...</span>)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-border bg-card shadow-2xl p-10 mx-4">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mb-8 border border-destructive/20 shadow-lg shadow-destructive/10"><AlertTriangle className="h-8 w-8" strokeWidth={3} /></div>
            <AlertDialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">¿Detener Proceso?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-base leading-relaxed italic">Esta acción marcará el ticket como CANCELADO permanentemente. Los técnicos dejarán de trabajar en esta incidencia.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4 flex-col sm:flex-row">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-border text-muted-foreground uppercase text-xs tracking-widest hover:bg-muted transition-all">Regresar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelTicket} className="bg-destructive text-destructive-foreground hover:opacity-90 rounded-2xl h-14 px-10 font-black shadow-xl shadow-destructive/20 uppercase text-xs tracking-widest">Confirmar Cancelación</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden bg-card border-border shadow-2xl mx-4 sm:mx-0">
           <DialogHeader className="bg-slate-950 p-8 md:p-12 text-white relative border-none">
                <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><CalendarIcon size={160} /></div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">{reproposingMeetingId ? 'Ajustar Sesión' : 'Nueva Propuesta'}</DialogTitle>
                <DialogDescription className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em] max-w-xs leading-relaxed">
                   Agenda un espacio de trabajo síncrono para resolver el ticket con el cliente.
                </DialogDescription>
            </DialogHeader>
          <div className="p-8 md:p-10 space-y-8">
            {!reproposingMeetingId && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Título de la Reunión</label>
                <Input value={meetingData.title} onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-border font-black uppercase text-sm px-5" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Fecha Programada</label>
                <Input type="date" value={meetingData.date} onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-border font-black px-5" />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Hora de Inicio</label>
                <Input type="time" value={meetingData.time} onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-border font-black px-5" />
              </div>
            </div>
            <DialogFooter className="pt-6 gap-4 flex-col sm:flex-row">
              <Button variant="ghost" onClick={() => setIsMeetingDialogOpen(false)} className="rounded-2xl h-14 px-8 font-black text-muted-foreground uppercase text-xs tracking-widest">Cerrar</Button>
              <Button onClick={handleCreateOrReproposeMeeting} disabled={isActionLoading} className="bg-primary text-primary-foreground hover:opacity-90 rounded-2xl h-14 px-12 font-black shadow-2xl shadow-primary/30 uppercase text-xs tracking-widest flex-1">
                {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (reproposingMeetingId ? 'Sincronizar Cambios' : 'Enviar Invitación')}
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
