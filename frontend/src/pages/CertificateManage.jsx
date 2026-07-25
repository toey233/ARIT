// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าจัดการใบประกาศนียบัตร (แอดมิน)
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { HiOutlineDocumentText, HiOutlineCheck, HiOutlineDownload, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineDocumentDuplicate } from 'react-icons/hi';

// คอมโพเนนต์สำหรับแอดมินใช้ออกใบประกาศนียบัตรให้ผู้ใช้ที่ผ่านการอบรม
export default function CertificateManage() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState(null);
    const [resultModal, setResultModal] = useState(null);

    // โหลดข้อมูลหลักสูตรและใบประกาศทั้งหมดเมื่อเปิดหน้านี้
    useEffect(() => {
        Promise.all([api.get('/courses'), api.get('/certificates')]).then(([cRes, certRes]) => {
            setCourses(cRes.data);
            setCertificates(certRes.data);
            setLoading(false);
        }).catch(err => {
            console.error('Initial load error:', err);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            api.get('/registrations').then(res => {
                const approved = res.data.filter(r => r.courseId === selectedCourse && r.status === 'approved' && r.hasEvaluated);
                setRegistrations(approved);
            });
        }
    }, [selectedCourse]);

    // ฟังก์ชันสำหรับออกใบประกาศนียบัตรให้ผู้ใช้งานแบบรายบุคคล
    const issueCertificate = async (userId) => {
        try {
            console.log('=== Issuing Certificate ===');
            console.log('userId:', userId, 'type:', typeof userId);
            console.log('courseId:', selectedCourse, 'type:', typeof selectedCourse);
            const response = await api.post('/certificates', { userId, courseId: selectedCourse });
            console.log('Certificate issued:', response.data);
            toast.success('ออกประกาศนียบัตรสำเร็จ');
            const certRes = await api.get('/certificates');
            setCertificates(certRes.data);
        } catch (err) {
            console.error('Issue certificate error:', err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        }
    };

    const pendingRegs = registrations.filter(r => !hasCertificateCheck(r.userId));
    function hasCertificateCheck(userId) {
        return certificates.some(c => c.userId === userId && c.courseId === selectedCourse);
    }

    const issueAllCertificates = () => {
        if (pendingRegs.length === 0) return;
        setConfirmModal({
            count: pendingRegs.length,
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    let successCount = 0;
                    for (const reg of pendingRegs) {
                        await api.post('/certificates', { userId: reg.userId, courseId: selectedCourse });
                        successCount++;
                    }
                    const certRes = await api.get('/certificates');
                    setCertificates(certRes.data);
                    setResultModal({ type: 'success', message: `ออกประกาศนียบัตรสำเร็จ ${successCount} รายการ` });
                } catch (err) {
                    setResultModal({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
                    const certRes = await api.get('/certificates');
                    setCertificates(certRes.data);
                }
            },
        });
    };

    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'ARIT Training Management';
            workbook.created = new Date();

            const worksheet = workbook.addWorksheet('ประกาศนียบัตร');

            // Define columns
            worksheet.columns = [
                { header: 'ลำดับ', key: 'no', width: 8 },
                { header: 'เลขที่ประกาศนียบัตร', key: 'certificateNumber', width: 25 },
                { header: 'ชื่อ-สกุล', key: 'userName', width: 25 },
                { header: 'อีเมล', key: 'userEmail', width: 30 },
                { header: 'หลักสูตร', key: 'courseName', width: 35 },
                { header: 'วันที่ออก', key: 'issuedAt', width: 20 },
            ];

            // Style header row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F46E5' },
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 30;

            // Sort certificates by userName alphabetically (A-Z, ก-ฮ)
            const sortedCertificates = [...certificates].sort((a, b) => {
                const nameA = a.userName || '';
                const nameB = b.userName || '';
                return nameA.localeCompare(nameB, 'th');
            });

            // Add data rows
            sortedCertificates.forEach((cert, index) => {
                const row = worksheet.addRow({
                    no: index + 1,
                    certificateNumber: cert.certificateNumber,
                    userName: cert.userName,
                    userEmail: cert.userEmail || '',
                    courseName: cert.courseName,
                    issuedAt: cert.issuedAt
                        ? new Date(cert.issuedAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })
                        : '',
                });
                row.alignment = { vertical: 'middle' };
            });

            // Add borders to all cells
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            });

            // Generate file and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ประกาศนียบัตร_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('ดาวน์โหลดไฟล์ Excel สำเร็จ');
        } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
        }
    };

    const hasCertificate = (userId) => certificates.some(c => c.userId === userId && c.courseId === selectedCourse);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <h1 className="section-title">ออกประกาศนียบัตร</h1>

            <div>
                <label className="block text-sm text-surface-700 font-semibold mb-2">เลือกหลักสูตร</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field max-w-md">
                    <option value="">-- เลือกหลักสูตร --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {selectedCourse && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-lg font-bold text-surface-800">ผู้เข้าร่วมอบรม (อนุมัติแล้ว)</h2>
                        {pendingRegs.length > 0 && (
                            <button onClick={issueAllCertificates}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all"
                            >
                                <HiOutlineDocumentDuplicate className="w-4 h-4" />
                                ออกประกาศนียบัตรทั้งหมด ({pendingRegs.length})
                            </button>
                        )}
                    </div>
                    {registrations.length === 0 ? (
                        <p className="text-surface-600 font-medium text-center py-8">ไม่มีผู้เข้าร่วมที่ได้รับอนุมัติ</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-surface-300">
                                        <th className="text-left py-3 px-4 text-surface-700 font-bold">ชื่อ-สกุล</th>
                                        <th className="text-left py-3 px-4 text-surface-700 font-bold hidden md:table-cell">อีเมล</th>
                                        <th className="text-center py-3 px-4 text-surface-700 font-bold">สถานะ</th>
                                        <th className="text-center py-3 px-4 text-surface-700 font-bold">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map(reg => (
                                        <tr key={reg.id} className="border-b border-surface-200 hover:bg-surface-50 transition-colors">
                                            <td className="py-3 px-4 text-surface-900 font-semibold">{reg.userName}</td>
                                            <td className="py-3 px-4 text-surface-700 font-medium hidden md:table-cell">{reg.userEmail}</td>
                                            <td className="py-3 px-4 text-center">
                                                {hasCertificate(reg.userId) ? <span className="badge-success">ออกแล้ว</span> : <span className="badge-warning">ยังไม่ออก</span>}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {!hasCertificate(reg.userId) && (
                                                    <button onClick={() => issueCertificate(reg.userId)} className="btn-success text-xs py-1.5 px-3 flex items-center gap-1 mx-auto">
                                                        <HiOutlineDocumentText className="w-3.5 h-3.5" /> ออกประกาศนียบัตร
                                                    </button>
                                                )}
                                                {hasCertificate(reg.userId) && <HiOutlineCheck className="w-5 h-5 text-emerald-400 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* All Issued Certificates */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-surface-800">ประกาศนียบัตรที่ออกแล้วทั้งหมด ({certificates.length})</h2>
                    {certificates.length > 0 && (
                        <button
                            onClick={exportToExcel}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                        >
                            <HiOutlineDownload className="w-4 h-4" />
                            ดาวน์โหลด Excel
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-300">
                                <th className="text-left py-3 px-4 text-surface-700 font-bold">เลขที่</th>
                                <th className="text-left py-3 px-4 text-surface-700 font-bold">ชื่อ</th>
                                <th className="text-left py-3 px-4 text-surface-700 font-bold hidden md:table-cell">หลักสูตร</th>
                                <th className="text-left py-3 px-4 text-surface-700 font-bold">วันที่ออก</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map(cert => (
                                <tr key={cert.id} className="border-b border-surface-200 hover:bg-surface-50 transition-colors">
                                    <td className="py-3 px-4 text-primary-600 font-medium font-mono text-xs">{cert.certificateNumber}</td>
                                    <td className="py-3 px-4 text-surface-900 font-semibold">{cert.userName}</td>
                                    <td className="py-3 px-4 text-surface-700 font-medium hidden md:table-cell">{cert.courseName}</td>
                                    <td className="py-3 px-4 text-surface-700 font-medium">{formatDate(cert.issuedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== Confirm Modal ===== */}
            {confirmModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(8px)',
                    animation: 'cmFadeIn 0.2s ease',
                }} onClick={() => setConfirmModal(null)}>
                    <div style={{
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: 24, textAlign: 'center',
                        maxWidth: 420, width: '90%',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                        animation: 'cmPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 4, background: 'linear-gradient(90deg, #22c55e, #10b981, #34d399)' }} />
                        <div style={{ padding: '36px 32px 32px' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))',
                                border: '2px solid rgba(34,197,94,0.3)',
                                animation: 'cmIconPop 0.5s ease 0.15s both',
                            }}>
                                <HiOutlineDocumentDuplicate size={36} color="#22c55e" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#4ade80' }}>
                                ยืนยันออกประกาศนียบัตรทั้งหมด
                            </h3>
                            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6 }}>
                                ต้องการออกประกาศนียบัตรให้ทั้งหมด
                            </p>
                            <div style={{
                                display: 'inline-block',
                                padding: '6px 20px', borderRadius: 50,
                                fontSize: 22, fontWeight: 800, color: '#4ade80',
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.2)',
                                marginBottom: 24,
                            }}>
                                {confirmModal.count} รายการ
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    style={{
                                        padding: '12px 28px', borderRadius: 14,
                                        border: '1px solid rgba(255,255,255,0.1)',
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
                                        background: 'linear-gradient(135deg, #22c55e, #10b981)',
                                        color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                        boxShadow: '0 6px 24px rgba(34,197,94,0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                                >
                                    ✓ ยืนยันออกทั้งหมด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Result Modal ===== */}
            {resultModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(8px)',
                    animation: 'cmFadeIn 0.2s ease',
                }} onClick={() => setResultModal(null)}>
                    <div style={{
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: 24, textAlign: 'center',
                        maxWidth: 400, width: '90%',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                        animation: 'cmPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            height: 4,
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(90deg, #22c55e, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                        }} />
                        <div style={{ padding: '40px 32px 32px' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                                background: resultModal.type === 'success'
                                    ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))'
                                    : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.1))',
                                border: resultModal.type === 'success'
                                    ? '2px solid rgba(34,197,94,0.3)'
                                    : '2px solid rgba(239,68,68,0.3)',
                                animation: 'cmIconPop 0.5s ease 0.15s both',
                            }}>
                                {resultModal.type === 'success'
                                    ? <HiOutlineCheckCircle size={42} color="#22c55e" />
                                    : <HiOutlineXCircle size={42} color="#ef4444" />
                                }
                            </div>
                            <h3 style={{
                                fontSize: 22, fontWeight: 700, marginBottom: 10,
                                color: resultModal.type === 'success' ? '#4ade80' : '#f87171',
                            }}>
                                {resultModal.type === 'success' ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
                            </h3>
                            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 28, lineHeight: 1.6 }}>
                                {resultModal.message}
                            </p>
                            <button
                                onClick={() => setResultModal(null)}
                                style={{
                                    padding: '12px 40px', borderRadius: 14, border: 'none',
                                    background: resultModal.type === 'success'
                                        ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                        : 'linear-gradient(135deg, #ef4444, #f97316)',
                                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                    boxShadow: resultModal.type === 'success'
                                        ? '0 6px 24px rgba(34,197,94,0.35)'
                                        : '0 6px 24px rgba(239,68,68,0.35)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes cmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes cmPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.03); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes cmIconPop {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
