document.getElementById('form').addEventListener('submit', function (event) {
    let backbonePrimarioEl = document.getElementById('backbone_primario');
    let backboneSecundarioEl = document.getElementById('backbone_secundario');

    if (!backbonePrimarioEl.checked && !backboneSecundarioEl.checked) {
        event.preventDefault();
        document.getElementById('mensagem-erro').style.display = 'block';
    } else {
        document.getElementById('mensagem-erro').style.display = 'none';
    }
});