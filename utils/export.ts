
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => void;
  }
}

interface PayoutData {
  author: string;
  articles: number;
  rate: number;
  type: string;
  lastArticleDate: string;
}

export const exportToCSV = (payouts: PayoutData[]) => {
  const headers = ['Author', 'Articles', 'Type', 'Rate (INR)', 'Last Article', 'Total (INR)'];
  const rows = payouts.map(payout => [
    payout.author,
    payout.articles,
    payout.type,
    payout.rate,
    new Date(payout.lastArticleDate).toLocaleDateString(),
    (payout.articles * payout.rate).toLocaleString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `payouts_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportToPDF = (payouts: PayoutData[]) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Payout Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

  const headers = [['Author', 'Articles', 'Type', 'Rate (INR)', 'Last Article', 'Total (INR)']];
  const data = payouts.map(payout => [
    payout.author,
    payout.articles.toString(),
    payout.type,
    payout.rate.toString(),
    new Date(payout.lastArticleDate).toLocaleDateString(),
    (payout.articles * payout.rate).toLocaleString()
  ]);

  doc.autoTable({
    head: headers,
    body: data,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [102, 16, 242] },
    columnStyles: {
      0: { cellWidth: 40 },  
      1: { cellWidth: 20 },  
      2: { cellWidth: 25 },  
      3: { cellWidth: 25 },  
      4: { cellWidth: 35 },  
      5: { cellWidth: 30 }   
    },
    margin: { left: 10, right: 10 }
  });

  doc.save(`payouts_${new Date().toISOString().split('T')[0]}.pdf`);
};