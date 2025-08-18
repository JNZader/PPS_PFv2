import type {
  User,
  UserActivity,
  UserFilters,
  UserFormData,
  UserInvitation,
  UserWithStats,
} from '../types/auth';
import { supabase } from './client';

// Obtener todos los usuarios de UNA empresa
export async function getUsers(idEmpresa: number): Promise<UserWithStats[]> {
  try {
    // Se eliminó la relación a 'productos' que causaba un error anterior.
    const { data, error } = await supabase
      .from('usuarios')
      .select(
        `
        *,
        kardex:kardex(count)
      `
      )
      .eq('id_empresa', idEmpresa) // <-- CORRECCIÓN CLAVE: Filtro de seguridad re-añadido
      .order('fecharegistro', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return (data || []).map((user) => ({
      ...user,
      movimientosRealizados: user.kardex?.[0]?.count || 0,
      productosCreados: 0, // Se establece en 0 temporalmente.
      activo: user.estado === 'activo',
      ultimaConexion: user.ultima_conexion,
    }));
  } catch (err) {
    console.error('Error en getUsers:', err);
    throw err;
  }
}

// Buscar usuarios en UNA empresa con filtros
export async function searchUsers(
  idEmpresa: number,
  filters: UserFilters
): Promise<UserWithStats[]> {
  try {
    let query = supabase
      .from('usuarios')
      .select(
        `
        *,
        kardex:kardex(count)
      `
      )
      .eq('id_empresa', idEmpresa); // <-- CORRECCIÓN CLAVE: Filtro de seguridad re-añadido

    // Aplicar filtros
    if (filters.search) {
      query = query.or(`nombres.ilike.%${filters.search}%,correo.ilike.%${filters.search}%`);
    }
    if (filters.tipouser) {
      query = query.eq('tipouser', filters.tipouser);
    }
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.fechaRegistroDesde) {
      query = query.gte('fecharegistro', filters.fechaRegistroDesde);
    }
    if (filters.fechaRegistroHasta) {
      query = query.lte('fecharegistro', filters.fechaRegistroHasta);
    }

    const { data, error } = await query.order('fecharegistro', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      throw error;
    }

    return (data || []).map((user) => ({
      ...user,
      movimientosRealizados: user.kardex?.[0]?.count || 0,
      productosCreados: 0,
      activo: user.estado === 'activo',
      ultimaConexion: user.ultima_conexion,
    }));
  } catch (err) {
    console.error('Error en searchUsers:', err);
    throw err;
  }
}

// Crear nuevo usuario
export async function createUser(userData: UserFormData): Promise<User> {
  try {
    let authUserId = null;

    if (userData.password) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.correo,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw authError;
      }
      authUserId = authData.user?.id;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        nombres: userData.nombres,
        correo: userData.correo,
        tipouser: userData.tipouser,
        nro_doc: userData.nro_doc,
        telefono: userData.telefono,
        direccion: userData.direccion,
        tipodoc: userData.tipodoc,
        idauth: authUserId || '',
        id_empresa: userData.id_empresa, // Asegurarse de que se inserte el id de la empresa
        fecharegistro: new Date().toISOString().split('T')[0],
        estado: 'activo',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error en createUser:', err);
    throw err;
  }
}

// Actualizar usuario
export async function updateUser(id: number, userData: Partial<UserFormData>): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error en updateUser:', err);
    throw err;
  }
}

// Cambiar estado del usuario (activar/desactivar)
export async function toggleUserStatus(id: number): Promise<User> {
  try {
    const { data: currentUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('estado')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }

    const newEstado = currentUser.estado === 'activo' ? 'inactivo' : 'activo';

    const { data, error } = await supabase
      .from('usuarios')
      .update({ estado: newEstado })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error en toggleUserStatus:', err);
    throw err;
  }
}

// Eliminar usuario (solo marcar como eliminado)
export async function deleteUser(id: number): Promise<void> {
  try {
    const { error } = await supabase.from('usuarios').update({ estado: 'eliminado' }).eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error en deleteUser:', err);
    throw err;
  }
}

// Obtener actividades de un usuario
export async function getUserActivities(
  userId: number,
  limit: number = 50
): Promise<UserActivity[]> {
  try {
    const { data, error } = await supabase
      .from('actividades_usuarios')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error en getUserActivities:', err);
    throw err;
  }
}

// Registrar actividad de usuario
export async function logUserActivity(
  userId: number,
  accion: string,
  detalles: string,
  ip?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('actividades_usuarios').insert({
      usuario_id: userId,
      accion,
      detalles,
      fecha: new Date().toISOString(),
      ip,
    });

    if (error) {
      console.error('Error logging user activity:', error);
    }
  } catch (err) {
    console.error('Error en logUserActivity:', err);
  }
}

// Invitar usuario por email
export async function inviteUser(invitation: UserInvitation, idEmpresa: number): Promise<void> {
  try {
    const tempPassword = Math.random().toString(36).slice(-8);

    const { error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password: tempPassword,
      email_confirm: false,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    await createUser({
      nombres: invitation.nombres,
      correo: invitation.email,
      tipouser: invitation.tipouser,
      nro_doc: '',
      telefono: '',
      direccion: '',
      tipodoc: 'DNI',
      password: tempPassword,
      id_empresa: idEmpresa,
    });

    await logUserActivity(
      1,
      'INVITACION_ENVIADA',
      `Invitación enviada a ${invitation.email} como ${invitation.tipouser}`
    );
  } catch (err) {
    console.error('Error en inviteUser:', err);
    throw err;
  }
}

// Resetear contraseña
export async function resetUserPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error en resetUserPassword:', err);
    throw err;
  }
}

// Obtener estadísticas generales de usuarios
export async function getUsersStats(idEmpresa: number) {
  try {
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('estado, tipouser, fecharegistro')
      .eq('id_empresa', idEmpresa); // <-- CORRECCIÓN CLAVE: Filtro de seguridad re-añadido

    if (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }

    const stats = {
      total: users?.length || 0,
      activos: users?.filter((u) => u.estado === 'activo').length || 0,
      inactivos: users?.filter((u) => u.estado === 'inactivo').length || 0,
      superadmins: users?.filter((u) => u.tipouser === 'superadmin').length || 0,
      admins: users?.filter((u) => u.tipouser === 'admin').length || 0,
      empleados: users?.filter((u) => u.tipouser === 'empleado').length || 0,
      registradosEsteMes:
        users?.filter((u) => {
          const fechaRegistro = new Date(u.fecharegistro);
          const hoy = new Date();
          return (
            fechaRegistro.getMonth() === hoy.getMonth() &&
            fechaRegistro.getFullYear() === hoy.getFullYear()
          );
        }).length || 0,
    };

    return stats;
  } catch (err) {
    console.error('Error en getUsersStats:', err);
    throw err;
  }
}