import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineTrash } from 'react-icons/hi';

export default function MyRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadRegs(); }, []);

    const loadRegs = () => {
        api.get('/registrations').then(res => { setRegistrations(res.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const handleCancel = async (id) => {
        if (!confirm('ยืนยันยกเลิกการลงทะเบียน?')) return;
        try {
            await api.delete(`/registrations/${id}`);
            toast.success('ยกเลิกสำเร็จ');
            loadRegs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'ยกเลิกไม่สำเร็จ');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const getStatusBadge = (s) => {
        switch (s) {
            case 'approved': return <span className="badge-success">อนุมัติแล้ว</span>;
            case 'rejected': return <span className="badge-danger">ไม่อนุมัติ</span>;
            default: return <span className="badge-warning">รออนุมัติ</span>;
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <h1 className="section-title">การลงทะเบียนของฉัน</h1>

            {registrations.length === 0 ? (
                <div className="text-center py-20 text-surface-500">
                    <HiOutlineClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>ยังไม่มีการลงทะเบียน</p>
                    <Link to="/courses" className="text-primary-400 text-sm hover:underline mt-2 block">ดูหลักสูตรทั้งหมด →</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map(reg => (
                        <div key={reg.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">{reg.courseName}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-500">
                                    <span>วันที่อบรม: {formatDate(reg.courseStartDate)}</span>
                                    <span>ลงทะเบียน: {formatDate(reg.registeredAt)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(reg.status)}
                                {reg.status === 'approved' && (
                                    <Link to={`/evaluation/${reg.courseId}`} className="text-xs text-primary-400 hover:underline">ทำแบบประเมิน</Link>
                                )}
                                {reg.status === 'pending' && (
                                    <button onClick={() => handleCancel(reg.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
