import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '90%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto',
        padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    closeBtn: {
        position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
        cursor: 'pointer', color: '#999', padding: 4,
    },
    title: { fontSize: 22, fontWeight: 700, color: '#333', marginBottom: 4 },
    courseTitle: { fontSize: 14, color: '#888', marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #eee' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 },
    input: {
        width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8,
        fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#333',
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
    field: { marginBottom: 12 },
    submitBtn: {
        width: '100%', padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 16,
        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    },
};

export default function CourseRegModal({ course, onClose, onSuccess }) {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        organization: '', department: '', position: '', reason: '',
    });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/registrations', { courseId: course.id });
            onSuccess?.();
            setShowSuccess(true);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ');
        } finally { setLoading(false); }
    };

    // Success popup
    if (showSuccess) {
        return (
            <div style={{
                ...S.overlay,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
            }} onClick={() => { setShowSuccess(false); onClose(); }}>
                <div style={{
                    background: '#fff', borderRadius: 24, padding: '52px 44px 44px', textAlign: 'center',
                    maxWidth: 440, width: '90%',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
                    animation: 'successPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative', overflow: 'hidden',
                }} onClick={e => e.stopPropagation()}>
                    {/* Decorative gradient top bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
                        background: 'linear-gradient(90deg, #27ae60, #2ecc71, #3498db, #2563eb)',
                    }} />

                    {/* Confetti dots */}
                    <div style={{ position: 'absolute', top: 20, left: 30, width: 8, height: 8, borderRadius: '50%', background: '#f1c40f', animation: 'confettiFall 1.5s ease-out forwards', opacity: 0 }} />
                    <div style={{ position: 'absolute', top: 15, right: 50, width: 6, height: 6, borderRadius: '50%', background: '#e74c3c', animation: 'confettiFall 1.5s ease-out 0.2s forwards', opacity: 0 }} />
                    <div style={{ position: 'absolute', top: 25, left: 80, width: 7, height: 7, borderRadius: '50%', background: '#3498db', animation: 'confettiFall 1.5s ease-out 0.4s forwards', opacity: 0 }} />
                    <div style={{ position: 'absolute', top: 10, right: 90, width: 5, height: 5, borderRadius: '50%', background: '#2ecc71', animation: 'confettiFall 1.5s ease-out 0.3s forwards', opacity: 0 }} />
                    <div style={{ position: 'absolute', top: 30, right: 30, width: 8, height: 8, borderRadius: 2, background: '#9b59b6', animation: 'confettiFall 1.5s ease-out 0.1s forwards', opacity: 0, transform: 'rotate(45deg)' }} />
                    <div style={{ position: 'absolute', top: 18, left: 50, width: 6, height: 6, borderRadius: 2, background: '#e67e22', animation: 'confettiFall 1.5s ease-out 0.5s forwards', opacity: 0, transform: 'rotate(30deg)' }} />

                    {/* Success Icon */}
                    <div style={{
                        width: 96, height: 96, borderRadius: '50%', margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(39,174,96,0.35), 0 0 0 8px rgba(39,174,96,0.1)',
                        animation: 'iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
                    }}>
                        <HiOutlineCheckCircle size={52} color="#fff" />
                    </div>

                    <h2 style={{
                        fontSize: 26, fontWeight: 800, marginBottom: 10,
                        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: 'fadeInUp 0.4s ease 0.3s both',
                    }}>
                        ✅ ลงทะเบียนสำเร็จ!
                    </h2>
                    <p style={{
                        fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 8,
                        animation: 'fadeInUp 0.4s ease 0.4s both',
                    }}>
                        คุณได้ลงทะเบียนเข้าอบรมหลักสูตร
                    </p>
                    <p style={{
                        fontSize: 17, fontWeight: 700, color: '#2563eb', marginBottom: 16,
                        padding: '8px 16px', background: 'rgba(37,99,235,0.06)', borderRadius: 10,
                        display: 'inline-block',
                        animation: 'fadeInUp 0.4s ease 0.5s both',
                    }}>
                        "{course.title}"
                    </p>
                    <p style={{
                        fontSize: 14, color: '#999', marginBottom: 32, lineHeight: 1.6,
                        animation: 'fadeInUp 0.4s ease 0.6s both',
                    }}>
                        กรุณารอการอนุมัติจากเจ้าหน้าที่<br />
                        ระบบจะแจ้งเตือนเมื่อมีการอัปเดตสถานะ
                    </p>
                    <button onClick={() => { setShowSuccess(false); onClose(); }} style={{
                        padding: '14px 48px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        fontSize: 16, fontWeight: 700, color: '#fff',
                        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                        boxShadow: '0 6px 20px rgba(39,174,96,0.35)',
                        transition: 'all 0.3s ease',
                        animation: 'fadeInUp 0.4s ease 0.7s both',
                    }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(39,174,96,0.45)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(39,174,96,0.35)'; }}
                    >ตกลง</button>
                    <style>{`
                        @keyframes successPopIn {
                            from { opacity: 0; transform: scale(0.8) translateY(20px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        @keyframes iconBounce {
                            from { opacity: 0; transform: scale(0.3); }
                            to { opacity: 1; transform: scale(1); }
                        }
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(12px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes confettiFall {
                            0% { opacity: 0; transform: translateY(0) scale(0); }
                            30% { opacity: 1; transform: translateY(20px) scale(1.2); }
                            100% { opacity: 0; transform: translateY(120px) scale(0.5) rotate(180deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Error popup
    if (errorMsg) {
        return (
            <div style={{
                ...S.overlay,
                background: 'rgba(15,5,5,0.7)',
                backdropFilter: 'blur(12px)',
            }} onClick={() => setErrorMsg('')}>
                <div style={{
                    background: 'linear-gradient(145deg, #fff 0%, #fff5f5 100%)', borderRadius: 28, padding: '56px 44px 48px', textAlign: 'center',
                    maxWidth: 460, width: '92%',
                    boxShadow: '0 30px 100px rgba(231,76,60,0.25), 0 0 0 1px rgba(231,76,60,0.08)',
                    animation: 'errorPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative', overflow: 'hidden',
                }} onClick={e => e.stopPropagation()}>
                    {/* Animated gradient top bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                        background: 'linear-gradient(90deg, #e74c3c, #ff6b6b, #e74c3c, #ff6b6b)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientSlide 2s linear infinite',
                    }} />

                    {/* Floating particles */}
                    {[
                        { top: 25, left: 35, size: 8, color: '#e74c3c', delay: 0 },
                        { top: 15, right: 45, size: 6, color: '#ff6b6b', delay: 0.2 },
                        { top: 30, left: 85, size: 7, color: '#c0392b', delay: 0.4 },
                        { top: 12, right: 80, size: 5, color: '#e74c3c', delay: 0.1 },
                        { top: 35, right: 35, size: 9, color: '#ff4757', delay: 0.3 },
                        { top: 20, left: 55, size: 6, color: '#ff6b81', delay: 0.5 },
                    ].map((p, i) => (
                        <div key={i} style={{
                            position: 'absolute', top: p.top, left: p.left, right: p.right,
                            width: p.size, height: p.size, borderRadius: i % 2 === 0 ? '50%' : 3,
                            background: p.color, opacity: 0,
                            animation: `errorParticle 2s ease-out ${p.delay}s infinite`,
                            transform: i % 2 !== 0 ? 'rotate(45deg)' : 'none',
                        }} />
                    ))}

                    {/* Pulsing glow ring behind icon */}
                    <div style={{
                        position: 'absolute', top: '18%', left: '50%', transform: 'translate(-50%, 0)',
                        width: 140, height: 140, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(231,76,60,0.15) 0%, transparent 70%)',
                        animation: 'pulseGlow 2s ease-in-out infinite',
                    }} />

                    {/* Error Icon with shake */}
                    <div style={{
                        width: 100, height: 100, borderRadius: '50%', margin: '0 auto 28px',
                        background: 'linear-gradient(135deg, #ff6b6b, #e74c3c, #c0392b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 12px 35px rgba(231,76,60,0.4), 0 0 0 6px rgba(231,76,60,0.08), 0 0 0 12px rgba(231,76,60,0.04)',
                        animation: 'errorIconIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both',
                        position: 'relative', zIndex: 2,
                    }}>
                        <HiOutlineExclamationCircle size={54} color="#fff" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }} />
                    </div>

                    <h2 style={{
                        fontSize: 26, fontWeight: 800, marginBottom: 12,
                        background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: 'errorFadeUp 0.5s ease 0.35s both',
                    }}>
                        ไม่สามารถลงทะเบียนได้
                    </h2>

                    <div style={{
                        padding: '14px 20px', borderRadius: 14, marginBottom: 28,
                        background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.1)',
                        animation: 'errorFadeUp 0.5s ease 0.45s both',
                    }}>
                        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, fontWeight: 500 }}>
                            {errorMsg}
                        </p>
                    </div>

                    <p style={{
                        fontSize: 13, color: '#999', marginBottom: 28, lineHeight: 1.6,
                        animation: 'errorFadeUp 0.5s ease 0.5s both',
                    }}>
                        กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง
                    </p>

                    <button onClick={() => setErrorMsg('')} style={{
                        padding: '15px 52px', borderRadius: 14, border: 'none', cursor: 'pointer',
                        fontSize: 16, fontWeight: 700, color: '#fff', position: 'relative', overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ff6b6b, #e74c3c)',
                        boxShadow: '0 8px 25px rgba(231,76,60,0.35)',
                        transition: 'all 0.3s ease',
                        animation: 'errorFadeUp 0.5s ease 0.6s both',
                    }}
                        onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-3px) scale(1.03)';
                            e.target.style.boxShadow = '0 12px 35px rgba(231,76,60,0.45)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = '0 8px 25px rgba(231,76,60,0.35)';
                        }}
                    >
                        ✏️ กลับไปกรอกใหม่
                    </button>

                    <style>{`
                        @keyframes errorPopIn {
                            0% { opacity: 0; transform: scale(0.7) translateY(30px) rotate(-2deg); }
                            60% { transform: scale(1.03) translateY(-5px) rotate(0.5deg); }
                            100% { opacity: 1; transform: scale(1) translateY(0) rotate(0); }
                        }
                        @keyframes errorIconIn {
                            0% { opacity: 0; transform: scale(0.2) rotate(-30deg); }
                            50% { transform: scale(1.15) rotate(5deg); }
                            70% { transform: scale(0.95) rotate(-2deg); }
                            100% { opacity: 1; transform: scale(1) rotate(0); }
                        }
                        @keyframes errorFadeUp {
                            from { opacity: 0; transform: translateY(16px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes errorParticle {
                            0% { opacity: 0; transform: translateY(0) scale(0); }
                            15% { opacity: 0.8; transform: translateY(8px) scale(1.3); }
                            50% { opacity: 0.4; }
                            100% { opacity: 0; transform: translateY(140px) scale(0.3) rotate(240deg); }
                        }
                        @keyframes pulseGlow {
                            0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.5; }
                            50% { transform: translate(-50%, 0) scale(1.3); opacity: 0.8; }
                        }
                        @keyframes gradientSlide {
                            0% { background-position: 0% 0; }
                            100% { background-position: 200% 0; }
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

                <h2 style={S.title}>ลงทะเบียนเข้าอบรม</h2>
                <p style={S.courseTitle}>หลักสูตร: {course.title}</p>

                <form onSubmit={handleSubmit}>
                    <h3 style={S.sectionTitle}>ข้อมูลส่วนตัว</h3>
                    <div style={S.row}>
                        <div><label style={S.label}>ชื่อ <span style={{ color: 'red' }}>*</span></label><input style={S.input} name="firstName" value={form.firstName} onChange={handleChange} placeholder="ชื่อจริง" required /></div>
                        <div><label style={S.label}>นามสกุล <span style={{ color: 'red' }}>*</span></label><input style={S.input} name="lastName" value={form.lastName} onChange={handleChange} placeholder="นามสกุล" required /></div>
                    </div>
                    <div style={S.row}>
                        <div><label style={S.label}>อีเมล <span style={{ color: 'red' }}>*</span></label><input style={S.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" required /></div>
                        <div><label style={S.label}>เบอร์โทรศัพท์ <span style={{ color: 'red' }}>*</span></label><input style={S.input} name="phone" value={form.phone} onChange={handleChange} placeholder="0xx-xxx-xxxx" required /></div>
                    </div>

                    <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>ข้อมูลหน่วยงาน</h3>
                    <div style={S.field}><label style={S.label}>หน่วยงาน/สถาบัน</label><input style={S.input} name="organization" value={form.organization} onChange={handleChange} placeholder="ชื่อหน่วยงานหรือสถาบัน" /></div>
                    <div style={S.row}>
                        <div><label style={S.label}>ภาควิชา/แผนก</label><input style={S.input} name="department" value={form.department} onChange={handleChange} placeholder="ภาควิชาหรือแผนก" /></div>
                        <div><label style={S.label}>ตำแหน่ง</label><input style={S.input} name="position" value={form.position} onChange={handleChange} placeholder="ตำแหน่งงาน" /></div>
                    </div>

                    <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>ข้อมูลเพิ่มเติม</h3>
                    <div style={S.field}>
                        <label style={S.label}>เหตุผลที่สนใจเข้าอบรม</label>
                        <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} name="reason" value={form.reason} onChange={handleChange} placeholder="กรุณาระบุเหตุผลที่สนใจเข้าอบรมหลักสูตรนี้" />
                    </div>

                    <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }}>
                        {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนเข้าอบรม'}
                    </button>
                </form>
            </div>
        </div>
    );
}
