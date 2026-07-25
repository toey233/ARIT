// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าตั้งรหัสผ่านใหม่
import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

// คอมโพเนนต์หน้า "ตั้งรหัสผ่านใหม่" (หลังจากกดลิงก์ในอีเมล)
function ResetPassword() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // ฟังก์ชันส่งรหัสผ่านใหม่ที่ตั้งไปอัปเดตในระบบ
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 6) {
            return toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        }
        if (password !== confirmPassword) {
            return toast.error('รหัสผ่านไม่ตรงกัน');
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', {
                id,
                token,
                newPassword: password
            });
            toast.success(res.data.message || 'รีเซ็ตรหัสผ่านสำเร็จ');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว');
        } finally {
            setLoading(false);
        }
    };

    if (!token || !id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 border border-red-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-surface-900 mb-2">ลิงก์ไม่ถูกต้อง</h2>
                    <p className="text-surface-600 mb-6">ลิงก์สำหรับรีเซ็ตรหัสผ่านนี้ไม่สามารถใช้งานได้ อาจจะหมดอายุหรือถูกใช้งานไปแล้ว</p>
                    <button onClick={() => navigate('/login')} className="w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                        กลับไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-200/40 blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-inner">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">ตั้งรหัสผ่านใหม่</h2>
                        <p className="mt-3 text-surface-600 text-sm">
                            กรุณากรอกรหัสผ่านใหม่ของคุณ (อย่างน้อย 6 ตัวอักษร)
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">รหัสผ่านใหม่</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-600/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center">
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'บันทึกรหัสผ่านใหม่'
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
