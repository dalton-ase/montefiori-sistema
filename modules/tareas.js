/**
 * ============================================================
 * ALIANZA CRM — tareas.js
 * Módulo de tareas entre áreas con semáforo de vencimiento
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_tareas = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Tareas</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Asignaciones entre áreas con seguimiento de vencimiento</p>
      </div>
      <button class="btn btn-primary" onclick="task_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva tarea
      </button>
    </div>

    <!-- Contadores semáforo -->
    <div id="task-semaforo" class="anim-2" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px"></div>

    <!-- Tabs -->
    <div class="tabs anim-2">
      <button class="tab-btn active" id="task-tab-mias"     onclick="task_cambiarTab('mias')">Mis tareas</button>
      <button class="tab-btn"        id="task-tab-asignadas" onclick="task_cambiarTab('asignadas')">Asignadas por mí</button>
      <button class="tab-btn"        id="task-tab-todas"    onclick="task_cambiarTab('todas')">Todas</button>
    </div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:14px">
      <div class="card-body" style="padding:12px 14px">
        <div style="display:grid;grid-template-columns:1fr 160px 160px 160px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="task-buscar"
                   placeholder="Buscar por cliente o descripción..." oninput="task_filtrar()">
          </div>
          <select class="form-control" id="task-filtro-estado" onchange="task_filtrar()">
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En_proceso">En proceso</option>
            <option value="Completada">Completada</option>
            <option value="Vencida">Vencida</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <select class="form-control" id="task-filtro-prioridad" onchange="task_filtrar()">
            <option value="">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <select class="form-control" id="task-filtro-area" onchange="task_filtrar()">
            <option value="">Todas las áreas</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista tareas -->
    <div id="task-lista" class="anim-3">
      <div style="padding:40px;text-align:center">
        <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
      </div>
    </div>

    <!-- Modal tarea -->
    <div class="modal-backdrop" id="task-modal">
      <div class="modal" style="max-width:620px">
        <div class="modal-header">
          <div class="modal-title" id="task-modal-title">Nueva tarea</div>
          <button class="modal-close" onclick="task_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="task-id">

          <div class="form-group">
            <label class="form-label">Cliente relacionado (opcional)</label>
            <select class="form-control" id="task-cliente">
              <option value="">Sin cliente específico</option>
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Asignar a</label>
              <select class="form-control" id="task-asignado">
                <option value="">Selecciona funcionario</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label req">Área responsable</label>
              <select class="form-control" id="task-area">
                <option value="">Selecciona área</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Tipo de tarea</label>
              <select class="form-control" id="task-tipo">
                <option value="">Selecciona tipo</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label req">Prioridad</label>
              <select class="form-control" id="task-prioridad">
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label req">Descripción</label>
            <input type="text" class="form-control" id="task-descripcion"
                   placeholder="¿Qué debe hacer el funcionario?">
          </div>

          <div class="form-group">
            <label class="form-label">Instrucciones adicionales</label>
            <textarea class="form-control" id="task-instrucciones" rows="2"
                      placeholder="Contexto o pasos específicos..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha límite</label>
            <input type="date" class="form-control" id="task-fecha-limite">
            <div class="form-hint">Si no se define, la tarea no tiene vencimiento</div>
          </div>

          <!-- Sección cierre (solo para editar tareas propias) -->
          <div id="task-cierre-section" style="display:none;padding:12px 14px;
               background:var(--verde-light);border-radius:var(--r);
               border:1px solid var(--verde-alpha);margin-top:4px">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--verde-dark);margin-bottom:8px">
              Cerrar tarea
            </div>
            <div class="form-group" style="margin-bottom:10px">
              <label class="form-label">Estado final</label>
              <select class="form-control" id="task-estado-cierre">
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Respuesta / Cierre</label>
              <textarea class="form-control" id="task-respuesta" rows="2"
                        placeholder="Describe cómo se resolvió o por qué se cancela..."></textarea>
            </div>
          </div>

          <div id="task-error" style="display:none;padding:10px 12px;background:var(--peligro-light);
               border:1px solid var(--peligro-borde);border-radius:var(--r);
               color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar tarea
          </button>
        </div>
      </div>
    </div>`;

  await task_cargarDatos();
};

// ── Estado ───────────────────────────────────────
let TASK_DATA  = [];
let TASK_CLI   = [];
let TASK_FUNC  = [];
let TASK_TAB   = 'mias';

async function task_cargarDatos() {
  try {
    const [cliRes, funcRes] = await Promise.all([apiGetClientes(), apiGetFuncionarios()]);
    if (cliRes.ok)  TASK_CLI  = cliRes.data  || [];
    if (funcRes.ok) TASK_FUNC = funcRes.data || [];
    task_cargarSelectores();
    await task_cargarTareas();
  } catch(e) {
    console.error('Error:', e);
  }
}

async function task_cargarTareas() {
  const res = await api('getTareas', {});
  TASK_DATA = res.ok ? (res.data || []) : [];
  task_renderSemaforo();
  task_filtrar();
}

function task_cargarSelectores() {
  const cfg = APP.config || {};

  // Áreas
  const selArea = document.getElementById('task-filtro-area');
  const mArea   = document.getElementById('task-area');
  const areas   = (cfg.area || []).map(a => a.clave);
  if (selArea) { selArea.innerHTML = '<option value="">Todas las áreas</option>'; areas.forEach(a => selArea.innerHTML += `<option value="${a}">${a}</option>`); }
  if (mArea)   { mArea.innerHTML   = '<option value="">Selecciona área</option>';  areas.forEach(a => mArea.innerHTML   += `<option value="${a}">${a}</option>`); }

  // Tipos de tarea
  const mTipo = document.getElementById('task-tipo');
  const tipos = cfg.tipo_tarea || [];
  if (mTipo) {
    mTipo.innerHTML = '<option value="">Selecciona tipo</option>';
    tipos.forEach(t => mTipo.innerHTML += `<option value="${t.clave}">${t.clave}</option>`);
  }

  // Clientes
  const mCli = document.getElementById('task-cliente');
  if (mCli) {
    mCli.innerHTML = '<option value="">Sin cliente específico</option>';
    TASK_CLI.forEach(c => mCli.innerHTML += `<option value="${c.CLI_ID}">${c.nombres} ${c.apellidos} — ${c.cedula_nit}</option>`);
  }

  // Funcionarios
  const mAsig = document.getElementById('task-asignado');
  if (mAsig) {
    mAsig.innerHTML = '<option value="">Selecciona funcionario</option>';
    TASK_FUNC.filter(f => String(f.estado).toLowerCase() === 'true')
      .forEach(f => mAsig.innerHTML += `<option value="${f.FUNC_ID}">${f.nombre} ${f.apellido} — ${f.area}</option>`);
  }
}

function task_renderSemaforo() {
  const cont = document.getElementById('task-semaforo');
  if (!cont) return;

  const hoy      = new Date();
  const manana   = new Date(); manana.setDate(manana.getDate() + 2);
  const misTasks = TASK_DATA.filter(t => t.asignada_a === APP.user?.id);

  const pendHoy  = misTasks.filter(t => t.estado === 'Pendiente' && t.fecha_limite && new Date(t.fecha_limite) <= manana).length;
  const vencidas = misTasks.filter(t => (t.estado === 'Pendiente' || t.estado === 'En_proceso') && t.fecha_limite && new Date(t.fecha_limite) < hoy).length;
  const enProceso = misTasks.filter(t => t.estado === 'En_proceso').length;
  const completadas = TASK_DATA.filter(t => t.estado === 'Completada').length;

  cont.innerHTML = [
    { num: vencidas,   label: 'Vencidas',      color: 'c-peligro', icon: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>` },
    { num: pendHoy,    label: 'Para hoy',       color: 'c-alerta',  icon: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>` },
    { num: enProceso,  label: 'En proceso',     color: 'c-azul',    icon: `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>` },
    { num: completadas,label: 'Completadas hoy',color: 'c-exito',   icon: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>` }
  ].map(s => `
    <div class="counter-card ${s.color}">
      <div class="counter-icon ${s.color}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </div>
      <div style="font-family:'Montserrat',sans-serif;font-size:1.8rem;font-weight:800;color:var(--oscuro);line-height:1;margin-bottom:4px">${s.num}</div>
      <div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500">${s.label}</div>
    </div>`).join('');
}

function task_cambiarTab(tab) {
  TASK_TAB = tab;
  ['mias','asignadas','todas'].forEach(t => {
    document.getElementById('task-tab-' + t)?.classList.toggle('active', t === tab);
  });
  task_filtrar();
}

function task_filtrar() {
  const q        = (document.getElementById('task-buscar')?.value || '').toLowerCase();
  const estado   = document.getElementById('task-filtro-estado')?.value   || '';
  const prioridad = document.getElementById('task-filtro-prioridad')?.value || '';
  const area     = document.getElementById('task-filtro-area')?.value    || '';
  const userId   = APP.user?.id || '';

  let data = [...TASK_DATA];

  if (TASK_TAB === 'mias')      data = data.filter(t => t.asignada_a === userId);
  if (TASK_TAB === 'asignadas') data = data.filter(t => t.creada_por === userId && t.asignada_a !== userId);

  data = data.filter(t => {
    const cli    = TASK_CLI.find(c => c.CLI_ID === t.CLI_ID);
    const nombre = cli ? (cli.nombres + ' ' + cli.apellidos).toLowerCase() : '';
    const mQ = !q         || nombre.includes(q) || (t.descripcion || '').toLowerCase().includes(q);
    const mE = !estado    || t.estado === estado;
    const mP = !prioridad || t.prioridad === prioridad;
    const mA = !area      || t.area_responsable === area;
    return mQ && mE && mP && mA;
  });

  task_renderLista(data);
}

const PRIOR_COLOR = { 'Alta': 'badge-peligro', 'Media': 'badge-alerta', 'Baja': 'badge-azul' };
const ESTADO_COLOR = {
  'Pendiente':  'badge-alerta',
  'En_proceso': 'badge-azul',
  'Completada': 'badge-exito',
  'Vencida':    'badge-peligro',
  'Cancelada':  'badge-gris'
};

function task_semaforo(fechaLimite, estado) {
  if (estado === 'Completada' || estado === 'Cancelada')
    return `<span style="font-size:var(--text-xs);color:var(--gris-mid)">—</span>`;
  if (!fechaLimite)
    return `<span style="font-size:var(--text-xs);color:var(--gris-mid)">Sin fecha</span>`;

  const hoy  = new Date();
  const lim  = new Date(fechaLimite);
  const dias = Math.ceil((lim - hoy) / 86400000);

  if (dias < 0)
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--peligro);font-weight:600">🔴 Vencida hace ${Math.abs(dias)}d</span>`;
  if (dias === 0)
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--alerta);font-weight:600">🟡 Vence hoy</span>`;
  if (dias <= 2)
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--alerta);font-weight:600">🟡 Vence en ${dias}d</span>`;
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--exito);font-weight:600">🟢 ${dias}d restantes</span>`;
}

function task_renderLista(data) {
  const cont = document.getElementById('task-lista');
  if (!cont) return;

  if (!data.length) {
    cont.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div class="empty-title">Sin tareas</div>
          <div class="empty-sub">No hay tareas con los filtros seleccionados</div>
        </div>
      </div>`;
    return;
  }

  cont.innerHTML = `
    <div class="card">
      <div class="card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Cliente</th>
              <th>Asignado a</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th style="text-align:right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(t => {
              const cli   = TASK_CLI.find(c => c.CLI_ID === t.CLI_ID);
              const asig  = TASK_FUNC.find(f => f.FUNC_ID === t.asignada_a);
              const diasT = t.fecha_creacion
                ? Math.floor((new Date() - new Date(t.fecha_creacion)) / 86400000)
                : 0;
              const esPropia = t.asignada_a === APP.user?.id;
              return `
                <tr>
                  <td>
                    <div style="font-weight:500;font-size:var(--text-sm);color:var(--oscuro)">${t.descripcion || '—'}</div>
                    <div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:2px">
                      ${t.tipo_tarea || ''} · ${t.area_responsable || ''} · Hace ${diasT}d
                    </div>
                  </td>
                  <td style="font-size:var(--text-sm)">${cli ? cli.nombres + ' ' + cli.apellidos : '—'}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:7px">
                      <div class="avatar sm">${getInitials((asig?.nombre || '') + ' ' + (asig?.apellido || ''))}</div>
                      <div style="font-size:var(--text-sm)">${asig ? asig.nombre + ' ' + asig.apellido : '—'}</div>
                    </div>
                  </td>
                  <td><span class="badge ${PRIOR_COLOR[t.prioridad] || 'badge-gris'}">${t.prioridad || '—'}</span></td>
                  <td><span class="badge ${ESTADO_COLOR[t.estado] || 'badge-gris'}">${(t.estado || '—').replace('_',' ')}</span></td>
                  <td>${task_semaforo(t.fecha_limite, t.estado)}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-ghost btn-sm btn-icon" onclick="task_abrirModal('${t.TASK_ID}')" title="Editar / Cerrar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      ${esPropia && (t.estado === 'Pendiente' || t.estado === 'En_proceso') ? `
                      <button class="btn btn-success btn-sm btn-icon" onclick="task_completarRapido('${t.TASK_ID}')" title="Completar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>` : ''}
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function task_abrirModal(TASK_ID = null) {
  document.getElementById('task-error').style.display = 'none';
  document.getElementById('task-cierre-section').style.display = 'none';
  document.getElementById('task-modal-title').textContent = TASK_ID ? 'Editar tarea' : 'Nueva tarea';
  ['task-id','task-descripcion','task-instrucciones','task-respuesta','task-fecha-limite']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('task-prioridad').value = 'Media';
  document.getElementById('task-cliente').value   = '';
  document.getElementById('task-asignado').value  = '';
  document.getElementById('task-area').value      = '';
  document.getElementById('task-tipo').value      = '';

  if (TASK_ID) {
    const t = TASK_DATA.find(x => x.TASK_ID === TASK_ID);
    if (t) {
      document.getElementById('task-id').value           = t.TASK_ID;
      document.getElementById('task-cliente').value      = t.CLI_ID || '';
      document.getElementById('task-asignado').value     = t.asignada_a || '';
      document.getElementById('task-area').value         = t.area_responsable || '';
      document.getElementById('task-tipo').value         = t.tipo_tarea || '';
      document.getElementById('task-descripcion').value  = t.descripcion || '';
      document.getElementById('task-instrucciones').value = t.instrucciones || '';
      document.getElementById('task-prioridad').value    = t.prioridad || 'Media';
      document.getElementById('task-fecha-limite').value = t.fecha_limite ? String(t.fecha_limite).split('T')[0] : '';

      // Mostrar cierre si es la persona asignada
      if (t.asignada_a === APP.user?.id &&
          (t.estado === 'Pendiente' || t.estado === 'En_proceso')) {
        document.getElementById('task-cierre-section').style.display = '';
      }
    }
  }

  document.getElementById('task-modal').classList.add('active');
}

function task_cerrarModal() {
  document.getElementById('task-modal').classList.remove('active');
}

async function task_completarRapido(TASK_ID) {
  if (!confirm('¿Marcar esta tarea como completada?')) return;
  try {
    const res = await api('saveTarea', {
      TASK_ID,
      estado:        'Completada',
      respuesta_cierre: 'Completada rápidamente desde el panel',
      fecha_cierre:  new Date().toISOString().split('T')[0]
    });
    if (res.ok) {
      toast('Tarea completada', 'ok');
      await task_cargarTareas();
    } else {
      toast(res.error || 'Error al completar', 'error');
    }
  } catch(e) {
    toast('Error de conexión', 'error');
  }
}

async function task_guardar() {
  const errEl = document.getElementById('task-error');
  errEl.style.display = 'none';

  const asignado    = document.getElementById('task-asignado')?.value;
  const area        = document.getElementById('task-area')?.value;
  const descripcion = document.getElementById('task-descripcion')?.value.trim();
  const TASK_ID     = document.getElementById('task-id')?.value;

  if (!asignado)    { errEl.textContent = 'Selecciona el funcionario asignado.'; errEl.style.display = 'block'; return; }
  if (!area)        { errEl.textContent = 'Selecciona el área responsable.';     errEl.style.display = 'block'; return; }
  if (!descripcion) { errEl.textContent = 'Escribe una descripción de la tarea.';errEl.style.display = 'block'; return; }

  const esCierre    = document.getElementById('task-cierre-section').style.display !== 'none';
  const estadoCierre = document.getElementById('task-estado-cierre')?.value;
  const respuesta   = document.getElementById('task-respuesta')?.value.trim();

  const data = {
    TASK_ID:          TASK_ID || undefined,
    CLI_ID:           document.getElementById('task-cliente')?.value || '',
    asignada_a:       asignado,
    area_responsable: area,
    tipo_tarea:       document.getElementById('task-tipo')?.value || '',
    descripcion,
    instrucciones:    document.getElementById('task-instrucciones')?.value.trim() || '',
    prioridad:        document.getElementById('task-prioridad')?.value || 'Media',
    fecha_limite:     document.getElementById('task-fecha-limite')?.value || '',
    creada_por:       APP.user?.id || '',
    estado:           esCierre ? estadoCierre : (TASK_ID ? undefined : 'Pendiente'),
    respuesta_cierre: esCierre ? respuesta : '',
    fecha_cierre:     esCierre ? new Date().toISOString().split('T')[0] : ''
  };

  const btn = document.getElementById('task-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    const res = await api('saveTarea', data);
    if (res.ok) {
      toast(TASK_ID ? 'Tarea actualizada' : 'Tarea creada y notificada', 'ok');
      task_cerrarModal();
      await task_cargarTareas();
    } else {
      errEl.textContent = res.error || 'Error al guardar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar tarea';
}
