import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  ChevronDown,
  Calendar,
  Layers,
  MessageSquare,
  Zap,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';
import { getFileUrl } from '@/services/api';
import { cn } from '@/lib/utils';
import type { User, Company } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  company: Company | null;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function Layout({ children, user, company, currentPage, onPageChange, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, deleteAll, loadNotifications } = useNotifications();
  const companyName = company?.name || 'ForeSight';

  // CARGAR NOTIFICACIONES AL MONTAR Y CUANDO CAMBIA EL USUARIO
  useEffect(() => {
    if (user) {
      loadNotifications();
      // Opcional: Polling cada 30 segundos
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'team', label: 'Equipo', icon: Users },
    { id: 'roles', label: 'Roles', icon: Layers },
    { id: 'areas', label: 'Áreas', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const filteredNavItems = navItems.filter(item => {
    const isAdmin = user.role === 'Administrador' || (typeof user.role === 'object' && (user.role as any).name === 'Administrador') || user.role === 'EMPRESA';
    if (['team', 'roles', 'areas'].includes(item.id)) return isAdmin;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TICKET_ASSIGNED': return <Zap className="h-4 w-4 text-amber-400" />;
      case 'NEW_COMMENT': return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'STATUS_CHANGED': return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative transition-colors duration-300">
      {/* CAPAS DE PROFUNDIDAD */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0 opacity-50 dark:opacity-100" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 blur-[120px] rounded-full pointer-events-none z-0 opacity-50 dark:opacity-100" />

      {/* Header Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-background/60 dark:bg-white/[0.01] backdrop-blur-xl border-b border-border dark:border-white/5 z-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
        <div className="h-full flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onPageChange('dashboard')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl italic">{companyName.charAt(0)}</span>
              </div>
              <h1 className="text-lg font-black tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors">
                {companyName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* PANEL DE NOTIFICACIONES GLASS */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 bg-accent/50 dark:bg-white/[0.03] border border-border dark:border-white/10 rounded-xl hover:bg-accent transition-all group">
                  <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-blue-400 animate-pulse' : 'text-muted-foreground'} group-hover:text-foreground transition-colors`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover/95 dark:bg-[#0a0a0b]/95 backdrop-blur-2xl border-border dark:border-white/10 rounded-2xl p-0 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-border dark:border-white/5 flex items-center justify-between bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Notificaciones</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        deleteAll();
                      }} 
                      className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase transition-colors"
                    >
                      Borrar Todo
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto font-sans">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sin Novedades</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <DropdownMenuItem key={n.id} onClick={() => markAsRead(n.id)} className="p-4 border-b border-border dark:border-white/5 cursor-pointer focus:bg-white/5">
                        <div className="flex gap-4">
                          <div className="mt-1">{getNotificationIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-foreground uppercase leading-tight truncate">{n.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed italic line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-accent rounded-xl transition-all">
                  <Avatar className="h-9 w-9 border border-border dark:border-white/10 shadow-sm">
                    <AvatarImage src={getFileUrl(user.avatar) || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-foreground uppercase tracking-tight">{user.name}</p>
                    <div className="flex flex-col">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic leading-tight">
                        {typeof user.role === 'object' ? (user.role as any).name : (user.role || 'Usuario')}
                      </p>
                      <p className="text-[9px] text-blue-500 dark:text-blue-400 font-black uppercase tracking-tighter leading-tight">
                        {user.area ? (typeof user.area === 'object' ? (user.area as any).name : user.area) : 'Sin Área'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-2xl border-border dark:border-white/10 rounded-2xl p-1.5 shadow-2xl">
                <div className="px-3 py-2 border-b border-border dark:border-white/5 mb-1">
                   <p className="text-[10px] font-black uppercase text-foreground">{user.name}</p>
                   <p className="text-[9px] text-muted-foreground uppercase">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer py-3">
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar Glass */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-background/60 dark:bg-white/[0.01] backdrop-blur-2xl border-r border-border dark:border-white/5 z-40 transition-transform duration-500 lg:translate-x-0 pt-24 px-4 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { onPageChange(item.id); setSidebarOpen(false); }} 
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs font-black transition-all duration-300 group uppercase tracking-[0.1em]",
                  isActive 
                  ? "bg-primary/10 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] dark:bg-blue-600/10 dark:text-blue-400" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-white/[0.03]"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-all duration-300", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "group-hover:text-primary")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`transition-all duration-500 lg:ml-64 pt-28 px-8 pb-12 relative z-10`}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
