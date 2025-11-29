/**
 * Date utility functions for resume dates
 */

/**
 * Convert various date formats to yyyy-MM format
 * Handles: "Jan 2025", "2025", "2025-01", "Present", etc.
 */
export function normalizeDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  
  const trimmed = dateStr.trim().toLowerCase();
  
  // Handle "present" or "current"
  if (trimmed === 'present' || trimmed === 'current') {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  // Already in yyyy-MM format
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Handle "Mon YYYY" or "Month YYYY" format
  const monthYearMatch = dateStr.match(/([A-Za-z]{3})\s+(\d{4})/);
  if (monthYearMatch) {
    const monthStr = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    
    const months: { [key: string]: string } = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12',
    };
    
    const month = months[monthStr];
    if (month) {
      return `${year}-${month}`;
    }
  }
  
  // Handle just "YYYY" format
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }
  
  // Handle "YYYY-MM-DD" format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.substring(0, 7);
  }
  
  // If we can't parse it, return empty string
  return '';
}

/**
 * Convert yyyy-MM format to display format "Mon YYYY"
 */
export function formatDateDisplay(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  
  const [yearStr, monthStr] = dateStr.split('-');
  if (!yearStr || !monthStr) return dateStr || '';
  
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (month < 1 || month > 12) return dateStr;
  
  return `${months[month]} ${year}`;
}
