// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
var USERS = [
  {email:'admin@gmail.com', password:'Admin@123', name:'Admin User', plan:'Professional Plan', initials:'AD'},
  {email:'demo@gmail.com', password:'Demo@1234', name:'Demo User', plan:'Starter Plan', initials:'DU'},
];
var currentUser = null;

function hashPw(pw){ var h=5381; for(var i=0;i<pw.length;i++) h=(h*33)^pw.charCodeAt(i); return (h>>>0).toString(16); }

function doLogin(){
  var email = document.getElementById('lg-email').value.trim().toLowerCase();
  var pwd = document.getElementById('lg-password').value;
  var errEl = document.getElementById('lg-error');
  errEl.classList.remove('show');
  // Check localStorage registered users first
  var stored = [];
  try{ stored = JSON.parse(localStorage.getItem('bf_users')||'[]'); }catch(e){}
  var user = stored.find(function(u){ return u.email===email && hashPw(pwd)===u.password; })
    || USERS.find(function(u){ return u.email===email && u.password===pwd; });
  if(user){
    currentUser = user;
    var n = user.name || 'User';
    var initials = n.split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);
    document.getElementById('sb-initials').textContent = initials;
    document.getElementById('tb-initials').textContent = initials;
    document.getElementById('sb-name').textContent = n;
    document.getElementById('sb-plan').textContent = user.plan || 'Professional Plan';
    document.getElementById('profile-av').textContent = initials;
    document.getElementById('profile-name').textContent = n;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-plan-badge').textContent = user.plan || 'Professional Plan';
    if(document.getElementById('prof-name')) document.getElementById('prof-name').value = n;
    if(document.getElementById('prof-email')) document.getElementById('prof-email').value = user.email;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.add('active');
    // Restore theme
    var saved = localStorage.getItem('bf-dash-theme');
    if(saved==='dark'){ document.body.setAttribute('data-theme','dark'); document.getElementById('theme-btn').textContent='🌙'; }
    initCharts();
    populateProducts();
    populateLeadsDash();
  } else {
    errEl.classList.add('show');
    errEl.textContent = 'Invalid email or password. Try: admin@gmail.com / Admin@123';
    document.getElementById('lg-password').value = '';
  }
}
function doLogout(){
  currentUser = null;
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.remove('active');
}

// ════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════
var PAGE_TITLES = {
  overview:'Dashboard Overview',analytics:'Analytics & Reports',mybots:'My Bots',
  settings:'Bot Settings',products:'Product Catalog',leads:'Leads & CRM',
  broadcast:'Broadcast Campaigns',conversations:'Conversations',billing:'Billing & Invoices',profile:'Profile & Security'
};
function showPage(id, clickedEl){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.sb-item').forEach(function(i){ i.classList.remove('active'); });
  var page = document.getElementById('page-'+id);
  if(page) page.classList.add('active');
  if(clickedEl) clickedEl.classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[id] || id;
  // Lazy-init analytics charts
  if(id==='analytics') setTimeout(initAnalyticsCharts, 50);
  if(id==='broadcast') setTimeout(initBroadcastChart, 50);
}

// ════════════════════════════════════════
// DARK MODE
// ════════════════════════════════════════
function toggleDarkMode(){
  var isDark = document.body.getAttribute('data-theme')==='dark';
  if(isDark){ document.body.removeAttribute('data-theme'); localStorage.setItem('bf-dash-theme','light'); document.getElementById('theme-btn').textContent='☀️'; }
  else { document.body.setAttribute('data-theme','dark'); localStorage.setItem('bf-dash-theme','dark'); document.getElementById('theme-btn').textContent='🌙'; }
  // Reinit charts for dark mode
  setTimeout(function(){ Object.keys(chartInstances).forEach(function(k){ if(chartInstances[k]){ chartInstances[k].destroy(); chartInstances[k]=null; } }); initCharts(); }, 100);
}

// ════════════════════════════════════════
// TOAST
// ════════════════════════════════════════
var toastTimer;
function dashToast(icon, msg){
  var t=document.getElementById('dash-toast');
  document.getElementById('dash-toast-icon').textContent=icon;
  document.getElementById('dash-toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.remove('show'); },3200);
}

// ════════════════════════════════════════
// CHARTS (Chart.js)
// ════════════════════════════════════════
var chartInstances = {};
function isDark(){ return document.body.getAttribute('data-theme')==='dark'; }
function gridColor(){ return isDark() ? 'rgba(255,255,255,.06)' : 'rgba(10,22,40,.06)'; }
function textColor(){ return isDark() ? '#8b9ab8' : '#8a96b0'; }

function initCharts(){
  // Messages bar chart
  var ctx1 = document.getElementById('chart-messages');
  if(ctx1){
    if(chartInstances.messages) chartInstances.messages.destroy();
    chartInstances.messages = new Chart(ctx1, {
      type:'bar',
      data:{
        labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets:[{
          label:'Messages',
          data:[2800,3400,3100,4200,3900,5100,4821],
          backgroundColor:['rgba(10,22,40,.15)','rgba(10,22,40,.2)','rgba(10,22,40,.18)','rgba(10,22,40,.3)','rgba(10,22,40,.25)','rgba(10,22,40,.5)','rgba(10,22,40,.8)'],
          borderRadius:6,borderSkipped:false
        }]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return ' '+c.parsed.y.toLocaleString('en-IN')+' messages';}}}},scales:{x:{grid:{display:false},ticks:{color:textColor()}},y:{grid:{color:gridColor()},ticks:{color:textColor(),callback:function(v){return v>=1000?(v/1000).toFixed(1)+'k':v;}}}}}
    });
  }
  // Sources doughnut
  var ctx2 = document.getElementById('chart-sources');
  if(ctx2){
    if(chartInstances.sources) chartInstances.sources.destroy();
    chartInstances.sources = new Chart(ctx2, {
      type:'doughnut',
      data:{
        labels:['WhatsApp Bot','Demo Booking','Sign Up','Broadcast','Referral'],
        datasets:[{data:[45,22,18,10,5],backgroundColor:['#0a1628','#c9a84c','#10b981','#3b82f6','#8b5cf6'],borderWidth:2,borderColor:isDark()?'#1a2235':'#ffffff'}]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:textColor(),padding:12,font:{size:11,family:'DM Sans'}}}}}
    });
  }
}

function initAnalyticsCharts(){
  var ctx3 = document.getElementById('chart-revenue');
  if(ctx3 && !chartInstances.revenue){
    chartInstances.revenue = new Chart(ctx3, {
      type:'line',
      data:{
        labels:['Nov','Dec','Jan','Feb','Mar','Apr'],
        datasets:[{label:'Revenue (₹)',data:[85000,110000,145000,168000,210000,240000],borderColor:'#c9a84c',backgroundColor:'rgba(201,168,76,.08)',borderWidth:2.5,pointBackgroundColor:'#c9a84c',pointRadius:4,tension:.4,fill:true}]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:textColor()}},y:{grid:{color:gridColor()},ticks:{color:textColor(),callback:function(v){return '₹'+(v/1000).toFixed(0)+'K';}}}}}
    });
  }
  var ctx4 = document.getElementById('chart-funnel');
  if(ctx4 && !chartInstances.funnel){
    chartInstances.funnel = new Chart(ctx4, {
      type:'bar',
      data:{
        labels:['Visitors','WhatsApp Clicks','Bot Started','Lead Captured','Converted'],
        datasets:[{label:'Users',data:[12400,4800,3200,1800,612],backgroundColor:['rgba(10,22,40,.2)','rgba(10,22,40,.35)','rgba(10,22,40,.5)','rgba(10,22,40,.65)','rgba(10,22,40,.85)'],borderRadius:5,borderSkipped:false}]
      },
      options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{grid:{color:gridColor()},ticks:{color:textColor()}},y:{grid:{display:false},ticks:{color:textColor()}}}}
    });
  }
}

function initBroadcastChart(){
  var ctx5 = document.getElementById('chart-broadcast');
  if(ctx5 && !chartInstances.broadcast){
    chartInstances.broadcast = new Chart(ctx5, {
      type:'bar',
      data:{
        labels:['Diwali Sale','Bali Packages','NEET Promo','Health Camp'],
        datasets:[
          {label:'Open Rate',data:[78,62,91,45],backgroundColor:'rgba(10,22,40,.7)',borderRadius:4,borderSkipped:false},
          {label:'Click Rate',data:[24,18,34,12],backgroundColor:'rgba(201,168,76,.7)',borderRadius:4,borderSkipped:false}
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{color:textColor(),font:{size:11}}}},scales:{x:{grid:{display:false},ticks:{color:textColor()}},y:{grid:{color:gridColor()},ticks:{color:textColor(),callback:function(v){return v+'%';}}}}}
    });
  }
}

// ════════════════════════════════════════
// PRODUCTS TABLE
// ════════════════════════════════════════
var PRODUCTS = [
  {emoji:'🏝️',name:'Bali 6D/5N Package',sku:'PKG-001',cat:'Travel Package',price:'₹65,000',stock:'Available',status:'active'},
  {emoji:'🗼',name:'Paris + Rome + Amsterdam',sku:'PKG-002',cat:'Travel Package',price:'₹1,20,000',stock:'Limited',status:'active'},
  {emoji:'🏔️',name:'Himachal Winter Package',sku:'PKG-003',cat:'Travel Package',price:'₹28,500',stock:'Available',status:'active'},
  {emoji:'👟',name:'Nike Air Force 1',sku:'SHO-001',cat:'Footwear',price:'₹2,499',stock:'In Stock',status:'active'},
  {emoji:'👜',name:'Canvas Tote Bag',sku:'BAG-001',cat:'Accessories',price:'₹899',stock:'Low Stock',status:'active'},
  {emoji:'📚',name:'UPSC Coaching 12M',sku:'EDU-001',cat:'Education',price:'₹35,000',stock:'Unlimited',status:'active'},
  {emoji:'🏥',name:'Annual Health Checkup',sku:'HLT-001',cat:'Healthcare',price:'₹3,500',stock:'Slots Available',status:'active'},
];
function populateProducts(){
  var tbody = document.getElementById('products-table-body');
  if(!tbody) return;
  tbody.innerHTML = PRODUCTS.map(function(p){
    return '<tr><td><div style="display:flex;align-items:center;gap:10px"><div class="product-img">'+p.emoji+'</div><div><div class="product-name">'+p.name+'</div><div class="product-sku">'+p.sku+'</div></div></div></td>'
      +'<td><span class="badge badge-navy">'+p.cat+'</span></td>'
      +'<td style="font-weight:600;color:var(--navy);font-family:\'DM Mono\',monospace">'+p.price+'</td>'
      +'<td style="font-size:12px;font-family:\'DM Mono\',monospace;color:var(--text3)">'+p.stock+'</td>'
      +'<td><span class="badge badge-green">Active</span></td>'
      +'<td><button class="prod-edit-btn" onclick="dashToast(\'✏️\',\'Editing '+p.name+'...\')">Edit</button></td>'
      +'</tr>';
  }).join('');
}

// ════════════════════════════════════════
// LEADS TABLE (reads from localStorage)
// ════════════════════════════════════════
var SAMPLE_LEADS = [
  {name:'Priya Rathod',email:'priya@travelmate.in',phone:'+91 98765 43210',company:'TravelMate Agency',industry:'Travel & Tourism',source:'demo',score:87,value:'₹89,000'},
  {name:'Arjun Mehta',email:'arjun@fashionhub.com',phone:'+91 87654 32109',company:'FashionHub',industry:'E-Commerce',source:'signup',score:72,value:'₹12,400'},
  {name:'Dr. Sunita Kapoor',email:'sunita@carepoint.in',phone:'+91 76543 21098',company:'CarePoint Clinics',industry:'Healthcare',source:'demo',score:94,value:'₹8,200'},
  {name:'Raj Verma',email:'raj@brightmind.edu',phone:'+91 65432 10987',company:'BrightMind Coaching',industry:'Education',source:'chatbot',score:45,value:'₹4,999'},
  {name:'Meena Sharma',email:'meena@spiceroute.com',phone:'',company:'SpiceRoute Restaurant',industry:'Restaurant',source:'contact',score:80,value:'₹15,000'},
];
let ALL_LEADS = [];

async function populateLeadsDash() {
  let backendLeads = [];
  try {
    const response = await fetch('http://localhost:5000/api/leads');
    if (response.ok) {
      backendLeads = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch backend leads:', error);
  }

  const mappedBackend = backendLeads.map(l => ({
    name: l.name || 'Anonymous',
    email: l.email || '',
    phone: l.phone || '',
    company: l.company || '',
    industry: l.industry || '',
    source: l.source || 'chatbot',
    score: Math.floor(40 + Math.random() * 55),
    value: '₹' + Math.floor(5000 + Math.random() * 50000).toLocaleString('en-IN')
  }));

  ALL_LEADS = SAMPLE_LEADS.concat(mappedBackend);
  
  const badge = document.getElementById('sb-leads-count');
  if (badge) badge.textContent = ALL_LEADS.length;
  
  renderLeadsDashTable(ALL_LEADS);
}

function renderLeadsDashTable(leads){
  var tbody = document.getElementById('leads-table-body');
  if(!tbody) return;
  var srcBadge = {demo:'badge-blue',signup:'badge-green',chatbot:'badge-amber',contact:'badge-navy',payment:'badge-rose'};
  var srcLabel = {demo:'Demo',signup:'Signup',chatbot:'Chatbot',contact:'Contact',payment:'Payment'};
  tbody.innerHTML = leads.map(function(l){
    var scoreColor = l.score>=80?'var(--rose)':l.score>=60?'var(--amber)':'var(--text3)';
    return '<tr>'
      +'<td><div style="font-weight:600;font-size:13px;color:var(--text)">'+escHtmlDash(l.name)+'</div><div style="font-size:10px;font-family:\'DM Mono\',monospace;color:var(--text3)">'+escHtmlDash(l.email)+'</div></td>'
      +'<td style="font-size:12px">'+escHtmlDash(l.company)+'</td>'
      +'<td><span class="badge badge-navy">'+escHtmlDash(l.industry)+'</span></td>'
      +'<td><span class="badge '+(srcBadge[l.source]||'badge-navy')+'">'+((srcLabel[l.source]||l.source))+'</span></td>'
      +'<td style="font-weight:700;font-family:\'DM Mono\',monospace;color:'+scoreColor+'">'+l.score+'%</td>'
      +'<td style="font-weight:600;color:var(--green);font-family:\'DM Mono\',monospace">'+escHtmlDash(l.value)+'</td>'
      +'<td><button class="prod-edit-btn" onclick="dashToast(\'📞\',\'Calling '+escHtmlDash(l.name)+'...\')">Follow Up</button></td>'
      +'</tr>';
  }).join('');
}
function filterLeadsDash(){
  var q = (document.getElementById('leads-search-dash').value||'').toLowerCase();
  var src = document.getElementById('leads-filter-dash').value;
  var filtered = ALL_LEADS.filter(function(l){
    var match = !q || (l.name+l.email+l.company+l.industry).toLowerCase().includes(q);
    var srcMatch = !src || l.source===src;
    return match && srcMatch;
  });
  renderLeadsDashTable(filtered);
}
function exportLeadsDash(){
  var csv = ['Name,Email,Phone,Company,Industry,Source,Score,Value'].concat(ALL_LEADS.map(function(l){
    return [l.name,l.email,l.phone,l.company,l.industry,l.source,l.score+'%',l.value].map(function(v){return '"'+(v||'').replace(/"/g,'""')+'"';}).join(',');
  })).join('\n');
  var blob = new Blob([csv],{type:'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href=url; a.download='bartaflow-leads-'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  URL.revokeObjectURL(url);
  dashToast('⬇','Exported '+ALL_LEADS.length+' leads as CSV');
}

function escHtmlDash(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Share lead data with main site localStorage key
(function(){
  // Store leads for admin to read from bf_leads_main
  var mainLeads = [];
  try{ mainLeads = JSON.parse(localStorage.getItem('bf_leads')||'[]'); }catch(e){}
  if(mainLeads.length) localStorage.setItem('bf_leads_main', JSON.stringify(mainLeads));
})();

// ESC key
document.addEventListener('keydown', function(e){ if(e.key==='Enter' && document.getElementById('lg-email')===document.activeElement) doLogin(); });