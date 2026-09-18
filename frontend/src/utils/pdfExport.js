import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

/**
 * Exports an HTML element to a PDF file.
 * @param {string} elementId - The ID of the HTML element to capture.
 * @param {string} filename - The name of the output PDF file (e.g., 'report.pdf').
 */
export const exportToPDF = async (elementId, filename = 'document.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error('ไม่พบส่วนที่ต้องการส่งออก PDF');
        return;
    }

    const toastId = toast.loading('กำลังสร้างไฟล์ PDF...');

    try {
        // Temporarily style for capture if needed (e.g., expand scrollable areas)
        const originalStyle = element.style.cssText;
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';

        const canvas = await html2canvas(element, {
            scale: 2, // High resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Restore original style
        element.style.cssText = originalStyle;

        const imgData = canvas.toDataURL('image/png');
        
        // A4 page dimensions in mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content is taller than one A4 page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(filename);
        toast.success('ดาวน์โหลด PDF สำเร็จ!', { id: toastId });
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('เกิดข้อผิดพลาดในการสร้าง PDF', { id: toastId });
    }
};
