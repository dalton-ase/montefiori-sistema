/**
 * ============================================================
 * ALIANZA CRM — proyectos.js
 * Módulo de gestión de proyectos y lotes
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_proyectos = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--oscuro)">Proyectos y Lotes</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Inventario de proyectos activos y lotes</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary" onclick="proy_abrirImportarLotes()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importar lotes
        </button>
        <button class="btn btn-primary" onclick="proy_abrirModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo proyecto
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs anim-2">
      <button class="tab-btn active" id="tab-proyectos" onclick="proy_cambiarTab('proyectos')">Proyectos</button>
      <button class="tab-btn" id="tab-lotes" onclick="proy_cambiarTab('lotes')">Lotes</button>
    </div>

    <!-- Contenido tabs -->
    <div id="proy-contenido" class="anim-3"></div>

    <!-- Modal Proyecto -->
    <div class="modal-backdrop" id="proy-modal">
      <div class="modal" style="max-width:640px">
        <div class="modal-header">
          <div class="modal-title" id="proy-modal-title">Nuevo proyecto</div>
          <button class="modal-close" onclick="proy_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="proy-id">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Nombre del proyecto</label>
              <input type="text" class="form-control" id="proy-nombre" placeholder="Ej: Terra Nova">
            </div>
            <div class="form-group">
              <label class="form-label">Código</label>
              <input type="text" class="form-control" id="proy-codigo" placeholder="Ej: TN-001">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Municipio</label>
              <select class="form-control" id="proy-municipio"></select>
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-control" id="proy-estado">
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Área total</label>
              <input type="number" class="form-control" id="proy-area" placeholder="Ej: 50000">
            </div>
            <div class="form-group">
              <label class="form-label">Unidad</label>
              <select class="form-control" id="proy-unidad">
                <option value="m2">m²</option>
                <option value="ha">Hectáreas</option>
              </select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Fecha inicio</label>
              <input type="date" class="form-control" id="proy-fecha-inicio">
            </div>
            <div class="form-group">
              <label class="form-label">Fecha entrega</label>
              <input type="date" class="form-control" id="proy-fecha-entrega">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea class="form-control" id="proy-descripcion" placeholder="Descripción del proyecto..."></textarea>
          </div>
          <div id="proy-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm)"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="proy_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="proy-btn-guardar" onclick="proy_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Lote -->
    <div class="modal-backdrop" id="lote-modal">
      <div class="modal" style="max-width:640px">
        <div class="modal-header">
          <div class="modal-title" id="lote-modal-title">Nuevo lote</div>
          <button class="modal-close" onclick="lote_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="lote-id">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Proyecto</label>
              <select class="form-control" id="lote-proy-id"></select>
            </div>
            <div class="form-group">
              <label class="form-label req">Código lote</label>
              <input type="text" class="form-control" id="lote-codigo" placeholder="Ej: A-01">
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Área m²</label>
              <input type="number" class="form-control" id="lote-area" placeholder="250">
            </div>
            <div class="form-group">
              <label class="form-label">Frente (m)</label>
              <input type="number" class="form-control" id="lote-frente" placeholder="10">
            </div>
            <div class="form-group">
              <label class="form-label">Fondo (m)</label>
              <input type="number" class="form-control" id="lote-fondo" placeholder="25">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Precio lista ($)</label>
              <input type="number" class="form-control" id="lote-precio" placeholder="0">
            </div>
            <div class="form-group">
              <label class="form-label">Precio mínimo ($)</label>
              <input type="number" class="form-control" id="lote-precio-min" placeholder="0">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-control" id="lote-estado"></select>
            </div>
            <div class="form-group">
              <label class="form-label">Manzana / Bloque</label>
              <input type="text" class="form-control" id="lote-manzana" placeholder="Manzana A">
            </div>
          </div>
          <div id="lote-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm)"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="lote_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="lote-btn-guardar" onclick="lote_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal importar lotes -->
    <div class="modal-backdrop" id="import-modal">
      <div class="modal" style="max-width:580px">
        <div class="modal-header">
          <div class="modal-title">Importar lotes desde CSV</div>
          <button class="modal-close" onclick="document.getElementById('import-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="padding:12px 14px;background:var(--navy-light);border-radius:var(--r);margin-bottom:16px;font-size:var(--text-sm);color:var(--navy)">
            <strong>Formato requerido:</strong> El archivo CSV debe tener estas columnas en orden:<br>
            <code style="font-size:var(--text-xs);background:white;padding:2px 6px;border-radius:4px;margin-top:6px;display:inline-block">
              PROY_ID, codigo_lote, numero_manzana, area_m2, frente, fondo, precio_lista, precio_minimo, estado
            </code>
          </div>
          <div class="form-group">
            <label class="form-label">Selecciona archivo CSV</label>
            <input type="file" class="form-control" id="import-file" accept=".csv">
          </div>
          <div id="import-preview" style="display:none"></div>
          <div id="import-resultado" style="display:none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('import-modal').classList.remove('active')">Cancelar</button>
          <button class="btn btn-primary" id="import-btn" onclick="proy_procesarImport()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar
          </button>
        </div>
      </div>
    </div>`;

  await proy_cargarDatos();
  proy_cambiarTab('proyectos');
};

// ── Estado ───────────────────────────────────────
let PROY_DATA  = [];
let LOTES_DATA = [];
let PROY_TAB   = 'proyectos';

async function proy_cargarDatos() {
  const [pr, lo] = await Promise.all([apiGetProyectos(), apiGetLotes()]);
  if (pr.ok) PROY_DATA  = pr.data || [];
  if (lo.ok) LOTES_DATA = lo.data || [];
  proy_cargarSelectoresModal();
}

function proy_cargarSelectoresModal() {
  const cfg       = APP.config || {};
  const municipios = (cfg.municipio || []).map(m => m.clave);
  const estadosLote = (cfg.estado_lote || []).map(e => e.clave);

  // Municipios en modal proyecto
  const selMun = document.getElementById('proy-municipio');
  if (selMun) {
    selMun.innerHTML = '<option value="">Selecciona municipio</option>';
    municipios.forEach(m => selMun.innerHTML += `<option value="${m}">${m}</option>`);
  }

  // Proyectos en modal lote
  const selProy = document.getElementById('lote-proy-id');
  if (selProy) {
    selProy.innerHTML = '<option value="">Selecciona proyecto</option>';
    PROY_DATA.forEach(p => selProy.innerHTML += `<option value="${p.PROY_ID}">${p.nombre}</option>`);
  }

  // Estados lote
  const selEst = document.getElementById('lote-estado');
  if (selEst) {
    selEst.innerHTML = '';
    estadosLote.forEach(e => selEst.innerHTML += `<option value="${e}">${e}</option>`);
  }
}

// ── TABS ─────────────────────────────────────────
function proy_cambiarTab(tab) {
  PROY_TAB = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  tab === 'proyectos' ? proy_renderProyectos() : proy_renderLotes();
}

// ── PROYECTOS ─────────────────────────────────────
function proy_renderProyectos() {
  const cont = document.getElementById('proy-contenido');
  if (!cont) return;

  if (!PROY_DATA.length) {
    cont.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="empty-title">Sin proyectos</div>
          <div class="empty-sub">Crea el primer proyecto con el botón "Nuevo proyecto"</div>
        </div>
      </div>`;
    return;
  }

  cont.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">
      ${PROY_DATA.map(p => {
        const lotes      = LOTES_DATA.filter(l => l.PROY_ID === p.PROY_ID);
        const disponibles = lotes.filter(l => l.estado === 'Disponible').length;
        const vendidos   = lotes.filter(l => l.estado === 'Vendido').length;
        const separados  = lotes.filter(l => l.estado === 'Separado').length;
        return `
          <div class="card" style="cursor:pointer;transition:all var(--tr)"
               onmouseover="this.style.boxShadow='var(--sh-md)';this.style.transform='translateY(-2px)'"
               onmouseout="this.style.boxShadow='';this.style.transform=''">
            <div class="card-header">
              <div>
                <div class="card-title">${p.nombre}</div>
                <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">
                  ${p.municipio} · ${p.codigo || 'Sin código'}
                </div>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <span class="badge ${p.estado === 'activo' ? 'badge-exito' : 'badge-gris'}">${p.estado || 'activo'}</span>
                <button class="btn btn-ghost btn-icon btn-sm" onclick="proy_abrirModal('${p.PROY_ID}')" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;margin-bottom:12px">
                <div style="padding:8px;background:var(--verde-light);border-radius:var(--r-sm)">
                  <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;color:var(--verde-dark)">${disponibles}</div>
                  <div style="font-size:var(--text-xs);color:var(--verde-dark)">Disponibles</div>
                </div>
                <div style="padding:8px;background:var(--alerta-light);border-radius:var(--r-sm)">
                  <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;color:var(--alerta)">${separados}</div>
                  <div style="font-size:var(--text-xs);color:var(--alerta)">Separados</div>
                </div>
                <div style="padding:8px;background:var(--navy-light);border-radius:var(--r-sm)">
                  <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;color:var(--navy)">${vendidos}</div>
                  <div style="font-size:var(--text-xs);color:var(--navy)">Vendidos</div>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="font-size:var(--text-xs);color:var(--gris-mid)">${lotes.length} lotes en total</div>
                <button class="btn btn-accent btn-sm" onclick="proy_verLotesDe('${p.PROY_ID}')">
                  Ver lotes
                </button>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function proy_verLotesDe(PROY_ID) {
  proy_cambiarTab('lotes');
  setTimeout(() => {
    const sel = document.getElementById('lotes-filtro-proy');
    if (sel) { sel.value = PROY_ID; lotes_filtrar(); }
  }, 100);
}

// ── LOTES ─────────────────────────────────────────
function proy_renderLotes() {
  const cont = document.getElementById('proy-contenido');
  if (!cont) return;

  cont.innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 200px 200px auto;gap:10px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="lotes-buscar" placeholder="Buscar por código..." oninput="lotes_filtrar()">
          </div>
          <select class="form-control" id="lotes-filtro-proy" onchange="lotes_filtrar()">
            <option value="">Todos los proyectos</option>
            ${PROY_DATA.map(p => `<option value="${p.PROY_ID}">${p.nombre}</option>`).join('')}
          </select>
          <select class="form-control" id="lotes-filtro-estado" onchange="lotes_filtrar()">
            <option value="">Todos los estados</option>
            ${(APP.config?.estado_lote || []).map(e => `<option value="${e.clave}">${e.clave}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" onclick="lote_abrirModal()">+ Lote</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0">
        <div id="lotes-tabla-wrap" class="table-wrap"></div>
      </div>
    </div>`;

  lotes_filtrar();
}

function lotes_filtrar() {
  const q      = (document.getElementById('lotes-buscar')?.value || '').toLowerCase();
  const proy   = document.getElementById('lotes-filtro-proy')?.value || '';
  const estado = document.getElementById('lotes-filtro-estado')?.value || '';

  const filtrado = LOTES_DATA.filter(l => {
    const matchQ = !q || String(l.codigo_lote).toLowerCase().includes(q);
    const matchP = !proy   || l.PROY_ID === proy;
    const matchE = !estado || l.estado  === estado;
    return matchQ && matchP && matchE;
  });

  lotes_renderTabla(filtrado);
}

function lotes_renderTabla(data) {
  const wrap = document.getElementById('lotes-tabla-wrap');
  if (!wrap) return;

  if (!data.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-title">Sin lotes</div><div class="empty-sub">Ajusta los filtros o agrega nuevos lotes</div></div>`;
    return;
  }

  const colorEstado = {
    'Disponible':   'badge-exito',
    'Separado':     'badge-alerta',
    'En contrato':  'badge-morado',
    'Vendido':      'badge-navy',
    'Reservado':    'badge-azul',
    'Bloqueado':    'badge-peligro'
  };

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Proyecto</th>
          <th>Manzana</th>
          <th>Área m²</th>
          <th>Precio lista</th>
          <th>Estado</th>
          <th style="text-align:right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(l => {
          const proy = PROY_DATA.find(p => p.PROY_ID === l.PROY_ID);
          return `
            <tr>
              <td style="font-weight:500;font-size:var(--text-sm)">${l.codigo_lote}</td>
              <td style="font-size:var(--text-sm)">${proy?.nombre || l.PROY_ID}</td>
              <td style="font-size:var(--text-sm)">${l.numero_manzana || '—'}</td>
              <td style="font-size:var(--text-sm)">${l.area_m2 ? Number(l.area_m2).toLocaleString('es-CO') + ' m²' : '—'}</td>
              <td style="font-size:var(--text-sm)">${l.precio_lista ? formatCOP(l.precio_lista) : '—'}</td>
              <td><span class="badge ${colorEstado[l.estado] || 'badge-gris'}">${l.estado || '—'}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-ghost btn-sm btn-icon" onclick="lote_abrirModal('${l.LOTE_ID}')" title="Editar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── MODAL PROYECTO ────────────────────────────────
function proy_abrirModal(PROY_ID = null) {
  ['proy-id','proy-nombre','proy-codigo','proy-area','proy-descripcion','proy-fecha-inicio','proy-fecha-entrega']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('proy-estado').value  = 'activo';
  document.getElementById('proy-unidad').value  = 'm2';
  document.getElementById('proy-error').style.display = 'none';
  document.getElementById('proy-modal-title').textContent = PROY_ID ? 'Editar proyecto' : 'Nuevo proyecto';

  if (PROY_ID) {
    const p = PROY_DATA.find(x => x.PROY_ID === PROY_ID);
    if (p) {
      document.getElementById('proy-id').value            = p.PROY_ID;
      document.getElementById('proy-nombre').value        = p.nombre || '';
      document.getElementById('proy-codigo').value        = p.codigo || '';
      document.getElementById('proy-municipio').value     = p.municipio || '';
      document.getElementById('proy-estado').value        = p.estado || 'activo';
      document.getElementById('proy-area').value          = p.area_total || '';
      document.getElementById('proy-unidad').value        = p.unidad || 'm2';
      document.getElementById('proy-descripcion').value   = p.descripcion || '';
      document.getElementById('proy-fecha-inicio').value  = p.fecha_inicio   ? String(p.fecha_inicio).split('T')[0]  : '';
      document.getElementById('proy-fecha-entrega').value = p.fecha_entrega  ? String(p.fecha_entrega).split('T')[0] : '';
    }
  }
  document.getElementById('proy-modal').classList.add('active');
}

function proy_cerrarModal() {
  document.getElementById('proy-modal').classList.remove('active');
}

async function proy_guardar() {
  const errEl = document.getElementById('proy-error');
  errEl.style.display = 'none';

  const data = {
    PROY_ID:        document.getElementById('proy-id').value || undefined,
    nombre:         document.getElementById('proy-nombre').value.trim(),
    codigo:         document.getElementById('proy-codigo').value.trim(),
    municipio:      document.getElementById('proy-municipio').value,
    estado:         document.getElementById('proy-estado').value,
    area_total:     document.getElementById('proy-area').value,
    unidad:         document.getElementById('proy-unidad').value,
    descripcion:    document.getElementById('proy-descripcion').value.trim(),
    fecha_inicio:   document.getElementById('proy-fecha-inicio').value,
    fecha_entrega:  document.getElementById('proy-fecha-entrega').value
  };

  if (!data.nombre || !data.municipio) {
    errEl.textContent  = 'Nombre y municipio son obligatorios.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('proy-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await apiSaveProyecto(data);
    if (res.ok) {
      toast(data.PROY_ID ? 'Proyecto actualizado' : 'Proyecto creado', 'ok');
      proy_cerrarModal();
      const pr = await apiGetProyectos();
      if (pr.ok) PROY_DATA = pr.data || [];
      proy_renderProyectos();
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

// ── MODAL LOTE ────────────────────────────────────
function lote_abrirModal(LOTE_ID = null) {
  ['lote-id','lote-codigo','lote-area','lote-frente','lote-fondo','lote-precio','lote-precio-min','lote-manzana']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('lote-error').style.display = 'none';
  document.getElementById('lote-modal-title').textContent = LOTE_ID ? 'Editar lote' : 'Nuevo lote';
  document.getElementById('lote-proy-id').disabled = !!LOTE_ID;

  if (LOTE_ID) {
    const l = LOTES_DATA.find(x => x.LOTE_ID === LOTE_ID);
    if (l) {
      document.getElementById('lote-id').value        = l.LOTE_ID;
      document.getElementById('lote-proy-id').value   = l.PROY_ID;
      document.getElementById('lote-codigo').value    = l.codigo_lote;
      document.getElementById('lote-manzana').value   = l.numero_manzana || '';
      document.getElementById('lote-area').value      = l.area_m2 || '';
      document.getElementById('lote-frente').value    = l.frente || '';
      document.getElementById('lote-fondo').value     = l.fondo || '';
      document.getElementById('lote-precio').value    = l.precio_lista || '';
      document.getElementById('lote-precio-min').value = l.precio_minimo || '';
      document.getElementById('lote-estado').value    = l.estado || 'Disponible';
    }
  }
  document.getElementById('lote-modal').classList.add('active');
}

function lote_cerrarModal() {
  document.getElementById('lote-modal').classList.remove('active');
}

async function lote_guardar() {
  const errEl = document.getElementById('lote-error');
  errEl.style.display = 'none';

  const data = {
    LOTE_ID:        document.getElementById('lote-id').value || undefined,
    PROY_ID:        document.getElementById('lote-proy-id').value,
    codigo_lote:    document.getElementById('lote-codigo').value.trim(),
    numero_manzana: document.getElementById('lote-manzana').value.trim(),
    area_m2:        document.getElementById('lote-area').value,
    frente:         document.getElementById('lote-frente').value,
    fondo:          document.getElementById('lote-fondo').value,
    precio_lista:   document.getElementById('lote-precio').value,
    precio_minimo:  document.getElementById('lote-precio-min').value,
    estado:         document.getElementById('lote-estado').value
  };

  if (!data.PROY_ID || !data.codigo_lote) {
    errEl.textContent = 'Proyecto y código de lote son obligatorios.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('lote-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await apiSaveLote(data);
    if (res.ok) {
      toast(data.LOTE_ID ? 'Lote actualizado' : 'Lote creado', 'ok');
      lote_cerrarModal();
      const lo = await apiGetLotes();
      if (lo.ok) LOTES_DATA = lo.data || [];
      proy_renderLotes();
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

// ── IMPORTAR LOTES CSV ────────────────────────────
function proy_abrirImportarLotes() {
  document.getElementById('import-modal').classList.add('active');
  document.getElementById('import-file').value = '';
  document.getElementById('import-preview').style.display = 'none';
  document.getElementById('import-resultado').style.display = 'none';
}

async function proy_procesarImport() {
  const file = document.getElementById('import-file').files[0];
  if (!file) { toast('Selecciona un archivo CSV', 'warning'); return; }

  const texto  = await file.text();
  const lineas = texto.trim().split('\n');
  if (lineas.length < 2) { toast('El archivo está vacío o no tiene datos', 'error'); return; }

  const lotes = [];
  for (let i = 1; i < lineas.length; i++) {
    const cols = lineas[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) continue;
    lotes.push({
      PROY_ID:        cols[0] || '',
      codigo_lote:    cols[1] || '',
      numero_manzana: cols[2] || '',
      area_m2:        cols[3] || '',
      frente:         cols[4] || '',
      fondo:          cols[5] || '',
      precio_lista:   cols[6] || '',
      precio_minimo:  cols[7] || '',
      estado:         cols[8] || 'Disponible'
    });
  }

  const btn = document.getElementById('import-btn');
  btn.disabled = true; btn.textContent = 'Importando...';

  try {
    const res = await apiImportarLotes(lotes);
    const resDiv = document.getElementById('import-resultado');
    resDiv.style.display = 'block';
    resDiv.innerHTML = `
      <div style="padding:12px 14px;background:var(--exito-light);border:1px solid var(--exito-borde);border-radius:var(--r);margin-top:12px">
        <div style="font-weight:500;color:var(--exito);margin-bottom:6px">Importación completada</div>
        <div style="font-size:var(--text-sm);color:var(--oscuro)">
          ✅ Creados: <strong>${res.creados}</strong><br>
          ${res.errores?.length ? `❌ Errores: <strong>${res.errores.length}</strong><br>
            <div style="margin-top:6px;font-size:var(--text-xs);color:var(--peligro)">
              ${res.errores.map(e => `Fila ${e.fila}: ${e.error}`).join('<br>')}
            </div>` : ''}
        </div>
      </div>`;

    if (res.creados > 0) {
      const lo = await apiGetLotes();
      if (lo.ok) LOTES_DATA = lo.data || [];
      toast(`${res.creados} lotes importados correctamente`, 'ok');
    }
  } catch(e) {
    toast('Error al importar', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar';
}
