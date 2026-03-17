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
import { companiesApi } from '@/services/api';
import { Tutorial } from '@/components/Tutorial';
import type { Ticket, Company } from '@/types';

type Page = 'dashboard' | 'tickets' | 'team' | 'roles' | 'areas' | 'agenda' | 'settings';

function App() {
  const { 
    user, 
    company: authCompany, 
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
  const [company, setCompany] = useState<Company | null>(authCompany);

  const { 
    tickets, 
    createTicket, 
    updateTicket, 
    claimTicket,
    loadTickets,
    getTicketById 
  } = useTickets();

  const { comments, addComment, loadComments } = useComments();
  const { members: teamMembers, technicians, loadMembers, loadTechnicians, regenerateInviteCode, changeUserRole, changeUserArea } = useTeam(company?.id);
  const { areas, loadAreas } = useAreas();

  const isAdmin = user?.role === 'Administrador' || (typeof user?.role === 'object' && user?.role?.name === 'Administrador') || user?.role === 'EMPRESA';
  const isTechnician = (typeof user?.role === 'object' && user?.role?.name === 'Técnico');

  const myTickets = tickets.filter(t => t.createdById === user?.id || (typeof t.createdBy === 'object' && t.createdBy.id === user?.id));

  // CARGAR DATOS INICIALES Y REFRESCAR EMPRESA
  useEffect(() => {
    const initData = async () => {
      if (isAuthenticated && user?.companyId) {
        // Cargar datos frescos de la empresa (Para que empleados vean logo/info nueva)
        try {
          const { data } = await companiesApi.getById(user.companyId);
          setCompany(data);
        } catch (err) {
          setCompany(authCompany);
        }
        
        loadTickets();
        loadMembers();
        loadAreas();
        if (isAdmin) loadTechnicians();
      }
    };
    initData();
  }, [isAuthenticated, user?.companyId, isAdmin, loadTickets, loadMembers, loadAreas, loadTechnicians, authCompany]);

  useEffect(() => {
    const refreshTicketDetails = async () => {
      if (selectedTicket && !selectedTicket.activities) {
        try {
          const fullTicket = await getTicketById(selectedTicket.id);
          if (fullTicket) setSelectedTicket(fullTicket);
        } catch (err) {}
      }
    };

    if (selectedTicket) {
      loadComments(selectedTicket.id);
      refreshTicketDetails();
      if (isAdmin) loadTechnicians(selectedTicket.areaId);
    }
  }, [selectedTicket?.id, loadComments, isAdmin, loadTechnicians, getTicketById]);

  const handlePageChange = (page: Page) => {
    setSelectedTicket(null);
    setCurrentPage(page);
  };

  const handleNotificationAction = async (ticketId: string) => {
    try {
      const ticket = await getTicketById(ticketId);
      if (ticket) setSelectedTicket(ticket);
    } catch (err) {
      toast.error("No se pudo abrir el ticket asociado.");
    }
  };

  const handleCreateTicket = async (ticketData: any): Promise<boolean> => {
    try {
      const result = await createTicket(ticketData);
      if (result) {
        toast.success("Ticket creado correctamente");
        return true;
      }
      return false;
    } catch (err: any) {
      const serverError = err.response?.data?.message;
      const message = serverError || 'Error al crear ticket';
      toast.error(Array.isArray(message) ? message[0] : message);
      return false;
    }
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

  if (isLoading) return <LoadingState />;

  if (!isAuthenticated || !user) {
    if (showAuth) {
      return (
        <>
          <AuthPage onLogin={login} onRegister={register} onJoinCompany={joinCompany} onBack={() => setShowAuth(false)} />
          <Toaster position="top-right" />
        </>
      );
    }
    return <LandingPage onNavigateToAuth={() => setShowAuth(true)} />;
  }

  const renderPage = () => {
    const isAdminRole = user.role === 'Administrador' || (typeof user.role === 'object' && (user.role as any).name === 'Administrador') || user.role === 'EMPRESA';
    
    switch (currentPage) {
      case 'dashboard':
        if (isAdminRole || isTechnician) {
          return (
            <DashboardAdmin
              company={company}
              tickets={tickets}
              areas={areas}
              currentUser={user}
              onCreateTicket={handleCreateTicket}
              onViewTicket={setSelectedTicket}
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
            onViewTicket={setSelectedTicket}
            onJoinCompany={joinCompany}
          />
        );

      case 'tickets':
        return (
          <TicketsPage
            tickets={(isAdminRole || isTechnician) ? tickets : myTickets}
            areas={areas}
            teamMembers={teamMembers}
            currentUser={user}
            onCreateTicket={handleCreateTicket}
            onViewTicket={setSelectedTicket}
            onUpdateTicket={updateTicket}
          />
        );

      case 'team':
        return isAdminRole && company ? (
          <TeamPage
            user={user}
            company={company}
            teamMembers={teamMembers}
            onRegenerateCode={() => regenerateInviteCode(company.id)}
            onChangeRole={changeUserRole}
            onChangeArea={changeUserArea}
          />
        ) : null;

      case 'roles': return isAdminRole ? <RolesPage /> : null;
      case 'areas': return isAdminRole ? <AreasPage /> : null;
      case 'agenda': return <AgendaPage onViewTicket={setSelectedTicket} currentUser={user} />;
      case 'settings': return <SettingsPage user={user} company={company} onUpdateUser={updateUser} />;
      default: return null;
    }
  };

  return (
    <>
      <Layout user={user} company={company} onLogout={logout} currentPage={currentPage} onPageChange={handlePageChange} onNotificationAction={handleNotificationAction}>
        {selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            comments={comments}
            currentUser={user}
            teamMembers={teamMembers}
            technicians={technicians}
            onBack={() => { setSelectedTicket(null); loadTickets(); }}
            onUpdateStatus={handleUpdateTicketStatus}
            onAssign={handleAssignTicket}
            onClaim={handleClaimTicket}
            onAddComment={handleAddComment}
          />
        ) : renderPage()}
        <Tutorial user={user} />
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
