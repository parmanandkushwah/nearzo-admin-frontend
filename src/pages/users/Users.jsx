import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiUserX, FiUserCheck, FiMoreVertical } from 'react-icons/fi';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', status: 'active', orders: 12 },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', status: 'active', orders: 8 },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', phone: '9876543212', status: 'inactive', orders: 5 },
    { id: 4, name: 'Neha Singh', email: 'neha@example.com', phone: '9876543213', status: 'active', orders: 15 }
  ]);

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 border border-green-500/30' 
      : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-600 dark:text-red-400 border border-red-500/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer accounts</p>
      </div>

      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-4 px-2 font-semibold">Name</th>
                <th className="text-left py-4 px-2 font-semibold">Email</th>
                <th className="text-left py-4 px-2 font-semibold">Phone</th>
                <th className="text-left py-4 px-2 font-semibold">Orders</th>
                <th className="text-left py-4 px-2 font-semibold">Status</th>
                <th className="text-right py-4 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
                  <td className="py-4 px-2 font-medium">{user.name}</td>
                  <td className="py-4 px-2 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="py-4 px-2">{user.phone}</td>
                  <td className="py-4 px-2">{user.orders}</td>
                  <td className="py-4 px-2">
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                        <FiEdit size={16} />
                      </button>
                      <button className={`p-2.5 rounded-xl ${
                        user.status === 'active' 
                          ? 'text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20' 
                          : 'text-green-600 hover:bg-green-100/50 dark:hover:bg-green-900/20'
                      } transition-all`}>
                        {user.status === 'active' ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;