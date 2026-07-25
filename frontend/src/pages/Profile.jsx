// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าโปรไฟล์ส่วนตัวผู้ใช้
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineIdentification, HiOutlineOfficeBuilding, HiOutlineBadgeCheck, HiOutlinePencilAlt, HiOutlineCamera, HiOutlineDocumentDownload } from 'react-icons/hi';
import api from '../services/api';

// คอมโพเนนต์หน้า "โปรไฟล์ส่วนตัว" ให้ผู้ใช้อัปเดตข้อมูลและรูปภาพ
export default function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '', studentId: '', department: '', profilePicture: ''
    });
    const fileInputRef = useRef(null);

    // โหลดข้อมูลผู้ใช้ที่ล็อกอินอยู่มาแสดงในฟอร์มแก้ไข
    useEffect(() => {
        if (user) {
            setFormData({
                phone: user.phone || '',
                studentId: user.studentId || '',
                department: user.department || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    if (!user) return <div className="p-6 text-center text-surface-600">กำลังโหลดข้อมูล...</div>;

    const roleText = {
        admin: 'ผู้ดูแลระบบ',
        staff: 'เจ้าหน้าที่',
        user: 'ผู้ใช้งาน'
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePicture: reader.result });
                setIsEditing(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // ฟังก์ชันกดบันทึกการแก้ไขข้อมูล
    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put('/auth/me', formData);
            updateUser(res.data.user);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full text-surface-900 bg-surface-50 px-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium";
    const readOnlyClass = "text-surface-800 bg-surface-100/50 px-4 py-2 rounded-lg border border-surface-200 min-h-[42px] flex items-center font-medium";

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                    <HiOutlineUser className="text-primary-600" />
                    ข้อมูลส่วนตัว (Profile)
                </h1>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.open('/transcript', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                        title="ดาวน์โหลดสรุปประวัติการอบรมเป็น PDF"
                    >
                        <HiOutlineDocumentDownload className="w-5 h-5" /> Transcript
                    </button>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-500/25"
                        >
                            <HiOutlinePencilAlt className="w-4 h-4" /> แก้ไขข้อมูล
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-card p-8 relative">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar / Role Badge */}
                    <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                        <div 
                            className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-primary-500/30 overflow-hidden group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {(isEditing ? formData.profilePicture : user.profilePicture) ? (
                                <img src={isEditing ? formData.profilePicture : user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <HiOutlineCamera className="w-8 h-8 text-white" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-surface-900">{user.firstName} {user.lastName}</h2>
                            <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-600 mt-2 border border-primary-100">
                                <HiOutlineBadgeCheck />
                                {roleText[user.role] || user.role}
                            </p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-surface-600 flex items-center gap-1">
                                    <HiOutlineMail className="w-4 h-4 text-surface-400" /> อีเมล
                                </label>
                                <div className={readOnlyClass}>
                                    {user.email || '-'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-surface-600 flex items-center gap-1">
                                    <HiOutlinePhone className="w-4 h-4 text-surface-400" /> เบอร์โทรศัพท์
                                </label>
                                {isEditing ? (
                                    <input 
                                        className={inputClass}
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="08X-XXX-XXXX"
                                    />
                                ) : (
                                    <div className={readOnlyClass}>{user.phone || '-'}</div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-surface-600 flex items-center gap-1">
                                    <HiOutlineIdentification className="w-4 h-4 text-surface-400" /> รหัสนักศึกษา/รหัสประจำตัว
                                </label>
                                {isEditing ? (
                                    <input 
                                        className={inputClass}
                                        value={formData.studentId}
                                        onChange={e => setFormData({...formData, studentId: e.target.value})}
                                        placeholder="เช่น 6631700XXXX"
                                    />
                                ) : (
                                    <div className={readOnlyClass}>{user.studentId || '-'}</div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-surface-600 flex items-center gap-1">
                                    <HiOutlineOfficeBuilding className="w-4 h-4 text-surface-400" /> คณะ/หน่วยงาน
                                </label>
                                {isEditing ? (
                                    <input 
                                        className={inputClass}
                                        value={formData.department}
                                        onChange={e => setFormData({...formData, department: e.target.value})}
                                        placeholder="ระบุคณะหรือหน่วยงาน"
                                    />
                                ) : (
                                    <div className={readOnlyClass}>{user.department || '-'}</div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-3 justify-end mt-4 pt-6 border-t border-surface-200">
                                <button 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            phone: user.phone || '',
                                            studentId: user.studentId || '',
                                            department: user.department || '',
                                            profilePicture: user.profilePicture || ''
                                        });
                                    }}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                                    disabled={loading}
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-2.5 rounded-xl font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
