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
}

export interface ClientUser {
  id: string;
  email: string;
  clientName: string;
  contactName: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
