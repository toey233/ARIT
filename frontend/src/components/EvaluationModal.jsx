import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineStar, HiStar, HiOutlineCheckCircle } from 'react-icons/hi';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '20px'
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 650, maxHeight: '90vh', overflow: 'hidden',
        position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column'
    },
    closeBtn: {
        position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
        cursor: 'pointer', color: '#999', padding: 4, zIndex: 10
    },
    header: {
        padding: '24px 32px 16px', borderBottom: '1px solid #f1f5f9', background: '#fff'
    },
    body: {
        padding: '24px 32px', overflowY: 'auto', flex: 1
    },
    footer: {
        padding: '16px 32px', borderTop: '1px solid #f1f5f9', background: '#fafbfc'
    }
};

const evaluationGroups = [
    {
        title: '1. ด้านเนื้อหาและเวลา',
        items: [
            { key: 'c1', label: '1.1 เนื้อหาตรงตามวัตถุประสงค์และครบถ้วน' },
            { key: 'c2', label: '1.2 การจัดลำดับเนื้อหาเข้าใจง่าย' },
            { key: 'c3', label: '1.3 ระยะเวลาอบรมมีความเหมาะสม' },
        ]
    },
    {
        title: '2. ด้านวิทยากร',
        items: [
            { key: 'i1', label: '2.1 วิทยากรมีความรู้ความเชี่ยวชาญ' },
            { key: 'i2', label: '2.2 ถ่ายทอดชัดเจนและน่าสนใจ' },
            { key: 'i3', label: '2.3 เปิดโอกาสให้ซักถามและตอบข้อสงสัย' },
        ]
    },
    {
        title: '3. ด้านสถานที่และสื่อประกอบ',
        items: [
            { key: 'f1', label: '3.1 เอกสาร/สื่อประกอบการอบรมพร้อมและดี' },
            { key: 'f2', label: '3.2 สถานที่/ระบบเทคโนโลยีมีความเหมาะสม' },
        ]
    },
    {
        title: '4. ด้านการนำไปใช้ประโยชน์',
        items: [
            { key: 'a1', label: '4.1 ได้รับความรู้และทักษะใหม่เพิ่มขึ้น' },
            { key: 'a2', label: '4.2 สามารถนำไปประยุกต์ใช้ในงานได้จริง' },
        ]
    }
];

export default function EvaluationModal({ courseId, courseName, onClose, onSuccess }) {
    const [details, setDetails] = useState({
        c1: 5, c2: 5, c3: 5,
        i1: 5, i2: 5, i3: 5,
        f1: 5, f2: 5,
        a1: 5, a2: 5
    });
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const contentRating = Math.round((details.c1 + details.c2 + details.c3) / 3);
            const instructorRating = Math.round((details.i1 + details.i2 + details.i3) / 3);
            const facilityRating = Math.round((details.f1 + details.f2) / 2);
            
            let totalSum = 0;
            let count = 0;
            Object.values(details).forEach(val => { totalSum += val; count++; });
            const rating = Math.round(totalSum / count);

            await api.post('/evaluations', { 
                courseId, 
                rating, 
                contentRating, 
                instructorRating, 
                facilityRating, 
                comment,
                details 
            });
            onSuccess?.();
            setShowSuccess(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'ส่งไม่สำเร็จ');
        } finally { setSubmitting(false); }
    };

    const RatingStars = ({ name, value }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setDetails({ ...details, [name]: n })} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', transition: 'transform 0.1s',
                }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                    {n <= value
                        ? <HiStar size={24} color="#f59e0b" />
                        : <HiOutlineStar size={24} color="#cbd5e1" />
                    }
                </button>
            ))}
            <span style={{ marginLeft: 8, fontSize: 14, color: '#3b82f6', fontWeight: 700, width: 24, textAlign: 'center' }}>
                {value}
            </span>
        </div>
    );

    if (showSuccess) {
        return (
            <div style={S.overlay} onClick={() => { setShowSuccess(false); onClose(); }}>
                <div style={{
                    background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center',
                    maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'fadeInUp 0.3s ease',
                }} onClick={e => e.stopPropagation()}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(39,174,96,0.3)',
                    }}>
                        <HiOutlineCheckCircle size={44} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#333', marginBottom: 8 }}>
                        ส่งแบบประเมินสำเร็จ!
                    </h2>
                    <p style={{ fontSize: 15, color: '#888', lineHeight: 1.6, marginBottom: 8 }}>
                        ขอบคุณสำหรับการประเมินหลักสูตร
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#2563eb', marginBottom: 16 }}>
                        "{courseName}"
                    </p>
                    <p style={{ fontSize: 14, color: '#aaa', marginBottom: 28 }}>
                        คุณสามารถรับประกาศนียบัตรได้แล้ว
                    </p>
                    <button onClick={() => { setShowSuccess(false); onClose(); }} style={{
                        padding: '12px 40px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontSize: 15, fontWeight: 700, color: '#fff',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        boxShadow: '0 4px 16px rgba(139,105,20,0.3)',
                    }}>ตกลง</button>
                    <style>{`
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
                <button style={S.closeBtn} onClick={onClose}><HiOutlineX size={24} /></button>

                <div style={S.header}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>แบบประเมินการอบรม</h2>
                    <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>หลักสูตร: <span style={{color: '#3b82f6'}}>{courseName}</span></p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={S.body}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, paddingRight: 45 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>5 = มากที่สุด, 1 = น้อยที่สุด</span>
                        </div>
                        
                        {evaluationGroups.map((group, gIdx) => (
                            <div key={gIdx} style={{ marginBottom: 28 }}>
                                <h3 style={{ 
                                    fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 12,
                                    paddingBottom: 8, borderBottom: '2px solid #e2e8f0', display: 'inline-block'
                                }}>
                                    {group.title}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {group.items.map((item, iIdx) => (
                                        <div key={iIdx} style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                            padding: '10px 16px', background: iIdx % 2 === 0 ? '#f8fafc' : '#ffffff',
                                            borderRadius: 8, gap: 16
                                        }}>
                                            <span style={{ fontSize: 14, color: '#475569', flex: 1, lineHeight: 1.5 }}>{item.label}</span>
                                            <RatingStars name={item.key} value={details[item.key]} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 8 }}>
                            <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 10 }}>ข้อเสนอแนะเพิ่มเติม</label>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} style={{
                                width: '100%', padding: '14px', border: '1px solid #cbd5e1', borderRadius: 10,
                                fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#334155',
                                minHeight: 100, resize: 'vertical', fontFamily: 'inherit',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                            }} placeholder="พิมพ์ข้อเสนอแนะของคุณที่นี่..." />
                        </div>
                    </div>

                    <div style={S.footer}>
                        <button type="submit" disabled={submitting} style={{
                            width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontSize: 16, fontWeight: 700, color: '#fff',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                            opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งแบบประเมิน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
