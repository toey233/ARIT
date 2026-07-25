// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าลืมรหัสผ่าน
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

// คอมโพเนนต์หน้า "ลืมรหัสผ่าน" ให้ผู้ใช้กรอกอีเมลเพื่อขอลิงก์รีเซ็ต
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // ฟังก์ชันสำหรับส่งคำขอรีเซ็ตรหัสผ่านไปยังอีเมลที่ระบุ
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            return toast.error('กรุณากรอกอีเมล');
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            toast.success(res.data.message || 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว');
            setIsSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-200/40 blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-inner">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">ลืมรหัสผ่าน?</h2>
                        <p className="mt-3 text-surface-600 text-sm">
                            ไม่ต้องกังวล! เพียงกรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ
                        </p>
                    </div>

                    {!isSent ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-surface-700 mb-2">
                                    อีเมลที่ใช้ลงทะเบียน
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="your-email@example.com"
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
                                        'ส่งลิงก์สำหรับรีเซ็ตรหัสผ่าน'
                                    )}
                                </span>
                            </button>
                        </form>
                    ) : (
                        <div className="text-center bg-green-50 rounded-2xl p-6 border border-green-100">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-green-900 mb-2">ส่งลิงก์สำเร็จแล้ว!</h3>
                            <p className="text-sm text-green-700">
                                กรุณาตรวจสอบกล่องจดหมายของคุณ (หรือโฟลเดอร์จดหมายขยะ) สำหรับอีเมลจากเรา 
                                <br/><br/>ลิงก์จะมีอายุการใช้งานเพียง 15 นาที
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                            &larr; กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
