/**
 * Utility functions for exporting TanStack Table data to CSV and JSON formats.
 */

/**
 * Clean and format value for CSV
 */
function formatCSVValue(val) {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'object') {
    if (val instanceof Date) return `"${val.toISOString()}"`;
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }
  const stringVal = String(val);
  return `"${stringVal.replace(/"/g, '""')}"`;
}

/**
 * Export table data to CSV file
 * @param {import('@tanstack/react-table').Table} table
 * @param {string} filename
 * @param {Object} options
 */
export function exportTableToCSV(table, filename = 'table-export.csv', options = {}) {
  const { onlySelected = false, onlyVisibleColumns = true } = options;

  // Get columns
  const columns = onlyVisibleColumns
    ? table.getVisibleLeafColumns().filter((col) => col.id !== 'select' && col.id !== 'actions')
    : table.getAllLeafColumns().filter((col) => col.id !== 'select' && col.id !== 'actions');

  const headers = columns.map((col) => {
    if (typeof col.columnDef.header === 'string') {
      return col.columnDef.header;
    }
    return col.id;
  });

  // Get rows
  let rows = [];
  if (onlySelected) {
    rows = table.getSelectedRowModel().rows;
  } else {
    // If table has filtered rows, export filtered rows; otherwise all rows
    rows = table.getFilteredRowModel ? table.getFilteredRowModel().rows : table.getRowModel().rows;
  }

  if (rows.length === 0) {
    rows = table.getCoreRowModel().rows;
  }

  const csvRows = [];
  // Add header row
  csvRows.push(headers.map(formatCSVValue).join(','));

  // Add data rows
  for (const row of rows) {
    const rowData = columns.map((col) => {
      const cellValue = row.getValue(col.id);
      return formatCSVValue(cellValue);
    });
    csvRows.push(rowData.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // Add BOM for Excel UTF-8 support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export table data to JSON file
 * @param {import('@tanstack/react-table').Table} table
 * @param {string} filename
 * @param {Object} options
 */
export function exportTableToJSON(table, filename = 'table-export.json', options = {}) {
  const { onlySelected = false } = options;

  let rows = [];
  if (onlySelected) {
    rows = table.getSelectedRowModel().rows;
  } else {
    rows = table.getFilteredRowModel ? table.getFilteredRowModel().rows : table.getRowModel().rows;
  }

  if (rows.length === 0) {
    rows = table.getCoreRowModel().rows;
  }

  const data = rows.map((r) => r.original);
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
