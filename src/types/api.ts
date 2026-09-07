export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  userType?: "FIRM_USER" | "CLIENT_USER" | string;
  clientProfileUid?: string;
}

export interface ClientUser {
  id: string;
  email: string;
  clientName: string;
  contactName: string;
  mustChangePassword?: boolean;
  firmUid?: string | null;
  clientProfileUid?: string | null;
  country?: string | null;
  roleLabel?: string | null;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
