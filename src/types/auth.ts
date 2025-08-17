export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nombres: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'empleado';

export interface User {
  id: number;
  idauth: string;
  nombres: string;
  correo: string;
  tipouser: UserRole;
  estado: string;
  nro_doc?: string;
  telefono?: string;
  direccion?: string;
  tipodoc?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RoutePermissions {
  roles: UserRole[];
  requireAuth: boolean;
}
