// =========================================================
// AtitudesGeo - LOGICA (conversao e parsing)
// Sem dependencia de DOM. Carregar antes de interface.js
// =========================================================

// =========================================================
// Metadados dos sistemas
// =========================================================
const SYS_META = {
  dip_dir: { label: 'Dip/Dip Direction' },
  rhr: { label: 'Regra da Mão Direita (RHR)' },
  azimuth: { label: 'Azimute' },
  quadrant: { label: 'Quadrante' }
};

function mod360(a){
  return ((a % 360) + 360) % 360;
}

function fmt(n){
  if (n == null || Number.isNaN(n)) return '?';
  const r = Math.round(Number(n) * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(/\.0$/, '');
}

function fmt3(n){
  if (n == null || Number.isNaN(n)) return '---';
  const v = Math.round(Number(n));
  return String(v).padStart(3, '0');
}

function fmt2(n){
  if (n == null || Number.isNaN(n)) return '--';
  const v = Math.round(Number(n));
  return String(v).padStart(2, '0');
}

// =========================================================
// Helpers de colunas e representação geológica
// =========================================================
function colLetter(i){
  let s = '';
  i++;
  while(i > 0){
    s = String.fromCharCode(64 + (i % 26 || 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function strikeToQuadrantClassic(strikeAz){
  let s = mod360(strikeAz) % 180;

  if (Math.abs(s) < 1e-9) return 'N0E';
  if (Math.abs(s - 90) < 1e-9) return 'N90E';

  if (s < 90) return `N${fmt(s)}E`;
  return `N${fmt(180 - s)}W`;
}

function azToDipQuadrant(az){
  az = mod360(az);
  if (az >= 0 && az < 90) return 'NE';
  if (az >= 90 && az < 180) return 'SE';
  if (az >= 180 && az < 270) return 'SW';
  return 'NW';
}

function attStr(sys, dip, dipDir){
  const strike = mod360(dipDir - 90);

  switch(sys){
    case 'dip_dir':
      return `${fmt2(dip)}/${fmt3(dipDir)}`;
    case 'rhr':
      return `${fmt3(strike)}/${fmt2(dip)}`;
    case 'azimuth':
      return `${fmt3(strike)}/${fmt2(dip)}`;
    case 'quadrant':
      return `${strikeToQuadrantClassic(strike)}/${fmt2(dip)}${azToDipQuadrant(dipDir)}`;
    default:
      return '';
  }
}

// =========================================================
// Parsing das notações
// =========================================================
function parseNormal(sys, rawDir, rawDip){
  if (sys === 'dip_dir'){
    const dipDir = parseFloat(rawDir);
    const dip = parseFloat(rawDip);

    if (isNaN(dip) || isNaN(dipDir)) throw new Error('valor não numérico');
    if (dip < 0 || dip > 90) throw new Error('mergulho fora de 0–90°');

    return { dip, dipDir: mod360(dipDir) };
  }

  if (sys === 'rhr' || sys === 'azimuth'){
    const strike = parseFloat(rawDir);
    const dip = parseFloat(rawDip);

    if (isNaN(dip) || isNaN(strike)) throw new Error('valor não numérico');
    if (dip < 0 || dip > 90) throw new Error('mergulho fora de 0–90°');

    return { dip, dipDir: mod360(strike + 90) };
  }

  if (sys === 'quadrant'){
    const strikeAz = parseQuadrantStrike(rawDir);
    const { dip, dipDir } = parseQuadrantDip(rawDip, strikeAz);
    return { dip, dipDir };
  }

  throw new Error('sistema desconhecido');
}

function parseQuadrantStrike(str){
  const s = String(str).replace(/[°\s]/g,'').toUpperCase();

  const numeric = parseFloat(s);
  if (!isNaN(numeric)) return mod360(numeric);

  const m = s.match(/^([NS])(\d+(?:\.\d+)?)([EW])$/);
  if (!m) throw new Error('strike inválido');

  const ns = m[1];
  const ang = parseFloat(m[2]);
  const ew = m[3];

  if (ang < 0 || ang > 90) throw new Error('strike inválido');

  if (ns === 'N' && ew === 'E') return ang;
  if (ns === 'N' && ew === 'W') return mod360(360 - ang);
  if (ns === 'S' && ew === 'E') return 180 - ang;
  if (ns === 'S' && ew === 'W') return 180 + ang;

  throw new Error('strike inválido');
}

function parseQuadrantDip(str, strikeAz){
  const s = String(str).replace(/°/g,'').replace(/\s+/g,'').toUpperCase();
  const m = s.match(/^(\d+(?:\.\d+)?)(NE|SE|SW|NW)?$/);

  if (!m) throw new Error('mergulho inválido');

  const dip = parseFloat(m[1]);
  const q = m[2] || '';

  if (dip < 0 || dip > 90) throw new Error('mergulho fora de 0–90°');

  const opt1 = mod360(strikeAz + 90);
  const opt2 = mod360(strikeAz - 90);

  if (!q) return { dip, dipDir: opt1 };
  if (azToDipQuadrant(opt1) === q) return { dip, dipDir: opt1 };
  if (azToDipQuadrant(opt2) === q) return { dip, dipDir: opt2 };

  throw new Error('quadrante incompatível');
}

