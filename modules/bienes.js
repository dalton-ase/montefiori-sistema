/**
 * ============================================================
 * ALIANZA CRM — bienes.js
 * Módulo de bienes administrados
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

// ── Estado del módulo ────────────────────────────────────
let BIEN_DATA   = [];
let BIEN_FUNC   = [];
let BIEN_DETAIL = null;
let BIEN_VISTA  = 'lista'; // lista | detalle

window.render_bienes = async function() {
  BIEN_VISTA = 'lista';
  BIEN_DETAIL = null;
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--oscuro)">Bienes administrados</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Inventario de propiedades y vehículos en administración</p>
      </div>
      <button class="btn btn-primary" onclick="bien_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo bien
      </button>
    </div>

    <!-- KPIs -->
    <div id="bien-kpis" class="anim-1" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-bottom:20px"></div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 160px 160px 160px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="bien-buscar" placeholder="Buscar por identificador o propietario..." oninput="bien_filtrar()">
          </div>
          <select class="form-control" id="bien-filtro-tipo" onchange="bien_filtrar()">
            <option value="">Todos los tipos</option>
          </select>
          <select class="form-control" id="bien-filtro-estado" onchange="bien_filtrar()">
            <option value="">Todos los estados</option>
          </select>
          <select class="form-control" id="bien-filtro-modalidad" onchange="bien_filtrar()">
            <option value="">Todas las modalidades</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card anim-3">
      <div class="card-header">
        <div class="card-title" id="bien-contador">Bienes</div>
      </div>
      <div class="card-body" style="padding:0">
        <div id="bien-tabla-wrap" class="table-wrap">
          <div style="padding:40px;text-align:center">
            <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
          </div>
        </div>
      </div>
    </div>

    ${bien_modalHTML()}`;

  await bien_cargarDatos();
};

// ── CARGA DE DATOS ───────────────────────────────────────

async function bien_cargarDatos() {
  try {
    const [bienesRes, funcRes, dashRes] = await Promise.all([
      apiGetBienes(),
      apiGetFuncionarios(),
      apiGetDashboardBienes()
    ]);
    BIEN_DATA = bienesRes.ok ? (bienesRes.data || []) : [];
    BIEN_FUNC = funcRes.ok ? (funcRes.data || []).filter(f => String(f.estado).toLowerCase() === 'true') : [];

    if (dashRes.ok) bien_renderKPIs(dashRes.data);
    bien_cargarSelectores();
    bien_renderTabla(BIEN_DATA);
  } catch(e) {
    console.error('Error cargando bienes:', e);
    document.getElementById('bien-tabla-wrap').innerHTML = `
      <div class="empty-state"><div class="empty-title" style="color:var(--peligro)">Error cargando bienes</div></div>`;
  }
}

function bien_renderKPIs(dash) {
  const el = document.getElementById('bien-kpis');
  if (!el) return;
  const kpis = [
    { label: 'Total bienes',       num: dash.total || 0,              color: 'c-navy' },
    { label: 'Docs por vencer',    num: dash.docs_por_vencer || 0,    color: (dash.docs_por_vencer||0) > 0 ? 'c-alerta' : 'c-exito' },
    { label: 'Docs vencidos',      num: dash.docs_vencidos || 0,      color: (dash.docs_vencidos||0) > 0 ? 'c-peligro' : 'c-exito' },
    { label: 'Mant. pendientes',   num: dash.mant_pendientes || 0,    color: (dash.mant_pendientes||0) > 0 ? 'c-azul' : 'c-gris' },
    { label: 'Avalúo total',       num: formatCOP(dash.avaluo_total), color: 'c-navy', isText: true }
  ];

  el.innerHTML = kpis.map(k => `
    <div class="counter-card ${k.color}">
      <div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500;margin-bottom:4px">${k.label}</div>
      <div style="font-family:var(--font-display);font-size:${k.isText ? '0.95rem' : '1.6rem'};font-weight:800;color:var(--oscuro)">${k.num}</div>
    </div>`).join('');
}

function bien_cargarSelectores() {
  const cfg = APP.config || {};

  const tipos = (cfg.tipo_bien_adm || []).map(t => t.clave);
  const estados = (cfg.estado_bien || []).map(e => e.clave);
  const modalidades = (cfg.modalidad_admin || []).map(m => m.clave);
  const municipios = (cfg.municipio || []).map(m => m.clave);

  // Guardar subtipos para uso en cascada
  window.SUBTIPOS_BIEN = (cfg.subtipo_bien || []);

  // Filtros
  bien_llenarSelect('bien-filtro-tipo',      tipos,       'Todos los tipos');
  bien_llenarSelect('bien-filtro-estado',    estados,     'Todos los estados');
  bien_llenarSelect('bien-filtro-modalidad', modalidades, 'Todas las modalidades');

  // Modal
  bien_llenarSelect('bien-m-tipo',       tipos,       'Selecciona tipo');
  bien_llenarSelect('bien-m-estado',     estados,     'Selecciona estado');
  bien_llenarSelect('bien-m-modalidad',  modalidades, 'Selecciona modalidad');
  bien_llenarSelect('bien-m-municipio',  municipios,  'Selecciona municipio');
}

/** Filtra subtipos según el tipo seleccionado */
function bien_actualizarSubtipos() {
  const tipo = document.getElementById('bien-m-tipo')?.value || '';
  const sel = document.getElementById('bien-m-subtipo');
  if (!sel) return;

  const subtipos = (window.SUBTIPOS_BIEN || []).filter(s => s.valor === tipo).map(s => s.clave);

  if (subtipos.length === 0) {
    sel.innerHTML = '<option value="">No aplica</option>';
    sel.closest('.form-group').style.display = 'none';
  } else {
    sel.closest('.form-group').style.display = '';
    sel.innerHTML = '<option value="">Selecciona subtipo</option>';
    subtipos.forEach(s => { sel.innerHTML += `<option value="${s}">${s}</option>`; });
  }
}

function bien_llenarSelect(id, opciones, placeholder) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<option value="">${placeholder}</option>`;
  opciones.forEach(o => { el.innerHTML += `<option value="${o}">${o}</option>`; });
}

// ── TABLA ────────────────────────────────────────────────

function bien_renderTabla(data) {
  const wrap = document.getElementById('bien-tabla-wrap');
  const cnt = document.getElementById('bien-contador');
  if (cnt) cnt.textContent = `${data.length} bien${data.length !== 1 ? 'es' : ''}`;

  if (!data.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg></div>
        <div class="empty-title">Sin bienes registrados</div>
        <div class="empty-sub">Registra el primer bien con el botón "Nuevo bien"</div>
      </div>`;
    return;
  }

  const TIPO_EMOJI = { Casa:'🏠', Apartamento:'🏢', Finca:'🌾', Local:'🏪', Auto:'🚗', Moto:'🏍️' };

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Bien</th>
          <th>Propietario</th>
          <th>Modalidad</th>
          <th>Estado</th>
          <th>Municipio</th>
          <th>Avalúo</th>
          <th style="text-align:right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(b => `
          <tr style="cursor:pointer" onclick="bien_verDetalle('${b.BIEN_ADM_ID}')">
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="font-size:1.4rem">${TIPO_EMOJI[b.tipo_bien] || '📦'}</div>
                <div>
                  <div style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro)">${b.identificador}</div>
                  <div style="font-size:var(--text-xs);color:var(--gris-mid)">${b.tipo_bien}${b.subtipo_bien ? ' · ' + b.subtipo_bien : ''}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-size:var(--text-sm);font-weight:500">${b.propietario_nombre}</div>
              <div style="font-size:var(--text-xs);color:var(--gris-mid)">${b.propietario_cedula || '—'}</div>
            </td>
            <td><span class="badge badge-azul">${b.modalidad || '—'}</span></td>
            <td><span class="badge ${bien_badgeEstado(b.estado)}">${b.estado || '—'}</span></td>
            <td style="font-size:var(--text-sm)">${b.municipio || '—'}</td>
            <td style="font-size:var(--text-sm);font-weight:600">${b.avaluo ? formatCOP(b.avaluo) : '—'}</td>
            <td>
              <div class="table-actions" onclick="event.stopPropagation()">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="bien_abrirModal('${b.BIEN_ADM_ID}')" title="Editar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" onclick="bien_verDetalle('${b.BIEN_ADM_ID}')" title="Ver detalle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function bien_badgeEstado(estado) {
  const map = {
    'Disponible':'badge-exito', 'Arrendado':'badge-azul', 'En venta':'badge-morado',
    'En mantenimiento':'badge-alerta', 'Entregado':'badge-gris'
  };
  return map[estado] || 'badge-navy';
}

function bien_filtrar() {
  const q   = (document.getElementById('bien-buscar')?.value || '').toLowerCase();
  const tip = document.getElementById('bien-filtro-tipo')?.value || '';
  const est = document.getElementById('bien-filtro-estado')?.value || '';
  const mod = document.getElementById('bien-filtro-modalidad')?.value || '';

  const filtrado = BIEN_DATA.filter(b => {
    const matchQ = !q || (b.identificador||'').toLowerCase().includes(q) || (b.propietario_nombre||'').toLowerCase().includes(q) || (b.propietario_cedula||'').includes(q);
    const matchT = !tip || b.tipo_bien === tip;
    const matchE = !est || b.estado === est;
    const matchM = !mod || b.modalidad === mod;
    return matchQ && matchT && matchE && matchM;
  });

  bien_renderTabla(filtrado);
}

// ── MODAL CREAR/EDITAR ──────────────────────────────────

function bien_modalHTML() {
  return `
    <div class="modal-backdrop" id="bien-modal">
      <div class="modal" style="max-width:720px">
        <div class="modal-header">
          <div class="modal-title" id="bien-modal-title">Nuevo bien</div>
          <button class="modal-close" onclick="bien_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto">
          <input type="hidden" id="bien-m-id">

          <div class="tabs" style="margin-bottom:16px">
            <button class="tab-btn active" onclick="bien_tabModal('info')">Información</button>
            <button class="tab-btn" onclick="bien_tabModal('propietario')">Propietario</button>
            <button class="tab-btn" onclick="bien_tabModal('comercial')">Comercial</button>
          </div>

          <!-- Tab Info -->
          <div id="bien-tab-info">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Tipo de bien</label>
                <select class="form-control" id="bien-m-tipo" onchange="bien_actualizarSubtipos()"></select>
              </div>
              <div class="form-group" id="bien-subtipo-wrap">
                <label class="form-label">Subtipo</label>
                <select class="form-control" id="bien-m-subtipo"><option value="">Selecciona tipo primero</option></select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Identificador</label>
                <input type="text" class="form-control" id="bien-m-identificador" placeholder="Ej: Casa Lote 15 Le Mont">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha de recepción</label>
                <input type="date" class="form-control" id="bien-m-fecha-recepcion">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" id="bien-m-descripcion" rows="2" placeholder="Descripción del bien..."></textarea>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Dirección</label>
                <input type="text" class="form-control" id="bien-m-direccion" placeholder="Dirección completa">
              </div>
              <div class="form-group">
                <label class="form-label">Municipio</label>
                <select class="form-control" id="bien-m-municipio"></select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Barrio / Sector</label>
                <input type="text" class="form-control" id="bien-m-barrio" placeholder="Barrio o sector">
              </div>
              <div class="form-group">
                <label class="form-label">Área (m²)</label>
                <input type="number" class="form-control" id="bien-m-area" placeholder="0" min="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">📁 Carpeta Drive (documentos y soportes)</label>
              <input type="url" class="form-control" id="bien-m-drive" placeholder="https://drive.google.com/drive/folders/...">
            </div>
          </div>

          <!-- Tab Propietario -->
          <div id="bien-tab-propietario" style="display:none">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Nombre propietario</label>
                <input type="text" class="form-control" id="bien-m-prop-nombre" placeholder="Nombre completo">
              </div>
              <div class="form-group">
                <label class="form-label">Cédula</label>
                <input type="text" class="form-control" id="bien-m-prop-cedula" placeholder="Número de cédula" inputmode="numeric">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="text" class="form-control" id="bien-m-prop-telefono" placeholder="57300...">
              </div>
              <div class="form-group">
                <label class="form-label">Correo</label>
                <input type="email" class="form-control" id="bien-m-prop-email" placeholder="correo@email.com">
              </div>
            </div>
          </div>

          <!-- Tab Comercial -->
          <div id="bien-tab-comercial" style="display:none">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Modalidad</label>
                <select class="form-control" id="bien-m-modalidad"></select>
              </div>
              <div class="form-group">
                <label class="form-label req">Estado</label>
                <select class="form-control" id="bien-m-estado"></select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Avalúo</label>
                <input type="number" class="form-control" id="bien-m-avaluo" placeholder="0" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Precio arriendo</label>
                <input type="number" class="form-control" id="bien-m-precio-arriendo" placeholder="0 (mensual)" min="0">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Precio venta</label>
                <input type="number" class="form-control" id="bien-m-precio-venta" placeholder="0" min="0">
              </div>
              <div class="form-group"></div>
            </div>
            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea class="form-control" id="bien-m-observaciones" rows="2" placeholder="Notas adicionales..."></textarea>
            </div>
          </div>

          <div id="bien-error" style="display:none;padding:10px 12px;background:var(--peligro-light);
               border:1px solid var(--peligro-borde);border-radius:var(--r);
               color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="bien_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="bien-btn-guardar" onclick="bien_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar
          </button>
        </div>
      </div>
    </div>`;
}

function bien_tabModal(tab) {
  ['info','propietario','comercial'].forEach(t => {
    const el = document.getElementById('bien-tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#bien-modal .tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', ['info','propietario','comercial'][i] === tab);
  });
}

function bien_abrirModal(BIEN_ID = null) {
  document.getElementById('bien-modal-title').textContent = BIEN_ID ? 'Editar bien' : 'Nuevo bien';
  document.getElementById('bien-m-id').value = '';
  document.getElementById('bien-m-tipo').value = '';
  document.getElementById('bien-m-subtipo').value = '';
  document.getElementById('bien-m-identificador').value = '';
  document.getElementById('bien-m-descripcion').value = '';
  document.getElementById('bien-m-direccion').value = '';
  document.getElementById('bien-m-municipio').value = '';
  document.getElementById('bien-m-barrio').value = '';
  document.getElementById('bien-m-area').value = '';
  document.getElementById('bien-m-fecha-recepcion').value = '';
  document.getElementById('bien-m-drive').value = '';
  document.getElementById('bien-m-prop-nombre').value = '';
  document.getElementById('bien-m-prop-cedula').value = '';
  document.getElementById('bien-m-prop-telefono').value = '';
  document.getElementById('bien-m-prop-email').value = '';
  document.getElementById('bien-m-modalidad').value = '';
  document.getElementById('bien-m-estado').value = '';
  document.getElementById('bien-m-avaluo').value = '';
  document.getElementById('bien-m-precio-arriendo').value = '';
  document.getElementById('bien-m-precio-venta').value = '';
  document.getElementById('bien-m-observaciones').value = '';
  document.getElementById('bien-error').style.display = 'none';
  bien_tabModal('info');
  bien_actualizarSubtipos();

  if (BIEN_ID) {
    const b = BIEN_DATA.find(x => x.BIEN_ADM_ID === BIEN_ID);
    if (b) {
      document.getElementById('bien-m-id').value              = b.BIEN_ADM_ID;
      document.getElementById('bien-m-tipo').value            = b.tipo_bien || '';
      bien_actualizarSubtipos();
      document.getElementById('bien-m-subtipo').value         = b.subtipo_bien || '';
      document.getElementById('bien-m-identificador').value   = b.identificador || '';
      document.getElementById('bien-m-descripcion').value     = b.descripcion || '';
      document.getElementById('bien-m-direccion').value       = b.direccion || '';
      document.getElementById('bien-m-municipio').value       = b.municipio || '';
      document.getElementById('bien-m-barrio').value          = b.barrio || '';
      document.getElementById('bien-m-area').value            = b.area_m2 || '';
      document.getElementById('bien-m-fecha-recepcion').value = b.fecha_recepcion ? String(b.fecha_recepcion).split('T')[0] : '';
      document.getElementById('bien-m-drive').value           = b.url_carpeta_drive || '';
      document.getElementById('bien-m-prop-nombre').value     = b.propietario_nombre || '';
      document.getElementById('bien-m-prop-cedula').value     = b.propietario_cedula || '';
      document.getElementById('bien-m-prop-telefono').value   = b.propietario_telefono || '';
      document.getElementById('bien-m-prop-email').value      = b.propietario_email || '';
      document.getElementById('bien-m-modalidad').value       = b.modalidad || '';
      document.getElementById('bien-m-estado').value          = b.estado || '';
      document.getElementById('bien-m-avaluo').value          = b.avaluo || '';
      document.getElementById('bien-m-precio-arriendo').value = b.precio_arriendo || '';
      document.getElementById('bien-m-precio-venta').value    = b.precio_venta || '';
      document.getElementById('bien-m-observaciones').value   = b.observaciones || '';
    }
  }

  document.getElementById('bien-modal').classList.add('active');
}

function bien_cerrarModal() {
  document.getElementById('bien-modal').classList.remove('active');
}

async function bien_guardar() {
  const errEl = document.getElementById('bien-error');
  errEl.style.display = 'none';

  const data = {
    BIEN_ADM_ID:              document.getElementById('bien-m-id').value || undefined,
    tipo_bien:            document.getElementById('bien-m-tipo').value,
    subtipo_bien:         document.getElementById('bien-m-subtipo').value,
    identificador:        document.getElementById('bien-m-identificador').value.trim(),
    descripcion:          document.getElementById('bien-m-descripcion').value.trim(),
    propietario_nombre:   document.getElementById('bien-m-prop-nombre').value.trim(),
    propietario_cedula:   document.getElementById('bien-m-prop-cedula').value.trim(),
    propietario_telefono: document.getElementById('bien-m-prop-telefono').value.trim(),
    propietario_email:    document.getElementById('bien-m-prop-email').value.trim(),
    modalidad:            document.getElementById('bien-m-modalidad').value,
    estado:               document.getElementById('bien-m-estado').value,
    direccion:            document.getElementById('bien-m-direccion').value.trim(),
    municipio:            document.getElementById('bien-m-municipio').value,
    barrio:               document.getElementById('bien-m-barrio').value.trim(),
    area_m2:              document.getElementById('bien-m-area').value || '',
    avaluo:               document.getElementById('bien-m-avaluo').value || '',
    precio_arriendo:      document.getElementById('bien-m-precio-arriendo').value || '',
    precio_venta:         document.getElementById('bien-m-precio-venta').value || '',
    url_carpeta_drive:    document.getElementById('bien-m-drive').value.trim(),
    observaciones:        document.getElementById('bien-m-observaciones').value.trim(),
    fecha_recepcion:      document.getElementById('bien-m-fecha-recepcion').value
  };

  if (!data.tipo_bien || !data.identificador || !data.propietario_nombre || !data.modalidad || !data.estado) {
    errEl.textContent = 'Completa: tipo, identificador, propietario, modalidad y estado.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('bien-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await apiSaveBien(data);
    if (res.ok) {
      toast(data.BIEN_ADM_ID ? 'Bien actualizado' : 'Bien registrado', 'ok');
      bien_cerrarModal();
      await bien_cargarDatos();
    } else {
      errEl.textContent = res.error || 'Error al guardar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar';
}

// ═══════════════════════════════════════════════════════════
// VISTA DETALLE — Ficha completa del bien con tabs
// ═══════════════════════════════════════════════════════════

async function bien_verDetalle(BIEN_ID) {
  BIEN_VISTA = 'detalle';
  const pc = document.getElementById('page-content');
  pc.innerHTML = `<div style="padding:40px;text-align:center"><div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div><div style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:14px">Cargando ficha del bien...</div></div>`;

  try {
    const res = await apiGetBien(BIEN_ID);
    if (!res.ok) { pc.innerHTML = `<div class="empty-state"><div class="empty-title" style="color:var(--peligro)">Error: ${res.error}</div></div>`; return; }
    BIEN_DETAIL = res.data;
    bien_renderDetalle();
  } catch(e) {
    pc.innerHTML = `<div class="empty-state"><div class="empty-title" style="color:var(--peligro)">Error de conexión</div></div>`;
  }
}

function bien_renderDetalle() {
  const b = BIEN_DETAIL;
  if (!b) return;
  const TIPO_EMOJI = { Casa:'🏠', Apartamento:'🏢', Finca:'🌾', Local:'🏪', Auto:'🚗', Moto:'🏍️' };
  const pc = document.getElementById('page-content');

  pc.innerHTML = `
    <!-- Header con volver -->
    <div class="anim-1" style="margin-bottom:20px">
      <button class="btn btn-ghost btn-sm" onclick="render_bienes()" style="margin-bottom:12px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver al listado
      </button>
      <div style="display:flex;align-items:center;gap:14px">
        <div style="font-size:2rem">${TIPO_EMOJI[b.tipo_bien] || '📦'}</div>
        <div>
          <h2 style="font-family:var(--font-display);font-size:1.35rem;font-weight:800;color:var(--oscuro);margin:0">${b.identificador}</h2>
          <div style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">
            ${b.tipo_bien}${b.subtipo_bien ? ' · ' + b.subtipo_bien : ''} · ${b.municipio || '—'} · Propietario: <strong>${b.propietario_nombre}</strong>
            ${b.url_carpeta_drive ? ` · <a href="${b.url_carpeta_drive}" target="_blank" style="color:var(--azul);text-decoration:none">📁 Ver carpeta Drive</a>` : ''}
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <span class="badge ${bien_badgeEstado(b.estado)}" style="font-size:var(--text-sm);padding:6px 14px">${b.estado}</span>
          <span class="badge badge-azul" style="font-size:var(--text-sm);padding:6px 14px">${b.modalidad}</span>
        </div>
      </div>
    </div>

    <!-- Info rápida -->
    <div class="anim-1" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px">
      ${[
        { label:'Avalúo', val: b.avaluo ? formatCOP(b.avaluo) : '—' },
        { label:'Arriendo', val: b.precio_arriendo ? formatCOP(b.precio_arriendo) + '/mes' : '—' },
        { label:'Venta', val: b.precio_venta ? formatCOP(b.precio_venta) : '—' },
        { label:'Área', val: b.area_m2 ? b.area_m2 + ' m²' : '—' },
        { label:'Dirección', val: b.direccion || '—' },
        { label:'Recepción', val: formatFecha(b.fecha_recepcion) }
      ].map(i => `
        <div style="background:white;border-radius:var(--r);padding:12px 14px;border:1px solid var(--gris-borde)">
          <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-bottom:3px">${i.label}</div>
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--oscuro)">${i.val}</div>
        </div>`).join('')}
    </div>

    <!-- Tabs detalle -->
    <div class="tabs anim-2" style="margin-bottom:16px">
      <button class="tab-btn active" onclick="bien_tabDetalle('docs')">📄 Documentos <span class="nav-badge" style="margin-left:6px">${(b.documentos||[]).length}</span></button>
      <button class="tab-btn" onclick="bien_tabDetalle('mant')">🔧 Mantenimiento <span class="nav-badge" style="margin-left:6px">${(b.mantenimientos||[]).length}</span></button>
      <button class="tab-btn" onclick="bien_tabDetalle('equipo')">👥 Equipo <span class="nav-badge" style="margin-left:6px">${(b.participantes||[]).length}</span></button>
    </div>

    <div id="bien-detalle-contenido" class="anim-3"></div>

    ${bien_modalDocHTML()}
    ${bien_modalMantHTML()}
    ${bien_modalPartHTML()}`;

  bien_tabDetalle('docs');
}

function bien_tabDetalle(tab) {
  document.querySelectorAll('.tabs .tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', ['docs','mant','equipo'][i] === tab);
  });
  if (tab === 'docs')   bien_renderDocs();
  if (tab === 'mant')   bien_renderMant();
  if (tab === 'equipo') bien_renderEquipo();
}

// ── DOCUMENTOS ──────────────────────────────────────────

function bien_renderDocs() {
  const cont = document.getElementById('bien-detalle-contenido');
  const docs = BIEN_DETAIL.documentos || [];

  cont.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Documentos del bien</div>
        <button class="btn btn-primary btn-sm" onclick="bien_abrirModalDoc()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar documento
        </button>
      </div>
      <div class="card-body" style="padding:0">
        ${!docs.length ? `
          <div class="empty-state" style="padding:30px">
            <div class="empty-title">Sin documentos</div>
            <div class="empty-sub">Agrega certificados, escrituras, pólizas y más</div>
          </div>` : `
        <table class="table">
          <thead><tr><th>Documento</th><th>Tipo</th><th>Fecha doc.</th><th>Vencimiento</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>
          <tbody>
            ${docs.map(d => {
              const vencido = d.fecha_vencimiento && new Date(d.fecha_vencimiento) < new Date();
              return `<tr>
                <td><div style="font-weight:500;font-size:var(--text-sm)">${d.nombre_documento}</div></td>
                <td><span class="badge badge-navy">${d.tipo_documento}</span></td>
                <td style="font-size:var(--text-sm)">${formatFecha(d.fecha_documento)}</td>
                <td style="font-size:var(--text-sm);${vencido ? 'color:var(--peligro);font-weight:600' : ''}">${formatFecha(d.fecha_vencimiento)}${vencido ? ' ⚠️' : ''}</td>
                <td><span class="badge ${d.estado === 'vigente' ? 'badge-exito' : d.estado === 'vencido' ? 'badge-peligro' : 'badge-alerta'}">${d.estado || '—'}</span></td>
                <td>
                  <div class="table-actions">
                    ${d.url_archivo ? `<a href="${d.url_archivo}" target="_blank" class="btn btn-ghost btn-sm btn-icon" title="Ver archivo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>` : ''}
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="bien_abrirModalDoc('${d.DOC_BIEN_ID}')" title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`}
      </div>
    </div>`;
}

function bien_modalDocHTML() {
  const cfg = APP.config || {};
  const tipos = (cfg.tipo_doc_bien || []).map(t => t.clave);
  return `
    <div class="modal-backdrop" id="doc-modal">
      <div class="modal" style="max-width:540px">
        <div class="modal-header">
          <div class="modal-title" id="doc-modal-title">Agregar documento</div>
          <button class="modal-close" onclick="document.getElementById('doc-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="doc-id">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Tipo documento</label>
              <select class="form-control" id="doc-tipo">
                <option value="">Selecciona tipo</option>
                ${tipos.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label req">Nombre</label>
              <input type="text" class="form-control" id="doc-nombre" placeholder="Nombre del documento">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">URL del archivo (Google Drive)</label>
            <input type="url" class="form-control" id="doc-url" placeholder="https://drive.google.com/...">
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Fecha del documento</label>
              <input type="date" class="form-control" id="doc-fecha">
            </div>
            <div class="form-group">
              <label class="form-label">Fecha vencimiento</label>
              <input type="date" class="form-control" id="doc-vencimiento">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-control" id="doc-estado">
                <option value="vigente">Vigente</option>
                <option value="vencido">Vencido</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div class="form-group"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <textarea class="form-control" id="doc-obs" rows="2"></textarea>
          </div>
          <div id="doc-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:8px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('doc-modal').classList.remove('active')">Cancelar</button>
          <button class="btn btn-primary" id="doc-btn-guardar" onclick="bien_guardarDoc()">Guardar</button>
        </div>
      </div>
    </div>`;
}

function bien_abrirModalDoc(DOC_ID = null) {
  document.getElementById('doc-modal-title').textContent = DOC_ID ? 'Editar documento' : 'Agregar documento';
  document.getElementById('doc-id').value = '';
  document.getElementById('doc-tipo').value = '';
  document.getElementById('doc-nombre').value = '';
  document.getElementById('doc-url').value = '';
  document.getElementById('doc-fecha').value = '';
  document.getElementById('doc-vencimiento').value = '';
  document.getElementById('doc-estado').value = 'vigente';
  document.getElementById('doc-obs').value = '';
  document.getElementById('doc-error').style.display = 'none';

  if (DOC_ID) {
    const d = (BIEN_DETAIL.documentos || []).find(x => x.DOC_BIEN_ID === DOC_ID);
    if (d) {
      document.getElementById('doc-id').value         = d.DOC_BIEN_ID;
      document.getElementById('doc-tipo').value        = d.tipo_documento || '';
      document.getElementById('doc-nombre').value      = d.nombre_documento || '';
      document.getElementById('doc-url').value         = d.url_archivo || '';
      document.getElementById('doc-fecha').value       = d.fecha_documento ? String(d.fecha_documento).split('T')[0] : '';
      document.getElementById('doc-vencimiento').value = d.fecha_vencimiento ? String(d.fecha_vencimiento).split('T')[0] : '';
      document.getElementById('doc-estado').value      = d.estado || 'vigente';
      document.getElementById('doc-obs').value         = d.observaciones || '';
    }
  }

  document.getElementById('doc-modal').classList.add('active');
}

async function bien_guardarDoc() {
  const errEl = document.getElementById('doc-error');
  errEl.style.display = 'none';
  const data = {
    DOC_BIEN_ID:           document.getElementById('doc-id').value || undefined,
    BIEN_ADM_ID:          BIEN_DETAIL.BIEN_ADM_ID,
    tipo_documento:   document.getElementById('doc-tipo').value,
    nombre_documento: document.getElementById('doc-nombre').value.trim(),
    url_archivo:      document.getElementById('doc-url').value.trim(),
    fecha_documento:  document.getElementById('doc-fecha').value,
    fecha_vencimiento:document.getElementById('doc-vencimiento').value,
    estado:           document.getElementById('doc-estado').value,
    observaciones:    document.getElementById('doc-obs').value.trim()
  };
  if (!data.tipo_documento || !data.nombre_documento) { errEl.textContent = 'Tipo y nombre son requeridos'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('doc-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const res = await apiSaveDocBien(data);
    if (res.ok) {
      toast('Documento guardado', 'ok');
      document.getElementById('doc-modal').classList.remove('active');
      await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID);
    } else { errEl.textContent = res.error || 'Error'; errEl.style.display = 'block'; }
  } catch(e) { errEl.textContent = 'Error de conexión'; errEl.style.display = 'block'; }
  btn.disabled = false; btn.textContent = 'Guardar';
}

// ── ÓRDENES DE TRABAJO (MANTENIMIENTO) ──────────────────

const MANT_ESTADO_BADGE = {
  'Solicitado':'badge-gris','Aprobado':'badge-azul','Rechazado':'badge-peligro',
  'En compra':'badge-morado','En ejecución':'badge-alerta','Completado':'badge-exito','Cancelado':'badge-gris'
};
const MANT_FLUJO = ['Solicitado','Aprobado','En compra','En ejecución','Completado'];

function bien_renderMant() {
  const cont = document.getElementById('bien-detalle-contenido');
  const mants = BIEN_DETAIL.mantenimientos || [];

  cont.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Órdenes de trabajo</div>
        <button class="btn btn-primary btn-sm" onclick="bien_abrirModalMant()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva solicitud
        </button>
      </div>
      <div class="card-body" style="padding:0">
        ${!mants.length ? `
          <div class="empty-state" style="padding:30px">
            <div class="empty-title">Sin órdenes de trabajo</div>
            <div class="empty-sub">Crea una solicitud de mantenimiento, reparación o mejora</div>
          </div>` :
          mants.map(m => mant_renderCard(m)).join('')}
      </div>
    </div>`;
}

function mant_renderCard(m) {
  const pasoActual = MANT_FLUJO.indexOf(m.estado);
  const esTerminal = m.estado === 'Rechazado' || m.estado === 'Cancelado' || m.estado === 'Completado';

  // Barra de progreso visual
  const progreso = MANT_FLUJO.map((paso, i) => {
    let clase = 'mant-step-pending';
    if (i < pasoActual || m.estado === 'Completado') clase = 'mant-step-done';
    else if (i === pasoActual && !esTerminal) clase = 'mant-step-active';
    return `<div class="${clase}" style="flex:1;height:4px;border-radius:2px;background:${
      clase === 'mant-step-done' ? 'var(--exito)' :
      clase === 'mant-step-active' ? 'var(--azul)' : 'var(--gris-borde)'
    }"></div>`;
  }).join('');

  // Botones de acción según estado
  let acciones = '';
  if (m.estado === 'Solicitado') {
    acciones = `
      <button class="btn btn-sm" style="background:var(--exito);color:white" onclick="mant_aprobar('${m.MANT_ID}')">✓ Aprobar</button>
      <button class="btn btn-sm" style="background:var(--peligro);color:white" onclick="mant_rechazar('${m.MANT_ID}')">✗ Rechazar</button>`;
  } else if (m.estado === 'Aprobado') {
    acciones = `<button class="btn btn-sm btn-primary" onclick="mant_avanzar('${m.MANT_ID}','En compra')">→ Iniciar compras</button>
                <button class="btn btn-sm btn-primary" onclick="mant_avanzar('${m.MANT_ID}','En ejecución')">→ Ir a ejecución</button>`;
  } else if (m.estado === 'En compra') {
    acciones = `<button class="btn btn-sm btn-primary" onclick="mant_avanzar('${m.MANT_ID}','En ejecución')">→ Iniciar ejecución</button>`;
  } else if (m.estado === 'En ejecución') {
    acciones = `<button class="btn btn-sm" style="background:var(--exito);color:white" onclick="mant_completar('${m.MANT_ID}')">✓ Completar</button>`;
  }

  return `
    <div style="padding:16px;border-bottom:1px solid var(--gris-borde)">
      <div style="display:flex;align-items:start;gap:12px;margin-bottom:10px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="badge ${m.tipo_mantenimiento === 'Preventivo' ? 'badge-azul' : m.tipo_mantenimiento === 'Correctivo' ? 'badge-alerta' : 'badge-exito'}">${m.tipo_mantenimiento}</span>
            <span class="badge ${MANT_ESTADO_BADGE[m.estado] || 'badge-gris'}">${m.estado}</span>
            ${m.prioridad === 'Alta' ? '<span class="badge badge-peligro">⚡ Alta</span>' : ''}
          </div>
          <div style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro)">${m.descripcion}</div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:4px">
            Solicitado por ${m.solicitado_por_nombre || '—'} · ${formatFecha(m.fecha_solicitud)}
            ${m.aprobado_por_nombre ? ' · Aprobado por ' + m.aprobado_por_nombre : ''}
            ${m.motivo_rechazo ? ' · <span style="color:var(--peligro)">Motivo: ' + m.motivo_rechazo + '</span>' : ''}
          </div>
        </div>
        <div style="text-align:right;min-width:120px">
          <div style="font-size:var(--text-xs);color:var(--gris-mid)">Estimado</div>
          <div style="font-weight:700;font-size:var(--text-sm)">${m.costo_estimado ? formatCOP(m.costo_estimado) : '—'}</div>
          ${m.costo_real ? `<div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">Real: <strong>${formatCOP(m.costo_real)}</strong></div>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:3px;margin-bottom:10px">${progreso}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${acciones}
        <button class="btn btn-ghost btn-sm" onclick="bien_abrirModalMant('${m.MANT_ID}')" style="margin-left:auto">Editar</button>
      </div>
    </div>`;
}

function bien_modalMantHTML() {
  const cfg = APP.config || {};
  const tipos = (cfg.tipo_mantenimiento || []).map(t => t.clave);
  return `
    <div class="modal-backdrop" id="mant-modal">
      <div class="modal" style="max-width:560px">
        <div class="modal-header">
          <div class="modal-title" id="mant-modal-title">Nueva solicitud</div>
          <button class="modal-close" onclick="document.getElementById('mant-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="mant-id">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Tipo</label>
              <select class="form-control" id="mant-tipo">
                <option value="">Selecciona</option>
                ${tipos.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Prioridad</label>
              <select class="form-control" id="mant-prioridad">
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label req">Descripción</label>
            <textarea class="form-control" id="mant-desc" rows="3" placeholder="¿Qué se necesita hacer y por qué?"></textarea>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Costo estimado</label>
              <input type="number" class="form-control" id="mant-costo" placeholder="0" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Evidencia (URL)</label>
              <input type="url" class="form-control" id="mant-evidencia" placeholder="https://drive.google.com/...">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <textarea class="form-control" id="mant-obs" rows="2"></textarea>
          </div>
          <div id="mant-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:8px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('mant-modal').classList.remove('active')">Cancelar</button>
          <button class="btn btn-primary" id="mant-btn-guardar" onclick="bien_guardarMant()">Crear solicitud</button>
        </div>
      </div>
    </div>`;
}

function bien_abrirModalMant(MANT_ID = null) {
  document.getElementById('mant-modal-title').textContent = MANT_ID ? 'Editar orden' : 'Nueva solicitud';
  document.getElementById('mant-id').value = '';
  document.getElementById('mant-tipo').value = '';
  document.getElementById('mant-prioridad').value = 'Media';
  document.getElementById('mant-desc').value = '';
  document.getElementById('mant-costo').value = '';
  document.getElementById('mant-evidencia').value = '';
  document.getElementById('mant-obs').value = '';
  document.getElementById('mant-error').style.display = 'none';
  document.getElementById('mant-btn-guardar').textContent = 'Crear solicitud';

  if (MANT_ID) {
    const m = (BIEN_DETAIL.mantenimientos || []).find(x => x.MANT_ID === MANT_ID);
    if (m) {
      document.getElementById('mant-id').value       = m.MANT_ID;
      document.getElementById('mant-tipo').value      = m.tipo_mantenimiento || '';
      document.getElementById('mant-prioridad').value = m.prioridad || 'Media';
      document.getElementById('mant-desc').value      = m.descripcion || '';
      document.getElementById('mant-costo').value     = m.costo_estimado || '';
      document.getElementById('mant-evidencia').value = m.evidencia_url || '';
      document.getElementById('mant-obs').value       = m.observaciones || '';
      document.getElementById('mant-btn-guardar').textContent = 'Guardar cambios';
    }
  }
  document.getElementById('mant-modal').classList.add('active');
}

async function bien_guardarMant() {
  const errEl = document.getElementById('mant-error');
  errEl.style.display = 'none';
  const data = {
    MANT_ID:             document.getElementById('mant-id').value || undefined,
    entidad_tipo:        'bien',
    entidad_id:          BIEN_DETAIL.BIEN_ADM_ID,
    tipo_mantenimiento:  document.getElementById('mant-tipo').value,
    descripcion:         document.getElementById('mant-desc').value.trim(),
    prioridad:           document.getElementById('mant-prioridad').value,
    costo_estimado:      document.getElementById('mant-costo').value || 0,
    observaciones:       document.getElementById('mant-obs').value.trim(),
    evidencia_url:       document.getElementById('mant-evidencia').value.trim()
  };
  if (!data.tipo_mantenimiento || !data.descripcion) { errEl.textContent = 'Tipo y descripción requeridos'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('mant-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const res = await apiSaveMantBien(data);
    if (res.ok) {
      toast(data.MANT_ID ? 'Orden actualizada' : 'Solicitud creada', 'ok');
      document.getElementById('mant-modal').classList.remove('active');
      await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID);
    } else { errEl.textContent = res.error || 'Error'; errEl.style.display = 'block'; }
  } catch(e) { errEl.textContent = 'Error de conexión'; errEl.style.display = 'block'; }
  btn.disabled = false; btn.textContent = 'Guardar';
}

// ── Acciones del flujo ──
async function mant_aprobar(MANT_ID) {
  if (!confirm('¿Aprobar esta orden de trabajo?')) return;
  try {
    const res = await apiAprobarMant(MANT_ID);
    if (res.ok) { toast('Orden aprobada', 'ok'); await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}

async function mant_rechazar(MANT_ID) {
  const motivo = prompt('Motivo del rechazo:');
  if (!motivo) return;
  try {
    const res = await apiRechazarMant(MANT_ID, motivo);
    if (res.ok) { toast('Orden rechazada', 'ok'); await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}

async function mant_avanzar(MANT_ID, nuevoEstado) {
  if (!confirm('¿Avanzar la orden a "' + nuevoEstado + '"?')) return;
  try {
    const res = await apiAvanzarMant(MANT_ID, nuevoEstado);
    if (res.ok) { toast('Orden avanzada', 'ok'); await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}

async function mant_completar(MANT_ID) {
  const evidencia = prompt('URL de evidencia (foto/video del trabajo terminado):');
  try {
    const res = await apiAvanzarMant(MANT_ID, 'Completado', evidencia || '');
    if (res.ok) { toast('Orden completada', 'ok'); await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}

// ── EQUIPO (PARTICIPANTES) ──────────────────────────────

function bien_renderEquipo() {
  const cont = document.getElementById('bien-detalle-contenido');
  const parts = BIEN_DETAIL.participantes || [];
  const ROL_COLORES = {
    'Responsable':'badge-navy', 'Ejecutivo comercial':'badge-azul', 'Jurídico':'badge-morado',
    'Mantenimiento':'badge-alerta', 'Cartera':'badge-exito', 'Apoyo':'badge-gris'
  };

  cont.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Equipo asignado</div>
        <button class="btn btn-primary btn-sm" onclick="bien_abrirModalPart()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Asignar persona
        </button>
      </div>
      <div class="card-body" style="padding:${parts.length ? '0' : ''}">
        ${!parts.length ? `
          <div class="empty-state" style="padding:30px">
            <div class="empty-title">Sin equipo asignado</div>
            <div class="empty-sub">Asigna funcionarios para gestionar este bien</div>
          </div>` : `
        <table class="table">
          <thead><tr><th>Funcionario</th><th>Área</th><th>Rol en proceso</th><th>Desde</th><th style="text-align:right">Acción</th></tr></thead>
          <tbody>
            ${parts.map(p => `<tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar sm">${getInitials(p.func_nombre || '')}</div>
                  <div style="font-weight:500;font-size:var(--text-sm)">${p.func_nombre || '—'}</div>
                </div>
              </td>
              <td><span class="badge badge-navy">${p.func_area || '—'}</span></td>
              <td><span class="badge ${ROL_COLORES[p.rol_proceso] || 'badge-gris'}">${p.rol_proceso}</span></td>
              <td style="font-size:var(--text-sm)">${formatFecha(p.fecha_asignacion)}</td>
              <td><div class="table-actions">
                <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--peligro)" onclick="bien_quitarParticipante('${p.PART_ID}','${p.func_nombre}')" title="Remover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </button>
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>`}
      </div>
    </div>`;
}

function bien_modalPartHTML() {
  const cfg = APP.config || {};
  const roles = (cfg.rol_proceso || []).map(r => r.clave);
  return `
    <div class="modal-backdrop" id="part-modal">
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <div class="modal-title">Asignar persona al bien</div>
          <button class="modal-close" onclick="document.getElementById('part-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label req">Funcionario</label>
            <select class="form-control" id="part-func">
              <option value="">Selecciona funcionario</option>
              ${BIEN_FUNC.map(f => `<option value="${f.FUNC_ID}">${f.nombre} ${f.apellido} — ${f.area}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label req">Rol en el proceso</label>
            <select class="form-control" id="part-rol">
              <option value="">Selecciona rol</option>
              ${roles.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-control" id="part-notas" rows="2" placeholder="Notas sobre la asignación..."></textarea>
          </div>
          <div id="part-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:8px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('part-modal').classList.remove('active')">Cancelar</button>
          <button class="btn btn-primary" id="part-btn-guardar" onclick="bien_guardarPart()">Asignar</button>
        </div>
      </div>
    </div>`;
}

function bien_abrirModalPart() {
  document.getElementById('part-func').value = '';
  document.getElementById('part-rol').value = '';
  document.getElementById('part-notas').value = '';
  document.getElementById('part-error').style.display = 'none';
  document.getElementById('part-modal').classList.add('active');
}

async function bien_guardarPart() {
  const errEl = document.getElementById('part-error');
  errEl.style.display = 'none';
  const data = {
    entidad_tipo: 'bien',
    entidad_id:   BIEN_DETAIL.BIEN_ADM_ID,
    FUNC_ID:      document.getElementById('part-func').value,
    rol_proceso:  document.getElementById('part-rol').value,
    notas:        document.getElementById('part-notas').value.trim()
  };
  if (!data.FUNC_ID || !data.rol_proceso) { errEl.textContent = 'Selecciona funcionario y rol'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('part-btn-guardar');
  btn.disabled = true; btn.textContent = 'Asignando...';
  try {
    const res = await apiSaveParticipante(data);
    if (res.ok) {
      toast('Persona asignada', 'ok');
      document.getElementById('part-modal').classList.remove('active');
      await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID);
    } else { errEl.textContent = res.error || 'Error'; errEl.style.display = 'block'; }
  } catch(e) { errEl.textContent = 'Error de conexión'; errEl.style.display = 'block'; }
  btn.disabled = false; btn.textContent = 'Asignar';
}

async function bien_quitarParticipante(PART_ID, nombre) {
  if (!confirm(`¿Remover a ${nombre} de este bien?`)) return;
  try {
    const res = await apiDeleteParticipante(PART_ID);
    if (res.ok) { toast('Persona removida', 'ok'); await bien_verDetalle(BIEN_DETAIL.BIEN_ADM_ID); }
    else toast(res.error || 'Error', 'error');
  } catch(e) { toast('Error de conexión', 'error'); }
}
