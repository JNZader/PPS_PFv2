import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type Resolver, type SubmitHandler, useForm } from 'react-hook-form';
import { MdAdd, MdInventory, MdRemove } from 'react-icons/md';
import { z } from 'zod';
import { useCreateMovement } from '../../../hooks/useKardex';
import { useProducts } from '../../../hooks/useProducts';
import type { Producto } from '../../../types/database';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import styles from './MovementForm.module.css';

// Schema Zod
const movementSchema = z.object({
  id_producto: z.coerce.number().min(1, 'Selecciona un producto'),
  tipo: z.enum(['entrada', 'salida'], { message: 'Tipo de movimiento requerido' }),
  cantidad: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  detalle: z.string().min(3, 'El detalle debe tener al menos 3 caracteres'),
});

// Tipo inferido
type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MovementForm = ({ onSuccess, onCancel }: MovementFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const { data: products = [] } = useProducts();
  const createMovementMutation = useCreateMovement();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    control,
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema) as Resolver<MovementFormData>,
    defaultValues: {
      tipo: 'entrada',
      cantidad: 1,
    },
  });

  const watchedFields = watch();
  const { id_producto, cantidad, tipo } = watchedFields;

  // Actualizar producto seleccionado
  useEffect(() => {
    if (id_producto) {
      const product = products.find((p: Producto) => p.id === Number(id_producto));
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [id_producto, products]);

  // ⚠️ Para <select>, value DEBE ser string; convertimos IDs a string.
  const productOptions = products.map((product: Producto) => ({
    value: String(product.id),
    label: `${product.descripcion} (Stock: ${product.stock})`,
  }));

  // onSubmit tipado correctamente
  const onSubmit: SubmitHandler<MovementFormData> = async (data) => {
    try {
      await createMovementMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error('Error creating movement:', error);
    }
  };

  const isStockLow = !!(selectedProduct && selectedProduct.stock <= selectedProduct.stock_minimo);
  const isStockInsufficient =
    tipo === 'salida' && selectedProduct ? cantidad > selectedProduct.stock : false;

  const handleTipoChange = (value: 'entrada' | 'salida') => {
    setValue('tipo', value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          <MdInventory size={24} />
          Nuevo Movimiento de Inventario
        </h2>
        <p className={styles.formSubtitle}>Registra entradas y salidas de productos</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Selector de Tipo - Usando inputs tipo radio reales */}
        <div className={styles.typeSelector}>
          <label
            className={`${styles.typeOption} ${tipo === 'entrada' ? styles.typeOptionSelected : ''}`}
          >
            <input
              type="radio"
              name="tipo"
              value="entrada"
              checked={tipo === 'entrada'}
              onChange={() => handleTipoChange('entrada')}
              className="sr-only"
            />
            <div className={styles.typeIcon}>
              <MdAdd size={32} />
            </div>
            <div className={styles.typeLabel}>Entrada</div>
            <div className={styles.typeDescription}>Ingreso de mercadería</div>
          </label>

          <label
            className={`${styles.typeOption} ${tipo === 'salida' ? styles.typeOptionSelected : ''}`}
          >
            <input
              type="radio"
              name="tipo"
              value="salida"
              checked={tipo === 'salida'}
              onChange={() => handleTipoChange('salida')}
              className="sr-only"
            />
            <div className={styles.typeIcon}>
              <MdRemove size={32} />
            </div>
            <div className={styles.typeLabel}>Salida</div>
            <div className={styles.typeDescription}>Venta o consumo</div>
          </label>
        </div>

        {/* Campo oculto para registrar el valor en RHF */}
        <input type="hidden" {...register('tipo')} />

        {/* Producto (Controller: adapta el onChange a ChangeEventHandler<HTMLSelectElement>) */}
        <Controller
          name="id_producto"
          control={control}
          rules={{ required: 'Selecciona un producto' }}
          render={({ field }) => (
            <Select
              label="Producto"
              placeholder="Selecciona un producto"
              options={productOptions}
              error={errors.id_producto?.message}
              required
              value={field.value != null ? String(field.value) : ''} // string para <select>
              onChange={(e) => {
                // e es ChangeEvent<HTMLSelectElement>
                const val = e.target.value;
                field.onChange(val === '' ? undefined : Number(val)); // form state guarda número
              }}
            />
          )}
        />

        {/* Stock Actual */}
        {selectedProduct && (
          <div className={styles.currentStock}>
            <div className={styles.stockLabel}>Stock Actual</div>
            <div className={`${styles.stockValue} ${isStockLow ? styles.stockLow : ''}`}>
              {selectedProduct.stock} unidades
              {isStockLow && ' (¡Stock bajo!)'}
            </div>
          </div>
        )}

        {/* Cantidad y Detalle */}
        <div className={styles.formGrid}>
          <Input
            label="Detalle del movimiento"
            placeholder={tipo === 'entrada' ? 'Ej: Compra a proveedor X' : 'Ej: Venta orden #123'}
            error={errors.detalle?.message}
            required
            {...register('detalle')}
          />

          <Input
            label="Cantidad"
            type="number"
            min="1"
            placeholder="1"
            error={errors.cantidad?.message}
            required
            {...register('cantidad', { valueAsNumber: true })}
          />
        </div>

        {/* Validación de stock insuficiente */}
        {isStockInsufficient && (
          <div className={styles.errorAlert}>
            ⚠️ Stock insuficiente. Stock disponible: {selectedProduct?.stock} unidades
          </div>
        )}

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

          <Button
            type="submit"
            loading={isSubmitting}
            className={styles.submitButton}
            disabled={isSubmitting || isStockInsufficient}
          >
            Registrar {tipo === 'entrada' ? 'Entrada' : 'Salida'}
          </Button>
        </div>
      </form>
    </div>
  );
};
