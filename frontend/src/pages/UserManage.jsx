import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

export default function UserManage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);

    useEffect(() => { loadUsers(); }, []);
    const loadUsers = () => { api.get('/users').then(res => { setUsers(res.data); setLoading(false); }); };

    const changeRole = async (id, role) => {
        try {
            await api.put(`/users/${id}/role`, { role });
            toast.success('เปลี่ยนสิทธิ์สำเร็จ');
            loadUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const deleteUser = async (id) => {
        if (!confirm('ลบผู้ใช้นี้?')) return;
        try { await api.delete(`/users/${id}`); toast.success('ลบสำเร็จ'); loadUsers(); }
        catch (err) { toast.error(err.response?.data?.message || 'ลบไม่สำเร็จ'); }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">Admin</span>;
            case 'staff': return <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">Staff</span>;
            default: return <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">User</span>;
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="section-title">จัดการผู้ใช้</h1>
                <span className="text-sm text-surface-400">ทั้งหมด {users.length} คน</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <span className="text-sm text-surface-400">ผู้ใช้ทั้งหมด</span>
                    <span className="text-2xl font-bold text-white">{users.length}</span>
                </div>
                <div className="stat-card">
                    <span className="text-sm text-surface-400">นักศึกษา/ผู้ใช้</span>
                    <span className="text-2xl font-bold text-emerald-400">{users.filter(u => u.role === 'user').length}</span>
                </div>
                <div className="stat-card">
                    <span className="text-sm text-surface-400">เจ้าหน้าที่</span>
                    <span className="text-2xl font-bold text-amber-400">{users.filter(u => u.role === 'staff').length}</span>
                </div>
                <div className="stat-card">
                    <span className="text-sm text-surface-400">ผู้ดูแลระบบ</span>
                    <span className="text-2xl font-bold text-red-400">{users.filter(u => u.role === 'admin').length}</span>
                </div>
            </div>

            <div className="overflow-x-auto glass-card p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-surface-700">
                            <th className="text-left py-4 px-6 text-surface-400 font-medium">ชื่อ-สกุล</th>
                            <th className="text-left py-4 px-6 text-surface-400 font-medium hidden md:table-cell">อีเมล</th>
                            <th className="text-left py-4 px-6 text-surface-400 font-medium hidden lg:table-cell">หน่วยงาน</th>
                            <th className="text-center py-4 px-6 text-surface-400 font-medium">สิทธิ์</th>
                            <th className="text-center py-4 px-6 text-surface-400 font-medium hidden md:table-cell">สมัครเมื่อ</th>
                            <th className="text-center py-4 px-6 text-surface-400 font-medium">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
                                <td className="py-3 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                                            {user.firstName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-surface-500 md:hidden">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-surface-400 hidden md:table-cell">{user.email}</td>
                                <td className="py-3 px-6 text-surface-400 hidden lg:table-cell">{user.department || '-'}</td>
                                <td className="py-3 px-6 text-center">
                                    <select value={user.role} onChange={e => changeRole(user.id, e.target.value)}
                                        className="bg-surface-800 border border-surface-600 rounded-lg px-2 py-1 text-xs text-surface-300 focus:outline-none focus:border-primary-500">
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 px-6 text-surface-500 text-xs text-center hidden md:table-cell">{formatDate(user.createdAt)}</td>
                                <td className="py-3 px-6 text-center">
                                    <button onClick={() => deleteUser(user.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
