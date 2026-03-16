import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTickets } from '@/hooks/useTickets';
import { useComments } from '@/hooks/useComments';
import { useTeam } from '@/hooks/useTeam';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/components/AuthPage';
import { LandingPage } from '@/components/LandingPage';
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
import { LoadingState } from '@/components/ui/LoadingState';
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
  const [showAuth, setShowAuth] = useState(false);

  // Hooks para tickets
  const { 
    tickets, 
    createTicket, 
    updateTicket, 
    claimTicket,
    loadTickets,
    getTicketById 
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
    technicians,
    loadMembers,
    loadTechnicians,
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
      if (isAdmin) {
        loadTechnicians();
      }
      if (user?.id) {
        loadMyTickets(true);
      }
    }
  }, [isAuthenticated, company?.id, user?.id, isAdmin, loadTickets, loadMembers, loadMyTickets, loadAreas, loadTechnicians]);

  // Cargar comentarios y recargar ticket completo cuando se selecciona uno
  useEffect(() => {
    const refreshTicketDetails = async () => {
      if (selectedTicket && !selectedTicket.activities) {
        try {
          const fullTicket = await getTicketById(selectedTicket.id);
          if (fullTicket) {
            setSelectedTicket(fullTicket);
          }
        } catch (err) {
          console.error("Error recargando detalle del ticket:", err);
        }
      }
    };

    if (selectedTicket) {
      loadComments(selectedTicket.id);
      refreshTicketDetails();
      if (isAdmin) {
        loadTechnicians(selectedTicket.areaId);
      }
    }
  }, [selectedTicket?.id, loadComments, isAdmin, loadTechnicians, getTicketById]);

  const handlePageChange = (page: Page) => {
    setSelectedTicket(null);
    setCurrentPage(page);
  };

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

  const handleUpdateTicketStatus = async (status: Ticket['status']) => {
    if (selectedTicket) {
      const success = await updateTicket(selectedTicket.id, { status });
      if (success) {
        const updated = await getTicketById(selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    }
  };

  const handleAssignTicket = async (userId: string) => {
    if (selectedTicket) {
      const success = await updateTicket(selectedTicket.id, { assignedToId: userId });
      if (success) {
        const updated = await getTicketById(selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    }
  };

  const handleClaimTicket = async () => {
    if (selectedTicket) {
      const success = await claimTicket(selectedTicket.id);
      if (success) {
        const updated = await getTicketById(selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    }
  };

  const handleAddComment = async (content: string) => {
    if (selectedTicket) {
      await addComment(selectedTicket.id, content);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

<<<<<<< HEAD
  // Mostrar landing o auth si no está autenticado
  if (!isAuthenticated || !user) {
    if (showAuth) {
      return (
        <AuthPage 
          onLogin={handleLogin}
          onRegister={handleRegister}
          onJoinCompany={handleJoinCompany}
          onBack={() => setShowAuth(false)}
        />
      );
    }
    return <LandingPage onNavigateToAuth={() => setShowAuth(true)} />;
=======
  if (!isAuthenticated) {
    return (
      <>
        <AuthPage 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
        />
        <Toaster position="top-right" />
      </>
    );
>>>>>>> 278b74513601766d9abb83716e970dfe6464c789
  }

  if (!user) return null;

  // Mostrar detalle de ticket si hay uno seleccionado
  if (selectedTicket) {
    return (
      <Layout 
        user={user} 
        company={company} 
        onLogout={logout}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >
        <TicketDetail
          ticket={selectedTicket}
          comments={comments}
          currentUser={user}
          teamMembers={teamMembers}
          technicians={technicians}
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
    const isAdminRole = user.role === 'Administrador' || (typeof user.role === 'object' && (user.role as any).name === 'Administrador') || user.role === 'EMPRESA';
    
    switch (currentPage) {
      case 'dashboard':
        if (isAdminRole || isTechnician) {
          return (
            <DashboardAdmin
              company={company!}
              tickets={tickets}
              areas={areas}
              currentUser={user}
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
            tickets={(isAdminRole || isTechnician) ? tickets : myTickets}
            areas={areas}
            teamMembers={teamMembers}
            currentUser={user!}
            onCreateTicket={handleCreateTicket}
            onViewTicket={handleViewTicket}
            onUpdateTicket={updateTicket}
          />
        );

      case 'team':
        if (isAdminRole && company) {
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
        if (isAdminRole) {
          return <RolesPage />;
        }
        return null;

      case 'areas':
        if (isAdminRole) {
          return <AreasPage />;
        }
        return null;

      case 'agenda':
        return <AgendaPage onViewTicket={handleViewTicket} />;

      case 'settings':
        return <SettingsPage user={user} onUpdateUser={updateUser} />;

      default:
        return null;
    }
  };

  const handleRegenerateCode = async () => {
    if (company) {
      await regenerateInviteCode(company.id);
    }
  };

  return (
    <>
      <Layout 
        user={user} 
        company={company} 
        onLogout={logout}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >
        {renderPage()}
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
