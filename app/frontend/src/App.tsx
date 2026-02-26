import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTickets, useComments, useTeam } from '@/hooks/useTickets';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/components/AuthPage';
import { DashboardAdmin } from '@/components/DashboardAdmin';
import { DashboardEmployee } from '@/components/DashboardEmployee';
import { TicketDetail } from '@/components/TicketDetail';
import { TicketsPage } from '@/components/TicketsPage';
import { TeamPage } from '@/components/TeamPage';
import { SettingsPage } from '@/components/SettingsPage';
import type { Ticket, UserRole } from '@/types';

type Page = 'dashboard' | 'tickets' | 'team' | 'settings';

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
    refresh: refreshTickets 
  } = useTickets(company?.id);

  const { 
    tickets: myTickets,
  } = useTickets(company?.id, user?.id);

  const { 
    comments, 
    addComment, 
  } = useComments(selectedTicket?.id);

  const { 
    getTeamMembers, 
    regenerateInviteCode 
  } = useTeam(company?.id);

  const teamMembers = getTeamMembers();

  // Handlers
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    return await login(email, password);
  };

  const handleRegister = async (data: any): Promise<boolean> => {
    return await register(data);
  };

  const handleJoinCompany = async (code: string): Promise<boolean> => {
    return await joinCompany(code);
  };

  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTicket(ticketData);
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleBackFromTicket = () => {
    setSelectedTicket(null);
    refreshTickets();
  };

  const handleUpdateTicketStatus = async (status: Ticket['status']) => {
    if (selectedTicket) {
      const success = await updateTicket(selectedTicket.id, { status });
      if (success) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    }
  };

  const handleAssignTicket = async (userId: string) => {
    if (selectedTicket) {
      const success = await updateTicket(selectedTicket.id, { assignedToId: userId });
      if (success) {
        setSelectedTicket({ ...selectedTicket, assignedTo: userId });
      }
    }
  };

  const handleAddComment = async (content: string) => {
    if (user && selectedTicket) {
      await addComment(content);
    }
  };

  const handleRegenerateCode = async () => {
    if (company) {
      return await regenerateInviteCode(company.id);
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
          onAddComment={handleAddComment}
        />
      </Layout>
    );
  }

  // Renderizar página actual
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (user.role === 'EMPRESA') {
          return (
            <DashboardAdmin
              user={user}
              company={company!}
              tickets={tickets}
              teamMembers={teamMembers}
              onCreateTicket={handleCreateTicket}
              onUpdateTicket={updateTicket}
              onViewTicket={handleViewTicket}
            />
          );
        }
        return (
          <DashboardEmployee
            user={user}
            company={company}
            tickets={myTickets}
            onCreateTicket={handleCreateTicket}
            onViewTicket={handleViewTicket}
            onJoinCompany={handleJoinCompany}
          />
        );

      case 'tickets':
        return (
          <TicketsPage
            user={user}
            tickets={user.role === 'EMPRESA' ? tickets : myTickets}
            teamMembers={teamMembers}
            onCreateTicket={handleCreateTicket}
            onViewTicket={handleViewTicket}
            onUpdateTicket={updateTicket}
          />
        );

      case 'team':
        if (user.role === 'EMPRESA' && company) {
          return (
            <TeamPage
              user={user}
              company={company}
              teamMembers={teamMembers}
              onRegenerateCode={handleRegenerateCode}
            />
          );
        }
        return null;

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
    <Layout 
      user={user} 
      company={company} 
      onLogout={logout}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
