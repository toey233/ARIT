import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineAcademicCap, HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultModal, setResultModal] = useState(null);
    const [loginResult, setLoginResult] = useState(null);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await googleLogin(credentialResponse.credential);
            setLoginResult(res);
            setResultModal({ type: 'success', message: 'เข้าสู่ระบบด้วย Google สำเร็จ! ยินดีต้อนรับ' });
        } catch (err) {
            setResultModal({ type: 'error', message: err.response?.data?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' });
        }
    };

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
            if (loginResult?.user?.role === 'staff' || loginResult?.user?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        }
        setResultModal(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow-lg mb-4">
                        <HiOutlineAcademicCap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">ARIT Training</h1>
                    <p className="text-surface-400">ระบบบริหารการจัดการอบรม</p>
                    <p className="text-surface-500 text-sm">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">เข้าสู่ระบบ</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">อีเมล</label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">รหัสผ่าน</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-surface-700"></div>
                        <span className="px-4 text-sm text-surface-500">หรือ</span>
                        <div className="flex-1 border-t border-surface-700"></div>
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setResultModal({ type: 'error', message: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' })}
                            theme="filled_black"
                            size="large"
                            width="100%"
                            text="signin_with"
                            shape="pill"
                            locale="th"
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-surface-400 text-sm">
                            ยังไม่มีบัญชี?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>
                </div>


            </div>

            {/* ===== Result Modal ===== */}
            {resultModal && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                    }}
                    onClick={handleResultDismiss}
                >
                    <div
                        style={{
                            position: 'relative', overflow: 'hidden',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                            borderRadius: 24, padding: '48px 36px 40px', textAlign: 'center',
                            maxWidth: 380, width: '88%',
                            boxShadow: '0 30px 90px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                            animation: 'loginPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top gradient bar */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 5,
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(90deg, #22c55e, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                        }} />

                        {/* Glow behind icon */}
                        <div style={{
                            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                            width: 180, height: 180, borderRadius: '50%', opacity: 0.12,
                            background: resultModal.type === 'success'
                                ? 'radial-gradient(circle, #22c55e, transparent 70%)'
                                : 'radial-gradient(circle, #ef4444, transparent 70%)',
                        }} />

                        {/* Icon */}
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                : 'linear-gradient(135deg, #ef4444, #f97316)',
                            boxShadow: resultModal.type === 'success'
                                ? '0 8px 32px rgba(34,197,94,0.35)'
                                : '0 8px 32px rgba(239,68,68,0.35)',
                            animation: 'loginIconBounce 0.6s ease 0.2s both',
                        }}>
                            {resultModal.type === 'success'
                                ? <HiCheckCircle size={48} color="#fff" />
                                : <HiXCircle size={48} color="#fff" />
                            }
                        </div>

                        {/* Title */}
                        <div style={{
                            fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px',
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                                : 'linear-gradient(135deg, #dc2626, #f97316)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {resultModal.type === 'success' ? '🎉 สำเร็จ!' : '⚠️ ไม่สำเร็จ'}
                        </div>

                        {/* Message */}
                        <div style={{ fontSize: 15, color: '#777', marginBottom: 28, lineHeight: 1.6, padding: '0 8px' }}>
                            {resultModal.message}
                        </div>

                        {/* Button */}
                        <button
                            style={{
                                padding: '14px 40px', borderRadius: 14, border: 'none', cursor: 'pointer',
                                fontSize: 16, fontWeight: 700, color: '#fff', minWidth: 160,
                                transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '0.3px',
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

            {/* CSS Animations */}
            <style>{`
                @keyframes loginPopIn {
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
        </div>
    );
}
