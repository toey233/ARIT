import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlinePhotograph, HiOutlineEye, HiOutlineSearch, HiOutlineFilter, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation } from 'react-icons/hi';
import CourseDetailModal from '../components/CourseDetailModal';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS = {
    'คอมพิวเตอร์': '#c0392b',
    'การพัฒนาเว็บ': '#2980b9',
    'วิเคราะห์ข้อมูล': '#8e44ad',
    'การศึกษา': '#27ae60',
    'ทั่วไป': '#2563eb',
};
const getCatColor = (cat) => CATEGORY_COLORS[cat] || '#2563eb';

const emptyForm = { title: '', description: '', instructor: '', startDate: '', endDate: '', location: '', maxParticipants: 30, category: '', materials: '', image: '', topics: '', trainingDate: '', trainingDateStart: '', trainingDateEnd: '', duration: '' };

export default function CourseManage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [showCourseDetail, setShowCourseDetail] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [resultModal, setResultModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => { loadCourses(); }, []);

    const loadCourses = () => {
        api.get('/courses').then(res => { setCourses(res.data); setLoading(false); });
    };

    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const formatThaiDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
    };

    const handleChange = (e) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        // Auto-generate trainingDate string from date pickers
        if (e.target.name === 'trainingDateStart' || e.target.name === 'trainingDateEnd') {
            const s = e.target.name === 'trainingDateStart' ? e.target.value : form.trainingDateStart;
            const en = e.target.name === 'trainingDateEnd' ? e.target.value : form.trainingDateEnd;
            if (s && en && s !== en) {
                const ds = new Date(s);
                const de = new Date(en);
                if (ds.getMonth() === de.getMonth() && ds.getFullYear() === de.getFullYear()) {
                    updated.trainingDate = `${ds.getDate()}-${de.getDate()} ${thaiMonths[ds.getMonth()]} ${ds.getFullYear() + 543}`;
                } else {
                    updated.trainingDate = `${formatThaiDate(s)} - ${formatThaiDate(en)}`;
                }
            } else if (s) {
                updated.trainingDate = formatThaiDate(s);
            }
        }
        setForm(updated);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('ไฟล์รูปภาพต้องไม่เกิน 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/courses/${editId}`, form);
                setResultModal({ type: 'success', message: 'แก้ไขหลักสูตรสำเร็จ' });
            } else {
                await api.post('/courses', form);
                setResultModal({ type: 'success', message: 'สร้างหลักสูตรสำเร็จ' });
            }
            setShowForm(false); setEditId(null); setForm(emptyForm);
            loadCourses();
        } catch (err) {
            setResultModal({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
        }
    };

    const handleEdit = (course) => {
        setForm({
            title: course.title, description: course.description, instructor: course.instructor,
            startDate: course.startDate?.slice(0, 16), endDate: course.endDate?.slice(0, 16),
            location: course.location, maxParticipants: course.maxParticipants, category: course.category, materials: course.materials,
            image: course.image || '',
            topics: course.topics || '', trainingDate: course.trainingDate || '', duration: course.duration || ''
        });
        setEditId(course.id); setShowForm(true);
    };

    const handleDelete = async (id) => {
        const course = courses.find(c => c.id === id);
        setDeleteModal({
            id,
            title: course?.title || '',
            onConfirm: async () => {
                setDeleteModal(null);
                try {
                    await api.delete(`/courses/${id}`);
                    setResultModal({ type: 'success', message: 'ลบหลักสูตรสำเร็จ' });
                    loadCourses();
                } catch (err) {
                    setResultModal({ type: 'error', message: err.response?.data?.message || 'ลบไม่สำเร็จ' });
                }
            },
        });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="section-title">จัดการหลักสูตร</h1>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" /> เพิ่มหลักสูตร
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">{editId ? 'แก้ไขหลักสูตร' : 'สร้างหลักสูตรใหม่'}</h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-surface-400 hover:text-white"><HiOutlineX className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-surface-300 mb-1">ชื่อหลักสูตร *</label>
                                <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-surface-300 mb-1">รายละเอียด *</label>
                                <textarea name="description" value={form.description} onChange={handleChange} className="input-field h-24 resize-none" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-surface-300 mb-1">หัวข้อการอบรม</label>
                                <textarea name="topics" value={form.topics} onChange={handleChange} className="input-field h-20 resize-none" placeholder="ระบุหัวข้อการอบรม (แต่ละหัวข้อขึ้นบรรทัดใหม่)" />
                            </div>
                            <div><label className="block text-sm text-surface-300 mb-1">วันที่ทำการอบรม</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input type="date" name="trainingDateStart" value={form.trainingDateStart} onChange={handleChange} className="input-field" style={{ flex: 1 }} />
                                    <span className="text-surface-400 text-sm">ถึง</span>
                                    <input type="date" name="trainingDateEnd" value={form.trainingDateEnd} onChange={handleChange} className="input-field" style={{ flex: 1 }} />
                                </div>
                            </div>
                            <div><label className="block text-sm text-surface-300 mb-1">ระยะเวลาอบรม</label><input name="duration" value={form.duration} onChange={handleChange} className="input-field" placeholder="เช่น 2 วัน (12 ชั่วโมง)" /></div>
                            <div><label className="block text-sm text-surface-300 mb-1">ผู้สอน</label><input name="instructor" value={form.instructor} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm text-surface-300 mb-1">หมวดหมู่</label><input name="category" value={form.category} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm text-surface-300 mb-1">ลงทะเบียนถึงวันที่ *</label><input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm text-surface-300 mb-1">สถานที่</label><input name="location" value={form.location} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm text-surface-300 mb-1">จำนวนรับ (คน)</label><input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} className="input-field" /></div>
                            <div className="md:col-span-2"><label className="block text-sm text-surface-300 mb-1">เอกสาร/อุปกรณ์</label><input name="materials" value={form.materials} onChange={handleChange} className="input-field" /></div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-surface-300 mb-1">รูปภาพหลักสูตร</label>
                                <div className="flex items-start gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="border-2 border-dashed border-surface-600 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                                            <HiOutlinePhotograph className="w-8 h-8 text-surface-500 mx-auto mb-2" />
                                            <p className="text-sm text-surface-400">คลิกเพื่อเลือกรูปภาพ</p>
                                            <p className="text-xs text-surface-500 mt-1">JPG, PNG (ไม่เกิน 2MB)</p>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {form.image && (
                                        <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-surface-600 flex-shrink-0">
                                            <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setForm(prev => ({ ...prev, image: '' }))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">
                                                <HiOutlineX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary">{editId ? 'บันทึกการแก้ไข' : 'สร้างหลักสูตร'}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ยกเลิก</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="glass-card p-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่อหลักสูตร..."
                        className="input-field"
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <div style={{ minWidth: 180, position: 'relative' }}>
                    <HiOutlineFilter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: 36, appearance: 'auto' }}
                    >
                        <option value="">ทุกหมวดหมู่</option>
                        {[...new Set(courses.map(c => c.category).filter(Boolean))].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-surface-700">
                            <th className="text-left py-3 px-4 text-surface-400 font-medium">หลักสูตร</th>
                            <th className="text-left py-3 px-4 text-surface-400 font-medium hidden md:table-cell">หมวดหมู่</th>
                            <th className="text-left py-3 px-4 text-surface-400 font-medium hidden md:table-cell">วันที่อบรม</th>
                            <th className="text-left py-3 px-4 text-surface-400 font-medium hidden lg:table-cell">ระยะเวลา</th>
                            <th className="text-center py-3 px-4 text-surface-400 font-medium">สถานะ</th>
                            <th className="text-center py-3 px-4 text-surface-400 font-medium">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses
                            .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))
                            .filter(c => !categoryFilter || c.category === categoryFilter)
                            .sort((a, b) => {
                                const getDay = (str) => {
                                    if (!str) return 9999;
                                    const m = str.match(/(\d+)/);
                                    return m ? parseInt(m[1]) : 9999;
                                };
                                return getDay(a.trainingDate || a.startDate) - getDay(b.trainingDate || b.startDate);
                            })
                            .map(course => {
                                const catColor = getCatColor(course.category);
                                return (
                                    <tr key={course.id} className="border-b border-surface-800 hover:bg-surface-800/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 4, height: 28, borderRadius: 4, background: catColor, flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontWeight: 600, color: catColor }}>{course.title}</p>
                                                    <p className="text-xs text-surface-500 md:hidden">{course.category} · {course.trainingDate || formatDate(course.startDate)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600,
                                                color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30`,
                                            }}>{course.category || 'ทั่วไป'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-surface-400 hidden md:table-cell">{course.trainingDate || formatDate(course.startDate)}</td>
                                        <td className="py-3 px-4 text-surface-400 hidden lg:table-cell">{course.duration || '-'}</td>
                                        <td className="py-3 px-4 text-center">{course.status === 'open' ? <span className="badge-success">เปิด</span> : <span className="badge-danger">ปิด</span>}</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setShowCourseDetail(course)} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors" title="ดูรายละเอียด"><HiOutlineEye className="w-4 h-4" /></button>
                                                <button onClick={() => handleEdit(course)} className="p-2 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {showCourseDetail && (
                <CourseDetailModal
                    course={showCourseDetail}
                    user={user}
                    onClose={() => setShowCourseDetail(null)}
                    onRegister={() => setShowCourseDetail(null)}
                />
            )}

            {/* ===== Delete Confirm Modal ===== */}
            {deleteModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(8px)',
                    animation: 'rmFadeIn 0.2s ease',
                }} onClick={() => setDeleteModal(null)}>
                    <div style={{
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: 24, textAlign: 'center',
                        maxWidth: 420, width: '90%',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                        animation: 'rmPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 4, background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)' }} />
                        <div style={{ padding: '36px 32px 32px' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.1))',
                                border: '2px solid rgba(239,68,68,0.3)',
                                animation: 'rmIconPop 0.5s ease 0.15s both',
                            }}>
                                <HiOutlineExclamation size={36} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#f87171' }}>
                                ยืนยันการลบ
                            </h3>
                            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 6, lineHeight: 1.6 }}>
                                คุณต้องการลบหลักสูตรนี้หรือ?
                            </p>
                            <div style={{
                                display: 'inline-block',
                                padding: '8px 20px', borderRadius: 12,
                                fontSize: 14, fontWeight: 700, color: '#f87171',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                marginBottom: 24, maxWidth: '100%',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                &quot;{deleteModal.title}&quot;
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    style={{
                                        padding: '12px 28px', borderRadius: 14,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                                        fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#94a3b8'; }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={deleteModal.onConfirm}
                                    style={{
                                        padding: '12px 28px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                        boxShadow: '0 6px 24px rgba(239,68,68,0.35)',
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <HiOutlineTrash size={16} />
                                    ลบหลักสูตร
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Result Modal ===== */}
            {resultModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(8px)',
                    animation: 'rmFadeIn 0.2s ease',
                }} onClick={() => setResultModal(null)}>
                    <div style={{
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: 24, textAlign: 'center',
                        maxWidth: 400, width: '90%',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                        animation: 'rmPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            height: 4,
                            background: resultModal.type === 'success'
                                ? 'linear-gradient(90deg, #22c55e, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                        }} />
                        <div style={{ padding: '40px 32px 32px' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                                background: resultModal.type === 'success'
                                    ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))'
                                    : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.1))',
                                border: resultModal.type === 'success'
                                    ? '2px solid rgba(34,197,94,0.3)'
                                    : '2px solid rgba(239,68,68,0.3)',
                                animation: 'rmIconPop 0.5s ease 0.15s both',
                            }}>
                                {resultModal.type === 'success'
                                    ? <HiOutlineCheckCircle size={42} color="#22c55e" />
                                    : <HiOutlineXCircle size={42} color="#ef4444" />
                                }
                            </div>
                            <h3 style={{
                                fontSize: 22, fontWeight: 700, marginBottom: 10,
                                color: resultModal.type === 'success' ? '#4ade80' : '#f87171',
                            }}>
                                {resultModal.type === 'success' ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
                            </h3>
                            <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 28, lineHeight: 1.6 }}>
                                {resultModal.message}
                            </p>
                            <button
                                onClick={() => setResultModal(null)}
                                style={{
                                    padding: '12px 40px', borderRadius: 14, border: 'none',
                                    background: resultModal.type === 'success'
                                        ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                        : 'linear-gradient(135deg, #ef4444, #f97316)',
                                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                    boxShadow: resultModal.type === 'success'
                                        ? '0 6px 24px rgba(34,197,94,0.35)'
                                        : '0 6px 24px rgba(239,68,68,0.35)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes rmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes rmPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.03); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes rmIconPop {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
