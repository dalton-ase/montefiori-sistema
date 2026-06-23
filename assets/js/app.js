/**
 * ============================================================
 * ALIANZA CRM — app.js
 * Estado global, autenticación, navegación y utilidades
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

const APP = { token:null, user:null, config:null, dashboard:null, paginaActual:null, permisos:{} };

/* LOADER */
function showLoader(txt='CARGANDO') {
  const el = document.getElementById('loader');
  el.querySelector('.loader-txt').textContent = txt;
  el.classList.add('active');
}
function hideLoader() { document.getElementById('loader').classList.remove('active'); }

/* TOAST */
function toast(msg, tipo='ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show type-${tipo}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3400);
}

/* RELOJ */
function actualizarReloj() {
  const el = document.getElementById('topbar-time');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('es-CO', {
    weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'
  });
}

/* FORMATO */
function getInitials(n) { if(!n) return '?'; const p=n.trim().split(' '); return (p[0][0]+(p[1]?.[0]||'')).toUpperCase(); }
function formatCOP(v)   { if(!v&&v!==0) return '—'; return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v); }
function formatFecha(f) { if(!f) return '—'; return new Date(f).toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function formatFechaHora(f) { if(!f) return '—'; return new Date(f).toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function diasDesde(f)   { if(!f) return '—'; const d=Math.floor((new Date()-new Date(f))/86400000); return d===0?'Hoy':d===1?'Ayer':`Hace ${d}d`; }
function pipelineBadge(e) { const c=(e||'').replace(/ /g,'-'); return `<span class="badge pip-${c}">${e||'—'}</span>`; }

/* PERMISOS — Sistema dinámico con fallback por área */
const ACCESO_LEGACY = {
  clientes:     { areas: null },
  negocios:     { areas: ['Comercial','Juridica','Cartera','Gerencia'] },
  gestiones:    { areas: null },
  tareas:       { areas: null },
  eventos:      { areas: ['Juridica','Cartera','Gerencia'] },
  proyectos:    { areas: ['Comercial','Obra','Gerencia'] },
  funcionarios: { areas: ['TH','Gerencia'] },
  director:     { areas: ['Gerencia'] },
  config:       { areas: ['Gerencia'] },
  bienes:       { areas: ['Administracion','Gerencia'] },
  mantenimiento:{ areas: ['Administracion','Obra','Gerencia'] },
  permisos:     { areas: ['Gerencia'] }
};

function puedeAcceder(modulo) {
  if (!APP.user) return false;
  if (APP.user.rol === 'Director') return true;

  // 1. Si hay permisos dinámicos, usarlos
  if (APP.permisos && Object.keys(APP.permisos).length > 0) {
    return !!APP.permisos[modulo];
  }

  // 2. Fallback: lógica por área (legacy)
  const cfg = ACCESO_LEGACY[modulo];
  if (!cfg) return false;
  if (!cfg.areas) return true;
  return cfg.areas.includes(APP.user.area);
}

function nivelAcceso(modulo) {
  if (!APP.user) return null;
  if (APP.user.rol === 'Director') return 'admin';
  if (APP.permisos && APP.permisos[modulo]) return APP.permisos[modulo];
  return puedeAcceder(modulo) ? 'editar' : null;
}

/* NAV */
const NAV_DEF = [
  { grupo:'Principal',      items:[{ id:'dashboard',    label:'Dashboard',          icon:'grid'         }] },
  { grupo:'Operación',      items:[
    { id:'clientes',    label:'Clientes',           icon:'users'        },
    { id:'negocios',    label:'Negocios',            icon:'home'         },
    { id:'gestiones',   label:'Gestiones',           icon:'message'      },
    { id:'tareas',      label:'Tareas',              icon:'check-square' },
    { id:'eventos',     label:'Eventos especiales',  icon:'alert-circle' }
  ]},
  { grupo:'Inventario',     items:[{ id:'proyectos',    label:'Proyectos y Lotes',   icon:'map-pin'      }] },
  { grupo:'Bienes',         items:[
    { id:'bienes',        label:'Bienes administrados', icon:'briefcase'    },
    { id:'mantenimiento', label:'Mantenimiento',         icon:'tool'         }
  ]},
  { grupo:'Administración', items:[
    { id:'funcionarios',label:'Funcionarios',         icon:'user'         },
    { id:'permisos',    label:'Permisos',              icon:'shield'       },
    { id:'director',    label:'Panel Gerencial',       icon:'bar-chart-2'  },
    { id:'config',      label:'Configuración',         icon:'settings'     }
  ]}
];

const ICONS = {
  'grid':         `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
  'users':        `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'home':         `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  'message':      `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  'check-square': `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  'alert-circle': `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
  'map-pin':      `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  'user':         `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  'bar-chart-2':  `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  'settings':     `<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>`,
  'briefcase':    `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  'tool':         `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  'shield':       `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`
};

function navIcon(id) {
  return `<svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[id]||''}</svg>`;
}

function renderSidebar() {
  const user = APP.user, dash = APP.dashboard?.contadores || {};
  document.getElementById('sb-nombre').textContent = user.nombre || '—';
  document.getElementById('sb-rol').textContent    = user.rol    || '—';
  document.getElementById('sb-area').textContent   = user.area   || '—';

  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';

  NAV_DEF.forEach(grupo => {
    const vis = grupo.items.filter(i => i.id === 'dashboard' || puedeAcceder(i.id));
    if (!vis.length) return;
    nav.innerHTML += `<div class="nav-group-label">${grupo.grupo}</div>`;
    vis.forEach(item => {
      let badge = '';
      if (item.id === 'tareas'    && (dash.tareas_vencidas||0) > 0)
        badge = `<span class="nav-badge">${dash.tareas_vencidas}</span>`;
      if (item.id === 'gestiones' && (dash.compromisos_24h||0) > 0)
        badge = `<span class="nav-badge alerta">${dash.compromisos_24h}</span>`;
      if (item.id === 'clientes'  && (dash.clientes_sin_gestion||0) > 0)
        badge = `<span class="nav-badge alerta">${dash.clientes_sin_gestion}</span>`;
      nav.innerHTML += `
        <div class="nav-item" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
          ${navIcon(item.icon)}
          <span class="nav-item-label">${item.label}</span>
          ${badge}
        </div>`;
    });
  });
}

/* NAVEGACIÓN */
const PAGE_TITLES = {
  dashboard:'Dashboard', clientes:'Clientes', negocios:'Negocios',
  gestiones:'Gestiones', tareas:'Tareas', eventos:'Eventos especiales',
  proyectos:'Proyectos y Lotes', funcionarios:'Funcionarios',
  bienes:'Bienes administrados', mantenimiento:'Mantenimiento',
  permisos:'Permisos', director:'Panel Gerencial', config:'Configuración'
};

function navigateTo(pagina) {
  if (!puedeAcceder(pagina) && pagina !== 'dashboard') {
    toast('Sin permiso para ese módulo', 'error'); return;
  }
  APP.paginaActual = pagina;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('nav-' + pagina);
  if (el) el.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[pagina] || pagina;
  if (typeof window['render_' + pagina] === 'function') window['render_' + pagina]();
  else renderPlaceholder(pagina);
}

function renderPlaceholder(pagina) {
  const item = NAV_DEF.flatMap(g => g.items).find(i => i.id === pagina);
  document.getElementById('page-content').innerHTML = `
    <div class="empty-state anim-1">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          ${ICONS[item?.icon] || ''}
        </svg>
      </div>
      <div class="empty-title">${PAGE_TITLES[pagina] || pagina}</div>
      <div class="empty-sub">Este módulo estará disponible en la próxima fase de desarrollo.</div>
    </div>`;
}

/* AUTH */
async function handleLogin() {
  const cedula = document.getElementById('inp-cedula').value.trim();
  const pass   = document.getElementById('inp-pass').value.trim();
  const errEl  = document.getElementById('login-error');
  const btn    = document.getElementById('btn-login');
  errEl.style.display = 'none';
  if (!cedula || !pass) { errEl.textContent = 'Ingresa tu cédula y contraseña.'; errEl.style.display = 'block'; return; }
  btn.disabled = true; btn.textContent = 'Verificando...';
  showLoader('AUTENTICANDO');
  try {
    const res = await apiLogin(cedula, pass);
    if (res.ok) {
      APP.token = res.token; APP.user = res.user;
      APP.permisos = res.permisos || {};
      sessionStorage.setItem('crm_token', res.token);
      sessionStorage.setItem('crm_user', JSON.stringify(res.user));
      sessionStorage.setItem('crm_permisos', JSON.stringify(APP.permisos));
      await iniciarApp();
    } else {
      errEl.textContent = res.error || 'Credenciales incorrectas.';
      errEl.style.display = 'block'; hideLoader();
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión. Intenta de nuevo.';
    errEl.style.display = 'block'; hideLoader();
  }
  btn.disabled = false; btn.textContent = 'Ingresar al sistema';
}

async function iniciarApp() {
  const [cfgRes, dashRes] = await Promise.all([apiGetConfig(), apiGetDashboard()]);
  if (cfgRes.ok)  APP.config    = cfgRes.data;
  if (dashRes.ok) APP.dashboard = dashRes.data;
  hideLoader();
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display          = 'block';
  renderSidebar();
  actualizarReloj();
  setInterval(actualizarReloj, 60000);
  navigateTo('dashboard');
}

function logout() {
  APP.token = null; APP.user = null; APP.permisos = {};
  sessionStorage.clear();
  document.getElementById('app').style.display          = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('inp-cedula').value = '';
  document.getElementById('inp-pass').value   = '';
  document.getElementById('login-error').style.display = 'none';
  toast('Sesión cerrada correctamente', 'info');
}

/* AUTO-LOGIN */
(async function() {
  const t = sessionStorage.getItem('crm_token');
  const u = sessionStorage.getItem('crm_user');
  const p = sessionStorage.getItem('crm_permisos');
  if (t && u) {
    try {
      APP.token = t; APP.user = JSON.parse(u);
      APP.permisos = p ? JSON.parse(p) : {};
      showLoader('RESTAURANDO SESIÓN');
      await iniciarApp();
    } catch(e) { sessionStorage.clear(); hideLoader(); }
  }
})();
