import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { KardexExtendido, ProductoExtendido } from '../../types/database';
import type {
  AnyReportData,
  InventoryValueData,
  KardexReportData,
  StockReportData,
} from '../../types/reports';
// ✅ CORRECCIÓN: Se eliminó 'formatNumber' que no se estaba utilizando.
import { formatCurrency, formatDate } from '../../utils/format';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 3,
  },
  metadata: {
    fontSize: 8,
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  tableCol: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 8,
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
  },
});

const ProductTable = ({ productos }: { productos: ProductoExtendido[] }) => (
  <View style={styles.table}>
    {/* Header */}
    <View style={styles.tableRow}>
      <View style={[styles.tableColHeader, { width: '30%' }]}>
        <Text style={styles.tableCellHeader}>Producto</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '15%' }]}>
        <Text style={styles.tableCellHeader}>Categoría</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '15%' }]}>
        <Text style={styles.tableCellHeader}>Marca</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '10%' }]}>
        <Text style={styles.tableCellHeader}>Stock</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '15%' }]}>
        <Text style={styles.tableCellHeader}>P. Venta</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '15%' }]}>
        <Text style={styles.tableCellHeader}>Valor Total</Text>
      </View>
    </View>

    {/* Rows */}
    {productos.map((producto) => (
      <View style={styles.tableRow} key={producto.id}>
        <View style={[styles.tableCol, { width: '30%' }]}>
          <Text style={styles.tableCell}>{producto.descripcion}</Text>
        </View>
        <View style={[styles.tableCol, { width: '15%' }]}>
          <Text style={styles.tableCell}>{producto.categoria}</Text>
        </View>
        <View style={[styles.tableCol, { width: '15%' }]}>
          <Text style={styles.tableCell}>{producto.marca}</Text>
        </View>
        <View style={[styles.tableCol, { width: '10%' }]}>
          <Text style={styles.tableCell}>{producto.stock}</Text>
        </View>
        <View style={[styles.tableCol, { width: '15%' }]}>
          <Text style={styles.tableCell}>{formatCurrency(producto.precioventa)}</Text>
        </View>
        <View style={[styles.tableCol, { width: '15%' }]}>
          <Text style={styles.tableCell}>
            {formatCurrency(producto.stock * producto.precioventa)}
          </Text>
        </View>
      </View>
    ))}
  </View>
);

const MovementTable = ({ movimientos }: { movimientos: KardexExtendido[] }) => (
  <View style={styles.table}>
    {/* Header */}
    <View style={styles.tableRow}>
      <View style={[styles.tableColHeader, { width: '15%' }]}>
        <Text style={styles.tableCellHeader}>Fecha</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '25%' }]}>
        <Text style={styles.tableCellHeader}>Producto</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '12%' }]}>
        <Text style={styles.tableCellHeader}>Tipo</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '10%' }]}>
        <Text style={styles.tableCellHeader}>Cantidad</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '23%' }]}>
        <Text style={styles.tableCellHeader}>Detalle</Text>
      </View>
      <View style={[styles.tableColHeader, { width: '15%' }]}>
        <Text style={styles.tableCellHeader}>Usuario</Text>
      </View>
    </View>

    {/* Rows */}
    {movimientos.map((movimiento) => (
      <View style={styles.tableRow} key={movimiento.id}>
        <View style={[styles.tableCol, { width: '15%' }]}>
          <Text style={styles.tableCell}>{formatDate(movimiento.fecha)}</Text>
        </View>
        <View style={[styles.tableCol, { width: '25%' }]}>
          <Text style={styles.tableCell}>{movimiento.descripcion}</Text>
        </View>
        <View style={[styles.tableCol, { width: '12%' }]}>
          <Text style={styles.tableCell}>{movimiento.tipo}</Text>
        </View>
        <View style={[styles.tableCol, { width: '10%' }]}>
          <Text style={styles.tableCell}>{movimiento.cantidad}</Text>
        </View>
        <View style={[styles.tableCol, { width: '23%' }]}>
          <Text style={styles.tableCell}>{movimiento.detalle}</Text>
        </View>
        <View style={[styles.tableCol, { width: '15%' }]}>
          <Text style={styles.tableCell}>{movimiento.nombres}</Text>
        </View>
      </View>
    ))}
  </View>
);

export const StockReportPDF = ({ data }: { data: AnyReportData }) => (
  <Document>
    <Page>
      <ProductTable productos={(data as StockReportData).data} />
    </Page>
  </Document>
);
export const LowStockReportPDF = ({ data }: { data: AnyReportData }) => (
  <Document>
    <Page>
      <ProductTable productos={(data as StockReportData).data} />
    </Page>
  </Document>
);
export const KardexReportPDF = ({ data }: { data: AnyReportData }) => (
  <Document>
    <Page>
      <MovementTable movimientos={(data as KardexReportData).data} />
    </Page>
  </Document>
);
export const InventoryValueReportPDF = ({ data }: { data: AnyReportData }) => (
  <Document>
    <Page>
      <ProductTable productos={(data as InventoryValueData).data} />
    </Page>
  </Document>
);
