import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    HiOutlineDocumentText, HiArrowLeft, HiOutlineLibrary, 
    HiOutlineAcademicCap, HiOutlineBadgeCheck, HiDownload 
} from 'react-icons/hi';
import CertificateModal from '../components/CertificateModal';

export default function Certificates() {
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/certificates/my');
            setCertificates(res.data);
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
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(15,23,42,0.03) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.03, color: '#f59e0b' }}><HiOutlineBadgeCheck size={200} /></div>
                <div style={{ position: 'absolute', bottom: '15%', right: '8%', opacity: 0.03, color: '#1e293b' }}><HiOutlineLibrary size={250} /></div>
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', marginBottom: 16, boxShadow: '0 10px 25px rgba(245,158,11,0.2)' }}>
                            <HiOutlineBadgeCheck size={36} />
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#1e293b', marginBottom: 12, letterSpacing: '-0.5px' }}>
                            หอเกียรติยศประกาศนียบัตร
                        </h2>
                        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                            ความสำเร็จและรางวัลจากการเข้าอบรมในหลักสูตรต่างๆ เพื่อเป็นหลักฐานแห่งการเรียนรู้ของคุณ
                        </p>
                    </div>

                    {certificates.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiOutlineDocumentText size={40} color="#cbd5e1" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#334155', marginBottom: 8 }}>ยังไม่มีประกาศนียบัตร</h3>
                            <p style={{ color: '#94a3b8', marginBottom: 24 }}>คุณจะได้รับประกาศนียบัตรหลังจากเรียนจบและผ่านการประเมินในหลักสูตรต่างๆ</p>
                            <button onClick={() => navigate('/#courses')} style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                                หาหลักสูตรเรียนเพิ่ม
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                            {certificates.map((cert, idx) => (
                                <div key={cert.id} style={{
                                    background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: 24,
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,1)',
                                    display: 'flex', flexDirection: 'column', gap: 20,
                                    transition: 'all 0.3s ease', cursor: 'pointer',
                                    animation: `fadeSlideUp 0.5s ease-out ${idx * 0.1}s both`,
                                    position: 'relative', overflow: 'hidden'
                                }}
                                onClick={async () => {
                                    try {
                                        const res = await api.get(`/certificates/${cert.id}`);
                                        setSelectedCert(res.data);
                                    } catch { }
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; e.currentTarget.querySelector('.cert-icon-wrap').style.transform = 'scale(1.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; e.currentTarget.querySelector('.cert-icon-wrap').style.transform = 'scale(1)'; }}
                                >
                                    {/* Gold Accent */}
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'linear-gradient(135deg, transparent 50%, rgba(245,158,11,0.1) 50%)', borderTopRightRadius: 20 }} />
                                    
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                        <div className="cert-icon-wrap" style={{
                                            width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #fef3c7, #fef08a)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(245,158,11,0.15)', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        }}>
                                            <HiOutlineAcademicCap size={32} color="#d97706" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'inline-block', padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 50, fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>
                                                CERTIFICATE
                                            </div>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', lineHeight: 1.4, marginBottom: 8 }}>{cert.courseName}</h3>
                                            <p style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <HiOutlineDocumentText size={16} /> ออกเมื่อ: {formatDate(cert.issuedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>คลิกเพื่อดูรายละเอียด</span>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                                            <HiDownload size={16} />
                                        </div>
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

            {/* Modal */}
            {selectedCert && (
                <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
            )}
        </div>
    );
}
