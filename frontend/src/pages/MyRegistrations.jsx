// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าดูประวัติการลงทะเบียนของฉัน
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiArrowLeft } from 'react-icons/hi';
import CourseDetailModal from '../components/CourseDetailModal';
import RegistrantsModal from '../components/RegistrantsModal';
import EvaluationModal from '../components/EvaluationModal';

// คอมโพเนนต์หน้า "การลงทะเบียนของฉัน" สำหรับผู้ใช้ทั่วไป
export default function MyRegistrations() {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [evalStatus, setEvalStatus] = useState({});
    const [showCourseDetail, setShowCourseDetail] = useState(null);
    const [showRegistrants, setShowRegistrants] = useState(null);
    const [showEvaluation, setShowEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    // ฟังก์ชันโหลดประวัติการลงทะเบียนของตัวเอง
    const loadData = async () => {
        try {
            const regRes = await api.get('/registrations');
            const regs = regRes.data;
            setRegistrations(regs);
            
            // Check evaluation status for approved registrations
            regs.filter(r => r.status === 'approved').forEach(reg => {
                api.get(`/evaluations/check/${reg.courseId}`).then(evalRes => {
                    setEvalStatus(prev => ({ ...prev, [reg.courseId]: evalRes.data.evaluated }));
                }).catch(() => { });
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
            {/* Header */}
            <header style={{ background: '#fff', padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 40 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => navigate('/')} style={{
                        display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                        color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                    }}>
                        <HiArrowLeft size={16} /> กลับหน้าหลัก
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 24px' }}>
                <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#333', marginBottom: 8 }}>
                    การลงทะเบียนของฉัน
                </h2>
                <p style={{ textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 40 }}>
                    ติดตามสถานะการลงทะเบียนอบรมทั้งหมดของคุณ
                </p>

                {registrations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#999', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                        <HiOutlineClipboardList size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>ยังไม่มีการลงทะเบียน</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {registrations.map(reg => (
                            <div key={reg.id} style={{
                                background: '#fff', borderRadius: 12, padding: '24px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: 16,
                            }}>
                                <div style={{ flex: 1, minWidth: 250 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>{reg.courseName}</h3>
                                    <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#64748b' }}>
                                        <span>วันที่อบรม: {formatDate(reg.courseStartDate)}</span>
                                        <span>ลงทะเบียน: {formatDate(reg.registeredAt)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                        background: reg.status === 'approved' ? '#dcfce7' : reg.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                        color: reg.status === 'approved' ? '#166534' : reg.status === 'rejected' ? '#991b1b' : '#92400e',
                                    }}>
                                        {reg.status === 'approved' ? 'อนุมัติแล้ว' : reg.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                                    </span>
                                    <button onClick={async () => {
                                        try {
                                            const res = await api.get(`/courses/${reg.courseId}`);
                                            setShowCourseDetail({ ...res.data, status: res.data.status });
                                        } catch (err) { }
                                    }} style={{
                                        background: '#fff', border: '1px solid #cbd5e1', color: '#2563eb',
                                        borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                                    }}>รายละเอียด</button>
                                    <button onClick={() => setShowRegistrants(reg)} style={{
                                        background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                                        borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                                    }}>ดูรายชื่อ</button>
                                    {reg.status === 'pending' && (
                                        <button onClick={async () => {
                                            if (!confirm('ยืนยันยกเลิกการลงทะเบียน?')) return;
                                            try {
                                                await api.delete(`/registrations/${reg.id}`);
                                                toast.success('ยกเลิกสำเร็จ');
                                                loadData();
                                            } catch (err) {
                                                toast.error('ยกเลิกไม่สำเร็จ');
                                            }
                                        }} style={{
                                            background: 'none', border: '1px solid #ef4444', color: '#ef4444',
                                            borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600
                                        }}>ยกเลิก</button>
                                    )}
                                    {reg.status === 'approved' && !evalStatus[reg.courseId] && (
                                        <button onClick={() => setShowEvaluation(reg)} style={{
                                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: 'none', color: '#fff',
                                            borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                                        }}>ทำแบบประเมิน</button>
                                    )}
                                    {reg.status === 'approved' && evalStatus[reg.courseId] && (
                                        <span style={{
                                            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                            background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0'
                                        }}>✓ ประเมินแล้ว</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            {showCourseDetail && (
                <CourseDetailModal course={showCourseDetail} onClose={() => setShowCourseDetail(null)} onRegisterSuccess={() => {}} />
            )}
            {showRegistrants && (
                <RegistrantsModal courseId={showRegistrants.courseId} courseName={showRegistrants.courseName} onClose={() => setShowRegistrants(null)} />
            )}
            {showEvaluation && (
                <EvaluationModal courseId={showEvaluation.courseId} courseName={showEvaluation.courseName} onClose={() => setShowEvaluation(null)} onSuccess={loadData} />
            )}
        </div>
    );
}
