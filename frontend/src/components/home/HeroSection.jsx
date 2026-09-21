import { HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineClipboardList } from 'react-icons/hi';

export default function HeroSection({ scrollY }) {
    return (
        <section id="hero" style={{
            position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            overflow: 'hidden', paddingTop: 70,
        }}>
            {/* Unified Dark Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.75) 50%, rgba(15,23,42,0.88) 100%)',
                backdropFilter: 'blur(2px)',
            }} />
            
            {/* Floating Decoration Icons */}
            <div style={{
                position: 'absolute', top: '15%', right: '10%', opacity: 0.3, color: '#fff',
                transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.05}deg)`,
                animation: 'float 8s ease-in-out infinite'
            }}>
                <HiOutlineAcademicCap size={150} />
            </div>
            <div style={{
                position: 'absolute', bottom: '20%', left: '8%', opacity: 0.2, color: '#fff',
                transform: `translateY(${scrollY * -0.1}px) rotate(${scrollY * -0.03}deg)`,
                animation: 'float 10s ease-in-out infinite reverse'
            }}>
                <HiOutlineDocumentText size={120} />
            </div>
            <div style={{
                position: 'absolute', top: '25%', left: '12%', opacity: 0.15, color: '#fff',
                transform: `translateY(${scrollY * 0.2}px)`,
                animation: 'float 12s ease-in-out infinite 2s'
            }}>
                <HiOutlineClipboardList size={100} />
            </div>
            {/* Animated background pattern */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                    radial-gradient(circle at 15% 85%, rgba(59,130,246,0.25) 0%, transparent 50%),
                    radial-gradient(circle at 85% 15%, rgba(99,102,241,0.2) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)
                `,
            }} />

            {/* Floating university-themed SVGs */}
            <svg style={{ position: 'absolute', top: '10%', right: '8%', opacity: 0.12, animation: 'float 6s ease-in-out infinite' }} width="120" height="120" viewBox="0 0 24 24" fill="white">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
            <svg style={{ position: 'absolute', bottom: '15%', left: '6%', opacity: 0.1, animation: 'float 8s ease-in-out infinite reverse' }} width="90" height="90" viewBox="0 0 24 24" fill="white">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
            </svg>
            <svg style={{ position: 'absolute', top: '25%', left: '15%', opacity: 0.08, animation: 'float 7s ease-in-out infinite 1s' }} width="70" height="70" viewBox="0 0 24 24" fill="white">
                <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
            </svg>
            <svg style={{ position: 'absolute', bottom: '30%', right: '12%', opacity: 0.07, animation: 'float 9s ease-in-out infinite 2s' }} width="80" height="80" viewBox="0 0 24 24" fill="white">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
            </svg>

            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '15%', right: '8%', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', animation: 'pulse 5s ease-in-out infinite 1s' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', transform: 'translate(-50%, -50%)' }} />

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, padding: '60px 24px' }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px 6px 8px',
                    borderRadius: 50, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)', marginBottom: 24,
                    fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500,
                }}>
                    <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2
                    }}>
                        <img src="/logo.png" alt="University Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    สำนักวิทยบริการและเทคโนโลยีสารสนเทศ
                </div>

                <h1 style={{
                    fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff',
                    marginBottom: 16, lineHeight: 1.3,
                    textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                }}>
                    ศูนย์การเรียนรู้และฝึกอบรม<br />
                    <span style={{ background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        มหาวิทยาลัยราชภัฏมหาสารคาม
                    </span>
                </h1>
                <p style={{
                    fontSize: 'clamp(15px, 2.2vw, 18px)', color: 'rgba(255,255,255,0.75)',
                    marginBottom: 40, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 40px',
                }}>
                    พัฒนาทักษะด้านดิจิทัลและเทคโนโลยี ลงทะเบียนเรียนรู้ผ่านระบบออนไลน์
                    พร้อมรับประกาศนียบัตรอิเล็กทรอนิกส์ได้ทันที
                </p>

            </div>

            {/* Bottom wave */}
            <svg style={{ position: 'absolute', bottom: -2, left: 0, width: '100%' }} viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path fill="#fff" d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,70 1440,60 L1440,100 L0,100 Z" />
            </svg>
        </section>
    );
}
