/**
 * ============================================================
 * ALIANZA CRM — negocios.js
 * Módulo de gestión de negocios
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_negocios = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Negocios</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Registro de negocios — cliente, lote y condiciones</p>
      </div>
      <button class="btn btn-primary" onclick="neg_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo negocio
      </button>
    </div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 180px 180px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="neg-buscar" placeholder="Buscar por cliente o lote..." oninput="neg_filtrar()">
          </div>
          <select class="form-control" id="neg-filtro-estado" onchange="neg_filtrar()">
            <option value="">Todos los estados</option>
          </select>
          <select class="form-control" id="neg-filtro-modalidad" onchange="neg_filtrar()">
            <option value="">Todas las modalidades</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card anim-3">
      <div class="card-header">
        <div class="card-title" id="neg-contador">Negocios</div>
      </div>
      <div class="card-body" style="padding:0">
        <div id="neg-tabla-wrap" class="table-wrap">
          <div style="padding:40px;text-align:center">
            <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal negocio -->
    <div class="modal-backdrop" id="neg-modal">
      <div class="modal" style="max-width:700px">
        <div class="modal-header">
          <div class="modal-title" id="neg-modal-title">Nuevo negocio</div>
          <button class="modal-close" onclick="neg_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="neg-id">

          <div class="tabs" style="margin-bottom:18px">
            <button class="tab-btn active" onclick="neg_tab('basico')">Datos básicos</button>
            <button class="tab-btn" onclick="neg_tab('financiero')">Financiero</button>
            <button class="tab-btn" onclick="neg_tab('arras')">Arras y fechas</button>
          </div>

          <!-- Tab básico -->
          <div id="neg-tab-basico">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Cliente</label>
                <select class="form-control" id="neg-cliente" onchange="neg_actualizarEjecutivo()">
                  <option value="">Selecciona cliente</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label req">Proyecto</label>
                <select class="form-control" id="neg-proyecto" onchange="neg_cargarLotesDisponibles()">
                  <option value="">Selecciona proyecto</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Lote(s)</label>
                <select class="form-control" id="neg-lote" onchange="neg_actualizarPrecio()">
                  <option value="">Selecciona proyecto primero</option>
                </select>
                <div class="form-hint">Solo lotes disponibles del proyecto seleccionado</div>
              </div>
              <div class="form-group">
                <label class="form-label req">Modalidad de pago</label>
                <select class="form-control" id="neg-modalidad" onchange="neg_togglePermuta()">
                  <option value="">Selecciona modalidad</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Ejecutivo comercial</label>
                <select class="form-control" id="neg-ejecutivo">
                  <option value="">Selecciona ejecutivo</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Estado del negocio</label>
                <select class="form-control" id="neg-estado">
                  <option value="">Selecciona estado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tab financiero -->
          <div id="neg-tab-financiero" style="display:none">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label req">Valor total del negocio ($)</label>
                <input type="number" class="form-control" id="neg-valor-total"
                       placeholder="0" oninput="neg_calcularArras()">
              </div>
              <div class="form-group">
                <label class="form-label">Valor en dinero ($)</label>
                <input type="number" class="form-control" id="neg-valor-dinero" placeholder="0">
              </div>
            </div>

            <!-- Permuta -->
            <div id="neg-permuta-section" style="display:none">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Valor en permuta ($)</label>
                  <input type="number" class="form-control" id="neg-valor-permuta" placeholder="0">
                </div>
                <div class="form-group">
                  <label class="form-label">% Permuta del total</label>
                  <input type="number" class="form-control" id="neg-pct-permuta"
                         placeholder="0" min="0" max="100">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Descripción de bienes / servicios en permuta</label>
                <textarea class="form-control" id="neg-desc-permuta"
                          placeholder="Describe los bienes o servicios que entrega el cliente..."></textarea>
              </div>
            </div>

            <div style="padding:12px 14px;background:var(--navy-light);border-radius:var(--r);
                        font-size:var(--text-sm);color:var(--navy);margin-top:8px">
              <strong>Nota:</strong> Este módulo es informativo. El control contable
              de pagos se lleva en el sistema de cartera independiente.
            </div>
          </div>

          <!-- Tab arras y fechas -->
          <div id="neg-tab-arras" style="display:none">
            <div style="padding:12px 14px;background:var(--alerta-light);border-radius:var(--r);
                        border:1px solid var(--alerta-borde);margin-bottom:16px;font-size:var(--text-sm)">
              <strong style="color:var(--alerta)">Cláusulas contractuales</strong>
              <span style="color:var(--gris-dark)"> — Solo Cartera puede modificar los porcentajes hacia abajo.</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">% Cláusula de arras</label>
                <input type="number" class="form-control" id="neg-pct-arras"
                       value="15" min="0" max="15" oninput="neg_calcularArras()">
                <div class="form-hint">Default 15% · Solo puede bajar</div>
              </div>
              <div class="form-group">
                <label class="form-label">% Cláusula penal</label>
                <input type="number" class="form-control" id="neg-pct-penal"
                       value="15" min="0" max="15" oninput="neg_calcularArras()">
                <div class="form-hint">Default 15% · Solo puede bajar</div>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Valor arras (calculado)</label>
                <input type="text" class="form-control" id="neg-valor-arras"
                       readonly style="background:var(--gris-bg);color:var(--gris-mid)">
              </div>
              <div class="form-group">
                <label class="form-label">Valor penal (calculado)</label>
                <input type="text" class="form-control" id="neg-valor-penal"
                       readonly style="background:var(--gris-bg);color:var(--gris-mid)">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Fecha de separación</label>
                <input type="date" class="form-control" id="neg-fecha-sep">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha de contrato</label>
                <input type="date" class="form-control" id="neg-fecha-contrato">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha promesa de escritura</label>
              <input type="date" class="form-control" id="neg-fecha-escritura">
            </div>
            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" id="neg-contrato-agrupado" style="margin-right:6px">
                Contrato agrupado (lotes contiguos bajo un solo contrato)
              </label>
            </div>
          </div>

          <div id="neg-error" style="display:none;padding:10px 12px;background:var(--peligro-light);
               border:1px solid var(--peligro-borde);border-radius:var(--r);
               color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="neg_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="neg-btn-guardar" onclick="neg_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar negocio
          </button>
        </div>
      </div>
    </div>

    <!-- Modal detalle negocio -->
    <div class="modal-backdrop" id="neg-detalle-modal">
      <div class="modal" style="max-width:700px">
        <div class="modal-header">
          <div class="modal-title" id="neg-detalle-titulo">Detalle del negocio</div>
          <button class="modal-close" onclick="document.getElementById('neg-detalle-modal').classList.remove('active')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" id="neg-detalle-cuerpo" style="padding:20px"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('neg-detalle-modal').classList.remove('active')">Cerrar</button>
          <button class="btn btn-primary" id="neg-detalle-editar">Editar</button>
        </div>
      </div>
    </div>`;

  await neg_cargarDatos();
};

// ── Estado ───────────────────────────────────────
let NEG_DATA   = [];
let NEG_CLI    = [];
let NEG_PROY   = [];
let NEG_LOTES  = [];
let NEG_FUNC   = [];

async function neg_cargarDatos() {
  try {
    const [cliRes, proyRes, lotesRes, funcRes] = await Promise.all([
      apiGetClientes(),
      apiGetProyectos(),
      apiGetLotes(),
      apiGetFuncionarios()
    ]);

    if (cliRes.ok)   NEG_CLI   = cliRes.data   || [];
    if (proyRes.ok)  NEG_PROY  = proyRes.data  || [];
    if (lotesRes.ok) NEG_LOTES = lotesRes.data || [];
    if (funcRes.ok)  NEG_FUNC  = funcRes.data  || [];

    neg_cargarSelectores();
    await neg_cargarNegocios();
  } catch(e) {
    console.error('Error cargando datos negocios:', e);
  }
}

async function neg_cargarNegocios() {
  // Simulamos lista desde CLI + sus negocios
  // En fase 4 tendremos endpoint directo getNegocios
  const wrap = document.getElementById('neg-tabla-wrap');
  if (!wrap) return;

  // Por ahora mostramos mensaje informativo
  wrap.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div class="empty-title">Sin negocios registrados</div>
      <div class="empty-sub">Crea el primer negocio con el botón "Nuevo negocio"</div>
    </div>`;

  document.getElementById('neg-contador').textContent = '0 negocios';
  neg_filtrar();
}

function neg_cargarSelectores() {
  const cfg = APP.config || {};

  // Estados negocio
  const selEst = document.getElementById('neg-filtro-estado');
  const mEst   = document.getElementById('neg-estado');
  const estados = cfg.estado_negocio || [];
  if (selEst) { selEst.innerHTML = '<option value="">Todos los estados</option>'; estados.forEach(e => selEst.innerHTML += `<option value="${e.clave}">${e.clave}</option>`); }
  if (mEst)   { mEst.innerHTML  = '<option value="">Selecciona estado</option>';  estados.forEach(e => mEst.innerHTML  += `<option value="${e.clave}">${e.clave}</option>`); }

  // Modalidades
  const selMod = document.getElementById('neg-filtro-modalidad');
  const mMod   = document.getElementById('neg-modalidad');
  const mods   = cfg.modalidad_negocio || [];
  if (selMod) { selMod.innerHTML = '<option value="">Todas las modalidades</option>'; mods.forEach(m => selMod.innerHTML += `<option value="${m.clave}">${m.clave}</option>`); }
  if (mMod)   { mMod.innerHTML   = '<option value="">Selecciona modalidad</option>';  mods.forEach(m => mMod.innerHTML   += `<option value="${m.clave}">${m.clave.replace('_',' ')}</option>`); }

  // Clientes
  const mCli = document.getElementById('neg-cliente');
  if (mCli) {
    mCli.innerHTML = '<option value="">Selecciona cliente</option>';
    NEG_CLI.forEach(c => mCli.innerHTML += `<option value="${c.CLI_ID}">${c.nombres} ${c.apellidos} — ${c.cedula_nit}</option>`);
  }

  // Proyectos
  const mProy = document.getElementById('neg-proyecto');
  if (mProy) {
    mProy.innerHTML = '<option value="">Selecciona proyecto</option>';
    NEG_PROY.forEach(p => mProy.innerHTML += `<option value="${p.PROY_ID}">${p.nombre} (${p.municipio})</option>`);
  }

  // Ejecutivos comerciales
  const mEj = document.getElementById('neg-ejecutivo');
  if (mEj) {
    mEj.innerHTML = '<option value="">Sin asignar</option>';
    NEG_FUNC.filter(f => f.area === 'Comercial' || f.rol === 'Director')
      .forEach(f => mEj.innerHTML += `<option value="${f.FUNC_ID}">${f.nombre} ${f.apellido}</option>`);
  }
}

function neg_cargarLotesDisponibles() {
  const PROY_ID = document.getElementById('neg-proyecto')?.value;
  const mLote   = document.getElementById('neg-lote');
  if (!mLote) return;

  if (!PROY_ID) {
    mLote.innerHTML = '<option value="">Selecciona proyecto primero</option>';
    return;
  }

  const disponibles = NEG_LOTES.filter(l => l.PROY_ID === PROY_ID && l.estado === 'Disponible');
  mLote.innerHTML = `<option value="">Selecciona lote (${disponibles.length} disponibles)</option>`;
  disponibles.forEach(l => {
    const precio = l.precio_lista ? ` — ${formatCOP(l.precio_lista)}` : '';
    const area   = l.area_m2 ? ` · ${l.area_m2}m²` : '';
    mLote.innerHTML += `<option value="${l.LOTE_ID}" data-precio="${l.precio_lista || 0}">
      ${l.codigo_lote}${l.numero_manzana ? ' (Manz. '+l.numero_manzana+')' : ''}${area}${precio}
    </option>`;
  });
}

function neg_actualizarPrecio() {
  const sel = document.getElementById('neg-lote');
  const opt = sel?.options[sel.selectedIndex];
  if (!opt) return;
  const precio = opt.getAttribute('data-precio');
  if (precio && precio !== '0') {
    document.getElementById('neg-valor-total').value = precio;
    neg_calcularArras();
  }
}

function neg_actualizarEjecutivo() {
  const CLI_ID = document.getElementById('neg-cliente')?.value;
  if (!CLI_ID) return;
  const cli = NEG_CLI.find(c => c.CLI_ID === CLI_ID);
  if (cli?.ejecutivo_asignado) {
    const mEj = document.getElementById('neg-ejecutivo');
    if (mEj) mEj.value = cli.ejecutivo_asignado;
  }
}

function neg_togglePermuta() {
  const mod = document.getElementById('neg-modalidad')?.value || '';
  const sec = document.getElementById('neg-permuta-section');
  if (!sec) return;
  const esPermuta = mod.includes('Permuta') || mod === 'Mixto';
  sec.style.display = esPermuta ? '' : 'none';
}

function neg_calcularArras() {
  const total  = parseFloat(document.getElementById('neg-valor-total')?.value || 0);
  const pctA   = parseFloat(document.getElementById('neg-pct-arras')?.value   || 15);
  const pctP   = parseFloat(document.getElementById('neg-pct-penal')?.value   || 15);
  const arras  = total * pctA / 100;
  const penal  = total * pctP / 100;
  const fArras = document.getElementById('neg-valor-arras');
  const fPenal = document.getElementById('neg-valor-penal');
  if (fArras) fArras.value = formatCOP(arras);
  if (fPenal) fPenal.value = formatCOP(penal);
}

function neg_tab(tab) {
  ['basico','financiero','arras'].forEach(t => {
    document.getElementById('neg-tab-' + t).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#neg-modal .tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ['basico','financiero','arras'][i] === tab);
  });
}

function neg_filtrar() {
  // Se implementa con datos reales en fase siguiente
}

function neg_abrirModal(NEG_ID = null) {
  ['neg-id','neg-valor-total','neg-valor-dinero','neg-valor-permuta','neg-pct-permuta','neg-desc-permuta']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('neg-pct-arras').value    = '15';
  document.getElementById('neg-pct-penal').value    = '15';
  document.getElementById('neg-valor-arras').value  = '';
  document.getElementById('neg-valor-penal').value  = '';
  document.getElementById('neg-fecha-sep').value    = new Date().toISOString().split('T')[0];
  document.getElementById('neg-fecha-contrato').value   = '';
  document.getElementById('neg-fecha-escritura').value  = '';
  document.getElementById('neg-contrato-agrupado').checked = false;
  document.getElementById('neg-permuta-section').style.display = 'none';
  document.getElementById('neg-error').style.display = 'none';
  document.getElementById('neg-modal-title').textContent = NEG_ID ? 'Editar negocio' : 'Nuevo negocio';
  neg_tab('basico');
  document.getElementById('neg-modal').classList.add('active');
}

function neg_cerrarModal() {
  document.getElementById('neg-modal').classList.remove('active');
}

async function neg_guardar() {
  const errEl = document.getElementById('neg-error');
  errEl.style.display = 'none';

  const CLI_ID    = document.getElementById('neg-cliente')?.value;
  const LOTE_ID   = document.getElementById('neg-lote')?.value;
  const modalidad = document.getElementById('neg-modalidad')?.value;

  if (!CLI_ID) {
    errEl.textContent = 'Selecciona un cliente.';
    errEl.style.display = 'block';
    neg_tab('basico');
    return;
  }
  if (!LOTE_ID) {
    errEl.textContent = 'Selecciona un lote disponible.';
    errEl.style.display = 'block';
    neg_tab('basico');
    return;
  }
  if (!modalidad) {
    errEl.textContent = 'Selecciona la modalidad de pago.';
    errEl.style.display = 'block';
    neg_tab('basico');
    return;
  }

  const pctArras = parseFloat(document.getElementById('neg-pct-arras').value || 15);
  const pctPenal = parseFloat(document.getElementById('neg-pct-penal').value || 15);
  const total    = parseFloat(document.getElementById('neg-valor-total').value || 0);

  if (pctArras > 15 || pctPenal > 15) {
    errEl.textContent = 'Los porcentajes de arras y penal no pueden superar el 15%.';
    errEl.style.display = 'block';
    neg_tab('arras');
    return;
  }

  const data = {
    NEG_ID:               document.getElementById('neg-id').value || undefined,
    CLI_ID,
    lotes_ids:            JSON.stringify([LOTE_ID]),
    modalidad,
    valor_total:          total,
    valor_dinero:         document.getElementById('neg-valor-dinero').value || 0,
    valor_permuta:        document.getElementById('neg-valor-permuta').value || 0,
    proporcion_permuta_pct: document.getElementById('neg-pct-permuta').value || 0,
    descripcion_permuta:  document.getElementById('neg-desc-permuta').value || '',
    pct_arras:            pctArras,
    pct_penal:            pctPenal,
    valor_arras:          total * pctArras / 100,
    valor_penal:          total * pctPenal / 100,
    contrato_agrupado:    document.getElementById('neg-contrato-agrupado').checked ? 'true' : 'false',
    estado_negocio:       document.getElementById('neg-estado').value || 'Activo',
    ejecutivo_comercial:  document.getElementById('neg-ejecutivo').value || '',
    fecha_separacion:     document.getElementById('neg-fecha-sep').value || '',
    fecha_contrato:       document.getElementById('neg-fecha-contrato').value || '',
    fecha_promesa_escritura: document.getElementById('neg-fecha-escritura').value || ''
  };

  const btn = document.getElementById('neg-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await api('saveNegocio', data);
    if (res.ok) {
      toast('Negocio guardado correctamente', 'ok');
      neg_cerrarModal();
      await neg_cargarDatos();
    } else {
      errEl.textContent = res.error || 'Error al guardar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar negocio';
}
