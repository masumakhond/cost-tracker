import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExpenseEntry, ExpenseCategory, SpenderSummary, LoanEntry } from './types';
import { monthLabel, buildSpenderSummary, buildCategorySummary } from './utils';
import { DEFAULT_CATEGORIES } from './constants';

// Format currency safely for jsPDF without Unicode glyph corruption
export function formatPdfMoney(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return `Tk ${Math.round(num).toLocaleString('en-US')}`;
}

// Bengali transliteration map for clean rendering in Standard PDF fonts (Helvetica)
const BENGALI_CHAR_MAP: Record<string, string> = {
  'অ': 'O', 'আ': 'A', 'ই': 'I', 'ঈ': 'I', 'উ': 'U', 'ঊ': 'U', 'ঋ': 'Ri',
  'এ': 'E', 'ঐ': 'Oi', 'ও': 'O', 'ঔ': 'Ou',
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': '', 'ঁ': '',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri',
  'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': '',
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  '৳': 'Tk ',
};

export function cleanTextForPdf(text: string): string {
  if (!text) return '';

  // 1. If text contains English in parentheses like "বাজার ও মুদি (Groceries)", extract the English part
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch && /[A-Za-z]/.test(parenMatch[1])) {
    return parenMatch[1].trim();
  }

  // 2. Check if string has Bengali characters (Unicode range \u0980-\u09FF)
  if (/[\u0980-\u09FF]/.test(text)) {
    let transliterated = '';
    for (const char of text) {
      if (BENGALI_CHAR_MAP[char] !== undefined) {
        transliterated += BENGALI_CHAR_MAP[char];
      } else if (char.charCodeAt(0) < 128) {
        transliterated += char;
      }
    }
    const clean = transliterated.replace(/\s+/g, ' ').trim();
    // Capitalize first letter of each word
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // 3. Remove non-ASCII characters that cause mojibake in jsPDF
  return text.replace(/[^\x20-\x7E]/g, '').trim();
}

export function downloadMonthlyCostPdf(
  monthId: string,
  entries: ExpenseEntry[],
  categories: ExpenseCategory[] = DEFAULT_CATEGORIES
) {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'normal');

  const summary: SpenderSummary = buildSpenderSummary(entries);
  const catSummary = buildCategorySummary(entries, categories);
  const title = `Cost Report — ${monthLabel(monthId)}`;

  // Header Banner
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, 210, 30, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('FAMILY COST & EXPENSE TRACKER', 14, 15);

  doc.setFontSize(11);
  doc.setTextColor(204, 251, 241); // Teal-100
  doc.text(title, 14, 23);

  doc.setFontSize(9);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
    140,
    23
  );

  // Summary Metrics Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 35, 182, 22, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('TOTAL SPENT', 20, 42);
  doc.text("MASUM'S SHARE", 68, 42);
  doc.text("TOYEEBA'S SHARE", 114, 42);
  doc.text('SHARED EXPENSE', 158, 42);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(formatPdfMoney(summary.total), 20, 51);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(formatPdfMoney(summary.masum), 68, 51);
  doc.text(formatPdfMoney(summary.toyeeba), 114, 51);
  doc.text(formatPdfMoney(summary.shared), 158, 51);

  // Category Breakdown Table
  const catRows = catSummary.map((c) => {
    const label = c.category.englishLabel || cleanTextForPdf(c.category.label);
    return [
      label,
      `${c.count} items`,
      `${c.percentage}%`,
      formatPdfMoney(c.amount),
    ];
  });

  autoTable(doc, {
    startY: 63,
    head: [['Category', 'Count', 'Share', 'Amount']],
    body: catRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: { fontSize: 8.5, cellPadding: 2.5, font: 'helvetica' },
    columnStyles: {
      0: { cellWidth: 92 },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
  });

  // Detailed Expense Items Table
  const sortedEntries = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const catMap = new Map(
    categories.map((c) => [c.id, c.englishLabel || cleanTextForPdf(c.label)])
  );

  const itemRows = sortedEntries.map((e, idx) => [
    idx + 1,
    e.date,
    cleanTextForPdf(e.title) || 'Expense',
    catMap.get(e.category) || cleanTextForPdf(e.category),
    e.spentBy,
    e.paymentMethod,
    formatPdfMoney(e.amount),
    cleanTextForPdf(e.note) || '-',
  ]);

  // @ts-ignore
  const nextY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 120;

  autoTable(doc, {
    startY: nextY,
    head: [['#', 'Date', 'Expense Title', 'Category', 'Spender', 'Method', 'Amount', 'Note']],
    body: itemRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: { fontSize: 8, cellPadding: 2.2, font: 'helvetica' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 20 },
    },
  });

  doc.save(`cost-report-${monthId}.pdf`);
}

export function downloadAnnualCostPdf(
  year: string,
  entries: ExpenseEntry[],
  categories: ExpenseCategory[] = DEFAULT_CATEGORIES
) {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'normal');

  const yearEntries = entries.filter((e) => (e.date || '').startsWith(year));
  const totalSpent = yearEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`ANNUAL EXPENSE STATEMENT — ${year}`, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Family Annual Expense Ledger • Total: ${formatPdfMoney(totalSpent)}`, 14, 23);

  // Month-by-month table
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const mStr = String(i + 1).padStart(2, '0');
    const mId = `${year}-${mStr}`;
    const mEntries = yearEntries.filter((e) => e.monthId === mId || (e.date || '').startsWith(mId));
    const mSummary = buildSpenderSummary(mEntries);
    return [
      mId,
      mEntries.length,
      formatPdfMoney(mSummary.masum),
      formatPdfMoney(mSummary.toyeeba),
      formatPdfMoney(mSummary.shared),
      formatPdfMoney(mSummary.total),
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['Month', 'Entries', 'Masum', 'Toyeeba', 'Shared', 'Total Spent']],
    body: monthsData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: { fontSize: 8.5, cellPadding: 2.5, font: 'helvetica' },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
  });

  doc.save(`annual-cost-statement-${year}.pdf`);
}

export function downloadLoanStatementPdf(loans: LoanEntry[]) {
  const doc = new jsPDF();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(15, 118, 110);
  doc.text('Loan & Debt Statement', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${todayStr} | Masum & Toyeeba Personal Finance`, 14, 25);

  const lentLoans = loans.filter((l) => l.type === 'lent');
  const borrowedLoans = loans.filter((l) => l.type === 'borrowed');

  const totalLent = lentLoans.reduce((s, l) => s + l.amount, 0);
  const totalLentPaid = lentLoans.reduce((s, l) => s + (l.paidAmount || 0), 0);
  const totalLentRemaining = Math.max(0, totalLent - totalLentPaid);

  const totalBorrowed = borrowedLoans.reduce((s, l) => s + l.amount, 0);
  const totalBorrowedPaid = borrowedLoans.reduce((s, l) => s + (l.paidAmount || 0), 0);
  const totalBorrowedRemaining = Math.max(0, totalBorrowed - totalBorrowedPaid);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 30, 182, 22, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 182, 22, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Total Lent (To Receive): ${formatPdfMoney(totalLentRemaining)}`, 20, 39);
  doc.setTextColor(225, 29, 72);
  doc.text(`Total Borrowed (To Pay): ${formatPdfMoney(totalBorrowedRemaining)}`, 20, 47);

  const net = totalLentRemaining - totalBorrowedRemaining;
  doc.setTextColor(net >= 0 ? 15 : 225, net >= 0 ? 118 : 29, net >= 0 ? 110 : 72);
  doc.text(`Net Position: ${net >= 0 ? '+' : ''}${formatPdfMoney(net)}`, 120, 43);

  let currentY = 60;

  // Section 1: Money Lent (Borrowers)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`1. Money Lent to Borrowers (Total: ${formatPdfMoney(totalLent)})`, 14, currentY);

  const lentRows = lentLoans.map((l) => [
    l.date,
    cleanTextForPdf(l.personName),
    formatPdfMoney(l.amount),
    formatPdfMoney(l.paidAmount || 0),
    formatPdfMoney(Math.max(0, l.amount - (l.paidAmount || 0))),
    l.status.toUpperCase(),
    cleanTextForPdf(l.note || '-'),
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Date', "Borrower's Name", 'Amount', 'Returned', 'Due', 'Status', 'Note']],
    body: lentRows.length > 0 ? lentRows : [['-', 'No lent records', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
  });

  // Section 2: Money Borrowed (Lenders)
  const lastTable = (doc as any).lastAutoTable;
  currentY = (lastTable ? lastTable.finalY : currentY) + 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`2. Money Borrowed from Lenders (Total: ${formatPdfMoney(totalBorrowed)})`, 14, currentY);

  const borrowedRows = borrowedLoans.map((l) => [
    l.date,
    cleanTextForPdf(l.personName),
    formatPdfMoney(l.amount),
    formatPdfMoney(l.paidAmount || 0),
    formatPdfMoney(Math.max(0, l.amount - (l.paidAmount || 0))),
    l.status.toUpperCase(),
    cleanTextForPdf(l.note || '-'),
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Date', "Lender's Name", 'Amount', 'Repaid', 'Due', 'Status', 'Note']],
    body: borrowedRows.length > 0 ? borrowedRows : [['-', 'No borrowed records', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [190, 24, 93], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
  });

  doc.save(`loan-statement-${todayStr}.pdf`);
}
