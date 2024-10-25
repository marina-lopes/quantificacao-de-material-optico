//BACKBONE PRIMÁRIO
let backboneSecundarioEl = document.getElementById('backbone_secundario');
let distanciaPrimarioEl = document.getElementById('distancia_backbone_primario');
let tipoFOPrimarioEl = document.getElementById('tipos_fo_primario');
let especificacaoCaboPrimarioEl = document.getElementById('especificacao_cabo_primario');

//BACKBONE SECUNDÁRIO
let numPavimentosEl = document.getElementById('num_pavimentos');
let medidaBasicaEl = document.getElementById('medida_basica');
let tipoFOEl = document.getElementById('tipos_fo');
let especificacaoCaboEl = document.getElementById('especificacao_cabo');
let numFibrasEl = document.getElementById('num_fibras');

//RESULTADO
let resultadoEl = document.getElementById('resultado');
var backboneOptico;

backboneSecundarioEl.addEventListener('change', function () {
    const possuiBackboneSecundario = this.value;
    const backbonePrimarioContainer = document.getElementById('backbonePrimarioContainer');

    if (possuiBackboneSecundario === 'sim') {
        backbonePrimarioContainer.classList.remove('hidden');
    } else {
        backbonePrimarioContainer.classList.add('hidden');
    }
});

function calcularComprimentoFibra(numPavimentos) {
    comprimentoTotal = 0;
    const peDireito = parseInt(medidaBasicaEl.value);

    for (let i = 2; i <= numPavimentos; i++) {
        comprimentoTotal += (i + 1) * peDireito;
    }

    return comprimentoTotal * 1.2;
}

function definirTipoFibra(tipoFibra, distancia) {
    let transceiver = '';
    let janela = 0;

    switch (tipoFibra) {
        case 'multimodo':
            switch (true) {
                case (distancia <= 260):
                    transceiver = '1000Base-SX';
                    janela = 850;
                    break;
                case (distancia <= 300):
                    transceiver = '10GBase-SR';
                    janela = 850;
                    break;
                case (distancia <= 440):
                    transceiver = '1000Base-LX';
                    janela = 1310;
                    break;
                case (distancia <= 550):
                    transceiver = '1000Base-SX';
                    janela = 850;
                    break;
                case (distancia <= 750):
                    transceiver = '1000Base-LX';
                    janela = 1310;
                    break;
                default:
                    transceiver = 'Distância inválida para fibra multimodo';
            }
            break;

        case 'monomodo':
            switch (true) {
                case (distancia <= 3000):
                    transceiver = '1000Base-LX';
                    janela = 1310;
                    break;
                case (distancia <= 10000):
                    transceiver = '10GBase-LR';
                    janela = 1310;
                    break;
                case (distancia <= 40000):
                    transceiver = '10GBase-ER';
                    janela = 1550;
                    break;
                default:
                    transceiver = 'Distância inválida para fibra monomodo';
            }
            break;

        default:
            transceiver = 'Tipo de fibra inválido';
    }

    return { transceiver, janela };
}

function calcularBackboneOptico(distanciaPrimario, tipoFOPrimario, numPavimentos, numFibras, tipoFO) {

    let tipoFibraPrimario = definirTipoFibra(tipoFOPrimario, distanciaPrimario);

    //BACKBONE PRIMÁRIO
    let comprimentoFibraPrimario = distanciaPrimario;

    //BACKBONE SECUNDÁRIO
    let comprimentoFibra = calcularComprimentoFibra(numPavimentos);

    let tipoFibra = definirTipoFibra(tipoFO, comprimentoFibra);

    let numDIO = Math.ceil(numPavimentos * numFibras / 24);

    let numAcopladorMM = numFibras * (numPavimentos - 1) / 2;
    let numAcopladorSM = numFibras / 2;

    let numBandejasDIO = Math.ceil(numFibras * numPavimentos / 12);

    let numTO = numPavimentos - 1;

    let numPigtailMMSimples = numFibras * (numPavimentos - 1);
    let numPigtailMMDuplo = numFibras * (numPavimentos - 1) / 2;
    let numPigtailSMSimples = numFibras;
    let numCordaoOpticoSM = numFibras / 2;
    let numCordaoOpticoMM = numTO * numFibras / 2;

    return {
        tipoFibraPrimario,
        comprimentoFibraPrimario,
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

    const distanciaPrimario = parseInt(distanciaPrimarioEl.value);
    const numPavimentos = parseInt(numPavimentosEl.value);
    const numFibras = parseInt(numFibrasEl.value);
    const medidaBasica = parseInt(medidaBasicaEl.value);

    backboneOptico = calcularBackboneOptico(distanciaPrimario, tipoFOPrimarioEl, numPavimentos, numFibras, tipoFOEl);

    resultadoEl.innerHTML = `
        <table id="tabelaBackbone">
            <caption>BACKBONE ÓPTICO</caption>
            <tr>
                <th>Descrição</th>
                <th>Item</th>
                <th>Quantidade</th>
            </tr>
            <tr>
                <td>Cabo de Fibra Óptica ${especificacaoCaboPrimarioEl.value} - ${backboneOptico.tipoFibraPrimario.transceiver} - ${backboneOptico.tipoFibraPrimario.janela}</td>
                <td>Metro(s)</td>
                <td>${backboneOptico.comprimentoFibraPrimario}</td>
            </tr>
            <tr>
                <td>Cabo de Fibra Óptica ${especificacaoCaboEl.value} - ${backboneOptico.tipoFibra.transceiver} - ${backboneOptico.tipoFibra.janela}</td>
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
    `;
});

const downloadXLSX = () => {
    if (infraestrutura === null) {
        alert("Não há dados");
    } else {
        var workSheet;
        const workBook = XLSX.utils.book_new();
        workBook.Props = {
            Title: 'Titulo',
            Subject: 'Assunto',
            Author: 'Autor',
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

        XLSX.writeFile(workBook, 'Relatório 1.xlsx', { bookType: 'xlsx', type: 'bynary' })
    }
};

document.getElementById('download').addEventListener('click', () => {
    downloadXLSX();
});
