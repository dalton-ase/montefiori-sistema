/**
 * ============================================================
 * ALIANZA CRM — eventos.js
 * Módulo de eventos especiales
 * Desistimientos, cesiones de derechos, traslados de saldo
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_eventos = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Eventos especiales</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Desistimientos · Cesiones de derechos · Traslados de saldo</p>
      </div>
      <button class="btn btn-primary" onclick="evt_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Registrar evento
      </button>
    </div>

    <!-- Info cards -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px" class="anim-2">
      ${[
        { tipo:'Desistimiento', color:'c-peligro', desc:'Cliente renuncia al lote. El lote queda disponible.', icon:`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>` },
        { tipo:'Cesión',        color:'c-morado',  desc:'Cliente transfiere su posición a otra persona.', icon:`<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>` },
        { tipo:'Traslado',      color:'c-azul',    desc:'Cliente migra su saldo a un lote diferente.', icon:`<polyline points="16 3 21 8 16 13"/><line x1="21" y1="8" x2="9" y2="8"/><polyline points="8 21 3 16 8 11"/><line x1="3" y1="16" x2="15" y2="16"/>` }
      ].map(e => `
        <div class="card">
          <div class="card-body" style="padding:16px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <div class="counter-icon ${e.color}" style="margin-bottom:0;width:32px;height:32px">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${e.icon}</svg>
              </div>
              <span style="font-family:'Montserrat',sans-serif;font-size:var(--text-sm);font-weight:700;color:var(--oscuro)">${e.tipo}</span>
            </div>
            <p style="font-size:var(--text-xs);color:var(--gris-mid);line-height:1.5">${e.desc}</p>
          </div>
        </div>`).join('')}
    </div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 180px 180px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="evt-buscar" placeholder="Buscar por cliente..." oninput="evt_filtrar()">
          </div>
          <select class="form-control" id="evt-filtro-tipo" onchange="evt_filtrar()">
            <option value="">Todos los tipos</option>
            <option value="Desistimiento">Desistimiento</option>
            <option value="Cesion_derechos">Cesión de derechos</option>
            <option value="Traslado_saldo">Traslado de saldo</option>
          </select>
          <input type="date" class="form-control" id="evt-filtro-fecha" onchange="evt_filtrar()" title="Filtrar por fecha">
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div id="evt-lista" class="anim-3">
      <div style="padding:40px;text-align:center">
        <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
      </div>
    </div>

    <!-- Modal evento -->
    <div class="modal-backdrop" id="evt-modal">
      <div class="modal" style="max-width:660px">
        <div class="modal-header">
          <div class="modal-title" id="evt-modal-title">Registrar evento especial</div>
          <button class="modal-close" onclick="evt_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">

          <!-- Tipo de evento -->
          <div class="form-group">
            <label class="form-label req">Tipo de evento</label>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
              ${[
                { val:'Desistimiento',   label:'Desistimiento',    color:'var(--peligro)' },
                { val:'Cesion_derechos', label:'Cesión derechos',  color:'var(--morado)'  },
                { val:'Traslado_saldo',  label:'Traslado saldo',   color:'var(--azul)'    }
              ].map(t => `
                <label style="display:flex;align-items:center;gap:8px;padding:10px 12px;
                              border:2px solid var(--gris-borde);border-radius:var(--r);
                              cursor:pointer;transition:all var(--tr);font-size:var(--text-sm);font-weight:500"
                       id="evt-tipo-label-${t.val}"
                       onclick="evt_seleccionarTipo('${t.val}')">
                  <input type="radio" name="evt-tipo-radio" value="${t.val}"
                         style="accent-color:${t.color}">
                  ${t.label}
                </label>`).join('')}
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Negocio / Cliente afectado</label>
              <select class="form-control" id="evt-cliente" onchange="evt_cargarInfoCliente()">
                <option value="">Selecciona cliente</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha del evento</label>
              <input type="date" class="form-control" id="evt-fecha">
            </div>
          </div>

          <!-- Info del cliente seleccionado -->
          <div id="evt-info-cliente" style="display:none;padding:12px 14px;background:var(--navy-light);
               border-radius:var(--r);margin-bottom:14px;font-size:var(--text-sm)"></div>

          <!-- Sección Desistimiento -->
          <div id="evt-sec-desistimiento" style="display:none">
            <div style="padding:10px 14px;background:var(--peligro-light);border:1px solid var(--peligro-borde);
                        border-radius:var(--r);margin-bottom:14px;font-size:var(--text-sm)">
              <strong style="color:var(--peligro)">⚠️ Desistimiento</strong>
              <span style="color:var(--gris-dark)"> — El lote quedará disponible para nuevas ventas.</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Valor pagado hasta hoy ($)</label>
                <input type="number" class="form-control" id="evt-valor-pagado" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Valor a devolver ($)</label>
                <input type="number" class="form-control" id="evt-valor-devolver" placeholder="0">
              </div>
            </div>
            <div style="padding:10px 14px;background:var(--alerta-light);border-radius:var(--r);
                        margin-bottom:14px;font-size:var(--text-sm)">
              <strong style="color:var(--alerta)">Saldo congelado</strong>
              <span style="color:var(--gris-dark)"> — ¿El cliente desea congelar sus arras para una futura compra?</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);cursor:pointer">
                  <input type="checkbox" id="evt-congelar-saldo" onchange="evt_toggleCongelar()" style="width:16px;height:16px">
                  Congelar saldo (hasta 6 meses)
                </label>
              </div>
              <div class="form-group" id="evt-monto-congelar-wrap" style="display:none">
                <label class="form-label">Monto a congelar ($)</label>
                <input type="number" class="form-control" id="evt-monto-congelar" placeholder="0">
              </div>
            </div>
          </div>

          <!-- Sección Cesión -->
          <div id="evt-sec-cesion" style="display:none">
            <div style="padding:10px 14px;background:var(--morado-light);border:1px solid var(--morado-borde);
                        border-radius:var(--r);margin-bottom:14px;font-size:var(--text-sm)">
              <strong style="color:var(--morado)">Cesión de derechos</strong>
              <span style="color:var(--gris-dark)"> — El lote no se libera, cambia de titular. Requiere otrosí jurídico.</span>
            </div>
            <div class="form-group">
              <label class="form-label req">Cliente cesionario (nuevo titular)</label>
              <select class="form-control" id="evt-cesionario">
                <option value="">Selecciona cliente cesionario</option>
              </select>
              <div class="form-hint">Si el cesionario no está en el sistema, créalo primero en Clientes.</div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Saldo heredado por el cesionario ($)</label>
                <input type="number" class="form-control" id="evt-saldo-cedido" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Valor acordado entre partes ($)</label>
                <input type="number" class="form-control" id="evt-valor-cesion" placeholder="Informativo">
              </div>
            </div>
          </div>

          <!-- Sección Traslado -->
          <div id="evt-sec-traslado" style="display:none">
            <div style="padding:10px 14px;background:var(--azul-light);border:1px solid var(--info-border, #AED4F8);
                        border-radius:var(--r);margin-bottom:14px;font-size:var(--text-sm)">
              <strong style="color:var(--azul)">Traslado de saldo</strong>
              <span style="color:var(--gris-dark)"> — El lote actual queda disponible. El cliente se mueve a un lote disponible.</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Proyecto destino</label>
                <select class="form-control" id="evt-proy-destino" onchange="evt_cargarLotesDestino()">
                  <option value="">Selecciona proyecto</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label req">Lote destino (disponible)</label>
                <select class="form-control" id="evt-lote-destino">
                  <option value="">Selecciona proyecto primero</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Saldo a trasladar ($)</label>
                <input type="number" class="form-control" id="evt-saldo-traslado" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Diferencia de valor ($)</label>
                <input type="number" class="form-control" id="evt-diferencia-traslado"
                       placeholder="+ si el nuevo es más caro">
              </div>
            </div>
          </div>

          <!-- Campos comunes -->
          <div class="form-group">
            <label class="form-label req">Motivo / Observaciones</label>
            <textarea class="form-control" id="evt-motivo" rows="3"
                      placeholder="Describe el motivo del evento..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Aprobado por</label>
            <select class="form-control" id="evt-aprobado-por">
              <option value="">Selecciona funcionario</option>
            </select>
          </div>

          <div id="evt-error" style="display:none;padding:10px 12px;background:var(--peligro-light);
               border:1px solid var(--peligro-borde);border-radius:var(--r);
               color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="evt_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="evt-btn-guardar" onclick="evt_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Registrar evento
          </button>
        </div>
      </div>
    </div>`;

  await evt_cargarDatos();
};

// ── Estado ───────────────────────────────────────
let EVT_DATA  = [];
let EVT_CLI   = [];
let EVT_PROY  = [];
let EVT_LOTES = [];
let EVT_FUNC  = [];
let EVT_TIPO_SEL = '';

async function evt_cargarDatos() {
  try {
    const [cliRes, proyRes, lotesRes, funcRes] = await Promise.all([
      apiGetClientes(), apiGetProyectos(), apiGetLotes(), apiGetFuncionarios()
    ]);
    if (cliRes.ok)   EVT_CLI   = cliRes.data   || [];
    if (proyRes.ok)  EVT_PROY  = proyRes.data  || [];
    if (lotesRes.ok) EVT_LOTES = lotesRes.data || [];
    if (funcRes.ok)  EVT_FUNC  = funcRes.data  || [];

    evt_cargarSelectores();
    await evt_cargarEventos();
  } catch(e) { console.error(e); }
}

async function evt_cargarEventos() {
  const res = await api('getEventos', {});
  EVT_DATA = res.ok ? (res.data || []) : [];
  evt_filtrar();
}

function evt_cargarSelectores() {
  // Clientes
  const mCli = document.getElementById('evt-cliente');
  const mCes = document.getElementById('evt-cesionario');
  if (mCli) {
    mCli.innerHTML = '<option value="">Selecciona cliente</option>';
    EVT_CLI.forEach(c => mCli.innerHTML += `<option value="${c.CLI_ID}">${c.nombres} ${c.apellidos} — ${c.cedula_nit}</option>`);
  }
  if (mCes) {
    mCes.innerHTML = '<option value="">Selecciona cesionario</option>';
    EVT_CLI.forEach(c => mCes.innerHTML += `<option value="${c.CLI_ID}">${c.nombres} ${c.apellidos} — ${c.cedula_nit}</option>`);
  }

  // Proyectos destino
  const mProy = document.getElementById('evt-proy-destino');
  if (mProy) {
    mProy.innerHTML = '<option value="">Selecciona proyecto</option>';
    EVT_PROY.forEach(p => mProy.innerHTML += `<option value="${p.PROY_ID}">${p.nombre}</option>`);
  }

  // Aprobado por
  const mAp = document.getElementById('evt-aprobado-por');
  if (mAp) {
    mAp.innerHTML = '<option value="">Selecciona funcionario</option>';
    EVT_FUNC.filter(f => ['Director','Coordinador'].includes(f.rol) || ['Juridica','Cartera'].includes(f.area))
      .forEach(f => mAp.innerHTML += `<option value="${f.FUNC_ID}">${f.nombre} ${f.apellido} — ${f.area}</option>`);
  }

  // Fecha por defecto hoy
  const dtFecha = document.getElementById('evt-fecha');
  if (dtFecha) dtFecha.value = new Date().toISOString().split('T')[0];
}

function evt_seleccionarTipo(tipo) {
  EVT_TIPO_SEL = tipo;
  // Estilos
  ['Desistimiento','Cesion_derechos','Traslado_saldo'].forEach(t => {
    const lbl = document.getElementById('evt-tipo-label-' + t);
    if (!lbl) return;
    lbl.style.borderColor  = t === tipo ? 'var(--azul)' : 'var(--gris-borde)';
    lbl.style.background   = t === tipo ? 'var(--azul-light)' : '';
    lbl.querySelector('input').checked = t === tipo;
  });

  // Mostrar sección correcta
  ['desistimiento','cesion','traslado'].forEach(s =>
    document.getElementById('evt-sec-' + s).style.display = 'none');

  if (tipo === 'Desistimiento')   document.getElementById('evt-sec-desistimiento').style.display = '';
  if (tipo === 'Cesion_derechos') document.getElementById('evt-sec-cesion').style.display = '';
  if (tipo === 'Traslado_saldo')  document.getElementById('evt-sec-traslado').style.display = '';
}

function evt_toggleCongelar() {
  const checked = document.getElementById('evt-congelar-saldo')?.checked;
  document.getElementById('evt-monto-congelar-wrap').style.display = checked ? '' : 'none';
}

function evt_cargarInfoCliente() {
  const CLI_ID = document.getElementById('evt-cliente')?.value;
  const infoEl = document.getElementById('evt-info-cliente');
  if (!CLI_ID || !infoEl) { infoEl.style.display = 'none'; return; }

  const cli = EVT_CLI.find(c => c.CLI_ID === CLI_ID);
  if (!cli) { infoEl.style.display = 'none'; return; }

  infoEl.style.display = '';
  infoEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <div class="avatar">${getInitials(cli.nombres + ' ' + cli.apellidos)}</div>
      <div>
        <div style="font-weight:600;color:var(--navy)">${cli.nombres} ${cli.apellidos}</div>
        <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">
          ${cli.tipo_doc || 'CC'} ${cli.cedula_nit} · Estado: ${cli.estado_pipeline || '—'}
        </div>
      </div>
    </div>`;
}

function evt_cargarLotesDestino() {
  const PROY_ID = document.getElementById('evt-proy-destino')?.value;
  const mLote   = document.getElementById('evt-lote-destino');
  if (!mLote) return;
  if (!PROY_ID) { mLote.innerHTML = '<option value="">Selecciona proyecto primero</option>'; return; }
  const disponibles = EVT_LOTES.filter(l => l.PROY_ID === PROY_ID && l.estado === 'Disponible');
  mLote.innerHTML = `<option value="">Selecciona lote (${disponibles.length} disponibles)</option>`;
  disponibles.forEach(l => mLote.innerHTML += `<option value="${l.LOTE_ID}">${l.codigo_lote} · ${l.area_m2 || ''}m² · ${formatCOP(l.precio_lista)}</option>`);
}

function evt_filtrar() {
  const q    = (document.getElementById('evt-buscar')?.value || '').toLowerCase();
  const tipo = document.getElementById('evt-filtro-tipo')?.value || '';
  const fecha = document.getElementById('evt-filtro-fecha')?.value || '';

  const data = EVT_DATA.filter(e => {
    const cli    = EVT_CLI.find(c => c.CLI_ID === e.CLI_ID);
    const nombre = cli ? (cli.nombres + ' ' + cli.apellidos).toLowerCase() : '';
    const mQ = !q    || nombre.includes(q);
    const mT = !tipo || e.tipo_evento === tipo;
    const mF = !fecha || String(e.fecha_evento).startsWith(fecha);
    return mQ && mT && mF;
  });

  evt_renderLista(data);
}

const EVT_CONFIG = {
  'Desistimiento':   { color: 'badge-peligro', label: 'Desistimiento',   bg: 'var(--peligro-light)' },
  'Cesion_derechos': { color: 'badge-morado',  label: 'Cesión derechos', bg: 'var(--morado-light)'  },
  'Traslado_saldo':  { color: 'badge-azul',    label: 'Traslado saldo',  bg: 'var(--azul-light)'    }
};

function evt_renderLista(data) {
  const cont = document.getElementById('evt-lista');
  if (!cont) return;

  if (!data.length) {
    cont.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="empty-title">Sin eventos registrados</div>
          <div class="empty-sub">Los desistimientos, cesiones y traslados aparecerán aquí</div>
        </div>
      </div>`;
    return;
  }

  cont.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${data.map(e => {
        const cli  = EVT_CLI.find(c => c.CLI_ID === e.CLI_ID);
        const cfg  = EVT_CONFIG[e.tipo_evento] || { color:'badge-gris', label: e.tipo_evento };
        const apro = EVT_FUNC.find(f => f.FUNC_ID === e.aprobado_por);
        const reg  = EVT_FUNC.find(f => f.FUNC_ID === e.registrado_por);
        return `
          <div class="card" style="border-left:3px solid var(--gris-borde)">
            <div class="card-body" style="padding:16px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px">
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    <span class="badge ${cfg.color}">${cfg.label}</span>
                    <span style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro)">
                      ${cli ? cli.nombres + ' ' + cli.apellidos : '—'}
                    </span>
                  </div>
                  <div style="font-size:var(--text-sm);color:var(--gris-dark);margin-bottom:8px;line-height:1.5">
                    ${e.motivo || '—'}
                  </div>
                  <div style="display:flex;gap:16px;flex-wrap:wrap">
                    ${e.valor_involucrado ? `<span style="font-size:var(--text-xs);color:var(--gris-mid)">💰 ${formatCOP(e.valor_involucrado)}</span>` : ''}
                    ${apro ? `<span style="font-size:var(--text-xs);color:var(--gris-mid)">✅ Aprobado: ${apro.nombre} ${apro.apellido}</span>` : ''}
                    ${reg  ? `<span style="font-size:var(--text-xs);color:var(--gris-mid)">👤 Registrado: ${reg.nombre} ${reg.apellido}</span>` : ''}
                  </div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:var(--text-xs);color:var(--gris-mid)">${formatFecha(e.fecha_evento)}</div>
                </div>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function evt_abrirModal() {
  EVT_TIPO_SEL = '';
  document.getElementById('evt-error').style.display = 'none';
  document.getElementById('evt-info-cliente').style.display = 'none';
  ['desistimiento','cesion','traslado'].forEach(s =>
    document.getElementById('evt-sec-' + s).style.display = 'none');
  ['Desistimiento','Cesion_derechos','Traslado_saldo'].forEach(t => {
    const lbl = document.getElementById('evt-tipo-label-' + t);
    if (lbl) { lbl.style.borderColor = 'var(--gris-borde)'; lbl.style.background = ''; }
  });
  ['evt-cliente','evt-cesionario','evt-proy-destino','evt-lote-destino','evt-aprobado-por']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['evt-motivo','evt-valor-pagado','evt-valor-devolver','evt-monto-congelar',
   'evt-saldo-cedido','evt-valor-cesion','evt-saldo-traslado','evt-diferencia-traslado']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('evt-congelar-saldo').checked = false;
  document.getElementById('evt-monto-congelar-wrap').style.display = 'none';
  document.getElementById('evt-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('evt-modal').classList.add('active');
}

function evt_cerrarModal() {
  document.getElementById('evt-modal').classList.remove('active');
}

async function evt_guardar() {
  const errEl = document.getElementById('evt-error');
  errEl.style.display = 'none';

  if (!EVT_TIPO_SEL) { errEl.textContent = 'Selecciona el tipo de evento.'; errEl.style.display = 'block'; return; }
  const CLI_ID = document.getElementById('evt-cliente')?.value;
  if (!CLI_ID) { errEl.textContent = 'Selecciona el cliente afectado.'; errEl.style.display = 'block'; return; }
  const motivo = document.getElementById('evt-motivo')?.value.trim();
  if (!motivo) { errEl.textContent = 'El motivo es obligatorio.'; errEl.style.display = 'block'; return; }

  // Validaciones específicas
  if (EVT_TIPO_SEL === 'Cesion_derechos' && !document.getElementById('evt-cesionario')?.value) {
    errEl.textContent = 'Selecciona el cliente cesionario.'; errEl.style.display = 'block'; return;
  }
  if (EVT_TIPO_SEL === 'Traslado_saldo' && !document.getElementById('evt-lote-destino')?.value) {
    errEl.textContent = 'Selecciona el lote destino.'; errEl.style.display = 'block'; return;
  }

  const congelar = document.getElementById('evt-congelar-saldo')?.checked;

  const data = {
    tipo_evento:        EVT_TIPO_SEL,
    CLI_ID,
    CLI_ID_secundario:  document.getElementById('evt-cesionario')?.value || '',
    LOTE_ID_destino:    document.getElementById('evt-lote-destino')?.value || '',
    PROY_ID_destino:    document.getElementById('evt-proy-destino')?.value || '',
    valor_involucrado:  document.getElementById('evt-valor-pagado')?.value ||
                        document.getElementById('evt-saldo-cedido')?.value ||
                        document.getElementById('evt-saldo-traslado')?.value || 0,
    valor_devolver:     document.getElementById('evt-valor-devolver')?.value || 0,
    congelar_saldo:     congelar ? 'true' : 'false',
    monto_congelar:     congelar ? (document.getElementById('evt-monto-congelar')?.value || 0) : 0,
    motivo,
    fecha_evento:       document.getElementById('evt-fecha')?.value || '',
    aprobado_por:       document.getElementById('evt-aprobado-por')?.value || '',
    registrado_por:     APP.user?.id || ''
  };

  const btn = document.getElementById('evt-btn-guardar');
  btn.disabled = true; btn.textContent = 'Registrando...';

  try {
    const res = await api('saveEvento', data);
    if (res.ok) {
      toast('Evento registrado correctamente', 'ok');
      evt_cerrarModal();
      await evt_cargarEventos();
      // Refrescar lotes si cambió el estado
      const lo = await apiGetLotes();
      if (lo.ok) EVT_LOTES = lo.data || [];
    } else {
      errEl.textContent = res.error || 'Error al registrar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Registrar evento';
}
