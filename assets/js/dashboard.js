/**
 * ============================================================
 * ALIANZA CRM — dashboard.js
 * Módulo del dashboard principal
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_dashboard = function() {
  const dash = APP.dashboard || {};
  const cnt  = dash.contadores || {};
  const usr  = dash.usuario    || {};
  const gen  = dash.resumen_general;

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';
  const nombre = (usr.nombre || APP.user?.nombre || '').split(' ')[0] || 'colega';

  const CONTADORES = [
    {
      label: 'Tareas pendientes hoy',
      num:   cnt.tareas_pendientes_hoy || 0,
      color: (cnt.tareas_pendientes_hoy || 0) > 0 ? 'c-peligro' : 'c-exito',
      icon:  `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`
    },
    {
      label: 'Tareas vencidas sin gestionar',
      num:   cnt.tareas_vencidas || 0,
      color: (cnt.tareas_vencidas || 0) > 0 ? 'c-peligro' : 'c-exito',
      icon:  `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`
    },
    {
      label: 'Compromisos próximas 24h',
      num:   cnt.compromisos_24h || 0,
      color: (cnt.compromisos_24h || 0) > 0 ? 'c-azul' : 'c-gris',
      icon:  `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`
    },
    {
      label: 'Clientes sin gestión reciente',
      num:   cnt.clientes_sin_gestion || 0,
      color: (cnt.clientes_sin_gestion || 0) > 0 ? 'c-alerta' : 'c-exito',
      icon:  `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
    },
    {
      label: 'Saldos congelados por vencer',
      num:   cnt.sc_proximos_vencer || 0,
      color: (cnt.sc_proximos_vencer || 0) > 0 ? 'c-alerta' : 'c-gris',
      icon:  `<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`
    },
    {
      label: 'Tareas del área pendientes',
      num:   cnt.tareas_area_pendientes || 0,
      color: (cnt.tareas_area_pendientes || 0) > 0 ? 'c-navy' : 'c-gris',
      icon:  `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/>`
    }
  ];

  let html = `
    <!-- Saludo -->
    <div style="margin-bottom:24px" class="anim-1">
      <div style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;
                  color:var(--oscuro);letter-spacing:-.01em;line-height:1.3">
        ${saludo}, ${nombre} 👋
      </div>
      <div style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:5px;font-weight:400">
        ${usr.area || APP.user?.area} &nbsp;·&nbsp; ${usr.rol || APP.user?.rol}
        &nbsp;—&nbsp;
        ${new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
      </div>
    </div>

    <!-- Contadores -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(192px,1fr));
                gap:13px;margin-bottom:28px" class="anim-2">
      ${CONTADORES.map(c => `
        <div class="counter-card ${c.color}">
          <div class="counter-icon ${c.color}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              ${c.icon}
            </svg>
          </div>
          <div style="font-family:'Montserrat',sans-serif;font-size:2rem;font-weight:800;
                      color:var(--oscuro);line-height:1;margin-bottom:5px">
            ${c.num}
          </div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);
                      line-height:1.4;font-weight:500">
            ${c.label}
          </div>
        </div>`).join('')}
    </div>`;

  // ── Resumen general — solo Director ──
  if (gen) {
    const stats = [
      { num: gen.total_clientes,        label: 'Clientes totales',   col: '' },
      { num: gen.clientes_activos,      label: 'Clientes activos',   col: '' },
      { num: gen.lotes_disponibles,     label: 'Lotes disponibles',  col: 'var(--exito)' },
      { num: gen.lotes_vendidos,        label: 'Lotes vendidos',     col: 'var(--navy)' },
      { num: gen.negocios_activos,      label: 'Negocios activos',   col: '' },
      { num: gen.negocios_en_mora,      label: 'En mora',            col: 'var(--peligro)' },
      { num: gen.sc_congelados,         label: 'Saldos congelados',  col: 'var(--alerta)' },
      { num: gen.tareas_vencidas_total, label: 'Tareas vencidas',    col: 'var(--peligro)' }
    ];
    html += `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px" class="anim-3">
        <span style="font-family:'Montserrat',sans-serif;font-size:var(--text-xs);
                     font-weight:700;color:var(--navy);text-transform:uppercase;
                     letter-spacing:.08em">Resumen general</span>
        <div style="flex:1;height:1px;background:var(--gris-borde)"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));
                  gap:10px;margin-bottom:28px" class="anim-3">
        ${stats.map(s => `
          <div class="card" style="padding:16px;text-align:center">
            <div style="font-family:'Montserrat',sans-serif;font-size:1.6rem;
                        font-weight:800;color:${s.col || 'var(--oscuro)'};line-height:1">
              ${s.num}
            </div>
            <div style="font-size:var(--text-xs);color:var(--gris-mid);
                        text-transform:uppercase;letter-spacing:.05em;
                        margin-top:5px;font-weight:600">
              ${s.label}
            </div>
          </div>`).join('')}
      </div>`;
  }

  // ── Acceso rápido ──
  const modulos = NAV_DEF
    .flatMap(g => g.items)
    .filter(i => i.id !== 'dashboard' && puedeAcceder(i.id));

  html += `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px" class="anim-4">
      <span style="font-family:'Montserrat',sans-serif;font-size:var(--text-xs);
                   font-weight:700;color:var(--navy);text-transform:uppercase;
                   letter-spacing:.08em">Acceso rápido</span>
      <div style="flex:1;height:1px;background:var(--gris-borde)"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));
                gap:10px" class="anim-4">
      ${modulos.map(m => `
        <div onclick="navigateTo('${m.id}')"
             style="background:var(--blanco);border:1px solid var(--gris-borde);
                    border-radius:var(--r-lg);padding:20px 14px;text-align:center;
                    cursor:pointer;transition:all var(--tr)"
             onmouseover="this.style.borderColor='var(--azul)';
                          this.style.transform='translateY(-2px)';
                          this.style.boxShadow='var(--sh-md)'"
             onmouseout="this.style.borderColor='var(--gris-borde)';
                         this.style.transform='';
                         this.style.boxShadow=''">
          <div style="width:42px;height:42px;border-radius:var(--r);
                      background:var(--navy-light);margin:0 auto 11px;
                      display:flex;align-items:center;justify-content:center">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                 stroke="var(--navy)" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              ${ICONS[m.icon] || ''}
            </svg>
          </div>
          <div style="font-size:var(--text-xs);font-weight:600;
                      color:var(--oscuro);line-height:1.3;
                      font-family:'Montserrat',sans-serif">
            ${m.label}
          </div>
        </div>`).join('')}
    </div>`;

  document.getElementById('page-content').innerHTML = html;
};
