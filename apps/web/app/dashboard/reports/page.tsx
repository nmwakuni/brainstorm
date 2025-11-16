'use client'

import { useQuery } from '@tanstack/react-query'
import { employerApi } from '@/lib/api'

export default function ReportsPage() {
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: employerApi.getDashboard,
  })

  const { data: advancesData } = useQuery({
    queryKey: ['advances'],
    queryFn: () => employerApi.getAdvances(),
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: employerApi.getEmployees,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate metrics
  const metrics = {
    totalEmployees: employeesData?.employees?.length || 0,
    totalAdvances: advancesData?.advances?.length || 0,
    totalAdvanced: advancesData?.advances?.reduce(
      (sum: number, adv: any) => sum + parseFloat(adv.amount),
      0
    ) || 0,
    totalFees: advancesData?.advances?.reduce(
      (sum: number, adv: any) => sum + parseFloat(adv.fee),
      0
    ) || 0,
    averageAdvance: advancesData?.advances?.length
      ? (advancesData.advances.reduce(
          (sum: number, adv: any) => sum + parseFloat(adv.amount),
          0
        ) / advancesData.advances.length)
      : 0,
    disbursedCount: advancesData?.advances?.filter((a: any) => a.status === 'disbursed').length || 0,
    pendingCount: advancesData?.advances?.filter((a: any) => a.status === 'pending').length || 0,
  }

  const utilizationRate = employeesData?.employees?.length
    ? ((advancesData?.advances?.filter((a: any) => a.status !== 'cancelled').length || 0) /
        employeesData.employees.length) * 100
    : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Insights and metrics for your salary advance program
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Total Advanced</h3>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(metrics.totalAdvanced)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Across {metrics.totalAdvances} requests
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Total Fees Collected</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(metrics.totalFees)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            4% platform fee
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Average Advance</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(metrics.averageAdvance)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Per request
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Utilization Rate</h3>
          <p className="text-3xl font-bold text-purple-600">
            {utilizationRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {metrics.totalAdvances} / {metrics.totalEmployees} employees
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Disbursed</h3>
          <p className="text-3xl font-bold text-green-600">
            {metrics.disbursedCount}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Successfully completed
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Pending Approval</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {metrics.pendingCount}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Awaiting review
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h2>
          {advancesData?.advances && advancesData.advances.length > 0 ? (
            <div className="space-y-3">
              {[
                { status: 'disbursed', label: 'Disbursed', color: 'bg-green-600' },
                { status: 'pending', label: 'Pending', color: 'bg-yellow-600' },
                { status: 'approved', label: 'Approved', color: 'bg-blue-600' },
                { status: 'cancelled', label: 'Cancelled', color: 'bg-gray-600' },
              ].map(({ status, label, color }) => {
                const count = advancesData.advances.filter(
                  (a: any) => a.status === status
                ).length
                const percentage = (count / advancesData.advances.length) * 100

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No data available
            </p>
          )}
        </div>

        {/* Top Requesters */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Most Active Employees
          </h2>
          {advancesData?.advances && advancesData.advances.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(
                advancesData.advances.reduce((acc: any, adv: any) => {
                  const key = `${adv.employee?.firstName} ${adv.employee?.lastName}`
                  acc[key] = (acc[key] || 0) + 1
                  return acc
                }, {})
              )
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 5)
                .map(([name, count]: any) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <span className="text-primary-700 font-semibold text-sm">
                          {name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {count} request{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No data available
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-primary-50 border-primary-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Program Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700">
              Your salary advance program has disbursed{' '}
              <span className="font-semibold">{formatCurrency(metrics.totalAdvanced)}</span> to{' '}
              <span className="font-semibold">{metrics.totalEmployees} employees</span> across{' '}
              <span className="font-semibold">{metrics.totalAdvances} requests</span>.
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              The platform has generated{' '}
              <span className="font-semibold">{formatCurrency(metrics.totalFees)}</span> in fees.
              With a {utilizationRate.toFixed(1)}% utilization rate, employees are actively using
              the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
