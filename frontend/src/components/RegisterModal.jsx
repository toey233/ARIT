import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineX, HiCheckCircle, HiXCircle, HiOutlineAcademicCap,
    HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlinePhone,
    HiOutlineOfficeBuilding
} from 'react-icons/hi';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,20,40,0.6)', backdropFilter: 'blur(8px)',
    },
    modal: {
        background: '#fff', borderRadius: 24, width: '92%', maxWidth: 580, maxHeight: '92vh', overflow: 'auto',
        position: 'relative', boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
    },
    header: {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        padding: '28px 32px 24px', borderRadius: '24px 24px 0 0',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    headerPattern: {
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    },
    closeBtn: {
        position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none',
        cursor: 'pointer', color: '#fff', padding: 6, borderRadius: 10, backdropFilter: 'blur(4px)',
        transition: 'background 0.2s', zIndex: 3,
    },
    body: { padding: '24px 32px 32px' },
    sectionLabel: {
        fontSize: 13, fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase',
        letterSpacing: '1px', marginBottom: 14, marginTop: 4,
        display: 'flex', alignItems: 'center', gap: 8,
    },
    sectionDot: {
        width: 4, height: 4, borderRadius: '50%', background: '#2563eb',
    },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5, letterSpacing: '0.2px' },
    inputWrap: { position: 'relative', marginBottom: 14 },
    input: {
        width: '100%', padding: '11px 14px 11px 42px', border: '2px solid #e5e7eb', borderRadius: 12,
        fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1f2937',
        transition: 'border-color 0.3s, box-shadow 0.3s', background: '#f9fafb',
    },
    inputNoIcon: {
        width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12,
        fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1f2937',
        transition: 'border-color 0.3s, box-shadow 0.3s', background: '#f9fafb',
    },
    select: {
        width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12,
        fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1f2937',
        transition: 'border-color 0.3s, box-shadow 0.3s', background: '#f9fafb',
        appearance: 'auto',
    },
    inputIcon: {
        position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
        color: '#9ca3af', transition: 'color 0.3s', pointerEvents: 'none',
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    submitBtn: {
        width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
        fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.3px',
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
        boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s', marginTop: 8,
    },
    divider: {
        display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0',
        color: '#9ca3af', fontSize: 13,
    },
    dividerLine: { flex: 1, height: 1, background: '#e5e7eb' },
    googleBtn: {
        width: '100%', padding: '12px', borderRadius: 12, border: '2px solid #e5e7eb', cursor: 'pointer',
        fontSize: 14, fontWeight: 600, color: '#374151', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'border-color 0.2s, background 0.2s',
    },
    link: {
        color: '#2563eb', fontWeight: 600, cursor: 'pointer', background: 'none',
        border: 'none', fontSize: 14, transition: 'color 0.2s',
    },
    memberTypeWrap: {
        display: 'flex', gap: 10, marginBottom: 20,
    },
    memberTypeBtn: {
        flex: 1, padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
        fontSize: 14, fontWeight: 600, textAlign: 'center',
        transition: 'all 0.3s', border: '2px solid transparent',
    },
    resultOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(8px)',
    },
    resultModal: {
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        borderRadius: 24, padding: '48px 36px 40px', textAlign: 'center',
        maxWidth: 380, width: '88%',
        boxShadow: '0 30px 90px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        animation: 'regResultPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    },
    resultIconWrap: {
        width: 88, height: 88, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        animation: 'regIconBounce 0.6s ease 0.2s both',
    },
    resultTitle: { fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' },
    resultMessage: { fontSize: 15, color: '#6b7280', marginBottom: 28, lineHeight: 1.6, padding: '0 8px' },
    resultBtn: {
        padding: '14px 40px', borderRadius: 14, border: 'none', cursor: 'pointer',
        fontSize: 16, fontWeight: 700, color: '#fff', minWidth: 160,
        transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '0.3px',
    },
};

const focusStyle = (e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.background = '#fff'; };
const blurStyle = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; };

export default function RegisterModal({ onClose, onSwitchToLogin }) {
    const [form, setForm] = useState({
        memberType: 'นักศึกษา', firstNameTh: '', lastNameTh: '', firstName: '', lastName: '',
        gender: '', phone: '', staffStatus: '', email: '', password: '', confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [resultModal, setResultModal] = useState(null);
    const { register, googleLoginWithToken } = useAuth();

    const googleLoginHook = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await googleLoginWithToken(tokenResponse.access_token);
                setResultModal({ type: 'success', message: 'สมัครสมาชิก / เข้าสู่ระบบด้วย Google สำเร็จ!' });
            } catch (err) {
                setResultModal({ type: 'error', message: err.response?.data?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' });
            }
        },
        onError: () => setResultModal({ type: 'error', message: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' }),
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setResultModal({ type: 'error', message: 'รหัสผ่านไม่ตรงกัน' });
            return;
        }
        if (form.password.length < 6) {
            setResultModal({ type: 'error', message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
            return;
        }
        setLoading(true);
        try {
            await register({
                firstName: form.firstNameTh || form.firstName,
                lastName: form.lastNameTh || form.lastName,
                email: form.email, password: form.password,
                phone: form.phone, department: form.staffStatus,
            });
            setResultModal({ type: 'success', message: 'สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว' });
        } catch (err) {
            setResultModal({ type: 'error', message: err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
        } finally { setLoading(false); }
    };

    return (
        <>
            {/* ===== Result Modal ===== */}
            {resultModal && (
                <div style={S.resultOverlay} onClick={() => {
                    if (resultModal.type === 'success') onClose();
                    setResultModal(null);
                }}>
                    <div style={S.resultModal} onClick={e => e.stopPropagation()}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 5,
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(90deg, #22c55e, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                        }} />
                        <div style={{
                            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                            width: 180, height: 180, borderRadius: '50%', opacity: 0.12,
                            background: resultModal.type === 'success'
                                ? 'radial-gradient(circle, #22c55e, transparent 70%)'
                                : 'radial-gradient(circle, #ef4444, transparent 70%)',
                        }} />
                        <div style={{
                            ...S.resultIconWrap,
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                : 'linear-gradient(135deg, #ef4444, #f97316)',
                            boxShadow: resultModal.type === 'success'
                                ? '0 8px 32px rgba(34,197,94,0.35)'
                                : '0 8px 32px rgba(239,68,68,0.35)',
                        }}>
                            {resultModal.type === 'success'
                                ? <HiCheckCircle size={48} color="#fff" />
                                : <HiXCircle size={48} color="#fff" />
                            }
                        </div>
                        <div style={{
                            ...S.resultTitle,
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                                : 'linear-gradient(135deg, #dc2626, #f97316)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {resultModal.type === 'success' ? '🎉 สำเร็จ!' : '⚠️ ไม่สำเร็จ'}
                        </div>
                        <div style={S.resultMessage}>{resultModal.message}</div>
                        <button
                            style={{
                                ...S.resultBtn,
                                background: resultModal.type === 'success'
                                    ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                    : 'linear-gradient(135deg, #ef4444, #f97316)',
                                boxShadow: resultModal.type === 'success'
                                    ? '0 6px 24px rgba(34,197,94,0.4)'
                                    : '0 6px 24px rgba(239,68,68,0.4)',
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                            onClick={() => {
                                if (resultModal.type === 'success') onClose();
                                setResultModal(null);
                            }}
                        >
                            {resultModal.type === 'success' ? '✓ ตกลง' : '↻ ลองอีกครั้ง'}
                        </button>
                    </div>
                </div>
            )}

            {/* ===== Register Form ===== */}
            <div style={S.overlay} onClick={onClose}>
                <div style={S.modal} onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div style={S.header}>
                        <div style={S.headerPattern} />
                        <button style={S.closeBtn} onClick={onClose}
                            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <HiOutlineX size={20} />
                        </button>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}>
                                <HiOutlineAcademicCap size={28} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>สมัครสมาชิก</h2>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>ระบบบริหารการจัดการอบรม ARIT</p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div style={S.body}>


                        <form onSubmit={handleSubmit}>
                            {/* Thai Name */}
                            <div style={S.sectionLabel}>
                                <div style={S.sectionDot} />
                                ข้อมูลส่วนตัว
                            </div>
                            <div style={S.row}>
                                <div>
                                    <label style={S.label}>ชื่อ(ไทย) *</label>
                                    <div style={S.inputWrap}>
                                        <HiOutlineUser size={16} style={S.inputIcon} />
                                        <input style={S.input} name="firstNameTh" value={form.firstNameTh} onChange={handleChange}
                                            placeholder="ชื่อ(ไทย)" required
                                            onInvalid={e => e.target.setCustomValidity('กรุณากรอกชื่อ(ไทย)')}
                                            onInput={e => e.target.setCustomValidity('')}
                                            onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={S.label}>นามสกุล(ไทย) *</label>
                                    <div style={S.inputWrap}>
                                        <input style={S.inputNoIcon} name="lastNameTh" value={form.lastNameTh} onChange={handleChange}
                                            placeholder="นามสกุล(ไทย)" required
                                            onInvalid={e => e.target.setCustomValidity('กรุณากรอกนามสกุล(ไทย)')}
                                            onInput={e => e.target.setCustomValidity('')}
                                            onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                            </div>
                            <div style={S.row}>
                                <div>
                                    <label style={S.label}>First Name</label>
                                    <div style={S.inputWrap}>
                                        <input style={S.inputNoIcon} name="firstName" value={form.firstName} onChange={handleChange}
                                            placeholder="First Name" onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={S.label}>Last Name</label>
                                    <div style={S.inputWrap}>
                                        <input style={S.inputNoIcon} name="lastName" value={form.lastName} onChange={handleChange}
                                            placeholder="Last Name" onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                            </div>
                            <div style={S.row}>
                                <div>
                                    <label style={S.label}>เพศ *</label>
                                    <div style={S.inputWrap}>
                                        <select style={S.select} name="gender" value={form.gender} onChange={handleChange}
                                            onFocus={focusStyle} onBlur={blurStyle}>
                                            <option value="">เลือกเพศ</option>
                                            <option value="ชาย">ชาย</option>
                                            <option value="หญิง">หญิง</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={S.label}>เบอร์โทรศัพท์ *</label>
                                    <div style={S.inputWrap}>
                                        <HiOutlinePhone size={16} style={S.inputIcon} />
                                        <input style={S.input} name="phone" value={form.phone} onChange={handleChange}
                                            placeholder="08X-XXX-XXXX" onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                            </div>
                            <div style={S.inputWrap}>
                                <label style={S.label}>สถานะบุคลากร</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineOfficeBuilding size={16} style={S.inputIcon} />
                                    <input style={S.input} name="staffStatus" value={form.staffStatus} onChange={handleChange}
                                        placeholder="สถานะบุคลากร / คณะ" onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                            </div>

                            {/* Account */}
                            <div style={S.sectionLabel}>
                                <div style={S.sectionDot} />
                                ข้อมูลบัญชี
                            </div>
                            <div style={S.inputWrap}>
                                <label style={S.label}>อีเมล (ใช้เป็นชื่อผู้ใช้) *</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineMail size={16} style={S.inputIcon} />
                                    <input style={S.input} type="email" name="email" value={form.email} onChange={handleChange}
                                        placeholder="example@email.com" required
                                        onInvalid={e => e.target.setCustomValidity('กรุณากรอกอีเมล')}
                                        onInput={e => e.target.setCustomValidity('')}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                            </div>
                            <div style={S.row}>
                                <div>
                                    <label style={S.label}>รหัสผ่าน *</label>
                                    <div style={S.inputWrap}>
                                        <HiOutlineLockClosed size={16} style={S.inputIcon} />
                                        <input style={S.input} type="password" name="password" value={form.password} onChange={handleChange}
                                            placeholder="อย่างน้อย 6 ตัว" required
                                            onInvalid={e => e.target.setCustomValidity('กรุณากรอกรหัสผ่าน')}
                                            onInput={e => e.target.setCustomValidity('')}
                                            onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={S.label}>ยืนยันรหัสผ่าน *</label>
                                    <div style={S.inputWrap}>
                                        <HiOutlineLockClosed size={16} style={S.inputIcon} />
                                        <input style={S.input} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                                            placeholder="ยืนยันรหัสผ่าน" required
                                            onInvalid={e => e.target.setCustomValidity('กรุณากรอกยืนยันรหัสผ่าน')}
                                            onInput={e => e.target.setCustomValidity('')}
                                            onFocus={focusStyle} onBlur={blurStyle} />
                                    </div>
                                </div>
                            </div>

                            <div style={S.divider}>
                                <div style={S.dividerLine} />
                                <span>หรือ</span>
                                <div style={S.dividerLine} />
                            </div>
                            <button type="button" onClick={() => googleLoginHook()} style={S.googleBtn}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285f4'; e.currentTarget.style.background = '#f8faff'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(66,133,244,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                                สมัครสมาชิกด้วย Google
                            </button>

                            <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
                                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(37,99,235,0.4)'; } }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(37,99,235,0.3)'; }}
                            >
                                {loading ? 'กำลังสมัคร...' : '📝 สมัครสมาชิก'}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6b7280' }}>
                            มีบัญชีแล้ว?{' '}
                            <button style={S.link} onClick={onSwitchToLogin}
                                onMouseEnter={e => e.target.style.color = '#1d4ed8'}
                                onMouseLeave={e => e.target.style.color = '#2563eb'}
                            >เข้าสู่ระบบ</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes regResultPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes regIconBounce {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}
