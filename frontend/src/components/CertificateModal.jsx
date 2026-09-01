import React from 'react';

export default function CertificateModal({ cert, onClose }) {
    // กำหนดตำแหน่งความสูงของชื่อผู้รับบนภาพพื้นหลัง (ปรับตัวเลข % เพื่อขยับขึ้น-ลง)
    // 50% = กลางเป๊ะ, 55% = ขยับลงมาด้านล่างเล็กน้อย
    const customNameTopPosition = '55%';

    if (!cert) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: 32, maxWidth: 700, width: '90%', position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }} onClick={e => e.stopPropagation()}>
                {cert.certificateBackground ? (
                    <div style={{
                        position: 'relative', width: '100%', aspectRatio: '297/210', 
                        backgroundImage: `url(${cert.certificateBackground})`, backgroundSize: '100% 100%', backgroundPosition: 'center',
                        borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ position: 'absolute', top: customNameTopPosition, left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                            <p style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, color: '#1e293b', fontFamily: '"Sarabun", sans-serif' }}>
                                {cert.userName}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#c5a059\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") #ffffff',
                        border: '14px solid #0f172a', position: 'relative', overflow: 'hidden', fontFamily: '"Sarabun", sans-serif',
                        padding: '10px'
                    }}>
                        <div style={{ border: '2px solid #c5a059', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ color: '#c5a059', fontSize: 13, letterSpacing: 5, fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>CERTIFICATE OF COMPLETION</p>
                            <h2 style={{ fontSize: 40, fontWeight: 700, color: '#0f172a', margin: '6px 0 16px' }}>ประกาศนียบัตร</h2>
                            <p style={{ color: '#64748b', fontSize: 16, fontStyle: 'italic', marginBottom: 16 }}>ขอมอบให้เพื่อแสดงว่า</p>
                            
                            <p style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', borderBottom: '1.5px solid #c5a059', display: 'inline-block', padding: '0 60px 8px', margin: '0 0 24px' }}>{cert.userName}</p>
                            
                            <p style={{ color: '#475569', fontSize: 16 }}>ได้ผ่านการอบรมหลักสูตร</p>
                            <p style={{ fontSize: 26, fontWeight: 700, color: '#c5a059', margin: '12px 0 32px', fontFamily: '"Playfair Display", "Sarabun", serif' }}>"{cert.courseName}"</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px', alignItems: 'flex-end', marginTop: 10 }}>
                                <div style={{ textAlign: 'center', width: 170 }}>
                                    <div style={{ borderBottom: '1px solid #94a3b8', height: 50, marginBottom: 10, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        {cert.instructorSignature && (
                                            <img src={cert.instructorSignature} alt="Signature" style={{ maxHeight: 70, maxWidth: 150, objectFit: 'contain', position: 'absolute', bottom: 2, mixBlendMode: 'multiply', filter: 'grayscale(100%) contrast(300%)' }} />
                                        )}
                                    </div>
                                    <p style={{ color: '#0f172a', fontSize: 14, fontWeight: 600 }}>{cert.instructor || 'วิทยากร'}</p>
                                    <p style={{ color: '#64748b', fontSize: 12 }}>วิทยากรประจำหลักสูตร</p>
                                </div>
                                <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                                    <div style={{ 
                                        width: 76, height: 76, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: '"Playfair Display", serif', letterSpacing: 2,
                                        background: 'linear-gradient(135deg, #d4af37 0%, #aa771c 100%)',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 0 4px #fff, 0 0 0 6px #d4af37, 0 6px 16px rgba(0,0,0,0.15)'
                                    }}>ARIT</div>
                                    <p>ให้ไว้ ณ วันที่ {formatDate(cert.courseDate)}</p>
                                    <p style={{ marginTop: 2 }}>เลขที่ {cert.certificateNumber}</p>
                                </div>
                                <div style={{ textAlign: 'center', width: 170 }}>
                                    <div style={{ borderBottom: '1px solid #94a3b8', height: 50, marginBottom: 10, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        {cert.directorSignature && (
                                            <img src={cert.directorSignature} alt="Director" style={{ maxHeight: 70, maxWidth: 150, objectFit: 'contain', position: 'absolute', bottom: 2, mixBlendMode: 'multiply', filter: 'grayscale(100%) contrast(300%)' }} onError={(e) => e.target.style.display = 'none'} />
                                        )}
                                    </div>
                                    <p style={{ color: '#0f172a', fontSize: 14, fontWeight: 600 }}>{cert.director || 'ผู้อำนวยการ'}</p>
                                    <p style={{ color: '#64748b', fontSize: 12 }}>สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                    <button onClick={() => {
                        const pw = window.open('', '_blank');
                        pw.document.write(`<html><head><title>E-Certificate</title>
                        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
                        <style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;padding:0;box-sizing:border-box}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#52525b;font-family:'Sarabun',sans-serif}.cert{width:297mm;height:210mm;background:#fffcf5;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.2)}.cert-bg{background-image:url('${cert.certificateBackground || ''}');background-size:100% 100%;background-position:center;display:block;position:relative;background-color:#fff}.cert-bg .name{position:absolute;top:${customNameTopPosition};left:50%;transform:translate(-50%,-50%);font-size:56px;font-weight:700;color:#1e293b;text-align:center;width:100%;}.cert-outer-border{position:absolute;inset:0;border:16mm solid #0f172a;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a059' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") #ffffff;}.cert-inner-border{position:absolute;inset:20mm;border:2px solid #c5a059}.cert-content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:25mm;text-align:center}.cert h1{font-family:'Playfair Display',serif;color:#c5a059;font-size:24px;letter-spacing:8px;margin-bottom:12px;text-transform:uppercase;font-weight:700}.cert h2{font-size:60px;font-weight:700;color:#0f172a;margin:0 0 24px}.recipient-name{font-size:52px;font-weight:700;color:#0f172a;margin:24px 0 36px;border-bottom:2px solid #c5a059;padding:0 80px 12px;display:inline-block}.signatures{display:flex;justify-content:space-between;width:100%;margin-top:20mm;padding:0 15mm;align-items:flex-end}.sig-block{width:280px;text-align:center}.sig-line{border-bottom:1px solid #94a3b8;height:70px;margin-bottom:16px;position:relative;display:flex;align-items:flex-end;justify-content:center}.badge{width:120px;height:120px;background:linear-gradient(135deg, #d4af37 0%, #aa771c 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px #fff, 0 0 0 8px #d4af37;color:#fff;font-size:22px;font-family:'Playfair Display',serif;font-weight:bold;letter-spacing:3px;margin:0 auto 20px}@media print{body{background:none;margin:0;padding:0}.cert{box-shadow:none;width:297mm;height:210mm}@page{size:A4 landscape;margin:0}}</style></head><body>
                        ${cert.certificateBackground ? `
                        <div class="cert cert-bg">
                            <div class="name">${cert.userName}</div>
                        </div>
                        ` : `
                        <div class="cert"><div class="cert-outer-border"></div><div class="cert-inner-border"></div><div class="cert-content">
                        <h1>Certificate of Completion</h1>
                        <h2>ประกาศนียบัตร</h2>
                        <p style="color:#64748b;font-size:24px;font-style:italic">ขอมอบให้เพื่อแสดงว่า</p>
                        <div class="recipient-name">${cert.userName}</div>
                        <p style="color:#475569;font-size:22px">ได้ผ่านการอบรมหลักสูตร</p>
                        <p style="font-size:36px;font-weight:700;color:#c5a059;margin:16px 0;font-family:'Playfair Display', 'Sarabun', serif">"${cert.courseName}"</p>
                        <div class="signatures">
                            <div class="sig-block">
                                <div class="sig-line">
                                    ${cert.instructorSignature ? `<img src="${cert.instructorSignature}" style="max-height:90px;max-width:220px;object-fit:contain;position:absolute;bottom:4px;mix-blend-mode:multiply;filter:grayscale(100%) contrast(300%);" />` : ''}
                                </div>
                                <p style="color:#0f172a;font-size:20px;font-weight:600">${cert.instructor || '-'}</p>
                                <p style="color:#64748b;font-size:16px">วิทยากรประจำหลักสูตร</p>
                            </div>
                            <div style="text-align:center;color:#64748b;font-size:16px">
                                <div class="badge">ARIT</div>
                                <p>ให้ไว้ ณ วันที่ ${formatDate(cert.courseDate)}</p>
                                <p style="margin-top:6px">เลขที่ประกาศนียบัตร: ${cert.certificateNumber}</p>
                            </div>
                            <div class="sig-block">
                                <div class="sig-line">
                                    ${cert.directorSignature ? `<img src="${cert.directorSignature}" onerror="this.style.display='none'" style="max-height:90px;max-width:220px;object-fit:contain;position:absolute;bottom:4px;mix-blend-mode:multiply;filter:grayscale(100%) contrast(300%);" />` : ''}
                                </div>
                                <p style="color:#0f172a;font-size:20px;font-weight:600">${cert.director || 'ผู้อำนวยการ'}</p>
                                <p style="color:#64748b;font-size:16px">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                            </div>
                        </div>
                        </div></div>`}
                        <script>setTimeout(()=>window.print(),800)<\/script></body></html>`);
                        pw.document.close();
                    }} style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, color: '#fff',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    }}>ดาวน์โหลด / พิมพ์</button>
                    <button onClick={onClose} style={{
                        padding: '10px 24px', borderRadius: 8, border: '1.5px solid #ddd', cursor: 'pointer',
                        fontSize: 14, fontWeight: 500, color: '#666', background: '#fff',
                    }}>ปิด</button>
                </div>
            </div>
        </div>
    );
}
