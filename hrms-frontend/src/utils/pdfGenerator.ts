import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tenant, Holiday, Region } from '@/demo-data/seedData';

export interface GenerateHolidayPdfOptions {
  tenant: Tenant;
  holidays: Holiday[];
  region?: Region;
  year?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function generateHolidayListPDF({
  tenant,
  holidays,
  region,
  year = new Date().getFullYear(),
}: GenerateHolidayPdfOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. BRAND HEADER BAR
  doc.setFillColor(255, 105, 0); // #FF6900 Orange
  doc.rect(0, 0, pageWidth, 5, 'F');

  let currentY = 16;

  // 2. COMPANY LOGO / HEADER
  if (tenant.logoUrl && tenant.logoUrl.startsWith('data:image')) {
    try {
      doc.addImage(tenant.logoUrl, 'PNG', margin, currentY - 2, 28, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(20, 24, 33);
      doc.text(tenant.name, margin + 34, currentY + 4);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(20, 24, 33);
      doc.text(tenant.name, margin, currentY + 4);
    }
  } else {
    // Elegant text logo
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, currentY - 3, 12, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 105, 0);
    doc.text(tenant.name.charAt(0).toUpperCase(), margin + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 24, 33);
    doc.text(tenant.name, margin + 16, currentY + 4);
  }

  // Company Contact & Region Details (Right Side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const contactLines: string[] = [];
  if (tenant.websiteUrl) contactLines.push(`Web: ${tenant.websiteUrl.replace(/^https?:\/\//, '')}`);
  if (tenant.adminEmail) contactLines.push(`Contact: ${tenant.adminEmail}`);
  if (region?.name) contactLines.push(`Region: ${region.name}`);
  else if (tenant.timezone) contactLines.push(`TZ: ${tenant.timezone}`);

  let rightY = currentY - 1;
  contactLines.forEach((line) => {
    doc.text(line, pageWidth - margin, rightY, { align: 'right' });
    rightY += 4.5;
  });

  currentY += 16;

  // 3. DIVIDER
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // 4. DOCUMENT TITLE & YEAR BADGE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(200, 0, 161); // Dark Pink #C800A1
  doc.text(`Official Holiday Calendar — ${year}`, margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Published for all employees & contractors in ${region?.name || tenant.name}`, margin, currentY + 5);

  currentY += 12;

  // 5. GROUP HOLIDAYS MONTH-WISE
  const holidaysByMonth: Record<number, Holiday[]> = {};
  for (let m = 0; m < 12; m++) {
    holidaysByMonth[m] = [];
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Sort all holidays chronologically
  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  sortedHolidays.forEach((h) => {
    try {
      const parts = h.date.split('-');
      if (parts.length === 3) {
        const mIdx = parseInt(parts[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          holidaysByMonth[mIdx].push(h);
        }
      }
    } catch {
      // ignore
    }
  });

  const totalCommon = holidays.filter((h) => h.kind === 'COMMON').length;
  const totalFlexible = holidays.filter((h) => h.kind === 'FLEXIBLE').length;

  // Render Month Tables
  let hasRenderedMonths = false;

  for (let m = 0; m < 12; m++) {
    const monthHolidays = holidaysByMonth[m];
    if (!monthHolidays || monthHolidays.length === 0) continue;

    hasRenderedMonths = true;

    // Check if we need a page break
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    // Month Heading Banner
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 7.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${MONTH_NAMES[m]} ${year}`, margin + 3, currentY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${monthHolidays.length} Holiday${monthHolidays.length > 1 ? 's' : ''}`, pageWidth - margin - 3, currentY + 5.2, { align: 'right' });

    currentY += 9;

    // Table of holidays in this month
    const tableBody = monthHolidays.map((h) => {
      let dayName = '';
      let formattedDate = h.date;
      try {
        const parts = h.date.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        dayName = DAYS[d.getDay()] || '';
        formattedDate = `${MONTH_NAMES[m].substring(0, 3)} ${parts[2]}, ${parts[0]}`;
      } catch {
        // fallback
      }

      const isPast = h.date < todayStr;
      const statusText = isPast ? 'Passed' : 'Upcoming';
      const kindLabel = h.kind === 'COMMON' ? 'Common (Company-wide)' : 'Flexible Choice';

      return [formattedDate, dayName, h.name, kindLabel, statusText];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Date', 'Day', 'Holiday Name', 'Kind / Category', 'Status']],
      body: tableBody,
      theme: 'plain',
      styles: {
        fontSize: 8.5,
        cellPadding: 2.8,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [71, 85, 105],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 26, fontStyle: 'bold' },
        1: { cellWidth: 24 },
        2: { cellWidth: 'auto', fontStyle: 'bold' },
        3: { cellWidth: 42 },
        4: { cellWidth: 22, halign: 'center' },
      },
      didDrawCell: (data) => {
        // Subtle row bottom border
        if (data.row.index >= 0) {
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.2);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height
          );
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  if (!hasRenderedMonths) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('No holidays scheduled for this calendar period.', margin, currentY + 10);
    currentY += 20;
  }

  // 6. SUMMARY STATS BOX & FOOTER
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(159, 18, 57);
  doc.text('Policy Summary & Notes', margin + 3.5, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Total Holidays: ${holidays.length} (${totalCommon} Common Mandatory + ${totalFlexible} Flexible Options). Employees can select flexible holidays in the HR Portal.`,
    margin + 3.5,
    currentY + 11
  );

  // Page numbering and footer
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${tenant.name} Confidential — Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // 7. DOWNLOAD
  const cleanTenantName = tenant.slug || 'company';
  doc.save(`${cleanTenantName}-holiday-calendar-${year}.pdf`);
}
