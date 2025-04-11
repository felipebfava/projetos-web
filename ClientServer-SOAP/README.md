Utilizando o terminal do GitBash, isso é, comandos Linux

Clonar o repositório:
```py
git clone https://github.com/felipebfava/projetos-web.git
```

Criar ambiente virtual:
```py
python -m venv .venv
````

*OBS: arquivos com . são arquivos ocultos no linux*

Ativar ambiente virtual:
```py
source .venv/bin/activate
```

Instale dependências:
```py
pip install zeep
```

```py
pip install spyne
```

*OBS: A biblioteca spyne pode não funcionar em versões recentes do python, recomenda-se a versão 3.11.2 ou 3.10.0*

Executar o código, parte servidor antes da parte cliente:
```py
python Server-SOAP.py
```

Depois:
```py
python Client-SOAP.py
```

