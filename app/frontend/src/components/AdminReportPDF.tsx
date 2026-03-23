import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Ticket, Company } from '@/types';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F8FAFC',
    padding: 30,
    paddingBottom: 65,
  },
  header: {
    backgroundColor: '#0D1117',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 4,
  },
  logo: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 7,
    color: '#64748B',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  criticalSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FEE2E2',
    borderRadius: 6,
  },
  criticalTitle: {
    color: '#991B1B',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  criticalItem: {
    fontSize: 7,
    color: '#B91C1C',
    marginBottom: 2,
  },
  table: {
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 0,
  },
  tableColHeader: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    padding: 5,
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
    padding: 5,
  },
  colSubject: { width: '25%' },
  colArea: { width: '15%' },
  colPrio: { width: '12%' },
  colStatus: { width: '13%' },
  colTech: { width: '17%' },
  colEmp: { width: '18%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94A3B8',
  }
});

interface AdminReportPDFProps {
  tickets: Ticket[];
  company: Company | null;
  generatedDate: string;
}

export const AdminReportPDF = ({ tickets = [], company, generatedDate }: AdminReportPDFProps) => {
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const total = safeTickets.length;
  const resolved = safeTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const efficiency = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';

  const criticalKeywords = ['INCENDIANDO', 'FALLA EN EL SISTEMA', 'URGENTE', 'CAIDO', 'ERROR CRITICO'];
  const criticalTickets = safeTickets.filter(t => 
    (t.title || '').toUpperCase().includes('INCENDIANDO') || 
    (t.title || '').toUpperCase().includes('FALLA') || 
    t.priority === 'URGENT'
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>ForeSight V2</Text>
          <Text style={styles.headerRight}>ADMIN DASHBOARD REPORT</Text>
        </View>

        <View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TICKETS TOTALES</Text>
              <Text style={styles.statValue}>{total}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RESUELTOS</Text>
              <Text style={styles.statValue}>{resolved}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>EFICIENCIA</Text>
              <Text style={styles.statValue}>{efficiency}%</Text>
            </View>
          </View>

          {criticalTickets.length > 0 && (
            <View style={styles.criticalSection}>
              <Text style={styles.criticalTitle}>INCIDENTES CRITICOS</Text>
              {criticalTickets.slice(0, 3).map((t, i) => (
                <Text key={i} style={styles.criticalItem}>
                  - {t.title || 'Sin Titulo'} ({t.area?.name || 'Gral.'})
                </Text>
              ))}
            </View>
          )}

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableColHeader, styles.colSubject]}>ASUNTO</Text>
              <Text style={[styles.tableColHeader, styles.colArea]}>AREA</Text>
              <Text style={[styles.tableColHeader, styles.colPrio]}>PRIO</Text>
              <Text style={[styles.tableColHeader, styles.colStatus]}>ESTADO</Text>
              <Text style={[styles.tableColHeader, styles.colTech]}>TECNICO</Text>
              <Text style={[styles.tableColHeader, styles.colEmp]}>EMPLEADO</Text>
            </View>

            {safeTickets.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', marginTop: 20 }]}>
                  No hay registros de tickets para mostrar.
                </Text>
              </View>
            ) : (
              safeTickets.map((ticket) => (
                <View key={ticket.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colSubject]}>{(ticket.title || 'N/A').substring(0, 25)}</Text>
                  <Text style={[styles.tableCell, styles.colArea]}>{ticket.area?.name || 'Gral.'}</Text>
                  <Text style={[styles.tableCell, styles.colPrio]}>{ticket.priority || 'MEDIUM'}</Text>
                  <Text style={[styles.tableCell, styles.colStatus]}>{ticket.status || 'OPEN'}</Text>
                  <Text style={[styles.tableCell, styles.colTech]}>{ticket.assignedTo?.name || 'Pendiente'}</Text>
                  <Text style={[styles.tableCell, styles.colEmp]}>{ticket.createdBy?.name || 'N/A'}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generado para: {company?.name || 'ForeSight'}. Fecha: {generatedDate}
          </Text>
          <Text style={styles.footerText}>
            Reporte de Administracion
          </Text>
        </View>
      </Page>
    </Document>
  );
};
