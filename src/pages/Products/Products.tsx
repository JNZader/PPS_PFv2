import { useState } from 'react';
import { MdInventory, MdShoppingBag, MdTrendingUp, MdWarning } from 'react-icons/md';
import { Modal } from '../../components/molecules/Modal';
import { ProductForm } from '../../components/organisms/ProductForm';
import { ProductTable } from '../../components/organisms/ProductTable';
import { useProducts } from '../../hooks/useProducts';
import type { ProductoExtendido } from '../../types/database';
import { formatCurrency, formatNumber } from '../../utils/format';
import styles from './Products.module.css';

export const Products = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductoExtendido | null>(null);

  const { data: products = [] } = useProducts();

  // Calcular estadísticas
  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock <= p.stock_minimo).length,
    totalValue: products.reduce((sum, p) => sum + p.stock * p.precioventa, 0),
    avgPrice:
      products.length > 0
        ? products.reduce((sum, p) => sum + p.precioventa, 0) / products.length
        : 0,
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductoExtendido) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className={styles.productsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdInventory size={32} />
          Gestión de Productos
        </h1>
        <p className={styles.pageSubtitle}>
          Administra tu catálogo de productos, controla el inventario y gestiona precios
        </p>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
            <MdInventory size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatNumber(stats.total)}</div>
            <div className={styles.statLabel}>Total Productos</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
            <MdWarning size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatNumber(stats.lowStock)}</div>
            <div className={styles.statLabel}>Stock Bajo</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
            <MdTrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatCurrency(stats.totalValue)}</div>
            <div className={styles.statLabel}>Valor Total</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <MdShoppingBag size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatCurrency(stats.avgPrice)}</div>
            <div className={styles.statLabel}>Precio Promedio</div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className={styles.tableContainer}>
        <ProductTable onAdd={handleAddProduct} onEdit={handleEditProduct} />
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="large"
      >
        <ProductForm
          productId={editingProduct?.id}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};
