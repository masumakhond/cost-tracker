import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExpenseEntry, ExpenseCategory, SpenderSummary } from './types';
import { monthLabel, formatAmount, buildSpenderSummary, buildCategorySummary } from './utils';
import { DEFAULT_CATEGORIES } from './constants';

export function downloadMonthlyCostPdf(
  monthId: string,
  entries: ExpenseEntry[],
  categories: ExpenseCategory[] = DEFAULT_CATEGORIES
) {
  const doc = new jsPDF();
  const summary: SpenderSummary = buildSpenderSummary(entries);
  const catSummary = buildCategorySummary(entries, categories);
  const title = `Cost Report — ${monthLabel(monthId)}`;

  // Header banner
  doc.setFillColor(15, 118, 110); // Brand teal-700
  doc.rect(0, 0, 210, 30, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('FAMILY COST & EXPENSE TRACKER', 14, 15);

  doc.setFontSize(11);
  doc.setTextColor(204, 251, 241); // teal-100
  doc.text(title, 14, 23);

  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 140, 23);

  // Summary Metrics Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 36, 182, 22, 3, 3, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.text('TOTAL SPENT', 20, 43);
  doc.text("MASUM'S SHARE", 70, 43);
  doc.text("TOYEEBA'S SHARE", 115, 43);
  doc.text('SHARED EXPENSE', 160, 43);

  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text(formatAmount(summary.total), 20, 52);

  doc.setTextColor(30, 41, 59);
  doc.text(formatAmount(summary.masum), 70, 52);
  doc.text(formatAmount(summary.toyeeba), 115, 52);
  doc.text(formatAmount(summary.shared), 160, 52);

  // Category Breakdown Table
  const catRows = catSummary.map((c) => [
    c.category.label,
    `${c.count} items`,
    `${c.percentage}%`,
    formatAmount(c.amount),
  ]);

  autoTable(doc, {
    startY: 64,
    head: [['Category', 'Count', 'Share', 'Amount']],
    body: catRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
  });

  // Detailed Expense Items Table
  const sortedEntries = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const catMap = new Map(categories.map((c) => [c.id, c.label]));

  const itemRows = sortedEntries.map((e, idx) => [
    idx + 1,
    e.date,
    e.title,
    catMap.get(e.category) || e.category,
    e.spentBy,
    e.paymentMethod,
    formatAmount(e.amount),
    e.note || '-',
  ]);

  // @ts-ignore
  const nextY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 120;

  autoTable(doc, {
    startY: nextY,
    head: [['#', 'Date', 'Expense Title', 'Category', 'Spender', 'Method', 'Amount', 'Note']],
    body: itemRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 24 },
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
  const yearEntries = entries.filter((e) => (e.date || '').startsWith(year));
  const totalSpent = yearEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const masumTotal = yearEntries.filter((e) => e.spentBy === 'Masum').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const toyeebaTotal = yearEntries.filter((e) => e.spentBy === 'Toyeeba').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const sharedTotal = yearEntries.filter((e) => e.spentBy === 'Shared').reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // Header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`ANNUAL EXPENSE STATEMENT — ${year}`, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Family Annual Expense Ledger • Total: ${formatAmount(totalSpent)}`, 14, 23);

  // Month-by-month table
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const mStr = String(i + 1).padStart(2, '0');
    const mId = `${year}-${mStr}`;
    const mEntries = yearEntries.filter((e) => e.monthId === mId || (e.date || '').startsWith(mId));
    const mSummary = buildSpenderSummary(mEntries);
    return [
      mId,
      mEntries.length,
      formatAmount(mSummary.masum),
      formatAmount(mSummary.toyeeba),
      formatAmount(mSummary.shared),
      formatAmount(mSummary.total),
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['Month', 'Entries', 'Masum', 'Toyeeba', 'Shared', 'Total Spent']],
    body: monthsData,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
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

