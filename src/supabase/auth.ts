import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { supabase } from './client';

// Login
export const login = async (credentials: LoginCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;

  if (data.user) {
    const usuario = await getUsuario(data.user.id);
    return { user: data.user, usuario };
  }

  return { user: data.user, usuario: null };
};

// Registro
export const register = async (credentials: RegisterCredentials) => {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;

  if (data.user) {
    await createUsuario(data.user.id, {
      nombres: credentials.nombres,
      correo: credentials.email,
      tipouser: 'empleado',
    });
  }

  return data;
};

// Logout
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Obtener usuario actual
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const usuario = await getUsuario(user.id);

  if (!usuario) return null;

  return {
    id: usuario.id,
    idauth: usuario.idauth,
    nombres: usuario.nombres,
    correo: usuario.correo,
    tipouser: usuario.tipouser as 'superadmin' | 'admin' | 'empleado',
    estado: usuario.estado,
    nro_doc: usuario.nro_doc,
    telefono: usuario.telefono,
    direccion: usuario.direccion,
    tipodoc: usuario.tipodoc,
  };
};

// Obtener usuario de la tabla usuarios
const getUsuario = async (idauth: string) => {
  const { data, error } = await supabase.from('usuarios').select('*').eq('idauth', idauth).single();

  if (error) {
    console.error('Error fetching usuario:', error);
    return null;
  }

  return data;
};

// Crear usuario en tabla usuarios
const createUsuario = async (
  idauth: string,
  usuarioData: {
    nombres: string;
    correo: string;
    tipouser: string;
  }
) => {
  const { error } = await supabase.from('usuarios').insert({
    idauth,
    nombres: usuarioData.nombres,
    correo: usuarioData.correo,
    tipouser: usuarioData.tipouser,
    fecharegistro: new Date().toISOString().split('T')[0],
    estado: 'activo',
    nro_doc: '-',
    telefono: '-',
    direccion: '-',
    tipodoc: '-',
  });

  if (error) {
    console.error('Error creating usuario:', error);
    throw error;
  }
};

// Verificar sesión
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Listener de cambios de auth
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
};
