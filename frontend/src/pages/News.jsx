// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าแสดงข่าวสารและประกาศ
import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineNewspaper, HiOutlineBookmarkAlt } from 'react-icons/hi';

// คอมโพเนนต์สำหรับแสดงรายการข่าวสารและประกาศให้ผู้ใช้ทั่วไปดู
export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    // โหลดข้อมูลข่าวสารทั้งหมดจากระบบเมื่อเปิดหน้านี้
    useEffect(() => {
        api.get('/news').then(res => { setNews(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <h1 className="section-title">ข่าวสารและประกาศ</h1>
            {news.length === 0 ? (
                <div className="text-center py-20 text-surface-500"><HiOutlineNewspaper className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>ยังไม่มีข่าวสาร</p></div>
            ) : (
                <div className="space-y-4">
                    {news.map(item => (
                        <div key={item.id} className={`card ${item.isPinned ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.isPinned ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                                    {item.isPinned ? <HiOutlineBookmarkAlt className="w-6 h-6 text-amber-400" /> : <HiOutlineNewspaper className="w-6 h-6 text-blue-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.isPinned && <span className="badge-warning text-xs">ปักหมุด</span>}
                                        <span className="badge-info text-xs">{item.category}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                                    <p className="text-surface-300 mt-2 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                                    {item.image && (
                                        <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', maxHeight: 320 }}>
                                            <img src={item.image} alt={item.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12 }} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mt-3 text-xs text-surface-500">
                                        <span>โดย {item.authorName}</span>
                                        <span>·</span>
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
