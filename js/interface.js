// =========================================================
// AtitudesGeo - INTERFACE (DOM, eventos, import/export)
// Depende de logica.js (carregar depois dele)
// =========================================================

// =========================================================
// Estado da aplicação
// =========================================================
const state = {
  workbook: null,
  sheetData: [],
  headers: [],
  processedRows: []
};

// =========================================================
// Helpers gerais
// =========================================================
function $(id){ return document.getElementById(id); }

function setStatus(id, msg = '', kind = ''){
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

function esc(s){
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// NOVO/ALTERADO:
// valida extensão do arquivo antes de tentar ler com SheetJS
function isExcelFile(file){
  if (!file || !file.name) return false;
  const name = file.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls');
}

function theoryTitle(sys){
  return SYS_META[sys]?.label || sys;
}

function hasLoadedSheet(){
  return state.headers.length > 0 && state.sheetData.length > 0;
}

// =========================================================
// Leitura de valores da UI
// =========================================================
function getSelectedSystems(){
  return {
    from: $('sys-from')?.value,
    to: $('sys-to')?.value
  };
}

function getMappingConfig(){
  return {
    colDir: parseInt($('col-dir')?.value, 10),
    colDip: parseInt($('col-dip')?.value, 10),
    start: parseInt($('row-start')?.value, 10) - 1
  };
}

// =========================================================
// Renderização da teoria dinâmica
// =========================================================
function renderTheory(){
  const { from, to } = getSelectedSystems();
  const container = $('conversion-theory');
  if (!from || !to || !container) return;

  const exDip = 45;
  const exDipDir = 120;

  const exFrom = attStr(from, exDip, exDipDir);
  const exTo = attStr(to, exDip, exDipDir);

  const key = `${from}->${to}`;

  const intro = `
    <p>
      Nesta conversão, o sistema de origem é <strong>${theoryTitle(from)}</strong> e o sistema de destino é
      <strong>${theoryTitle(to)}</strong>.
      O princípio fundamental é que <strong>o plano geológico não muda</strong>; o que muda é apenas
      a forma de representar a mesma atitude.
    </p>
  `;

  const normalizeMsg = `
    <div class="theory-highlight">
      <strong>Lógica usada pelo site:</strong><br>
      primeiro a atitude é convertida para uma forma interna comum
      <strong>(dip + dip direction)</strong>. Depois, essa forma interna é reescrita
      no sistema de saída escolhido.
    </div>
  `;

  if (from === to){
    container.innerHTML = `
      <h4>Sem conversão real: mesma notação na entrada e na saída</h4>
      ${intro}
      <p>
        Como o sistema de entrada e o sistema de saída são iguais, não há mudança de notação.
        Nesse caso, o site apenas preserva a atitude informada e a apresenta no mesmo formato.
      </p>
      <div class="theory-formula">
        Exemplo: ${exFrom} → ${exTo}
      </div>
      <p>
        Esse caso é útil para conferência de dados, padronização visual e validação de importação.
      </p>
    `;
    return;
  }

  const theories = {
    'dip_dir->rhr': `
      <h4>De Dip/Dip Direction para Regra da Mão Direita (RHR)</h4>
      ${intro}
      <p>
        No sistema <strong>Dip/Dip Direction</strong>, você já conhece diretamente o
        <strong>mergulho</strong> e a <strong>direção do mergulho</strong>.
        Para escrever em <strong>RHR</strong>, é necessário calcular o <strong>strike</strong>.
      </p>
      <div class="theory-formula">
        Strike = Dip Direction − 90°<br>
        Dip = mantido
      </div>
      <p>
        A Regra da Mão Direita escolhe o strike de modo que a direção do mergulho fique à
        <strong>direita</strong> de quem observa o strike no seu sentido positivo.
      </p>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}<br>
        Como Dip Direction = 120°, então Strike = 120° − 90° = 30°
      </div>
      ${normalizeMsg}
    `,

    'dip_dir->azimuth': `
      <h4>De Dip/Dip Direction para Azimute do Strike</h4>
      ${intro}
      <p>
        Neste caso, a direção do mergulho já está explícita. O que falta é transformar essa
        informação no <strong>azimute do strike</strong>, que é a direção horizontal contida no plano.
      </p>
      <div class="theory-formula">
        Strike = Dip Direction − 90°<br>
        Dip = mantido
      </div>
      <p>
        O azimute é expresso em graus a partir do Norte, no sentido horário.
      </p>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'dip_dir->quadrant': `
      <h4>De Dip/Dip Direction para Quadrante</h4>
      ${intro}
      <p>
        No sistema em quadrante, a atitude é escrita separando:
      </p>
      <ul>
        <li><strong>strike em quadrante</strong> (por exemplo, N30E)</li>
        <li><strong>mergulho + quadrante do mergulho</strong> (por exemplo, 45SE)</li>
      </ul>
      <p>
        Como a entrada já fornece <strong>dip</strong> e <strong>dip direction</strong>, o site calcula
        primeiro o <strong>strike</strong> e depois converte esse strike numérico para a forma em quadrante.
      </p>
      <div class="theory-formula">
        Strike = Dip Direction − 90°<br>
        Dip = mantido<br>
        Dip quadrant = quadrante da direção de mergulho
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      <p>
        Aqui, 120° está no quadrante <strong>SE</strong>, então o mergulho é expresso como <strong>45SE</strong>.
      </p>
      ${normalizeMsg}
    `,

    'rhr->dip_dir': `
      <h4>De Regra da Mão Direita (RHR) para Dip/Dip Direction</h4>
      ${intro}
      <p>
        No sistema RHR, a entrada fornece o <strong>strike</strong> e o <strong>dip</strong>.
        Para obter a direção do mergulho, o site aplica a lógica da Regra da Mão Direita:
        o mergulho está a <strong>90° à direita do strike</strong>.
      </p>
      <div class="theory-formula">
        Dip Direction = Strike + 90°<br>
        Dip = mantido
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}<br>
        Como Strike = 30°, então Dip Direction = 30° + 90° = 120°
      </div>
      ${normalizeMsg}
    `,

    'rhr->azimuth': `
      <h4>De Regra da Mão Direita (RHR) para Azimute do Strike</h4>
      ${intro}
      <p>
        Em termos numéricos, <strong>RHR</strong> e <strong>Azimute do Strike</strong> usam a mesma base
        para o strike: um valor angular medido a partir do Norte.
        A diferença principal é conceitual: no RHR, o strike é escolhido obedecendo a regra da mão direita.
      </p>
      <p>
        Portanto, ao converter, o site mantém o strike e o dip, apenas reexpressando a notação.
      </p>
      <div class="theory-formula">
        Strike = mantido<br>
        Dip = mantido
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'rhr->quadrant': `
      <h4>De Regra da Mão Direita (RHR) para Quadrante</h4>
      ${intro}
      <p>
        A entrada fornece <strong>strike</strong> e <strong>dip</strong>. O site primeiro calcula a
        <strong>direção do mergulho</strong> usando a regra da mão direita e depois transforma
        o strike numérico em notação por quadrante.
      </p>
      <div class="theory-formula">
        Dip Direction = Strike + 90°<br>
        Strike em quadrante = conversão do azimute para NθE, NθW, SθE ou SθW
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'azimuth->dip_dir': `
      <h4>De Azimute do Strike para Dip/Dip Direction</h4>
      ${intro}
      <p>
        Neste sistema, a entrada fornece o <strong>strike em azimute</strong> e o <strong>dip</strong>.
        Para obter a direção do mergulho, é necessário avançar 90° a partir do strike.
      </p>
      <div class="theory-formula">
        Dip Direction = Strike + 90°<br>
        Dip = mantido
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'azimuth->rhr': `
      <h4>De Azimute do Strike para Regra da Mão Direita (RHR)</h4>
      ${intro}
      <p>
        Nesta implementação, o site utiliza a mesma base angular para strike e dip em ambos os sistemas.
        Assim, a conversão é essencialmente uma mudança de rótulo do sistema, preservando os valores.
      </p>
      <div class="theory-formula">
        Strike = mantido<br>
        Dip = mantido
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'azimuth->quadrant': `
      <h4>De Azimute do Strike para Quadrante</h4>
      ${intro}
      <p>
        O strike, originalmente expresso como azimute numérico, passa a ser escrito em forma
        de quadrante. O dip permanece com o mesmo valor angular, e a direção do mergulho é
        convertida para o quadrante correspondente.
      </p>
      <div class="theory-formula">
        Dip Direction = Strike + 90°<br>
        Strike em quadrante = azimute convertido para NθE, NθW, SθE ou SθW
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'quadrant->dip_dir': `
      <h4>De Quadrante para Dip/Dip Direction</h4>
      ${intro}
      <p>
        A notação em quadrante traz duas etapas de interpretação:
      </p>
      <ul>
        <li>converter o <strong>strike em quadrante</strong> para azimute numérico</li>
        <li>interpretar o <strong>quadrante do mergulho</strong> para decidir entre as duas direções possíveis do plano</li>
      </ul>
      <div class="theory-formula">
        NθE → θ<br>
        NθW → 360° − θ<br>
        SθE → 180° − θ<br>
        SθW → 180° + θ
      </div>
      <p>
        Depois disso, o site compara as duas direções possíveis de mergulho:
      </p>
      <div class="theory-formula">
        Dip Direction possíveis = Strike + 90° ou Strike − 90°
      </div>
      <p>
        A direção escolhida é aquela cujo quadrante coincide com o quadrante informado no mergulho.
      </p>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'quadrant->rhr': `
      <h4>De Quadrante para Regra da Mão Direita (RHR)</h4>
      ${intro}
      <p>
        Primeiro o strike em quadrante é convertido para azimute numérico. Em seguida, o site
        interpreta o quadrante do mergulho para selecionar a direção de mergulho correta.
        Por fim, reescreve a atitude em formato RHR.
      </p>
      <div class="theory-formula">
        1) Converter strike em quadrante para azimute<br>
        2) Determinar Dip Direction compatível<br>
        3) Reescrever como Strike / Dip em RHR
      </div>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `,

    'quadrant->azimuth': `
      <h4>De Quadrante para Azimute do Strike</h4>
      ${intro}
      <p>
        Aqui o passo central é converter a direção de strike, escrita em quadrante,
        para um <strong>azimute numérico</strong>. O dip permanece igual.
      </p>
      <div class="theory-formula">
        NθE → θ<br>
        NθW → 360° − θ<br>
        SθE → 180° − θ<br>
        SθW → 180° + θ
      </div>
      <p>
        Em seguida, a direção do mergulho é definida a partir do quadrante informado no mergulho.
      </p>
      <div class="theory-formula">
        Exemplo didático: ${exFrom} → ${exTo}
      </div>
      ${normalizeMsg}
    `
  };

  container.innerHTML = theories[key] || `
    <h4>Base teórica da conversão</h4>
    ${intro}
    <p>
      O site transforma a atitude geológica para uma forma interna comum e depois a reescreve no formato selecionado.
    </p>
    <div class="theory-formula">
      Exemplo didático: ${exFrom} → ${exTo}
    </div>
    ${normalizeMsg}
  `;
}

// =========================================================
// Atualização de UI e mapeamento
// =========================================================
function updateSystemUI(){
  const { from, to } = getSelectedSystems();

  const resultPill = $('result-pill');
  if (resultPill && from && to) {
    resultPill.textContent = `${SYS_META[from].label} → ${SYS_META[to].label}`;
  }

  renderTheory();
}

function autoSelectColumns(){
  if (!state.headers.length) return;

  const names = state.headers.map(h => h.label.toLowerCase().trim());
  const { from } = getSelectedSystems();

  let idxDip = 0;
  let idxDir = Math.min(1, state.headers.length - 1);

  const findAny = (terms) => names.findIndex(n => terms.some(t => n.includes(t)));

  if (from === 'dip_dir'){
    const dip = findAny(['dip', 'mergulho']);
    const dir = findAny(['dip direction', 'dipdirection', 'dd', 'direção', 'direcao']);
    if (dip >= 0) idxDip = dip;
    if (dir >= 0) idxDir = dir;
  }

  if (from === 'rhr'){
    const dip = findAny(['dip', 'mergulho']);
    const strike = findAny(['rhr', 'strike']);
    if (dip >= 0) idxDip = dip;
    if (strike >= 0) idxDir = strike;
  }

  if (from === 'azimuth'){
    const dip = findAny(['dip', 'mergulho']);
    const strike = findAny(['azimute', 'azimuth', 'strike']);
    if (dip >= 0) idxDip = dip;
    if (strike >= 0) idxDir = strike;
  }

  if (from === 'quadrant'){
    const dipq = findAny(['mergulho', 'dip']);
    const strikeq = findAny(['strike']);
    if (dipq >= 0) idxDip = dipq;
    if (strikeq >= 0) idxDir = strikeq;
  }

  $('col-dip').value = String(Math.max(0, idxDip));
  $('col-dir').value = String(Math.max(0, idxDir));
}

function populateColumnSelectors(){
  ['col-dip', 'col-dir'].forEach(id => {
    const sel = $(id);
    if (!sel) return;
    sel.innerHTML = '';

    state.headers.forEach((h, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${colLetter(i)} — ${h.label}`;
      sel.appendChild(opt);
    });
  });
}

function refreshIfReady(){
  updateSystemUI();
  if (!hasLoadedSheet()) return;
  populateColumnSelectors();
  autoSelectColumns();
  renderResults();
}

// =========================================================
// Controle visual de seções
// =========================================================
function showProcessingSections(){
  $('mapping-section')?.classList.remove('hidden');
  $('results-section')?.classList.remove('hidden');
}

function resetProcessingSections(){
  $('mapping-section')?.classList.add('hidden');
  $('results-section')?.classList.add('hidden');
}

// =========================================================
// Leitura do arquivo Excel
// =========================================================
function handleFileInputChange(event){
  const input = event.target;
  if (!input) return;
  handleFile(input);
}

function handleFile(input){
  const file = input.files && input.files[0];
  if (!file) return;

  // NOVO/ALTERADO:
  // valida o tipo antes da leitura para evitar erro silencioso
  if (!isExcelFile(file)){
    $('file-badge').style.display = 'none';
    setStatus('status-file', 'Arquivo inválido. Envie um arquivo .xlsx ou .xls.', 'warn');
    resetProcessingSections();
    return;
  }

  $('file-badge').textContent = file.name;
  $('file-badge').style.display = 'inline-block';
  setStatus('status-file', 'Lendo arquivo...', '');

  const reader = new FileReader();

  reader.onload = function(e){
    try{
      // NOVO/ALTERADO:
      // leitura usando ArrayBuffer, que ficou mais estável no seu teste
      const data = e.target.result;

      state.workbook = XLSX.read(data, {
        type: 'array',
        cellDates: true,
        cellText: false
      });

      if (!state.workbook || !state.workbook.SheetNames || !state.workbook.SheetNames.length){
        setStatus('status-file', 'Não foi possível identificar abas válidas no arquivo.', 'warn');
        resetProcessingSections();
        return;
      }

      const firstSheet = state.workbook.SheetNames[0];
      const ws = state.workbook.Sheets[firstSheet];

      if (!ws){
        setStatus('status-file', 'A primeira aba da planilha não pôde ser lida.', 'warn');
        resetProcessingSections();
        return;
      }

      state.sheetData = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: '',
        raw: false
      });

      if (!state.sheetData || !state.sheetData.length){
        setStatus('status-file', 'A planilha está vazia.', 'warn');
        resetProcessingSections();
        return;
      }

      state.headers = (state.sheetData[0] || []).map((h, i) => ({
        label: String(h || `Coluna ${colLetter(i)}`),
        index: i
      }));

      if (!state.headers.length){
        setStatus('status-file', 'Não foi possível identificar o cabeçalho da planilha.', 'warn');
        resetProcessingSections();
        return;
      }

      populateColumnSelectors();
      autoSelectColumns();
      showProcessingSections();

      setStatus('status-file', `Arquivo carregado: ${file.name}`, 'ok');
      setStatus('status-map', 'Colunas detectadas automaticamente. Ajuste se necessário.', 'ok');

      renderResults();
    }catch(err){
      // NOVO/ALTERADO:
      // log mantido para facilitar depuração no console do navegador
      console.error('Erro ao ler planilha:', err);
      setStatus('status-file', 'Não foi possível ler o arquivo Excel.', 'warn');
      resetProcessingSections();
    }
  };

  reader.onerror = function(err){
    // NOVO/ALTERADO:
    // log explícito de erro de leitura do FileReader
    console.error('Erro de leitura do arquivo:', err);
    setStatus('status-file', 'Erro ao ler o arquivo selecionado.', 'warn');
    resetProcessingSections();
  };

  reader.readAsArrayBuffer(file);
}

// =========================================================
// Drag and drop do upload
// =========================================================
function bindDragAndDrop(){
  const uploadZone = $('upload-zone');
  if (!uploadZone) return;

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag');

    // NOVO/ALTERADO:
    // trabalha com FileList completo do evento de drop
    const files = e.dataTransfer.files;
    if (!files || !files.length) return;

    const file = files[0];

    if (!isExcelFile(file)){
      setStatus('status-file', 'Arquivo inválido. Envie um arquivo .xlsx ou .xls.', 'warn');
      return;
    }

    const input = $('file-input');
    if (!input) return;

    input.files = files;
    handleFile(input);
  });
}

// =========================================================
// Processamento e renderização dos resultados
// =========================================================
function renderResults(){
  if (!state.sheetData.length || !state.headers.length) return;

  const { from, to } = getSelectedSystems();
  const { colDir, colDip, start } = getMappingConfig();

  // NOVO/ALTERADO:
  // validação defensiva dos seletores
  if (Number.isNaN(colDir) || Number.isNaN(colDip)){
    setStatus('status-map', 'Selecione corretamente as colunas de direção/strike e de dip.', 'warn');
    return;
  }

  if (colDir === colDip){
    setStatus('status-map', 'As colunas de direção/strike e dip não devem ser a mesma.', 'warn');
  } else {
    setStatus('status-map', 'Mapeamento pronto para processamento.', 'ok');
  }

  const dataRows = state.sheetData
    .slice(start)
    .filter(row => row && row.some(cell => String(cell).trim() !== ''));

  state.processedRows = dataRows.map((row, idx) => {
    const rawDir = String(row[colDir] ?? '').trim();
    const rawDip = String(row[colDip] ?? '').trim();

    try{
      if (!rawDir && !rawDip) throw new Error('linha vazia');
      if (!rawDir) throw new Error('valor de direção/strike ausente');
      if (!rawDip) throw new Error('valor de dip ausente');

      const { dip, dipDir } = parseNormal(from, rawDir, rawDip);

      return {
        index: idx + 1,
        row,
        rawDir,
        rawDip,
        dip,
        dipDir,
        inputText: attStr(from, dip, dipDir),
        outputText: attStr(to, dip, dipDir),
        // NOVO/ALTERADO:
        // detalhe explícito para a coluna de diagnóstico
        detail: 'conversão realizada com sucesso',
        error: null
      };
    }catch(e){
      return {
        index: idx + 1,
        row,
        rawDir,
        rawDip,
        dip: null,
        dipDir: null,
        inputText: `${rawDir}${rawDip ? ' / ' + rawDip : ''}` || '(vazio)',
        outputText: 'erro',
        // NOVO/ALTERADO:
        // mantém a mensagem do erro para mostrar ao usuário
        detail: e.message || 'erro',
        error: e.message || 'erro'
      };
    }
  });

  renderList();
}

function renderList(){
  const list = $('results-list');
  if (!list) return;
  list.innerHTML = '';

  const total = state.processedRows.length;
  const valid = state.processedRows.filter(r => !r.error).length;
  const errors = total - valid;

  $('sum-total').textContent = total;
  $('sum-valid').textContent = valid;
  $('sum-errors').textContent = errors;
  $('btn-export').disabled = valid === 0;

  state.processedRows.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'result-row';

    row.innerHTML = `
      <div class="row-num">${r.index}</div>
      <div class="mono ${r.error ? '' : 'ok'}">${esc(r.inputText)}</div>
      <div class="mono ${r.error ? 'err' : 'ok'}">${esc(r.outputText)}</div>
      <div>
        <span class="status-chip ${r.error ? 'err' : 'ok'}">${r.error ? 'erro' : 'ok'}</span>
      </div>
      <div class="${r.error ? 'err' : ''}">${esc(r.detail || '')}</div>
    `;

    list.appendChild(row);
  });
}

// =========================================================
// Exportação da planilha convertida
// =========================================================
function exportXlsx(){
  if (!state.processedRows.length) return;

  const { from, to } = getSelectedSystems();

  const outputColumns = {
    dip_dir: ['Mergulho', 'Dip Direction'],
    rhr: ['Strike RHR', 'Mergulho'],
    azimuth: ['Azimute do Strike', 'Mergulho'],
    quadrant: ['Strike (Quadrante)', 'Mergulho + Quadrante']
  };

  function splitOutput(sys, record){
    if (record.error || record.dip == null || record.dipDir == null){
      return ['ERRO', record.detail || ''];
    }

    const strike = mod360(record.dipDir - 90);

    switch(sys){
      case 'dip_dir':
        return [fmt2(record.dip), fmt3(record.dipDir)];
      case 'rhr':
        return [fmt3(strike), fmt2(record.dip)];
      case 'azimuth':
        return [fmt3(strike), fmt2(record.dip)];
      case 'quadrant':
        return [
          strikeToQuadrantClassic(strike),
          `${fmt2(record.dip)}${azToDipQuadrant(record.dipDir)}`
        ];
      default:
        return ['', ''];
    }
  }

  try{
    const suggested = `atitudes_${from}_para_${to}.xlsx`;
    const fileName = window.prompt('Nome do arquivo de saída:', suggested);
    if (!fileName) return;

    const colsOut = outputColumns[to];
    const headerRow = [...state.headers.map(h => h.label), colsOut[0], colsOut[1]];
    const outRows = [headerRow];

    state.processedRows.forEach(record => {
      const original = state.headers.map(h => record.row[h.index] ?? '');
      const [v1, v2] = splitOutput(to, record);
      outRows.push([...original, v1, v2]);
    });

    const ws = XLSX.utils.aoa_to_sheet(outRows);
    ws['!cols'] = Array(headerRow.length).fill({ wch: 22 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Convertidas');

    const finalName = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
    XLSX.writeFile(wb, finalName);

    setStatus('status-export', `Arquivo exportado com sucesso: ${finalName}`, 'ok');
  }catch(err){
    console.error('Erro ao exportar planilha:', err);
    setStatus('status-export', 'Não foi possível exportar o arquivo.', 'warn');
  }
}

// =========================================================
// Binding de eventos
// =========================================================
function bindUIEvents(){
  const sysFrom = $('sys-from');
  const sysTo = $('sys-to');
  const fileInput = $('file-input');
  const colDir = $('col-dir');
  const colDip = $('col-dip');
  const rowStart = $('row-start');
  const btnExport = $('btn-export');

  if (sysFrom){
    sysFrom.addEventListener('change', () => {
      updateSystemUI();
      refreshIfReady();
    });
  }

  if (sysTo){
    sysTo.addEventListener('change', () => {
      updateSystemUI();
      refreshIfReady();
    });
  }

  if (fileInput){
    fileInput.addEventListener('change', handleFileInputChange);
  }

  if (colDir){
    colDir.addEventListener('change', renderResults);
  }

  if (colDip){
    colDip.addEventListener('change', renderResults);
  }

  if (rowStart){
    rowStart.addEventListener('change', renderResults);
  }

  if (btnExport){
    btnExport.addEventListener('click', exportXlsx);
  }
}

// =========================================================
// Inicialização
// =========================================================
function init(){
  const sysTo = $('sys-to');
  if (sysTo) sysTo.value = 'quadrant';

  bindUIEvents();
  bindDragAndDrop();
  updateSystemUI();
}

document.addEventListener('DOMContentLoaded', init);
