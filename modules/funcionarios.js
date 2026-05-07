/**
 * ============================================================
 * ALIANZA CRM — funcionarios.js
 * Módulo de gestión de funcionarios
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

window.render_funcionarios = async function() {
  const pc = document.getElementById('page-content');
  pc.innerHTML = `
    <div class="anim-1" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--oscuro)">Funcionarios</h2>
        <p style="font-size:var(--text-sm);color:var(--gris-mid);margin-top:3px">Gestión del equipo por área y rol</p>
      </div>
      <button class="btn btn-primary" onclick="func_abrirModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo funcionario
      </button>
    </div>

    <!-- Filtros -->
    <div class="card anim-2" style="margin-bottom:16px">
      <div class="card-body" style="padding:14px 16px">
        <div style="display:grid;grid-template-columns:1fr 200px 200px;gap:12px;align-items:end">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" id="func-buscar" placeholder="Buscar por nombre o cédula..." oninput="func_filtrar()">
          </div>
          <select class="form-control" id="func-filtro-area" onchange="func_filtrar()">
            <option value="">Todas las áreas</option>
          </select>
          <select class="form-control" id="func-filtro-estado" onchange="func_filtrar()">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card anim-3">
      <div class="card-body" style="padding:0">
        <div id="func-tabla-wrap" class="table-wrap">
          <div style="padding:40px;text-align:center">
            <div class="loader-ring" style="margin:0 auto;border-top-color:var(--azul)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-backdrop" id="func-modal">
      <div class="modal" style="max-width:620px">
        <div class="modal-header">
          <div class="modal-title" id="func-modal-title">Nuevo funcionario</div>
          <button class="modal-close" onclick="func_cerrarModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="func-id">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Cédula</label>
              <input type="text" class="form-control" id="func-cedula" placeholder="Número de cédula" inputmode="numeric">
            </div>
            <div class="form-group">
              <label class="form-label req">Nombre</label>
              <input type="text" class="form-control" id="func-nombre" placeholder="Nombre">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Apellido</label>
              <input type="text" class="form-control" id="func-apellido" placeholder="Apellido">
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input type="text" class="form-control" id="func-telefono" placeholder="Teléfono fijo">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label req">Área</label>
              <select class="form-control" id="func-area"></select>
            </div>
            <div class="form-group">
              <label class="form-label req">Rol</label>
              <select class="form-control" id="func-rol"></select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">WhatsApp</label>
              <input type="text" class="form-control" id="func-whatsapp" placeholder="57300...">
              <div class="form-hint">Con código país. Ej: 573001234567</div>
            </div>
            <div class="form-group">
              <label class="form-label">Correo</label>
              <input type="email" class="form-control" id="func-email" placeholder="correo@empresa.com">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de ingreso</label>
            <input type="date" class="form-control" id="func-fecha-ingreso">
          </div>
          <div id="func-error" style="display:none;padding:10px 12px;background:var(--peligro-light);border:1px solid var(--peligro-borde);border-radius:var(--r);color:var(--peligro);font-size:var(--text-sm);margin-top:8px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="func_cerrarModal()">Cancelar</button>
          <button class="btn btn-primary" id="func-btn-guardar" onclick="func_guardar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar
          </button>
        </div>
      </div>
    </div>`;

  await func_cargarDatos();
};

// ── Estado del módulo ────────────────────────────
let FUNC_DATA = [];

async function func_cargarDatos() {
  try {
    const res = await apiGetFuncionarios();
    if (!res.ok) { func_mostrarError('Error cargando funcionarios: ' + res.error); return; }
    FUNC_DATA = res.data || [];
    func_cargarSelectores();
    func_renderTabla(FUNC_DATA);
  } catch(e) {
    func_mostrarError('Error de conexión');
  }
}

function func_cargarSelectores() {
  const cfg    = APP.config || {};
  const areas  = (cfg.area  || []).map(a => a.clave);
  const roles  = (cfg.rol   || []).map(r => r.clave);

  // Filtro área
  const selArea = document.getElementById('func-filtro-area');
  if (selArea) {
    selArea.innerHTML = '<option value="">Todas las áreas</option>';
    areas.forEach(a => selArea.innerHTML += `<option value="${a}">${a}</option>`);
  }

  // Modal área
  const mArea = document.getElementById('func-area');
  if (mArea) {
    mArea.innerHTML = '<option value="">Selecciona área</option>';
    areas.forEach(a => mArea.innerHTML += `<option value="${a}">${a}</option>`);
  }

  // Modal rol
  const mRol = document.getElementById('func-rol');
  if (mRol) {
    mRol.innerHTML = '<option value="">Selecciona rol</option>';
    roles.forEach(r => mRol.innerHTML += `<option value="${r}">${r}</option>`);
  }
}

function func_renderTabla(data) {
  const wrap = document.getElementById('func-tabla-wrap');
  if (!wrap) return;

  if (!data.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="empty-title">Sin funcionarios</div>
        <div class="empty-sub">Crea el primer funcionario con el botón "Nuevo funcionario"</div>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Funcionario</th>
          <th>Cédula</th>
          <th>Área</th>
          <th>Rol</th>
          <th>WhatsApp</th>
          <th>Estado</th>
          <th style="text-align:right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(f => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                <div class="avatar sm">${getInitials(f.nombre + ' ' + f.apellido)}</div>
                <div>
                  <div style="font-weight:500;font-size:var(--text-sm)">${f.nombre} ${f.apellido}</div>
                  <div style="font-size:var(--text-xs);color:var(--gris-mid)">${f.email || '—'}</div>
                </div>
              </div>
            </td>
            <td style="font-size:var(--text-sm)">${f.cedula}</td>
            <td><span class="badge badge-navy">${f.area}</span></td>
            <td><span class="badge badge-azul">${f.rol}</span></td>
            <td style="font-size:var(--text-sm)">${f.whatsapp || '—'}</td>
            <td>
              <span class="badge ${String(f.estado).toLowerCase() === 'true' ? 'badge-exito' : 'badge-gris'}">
                ${String(f.estado).toLowerCase() === 'true' ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="func_abrirModal('${f.FUNC_ID}')" title="Editar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn btn-sm btn-icon ${String(f.estado).toLowerCase() === 'true' ? 'btn-danger' : 'btn-success'}"
                        onclick="func_toggle('${f.FUNC_ID}')"
                        title="${String(f.estado).toLowerCase() === 'true' ? 'Desactivar' : 'Activar'}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${String(f.estado).toLowerCase() === 'true'
                      ? '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>'
                      : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
                  </svg>
                </button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function func_filtrar() {
  const q      = (document.getElementById('func-buscar')?.value || '').toLowerCase();
  const area   = document.getElementById('func-filtro-area')?.value || '';
  const estado = document.getElementById('func-filtro-estado')?.value || '';

  const filtrado = FUNC_DATA.filter(f => {
    const matchQ = !q ||
      (f.nombre + ' ' + f.apellido).toLowerCase().includes(q) ||
      String(f.cedula).includes(q);
    const matchA = !area   || f.area === area;
    const matchE = !estado || String(f.estado).toLowerCase() === estado;
    return matchQ && matchA && matchE;
  });

  func_renderTabla(filtrado);
}

function func_abrirModal(FUNC_ID = null) {
  document.getElementById('func-modal-title').textContent = FUNC_ID ? 'Editar funcionario' : 'Nuevo funcionario';
  document.getElementById('func-id').value       = '';
  document.getElementById('func-cedula').value   = '';
  document.getElementById('func-nombre').value   = '';
  document.getElementById('func-apellido').value = '';
  document.getElementById('func-area').value     = '';
  document.getElementById('func-rol').value      = '';
  document.getElementById('func-whatsapp').value = '';
  document.getElementById('func-email').value    = '';
  document.getElementById('func-telefono').value = '';
  document.getElementById('func-fecha-ingreso').value = '';
  document.getElementById('func-error').style.display = 'none';

  if (FUNC_ID) {
    const f = FUNC_DATA.find(x => x.FUNC_ID === FUNC_ID);
    if (f) {
      document.getElementById('func-id').value            = f.FUNC_ID;
      document.getElementById('func-cedula').value        = f.cedula;
      document.getElementById('func-nombre').value        = f.nombre;
      document.getElementById('func-apellido').value      = f.apellido;
      document.getElementById('func-area').value          = f.area;
      document.getElementById('func-rol').value           = f.rol;
      document.getElementById('func-whatsapp').value      = f.whatsapp || '';
      document.getElementById('func-email').value         = f.email    || '';
      document.getElementById('func-telefono').value      = f.telefono || '';
      document.getElementById('func-fecha-ingreso').value = f.fecha_ingreso ? String(f.fecha_ingreso).split('T')[0] : '';
      document.getElementById('func-cedula').disabled     = true; // No se puede cambiar cédula
    }
  } else {
    document.getElementById('func-cedula').disabled = false;
  }

  document.getElementById('func-modal').classList.add('active');
}

function func_cerrarModal() {
  document.getElementById('func-modal').classList.remove('active');
}

async function func_guardar() {
  const errEl = document.getElementById('func-error');
  errEl.style.display = 'none';

  const data = {
    FUNC_ID:       document.getElementById('func-id').value || null,
    cedula:        document.getElementById('func-cedula').value.trim(),
    nombre:        document.getElementById('func-nombre').value.trim(),
    apellido:      document.getElementById('func-apellido').value.trim(),
    area:          document.getElementById('func-area').value,
    rol:           document.getElementById('func-rol').value,
    whatsapp:      document.getElementById('func-whatsapp').value.trim(),
    email:         document.getElementById('func-email').value.trim(),
    telefono:      document.getElementById('func-telefono').value.trim(),
    fecha_ingreso: document.getElementById('func-fecha-ingreso').value
  };

  if (!data.cedula || !data.nombre || !data.apellido || !data.area || !data.rol) {
    errEl.textContent  = 'Completa los campos obligatorios: cédula, nombre, apellido, área y rol.';
    errEl.style.display = 'block';
    return;
  }

  if (!data.FUNC_ID) data.FUNC_ID = undefined;

  const btn = document.getElementById('func-btn-guardar');
  btn.disabled    = true;
  btn.textContent = 'Guardando...';

  try {
    const res = await apiSaveFuncionario(data);
    if (res.ok) {
      toast(data.FUNC_ID ? 'Funcionario actualizado' : 'Funcionario creado', 'ok');
      func_cerrarModal();
      await func_cargarDatos();
    } else {
      errEl.textContent  = res.error || 'Error al guardar';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent  = 'Error de conexión';
    errEl.style.display = 'block';
  }

  btn.disabled    = false;
  btn.innerHTML   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardar';
}

async function func_toggle(FUNC_ID) {
  const f = FUNC_DATA.find(x => x.FUNC_ID === FUNC_ID);
  if (!f) return;
  const accion = String(f.estado).toLowerCase() === 'true' ? 'desactivar' : 'activar';
  if (!confirm(`¿Confirmas ${accion} a ${f.nombre} ${f.apellido}?`)) return;
  try {
    const res = await apiToggleFuncionario(FUNC_ID);
    if (res.ok) {
      toast(`Funcionario ${accion === 'activar' ? 'activado' : 'desactivado'}`, 'ok');
      await func_cargarDatos();
    } else {
      toast(res.error || 'Error al cambiar estado', 'error');
    }
  } catch(e) {
    toast('Error de conexión', 'error');
  }
}

function func_mostrarError(msg) {
  document.getElementById('func-tabla-wrap').innerHTML = `
    <div class="empty-state">
      <div class="empty-title" style="color:var(--peligro)">${msg}</div>
    </div>`;
}
