import { HiOutlineAcademicCap } from 'react-icons/hi';

export default function FAQSection() {
    return (
        <section id="features" style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.03) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            padding: '80px 24px'
        }}>
            {/* Subtle soft blur blobs */}
            <div style={{
                position: 'absolute', bottom: '10%', left: '5%', width: 'min(400px, 50vw)', height: 'min(400px, 50vw)',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1
            }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 18px', borderRadius: 50,
                        fontSize: 12, fontWeight: 600, color: '#2563eb',
                        background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)',
                        marginBottom: 16, letterSpacing: 0.5,
                    }}>
                        <HiOutlineAcademicCap size={14} />
                        SERVICES & FEATURES
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3,
                        background: 'linear-gradient(135deg, #1e293b 30%, #2563eb 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        บริการของสำนักวิทยบริการฯ
                    </h2>
                    <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                        ศูนย์กลางการเรียนรู้ดิจิทัลและฝึกอบรมทักษะเทคโนโลยีสารสนเทศ
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24 }}>
                    {[
                        { icon: '📖', title: 'ห้องสมุดดิจิทัล', desc: 'เข้าถึงทรัพยากรการเรียนรู้ออนไลน์ ฐานข้อมูลวิชาการ และ e-Books ได้ตลอด 24 ชั่วโมง', color: '#8b5cf6', link: 'https://arit.rmu.ac.th/?page_id=5218' },
                        { icon: '🎓', title: 'หลักสูตรฝึกอบรม', desc: 'อบรมทักษะคอมพิวเตอร์ เว็บไซต์ AI และเทคโนโลยีล้ำสมัย พร้อมวิทยากรผู้เชี่ยวชาญ', color: '#2563eb' },
                        { icon: '📜', title: 'ประกาศนียบัตร e-Certificate', desc: 'รับประกาศนียบัตรอิเล็กทรอนิกส์ทันทีหลังจบหลักสูตร พร้อมยืนยันตัวตน', color: '#059669' },
                        { icon: '💡', title: 'พัฒนาทักษะดิจิทัล', desc: 'เสริมสร้างความรู้ด้าน Digital Literacy สำหรับนักศึกษาและบุคลากรทุกระดับ', color: '#ea580c' },
                    ].map((feature, i) => (
                        <div key={i} style={{
                            background: '#fff', borderRadius: 20, padding: '36px 28px', textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden',
                            cursor: feature.link ? 'pointer' : 'default',
                        }}
                            onClick={() => feature.link && window.open(feature.link, '_blank')}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}18`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
                        >
                            <div style={{
                                width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
                                background: `${feature.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 36,
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>{feature.title}</h3>
                            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
