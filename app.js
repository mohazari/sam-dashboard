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
  document.getElementById('kpi-imported').textContent = formatNumber(monthly.imported);
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

  // Weekly table
  populateWeeklyTable();

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

// --- Weekly Table ---
function populateWeeklyTable() {
  const tbody = document.getElementById('weekly-table-body');
  tbody.innerHTML = '';

  let totals = { storeleads: 0, builtwith_ecomm: 0, builtwith_wp: 0, recycled: 0, all: 0 };

  sampleData.assignments.forEach(row => {
    const total = row.storeleads + row.builtwith_ecomm + row.builtwith_wp + row.recycled;
    totals.storeleads += row.storeleads;
    totals.builtwith_ecomm += row.builtwith_ecomm;
    totals.builtwith_wp += row.builtwith_wp;
    totals.recycled += row.recycled;
    totals.all += total;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${formatNumber(row.storeleads)}</td>
      <td>${formatNumber(row.builtwith_ecomm)}</td>
      <td>${formatNumber(row.builtwith_wp)}</td>
      <td>${formatNumber(row.recycled)}</td>
      <td><strong>${formatNumber(total)}</strong></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('weekly-total-storeleads').textContent = formatNumber(totals.storeleads);
  document.getElementById('weekly-total-builtwith').textContent = formatNumber(totals.builtwith_ecomm);
  document.getElementById('weekly-total-wp').textContent = formatNumber(totals.builtwith_wp);
  document.getElementById('weekly-total-recycled').textContent = formatNumber(totals.recycled);
  document.getElementById('weekly-total-all').textContent = formatNumber(totals.all);
}

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

// --- Period Selector ---
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // In production, this would reload the table with different date ranges
  });
});

// --- Init ---
document.addEventListener('DOMContentLoaded', populateDashboard);
