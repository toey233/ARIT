import { useState, useRef } from 'react';
import { HiOutlineX, HiOutlineMail, HiOutlinePhone, HiOutlineIdentification, HiOutlineOfficeBuilding, HiOutlineBadgeCheck, HiOutlinePencilAlt, HiOutlineCamera, HiOutlineDocumentDownload } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,20,40,0.6)', backdropFilter: 'blur(8px)',
    },
    modal: {
        background: '#fff', borderRadius: 24, width: '92%', maxWidth: 500, maxHeight: '92vh', overflow: 'auto',
        position: 'relative', boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
    },
    header: {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        padding: '32px 32px 28px', borderRadius: '24px 24px 0 0',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    closeBtn: {
        position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none',
        cursor: 'pointer', color: '#fff', padding: 6, borderRadius: 10, backdropFilter: 'blur(4px)',
        transition: 'background 0.2s',
    },
    body: { padding: '28px 32px 32px' },
    detailRow: { display: 'flex', flexDirection: 'column', marginBottom: 16 },
    label: { fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 },
    value: { fontSize: 15, color: '#1f2937', fontWeight: 500, background: '#f9fafb', padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb' },
    avatarWrap: {
        width: 80, height: 80, borderRadius: 24, margin: '0 auto 16px',
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 16px rgba(59,130,246,0.3)', color: '#fff', fontSize: 32, fontWeight: 'bold',
        position: 'relative', overflow: 'hidden'
    },
    avatarImg: {
        width: '100%', height: '100%', objectFit: 'cover'
    },
    cameraOverlay: {
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s'
    },
    input: {
        width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 12,
        fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.2s'
    },
    saveBtn: {
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '12px 24px',
        borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%',
        marginTop: 8, boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
    }
};

export default function ProfileModal({ user, onClose }) {
    const { updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        studentId: user?.studentId || '',
        department: user?.department || '',
        profilePicture: user?.profilePicture || ''
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!user) return null;

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

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
                <div style={S.header}>
                    <button style={S.closeBtn} onClick={onClose}>
                        <HiOutlineX size={20} />
                    </button>
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div 
                            style={S.avatarWrap} 
                            onMouseEnter={e => { if (isEditing || !isEditing) e.currentTarget.lastChild.style.opacity = 1; }}
                            onMouseLeave={e => { e.currentTarget.lastChild.style.opacity = 0; }}
                        >
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} style={S.avatarImg} alt="Profile" />
                            ) : (
                                user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()
                            )}
                            <div style={S.cameraOverlay} onClick={() => fileInputRef.current?.click()}>
                                <HiOutlineCamera size={24} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{user.firstName} {user.lastName}</h2>
                        <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <HiOutlineBadgeCheck size={14} />
                            {roleText[user.role] || user.role}
                        </span>
                        
                        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button 
                                onClick={() => window.open('/transcript', '_blank')}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #4338ca)', border: 'none',
                                    color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                                }}
                                title="ดาวน์โหลดสรุปประวัติการอบรมเป็น PDF"
                            >
                                <HiOutlineDocumentDownload size={16} /> สรุปประวัติการอบรม (Transcript)
                            </button>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                                        color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                >
                                    <HiOutlinePencilAlt size={16} /> แก้ไขข้อมูลโปรไฟล์
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={S.body}>
                    <div style={S.detailRow}>
                        <label style={S.label}><HiOutlineMail size={16} /> อีเมล</label>
                        <div style={S.value}>{user.email || '-'}</div>
                    </div>
                    
                    <div style={S.detailRow}>
                        <label style={S.label}><HiOutlinePhone size={16} /> เบอร์โทรศัพท์</label>
                        {isEditing ? (
                            <input 
                                style={S.input} 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder="08X-XXX-XXXX"
                            />
                        ) : (
                            <div style={S.value}>{formData.phone || '-'}</div>
                        )}
                    </div>
                    
                    <div style={S.detailRow}>
                        <label style={S.label}><HiOutlineIdentification size={16} /> รหัสนักศึกษา/รหัสประจำตัว</label>
                        {isEditing ? (
                            <input 
                                style={S.input} 
                                value={formData.studentId} 
                                onChange={e => setFormData({...formData, studentId: e.target.value})} 
                                placeholder="เช่น 6631700XXXX"
                            />
                        ) : (
                            <div style={S.value}>{formData.studentId || '-'}</div>
                        )}
                    </div>
                    
                    <div style={S.detailRow}>
                        <label style={S.label}><HiOutlineOfficeBuilding size={16} /> คณะ/หน่วยงาน</label>
                        {isEditing ? (
                            <input 
                                style={S.input} 
                                value={formData.department} 
                                onChange={e => setFormData({...formData, department: e.target.value})} 
                                placeholder="ระบุคณะหรือหน่วยงาน"
                            />
                        ) : (
                            <div style={S.value}>{formData.department || '-'}</div>
                        )}
                    </div>

                    {isEditing && (
                        <div style={{ display: 'flex', gap: 12 }}>
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
                                style={{ ...S.saveBtn, background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}
                                disabled={loading}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={handleSave}
                                style={{ ...S.saveBtn, opacity: loading ? 0.7 : 1 }}
                                disabled={loading}
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
