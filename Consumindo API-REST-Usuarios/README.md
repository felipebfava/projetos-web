#Executar o código

Faça o seguinte comando no terminal (pode ser powershell):
```js
npm install
```

E rode o código com:
```js
npm start
```

Pare o servidor pelo terminal com a combinação "ctrl + c".


#Como funciona?
Se o arquivo db.sqlite3 não existir, ao rodar o código ele será criado, se existir, mantém as alterações feitas (ex: deletar um usuário ou atualizar parcialmente outro), se quiser reiniciar sem nenhuma alteração, (com o servidor parado) exclua o arquivo db.sqlite3 e inicie o servidor.

É possível instalar uma extensão chamada SQLite Viewer (ou SQLite) no Visual Studio Code para vermos o arquivo e dar "refresh" para as alterações.

#O que fazer?
Faça requisições para os endpoints da API usando o próprio POSTMAN no Visual Studio Code com a extensão Postman.

Eu já deixei preparado algumas requisições para testes e com o corpo JSON preparado para execução.
