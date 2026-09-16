// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าสมัครสมาชิก
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineIdentification, HiOutlineOfficeBuilding, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineArrowLeft } from 'react-icons/hi';

// คอมโพเนนต์หน้า "สมัครสมาชิก"
export default function Register() {
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', studentId: '', department: '' });
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    // ฟังก์ชันสมัครสมาชิกผ่าน Google
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await googleLogin(credentialResponse.credential);
            toast.success('สมัครสมาชิก / เข้าสู่ระบบด้วย Google สำเร็จ!');
            if (res.user?.role === 'staff' || res.user?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ฟังก์ชันกดส่งข้อมูลฟอร์มสมัครสมาชิก
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('รหัสผ่านไม่ตรงกัน');
        }
        if (form.password.length < 6) {
            return toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        }
        setLoading(true);
        try {
            const res = await register(form);
            toast.success('สมัครสมาชิกสำเร็จ!');
            if (res.user?.role === 'staff' || res.user?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: 'url(https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2000)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            overflow: 'hidden', padding: '40px 20px',
        }}>
            {/* Back to Home Button */}
            <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/20 shadow-lg">
                <HiOutlineArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm hidden sm:inline">กลับหน้าหลัก</span>
            </Link>

            {/* Unified Dark Overlay */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.75) 50%, rgba(15,23,42,0.88) 100%)',
                backdropFilter: 'blur(2px)',
            }} />
            
            {/* Floating Decoration Icons */}
            <div style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.3, color: '#fff', animation: 'float 8s ease-in-out infinite', zIndex: 0 }}>
                <HiOutlineAcademicCap size={150} />
            </div>
            <div style={{ position: 'absolute', bottom: '20%', left: '8%', opacity: 0.2, color: '#fff', animation: 'float 10s ease-in-out infinite reverse', zIndex: 0 }}>
                <HiOutlineDocumentText size={120} />
            </div>

            {/* Animated background pattern */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: `
                    radial-gradient(circle at 15% 85%, rgba(59,130,246,0.25) 0%, transparent 50%),
                    radial-gradient(circle at 85% 15%, rgba(99,102,241,0.2) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)
                `,
            }} />

            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center mb-4" style={{ height: 100 }}>
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
                            onError={(e) => { 
                                e.target.style.display='none'; 
                                e.target.nextSibling.style.display='flex'; 
                            }} 
                        />
                        <div className="rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow-lg" style={{ display: 'none', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineAcademicCap className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">สมัครสมาชิก</h1>
                    <p className="text-surface-300 text-sm">ระบบบริหารการจัดการอบรม ARIT</p>
                </div>

                <div className="p-8 rounded-2xl border" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">ชื่อ *</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="input-field pl-10 py-2.5 text-sm" placeholder="ชื่อ" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">นามสกุล *</label>
                                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="input-field py-2.5 text-sm" placeholder="นามสกุล" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">อีเมล *</label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field pl-10 py-2.5 text-sm" placeholder="example@email.com" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">รหัสผ่าน *</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field pl-10 py-2.5 text-sm" placeholder="••••••••" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">ยืนยันรหัสผ่าน *</label>
                                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field py-2.5 text-sm" placeholder="••••••••" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">เบอร์โทร</label>
                                <div className="relative">
                                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input type="text" name="phone" value={form.phone} onChange={handleChange} className="input-field pl-10 py-2.5 text-sm" placeholder="08X-XXX-XXXX" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">รหัสนักศึกษา</label>
                                <div className="relative">
                                    <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input type="text" name="studentId" value={form.studentId} onChange={handleChange} className="input-field pl-10 py-2.5 text-sm" placeholder="รหัสนักศึกษา" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">คณะ/หน่วยงาน</label>
                            <div className="relative">
                                <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                <input type="text" name="department" value={form.department} onChange={handleChange} className="input-field pl-10 py-2.5 text-sm" placeholder="คณะ/หน่วยงาน" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-50">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'สมัครสมาชิก'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-5">
                        <div className="flex-1 border-t border-surface-700"></div>
                        <span className="px-4 text-sm text-surface-500">หรือ</span>
                        <div className="flex-1 border-t border-surface-700"></div>
                    </div>

                    {/* Google Signup */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ')}
                            theme="filled_black"
                            size="large"
                            width="100%"
                            text="signup_with"
                            shape="pill"
                            locale="th"
                        />
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-surface-400 text-sm">
                            มีบัญชีแล้ว?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">เข้าสู่ระบบ</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
