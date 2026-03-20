import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { HiOutlineDocumentText, HiOutlineDownload } from 'react-icons/hi';

export default function Certificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    const certRef = useRef(null);

    useEffect(() => {
        api.get('/certificates/my').then(res => { setCertificates(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    const viewCertificate = async (cert) => {
        try {
            const res = await api.get(`/certificates/${cert.id}`);
            setSelectedCert(res.data);
        } catch { }
    };

    const printCertificate = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html><head><title>E-Certificate</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;600;700&family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
        .cert { width: 842px; height: 595px; background: white; position: relative; overflow: hidden; font-family: 'Sarabun', 'Noto Sans Thai', sans-serif; }
        .cert-border { position: absolute; inset: 15px; border: 3px solid #4f46e5; border-radius: 8px; }
        .cert-border-inner { position: absolute; inset: 20px; border: 1px solid #c7d2fe; border-radius: 6px; }
        .cert-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 60px 80px; text-align: center; }
        .cert-header { color: #4f46e5; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 5px; }
        .cert-title { font-size: 36px; font-weight: 700; color: #1e293b; margin: 10px 0; }
        .cert-subtitle { color: #64748b; font-size: 14px; margin-bottom: 25px; }
        .cert-name { font-size: 28px; font-weight: 700; color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 5px; margin: 10px 0 20px; display: inline-block; }
        .cert-course { font-size: 16px; color: #334155; margin: 5px 0; }
        .cert-date { font-size: 13px; color: #94a3b8; margin-top: 15px; }
        .cert-number { font-size: 11px; color: #cbd5e1; margin-top: 8px; }
        .cert-org { font-size: 12px; color: #64748b; margin-top: 15px; }
        .corner { position: absolute; width: 60px; height: 60px; }
        .corner-tl { top: 25px; left: 25px; border-top: 4px solid #4f46e5; border-left: 4px solid #4f46e5; }
        .corner-tr { top: 25px; right: 25px; border-top: 4px solid #4f46e5; border-right: 4px solid #4f46e5; }
        .corner-bl { bottom: 25px; left: 25px; border-bottom: 4px solid #4f46e5; border-left: 4px solid #4f46e5; }
        .corner-br { bottom: 25px; right: 25px; border-bottom: 4px solid #4f46e5; border-right: 4px solid #4f46e5; }
        @media print { body { background: white; } .cert { box-shadow: none; } }
      </style></head><body>
      <div class="cert">
        <div class="cert-border"></div>
        <div class="cert-border-inner"></div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        <div class="cert-content">
          <div class="cert-header">Certificate of Completion</div>
          <div class="cert-title">ประกาศนียบัตร</div>
          <div class="cert-subtitle">ขอมอบให้แก่</div>
          <div class="cert-name">${selectedCert.userName}</div>
          <div class="cert-course">ได้ผ่านการอบรมหลักสูตร</div>
          <div class="cert-course" style="font-weight:600;font-size:18px;color:#1e293b;">"${selectedCert.courseName}"</div>
          <div class="cert-date">วันที่ ${formatDate(selectedCert.courseDate)}</div>
          <div class="cert-org">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</div>
          <div class="cert-number">เลขที่ ${selectedCert.certificateNumber}</div>
        </div>
      </div>
      <script>setTimeout(()=>window.print(),500);<\/script>
      </body></html>
    `);
        printWindow.document.close();
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <h1 className="section-title">ประกาศนียบัตรของฉัน</h1>

            {certificates.length === 0 ? (
                <div className="text-center py-20 text-surface-500">
                    <HiOutlineDocumentText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>ยังไม่มีประกาศนียบัตร</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map(cert => (
                        <div key={cert.id} className="card">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center shrink-0">
                                    <HiOutlineDocumentText className="w-7 h-7 text-yellow-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white">{cert.courseName}</h3>
                                    <p className="text-xs text-surface-500 mt-1">เลขที่: {cert.certificateNumber}</p>
                                    <p className="text-xs text-surface-500">ออกเมื่อ: {formatDate(cert.issuedAt)}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => viewCertificate(cert)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                                            <HiOutlineDownload className="w-3.5 h-3.5" /> ดู/พิมพ์
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Certificate Preview Modal */}
            {selectedCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedCert(null)}>
                    <div className="bg-white rounded-2xl p-8 max-w-3xl w-full relative" onClick={e => e.stopPropagation()} ref={certRef}>
                        <div className="text-center border-4 border-primary-600 rounded-xl p-8 relative">
                            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary-600"></div>
                            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary-600"></div>
                            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary-600"></div>
                            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary-600"></div>
                            <p className="text-primary-600 text-sm tracking-widest uppercase">Certificate of Completion</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-2">ประกาศนียบัตร</h2>
                            <p className="text-gray-500 mt-4">ขอมอบให้แก่</p>
                            <p className="text-2xl font-bold text-primary-600 border-b-2 border-primary-600 inline-block mt-2 pb-1">{selectedCert.userName}</p>
                            <p className="text-gray-600 mt-4">ได้ผ่านการอบรมหลักสูตร</p>
                            <p className="text-lg font-semibold text-gray-800 mt-1">"{selectedCert.courseName}"</p>
                            <p className="text-gray-400 text-sm mt-4">วันที่ {formatDate(selectedCert.courseDate)}</p>
                            <p className="text-gray-500 text-xs mt-3">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                            <p className="text-gray-300 text-xs mt-1">เลขที่ {selectedCert.certificateNumber}</p>
                        </div>
                        <div className="flex justify-center gap-3 mt-6">
                            <button onClick={printCertificate} className="btn-primary flex items-center gap-2">
                                <HiOutlineDownload className="w-5 h-5" /> ดาวน์โหลด / พิมพ์
                            </button>
                            <button onClick={() => setSelectedCert(null)} className="btn-secondary">ปิด</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
