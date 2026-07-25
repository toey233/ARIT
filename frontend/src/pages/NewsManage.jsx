// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าจัดการข่าวสาร (แอดมิน)
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';

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

    const handleDelete = async (id) => {
        if (!confirm('ลบข่าวสารนี้?')) return;
        try { await api.delete(`/news/${id}`); toast.success('ลบสำเร็จ'); loadNews(); }
        catch (err) { toast.error('ลบไม่สำเร็จ'); }
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
                        <h2 className="text-lg font-semibold text-white">{editId ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h2>
                        <button onClick={() => setShowForm(false)} className="text-surface-400 hover:text-white"><HiOutlineX className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm text-surface-300 mb-1">หัวข้อ *</label><input name="title" value={form.title} onChange={handleChange} className="input-field" required /></div>
                        <div><label className="block text-sm text-surface-300 mb-1">เนื้อหา *</label><textarea name="content" value={form.content} onChange={handleChange} className="input-field h-32 resize-none" required /></div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm text-surface-300 mb-1">หมวดหมู่</label>
                                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                                    <option>ประชาสัมพันธ์</option><option>กำหนดการ</option><option>ประกาศ</option><option>ผลการอบรม</option><option>ทั่วไป</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange} className="w-4 h-4 rounded border-surface-600 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm text-surface-300">ปักหมุด</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-surface-300 mb-1">รูปภาพประกอบข่าว</label>
                            <div className="flex items-start gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="border-2 border-dashed border-surface-600 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                                        <HiOutlinePhotograph className="w-8 h-8 text-surface-500 mx-auto mb-2" />
                                        <p className="text-sm text-surface-400">คลิกเพื่อเลือกรูปภาพ</p>
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
                            <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><HiOutlineTrash className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
