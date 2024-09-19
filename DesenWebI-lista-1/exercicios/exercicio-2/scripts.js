/*const não é possível mudar o valor da variável*/
const button = document.querySelector('.button-add-task') /*document é referência ao html*/
const input = document.querySelector('.input-task') /*chamada de elementos (nomes das classes) do html*/
const listaCompleta = document.querySelector('.list-tasks')


/*let é possível mudar o valor da variável*/
let minhaListaDeItens = []


function adicionarNovaTarefa() {
    //usando o trim() mesmo o usuário usando um espaço ' ' não é possível adicionar a tarefa
    if(input.value.trim() == '') {
        alert('Não é possível adicionar uma tarefa vazia')
        return
    }

    /*adiciona elementos na lista, como um objeto*/
    /*trim() remove espaços no início e no fim*/
    minhaListaDeItens.push({
        tarefa: input.value.trim(),
        concluida: false
    })
    
    input.value = ''

    mostrarTarefas() /*atualiza a lista de tarefas*/
}

function mostrarTarefas() {

    let novaLi = ''

    minhaListaDeItens.forEach((item, posicao) => {
        /*para nenhuma nova tarefa sobrepor a taref atual se faz: novaLi = novaLi + `` (o que está dentro da crase)*/
        /*o cifrão, $, permite que cada tarefa tenha sua própria escrita, sem mudar a estrutura do html*/
        /*item.tarefa irá aparecer só a tarefa do objeto*/
        novaLi = novaLi + `

            <li class="task ${item.concluida && "done"}">
                <img src="./img/checked.png" alt="check-na-tarefa" onclick="concluirTarefa(${posicao})">
                <p>${item.tarefa}</p> 
                <img src="./img/trash.png" alt="tarefa-para-o-lixo" onclick="deletarItem(${posicao})">
            </li>
            `
    })
    /*para adicionar dentro do html*/
    listaCompleta.innerHTML = novaLi

    /*definindo local storage para não se perder a tarefa quando atualizar o site ou abrir dnv*/
    /*o localStorage só aceita e guarda em formato de strings, por isso o stringify para converter um objeto para string*/
    localStorage.setItem('lista', JSON.stringify(minhaListaDeItens))
}

function concluirTarefa(posicao) {
    minhaListaDeItens[posicao].concluida = !minhaListaDeItens[posicao].concluida
    
    mostrarTarefas()
}

function deletarItem(posicao) {
    /*splice vai deletar o que eu quiser de dentro do array*/
    /*2° parâmetro, vai deletar quantos itens, se tiver como 2 irá deletar o posicao 0 e o 1 também (exemplo)*/
    minhaListaDeItens.splice(posicao, 1)

    mostrarTarefas()
}

function recarregarTarefas() {
    const tarefasLocalStorage = localStorage.getItem('lista')

    if(tarefasLocalStorage) {
        /*agora queremos o objeto e não a string do localStorage, por isso o parse, para converter uma string para objeto*/
        minhaListaDeItens = JSON.parse(tarefasLocalStorage)
    }

    mostrarTarefas()
}

recarregarTarefas()
button.addEventListener('click', adicionarNovaTarefa) /*evento relacionado ao botão*/

