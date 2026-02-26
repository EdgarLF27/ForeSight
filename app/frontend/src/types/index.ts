// Tipos de usuario y roles
export type UserRole = 'EMPRESA' | 'EMPLEADO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de empresa
export interface Company {
  id: string;
  name: string;
  description?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
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

// Estado de autenticación
export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
