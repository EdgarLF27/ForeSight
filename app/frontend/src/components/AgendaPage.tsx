import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMeetings } from '@/hooks/useMeetings';
import { useTickets } from '@/hooks/useTickets';
import { Calendar as CalendarIcon, Clock, User, Ticket as TicketIcon, Video, MapPin, ChevronLeft, ChevronRight, CalendarDays, ExternalLink, Loader2 } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Ticket, Meeting } from '@/types';
import { toast } from 'sonner';

interface AgendaPageProps {
  onViewTicket?: (ticket: Ticket) => void;
}

export function AgendaPage({ onViewTicket }: AgendaPageProps) {
  const { agenda, isLoading, loadAgenda } = useMeetings();
  const { getTicketById } = useTickets();
  const [date, setDate] = React.useState<Date>(new Date());
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  const handlePrevDay = () => setDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setDate((prev) => addDays(prev, 1));
  const handleToday = () => setDate(new Date());

  const handleViewTicket = async (meeting: Meeting) => {
    if (!onViewTicket) return;
    
    try {
      setIsNavigating(meeting.id);
      // Obtenemos el ticket completo desde la API para evitar errores de campos faltantes
      const fullTicket = await getTicketById(meeting.ticketId);
      
      if (fullTicket) {
        onViewTicket(fullTicket);
      } else {
        toast.error('No se pudo encontrar la información completa del ticket.');
      }
    } catch (err) {
      toast.error('Error al cargar los detalles del ticket.');
    } finally {
      setIsNavigating(null);
    }
  };

  const filteredMeetings = agenda.filter(meeting => {
    if (!date) return true;
    const meetingDate = new Date(meeting.scheduledAt);
    return (
      meetingDate.getDate() === date.getDate() &&
      meetingDate.getMonth() === date.getMonth() &&
      meetingDate.getFullYear() === date.getFullYear()
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">Mi Agenda de Reuniones</h1>
          <p className="text-[#5f6368]">Gestiona tus próximas sesiones técnicas confirmadas.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-9 w-9 text-gray-600 hover:text-[#1a73e8] hover:bg-blue-50">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday} className="px-3 h-8 text-sm font-medium text-gray-700 hover:text-[#1a73e8]">
            Hoy
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-9 px-3 gap-2 border-gray-200 font-medium hover:bg-gray-50",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarDays className="h-4 w-4 text-[#1a73e8]" />
                {format(date, "d 'de' MMMM", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-9 w-9 text-gray-600 hover:text-[#1a73e8] hover:bg-blue-50">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lado izquierdo: Hoja de Calendario Estilo Moderno */}
        <Card className="lg:col-span-1 border-none shadow-md overflow-hidden bg-white group">
          <div className="bg-[#1a73e8] p-3 text-center transition-colors group-hover:bg-[#1557b0]">
            <span className="text-white text-sm font-bold uppercase tracking-widest">
              {format(date, 'EEEE', { locale: es })}
            </span>
          </div>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <span className="text-8xl font-black text-[#202124] tracking-tighter select-none">
                {format(date, 'd')}
              </span>
              <div className="absolute -top-2 -right-4 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-sm" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xl font-semibold text-[#5f6368] capitalize">
                {format(date, 'MMMM', { locale: es })}
              </p>
              <p className="text-sm font-medium text-gray-400 mt-1">
                Año {format(date, 'yyyy')}
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 w-full flex justify-center gap-4">
               <div className="text-center">
                 <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Citas</p>
                 <p className="text-xl font-bold text-[#1a73e8]">{filteredMeetings.length}</p>
               </div>
               <div className="w-px h-8 bg-gray-100 mx-2" />
               <div className="text-center">
                 <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Estado</p>
                 <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-100 text-[10px] py-0 px-1.5 h-4">
                   Activo
                 </Badge>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Lado derecho: Lista de reuniones */}
        <Card className="lg:col-span-3 border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1a73e8]" />
              Itinerario del Día
            </CardTitle>
            <Badge className="bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] border-none px-3 py-1 font-semibold">
              {filteredMeetings.length} Confirmadas
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredMeetings.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <CalendarIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-1">Sin actividades</h3>
                  <p className="text-gray-500 text-sm">No tienes reuniones programadas para este día.</p>
                </div>
              ) : (
                filteredMeetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    className="group flex flex-col md:flex-row md:items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/20 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-[#1a73e8] border border-gray-100 group-hover:border-blue-200 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{format(new Date(meeting.scheduledAt), 'HH:mm')}</span>
                      <span className="text-lg font-black leading-tight">{meeting.duration}</span>
                      <span className="text-[8px] font-bold uppercase opacity-50">MIN</span>
                    </div>

                    <div className="flex-grow space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#1a73e8] transition-colors">{meeting.title}</h3>
                        <Badge className={cn(
                          "border-none text-[10px] font-bold",
                          meeting.type === 'VIRTUAL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        )}>
                          {meeting.type === 'VIRTUAL' ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                          {meeting.type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <TicketIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium truncate max-w-[200px]">{meeting.ticket?.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{meeting.employee?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!!isNavigating}
                        onClick={() => handleViewTicket(meeting)}
                        className="text-[#1a73e8] font-bold hover:bg-blue-100 hover:text-[#1557b0] rounded-lg flex items-center gap-1.5"
                      >
                        {isNavigating === meeting.id ? (
                          <>
                            Cargando...
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </>
                        ) : (
                          <>
                            Ver Detalles
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
