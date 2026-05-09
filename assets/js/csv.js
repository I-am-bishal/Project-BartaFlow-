// ── CSV VIEWER ────────────────────────────────────────────────────────────
// Depends on: utils.js (showToast, escHtml)

let csvData    = { headers: [], rows: [], filename: '' };
let csvSortCol = -1, csvSortAsc = true;

window.openCsvViewer = function () {
  document.getElementById('csv-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeCsvViewer = function () {
  document.getElementById('csv-overlay').classList.remove('open');
  document.body.style.overflow = '';
};

window.handleCsvDrop = function (e) {
  e.preventDefault();
  document.getElementById('csv-upload-area').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) handleCsvFile(file);
};

window.handleCsvFile = function (file) {
  if (!file)                         { showCsvError('No file selected.'); return; }
  if (!file.name.match(/\.(csv|txt)$/i)) { showCsvError('Invalid file type. Please upload a .csv or .txt file.'); return; }
  if (file.size === 0)               { showCsvError('The file is empty. Please upload a CSV with data.'); return; }
  if (file.size > 5 * 1024 * 1024)  { showCsvError('File too large (max 5MB). Please upload a smaller CSV.'); return; }
  const reader = new FileReader();
  reader.onload  = e => parseCsv(e.target.result, file.name);
  reader.onerror = () => showCsvError('Could not read file. Please try again.');
  reader.readAsText(file);
};

function parseCsv(text, filename) {
  try {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) { showCsvError('The file is empty or has no readable rows.'); return; }
    const parseRow = row => {
      const cells = []; let cur = '', inQ = false;
      for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (c === '"') { if (inQ && row[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
        else if (c === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
        else cur += c;
      }
      cells.push(cur.trim());
      return cells;
    };
    const headers = parseRow(lines[0]);
    if (headers.length < 1) { showCsvError('Could not detect column headers in the first row.'); return; }
    const rows = lines.slice(1).map(l => parseRow(l));
    if (!rows.length) { showCsvError('The CSV has headers but no data rows.'); return; }
    csvData = { headers, rows, filename: filename || 'data.csv' };
    renderCsvTable(csvData.rows);
    showToast('📊', 'Loaded ' + rows.length + ' rows from ' + csvData.filename);
  } catch (err) {
    showCsvError('Invalid CSV format: ' + err.message);
  }
}

window.loadSampleCsv = function () {
  const sample = `Name,Email,Company,Industry,Plan,Status,Revenue
Priya Rathod,priya@gmail.com,TravelMate Agency,Travel & Tourism,Professional,Active,₹2499
Arjun Mehta,arjun@gmail.com,FashionHub,E-Commerce,Enterprise,Active,₹4999
Sunita Kapoor,sunita@gmail.com,CarePoint Clinics,Healthcare,Professional,Active,₹2499
Raj Verma,raj@gmail.com,BrightMind Coaching,Education,Starter,Trial,₹999
Meena Sharma,meena@gmail.com,SpiceRoute Restaurant,Restaurant,Starter,Active,₹999
Karan Patel,karan@gmail.com,PropFirst Realty,Real Estate,Enterprise,Active,₹4999
Divya Singh,divya@gmail.com,FinEdge Advisors,Finance,Professional,Active,₹2499
Rohit Das,rohit@gmail.com,AutoDrive Motors,Automotive,Professional,Active,₹2499
Neha Joshi,neha@gmail.com,TalentFlow HR,HR & Recruitment,Starter,Active,₹999
Amit Kumar,amit@gmail.com,SwiftShip Logistics,Logistics,Enterprise,Paused,₹4999`;
  parseCsv(sample, 'sample-data.csv');
};

function renderCsvTable(rows, filter) {
  filter = filter || '';
  const main = document.getElementById('csv-main-content');
  if (!main) return;
  const h = csvData.headers;
  let filtered = filter
    ? rows.filter(r => r.some(c => (c || '').toLowerCase().includes(filter.toLowerCase())))
    : rows;

  if (csvSortCol >= 0) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[csvSortCol] || '', bv = b[csvSortCol] || '';
      const n  = parseFloat(av.replace(/[^0-9.]/g, '')), m = parseFloat(bv.replace(/[^0-9.]/g, ''));
      if (!isNaN(n) && !isNaN(m)) return csvSortAsc ? n - m : m - n;
      return csvSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  document.getElementById('csv-subtitle').textContent = csvData.filename + ' · ' + csvData.rows.length + ' rows · ' + h.length + ' columns';
  main.innerHTML = `
<div class="csv-toolbar">
  <input class="csv-search-box" placeholder="🔍 Search in data..." oninput="renderCsvTable(csvData.rows,this.value)" value="${escHtml(filter)}">
  <div class="csv-info-pill">${filtered.length} / ${csvData.rows.length} rows</div>
  <button class="csv-export-btn" onclick="exportCsvData()">⬇ Export CSV</button>
  <button class="csv-export-btn" style="background:var(--text3)" onclick="resetCsvViewer()">↺ Load New</button>
</div>
<div class="csv-body">
  ${filtered.length === 0 ? `<div class="csv-empty"><div class="csv-empty-icon">🔍</div>No rows match your search.</div>` : `
  <table class="csv-table">
    <thead><tr>${h.map((col, i) => `<th onclick="sortCsvCol(${i})" class="${csvSortCol === i ? 'sorted' : ''}">${escHtml(col)}<span class="sort-arrow">${csvSortCol === i ? (csvSortAsc ? '↑' : '↓') : '↕'}</span></th>`).join('')}</tr></thead>
    <tbody>${filtered.map(row => `<tr>${h.map((_, i) => `<td title="${escHtml(row[i] || '')}">${escHtml(row[i] || '—')}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`}
</div>`;
}
window.renderCsvTable = renderCsvTable;

window.sortCsvCol = function (col) {
  if (csvSortCol === col) csvSortAsc = !csvSortAsc; else { csvSortCol = col; csvSortAsc = true; }
  renderCsvTable(csvData.rows, document.querySelector('.csv-search-box')?.value || '');
};

window.exportCsvData = function () {
  if (!csvData.rows.length) { showToast('⚠️', 'No data to export'); return; }
  const lines = [csvData.headers.join(','), ...csvData.rows.map(r => r.map(c => '"' + (c || '').replace(/"/g, '""') + '"').join(','))];
  const blob  = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href = url; a.download = 'bartaflow-export-' + Date.now() + '.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('⬇', 'Exported ' + csvData.rows.length + ' rows');
};

window.resetCsvViewer = function () {
  csvData = { headers: [], rows: [], filename: '' };
  csvSortCol = -1; csvSortAsc = true;
  document.getElementById('csv-subtitle').textContent = 'Upload or load data.csv';
  const main = document.getElementById('csv-main-content');
  main.innerHTML = `<div class="csv-upload-area" id="csv-upload-area" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="handleCsvDrop(event)">
  <div class="csv-upload-icon">📁</div><div class="csv-upload-title">Load your data.csv file</div>
  <div class="csv-upload-sub">Drag & drop a CSV file here, or click to browse.<br>Supports any CSV with headers in the first row.</div>
  <input type="file" id="csv-file-input" accept=".csv,.txt" style="display:none" onchange="handleCsvFile(this.files[0])">
  <button class="csv-upload-btn" onclick="document.getElementById('csv-file-input').click()">📂 Browse File</button>
  <button class="csv-sample-btn" onclick="loadSampleCsv()">Load Sample Data</button>
</div>`;
};

function showCsvError(msg) {
  const main = document.getElementById('csv-main-content');
  main.innerHTML = `<div class="csv-error-box"><span style="font-size:18px;flex-shrink:0">⚠️</span><div><strong>Error loading file</strong><br>${escHtml(msg)}</div></div>
<div class="csv-upload-area" id="csv-upload-area" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="handleCsvDrop(event)">
  <div class="csv-upload-icon">📁</div><div class="csv-upload-title">Try another file</div>
  <div class="csv-upload-sub">Please check the file and try again, or load sample data.</div>
  <input type="file" id="csv-file-input" accept=".csv,.txt" style="display:none" onchange="handleCsvFile(this.files[0])">
  <button class="csv-upload-btn" onclick="document.getElementById('csv-file-input').click()">📂 Browse File</button>
  <button class="csv-sample-btn" onclick="loadSampleCsv()">Load Sample Data</button>
</div>`;
}
