// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าจัดการข่าวสาร (แอดมิน)
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlinePhotograph, HiOutlineExclamation } from 'react-icons/hi';

// คอมโพเนนต์สำหรับแอดมิน/สตาฟฟ์ในการ เพิ่ม, แก้ไข, ลบข่าวสาร และปักหมุดข่าว
export default function NewsManage() {
    const [news, setNews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', category: 'ประชาสัมพันธ์', isPinned: false, image: '' });
    const [loading, setLoading] = useState(true);

    // โหลดข้อมูลข่าวสารทั้งหมดจากระบบเมื่อเปิดหน้านี้
    useEffect(() => { loadNews(); }, []);
    const loadNews = () => { api.get('/news').then(res => { setNews(res.data); setLoading(false); }); };
    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    // ฟังก์ชันสำหรับบันทึกการเพิ่มหรือแก้ไขข่าวสาร
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await api.put(`/news/${editId}`, form); toast.success('แก้ไขสำเร็จ'); }
            else { await api.post('/news', form); toast.success('เพิ่มข่าวสำเร็จ'); }
            setShowForm(false); setEditId(null); setForm({ title: '', content: '', category: 'ประชาสัมพันธ์', isPinned: false, image: '' });
            loadNews();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleEdit = (item) => {
        setForm({ title: item.title, content: item.content, category: item.category, isPinned: item.isPinned, image: item.image || '' });
        setEditId(item.id); setShowForm(true);
    };

    const [deleteModal, setDeleteModal] = useState(null);

    const handleDelete = (item) => {
        setDeleteModal({
            id: item.id,
            title: item.title,
            onConfirm: async () => {
                setDeleteModal(null);
                try {
                    await api.delete(`/news/${item.id}`);
                    toast.success('ลบสำเร็จ');
                    loadNews();
                } catch (err) {
                    toast.error('ลบไม่สำเร็จ');
                }
            },
        });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="section-title">จัดการข่าวสาร</h1>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', content: '', category: 'ประชาสัมพันธ์', isPinned: false, image: '' }); }} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" /> เพิ่มข่าว
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-surface-800">{editId ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h2>
                        <button onClick={() => setShowForm(false)} className="text-surface-500 hover:text-surface-800"><HiOutlineX className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-medium text-surface-700 mb-1">หัวข้อ *</label><input name="title" value={form.title} onChange={handleChange} className="input-field" required /></div>
                        <div><label className="block text-sm font-medium text-surface-700 mb-1">เนื้อหา *</label><textarea name="content" value={form.content} onChange={handleChange} className="input-field h-32 resize-none" required /></div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-surface-700 mb-1">หมวดหมู่</label>
                                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                                    <option>ประชาสัมพันธ์</option><option>กำหนดการ</option><option>ประกาศ</option><option>ผลการอบรม</option><option>ทั่วไป</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange} className="w-4 h-4 rounded border-surface-600 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm font-medium text-surface-700">ปักหมุด</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">รูปภาพประกอบข่าว</label>
                            <div className="flex items-start gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="border-2 border-dashed border-surface-600 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                                        <HiOutlinePhotograph className="w-8 h-8 text-surface-500 mx-auto mb-2" />
                                        <p className="text-sm text-surface-600">คลิกเพื่อเลือกรูปภาพ</p>
                                        <p className="text-xs text-surface-500 mt-1">JPG, PNG (ไม่เกิน 2MB)</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (file.size > 2 * 1024 * 1024) { toast.error('ไฟล์รูปภาพต้องไม่เกิน 2MB'); return; }
                                        const reader = new FileReader();
                                        reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
                                        reader.readAsDataURL(file);
                                    }} className="hidden" />
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
                        <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'บันทึก' : 'เพิ่มข่าว'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ยกเลิก</button></div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {news.map(item => (
                    <div key={item.id} className="card flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {item.isPinned && <span className="badge-warning text-xs">ปักหมุด</span>}
                                <span className="badge-info text-xs">{item.category}</span>
                            </div>
                            <h3 className="font-medium text-white truncate">{item.title}</h3>
                            <p className="text-xs text-surface-500 mt-1">{formatDate(item.createdAt)} · {item.authorName}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-primary-400 hover:bg-primary-500/10"><HiOutlinePencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(item)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><HiOutlineTrash className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

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
                                คุณต้องการลบข่าวสารนี้หรือ?
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
                                    ลบข่าวสาร
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
