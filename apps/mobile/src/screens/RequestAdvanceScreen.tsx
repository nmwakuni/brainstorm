import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi, advanceApi } from '../services/api'
import { notifyAdvanceApproved, notifyAdvanceDisbursed } from '../utils/notifications'

export default function RequestAdvanceScreen() {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: employeeApi.getDashboard,
  })

  const requestMutation = useMutation({
    mutationFn: (amount: number) => advanceApi.request(amount),
    onSuccess: async response => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['advances'] })

      // Send local notification for approval
      if (response.advance) {
        const formattedAmount = formatCurrency(response.advance.amount)

        // Notify about approval
        await notifyAdvanceApproved(formattedAmount, response.advance.id)

        // Simulate disbursement notification after 3 seconds (in real app, this would come from server)
        setTimeout(async () => {
          await notifyAdvanceDisbursed(formattedAmount, response.advance.id)
        }, 3000)
      }

      Alert.alert('Success! 🎉', response.message || 'Your advance has been approved!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    },
    onError: (error: any) => {
      Alert.alert(
        'Request Failed',
        error.response?.data?.error || 'An error occurred. Please try again.'
      )
    },
  })

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(num)
  }

  const calculateFee = (amount: number) => {
    const feePercentage = 4 // 4% default fee
    return (amount * feePercentage) / 100
  }

  const handleRequest = () => {
    const parsedAmount = parseFloat(amount)

    if (!amount || isNaN(parsedAmount)) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    if (parsedAmount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0')
      return
    }

    if (data?.earnings && parsedAmount > data.earnings.availableToWithdraw) {
      Alert.alert(
        'Error',
        `Amount exceeds available balance of ${formatCurrency(data.earnings.availableToWithdraw)}`
      )
      return
    }

    const fee = calculateFee(parsedAmount)
    const total = parsedAmount + fee

    Alert.alert(
      'Confirm Request',
      `You will receive ${formatCurrency(parsedAmount)}\nFee: ${formatCurrency(fee)}\nTotal deducted: ${formatCurrency(total)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => requestMutation.mutate(parsedAmount),
        },
      ]
    )
  }

  const suggestedAmounts = [2000, 5000, 10000]

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    )
  }

  const availableBalance = data?.earnings?.availableToWithdraw || 0
  const parsedAmount = parseFloat(amount) || 0
  const fee = calculateFee(parsedAmount)
  const total = parsedAmount + fee

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>{formatCurrency(availableBalance)}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>How much do you need?</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>KES</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            editable={!requestMutation.isPending}
          />
        </View>

        <View style={styles.suggestedAmounts}>
          {suggestedAmounts
            .filter(amt => amt <= availableBalance)
            .map(suggestedAmount => (
              <TouchableOpacity
                key={suggestedAmount}
                style={styles.suggestedButton}
                onPress={() => setAmount(suggestedAmount.toString())}
                disabled={requestMutation.isPending}
              >
                <Text style={styles.suggestedText}>{formatCurrency(suggestedAmount)}</Text>
              </TouchableOpacity>
            ))}
        </View>

        {parsedAmount > 0 && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Breakdown</Text>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Advance Amount</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(parsedAmount)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Fee (4%)</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(fee)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelBold}>You will receive</Text>
              <Text style={styles.breakdownValueBold}>{formatCurrency(parsedAmount)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelBold}>Deducted on payday</Text>
              <Text style={[styles.breakdownValueBold, styles.breakdownValueDanger]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.requestButton,
            (parsedAmount <= 0 || requestMutation.isPending) && styles.requestButtonDisabled,
          ]}
          onPress={handleRequest}
          disabled={parsedAmount <= 0 || requestMutation.isPending}
        >
          <Text style={styles.requestButtonText}>
            {requestMutation.isPending ? 'Processing...' : 'Request Advance'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Money will be sent to your M-Pesa within minutes. The total amount (advance + fee) will
            be deducted from your next salary.
          </Text>
        </View>
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
  balanceCard: {
    backgroundColor: '#10b981',
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#d1fae5',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 16,
  },
  suggestedAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  suggestedButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  suggestedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  breakdown: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#111827',
  },
  breakdownLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  breakdownValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  breakdownValueDanger: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  requestButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  requestButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
})
