import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineIdentification, HiOutlineOfficeBuilding, HiOutlineAcademicCap } from 'react-icons/hi';

export default function Register() {
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', studentId: '', department: '' });
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

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
        <div className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden py-8">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow-lg mb-3">
                        <HiOutlineAcademicCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">สมัครสมาชิก</h1>
                    <p className="text-surface-400 text-sm">ระบบบริหารการจัดการอบรม ARIT</p>
                </div>

                <div className="glass-card p-8">
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
