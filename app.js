// ============================================
// Sam Lead Research Agent — Dashboard App
// ============================================

// --- Navigation ---
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
  });
});

// --- Sample Data ---
// In production, this would be fetched from Sam's state files via an API
const sampleData = {
  // Daily assignment numbers from the Wishpond Instantly sheet (recent entries)
  assignments: [
    { date: '2026-03-10', storeleads: 3900, builtwith_ecomm: 0, builtwith_wp: 0, recycled: 0 },
    { date: '2026-03-11', storeleads: 0, builtwith_ecomm: 26300, builtwith_wp: 26500, recycled: 28100 },
    { date: '2026-03-12', storeleads: 21900, builtwith_ecomm: 0, builtwith_wp: 0, recycled: 0 },
    { date: '2026-03-13', storeleads: 4300, builtwith_ecomm: 10600, builtwith_wp: 26400, recycled: 10500 },
    { date: '2026-03-14', storeleads: 0, builtwith_ecomm: 12800, builtwith_wp: 0, recycled: 9700 },
    { date: '2026-03-15', storeleads: 8100, builtwith_ecomm: 0, builtwith_wp: 0, recycled: 0 },
    { date: '2026-03-16', storeleads: 14100, builtwith_ecomm: 3500, builtwith_wp: 5900, recycled: 11300 },
  ],

  // Pipeline funnel (cumulative from March 2026)
  funnel: {
    raw: 103580,
    posted: 88170,
    customized: 10358,
    imported: 34800,
  },

  // Today's targets
  today: {
    date: '2026-03-16',
    storeleads: { assigned: 14100, target: 5080 },
    builtwith_ecomm: { assigned: 3500, target: 5080 },
    builtwith_wp: { assigned: 5900, target: 5080 },
    recycled: { assigned: 11300, target: 5080 },
  },

  // Monthly aggregates
  monthly: {
    posted: 88170,
    customized: 10358,
    imported: 34800,
    customizationRate: 11.7,
  }
};

// --- Dashboard Population ---
function populateDashboard() {
  const today = sampleData.today;
  const monthly = sampleData.monthly;

  // KPIs
  document.getElementById('kpi-posted').textContent = formatNumber(sumColumn('storeleads') + sumColumn('builtwith_ecomm') + sumColumn('builtwith_wp') + sumColumn('recycled'));
  document.getElementById('kpi-customized').textContent = formatNumber(monthly.customized);
  var todayImported = today.storeleads.assigned + today.builtwith_ecomm.assigned + today.builtwith_wp.assigned + today.recycled.assigned;
  document.getElementById('kpi-imported').textContent = formatNumber(todayImported);
  var dailyTarget = 20320;
  var importedPct = Math.round((todayImported / dailyTarget) * 100);
  var pctEl = document.getElementById('kpi-imported-pct');
  if (pctEl) { pctEl.textContent = importedPct + '%'; }
  document.getElementById('kpi-rate').textContent = monthly.customizationRate + '%';

  // Date
  document.getElementById('target-date').textContent = today.date;

  // Target progress
  updateTarget('storeleads', today.storeleads);
  updateTarget('builtwith-ecomm', today.builtwith_ecomm);
  updateTarget('builtwith-wp', today.builtwith_wp);
  updateTarget('recycled', today.recycled);

  const totalAssigned = today.storeleads.assigned + today.builtwith_ecomm.assigned + today.builtwith_wp.assigned + today.recycled.assigned;
  const totalTarget = 20320;
  document.getElementById('target-total').textContent = formatNumber(totalAssigned);
  document.getElementById('progress-total').style.width = Math.min(100, (totalAssigned / totalTarget) * 100) + '%';

  // Funnel
  const funnel = sampleData.funnel;
  document.getElementById('funnel-raw').textContent = formatNumber(funnel.raw);
  document.getElementById('funnel-posted').textContent = formatNumber(funnel.posted);
  document.getElementById('funnel-customized').textContent = formatNumber(funnel.customized);
  document.getElementById('funnel-imported').textContent = formatNumber(funnel.imported);

  // Pipeline breakdown table
  populateBreakdownTable();

  // Health
  document.getElementById('health-queue').className = 'health-indicator green';
  document.getElementById('health-queue-text').textContent = '0 pending';

  // Charts
  renderDailyChart();
  renderDistributionChart();
}

function updateTarget(id, data) {
  const el = document.getElementById(`target-${id}`);
  const bar = document.getElementById(`progress-${id}`);
  if (el) el.textContent = formatNumber(data.assigned);
  if (bar) {
    const pct = Math.min(100, (data.assigned / data.target) * 100);
    bar.style.width = pct + '%';
  }
}

function sumColumn(col) {
  return sampleData.assignments.reduce((sum, row) => sum + row[col], 0);
}

function formatNumber(n) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString();
}

// --- Pipeline Breakdown Table ---

// Extended sample data with posted/received/assigned per source per day
var breakdownData = [
  { date: '2026-03-10', source: 'storeleads_ecommerce-mixed',   posted: 14800, received: 3451, assigned: 3900,  target: 5080 },
  { date: '2026-03-11', source: 'storeleads_ecommerce-mixed',   posted: 14800, received: 3451, assigned: 0,     target: 5080 },
  { date: '2026-03-11', source: 'builtwith_woocommerce-shopify', posted: 25000, received: 4200, assigned: 26300, target: 5080 },
  { date: '2026-03-11', source: 'builtwith_wordpress',          posted: 25000, received: 3900, assigned: 26500, target: 5080 },
  { date: '2026-03-11', source: 'recycled_recycled',            posted: 0,     received: 0,    assigned: 28100, target: 5080 },
  { date: '2026-03-12', source: 'storeleads_ecommerce-mixed',   posted: 14800, received: 3456, assigned: 21900, target: 5080 },
  { date: '2026-03-13', source: 'storeleads_ecommerce-mixed',   posted: 0,     received: 0,    assigned: 4300,  target: 5080 },
  { date: '2026-03-13', source: 'builtwith_woocommerce-shopify', posted: 11400, received: 1950, assigned: 10600, target: 5080 },
  { date: '2026-03-13', source: 'builtwith_wordpress',          posted: 11400, received: 1950, assigned: 26400, target: 5080 },
  { date: '2026-03-13', source: 'recycled_recycled',            posted: 0,     received: 0,    assigned: 10500, target: 5080 },
  { date: '2026-03-14', source: 'builtwith_woocommerce-shopify', posted: 0,     received: 0,    assigned: 12800, target: 5080 },
  { date: '2026-03-14', source: 'recycled_recycled',            posted: 0,     received: 0,    assigned: 9700,  target: 5080 },
  { date: '2026-03-15', source: 'storeleads_ecommerce-mixed',   posted: 0,     received: 0,    assigned: 8100,  target: 5080 },
  { date: '2026-03-16', source: 'storeleads_ecommerce-mixed',   posted: 0,     received: 0,    assigned: 14100, target: 5080 },
  { date: '2026-03-16', source: 'builtwith_woocommerce-shopify', posted: 0,     received: 0,    assigned: 3500,  target: 5080 },
  { date: '2026-03-16', source: 'builtwith_wordpress',          posted: 0,     received: 0,    assigned: 5900,  target: 5080 },
  { date: '2026-03-16', source: 'recycled_recycled',            posted: 0,     received: 0,    assigned: 11300, target: 5080 },
];

var sourceTargets = {
  'storeleads_ecommerce-mixed':   5080,
  'builtwith_woocommerce-shopify': 5080,
  'builtwith_wordpress':           5080,
  'recycled_recycled':             5080,
  'all':                           20320,
};

function populateBreakdownTable() {
  var sourceFilter = document.getElementById('breakdown-source').value;
  var fromDate = document.getElementById('breakdown-from').value;
  var toDate = document.getElementById('breakdown-to').value;

  // Aggregate by date
  var byDate = {};
  breakdownData.forEach(function(row) {
    if (row.date < fromDate || row.date > toDate) return;
    if (sourceFilter !== 'all' && row.source !== sourceFilter) return;

    if (!byDate[row.date]) {
      byDate[row.date] = { posted: 0, received: 0, assigned: 0 };
    }
    byDate[row.date].posted   += row.posted;
    byDate[row.date].received += row.received;
    byDate[row.date].assigned += row.assigned;
  });

  var dailyTarget = sourceFilter === 'all' ? sourceTargets['all'] : sourceTargets[sourceFilter] || 5080;

  var tbody = document.getElementById('breakdown-table-body');
  tbody.innerHTML = '';

  var totals = { posted: 0, received: 0, assigned: 0 };

  Object.keys(byDate).sort().forEach(function(date) {
    var row = byDate[date];
    var pct = row.assigned > 0 ? Math.round((row.assigned / dailyTarget) * 100) : 0;
    var pctClass = pct >= 100 ? 'pct-green' : pct >= 60 ? 'pct-yellow' : 'pct-red';

    totals.posted   += row.posted;
    totals.received += row.received;
    totals.assigned += row.assigned;

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + date + '</td>' +
      '<td>' + formatNumber(row.posted) + '</td>' +
      '<td>' + formatNumber(row.received) + '</td>' +
      '<td>' + formatNumber(row.assigned) + '</td>' +
      '<td><span class="pct-badge ' + pctClass + '">' + pct + '%</span></td>';
    tbody.appendChild(tr);
  });

  // Totals row
  var totalPct = totals.assigned > 0 ? Math.round((totals.assigned / (dailyTarget * Object.keys(byDate).length)) * 100) : 0;
  var totalPctClass = totalPct >= 100 ? 'pct-green' : totalPct >= 60 ? 'pct-yellow' : 'pct-red';

  document.getElementById('breakdown-total-posted').textContent   = formatNumber(totals.posted);
  document.getElementById('breakdown-total-received').textContent = formatNumber(totals.received);
  document.getElementById('breakdown-total-assigned').textContent = formatNumber(totals.assigned);
  document.getElementById('breakdown-total-pct').innerHTML = '<span class="pct-badge ' + totalPctClass + '">' + totalPct + '% avg</span>';
}

// Wire up filters
document.addEventListener('DOMContentLoaded', function() {
  var sourceEl = document.getElementById('breakdown-source');
  var fromEl   = document.getElementById('breakdown-from');
  var toEl     = document.getElementById('breakdown-to');
  if (sourceEl) sourceEl.addEventListener('change', populateBreakdownTable);
  if (fromEl)   fromEl.addEventListener('change', populateBreakdownTable);
  if (toEl)     toEl.addEventListener('change', populateBreakdownTable);
});

// --- Charts ---
function renderDailyChart() {
  const ctx = document.getElementById('chart-daily');
  if (!ctx) return;

  const labels = sampleData.assignments.map(r => r.date.slice(5)); // MM-DD
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Storeleads Ecomm',
          data: sampleData.assignments.map(r => r.storeleads),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Builtwith Ecomm',
          data: sampleData.assignments.map(r => r.builtwith_ecomm),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Builtwith WP',
          data: sampleData.assignments.map(r => r.builtwith_wp),
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Recycled',
          data: sampleData.assignments.map(r => r.recycled),
          backgroundColor: 'rgba(249, 115, 22, 0.7)',
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#8888a0',
            font: { family: "'Inter', sans-serif", size: 11 },
            boxWidth: 12,
            padding: 16,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#55556a', font: { size: 11 } },
        },
        y: {
          stacked: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#55556a',
            font: { size: 11 },
            callback: v => v >= 1000 ? (v / 1000) + 'K' : v,
          },
        },
      },
    },
  });
}

function renderDistributionChart() {
  const ctx = document.getElementById('chart-distribution');
  if (!ctx) return;

  const totals = {
    storeleads: sumColumn('storeleads'),
    builtwith_ecomm: sumColumn('builtwith_ecomm'),
    builtwith_wp: sumColumn('builtwith_wp'),
    recycled: sumColumn('recycled'),
  };

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Storeleads Ecomm', 'Builtwith Ecomm', 'Builtwith WP', 'Recycled'],
      datasets: [{
        data: [totals.storeleads, totals.builtwith_ecomm, totals.builtwith_wp, totals.recycled],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#8888a0',
            font: { family: "'Inter', sans-serif", size: 11 },
            boxWidth: 12,
            padding: 16,
          },
        },
      },
    },
  });
}

// (period selector replaced by date range picker)

// --- Init ---
document.addEventListener('DOMContentLoaded', populateDashboard);
