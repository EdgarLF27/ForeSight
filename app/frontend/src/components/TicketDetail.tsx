import { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Send,
  CheckCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
import type { Ticket, Comment, User, TicketStatus } from '@/types';

interface TicketDetailProps {
  ticket: Ticket;
  comments: Comment[];
  currentUser: User;
  teamMembers: User[];
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => void;
  onAssign: (userId: string) => void;
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
  onBack,
  onUpdateStatus,
  onAssign,
  onAddComment,
}: TicketDetailProps) {
  const [newComment, setNewComment] = useState('');
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const assignee = teamMembers.find(m => m.id === ticket.assignedTo);
  const creator = teamMembers.find(m => m.id === ticket.createdBy) || currentUser;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
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
          {currentUser.role === 'EMPRESA' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Cambiar estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdateStatus('OPEN')}>
                  <AlertIcon className="h-4 w-4 mr-2 text-[#ea4335]" />
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

          {/* Comments */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-[#5f6368] mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentarios ({comments.length})
              </h2>

              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <p className="text-center text-[#5f6368] py-4">
                    No hay comentarios aún. Sé el primero en comentar.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-[#1a73e8] text-white text-xs">
                          {/* We don't have firstName/lastName in Comment type yet, assuming userName is still there or needs update */}
                          {comment.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-[#202124]">{comment.userName}</span>
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
                    {getInitials(currentUser.firstName, currentUser.lastName)}
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
            </CardContent>
          </Card>

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
                      {getInitials(creator.firstName, creator.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[#202124]">{creator.firstName} {creator.lastName}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#5f6368] block mb-2 flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  Asignado a
                </label>
                {currentUser.role === 'EMPRESA' ? (
                  <Select 
                    value={ticket.assignedTo || ''} 
                    onValueChange={onAssign}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
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
                            {getInitials(assignee.firstName, assignee.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-[#202124]">{assignee.firstName} {assignee.lastName}</span>
                      </>
                    ) : (
                      <span className="text-sm text-[#5f6368]">Sin asignar</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
