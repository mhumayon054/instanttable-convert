import { Download } from "lucide-react";

interface CSVDownloadProps {
  tableHTML: string;
  disabled?: boolean;
}

const CSVDownload = ({ tableHTML, disabled = false }: CSVDownloadProps) => {
  const convertTableToCSV = (html: string): string => {
    try {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const table = tempDiv.querySelector('table');
      if (!table) {
        throw new Error('No table found in the provided HTML');
      }
      
      const rows = Array.from(table.querySelectorAll('tr'));
      const csvRows: string[] = [];
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        const csvRow = cells.map(cell => {
          let cellText = cell.textContent || '';
          // Escape quotes and wrap in quotes if necessary
          if (cellText.includes(',') || cellText.includes('"') || cellText.includes('\n')) {
            cellText = '"' + cellText.replace(/"/g, '""') + '"';
          }
          return cellText;
        });
        csvRows.push(csvRow.join(','));
      });
      
      return csvRows.join('\n');
    } catch (error) {
      throw new Error('Failed to parse table: ' + (error as Error).message);
    }
  };

  const downloadCSV = () => {
    try {
      const csvContent = convertTableToCSV(tableHTML);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `table-export-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message (you could replace this with a toast)
      alert('CSV file downloaded successfully!');
    } catch (error) {
      alert('Error converting table: ' + (error as Error).message);
    }
  };

  return (
    <button
      onClick={downloadCSV}
      disabled={disabled || !tableHTML.trim()}
      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center justify-center space-x-2 w-full sm:w-auto"
    >
      <Download className="w-5 h-5" />
      <span>Download CSV</span>
    </button>
  );
};

export default CSVDownload;