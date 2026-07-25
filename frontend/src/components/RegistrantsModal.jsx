import { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineUserGroup } from 'react-icons/hi';
import api from '../services/api';

export default function RegistrantsModal({ courseId, courseName, onClose }) {
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.get(`/courses/${courseId}/registrants`)
            .then(res => {
                setRegistrants(res.data);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [courseId]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '92%', maxWidth: 700, maxHeight: '85vh',
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                animation: 'modalPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex', flexDirection: 'column',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)',
                    padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.1)',
                        border: 'none', cursor: 'pointer', color: '#fff', padding: 6, borderRadius: 8,
                        transition: 'background 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <HiOutlineX size={20} />
                    </button>

                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <HiOutlineUserGroup size={24} />
                        รายชื่อผู้ลงทะเบียน
                    </h2>
                    <p style={{ fontSize: 14, color: '#93c5fd', lineHeight: 1.4 }}>
                        {courseName}
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="ค้นหารายชื่อ หรือ รหัสนักศึกษา..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1',
                                fontSize: 14, fontFamily: 'Sarabun, sans-serif'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                            กำลังโหลด...
                        </div>
                    ) : registrants.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                            ยังไม่มีผู้ลงทะเบียนที่ได้รับการอนุมัติ
                        </div>
                    ) : (
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Sarabun, sans-serif' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 14, width: '60px' }}>ลำดับ</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 14 }}>รหัสนักศึกษา</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 14 }}>ชื่อ - นามสกุล</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrants.filter(u => 
                                        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
                                    ).map((user, index) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 14 }}>{index + 1}</td>
                                            <td style={{ padding: '12px 16px', color: '#475569', fontSize: 14 }}>{user.studentId || '-'}</td>
                                            <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: 15 }}>{user.firstName} {user.lastName}</td>
                                        </tr>
                                    ))}
                                    {registrants.filter(u => 
                                        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
                                    ).length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>ไม่พบรายชื่อที่ค้นหา</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                </div>

            </div>
            <style>{`
                @keyframes modalPopIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
