import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateCategory, useUpdateCategory } from '../../../hooks/useProducts';
import type { Categoria, CategoryFormData } from '../../../types/database';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

const categorySchema = z.object({
  descripcion: z.string().min(2, 'La descripción es requerida'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'El color debe ser un hexadecimal válido'),
});

interface CategoryFormProps {
  category?: Categoria | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CategoryForm = ({ category, onSuccess, onCancel }: CategoryFormProps) => {
  const isEditing = !!category;
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      descripcion: '',
      color: '#3b82f6',
    },
  });

  useEffect(() => {
    if (isEditing && category) {
      reset({
        descripcion: category.descripcion,
        color: category.color || '#3b82f6',
      });
    }
  }, [isEditing, category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await updateCategoryMutation.mutateAsync({ id: category.id, data });
      } else {
        await createCategoryMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <Input
        label="Nombre de la Categoría"
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />
      <Input label="Color" type="color" error={errors.color?.message} {...register('color')} />
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
