/**
 * ============================================================
 * ALIANZA CRM — gestiones.js
 * Módulo de registro de gestiones e interacciones
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_gestiones = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Gestiones</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Historial de interacciones con clientes</p>
      </div>
      <button class="btn btn-primary" onclick="gest_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Registrar gestión
      </button>
    </div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 160px 160px 160px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="gest-buscar"
                   placeholder="Buscar por cliente..." oninput="gest_filtrar()">
          </div>
          <select class="form-control" id="gest-filtro-canal" onchange="gest_filtrar()">
            <option value="">Todos los canales</option>
          </select>
          <select class="form-control" id="gest-filtro-resultado" onchange="gest_filtrar()">
            <option value="">Todos los resultados</option>
          </select>
          <input type="date" class="form-control" id="gest-filtro-fecha"
                 onchange="gest_filtrar()" title="Filtrar por fecha">
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div id="gest-lista" class="anim-3">
      <div style="padding:40px;text-align:center">
        <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
      </div>
    </div>

    <!-- Modal gestión -->
    <div class="modal-backdrop" id="gest-modal">
      <div class="modal" style="max-width:620px">
        <div class="modal-header">
          <div class="modal-title">Registrar gestión</div>
          <button class="modal-close" onclick="gest_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">

          <div class="form-group">
            <label class="form-label req">Cliente</label>
            <select class="form-control" id="gest-cliente">
              <option value="">Selecciona cliente</option>
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Canal</label>
              <select class="form-control" id="gest-canal">
                <option value="">Selecciona canal</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label req">Tipo de gestión</label>
              <select class="form-control" id="gest-tipo">
                <option value="">Selecciona tipo</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Fecha y hora</label>
              <input type="datetime-local" class="form-control" id="gest-fecha-hora">
            </div>
            <div class="form-group">
              <label class="form-label req">Resultado</label>
              <select class="form-control" id="gest-resultado">
                <option value="">Selecciona resultado</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label req">Descripción / Resumen</label>
            <textarea class="form-control" id="gest-descripcion" rows="3"
                      placeholder="Describe lo que se habló, acordó o informó..."></textarea>
          </div>

          <!-- Compromiso -->
          <div style="padding:12px 14px;background:var(--gris-bg);border-radius:var(--r);
                      border:1px solid var(--gris-borde);margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <input type="checkbox" id="gest-tiene-compromiso"
                     onchange="gest_toggleCompromiso()" style="width:16px;height:16px;cursor:pointer">
              <label for="gest-tiene-compromiso"
                     style="font-size:var(--text-sm);font-weight:600;color:var(--oscuro);cursor:pointer">
                Generar compromiso de seguimiento
              </label>
            </div>
            <div id="gest-compromiso-section" style="display:none">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Fecha y hora del compromiso</label>
                <input type="datetime-local" class="form-control" id="gest-fecha-compromiso">
                <div class="form-hint">El sistema te recordará este compromiso</div>
              </div>
            </div>
          </div>

          <div id="gest-error" style="display:none;padding:10px 12px;background:var(--peligro-light);
               border:1px solid var(--peligro-borde);border-radius:var(--r);
               color:var(--peligro);font-size:var(--text-sm)"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="gest_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="gest-btn-guardar" onclick="gest_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar gestión
          </button>
        </div>
      </div>
    </div>`;

  await gest_cargarDatos();
};

// ── Estado ───────────────────────────────────────
let GEST_DATA = [];
let GEST_CLI  = [];

async function gest_cargarDatos() {
  try {
    const [cliRes] = await Promise.all([apiGetClientes()]);
    if (cliRes.ok) GEST_CLI = cliRes.data || [];
    gest_cargarSelectores();
    await gest_cargarGestiones();
  } catch(e) {
    console.error('Error:', e);
  }
}

async function gest_cargarGestiones() {
  const res = await api('getGestiones', {});
  GEST_DATA = res.ok ? (res.data || []) : [];
  gest_filtrar();
}

function gest_cargarSelectores() {
  const cfg = APP.config || {};

  // Canal
  const selCanal = document.getElementById('gest-filtro-canal');
  const mCanal   = document.getElementById('gest-canal');
  const canales  = cfg.tipo_gestion || [];
  if (selCanal) { selCanal.innerHTML = '<option value="">Todos los canales</option>'; canales.forEach(c => selCanal.innerHTML += `<option value="${c.clave}">${c.clave}</option>`); }
  if (mCanal)   { mCanal.innerHTML   = '<option value="">Selecciona canal</option>';  canales.forEach(c => mCanal.innerHTML   += `<option value="${c.clave}">${c.clave}</option>`); }

  // Tipo gestión
  const mTipo = document.getElementById('gest-tipo');
  if (mTipo) {
    mTipo.innerHTML = '<option value="">Selecciona tipo</option>';
    canales.forEach(c => mTipo.innerHTML += `<option value="${c.clave}">${c.clave}</option>`);
  }

  // Resultado
  const selRes = document.getElementById('gest-filtro-resultado');
  const mRes   = document.getElementById('gest-resultado');
  const resultados = cfg.resultado_gestion || [];
  if (selRes) { selRes.innerHTML = '<option value="">Todos los resultados</option>'; resultados.forEach(r => selRes.innerHTML += `<option value="${r.clave}">${r.clave}</option>`); }
  if (mRes)   { mRes.innerHTML   = '<option value="">Selecciona resultado</option>';  resultados.forEach(r => mRes.innerHTML   += `<option value="${r.clave}">${r.clave}</option>`); }

  // Clientes en modal
  const mCli = document.getElementById('gest-cliente');
  if (mCli) {
    mCli.innerHTML = '<option value="">Selecciona cliente</option>';
    GEST_CLI.forEach(c => mCli.innerHTML += `<option value="${c.CLI_ID}">${c.nombres} ${c.apellidos} — ${c.cedula_nit}</option>`);
  }

  // Fecha por defecto ahora
  const dtLocal = document.getElementById('gest-fecha-hora');
  if (dtLocal) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dtLocal.value = now.toISOString().slice(0, 16);
  }
}

function gest_filtrar() {
  const q       = (document.getElementById('gest-buscar')?.value || '').toLowerCase();
  const canal   = document.getElementById('gest-filtro-canal')?.value || '';
  const result  = document.getElementById('gest-filtro-resultado')?.value || '';
  const fecha   = document.getElementById('gest-filtro-fecha')?.value || '';

  let data = GEST_DATA.filter(g => {
    const cli    = GEST_CLI.find(c => c.CLI_ID === g.CLI_ID);
    const nombre = cli ? (cli.nombres + ' ' + cli.apellidos).toLowerCase() : '';
    const mQ     = !q      || nombre.includes(q);
    const mC     = !canal  || g.canal === canal;
    const mR     = !result || g.resultado === result;
    const mF     = !fecha  || String(g.fecha_hora_gestion).startsWith(fecha);
    return mQ && mC && mR && mF;
  });

  gest_renderLista(data);
}

const CANAL_ICONS = {
  'Llamada':    `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 15.46 19.79 19.79 0 0 1 1.72 6.9 2 2 0 0 1 3.7 4.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 12.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 19.1z"/>`,
  'WhatsApp':   `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  'Correo':     `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
  'Visita':     `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  'Reunion':    `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'Documento':  `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
  'Sistema':    `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`
};

const RESULTADO_COLOR = {
  'Exitosa':       'badge-exito',
  'Sin respuesta': 'badge-gris',
  'Reagendada':    'badge-alerta',
  'Escalada':      'badge-morado',
  'Pendiente':     'badge-azul'
};

function gest_renderLista(data) {
  const cont = document.getElementById('gest-lista');
  if (!cont) return;

  if (!data.length) {
    cont.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="empty-title">Sin gestiones</div>
          <div class="empty-sub">Registra la primera gestión con el botón "Registrar gestión"</div>
        </div>
      </div>`;
    return;
  }

  // Agrupar por fecha
  const agrupado = {};
  data.forEach(g => {
    const fecha = String(g.fecha_hora_gestion).split('T')[0] || 'Sin fecha';
    if (!agrupado[fecha]) agrupado[fecha] = [];
    agrupado[fecha].push(g);
  });

  cont.innerHTML = Object.entries(agrupado)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, items]) => `
      <div style="margin-bottom:20px">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--navy);
                    text-transform:uppercase;letter-spacing:.07em;
                    margin-bottom:10px;padding-left:4px">
          ${fecha === new Date().toISOString().split('T')[0] ? '📅 Hoy' : formatFecha(fecha)}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${items.map(g => {
            const cli  = GEST_CLI.find(c => c.CLI_ID === g.CLI_ID);
            const hora = String(g.fecha_hora_gestion).split('T')[1]?.substring(0,5) || '';
            const icon = CANAL_ICONS[g.canal] || CANAL_ICONS['Sistema'];
            const tieneCompromiso = g.fecha_hora_compromiso;
            return `
              <div class="card" style="transition:all var(--tr)"
                   onmouseover="this.style.boxShadow='var(--sh-md)'"
                   onmouseout="this.style.boxShadow=''">
                <div class="card-body" style="padding:14px 16px">
                  <div style="display:flex;align-items:flex-start;gap:14px">
                    <!-- Ícono canal -->
                    <div style="width:38px;height:38px;border-radius:var(--r);
                                background:var(--navy-light);flex-shrink:0;
                                display:flex;align-items:center;justify-content:center">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                           stroke="var(--navy)" stroke-width="1.8"
                           stroke-linecap="round" stroke-linejoin="round">
                        ${icon}
                      </svg>
                    </div>
                    <!-- Contenido -->
                    <div style="flex:1;min-width:0">
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                        <span style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro)">
                          ${cli ? cli.nombres + ' ' + cli.apellidos : '—'}
                        </span>
                        <span class="badge badge-navy" style="font-size:.65rem">${g.canal}</span>
                        <span class="badge ${RESULTADO_COLOR[g.resultado] || 'badge-gris'}" style="font-size:.65rem">
                          ${g.resultado || '—'}
                        </span>
                        <span style="font-size:var(--text-xs);color:var(--gris-mid);margin-left:auto">${hora}</span>
                      </div>
                      <div style="font-size:var(--text-sm);color:var(--gris-dark);line-height:1.5">
                        ${g.descripcion || g.resumen || '—'}
                      </div>
                      ${tieneCompromiso ? `
                        <div style="margin-top:8px;display:inline-flex;align-items:center;gap:5px;
                                    padding:4px 10px;background:var(--azul-light);
                                    border-radius:var(--r-full);font-size:var(--text-xs);color:var(--azul)">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          Compromiso: ${formatFechaHora(g.fecha_hora_compromiso)}
                        </div>` : ''}
                    </div>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`).join('');
}

function gest_toggleCompromiso() {
  const checked = document.getElementById('gest-tiene-compromiso')?.checked;
  const sec     = document.getElementById('gest-compromiso-section');
  if (sec) sec.style.display = checked ? '' : 'none';
}

function gest_abrirModal(CLI_ID = null) {
  document.getElementById('gest-error').style.display  = 'none';
  document.getElementById('gest-tiene-compromiso').checked = false;
  document.getElementById('gest-compromiso-section').style.display = 'none';
  document.getElementById('gest-fecha-compromiso').value = '';
  document.getElementById('gest-descripcion').value     = '';
  document.getElementById('gest-canal').value           = '';
  document.getElementById('gest-tipo').value            = '';
  document.getElementById('gest-resultado').value       = '';

  if (CLI_ID) document.getElementById('gest-cliente').value = CLI_ID;

  const dtLocal = document.getElementById('gest-fecha-hora');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  dtLocal.value = now.toISOString().slice(0, 16);

  document.getElementById('gest-modal').classList.add('active');
}

function gest_cerrarModal() {
  document.getElementById('gest-modal').classList.remove('active');
}

async function gest_guardar() {
  const errEl = document.getElementById('gest-error');
  errEl.style.display = 'none';

  const CLI_ID      = document.getElementById('gest-cliente')?.value;
  const canal       = document.getElementById('gest-canal')?.value;
  const tipo        = document.getElementById('gest-tipo')?.value;
  const resultado   = document.getElementById('gest-resultado')?.value;
  const fechaHora   = document.getElementById('gest-fecha-hora')?.value;
  const descripcion = document.getElementById('gest-descripcion')?.value.trim();
  const tieneComp   = document.getElementById('gest-tiene-compromiso')?.checked;
  const fechaComp   = document.getElementById('gest-fecha-compromiso')?.value;

  if (!CLI_ID)      { errEl.textContent = 'Selecciona un cliente.';           errEl.style.display = 'block'; return; }
  if (!canal)       { errEl.textContent = 'Selecciona el canal.';             errEl.style.display = 'block'; return; }
  if (!resultado)   { errEl.textContent = 'Selecciona el resultado.';         errEl.style.display = 'block'; return; }
  if (!fechaHora)   { errEl.textContent = 'Ingresa la fecha y hora.';         errEl.style.display = 'block'; return; }
  if (!descripcion) { errEl.textContent = 'Escribe una descripción/resumen.'; errEl.style.display = 'block'; return; }
  if (tieneComp && !fechaComp) { errEl.textContent = 'Ingresa la fecha del compromiso.'; errEl.style.display = 'block'; return; }

  const data = {
    CLI_ID,
    FUNC_ID:               APP.user?.id || '',
    canal,
    tipo_gestion:          tipo || canal,
    resultado,
    fecha_hora_gestion:    fechaHora,
    fecha_hora_compromiso: tieneComp ? fechaComp : '',
    descripcion,
    resumen:               descripcion.substring(0, 100),
    generar_recordatorio:  tieneComp ? 'true' : 'false'
  };

  const btn = document.getElementById('gest-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await api('saveGestion', data);
    if (res.ok) {
      toast('Gestión registrada correctamente', 'ok');
      gest_cerrarModal();
      await gest_cargarGestiones();
    } else {
      errEl.textContent = res.error || 'Error al guardar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar gestión';
}
