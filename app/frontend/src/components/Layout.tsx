import { useState, useEffect } from 'react';
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
  CheckCheck,
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
    // Polling cada 30 segundos para nuevas notificaciones
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
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#dadce0] z-50 shadow-sm">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1a73e8] to-[#1557b0] rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-medium text-[#202124]">TicketClass</h1>
                {company && (
                  <p className="text-xs text-[#5f6368] flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {company.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-[#5f6368]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#ea4335] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#dadce0]">
                  <span className="font-semibold text-sm">Notificaciones</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-[#1a73e8] hover:bg-transparent"
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
                  <div className="py-8 text-center text-sm text-[#5f6368]">
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem 
                      key={n.id} 
                      className={`px-4 py-3 flex flex-col items-start gap-1 focus:bg-gray-50 cursor-default ${!n.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => !n.read && markRead(n.id)}
                    >
                      <div className="flex justify-between w-full gap-2">
                        <span className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-[#202124]`}>{n.title}</span>
                        {!n.read && <div className="w-2 h-2 bg-[#1a73e8] rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[#5f6368] line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-[#80868b] mt-1">
                        {new Date(n.createdAt).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#1a73e8] text-white text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-[#202124]">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-[#5f6368]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-[#202124]">{user.name}</p>
                  <p className="text-xs text-[#5f6368]">{user.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {typeof user.role === 'object' ? user.role?.name : (user.role === 'EMPRESA' ? 'Administrador' : user.role)}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPageChange('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="text-[#ea4335]">
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
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#dadce0] z-40 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            const isAdmin = user.role === 'Administrador' || (typeof user.role === 'object' && user.role?.name === 'Administrador') || user.role === 'EMPRESA';
            const isTechnician = (typeof user.role === 'object' && user.role?.name === 'Técnico');

            // Ocultar "Equipo", "Roles" y "Áreas" para empleados
            if ((item.id === 'team' || item.id === 'roles' || item.id === 'areas') && !isAdmin) return null;
            
            // Ocultar "Agenda" si no es admin ni técnico (opcional, pero según tu requerimiento es para el técnico)
            if (item.id === 'agenda' && !isAdmin && !isTechnician) return null;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#e8f0fe] text-[#1a73e8]' 
                    : 'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Company Info Card */}
        {company && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-br from-[#1a73e8] to-[#1557b0] rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium opacity-90">Tu empresa</span>
            </div>
            <p className="text-sm font-medium truncate">{company.name}</p>
            {user.role === 'EMPRESA' && (
              <p className="text-xs opacity-75 mt-1">Código: {company.inviteCode}</p>
            )}
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
