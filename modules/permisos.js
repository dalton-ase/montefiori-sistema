/**
 * ============================================================
 * ALIANZA CRM — permisos.js
 * Módulo de gestión de permisos por usuario
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

// ── Estado ───────────────────────────────────────────────
let PERM_FUNC     = [];
let PERM_MODULOS  = [];
let PERM_DATA     = [];
let PERM_SELECTED = null; // FUNC_ID seleccionado

window.render_permisos = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="margin-bottom:22px">
      <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--oscuro)">Permisos</h2>
      <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Matriz de acceso por usuario — define qué módulos puede ver cada funcionario</p>
    </div>

    <div style="padding:10px 14px;background:var(--navy-light);border-radius:var(--r);
                border:1px solid var(--navy-alpha);margin-bottom:20px;
                font-size:var(--text-sm);color:var(--navy)" class="anim-1">
      <strong>¿Cómo funciona?</strong> Selecciona un funcionario, marca los módulos a los que tendrá acceso y el nivel (ver, editar o administrar).
      Los usuarios con rol "Director" tienen acceso total sin importar esta matriz.
      Si un usuario no tiene permisos asignados aquí, el sistema usa las reglas por área como respaldo.
    </div>

    <div class="anim-2" style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start">

      <!-- Panel izquierdo: lista de funcionarios -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Funcionarios</div>
        </div>
        <div class="card-body" style="padding:0">
          <div style="padding:10px 12px;border-bottom:1px solid var(--gris-borde)">
            <input type="text" class="form-control" id="perm-buscar-func" placeholder="Buscar funcionario..." oninput="perm_filtrarFunc()" style="font-size:var(--text-sm)">
          </div>
          <div id="perm-func-lista" style="max-height:500px;overflow-y:auto"></div>
        </div>
      </div>

      <!-- Panel derecho: permisos del seleccionado -->
      <div id="perm-panel-derecho">
        <div class="card">
          <div class="card-body" style="padding:40px;text-align:center">
            <div style="font-size:var(--text-sm);color:var(--gris-mid)">
              Selecciona un funcionario para configurar sus permisos
            </div>
          </div>
        </div>
      </div>

    </div>`;

  await perm_cargarDatos();
};

async function perm_cargarDatos() {
  try {
    const [funcRes, permRes, modRes] = await Promise.all([
      apiGetFuncionarios(),
      apiGetPermisos(),
      apiGetModulos()
    ]);
    PERM_FUNC    = funcRes.ok ? (funcRes.data || []).filter(f => String(f.estado).toLowerCase() === 'true') : [];
    PERM_DATA    = permRes.ok ? (permRes.data || []) : [];
    PERM_MODULOS = modRes.ok ? (modRes.data || []) : [];

    perm_renderFuncLista(PERM_FUNC);
  } catch(e) {
    console.error('Error cargando permisos:', e);
  }
}

function perm_renderFuncLista(data) {
  const el = document.getElementById('perm-func-lista');
  if (!data.length) {
    el.innerHTML = `<div style="padding:20px;text-align:center;font-size:var(--text-sm);color:var(--gris-mid)">Sin funcionarios activos</div>`;
    return;
  }

  el.innerHTML = data.map(f => {
    const permCount = PERM_DATA.filter(p => String(p.FUNC_ID) === String(f.FUNC_ID) && String(p.activo).toLowerCase() === 'true').length;
    const isDirector = f.rol === 'Director';
    const isSelected = PERM_SELECTED === f.FUNC_ID;

    return `
      <div class="perm-func-item ${isSelected ? 'active' : ''}"
           style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--gris-borde);
                  transition:background var(--tr);
                  ${isSelected ? 'background:var(--azul-light);border-left:3px solid var(--azul)' : 'border-left:3px solid transparent'}"
           onclick="perm_seleccionarFunc('${f.FUNC_ID}')"
           onmouseover="if(!this.classList.contains('active'))this.style.background='var(--gris-surface)'"
           onmouseout="if(!this.classList.contains('active'))this.style.background=''">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar sm">${getInitials(f.nombre + ' ' + f.apellido)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:var(--text-sm);color:var(--oscuro);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.nombre} ${f.apellido}</div>
            <div style="font-size:var(--text-xs);color:var(--gris-mid)">${f.area} · ${f.rol}</div>
          </div>
          ${isDirector ? `<span class="badge badge-navy" style="font-size:9px">TOTAL</span>`
                       : permCount > 0 ? `<span class="badge badge-azul" style="font-size:9px">${permCount}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

function perm_filtrarFunc() {
  const q = (document.getElementById('perm-buscar-func')?.value || '').toLowerCase();
  const filtrado = PERM_FUNC.filter(f =>
    (f.nombre + ' ' + f.apellido).toLowerCase().includes(q) || String(f.cedula).includes(q)
  );
  perm_renderFuncLista(filtrado);
}

async function perm_seleccionarFunc(FUNC_ID) {
  PERM_SELECTED = FUNC_ID;
  perm_renderFuncLista(PERM_FUNC); // Refrescar highlight

  const func = PERM_FUNC.find(f => f.FUNC_ID === FUNC_ID);
  if (!func) return;

  const panel = document.getElementById('perm-panel-derecho');

  if (func.rol === 'Director') {
    panel.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${func.nombre} ${func.apellido}</div>
          <span class="badge badge-navy">Director — acceso total</span>
        </div>
        <div class="card-body" style="text-align:center;padding:30px">
          <div style="font-size:var(--text-sm);color:var(--gris-mid)">
            Los usuarios con rol <strong>Director</strong> tienen acceso completo a todos los módulos del sistema. No necesitan permisos individuales.
          </div>
        </div>
      </div>`;
    return;
  }

  // Obtener permisos actuales del usuario
  const userPerms = PERM_DATA.filter(p => String(p.FUNC_ID) === String(FUNC_ID) && String(p.activo).toLowerCase() === 'true');
  const permMap = {};
  userPerms.forEach(p => { permMap[p.modulo] = p.nivel; });

  // Agrupar módulos
  const grupos = {};
  PERM_MODULOS.forEach(m => {
    if (!grupos[m.grupo]) grupos[m.grupo] = [];
    grupos[m.grupo].push(m);
  });

  panel.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${func.nombre} ${func.apellido}</div>
        <div style="display:flex;gap:8px">
          <span class="badge badge-navy">${func.area}</span>
          <span class="badge badge-azul">${func.rol}</span>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th style="text-align:center;width:80px">Acceso</th>
              <th style="text-align:center;width:120px">Nivel</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(grupos).map(([grupo, modulos]) => `
              <tr>
                <td colspan="3" style="background:var(--gris-surface);font-weight:700;font-size:var(--text-xs);
                    text-transform:uppercase;letter-spacing:.06em;color:var(--navy);padding:8px 14px">
                  ${grupo}
                </td>
              </tr>
              ${modulos.map(m => {
                const tiene = !!permMap[m.id];
                const nivel = permMap[m.id] || 'editar';
                return `
                <tr>
                  <td style="font-size:var(--text-sm);font-weight:500">${m.label}</td>
                  <td style="text-align:center">
                    <input type="checkbox" id="perm-chk-${m.id}" ${tiene ? 'checked' : ''}
                           style="width:18px;height:18px;cursor:pointer;accent-color:var(--azul)"
                           onchange="perm_marcar('${m.id}', this.checked)">
                  </td>
                  <td style="text-align:center">
                    <select class="form-control" id="perm-niv-${m.id}"
                            style="font-size:var(--text-xs);padding:4px 8px;height:auto;min-height:unset;${!tiene ? 'opacity:0.3;pointer-events:none' : ''}"
                            onchange="perm_marcar('${m.id}', true)">
                      <option value="ver" ${nivel === 'ver' ? 'selected' : ''}>Ver</option>
                      <option value="editar" ${nivel === 'editar' ? 'selected' : ''}>Editar</option>
                      <option value="admin" ${nivel === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                  </td>
                </tr>`;
              }).join('')}`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card-footer" style="justify-content:flex-end;gap:10px">
        <span id="perm-status" style="font-size:var(--text-xs);color:var(--gris-mid);margin-right:auto"></span>
        <button class="btn btn-primary" id="perm-btn-guardar" onclick="perm_guardarTodos()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
          Guardar permisos
        </button>
      </div>
    </div>`;
}

function perm_marcar(moduloId, checked) {
  const nivEl = document.getElementById('perm-niv-' + moduloId);
  if (nivEl) {
    nivEl.style.opacity = checked ? '1' : '0.3';
    nivEl.style.pointerEvents = checked ? '' : 'none';
  }
}

async function perm_guardarTodos() {
  if (!PERM_SELECTED) return;

  // Recopilar estado actual de la UI
  const permisos = [];
  PERM_MODULOS.forEach(m => {
    const chk = document.getElementById('perm-chk-' + m.id);
    const niv = document.getElementById('perm-niv-' + m.id);
    if (chk && chk.checked && niv) {
      permisos.push({ modulo: m.id, nivel: niv.value });
    }
  });

  const btn = document.getElementById('perm-btn-guardar');
  const status = document.getElementById('perm-status');
  btn.disabled = true; btn.textContent = 'Guardando...';
  status.textContent = '';

  try {
    const res = await apiSavePermisosBulk(PERM_SELECTED, permisos);
    if (res.ok) {
      toast(`Permisos actualizados (${permisos.length} módulos)`, 'ok');
      status.textContent = `✓ ${permisos.length} permisos guardados`;
      status.style.color = 'var(--exito)';
      // Refrescar data
      const permRes = await apiGetPermisos();
      PERM_DATA = permRes.ok ? (permRes.data || []) : [];
      perm_renderFuncLista(PERM_FUNC);
    } else {
      toast(res.error || 'Error al guardar', 'error');
      status.textContent = 'Error al guardar';
      status.style.color = 'var(--peligro)';
    }
  } catch(e) {
    toast('Error de conexión', 'error');
    status.textContent = 'Error de conexión';
    status.style.color = 'var(--peligro)';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> Guardar permisos';
}
