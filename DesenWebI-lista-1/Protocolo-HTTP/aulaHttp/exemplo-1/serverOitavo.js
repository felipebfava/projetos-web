const express = require('express')
const receitas = [
    { id: 1, name: 'Ferver a Água' },
    { id: 2, name: 'Tomar Chá' },
    { id: 3, name: 'Pegar ingredientes para fazer bolo' },
    { id: 4, name: 'Colocar no forno por 15 minutos' },
    { id: 5, name: 'Pegar e preparar pastel' },
    { id: 6, name: 'Colocar óleo na frigideira' },
    { id: 7, name: 'Cozinhar o pastel por 5 minutos' },
    { id: 8, name: 'Tirar da frigideira e colocar numa tigela' },
    { id: 9, name: 'Arrumar a mesa e servir a comida' },
    { id: 10, name: 'Arrumar' }
]

const app = express()
app.use(express.json())

/*
-X especifica o método HTTP que irá usar na requisição, como GET, POST, PUT, DELETE.
Por padrão, curl realiza GET se não especificar o -X
-H define que o conteúdo a ser compilado é json
-d (vem de --data) especifica os dados a serem enviados, encontrados em requisições POST e PUT
application/json vem do tipo MIME (Multipurpose Internet Mail Extensions) descrevendo os dados enviados ou recebidos em requisições HTTP

*/

//cria um nova receita a partir do name
//curl -X POST http://localhost:5000/nova -H "Content-Type: application/json" -d "{\"name\": \"Nome da Receita\"}"
app.post('/nova', (req, res) => {
    const {name} = req.body

    //verifica se o nome foi fornecido
    if (!name) {
        res.status(422).json({
            message: "Faltou parâmetros para a receita", status: 422
        })
    }

    //define o novo id. Se receitas estiver vazio, começa com 1, senão incrementa a partir do último id
    //se receitas maior que 0 escolhe a primeira opção, senão, a segunda
    const novoId = receitas.length > 0 ? receitas.at(-1).id + 1 : 1;

    //cria um novo gato
    const novaReceita = {
        id: novoId,
        name: name
    }

    //adiciona um novo gato na lista
    receitas.push(novaReceita)
    console.log(novaReceita)

    //retorna a lista atualizada de gatos
    res.json(receitas)
})

//para listar todas as receitas
//curl http://localhost:5000/ler
app.get('/ler', (req, res) => {
    if (req.query.name) {
        const filtrados = receitas.filter(metodos => {
            return metodos.name.toLowerCase().includes(req.query.name.toLocaleLowerCase())
        })
        return res.json(filtrados)
    }
    return res.json(receitas)
})

//atualiza receita por name atual
//curl -X POST http://localhost:5000/atualizar -H "Content-Type: application/json" -d '{"currentName": "Arrumar", "newName": "Lavar a louça"}'
app.post('/atualizar', (req, res) => {
    const {currentName, newName} = req.body
    
    if (!currentName || !newName) {
        res.status(422).json({
            message: "Parâmetros insuficientes para a Receita",
            status: 422
        })
    }

    const index = receitas.findIndex(g => g.name.toLowerCase() === currentName.toLowerCase())

    if(index !== -1) { //verifica se encontrou a receita
        receitas[index].name = newName
        res.json({
            message: "Receita atualizada com sucesso",
            updatedReceita: receitas[index],
            status: 200
        })
    } else {
        res.status(404).json({
            message: "Receita não encontrada",
            status: 404
        })
    }

})


//findIndex retorna a posição (índice) do elemento no array, se não encontrar retorna -1
//find retorna o próprio elemento (o objeto receitas com o id correspondente)

//delete por id
//curl -X DELETE http://localhost:5000/delete/:id
app.delete('/delete/:id', (req, res) => {
    const {id} = req.params
    const index = receitas.findIndex(g => g.id == id)

    if(index !== -1) {
        const removeReceita = receitas.splice(index, 1);
        res.json({ message: "Receita removida", removeReceita, status: 200})
    } else {
        res.status(404).json({ message: "Receita não encontrada", status: 404})
    }
})


//delete por name
//curl -X DELETE http://localhost:5000/delete -H "Content-Type: application/json" -d "{\"name\": \"Nome da Receita\"}"
app.delete('/delete', (req, res) => {
    const {name} = req.body
    const index = receitas.findIndex(g => g.name.toLowerCase() == name.toLowerCase())

    if(index !== -1) {//verifica se a receita existe
        const removeReceita = receitas.splice(index, 1);
        res.json({ message: "Receita removida", removeReceita, status: 200})
    } else {
        res.status(404).json({ message: "Receita não encontrada", status: 404})
    }
})


app.listen(5000, () => {
    console.log("http://localhost:5000")
})