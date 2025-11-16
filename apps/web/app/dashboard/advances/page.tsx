'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employerApi } from '@/lib/api'

type StatusFilter = 'all' | 'pending' | 'approved' | 'disbursed' | 'cancelled'

export default function AdvancesPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['advances', statusFilter],
    queryFn: () =>
      employerApi.getAdvances(statusFilter === 'all' ? undefined : statusFilter),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      employerApi.updateAdvanceStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
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
      disbursed: 'bg-green-100 text-green-800',
      approved: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleApprove = (id: string) => {
    if (confirm('Approve this salary advance request?')) {
      updateStatusMutation.mutate({ id, status: 'approved' })
    }
  }

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection (optional):')
    if (reason !== null) {
      updateStatusMutation.mutate({ id, status: 'cancelled', reason })
    }
  }

  const filters: { value: StatusFilter; label: string; count?: number }[] = [
    { value: 'all', label: 'All Advances' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'disbursed', label: 'Disbursed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advance Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and manage employee salary advance requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === filter.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Advances List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading advances...</div>
        </div>
      ) : error || !data?.success ? (
        <div className="text-center py-12">
          <div className="text-red-500">Failed to load advances</div>
        </div>
      ) : data.advances && data.advances.length > 0 ? (
        <div className="space-y-4">
          {data.advances.map((advance: any) => (
            <div key={advance.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {advance.employee?.firstName} {advance.employee?.lastName}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(advance.status)}`}>
                      {advance.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Advance Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(advance.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fee (4%)</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(advance.fee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Deduction</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(advance.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Employee #:</span>{' '}
                      {advance.employee?.employeeNumber}
                    </div>
                    <div>
                      <span className="font-medium">Requested:</span>{' '}
                      {formatDate(advance.requestedAt)}
                    </div>
                    {advance.disbursedAt && (
                      <div>
                        <span className="font-medium">Disbursed:</span>{' '}
                        {formatDate(advance.disbursedAt)}
                      </div>
                    )}
                  </div>

                  {advance.mpesaTransactionId && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">
                        M-Pesa ID:{' '}
                        <span className="font-mono font-medium text-gray-900">
                          {advance.mpesaTransactionId}
                        </span>
                      </span>
                    </div>
                  )}

                  {advance.failureReason && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-900">
                        <span className="font-medium">Failure reason:</span>{' '}
                        {advance.failureReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {advance.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(advance.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      disabled={updateStatusMutation.isPending}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(advance.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      disabled={updateStatusMutation.isPending}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-6xl mb-4">💸</p>
          <p className="text-gray-900 font-medium mb-2">No advance requests</p>
          <p className="text-gray-600">
            {statusFilter === 'all'
              ? 'No advance requests have been made yet'
              : `No ${statusFilter} advances found`}
          </p>
        </div>
      )}
    </div>
  )
}
