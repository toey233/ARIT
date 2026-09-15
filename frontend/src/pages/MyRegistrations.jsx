import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    HiOutlineClipboardList, HiArrowLeft, HiOutlineLibrary, 
    HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineClock,
    HiOutlineLocationMarker, HiCheckCircle
} from 'react-icons/hi';
import CourseDetailModal from '../components/CourseDetailModal';
import RegistrantsModal from '../components/RegistrantsModal';
import EvaluationModal from '../components/EvaluationModal';

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

    const loadData = async () => {
        try {
            const regRes = await api.get('/registrations');
            const regs = regRes.data;
            setRegistrations(regs);
            
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
                <div style={{ width: 50, height: 50, border: '4px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', position: 'relative', overflow: 'hidden', fontFamily: "'Noto Sans Thai', sans-serif" }}>
            {/* Library Theme Background Elements */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(15,23,42,0.03) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', top: '20%', right: '10%', opacity: 0.03, color: '#1e293b' }}><HiOutlineLibrary size={250} /></div>
                <div style={{ position: 'absolute', bottom: '15%', left: '8%', opacity: 0.03, color: '#2563eb' }}><HiOutlineBookOpen size={180} /></div>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(15,23,42,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Header */}
                <header style={{ 
                    background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', 
                    padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 40 
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                        <button onClick={() => navigate('/#courses')} style={{
                            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                            color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.color = '#2563eb'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                            <HiArrowLeft size={18} /> กลับหน้าหลัก
                        </button>
                    </div>
                </header>

                <main style={{ maxWidth: 1000, margin: '40px auto 60px', padding: '0 24px' }}>
                    {/* Page Title Section */}
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff', marginBottom: 16, boxShadow: '0 10px 25px rgba(30,41,59,0.2)' }}>
                            <HiOutlineBookOpen size={32} />
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#1e293b', marginBottom: 12, letterSpacing: '-0.5px' }}>
                            คลังการลงทะเบียนของฉัน
                        </h2>
                        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                            รวบรวมประวัติการลงทะเบียนและหลักสูตรที่คุณได้เข้าร่วม เพื่อพัฒนาศักยภาพของคุณอย่างต่อเนื่อง
                        </p>
                    </div>

                    {registrations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiOutlineClipboardList size={40} color="#cbd5e1" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#334155', marginBottom: 8 }}>ยังไม่มีประวัติการลงทะเบียน</h3>
                            <p style={{ color: '#94a3b8', marginBottom: 24 }}>คุณยังไม่ได้ลงทะเบียนในหลักสูตรใดๆ กลับไปที่หน้าหลักเพื่อค้นหาหลักสูตรที่น่าสนใจ</p>
                            <button onClick={() => navigate('/#courses')} style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                                เรียกดูหลักสูตร
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 20 }}>
                            {registrations.map((reg, idx) => (
                                <div key={reg.id} style={{
                                    background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: 24,
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
                                    transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                                    animation: `fadeSlideUp 0.5s ease-out ${idx * 0.1}s both`
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}
                                >
                                    {/* Left Accent Line */}
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: reg.status === 'approved' ? '#10b981' : reg.status === 'rejected' ? '#ef4444' : '#f59e0b' }} />
                                    
                                    <div style={{ flex: '1 1 300px', paddingLeft: 8 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 12, lineHeight: 1.4 }}>{reg.courseName}</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', fontSize: 13, color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlineClock size={16} /> อบรม: {formatDate(reg.courseStartDate)}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlineClipboardList size={16} /> ลงทะเบียน: {formatDate(reg.registeredAt)}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingLeft: 8 }}>
                                        <span style={{
                                            padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
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
                                            background: '#fff', border: '1px solid #2563eb', color: '#2563eb',
                                            borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }} onMouseEnter={e => e.target.style.background = 'rgba(37,99,235,0.05)'} onMouseLeave={e => e.target.style.background = '#fff'}>
                                            รายละเอียด
                                        </button>
                                        <button onClick={() => setShowRegistrants(reg)} style={{
                                            background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                                            borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                                        }} onMouseEnter={e => e.target.style.background = '#e2e8f0'} onMouseLeave={e => e.target.style.background = '#f1f5f9'}>
                                            ดูรายชื่อ
                                        </button>
                                        
                                        {reg.status !== 'approved' && reg.status !== 'rejected' && (
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
                                                background: '#fff', border: '1px solid #ef4444', color: '#ef4444',
                                                borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                                            }} onMouseEnter={e => e.target.style.background = '#fef2f2'} onMouseLeave={e => e.target.style.background = '#fff'}>
                                                ยกเลิก
                                            </button>
                                        )}
                                        
                                        {reg.status === 'approved' && !evalStatus[reg.courseId] && (
                                            <button onClick={() => setShowEvaluation(reg)} style={{
                                                background: 'linear-gradient(135deg, #1e293b, #334155)', border: 'none', color: '#fff',
                                                borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                                                boxShadow: '0 4px 10px rgba(30,41,59,0.3)', transition: 'all 0.2s'
                                            }} onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                                                ทำแบบประเมิน
                                            </button>
                                        )}
                                        {reg.status === 'approved' && evalStatus[reg.courseId] && (
                                            <span style={{
                                                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                                background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0',
                                                display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <HiCheckCircle size={16} /> ประเมินแล้ว
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

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
