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
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '297/210', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        <img src={cert.certificateBackground} alt="Certificate Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {!cert.hideAutoText && (
                            <>
                                <div style={{ position: 'absolute', top: cert.customNamePosY || '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                                    <p style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, color: '#1e293b', fontFamily: '"Sarabun", sans-serif' }}>
                                        {cert.userName}
                                    </p>
                                </div>
                                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', color: '#94a3b8', fontSize: 11 }}>
                                    เลขที่: {cert.certificateNumber}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', background: '#ffffff',
                        position: 'relative', overflow: 'hidden', fontFamily: '"Sarabun", sans-serif',
                        width: '100%', aspectRatio: '297/210', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ position: 'absolute', inset: '4%', border: '1.5px solid #c5a059', zIndex: 0 }}></div>
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 1,
                            background: `linear-gradient(135deg, #2c1e16 3%, #c5a059 3%, #c5a059 7%, #fdf5d3 7%, #fdf5d3 8%, #c5a059 8%, #c5a059 11%, transparent 11%), 
                                         linear-gradient(225deg, #2c1e16 3%, #c5a059 3%, #c5a059 7%, #fdf5d3 7%, #fdf5d3 8%, #c5a059 8%, #c5a059 11%, transparent 11%), 
                                         linear-gradient(315deg, #2c1e16 3%, #c5a059 3%, #c5a059 7%, #fdf5d3 7%, #fdf5d3 8%, #c5a059 8%, #c5a059 11%, transparent 11%), 
                                         linear-gradient(45deg, #2c1e16 3%, #c5a059 3%, #c5a059 7%, #fdf5d3 7%, #fdf5d3 8%, #c5a059 8%, #c5a059 11%, transparent 11%)`
                        }}></div>
                        <div style={{ padding: '3% 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1, zIndex: 2 }}>
                            <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', color: '#94a3b8', fontSize: 11, zIndex: 10 }}>
                                เลขที่: {cert.certificateNumber}
                            </div>
                            <img src="/logo.png" alt="University Logo" style={{ width: '8%', minWidth: 40, height: 'auto', marginBottom: '2%' }} />
                            <h1 style={{ color: '#9a7b4f', fontSize: 'clamp(14px, 2vw, 24px)', fontWeight: 700, margin: '0 0 1%' }}>สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</h1>
                            <h2 style={{ color: '#9a7b4f', fontSize: 'clamp(18px, 2.5vw, 30px)', fontWeight: 700, margin: '0 0 3%' }}>มหาวิทยาลัยราชภัฏมหาสารคาม</h2>
                            <p style={{ color: '#4b5563', fontSize: 'clamp(10px, 1.5vw, 16px)', marginBottom: '4%' }}>เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
                            
                            <p style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 700, color: '#1f2937', margin: '0 0 4%' }}>{cert.userName}</p>
                            
                            <p style={{ color: '#4b5563', fontSize: 'clamp(10px, 1.5vw, 16px)' }}>ได้ผ่านการอบรมหลักสูตร</p>
                            <p style={{ fontSize: 'clamp(14px, 2.5vw, 26px)', fontWeight: 700, color: '#9a7b4f', margin: '1% 0 3%' }}>"{cert.courseName}"</p>
                            
                            <div style={{ textAlign: 'center', color: '#4b5563', fontSize: 'clamp(9px, 1.2vw, 14px)', lineHeight: 1.6, marginBottom: '4%' }}>
                                <p>เมื่อวันที่ {formatDate(cert.courseDate)} ณ มหาวิทยาลัยราชภัฏมหาสารคาม</p>
                                <p>ขอให้ประสบความสุข ความเจริญตลอดไป</p>
                                <p>ให้ไว้ ณ วันที่ {formatDate(cert.courseDate)}</p>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 5%', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '10px' }}>
                                <div style={{ textAlign: 'center', width: '40%', flexShrink: 0 }}>
                                    <div style={{ height: 'clamp(30px, 6vw, 45px)', marginBottom: '4%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        {cert.instructorSignature && (
                                            <img src={cert.instructorSignature} alt="Signature" style={{ maxHeight: '140%', maxWidth: '90%', objectFit: 'contain', position: 'absolute', bottom: 2, mixBlendMode: 'multiply', filter: 'grayscale(100%) contrast(300%)' }} />
                                        )}
                                    </div>
                                    <p style={{ color: '#4b5563', fontSize: 'clamp(9px, 1.2vw, 14px)', fontWeight: 400 }}>({cert.instructor || 'วิทยากร'})</p>
                                    <p style={{ color: '#4b5563', fontSize: 'clamp(8px, 1vw, 12px)' }}>วิทยากรประจำหลักสูตร</p>
                                </div>
                                <div style={{ textAlign: 'center', width: '40%', flexShrink: 0 }}>
                                    <div style={{ height: 'clamp(30px, 6vw, 45px)', marginBottom: '4%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        {cert.directorSignature && (
                                            <img src={cert.directorSignature} alt="Director" style={{ maxHeight: '140%', maxWidth: '90%', objectFit: 'contain', position: 'absolute', bottom: 2, mixBlendMode: 'multiply', filter: 'grayscale(100%) contrast(300%)' }} onError={(e) => e.target.style.display = 'none'} />
                                        )}
                                    </div>
                                    <p style={{ color: '#4b5563', fontSize: 'clamp(9px, 1.2vw, 14px)', fontWeight: 400 }}>({cert.director || 'ผู้อำนวยการ'})</p>
                                    <p style={{ color: '#4b5563', fontSize: 'clamp(8px, 1vw, 12px)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>ผู้อำนวยการสำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
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
                        <style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;padding:0;box-sizing:border-box}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#52525b;font-family:'Sarabun',sans-serif}.cert{width:297mm;height:210mm;background:#fffcf5;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.2)}.cert-bg{background-image:url('${cert.certificateBackground || ''}');background-size:100% 100%;background-position:center;display:block;position:relative;background-color:#fff}.cert-bg .name{position:absolute;top:${customNameTopPosition};left:50%;transform:translate(-50%,-50%);font-size:56px;font-weight:700;color:#1e293b;text-align:center;width:100%;}.cert-outer-border{position:absolute;inset:12mm;border:1.5px solid #c5a059;z-index:0;}.cert-inner-border{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg, #2c1e16 10mm, #c5a059 10mm, #c5a059 22mm, #fdf5d3 22mm, #fdf5d3 25mm, #c5a059 25mm, #c5a059 35mm, transparent 35mm), linear-gradient(225deg, #2c1e16 10mm, #c5a059 10mm, #c5a059 22mm, #fdf5d3 22mm, #fdf5d3 25mm, #c5a059 25mm, #c5a059 35mm, transparent 35mm), linear-gradient(315deg, #2c1e16 10mm, #c5a059 10mm, #c5a059 22mm, #fdf5d3 22mm, #fdf5d3 25mm, #c5a059 25mm, #c5a059 35mm, transparent 35mm), linear-gradient(45deg, #2c1e16 10mm, #c5a059 10mm, #c5a059 22mm, #fdf5d3 22mm, #fdf5d3 25mm, #c5a059 25mm, #c5a059 35mm, transparent 35mm);}.cert-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;height:100%;padding:22mm 22mm 30mm 22mm;text-align:center}.cert h1{font-family:'Sarabun',sans-serif;color:#9a7b4f;font-size:24px;margin-bottom:8px;font-weight:700}.cert h2{font-family:'Sarabun',sans-serif;font-size:32px;font-weight:700;color:#9a7b4f;margin:0 0 20px}.recipient-name{font-size:42px;font-weight:700;color:#1f2937;margin:10px 0 24px;display:inline-block}.signatures{display:flex;justify-content:space-between;width:100%;margin-top:auto;padding:0 15mm;align-items:flex-end}.sig-block{width:40%;flex-shrink:0;text-align:center}.sig-line{height:50px;margin-bottom:8px;position:relative;display:flex;align-items:flex-end;justify-content:center}@media print{@page{size:297mm 210mm;margin:0;}html,body{width:297mm!important;height:210mm!important;margin:0!important;padding:0!important;background:#fff;display:block;overflow:hidden;}.cert{box-shadow:none;width:297mm!important;height:210mm!important;margin:0;position:absolute;top:0;left:0;page-break-after:avoid;page-break-inside:avoid;}}</style></head><body>
                        ${cert.certificateBackground ? `
                         <div class="cert cert-bg">
                             ${!cert.hideAutoText ? `
                             <div class="name" style="top: ${cert.customNamePosY || '55%'}">${cert.userName}</div>
                             <div style="position:absolute; bottom:15mm; left:50%; transform:translateX(-50%); font-size:14px; color:#94a3b8;">เลขที่: ${cert.certificateNumber}</div>
                             ` : ''}
                         </div>
                         ` : `
                        <div class="cert"><div class="cert-outer-border"></div><div class="cert-inner-border"></div><div class="cert-content">
                        <img src="${window.location.origin}/logo.png" alt="University Logo" style="width:75px;height:auto;margin-bottom:12px;margin-top:2mm;" />
                        <h1>สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</h1>
                        <h2>มหาวิทยาลัยราชภัฏมหาสารคาม</h2>
                        <p style="color:#4b5563;font-size:16px;margin-bottom:32px">เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
                        <div class="recipient-name">${cert.userName}</div>
                        <p style="color:#4b5563;font-size:16px;margin-bottom:12px">ได้ผ่านการอบรมหลักสูตร</p>
                        <p style="font-size:28px;font-weight:700;color:#9a7b4f;margin:8px 0 24px;">${cert.courseName}</p>
                        <div style="text-align:center;color:#4b5563;font-size:14px;margin-bottom:0px;line-height:1.6">
                            <p>เมื่อวันที่ ${formatDate(cert.courseDate)} ณ มหาวิทยาลัยราชภัฏมหาสารคาม</p>
                            <p>ขอให้ประสบความสุข ความเจริญตลอดไป</p>
                            <p>ให้ไว้ ณ วันที่ ${formatDate(cert.courseDate)}</p>
                        </div>
                        <div class="signatures">
                            <div class="sig-block">
                                <div class="sig-line">
                                    ${cert.instructorSignature ? `<img src="${cert.instructorSignature}" style="max-height:60px;max-width:180px;object-fit:contain;position:absolute;bottom:4px;mix-blend-mode:multiply;filter:grayscale(100%) contrast(300%);" />` : ''}
                                </div>
                                <p style="color:#4b5563;font-size:16px;font-weight:400">(${cert.instructor || 'วิทยากร'})</p>
                                <p style="color:#4b5563;font-size:12px">วิทยากรประจำหลักสูตร</p>
                            </div>
                            <div class="sig-block">
                                <div class="sig-line">
                                    ${cert.directorSignature ? `<img src="${cert.directorSignature}" onerror="this.style.display='none'" style="max-height:60px;max-width:180px;object-fit:contain;position:absolute;bottom:4px;mix-blend-mode:multiply;filter:grayscale(100%) contrast(300%);" />` : ''}
                                </div>
                                <p style="color:#4b5563;font-size:16px;font-weight:400">(${cert.director || 'ผู้อำนวยการ'})</p>
                                <p style="color:#4b5563;font-size:12px">ผู้อำนวยการสำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                            </div>
                        </div>
                        <div style="position:absolute; bottom:12mm; left:50%; transform:translateX(-50%); font-size:14px; color:#94a3b8; z-index:10;">เลขที่: ${cert.certificateNumber}</div>
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
