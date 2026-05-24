import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmtINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const MAROON = [123, 30, 58];
const GOLD = [201, 162, 39];
const CREAM = [255, 248, 240];
const DEEP = [62, 12, 36];

export function downloadInvoice(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 40; // margin

  // ---------- Header band ----------
  doc.setFillColor(...MAROON);
  doc.rect(0, 0, W, 90, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 90, W, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Ilkal Kart', M, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Pure, Authentic, Genuine, Elegance — hand-picked from Ilkal village', M, 58);
  doc.text('care@ilkalkart.com  |  +91 90000 00000  |  www.ilkalkart.com', M, 72);

  // invoice meta on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TAX INVOICE', W - M, 42, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Invoice No: ${order.id}`, W - M, 58, { align: 'right' });
  doc.text(`Date: ${fmtDate(order.placedAt)}`, W - M, 72, { align: 'right' });

  // ---------- Billed To / Ship To ----------
  let y = 120;
  doc.setTextColor(...DEEP);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED & SHIPPED TO', M, y);
  doc.setDrawColor(...GOLD);
  doc.line(M, y + 4, M + 160, y + 4);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(order.contact.name, M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y += 14;
  const addrLines = [
    [order.addr.houseNo, order.addr.line1].filter(Boolean).join(', '),
    order.addr.line2,
    [order.addr.city, order.addr.district].filter(Boolean).join(', '),
    `${order.addr.state || ''} - ${order.addr.pin || ''}`,
    `Mobile: +91 ${order.contact.mobile}`,
    order.contact.email ? `Email: ${order.contact.email}` : null
  ].filter(Boolean);
  addrLines.forEach(l => { doc.text(l, M, y); y += 13; });

  // seller info (right column)
  let y2 = 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SOLD BY', W - M - 220, y2);
  doc.line(W - M - 220, y2 + 4, W - M - 60, y2 + 4);
  y2 += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Ilkal Kart', W - M - 220, y2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y2 += 14;
  ['Founder & Curator: Shiva',
   'Sourcing: Ilkal, Bagalkot, Karnataka',
   'GSTIN: 29AAAAA0000A1Z5 (sample)',
   'PAN: ABCDE1234F (sample)'
  ].forEach(l => { doc.text(l, W - M - 220, y2); y2 += 13; });

  // ---------- Items table ----------
  const tableTop = Math.max(y, y2) + 16;
  const gstRate = Number(order.gstRate) || 0;
  const gstPercent = order.gstPercent ?? Math.round(gstRate * 100);
  const halfPercent = (gstPercent / 2).toFixed(gstPercent % 2 === 0 ? 0 : 1);
  const rows = order.items.map((it, i) => {
    const lineTotal = it.qty * it.price;
    const baseAmt = gstRate > 0 ? +(lineTotal / (1 + gstRate)).toFixed(2) : lineTotal;
    const gst = +(lineTotal - baseAmt).toFixed(2);
    return [
      String(i + 1),
      `${it.name}\n${it.color || ''}`,
      it.qty,
      fmtINR(it.price),
      fmtINR(baseAmt),
      fmtINR(gst),
      fmtINR(lineTotal)
    ];
  });

  autoTable(doc, {
    startY: tableTop,
    head: [['#', 'Saree', 'Qty', 'Unit Price\n(incl. GST)', 'Taxable\nValue', `GST ${gstPercent}%`, 'Total']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
    bodyStyles: { fontSize: 9, textColor: DEEP, valign: 'middle' },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      0: { halign: 'center', cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 70 },
      4: { halign: 'right', cellWidth: 70 },
      5: { halign: 'right', cellWidth: 55 },
      6: { halign: 'right', cellWidth: 70 }
    },
    margin: { left: M, right: M }
  });

  // ---------- Totals box ----------
  let ty = doc.lastAutoTable.finalY + 16;
  const boxW = 220;
  const boxX = W - M - boxW;

  const row = (label, value, opts = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.bold ? 11 : 9);
    doc.setTextColor(...(opts.bold ? MAROON : DEEP));
    doc.text(label, boxX + 10, ty);
    doc.text(value, boxX + boxW - 10, ty, { align: 'right' });
    ty += opts.bold ? 18 : 14;
  };

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, ty - 12, boxW, 105, 6, 6);
  row('Taxable value', fmtINR(order.baseAmount));
  row(`CGST (${halfPercent}%)`, fmtINR(order.gstAmount / 2));
  row(`SGST (${halfPercent}%)`, fmtINR(order.gstAmount / 2));
  row('Sub-total', fmtINR(order.subtotal));
  row('Shipping', order.shipping ? fmtINR(order.shipping) : 'FREE');
  // separator
  doc.setDrawColor(...GOLD);
  doc.line(boxX + 8, ty - 6, boxX + boxW - 8, ty - 6);
  row('Total Paid', fmtINR(order.total), { bold: true });

  // amount in words
  ty += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...DEEP);
  doc.text(`Amount in words: ${numberToWords(order.total)} Rupees Only`, M, ty);

  // ---------- Footer ----------
  const footerY = doc.internal.pageSize.getHeight() - 70;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(M, footerY, W - M, footerY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...MAROON);
  doc.text('Thank you for choosing Pure, Authentic, Genuine, Elegance!', M, footerY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DEEP);
  doc.text('Each saree was hand-picked in person from Ilkal village in Karnataka.', M, footerY + 30);
  doc.text('Care: gentle dry-clean only. Store wrapped in muslin away from sunlight.', M, footerY + 42);
  doc.text('Prices are inclusive of GST. This is a computer-generated invoice and does not require a signature.', M, footerY + 54);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...GOLD);
  doc.text('Powered by: ServerPe App Solutions', M, footerY + 66);

  // Save
  doc.save(`IlkalKart_Invoice_${order.id}.pdf`);
}

/* ---------- Tiny Indian-style number-to-words for whole rupees ---------- */
function numberToWords(num) {
  num = Math.round(num);
  if (num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = n => n < 20 ? a[n] : `${b[Math.floor(n / 10)]}${n % 10 ? ' ' + a[n % 10] : ''}`;
  const three = n => {
    const h = Math.floor(n / 100), r = n % 100;
    return (h ? `${a[h]} Hundred${r ? ' ' : ''}` : '') + (r ? two(r) : '');
  };
  let out = '';
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh  = Math.floor(num / 100000);   num %= 100000;
  const thou  = Math.floor(num / 1000);     num %= 1000;
  if (crore) out += two(crore) + ' Crore ';
  if (lakh)  out += two(lakh) + ' Lakh ';
  if (thou)  out += two(thou) + ' Thousand ';
  if (num)   out += three(num);
  return out.trim();
}
