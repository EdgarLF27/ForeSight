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
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      rotateY: direction > 0 ? 10 : -10,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      rotateY: direction < 0 ? 10 : -10,
    }),
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Agenda Técnica</h1>
          </div>
          <p className="text-muted-foreground font-medium">Gestiona tu itinerario y sesiones confirmadas.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-2xl border border-border shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevDay} 
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToday} 
            className={cn(
              "px-4 h-9 text-sm font-bold rounded-xl transition-all",
              isToday(date) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            Hoy
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 gap-2 border-border font-bold rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all shadow-none"
              >
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="capitalize">{format(date, "d 'de' MMMM", { locale: es })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-2xl" align="end">
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
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado izquierdo: Hoja Diaria Animada */}
        <div className="lg:col-span-4 perspective-1000">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={date.toISOString()}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotateY: { duration: 0.4 }
              }}
              className="relative"
            >
              <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] group ring-1 ring-border/50">
                <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
                
                <div className="pt-10 pb-6 text-center">
                  <span className="text-primary text-sm font-black uppercase tracking-[0.3em]">
                    {format(date, 'EEEE', { locale: es })}
                  </span>
                </div>
                
                <CardContent className="flex flex-col items-center justify-center pb-12 pt-4">
                  <div className="relative mb-6">
                    <motion.span 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-9xl font-black text-foreground tracking-tighter select-none drop-shadow-sm"
                    >
                      {format(date, 'd')}
                    </motion.span>
                    {isToday(date) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-4 -right-6 p-2 bg-primary rounded-full border-4 border-white dark:border-slate-900 shadow-xl"
                      >
                        <Sparkles className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-muted-foreground capitalize">
                      {format(date, 'MMMM', { locale: es })}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground/40 tracking-widest">
                      {format(date, 'yyyy')}
                    </p>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-border w-full flex justify-center gap-10">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest mb-1">Citas</p>
                      <p className="text-3xl font-black text-primary">{filteredMeetings.length}</p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest mb-2">Estado</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black px-3 py-1 rounded-lg">
                        {filteredMeetings.length > 0 ? 'OCUPADO' : 'LIBRE'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                
                {/* Agujeros de espiral decorativos */}
                <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-around py-12 pointer-events-none opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600 shadow-inner" />
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Lado derecho: Itinerario */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden min-h-[500px] ring-1 ring-border/50">
            <CardHeader className="px-8 py-8 flex flex-row items-center justify-between border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Itinerario</CardTitle>
              </div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 rounded-xl font-bold text-xs">
                {filteredMeetings.length} Confirmadas
              </Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Sincronizando agenda...</p>
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 border-2 border-dashed border-border rounded-[2rem] bg-slate-50/30 dark:bg-slate-800/10"
                  >
                    <div className="bg-white dark:bg-slate-800 w-20 h-20 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 border border-border">
                      <CalendarIcon className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Día despejado</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">No tienes reuniones programadas. ¡Disfruta de tu tiempo libre!</p>
                  </motion.div>
                ) : (
                  <div className="relative space-y-4">
                    {/* Línea de tiempo decorativa */}
                    <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-border/50 hidden md:block" />
                    
                    {filteredMeetings.map((meeting, index) => (
                      <motion.div 
                        key={meeting.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex flex-col md:flex-row md:items-center gap-6 p-6 border border-border/50 rounded-3xl bg-white dark:bg-slate-900 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                      >
                        <div className="relative z-10 flex-shrink-0 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">{format(new Date(meeting.scheduledAt), 'HH:mm')}</span>
                          <span className="text-lg font-black leading-tight">{meeting.duration}</span>
                          <span className="text-[8px] font-black uppercase opacity-60">MIN</span>
                        </div>

                        <div className="flex-grow space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{meeting.title}</h3>
                            <Badge className={cn(
                              "border-none text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-sm",
                              meeting.type === 'VIRTUAL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            )}>
                              {meeting.type === 'VIRTUAL' ? <Video className="w-3 h-3 mr-1.5 inline" /> : <MapPin className="w-3 h-3 mr-1.5 inline" />}
                              {meeting.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <TicketIcon className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span className="truncate max-w-[200px]">{meeting.ticket?.title}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <User className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span>{meeting.employee?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 md:pl-4">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            disabled={!!isNavigating}
                            onClick={() => handleViewTicket(meeting)}
                            className="w-full md:w-auto bg-primary/5 text-primary font-bold hover:bg-primary hover:text-white rounded-xl flex items-center gap-2 px-5 transition-all duration-300 shadow-none border-none"
                          >
                            {isNavigating === meeting.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Ver Ticket</span>
                                <ExternalLink className="w-4 h-4" />
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
