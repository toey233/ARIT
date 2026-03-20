import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { HiOutlineX, HiCheckCircle, HiXCircle, HiOutlineMail, HiOutlineLockClosed, HiOutlineAcademicCap } from 'react-icons/hi';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,20,40,0.6)', backdropFilter: 'blur(8px)',
    },
    modal: {
        background: '#fff', borderRadius: 24, width: '92%', maxWidth: 460, maxHeight: '92vh', overflow: 'auto',
        position: 'relative', boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
    },
    header: {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        padding: '32px 32px 28px', borderRadius: '24px 24px 0 0',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    headerPattern: {
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    },
    closeBtn: {
        position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none',
        cursor: 'pointer', color: '#fff', padding: 6, borderRadius: 10, backdropFilter: 'blur(4px)',
        transition: 'background 0.2s',
    },
    body: { padding: '28px 32px 32px' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.3px' },
    inputWrap: {
        position: 'relative', marginBottom: 18,
    },
    input: {
        width: '100%', padding: '12px 14px 12px 44px', border: '2px solid #e5e7eb', borderRadius: 12,
        fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1f2937',
        transition: 'border-color 0.3s, box-shadow 0.3s', background: '#f9fafb',
    },
    inputIcon: {
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: '#9ca3af', transition: 'color 0.3s',
    },
    submitBtn: {
        width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
        fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.3px',
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
        boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s', marginTop: 4,
    },
    divider: {
        display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
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
        animation: 'loginResultPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    },
    resultIconWrap: {
        width: 88, height: 88, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        animation: 'loginIconBounce 0.6s ease 0.2s both',
    },
    resultTitle: { fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' },
    resultMessage: { fontSize: 15, color: '#6b7280', marginBottom: 28, lineHeight: 1.6, padding: '0 8px' },
    resultBtn: {
        padding: '14px 40px', borderRadius: 14, border: 'none', cursor: 'pointer',
        fontSize: 16, fontWeight: 700, color: '#fff', minWidth: 160,
        transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '0.3px',
    },
};

export default function LoginModal({ onClose, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultModal, setResultModal] = useState(null);
    const [loginResult, setLoginResult] = useState(null);
    const { login, googleLoginWithToken } = useAuth();
    const navigate = useNavigate();

    const googleLoginHook = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await googleLoginWithToken(tokenResponse.access_token);
                setLoginResult(res);
                setResultModal({ type: 'success', message: 'เข้าสู่ระบบด้วย Google สำเร็จ! ยินดีต้อนรับ' });
            } catch (err) {
                setResultModal({ type: 'error', message: err.response?.data?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' });
            }
        },
        onError: () => setResultModal({ type: 'error', message: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' }),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(email, password);
            setLoginResult(res);
            setResultModal({ type: 'success', message: 'เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับเข้าสู่ระบบ' });
        } catch (err) {
            setResultModal({ type: 'error', message: err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน' });
        } finally {
            setLoading(false);
        }
    };

    const handleResultDismiss = () => {
        if (resultModal?.type === 'success') {
            onClose();
            if (loginResult?.user?.role === 'staff' || loginResult?.user?.role === 'admin') {
                navigate('/dashboard');
            }
        }
        setResultModal(null);
    };

    return (
        <>
            {/* ===== Result Modal ===== */}
            {resultModal && (
                <div style={S.resultOverlay} onClick={handleResultDismiss}>
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
                            onClick={handleResultDismiss}
                        >
                            {resultModal.type === 'success' ? '✓ ตกลง' : '↻ ลองอีกครั้ง'}
                        </button>
                    </div>
                </div>
            )}

            {/* ===== Login Form ===== */}
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
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>เข้าสู่ระบบ</h2>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>ระบบบริหารการจัดการอบรม ARIT</p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div style={S.body}>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label style={S.label}>อีเมล *</label>
                                <div style={S.inputWrap}>
                                    <HiOutlineMail size={18} style={S.inputIcon} />
                                    <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="example@email.com" required
                                        onInvalid={e => e.target.setCustomValidity('กรุณากรอกอีเมล')}
                                        onInput={e => e.target.setCustomValidity('')}
                                        onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.background = '#fff'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>รหัสผ่าน *</label>
                                <div style={S.inputWrap}>
                                    <HiOutlineLockClosed size={18} style={S.inputIcon} />
                                    <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••" required
                                        onInvalid={e => e.target.setCustomValidity('กรุณากรอกรหัสผ่าน')}
                                        onInput={e => e.target.setCustomValidity('')}
                                        onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.background = '#fff'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
                                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(37,99,235,0.4)'; } }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(37,99,235,0.3)'; }}
                            >
                                {loading ? 'กำลังเข้าสู่ระบบ...' : '🔑 เข้าสู่ระบบ'}
                            </button>
                        </form>

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
                            เข้าสู่ระบบด้วย Google
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
                            ยังไม่มีบัญชี?{' '}
                            <button style={S.link} onClick={onSwitchToRegister}
                                onMouseEnter={e => e.target.style.color = '#1d4ed8'}
                                onMouseLeave={e => e.target.style.color = '#2563eb'}
                            >สมัครสมาชิก</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes loginResultPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes loginIconBounce {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}
