/**
 * ============================================================
 * ALIANZA CRM — mantenimiento.js
 * Módulo independiente de órdenes de trabajo
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

let MANT_ALL   = [];
let MANT_FUNC  = [];

window.render_mantenimiento = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--oscuro)">Órdenes de trabajo</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Mantenimientos, reparaciones y mejoras</p>
      </div>
    </div>

    <!-- KPIs -->
    <div id="mant-kpis" class="anim-1" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:20px"></div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 150px 150px 150px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="mant-buscar" placeholder="Buscar por descripción..." oninput="mant_filtrar()">
          </div>
          <select class="form-control" id="mant-filtro-estado" onchange="mant_filtrar()">
            <option value="">Todos los estados</option>
            <option value="Solicitado">Solicitado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="En compra">En compra</option>
            <option value="En ejecución">En ejecución</option>
            <option value="Completado">Completado</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <select class="form-control" id="mant-filtro-tipo" onchange="mant_filtrar()">
            <option value="">Todos los tipos</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
            <option value="Mejora">Mejora</option>
          </select>
          <select class="form-control" id="mant-filtro-vista" onchange="mant_filtrar()">
            <option value="mis">Mis asignaciones</option>
            <option value="todas">Todas las órdenes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div id="mant-lista" class="anim-3"></div>`;

  // Directors ven todas por defecto
  if (APP.user && APP.user.rol === 'Director') {
    document.getElementById('mant-filtro-vista').value = 'todas';
  }

  await mant_cargarDatos();
};

async function mant_cargarDatos() {
  try {
    const [mantRes, funcRes] = await Promise.all([
      apiGetMantBien({}),
      apiGetFuncionarios()
    ]);
    MANT_ALL  = mantRes.ok ? (mantRes.data || []) : [];
    MANT_FUNC = funcRes.ok ? (funcRes.data || []).filter(f => String(f.estado).toLowerCase() === 'true') : [];

    mant_renderKPIs();
    mant_filtrar();
  } catch(e) {
    console.error('Error cargando mantenimiento:', e);
  }
}

function mant_renderKPIs() {
  const el = document.getElementById('mant-kpis');
  if (!el) return;
  const userId = APP.user ? APP.user.id || '' : '';

  const misPendientes = MANT_ALL.filter(m => String(m.asignado_a) === userId && ['Aprobado','En compra','En ejecución'].includes(m.estado)).length;
  const solicitados   = MANT_ALL.filter(m => m.estado === 'Solicitado').length;
  const enProceso     = MANT_ALL.filter(m => ['Aprobado','En compra','En ejecución'].includes(m.estado)).length;
  const completados   = MANT_ALL.filter(m => m.estado === 'Completado').length;
  const costoTotal    = MANT_ALL.filter(m => m.estado !== 'Cancelado' && m.estado !== 'Rechazado').reduce((s, m) => s + (Number(m.costo_real) || Number(m.costo_estimado) || 0), 0);

  const kpis = [
    { label: 'Mis pendientes',  num: misPendientes, color: misPendientes > 0 ? 'c-alerta' : 'c-exito' },
    { label: 'Por aprobar',     num: solicitados,   color: solicitados > 0 ? 'c-peligro' : 'c-gris' },
    { label: 'En proceso',      num: enProceso,     color: enProceso > 0 ? 'c-azul' : 'c-gris' },
    { label: 'Completados',     num: completados,   color: 'c-exito' },
    { label: 'Costo acumulado', num: formatCOP(costoTotal), color: 'c-navy', isText: true }
  ];

  el.innerHTML = kpis.map(k => `
    <div class="counter-card ${k.color}">
      <div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500;margin-bottom:4px">${k.label}</div>
      <div style="font-family:var(--font-display);font-size:${k.isText ? '0.95rem' : '1.6rem'};font-weight:800;color:var(--oscuro)">${k.num}</div>
    </div>`).join('');
}

function mant_filtrar() {
  const q      = (document.getElementById('mant-buscar')?.value || '').toLowerCase();
  const estado = document.getElementById('mant-filtro-estado')?.value || '';
  const tipo   = document.getElementById('mant-filtro-tipo')?.value || '';
  const vista  = document.getElementById('mant-filtro-vista')?.value || 'mis';
  const userId = APP.user ? APP.user.id || '' : '';

  let filtrado = MANT_ALL.filter(m => {
    const matchQ = !q || (m.descripcion || '').toLowerCase().includes(q);
    const matchE = !estado || m.estado === estado;
    const matchT = !tipo || m.tipo_mantenimiento === tipo;
    const matchV = vista === 'todas' || String(m.asignado_a) === userId || String(m.solicitado_por) === userId;
    return matchQ && matchE && matchT && matchV;
  });

  mant_renderLista(filtrado);
}

function mant_renderLista(data) {
  const cont = document.getElementById('mant-lista');
  if (!data.length) {
    cont.innerHTML = `
      <div class="card"><div class="card-body" style="padding:40px;text-align:center">
        <div style="font-size:var(--text-sm);color:var(--gris-mid)">Sin órdenes de trabajo que coincidan con los filtros</div>
      </div></div>`;
    return;
  }

  const ESTADO_BADGE = {
    'Solicitado':'badge-gris','Aprobado':'badge-azul','Rechazado':'badge-peligro',
    'En compra':'badge-morado','En ejecución':'badge-alerta','Completado':'badge-exito','Cancelado':'badge-gris'
  };

  cont.innerHTML = `<div class="card"><div class="card-header"><div class="card-title">${data.length} orden${data.length !== 1 ? 'es' : ''}</div></div><div class="card-body" style="padding:0">` +
    data.map(m => {
      // Botones de acción según estado
      let acciones = '';
      if (m.estado === 'Solicitado') {
        acciones = `
          <button class="btn btn-sm" style="background:var(--exito);color:white" onclick="mant_ind_aprobar('${m.MANT_ID}')">✓ Aprobar</button>
          <button class="btn btn-sm" style="background:var(--peligro);color:white" onclick="mant_ind_rechazar('${m.MANT_ID}')">✗ Rechazar</button>`;
      } else if (m.estado === 'Aprobado') {
        acciones = `<button class="btn btn-sm btn-primary" onclick="mant_ind_avanzar('${m.MANT_ID}','En compra')">→ Iniciar compras</button>
                    <button class="btn btn-sm btn-primary" onclick="mant_ind_avanzar('${m.MANT_ID}','En ejecución')">→ Ir a ejecución</button>`;
      } else if (m.estado === 'En compra') {
        acciones = `<button class="btn btn-sm btn-primary" onclick="mant_ind_avanzar('${m.MANT_ID}','En ejecución')">→ Iniciar ejecución</button>`;
      } else if (m.estado === 'En ejecución') {
        acciones = `<button class="btn btn-sm" style="background:var(--exito);color:white" onclick="mant_ind_completar('${m.MANT_ID}')">✓ Completar</button>`;
      }

      return `
      <div style="padding:16px;border-bottom:1px solid var(--gris-borde)">
        <div style="display:flex;align-items:start;gap:12px;margin-bottom:8px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
              <span class="badge ${m.tipo_mantenimiento === 'Preventivo' ? 'badge-azul' : m.tipo_mantenimiento === 'Correctivo' ? 'badge-alerta' : 'badge-exito'}">${m.tipo_mantenimiento}</span>
              <span class="badge ${ESTADO_BADGE[m.estado] || 'badge-gris'}">${m.estado}</span>
              ${m.prioridad === 'Alta' ? '<span class="badge badge-peligro">⚡ Alta</span>' : ''}
              <span class="badge badge-navy" style="font-size:10px">${m.entidad_tipo === 'bien' ? '🏠' : '🏗️'} ${m.entidad_tipo}</span>
            </div>
            <div style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro)">${m.descripcion}</div>
            <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:4px">
              Solicitado por ${m.solicitado_por_nombre || '—'} · ${formatFecha(m.fecha_solicitud)}
              ${m.asignado_a_nombre ? ' · <strong style="color:var(--azul)">Asignado a: ' + m.asignado_a_nombre + '</strong>' : ''}
              ${m.aprobado_por_nombre ? ' · Aprobado por ' + m.aprobado_por_nombre : ''}
            </div>
          </div>
          <div style="text-align:right;min-width:110px">
            <div style="font-size:var(--text-xs);color:var(--gris-mid)">Estimado</div>
            <div style="font-weight:700;font-size:var(--text-sm)">${m.costo_estimado ? formatCOP(m.costo_estimado) : '—'}</div>
            ${m.costo_real ? `<div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">Real: <strong>${formatCOP(m.costo_real)}</strong></div>` : ''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${acciones}
        </div>
      </div>`;
    }).join('') + `</div></div>`;
}

// ── Acciones del módulo independiente ──

async function mant_ind_aprobar(MANT_ID) {
  if (!document.getElementById('aprobar-ind-modal')) {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="modal-backdrop" id="aprobar-ind-modal">
        <div class="modal" style="max-width:440px">
          <div class="modal-header">
            <div class="modal-title">Aprobar orden de trabajo</div>
            <button class="modal-close" onclick="document.getElementById('aprobar-ind-modal').classList.remove('active')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label req">¿A quién se asigna esta orden?</label>
              <select class="form-control" id="aprobar-ind-asignado"><option value="">Selecciona responsable</option></select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('aprobar-ind-modal').classList.remove('active')">Cancelar</button>
            <button class="btn btn-primary" style="background:var(--exito)" id="aprobar-ind-btn" onclick="mant_ind_confirmarAprobacion()">✓ Aprobar y asignar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div);
  }
  const sel = document.getElementById('aprobar-ind-asignado');
  sel.innerHTML = '<option value="">Selecciona responsable</option>';
  MANT_FUNC.forEach(f => { sel.innerHTML += `<option value="${f.FUNC_ID}">${f.nombre} ${f.apellido} — ${f.area}</option>`; });
  window._mant_ind_aprobar_id = MANT_ID;
  document.getElementById('aprobar-ind-modal').classList.add('active');
}

async function mant_ind_confirmarAprobacion() {
  const asignado = document.getElementById('aprobar-ind-asignado').value;
  if (!asignado) { toast('Selecciona a quién se asigna', 'error'); return; }
  const btn = document.getElementById('aprobar-ind-btn');
  btn.disabled = true; btn.textContent = 'Aprobando...';
  try {
    const res = await api('aprobarMant', { MANT_ID: window._mant_ind_aprobar_id, asignado_a: asignado });
    if (res.ok) { toast('Orden aprobada y asignada', 'ok'); document.getElementById('aprobar-ind-modal').classList.remove('active'); await mant_cargarDatos(); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
  btn.disabled = false; btn.textContent = '✓ Aprobar y asignar';
}

async function mant_ind_rechazar(MANT_ID) {
  const motivo = prompt('Motivo del rechazo:');
  if (!motivo) return;
  try {
    const res = await apiRechazarMant(MANT_ID, motivo);
    if (res.ok) { toast('Orden rechazada', 'ok'); await mant_cargarDatos(); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}

async function mant_ind_avanzar(MANT_ID, nuevoEstado) {
  if (!confirm('¿Avanzar la orden a "' + nuevoEstado + '"?')) return;
  try {
    const res = await apiAvanzarMant(MANT_ID, nuevoEstado);
    if (res.ok) { toast('Orden avanzada', 'ok'); await mant_cargarDatos(); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}

async function mant_ind_completar(MANT_ID) {
  const evidencia = prompt('URL de evidencia (foto/video del trabajo terminado):');
  try {
    const res = await apiAvanzarMant(MANT_ID, 'Completado', evidencia || '');
    if (res.ok) { toast('Orden completada', 'ok'); await mant_cargarDatos(); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}
