import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateBrand, useUpdateBrand } from '../../../hooks/useProducts';
import type { BrandFormData, Marca } from '../../../types/database';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

const brandSchema = z.object({
  descripcion: z.string().min(2, 'La descripción es requerida'),
});

interface BrandFormProps {
  brand?: Marca | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BrandForm = ({ brand, onSuccess, onCancel }: BrandFormProps) => {
  const isEditing = !!brand;
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      descripcion: '',
    },
  });

  useEffect(() => {
    if (isEditing && brand) {
      reset({
        descripcion: brand.descripcion,
      });
    }
  }, [isEditing, brand, reset]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      if (isEditing && brand) {
        await updateBrandMutation.mutateAsync({ id: brand.id, data });
      } else {
        await createBrandMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save brand:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <Input
        label="Nombre de la Marca"
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
