import { useState } from 'react';
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
  Building2
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
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function Layout({ children, user, company, onLogout, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función segura para obtener iniciales
  const getInitials = (firstName: string = '', lastName: string = '') => {
    const f = firstName ? firstName[0] : '';
    const l = lastName ? lastName[0] : '';
    return (f + l).toUpperCase() || 'U'; // 'U' de Usuario si no hay nada
  };

  const firstName = user?.firstName || 'Usuario';
  const lastName = user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

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
              <div className="w-10 h-10 bg-[#6B9E8A] rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-medium text-[#202124]">ForeSight</h1>
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-[#5f6368]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ea4335] rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#6B9E8A] text-white text-sm">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-[#202124]">{fullName}</span>
                  <ChevronDown className="h-4 w-4 text-[#5f6368]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-[#202124]">{fullName}</p>
                  <p className="text-xs text-[#5f6368]">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {user?.role === 'EMPRESA' ? 'Administrador' : 'Empleado'}
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
            
            // Ocultar "Equipo" para empleados
            if (item.id === 'team' && user?.role === 'EMPLEADO') return null;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#e8f0fe] text-[#6B9E8A]' 
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
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-br from-[#6B9E8A] to-[#4A7A68] rounded-xl text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium opacity-90">Tu empresa</span>
            </div>
            <p className="text-sm font-medium truncate">{company.name}</p>
            {user?.role === 'EMPRESA' && (
              <p className="text-xs opacity-75 mt-1 font-mono">Código: {company.inviteCode}</p>
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
