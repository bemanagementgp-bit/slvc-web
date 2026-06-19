/**
 * Scraper de Liga Amateur Platense de Fútbol
 * Fetchea fixture y posiciones en tiempo real, con caché de 30 minutos.
 */

const https = require('https');

// Fallback estático en caso de error de red
const fallback = require('../data/fixture');

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
let cache = null;
let cacheTs = 0;

const BASE = 'https://www.lapf.com.ar';
const LOGO_BASE = `${BASE}/Recursos/img/logos`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
};

function get(url, cookies) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { ...HEADERS, ...(cookies ? { Cookie: cookies } : {}) } };
    https.get(url, opts, (res) => {
      let data = '';
      if (res.statusCode === 302 && res.headers.location) {
        const cookie = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
        const loc = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location;
        return get(loc, cookie).then(resolve).catch(reject);
      }
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extrae tabla de posiciones del HTML (tabla GVPosicionesDesktop)
function parseStandings(html) {
  const tabla = [];
  const tableMatch = html.match(/id="GVPosicionesDesktop"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  if (!tableMatch) return null;

  const rows = tableMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
  rows.forEach(row => {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length < 9) return;

    const getText = (cell) => cell.replace(/<[^>]+>/g, '').trim();
    const imgAlt = cells[1] && cells[1].match(/alt="logo ([^"]+)"/);
    const equipo = imgAlt ? imgAlt[1].trim() : getText(cells[1]);

    tabla.push({
      pos:    parseInt(getText(cells[0])) || tabla.length + 1,
      equipo: equipo,
      pts:    parseInt(getText(cells[2])) || 0,
      pj:     parseInt(getText(cells[3])) || 0,
      pg:     parseInt(getText(cells[4])) || 0,
      pe:     parseInt(getText(cells[5])) || 0,
      pp:     parseInt(getText(cells[6])) || 0,
      gf:     parseInt(getText(cells[7])) || 0,
      gc:     parseInt(getText(cells[8])) || 0,
    });
  });
  return tabla.length ? tabla : null;
}

// Extrae fixture del HTML (tabla GVFixtureDesktop)
function parseFixture(html, fechaNum) {
  const matches = [];
  const tableMatch = html.match(/id="GVFixtureDesktop"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  if (!tableMatch) return [];

  const rows = tableMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
  rows.forEach(row => {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length < 4) return;

    const getTeam = (cell) => {
      const alt = cell.match(/alt="logo ([^"]+)"/);
      return alt ? alt[1].trim() : '';
    };
    const getScore = (cell) => {
      const txt = cell.replace(/<[^>]+>/g, '').trim();
      return txt === '' || txt === '-' ? null : parseInt(txt);
    };

    const local     = getTeam(cells[0]);
    const golL      = cells[1] ? getScore(cells[1]) : null;
    const golV      = cells[3] ? getScore(cells[3]) : null;
    const visitante = cells[4] ? getTeam(cells[4]) : '';

    if (!local || !visitante) return;

    const jugado = golL !== null && golV !== null;
    matches.push({ fecha: fechaNum, local, visitante, jugado, ...(jugado ? { golL, golV } : {}) });
  });
  return matches;
}

// Construye el equipo `teams` desde las imágenes del HTML
function parseTeams(html) {
  const teams = {};
  const imgs = html.matchAll(/src="([^"]+\/logos\/[^"]+)" alt="logo ([^"]+)"/g);
  for (const m of imgs) {
    const name = m[2].trim();
    if (!teams[name]) {
      teams[name] = {
        logo: m[1],
        short: name.replace(/[^A-Z0-9]/g, '').substring(0, 4),
      };
    }
  }
  return teams;
}

// Obtiene el número de fecha actual desde la URL redireccionada
async function getCurrentFechaUrl() {
  // Hacemos el get a /datos-torneo/A/1 y obtenemos la redirect URL
  return new Promise((resolve) => {
    https.get(`${BASE}/datos-torneo/A/1`, { headers: HEADERS }, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        resolve(res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location);
      } else {
        resolve(null);
      }
      res.resume();
    }).on('error', () => resolve(null));
  });
}

function parseFechaFromUrl(url) {
  // URL: /datos-torneo/165/442/12/1
  const m = url.match(/datos-torneo\/(\d+)\/(\d+)\/(\d+)\/(\d+)/);
  return m ? { cat: m[1], ed: m[2], fecha: parseInt(m[3]), zona: m[4] } : null;
}

async function fetchLapfData() {
  try {
    const currentUrl = await getCurrentFechaUrl();
    if (!currentUrl) throw new Error('No redirect URL');

    const params = parseFechaFromUrl(currentUrl);
    if (!params) throw new Error('Cannot parse URL params');

    const { cat, ed, fecha, zona } = params;

    // Fetch fecha actual (resultados jugados) y próxima fecha en paralelo
    const [htmlActual, htmlProxima] = await Promise.all([
      get(currentUrl),
      get(`${BASE}/datos-torneo/${cat}/${ed}/${fecha + 1}/${zona}`),
    ]);

    const tabla  = parseStandings(htmlActual) || fallback.tabla;
    const teams  = parseTeams(htmlActual);

    const jugados  = parseFixture(htmlActual, fecha);
    const proximos = parseFixture(htmlProxima, fecha + 1);

    const fixture = [...jugados, ...proximos];

    // Próximo partido de SAN LORENZO
    const slvcNames = ['SAN LORENZO V. C.', 'SAN LORENZO V.C.', 'SAN LORENZO V.C'];
    const isSlvc = (t) => slvcNames.some(n => t.includes('SAN LORENZO'));

    const proximoMatch = proximos.find(m => isSlvc(m.local) || isSlvc(m.visitante));
    const proximoPartido = proximoMatch ? {
      fecha:     proximoMatch.fecha,
      local:     proximoMatch.local,
      visitante: proximoMatch.visitante,
      torneo:    `Primera "A" · Rueda 1 · Fecha ${proximoMatch.fecha}`,
      lugar:     'El Nido · Calle 7 y 485, Villa Castells',
    } : fallback.proximoPartido;

    // Merge teams con logos conocidos del fallback para los que no encontramos imagen
    const mergedTeams = { ...fallback.teams };
    for (const [name, data] of Object.entries(teams)) {
      // Intentar mapear al nombre en fallback
      const key = Object.keys(fallback.teams).find(k =>
        k.replace(/[^A-Z]/g,'') === name.replace(/[^A-Z]/g,'')
      );
      if (key) mergedTeams[key] = { ...mergedTeams[key], logo: data.logo };
    }

    return { fixture, tabla, teams: mergedTeams, proximoPartido };

  } catch (err) {
    console.warn('[LAPF] Error fetching live data, using fallback:', err.message);
    return fallback;
  }
}

async function getLapfData() {
  const now = Date.now();
  if (cache && now - cacheTs < CACHE_TTL) return cache;

  const data = await fetchLapfData();
  cache = data;
  cacheTs = now;
  return data;
}

module.exports = { getLapfData };
