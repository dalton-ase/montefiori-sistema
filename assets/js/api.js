/**
 * ============================================================
 * ALIANZA CRM — api.js v1.1
 * Capa de comunicación con Google Apps Script
 * Desarrollado por Tourlat | tourlat.com
 * ============================================================
 * NOTA TÉCNICA:
 * Apps Script no permite CORS en doPost desde dominios externos.
 * Solución: usar doGet con payload en parámetro ?d=
 * que sí funciona sin restricciones CORS.
 * ============================================================
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbxuenUGdwhF5mkPFqJm0EUr-mvgsbpvGdf1bDxdl-94rhxmdVMnwh7D_4U6Kc2HFnW4_Q/exec';

async function api(action, data = {}) {
  const body = { action, data };
  if (APP.token) body.token = APP.token;

  const url = API_URL + '?d=' + encodeURIComponent(JSON.stringify(body));
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error('HTTP ' + res.status);

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch(e) {
    throw new Error('Respuesta invalida del servidor');
  }
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
async function apiGetLotes(PROY_ID)                { return api('getLotes', PROY_ID ? { PROY_ID } : {}); }
async function apiSaveLote(data)                   { return api('saveLote', data); }
async function apiImportarLotes(lotes)             { return api('importarLotes', { lotes }); }
async function apiGetClientes(filtros)             { return api('getClientes', filtros || {}); }
async function apiGetCliente(CLI_ID)               { return api('getCliente', { CLI_ID }); }
async function apiSaveCliente(data)                { return api('saveCliente', data); }
async function apiImportarClientes(clientes)       { return api('importarClientes', { clientes }); }
async function apiGetLog(filtros)                  { return api('getLog', filtros || {}); }
