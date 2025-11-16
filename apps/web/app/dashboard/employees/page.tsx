'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employerApi } from '@/lib/api'

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeNumber: '',
    phoneNumber: '',
    mpesaNumber: '',
    monthlySalary: '',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: employerApi.getEmployees,
  })

  const addEmployeeMutation = useMutation({
    mutationFn: (employeeData: typeof formData) =>
      employerApi.addEmployee({
        ...employeeData,
        monthlySalary: parseFloat(employeeData.monthlySalary),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setIsAddingEmployee(false)
      setFormData({
        firstName: '',
        lastName: '',
        employeeNumber: '',
        phoneNumber: '',
        mpesaNumber: '',
        monthlySalary: '',
      })
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addEmployeeMutation.mutate(formData)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">
            Manage your team members and their salary advance access
          </p>
        </div>
        <button
          onClick={() => setIsAddingEmployee(true)}
          className="btn btn-primary"
        >
          + Add Employee
        </button>
      </div>

      {/* Add Employee Modal */}
      {isAddingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Employee
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    name="firstName"
                    className="input"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    name="lastName"
                    className="input"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Employee Number</label>
                <input
                  name="employeeNumber"
                  className="input"
                  value={formData.employeeNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  className="input"
                  placeholder="0712345678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">M-Pesa Number</label>
                <input
                  name="mpesaNumber"
                  type="tel"
                  className="input"
                  placeholder="0712345678"
                  value={formData.mpesaNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Monthly Salary (KES)</label>
                <input
                  name="monthlySalary"
                  type="number"
                  className="input"
                  placeholder="50000"
                  value={formData.monthlySalary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEmployee(false)}
                  className="btn btn-secondary flex-1"
                  disabled={addEmployeeMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={addEmployeeMutation.isPending}
                >
                  {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading employees...</div>
        </div>
      ) : error || !data?.success ? (
        <div className="text-center py-12">
          <div className="text-red-500">Failed to load employees</div>
        </div>
      ) : data.employees && data.employees.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.employees.map((employee: any) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <span className="text-primary-700 font-semibold">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.mpesaNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.employeeNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(employee.monthlySalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-6xl mb-4">👥</p>
          <p className="text-gray-900 font-medium mb-2">No employees yet</p>
          <p className="text-gray-600 mb-6">
            Add your first employee to get started with salary advances
          </p>
          <button
            onClick={() => setIsAddingEmployee(true)}
            className="btn btn-primary"
          >
            + Add Employee
          </button>
        </div>
      )}
    </div>
  )
}
