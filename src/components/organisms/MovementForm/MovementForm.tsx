import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdAdd, MdInventory, MdRemove } from 'react-icons/md';
import { z } from 'zod';
import { useCreateMovement } from '../../../hooks/useKardex';
import { useProducts } from '../../../hooks/useProducts';
import type { MovementFormData } from '../../../types/database';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import styles from './MovementForm.module.css';

const movementSchema = z.object({
  id_producto: z.coerce.number().min(1, 'Selecciona un producto'),
  tipo: z.enum(['entrada', 'salida'], { message: 'Tipo de movimiento requerido' }),
  cantidad: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  detalle: z.string().min(3, 'El detalle debe tener al menos 3 caracteres'),
});

type MovementForm = z.infer<typeof movementSchema>;

interface MovementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MovementForm = ({ onSuccess, onCancel }: MovementFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products = [] } = useProducts();
  const createMovementMutation = useCreateMovement();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<MovementForm>({
    resolver: zodResolver(movementSchema),
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
      const product = products.find((p) => p.id === Number(id_producto));
      setSelectedProduct(product);
    }
  }, [id_producto, products]);

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.descripcion} (Stock: ${product.stock})`,
  }));

  const onSubmit = async (data: MovementForm) => {
    try {
      await createMovementMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error('Error creating movement:', error);
    }
  };

  const isStockLow = selectedProduct && selectedProduct.stock <= selectedProduct.stock_minimo;
  const isStockInsufficient =
    tipo === 'salida' && selectedProduct && cantidad > selectedProduct.stock;

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
        {/* Selector de Tipo */}
        <div className={styles.typeSelector}>
          <div
            className={`${styles.typeOption} ${tipo === 'entrada' ? styles.typeOptionSelected : ''}`}
            onClick={() => setValue('tipo', 'entrada')}
          >
            <div className={styles.typeIcon}>
              <MdAdd size={32} />
            </div>
            <div className={styles.typeLabel}>Entrada</div>
            <div className={styles.typeDescription}>Ingreso de mercadería</div>
          </div>

          <div
            className={`${styles.typeOption} ${tipo === 'salida' ? styles.typeOptionSelected : ''}`}
            onClick={() => setValue('tipo', 'salida')}
          >
            <div className={styles.typeIcon}>
              <MdRemove size={32} />
            </div>
            <div className={styles.typeLabel}>Salida</div>
            <div className={styles.typeDescription}>Venta o consumo</div>
          </div>
        </div>

        <input type="hidden" {...register('tipo')} />

        {/* Producto */}
        <Select
          label="Producto"
          placeholder="Selecciona un producto"
          options={productOptions}
          error={errors.id_producto?.message}
          required
          {...register('id_producto', { valueAsNumber: true })}
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
            ⚠️ Stock insuficiente. Stock disponible: {selectedProduct.stock} unidades
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
            disabled={isStockInsufficient}
          >
            Registrar {tipo === 'entrada' ? 'Entrada' : 'Salida'}
          </Button>
        </div>
      </form>
    </div>
  );
};
