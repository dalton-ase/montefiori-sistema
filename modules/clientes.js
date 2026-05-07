/**
 * ============================================================
 * ALIANZA CRM — clientes.js
 * Módulo de gestión de clientes
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_clientes = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--oscuro)">Clientes</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Ficha maestra de clientes y prospectos</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary" onclick="cli_abrirImportar()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importar
        </button>
        <button class="btn btn-primary" onclick="cli_abrirModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo cliente
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 180px 180px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="cli-buscar"
                   placeholder="Buscar por nombre, cédula o celular..." oninput="cli_buscar()">
          </div>
          <select class="form-control" id="cli-filtro-pipeline" onchange="cli_cargarLista()">
            <option value="">Todos los estados</option>
          </select>
          <select class="form-control" id="cli-filtro-origen" onchange="cli_cargarLista()">
            <option value="">Todos los orígenes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contadores pipeline -->
    <div id="cli-pipeline-badges" class="anim-2" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"></div>

    <!-- Tabla -->
    <div class="card anim-3">
      <div class="card-header">
        <div class="card-title" id="cli-contador">Clientes</div>
        <div style="font-size:var(--text-xs);color:var(--gris-mid)" id="cli-subtitulo"></div>
      </div>
      <div class="card-body" style="padding:0">
        <div id="cli-tabla-wrap" class="table-wrap">
          <div style="padding:40px;text-align:center">
            <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal cliente -->
    <div class="modal-backdrop" id="cli-modal">
      <div class="modal" style="max-width:680px">
        <div class="modal-header">
          <div class="modal-title" id="cli-modal-title">Nuevo cliente</div>
          <button class="modal-close" onclick="cli_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cli-id">

          <div class="tabs" style="margin-bottom:16px">
            <button class="tab-btn active" onclick="cli_tab('datos')">Datos personales</button>
            <button class="tab-btn" onclick="cli_tab('contacto')">Contacto</button>
            <button class="tab-btn" onclick="cli_tab('negocio')">Info negocio</button>
          </div>

          <!-- Tab datos personales -->
          <div id="cli-tab-datos">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Tipo documento</label>
                <select class="form-control" id="cli-tipo-doc">
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">Pasaporte</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label req">Número documento</label>
                <input type="text" class="form-control" id="cli-cedula" placeholder="Número">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Nombres</label>
                <input type="text" class="form-control" id="cli-nombres" placeholder="Nombres completos">
              </div>
              <div class="form-group">
                <label class="form-label req">Apellidos</label>
                <input type="text" class="form-control" id="cli-apellidos" placeholder="Apellidos completos">
              </div>
            </div>
            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label">Profesión</label>
                <input type="text" class="form-control" id="cli-profesion" placeholder="Profesión u oficio">
              </div>
              <div class="form-group">
                <label class="form-label">Empresa</label>
                <input type="text" class="form-control" id="cli-empresa" placeholder="Empresa donde trabaja">
              </div>
              <div class="form-group">
                <label class="form-label">Cargo</label>
                <input type="text" class="form-control" id="cli-cargo" placeholder="Cargo">
              </div>
            </div>
          </div>

          <!-- Tab contacto -->
          <div id="cli-tab-contacto" style="display:none">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Celular</label>
                <input type="text" class="form-control" id="cli-celular" placeholder="Celular principal">
              </div>
              <div class="form-group">
                <label class="form-label">WhatsApp</label>
                <input type="text" class="form-control" id="cli-whatsapp" placeholder="57300... (con código país)">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" id="cli-correo" placeholder="correo@ejemplo.com">
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono fijo</label>
                <input type="text" class="form-control" id="cli-telefono" placeholder="Teléfono fijo">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Ciudad de residencia</label>
                <input type="text" class="form-control" id="cli-ciudad" placeholder="Ciudad">
              </div>
              <div class="form-group">
                <label class="form-label">Dirección</label>
                <input type="text" class="form-control" id="cli-direccion" placeholder="Dirección completa">
              </div>
            </div>
          </div>

          <!-- Tab info negocio -->
          <div id="cli-tab-negocio" style="display:none">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Estado pipeline</label>
                <select class="form-control" id="cli-pipeline"></select>
              </div>
              <div class="form-group">
                <label class="form-label">Origen</label>
                <select class="form-control" id="cli-origen"></select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Ejecutivo asignado</label>
              <select class="form-control" id="cli-ejecutivo"></select>
            </div>
            <div class="form-group">
              <label class="form-label">Observaciones generales</label>
              <textarea class="form-control" id="cli-observaciones" placeholder="Notas sobre el cliente..."></textarea>
            </div>
          </div>

          <div id="cli-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="cli_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="cli-btn-guardar" onclick="cli_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal importar -->
    <div class="modal-backdrop" id="cli-import-modal">
      <div class="modal" style="max-width:560px">
        <div class="modal-header">
          <div class="modal-title">Importar clientes</div>
          <button class="modal-close" onclick="document.getElementById('cli-import-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="padding:12px 14px;background:var(--navy-light);border-radius:var(--r);margin-bottom:14px;font-size:var(--text-sm);color:var(--navy)">
            <strong>Formato CSV requerido:</strong><br>
            <code style="font-size:var(--text-xs);background:white;padding:2px 6px;border-radius:4px;margin-top:6px;display:inline-block">
              tipo_doc, cedula_nit, nombres, apellidos, celular, whatsapp, correo, ciudad_residencia, estado_pipeline, origen, ejecutivo_cedula
            </code>
            <div style="margin-top:8px;font-size:var(--text-xs)">
              Los clientes con cédula ya existente serán omitidos sin error.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Archivo CSV</label>
            <input type="file" class="form-control" id="cli-import-file" accept=".csv">
          </div>
          <div id="cli-import-resultado" style="display:none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('cli-import-modal').classList.remove('active')">Cancelar</button>
          <button class="btn btn-primary" id="cli-import-btn" onclick="cli_procesarImport()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar
          </button>
        </div>
      </div>
    </div>

    <!-- Panel detalle cliente -->
    <div class="modal-backdrop" id="cli-detalle-modal">
      <div class="modal" style="max-width:760px">
        <div class="modal-header">
          <div class="modal-title" id="cli-detalle-nombre">Detalle del cliente</div>
          <button class="modal-close" onclick="document.getElementById('cli-detalle-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" id="cli-detalle-cuerpo" style="padding:20px"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('cli-detalle-modal').classList.remove('active')">Cerrar</button>
          <button class="btn btn-primary" id="cli-detalle-editar">Editar</button>
        </div>
      </div>
    </div>`;

  cli_cargarSelectores();
  await cli_cargarLista();
};

// ── Estado ───────────────────────────────────────
let CLI_DATA     = [];
let FUNC_LIST    = [];
let CLI_TAB_ACT  = 'datos';

function cli_cargarSelectores() {
  const cfg = APP.config || {};

  // Pipeline
  const selPip = document.getElementById('cli-filtro-pipeline');
  const mPip   = document.getElementById('cli-pipeline');
  const estados = cfg.estado_cliente || [];
  if (selPip) {
    selPip.innerHTML = '<option value="">Todos los estados</option>';
    estados.forEach(e => selPip.innerHTML += `<option value="${e.clave}">${e.clave}</option>`);
  }
  if (mPip) {
    mPip.innerHTML = '';
    estados.forEach(e => mPip.innerHTML += `<option value="${e.clave}">${e.clave}</option>`);
  }

  // Origen
  const selOri = document.getElementById('cli-filtro-origen');
  const mOri   = document.getElementById('cli-origen');
  const origenes = cfg.origen_cliente || [];
  if (selOri) {
    selOri.innerHTML = '<option value="">Todos los orígenes</option>';
    origenes.forEach(o => selOri.innerHTML += `<option value="${o.clave}">${o.clave}</option>`);
  }
  if (mOri) {
    mOri.innerHTML = '<option value="">Sin especificar</option>';
    origenes.forEach(o => mOri.innerHTML += `<option value="${o.clave}">${o.clave}</option>`);
  }
}

async function cli_cargarLista() {
  const pipeline = document.getElementById('cli-filtro-pipeline')?.value || '';
  const origen   = document.getElementById('cli-filtro-origen')?.value   || '';

  document.getElementById('cli-tabla-wrap').innerHTML = `
    <div style="padding:40px;text-align:center">
      <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
    </div>`;

  try {
    const [cliRes, funcRes] = await Promise.all([
      apiGetClientes({ estado_pipeline: pipeline || undefined }),
      apiGetFuncionarios()
    ]);

    if (cliRes.ok)  CLI_DATA  = cliRes.data  || [];
    if (funcRes.ok) FUNC_LIST = funcRes.data || [];

    // Cargar ejecutivos en modal
    const selEj = document.getElementById('cli-ejecutivo');
    if (selEj) {
      selEj.innerHTML = '<option value="">Sin asignar</option>';
      FUNC_LIST.filter(f => f.area === 'Comercial' || f.rol === 'Director')
        .forEach(f => selEj.innerHTML += `<option value="${f.FUNC_ID}">${f.nombre} ${f.apellido}</option>`);
    }

    let data = CLI_DATA;
    if (origen) data = data.filter(c => c.origen === origen);

    cli_renderPipelineBadges(CLI_DATA);
    cli_renderTabla(data);

    document.getElementById('cli-contador').textContent  = `${data.length} clientes`;
    document.getElementById('cli-subtitulo').textContent = pipeline ? `Filtro: ${pipeline}` : 'Todos los estados';

  } catch(e) {
    document.getElementById('cli-tabla-wrap').innerHTML = `<div class="empty-state"><div class="empty-title" style="color:var(--peligro)">Error cargando clientes</div></div>`;
  }
}

function cli_renderPipelineBadges(data) {
  const cont = document.getElementById('cli-pipeline-badges');
  if (!cont) return;
  const conteo = {};
  data.forEach(c => { conteo[c.estado_pipeline] = (conteo[c.estado_pipeline] || 0) + 1; });
  const colores = {
    'Prospecto':'badge-azul','Separado':'badge-alerta','En contrato':'badge-morado',
    'Al dia':'badge-exito','En mora':'badge-peligro','Cancelado':'badge-verde',
    'Desistido':'badge-gris','Cedente':'badge-gris'
  };
  cont.innerHTML = Object.entries(conteo).map(([estado, n]) =>
    `<span class="badge ${colores[estado]||'badge-gris'}" style="cursor:pointer;padding:5px 12px"
           onclick="document.getElementById('cli-filtro-pipeline').value='${estado}';cli_cargarLista()">
      ${estado} <strong>${n}</strong>
    </span>`
  ).join('');
}

function cli_buscar() {
  const q = (document.getElementById('cli-buscar')?.value || '').toLowerCase();
  if (!q) { cli_renderTabla(CLI_DATA); return; }
  const filtrado = CLI_DATA.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(q) ||
    String(c.cedula_nit).includes(q) ||
    String(c.celular).includes(q)
  );
  cli_renderTabla(filtrado);
  document.getElementById('cli-contador').textContent = `${filtrado.length} clientes`;
}

function cli_renderTabla(data) {
  const wrap = document.getElementById('cli-tabla-wrap');
  if (!wrap) return;

  if (!data.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <div class="empty-title">Sin clientes</div>
        <div class="empty-sub">No hay clientes con los filtros seleccionados</div>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Documento</th>
          <th>Celular</th>
          <th>Pipeline</th>
          <th>Origen</th>
          <th>Ejecutivo</th>
          <th style="text-align:right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(c => {
          const ej = FUNC_LIST.find(f => f.FUNC_ID === c.ejecutivo_asignado);
          return `
            <tr style="cursor:pointer" onclick="cli_verDetalle('${c.CLI_ID}')">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar sm">${getInitials(c.nombres + ' ' + c.apellidos)}</div>
                  <div>
                    <div style="font-weight:500;font-size:var(--text-sm)">${c.nombres} ${c.apellidos}</div>
                    <div style="font-size:var(--text-xs);color:var(--gris-mid)">${c.correo || '—'}</div>
                  </div>
                </div>
              </td>
              <td style="font-size:var(--text-sm)">${c.tipo_doc || 'CC'} ${c.cedula_nit}</td>
              <td style="font-size:var(--text-sm)">${c.celular || '—'}</td>
              <td>${pipelineBadge(c.estado_pipeline)}</td>
              <td style="font-size:var(--text-sm)">${c.origen || '—'}</td>
              <td style="font-size:var(--text-sm)">${ej ? ej.nombre + ' ' + ej.apellido : '—'}</td>
              <td onclick="event.stopPropagation()">
                <div class="table-actions">
                  <button class="btn btn-ghost btn-sm btn-icon" onclick="cli_abrirModal('${c.CLI_ID}')" title="Editar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── DETALLE CLIENTE ───────────────────────────────
async function cli_verDetalle(CLI_ID) {
  document.getElementById('cli-detalle-modal').classList.add('active');
  document.getElementById('cli-detalle-cuerpo').innerHTML = `
    <div style="text-align:center;padding:40px">
      <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
    </div>`;

  try {
    const res = await apiGetCliente(CLI_ID);
    if (!res.ok) { document.getElementById('cli-detalle-cuerpo').innerHTML = `<p style="color:var(--peligro)">${res.error}</p>`; return; }

    const { cliente, negocios, eventos, gestiones, tareas } = res.data;
    const ej = FUNC_LIST.find(f => f.FUNC_ID === cliente.ejecutivo_asignado);

    document.getElementById('cli-detalle-nombre').textContent = cliente.nombres + ' ' + cliente.apellidos;
    document.getElementById('cli-detalle-editar').onclick = () => {
      document.getElementById('cli-detalle-modal').classList.remove('active');
      cli_abrirModal(CLI_ID);
    };

    document.getElementById('cli-detalle-cuerpo').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Información personal</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Documento</span>
              <span>${cliente.tipo_doc} ${cliente.cedula_nit}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Celular</span>
              <span>${cliente.celular || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">WhatsApp</span>
              <span>${cliente.whatsapp || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Correo</span>
              <span>${cliente.correo || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Ciudad</span>
              <span>${cliente.ciudad_residencia || '—'}</span>
            </div>
          </div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Estado del negocio</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);align-items:center">
              <span style="color:var(--gris-mid)">Pipeline</span>
              ${pipelineBadge(cliente.estado_pipeline)}
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Origen</span>
              <span>${cliente.origen || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Ejecutivo</span>
              <span>${ej ? ej.nombre + ' ' + ej.apellido : '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
              <span style="color:var(--gris-mid)">Registro</span>
              <span>${formatFecha(cliente.fecha_creacion)}</span>
            </div>
          </div>
        </div>
      </div>

      ${cliente.observaciones ? `
        <div style="padding:10px 12px;background:var(--gris-bg);border-radius:var(--r);margin-bottom:16px;font-size:var(--text-sm);color:var(--gris-dark)">
          ${cliente.observaciones}
        </div>` : ''}

      <!-- Resumen historia -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div class="card" style="padding:12px;text-align:center">
          <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--navy)">${negocios.length}</div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">Negocios</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--azul)">${gestiones.length}</div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">Gestiones</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--alerta)">${tareas.length}</div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">Tareas</div>
        </div>
      </div>

      ${eventos.length ? `
        <div style="margin-top:16px">
          <div style="font-size:var(--text-xs);color:var(--gris-mid);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Historial de eventos</div>
          ${eventos.map(e => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gris-borde);font-size:var(--text-sm)">
              <span class="badge badge-navy">${e.tipo_evento}</span>
              <span style="color:var(--gris-mid)">${formatFecha(e.fecha_evento)}</span>
              <span>${e.motivo || '—'}</span>
            </div>`).join('')}
        </div>` : ''}`;

  } catch(e) {
    document.getElementById('cli-detalle-cuerpo').innerHTML = `<p style="color:var(--peligro)">Error cargando detalle</p>`;
  }
}

// ── MODAL CREAR/EDITAR ────────────────────────────
function cli_tab(tab) {
  ['datos','contacto','negocio'].forEach(t => {
    document.getElementById('cli-tab-' + t).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#cli-modal .tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ['datos','contacto','negocio'][i] === tab);
  });
  CLI_TAB_ACT = tab;
}

function cli_abrirModal(CLI_ID = null) {
  ['cli-id','cli-cedula','cli-nombres','cli-apellidos','cli-profesion','cli-empresa','cli-cargo',
   'cli-celular','cli-whatsapp','cli-correo','cli-telefono','cli-ciudad','cli-direccion','cli-observaciones']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('cli-error').style.display = 'none';
  document.getElementById('cli-modal-title').textContent = CLI_ID ? 'Editar cliente' : 'Nuevo cliente';
  document.getElementById('cli-cedula').disabled = !!CLI_ID;
  cli_tab('datos');

  if (CLI_ID) {
    const c = CLI_DATA.find(x => x.CLI_ID === CLI_ID);
    if (c) {
      document.getElementById('cli-id').value           = c.CLI_ID;
      document.getElementById('cli-tipo-doc').value     = c.tipo_doc || 'CC';
      document.getElementById('cli-cedula').value       = c.cedula_nit;
      document.getElementById('cli-nombres').value      = c.nombres || '';
      document.getElementById('cli-apellidos').value    = c.apellidos || '';
      document.getElementById('cli-profesion').value    = c.profesion || '';
      document.getElementById('cli-empresa').value      = c.empresa || '';
      document.getElementById('cli-cargo').value        = c.cargo || '';
      document.getElementById('cli-celular').value      = c.celular || '';
      document.getElementById('cli-whatsapp').value     = c.whatsapp || '';
      document.getElementById('cli-correo').value       = c.correo || '';
      document.getElementById('cli-telefono').value     = c.telefono_fijo || '';
      document.getElementById('cli-ciudad').value       = c.ciudad_residencia || '';
      document.getElementById('cli-direccion').value    = c.direccion || '';
      document.getElementById('cli-pipeline').value     = c.estado_pipeline || 'Prospecto';
      document.getElementById('cli-origen').value       = c.origen || '';
      document.getElementById('cli-ejecutivo').value    = c.ejecutivo_asignado || '';
      document.getElementById('cli-observaciones').value = c.observaciones || '';
    }
  }

  document.getElementById('cli-modal').classList.add('active');
}

function cli_cerrarModal() {
  document.getElementById('cli-modal').classList.remove('active');
}

async function cli_guardar() {
  const errEl = document.getElementById('cli-error');
  errEl.style.display = 'none';

  const data = {
    CLI_ID:             document.getElementById('cli-id').value || undefined,
    tipo_doc:           document.getElementById('cli-tipo-doc').value,
    cedula_nit:         document.getElementById('cli-cedula').value.trim(),
    nombres:            document.getElementById('cli-nombres').value.trim(),
    apellidos:          document.getElementById('cli-apellidos').value.trim(),
    profesion:          document.getElementById('cli-profesion').value.trim(),
    empresa:            document.getElementById('cli-empresa').value.trim(),
    cargo:              document.getElementById('cli-cargo').value.trim(),
    celular:            document.getElementById('cli-celular').value.trim(),
    whatsapp:           document.getElementById('cli-whatsapp').value.trim(),
    correo:             document.getElementById('cli-correo').value.trim(),
    telefono_fijo:      document.getElementById('cli-telefono').value.trim(),
    ciudad_residencia:  document.getElementById('cli-ciudad').value.trim(),
    direccion:          document.getElementById('cli-direccion').value.trim(),
    estado_pipeline:    document.getElementById('cli-pipeline').value,
    origen:             document.getElementById('cli-origen').value,
    ejecutivo_asignado: document.getElementById('cli-ejecutivo').value,
    observaciones:      document.getElementById('cli-observaciones').value.trim()
  };

  if (!data.cedula_nit || !data.nombres || !data.apellidos) {
    errEl.textContent  = 'Documento, nombres y apellidos son obligatorios.';
    errEl.style.display = 'block';
    cli_tab('datos');
    return;
  }
  if (!data.celular) {
    errEl.textContent  = 'El celular es obligatorio.';
    errEl.style.display = 'block';
    cli_tab('contacto');
    return;
  }

  const btn = document.getElementById('cli-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await apiSaveCliente(data);
    if (res.ok) {
      toast(data.CLI_ID ? 'Cliente actualizado' : 'Cliente creado', 'ok');
      cli_cerrarModal();
      await cli_cargarLista();
    } else {
      errEl.textContent  = res.error || 'Error al guardar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent  = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar';
}

// ── IMPORTAR ──────────────────────────────────────
function cli_abrirImportar() {
  document.getElementById('cli-import-modal').classList.add('active');
  document.getElementById('cli-import-file').value = '';
  document.getElementById('cli-import-resultado').style.display = 'none';
}

async function cli_procesarImport() {
  const file = document.getElementById('cli-import-file').files[0];
  if (!file) { toast('Selecciona un archivo CSV', 'warning'); return; }

  const texto  = await file.text();
  const lineas = texto.trim().split('\n');
  if (lineas.length < 2) { toast('El archivo está vacío', 'error'); return; }

  const clientes = [];
  for (let i = 1; i < lineas.length; i++) {
    const cols = lineas[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (!cols[1]) continue;
    clientes.push({
      tipo_doc:          cols[0] || 'CC',
      cedula_nit:        cols[1] || '',
      nombres:           cols[2] || '',
      apellidos:         cols[3] || '',
      celular:           cols[4] || '',
      whatsapp:          cols[5] || '',
      correo:            cols[6] || '',
      ciudad_residencia: cols[7] || '',
      estado_pipeline:   cols[8] || 'Prospecto',
      origen:            cols[9] || '',
      ejecutivo_cedula:  cols[10] || ''
    });
  }

  const btn = document.getElementById('cli-import-btn');
  btn.disabled = true; btn.textContent = 'Importando...';

  try {
    const res = await apiImportarClientes(clientes);
    const resDiv = document.getElementById('cli-import-resultado');
    resDiv.style.display = 'block';
    resDiv.innerHTML = `
      <div style="padding:12px 14px;background:var(--exito-light);border:1px solid var(--exito-borde);border-radius:var(--r);margin-top:12px">
        <div style="font-weight:500;color:var(--exito);margin-bottom:6px">Importación completada</div>
        <div style="font-size:var(--text-sm)">
          ✅ Creados: <strong>${res.creados}</strong><br>
          ⏭️ Omitidos (ya existían): <strong>${res.omitidos}</strong><br>
          ${res.errores?.length ? `❌ Errores: <strong>${res.errores.length}</strong>` : ''}
        </div>
      </div>`;
    if (res.creados > 0) {
      await cli_cargarLista();
      toast(`${res.creados} clientes importados`, 'ok');
    }
  } catch(e) {
    toast('Error al importar', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar';
}
