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

export interface UserFormData {
  nombres: string;
  correo: string;
  tipouser: UserRole;
  nro_doc: string;
  telefono: string;
  direccion: string;
  tipodoc: 'DNI' | 'CUIT' | 'PASAPORTE';
  password?: string;
}

export interface UserWithStats extends User {
  ultimaConexion?: string;
  movimientosRealizados?: number;
  productosCreados?: number;
  activo: boolean;
}

export interface UserActivity {
  id: number;
  usuario_id: number;
  accion: string;
  detalles: string;
  fecha: string;
  ip?: string;
}

export interface UserFilters {
  search: string;
  tipouser: UserRole | '';
  estado: string;
  fechaRegistroDesde?: string;
  fechaRegistroHasta?: string;
}

export interface UserInvitation {
  email: string;
  nombres: string;
  tipouser: UserRole;
  mensaje?: string;
}
