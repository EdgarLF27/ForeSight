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
import { toast } from 'sonner';
import { useAreas } from '@/hooks/useAreas';
import { LoadingState } from '@/components/ui/LoadingState';
import { Tutorial } from '@/components/Tutorial';
import { socketService } from '@/services/socket';
import type { Ticket } from '@/types';

type Page = 'dashboard' | 'tickets' | 'team' | 'roles' | 'areas' | 'agenda' | 'settings';

function App() {
  const { 
    user, 
    company, // Usamos la empresa directamente de useAuth
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    googleLogin,
    logout, 
    joinCompany,
    createCompany,
    updateUser 
  } = useAuth();

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // INICIALIZACIÓN GLOBAL DEL TEMA (PERSISTENCIA)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // CONEXIÓN WEBSOCKET BASADA EN AUTENTICACIÓN Y ESCUCHADORES GLOBALES
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      const socket = socketService.getSocket();

      if (socket) {
        // Recargar miembros cuando alguien se une, se actualiza o se borra
        const handleRefreshTeam = () => {
          console.log('👥 Actualizando equipo vía WebSocket...');
          loadMembers();
          if (isAdmin) loadTechnicians();
        };

        socket.on('userJoined', (newUser) => {
          toast.info(`Nuevo miembro: ${newUser.name} se ha unido`);
          handleRefreshTeam();
        });
        socket.on('userUpdated', handleRefreshTeam);
        socket.on('userDeleted', handleRefreshTeam);

        return () => {
          socket.off('userJoined');
          socket.off('userUpdated');
          socket.off('userDeleted');
        };
      }
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, isAdmin, loadMembers, loadTechnicians]);

  const { 
    tickets, 
    createTicket, 
    updateTicket, 
    claimTicket,
    loadTickets,
    getTicketById 
  } = useTickets();

  const { comments, addComment, loadComments } = useComments();
  const { 
    members: teamMembers, 
    technicians, 
    loadMembers, 
    loadTechnicians, 
    regenerateInviteCode, 
    changeUserRole, 
    changeUserArea,
    deleteMember
  } = useTeam(company?.id);
  const { areas, loadAreas } = useAreas();

  // DETECCIÓN ROBUSTA DE ROLES
  const roleName = typeof user?.role === 'object' ? (user?.role as any)?.name : user?.role;
  const isAdmin = roleName === 'Administrador' || roleName === 'EMPRESA';
  const isTechnician = roleName === 'Técnico';
  const isEmployee = roleName === 'Empleado' || roleName === 'EMPLEADO';

  // CARGAR DATOS CUANDO TENGAMOS EMPRESA
  useEffect(() => {
    if (isAuthenticated && company?.id) {
      loadTickets();
      loadMembers();
      loadAreas();
      if (isAdmin) loadTechnicians();
    }
  }, [isAuthenticated, company?.id, isAdmin, loadTickets, loadMembers, loadAreas, loadTechnicians]);

  useEffect(() => {
    if (selectedTicket) {
      loadComments(selectedTicket.id);
      if (isAdmin) loadTechnicians(selectedTicket.areaId);

      // POLLING PARA IA: Si no hay resumen de IA, reintentar cada 3 seg (máx 6 veces)
      if (!selectedTicket.aiSummary && !selectedTicket.aiSentiment) {
        const interval = setInterval(async () => {
          try {
            const updated = await getTicketById(selectedTicket.id);
            if (updated?.aiSummary || updated?.aiSentiment) {
              setSelectedTicket(updated);
              clearInterval(interval);
            }
          } catch (err) {
            clearInterval(interval);
          }
        }, 3000);

        return () => clearInterval(interval);
      }
    }
  }, [selectedTicket?.id, loadComments, isAdmin, loadTechnicians, getTicketById]);

  const handlePageChange = (page: Page) => {
    setSelectedTicket(null);
    setCurrentPage(page);
  };

  const handleCreateCompany = async (name: string): Promise<boolean> => {
    const result = await createCompany(name) as any;
    if (result.success) {
      toast.success("Empresa creada correctamente");
      return true;
    } else {
      toast.error(result.message || "Error al crear la empresa");
      return false;
    }
  };

  const handleCreateTicket = async (ticketData: any): Promise<boolean> => {
    const result = await createTicket(ticketData);
    if (result) {
      toast.success("Ticket creado correctamente");
      return true;
    }
    return false;
  };

  if (isLoading) return <LoadingState />;

  if (!isAuthenticated || !user) {
    return (
      <AuthPage 
        onLogin={login} 
        onRegister={register} 
        onJoinCompany={joinCompany} 
        onGoogleLogin={googleLogin}
        onBack={() => {}} 
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (isAdmin) {
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
            tickets={tickets}
            areas={areas}
            onCreateTicket={handleCreateTicket}
            onViewTicket={setSelectedTicket}
            onJoinCompany={joinCompany}
            onCreateCompany={handleCreateCompany}
          />
        );

      case 'tickets':
        return (
          <TicketsPage
            tickets={(isAdmin || isTechnician) ? tickets : tickets.filter(t => t.createdById === user.id)}
            areas={areas}
            teamMembers={teamMembers}
            currentUser={user}
            onCreateTicket={handleCreateTicket}
            onViewTicket={setSelectedTicket}
            onUpdateTicket={updateTicket}
          />
        );

      case 'team':
        return isAdmin && company ? (
          <TeamPage
            user={user}
            company={company}
            teamMembers={teamMembers}
            onRegenerateCode={regenerateInviteCode}
            onChangeRole={changeUserRole}
            onChangeArea={changeUserArea}
            onDeleteMember={deleteMember}
          />
        ) : null;

      case 'roles': return isAdmin ? <RolesPage /> : null;
      case 'areas': return isAdmin ? <AreasPage /> : null;
      case 'agenda': return <AgendaPage onViewTicket={setSelectedTicket} currentUser={user} />;
      case 'settings': return <SettingsPage user={user} company={company} onUpdateUser={updateUser} />;
      default: return null;
    }
  };

  return (
    <Layout 
      user={user} 
      company={company} 
      onLogout={logout} 
      currentPage={currentPage} 
      onPageChange={handlePageChange}
      onNotificationAction={async (id) => {
        const ticket = await getTicketById(id);
        if (ticket) setSelectedTicket(ticket);
      }}
    >
      {selectedTicket ? (
        <TicketDetail
          ticket={selectedTicket}
          comments={comments}
          currentUser={user}
          teamMembers={teamMembers}
          technicians={technicians}
          onBack={() => { setSelectedTicket(null); loadTickets(); }}
          onUpdateStatus={async (status) => {
             const ok = await updateTicket(selectedTicket.id, { status });
             if (ok) {
               const upd = await getTicketById(selectedTicket.id);
               if (upd) setSelectedTicket(upd);
             }
          }}
          onAssign={async (uid) => {
            const ok = await updateTicket(selectedTicket.id, { assignedToId: uid });
            if (ok) {
              const upd = await getTicketById(selectedTicket.id);
              if (upd) setSelectedTicket(upd);
            }
          }}
          onClaim={async () => {
             const ok = await claimTicket(selectedTicket.id);
             if (ok) {
              const upd = await getTicketById(selectedTicket.id);
              if (upd) setSelectedTicket(upd);
             }
          }}
          onAddComment={(content) => addComment(selectedTicket.id, content)}
        />
      ) : renderPage()}
      <Tutorial user={user} />
    </Layout>
  );
}

export default App;
