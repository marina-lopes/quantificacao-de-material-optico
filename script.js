let numPavimentosEl = parseInt(document.getElementById('num_pavimentos').value);
let pontosCFTVEl = document.getElementById('pontos_cftv').value === 'sim' ? Array.from(document.querySelectorAll('.cftvPavimento')).reduce((acc, input) => acc + parseInt(input.value), 0) : 0;
let pontosVoIPEl = document.getElementById('pontos_voip').value === 'sim' ? Array.from(document.querySelectorAll('.voipPavimento')).reduce((acc, input) => acc + parseInt(input.value), 0) : 0;
let medidaBasicaEl = parseInt(document.getElementById('medida_basica').value);
let especificacaoCaboEl = document.getElementById('especificacao_cabo').value;
let velocidadeEl = parseInt(document.getElementById('velocidade').value);
let backboneSecundarioEl = document.getElementById('backbone_secundario');
let distanciaPrimarioEl = parseInt(document.getElementById('distancia_backbone_primario').value);
let resultadoEl = document.getElementById('resultado');

const peDireito = 5;

numPavimentosEl.addEventListener('change', function () {
    let container = document.getElementById('pavimentosInputContainer');
    container.innerHTML = '';

    for (let i = 1; i <= numPavimentosEl; i++) {
        let input = document.createElement('div');
        input.innerHTML = `
                    <label for="pavimento_${i}">Número de pontos de telecom no pavimento ${i}: </label>
                    <input type="number" id="pavimento_${i}" class="pontos_telecom" required><br>
                    `;
        container.appendChild(input);
    }
});

pontosCFTVEl.addEventListener('change', function () {
    const possuiCFTV = this.value;
    const container = document.getElementById('cftvsInputContainer');
    container.innerHTML = '';

    if (possuiCFTV === 'sim') {
        for (let i = 1; i <= numPavimentosEl; i++) {
            const input = document.createElement('div');
            input.innerHTML = `
                <label for="cftv_${i}">Quantidade de câmeras CFTV no pavimento ${i}:</label>
                <input type="number" id="cftv_${i}" class="cftv_pavimento" required><br>
                `;
            container.appendChild(input);
        }
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
});

pontosVoIPEl.addEventListener('change', function () {
    const possuiVoIP = this.value;
    const container = document.getElementById('voipsInputContainer');
    container.innerHTML = '';

    if (possuiVoIP === 'sim') {
        const numPavimentos = parseInt(document.getElementById('numPavimentos').value);
        for (let i = 1; i <= numPavimentos; i++) {
            const input = document.createElement('div');
            input.innerHTML =
                `<label for="voip_${i}">Quantidade de pontos VOIP no pavimento ${i}:</label>
                <input type="number" id="voip_${i}" class="voip_pavimento" required><br>`;
            container.appendChild(input);
        }
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
});

backboneSecundarioEl.addEventListener('change', function () {
    const possuiBackboneSecundario = this.value;
    const distanciaContainer = document.getElementById('distanciaPrimarioContainer');
    const pavimentosContainer = document.getElementById('pavimentosInputContainer');

    if (possuiBackboneSecundario === 'sim') {
        distanciaContainer.classList.remove('hidden');
    } else {
        distanciaContainer.classList.add('hidden');
        pavimentosContainer.innerHTML = '';
    }
});

function calcularComprimentoFibra(numPavimentosEl) {
    comprimentoTotal = 0;

    for (let i = 2; i <= numPavimentosEl; i++) {
        comprimentoTotal += (i + 1) * peDireito;
    }

    return comprimentoTotal;
}

/*
function determinarTipoFibra(velocidadeEl, distanciaPrimarioEl) {
    let limitesFibra = {
        om1: { fastEthernet: 2000, gigabit: 275, dezGigabit: 33 },
        om2: { fastEthernet: 2000, gigabit: 550, dezGigabit: 82 },
        om3: { fastEthernet: 2000, gigabit: 1000, dezGigabit: 300 },
        om4: { fastEthernet: 2000, gigabit: 1100, dezGigabit: 400 },
        om5: { fastEthernet: 2000, gigabit: 1100, dezGigabit: 400 }
    };
}
*/

function calcularInfraestrutura(pontosTelecom, pontosCFTV, pontosVoIP) {
    let totalPontosRede = (pontosTelecom - pontosVoIP - pontosCFTV) * 2;
    
    let qtdeCaixasCabo = Math.ceil((medidaBasicaEl * totalPontosRede)/305);

    let numEspelhos = pontosTelecom;

    let numRJ45Femea = pontosTelecom * 2;

    let patchCordAzul = pontosTelecom * 2 - pontosVoIP - pontosCFTV; // Dados
    let patchCableVermelho = pontosCFTV; // CFTV
    let patchCableAmarelo = pontosVoIP; // VoIP

    let numPatchPanels = Math.ceil(totalPontosRede / 12);
    let numSwitches = numPatchPanels;
    let numOrgFrontais = numPatchPanels + numSwitches;

    const numBandejas = 4;
    const numExaustores = 2;

    let etiquetasPortasPP = numPatchPanels * 12;
    let etiquetasPP = numPatchPanels;
    let etiquetasPatchCable = patchCableAmarelo + patchCableVermelho;
    let etiquetasTomadasEspelhos = numRJ45Femea + numEspelhos;
    let etiquetasCabosUTP = numRJ45Femea * 2;

    let tamanhoRack = Math.ceil(numPatchPanels + numSwitches + numOrgFrontais + numBandejas + numExaustores) * 1.5;

    if (tamanhoRack % 4 != 0) {
        tamanhoRack += (4 - tamanhoRack % 4);
    }

    return {
        qtdeCaixasCabo,
        numEspelhos,
        numRJ45Femea,
        patchCordAzul,
        patchCableVermelho,
        patchCableAmarelo,
        numPatchPanels,
        numSwitches,
        numOrgFrontais,
        numBandejas,
        numExaustores,
        tamanhoRack,
        etiquetasPortasPP,
        etiquetasPP,
        etiquetasPatchCable,
        etiquetasTomadasEspelhos,
        etiquetasCabosUTP
    };
}

function calcularBackboneOptico(numPavimentosEl) {
    let comprimentoFibra = calcularComprimentoFibra(numPavimentosEl);

// Calcular

    let numDIO;
    let numAcopladorMM;
    let numAcopladorSM;
    let numBandejasDIO;
    let numTO;
    let numPigtailMMSimples;
    let numPigtailMMDuplo;
    let numCordaoOpticoMM;
    let numPigtailSMSimples;
    let numCordaoOpticoSM;

    return {
        comprimentoFibra,
        numDIO,
        numAcopladorMM,
        numAcopladorSM,
        numBandejasDIO,
        numTO,
        numPigtailMMSimples,
        numPigtailMMDuplo,
        numCordaoOpticoMM,
        numPigtailSMSimples,
        numCordaoOpticoSM
    };
}

let infraestrutura = calcularInfraestrutura(pontosTelecom, pontosCFTV, voip);
let backboneOptico = calcularBackboneOptico(numPavimentosEl);

document.getElementById('form').addEventListener('submit', function (event) {
    resultadoEl.innerHTML = `
        <h3>Materiais da Infraestrutura da Rede</h3>
        <p>Quantidade de cabo UTP cat. 6 (MH) (cxs):${infraestrutura.qtdeCaixasCabo} </p
        <p>Espelhos 4x4 - 2 furações: ${infraestrutura.numEspelhos}</p>
        <p>Tomada RJ45 fêmea cat. 6: ${infraestrutura.numRJ45Femea}</p>
        <p>Patch Cord cat. 6, azul, 3m: ${infraestrutura.patchCordAzul}</p>
        <p>Patch Cable cat. 6, CFTV (vermelho) - 2,5m: ${infraestrutura.patchCableVermelho}</p>
        <p>Patch Cable cat. 6, VOIP (amarelo) - 2,5m: ${infraestrutura.patchCableAmarelo}</p>
        <p>Patch Panel cat. 6, 12 portas (PPMH): ${infraestrutura.numPatchPanels}</p>
        <p>Switch: ${infraestrutura.numSwitches}</p>
        <p>Organizador de cabo frontal (1U): ${infraestrutura.numOrgFrontais}</p>
        <p>Bandeja fixa: ${infraestrutura.numBandejas}</p>
        <p>Exaustor 19": ${infraestrutura.numExaustores}</p>
        <p>Rack fechado, largura 19" (em U): ${infraestrutura.tamanhoRack}</p>
        
        <p>Etiquetas de identificação da porta do Patch Panel: ${infraestrutura.etiquetasPortasPP}</p>
        <p>Etiquetas de identificação do Patch Panel: ${infraestrutura.etiquetasPP}</p>
        <p>Etiquetas de identificação de Patch Cable: ${infraestrutura.etiquetasPatchCable}</p>
        <p>Etiquetas de identificação de tomadas e espelhos: ${infraestrutura.etiquetasTomadasEspelhos}</p>
        <p>Etiquetas de identificação de Cabos UTP - MH: ${infraestrutura.etiquetasCabosUTP}</p>

        <h3>Materiais do Backbone Óptico</h3>
        <p>Tipo de fibra óptica: ${tipoFibra}</p>
        <p>Comprimento da fibra óptica: ${backboneOptico.comprimentoFibra} metros</p>
        <p>Chassi DIO com 24 portas - 1U - 19": ${backboneOptico.numDIO}</p>
        <p>Acoplador óptico 50x125µm - MM - LC - duplo: ${backboneOptico.numAcopladorMM}</p>
        <p>Acoplador óptico 9x125µm - SM - LC - duplo: ${backboneOptico.numAcopladorSM}</p>
        <p>Bandeja para emenda de fibra no DIO (12 emendas): ${backboneOptico.numBandejasDIO}</p>
        <p>Terminador Óptico para 8 fibras: ${backboneOptico.numTO}</p>
        
        <p>Pigtail 50x125µm - MM - 1,5m - LC - simples: ${backboneOptico.numPigtailMMSimples}</p>
        <p>Pigtail 50x125µm - MM - 1,5m - LC - duplo: ${backboneOptico.numPigtailMMDuplo}</p>
        <p>Cordão Óptico 50x125µm - MM - 3m - LC - duplo: ${backboneOptico.numCordaoOpticoMM}</p>
        
        <p>Pigtail 50x125µm - SM - 1,5m - LC - simples: ${backboneOptico.numPigtailSMSimples}</p>        
        <p>Cordão Óptico 9x125µm - SM - 3m - LC - duplo: ${backboneOptico.numCordaoOpticoSM}</p>
    `;
});
