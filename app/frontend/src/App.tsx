import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTickets } from '@/hooks/useTickets';
import { useComments } from '@/hooks/useComments';
import { useTeam } from '@/hooks/useTeam';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/components/AuthPage';
import { DashboardAdmin } from '@/components/DashboardAdmin';
import { DashboardEmployee } from '@/components/DashboardEmployee';
import { TicketDetail } from '@/components/TicketDetail';
import { TicketsPage } from '@/components/TicketsPage';
import { TeamPage } from '@/components/TeamPage';
import { RolesPage } from '@/components/RolesPage';
import { AreasPage } from '@/components/AreasPage';
import { AgendaPage } from '@/components/AgendaPage';
import { SettingsPage } from '@/components/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useAreas } from '@/hooks/useAreas';
import type { Ticket, UserRole } from '@/types';

type Page = 'dashboard' | 'tickets' | 'team' | 'roles' | 'areas' | 'agenda' | 'settings';

function App() {
  const { 
    user, 
    company, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    logout, 
    joinCompany,
    updateUser 
  } = useAuth();

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Hooks para tickets
  const { 
    tickets, 
    createTicket, 
    updateTicket, 
    claimTicket,
    loadTickets 
  } = useTickets();

  const { 
    tickets: myTickets,
    loadTickets: loadMyTickets
  } = useTickets();

  const { 
    comments, 
    addComment, 
    loadComments
  } = useComments();

  const { 
    members: teamMembers, 
    loadMembers,
    regenerateInviteCode,
    changeUserRole,
    changeUserArea
  } = useTeam(company?.id);

  const {
    areas,
    loadAreas
  } = useAreas();

  const isAdmin = user?.role === 'Administrador' || (typeof user?.role === 'object' && user?.role?.name === 'Administrador') || user?.role === 'EMPRESA';
  const isTechnician = (typeof user?.role === 'object' && user?.role?.name === 'Técnico');

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated && company?.id) {
      loadTickets();
      loadMembers();
      loadAreas();
      if (user?.id) {
        loadMyTickets(true);
      }
    }
  }, [isAuthenticated, company?.id, user?.id, loadTickets, loadMembers, loadMyTickets, loadAreas]);

  // Cargar comentarios cuando se selecciona un ticket
  useEffect(() => {
    if (selectedTicket) {
      loadComments(selectedTicket.id);
    }
  }, [selectedTicket, loadComments]);

  // Handlers
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    return await login(email, password);
  };

  const handleRegister = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    companyName?: string
  ): Promise<boolean> => {
    return await register(name, email, password, role, companyName);
  };

  const handleJoinCompany = async (code: string): Promise<boolean> => {
    return await joinCompany(code);
  };

  const handleCreateTicket = async (ticketData: any): Promise<boolean> => {
    try {
      const result = await createTicket(ticketData);
      return !!result;
    } catch (err: any) {
      const serverError = err.response?.data?.message;
      console.error('ERROR DE VALIDACIÓN:', Array.isArray(serverError) ? serverError.join(', ') : serverError);
      const message = serverError || 'Error al crear ticket';
      toast.error(Array.isArray(message) ? message[0] : message);
      return false;
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleBackFromTicket = () => {
    setSelectedTicket(null);
    loadTickets();
  };

  const handleUpdateTicketStatus = (status: Ticket['status']) => {
    if (selectedTicket) {
      updateTicket(selectedTicket.id, { status });
      setSelectedTicket({ ...selectedTicket, status });
    }
  };

  const handleAssignTicket = (userId: string) => {
    if (selectedTicket) {
      updateTicket(selectedTicket.id, { assignedToId: userId });
      setSelectedTicket({ ...selectedTicket, assignedToId: userId });
    }
  };

  const handleClaimTicket = async () => {
    if (selectedTicket) {
      const success = await claimTicket(selectedTicket.id);
      if (success && user) {
        setSelectedTicket({ 
          ...selectedTicket, 
          assignedToId: user.id,
          status: 'IN_PROGRESS' 
        });
      }
    }
  };

  const handleAddComment = (content: string) => {
    if (user && selectedTicket) {
      addComment(selectedTicket.id, content);
    }
  };

  const handleRegenerateCode = async () => {
    if (company) {
      return await regenerateInviteCode();
    }
    return null;
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[#5f6368]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <AuthPage 
        onLogin={handleLogin}
        onRegister={handleRegister}
        onJoinCompany={handleJoinCompany}
      />
    );
  }

  // Mostrar detalle de ticket si hay uno seleccionado
  if (selectedTicket) {
    return (
      <Layout 
        user={user} 
        company={company} 
        onLogout={logout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        <TicketDetail
          ticket={selectedTicket}
          comments={comments}
          currentUser={user}
          teamMembers={teamMembers}
          onBack={handleBackFromTicket}
          onUpdateStatus={handleUpdateTicketStatus}
          onAssign={handleAssignTicket}
          onClaim={handleClaimTicket}
          onAddComment={handleAddComment}
        />
      </Layout>
    );
  }

  // Renderizar página actual
  const renderPage = () => {
    const isAdmin = user.role === 'Administrador' || (typeof user.role === 'object' && user.role?.name === 'Administrador') || user.role === 'EMPRESA';
    
    switch (currentPage) {
      case 'dashboard':
        if (isAdmin || isTechnician) {
          return (
            <DashboardAdmin
              company={company!}
              tickets={tickets}
              areas={areas}
              onCreateTicket={handleCreateTicket}
              onViewTicket={handleViewTicket}
              onUpdateTicket={updateTicket}
            />
          );
        }
        return (
          <DashboardEmployee
            company={company}
            tickets={myTickets}
            areas={areas}
            onCreateTicket={handleCreateTicket}
            onViewTicket={handleViewTicket}
            onJoinCompany={handleJoinCompany}
          />
        );

      case 'tickets':
        return (
          <TicketsPage
            tickets={(isAdmin || isTechnician) ? tickets : myTickets}
            areas={areas}
            teamMembers={teamMembers}
            currentUser={user!}
            onCreateTicket={handleCreateTicket}
            onViewTicket={handleViewTicket}
            onUpdateTicket={updateTicket}
          />
        );

      case 'team':
        if (isAdmin && company) {
          return (
            <TeamPage
              user={user}
              company={company}
              teamMembers={teamMembers}
              onRegenerateCode={handleRegenerateCode}
              onChangeRole={changeUserRole}
              onChangeArea={changeUserArea}
            />
          );
        }
        return null;

      case 'roles':
        if (isAdmin) {
          return <RolesPage />;
        }
        return null;

      case 'areas':
        if (isAdmin) {
          return <AreasPage />;
        }
        return null;

      case 'agenda':
        return <AgendaPage onViewTicket={handleViewTicket} />;

      case 'settings':
        return (
          <SettingsPage
            user={user}
            company={company}
            onUpdateUser={updateUser}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Layout 
        user={user} 
        company={company} 
        onLogout={logout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        {renderPage()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
