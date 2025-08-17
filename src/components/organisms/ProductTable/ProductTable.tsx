import {
  type ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { type CSSProperties, type FC, useMemo, useState } from 'react'; // Import FC and CSSProperties
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdFilterList,
  MdInventory2,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdSearch,
  MdSort,
} from 'react-icons/md';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  useBrands,
  useCategories,
  useDeleteProduct,
  useProducts,
} from '../../../hooks/useProducts';
import type { ProductoExtendido } from '../../../types/database';
import { formatCurrency } from '../../../utils/format';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
// import { Badge } from '../../atoms/Badge'; // <--- HEMOS COMENTADO ESTO TEMPORALMENTE
import { Loading } from '../../atoms/Loading';
import { Select } from '../../atoms/Select';
import styles from './ProductTable.module.css';

// ==============================================================================
//  INICIO DE LA CORRECCIÓN: Componente Badge Temporal
// ==============================================================================
// Este es un componente Badge temporal que SÍ acepta la prop 'style'.
// El error desaparecerá porque ahora estamos usando este componente en lugar del de su archivo.
//
// ACCIÓN REQUERIDA: Copie este componente y reemplácelo en su archivo `../../atoms/Badge.tsx`.
// Después de hacerlo, puede borrar este código de aquí y descomentar la línea de import de arriba.

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  style?: CSSProperties; // <-- LA LÍNEA MÁGICA QUE ACEPTA EL ESTILO
}

const Badge: FC<BadgeProps> = ({ children, style }) => {
  // Un estilo base para que se vea como un badge
  const baseStyle: CSSProperties = {
    display: 'inline-block',
    padding: '0.25em 0.6em',
    fontSize: '75%',
    fontWeight: 700,
    lineHeight: '1',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',
    borderRadius: '0.375rem',
  };

  // Fusionamos el estilo base con el estilo que se le pasa
  const finalStyle = { ...baseStyle, ...style };

  return <span style={finalStyle}>{children}</span>;
};
// ==============================================================================
//  FIN DE LA CORRECCIÓN
// ==============================================================================

const columnHelper = createColumnHelper<ProductoExtendido>();

interface ProductTableProps {
  onEdit: (product: ProductoExtendido) => void;
  onAdd: () => void;
}

export const ProductTable = ({ onEdit, onAdd }: ProductTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const deleteProductMutation = useDeleteProduct();

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Todas las categorías' },
      ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.descripcion })),
    ],
    [categories]
  );

  const brandOptions = useMemo(
    () => [
      { value: '', label: 'Todas las marcas' },
      ...brands.map((brand) => ({ value: brand.id.toString(), label: brand.descripcion })),
    ],
    [brands]
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const columns = [
    columnHelper.accessor('descripcion', {
      header: 'Producto',
      cell: ({ row }) => (
        <div className={styles.productInfo}>
          <div className={styles.productName}>{row.original.descripcion}</div>
          <div className={styles.productCode}>
            {row.original.codigointerno && `Código: ${row.original.codigointerno}`}
            {row.original.codigointerno && row.original.codigobarras && ' • '}
            {row.original.codigobarras && `EAN: ${row.original.codigobarras}`}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('categoria', {
      header: 'Categoría',
      cell: ({ getValue, row }) => (
        // Ahora, este Badge es el componente temporal que creamos arriba.
        // Ya no dará error.
        <Badge
          variant="default"
          style={{
            backgroundColor: row.original.color || '#3b82f6',
            color: 'white',
          }}
        >
          {getValue()}
        </Badge>
      ),
      filterFn: (row, filterValue) => {
        if (!filterValue) return true;
        return row.original.id_categoria.toString() === filterValue;
      },
    }),
    columnHelper.accessor('marca', {
      header: 'Marca',
      filterFn: (row, filterValue) => {
        if (!filterValue) return true;
        return row.original.idmarca.toString() === filterValue;
      },
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: ({ getValue, row }) => {
        const stock = getValue();
        const stockMinimo = row.original.stock_minimo;

        let stockClass = styles.stockNormal;
        if (stock <= stockMinimo) stockClass = styles.stockLow;
        else if (stock > stockMinimo * 2) stockClass = styles.stockHigh;

        return (
          <div className={styles.stockCell}>
            <span className={`${styles.stockAmount} ${stockClass}`}>{stock} uds</span>
            <span className={styles.stockMinimo}>Mín: {stockMinimo}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('precioventa', {
      header: 'Precios',
      cell: ({ getValue, row }) => (
        <div className={styles.priceCell}>
          <span className={styles.priceVenta}>{formatCurrency(getValue())}</span>
          <span className={styles.priceCompra}>
            Compra: {formatCurrency(row.original.preciocompra)}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className={styles.actionsCell}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={() => onEdit(row.original)}
            title="Editar producto"
          >
            <MdEdit size={18} />
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => handleDelete(row.original.id)}
            title="Eliminar producto"
            disabled={deleteProductMutation.isPending}
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter: debouncedGlobalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const searchableFields = [
        row.original.descripcion,
        row.original.categoria,
        row.original.marca,
        row.original.codigointerno,
        row.original.codigobarras,
      ];

      return searchableFields.some(
        (field) => field && typeof field === 'string' && field.toLowerCase().includes(searchValue)
      );
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <Loading fullscreen text="Cargando productos..." />;
  }

  return (
    <div className={styles.tableContainer}>
      {/* Header, Filtros, Tabla y Paginación... (todo el resto del código es igual) */}
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>Productos ({table.getFilteredRowModel().rows.length})</h2>

        <div className={styles.tableActions}>
          <div className={styles.searchContainer}>
            <Input
              placeholder="Buscar productos..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={styles.searchInput}
              leftIcon={<MdSearch size={20} className={styles.searchIcon} />}
            />
          </div>

          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <MdFilterList size={16} />
            Filtros
          </button>

          <Button onClick={onAdd} size="sm">
            <MdAdd size={16} />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersContainer}>
          <div className={styles.filtersGrid}>
            <Select
              placeholder="Filtrar por categoría"
              options={categoryOptions}
              value={table.getColumn('categoria')?.getFilterValue() as string | ''}
              onChange={(e) =>
                table.getColumn('categoria')?.setFilterValue(e.target.value || undefined)
              }
            />

            <Select
              placeholder="Filtrar por marca"
              options={brandOptions}
              value={table.getColumn('marca')?.getFilterValue() as string | ''}
              onChange={(e) =>
                table.getColumn('marca')?.setFilterValue(e.target.value || undefined)
              }
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                setGlobalFilter('');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`${styles.headerCell} ${header.column.getCanSort() ? styles.sortableHeader : ''}`}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div className={styles.headerContent}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span
                            className={`${styles.sortIcon} ${header.column.getIsSorted() ? styles.active : ''}`}
                          >
                            {header.column.getIsSorted() === 'desc' ? (
                              <MdKeyboardArrowDown size={16} />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <MdKeyboardArrowUp size={16} />
                            ) : (
                              <MdSort size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className={styles.tableBody}>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.tableCell}>
                  <div className={styles.emptyState}>
                    <MdInventory2 size={48} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No se encontraron productos</h3>
                    <p className={styles.emptyDescription}>
                      {globalFilter || columnFilters.length > 0
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Comienza agregando tu primer producto'}
                    </p>
                    {!globalFilter && columnFilters.length === 0 && (
                      <Button onClick={onAdd}>
                        <MdAdd size={16} />
                        Agregar Producto
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={styles.tableRow}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.tableCell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Mostrando{' '}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            de {table.getFilteredRowModel().rows.length} productos
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              className={`${styles.pageButton} ${!table.getCanPreviousPage() ? styles.disabled : ''}`}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Ir a la primera página"
            >
              {'<<'}
            </button>

            <button
              type="button"
              className={`${styles.pageButton} ${!table.getCanPreviousPage() ? styles.disabled : ''}`}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
            >
              {'<'}
            </button>

            {/* Simplificar la paginación para evitar problemas */}
            {(() => {
              const pageCount = table.getPageCount();
              const currentPage = table.getState().pagination.pageIndex;
              const visiblePages = [];

              // Mostrar solo 5 páginas como máximo
              const startPage = Math.max(0, Math.min(currentPage - 2, pageCount - 5));
              const endPage = Math.min(pageCount, startPage + 5);

              for (let i = startPage; i < endPage; i++) {
                visiblePages.push(
                  <button
                    type="button"
                    key={`page-${i}`}
                    className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
                    onClick={() => table.setPageIndex(i)}
                    aria-label={`Ir a la página ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              }

              return visiblePages;
            })()}

            <button
              type="button"
              className={`${styles.pageButton} ${!table.getCanNextPage() ? styles.disabled : ''}`}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Página siguiente"
            >
              {'>'}
            </button>

            <button
              type="button"
              className={`${styles.pageButton} ${!table.getCanNextPage() ? styles.disabled : ''}`}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Ir a la última página"
            >
              {'>>'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
