/**
 * Export/Import utilities for the Admin PWA
 * Provides functionality to export data in various formats and import data
 */

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // If columns not specified, use all keys from first object
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        const cellValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value).replace(/"/g, '""')
          : String(value || '').replace(/"/g, '""');
        // Wrap in quotes if contains comma, newline, or quote
        return /[,\n"]/.test(cellValue) ? `"${cellValue}"` : cellValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data, filename, pretty = true) => {
  if (!data) {
    throw new Error('No data to export');
  }

  const jsonContent = pretty 
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Export data to Excel format (basic CSV that Excel can open)
 */
export const exportToExcel = (data, filename, columns = null) => {
  // Excel prefers UTF-8 BOM for proper character encoding
  const BOM = '\uFEFF';
  
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = columns || Object.keys(data[0]);
  
  const csvContent = BOM + [
    headers.join('\t'), // Use tabs for Excel compatibility
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const cellValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value)
          : String(value || '');
        return cellValue;
      }).join('\t')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.ms-excel');
};

/**
 * Export data to PDF format (basic table)
 */
export const exportToPDF = async (data, filename, title = '', columns = null) => {
  // This would typically use a library like jsPDF
  // For now, we'll create a simple HTML table that can be printed to PDF
  
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = columns || Object.keys(data[0]);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .export-info { color: #666; font-size: 12px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ''}
      <div class="export-info">
        Exported on: ${new Date().toLocaleString()}<br>
        Total records: ${data.length}
      </div>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => {
                const value = row[header];
                const cellValue = typeof value === 'object' && value !== null 
                  ? JSON.stringify(value)
                  : String(value || '');
                return `<td>${cellValue}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Auto-trigger print dialog
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Import data from CSV file
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('File must be a CSV file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }

        // Parse header
        const headers = parseCSVLine(lines[0]);
        
        // Parse data rows
        const data = lines.slice(1).map((line, index) => {
          const values = parseCSVLine(line);
          if (values.length !== headers.length) {
            console.warn(`Row ${index + 2} has ${values.length} values but expected ${headers.length}`);
          }
          
          const row = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });

        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Import data from JSON file
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      reject(new Error('File must be a JSON file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Validate imported data structure
 */
export const validateImportData = (data, requiredFields = [], dataType = 'records') => {
  const errors = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Data array cannot be empty');
    return { isValid: false, errors };
  }

  // Validate required fields in each record
  if (requiredFields.length > 0) {
    data.forEach((record, index) => {
      requiredFields.forEach(field => {
        if (!(field in record) || record[field] === null || record[field] === '') {
          errors.push(`Row ${index + 1}: Missing required field "${field}"`);
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      totalRecords: data.length,
      validRecords: data.length - errors.length,
      invalidRecords: errors.length
    }
  };
};

/**
 * Preview import data (first few rows)
 */
export const previewImportData = (data, maxRows = 5) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { headers: [], preview: [], total: 0 };
  }

  const headers = Object.keys(data[0]);
  const preview = data.slice(0, maxRows);

  return {
    headers,
    preview,
    total: data.length,
    hasMore: data.length > maxRows
  };
};

// Helper functions

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add final field
  result.push(current);
  
  return result;
};

/**
 * Download file to user's computer
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Format data for export based on type
 */
export const formatDataForExport = (data, type = 'users') => {
  if (!data || !Array.isArray(data)) return [];

  switch (type) {
    case 'users':
      return data.map(user => ({
        ID: user.id,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        Email: user.email,
        Phone: user.phone || '',
        Status: user.accountStatus,
        'ID Verified': user.idVerificationStatus,
        'Created Date': new Date(user.createdAt).toLocaleDateString(),
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      }));

    case 'bookings':
      return data.map(booking => ({
        ID: booking.id,
        'Service Type': booking.serviceType,
        'Customer Name': `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim(),
        'Customer Email': booking.user?.email || '',
        'Scheduled Date': new Date(booking.scheduledDate).toLocaleDateString(),
        Status: booking.status,
        'Payment Status': booking.paymentStatus,
        Amount: booking.totalAmount,
        'Created Date': new Date(booking.createdAt).toLocaleDateString()
      }));

    case 'services':
      return data.map(service => ({
        ID: service.id,
        Name: service.name,
        Category: service.category,
        Price: service.price,
        Duration: service.duration,
        'Is Active': service.isActive ? 'Yes' : 'No',
        'Is Featured': service.isFeatured ? 'Yes' : 'No',
        'Created Date': new Date(service.createdAt).toLocaleDateString()
      }));

    default:
      return data;
  }
};
