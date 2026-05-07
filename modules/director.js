/**
 * ============================================================
 * ALIANZA CRM — director.js
 * Panel gerencial con semáforo global por área
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_director = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="margin-bottom:22px">
      <h2 style="font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:700;color:var(--oscuro)">Panel Gerencial</h2>
      <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Vista ejecutiva del estado de la operación</p>
    </div>

    <div style="padding:40px;text-align:center" id="dir-loader">
      <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
      <div style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:14px">Cargando datos...</div>
    </div>

    <div id="dir-contenido" style="display:none"></div>`;

  await dir_cargarDatos();
};

async function dir_cargarDatos() {
  try {
    const [dashRes, cliRes, funcRes, tareasRes, gestRes] = await Promise.all([
      apiGetDashboard(),
      apiGetClientes(),
      apiGetFuncionarios(),
      api('getTareas', {}),
      api('getGestiones', {})
    ]);

    const dash   = dashRes.ok  ? dashRes.data  : {};
    const gen    = dash.resumen_general || {};
    const cnt    = dash.contadores      || {};
    const cli    = cliRes.ok   ? (cliRes.data   || []) : [];
    const func   = funcRes.ok  ? (funcRes.data  || []) : [];
    const tareas = tareasRes.ok ? (tareasRes.data || []) : [];
    const gest   = gestRes.ok  ? (gestRes.data   || []) : [];

    document.getElementById('dir-loader').style.display = 'none';
    document.getElementById('dir-contenido').style.display = '';

    dir_renderContenido(gen, cnt, cli, func, tareas, gest);
  } catch(e) {
    document.getElementById('dir-loader').innerHTML = `
      <div style="color:var(--peligro);font-size:var(--text-sm)">Error cargando datos del panel</div>`;
  }
}

function dir_renderContenido(gen, cnt, cli, func, tareas, gest) {
  const cont = document.getElementById('dir-contenido');

  // ── KPIs principales ──
  const kpis = [
    { num: gen.total_clientes    || 0, label: 'Clientes totales',   color: 'c-navy'   },
    { num: gen.clientes_activos  || 0, label: 'Clientes activos',   color: 'c-azul'   },
    { num: gen.lotes_disponibles || 0, label: 'Lotes disponibles',  color: 'c-exito'  },
    { num: gen.lotes_vendidos    || 0, label: 'Lotes vendidos',     color: 'c-navy'   },
    { num: gen.negocios_activos  || 0, label: 'Negocios activos',   color: 'c-azul'   },
    { num: gen.negocios_en_mora  || 0, label: 'En mora',            color: 'c-peligro'},
    { num: gen.sc_congelados     || 0, label: 'Saldos congelados',  color: 'c-alerta' },
    { num: gen.tareas_vencidas_total || 0, label: 'Tareas vencidas',color: 'c-peligro'}
  ];

  // ── Pipeline clientes ──
  const pipeline = {};
  cli.forEach(c => { pipeline[c.estado_pipeline] = (pipeline[c.estado_pipeline] || 0) + 1; });

  // ── Semáforo por área ──
  const areas = ['Comercial','Juridica','Cartera','TH','Obra','Tesoreria'];
  const semaforo = areas.map(area => {
    const funcArea    = func.filter(f => f.area === area && String(f.estado).toLowerCase() === 'true');
    const tareasArea  = tareas.filter(t => t.area_responsable === area);
    const vencidas    = tareasArea.filter(t => t.estado === 'Vencida').length;
    const pendientes  = tareasArea.filter(t => t.estado === 'Pendiente').length;
    const hoy         = new Date();
    const limiteSin   = new Date(); limiteSin.setDate(limiteSin.getDate() - 15);
    const sinGestion  = cli.filter(c => {
      const ej = func.find(f => f.area === area && f.FUNC_ID === c.ejecutivo_asignado);
      if (!ej) return false;
      const ultimas = gest.filter(g => g.CLI_ID === c.CLI_ID);
      if (!ultimas.length) return true;
      const ultima = new Date(Math.max(...ultimas.map(g => new Date(g.fecha_hora_gestion))));
      return ultima < limiteSin;
    }).length;

    let semColor = 'verde';
    let semLabel = 'Al día';
    if (vencidas > 0 || sinGestion > 3) { semColor = 'peligro'; semLabel = 'Atención'; }
    else if (pendientes > 5 || sinGestion > 0) { semColor = 'alerta'; semLabel = 'Revisar'; }

    return { area, funcArea: funcArea.length, vencidas, pendientes, sinGestion, semColor, semLabel };
  });

  // ── Productividad por ejecutivo ──
  const comerciales = func.filter(f => f.area === 'Comercial' && String(f.estado).toLowerCase() === 'true');
  const prodEjec = comerciales.map(f => {
    const misClientes = cli.filter(c => c.ejecutivo_asignado === f.FUNC_ID);
    const misGest     = gest.filter(g => g.FUNC_ID === f.FUNC_ID);
    const misGestMes  = misGest.filter(g => {
      const fecha = new Date(g.fecha_hora_gestion);
      const ahora = new Date();
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    });
    return {
      nombre:   f.nombre + ' ' + f.apellido,
      clientes: misClientes.length,
      gestiones: misGestMes.length,
      activos:  misClientes.filter(c => !['Cancelado','Desistido'].includes(c.estado_pipeline)).length
    };
  }).sort((a, b) => b.gestiones - a.gestiones);

  const PIPELINE_COLORS = {
    'Prospecto':'var(--azul)','Separado':'var(--alerta)','En contrato':'var(--morado)',
    'Al dia':'var(--exito)','En mora':'var(--peligro)','Cancelado':'var(--verde-dark)',
    'Desistido':'var(--gris-mid)'
  };

  cont.innerHTML = `
    <!-- KPIs -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <span style="font-family:'Montserrat',sans-serif;font-size:var(--text-xs);font-weight:700;
                   color:var(--navy);text-transform:uppercase;letter-spacing:.08em">Indicadores clave</span>
      <div style="flex:1;height:1px;background:var(--gris-borde)"></div>
      <span style="font-size:var(--text-xs);color:var(--gris-mid)">
        Actualizado: ${new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:28px">
      ${kpis.map(k => `
        <div class="counter-card ${k.color}">
          <div style="font-family:'Montserrat',sans-serif;font-size:1.8rem;font-weight:800;
                      color:var(--oscuro);line-height:1;margin-bottom:5px">${k.num}</div>
          <div style="font-size:var(--text-xs);color:var(--gris-mid);font-weight:500;
                      text-transform:uppercase;letter-spacing:.04em">${k.label}</div>
        </div>`).join('')}
    </div>

    <!-- Pipeline + Semáforo -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">

      <!-- Pipeline -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Pipeline de clientes</div>
          <span style="font-size:var(--text-xs);color:var(--gris-mid)">${cli.length} total</span>
        </div>
        <div class="card-body">
          ${Object.entries(pipeline).length ? Object.entries(pipeline).map(([estado, n]) => {
            const pct = Math.round(n / cli.length * 100);
            return `
              <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:var(--text-sm);font-weight:500">${estado}</span>
                  <span style="font-size:var(--text-sm);color:var(--gris-mid)">${n} (${pct}%)</span>
                </div>
                <div style="height:6px;background:var(--gris-light);border-radius:var(--r-full);overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:${PIPELINE_COLORS[estado]||'var(--navy)'};
                              border-radius:var(--r-full);transition:width .6s ease"></div>
                </div>
              </div>`;
          }).join('') : '<div class="empty-sub">Sin datos de pipeline</div>'}
        </div>
      </div>

      <!-- Semáforo áreas -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Semáforo por área</div>
        </div>
        <div class="card-body" style="padding:0">
          <table class="table">
            <thead>
              <tr>
                <th>Área</th>
                <th>Funcionarios</th>
                <th>T. vencidas</th>
                <th>Sin gestión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${semaforo.map(s => `
                <tr>
                  <td style="font-weight:500;font-size:var(--text-sm)">${s.area}</td>
                  <td style="font-size:var(--text-sm);text-align:center">${s.funcArea}</td>
                  <td style="font-size:var(--text-sm);text-align:center;color:${s.vencidas>0?'var(--peligro)':'var(--gris-mid)'}">${s.vencidas}</td>
                  <td style="font-size:var(--text-sm);text-align:center;color:${s.sinGestion>0?'var(--alerta)':'var(--gris-mid)'}">${s.sinGestion}</td>
                  <td>
                    <span style="display:inline-flex;align-items:center;gap:5px;
                                 padding:3px 10px;border-radius:var(--r-full);
                                 font-size:var(--text-xs);font-weight:600;
                                 background:var(--${s.semColor}-light);color:var(--${s.semColor})">
                      ${s.semColor === 'verde' ? '🟢' : s.semColor === 'alerta' ? '🟡' : '🔴'}
                      ${s.semLabel}
                    </span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Productividad comercial -->
    ${prodEjec.length ? `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <span style="font-family:'Montserrat',sans-serif;font-size:var(--text-xs);font-weight:700;
                   color:var(--navy);text-transform:uppercase;letter-spacing:.08em">
        Productividad comercial — mes actual
      </span>
      <div style="flex:1;height:1px;background:var(--gris-borde)"></div>
    </div>
    <div class="card" style="margin-bottom:28px">
      <div class="card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>Ejecutivo</th>
              <th style="text-align:center">Clientes activos</th>
              <th style="text-align:center">Gestiones del mes</th>
              <th>Desempeño</th>
            </tr>
          </thead>
          <tbody>
            ${prodEjec.map((e, i) => {
              const maxGest = Math.max(...prodEjec.map(x => x.gestiones), 1);
              const pct     = Math.round(e.gestiones / maxGest * 100);
              const medal   = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="avatar sm">${getInitials(e.nombre)}</div>
                      <span style="font-size:var(--text-sm);font-weight:500">${medal} ${e.nombre}</span>
                    </div>
                  </td>
                  <td style="text-align:center;font-size:var(--text-sm)">${e.activos}</td>
                  <td style="text-align:center;font-size:var(--text-sm);font-weight:600;
                             color:${e.gestiones > 0 ? 'var(--navy)' : 'var(--gris-mid)'}">
                    ${e.gestiones}
                  </td>
                  <td style="min-width:120px">
                    <div style="height:6px;background:var(--gris-light);border-radius:var(--r-full);overflow:hidden">
                      <div style="height:100%;width:${pct}%;background:var(--azul);
                                  border-radius:var(--r-full);transition:width .6s ease"></div>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    <!-- Acciones rápidas director -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <span style="font-family:'Montserrat',sans-serif;font-size:var(--text-xs);font-weight:700;
                   color:var(--navy);text-transform:uppercase;letter-spacing:.08em">Acciones rápidas</span>
      <div style="flex:1;height:1px;background:var(--gris-borde)"></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="navigateTo('clientes')">Ver todos los clientes</button>
      <button class="btn btn-secondary" onclick="navigateTo('tareas')">Revisar tareas vencidas</button>
      <button class="btn btn-secondary" onclick="navigateTo('eventos')">Ver eventos especiales</button>
      <button class="btn btn-secondary" onclick="navigateTo('funcionarios')">Gestionar equipo</button>
    </div>`;
}
