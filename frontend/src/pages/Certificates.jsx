// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าดูใบประกาศนียบัตรของฉัน
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineDocumentText, HiArrowLeft } from 'react-icons/hi';
import CertificateModal from '../components/CertificateModal';

// คอมโพเนนต์สำหรับให้ผู้ใช้เข้ามาดูและดาวน์โหลดใบประกาศของตนเอง
export default function Certificates() {
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    // ฟังก์ชันโหลดรายชื่อใบประกาศนียบัตรที่ผู้ใช้ได้รับ
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
                    ประกาศนียบัตรของฉัน
                </h2>
                <p style={{ textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 40 }}>
                    ดูและดาวน์โหลดประกาศนียบัตรจากการอบรมที่ผ่านมา
                </p>

                {certificates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#999', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                        <HiOutlineDocumentText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>ยังไม่มีประกาศนียบัตร</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {certificates.map(cert => (
                            <div key={cert.id} style={{
                                background: '#fff', borderRadius: 16, padding: '24px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                                display: 'flex', flexDirection: 'column', gap: 16,
                                transition: 'transform 0.3s', cursor: 'pointer',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <HiOutlineDocumentText size={24} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>{cert.courseName}</h3>
                                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>ออกเมื่อ: {formatDate(cert.issuedAt)}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                                    <button onClick={async () => {
                                        try {
                                            const res = await api.get(`/certificates/${cert.id}`);
                                            setSelectedCert(res.data);
                                        } catch { }
                                    }} style={{
                                        width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                        background: '#f1f5f9', color: '#2563eb', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                                    >
                                        ดูประกาศนียบัตร
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedCert && (
                <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
            )}
        </div>
    );
}
