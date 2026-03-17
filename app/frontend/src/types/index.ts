// Tipos de usuario y roles
export type UserRole = 'EMPRESA' | 'EMPLEADO';

export interface Role {
  id: string;
  name: string;
  description?: string;
  companyId?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole | Role | any;
  avatar?: string;
  companyId?: string;
  areaId?: string;
  area?: Area;
  company?: Company;
  createdAt?: string;
  _count?: {
    assignedTickets?: number;
  };
}

export interface Company {
  id: string;
  name: string;
  inviteCode: string;
  logo?: string;
  description?: string;
  information?: string;
  ownerId?: string;
  createdAt: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  companyId: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  areaId?: string;
  area?: Area;
  companyId: string;
  activities?: TicketActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    role: any;
  };
  createdAt: string;
}

export type MeetingStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  type: string;
  meetingLink?: string;
  status: MeetingStatus;
  ticketId: string;
  ticket?: {
    id: string;
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
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
