import { MdAdd, MdBrandingWatermark, MdCategory, MdDelete, MdEdit } from 'react-icons/md';
import { Alert } from '../../components/atoms/Alert';
import { Button } from '../../components/atoms/Button';
import { Loading } from '../../components/atoms/Loading';
import { useBrands, useCategories } from '../../hooks/useProducts';
import styles from './Categories.module.css';

export const Categories = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  if (categoriesLoading || brandsLoading) {
    return <Loading fullscreen text="Cargando categorías y marcas..." />;
  }

  return (
    <div className={styles.categoriesPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdCategory size={32} />
          Categorías y Marcas
        </h1>
        <p className={styles.pageSubtitle}>Organiza tus productos con categorías y marcas</p>
      </div>

      <Alert variant="info" title="Próximamente">
        La gestión completa de categorías y marcas estará disponible en la próxima iteración. Por
        ahora puedes visualizar las existentes.
      </Alert>

      {/* Contenido */}
      <div className={styles.contentGrid}>
        {/* Categorías */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <MdCategory size={20} />
              Categorías ({categories.length})
            </h2>
            <Button size="sm" disabled>
              <MdAdd size={16} />
              Nueva Categoría
            </Button>
          </div>

          <div className={styles.itemsList}>
            {categories.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay categorías registradas</p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className={styles.item}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      className={styles.categoryColor}
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{category.descripcion}</div>
                      <div className={styles.itemDescription}>ID: {category.id}</div>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      title="Editar categoría"
                      disabled
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Eliminar categoría"
                      disabled
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Marcas */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <MdBrandingWatermark size={20} />
              Marcas ({brands.length})
            </h2>
            <Button size="sm" disabled>
              <MdAdd size={16} />
              Nueva Marca
            </Button>
          </div>

          <div className={styles.itemsList}>
            {brands.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay marcas registradas</p>
              </div>
            ) : (
              brands.map((brand) => (
                <div key={brand.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{brand.descripcion}</div>
                    <div className={styles.itemDescription}>ID: {brand.id}</div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      title="Editar marca"
                      disabled
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Eliminar marca"
                      disabled
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
