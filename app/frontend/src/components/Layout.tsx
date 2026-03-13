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
  Building2,
  Shield,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import type { User, Company } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  company: Company | null;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: any) => void;
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

export function Layout({ children, user, company, onLogout, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, loadNotifications, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-2xl hover:bg-primary/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Ticket className="h-5 w-5 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight text-foreground">ForeSight</h1>
                {company && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Building2 className="h-3 w-3" />
                    {company.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-primary/10">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto rounded-2xl p-2 border-border shadow-xl">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border mb-1">
                  <span className="font-bold text-sm">Notificaciones</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllRead();
                      }}
                    >
                      Marcar todas como leídas
                    </Button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem 
                      key={n.id} 
                      className={`px-4 py-3 flex flex-col items-start gap-1 rounded-xl focus:bg-primary/5 cursor-pointer mb-1 ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => !n.read && markRead(n.id)}
                    >
                      <div className="flex justify-between w-full gap-2">
                        <span className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-foreground`}>{n.title}</span>
                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.createdAt).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-2xl hover:bg-primary/10">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-semibold text-foreground">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] font-bold tracking-wider uppercase rounded-lg">
                    {typeof user.role === 'object' ? user.role?.name : (user.role === 'EMPRESA' ? 'Administrador' : user.role)}
                  </Badge>
                </div>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={() => onPageChange('settings')} className="rounded-xl cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="text-destructive rounded-xl cursor-pointer focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-border z-40 transition-all duration-500 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            const isAdmin = user.role === 'Administrador' || (typeof user.role === 'object' && user.role?.name === 'Administrador') || user.role === 'EMPRESA';
            const isTechnician = (typeof user.role === 'object' && user.role?.name === 'Técnico');

            if ((item.id === 'team' || item.id === 'roles' || item.id === 'areas') && !isAdmin) return null;
            if (item.id === 'agenda' && !isAdmin && !isTechnician) return null;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]' 
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        {/* Company Info Card */}
        {company && (
          <div className="absolute bottom-6 left-4 right-4 p-5 bg-gradient-to-br from-primary to-blue-700 rounded-3xl text-white shadow-lg overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Building2 size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Empresa</span>
              </div>
              <p className="text-sm font-bold truncate">{company.name}</p>
              {user.role === 'EMPRESA' && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-[10px] opacity-70">Código de Invitación</p>
                  <p className="text-xs font-mono font-bold tracking-widest">{company.inviteCode}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
