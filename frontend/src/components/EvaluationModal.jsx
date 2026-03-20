import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineStar, HiStar, HiOutlineCheckCircle } from 'react-icons/hi';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '90%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
        padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    closeBtn: {
        position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
        cursor: 'pointer', color: '#999', padding: 4,
    },
};

export default function EvaluationModal({ courseId, courseName, onClose, onSuccess }) {
    const [form, setForm] = useState({ rating: 5, contentRating: 5, instructorRating: 5, facilityRating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/evaluations', { courseId, ...form });
            onSuccess?.();
            setShowSuccess(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'ส่งไม่สำเร็จ');
        } finally { setSubmitting(false); }
    };

    const StarRow = ({ label, name, value }) => (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 8 }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, [name]: n })} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s',
                    }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        {n <= value
                            ? <HiStar size={28} color="#f59e0b" />
                            : <HiOutlineStar size={28} color="#ddd" />
                        }
                    </button>
                ))}
                <span style={{ marginLeft: 8, fontSize: 14, color: '#2563eb', fontWeight: 600 }}>{value}/5</span>
            </div>
        </div>
    );

    if (showSuccess) {
        return (
            <div style={S.overlay} onClick={() => { setShowSuccess(false); onClose(); }}>
                <div style={{
                    background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center',
                    maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
                <button style={S.closeBtn} onClick={onClose}><HiOutlineX size={22} /></button>

                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#333', marginBottom: 4 }}>แบบประเมินการอบรม</h2>
                <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>หลักสูตร: {courseName}</p>

                <form onSubmit={handleSubmit}>
                    <StarRow label="ความพึงพอใจโดยรวม" name="rating" value={form.rating} />
                    <StarRow label="เนื้อหาการอบรม" name="contentRating" value={form.contentRating} />
                    <StarRow label="วิทยากร/ผู้สอน" name="instructorRating" value={form.instructorRating} />
                    <StarRow label="สถานที่และสิ่งอำนวยความสะดวก" name="facilityRating" value={form.facilityRating} />

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 6 }}>ข้อเสนอแนะ</label>
                        <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} style={{
                            width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8,
                            fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#333',
                            minHeight: 80, resize: 'vertical',
                        }} placeholder="ข้อเสนอแนะเพิ่มเติม..." />
                    </div>

                    <button type="submit" disabled={submitting} style={{
                        width: '100%', padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 8,
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        opacity: submitting ? 0.6 : 1,
                    }}>
                        {submitting ? 'กำลังส่ง...' : 'ส่งแบบประเมิน'}
                    </button>
                </form>
            </div>
        </div>
    );
}
