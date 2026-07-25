// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าจัดการการลงทะเบียนของแอดมิน
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX, HiOutlineSearch, HiOutlineFilter, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineDownload } from 'react-icons/hi';
import ExcelJS from 'exceljs';

const CATEGORY_COLORS = {
    'คอมพิวเตอร์': '#c0392b',
    'การพัฒนาเว็บ': '#2980b9',
    'วิเคราะห์ข้อมูล': '#8e44ad',
    'การศึกษา': '#27ae60',
    'ทั่วไป': '#2563eb',
};
const getCatColor = (cat) => CATEGORY_COLORS[cat] || '#2563eb';

// คอมโพเนนต์สำหรับแอดมินใช้ตรวจสอบ อนุมัติ หรือปฏิเสธการลงทะเบียน
export default function RegistrationManage() {
    const [registrations, setRegistrations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => { loadRegs(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, search, courseFilter]);

    // ฟังก์ชันโหลดข้อมูลผู้ลงทะเบียนทั้งหมดจากฐานข้อมูล
    const loadRegs = () => {
        api.get('/registrations').then(res => { setRegistrations(res.data); setLoading(false); });
    };

    // ฟังก์ชันสำหรับอนุมัติหรือปฏิเสธผู้ลงทะเบียน (รายบุคคล)
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

    // ฟังก์ชันสำหรับอนุมัติหรือปฏิเสธผู้ลงทะเบียนทีละหลายๆ คนพร้อมกัน
    const bulkUpdateStatus = async (status) => {
        const label = status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
        setConfirmModal({
            type: 'bulk',
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

    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('รายชื่อผู้ลงทะเบียน');
            
            sheet.columns = [
                { header: 'ลำดับ', key: 'index', width: 8 },
                { header: 'ชื่อ-สกุล', key: 'name', width: 25 },
                { header: 'รหัสนักศึกษา/พนักงาน', key: 'studentId', width: 22 },
                { header: 'หลักสูตร', key: 'course', width: 40 },
                { header: 'สถานะ', key: 'status', width: 15 },
                { header: 'ลงชื่อ (เช้า)', key: 'signMorning', width: 20 },
                { header: 'ลงชื่อ (บ่าย)', key: 'signAfternoon', width: 20 }
            ];

            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };

            filtered.forEach((reg, index) => {
                const statusText = reg.status === 'approved' ? 'อนุมัติแล้ว' : reg.status === 'pending' ? 'รอตรวจสอบ' : 'ปฏิเสธ';
                sheet.addRow({
                    index: index + 1,
                    name: reg.userName,
                    studentId: reg.userStudentId || '-',
                    course: reg.courseName,
                    status: statusText,
                    signMorning: '',
                    signAfternoon: ''
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `รายชื่อลงทะเบียน_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('ดาวน์โหลดไฟล์ Excel สำเร็จ');
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('ไม่สามารถส่งออกไฟล์ Excel ได้');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="section-title">จัดการลงทะเบียน</h1>
                    <p className="text-sm text-surface-600 font-medium">จัดการสถานะการเข้าร่วมอบรมของผู้สมัคร</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-surface-200 text-surface-700 hover:bg-surface-50 hover:text-primary-600 transition-all shadow-sm">
                        <HiOutlineDownload className="w-5 h-5" />
                        ดาวน์โหลดรายชื่อ (Excel)
                    </button>
                    <span className="text-sm text-surface-600 font-semibold bg-surface-100 px-3 py-1.5 rounded-lg">ทั้งหมด {filtered.length} รายการ</span>
                </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
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
                <div style={{ flex: '1 1 200px', minWidth: 200, position: 'relative' }}>
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
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: '1 1 100%' }}>
                        <button onClick={() => bulkUpdateStatus('approved')}
                            className="flex-1 justify-center flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all"
                        >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            อนุมัติทั้งหมด ({pendingInFiltered.length})
                        </button>
                        <button onClick={() => bulkUpdateStatus('rejected')}
                            className="flex-1 justify-center flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all"
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
                        <tr className="border-b border-surface-300">
                            <th className="text-left py-3 px-4 text-surface-700 font-bold">ผู้สมัคร</th>
                            <th className="text-left py-3 px-4 text-surface-700 font-bold hidden md:table-cell">รหัส นศ.</th>
                            <th className="text-left py-3 px-4 text-surface-700 font-bold">หลักสูตร</th>
                            <th className="text-left py-3 px-4 text-surface-700 font-bold hidden md:table-cell">วันที่สมัคร</th>
                            <th className="text-center py-3 px-4 text-surface-700 font-bold">สถานะ</th>
                            <th className="text-center py-3 px-4 text-surface-700 font-bold">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(reg => {
                            const catColor = getCatColor(reg.courseCategory);
                            return (
                                <tr key={reg.id} className="border-b border-surface-200 hover:bg-surface-50">
                                    <td className="py-3 px-4 text-surface-900 font-semibold">{reg.userName}</td>
                                    <td className="py-3 px-4 text-surface-700 font-medium hidden md:table-cell">{reg.userStudentId || '-'}</td>
                                    <td className="py-3 px-4">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 4, height: 24, borderRadius: 4, background: catColor, flexShrink: 0 }} />
                                            <span style={{ fontWeight: 600, color: catColor }}>{reg.courseName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-surface-700 font-medium hidden md:table-cell">{formatDate(reg.registeredAt)}</td>
                                    <td className="py-3 px-4 text-center">{getStatusBadge(reg.status)}</td>
                                    <td className="py-3 px-4 text-center">
                                        {reg.status === 'pending' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => updateStatus(reg.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="อนุมัติ">
                                                    <HiOutlineCheck className="w-4 h-4" /> อนุมัติ
                                                </button>
                                                <button onClick={() => updateStatus(reg.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="ปฏิเสธ">
                                                    <HiOutlineX className="w-4 h-4" /> ปฏิเสธ
                                                </button>
                                            </div>
                                        )}
                                        {reg.status === 'approved' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => {
                                                    setConfirmModal({
                                                        type: 'single',
                                                        status: 'rejected',
                                                        label: 'ยกเลิกสิทธิ์',
                                                        userName: reg.userName,
                                                        onConfirm: async () => {
                                                            setConfirmModal(null);
                                                            updateStatus(reg.id, 'rejected');
                                                        }
                                                    });
                                                }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="ยกเลิกสิทธิ์">
                                                    <HiOutlineX className="w-4 h-4" /> ยกเลิกสิทธิ์
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

            {Math.ceil(filtered.length / itemsPerPage) > 1 && (
                <div className="flex justify-center mt-6 gap-2 flex-wrap">
                    {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all ${
                                currentPage === page
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}

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
                                {confirmModal.type === 'bulk'
                                    ? (confirmModal.status === 'approved' ? 'ยืนยันอนุมัติทั้งหมด' : 'ยืนยันปฏิเสธทั้งหมด')
                                    : 'ยืนยันยกเลิกสิทธิ์'}
                            </h3>
                            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6 }}>
                                {confirmModal.type === 'bulk'
                                    ? `ต้องการ${confirmModal.label}ทั้งหมด`
                                    : `ต้องการ${confirmModal.label}คุณ ${confirmModal.userName} ใช่หรือไม่?`}
                            </p>
                            {confirmModal.type === 'bulk' && (
                                <div style={{
                                    display: 'inline-block',
                                    padding: '6px 20px', borderRadius: 50,
                                    fontSize: 22, fontWeight: 800,
                                    color: confirmModal.status === 'approved' ? '#4ade80' : '#f87171',
                                    background: confirmModal.status === 'approved'
                                        ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                    border: confirmModal.status === 'approved'
                                        ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                                    marginBottom: 24
                                }}>
                                    {confirmModal.count} รายการ
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: confirmModal.type === 'bulk' ? 0 : 24 }}>
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
