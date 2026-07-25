import React from 'react';

export default function CertificateModal({ cert, onClose }) {
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
                        backgroundImage: `url(${cert.certificateBackground})`, backgroundSize: 'cover', backgroundPosition: 'center',
                        borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                            <p style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, color: '#1e293b', fontFamily: '"Sarabun", sans-serif' }}>
                                {cert.userName}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', background: '#fffcf5', border: '8px solid #cbd5e1', outline: '2px solid #1e293b', outlineOffset: '-12px',
                        borderRadius: 4, padding: '50px 40px', position: 'relative', overflow: 'hidden', fontFamily: '"Sarabun", sans-serif'
                    }}>
                        <p style={{ color: '#1e293b', fontSize: 13, letterSpacing: 4, fontFamily: '"Playfair Display", serif', fontWeight: 600 }}>CERTIFICATE OF COMPLETION</p>
                        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e293b', margin: '4px 0 16px' }}>ประกาศนียบัตร</h2>
                        <p style={{ color: '#64748b', fontSize: 15 }}>ขอมอบให้แก่</p>
                        <p style={{ fontSize: 26, fontWeight: 700, color: '#b45309', borderBottom: '1px solid #b45309', display: 'inline-block', padding: '0 40px 6px', margin: '12px 0 20px' }}>{cert.userName}</p>
                        <p style={{ color: '#475569', fontSize: 15 }}>เพื่อแสดงว่าได้ผ่านการอบรมหลักสูตร</p>
                        <p style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', margin: '8px 0 24px' }}>"{cert.courseName}"</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, padding: '0 20px', alignItems: 'flex-end' }}>
                            <div style={{ textAlign: 'center', width: 160 }}>
                                <div style={{ borderBottom: '1px solid #1e293b', height: 40, marginBottom: 8, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    {cert.instructorSignature && (
                                        <img src={cert.instructorSignature} alt="Signature" style={{ maxHeight: 60, maxWidth: 140, objectFit: 'contain', position: 'absolute', bottom: 0, mixBlendMode: 'multiply', filter: 'grayscale(100%) contrast(300%)' }} />
                                    )}
                                </div>
                                <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{cert.instructor || 'วิทยากร'}</p>
                                <p style={{ color: '#94a3b8', fontSize: 11 }}>วิทยากรประจำหลักสูตร</p>
                            </div>
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
                                <div style={{ width: 60, height: 60, background: '#b45309', border: '4px double #fffcf5', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fffcf5', fontSize: 10, fontWeight: 'bold' }}>ARIT</div>
                                <p>วันที่ {formatDate(cert.courseDate)}</p>
                                <p>เลขที่ {cert.certificateNumber}</p>
                            </div>
                            <div style={{ textAlign: 'center', width: 160 }}>
                                <div style={{ borderBottom: '1px solid #1e293b', height: 40, marginBottom: 8, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    {cert.directorSignature && (
                                        <img src={cert.directorSignature} alt="Director" style={{ maxHeight: 60, maxWidth: 140, objectFit: 'contain', position: 'absolute', bottom: 0, mixBlendMode: 'multiply', filter: 'grayscale(100%) contrast(300%)' }} onError={(e) => e.target.style.display = 'none'} />
                                    )}
                                </div>
                                <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{cert.director || 'ผู้อำนวยการ'}</p>
                                <p style={{ color: '#94a3b8', fontSize: 11 }}>สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                    <button onClick={() => {
                        const pw = window.open('', '_blank');
                        pw.document.write(`<html><head><title>E-Certificate</title>
                        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                        <style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;padding:0;box-sizing:border-box}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#52525b;font-family:'Sarabun',sans-serif}.cert{width:297mm;height:210mm;background:#fffcf5;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.2)}.cert-bg{background-image:url('${cert.certificateBackground || ''}');background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;background-color:#fff}.cert-bg .name{font-size:56px;font-weight:700;color:#1e293b;text-align:center;width:100%;}.cert-outer-border{position:absolute;inset:10mm;border:2px solid #1e293b}.cert-inner-border{position:absolute;inset:12mm;border:1px solid #1e293b}.cert-content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20mm 25mm;text-align:center}.cert h1{font-family:'Playfair Display',serif;color:#1e293b;font-size:32px;letter-spacing:6px;margin-bottom:8px;text-transform:uppercase}.cert h2{font-size:54px;font-weight:700;color:#1e293b;margin:0 0 30px}.recipient-name{font-size:46px;font-weight:700;color:#b45309;margin:20px 0 30px;border-bottom:2px solid #b45309;padding:0 60px 10px;display:inline-block}.signatures{display:flex;justify-content:space-between;width:100%;margin-top:20mm;padding:0 20mm;align-items:flex-end}.sig-block{width:260px;text-align:center}.sig-line{border-bottom:1px solid #1e293b;height:60px;margin-bottom:12px}.badge{width:110px;height:110px;background:#b45309;border-radius:50%;display:flex;align-items:center;justify-content:center;border:6px double #fffcf5;box-shadow:0 4px 10px rgba(0,0,0,0.1);color:#fffcf5;font-size:16px;font-weight:bold;margin:0 auto 16px}@media print{body{background:none;margin:0;padding:0}.cert{box-shadow:none;width:297mm;height:210mm}@page{size:A4 landscape;margin:0}}</style></head><body>
                        ${cert.certificateBackground ? `
                        <div class="cert cert-bg">
                            <div class="name">${cert.userName}</div>
                        </div>
                        ` : `
                        <div class="cert"><div class="cert-outer-border"></div><div class="cert-inner-border"></div><div class="cert-content">
                        <h1>Certificate of Completion</h1>
                        <h2>ประกาศนียบัตร</h2>
                        <p style="color:#64748b;font-size:22px">ขอมอบให้แก่</p>
                        <div class="recipient-name">${cert.userName}</div>
                        <p style="color:#475569;font-size:20px">เพื่อแสดงว่าได้ผ่านการอบรมหลักสูตร</p>
                        <p style="font-size:28px;font-weight:600;color:#1e293b;margin:12px 0">"${cert.courseName}"</p>
                        <div class="signatures">
                            <div class="sig-block">
                                <div class="sig-line" style="position:relative;display:flex;align-items:flex-end;justify-content:center;">
                                    ${cert.instructorSignature ? `<img src="${cert.instructorSignature}" style="max-height:80px;max-width:200px;object-fit:contain;position:absolute;bottom:0;mix-blend-mode:multiply;filter:grayscale(100%) contrast(300%);" />` : ''}
                                </div>
                                <p style="color:#1e293b;font-size:18px;font-weight:600">${cert.instructor || '-'}</p>
                                <p style="color:#64748b;font-size:15px">วิทยากรประจำหลักสูตร</p>
                            </div>
                            <div style="text-align:center;color:#64748b;font-size:14px">
                                <div class="badge">ARIT</div>
                                <p>ให้ไว้ ณ วันที่ ${formatDate(cert.courseDate)}</p>
                                <p style="margin-top:4px">เลขที่ประกาศนียบัตร: ${cert.certificateNumber}</p>
                            </div>
                            <div class="sig-block">
                                <div class="sig-line" style="position:relative;display:flex;align-items:flex-end;justify-content:center;">
                                    ${cert.directorSignature ? `<img src="${cert.directorSignature}" onerror="this.style.display='none'" style="max-height:80px;max-width:200px;object-fit:contain;position:absolute;bottom:0;mix-blend-mode:multiply;filter:grayscale(100%) contrast(300%);" />` : ''}
                                </div>
                                <p style="color:#1e293b;font-size:18px;font-weight:600">${cert.director || 'ผู้อำนวยการ'}</p>
                                <p style="color:#64748b;font-size:15px">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
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
