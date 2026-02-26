import { useState } from 'react';
import { 
  Users, 
  Copy, 
  RefreshCw, 
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Search,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User, Company } from '@/types';

interface TeamPageProps {
  user: User;
  company: Company;
  teamMembers: User[];
  onRegenerateCode: () => string | null;
}

export function TeamPage({ user, company, teamMembers, onRegenerateCode }: TeamPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState(company.inviteCode);

  const filteredMembers = teamMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) ||
           member.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCode = () => {
    const newCode = onRegenerateCode();
    if (newCode) {
      setInviteCode(newCode);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#202124]">Equipo</h1>
        <p className="text-[#5f6368]">Gestiona los miembros de {company.name}</p>
      </div>

      {/* Invite Code Card */}
      <Card className="bg-gradient-to-br from-[#1a73e8] to-[#1557b0] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Código de invitación</h2>
              <p className="text-white/80 text-sm">
                Comparte este código para que nuevos empleados se unan a tu empresa
              </p>
            </div>
            <div className="flex items-center gap-3">
              <code className="bg-white/20 backdrop-blur px-6 py-3 rounded-xl text-2xl font-mono tracking-widest">
                {inviteCode}
              </code>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopyCode}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRegenerateCode}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e8f0fe] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-[#1a73e8]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">{teamMembers.length}</p>
              <p className="text-sm text-[#5f6368]">Miembros totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e6f4ea] rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#34a853]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">
                {teamMembers.filter(m => m.role === 'EMPRESA').length}
              </p>
              <p className="text-sm text-[#5f6368]">Administradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#fef3e8] rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-[#f9ab00]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#202124]">
                {teamMembers.filter(m => m.role === 'EMPLEADO').length}
              </p>
              <p className="text-sm text-[#5f6368]">Empleados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-[#202124]">Miembros del equipo</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input
                placeholder="Buscar miembros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-[#dadce0] mx-auto mb-3" />
                <p className="text-[#5f6368]">No se encontraron miembros</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 p-4 border border-[#dadce0] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`text-white ${
                      member.role === 'EMPRESA' 
                        ? 'bg-gradient-to-br from-[#34a853] to-[#2e7d32]' 
                        : 'bg-gradient-to-br from-[#1a73e8] to-[#1557b0]'
                    }`}>
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#202124]">{member.firstName} {member.lastName}</p>
                      {member.id === user.id && (
                        <Badge variant="secondary" className="text-xs">Tú</Badge>
                      )}
                      {member.id === company.ownerId && (
                        <Badge className="bg-[#f9ab00] text-white text-xs">Dueño</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#5f6368] flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                  </div>

                  <Badge variant={member.role === 'EMPRESA' ? 'default' : 'secondary'}>
                    {member.role === 'EMPRESA' ? 'Administrador' : 'Empleado'}
                  </Badge>

                  {user.role === 'EMPRESA' && member.id !== company.ownerId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Cambiar rol</DropdownMenuItem>
                        <DropdownMenuItem className="text-[#ea4335]">
                          Eliminar del equipo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
