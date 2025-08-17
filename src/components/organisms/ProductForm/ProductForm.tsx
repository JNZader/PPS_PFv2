import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { type Resolver, type SubmitHandler, useForm } from 'react-hook-form';
import { MdCategory, MdCode, MdInventory, MdLocalOffer } from 'react-icons/md';
import { z } from 'zod';
import {
  useBrands,
  useCategories,
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '../../../hooks/useProducts';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Loading } from '../../atoms/Loading';
import { Select } from '../../atoms/Select';
import styles from './ProductForm.module.css';

// ✅ Schema Zod con coerce (string -> number)
const productSchema = z
  .object({
    descripcion: z
      .string()
      .min(2, 'La descripción debe tener al menos 2 caracteres')
      .max(255, 'La descripción no puede exceder 255 caracteres'),

    id_categoria: z.coerce
      .number({ message: 'La categoría es requerida' })
      .int()
      .min(1, 'Selecciona una categoría'),

    idmarca: z.coerce
      .number({ message: 'La marca es requerida' })
      .int()
      .min(1, 'Selecciona una marca'),

    preciocompra: z.coerce
      .number({ message: 'El precio de compra es requerido' })
      .min(0, 'El precio de compra debe ser mayor a 0'),

    precioventa: z.coerce
      .number({ message: 'El precio de venta es requerido' })
      .min(0, 'El precio de venta debe ser mayor a 0'),

    stock: z.coerce
      .number({ message: 'El stock es requerido' })
      .min(0, 'El stock debe ser mayor o igual a 0'),

    stock_minimo: z.coerce
      .number({ message: 'El stock mínimo es requerido' })
      .min(0, 'El stock mínimo debe ser mayor o igual a 0'),

    codigointerno: z.string().optional(),
    codigobarras: z.string().optional(),
  })
  .refine((data) => data.precioventa >= data.preciocompra, {
    message: 'El precio de venta debe ser mayor o igual al precio de compra',
    path: ['precioventa'],
  });

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ productId, onSuccess, onCancel }: ProductFormProps) => {
  const isEditing = !!productId;

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  // El error "Expected 1 arguments, but got 2" en useProduct es una advertencia de TypeScript
  // que indica que el `productId` podría ser `undefined` cuando `isEditing` es `false`.
  // Sin embargo, `enabled: isEditing` asegura que la query solo se ejecute cuando `productId` tiene un valor.
  // TypeScript no siempre puede inferir esto perfectamente.
  const { data: product, isLoading: productLoading } = useProduct(productId as number);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    // ✅ Resolver tipado: evita el error de unknown vs number
    // La corrección aquí es asegurar que el tipo genérico `zodResolver` coincida con `ProductFormData`.
    // Si tu `zodResolver` espera más tipos, como en el comentario original,
    // podrías necesitar investigar más a fondo la versión de `@hookform/resolvers/zod`.
    // Sin embargo, con las versiones modernas, `zodResolver<ProductFormData>(productSchema)` debería ser suficiente.
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      descripcion: '',
      stock: 0,
      stock_minimo: 1,
      preciocompra: 0,
      precioventa: 0,
      codigointerno: '',
      codigobarras: '',
      // id_categoria e idmarca vendrán del usuario o del reset() al editar
    },
  });

  // Cargar datos del producto al editar
  useEffect(() => {
    if (isEditing && product) {
      reset({
        descripcion: product.descripcion,
        id_categoria: product.id_categoria,
        idmarca: product.idmarca,
        preciocompra: product.preciocompra,
        precioventa: product.precioventa,
        stock: product.stock,
        stock_minimo: product.stock_minimo,
        codigointerno: product.codigointerno || '',
        codigobarras: product.codigobarras || '',
      });
    }
  }, [isEditing, product, reset]);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.descripcion,
  }));

  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.descripcion,
  }));

  // ✅ Handler tipado: coincide con useForm<ProductFormData>
  // El error de tipo en SubmitHandler se corrige asegurando que el tipo genérico
  // de `useForm` y `SubmitHandler` sean consistentes.
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      if (isEditing) {
        await updateProductMutation.mutateAsync({
          id: productId as number, // ya validado por isEditing
          data,
        });
      } else {
        await createProductMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      // Aquí podrías agregar manejo de errores más específico si las mutaciones devuelven un formato de error concreto.
    }
  };

  const isLoading = categoriesLoading || brandsLoading || (isEditing && productLoading);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Cargando formulario..." />
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <p className={styles.formSubtitle}>
          {isEditing
            ? 'Modifica la información del producto'
            : 'Ingresa los datos del nuevo producto'}
        </p>
      </div>

      {/* Usa handleSubmit con el handler tipado */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdInventory size={20} />
            Información Básica
          </h3>

          <Input
            label="Descripción del producto"
            placeholder="Ej: iPhone 15 Pro Max 256GB"
            error={errors.descripcion?.message}
            required
            {...register('descripcion')}
          />

          <div className={styles.formGrid}>
            {/*
                            Si tu <Select> es un wrapper custom que no reenvía onChange/value a un <select> nativo,
                            integra con Controller. Si sí reenvía, valueAsNumber funciona perfecto.
                            La corrección en `register` para `valueAsNumber: true` es correcta,
                            ya que `z.coerce.number` espera números.
                        */}
            <Select
              label="Categoría"
              placeholder="Selecciona una categoría"
              options={categoryOptions}
              error={errors.id_categoria?.message}
              required
              {...register('id_categoria', { valueAsNumber: true })}
            />

            <Select
              label="Marca"
              placeholder="Selecciona una marca"
              options={brandOptions}
              error={errors.idmarca?.message}
              required
              {...register('idmarca', { valueAsNumber: true })}
            />
          </div>
        </div>

        <hr className={styles.sectionDivider} />

        {/* Códigos */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdCode size={20} />
            Códigos de Identificación
          </h3>

          <div className={styles.codeInputs}>
            <Input
              label="Código Interno"
              placeholder="Ej: PROD-001"
              error={errors.codigointerno?.message}
              helperText="Código interno para identificación"
              {...register('codigointerno')}
            />

            <Input
              label="Código de Barras"
              placeholder="Ej: 1234567890123"
              error={errors.codigobarras?.message}
              helperText="EAN, UPC o código de barras"
              {...register('codigobarras')}
            />
          </div>
        </div>

        <hr className={styles.sectionDivider} />

        {/* Precios */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdLocalOffer size={20} />
            Precios
          </h3>

          <div className={styles.priceInputs}>
            <Input
              label="Precio de Compra"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.preciocompra?.message}
              required
              {...register('preciocompra', { valueAsNumber: true })}
            />

            <Input
              label="Precio de Venta"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.precioventa?.message}
              required
              {...register('precioventa', { valueAsNumber: true })}
            />
          </div>
        </div>

        <hr className={styles.sectionDivider} />

        {/* Stock */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdCategory size={20} />
            Inventario
          </h3>

          <div className={styles.stockInputs}>
            <Input
              label="Stock Actual"
              type="number"
              min="0"
              placeholder="0"
              error={errors.stock?.message}
              required
              {...register('stock', { valueAsNumber: true })}
            />

            <Input
              label="Stock Mínimo"
              type="number"
              min="0"
              placeholder="1"
              error={errors.stock_minimo?.message}
              helperText="Alerta cuando llegue a este nivel"
              required
              {...register('stock_minimo', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" loading={isSubmitting} className={styles.submitButton}>
            {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
};
