// Carrega reservas do localStorage
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

function salvarReservas() {
    localStorage.setItem("reservas", JSON.stringify(reservas));
}

function mostrar(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('visible'));
    document.getElementById(id).classList.add('visible');
    // Limpa os campos quando a seção muda
    if (id === 'reserva') {
        limparFormularioReserva();
    } else if (id === 'cancelar') {
        limparFormularioCancelamento();
    } else if (id === 'consultar') {
        document.getElementById('consultaData').value = ''; // Limpa a data de consulta
        document.getElementById('listaReservas').innerHTML = ''; // Limpa a lista de resultados
    }
}

function limparFormularioReserva() {
    document.getElementById('dataReserva').value = '';
    document.getElementById('numPessoas').value = '';
    document.getElementById('espaco').value = ''; // Reseta para a opção desabilitada
    document.getElementById('nomeCliente').value = '';
    document.getElementById('telefoneCliente').value = '';
}

function limparFormularioCancelamento() {
    document.getElementById('cancelarNome').value = '';
    document.getElementById('cancelarData').value = '';
    document.getElementById('motivoCancelamento').value = '';
}

function confirmarReserva() {
    const data = document.getElementById('dataReserva').value;
    const pessoas = document.getElementById('numPessoas').value;
    const espaco = document.getElementById('espaco').value;
    const nome = document.getElementById('nomeCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();

    // Validação básica com mensagens claras
    if (!data) {
        alert("Por favor, selecione uma data para a reserva.");
        return;
    }
    if (!pessoas || parseInt(pessoas) <= 0) {
        alert("Por favor, informe um número válido de pessoas (maior que zero).");
        return;
    }
    if (!espaco) { // 'espaco' será string vazia se a opção "Selecione um espaço" for mantida
        alert("Por favor, escolha um espaço para a reserva.");
        return;
    }
    if (!nome) {
        alert("Por favor, informe o nome do cliente.");
        return;
    }
    if (!telefone) {
        alert("Por favor, informe o telefone do cliente.");
        return;
    }

    const reserva = { data, pessoas: parseInt(pessoas), espaco, nome, telefone };
    reservas.push(reserva);
    salvarReservas();
    alert("Reserva confirmada com sucesso!");
    limparFormularioReserva(); // Limpa o formulário após a reserva
}

function mostrarReservas() {
    const data = document.getElementById('consultaData').value;
    const container = document.getElementById('listaReservas');
    container.innerHTML = ""; // Limpa antes de adicionar

    if (!data) {
        container.innerHTML = "<p>Selecione uma data para consultar as reservas.</p>";
        return;
    }

    const resultados = reservas.filter(r => r.data === data);

    if (resultados.length === 0) {
        container.innerHTML = "<p>Nenhuma reserva encontrada para esta data.</p>";
        return;
    }

    resultados.forEach((r, index) => {
        // Crie um ID único para cada reserva para facilitar a remoção específica
        // Uma abordagem mais robusta seria ter um ID gerado no momento da reserva (ex: UUID)
        // Para este exemplo, usaremos uma combinação de dados para identificar.
        // **IMPORTANTE:** Se houver reservas idênticas em todos os campos, isso pode remover mais de uma.
        // Um ID único real seria a melhor solução para sistemas mais complexos.
        const uniqueId = `${r.data}-${r.nome}-${r.espaco}-${r.telefone}-${index}`; // Usando index como parte do ID provisório

        container.innerHTML += `
            <div class="reserva" id="reserva-${uniqueId}">
                <strong>${r.nome}</strong><br>
                <span>Espaço: ${r.espaco}</span>
                <span>Pessoas: ${r.pessoas}</span>
                <span>Telefone: ${r.telefone}</span>
                <button class="btn-remover-reserva" onclick="removerReservaEspecifica('${uniqueId}')">Remover</button>
            </div>`;
    });
}

function removerReservaEspecifica(uniqueId) {
    if (confirm("Tem certeza que deseja remover esta reserva?")) {
        // Encontrar o índice da reserva no array 'reservas' principal
        // O uniqueId é uma representação, precisamos encontrar o objeto real no array
        const [data, nome, espaco, telefone, originalIndexStr] = uniqueId.split('-');
        const originalIndex = parseInt(originalIndexStr);

        // Acha a reserva original usando os dados e o índice original
        const indexParaRemover = reservas.findIndex((r, i) => {
            return r.data === data &&
                   r.nome === nome &&
                   r.espaco === espaco &&
                   r.telefone === telefone &&
                   i === originalIndex; // Confere o índice original para evitar colisões
        });

        if (indexParaRemover !== -1) {
            reservas.splice(indexParaRemover, 1); // Remove a reserva do array
            salvarReservas();
            alert("Reserva removida com sucesso!");
            // Remove o elemento HTML da lista de exibição para atualizar a interface imediatamente
            const elementToRemove = document.getElementById(`reserva-${uniqueId}`);
            if (elementToRemove) {
                elementToRemove.remove();
            }
            // Se a lista estiver vazia após a remoção, exibe a mensagem
            const dataConsulta = document.getElementById('consultaData').value;
            if (reservas.filter(r => r.data === dataConsulta).length === 0) {
                document.getElementById('listaReservas').innerHTML = "<p>Nenhuma reserva encontrada para esta data.</p>";
            }
        } else {
            alert("Erro ao remover a reserva. Por favor, tente novamente.");
        }
    }
}


function confirmarCancelamento() {
    const nome = document.getElementById('cancelarNome').value.trim();
    const data = document.getElementById('cancelarData').value;
    const motivo = document.getElementById('motivoCancelamento').value.trim();

    if (!data) {
        alert("Por favor, selecione a data da reserva para cancelar.");
        return;
    }
    if (!motivo) {
        alert("Por favor, informe o motivo do cancelamento.");
        return;
    }

    const reservasAntes = reservas.length;
    let reservasCanceladasCount = 0;
    const novasReservas = [];

    reservas.forEach(r => {
        // Compara a data e, se o nome for fornecido, compara o nome (case-insensitive)
        const correspondeNome = (nome === "" || r.nome.toLowerCase() === nome.toLowerCase());
        if (r.data === data && correspondeNome) {
            reservasCanceladasCount++;
            // Não adiciona esta reserva ao novo array (ela é "cancelada")
        } else {
            novasReservas.push(r);
        }
    });

    reservas = novasReservas; // Atualiza o array de reservas com as não canceladas
    salvarReservas();

    if (reservasCanceladasCount > 0) {
        alert(`${reservasCanceladasCount} reserva(s) cancelada(s) com sucesso.\nMotivo: ${motivo}`);
        limparFormularioCancelamento(); // Limpa o formulário após o cancelamento
    } else {
        alert("Nenhuma reserva encontrada com os dados fornecidos para cancelamento.");
    }
}

// Exibe a seção de fazer reserva por padrão ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    mostrar('reserva');
});