/**
 * ============================================================
 * ALIANZA CRM — tareas.js v3.0
 * Kanban + Métricas + Trazabilidad + Participantes
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

let TASK_DATA=[], TASK_CLI=[], TASK_FUNC=[], TASK_TAB='mias';
const TASK_COLUMNAS=[
  {id:'Pendiente',label:'Pendiente',color:'alerta',icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'},
  {id:'En_proceso',label:'En proceso',color:'azul',icon:'<path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/>'},
  {id:'Completada',label:'Completada',color:'exito',icon:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'},
  {id:'Vencida',label:'Vencida',color:'peligro',icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'}
];
const TASK_TRANS={Pendiente:['En_proceso','Completada','Cancelada'],En_proceso:['Completada','Cancelada'],Vencida:['En_proceso','Completada','Cancelada'],Completada:[],Cancelada:[]};

window.render_tareas=async function(){
  var pc=document.getElementById('page-content');
  pc.innerHTML=`
  <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
    <div>
      <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Tareas</h2>
      <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Tablero Kanban con trazabilidad de gestión</p>
    </div>
    <button class="btn btn-primary" onclick="task_abrirModal()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Nueva tarea
    </button>
  </div>
  <div id="task-metricas" class="anim-2" style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px"></div>
  <div class="anim-2" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap">
    <div class="tabs" style="margin-bottom:0;border-bottom:none">
      <button class="tab-btn active" id="task-tab-mias" onclick="task_cambiarTab('mias')">Mis tareas</button>
      <button class="tab-btn" id="task-tab-asignadas" onclick="task_cambiarTab('asignadas')">Asignadas por mí</button>
      <button class="tab-btn" id="task-tab-todas" onclick="task_cambiarTab('todas')">Todas</button>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <div class="search-bar" style="width:220px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="search-input" id="task-buscar" placeholder="Buscar..." oninput="task_filtrar()">
      </div>
      <select class="form-control" id="task-filtro-prioridad" onchange="task_filtrar()" style="width:130px;padding:8px 10px;font-size:var(--text-xs)"><option value="">Prioridad</option><option value="Alta">Alta</option><option value="Media">Media</option><option value="Baja">Baja</option></select>
      <select class="form-control" id="task-filtro-area" onchange="task_filtrar()" style="width:130px;padding:8px 10px;font-size:var(--text-xs)"><option value="">Área</option></select>
    </div>
  </div>
  <div id="task-kanban" class="anim-3" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:start;min-height:400px">
    <div style="grid-column:1/-1;padding:40px;text-align:center"><div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div></div>
  </div>

  <!-- MODAL PRINCIPAL -->
  <div class="modal-backdrop" id="task-modal">
    <div class="modal" style="max-width:680px">
      <div class="modal-header">
        <div class="modal-title" id="task-modal-title">Nueva tarea</div>
        <button class="modal-close" onclick="task_cerrarModal()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="task-id">
        <input type="hidden" id="task-fecha-original">
        <div class="form-group"><label class="form-label">Cliente relacionado (opcional)</label><select class="form-control" id="task-cliente"><option value="">Sin cliente específico</option></select></div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label req">Asignar a</label><select class="form-control" id="task-asignado"><option value="">Selecciona funcionario</option></select></div>
          <div class="form-group"><label class="form-label req">Área responsable</label><select class="form-control" id="task-area"><option value="">Selecciona área</option></select></div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label req">Tipo de tarea</label><select class="form-control" id="task-tipo"><option value="">Selecciona tipo</option></select></div>
          <div class="form-group"><label class="form-label req">Prioridad</label><select class="form-control" id="task-prioridad"><option value="Media">Media</option><option value="Alta">Alta</option><option value="Baja">Baja</option></select></div>
        </div>
        <div class="form-group"><label class="form-label req">Descripción</label><input type="text" class="form-control" id="task-descripcion" placeholder="¿Qué debe hacer el funcionario?"></div>
        <div class="form-group"><label class="form-label">Instrucciones adicionales</label><textarea class="form-control" id="task-instrucciones" rows="2" placeholder="Contexto o pasos específicos..."></textarea></div>
        <div class="form-group">
          <label class="form-label">Fecha límite</label>
          <input type="date" class="form-control" id="task-fecha-limite" onchange="task_detectarCambioFecha()">
          <div class="form-hint">Si no se define, la tarea no tiene vencimiento</div>
        </div>

        <!-- Observación obligatoria al cambiar fecha -->
        <div id="task-obs-section" style="display:none;padding:14px 16px;background:var(--azul-light);border-radius:var(--r);border:1px solid var(--azul-alpha);margin-top:4px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--azul-dark)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span style="font-size:var(--text-sm);font-weight:600;color:var(--azul-dark)">Observación de reprogramación</span>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <textarea class="form-control" id="task-obs-cambio" rows="2" placeholder="¿Por qué se reprograma? Ej: Cliente pidió más tiempo..."></textarea>
          </div>
        </div>

        <!-- Participantes -->
        <div id="task-participantes-section" style="display:none;margin-top:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:var(--text-sm);font-weight:600;color:var(--oscuro)">Participantes</span>
            <button class="btn btn-ghost btn-sm" onclick="task_toggleAgregarPart()">+ Agregar persona</button>
          </div>
          <div id="task-part-agregar" style="display:none;margin-bottom:10px">
            <div style="display:flex;gap:8px">
              <select class="form-control" id="task-part-func" style="flex:1;font-size:var(--text-xs)"><option value="">Selecciona funcionario</option></select>
              <select class="form-control" id="task-part-rol" style="width:130px;font-size:var(--text-xs)"><option value="Apoyo">Apoyo</option><option value="Responsable">Responsable</option><option value="Ejecutivo comercial">Ejecutivo</option><option value="Jurídico">Jurídico</option><option value="Cartera">Cartera</option></select>
              <button class="btn btn-accent btn-sm" onclick="task_agregarParticipante()">Agregar</button>
            </div>
          </div>
          <div id="task-part-lista"></div>
        </div>

        <!-- Gestión / Registro de actividad -->
        <div id="task-gestion-section" style="display:none;padding:14px 16px;background:var(--navy-light);border-radius:var(--r);border:1px solid var(--navy-alpha);margin-top:8px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span style="font-size:var(--text-sm);font-weight:600;color:var(--navy)">Registro de gestión</span>
          </div>
          <div class="form-group" style="margin-bottom:10px">
            <label class="form-label">Acción</label>
            <select class="form-control" id="task-accion-gestion" onchange="task_cambiarAccionGestion()">
              <option value="en_gestion">En gestión — la tarea continúa</option>
              <option value="Completada">Finalizar como Completada</option>
              <option value="Cancelada">Finalizar como Cancelada</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label req" id="task-obs-label">Observaciones de gestión</label>
            <textarea class="form-control" id="task-respuesta" rows="2" placeholder="Registra qué se hizo, qué respondió el cliente, próximos pasos..."></textarea>
          </div>
        </div>

        <!-- Historial de gestión -->
        <div id="task-historial-section" style="display:none;margin-top:14px">
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--oscuro);margin-bottom:10px">Historial de gestión</div>
          <div id="task-historial-lista"></div>
        </div>

        <div id="task-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
      </div>
      <div class="modal-footer" id="task-modal-footer">
        <button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>
        <button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar tarea</button>
      </div>
    </div>
  </div>

  <!-- MODAL CIERRE RÁPIDO -->
  <div class="modal-backdrop" id="task-modal-cierre">
    <div class="modal" style="max-width:440px">
      <div class="modal-header"><div class="modal-title">Cerrar tarea</div><button class="modal-close" onclick="task_cerrarModalCierre()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="modal-body">
        <input type="hidden" id="cierre-task-id"><input type="hidden" id="cierre-nuevo-estado">
        <div id="cierre-desc" style="font-size:var(--text-sm);color:var(--oscuro);margin-bottom:14px;font-weight:500"></div>
        <div class="form-group" style="margin-bottom:0"><label class="form-label req">Respuesta de cierre</label><textarea class="form-control" id="cierre-respuesta" rows="3" placeholder="Describe cómo se resolvió..."></textarea></div>
        <div id="cierre-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:10px"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="task_cerrarModalCierre()">Cancelar</button><button class="btn btn-verde" id="cierre-btn" onclick="task_confirmarCierre()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Confirmar</button></div>
    </div>
  </div>

  <style>
    .kanban-col{background:var(--gris-surface);border-radius:var(--r-lg);border:1px solid var(--gris-borde);min-height:320px;display:flex;flex-direction:column;transition:border-color .2s,background .2s}
    .kanban-col.drag-over{border-color:var(--azul);background:var(--azul-light);border-style:dashed}
    .kanban-col-header{padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--gris-borde)}
    .kanban-col-title{display:flex;align-items:center;gap:8px;font-family:'Montserrat',sans-serif;font-size:var(--text-sm);font-weight:700}
    .kanban-col-title svg{width:15px;height:15px}
    .kanban-col-count{font-size:var(--text-xs);font-weight:700;padding:2px 8px;border-radius:var(--r-full);min-width:22px;text-align:center}
    .kanban-col-body{flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;max-height:calc(100vh - 340px)}
    .kanban-card{background:var(--blanco);border:1px solid var(--gris-borde);border-radius:var(--r);padding:12px 14px;cursor:default;transition:transform .15s,box-shadow .15s;position:relative}
    .kanban-card.draggable{cursor:grab}.kanban-card.draggable:active{cursor:grabbing}
    .kanban-card.dragging{opacity:.4;transform:rotate(2deg)}
    .kanban-card:hover{box-shadow:var(--sh-sm)}
    .kanban-card.prioridad-alta{border-left:3px solid var(--peligro)}
    .kanban-card.prioridad-media{border-left:3px solid var(--alerta)}
    .kanban-card.prioridad-baja{border-left:3px solid var(--azul)}
    .kanban-card.vencida-pulse{animation:vencidaPulse 2s ease-in-out infinite}
    @keyframes vencidaPulse{0%,100%{border-color:var(--peligro-borde)}50%{border-color:var(--peligro)}}
    .kanban-card-desc{font-size:var(--text-sm);font-weight:500;color:var(--oscuro);line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .kanban-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .kanban-card-actions{position:absolute;top:8px;right:8px;display:flex;gap:2px;opacity:0;transition:opacity .15s}
    .kanban-card:hover .kanban-card-actions{opacity:1}
    .kanban-card-btn{width:26px;height:26px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;color:var(--gris-mid);transition:background .15s,color .15s}
    .kanban-card-btn:hover{background:var(--gris-light);color:var(--oscuro)}
    .kanban-card-btn.btn-completar:hover{background:var(--exito-light);color:var(--exito)}
    .kanban-card-btn.btn-cancelar:hover{background:var(--peligro-light);color:var(--peligro)}
    .hist-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--gris-borde);font-size:var(--text-xs)}
    .hist-item:last-child{border-bottom:none}
    .hist-dot{width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0}
    .hist-dot.creacion{background:var(--azul)}.hist-dot.inicio{background:var(--verde)}
    .hist-dot.reprogramacion{background:var(--alerta)}.hist-dot.completada{background:var(--exito)}
    .hist-dot.cancelada{background:var(--peligro)}.hist-dot.observacion{background:var(--gris-mid)}
    .hist-dot.participante{background:var(--morado)}
    .part-item{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--gris-borde);font-size:var(--text-xs)}
    .part-item:last-child{border-bottom:none}
    @media(max-width:1100px){#task-kanban{grid-template-columns:repeat(2,1fr)!important}}
    @media(max-width:768px){#task-kanban{grid-template-columns:1fr!important}#task-metricas{grid-template-columns:repeat(3,1fr)!important}}
  </style>`;
  await task_cargarDatos();
};

async function task_cargarDatos(){
  try{
    var r=await Promise.all([apiGetClientes(),apiGetFuncionarios()]);
    if(r[0].ok) TASK_CLI=r[0].data||[];
    if(r[1].ok) TASK_FUNC=r[1].data||[];
    task_cargarSelectores();
    await task_cargarTareas();
  }catch(e){console.error(e);}
}
async function task_cargarTareas(){
  var res=await api('getTareas',{});
  TASK_DATA=res.ok?(res.data||[]):[];
  task_renderMetricas();
  task_filtrar();
}
function task_cargarSelectores(){
  var cfg=APP.config||{};
  var areas=(cfg.area||[]).map(function(a){return a.clave;});
  var tipos=cfg.tipo_tarea||[];
  var el;
  el=document.getElementById('task-filtro-area');
  if(el){el.innerHTML='<option value="">Área</option>';areas.forEach(function(a){el.innerHTML+='<option value="'+a+'">'+a+'</option>';});}
  el=document.getElementById('task-area');
  if(el){el.innerHTML='<option value="">Selecciona área</option>';areas.forEach(function(a){el.innerHTML+='<option value="'+a+'">'+a+'</option>';});}
  el=document.getElementById('task-tipo');
  if(el){el.innerHTML='<option value="">Selecciona tipo</option>';tipos.forEach(function(t){el.innerHTML+='<option value="'+t.clave+'">'+t.clave+'</option>';});}
  el=document.getElementById('task-cliente');
  if(el){el.innerHTML='<option value="">Sin cliente específico</option>';TASK_CLI.forEach(function(c){el.innerHTML+='<option value="'+c.CLI_ID+'">'+c.nombres+' '+c.apellidos+' — '+c.cedula_nit+'</option>';});}
  el=document.getElementById('task-asignado');
  if(el){el.innerHTML='<option value="">Selecciona funcionario</option>';TASK_FUNC.filter(function(f){return String(f.estado).toLowerCase()==='true';}).forEach(function(f){el.innerHTML+='<option value="'+f.FUNC_ID+'">'+f.nombre+' '+f.apellido+' — '+f.area+'</option>';});}
  el=document.getElementById('task-part-func');
  if(el){el.innerHTML='<option value="">Selecciona funcionario</option>';TASK_FUNC.filter(function(f){return String(f.estado).toLowerCase()==='true';}).forEach(function(f){el.innerHTML+='<option value="'+f.FUNC_ID+'">'+f.nombre+' '+f.apellido+'</option>';});}
}

// ── Métricas ─────────────────────────────────────────────
function task_renderMetricas(){
  var c=document.getElementById('task-metricas');if(!c)return;
  var uid=APP.user?.id||'',hoy=new Date(),h7=new Date();h7.setDate(h7.getDate()-7);
  var my=TASK_DATA.filter(function(t){return t.asignada_a===uid||t.es_participante;});
  var ab=my.filter(function(t){return t.estado==='Pendiente'||t.estado==='En_proceso'||t.estado==='Vencida';}).length;
  var cs=my.filter(function(t){return t.estado==='Completada'&&t.fecha_completada_real&&new Date(t.fecha_completada_real)>=h7;}).length;
  var ve=my.filter(function(t){return t.estado==='Vencida'||(t.estado==='Pendiente'&&t.fecha_limite&&new Date(t.fecha_limite)<hoy);}).length;
  var re=my.filter(function(t){return t.dias_resolucion_total!==undefined&&t.dias_resolucion_total!==''&&t.estado==='Completada';});
  var pr=re.length>0?(re.reduce(function(s,t){return s+Number(t.dias_resolucion_total);},0)/re.length).toFixed(1):'—';
  var ce=my.filter(function(t){return t.estado==='Completada'&&t.fecha_limite;});
  var at=ce.filter(function(t){return t.cumplio_a_tiempo===true;}).length;
  var ta=ce.length>0?Math.round((at/ce.length)*100):'—';
  var items=[
    {n:ab,l:'Abiertas',co:'azul',ic:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'},
    {n:cs,l:'Cerradas (7d)',co:'exito',ic:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'},
    {n:ve,l:'Vencidas',co:'peligro',ic:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'},
    {n:pr==='—'?'—':pr+'d',l:'Resolución prom.',co:'navy',ic:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'},
    {n:ta==='—'?'—':ta+'%',l:'Cumplimiento',co:'verde',ic:'<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>'}
  ];
  c.innerHTML=items.map(function(m){return'<div class="counter-card c-'+m.co+'"><div class="counter-icon c-'+m.co+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+m.ic+'</svg></div><div style="font-family:\'Montserrat\',sans-serif;font-size:1.6rem;font-weight:800;color:var(--oscuro);line-height:1;margin-bottom:4px">'+m.n+'</div><div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500">'+m.l+'</div></div>';}).join('');
}

// ── Tabs y filtros ───────────────────────────────────────
function task_cambiarTab(t){TASK_TAB=t;['mias','asignadas','todas'].forEach(function(x){var e=document.getElementById('task-tab-'+x);if(e)e.classList.toggle('active',x===t);});task_filtrar();}

function task_filtrar(){
  var q=(document.getElementById('task-buscar')?.value||'').toLowerCase();
  var pr=document.getElementById('task-filtro-prioridad')?.value||'';
  var ar=document.getElementById('task-filtro-area')?.value||'';
  var uid=APP.user?.id||'';
  var data=TASK_DATA.slice();
  if(TASK_TAB==='mias') data=data.filter(function(t){return t.asignada_a===uid||t.es_participante;});
  if(TASK_TAB==='asignadas') data=data.filter(function(t){return t.creada_por===uid&&t.asignada_a!==uid;});
  data=data.filter(function(t){
    var cli=TASK_CLI.find(function(c){return c.CLI_ID===t.CLI_ID;});
    var nm=cli?(cli.nombres+' '+cli.apellidos).toLowerCase():'';
    return(!q||nm.indexOf(q)>=0||(t.descripcion||'').toLowerCase().indexOf(q)>=0)&&(!pr||t.prioridad===pr)&&(!ar||t.area_responsable===ar);
  });
  data=data.filter(function(t){return t.estado!=='Cancelada';});
  task_renderKanban(data);
}

// ── Kanban ───────────────────────────────────────────────
function task_renderKanban(data){
  var board=document.getElementById('task-kanban');if(!board)return;
  var hoy=new Date();
  data.forEach(function(t){
    t._col=(t.estado==='Pendiente'&&t.fecha_limite&&new Date(t.fecha_limite)<hoy)?'Vencida':t.estado;
  });
  var colorMap={alerta:'--alerta',azul:'--azul',exito:'--exito',peligro:'--peligro'};
  var bgMap={alerta:'var(--alerta-light)',azul:'var(--azul-light)',exito:'var(--exito-light)',peligro:'var(--peligro-light)'};
  var fgMap={alerta:'var(--alerta)',azul:'var(--azul-dark)',exito:'var(--exito)',peligro:'var(--peligro)'};
  board.innerHTML=TASK_COLUMNAS.map(function(col){
    var cards=data.filter(function(t){return t._col===col.id;});
    return'<div class="kanban-col" ondragover="task_dragOver(event)" ondragleave="task_dragLeave(event)" ondrop="task_drop(event,\''+col.id+'\')">'
      +'<div class="kanban-col-header"><div class="kanban-col-title" style="color:var('+colorMap[col.color]+')">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+col.icon+'</svg>'+col.label
      +'</div><span class="kanban-col-count" style="background:'+bgMap[col.color]+';color:'+fgMap[col.color]+'">'+cards.length+'</span></div>'
      +'<div class="kanban-col-body">'
      +(cards.length===0?'<div style="padding:20px 10px;text-align:center;color:var(--gris-borde);font-size:var(--text-xs)">Sin tareas</div>'
        :cards.map(function(t){return task_renderCard(t,col.id);}).join(''))
      +'</div></div>';
  }).join('');
}

function task_renderCard(t,colId){
  var cli=TASK_CLI.find(function(c){return c.CLI_ID===t.CLI_ID;});
  var asig=TASK_FUNC.find(function(f){return f.FUNC_ID===t.asignada_a;});
  var drag=t.puede_mover&&colId!=='Completada';
  var esV=colId==='Vencida';
  var pC=t.puede_mover&&(t.estado==='En_proceso'||esV);
  var pX=t.puede_mover&&t.estado!=='Completada'&&t.estado!=='Cancelada';
  var nPart=(t.participantes||[]).length;
  var h='<div class="kanban-card '+(drag?'draggable':'')+' prioridad-'+(t.prioridad||'media').toLowerCase()+' '+(esV?'vencida-pulse':'')+'"';
  if(drag)h+=' draggable="true" ondragstart="task_dragStart(event,\''+t.TASK_ID+'\')" ondragend="task_dragEnd(event)"';
  h+=' data-task-id="'+t.TASK_ID+'">';
  h+='<div class="kanban-card-actions">';
  if(pC)h+='<button class="kanban-card-btn btn-completar" onclick="task_iniciarCierre(\''+t.TASK_ID+'\',\'Completada\')" title="Completar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>';
  h+='<button class="kanban-card-btn" onclick="task_abrirModal(\''+t.TASK_ID+'\')" title="Editar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>';
  if(pX)h+='<button class="kanban-card-btn btn-cancelar" onclick="task_iniciarCierre(\''+t.TASK_ID+'\',\'Cancelada\')" title="Cancelar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  h+='</div>';
  h+='<div class="kanban-card-desc">'+(t.descripcion||'—')+'</div><div class="kanban-card-meta">';
  if(asig)h+='<div style="display:flex;align-items:center;gap:5px"><div class="avatar sm">'+getInitials((asig.nombre||'')+' '+(asig.apellido||''))+'</div><span style="font-size:var(--text-xs);color:var(--gris-mid)">'+(asig.nombre||'')+'</span></div>';
  h+='<span class="badge '+(t.prioridad==='Alta'?'badge-peligro':t.prioridad==='Baja'?'badge-azul':'badge-alerta')+'" style="font-size:.6rem;padding:2px 7px">'+(t.prioridad||'—')+'</span>';
  if(cli)h+='<span style="font-size:var(--text-xs);color:var(--gris-mid)">👤 '+(cli.nombres?.split(' ')[0]||'')+'</span>';
  if(t.fecha_limite)h+=task_semaforo(t.fecha_limite,t.estado);
  if(nPart>0)h+='<span style="font-size:.6rem;color:var(--morado);font-weight:600">👥 '+(nPart+1)+'</span>';
  h+='</div>';
  if(t.dias_resolucion_total!==undefined&&t.dias_resolucion_total!==''&&t.estado==='Completada')h+='<div style="margin-top:6px;font-size:.6rem;color:var(--gris-mid)">Resuelta en '+t.dias_resolucion_total+'d</div>';
  return h+'</div>';
}

function task_semaforo(f,e){
  if(e==='Completada'||e==='Cancelada')return'';if(!f)return'';
  var d=Math.ceil((new Date(f)-new Date())/86400000);
  if(d<0)return'<span style="font-size:.6rem;color:var(--peligro);font-weight:600">🔴 '+Math.abs(d)+'d</span>';
  if(d===0)return'<span style="font-size:.6rem;color:var(--alerta);font-weight:600">🟡 Hoy</span>';
  if(d<=2)return'<span style="font-size:.6rem;color:var(--alerta);font-weight:600">🟡 '+d+'d</span>';
  return'<span style="font-size:.6rem;color:var(--exito);font-weight:600">🟢 '+d+'d</span>';
}

// ── Drag & Drop ──────────────────────────────────────────
var TASK_DID=null;
function task_dragStart(e,id){TASK_DID=id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);setTimeout(function(){e.target.classList.add('dragging');},0);}
function task_dragEnd(e){e.target.classList.remove('dragging');TASK_DID=null;document.querySelectorAll('.kanban-col').forEach(function(c){c.classList.remove('drag-over');});}
function task_dragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.classList.add('drag-over');}
function task_dragLeave(e){e.currentTarget.classList.remove('drag-over');}

async function task_drop(e,col){
  e.preventDefault();e.currentTarget.classList.remove('drag-over');
  var id=e.dataTransfer.getData('text/plain')||TASK_DID;if(!id)return;
  var t=TASK_DATA.find(function(x){return x.TASK_ID===id;});if(!t)return;
  if(t.estado===col)return;
  if(col==='Vencida'){toast('Las tareas se vencen automáticamente','warning');return;}
  var perm=t._col==='Vencida'?TASK_TRANS['Vencida']:(TASK_TRANS[t.estado]||[]);
  if(perm.indexOf(col)===-1){toast('No se puede mover de "'+t.estado.replace('_',' ')+'" a "'+col.replace('_',' ')+'"','error');return;}
  if(col==='Completada'||col==='Cancelada'){task_iniciarCierre(id,col);return;}
  try{var r=await api('saveTarea',{TASK_ID:id,estado:col});if(r.ok){toast('Tarea movida a '+col.replace('_',' '),'ok');await task_cargarTareas();}else toast(r.error||'Error','error');}catch(x){toast('Error de conexión','error');}
}

// ── Cierre rápido ────────────────────────────────────────
function task_iniciarCierre(id,est){
  var t=TASK_DATA.find(function(x){return x.TASK_ID===id;});if(!t)return;
  document.getElementById('cierre-task-id').value=id;
  document.getElementById('cierre-nuevo-estado').value=est;
  document.getElementById('cierre-desc').textContent=t.descripcion||'';
  document.getElementById('cierre-respuesta').value='';
  document.getElementById('cierre-error').style.display='none';
  var m=document.getElementById('task-modal-cierre');
  m.querySelector('.modal-title').textContent=est==='Cancelada'?'Cancelar tarea':'Completar tarea';
  var b=document.getElementById('cierre-btn');
  if(est==='Cancelada'){b.className='btn btn-danger';b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Confirmar cancelación';document.getElementById('cierre-respuesta').placeholder='Motivo de cancelación...';}
  else{b.className='btn btn-verde';b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Confirmar cierre';document.getElementById('cierre-respuesta').placeholder='Describe cómo se resolvió...';}
  m.classList.add('active');setTimeout(function(){document.getElementById('cierre-respuesta').focus();},200);
}
function task_cerrarModalCierre(){document.getElementById('task-modal-cierre').classList.remove('active');}
async function task_confirmarCierre(){
  var id=document.getElementById('cierre-task-id').value,est=document.getElementById('cierre-nuevo-estado').value;
  var resp=document.getElementById('cierre-respuesta').value.trim(),err=document.getElementById('cierre-error');
  if(!resp){err.textContent=est==='Cancelada'?'El motivo es obligatorio.':'La respuesta es obligatoria.';err.style.display='block';return;}
  var b=document.getElementById('cierre-btn');b.disabled=true;var sv=b.innerHTML;b.textContent='Guardando...';
  try{var r=await api('saveTarea',{TASK_ID:id,estado:est,respuesta_cierre:resp,fecha_cierre:new Date().toISOString().split('T')[0]});
    if(r.ok){toast(est==='Cancelada'?'Tarea cancelada':'Tarea completada','ok');task_cerrarModalCierre();await task_cargarTareas();}
    else{err.textContent=r.error||'Error';err.style.display='block';}
  }catch(x){err.textContent='Error de conexión';err.style.display='block';}
  b.disabled=false;b.innerHTML=sv;
}

// ── Detectar cambio de fecha ─────────────────────────────
function task_detectarCambioFecha(){
  var orig=document.getElementById('task-fecha-original').value;
  var nueva=document.getElementById('task-fecha-limite').value;
  var sec=document.getElementById('task-obs-section');
  if(!sec)return;
  if(orig&&nueva&&nueva!==orig){sec.style.display='';} else{sec.style.display='none';}
}

// ── Cambiar visual según acción de gestión ───────────────
function task_cambiarAccionGestion(){
  var accion=document.getElementById('task-accion-gestion').value;
  var sec=document.getElementById('task-gestion-section');
  var label=document.getElementById('task-obs-label');
  var ta=document.getElementById('task-respuesta');
  var footer=document.getElementById('task-modal-footer');
  var TID=document.getElementById('task-id').value;

  if(accion==='en_gestion'){
    sec.style.background='var(--navy-light)';sec.style.borderColor='var(--navy-alpha)';
    if(label)label.textContent='Observaciones de gestión';
    if(ta)ta.placeholder='Registra qué se hizo, qué respondió el cliente, próximos pasos...';
    footer.innerHTML='<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>'
      +'<button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Guardar gestión</button>';
  } else if(accion==='Completada'){
    sec.style.background='var(--verde-light)';sec.style.borderColor='var(--verde-alpha)';
    if(label)label.textContent='Respuesta de cierre';
    if(ta)ta.placeholder='Describe cómo se resolvió la tarea...';
    footer.innerHTML='<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>'
      +'<button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Guardar</button>'
      +'<button class="btn btn-verde" onclick="task_guardar()" style="margin-left:4px">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Cerrar tarea</button>';
  } else {
    sec.style.background='var(--peligro-light)';sec.style.borderColor='var(--peligro-borde)';
    if(label)label.textContent='Motivo de cancelación';
    if(ta)ta.placeholder='Explica por qué se cancela esta tarea...';
    footer.innerHTML='<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>'
      +'<button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Guardar</button>'
      +'<button class="btn btn-danger" onclick="task_guardar()" style="margin-left:4px">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancelar tarea</button>';
  }
}

// ── Participantes ────────────────────────────────────────
function task_toggleAgregarPart(){
  var el=document.getElementById('task-part-agregar');
  el.style.display=el.style.display==='none'?'':'none';
}
async function task_agregarParticipante(){
  var taskId=document.getElementById('task-id').value;
  var funcId=document.getElementById('task-part-func').value;
  var rol=document.getElementById('task-part-rol').value;
  if(!taskId||!funcId){toast('Selecciona un funcionario','error');return;}
  try{
    var r=await apiSaveParticipante({entidad_tipo:'TASK',entidad_id:taskId,FUNC_ID:funcId,rol_proceso:rol});
    if(r.ok){toast('Participante agregado','ok');await task_cargarTareas();task_renderParticipantes(taskId);}
    else toast(r.error||'Error','error');
  }catch(x){toast('Error de conexión','error');}
}
async function task_quitarParticipante(partId,taskId){
  if(!confirm('¿Quitar este participante?'))return;
  try{var r=await apiDeleteParticipante(partId);if(r.ok){toast('Participante removido','ok');await task_cargarTareas();task_renderParticipantes(taskId);}else toast(r.error||'Error','error');}catch(x){toast('Error','error');}
}
function task_renderParticipantes(taskId){
  var t=TASK_DATA.find(function(x){return x.TASK_ID===taskId;});
  var lista=document.getElementById('task-part-lista');if(!lista)return;
  var parts=t?t.participantes||[]:[];
  if(parts.length===0){lista.innerHTML='<div style="font-size:var(--text-xs);color:var(--gris-mid);padding:6px 0">Solo el asignado principal</div>';return;}
  lista.innerHTML=parts.map(function(p){
    return'<div class="part-item"><div style="display:flex;align-items:center;gap:8px"><div class="avatar sm">'+getInitials(p.nombre)+'</div><div><div style="font-weight:500;color:var(--oscuro)">'+p.nombre+'</div><div style="color:var(--gris-mid)">'+p.area+' · '+p.rol_proceso+'</div></div></div>'
      +'<button class="btn btn-ghost btn-sm" onclick="task_quitarParticipante(\''+p.PART_ID+'\',\''+taskId+'\')" style="color:var(--peligro)">✕</button></div>';
  }).join('');
}

// ── Historial ────────────────────────────────────────────
function task_renderHistorial(taskId){
  var t=TASK_DATA.find(function(x){return x.TASK_ID===taskId;});
  var sec=document.getElementById('task-historial-section');
  var lista=document.getElementById('task-historial-lista');
  if(!sec||!lista)return;
  var hist=[];
  try{hist=JSON.parse(t?.historial||'[]');}catch(e){hist=[];}
  if(hist.length===0){sec.style.display='none';return;}
  sec.style.display='';
  lista.innerHTML=hist.slice().reverse().map(function(h){
    var accionLabel={creacion:'Tarea creada',inicio:'Iniciada',reprogramacion:'Reprogramada',completada:'Completada',cancelada:'Cancelada',observacion:'Observación',participante:'Participante agregado'};
    var label=accionLabel[h.accion]||h.accion;
    var detalle='';
    if(h.accion==='reprogramacion'&&h.fecha_anterior)detalle='<div style="color:var(--alerta)">'+h.fecha_anterior+' → '+h.fecha_nueva+'</div>';
    return'<div class="hist-item"><div class="hist-dot '+(h.accion||'observacion')+'"></div><div style="flex:1"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;color:var(--oscuro)">'+label+'</span><span style="color:var(--gris-mid)">'+formatFechaHora(h.fecha)+'</span></div>'
      +'<div style="color:var(--gris-mid);margin-top:2px">'+h.func_nombre+'</div>'
      +detalle
      +(h.observacion?'<div style="margin-top:4px;color:var(--oscuro);background:var(--gris-bg);padding:6px 10px;border-radius:var(--r-sm)">'+h.observacion+'</div>':'')
      +'</div></div>';
  }).join('');
}

// ── Modal principal ──────────────────────────────────────
function task_abrirModal(TASK_ID){
  TASK_ID=TASK_ID||null;
  document.getElementById('task-error').style.display='none';
  document.getElementById('task-gestion-section').style.display='none';
  document.getElementById('task-obs-section').style.display='none';
  document.getElementById('task-historial-section').style.display='none';
  document.getElementById('task-participantes-section').style.display='none';
  document.getElementById('task-modal-title').textContent=TASK_ID?'Editar tarea':'Nueva tarea';
  ['task-id','task-descripcion','task-instrucciones','task-respuesta','task-fecha-limite','task-fecha-original','task-obs-cambio'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('task-prioridad').value='Media';
  document.getElementById('task-cliente').value='';
  document.getElementById('task-asignado').value='';
  document.getElementById('task-area').value='';
  document.getElementById('task-tipo').value='';

  var footer=document.getElementById('task-modal-footer');
  footer.innerHTML='<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button><button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar tarea</button>';

  if(TASK_ID){
    var t=TASK_DATA.find(function(x){return x.TASK_ID===TASK_ID;});
    if(t){
      document.getElementById('task-id').value=t.TASK_ID;
      document.getElementById('task-cliente').value=t.CLI_ID||'';
      document.getElementById('task-asignado').value=t.asignada_a||'';
      document.getElementById('task-area').value=t.area_responsable||'';
      document.getElementById('task-tipo').value=t.tipo_tarea||'';
      document.getElementById('task-descripcion').value=t.descripcion||'';
      document.getElementById('task-instrucciones').value=t.instrucciones||'';
      document.getElementById('task-prioridad').value=t.prioridad||'Media';
      var fl=t.fecha_limite?String(t.fecha_limite).split('T')[0]:'';
      document.getElementById('task-fecha-limite').value=fl;
      document.getElementById('task-fecha-original').value=fl;

      var abierta=t.estado==='Pendiente'||t.estado==='En_proceso'||t.estado==='Vencida';
      if(t.puede_mover&&abierta){
        document.getElementById('task-gestion-section').style.display='';
        document.getElementById('task-accion-gestion').value='en_gestion';
        task_cambiarAccionGestion();
      }

      // Botón Iniciar para Pendiente/Vencida
      if(t.puede_mover&&(t.estado==='Pendiente'||t.estado==='Vencida')){
        footer.innerHTML='<button class="btn btn-secondary" onclick="task_cerrarModal()">Cancelar</button>'
          +'<button class="btn btn-accent" onclick="task_moverEstado(\''+t.TASK_ID+'\',\'En_proceso\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Iniciar tarea</button>'
          +'<button class="btn btn-primary" id="task-btn-guardar" onclick="task_guardar()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar</button>';
      }

      // Participantes y historial
      document.getElementById('task-participantes-section').style.display='';
      task_renderParticipantes(TASK_ID);
      task_renderHistorial(TASK_ID);

      // Tarea cerrada = modo lectura
      if(t.estado==='Completada'||t.estado==='Cancelada'){
        document.getElementById('task-modal-title').textContent='Tarea '+(t.estado==='Completada'?'completada':'cancelada');
        document.getElementById('task-gestion-section').style.display='none';
        footer.innerHTML='<div style="flex:1;font-size:var(--text-sm);color:var(--gris-mid)">'+(t.estado==='Completada'?'✅':'❌')+' Cerrada el '+formatFecha(t.fecha_cierre)+(t.respuesta_cierre?' — '+t.respuesta_cierre:'')+'</div><button class="btn btn-secondary" onclick="task_cerrarModal()">Cerrar</button>';
      }
    }
  }
  document.getElementById('task-modal').classList.add('active');
}
function task_cerrarModal(){document.getElementById('task-modal').classList.remove('active');}

async function task_moverEstado(id,est){
  try{var r=await api('saveTarea',{TASK_ID:id,estado:est});if(r.ok){toast('Tarea movida a '+est.replace('_',' '),'ok');task_cerrarModal();await task_cargarTareas();}else toast(r.error||'Error','error');}catch(x){toast('Error','error');}
}

async function task_guardar(){
  var err=document.getElementById('task-error');err.style.display='none';
  var asig=document.getElementById('task-asignado')?.value;
  var area=document.getElementById('task-area')?.value;
  var desc=document.getElementById('task-descripcion')?.value.trim();
  var TID=document.getElementById('task-id')?.value;
  if(!asig){err.textContent='Selecciona el funcionario asignado.';err.style.display='block';return;}
  if(!area){err.textContent='Selecciona el área responsable.';err.style.display='block';return;}
  if(!desc){err.textContent='Escribe una descripción.';err.style.display='block';return;}

  var esGestion=document.getElementById('task-gestion-section').style.display!=='none';
  var accionGestion=document.getElementById('task-accion-gestion')?.value||'';
  var resp=document.getElementById('task-respuesta')?.value.trim();
  if(esGestion&&!resp){err.textContent='Las observaciones son obligatorias.';err.style.display='block';return;}

  // Observación de reprogramación
  var obsCambio=document.getElementById('task-obs-cambio')?.value.trim()||'';
  var fechaOrig=document.getElementById('task-fecha-original')?.value||'';
  var fechaNueva=document.getElementById('task-fecha-limite')?.value||'';
  if(TID&&fechaOrig&&fechaNueva&&fechaNueva!==fechaOrig&&!obsCambio){
    err.textContent='La observación es obligatoria al cambiar la fecha límite.';err.style.display='block';return;
  }

  // Determinar estado según acción
  var estadoFinal=undefined;
  if(esGestion){
    if(accionGestion==='Completada'||accionGestion==='Cancelada') estadoFinal=accionGestion;
    // en_gestion no cambia estado, solo registra observación
  }

  var data={
    TASK_ID:TID||undefined,CLI_ID:document.getElementById('task-cliente')?.value||'',
    asignada_a:asig,area_responsable:area,
    tipo_tarea:document.getElementById('task-tipo')?.value||'',
    descripcion:desc,instrucciones:document.getElementById('task-instrucciones')?.value.trim()||'',
    prioridad:document.getElementById('task-prioridad')?.value||'Media',
    fecha_limite:fechaNueva,creada_por:APP.user?.id||'',
    estado:estadoFinal||(TID?undefined:'Pendiente'),
    respuesta_cierre:estadoFinal?resp:'',
    fecha_cierre:estadoFinal?new Date().toISOString().split('T')[0]:'',
    observacion_cambio:obsCambio||(esGestion&&accionGestion==='en_gestion'?resp:'')
  };

  var btn=document.getElementById('task-btn-guardar');if(!btn)return;
  btn.disabled=true;btn.textContent='Guardando...';
  try{var r=await api('saveTarea',data);if(r.ok){toast(TID?'Tarea actualizada':'Tarea creada','ok');task_cerrarModal();await task_cargarTareas();}else{err.textContent=r.error||'Error';err.style.display='block';}}catch(x){err.textContent='Error de conexión';err.style.display='block';}
  btn.disabled=false;btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar tarea';
}
