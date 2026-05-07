/**
 * ============================================================
 * ALIANZA CRM — api.js
 * Capa de comunicación con Google Apps Script
 * Desarrollado por Tourlat | tourlat.com
 * Constructora Montefiori S.A.S. / Alianza Empresarial
 * ============================================================
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbzHBGJ63nVsglPzBxHLoKAltsrsx8t16w9DrHffQ6_y5a70LVnQpHutof_OMb6tNsgWeQ/exec';

async function api(action, data = {}) {
  const body = { action, data };
  if (APP.token) body.token = APP.token;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiLogin(cedula, password)          { return api('login', { cedula, password }); }
async function apiGetDashboard()                   { return api('getDashboard'); }
async function apiGetConfig()                      { return api('getConfig'); }
async function apiSaveConfigItem(CONFIG_ID, valor) { return api('saveConfigItem', { CONFIG_ID, valor }); }
async function apiGetFuncionarios()                { return api('getFuncionarios'); }
async function apiSaveFuncionario(data)            { return api('saveFuncionario', data); }
async function apiToggleFuncionario(FUNC_ID)       { return api('toggleFuncionario', { FUNC_ID }); }
async function apiGetProyectos()                   { return api('getProyectos'); }
async function apiSaveProyecto(data)               { return api('saveProyecto', data); }
async function apiGetLotes(PROY_ID = null)         { return api('getLotes', PROY_ID ? { PROY_ID } : {}); }
async function apiSaveLote(data)                   { return api('saveLote', data); }
async function apiImportarLotes(lotes)             { return api('importarLotes', { lotes }); }
async function apiGetClientes(filtros = {})        { return api('getClientes', filtros); }
async function apiGetCliente(CLI_ID)               { return api('getCliente', { CLI_ID }); }
async function apiSaveCliente(data)                { return api('saveCliente', data); }
async function apiImportarClientes(clientes)       { return api('importarClientes', { clientes }); }
async function apiGetLog(filtros = {})             { return api('getLog', filtros); }
