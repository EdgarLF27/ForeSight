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
  Info,
  MessageSquare,
  UserPlus as AssignIcon,
  RefreshCw,
  Building2
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
      case 'TICKET_ASSIGNED': return <AssignIcon className="h-4 w-4 text-emerald-500" />;
      case 'COMMENT_RECEIVED': return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'STATUS_CHANGED': return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    if (n.link && onNotificationAction) onNotificationAction(n.link);
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
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted transition-colors">
                  <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 border-border bg-card shadow-2xl overflow-hidden">
                <div className="px-4 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest">Notificaciones</span>
                    {unreadCount > 0 && <span className="text-[10px] text-primary font-bold">{unreadCount} por leer</span>}
                  </div>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAllRead(); }} className="h-7 px-2 text-[10px] font-bold uppercase text-muted-foreground hover:text-primary rounded-lg">
                      <CheckCheck className="h-3 w-3 mr-1" /> Leer todas
                    </Button>
                  )}
                </div>
                <div className="max-h-[380px] overflow-y-auto">
                   {notifications.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-muted/50"><Bell className="h-6 w-6 text-muted-foreground/30" /></div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Todo al día</p>
                    </div>
                   ) : (
                    notifications.map(n => (
                      <DropdownMenuItem key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-0 relative ${!n.read ? 'bg-primary/5' : ''}`}>
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />}
                        <div className={`mt-1 p-2 rounded-xl ${!n.read ? 'bg-card shadow-sm border border-border' : 'bg-muted/50'}`}>
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${!n.read ? 'text-foreground' : 'text-muted-foreground'} uppercase tracking-tight`}>{n.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-2 block">
                            {new Date(n.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                   )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* PERFIL DE USUARIO */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
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
