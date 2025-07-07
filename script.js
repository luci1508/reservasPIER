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
        // Quando for para a seção de consulta, não limpa a data ou a lista
        // pois a intenção pode ser ver as reservas de uma data específica
        // que pode ter sido definida pela função de confirmar reserva.
        // Se a data não estiver preenchida, mostrarReservas() exibirá a mensagem padrão.
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
    if (!espaco) {
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

    // NOVIDADE: Mostrar resumo de reservas para a data
    mostrar('consultar'); // Muda para a tela de consulta
    document.getElementById('consultaData').value = data; // Define a data no campo de consulta
    mostrarReservas(); // Carrega as reservas para aquela data
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

    // Ordenar as reservas por nome para uma melhor visualização
    resultados.sort((a, b) => a.nome.localeCompare(b.nome));

    resultados.forEach((r, index) => {
        // Criar um ID único para cada reserva para facilitar a remoção específica
        const uniqueId = `${r.data}-${r.nome}-${r.espaco}-${r.telefone}-${index}`;

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
        const [data, nome, espaco, telefone, originalIndexStr] = uniqueId.split('-');
        const originalIndex = parseInt(originalIndexStr);

        const indexParaRemover = reservas.findIndex((r, i) => {
            return r.data === data &&
                   r.nome === nome &&
                   r.espaco === espaco &&
                   r.telefone === telefone &&
                   i === originalIndex;
        });

        if (indexParaRemover !== -1) {
            reservas.splice(indexParaRemover, 1);
            salvarReservas();
            alert("Reserva removida com sucesso!");
            const elementToRemove = document.getElementById(`reserva-${uniqueId}`);
            if (elementToRemove) {
                elementToRemove.remove();
            }
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
        const correspondeNome = (nome === "" || r.nome.toLowerCase() === nome.toLowerCase());
        if (r.data === data && correspondeNome) {
            reservasCanceladasCount++;
        } else {
            novasReservas.push(r);
        }
    });

    reservas = novasReservas;
    salvarReservas();

    if (reservasCanceladasCount > 0) {
        alert(`${reservasCanceladasCount} reserva(s) cancelada(s) com sucesso.\nMotivo: ${motivo}`);
        limparFormularioCancelamento();
    } else {
        alert("Nenhuma reserva encontrada com os dados fornecidos para cancelamento.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    mostrar('reserva');
});
