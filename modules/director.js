/**
 * ============================================================
 * ALIANZA CRM — director.js v2.0
 * Panel gerencial con métricas de tareas integradas
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_director = async function() {
  var pc = document.getElementById('page-content');
  pc.innerHTML = '<div class="anim-1" style="margin-bottom:22px">'
    +'<h2 style="font-family:\'Montserrat\',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Panel Gerencial</h2>'
    +'<p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Vista ejecutiva del estado de la operación</p></div>'
    +'<div style="padding:40px;text-align:center" id="dir-loader"><div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>'
    +'<div style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:14px">Cargando datos...</div></div>'
    +'<div id="dir-contenido" style="display:none"></div>';
  await dir_cargarDatos();
};

async function dir_cargarDatos() {
  try {
    var r = await Promise.all([apiGetDashboard(), apiGetClientes(), apiGetFuncionarios(), api('getTareas',{}), api('getGestiones',{})]);
    var dash = r[0].ok ? r[0].data : {};
    var gen = dash.resumen_general || {};
    var cnt = dash.contadores || {};
    var cli = r[1].ok ? (r[1].data || []) : [];
    var func = r[2].ok ? (r[2].data || []) : [];
    var tareas = r[3].ok ? (r[3].data || []) : [];
    var gest = r[4].ok ? (r[4].data || []) : [];
    document.getElementById('dir-loader').style.display = 'none';
    document.getElementById('dir-contenido').style.display = '';
    dir_renderContenido(gen, cnt, cli, func, tareas, gest);
  } catch(e) {
    document.getElementById('dir-loader').innerHTML = '<div style="color:var(--peligro);font-size:var(--text-sm)">Error cargando datos</div>';
  }
}

function dir_renderContenido(gen, cnt, cli, func, tareas, gest) {
  var cont = document.getElementById('dir-contenido');
  var hoy = new Date(), hace30 = new Date(); hace30.setDate(hace30.getDate()-30);
  var hace7 = new Date(); hace7.setDate(hace7.getDate()-7);

  // ── KPIs ──
  var tareasAbiertas = tareas.filter(function(t){return t.estado==='Pendiente'||t.estado==='En_proceso';}).length;
  var tareasComp30 = tareas.filter(function(t){return t.estado==='Completada'&&t.fecha_completada_real&&new Date(t.fecha_completada_real)>=hace30;}).length;
  var tareasVenc = tareas.filter(function(t){return t.estado==='Pendiente'&&t.fecha_limite&&new Date(t.fecha_limite)<hoy;}).length;
  var conFecha = tareas.filter(function(t){return t.estado==='Completada'&&t.fecha_limite;});
  var aTiempo = conFecha.filter(function(t){return t.cumplio_a_tiempo===true;}).length;
  var tasaGlobal = conFecha.length>0 ? Math.round((aTiempo/conFecha.length)*100) : 0;

  var kpis = [
    {n:gen.clientes_activos||0, l:'Clientes activos', co:'azul'},
    {n:gen.lotes_disponibles||0, l:'Lotes disponibles', co:'exito'},
    {n:gen.negocios_activos||0, l:'Negocios activos', co:'navy'},
    {n:gen.negocios_en_mora||0, l:'En mora', co:'peligro'},
    {n:tareasAbiertas, l:'Tareas abiertas', co:'alerta'},
    {n:tareasComp30, l:'Tareas cerradas (30d)', co:'exito'},
    {n:tareasVenc, l:'Tareas vencidas', co:'peligro'},
    {n:tasaGlobal+'%', l:'Cumplimiento tareas', co:'verde'}
  ];

  // ── Pipeline ──
  var pipeline = {};
  cli.forEach(function(c){pipeline[c.estado_pipeline]=(pipeline[c.estado_pipeline]||0)+1;});
  var PIPELINE_COLORS = {'Prospecto':'var(--azul)','Separado':'var(--alerta)','En contrato':'var(--morado)','Al dia':'var(--exito)','En mora':'var(--peligro)','Cancelado':'var(--verde-dark)','Desistido':'var(--gris-mid)'};

  // ── Semáforo por área con datos de tareas ──
  var areasLista = ['Comercial','Juridica','Cartera','TH','Obra','Tesoreria','Administracion'];
  var semaforo = areasLista.map(function(area){
    var funcArea = func.filter(function(f){return f.area===area&&String(f.estado).toLowerCase()==='true';}).length;
    var tareasArea = tareas.filter(function(t){return t.area_responsable===area;});
    var vencidas = tareasArea.filter(function(t){return t.estado==='Pendiente'&&t.fecha_limite&&new Date(t.fecha_limite)<hoy;}).length;
    var enProceso = tareasArea.filter(function(t){return t.estado==='En_proceso';}).length;
    var completadas30 = tareasArea.filter(function(t){return t.estado==='Completada'&&t.fecha_completada_real&&new Date(t.fecha_completada_real)>=hace30;}).length;
    var conF = tareasArea.filter(function(t){return t.estado==='Completada'&&t.fecha_limite;});
    var aT = conF.filter(function(t){return t.cumplio_a_tiempo===true;}).length;
    var tasa = conF.length>0?Math.round((aT/conF.length)*100):'—';

    var semColor='verde',semLabel='Al día';
    if(vencidas>2){semColor='peligro';semLabel='Crítico';}
    else if(vencidas>0){semColor='alerta';semLabel='Atención';}

    return {area:area,funcArea:funcArea,vencidas:vencidas,enProceso:enProceso,completadas30:completadas30,tasa:tasa,semColor:semColor,semLabel:semLabel};
  }).filter(function(s){return s.funcArea>0||s.vencidas>0||s.enProceso>0||s.completadas30>0;});

  // ── Ranking equipo (todas las áreas) ──
  var funcMap = {};
  func.filter(function(f){return String(f.estado).toLowerCase()==='true';}).forEach(function(f){
    funcMap[f.FUNC_ID]={nombre:f.nombre+' '+f.apellido,area:f.area,rol:f.rol,
      asignadas:0,completadas:0,vencidas:0,enProceso:0,
      diasTotal:0,diasCount:0,aTiempo:0,conFecha:0,gestiones30d:0,ultimaAct:null};
  });
  tareas.forEach(function(t){
    var uid=t.asignada_a;if(!funcMap[uid])return;
    funcMap[uid].asignadas++;
    if(t.estado==='Completada'){
      funcMap[uid].completadas++;
      if(t.dias_resolucion_total!==undefined&&t.dias_resolucion_total!==''){funcMap[uid].diasTotal+=Number(t.dias_resolucion_total);funcMap[uid].diasCount++;}
      if(t.fecha_limite){funcMap[uid].conFecha++;if(t.cumplio_a_tiempo===true)funcMap[uid].aTiempo++;}
    }
    if(t.estado==='Pendiente'&&t.fecha_limite&&new Date(t.fecha_limite)<hoy)funcMap[uid].vencidas++;
    if(t.estado==='En_proceso')funcMap[uid].enProceso++;
    try{
      JSON.parse(t.historial||'[]').forEach(function(h){
        if(String(h.func_id)===uid&&h.fecha&&new Date(h.fecha)>=hace30)funcMap[uid].gestiones30d++;
        if(String(h.func_id)===uid&&h.fecha){var fh=new Date(h.fecha);if(!funcMap[uid].ultimaAct||fh>funcMap[uid].ultimaAct)funcMap[uid].ultimaAct=fh;}
      });
    }catch(e){}
  });
  var ranking=Object.values(funcMap).filter(function(r){return r.asignadas>0;});
  ranking.sort(function(a,b){return b.completadas-a.completadas;});
  ranking.forEach(function(r){r.promedio=r.diasCount>0?(r.diasTotal/r.diasCount).toFixed(1):'—';r.tasa=r.conFecha>0?Math.round((r.aTiempo/r.conFecha)*100):'—';});

  // ── Actividad reciente (últimas 15 del historial) ──
  var actividades=[];
  tareas.forEach(function(t){
    try{
      JSON.parse(t.historial||'[]').forEach(function(h){
        if(h.fecha&&h.accion!=='creacion') actividades.push({fecha:h.fecha,func:h.func_nombre||'',accion:h.accion,obs:h.observacion||'',tarea:t.descripcion||'',taskId:t.TASK_ID,
          fecha_anterior:h.fecha_anterior||'',fecha_nueva:h.fecha_nueva||''});
      });
    }catch(e){}
  });
  actividades.sort(function(a,b){return new Date(b.fecha)-new Date(a.fecha);});
  actividades=actividades.slice(0,15);

  var accionLabels={inicio:'Inició',reprogramacion:'Reprogramó',completada:'Completó',cancelada:'Canceló',observacion:'Registró gestión',participante:'Agregó participante'};
  var accionColors={inicio:'var(--azul)',reprogramacion:'var(--alerta)',completada:'var(--exito)',cancelada:'var(--peligro)',observacion:'var(--navy)',participante:'var(--morado)'};

  // ── RENDER ──
  cont.innerHTML = ''
    // KPIs
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    +'<span style="font-family:\'Montserrat\',sans-serif;font-size:var(--text-xs);font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.08em">Indicadores clave</span>'
    +'<div style="flex:1;height:1px;background:var(--gris-borde)"></div>'
    +'<span style="font-size:var(--text-xs);color:var(--gris-mid)">Actualizado: '+new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+'</span></div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;margin-bottom:28px">'
    +kpis.map(function(k){return'<div class="counter-card c-'+k.co+'"><div style="font-family:\'Montserrat\',sans-serif;font-size:1.7rem;font-weight:800;color:var(--oscuro);line-height:1;margin-bottom:5px">'+k.n+'</div><div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500;text-transform:uppercase;letter-spacing:.04em">'+k.l+'</div></div>';}).join('')
    +'</div>'

    // Pipeline + Semáforo
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">'

    // Pipeline
    +'<div class="card"><div class="card-header"><div class="card-title">Pipeline de clientes</div><span style="font-size:var(--text-xs);color:var(--gris-mid)">'+cli.length+' total</span></div>'
    +'<div class="card-body">'
    +(Object.entries(pipeline).length?Object.entries(pipeline).map(function(e){var estado=e[0],n=e[1],pct=Math.round(n/cli.length*100);
      return'<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:var(--text-sm);font-weight:500">'+estado+'</span><span style="font-size:var(--text-sm);color:var(--gris-mid)">'+n+' ('+pct+'%)</span></div>'
        +'<div style="height:6px;background:var(--gris-light);border-radius:var(--r-full);overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+(PIPELINE_COLORS[estado]||'var(--navy)')+';border-radius:var(--r-full)"></div></div></div>';
    }).join(''):'<div class="empty-sub">Sin datos</div>')
    +'</div></div>'

    // Semáforo por área
    +'<div class="card"><div class="card-header"><div class="card-title">Semáforo por área</div></div>'
    +'<div class="card-body" style="padding:0"><table class="table"><thead><tr><th>Área</th><th style="text-align:center">Equipo</th><th style="text-align:center">En proceso</th><th style="text-align:center">Vencidas</th><th style="text-align:center">Cerradas (30d)</th><th style="text-align:center">Cumplimiento</th><th>Estado</th></tr></thead><tbody>'
    +semaforo.map(function(s){
      var tasaBg=s.tasa==='—'?'badge-gris':Number(s.tasa)>=80?'badge-exito':Number(s.tasa)>=50?'badge-alerta':'badge-peligro';
      return'<tr><td style="font-weight:500;font-size:var(--text-sm)">'+s.area+'</td>'
        +'<td style="text-align:center;font-size:var(--text-sm)">'+s.funcArea+'</td>'
        +'<td style="text-align:center"><span class="badge badge-azul">'+s.enProceso+'</span></td>'
        +'<td style="text-align:center">'+(s.vencidas>0?'<span class="badge badge-peligro">'+s.vencidas+'</span>':'<span style="color:var(--gris-mid)">0</span>')+'</td>'
        +'<td style="text-align:center"><span class="badge badge-exito">'+s.completadas30+'</span></td>'
        +'<td style="text-align:center"><span class="badge '+tasaBg+'">'+(s.tasa==='—'?'—':s.tasa+'%')+'</span></td>'
        +'<td><span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:var(--r-full);font-size:var(--text-xs);font-weight:600;background:var(--'+s.semColor+'-light);color:var(--'+s.semColor+')">'
        +(s.semColor==='verde'?'🟢':s.semColor==='alerta'?'🟡':'🔴')+' '+s.semLabel+'</span></td></tr>';
    }).join('')
    +'</tbody></table></div></div></div>'

    // Ranking del equipo
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    +'<span style="font-family:\'Montserrat\',sans-serif;font-size:var(--text-xs);font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.08em">Rendimiento del equipo — últimos 30 días</span>'
    +'<div style="flex:1;height:1px;background:var(--gris-borde)"></div></div>'
    +'<div class="card" style="margin-bottom:28px"><div class="card-body" style="padding:0;overflow-x:auto"><table class="table"><thead><tr>'
    +'<th>Funcionario</th><th style="text-align:center">Asignadas</th><th style="text-align:center">En proceso</th><th style="text-align:center">Completadas</th><th style="text-align:center">Vencidas</th><th style="text-align:center">Gestiones</th><th style="text-align:center">Prom. días</th><th style="text-align:center">Cumplimiento</th><th>Última actividad</th>'
    +'</tr></thead><tbody>'
    +ranking.map(function(r,i){
      var tasaBg=r.tasa==='—'?'badge-gris':Number(r.tasa)>=80?'badge-exito':Number(r.tasa)>=50?'badge-alerta':'badge-peligro';
      var medal=i===0?'🥇 ':i===1?'🥈 ':i===2?'🥉 ':'';
      return'<tr><td><div style="display:flex;align-items:center;gap:8px"><div class="avatar sm">'+getInitials(r.nombre)+'</div><div><div style="font-weight:600;font-size:var(--text-sm)">'+medal+r.nombre+'</div><div style="font-size:var(--text-xs);color:var(--gris-mid)">'+r.area+' · '+r.rol+'</div></div></div></td>'
        +'<td style="text-align:center;font-weight:600">'+r.asignadas+'</td>'
        +'<td style="text-align:center"><span class="badge badge-azul">'+r.enProceso+'</span></td>'
        +'<td style="text-align:center"><span class="badge badge-exito">'+r.completadas+'</span></td>'
        +'<td style="text-align:center">'+(r.vencidas>0?'<span class="badge badge-peligro">'+r.vencidas+'</span>':'<span style="color:var(--gris-mid)">0</span>')+'</td>'
        +'<td style="text-align:center;font-weight:500">'+r.gestiones30d+'</td>'
        +'<td style="text-align:center;font-weight:500">'+(r.promedio==='—'?'—':r.promedio+'d')+'</td>'
        +'<td style="text-align:center"><span class="badge '+tasaBg+'">'+(r.tasa==='—'?'—':r.tasa+'%')+'</span></td>'
        +'<td style="font-size:var(--text-xs);color:var(--gris-mid)">'+(r.ultimaAct?formatFechaHora(r.ultimaAct):'Sin actividad')+'</td></tr>';
    }).join('')
    +'</tbody></table></div></div>'

    // Actividad reciente
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    +'<span style="font-family:\'Montserrat\',sans-serif;font-size:var(--text-xs);font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.08em">Actividad reciente del equipo</span>'
    +'<div style="flex:1;height:1px;background:var(--gris-borde)"></div></div>'
    +'<div class="card" style="margin-bottom:28px"><div class="card-body" style="padding:0">'
    +(actividades.length>0?actividades.map(function(a){
      var label=accionLabels[a.accion]||a.accion;
      var color=accionColors[a.accion]||'var(--gris-mid)';
      return'<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid var(--gris-borde)">'
        +'<div style="width:8px;height:8px;border-radius:50%;background:'+color+';margin-top:5px;flex-shrink:0"></div>'
        +'<div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
        +'<div style="font-size:var(--text-sm)"><strong style="color:var(--oscuro)">'+a.func+'</strong> <span style="color:'+color+';font-weight:600">'+label.toLowerCase()+'</span> <span style="color:var(--gris-mid)">'+a.tarea+'</span></div>'
        +'<span style="font-size:var(--text-xs);color:var(--gris-mid);white-space:nowrap">'+formatFechaHora(a.fecha)+'</span></div>'
        +(a.accion==='reprogramacion'&&a.fecha_anterior?'<div style="font-size:var(--text-xs);color:var(--alerta);margin-top:2px">📅 '+a.fecha_anterior+' → '+a.fecha_nueva+'</div>':'')
        +(a.obs?'<div style="font-size:var(--text-xs);color:var(--gris-mid);margin-top:3px;background:var(--gris-bg);padding:4px 8px;border-radius:var(--r-sm)">'+a.obs+'</div>':'')
        +'</div></div>';
    }).join(''):'<div style="padding:30px;text-align:center;font-size:var(--text-sm);color:var(--gris-mid)">Sin actividad registrada aún — las gestiones aparecerán aquí</div>')
    +'</div></div>'

    // Acciones rápidas
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    +'<span style="font-family:\'Montserrat\',sans-serif;font-size:var(--text-xs);font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.08em">Acciones rápidas</span>'
    +'<div style="flex:1;height:1px;background:var(--gris-borde)"></div></div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="navigateTo(\'clientes\')">Ver clientes</button>'
    +'<button class="btn btn-accent" onclick="navigateTo(\'tareas\')">Ir al Kanban</button>'
    +'<button class="btn btn-secondary" onclick="navigateTo(\'eventos\')">Eventos especiales</button>'
    +'<button class="btn btn-secondary" onclick="navigateTo(\'funcionarios\')">Gestionar equipo</button>'
    +'</div>';
}
