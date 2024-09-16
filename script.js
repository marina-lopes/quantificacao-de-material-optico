let numPavimentosEl = document.getElementById('num_pavimentos');
let pontosCFTVEl = document.getElementById('pontos_cftv');
let pontosVoIPEl = document.getElementById('pontos_voip');
let medidaBasicaEl = document.getElementById('medida_basica');
let especificacaoCaboEl = document.getElementById('especificacao_cabo');
let velocidadeEl = document.getElementById('velocidade');
let backboneSecundarioEl = document.getElementById('backbone_secundario');
let distanciaPrimarioEl = document.getElementById('distancia_backbone_primario');
let resultadoEl = document.getElementById('resultado');

const peDireito = 5;

numPavimentosEl.addEventListener('change', function () {
    const numPavimentos = parseInt(this.value);
    let container = document.getElementById('pavimentosInputContainer');
    container.innerHTML = '';

    for (let i = 1; i <= numPavimentos; i++) {
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
        const numPavimentos = parseInt(numPavimentosEl.value);
        for (let i = 1; i <= numPavimentos; i++) {
            const input = document.createElement('div');
            input.innerHTML = `
                <label for="cftv_${i}">Número de câmeras CFTV no pavimento ${i}:</label>
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
        const numPavimentos = parseInt(numPavimentosEl.value);
        for (let i = 1; i <= numPavimentos; i++) {
            const input = document.createElement('div');
            input.innerHTML =
                `<label for="voip_${i}">Número de pontos VoIP no pavimento ${i}:</label>
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

function calcularComprimentoFibra(numPavimentos) {
    comprimentoTotal = 0;

    for (let i = 2; i <= numPavimentos; i++) {
        comprimentoTotal += (i + 1) * peDireito;
    }

    return comprimentoTotal * 1.2;
}

function calcularNumeroFibrasDisponiveis(pontosTelecom, pontosCFTV, pontosVoIP) {
    let totalFibras = 0;
    let pontosRede = pontosTelecom * 2;

    // Considerando 1 par reserva para cada disciplina
    if (pontosCFTV > 0) {
        totalFibras += 4;
    }
    if (pontosVoIP > 0) {
        totalFibras += 4;
    }
    if ((pontosRede - pontosCFTV - pontosVoIP) > 0) {
        totalFibras += 4;
    }
}

function definirTipoFibra(velocidade, distanciaPrimario) {
    if (velocidade === 1000) {
        if (distanciaPrimario <= 260) {
            return {
                tipo: "Fibra Multimodo 62.5-µm",
                janela: "850 nm (1000Base-SX)"
            };
        } else if (distanciaPrimario <= 550) {
            return {
                tipo: "Fibra Multimodo 50-µm",
                janela: "850 nm (1000Base-SX)"
            };
        } else if (distanciaPrimario <= 440) {
            return {
                tipo: "Fibra Multimodo 62.5-µm",
                janela: "1310 nm (1000Base-LX)"
            };
        } else if (distanciaPrimario <= 750) {
            return {
                tipo: "Fibra Multimodo 50-µm",
                janela: "1310 nm (1000Base-LX)"
            };
        } else if (distanciaPrimario <= 3000) {
            return {
                tipo: "Fibra Monomodo 9-µm",
                janela: "1310 nm (1000Base-LX)"
            };
        }
    } else if (velocidade === 10000) {
        if (distanciaPrimario <= 300) {
            return {
                tipo: "Fibra Multimodo",
                janela: "850 nm (10GBase-SR)"
            };
        } else if (distanciaPrimario <= 10000) {
            return {
                tipo: "Fibra Monomodo",
                janela: "1310 nm (10GBase-LR)"
            };
        } else if (distanciaPrimario <= 40000) {
            return {
                tipo: "Fibra Monomodo",
                janela: "1550 nm (10GBase-X ou 10GBase-ER)"
            };
        }
    }

    return {
        tipo: "Não suportado.",
        janela: "N/A"
    };
}

function calcularInfraestrutura(pontosTelecom, pontosCFTV, pontosVoIP) {
    let pontosRede = pontosTelecom * 2;

    let qtdeCaixasCabo = Math.ceil((medidaBasicaEl * pontosRede) / 305);

    let numEspelhos = pontosTelecom;

    let numRJ45Femea = pontosRede;

    let patchCordAzul = pontosTelecom * 2 - pontosVoIP - pontosCFTV;
    let patchCableAzul = pontosRede - pontosCFTV - pontosVoIP; // Dados
    let patchCableVermelho = pontosCFTV; // CFTV
    let patchCableAmarelo = pontosVoIP; // VoIP

    let numPatchPanels = Math.ceil(pontosRede / 12);
    let numSwitches = numPatchPanels;
    let numOrgFrontais = numPatchPanels + numSwitches;

    const numBandejas = 4;
    const numExaustores = 2;

    let etiquetasPortasPP = numPatchPanels * 12;
    let etiquetasPP = numPatchPanels;
    let etiquetasPatchCable = patchCableAzul + patchCableAmarelo + patchCableVermelho;
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
        patchCableAzul,
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

function calcularBackboneOptico(numPavimentos, pontosTelecom, pontosCFTV, pontosVoIP) {
    const velocidade = parseInt(velocidadeEl.value);
    const distanciaPrimario = parseInt(distanciaPrimarioEl.value);

    let comprimentoFibra = calcularComprimentoFibra(numPavimentos);
    let numFibras = calcularNumeroFibrasDisponiveis(pontosTelecom, pontosCFTV, pontosVoIP);

    let tipoFibraExterna = definirTipoFibra(velocidade, distanciaPrimario);
    let tipoFibra = definirTipoFibra(velocidade, calcularComprimentoFibra(numPavimentos));

    let numDIO = Math.ceil(numPavimentos * numFibras / 24);
    let numAcopladorMM = 0;
    let numAcopladorSM = 0;
    let numBandejasDIO = 0;
    let numTO = 0;
    let numPigtailMMSimples = 0;
    let numPigtailMMDuplo = 0;
    let numCordaoOpticoMM = 0;
    let numPigtailSMSimples = 0;
    let numCordaoOpticoSM = 0;

    return {
        tipoFibra,
        tipoFibraExterna,
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

document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const numPavimentos = parseInt(numPavimentosEl.value);
    const pontosTelecom = Array.from(document.querySelectorAll('.pontos_telecom')).reduce((acc, input) => acc + parseInt(input.value || 0), 0);
    const pontosCFTV = pontosCFTVEl.value === 'sim' ? Array.from(document.querySelectorAll('.cftv_pavimento')).reduce((acc, input) => acc + parseInt(input.value), 0) : 0;
    const pontosVoIP = pontosVoIPEl.value === 'sim' ? Array.from(document.querySelectorAll('.voip_pavimento')).reduce((acc, input) => acc + parseInt(input.value), 0) : 0;

    let infraestrutura = calcularInfraestrutura(pontosTelecom, pontosCFTV, pontosVoIP);
    let backboneOptico = calcularBackboneOptico(numPavimentos, pontosTelecom, pontosCFTV, pontosVoIP);

    resultadoEl.innerHTML = `
        <h3>Materiais da Infraestrutura da Rede</h3>
        <p>Quantidade de cabo UTP cat. 6 (MH) (cxs):${infraestrutura.qtdeCaixasCabo}</p
        <p>Espelhos 4x4 - 2 furações: ${infraestrutura.numEspelhos}</p>
        <p>Tomada RJ45 fêmea cat. 6: ${infraestrutura.numRJ45Femea}</p>
        <p>Patch Cord cat. 6, azul, 3m: ${infraestrutura.patchCordAzul}</p>
        <p>Patch Cable cat. 6, Dados (azul) - 2,5m: ${infraestrutura.patchCableAzul}</p>
        <p>Patch Cable cat. 6, CFTV (vermelho) - 2,5m: ${infraestrutura.patchCableVermelho}</p>
        <p>Patch Cable cat. 6, VoIP (amarelo) - 2,5m: ${infraestrutura.patchCableAmarelo}</p>
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
        <p>Tipo de fibra óptica: ${backboneOptico.tipoFibra.tipo} - Janela: ${backboneOptico.tipoFibra.janela}</p>
        <p>Tipo de fibra óptica externa: ${backboneOptico.tipoFibraExterna.tipo} - Janela: ${backboneOptico.tipoFibraExterna.janela}</p>
        <p>Especificação do cabo: ${especificacaoCaboEl.value}</p>
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
