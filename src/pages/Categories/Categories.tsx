import { useState } from 'react';
import { MdAdd, MdBrandingWatermark, MdCategory, MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '../../components/atoms/Button';
import { Loading } from '../../components/atoms/Loading';
import { Modal } from '../../components/molecules/Modal';
import { BrandForm } from '../../components/organisms/BrandForm';
import { CategoryForm } from '../../components/organisms/CategoryForm';
import {
  useBrands,
  useCategories,
  useDeleteBrand,
  useDeleteCategory,
} from '../../hooks/useProducts';
import type { Categoria, Marca } from '../../types/database';
import styles from './Categories.module.css';

const Categories = () => {
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setBrandModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [editingBrand, setEditingBrand] = useState<Marca | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  const deleteCategoryMutation = useDeleteCategory();
  const deleteBrandMutation = useDeleteBrand();

  const handleOpenCategoryModal = (category: Categoria | null = null) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleOpenBrandModal = (brand: Marca | null = null) => {
    setEditingBrand(brand);
    setBrandModalOpen(true);
  };

  const handleCloseModals = () => {
    setCategoryModalOpen(false);
    setBrandModalOpen(false);
    setEditingCategory(null);
    setEditingBrand(null);
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      await deleteCategoryMutation.mutateAsync(id);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
      await deleteBrandMutation.mutateAsync(id);
    }
  };

  if (categoriesLoading || brandsLoading) {
    return <Loading fullscreen text="Cargando categorías y marcas..." />;
  }

  return (
    <div className={styles.categoriesPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdCategory size={32} />
          Categorías y Marcas
        </h1>
        <p className={styles.pageSubtitle}>Organiza tus productos con categorías y marcas</p>
      </div>

      <div className={styles.contentGrid}>
        {/* Categorías */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <MdCategory size={20} />
              Categorías ({categories.length})
            </h2>
            <Button size="sm" onClick={() => handleOpenCategoryModal()}>
              <MdAdd size={16} />
              Nueva Categoría
            </Button>
          </div>

          <div className={styles.itemsList}>
            {categories.map((category: Categoria) => (
              <div key={category.id} className={styles.item}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className={styles.categoryColor}
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{category.descripcion}</div>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleOpenCategoryModal(category)}
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marcas */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <MdBrandingWatermark size={20} />
              Marcas ({brands.length})
            </h2>
            <Button size="sm" onClick={() => handleOpenBrandModal()}>
              <MdAdd size={16} />
              Nueva Marca
            </Button>
          </div>

          <div className={styles.itemsList}>
            {brands.map((brand: Marca) => (
              <div key={brand.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{brand.descripcion}</div>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleOpenBrandModal(brand)}
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteBrand(brand.id)}
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseModals}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <CategoryForm
          category={editingCategory}
          onSuccess={handleCloseModals}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={isBrandModalOpen}
        onClose={handleCloseModals}
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
      >
        <BrandForm
          brand={editingBrand}
          onSuccess={handleCloseModals}
          onCancel={handleCloseModals}
        />
      </Modal>
    </div>
  );
};

export default Categories;
