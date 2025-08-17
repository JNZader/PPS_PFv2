import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { ReportData, ExportOptions } from '../../types/reports';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';

// Registrar fuentes (opcional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

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

interface ReportPDFTemplateProps {
  data: ReportData;
  options: ExportOptions;
}

export const ReportPDFTemplate = ({ data, options }: ReportPDFTemplateProps) => {
  const isLandscape = options.orientacion === 'landscape';

  return (
    <Document>
      <Page 
        size="A4" 
        style={styles.page}
        orientation={isLandscape ? 'landscape' : 'portrait'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.titulo}</Text>
          {data.subtitulo && <Text style={styles.subtitle}>{data.subtitulo}</Text>}
          <Text style={styles.metadata}>
            Generado el {data.fechaGeneracion} | FiveStock v2.0
          </Text>
        </View>

        {/* Estadísticas */}
        {data.estadisticas && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatNumber(data.estadisticas.totalProductos)}
              </Text>
              <Text style={styles.statLabel}>Total Productos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatCurrency(data.estadisticas.totalValor)}
              </Text>
              <Text style={styles.statLabel}>Valor Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatNumber(data.estadisticas.stockBajo)}
              </Text>
              <Text style={styles.statLabel}>Stock Bajo</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatNumber(data.estadisticas.entradas)}
              </Text>
              <Text style={styles.statLabel}>Entradas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatNumber(data.estadisticas.salidas)}
              </Text>
              <Text style={styles.statLabel}>Salidas</Text>
            </View>
          </View>
        )}

        {/* Tabla de Productos */}
        {data.productos && data.productos.length > 0 && (
          <ProductTable productos={data.productos} />
        )}

        {/* Tabla de Movimientos */}
        {data.movimientos && data.movimientos.length > 0 && (
          <MovementTable movimientos={data.movimientos} />
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Reporte generado por FiveStock - Sistema de Gestión de Inventarios
        </Text>
      </Page>
    </Document>
  );
};

const ProductTable = ({ productos }: { productos: any[] }) => (
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
    {productos.map((producto, index) => (
      <View style={styles.tableRow} key={index}>
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

const MovementTable = ({ movimientos }: { movimientos: any[] }) => (
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
    {movimientos.map((movimiento, index) => (
      <View style={styles.tableRow} key={index}>
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