'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employerApi } from '@/lib/api'

export default function PayrollPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['payroll'],
    queryFn: employerApi.getPayrollHistory,
  })

  const processPayrollMutation = useMutation({
    mutationFn: employerApi.processPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      alert('Payroll processed successfully!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to process payroll')
    },
  })

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleProcessPayroll = () => {
    if (
      confirm(
        'Process payroll for this month? This will mark all outstanding advances as repaid and cannot be undone.'
      )
    ) {
      processPayrollMutation.mutate()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-2">Process monthly payroll and salary deductions</p>
        </div>
        <button
          onClick={handleProcessPayroll}
          className="btn btn-primary"
          disabled={processPayrollMutation.isPending}
        >
          {processPayrollMutation.isPending ? 'Processing...' : '💰 Process Payroll'}
        </button>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • Processing payroll will automatically deduct all outstanding salary advances
              </li>
              <li>• Each employee's advance total (amount + fee) will be calculated</li>
              <li>• Advances will be marked as "repaid" after successful processing</li>
              <li>• Process payroll at the end of each month before disbursing salaries</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payroll History */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading payroll history...</div>
        </div>
      ) : error || !data?.success ? (
        <div className="text-center py-12">
          <div className="text-red-500">Failed to load payroll history</div>
        </div>
      ) : data.payrolls && data.payrolls.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Payroll History</h2>

          {data.payrolls.map((payroll: any) => (
            <div key={payroll.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDate(payroll.processedAt)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Processed by {payroll.processedBy || 'System'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payroll.totalDeductions)}
                  </p>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                </div>
              </div>

              {/* Employee Deductions */}
              {payroll.deductions && payroll.deductions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Employee Deductions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Employee
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Advances
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Total Deduction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payroll.deductions.map((deduction: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {deduction.employeeName}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {deduction.advanceCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(deduction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-6xl mb-4">💰</p>
          <p className="text-gray-900 font-medium mb-2">No payroll history</p>
          <p className="text-gray-600 mb-6">
            Process your first payroll to start tracking deductions
          </p>
          <button
            onClick={handleProcessPayroll}
            className="btn btn-primary"
            disabled={processPayrollMutation.isPending}
          >
            💰 Process First Payroll
          </button>
        </div>
      )}
    </div>
  )
}
