const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'hospital_coordinates.json');
const csvPath = path.join(__dirname, 'hospital_coordinates.csv');

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Define columns for CSV
  const headers = ['id', 'hospital_id', 'name', 'slug', 'address', 'province', 'latitude', 'longitude', 'map_url', 'status'];
  
  // Helper to escape double quotes and wrap in quotes if necessary
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const item of data) {
    const row = headers.map(header => escapeCsv(item[header]));
    csvRows.push(row.join(','));
  }
  
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
  console.log(`Successfully converted JSON to CSV! Saved at: ${csvPath}`);
} catch (error) {
  console.error('Error converting file to CSV:', error.message);
}
