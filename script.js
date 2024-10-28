//BACKBONE PRIMÁRIO
let backboneSecundarioEl = document.getElementById('backbone_secundario');
let distanciaPrimarioEl = document.getElementById('distancia_backbone_primario');
let tipoFOPrimarioEl = document.getElementById('tipos_fo_primario');
let especificacaoCaboPrimarioEl = document.getElementById('especificacao_cabo_primario');
let distanciaPrimario;
let numFibrasPrimarioEl = document.getElementById('num_fibras_primario')

//BACKBONE SECUNDÁRIO
let numPavimentosEl = document.getElementById('num_pavimentos');
let medidaBasicaEl = document.getElementById('tam_pe_direito');
let tipoFOEl = document.getElementById('tipos_fo');
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

    for (let i = numPavimentos+1; i > 2; i--) {
        comprimentoTotal += i * peDireito;
    }

    return comprimentoTotal * 1.2;
}


function definirTipoFibra(tipoFibra, distancia) {
    let transceiver = 'Tipo de fibra inválido';
    let janela = 0;

    switch (tipoFibra) {
        case 'multimodo':
                if(distancia <= 300){
                    transceiver = '10GBase-SR';
                    janela = '850 nm';
                }else if(distancia <= 550){
                    transceiver = '1000Base-SX';
                    janela = '850 nm';
                }else if(distancia <= 750){
                    transceiver = '1000Base-LX';
                    janela = '1310 nm';
                }else{
                    transceiver = 'Distância inválida para fibra multimodo';
                }
            break;

        case 'monomodo':
            if(distancia <= 3000){
                transceiver = '1000Base-LX';
                janela = '1310 nm';
            }else if(distancia <= 10000){
                transceiver = '10GBase-LR';
                janela = '1310 nm';
            }else if(distancia <= 40000){
                transceiver = '10GBase-ER';
                janela = '1550 nm';
            }else{
                transceiver = 'Distância inválida para fibra monomodo';
            }
            break;
    }

    return { transceiver, janela };
}

function calcularBackboneOptico(distanciaPrimario, tipoFOPrimario, numFibrasPrimario, numPavimentos, numFibras, tipoFO) {

    let tipoFibraPrimario = definirTipoFibra(tipoFOPrimario, distanciaPrimario);

    //BACKBONE PRIMÁRIO
    let comprimentoFibraPrimario = distanciaPrimario;

    let numDIOPrimario = numFibrasPrimario * 2 / 24;

    //BACKBONE SECUNDÁRIO
    let comprimentoFibra = calcularComprimentoFibra(numPavimentos);

    let tipoFibraSecundario = definirTipoFibra(tipoFO, comprimentoFibra);

    let numDIO = Math.ceil((numPavimentos-1) * numFibras / 24);

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
        tipoFibraSecundario,
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

    distanciaPrimario = parseInt(distanciaPrimarioEl.value);
    const numPavimentos = parseInt(numPavimentosEl.value);
    const numFibras = parseInt(numFibrasEl.value);
    const medidaBasica = parseInt(medidaBasicaEl.value);
    const tipoFOPrimario = tipoFOPrimarioEl.value;
    const tipoFO = tipoFOEl.value;
    const numFibrasPrimario = parseInt(numFibrasPrimarioEl.value);

    backboneOptico = calcularBackboneOptico(distanciaPrimario, tipoFOPrimario, numFibrasPrimario, numPavimentos, numFibras, tipoFO);
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
                <td>${backboneOptico.comprimentoFibraPrimario * 1.2}</td>
            </tr>
            <tr>
                <td>Cabo de Fibra Óptica Tight Buffer - ${backboneOptico.tipoFibraSecundario.transceiver} - ${backboneOptico.tipoFibraSecundario.janela}</td>
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
    if(isNaN(distanciaPrimario) && distanciaPrimario != 0){
        resultadoEl.innerHTML = `
        <table id="tabelaBackbone">
            <caption>BACKBONE ÓPTICO</caption>
            <tr>
                <th>Descrição</th>
                <th>Item</th>
                <th>Quantidade</th>
            </tr>
            <tr>
                <td>Cabo de Fibra Óptica Tight Buffer - ${backboneOptico.tipoFibraSecundario.transceiver} - ${backboneOptico.tipoFibraSecundario.janela}</td>
                <td>Metro(s)</td>
                <td>${backboneOptico.comprimentoFibra}</td>
            </tr>
            <tr>
                <td>Chassi DIO - 24 portas - 1U - 9"</td>
                <td>Unidade(s)</td>
                <td>${backboneOptico.numDIO}</td>
            </tr>
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
    }
});

const downloadXLSX = () => {
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
        let dados = [
            //linhas
            ['Descrição', 'Item', 'Quantidade'], //colunas
            ['Cabo de Fibra Óptica' + especificacaoCaboPrimarioEl.value + '-' + backboneOptico.tipoFibraPrimario.transceiver + '-' + backboneOptico.tipoFibraPrimario.janela, 'Metros(s)', backboneOptico.comprimentoFibraPrimario * 1.2],
            ['Cabo de Fibra Óptica Tight Buffer -' + backboneOptico.tipoFibraSecundario.transceiver + '-' + backboneOptico.tipoFibraSecundario.janela, 'Metros(s)', backboneOptico.comprimentoFibra],
            ['Chassi DIO - 24 portas - 1U - 9"', 'Unidades(s)', backboneOptico.numDIO],
            ['Caixa de Emenda - 12 fibras', 'Unidade(s)', backboneOptico.numDIO * 2],
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
        
        if(isNaN(distanciaPrimario)){
        dados = [
            //linhas
            ['Descrição', 'Item', 'Quantidade'], //colunas
            ['Cabo de Fibra Óptica Tight Buffer y-' + backboneOptico.tipoFibraSecundario.transceiver + '-' + backboneOptico.tipoFibraSecundario.janela, 'Metros(s)', backboneOptico.comprimentoFibra],
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
    }
        workSheet = XLSX.utils.aoa_to_sheet(dados);
        workBook.Sheets['Backbone'] = workSheet;

        XLSX.writeFile(workBook, 'Relatório 1.xlsx', { bookType: 'xlsx', type: 'bynary' })
};

document.getElementById('download').addEventListener('click', () => {
    downloadXLSX();
});
