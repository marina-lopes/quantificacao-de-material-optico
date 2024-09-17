let numPavimentosEl = document.getElementById('num_pavimentos');
let pontosCFTVEl = document.getElementById('pontos_cftv');
let pontosVoIPEl = document.getElementById('pontos_voip');
let medidaBasicaEl = document.getElementById('medida_basica');
let especificacaoCaboEl = document.getElementById('especificacao_cabo');
let velocidadeEl = document.getElementById('velocidade');
let backboneSecundarioEl = document.getElementById('backbone_secundario');
let distanciaPrimarioEl = document.getElementById('distancia_backbone_primario');
let resultadoEl = document.getElementById('resultado');
var infraestrutura;
var backboneOptico;

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

    return totalFibras;
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

function calcularInfraestrutura(pontosTelecom, pontosCFTV, pontosVoIP, medidaBasica) {
    let pontosRede = pontosTelecom * 2;

    let qtdeCaixasCabo = Math.ceil((medidaBasica * pontosRede) / 305);

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

    let tipoFibra = definirTipoFibra(velocidade, calcularComprimentoFibra(numPavimentos));

    let numDIO = Math.ceil(numPavimentos * numFibras / 24);
    
    let numAcopladorMM = numFibras * (numPavimentos - 1) / 2;
    let numAcopladorSM = numFibras / 2;
    
    let numBandejasDIO = Math.ceil(numFibras * numPavimentos / 12);
    
    let numTO = Math.ceil(numFibras * (numPavimentos - 1) / 8);
    
    let numPigtailMMSimples = numFibras * (numPavimentos - 1);
    let numPigtailMMDuplo = numFibras * (numPavimentos - 1) / 2;
    let numPigtailSMSimples = numFibras;
    let numCordaoOpticoSM = numFibras / 2;
    let numCordaoOpticoMM = numTO * numFibras / 2 + numCordaoOpticoSM;

    return {
        tipoFibra,
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
    const medidaBasica = parseInt(medidaBasicaEl.value);

    infraestrutura = calcularInfraestrutura(pontosTelecom, pontosCFTV, pontosVoIP, medidaBasica);
    backboneOptico = calcularBackboneOptico(numPavimentos, pontosTelecom, pontosCFTV, pontosVoIP);

    resultadoEl.innerHTML = `
        <table id="tabelaBackbone">
            <caption>BACKBONE ÓPTICO</caption>
            <tr>
                <th>Descrição</th>
                <th>Item</th>
                <th>Quantidade</th>
            </tr>
            <tr>
                <td>Cabo de Fibra Óptica ${especificacaoCaboEl.value} - ${backboneOptico.tipoFibra.tipo} - ${backboneOptico.tipoFibra.janela}</td>
                <td>Metro(s)</td>
                <td>${backboneOptico.comprimentoFibra}</td>
            </tr>
            <tr>
                <td>Chassi DIO - 24 portas - 1U - 9"</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numDIO}</td>
            </tr>
            <tr>
                <td>Acoplador Óptico 50 x 125µm - MM - LC - Duplo</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numAcopladorMM}</td>
            </tr>
            <tr>
                <td>Acoplador Óptico 9 x 125µm - SM - LC - Duplo</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numAcopladorSM}</td>
            </tr>
            <tr>
                <td>Bandeja para Emenda de Fibra no DIO - até 12 emendas</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numBandejasDIO}</td>
            </tr>
            <tr>
                <td>Terminador Óptico - para 8 fibras</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numTO}</td>
            </tr>
            <tr>
                <td>Pig Tail 50 x 125µm - MM - 1,5m - Simples - Conector LC</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numPigtailMMSimples}</td>
            </tr>
            <tr>
                <td>Pig Tail 50 x 125µm - MM 3,0m - Duplo - Conector LC</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numPigtailMMDuplo}</td>
            </tr>
            <tr>
                <td>Pig Tail 50 x 125µm- SM - 1,5m - Simples - Conector LC</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numPigtailSMSimples}</td>
            </tr>
            <tr>
                <td>Cordão Óptico 50 x 125µm - MM - 3m - Duplo - Conector LC</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numCordaoOpticoMM}</td>
            </tr>
            <tr>
                <td>Cordão Óptico 9 x 125µm - SM - 3m - Duplo - Conector LC</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numCordaoOpticoSM}</td>
            </tr>
        </table>
        <table id="tabelaInfraestrutura">
            <caption>MATERIAIS DA INFRAESTRUTURA DA REDE</caption>
            <tr>
                <th>Descrição</th>
                <th>Item</th>
                <th>Quantidade</th>
            </tr>
            <tr>
                <td>Cabo UTP categoria 6 (MH)</td>
                <td>Caixa(s)</td>
                <td>${infraestrutura.qtdeCaixasCabo}</td>
            </tr>
            <tr>
                <td>Tomada RJ45 fêmea categoria 6</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.numRJ45Femea}</td>
            </tr>
            <tr>
                <td>Espelhos 4x4 - 2 furações/entradas</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.numEspelhos}</td>
            </tr>
            <tr>
                <td>Patch Cord categoria 6 - azul - 3m</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.patchCordAzul}</td>
            </tr>
            <tr>
                <td>Patch Panel categoria 6 - 24 portas (PPMH)</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.numPatchPanels}</td>
            </tr>
            <tr>
                <td>Organizador de Cabo Frontal - 1U</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.numOrgFrontais}</td>
            </tr>
            <tr>
                <td>Bandeja Fixa</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.numBandejas}</td>
            </tr>
            <tr>
                <td>Patch Cable categoria 6 - Azul/Dados - 2,5m</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.patchCableAzul}</td>
            </tr>
            <tr>
                <td>Patch Cable categoria 6 - Amarelo/VoIP - 2,5m</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.patchCableAmarelo}</td>
            </tr>
            <tr>
                <td>Patch Cable categoria 6 - Vermelho/CFTV - 2,5m</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.patchCableVermelho}</td>
            </tr>
            <tr>
                <td>Rack Fechado - 19" - em U</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.tamanhoRack}</td>
            </tr>
            <tr>
                <td>Exaustor - 19"</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.numExaustores}</td>
            </tr>
        </table>
        <table id="tabelaMiscelanea">
            <caption>MISCELÂNEA</caption>
            <tr>
                <th>Descrição</th>
                <th>Item</th>
                <th>Quantidade</th>
            </tr>
            <tr>
                <td>Etiquetas de Identificação da Porta - Patch Panel</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.etiquetasPortasPP}</td>
            </tr>
            <tr>
                <td>Etiquetas de Identificação - Patch Cable</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.etiquetasPatchCable}</td>
            </tr>
            <tr>
                <td>Etiquetas de Identificação - Patch Panel</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.etiquetasPP}</td>
            </tr>
            <tr>
                <td>Etiquetas de Identificação - Tomadas e Espelhos</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.etiquetasTomadasEspelhos}</td>
            </tr>
            <tr>
                <td>Etiquetas de Identificação - Cabos UTP - MH</td>
                <td>Unidade(s)</td>
                <td>${infraestrutura.etiquetasCabosUTP}</td>
            </tr>
        </table>
    `;
});

const downloadXLSX = () => {
    if(infraestrutura === null){
       alert("Não há dados");
    }else{
        var workSheet;
        const workBook = XLSX.utils.book_new();
        workBook.Props = {
            Title: 'Titulo',
            Subject: 'Assunto',
            Author:  'Autor',
            CreateDate: new Date()
        };

        //tabela backbone
        workBook.SheetNames.push('Backbone');
        dados = [
            //linhas
            ['Descrição', 'Item', 'Quantidade'], //colunas
            ['Cabo de Fibra Óptica Tight Buffer - FOMMIG - 50 x 125µm - 8 fibras', 'Metro(s)', backboneOptico.numFibras],
            ['Chassi DIO - 24 portas - 1U - 9"', 'Unidades(s)', backboneOptico.numDIO],
            ['Acoplador Óptico 50 x 125µm - MM - LC - Duplo', 'Unidades(s)', backboneOptico.numAcopladorMM],
            ['Acoplador Óptico 9 x 125µm - SM - LC - Duplo', 'Unidades(s)', backboneOptico.numAcopladorSM],
            ['Bandeja para Emenda de Fibra no DIO - até 12 emendas', 'Unidades(s)', backboneOptico.numBandejasDIO],
            ['Terminador Óptico - para 8 fibras', 'Unidades(s)', backboneOptico.numTO],
            ['Pig Tail 50 x 125µm - MM - 1,5m - Simples - Conector LC', 'Unidades(s)', backboneOptico.numPigtailMMSimples],
            ['Pig Tail 50 x 125µm - MM 3,0m - Duplo - Conector LC', 'Unidades(s)', backboneOptico.numPigtailMMDuplo],
            ['Pig Tail 50 x 125µm- SM - 1,5m - Simples - Conector LC', 'Unidades(s)', backboneOptico.numPigtailSMSimples],
            ['Cordão Óptico 50 x 125µm - MM - 3m - Duplo - Conector LC', 'Unidades(s)', backboneOptico.numCordaoOpticoMM],
            ['Cordão Óptico 9 x 125µm - SM - 3m - Duplo - Conector LC', 'Unidades(s)', backboneOptico.numCordaoOpticoSM]
        ]
        workSheet = XLSX.utils.aoa_to_sheet(dados);
        workBook.Sheets['Backbone'] = workSheet;


        //tabela infraestrutura
        workBook.SheetNames.push('Infraestrutura');
        var dados = [
            //linhas
            ['Descrição', 'Item', 'Quantidade'], //colunas
            ['Cabo UTP categoria 6 (MH)', 'Caixa(s)', infraestrutura.qtdeCaixasCabo],
            ['Tomada RJ45 fêmea categoria 6', 'Unidades(s)', infraestrutura.numRJ45Femea],
            ['Espelhos 4x4 - 2 furações/entradas', 'Unidades(s)', infraestrutura.numEspelhos],
            ['Patch Cord categoria 6 - azul - 3m', 'Unidades(s)', infraestrutura.patchCordAzul],
            ['Patch Panel categoria 6 - 24 portas (PPMH)', 'Unidades(s)', infraestrutura.numPatchPanels],
            ['Organizador de Cabo Frontal - 1U', 'Unidades(s)', infraestrutura.numOrgFrontais],
            ['Bandeja Fixa', 'Unidades(s)', infraestrutura.numBandejas],
            ['Patch Cable categoria 6 - Azul/Dados - 2,5m', 'Unidades(s)', infraestrutura.patchCableAzul],
            ['Patch Cable categoria 6 - Amarelo/VoIP - 2,5m', 'Unidades(s)', infraestrutura.patchCableAmarelo],
            ['Patch Cable categoria 6 - Vermelho/CFTV - 2,5m', 'Unidades(s)', infraestrutura.patchCableVermelho],
            ['Rack Fechado - kargura de 19" - em U', 'Unidades(s)', infraestrutura.tamanhoRack],
            ['Exaustor - 19"', 'Unidades(s)', infraestrutura.numExaustores]
        ];
        workSheet = XLSX.utils.aoa_to_sheet(dados);
        workBook.Sheets['Infraestrutura'] = workSheet;

        //tabela miscelanea
        workBook.SheetNames.push('Miscelânea');
        dados = [
            //linhas
            ['Descrição', 'Item', 'Quantidade'], //colunas
            ['Etiquetas de Identificação da Porta - Patch Panel', 'Unidades(s)', infraestrutura.etiquetasPortasPP],
            ['Etiquetas de Identificação - Patch Cable', 'Unidades(s)', infraestrutura.etiquetasPatchCable],
            ['Etiquetas de Identificação - Patch Panel', 'Unidades(s)', infraestrutura.etiquetasPP],
            ['Etiquetas de Identificação - Tomadas e Espelhos', 'Unidades(s)', infraestrutura.etiquetasTomadasEspelhos],
            ['Etiquetas de Identificação - Cabos UTP - MH', 'Unidades(s)', infraestrutura.etiquetasCabosUTP]
        ]
        workSheet = XLSX.utils.aoa_to_sheet(dados);
        workBook.Sheets['Miscelânea'] = workSheet;

        XLSX.writeFile(workBook, 'Relatório 1.xlsx', {bookType: 'xlsx', type: 'bynary'})
    }
};  

document.getElementById('download').addEventListener('click', () => {
    downloadXLSX();
});
