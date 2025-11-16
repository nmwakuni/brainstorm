import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '../services/api'

export default function AdvanceHistoryScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['advances'],
    queryFn: employeeApi.getAdvances,
  })

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      disbursed: '#10b981',
      approved: '#3b82f6',
      pending: '#f59e0b',
      failed: '#ef4444',
      cancelled: '#6b7280',
      repaid: '#059669',
    }
    return colors[status] || '#6b7280'
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      disbursed: '✓',
      approved: '👍',
      pending: '⏳',
      failed: '✗',
      cancelled: '🚫',
      repaid: '✓✓',
    }
    return icons[status] || '•'
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    )
  }

  if (error || !data?.success) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load history</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const advances = data.advances || []

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {advances.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💸</Text>
          <Text style={styles.emptyTitle}>No advances yet</Text>
          <Text style={styles.emptyText}>Request your first salary advance to see it here</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {advances.map((advance: any) => (
            <View key={advance.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.amount}>{formatCurrency(advance.amount)}</Text>
                  <Text style={styles.date}>{formatDate(advance.requestedAt)}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(advance.status) + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(advance.status) }]}>
                    {getStatusIcon(advance.status)} {advance.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fee</Text>
                  <Text style={styles.detailValue}>{formatCurrency(advance.fee)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.detailValue}>{formatCurrency(advance.totalAmount)}</Text>
                </View>

                {advance.status === 'disbursed' && advance.disbursedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Disbursed</Text>
                    <Text style={styles.detailValue}>{formatDate(advance.disbursedAt)}</Text>
                  </View>
                )}

                {advance.status === 'failed' && advance.failureReason && (
                  <View style={styles.failureReason}>
                    <Text style={styles.failureText}>{advance.failureReason}</Text>
                  </View>
                )}

                {advance.mpesaTransactionId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>M-Pesa ID</Text>
                    <Text style={[styles.detailValue, styles.transactionId]}>
                      {advance.mpesaTransactionId}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  details: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  failureReason: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  failureText: {
    fontSize: 12,
    color: '#991b1b',
  },
})
