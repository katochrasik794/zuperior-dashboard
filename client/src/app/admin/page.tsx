"use client";

import AdminLayout from "@/layouts/admin-layout";
import {
  Users,
  Mail,
  Shield,
  Server,
  TrendingUp,
  TrendingDown,
  Eye,
  Filter,
  ChevronLeft,
} from "lucide-react";

export default function AdminDashboard() {
  // Statistics Cards Data
  const statsCards = [
    {
      title: "Total Users",
      value: "6",
      icon: Users,
      color: "bg-purple-500",
      subtitle: "Active: 6 (100%)",
      progress: 100,
      progressColor: "bg-blue-500",
    },
    {
      title: "Email Unverified",
      value: "2",
      icon: Mail,
      color: "bg-red-500",
      subtitle: "Of total users (33%)",
      progress: 33,
      progressColor: "bg-red-500",
    },
    {
      title: "KYC Pending",
      value: "3",
      icon: Shield,
      color: "bg-purple-500",
      subtitle: "Pending vs users (50%)",
      progress: 50,
      progressColor: "bg-purple-500",
    },
    {
      title: "Total MT5 Accounts",
      value: "1",
      icon: Server,
      color: "bg-indigo-500",
      subtitle: "Accounts per user: 0.17",
      progress: 17,
      progressColor: "bg-indigo-500",
    },
  ];

  // Financial Overview Data
  const financialData = [
    {
      title: "Deposits",
      total: "$0.00 USD",
      totalLabel: "Total Deposited",
      pending: "0",
      pendingLabel: "Pending Deposits",
      rejected: "0",
      rejectedLabel: "Rejected Deposits",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      stats: [
        { label: "MTD", value: "$0.00" },
        { label: "Today", value: "$0.00 (vs 7-day avg $0.00)" },
      ],
    },
    {
      title: "Withdrawals",
      total: "$0.00 USD",
      totalLabel: "Total Withdrawn",
      pending: "0",
      pendingLabel: "Pending Withdrawals",
      rejected: "0",
      rejectedLabel: "Rejected Withdrawals",
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
      stats: [
        { label: "MTD", value: "$0.00" },
        { label: "Today", value: "$0.00 (vs 7-day avg $0.00)" },
      ],
    },
  ];

  // Recent Activity Data
  const recentActivity = [
    {
      title: "Recent Deposits",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      content: "No deposits yet.",
    },
    {
      title: "Recent Withdrawals",
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      content: "No withdrawals yet.",
    },
    {
      title: "Recent Accounts Opened",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      content: "test@gmail.com",
      subContent: "05 Oct, 11:15 PM",
      showViewAll: true,
    },
  ];

  // All Activity Table Data
  const activityData = [
    {
      time: "05 Oct 2024, 11:15 PM",
      type: "Account",
      user: "test@gmail.com",
      mts: "100318",
      amount: "-",
      status: "Opened",
      ref: "-",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="text-sm text-gray-500">Realtime overview</div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${card.progressColor}`}
                    style={{ width: `${card.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {financialData.map((financial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{financial.title}</h3>
                <div className={`w-10 h-10 ${financial.bgColor} ${financial.iconBg} rounded-lg flex items-center justify-center`}>
                  <financial.icon className={`h-5 w-5 ${financial.color}`} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">{financial.totalLabel}</p>
                  <p className="text-2xl font-bold text-gray-900">{financial.total}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{financial.pendingLabel}</p>
                    <p className="text-lg font-semibold text-gray-900">{financial.pending}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{financial.rejectedLabel}</p>
                    <p className="text-lg font-semibold text-gray-900">{financial.rejected}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {financial.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">{stat.label}</span>
                      <span className="text-sm font-medium text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentActivity.map((activity, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 ${activity.bgColor} rounded-lg flex items-center justify-center`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                </div>
                {activity.showViewAll && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">{activity.content}</p>
                {activity.subContent && (
                  <p className="text-sm text-gray-500">{activity.subContent}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* All Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Activity</h2>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Type</span>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                  <option>All</option>
                  <option>Account</option>
                  <option>Deposit</option>
                  <option>Withdrawal</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                  <option>All</option>
                  <option>Opened</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">From</span>
                <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">To</span>
                <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="email / txn / user"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-48"
                />
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MTS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ref
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityData.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.mts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.ref}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> of <span className="font-medium">1</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1">
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1">
                <span>Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}