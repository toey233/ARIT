import { useState, useEffect, useRef } from 'react';
import { HiOutlineBell, HiOutlineClock, HiOutlineDocumentText, HiOutlineChevronRight } from 'react-icons/hi';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function NewsSection({ news, setShowNewsDetail }) {
    const newsScrollRef = useRef(null);
    const [newsHovered, setNewsHovered] = useState(false);

    // Auto-scroll news (loop back to start)
    useEffect(() => {
        const container = newsScrollRef.current;
        if (!container || newsHovered || news.length === 0) return;
        const timer = setInterval(() => {
            if (container.scrollWidth <= container.clientWidth) return;
            
            // Exact width of one set of news (item width 340 + gap 24 = 364)
            const exactHalfScroll = news.length * 364;
            
            if (container.scrollLeft >= exactHalfScroll) {
                // Seamlessly jump back to the exact same visual position in the first set
                container.scrollLeft = container.scrollLeft - exactHalfScroll;
            } else {
                container.scrollLeft += 1;
            }
        }, 20);
        return () => clearInterval(timer);
    }, [newsHovered, news]);

    return (
        <section id="news" style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.03) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            padding: '80px 0 100px',
        }}>
            {/* Subtle soft blur blobs */}
            <div style={{
                position: 'absolute', top: '20%', right: '10%', width: 'min(400px, 50vw)', height: 'min(400px, 50vw)',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1
            }} />

            {/* Decorative elements */}
            <div style={{
                position: 'absolute', top: -100, left: -100, width: 300, height: 300,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                animation: 'pulse 7s ease-in-out infinite', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: -80, right: -80, width: 280, height: 280,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
                animation: 'pulse 9s ease-in-out infinite 3s', pointerEvents: 'none'
            }} />
            <svg style={{ position: 'absolute', top: '12%', right: '6%', opacity: 0.04, animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} width="55" height="55" viewBox="0 0 24 24" fill="#2563eb">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 18px', borderRadius: 50,
                        fontSize: 12, fontWeight: 600, color: '#2563eb',
                        background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)',
                        marginBottom: 16, letterSpacing: 0.5,
                    }}>
                        <HiOutlineBell size={14} />
                        NEWS & ANNOUNCEMENTS
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3,
                        background: 'linear-gradient(135deg, #1e293b 30%, #2563eb 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        ข่าวสารและประกาศ
                    </h2>
                    <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                        ติดตามข่าวสารและกำหนดการอบรมล่าสุดจากสำนักวิทยบริการฯ
                    </p>
                </div>
            </div>

            {/* Auto-scrolling news marquee */}
            <div
                ref={newsScrollRef}
                onMouseEnter={() => setNewsHovered(true)}
                onMouseLeave={() => setNewsHovered(false)}
                style={{
                    display: 'flex', gap: 24, overflowX: 'auto', padding: '8px 24px 20px',
                    scrollbarWidth: 'none', msOverflowStyle: 'none',
                    scrollBehavior: 'smooth', cursor: 'grab',
                }}
            >
                {/* Display news items (Cloned for seamless infinite scroll) */}
                {[...news, ...news].map((item, idx) => {
                    const catColors = {
                        'ประชาสัมพันธ์': '#2563eb',
                        'กำหนดการ': '#059669',
                        'ประกาศ': '#ea580c',
                        'ผลการอบรม': '#8b5cf6',
                    };
                    const accentColor = catColors[item.category] || '#6366f1';
                    return (
                        <div key={`${item.id}-${idx}`} onClick={() => setShowNewsDetail(item)} style={{
                            minWidth: 340, maxWidth: 340, flexShrink: 0,
                            background: '#fff', borderRadius: 20, padding: '28px 24px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                            position: 'relative', overflow: 'hidden',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                                e.currentTarget.style.boxShadow = `0 16px 40px ${accentColor}15, 0 6px 16px rgba(0,0,0,0.08)`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
                            }}
                        >
                            {/* Accent top line */}
                            <div style={{
                                position: 'absolute', top: 0, left: 24, right: 24, height: 3,
                                background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
                                borderRadius: '0 0 4px 4px',
                            }} />

                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 18 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 14,
                                    background: `${accentColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${accentColor}15`,
                                }}>
                                    <HiOutlineBell size={20} color={accentColor} />
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '4px 10px', borderRadius: 50,
                                    background: 'rgba(0,0,0,0.03)', fontSize: 11, color: '#94a3b8', fontWeight: 500,
                                }}>
                                    <HiOutlineClock size={12} />
                                    {formatDate(item.createdAt)}
                                </div>
                            </div>

                            <h3 style={{
                                fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 10, lineHeight: 1.5,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                                {item.title}
                            </h3>

                            {item.image && (
                                <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', maxHeight: 160 }}>
                                    <img src={item.image} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                                </div>
                            )}

                            <p style={{
                                fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                                {item.content}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '5px 14px', borderRadius: 50,
                                    fontSize: 11, fontWeight: 600, color: accentColor,
                                    background: `${accentColor}08`, border: `1px solid ${accentColor}15`,
                                }}>
                                    <HiOutlineDocumentText size={12} />
                                    {item.category}
                                </span>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 13, color: accentColor, fontWeight: 600,
                                    transition: 'gap 0.3s',
                                }}>
                                    <span>อ่านเพิ่มเติม</span>
                                    <HiOutlineChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Scroll hint / fade edges */}
            <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: 60,
                background: 'linear-gradient(to right, rgba(240,244,255,0.9), transparent)',
                pointerEvents: 'none', zIndex: 3,
            }} />
            <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0, width: 60,
                background: 'linear-gradient(to left, rgba(240,244,255,0.9), transparent)',
                pointerEvents: 'none', zIndex: 3,
            }} />
        </section>
    );
}
