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

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdBy: string;
  assignedTo?: string;
  companyId: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Tipos de comentarios
export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
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
