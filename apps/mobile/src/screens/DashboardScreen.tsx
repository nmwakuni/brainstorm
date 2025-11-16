import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation'
import { employeeApi } from '../services/api'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>()

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: employeeApi.getDashboard,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusStyle = (status: string): object => {
    const statusKey = `status${status}` as keyof typeof styles
    return styles[statusKey] || {}
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
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { employee, earnings, recentAdvances } = data

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{employee.firstName} {employee.lastName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Earnings Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>This Month</Text>
          <TouchableOpacity>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.earningsGrid}>
          <View style={styles.earningsItem}>
            <Text style={styles.earningsLabel}>Monthly Salary</Text>
            <Text style={styles.earningsValue}>
              {formatCurrency(earnings.monthlySalary)}
            </Text>
          </View>

          <View style={styles.earningsItem}>
            <Text style={styles.earningsLabel}>Earned So Far</Text>
            <Text style={[styles.earningsValue, styles.earningsValuePrimary]}>
              {formatCurrency(earnings.earnedToDate)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.availableSection}>
          <Text style={styles.availableLabel}>Available to Withdraw</Text>
          <Text style={styles.availableValue}>
            {formatCurrency(earnings.availableToWithdraw)}
          </Text>
          <Text style={styles.availableHint}>
            (50% of earned wages - already advanced)
          </Text>
        </View>

        {earnings.totalAdvancedThisMonth > 0 && (
          <View style={styles.advancedInfo}>
            <Text style={styles.advancedText}>
              Already advanced: {formatCurrency(earnings.totalAdvancedThisMonth)}
            </Text>
          </View>
        )}
      </View>

      {/* Request Advance Button */}
      <TouchableOpacity
        style={[
          styles.requestButton,
          earnings.availableToWithdraw <= 0 && styles.requestButtonDisabled,
        ]}
        onPress={() => navigation.navigate('RequestAdvance')}
        disabled={earnings.availableToWithdraw <= 0}
      >
        <Text style={styles.requestButtonText}>💸 Request Advance</Text>
      </TouchableOpacity>

      {earnings.availableToWithdraw <= 0 && (
        <Text style={styles.disabledHint}>
          You've reached your advance limit for this month
        </Text>
      )}

      {/* Recent Advances */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Advances</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdvanceHistory')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentAdvances.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No advances yet</Text>
            <Text style={styles.emptySubtext}>
              Request your first advance to get started
            </Text>
          </View>
        ) : (
          recentAdvances.slice(0, 3).map((advance: any) => (
            <View key={advance.id} style={styles.advanceCard}>
              <View style={styles.advanceLeft}>
                <Text style={styles.advanceAmount}>
                  {formatCurrency(parseFloat(advance.amount))}
                </Text>
                <Text style={styles.advanceDate}>
                  {formatDate(advance.requestedAt)}
                </Text>
              </View>
              <View style={styles.advanceRight}>
                <View style={[styles.statusBadge, getStatusStyle(advance.status)]}>
                  <Text style={styles.statusText}>
                    {advance.status === 'disbursed' ? '✓ Sent' : advance.status}
                  </Text>
                </View>
                <Text style={styles.advanceFee}>
                  Fee: {formatCurrency(parseFloat(advance.fee))}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#10b981',
  },
  greeting: {
    fontSize: 14,
    color: '#d1fae5',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  infoIcon: {
    fontSize: 16,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  earningsItem: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  earningsValuePrimary: {
    color: '#10b981',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  availableSection: {
    alignItems: 'center',
  },
  availableLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  availableValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  availableHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  advancedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  advancedText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  requestButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledHint: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    marginHorizontal: 16,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  advanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  advanceLeft: {
    flex: 1,
  },
  advanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  advanceDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  advanceRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusdisbursed: {
    backgroundColor: '#d1fae5',
  },
  statuspending: {
    backgroundColor: '#fef3c7',
  },
  statusapproved: {
    backgroundColor: '#dbeafe',
  },
  advanceFee: {
    fontSize: 11,
    color: '#9ca3af',
  },
})
