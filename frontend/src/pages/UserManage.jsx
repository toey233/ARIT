// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าจัดการผู้ใช้งาน
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

// คอมโพเนนต์หลักสำหรับจัดการข้อมูลผู้ใช้งาน (ค้นหา, เปลี่ยนสิทธิ์, ลบผู้ใช้)
export default function UserManage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // โหลดข้อมูลผู้ใช้งานทั้งหมดเมื่อเปิดหน้านี้ขึ้นมาครั้งแรก
    useEffect(() => { loadUsers(); }, []);
    const loadUsers = () => { api.get('/users').then(res => { setUsers(res.data); setLoading(false); }); };

    // ฟังก์ชันสำหรับเปลี่ยนสิทธิ์ผู้ใช้งาน (เช่น จาก User เป็น Admin)
    const changeRole = async (id, role) => {
        try {
            await api.put(`/users/${id}/role`, { role });
            toast.success('เปลี่ยนสิทธิ์สำเร็จ');
            loadUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    // ฟังก์ชันสำหรับลบผู้ใช้งานออกจากระบบ
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
                <span className="text-sm text-surface-600 font-semibold">ทั้งหมด {users.length} คน</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                    className={`stat-card cursor-pointer transition-all ${filterRole === 'all' ? 'ring-2 ring-primary-500 shadow-md bg-primary-50/50' : 'hover:bg-surface-50'}`}
                    onClick={() => { setFilterRole('all'); setCurrentPage(1); }}
                >
                    <span className="text-sm font-semibold text-surface-700">ผู้ใช้ทั้งหมด</span>
                    <span className="text-2xl font-bold text-surface-900">{users.length}</span>
                </div>
                <div 
                    className={`stat-card cursor-pointer transition-all ${filterRole === 'user' ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/50' : 'hover:bg-surface-50'}`}
                    onClick={() => { setFilterRole('user'); setCurrentPage(1); }}
                >
                    <span className="text-sm font-semibold text-surface-700">นักศึกษา/ผู้ใช้</span>
                    <span className="text-2xl font-bold text-emerald-600">{users.filter(u => u.role === 'user').length}</span>
                </div>
                <div 
                    className={`stat-card cursor-pointer transition-all ${filterRole === 'staff' ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/50' : 'hover:bg-surface-50'}`}
                    onClick={() => { setFilterRole('staff'); setCurrentPage(1); }}
                >
                    <span className="text-sm font-semibold text-surface-700">เจ้าหน้าที่</span>
                    <span className="text-2xl font-bold text-amber-500">{users.filter(u => u.role === 'staff').length}</span>
                </div>
                <div 
                    className={`stat-card cursor-pointer transition-all ${filterRole === 'admin' ? 'ring-2 ring-red-500 shadow-md bg-red-50/50' : 'hover:bg-surface-50'}`}
                    onClick={() => { setFilterRole('admin'); setCurrentPage(1); }}
                >
                    <span className="text-sm font-semibold text-surface-700">ผู้ดูแลระบบ</span>
                    <span className="text-2xl font-bold text-red-500">{users.filter(u => u.role === 'admin').length}</span>
                </div>
            </div>

            <div className="overflow-x-auto glass-card p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-surface-300">
                            <th className="text-left py-4 px-6 text-surface-700 font-bold">ชื่อ-สกุล</th>
                            <th className="text-left py-4 px-6 text-surface-700 font-bold hidden md:table-cell">อีเมล</th>
                            <th className="text-left py-4 px-6 text-surface-700 font-bold hidden lg:table-cell">หน่วยงาน</th>
                            <th className="text-center py-4 px-6 text-surface-700 font-bold">สิทธิ์</th>
                            <th className="text-center py-4 px-6 text-surface-700 font-bold hidden md:table-cell">สมัครเมื่อ</th>
                            <th className="text-center py-4 px-6 text-surface-700 font-bold">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);
                            const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                            
                            if (filteredUsers.length === 0) {
                                return <tr><td colSpan="6" className="text-center py-10 text-surface-500">ไม่พบผู้ใช้งาน</td></tr>;
                            }
                            
                            return paginatedUsers.map(user => (
                                <tr key={user.id} className="border-b border-surface-200 hover:bg-surface-50 transition-colors">
                                    <td className="py-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                                                {user.firstName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-surface-900 font-semibold">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-surface-600 md:hidden">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-surface-700 font-medium hidden md:table-cell">{user.email}</td>
                                    <td className="py-3 px-6 text-surface-700 font-medium hidden lg:table-cell">{user.department || '-'}</td>
                                    <td className="py-3 px-6 text-center">
                                        <select value={user.role} onChange={e => changeRole(user.id, e.target.value)}
                                            className="bg-surface-50 border border-surface-200 rounded-lg px-2 py-1 text-xs font-semibold text-surface-800 focus:outline-none focus:border-primary-500">
                                            <option value="user">User</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-3 px-6 text-surface-700 font-medium text-xs text-center hidden md:table-cell">{formatDate(user.createdAt)}</td>
                                    <td className="py-3 px-6 text-center">
                                        <button onClick={() => deleteUser(user.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {(() => {
                const filteredLength = (filterRole === 'all' ? users : users.filter(u => u.role === filterRole)).length;
                const totalPages = Math.ceil(filteredLength / itemsPerPage);
                
                if (totalPages <= 1) return null;
                
                return (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button 
                                key={page} 
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl font-medium transition-all ${
                                    currentPage === page 
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                                    : 'bg-surface-50 text-surface-600 hover:bg-surface-200 hover:scale-105'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
}
