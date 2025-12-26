
import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, updateUserAccountType, deleteUser, getTransactions, updateTransactionStatus } from '../services/authService';
import { UserProfile, Transaction } from '../types';
import { Lang, getT } from '../services/i18n';

interface AdminStudioProps {
  lang: Lang;
}

const AdminStudio: React.FC<AdminStudioProps> = ({ lang }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'system'>('users');
  const [userSearch, setUserSearch] = useState('');
  const t = getT(lang);
  
  const [stats, setStats] = useState({ totalUsers: 0, proUsers: 0, revenue: 0, pendingPayments: 0 });

  const loadData = () => {
    const allUsers = getUsers();
    const allTxs = getTransactions();
    setUsers(allUsers);
    setTransactions(allTxs);
    setStats({
      totalUsers: allUsers.length,
      proUsers: allUsers.filter(u => u.accountType === 'pro').length,
      revenue: allTxs.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amount, 0),
      pendingPayments: allTxs.filter(t => t.status === 'pending').length
    });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  }, [users, userSearch]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.totalUsers}</p>
          <h3 className="text-4xl font-black text-gray-900">{stats.totalUsers}</h3>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">{t.revenue}</p>
          <h3 className="text-3xl font-black">{stats.revenue.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}{lang === 'vi' ? 'đ' : '$'}</h3>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.pendingPayments}</p>
          <h3 className={`text-4xl font-black ${stats.pendingPayments > 0 ? 'text-amber-400' : 'text-white'}`}>{stats.pendingPayments}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.systemStatus}</p>
          <h3 className="text-2xl font-black text-green-600 flex items-center gap-2">ONLINE</h3>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-gray-50">
          <button onClick={() => setActiveTab('users')} className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${activeTab === 'users' ? 'text-indigo-600' : 'text-gray-400'}`}>{lang === 'vi' ? 'Khách hàng' : 'Customers'}</button>
          <button onClick={() => setActiveTab('payments')} className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${activeTab === 'payments' ? 'text-indigo-600' : 'text-gray-400'}`}>{lang === 'vi' ? 'Thanh toán' : 'Payments'}</button>
        </div>

        <div className="p-8">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder={t.searchUser} className="w-full max-w-md px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" />
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase text-left border-b">
                    <th className="pb-4">{t.customer}</th>
                    <th className="pb-4">{t.stats}</th>
                    <th className="pb-4">{t.role}</th>
                    <th className="pb-4">{t.lastAccess}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td className="py-4 font-bold">{u.fullName}</td>
                      <td className="py-4 text-xs text-gray-500">{u.email}</td>
                      <td className="py-4 uppercase text-[10px] font-black">{u.accountType}</td>
                      <td className="py-4 text-xs text-gray-400">{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudio;
