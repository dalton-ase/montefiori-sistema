/**
 * ============================================================
 * ALIANZA CRM — tareas.js v2.0
 * Módulo Kanban + Métricas integradas
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

// ── Estado global del módulo ─────────────────────────────
let TASK_DATA  = [];
let TASK_CLI   = [];
let TASK_FUNC  = [];
let TASK_TAB   = 'mias';

const TASK_COLUMNAS = [
  { id: 'Pendiente',   label: 'Pendiente',   color: 'alerta',  icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },
  { id: 'En_proceso',  label: 'En proceso',  color: 'azul',    icon: '<path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/>' },
  { id: 'Completada',  label: 'Completada',  color: 'exito',   icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
  { id: 'Vencida',     label: 'Vencida',     color: 'peligro', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' }
];

const TASK_TRANSICIONES_UI = {
  'Pendiente':  ['En_proceso', 'Cancelada'],
  'En_proceso': ['Completada', 'Cancelada'],
  'Vencida':    ['En_proceso', 'Cancelada'],
  'Completada': [],
  'Cancelada':  []
};

// ── Render principal ─────────────────────────────────────
window.render_tareas = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <!-- Header -->
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Tareas</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Tablero Kanban con seguimiento de vencimiento</p>
      </div>
      <button class="btn btn-primary" onclick="task_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva tarea
      </button>
    </div>

    <!-- Métricas personales -->
    <div id="task-metricas" class="anim-2" style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px"></div>

    <!-- Tabs + Filtros -->
    <div class="anim-2" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <div class="tabs" style="margin-bottom:0;border-bottom:none">
        <button class="tab-btn active" id="task-tab-mias"     onclick="task_cambiarTab('mias')">Mis tareas</button>
        <button class="tab-btn"        id="task-tab-asignadas" onclick="task_cambiarTab('asignadas')">Asignadas por mí</button>
        <button class="tab-btn"        id="task-tab-todas"    onclick="task_cambiarTab('todas')">Todas</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="search-bar" style="width:220px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="task-buscar" placeholder="Buscar..." oninput="task_filtrar()">
        </div>
        <select class="form-control" id="task-filtro-prioridad" onchange="task_filtrar()" style="width:130px;padding:8px 10px;font-size:var(--text-xs)">
          <option value="">Prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
        <select class="form-control" id="task-filtro-area" onchange="task_filtrar()" style="width:130px;padding:8px 10px;font-size:var(--text-xs)">
          <option value="">Área</option>
        </select>
      </div>
    </div>

    <!-- Kanban Board -->
    <div id="task-kanban" class="anim-3" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:start;min-height:400px">
      <div style="grid-column:1/-1;padding:40px;text-align:center">
        <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
      </div>
    </div>

    <!-- Modal tarea (crear / editar / cerrar) -->
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
            <select class="form-control" id="task-cliente"><option value="">Sin cliente específico</option></select>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Asignar a</label>
              <select class="form-control" id="task-asignado"><option value="">Selecciona funcionario</option></select>
            </div>
            <div class="form-group">
              <label class="form-label req">Área responsable</label>
              <select class="form-control" id="task-area"><option value="">Selecciona área</option></select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Tipo de tarea</label>
              <select class="form-control" id="task-tipo"><option value="">Selecciona tipo</option></select>
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
            <input type="text" class="form-control" id="task-descripcion" placeholder="¿Qué debe hacer el funcionario?">
          </div>
          <div class="form-group">
            <label class="form-label">Instrucciones adicionales</label>
            <textarea class="form-control" id="task-instrucciones" rows="2" placeholder="Contexto o pasos específicos..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha límite</label>
            <input type="date" class="form-control" id="task-fecha-limite">
            <div class="form-hint">Si no se define, la tarea no tiene vencimiento</div>
          </div>

          <!-- Sección cierre dentro del modal editar -->
          <div id="task-cierre-section" style="display:none;padding:14px 16px;background:var(--verde-light);border-radius:var(--r);border:1px solid var(--verde-alpha);margin-top:8px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--verde-dark)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span style="font-size:var(--text-sm);font-weight:600;color:var(--verde-dark)">Cerrar tarea</span>
            </div>
            <div class="form-group" style="margin-bottom:10px">
              <label class="form-label">Estado final</label>
              <select class="form-control" id="task-estado-cierre">
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label req">Respuesta / Motivo de cierre</label>
              <textarea class="form-control" id="task-respuesta" rows="2" placeholder="Describe cómo se resolvió o por qué se cancela..."></textarea>
            </div>
          </div>

          <div id="task-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer" id="task-modal-footer">
          <button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar tarea
          </button>
        </div>
      </div>
    </div>

    <!-- Modal cierre rápido (al soltar en Completada o desde botón) -->
    <div class="modal-backdrop" id="task-modal-cierre">
      <div class="modal" style="max-width:440px">
        <div class="modal-header">
          <div class="modal-title">Cerrar tarea</div>
          <button class="modal-close" onclick="task_cerrarModalCierre()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cierre-task-id">
          <input type="hidden" id="cierre-nuevo-estado">
          <div id="cierre-desc" style="font-size:var(--text-sm);color:var(--oscuro);margin-bottom:14px;font-weight:500"></div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label req">Respuesta de cierre</label>
            <textarea class="form-control" id="cierre-respuesta" rows="3" placeholder="Describe cómo se resolvió la tarea..."></textarea>
          </div>
          <div id="cierre-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="task_cerrarModalCierre()">Cancelar</button>
          <button class="btn btn-verde" id="cierre-btn" onclick="task_confirmarCierre()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Confirmar cierre
          </button>
        </div>
      </div>
    </div>

    <style>
      .kanban-col{background:var(--gris-surface);border-radius:var(--r-lg);border:1px solid var(--gris-borde);min-height:320px;display:flex;flex-direction:column;transition:border-color .2s ease,background .2s ease}
      .kanban-col.drag-over{border-color:var(--azul);background:var(--azul-light);border-style:dashed}
      .kanban-col-header{padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--gris-borde)}
      .kanban-col-title{display:flex;align-items:center;gap:8px;font-family:'Montserrat',sans-serif;font-size:var(--text-sm);font-weight:700;color:var(--oscuro)}
      .kanban-col-title svg{width:15px;height:15px}
      .kanban-col-count{font-size:var(--text-xs);font-weight:700;padding:2px 8px;border-radius:var(--r-full);min-width:22px;text-align:center}
      .kanban-col-body{flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;max-height:calc(100vh - 340px)}
      .kanban-card{background:var(--blanco);border:1px solid var(--gris-borde);border-radius:var(--r);padding:12px 14px;cursor:default;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;position:relative}
      .kanban-card.draggable{cursor:grab}
      .kanban-card.draggable:active{cursor:grabbing}
      .kanban-card.dragging{opacity:.4;transform:rotate(2deg)}
      .kanban-card:hover{box-shadow:var(--sh-sm)}
      .kanban-card.prioridad-alta{border-left:3px solid var(--peligro)}
      .kanban-card.prioridad-media{border-left:3px solid var(--alerta)}
      .kanban-card.prioridad-baja{border-left:3px solid var(--azul)}
      .kanban-card.vencida-pulse{animation:vencidaPulse 2s ease-in-out infinite}
      @keyframes vencidaPulse{0%,100%{border-color:var(--peligro-borde)}50%{border-color:var(--peligro)}}
      .kanban-card-desc{font-size:var(--text-sm);font-weight:500;color:var(--oscuro);line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .kanban-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .kanban-card-actions{position:absolute;top:8px;right:8px;display:flex;gap:2px;opacity:0;transition:opacity .15s ease}
      .kanban-card:hover .kanban-card-actions{opacity:1}
      .kanban-card-btn{width:26px;height:26px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;color:var(--gris-mid);transition:background .15s ease,color .15s ease}
      .kanban-card-btn:hover{background:var(--gris-light);color:var(--oscuro)}
      .kanban-card-btn.btn-completar:hover{background:var(--exito-light);color:var(--exito)}
      .kanban-card-btn.btn-cancelar:hover{background:var(--peligro-light);color:var(--peligro)}
      @media(max-width:1100px){#task-kanban{grid-template-columns:repeat(2,1fr)!important}}
      @media(max-width:768px){#task-kanban{grid-template-columns:1fr!important}#task-metricas{grid-template-columns:repeat(3,1fr)!important}}
    </style>`;

  await task_cargarDatos();
};

// ── Carga de datos ───────────────────────────────────────
async function task_cargarDatos() {
  try {
    const [cliRes, funcRes] = await Promise.all([apiGetClientes(), apiGetFuncionarios()]);
    if (cliRes.ok)  TASK_CLI  = cliRes.data  || [];
    if (funcRes.ok) TASK_FUNC = funcRes.data || [];
    task_cargarSelectores();
    await task_cargarTareas();
  } catch(e) { console.error('Error:', e); }
}

async function task_cargarTareas() {
  const res = await api('getTareas', {});
  TASK_DATA = res.ok ? (res.data || []) : [];
  task_renderMetricas();
  task_filtrar();
}

function task_cargarSelectores() {
  const cfg = APP.config || {};
  const areas = (cfg.area || []).map(a => a.clave);
  const tipos = cfg.tipo_tarea || [];
  const selArea = document.getElementById('task-filtro-area');
  const mArea   = document.getElementById('task-area');
  if (selArea) { selArea.innerHTML = '<option value="">Área</option>'; areas.forEach(a => selArea.innerHTML += '<option value="'+a+'">'+a+'</option>'); }
  if (mArea)   { mArea.innerHTML   = '<option value="">Selecciona área</option>'; areas.forEach(a => mArea.innerHTML += '<option value="'+a+'">'+a+'</option>'); }
  const mTipo = document.getElementById('task-tipo');
  if (mTipo) { mTipo.innerHTML = '<option value="">Selecciona tipo</option>'; tipos.forEach(t => mTipo.innerHTML += '<option value="'+t.clave+'">'+t.clave+'</option>'); }
  const mCli = document.getElementById('task-cliente');
  if (mCli) { mCli.innerHTML = '<option value="">Sin cliente específico</option>'; TASK_CLI.forEach(c => mCli.innerHTML += '<option value="'+c.CLI_ID+'">'+c.nombres+' '+c.apellidos+' — '+c.cedula_nit+'</option>'); }
  const mAsig = document.getElementById('task-asignado');
  if (mAsig) { mAsig.innerHTML = '<option value="">Selecciona funcionario</option>'; TASK_FUNC.filter(f => String(f.estado).toLowerCase() === 'true').forEach(f => mAsig.innerHTML += '<option value="'+f.FUNC_ID+'">'+f.nombre+' '+f.apellido+' — '+f.area+'</option>'); }
}

// ── Métricas ─────────────────────────────────────────────
function task_renderMetricas() {
  var cont = document.getElementById('task-metricas');
  if (!cont) return;
  var userId = APP.user?.id || '';
  var hoy = new Date();
  var hace7d = new Date(); hace7d.setDate(hace7d.getDate() - 7);
  var misTasks = TASK_DATA.filter(function(t) { return t.asignada_a === userId; });

  var abiertas = misTasks.filter(function(t) { return t.estado === 'Pendiente' || t.estado === 'En_proceso' || t.estado === 'Vencida'; }).length;
  var completadasSemana = misTasks.filter(function(t) {
    return t.estado === 'Completada' && t.fecha_completada_real && new Date(t.fecha_completada_real) >= hace7d;
  }).length;
  var vencidas = misTasks.filter(function(t) {
    return t.estado === 'Vencida' || ((t.estado === 'Pendiente' || t.estado === 'En_proceso') && t.fecha_limite && new Date(t.fecha_limite) < hoy);
  }).length;

  var resueltas = misTasks.filter(function(t) { return t.dias_resolucion_total !== undefined && t.dias_resolucion_total !== '' && t.estado === 'Completada'; });
  var promedio = resueltas.length > 0
    ? (resueltas.reduce(function(s, t) { return s + Number(t.dias_resolucion_total); }, 0) / resueltas.length).toFixed(1)
    : '—';

  var cerradas = misTasks.filter(function(t) { return t.estado === 'Completada' && t.fecha_limite; });
  var aTiempo  = cerradas.filter(function(t) { return t.cumplio_a_tiempo === true; }).length;
  var tasa     = cerradas.length > 0 ? Math.round((aTiempo / cerradas.length) * 100) : '—';

  var items = [
    { num: abiertas,          label: 'Abiertas',         color: 'azul',    icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>' },
    { num: completadasSemana, label: 'Cerradas (7d)',     color: 'exito',   icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
    { num: vencidas,          label: 'Vencidas',          color: 'peligro', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },
    { num: promedio === '—' ? '—' : promedio+'d', label: 'Resolución prom.', color: 'navy', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { num: tasa === '—' ? '—' : tasa+'%', label: 'Cumplimiento',  color: 'verde', icon: '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>' }
  ];

  cont.innerHTML = items.map(function(m) {
    return '<div class="counter-card c-'+m.color+'">' +
      '<div class="counter-icon c-'+m.color+'">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+m.icon+'</svg>' +
      '</div>' +
      '<div style="font-family:\'Montserrat\',sans-serif;font-size:1.6rem;font-weight:800;color:var(--oscuro);line-height:1;margin-bottom:4px">'+m.num+'</div>' +
      '<div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500">'+m.label+'</div>' +
    '</div>';
  }).join('');
}

// ── Tabs y filtros ───────────────────────────────────────
function task_cambiarTab(tab) {
  TASK_TAB = tab;
  ['mias','asignadas','todas'].forEach(function(t) {
    var el = document.getElementById('task-tab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  task_filtrar();
}

function task_filtrar() {
  var q         = (document.getElementById('task-buscar')?.value || '').toLowerCase();
  var prioridad = document.getElementById('task-filtro-prioridad')?.value || '';
  var area      = document.getElementById('task-filtro-area')?.value     || '';
  var userId    = APP.user?.id || '';
  var data = TASK_DATA.slice();

  if (TASK_TAB === 'mias')      data = data.filter(function(t) { return t.asignada_a === userId; });
  if (TASK_TAB === 'asignadas') data = data.filter(function(t) { return t.creada_por === userId && t.asignada_a !== userId; });

  data = data.filter(function(t) {
    var cli    = TASK_CLI.find(function(c) { return c.CLI_ID === t.CLI_ID; });
    var nombre = cli ? (cli.nombres + ' ' + cli.apellidos).toLowerCase() : '';
    var mQ = !q         || nombre.indexOf(q) >= 0 || (t.descripcion || '').toLowerCase().indexOf(q) >= 0;
    var mP = !prioridad || t.prioridad === prioridad;
    var mA = !area      || t.area_responsable === area;
    return mQ && mP && mA;
  });

  // No mostrar canceladas en el Kanban (se ven desde modal editar)
  data = data.filter(function(t) { return t.estado !== 'Cancelada'; });

  task_renderKanban(data);
}

// ── Kanban Board ─────────────────────────────────────────
function task_renderKanban(data) {
  var board = document.getElementById('task-kanban');
  if (!board) return;

  var hoy = new Date();
  data.forEach(function(t) {
    if ((t.estado === 'Pendiente' || t.estado === 'En_proceso') && t.fecha_limite && new Date(t.fecha_limite) < hoy) {
      t._col = 'Vencida';
    } else {
      t._col = t.estado;
    }
  });

  board.innerHTML = TASK_COLUMNAS.map(function(col) {
    var tarjetas = data.filter(function(t) { return t._col === col.id; });
    var colorMap = { alerta: '--alerta', azul: '--azul', exito: '--exito', peligro: '--peligro' };
    var bgMap    = { alerta: 'var(--alerta-light)', azul: 'var(--azul-light)', exito: 'var(--exito-light)', peligro: 'var(--peligro-light)' };
    var fgMap    = { alerta: 'var(--alerta)', azul: 'var(--azul-dark)', exito: 'var(--exito)', peligro: 'var(--peligro)' };

    return '<div class="kanban-col" id="kanban-col-'+col.id+'"' +
      ' ondragover="task_dragOver(event)" ondragleave="task_dragLeave(event)"' +
      ' ondrop="task_drop(event, \''+col.id+'\')">' +
      '<div class="kanban-col-header">' +
        '<div class="kanban-col-title" style="color:var('+colorMap[col.color]+')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+col.icon+'</svg>' +
          col.label +
        '</div>' +
        '<span class="kanban-col-count" style="background:'+bgMap[col.color]+';color:'+fgMap[col.color]+'">'+tarjetas.length+'</span>' +
      '</div>' +
      '<div class="kanban-col-body" id="kanban-body-'+col.id+'">' +
        (tarjetas.length === 0
          ? '<div style="padding:20px 10px;text-align:center;color:var(--gris-borde);font-size:var(--text-xs)">Sin tareas</div>'
          : tarjetas.map(function(t) { return task_renderCard(t, col.id); }).join('')) +
      '</div>' +
    '</div>';
  }).join('');
}

function task_renderCard(t, colId) {
  var cli  = TASK_CLI.find(function(c) { return c.CLI_ID === t.CLI_ID; });
  var asig = TASK_FUNC.find(function(f) { return f.FUNC_ID === t.asignada_a; });
  var draggable = t.puede_mover && (colId !== 'Completada');
  var esVencida = colId === 'Vencida';
  var puedeCompletar = t.puede_mover && (t.estado === 'En_proceso' || esVencida);
  var puedeCancelar  = t.puede_mover && t.estado !== 'Completada' && t.estado !== 'Cancelada';

  var html = '<div class="kanban-card '+(draggable ? 'draggable' : '')+' prioridad-'+(t.prioridad||'media').toLowerCase()+' '+(esVencida ? 'vencida-pulse' : '')+'"';
  if (draggable) {
    html += ' draggable="true" ondragstart="task_dragStart(event, \''+t.TASK_ID+'\')" ondragend="task_dragEnd(event)"';
  }
  html += ' data-task-id="'+t.TASK_ID+'">';

  // Acciones hover
  html += '<div class="kanban-card-actions">';
  if (puedeCompletar) {
    html += '<button class="kanban-card-btn btn-completar" onclick="task_iniciarCierre(\''+t.TASK_ID+'\',\'Completada\')" title="Completar">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>';
  }
  html += '<button class="kanban-card-btn" onclick="task_abrirModal(\''+t.TASK_ID+'\')" title="Editar">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>';
  if (puedeCancelar) {
    html += '<button class="kanban-card-btn btn-cancelar" onclick="task_iniciarCierre(\''+t.TASK_ID+'\',\'Cancelada\')" title="Cancelar">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  }
  html += '</div>';

  // Contenido
  html += '<div class="kanban-card-desc">'+(t.descripcion || '—')+'</div>';
  html += '<div class="kanban-card-meta">';
  if (asig) {
    html += '<div style="display:flex;align-items:center;gap:5px">' +
      '<div class="avatar sm">'+getInitials((asig.nombre||'')+' '+(asig.apellido||''))+'</div>' +
      '<span style="font-size:var(--text-xs);color:var(--gris-mid)">'+(asig.nombre||'')+'</span></div>';
  }
  var priorClass = t.prioridad === 'Alta' ? 'badge-peligro' : t.prioridad === 'Baja' ? 'badge-azul' : 'badge-alerta';
  html += '<span class="badge '+priorClass+'" style="font-size:.6rem;padding:2px 7px">'+(t.prioridad||'—')+'</span>';
  if (cli) {
    html += '<span style="font-size:var(--text-xs);color:var(--gris-mid)" title="'+(cli.nombres||'')+' '+(cli.apellidos||'')+'">👤 '+(cli.nombres?.split(' ')[0]||'')+'</span>';
  }
  if (t.fecha_limite) html += task_semaforo(t.fecha_limite, t.estado);
  html += '</div>';

  if (t.dias_resolucion_total !== undefined && t.dias_resolucion_total !== '' && t.estado === 'Completada') {
    html += '<div style="margin-top:6px;font-size:.6rem;color:var(--gris-mid)">Resuelta en '+t.dias_resolucion_total+'d</div>';
  }

  html += '</div>';
  return html;
}

function task_semaforo(fechaLimite, estado) {
  if (estado === 'Completada' || estado === 'Cancelada') return '';
  if (!fechaLimite) return '';
  var hoy = new Date(), lim = new Date(fechaLimite);
  var dias = Math.ceil((lim - hoy) / 86400000);
  if (dias < 0)   return '<span style="font-size:.6rem;color:var(--peligro);font-weight:600">🔴 '+Math.abs(dias)+'d</span>';
  if (dias === 0)  return '<span style="font-size:.6rem;color:var(--alerta);font-weight:600">🟡 Hoy</span>';
  if (dias <= 2)   return '<span style="font-size:.6rem;color:var(--alerta);font-weight:600">🟡 '+dias+'d</span>';
  return '<span style="font-size:.6rem;color:var(--exito);font-weight:600">🟢 '+dias+'d</span>';
}

// ── Drag & Drop ──────────────────────────────────────────
var TASK_DRAGGING_ID = null;

function task_dragStart(e, taskId) {
  TASK_DRAGGING_ID = taskId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', taskId);
  setTimeout(function() { e.target.classList.add('dragging'); }, 0);
}

function task_dragEnd(e) {
  e.target.classList.remove('dragging');
  TASK_DRAGGING_ID = null;
  document.querySelectorAll('.kanban-col').forEach(function(c) { c.classList.remove('drag-over'); });
}

function task_dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function task_dragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function task_drop(e, nuevoEstadoCol) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  var taskId = e.dataTransfer.getData('text/plain') || TASK_DRAGGING_ID;
  if (!taskId) return;
  var tarea = TASK_DATA.find(function(t) { return t.TASK_ID === taskId; });
  if (!tarea) return;

  if (tarea.estado === nuevoEstadoCol) return;
  if (nuevoEstadoCol === 'Vencida') { toast('Las tareas se vencen automáticamente por fecha', 'warning'); return; }

  var estadoParaValidar = (tarea._col === 'Vencida') ? tarea.estado : tarea.estado;
  var permitidas = TASK_TRANSICIONES_UI[estadoParaValidar] || [];
  // Para tareas vencidas, también permitir moverse a En_proceso
  if (tarea._col === 'Vencida') permitidas = TASK_TRANSICIONES_UI['Vencida'] || [];

  if (permitidas.indexOf(nuevoEstadoCol) === -1) {
    toast('No se puede mover de "'+tarea.estado.replace('_',' ')+'" a "'+nuevoEstadoCol.replace('_',' ')+'"', 'error');
    return;
  }

  if (nuevoEstadoCol === 'Completada' || nuevoEstadoCol === 'Cancelada') {
    task_iniciarCierre(taskId, nuevoEstadoCol);
    return;
  }

  try {
    var res = await api('saveTarea', { TASK_ID: taskId, estado: nuevoEstadoCol });
    if (res.ok) {
      toast('Tarea movida a '+nuevoEstadoCol.replace('_',' '), 'ok');
      await task_cargarTareas();
    } else {
      toast(res.error || 'Error al mover', 'error');
    }
  } catch(err) { toast('Error de conexión', 'error'); }
}

// ── Cierre de tarea (modal rápido) ───────────────────────
function task_iniciarCierre(taskId, nuevoEstado) {
  var tarea = TASK_DATA.find(function(t) { return t.TASK_ID === taskId; });
  if (!tarea) return;
  document.getElementById('cierre-task-id').value      = taskId;
  document.getElementById('cierre-nuevo-estado').value  = nuevoEstado;
  document.getElementById('cierre-desc').textContent    = tarea.descripcion || '';
  document.getElementById('cierre-respuesta').value     = '';
  document.getElementById('cierre-error').style.display = 'none';

  var titulo = nuevoEstado === 'Cancelada' ? 'Cancelar tarea' : 'Completar tarea';
  document.getElementById('task-modal-cierre').querySelector('.modal-title').textContent = titulo;

  var btn = document.getElementById('cierre-btn');
  if (nuevoEstado === 'Cancelada') {
    btn.className = 'btn btn-danger';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Confirmar cancelación';
    document.getElementById('cierre-respuesta').placeholder = 'Explica el motivo de la cancelación...';
  } else {
    btn.className = 'btn btn-verde';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Confirmar cierre';
    document.getElementById('cierre-respuesta').placeholder = 'Describe cómo se resolvió la tarea...';
  }
  document.getElementById('task-modal-cierre').classList.add('active');
  setTimeout(function() { document.getElementById('cierre-respuesta').focus(); }, 200);
}

function task_cerrarModalCierre() {
  document.getElementById('task-modal-cierre').classList.remove('active');
}

async function task_confirmarCierre() {
  var taskId    = document.getElementById('cierre-task-id').value;
  var estado    = document.getElementById('cierre-nuevo-estado').value;
  var respuesta = document.getElementById('cierre-respuesta').value.trim();
  var errEl     = document.getElementById('cierre-error');

  if (!respuesta) {
    errEl.textContent = estado === 'Cancelada' ? 'El motivo de cancelación es obligatorio.' : 'La respuesta de cierre es obligatoria.';
    errEl.style.display = 'block';
    return;
  }

  var btn = document.getElementById('cierre-btn');
  btn.disabled = true;
  var saved = btn.innerHTML;
  btn.textContent = 'Guardando...';

  try {
    var res = await api('saveTarea', {
      TASK_ID: taskId, estado: estado,
      respuesta_cierre: respuesta,
      fecha_cierre: new Date().toISOString().split('T')[0]
    });
    if (res.ok) {
      toast(estado === 'Cancelada' ? 'Tarea cancelada' : 'Tarea completada', 'ok');
      task_cerrarModalCierre();
      await task_cargarTareas();
    } else {
      errEl.textContent = res.error || 'Error al cerrar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Error de conexión';
    errEl.style.display = 'block';
  }
  btn.disabled = false;
  btn.innerHTML = saved;
}

// ── Modal crear / editar ─────────────────────────────────
function task_abrirModal(TASK_ID) {
  TASK_ID = TASK_ID || null;
  document.getElementById('task-error').style.display = 'none';
  document.getElementById('task-cierre-section').style.display = 'none';
  document.getElementById('task-modal-title').textContent = TASK_ID ? 'Editar tarea' : 'Nueva tarea';
  ['task-id','task-descripcion','task-instrucciones','task-respuesta','task-fecha-limite']
    .forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('task-prioridad').value = 'Media';
  document.getElementById('task-cliente').value   = '';
  document.getElementById('task-asignado').value  = '';
  document.getElementById('task-area').value      = '';
  document.getElementById('task-tipo').value      = '';

  var footer = document.getElementById('task-modal-footer');
  footer.innerHTML = '<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>' +
    '<button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar tarea</button>';

  if (TASK_ID) {
    var t = TASK_DATA.find(function(x) { return x.TASK_ID === TASK_ID; });
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

      var estaAbierta = t.estado === 'Pendiente' || t.estado === 'En_proceso' || t.estado === 'Vencida';
      if (t.puede_mover && estaAbierta) {
        document.getElementById('task-cierre-section').style.display = '';
      }

      // Botón "Iniciar tarea" para Pendiente o Vencida
      if (t.puede_mover && (t.estado === 'Pendiente' || t.estado === 'Vencida')) {
        footer.innerHTML = '<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>' +
          '<button class="btn btn-accent" onclick="task_moverEstado(\''+t.TASK_ID+'\',\'En_proceso\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Iniciar tarea</button>' +
          '<button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar</button>';
      }

      if (t.estado === 'Completada' || t.estado === 'Cancelada') {
        document.getElementById('task-modal-title').textContent = 'Tarea ' + (t.estado === 'Completada' ? 'completada' : 'cancelada');
        footer.innerHTML = '<div style="flex:1;font-size:var(--text-sm);color:var(--gris-mid)">' +
          (t.estado === 'Completada' ? '✅' : '❌') + ' Cerrada el '+formatFecha(t.fecha_cierre) +
          (t.respuesta_cierre ? ' — '+t.respuesta_cierre : '') +
          '</div><button class="btn btn-secondary" onclick="task_cerrarModal()">Cerrar</button>';
      }
    }
  }
  document.getElementById('task-modal').classList.add('active');
}

function task_cerrarModal() {
  document.getElementById('task-modal').classList.remove('active');
}

async function task_moverEstado(taskId, nuevoEstado) {
  try {
    var res = await api('saveTarea', { TASK_ID: taskId, estado: nuevoEstado });
    if (res.ok) {
      toast('Tarea movida a ' + nuevoEstado.replace('_',' '), 'ok');
      task_cerrarModal();
      await task_cargarTareas();
    } else {
      toast(res.error || 'Error al mover', 'error');
    }
  } catch(e) { toast('Error de conexión', 'error'); }
}

async function task_guardar() {
  var errEl = document.getElementById('task-error');
  errEl.style.display = 'none';
  var asignado    = document.getElementById('task-asignado')?.value;
  var area        = document.getElementById('task-area')?.value;
  var descripcion = document.getElementById('task-descripcion')?.value.trim();
  var TASK_ID     = document.getElementById('task-id')?.value;

  if (!asignado)    { errEl.textContent = 'Selecciona el funcionario asignado.'; errEl.style.display = 'block'; return; }
  if (!area)        { errEl.textContent = 'Selecciona el área responsable.';     errEl.style.display = 'block'; return; }
  if (!descripcion) { errEl.textContent = 'Escribe una descripción de la tarea.';errEl.style.display = 'block'; return; }

  var esCierre     = document.getElementById('task-cierre-section').style.display !== 'none';
  var estadoCierre = document.getElementById('task-estado-cierre')?.value;
  var respuesta    = document.getElementById('task-respuesta')?.value.trim();

  if (esCierre && estadoCierre && !respuesta) {
    errEl.textContent = 'La respuesta de cierre es obligatoria.';
    errEl.style.display = 'block';
    return;
  }

  var data = {
    TASK_ID:          TASK_ID || undefined,
    CLI_ID:           document.getElementById('task-cliente')?.value || '',
    asignada_a:       asignado,
    area_responsable: area,
    tipo_tarea:       document.getElementById('task-tipo')?.value || '',
    descripcion:      descripcion,
    instrucciones:    document.getElementById('task-instrucciones')?.value.trim() || '',
    prioridad:        document.getElementById('task-prioridad')?.value || 'Media',
    fecha_limite:     document.getElementById('task-fecha-limite')?.value || '',
    creada_por:       APP.user?.id || '',
    estado:           esCierre && estadoCierre ? estadoCierre : (TASK_ID ? undefined : 'Pendiente'),
    respuesta_cierre: esCierre ? respuesta : '',
    fecha_cierre:     esCierre && estadoCierre ? new Date().toISOString().split('T')[0] : ''
  };

  var btn = document.getElementById('task-btn-guardar');
  if (!btn) return;
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    var res = await api('saveTarea', data);
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
