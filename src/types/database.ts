export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number;
          nombres: string;
          nro_doc: string;
          telefono: string;
          direccion: string;
          fecharegistro: string;
          estado: string;
          tipouser: string;
          idauth: string;
          tipodoc: string;
          correo: string;
          id_empresa: number; // <-- AÑADIDO
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      // ... (el resto del archivo permanece igual)
      empresa: {
        Row: {
          id: number;
          nombre: string;
          simbolomoneda: string | null;
          iduseradmin: number;
          id_empresa: number | null;
          cuit: string | null;
          direccion: string | null;
          telefono: string | null;
          rubro: string | null;
          logo_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['empresa']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['empresa']['Insert']>;
      };
      productos: {
        Row: {
          id: number;
          descripcion: string;
          idmarca: number;
          stock: number;
          stock_minimo: number;
          codigobarras: string | null;
          codigointerno: string | null;
          precioventa: number;
          preciocompra: number;
          id_categoria: number;
          id_empresa: number;
        };
        Insert: Omit<Database['public']['Tables']['productos']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['productos']['Insert']>;
      };
      categorias: {
        Row: {
          id: number;
          descripcion: string;
          id_empresa: number;
          color: string | null;
        };
        Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['categorias']['Insert']>;
      };
      marca: {
        Row: {
          id: number;
          descripcion: string;
          id_empresa: number;
        };
        Insert: Omit<Database['public']['Tables']['marca']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['marca']['Insert']>;
      };
      kardex: {
        Row: {
          id: number;
          fecha: string;
          tipo: string;
          id_usuario: number;
          id_producto: number;
          cantidad: number;
          id_empresa: number;
          detalle: string | null;
          estado: number;
        };
        Insert: Omit<Database['public']['Tables']['kardex']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['kardex']['Insert']>;
      };
    };
    Functions: {
      mostrarproductos: {
        Args: { _id_empresa: number };
        Returns: {
          id: number;
          descripcion: string;
          idmarca: number;
          stock: number;
          stock_minimo: number;
          codigobarras: string;
          codigointerno: string;
          precioventa: number;
          preciocompra: number;
          id_categoria: number;
          id_empresa: number;
          marca: string;
          categoria: string;
          color: string;
        }[];
      };
      mostrarkardexempresa: {
        Args: { _id_empresa: number };
        Returns: {
          id: number;
          descripcion: string;
          fecha: string;
          cantidad: number;
          tipo: string;
          detalle: string;
          nombres: string;
          stock: number;
          estado: number;
          id_producto: number;
        }[];
      };
      buscarproductos: {
        Args: { _id_empresa: number; buscador: string };
        Returns: {
          id: number;
          descripcion: string;
          idmarca: number;
          stock: number;
          stock_minimo: number;
          codigobarras: string;
          codigointerno: string;
          precioventa: number;
          preciocompra: number;
          id_categoria: number;
          id_empresa: number;
          marca: string;
          categoria: string;
          color: string;
        }[];
      };
    };
  };
}

export type Usuario = Database['public']['Tables']['usuarios']['Row'];
export type Empresa = Database['public']['Tables']['empresa']['Row'];
export type Producto = Database['public']['Tables']['productos']['Row'];
export type Categoria = Database['public']['Tables']['categorias']['Row'];
export type Marca = Database['public']['Tables']['marca']['Row'];
export type Kardex = Database['public']['Tables']['kardex']['Row'];

export interface Product {
  id: number;
  descripcion: string;
  stock: number;
  stock_minimo: number;
  idmarca?: number;
  codigobarras?: string | null;
  codigointerno?: string | null;
  precioventa?: number;
  preciocompra?: number;
  id_categoria?: number;
  id_empresa?: number;
}

export interface ProductoExtendido {
  id: number;
  descripcion: string;
  idmarca: number;
  stock: number;
  stock_minimo: number;
  codigobarras: string | null;
  codigointerno: string | null;
  precioventa: number;
  preciocompra: number;
  id_categoria: number;
  id_empresa: number;
  marca: string;
  categoria: string;
  color: string;
}

export interface ProductoFormData {
  descripcion: string;
  idmarca: number;
  stock: number;
  stock_minimo: number;
  codigobarras?: string;
  codigointerno?: string;
  precioventa: number;
  preciocompra: number;
  id_categoria: number;
}

export interface KardexExtendido {
  id: number;
  id_producto: number;
  descripcion: string;
  fecha: string;
  cantidad: number;
  tipo: string;
  detalle: string;
  nombres: string;
  stock: number;
  estado: number;
}

export interface MovementFormData {
  id_producto: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  detalle: string;
}

export interface KardexFilters {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: 'entrada' | 'salida' | '';
  producto?: string;
  usuario?: string;
}