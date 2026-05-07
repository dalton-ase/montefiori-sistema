/**
 * ============================================================
 * ALIANZA CRM — config.js
 * Módulo de configuración del sistema
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_config = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="margin-bottom:22px">
      <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Configuración</h2>
      <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Parámetros globales del sistema · Todo viene de esta tabla</p>
    </div>

    <div style="padding:10px 14px;background:var(--navy-light);border-radius:var(--r);
                border:1px solid var(--navy-alpha);margin-bottom:20px;
                font-size:var(--text-sm);color:var(--navy)" class="anim-1">
      <strong>Principio de diseño:</strong> Nada está hardcodeado.
      Cada lista desplegable, estado, área, porcentaje y parámetro del sistema
      viene de esta tabla CONFIG. Si necesitas agregar un nuevo valor,
      agrégalo aquí y el sistema lo reflejará automáticamente.
    </div>

    <!-- Tabs por categoría -->
    <div class="tabs anim-2" id="cfg-tabs" style="flex-wrap:wrap"></div>

    <!-- Contenido -->
    <div id="cfg-contenido" class="anim-3">
      <div style="padding:40px;text-align:center">
        <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
      </div>
    </div>

    <!-- Modal editar parámetro -->
    <div class="modal-backdrop" id="cfg-modal">
      <div class="modal" style="max-width:460px">
        <div class="modal-header">
          <div class="modal-title">Editar parámetro</div>
          <button class="modal-close" onclick="document.getElementById('cfg-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cfg-edit-id">
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <input type="text" class="form-control" id="cfg-edit-cat" readonly
                   style="background:var(--gris-bg);color:var(--gris-mid)">
          </div>
          <div class="form-group">
            <label class="form-label">Clave</label>
            <input type="text" class="form-control" id="cfg-edit-clave" readonly
                   style="background:var(--gris-bg);color:var(--gris-mid)">
          </div>
          <div class="form-group">
            <label class="form-label req">Valor</label>
            <input type="text" class="form-control" id="cfg-edit-valor" placeholder="Nuevo valor">
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input type="text" class="form-control" id="cfg-edit-desc" readonly
                   style="background:var(--gris-bg);color:var(--gris-mid)">
          </div>
          <div id="cfg-edit-error" style="display:none;padding:10px 12px;background:var(--peligro-light);
               border:1px solid var(--peligro-borde);border-radius:var(--r);
               color:var(--peligro);font-size:var(--text-sm);margin-top:8px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('cfg-modal').classList.remove('active')">Cancelar</button>
          <button class="btn btn-primary" id="cfg-btn-guardar" onclick="cfg_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar
          </button>
        </div>
      </div>
    </div>`;

  await cfg_cargarDatos();
};

// ── Estado ───────────────────────────────────────
let CFG_DATA     = {};
let CFG_TAB_ACT  = '';
let CFG_RAW      = []; // Para saber CONFIG_IDs

async function cfg_cargarDatos() {
  try {
    const res = await apiGetConfig();
    if (!res.ok) { document.getElementById('cfg-contenido').innerHTML = `<div class="empty-sub" style="color:var(--peligro)">Error cargando configuración</div>`; return; }
    CFG_DATA = res.data || {};

    // También cargar raw para tener CONFIG_IDs
    const rawRes = await api('getConfigRaw', {});
    CFG_RAW = rawRes.ok ? (rawRes.data || []) : [];

    cfg_renderTabs();
  } catch(e) {
    console.error(e);
  }
}

const CFG_LABELS = {
  'estado_cliente':     '🧑 Estados cliente',
  'estado_lote':        '🏡 Estados lote',
  'estado_negocio':     '📋 Estados negocio',
  'modalidad_negocio':  '💰 Modalidades pago',
  'tipo_gestion':       '📞 Tipos gestión',
  'resultado_gestion':  '✅ Resultados gestión',
  'tipo_tarea':         '📝 Tipos tarea',
  'prioridad_tarea':    '⚡ Prioridades',
  'tipo_evento':        '⚠️ Tipos evento',
  'tipo_documento':     '📄 Tipos documento',
  'tipo_bien':          '🚗 Tipos bien permuta',
  'estado_sc':          '❄️ Estados saldo congelado',
  'origen_cliente':     '🎯 Orígenes cliente',
  'parametro':          '⚙️ Parámetros sistema',
  'municipio':          '📍 Municipios',
  'area':               '🏢 Áreas',
  'rol':                '👤 Roles',
  'visibilidad_doc':    '👁️ Visibilidad docs',
  'form_tally':         '📎 Formularios Tally'
};

function cfg_renderTabs() {
  const tabsEl = document.getElementById('cfg-tabs');
  const categorias = Object.keys(CFG_DATA).sort();

  tabsEl.innerHTML = categorias.map((cat, i) => `
    <button class="tab-btn ${i === 0 ? 'active' : ''}"
            id="cfg-tab-${cat}"
            onclick="cfg_cambiarTab('${cat}')">
      ${CFG_LABELS[cat] || cat}
    </button>`).join('');

  if (categorias.length > 0) {
    CFG_TAB_ACT = categorias[0];
    cfg_renderCategoria(categorias[0]);
  }
}

function cfg_cambiarTab(cat) {
  CFG_TAB_ACT = cat;
  document.querySelectorAll('#cfg-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('cfg-tab-' + cat)?.classList.add('active');
  cfg_renderCategoria(cat);
}

function cfg_renderCategoria(cat) {
  const cont   = document.getElementById('cfg-contenido');
  const items  = CFG_DATA[cat] || [];
  const esParam = cat === 'parametro';

  cont.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${CFG_LABELS[cat] || cat}</div>
        <span style="font-size:var(--text-xs);color:var(--gris-mid)">${items.length} registros</span>
      </div>
      <div class="card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>Clave / Valor</th>
              <th>Descripción</th>
              <th>Editable</th>
              ${esParam ? '<th style="text-align:right">Acción</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>
                  <div style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro)">${item.clave}</div>
                  ${esParam ? `<div style="font-size:var(--text-xs);color:var(--azul);font-weight:500;margin-top:2px">Valor actual: ${item.valor}</div>` : ''}
                </td>
                <td style="font-size:var(--text-sm);color:var(--gris-mid)">${item.descripcion || '—'}</td>
                <td>
                  <span class="badge ${String(item.editable) === 'true' ? 'badge-exito' : 'badge-gris'}">
                    ${String(item.editable) === 'true' ? 'Sí' : 'Solo lectura'}
                  </span>
                </td>
                ${esParam ? `
                <td style="text-align:right">
                  ${String(item.editable) === 'true' ? `
                    <button class="btn btn-ghost btn-sm btn-icon"
                            onclick="cfg_abrirEditar('${cat}','${item.clave}')"
                            title="Editar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>` : '<span style="color:var(--gris-borde);font-size:var(--text-xs)">—</span>'}
                </td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${!esParam ? `
      <div class="card-footer" style="justify-content:flex-end">
        <span style="font-size:var(--text-xs);color:var(--gris-mid)">
          Para agregar o modificar valores de esta categoría,
          edítalos directamente en la hoja CONFIG del Spreadsheet CRM.
        </span>
      </div>` : ''}
    </div>

    ${cat === 'parametro' ? cfg_renderParametrosDestacados(items) : ''}`;
}

function cfg_renderParametrosDestacados(items) {
  const getVal = (clave) => items.find(i => i.clave === clave)?.valor || '—';
  return `
    <div style="margin-top:16px;padding:14px 16px;background:var(--navy-light);
                border-radius:var(--r-lg);border:1px solid var(--navy-alpha)">
      <div style="font-family:'Montserrat',sans-serif;font-size:var(--text-xs);font-weight:700;
                  color:var(--navy);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">
        Parámetros destacados del negocio
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${[
          { label: '% Arras default',       val: getVal('pct_arras_default') + '%' },
          { label: '% Penal default',        val: getVal('pct_penal_default') + '%' },
          { label: 'Meses saldo congelado',  val: getVal('meses_sc') + ' meses' },
          { label: 'Cuota mínima SC',        val: '$' + Number(getVal('cuota_minima_sc')).toLocaleString('es-CO') },
          { label: 'Días sin gestión alerta',val: getVal('dias_sin_gestion_alerta') + ' días' },
          { label: 'Alerta SC vencimiento',  val: getVal('dias_alerta_sc_vencimiento') + ' días antes' }
        ].map(p => `
          <div style="background:white;border-radius:var(--r);padding:10px 12px">
            <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-bottom:2px">${p.label}</div>
            <div style="font-family:'Montserrat',sans-serif;font-size:var(--text-md);
                        font-weight:700;color:var(--navy)">${p.val}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function cfg_abrirEditar(cat, clave) {
  const item = (CFG_DATA[cat] || []).find(i => i.clave === clave);
  if (!item) return;

  // Buscar CONFIG_ID en raw
  const raw = CFG_RAW.find(r => r.categoria === cat && r.clave === clave);

  document.getElementById('cfg-edit-id').value    = raw?.CONFIG_ID || '';
  document.getElementById('cfg-edit-cat').value   = cat;
  document.getElementById('cfg-edit-clave').value  = clave;
  document.getElementById('cfg-edit-valor').value  = item.valor || '';
  document.getElementById('cfg-edit-desc').value   = item.descripcion || '';
  document.getElementById('cfg-edit-error').style.display = 'none';

  document.getElementById('cfg-modal').classList.add('active');
}

async function cfg_guardar() {
  const errEl    = document.getElementById('cfg-edit-error');
  const CONFIG_ID = document.getElementById('cfg-edit-id').value;
  const valor    = document.getElementById('cfg-edit-valor').value.trim();
  errEl.style.display = 'none';

  if (!CONFIG_ID) { errEl.textContent = 'ID de configuración no encontrado. Edita directamente en el Spreadsheet.'; errEl.style.display = 'block'; return; }
  if (!valor)     { errEl.textContent = 'El valor no puede estar vacío.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('cfg-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await apiSaveConfigItem(CONFIG_ID, valor);
    if (res.ok) {
      toast('Parámetro actualizado', 'ok');
      document.getElementById('cfg-modal').classList.remove('active');
      // Refrescar config en APP
      const cfgRes = await apiGetConfig();
      if (cfgRes.ok) { APP.config = cfgRes.data; CFG_DATA = cfgRes.data; }
      cfg_renderCategoria(CFG_TAB_ACT);
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
