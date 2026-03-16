// Tipos de usuario y roles
export type UserRole = 'EMPRESA' | 'EMPLEADO';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de empresa
export interface Company {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de tickets
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Area {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  areaId?: string;
  area?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  assignedToId?: string;
  companyId: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  activities?: TicketActivity[];
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  details: string;
  createdAt: string;
}

// Tipos de comentarios
export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role?: {
      name: string;
    } | string;
  };
  content: string;
  createdAt: string;
}

// Tipos de notificación
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'TICKET_CREATED' | 'TICKET_UPDATED' | 'TICKET_ASSIGNED' | 'COMMENT_ADDED';
  relatedId?: string;
  createdAt: string;
}

// Estado de autenticación
export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Props comunes
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

export interface TicketWithDetails extends Ticket {
  createdByName: string;
  assignedToName?: string;
  commentsCount: number;
}

// Tipos de reuniones
export type MeetingStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: MeetingStatus;
  ticketId: string;
  ticket?: {
    title: string;
  };
  technicianId: string;
  technician?: {
    name: string;
    avatar?: string;
  };
  employeeId: string;
  employee?: {
    name: string;
    avatar?: string;
  };
  lastProposedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
