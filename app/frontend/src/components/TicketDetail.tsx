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
  History,
  Circle
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
import { useMeetings } from '@/hooks/useMeetings';
import type { Ticket, Comment, User, TicketStatus, Meeting } from '@/types';

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
  OPEN: { label: 'Abierto', color: 'bg-[#ea4335]', textColor: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-[#f9ab00]', textColor: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  RESOLVED: { label: 'Resuelto', color: 'bg-[#34a853]', textColor: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  CLOSED: { label: 'Cerrado', color: 'bg-[#5f6368]', textColor: 'text-[#5f6368]', bgColor: 'bg-[#f1f3f4]' },
};

const priorityConfig = {
  LOW: { label: 'Baja', color: 'text-[#34a853]', bgColor: 'bg-[#e6f4ea]' },
  MEDIUM: { label: 'Media', color: 'text-[#f9ab00]', bgColor: 'bg-[#fef3e8]' },
  HIGH: { label: 'Alta', color: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
  URGENT: { label: 'Urgente', color: 'text-[#ea4335]', bgColor: 'bg-[#fce8e6]' },
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

  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const assignee = teamMembers.find(m => m.id === ticket.assignedToId);
  const creator = typeof ticket.createdBy === 'object' ? ticket.createdBy : { id: ticket.createdBy as string, name: 'Usuario' };

  const isOwner = currentUser.role?.name === 'Administrador' || currentUser.role === 'EMPRESA';
  const isTechnician = currentUser.role?.name === 'Técnico';
  const isAssignedToMe = ticket.assignedToId === currentUser.id;

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

  const handleCreateOrReproposeMeeting = async () => {
    if (!meetingData.date || !meetingData.time) {
      return;
    }
    const scheduledAt = new Date(`${meetingData.date}T${meetingData.time}`).toISOString();
    
    let success = false;
    if (reproposingMeetingId) {
      success = await repropose(reproposingMeetingId, {
        scheduledAt,
        duration: Number(meetingData.duration)
      });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-[#202124] truncate">{ticket.title}</h1>
            <Badge className={`${status.bgColor} ${status.textColor} border-0`}>
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-[#5f6368]">
            #{ticket.id.slice(-6).toUpperCase()} • Creado el {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {isTechnician && isAssignedToMe && (
            <Button 
              onClick={() => {
                setReproposingMeetingId(null);
                setMeetingData({
                  title: `Reunión: ${ticket.title}`,
                  description: '',
                  date: '',
                  time: '',
                  type: 'VIRTUAL',
                  duration: 60
                });
                setIsMeetingDialogOpen(true);
              }}
              className="bg-[#34a853] hover:bg-[#2d8a46] text-white"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Proponer Reunión
            </Button>
          )}

          {isTechnician && !ticket.assignedToId && onClaim && (
            <Button 
              onClick={onClaim}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white"
            >
              Reclamar Ticket
            </Button>
          )}

          {(isOwner || isAssignedToMe) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Cambiar estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdateStatus('OPEN')}>
                  <Clock className="h-4 w-4 mr-2 text-[#ea4335]" />
                  Marcar como Abierto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('IN_PROGRESS')}>
                  <PlayCircle className="h-4 w-4 mr-2 text-[#f9ab00]" />
                  Marcar en Progreso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('RESOLVED')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-[#34a853]" />
                  Marcar como Resuelto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('CLOSED')}>
                  <XCircle className="h-4 w-4 mr-2 text-[#5f6368]" />
                  Cerrar ticket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-[#5f6368] mb-3">Descripción</h2>
              <p className="text-[#202124] whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Tabs: Comments & Meetings */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="bg-transparent border-b border-[#dadce0] w-full justify-start rounded-none h-auto p-0 gap-6">
              <TabsTrigger 
                value="comments" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a73e8] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 h-auto text-sm font-medium"
              >
                Comentarios ({comments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="meetings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a73e8] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 h-auto text-sm font-medium"
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

            <TabsContent value="comments" className="mt-6 space-y-6">
              {/* ... contenido existente de comentarios ... */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-[#5f6368] py-4">
                    No hay comentarios aún.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-[#1a73e8] text-white text-xs">
                          {getInitials(comment.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-[#202124]">{comment.user?.name || 'Usuario'}</span>
                          {comment.user?.role && (
                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-[#f1f3f4] text-[#5f6368] border-0">
                              {typeof comment.user.role === 'object' ? comment.user.role.name : comment.user.role}
                            </Badge>
                          )}
                          <span className="text-xs text-[#80868b]">
                            {new Date(comment.createdAt).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="text-sm text-[#202124]">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-[#1a73e8] text-white text-xs">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!newComment.trim()}
                    className="bg-[#1a73e8] hover:bg-[#1557b0]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="meetings" className="mt-6">
              {/* ... contenido existente de reuniones ... */}
              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-[#dadce0]">
                    <CalendarIcon className="h-12 w-12 text-[#dadce0] mx-auto mb-3" />
                    <p className="text-[#5f6368]">No se han programado reuniones para este ticket.</p>
                    {isTechnician && isAssignedToMe && (
                      <Button 
                        variant="link" 
                        onClick={() => setIsMeetingDialogOpen(true)}
                        className="text-[#1a73e8] mt-2"
                      >
                        Proponer la primera reunión
                      </Button>
                    )}
                  </div>
                ) : (
                  meetings.map((m) => (
                    <Card key={m.id} className="overflow-hidden border-[#dadce0]">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${m.type === 'VIRTUAL' ? 'bg-[#e8f0fe]' : 'bg-[#e6f4ea]'}`}>
                              {m.type === 'VIRTUAL' ? <Video className="h-5 w-5 text-[#1a73e8]" /> : <MapPin className="h-5 w-5 text-[#34a853]" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#202124]">{m.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-[#5f6368]">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  {new Date(m.scheduledAt).toLocaleDateString('es-ES')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(m.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Badge variant="secondary" className="text-[10px] py-0 h-4 uppercase">{m.status}</Badge>
                                </span>
                              </div>
                              {m.lastProposedById === currentUser.id && m.status === 'PROPOSED' && (
                                <p className="text-[11px] text-[#f9ab00] mt-1 font-medium italic">
                                  Esperando respuesta de la otra parte...
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Acciones de negociación */}
                          {m.status === 'PROPOSED' && m.lastProposedById !== currentUser.id && (
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-[#5f6368] border-[#dadce0]"
                                onClick={() => openReproposeDialog(m)}
                              >
                                <CalendarIcon className="h-4 w-4 mr-1" /> Proponer otro horario
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-[#ea4335] hover:bg-[#fce8e6] border-[#ea4335]"
                                onClick={() => updateStatus(m.id, 'REJECTED')}
                              >
                                <X className="h-4 w-4 mr-1" /> Rechazar
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-[#34a853] hover:bg-[#2d8a46] text-white"
                                onClick={() => updateStatus(m.id, 'ACCEPTED')}
                              >
                                <Check className="h-4 w-4 mr-1" /> Aceptar
                              </Button>
                            </div>
                          )}
                        </div>
                        {m.description && (
                          <p className="mt-3 text-sm text-[#5f6368] border-t border-gray-100 pt-3">
                            {m.description}
                          </p>
                        )}
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* ... resto del sidebar ... */}
          {/* Status Card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[#5f6368] block mb-1">Estado</label>
                <Badge className={`${status.bgColor} ${status.textColor} border-0`}>
                  {status.label}
                </Badge>
              </div>

              <div>
                <label className="text-xs text-[#5f6368] block mb-1">Prioridad</label>
                <Badge variant="outline" className={`${priority.color} ${priority.bgColor} border-0`}>
                  {priority.label}
                </Badge>
              </div>

              <div>
                <label className="text-xs text-[#5f6368] block mb-1">Categoría</label>
                <p className="text-sm text-[#202124]">{ticket.category}</p>
              </div>

              {ticket.area && (
                <div>
                  <label className="text-xs text-[#5f6368] block mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Área
                  </label>
                  <p className="text-sm text-[#1a73e8] font-medium">{ticket.area.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* People Card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[#5f6368] block mb-2 flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  Creado por
                </label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-[#34a853] text-white text-xs">
                      {getInitials(creator.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[#202124]">{creator.name}</span>
                </div>
              </div>

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
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    {assignee ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-[#1a73e8] text-white text-xs">
                            {getInitials(assignee?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-[#202124]">{assignee?.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-[#5f6368]">Sin asignar</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates Card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[#5f6368]" />
                <span className="text-[#5f6368]">Creado:</span>
                <span className="text-[#202124] ml-auto">
                  {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[#5f6368]" />
                <span className="text-[#5f6368]">Actualizado:</span>
                <span className="text-[#202124] ml-auto">
                  {new Date(ticket.updatedAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Meeting Proposal Dialog */}
      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-[#34a853]" />
              {reproposingMeetingId ? 'Proponer otro horario' : 'Proponer Reunión'}
            </DialogTitle>
            <DialogDescription>
              {reproposingMeetingId 
                ? 'Sugiere un nuevo horario para esta reunión.' 
                : 'Propón una fecha y hora para revisar este ticket con el empleado.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!reproposingMeetingId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Título de la reunión</label>
                <Input 
                  value={meetingData.title}
                  onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input 
                  type="date"
                  value={meetingData.date}
                  onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input 
                  type="time"
                  value={meetingData.time}
                  onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!reproposingMeetingId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm border border-[#dadce0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    value={meetingData.type}
                    onChange={(e) => setMeetingData({ ...meetingData, type: e.target.value })}
                  >
                    <option value="VIRTUAL">Virtual (Meet/Teams)</option>
                    <option value="PRESENCIAL">Presencial</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Duración (min)</label>
                <Input 
                  type="number"
                  min="15"
                  step="15"
                  value={meetingData.duration}
                  onChange={(e) => setMeetingData({ ...meetingData, duration: Number(e.target.value) })}
                />
              </div>
            </div>

            {!reproposingMeetingId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Observaciones (opcional)</label>
                <Textarea 
                  placeholder="Ej: Necesitaremos revisar el acceso al servidor..."
                  value={meetingData.description}
                  onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#34a853] hover:bg-[#2d8a46] text-white"
              onClick={handleCreateOrReproposeMeeting}
              disabled={!meetingData.date || !meetingData.time}
            >
              {reproposingMeetingId ? 'Enviar Nueva Propuesta' : 'Enviar Propuesta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
