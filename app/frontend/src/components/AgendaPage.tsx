import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMeetings } from '@/hooks/useMeetings';
import { useTickets } from '@/hooks/useTickets';
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
  ExternalLink, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';
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
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  const handlePrevDay = () => {
    setDirection(-1);
    setDate((prev) => subDays(prev, 1));
  };
  
  const handleNextDay = () => {
    setDirection(1);
    setDate((prev) => addDays(prev, 1));
  };
  
  const handleToday = () => {
    setDirection(date < new Date() ? 1 : -1);
    setDate(new Date());
  };

  const handleViewTicket = async (meeting: Meeting) => {
    if (!onViewTicket) return;
    
    try {
      setIsNavigating(meeting.id);
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

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <CalendarIcon className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Agenda Técnica</h1>
          </div>
          <p className="text-muted-foreground font-medium">Gestiona tu itinerario y sesiones confirmadas.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-md">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevDay} 
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToday} 
            className={cn(
              "px-4 h-9 text-xs font-bold rounded-xl transition-all",
              isToday(date) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
          >
            Hoy
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 gap-2 border-border bg-muted/30 font-bold rounded-xl hover:bg-muted transition-all text-foreground"
              >
                <CalendarDays className="h-4 w-4 text-primary" strokeWidth={2} />
                <span className="capitalize">{format(date, "d 'de' MMMM", { locale: es })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-border bg-card shadow-2xl" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDirection(d > date ? 1 : -1);
                    setDate(d);
                  }
                }}
                initialFocus
                locale={es}
                className="rounded-2xl"
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextDay} 
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado izquierdo: Hoja Diaria */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={date.toISOString()}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none shadow-md overflow-hidden bg-card rounded-3xl group relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                
                <div className="pt-8 pb-4 text-center">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">
                    {format(date, 'EEEE', { locale: es })}
                  </span>
                </div>
                
                <CardContent className="flex flex-col items-center justify-center pb-10 pt-2">
                  <div className="relative mb-4">
                    <span className="text-8xl font-bold text-foreground tracking-tighter select-none">
                      {format(date, 'd')}
                    </span>
                    {isToday(date) && (
                      <div className="absolute -top-2 -right-4 p-1.5 bg-primary rounded-full border-2 border-card shadow-lg">
                        <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-0.5">
                    <p className="text-xl font-bold text-muted-foreground capitalize">
                      {format(date, 'MMMM', { locale: es })}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground/50">
                      {format(date, 'yyyy')}
                    </p>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-border w-full flex justify-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Citas</p>
                      <p className="text-2xl font-bold text-foreground">{filteredMeetings.length}</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Estado</p>
                      <Badge variant={filteredMeetings.length > 0 ? 'warning' : 'success'} className="font-bold px-2.5 py-0.5 rounded-lg text-[10px]">
                        {filteredMeetings.length > 0 ? 'OCUPADO' : 'LIBRE'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Lado derecho: Itinerario */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-md bg-card rounded-3xl overflow-hidden min-h-[500px]">
            <CardHeader className="px-8 py-6 flex flex-row items-center justify-between border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                  <Clock className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
                </div>
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">Itinerario</CardTitle>
              </div>
              <Badge variant="info" className="px-3 py-1 rounded-lg font-bold text-[11px]">
                {filteredMeetings.length} Confirmadas
              </Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={2} />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Sincronizando agenda...</p>
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl bg-muted/10">
                    <div className="bg-card w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-border">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground/20" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-wide">Día despejado</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">No tienes reuniones programadas para este día.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMeetings.map((meeting, index) => (
                      <motion.div 
                        key={meeting.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative flex flex-col md:flex-row md:items-center gap-6 p-5 border border-border bg-card hover:bg-muted/30 hover:border-primary/30 rounded-2xl shadow-sm transition-all duration-300"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary rounded-l-2xl" />

                        <div className="relative z-10 flex-shrink-0 w-14 h-14 bg-muted border border-border text-foreground rounded-xl flex flex-col items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors duration-300">
                          <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{format(new Date(meeting.scheduledAt), 'HH:mm')}</span>
                          <span className="text-lg font-bold leading-tight">{meeting.duration}</span>
                          <span className="text-[8px] font-bold uppercase text-muted-foreground">MIN</span>
                        </div>

                        <div className="flex-grow space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{meeting.title}</h3>
                            <Badge variant={meeting.type === 'VIRTUAL' ? 'info' : 'warning'} className="text-[9px] font-bold px-2 py-0.5 rounded-md">
                              {meeting.type === 'VIRTUAL' ? <Video className="w-2.5 h-2.5 mr-1 inline" strokeWidth={2} /> : <MapPin className="w-2.5 h-2.5 mr-1 inline" strokeWidth={2} />}
                              {meeting.type}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                              <TicketIcon className="w-3.5 h-3.5 text-primary/40" strokeWidth={2} />
                              <span className="truncate max-w-[180px]">{meeting.ticket?.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-primary/40" strokeWidth={2} />
                              <span>{meeting.employee?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 md:pl-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={!!isNavigating}
                            onClick={() => handleViewTicket(meeting)}
                            className="w-full md:w-auto text-primary font-bold hover:bg-primary/10 rounded-xl flex items-center gap-2 px-4 transition-all"
                          >
                            {isNavigating === meeting.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span className="text-xs uppercase tracking-widest">Detalles</span>
                                <ChevronRight className="h-4 w-4" strokeWidth={2} />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
