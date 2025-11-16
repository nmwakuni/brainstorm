'use client'

import { useQuery } from '@tanstack/react-query'
import { employerApi } from '@/lib/api'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: employerApi.getDashboard,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error || !data?.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load dashboard</div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Employees',
      value: data.stats?.totalEmployees || 0,
      icon: '👥',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      name: 'Active Advances',
      value: data.stats?.activeAdvances || 0,
      icon: '💸',
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      name: 'Total Advanced',
      value: formatCurrency(data.stats?.totalAdvanced || 0),
      icon: '💰',
      color: 'bg-green-50 text-green-700',
    },
    {
      name: 'Pending Approvals',
      value: data.stats?.pendingApprovals || 0,
      icon: '⏳',
      color: 'bg-orange-50 text-orange-700',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's an overview of your salary advance program.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Advances */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Advances</h2>
          {data.recentAdvances && data.recentAdvances.length > 0 ? (
            <div className="space-y-3">
              {data.recentAdvances.slice(0, 5).map((advance: any) => (
                <div
                  key={advance.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {advance.employee?.firstName} {advance.employee?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(advance.requestedAt).toLocaleDateString('en-KE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(advance.amount))}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        advance.status === 'disbursed'
                          ? 'bg-green-100 text-green-700'
                          : advance.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {advance.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent advances</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/employees"
              className="block p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">👤</span>
                <div>
                  <p className="font-medium text-gray-900">Add Employee</p>
                  <p className="text-sm text-gray-600">Onboard new team members</p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/advances"
              className="block p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Review Advances</p>
                  <p className="text-sm text-gray-600">
                    {data.stats?.pendingApprovals || 0} pending approval
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/payroll"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">💰</span>
                <div>
                  <p className="font-medium text-gray-900">Process Payroll</p>
                  <p className="text-sm text-gray-600">Manage salary deductions</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
