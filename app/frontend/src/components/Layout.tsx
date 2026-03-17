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
  Shield,
  MapPin,
  CheckCheck,
  AlertCircle,
  Zap,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { getFileUrl } from '@/services/api';
import type { User, Company, Notification } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  company: Company | null;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: any) => void;
  onNotificationAction?: (link: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'areas', label: 'Áreas', icon: MapPin },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function Layout({ children, user, company, onLogout, currentPage, onPageChange, onNotificationAction }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { notifications, unreadCount, loadNotifications, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); 
      return () => clearInterval(interval);
    }
  }, [loadNotifications, user]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleDisplay = () => {
    if (user.role === 'EMPRESA') return 'Propietario';
    if (typeof user.role === 'object') return (user.role as any).name;
    return user.role;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
      case 'URGENT':
        return (
          <div className="relative">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div className="absolute inset-0 bg-red-500/20 blur-md rounded-full" />
          </div>
        );
      case 'INFO':
      case 'COMMENT_RECEIVED':
        return (
          <div className="relative">
            <Zap className="h-4 w-4 text-[#00f2ff]" />
            <div className="absolute inset-0 bg-[#00f2ff]/20 blur-md rounded-full" />
          </div>
        );
      case 'TICKET_ASSIGNED': 
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      case 'STATUS_CHANGED': 
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default: 
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    if (n.link && onNotificationAction) onNotificationAction(n.link);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'CRITICAL':
      case 'URGENT': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      default: return 'bg-[#0070f3] shadow-[0_0_10px_rgba(0,112,243,0.5)]';
    }
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `Hace ${diff}m`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
    return then.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const companyName = company?.name || 'ForeSight';

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-50">
        <div className="h-full flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border border-primary/10">
                {company?.logo ? (
                  <img src={getFileUrl(company.logo) || ''} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <span className="text-primary-foreground font-black text-lg">{companyName.charAt(0)}</span>
                )}
              </div>
              <h1 className="text-lg font-black tracking-tight hidden sm:block uppercase">{companyName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* PANEL DE NOTIFICACIONES */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild id="notifications-bell">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/5 transition-colors group">
                  <Bell className={`h-5 w-5 transition-colors ${unreadCount > 0 ? 'text-[#00f2ff] animate-pulse' : 'text-slate-400 group-hover:text-white'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,112,243,0.2)] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff]">Notificaciones</span>
                    {unreadCount > 0 && <span className="text-[9px] text-slate-400 font-bold mt-0.5">{unreadCount} PENDIENTES</span>}
                  </div>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAllRead(); }} className="h-7 px-3 text-[9px] font-black uppercase text-slate-400 hover:text-[#00f2ff] hover:bg-white/5 rounded-lg tracking-wider">
                      <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Leer todas
                    </Button>
                  )}
                </div>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center gap-3">
                      <div className="relative">
                        <Bell className="h-8 w-8 text-slate-700 animate-[pulse_4s_infinite]" />
                        <div className="absolute inset-0 bg-slate-400/5 blur-xl rounded-full" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Todo al día</p>
                    </div>
                   ) : (
                    notifications.map(n => (
                      <DropdownMenuItem 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)} 
                        className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-white/[0.03] transition-all duration-300 border-b border-white/5 last:border-0 relative group/item ${!n.read ? 'bg-[#0070f3]/5' : ''}`}
                      >
                        {/* Indicador lateral táctico */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300 ${!n.read ? getNotificationColor(n.type) : 'bg-transparent'}`} />
                        
                        <div className={`mt-1 p-2 rounded-xl transition-all duration-300 ${!n.read ? 'bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10' : 'bg-transparent opacity-50'}`}>
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-[11px] font-black uppercase tracking-tight ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                              {n.title}
                            </p>
                            <span className="text-[9px] font-medium text-slate-500 font-mono">
                              {formatTimestamp(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2 font-medium">
                            {n.message}
                          </p>
                        </div>

                        {/* Botón de acción rápido al hover */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            {!n.read && (
                                <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-[#00f2ff]/50 text-slate-400 hover:text-[#00f2ff]">
                                    <CheckCheck className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                      </DropdownMenuItem>
                    ))
                   )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                    <Button 
                        variant="ghost" 
                        className="w-full h-9 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#00f2ff] hover:bg-white/5 rounded-xl transition-all"
                        onClick={markAllRead}
                    >
                        Limpiar todas las notificaciones
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* PERFIL DE USUARIO */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild id="user-profile">
                <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-muted transition-colors rounded-xl h-10 border border-border">
                  <Avatar className="h-7 w-7 border border-primary/20">
                    <AvatarImage src={getFileUrl(user.avatar) || ''} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start text-left leading-none">
                    <span className="text-xs font-bold text-foreground">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{getRoleDisplay()}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 border-border bg-card shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold uppercase tracking-tight">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive rounded-xl cursor-pointer font-bold text-xs py-2.5 focus:bg-destructive/10 focus:text-destructive uppercase tracking-widest">
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar Minimalista */}
      <aside id="sidebar-nav" className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isAdmin = user.role === 'Administrador' || (typeof user.role === 'object' && (user.role as any).name === 'Administrador') || user.role === 'EMPRESA';
            const isTechnician = (typeof user.role === 'object' && (user.role as any).name === 'Técnico');
            if ((item.id === 'team' || item.id === 'roles' || item.id === 'areas') && !isAdmin) return null;
            if (item.id === 'agenda' && !isAdmin && !isTechnician) return null;
            return (
              <button key={item.id} onClick={() => { onPageChange(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group uppercase tracking-tighter ${isActive ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
