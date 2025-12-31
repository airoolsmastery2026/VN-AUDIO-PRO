
/**
 * Reads a text file and returns its content as a string.
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string || "");
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Parses an Excel or CSV file using SheetJS (XLSX).
 * Assumes window.XLSX is available via CDN.
 */
export function parseExcelOrCsv(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        // @ts-ignore - XLSX is loaded via CDN in index.html
        const XLSX = (window as any).XLSX;
        
        if (!XLSX) {
          reject(new Error("XLSX library not loaded"));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Header: 1 returns array of arrays
        
        // Simple heuristic: If row 0 looks like headers, use sheet_to_json with default (keys)
        // Otherwise, treat as simple list
        const headers = jsonData[0] as string[];
        const hasTextHeader = headers.some((h: string) => h && h.toString().toLowerCase().includes('text'));
        
        if (hasTextHeader) {
           resolve(XLSX.utils.sheet_to_json(worksheet));
        } else {
           // Flatten array of arrays if it's just a list of texts in the first column
           const simpleList = jsonData.flat().filter((cell: any) => cell && typeof cell === 'string');
           resolve(simpleList.map((text: string) => ({ text })));
        }
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}
