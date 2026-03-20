import { HiOutlineX, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '90%', maxWidth: 640, maxHeight: '85vh', overflow: 'auto',
        padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    closeBtn: {
        position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
        cursor: 'pointer', color: '#999', padding: 4,
    },
};

export default function NewsDetailModal({ news, onClose }) {
    if (!news) return null;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : '';

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
                <button style={S.closeBtn} onClick={onClose}><HiOutlineX size={22} /></button>

                <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 6,
                    fontSize: 12, fontWeight: 500, color: '#8B6914', background: 'rgba(139,105,20,0.08)',
                    marginBottom: 12,
                }}>{news.category}</span>

                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#333', marginBottom: 16, lineHeight: 1.5 }}>
                    {news.title}
                </h2>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888' }}>
                        <HiOutlineCalendar size={14} color="#8B6914" />
                        <span>{formatDate(news.createdAt)}</span>
                    </div>
                    {news.authorName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888' }}>
                            <HiOutlineUser size={14} color="#8B6914" />
                            <span>{news.authorName}</span>
                        </div>
                    )}
                </div>

                {news.image && (
                    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden' }}>
                        <img src={news.image} alt={news.title} style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block', borderRadius: 12 }} />
                    </div>
                )}

                <div style={{ fontSize: 15, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {news.content}
                </div>
            </div>
        </div>
    );
}
