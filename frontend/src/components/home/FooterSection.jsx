export default function FooterSection() {
    return (
        <footer id="footer" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff', padding: '60px 24px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginBottom: 40 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, fontWeight: 'bold',
                            }}>A</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>ARIT Training</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Management System</div>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                            สำนักวิทยบริการและเทคโนโลยีสารสนเทศ<br />
                            มหาวิทยาลัยราชภัฏมหาสารคาม<br />
                            ศูนย์กลางการเรียนรู้และพัฒนาทักษะดิจิทัล
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#93c5fd' }}>บริการของเรา</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {['หลักสูตรอบรม', 'ห้องสมุดดิจิทัล', 'ระบบ e-Learning', 'ประกาศนียบัตร'].map(s => (
                                <span key={s} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#93c5fd'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                                >{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#93c5fd' }}>ติดต่อเรา</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                            <span>📍 80 ถนนนครสวรรค์ ตำบลตลาด อำเภอเมือง จังหวัดมหาสารคาม</span>
                            <span>📞 0-4371-3618 , 0-4372-2118-9 ต่อ 160 โทรสาร 0-4372-5433</span>
                            <span>📧 lib@rmu.ac.th</span>
                            <span>🕐 จันทร์-ศุกร์ 08:30-16:30 น.</span>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                        © 2569 ระบบบริหารการจัดการอบรม สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏมหาสารคาม | พัฒนา BY APIRAK สาขาเทคโนโลยีสารสนเทศ
                    </p>
                </div>
            </div>
        </footer>
    );
}
