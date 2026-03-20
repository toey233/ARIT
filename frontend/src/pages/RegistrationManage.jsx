import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX, HiOutlineSearch, HiOutlineFilter, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

const CATEGORY_COLORS = {
    'คอมพิวเตอร์': '#c0392b',
    'การพัฒนาเว็บ': '#2980b9',
    'วิเคราะห์ข้อมูล': '#8e44ad',
    'การศึกษา': '#27ae60',
    'ทั่วไป': '#2563eb',
};
const getCatColor = (cat) => CATEGORY_COLORS[cat] || '#2563eb';

export default function RegistrationManage() {
    const [registrations, setRegistrations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);

    useEffect(() => { loadRegs(); }, []);

    const loadRegs = () => {
        api.get('/registrations').then(res => { setRegistrations(res.data); setLoading(false); });
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/registrations/${id}/status`, { status });
            toast.success(status === 'approved' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ');
            loadRegs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        }
    };

    const filtered = registrations
        .filter(r => filter === 'all' || r.status === filter)
        .filter(r => !courseFilter || r.courseName === courseFilter)
        .filter(r => !search || r.userName?.toLowerCase().includes(search.toLowerCase()) || r.courseName?.toLowerCase().includes(search.toLowerCase()));

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    const getStatusBadge = (s) => {
        switch (s) {
            case 'approved': return <span className="badge-success">อนุมัติ</span>;
            case 'rejected': return <span className="badge-danger">ปฏิเสธ</span>;
            default: return <span className="badge-warning">รออนุมัติ</span>;
        }
    };

    // Get unique course names for dropdown
    const courseNames = [...new Set(registrations.map(r => r.courseName).filter(Boolean))];

    const pendingInFiltered = filtered.filter(r => r.status === 'pending');

    const bulkUpdateStatus = async (status) => {
        const label = status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
        setConfirmModal({
            status,
            label,
            count: pendingInFiltered.length,
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    let successCount = 0;
                    for (const reg of pendingInFiltered) {
                        await api.put(`/registrations/${reg.id}/status`, { status });
                        successCount++;
                    }
                    toast.success(`${label}สำเร็จ ${successCount} รายการ`);
                    loadRegs();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
                    loadRegs();
                }
            },
        });
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="section-title">จัดการลงทะเบียน</h1>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:bg-surface-700'}`}>
                            {f === 'all' ? 'ทั้งหมด' : f === 'pending' ? 'รออนุมัติ' : f === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                            <span className="ml-1 text-xs opacity-70">({f === 'all' ? registrations.length : registrations.filter(r => r.status === f).length})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Course Filter */}
            <div className="glass-card p-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่อผู้สมัคร / หลักสูตร..."
                        className="input-field"
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <div style={{ minWidth: 220, position: 'relative' }}>
                    <HiOutlineFilter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <select
                        value={courseFilter}
                        onChange={e => setCourseFilter(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: 36, appearance: 'auto' }}
                    >
                        <option value="">ทุกหลักสูตร</option>
                        {courseNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                {pendingInFiltered.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => bulkUpdateStatus('approved')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all"
                        >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            อนุมัติทั้งหมด ({pendingInFiltered.length})
                        </button>
                        <button onClick={() => bulkUpdateStatus('rejected')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all"
                        >
                            <HiOutlineXCircle className="w-4 h-4" />
                            ปฏิเสธทั้งหมด ({pendingInFiltered.length})
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-surface-700">
                            <th className="text-left py-3 px-4 text-surface-400 font-medium">ผู้สมัคร</th>
                            <th className="text-left py-3 px-4 text-surface-400 font-medium hidden md:table-cell">รหัส นศ.</th>
                            <th className="text-left py-3 px-4 text-surface-400 font-medium">หลักสูตร</th>
                            <th className="text-left py-3 px-4 text-surface-400 font-medium hidden md:table-cell">วันที่สมัคร</th>
                            <th className="text-center py-3 px-4 text-surface-400 font-medium">สถานะ</th>
                            <th className="text-center py-3 px-4 text-surface-400 font-medium">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(reg => {
                            const catColor = getCatColor(reg.courseCategory);
                            return (
                                <tr key={reg.id} className="border-b border-surface-800 hover:bg-surface-800/30">
                                    <td className="py-3 px-4 text-white">{reg.userName}</td>
                                    <td className="py-3 px-4 text-surface-400 hidden md:table-cell">{reg.userStudentId || '-'}</td>
                                    <td className="py-3 px-4">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 4, height: 24, borderRadius: 4, background: catColor, flexShrink: 0 }} />
                                            <span style={{ fontWeight: 600, color: catColor }}>{reg.courseName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-surface-400 hidden md:table-cell">{formatDate(reg.registeredAt)}</td>
                                    <td className="py-3 px-4 text-center">{getStatusBadge(reg.status)}</td>
                                    <td className="py-3 px-4 text-center">
                                        {reg.status === 'pending' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => updateStatus(reg.id, 'approved')} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="อนุมัติ">
                                                    <HiOutlineCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => updateStatus(reg.id, 'rejected')} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="ปฏิเสธ">
                                                    <HiOutlineX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && <div className="text-center py-12 text-surface-500">ไม่มีข้อมูลการลงทะเบียน</div>}

            {/* ===== Confirm Modal ===== */}
            {confirmModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(8px)',
                    animation: 'confirmFadeIn 0.2s ease',
                }} onClick={() => setConfirmModal(null)}>
                    <div style={{
                        position: 'relative', overflow: 'hidden',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: 24, textAlign: 'center',
                        maxWidth: 420, width: '90%',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                        animation: 'confirmPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            height: 4,
                            background: confirmModal.status === 'approved'
                                ? 'linear-gradient(90deg, #22c55e, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                        }} />
                        <div style={{ padding: '36px 32px 32px' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                background: confirmModal.status === 'approved'
                                    ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))'
                                    : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.1))',
                                border: confirmModal.status === 'approved'
                                    ? '2px solid rgba(34,197,94,0.3)'
                                    : '2px solid rgba(239,68,68,0.3)',
                                animation: 'confirmIconPop 0.5s ease 0.15s both',
                            }}>
                                {confirmModal.status === 'approved'
                                    ? <HiOutlineCheckCircle size={36} color="#22c55e" />
                                    : <HiOutlineXCircle size={36} color="#ef4444" />
                                }
                            </div>
                            <h3 style={{
                                fontSize: 20, fontWeight: 700, marginBottom: 8,
                                color: confirmModal.status === 'approved' ? '#4ade80' : '#f87171',
                            }}>
                                {confirmModal.status === 'approved' ? 'ยืนยันอนุมัติทั้งหมด' : 'ยืนยันปฏิเสธทั้งหมด'}
                            </h3>
                            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6 }}>
                                ต้องการ{confirmModal.label}ทั้งหมด
                            </p>
                            <div style={{
                                display: 'inline-block',
                                padding: '6px 20px', borderRadius: 50,
                                fontSize: 22, fontWeight: 800,
                                color: confirmModal.status === 'approved' ? '#4ade80' : '#f87171',
                                background: confirmModal.status === 'approved'
                                    ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                border: confirmModal.status === 'approved'
                                    ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                                marginBottom: 24,
                            }}>
                                {confirmModal.count} รายการ
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    style={{
                                        padding: '12px 28px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                                        fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#94a3b8'; }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    style={{
                                        padding: '12px 28px', borderRadius: 14, border: 'none',
                                        background: confirmModal.status === 'approved'
                                            ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                            : 'linear-gradient(135deg, #ef4444, #f97316)',
                                        color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                        boxShadow: confirmModal.status === 'approved'
                                            ? '0 6px 24px rgba(34,197,94,0.35)'
                                            : '0 6px 24px rgba(239,68,68,0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                                >
                                    {confirmModal.status === 'approved' ? '✓ ยืนยันอนุมัติ' : '✕ ยืนยันปฏิเสธ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes confirmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirmPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.03); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes confirmIconPop {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
