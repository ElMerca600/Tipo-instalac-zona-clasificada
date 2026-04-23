/**
 * Logic Engine for EX-SELECTOR PRO
 * Implementación 'Stateless' para cumplir con los requerimientos técnicos y normas IEC
 */

const T_MAP = [
  { label: 'T1', val: 450 }, { label: 'T2', val: 300 },
  { label: 'T3', val: 200 }, { label: 'T4', val: 135 },
  { label: 'T5', val: 100 }, { label: 'T6', val: 85 }
];

const GAS_DATA = {
  'IIA': { gas: 'Propano', tIgn: 450, micInfo: 'Relación > 0.8 (MIC ~144mA)' },
  'IIB': { gas: 'Etileno', tIgn: 425, micInfo: 'Relación 0.45 a 0.8 (MIC ~82mA)' },
  'IIC': { gas: 'Hidrógeno', tIgn: 560, micInfo: 'Relación < 0.45 (MIC ~20mA)' }
};

function updateGasInfo() {
  const g = document.getElementById('in-grupo').value;
  const info = GAS_DATA[g];
  const gasEl = document.getElementById('gas-info');
  gasEl.innerHTML = `Rep.: <span class="text-emerald-400 font-bold">${info.gas}</span><br>
    <span class="opacity-75">T. Ign. Normativa:</span> ${info.tIgn}°C<br>
    <span class="opacity-75">Energía:</span> ${info.micInfo}`;
  gasEl.classList.remove('hidden');
}

document.getElementById('in-grupo').addEventListener('change', updateGasInfo);
document.addEventListener('DOMContentLoaded', updateGasInfo);

const engine = {
  run() {
    const zona = document.getElementById('in-zona').value;
    const grupo = document.getElementById('in-grupo').value;
    const tIgn = parseFloat(document.getElementById('in-tign').value);
    
    // Validar input
    if (isNaN(tIgn) || tIgn <= 0) {
      alert("Por favor, ingrese una temperatura de ignición válida.");
      return;
    }
    
    let epl = zona === '0' ? 'Ga' : zona === '1' ? 'Gb' : 'Gc';
    let method = '';
    let analysis = '';
    let cite = '';

    // Rule 1: Zone/Method Logic
    if (zona === '0') {
      method = 'Ex ia';
      analysis = 'Zona 0 requiere EPL Ga. El único método permitido por IEC 60079-11 es Seguridad Intrínseca (ia).';
      cite = 'Ref: IEC 60079-14 Cláusula 5.4.2';
    } else if (zona === '1') {
      method = (grupo === 'IIC') ? 'Ex db eb' : 'Ex d';
      analysis = `Zona 1 requiere EPL Gb. Se sugiere Envolvente Antideflagrante (Ex d) ${grupo === 'IIC' ? 'con precauciones especiales por grupo IIC.' : 'estándar.'}`;
      cite = 'Ref: IEC 60079-1 / 60079-7';
    } else {
      method = 'Ex ec';
      analysis = 'Zona 2 requiere EPL Gc. Se sugiere Seguridad Aumentada (ec) para equipos no chispeantes.';
      cite = 'Ref: IEC 60079-7 Cláusula 4';
    }

    // Rule 2: Thermal Calc (0.8 Margin)
    const limit = tIgn * 0.8;
    const tClass = T_MAP.find(t => t.val <= limit) || { label: 'T6', val: 85 };

    // UI Update
    document.getElementById('res-marking').textContent = `${method} ${grupo} ${tClass.label} ${epl}`;
    document.getElementById('res-analysis').textContent = analysis;
    document.getElementById('res-cite').textContent = cite;
    
    // Adaptación de la representación de la fórmula para renderizado nativo sin dependencias LaTeX
    document.getElementById('res-formula').textContent = `T_s ≤ ${tIgn} × 0.8 = ${limit.toFixed(1)}°C → ${tClass.label}`;
    
    // Desglose del marcado
    let breakdownHTML = `
      <li><strong class="text-fuchsia-400 font-mono">Ex:</strong> Eq. a prueba de explosión (Según IEC 60079)</li>
      <li><strong class="text-fuchsia-400 font-mono">${method.replace('Ex ', '')}:</strong> ${method.includes('ia') ? 'Seguridad Intrínseca (Limita energía de chispa)' : method.includes('db eb') ? 'Envolvente Antideflagrante (Contiene explosión) con terminal Ex e' : method.includes('d') ? 'Envolvente Antideflagrante (Contiene explosión)' : 'Seguridad Aumentada (Diseño que evita chispas)'}</li>
      <li><strong class="text-fuchsia-400 font-mono">${grupo}:</strong> Grupo de Gas (Atmósferas tipo ${GAS_DATA[grupo].gas})</li>
      <li><strong class="text-fuchsia-400 font-mono">${tClass.label}:</strong> Clase de Temperatura (Superficie máx. ${tClass.val}°C)</li>
      <li><strong class="text-fuchsia-400 font-mono">${epl}:</strong> Nivel de Protección de Equipo (EPL ${epl === 'Ga' ? 'Muy Alto - Apto Zona 0' : epl === 'Gb' ? 'Alto - Apto Zona 1' : 'Normal - Apto Zona 2'})</li>
    `;
    document.getElementById('res-meaning').innerHTML = breakdownHTML;

    // Mostrar resultados con animación
    document.getElementById('res-panel').classList.remove('hidden');
  }
};

// Bind evento de cálculo al botón
document.getElementById('btn-calculate').addEventListener('click', () => engine.run());

// También permitir calcular usando la tecla Enter en el input de temperatura
document.getElementById('in-tign').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    engine.run();
  }
});
