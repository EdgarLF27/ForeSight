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
<<<<<<< HEAD
  AlertTriangle,
  ChevronDown
=======
  History,
  Circle
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import type { Ticket, Comment, User, TicketStatus, Meeting } from '@/types';
import { toast } from 'sonner';

interface TicketDetailProps {
  ticket: Ticket;
  comments: Comment[];
  currentUser: User;
  teamMembers: User[];
  technicians?: any[]; // Añadimos técnicos sugeridos
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
  MEDIUM: { label: 'Media', color: 'bg-indigo-400' },
  HIGH: { label: 'Alta', color: 'bg-amber-500' },
  URGENT: { label: 'Urgente', color: 'bg-rose-600' },
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
  
  // Estados para el diálogo de reunión
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [reproposingMeetingId, setReproposingMeetingId] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState({
    title: `Reunión: ${ticket.title}`,
    description: '',
    date: '',
    time: '',
    type: 'VIRTUAL',
    duration: 60
  });

  useEffect(() => {
    loadMeetingsByTicket(ticket.id);
  }, [ticket.id, loadMeetingsByTicket]);

  const status = statusConfig[ticket.status] || statusConfig.OPEN;
  const priority = priorityConfig[ticket.priority];
  const assignee = teamMembers.find(m => m.id === ticket.assignedToId);
  const creator = typeof ticket.createdBy === 'object' ? ticket.createdBy : { id: ticket.createdBy as string, name: 'Usuario' };

  const isAdmin = currentUser.role === 'EMPRESA' || (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Administrador');
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Técnico');
  const isEmployee = (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Empleado') || currentUser.role === 'EMPLEADO';
  const isAssignedToMe = ticket.assignedToId === currentUser.id;
  const isCreator = ticket.createdById === currentUser.id || (typeof ticket.createdBy === 'object' && ticket.createdBy.id === currentUser.id);

  const getInitials = (name?: any) => {
    if (typeof name !== 'string' || !name.trim()) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <Circle className="h-3 w-3 fill-[#1a73e8] text-[#1a73e8]" />;
      case 'STATUS_CHANGE': return <History className="h-3.5 w-3.5 text-[#f9ab00]" />;
      case 'ASSIGNED': return <UserIcon className="h-3.5 w-3.5 text-[#34a853]" />;
      case 'PRIORITY_CHANGE': return <Clock className="h-3.5 w-3.5 text-[#ea4335]" />;
      case 'AREA_CHANGE': return <MapPin className="h-3.5 w-3.5 text-[#1a73e8]" />;
      default: return <Circle className="h-3 w-3 text-[#5f6368]" />;
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
    const scheduledAt = new Date(`${meetingData.date}T${meetingData.time}`).toISOString();
    
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-xl hover:bg-white shadow-sm border border-slate-200"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.title}</h1>
              <Badge variant={status.variant} className="px-3 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              #{ticket.id.slice(-6).toUpperCase()} • Registrado el {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Botón de Cancelar para Empleado */}
          {isCreator && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
            <Button 
              variant="outline"
              onClick={() => setIsCancelAlertOpen(true)}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-11 font-semibold gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancelar Ticket
            </Button>
          )}

          {isTechnician && isAssignedToMe && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <Button 
              onClick={() => {
                setReproposingMeetingId(null);
                setMeetingData({ title: `Reunión: ${ticket.title}`, description: '', date: '', time: '', type: 'VIRTUAL', duration: 60 });
                setIsMeetingDialogOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 font-semibold gap-2 shadow-lg shadow-indigo-100"
            >
              <CalendarPlus className="h-4 w-4" />
              Proponer Reunión
            </Button>
          )}

          {isTechnician && !ticket.assignedToId && onClaim && (
            <Button 
              onClick={onClaim}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 font-semibold shadow-lg shadow-indigo-100"
            >
              Reclamar Ticket
            </Button>
          )}

          {(isAdmin || isAssignedToMe) && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-semibold gap-2 bg-white shadow-sm hover:bg-slate-50">
                  Acciones de Estado
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 border-slate-200 shadow-2xl">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onUpdateStatus('OPEN')} className="rounded-xl cursor-pointer py-2.5">
                    <Clock className="h-4 w-4 mr-2.5 text-slate-400" />
                    <span className="font-medium">Abrir ticket</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onUpdateStatus('IN_PROGRESS')} className="rounded-xl cursor-pointer py-2.5">
                  <PlayCircle className="h-4 w-4 mr-2.5 text-amber-500" />
                  <span className="font-medium">En progreso</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('RESOLVED')} className="rounded-xl cursor-pointer py-2.5">
                  <CheckCircle className="h-4 w-4 mr-2.5 text-emerald-500" />
                  <span className="font-medium">Marcar Resuelto</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem onClick={() => onUpdateStatus('CLOSED')} className="rounded-xl cursor-pointer py-2.5 text-slate-900">
                      <XCircle className="h-4 w-4 mr-2.5 text-slate-400" />
                      <span className="font-semibold">Cerrar definitivamente</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden relative">
             <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-200" />
             <CardContent className="p-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Detalle del Requerimiento</h2>
              <p className="text-slate-700 font-medium text-base leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Tabs: Comments & Meetings */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl w-fit mb-6">
              <TabsTrigger 
                value="comments" 
                className="rounded-xl px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-sm font-semibold"
              >
                Conversación ({comments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="meetings" 
                className="rounded-xl px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-sm font-semibold"
              >
                Reuniones ({meetings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a73e8] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 h-auto text-sm font-medium"
              >
                Historial
              </TabsTrigger>
            </TabsList>

<<<<<<< HEAD
            <TabsContent value="comments" className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-6">
=======
            <TabsContent value="comments" className="mt-6 space-y-6">
              {/* ... contenido existente de comentarios ... */}
              <div className="space-y-4">
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
                {comments.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-slate-400 font-medium text-sm">Sin comentarios aún. Sé el primero en escribir.</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm flex-shrink-0">
                        <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                          {getInitials(comment.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 bg-white p-5 rounded-2xl border border-slate-100 group-hover:border-indigo-100 transition-colors shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{comment.user?.name || 'Usuario'}</span>
                            <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-slate-100 text-slate-500 font-bold uppercase border-0">
                              {typeof comment.user?.role === 'object' ? comment.user.role.name : comment.user?.role}
                            </Badge>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(comment.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Rediseñado */}
              <form onSubmit={handleSubmitComment} className="relative mt-8">
                 <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                    <Avatar className="h-9 w-9 ring-2 ring-white ml-1">
                      <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder="Escribe una respuesta interna o consulta..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm font-medium h-10 shadow-none"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!newComment.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 w-10 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                 </div>
              </form>
            </TabsContent>

<<<<<<< HEAD
            <TabsContent value="meetings" className="space-y-6 animate-in fade-in duration-300">
=======
            <TabsContent value="meetings" className="mt-6">
              {/* ... contenido existente de reuniones ... */}
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <CalendarIcon className="h-10 w-10 text-slate-200 mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="text-base font-bold text-slate-900 mb-1">Agenda vacía</h3>
                    <p className="text-slate-400 font-medium text-xs max-w-[200px] mx-auto">No hay reuniones propuestas para este ticket.</p>
                  </div>
                ) : (
                  meetings.map((m) => (
                    <Card key={m.id} className="overflow-hidden border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-2xl ${m.type === 'VIRTUAL' ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
                              {m.type === 'VIRTUAL' ? <Video className="h-6 w-6 text-indigo-600" /> : <MapPin className="h-6 w-6 text-emerald-600" />}
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-tight">
                                <span className="flex items-center gap-1.5 text-indigo-600">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  {new Date(m.scheduledAt).toLocaleDateString('es-ES')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(m.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <Badge variant="secondary" className="px-2 py-0 h-4 rounded-md text-[9px]">{m.status}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          {m.status === 'PROPOSED' && m.lastProposedById !== currentUser.id && (
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-xl h-9 border-slate-200 text-slate-600 font-bold"
                                onClick={() => openReproposeDialog(m)}
                              >
                                Reprogramar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-xl h-9 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
                                onClick={() => updateStatus(m.id, 'REJECTED')}
                              >
                                Rechazar
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-5 font-bold shadow-md shadow-emerald-100"
                                onClick={() => updateStatus(m.id, 'ACCEPTED')}
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#f1f3f4]">
                {!ticket.activities || ticket.activities.length === 0 ? (
                  <div className="text-center py-8 text-[#5f6368]">
                    <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No hay registros en el historial aún.</p>
                  </div>
                ) : (
                  ticket.activities.map((activity) => (
                    <div key={activity.id} className="relative">
                      <div className="absolute -left-[30px] top-1 bg-white p-1 rounded-full border-2 border-white shadow-sm z-10">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#202124]">
                            {activity.user?.name || 'Sistema'}
                          </span>
                          <span className="text-[11px] text-[#80868b] bg-[#f8f9fa] px-2 py-0.5 rounded-full">
                            {new Date(activity.createdAt).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-[#5f6368] mt-1 bg-[#f8f9fa] p-3 rounded-lg border border-[#f1f3f4]">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Main Info Card */}
          <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Atributos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado Actual</label>
                <Badge variant={status.variant} className="px-3 py-1 rounded-lg text-xs font-bold uppercase">
                  {status.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prioridad</label>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${priority.color.replace('bg-', 'bg-')}`} />
                   <span className="text-sm font-bold text-slate-700">{priority.label}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área Asignada</label>
                {ticket.area ? (
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                    <MapPin size={14} />
                    {ticket.area.name}
                  </div>
                ) : <span className="text-sm text-slate-400 italic">Sin área</span>}
              </div>
            </CardContent>
          </Card>

          {/* User Assignment Card */}
          <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Participantes</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reportado por</label>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Avatar className="h-8 w-8 ring-2 ring-white">
                    <AvatarFallback className="bg-emerald-600 text-white text-[10px] font-bold">
                      {getInitials(creator.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-slate-900 truncate">{creator.name}</span>
                </div>
              </div>

<<<<<<< HEAD
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsable</label>
                {isAdmin ? (
                  <Select value={ticket.assignedToId || 'none'} onValueChange={(v) => onAssign(v === 'none' ? '' : v)}>
                    <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50 font-medium text-sm">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl border-slate-200">
                      <SelectItem value="none" className="font-medium">Sin asignar</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id} className="font-medium cursor-pointer">
=======
              <div>
                <label className="text-xs text-[#5f6368] block mb-2 flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  Asignado a
                </label>
                {isOwner ? (
                  <Select 
                    value={ticket.assignedToId || 'unassigned'} 
                    onValueChange={(val) => onAssign(val === 'unassigned' ? '' : val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {/* Mostrar técnicos sugeridos primero */}
                      {technicians && technicians.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-bold text-[#1a73e8] bg-blue-50">
                            Técnicos Sugeridos (Misma área)
                          </div>
                          {technicians.map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>
                              <div className="flex flex-col">
                                <span>{tech.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  Carga: {tech._count?.assignedTickets || 0} tickets activos
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          <div className="h-px bg-slate-100 my-1" />
                        </>
                      )}
                      {/* Otros miembros del equipo */}
                      <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
                        Todo el equipo
                      </div>
                      {teamMembers
                        .filter(m => !technicians?.some(t => t.id === m.id))
                        .map(member => (
                        <SelectItem key={member.id} value={member.id}>
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                    {assignee ? (
                      <>
                        <Avatar className="h-8 w-8 ring-2 ring-white">
                          <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                            {getInitials(assignee?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold text-slate-900 truncate">{assignee?.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400 font-medium pl-2 italic">Sin asignar</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerta de Cancelación */}
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-slate-200 shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 border border-rose-100 shadow-sm shadow-rose-100">
              <AlertTriangle className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">¿Deseas cancelar este ticket?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-base leading-relaxed">
              Esta acción marcará el ticket como <span className="text-slate-900 font-bold">CANCELADO</span>. El equipo técnico dejará de trabajar en él y el proceso se detendrá definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 px-8 font-bold border-slate-200 text-slate-600 shadow-none">Seguir con el ticket</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelTicket}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-rose-100 border-none"
            >
              Sí, cancelar ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Meeting Proposal Dialog (Omitido por brevedad pero sigue la misma lógica estética) */}
      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden bg-white">
           <div className="bg-slate-900 px-8 py-10 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CalendarIcon size={120} />
                </div>
                <DialogTitle className="text-2xl font-bold mb-2">{reproposingMeetingId ? 'Reprogramar Reunión' : 'Proponer Reunión'}</DialogTitle>
                <DialogDescription className="text-slate-400 text-sm font-medium">
                   Agenda un espacio para resolver dudas o revisar el avance del ticket.
                </DialogDescription>
            </div>
          
          <div className="p-8 space-y-6">
            {!reproposingMeetingId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Asunto de la reunión</label>
                <Input 
                  value={meetingData.title}
                  onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                <Input type="date" value={meetingData.date} onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hora</label>
                <Input type="time" value={meetingData.time} onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsMeetingDialogOpen(false)} className="rounded-xl h-12 px-6 font-bold text-slate-500">Cancelar</Button>
              <Button onClick={handleCreateOrReproposeMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-10 font-bold shadow-xl shadow-indigo-100">
                {reproposingMeetingId ? 'Reprogramar' : 'Enviar Propuesta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
