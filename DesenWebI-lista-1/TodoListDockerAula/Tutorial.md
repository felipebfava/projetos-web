### **🛠 Atividade Prática: Criando um To-Do List Monolítico**
📌 **Objetivo:** Criar um sistema simples de cadastro de tarefas com funcionalidades de **adicionar, editar, excluir e marcar como concluído**.

#### **👨‍💻 Tecnologias recomendadas (depende do nível dos alunos)**
- **Stack básica:** HTML, CSS, JavaScript (para frontend) + Python (Flask) ou Node.js (Express) para o backend.  
- **Banco de dados:** SQLite (simples e não precisa de configuração extra).  

---

## **📌 Passo 1: Configurar o Ambiente**
Antes de começar, os alunos devem garantir que têm o **Python** instalado. Eles podem verificar isso com:  
```sh
python --version
```
Se Python estiver instalado, deve retornar algo como:  
```
Python 3.x.x
```
Caso contrário, o Python pode ser baixado em: [https://www.python.org/downloads/](https://www.python.org/downloads/).

---

## **📌 Passo 2: Criar um Ambiente Virtual**
É uma boa prática criar um **ambiente virtual** para o projeto. Isso evita conflitos entre bibliotecas.  
Execute os comandos:  
```sh
# Criar um ambiente virtual
python -m venv .venv  

# Ativar o ambiente virtual (Windows)
.venv\Scripts\activate  

# Ativar o ambiente virtual (Linux/Mac)
source .venv/bin/activate  
```
O terminal mostrará algo como `(.venv)` indicando que o ambiente virtual está ativo.

---

## **📌 Passo 3: Instalar as Dependências**
Dentro do ambiente virtual, instale o Flask:  
```sh
pip install flask
```
Opcionalmente, se quiser salvar as dependências em um arquivo `requirements.txt`, use:  
```sh
pip freeze > requirements.txt
```
E para instalar a partir dele em outro ambiente:  
```sh
pip install -r requirements.txt
```

---

## **📌 Passo 4: Criar o Banco de Dados**
Crie um script para definir a estrutura do banco.  
Crie o arquivo `init_db.py` e adicione:  
```python
import sqlite3

con = sqlite3.connect("database.db")
cur = con.cursor()
cur.execute("""
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
)
""")
con.commit()
con.close()

print("Banco de dados criado com sucesso!")
```
Agora execute:  
```sh
python init_db.py
```
Isso criará um arquivo `database.db` com a tabela `tasks`.

---

## **📌 Passo 5: Criar a Aplicação Flask**
Agora, crie o arquivo `app.py` com o seguinte código:

```python
from flask import Flask, render_template, request, redirect
import socket, os

app = Flask(__name__)

import sqlite3

def connect_db():
    return sqlite3.connect("database.db")

@app.route('/oi')
def hello():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')  # Pega a porta do ambiente ou usa 5000 como padrão
    return f"Hello from {hostname} on port {port}!\n"

@app.route('/')
def index():
    con = connect_db()
    cur = con.cursor()
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    con.close()
    return render_template("index.html", tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    task = request.form['task']
    con = connect_db()
    cur = con.cursor()
    cur.execute("INSERT INTO tasks (task, completed) VALUES (?, ?)", (task, 0))
    con.commit()
    con.close()
    return redirect('/')

@app.route('/delete/<int:id>')
def delete_task(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("DELETE FROM tasks WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect('/')

@app.route('/complete/<int:id>')
def complete_task(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("UPDATE tasks SET completed = 1 WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
```
Esse código cria uma API simples com as seguintes rotas:
- `/` → Exibe a lista de tarefas.
- `/add` → Adiciona uma nova tarefa.
- `/delete/<id>` → Exclui uma tarefa.
- `/complete/<id>` → Marca uma tarefa como concluída.

---

## **📌 Passo 6: Criar o Frontend**
Crie uma pasta chamada `templates` e dentro dela um arquivo `index.html`:

```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Tarefas</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: auto; text-align: center; }
        ul { list-style: none; padding: 0; }
        li { padding: 10px; border: 1px solid #ddd; margin: 5px 0; display: flex; justify-content: space-between; }
        .completed { text-decoration: line-through; color: gray; }
    </style>
</head>
<body>
    <h1>Lista de Tarefas</h1>
    <form action="/add" method="POST">
        <input type="text" name="task" required>
        <button type="submit">Adicionar</button>
    </form>
    <ul>
        {% for task in tasks %}
            <li class="{% if task[2] == 1 %}completed{% endif %}">
                {{ task[1] }}  
                <a href="/complete/{{ task[0] }}">✔️</a>
                <a href="/delete/{{ task[0] }}">❌</a>
            </li>
        {% endfor %}
    </ul>
</body>
</html>
```
Esse frontend:\
✅ Exibe as tarefas  
✅ Permite adicionar novas  
✅ Permite marcar como concluídas  
✅ Permite excluir  

---

## **📌 Passo 7: Executar a Aplicação**
Para rodar o servidor Flask, execute:  
```sh
python app.py
```
Agora acesse no navegador:  
👉 `http://127.0.0.1:5000/`  

---

Para escalar sua aplicação Flask monolítica, você pode adotar estratégias que melhorem o desempenho e permitam que mais usuários acessem simultaneamente. Vou dividir as soluções em **escalabilidade vertical** e **escalabilidade horizontal**, além de outras otimizações.  

---

# **1️⃣ Escalabilidade Vertical (Aumentar Recursos do Servidor)**
A escalabilidade **vertical** significa **melhorar o servidor** onde sua aplicação está rodando. Isso inclui:  
✅ **Usar um servidor mais potente** (mais CPU, RAM)  
✅ **Usar um banco de dados externo** (ex: PostgreSQL no RDS da AWS)  
✅ **Configurar um WSGI mais eficiente**, como **Gunicorn**  

### **🔧 Usando Gunicorn**

WSGI (Web Server Gateway Interface) é um padrão para servidores web e aplicações Python se comunicarem. **Gunicorn** é um servidor WSGI que pode melhorar a performance do Flask. Usar o Gunicorn traz os seguintes benefícios:

✅ Diferente do servidor de desenvolvimento do Flask, que processa apenas uma requisição por vez, o Gunicorn pode lidar com várias conexões simultâneas, tornando a aplicação mais eficiente.\
✅ O Gunicorn pode ser executado atrás de um proxy reverso como o Nginx ou Apache, que pode servir arquivos estáticos e lidar com tarefas de balanceamento de carga.

Em produção, ao invés de rodar `python app.py`, use **Gunicorn** para melhorar a performance:  
```sh
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
Isso inicia 4 "workers", permitindo que várias requisições sejam processadas ao mesmo tempo.

✅ Se houver mais de 4 requisições simultâneas, elas entram na fila e esperam um worker ficar disponível.\
✅ Se o servidor tiver mais CPU/RAM, você pode aumentar o número de workers.\
✅ Se o número de requisições for muito alto e os workers demorarem para processar, a fila pode ficar sobrecarregada, causando lentidão ou erros 502/504 (Bad Gateway, Timeout).\
✅ O Nginx pode ajudar a gerenciar conexões e servir arquivos estáticos, reduzindo a carga do Gunicorn.

Se a aplicação faz muitas operações de entrada e saída (consultas SQL, chamadas HTTP externas), aumentar os workers melhora o desempenho. Fórmula Geral: **2 × CPUs + 1** (ex: 4 CPUs → 9 workers).

---

# **2️⃣ Escalabilidade Horizontal (Múltiplas Instâncias)**
A escalabilidade **horizontal** significa rodar várias cópias da aplicação para distribuir o tráfego.

### **🔧 Usando Load Balancer**
Se o tráfego aumentar, você pode rodar **múltiplas instâncias** e usar um **Load Balancer** para distribuir as requisições.  

🔹 No **Railway, Render ou Heroku**, basta aumentar as "instâncias" na configuração do serviço.  
🔹 Se estiver em um **VPS (AWS, DigitalOcean, Brdrive)**, pode usar o **NGINX** como proxy reverso.

Exemplo de configuração NGINX para distribuir o tráfego entre 2 instâncias Flask:

```nginx
upstream flask_app {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
}

server {
    listen 80;
    location / {
        proxy_pass http://flask_app;
    }
}
```
Isso envia requisições para múltiplas instâncias Flask rodando nas portas **5000** e **5001**.

---

# **3️⃣ Usando Containers (Docker e Kubernetes)**
Outra maneira de escalar é usar **Docker** e **Kubernetes** para gerenciar múltiplas réplicas.

### **🔧 Criando um Dockerfile**
Crie um arquivo `Dockerfile` na raiz do projeto:  
```dockerfile
# Usa a versão leve do Python (Alpine)
FROM python:3.9-alpine
# Define o diretório de trabalho dentro do contêiner
WORKDIR /app
# Copia os arquivos necessários para o contêiner
COPY . .
# Instala as dependências necessárias (usa --no-cache para evitar arquivos desnecessários)
RUN pip install --no-cache-dir -r requirements.txt
# Expõe a porta 5000 para acesso externo
EXPOSE 5000
# Comando para iniciar a aplicação usando Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```
Agora, **crie e rode o container**:  
```sh
docker build -t flask-app .
docker run -p 5000:5000 flask-app
```
Se quiser escalar com **Kubernetes**, pode usar `kubectl scale` para rodar **múltiplas cópias** do container.

---

# **4️⃣ Banco de Dados Externo**
Usar **SQLite** em produção não é recomendado. Para escalar, use um banco como:  
✅ **PostgreSQL** (ex: AWS RDS, Supabase, Railway, Render)  
✅ **MySQL** (ex: PlanetScale)  

### **🔧 Exemplo de Conexão PostgreSQL**
1️⃣ Instale o driver:  
```sh
pip install psycopg2
```
2️⃣ Atualize `connect_db()` no `app.py`:  
```python
import psycopg2
def connect_db():
    return psycopg2.connect(
        dbname="meubanco",
        user="usuario",
        password="senha",
        host="servidor.externo.com",
        port=5432
    )
```
Isso melhora a escalabilidade, pois várias instâncias Flask podem acessar o mesmo banco.

---

# **5️⃣ Cache para Melhorar Performance**
Usar um **cache** evita que consultas repetidas sobrecarreguem o banco.

✅ **Redis**: Ótimo para armazenar resultados de consultas frequentes.  
✅ **Memcached**: Boa opção para melhorar tempos de resposta.  

### **🔧 Usando Redis**
Instale a biblioteca Python:
```sh
pip install redis
```
No `app.py`, adicione um cache:
```python
import redis
cache = redis.Redis(host='localhost', port=6379, db=0)

@app.route('/')
def index():
    tasks = cache.get('tasks')
    if not tasks:
        con = connect_db()
        cur = con.cursor()
        cur.execute("SELECT * FROM tasks")
        tasks = cur.fetchall()
        con.close()
        cache.set('tasks', str(tasks), ex=30)  # Expira em 30s
    return render_template("index.html", tasks=eval(tasks))
```
Isso reduz a carga no banco de dados.

---

# **6️⃣ Otimizações de Código**

Vamos fazer mudanças para testar a escalabilidade da aplicação.

### Database Init

Vamos fazer uma alteração no script `init_db.py` para criar o banco de dados em um diretório separado. Criamos um diretório `data` e alteramos o script para criar o banco de dados em `data/database.db`.

```sh
mkdir data
```

```python
import sqlite3

con = sqlite3.connect("data/database.db")
cur = con.cursor()
cur.execute("""
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
)
""")
con.commit()
con.close()

print("Banco de dados criado com sucesso!")
```

Em seguida, vamos alterar o `app.py` para conectar ao banco de dados no diretório `data`. Além disso, vamos adicionar um log para cada requisição recebida. Isso nos ajudará a identificar o servidor que está processando a requisição.

### app.py
```python
from flask import Flask, render_template, request, redirect
import socket
import os
import logging
import sqlite3

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')  # Pega a porta do ambiente ou usa 5000 como padrão
    logger.info(f"Requisição recebida em {hostname} na porta {port}")

def connect_db():
    # return sqlite3.connect("database.db")
    db_path = '/app/db/database.db'
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/env')
def env():
    return str(os.environ)

@app.route('/oi')
def hello():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')  # Pega a porta do ambiente ou usa 5000 como padrão
    logger.info(f"Requisição recebida em {hostname} na porta {port}")
    return f"Hello from {hostname} on port {port}!\n"

@app.route('/')
def index():
    con = connect_db()
    cur = con.cursor()
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    con.close()
    return render_template("index.html", tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    task = request.form['task']
    con = connect_db()
    cur = con.cursor()
    cur.execute("INSERT INTO tasks (task, completed) VALUES (?, ?)", (task, 0))
    con.commit()
    con.close()
    return redirect('/')

@app.route('/delete/<int:id>')
def delete_task(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("DELETE FROM tasks WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect('/')

@app.route('/complete/<int:id>')
def complete_task(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("UPDATE tasks SET completed = 1 WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
```

## Começando com Docker

Vamos testar temporariamente uma imagem Docker para verificar se tudo está funcionando corretamente. Para isso, vamos usar a imagem `crccheck/hello-world` que é um servidor HTTP simples. Podemos perceber que o parâmetro `--rm` remove o container após a execução.

```sh
# https://hub.docker.com/r/crccheck/hello-world/
docker run --rm --name web-test -p 1234:8000 crccheck/hello-world
```

### Nginx

Vamos adicionar um servidor de backup ao nosso cluster. Para isso, vamos usar o **Busybox** como um servidor HTTP simples. O **Busybox** é uma imagem leve que contém várias ferramentas comuns do Linux. Vamos usar o **httpd** do Busybox para servir arquivos estáticos.

```bash
# Define o usuário sob o qual o Nginx será executado. 'nginx' é um usuário padrão criado para rodar o serviço
# de forma segura, evitando privilégios de root e reduzindo riscos de segurança.
user nginx;

# Define o número de processos trabalhadores (workers). 'auto' ajusta automaticamente com base no número de
# núcleos da CPU, otimizando o uso de recursos para lidar com múltiplas conexões.
worker_processes auto;

# Especifica o caminho do arquivo de log de erros e o nível de severidade. 'warn' registra mensagens de aviso
# ou mais graves, ajudando a identificar problemas sem sobrecarregar o log com detalhes triviais.
error_log /var/log/nginx/error.log warn;

# Define o arquivo onde o PID (ID do processo) do Nginx é armazenado. Isso é usado pelo sistema para gerenciar
# o processo (ex.: parar ou reiniciar o servidor).
pid /var/run/nginx.pid;

# Bloco 'events' configura como o Nginx gerencia eventos de rede, como conexões de clientes.
events {
    # Define o número máximo de conexões simultâneas por processo trabalhador. 1024 é um valor padrão razoável,
    # mas pode ser aumentado em servidores com mais carga ou recursos.
    worker_connections 1024;
}

# Bloco 'http' contém configurações globais para o protocolo HTTP/HTTPS.
http {
    # Inclui um arquivo externo que associa extensões de arquivos (ex.: .html, .jpg) a tipos MIME, permitindo
    # que o Nginx informe corretamente aos navegadores como interpretar os arquivos enviados.
    include /etc/nginx/mime.types;

    # Define o tipo MIME padrão para arquivos sem extensão mapeada. 'application/octet-stream' é um tipo genérico
    # que indica um fluxo de bytes brutos, deixando a interpretação para o cliente.
    default_type application/octet-stream;

    # Ativa o uso de 'sendfile', uma chamada de sistema eficiente que transfere arquivos diretamente do disco para
    # a rede, reduzindo a sobrecarga ao evitar cópias na memória do usuário.
    sendfile on;

    # Define o tempo (em segundos) que uma conexão persistente (keep-alive) será mantida aberta. 65 segundos é um
    # valor equilibrado que melhora a performance ao reutilizar conexões, mas evita desperdício de recursos.
    keepalive_timeout 65;

    # Define um grupo de servidores upstream (backend) chamado 'flask_app'. O Nginx balanceará as requisições entre
    # esses servidores usando um algoritmo padrão (round-robin, a menos que configurado de outra forma).
    upstream flask_app {
        # Servidor primário na porta 5000 (app1). 'max_fails=3' e 'fail_timeout=30s' definem tolerância a falhas:
        # após 3 falhas em 30 segundos, o servidor é temporariamente removido do balanceamento.
        server app1:5000 max_fails=3 fail_timeout=30s;

        # Segundo servidor primário na porta 5001 (app2), com as mesmas regras de tolerância a falhas.
        server app2:5001 max_fails=3 fail_timeout=30s;

        # Servidor de backup na porta 3000 (app3). Só é usado se os servidores primários estiverem indisponíveis,
        # funcionando como uma camada extra de resiliência.
        server app3:3000 backup;
    }

    # Primeiro bloco 'server': lida com requisições HTTP na porta 80 e redireciona para HTTPS.
    server {
        # Escuta na porta 80, padrão para HTTP, permitindo que o servidor receba requisições não seguras.
        listen 80;

        # Define o nome do servidor. 'localhost' é usado para testes locais; em produção, seria um domínio real.
        server_name localhost;

        # Redireciona todas as requisições para HTTPS com um código 301 (redirecionamento permanente), melhorando
        # a segurança ao forçar o uso de conexões criptografadas.
        return 301 https://$host$request_uri;
    }

    # Segundo bloco 'server': lida com requisições HTTPS na porta 443 com suporte a HTTP/2.
    server {
        # Escuta na porta 443 (padrão para HTTPS) com SSL ativado e HTTP/2 habilitado. HTTP/2 melhora a eficiência
        # com multiplexação e compressão de cabeçalhos, mas exige SSL/TLS.
        listen 443 ssl http2;

        # Nome do servidor, novamente 'localhost' para testes locais. Em produção, use seu domínio (ex.: example.com).
        server_name localhost;

        # Caminho para o certificado SSL (inclui o certificado público e a cadeia de certificação). Aqui, usamos um
        # certificado autoassinado gerado localmente.
        ssl_certificate /etc/letsencrypt/fullchain.pem;

        # Caminho para a chave privada correspondente ao certificado. Deve ser mantida segura e nunca exposta.
        ssl_certificate_key /etc/letsencrypt/privkey.pem;

        # Define os protocolos SSL/TLS suportados. TLSv1.2 e TLSv1.3 são versões modernas e seguras; versões mais
        # antigas (ex.: SSLv3) são evitadas por vulnerabilidades.
        ssl_protocols TLSv1.2 TLSv1.3;

        # Prioriza as cifras definidas pelo servidor em vez das preferências do cliente, aumentando a segurança ao
        # garantir o uso de opções fortes.
        ssl_prefer_server_ciphers on;

        # Lista de cifras criptográficas permitidas. 'EECDH+AESGCM:EDH+AESGCM' são opções modernas e seguras,
        # compatíveis com HTTP/2 e otimizadas para desempenho e proteção.
        ssl_ciphers EECDH+AESGCM:EDH+AESGCM;

        # Bloco 'location' define como tratar requisições para a raiz ('/') do site.
        location / {
            # Encaminha as requisições para o grupo upstream 'flask_app', delegando o processamento aos servidores
            # backend (app1, app2 ou app3).
            proxy_pass http://flask_app;

            # Define cabeçalhos HTTP enviados ao backend para preservar informações do cliente:
            # 'Host' mantém o domínio original da requisição, essencial para aplicações que dependem dele.
            proxy_set_header Host $host;

            # 'X-Real-IP' envia o IP real do cliente ao backend, útil para logs ou autenticação.
            proxy_set_header X-Real-IP $remote_addr;

            # 'X-Forwarded-For' adiciona o IP do cliente à lista de proxies, permitindo rastreamento em cenários com
            # múltiplos proxies.
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            # 'X-Forwarded-Proto' informa o protocolo original (http ou https), importante para aplicações que precisam
            # saber se a requisição inicial foi segura.
            proxy_set_header X-Forwarded-Proto $scheme;

            # Define o tempo máximo (em segundos) para estabelecer a conexão com o backend. 10 segundos é um valor
            # baixo, exigindo respostas rápidas ou falhando a requisição.
            proxy_connect_timeout 10;

            # Limita o tempo para enviar dados ao backend, evitando travamentos se o backend estiver lento.
            proxy_send_timeout 10;

            # Limita o tempo para receber uma resposta do backend, garantindo que requisições demoradas sejam encerradas.
            proxy_read_timeout 10;

            # Define o tamanho máximo do corpo da requisição (ex.: uploads). '10M' (10 megabytes) protege contra abusos,
            # como envio de arquivos muito grandes.
            client_max_body_size 10M;
        }
    }
}
```

> **Artigo**: [Tune nginx performance](https://medium.com/@tynwthpq/tune-nginx-performance-fbba6a7f4a25)

### Docker Compose

Vamos usar o **Docker Compose** para gerenciar os containers. O Docker Compose é uma ferramenta que permite definir e executar aplicativos Docker multi-container. Ele usa um arquivo YAML para configurar os serviços, volumes e redes. No arquivo `docker-compose.yml`, definimos os serviços `app1`, `app2`, `app3` e `nginx`.

```yaml
services:
  app1:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app1
    environment:
      - PORT=5000
    volumes:
      - ./data:/app/db
    depends_on:
      cert-generator:
        condition: service_healthy  # Só inicia após o certificado estar pronto

  app2:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app2
    environment:
      - PORT=5001
    volumes:
      - ./data:/app/db
    depends_on:
      cert-generator:
        condition: service_healthy  # Só inicia após o certificado estar pronto

  app3:
    image: busybox:latest
    container_name: app3
    volumes:
      - ./backup:/var/www
    command: ["httpd", "-f", "-p", "3000", "-h", "/var/www"]
    depends_on:
      cert-generator:
        condition: service_healthy  # Só inicia após o certificado estar pronto

  nginx:
    image: nginx:latest
    container_name: nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/letsencrypt
    ports:
      - "80:80"   # Mapeia para 8080 no Windows/WSL
      - "443:443"  # Mapeia para 8443 no Windows/WSL
    depends_on:
      app1:
        condition: service_started
      app2:
        condition: service_started
      app3:
        condition: service_started
      cert-generator:
        condition: service_healthy  # Só inicia após o certificado estar pronto

  cert-generator:
    image: alpine:latest
    container_name: cert-generator
    volumes:
      - ./certs:/etc/letsencrypt
    command: >
      /bin/sh -c "
        apk add openssl &&
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/letsencrypt/privkey.pem -out /etc/letsencrypt/fullchain.pem -subj '/CN=localhost' &&
        chown -R 101:101 /etc/letsencrypt &&
        tail -f /dev/null  # Mantém o container ativo após gerar os certificados
      "
    healthcheck:
      test: ["CMD", "test", "-f", "/etc/letsencrypt/fullchain.pem"]  # Verifica se o certificado foi gerado
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 5s

  # Serviço temporário para gerar certificados com Certbot
  # certbot:
  #   image: certbot/certbot:latest  # Imagem oficial do Certbot
  #   volumes:
  #     - ./certs:/etc/letsencrypt   # Armazena os certificados no diretório ./certs do host
  #   entrypoint: /bin/sh           # Substitui o entrypoint padrão para rodar comandos manuais
  #   command: -c "certbot certonly --standalone -d example.com -d www.example.com --email fabricio.bizotto@gmail.com --agree-tos --no-eff-email"
  #   # Comando para gerar certificados no modo standalone (substitua example.com e seuemail@example.com)
```

**Detalhes**:
- **app1** e **app2** são instâncias do Flask rodando na porta 5000 e 5001, respectivamente.
- **app3** é um servidor de backup usando o Busybox para servir arquivos estáticos na porta 3000.
- **nginx** é o servidor Nginx que balanceia a carga entre app1, app2 e app3.
- O volume `./data` é montado em `/app/db` nos containers app1 e app2 para persistir o banco de dados.
- O volume `./backup` é montado em `/var/www` no container app3 para servir arquivos estáticos.
- O volume `./nginx/nginx.conf` é montado em `/etc/nginx/nginx.conf` no container nginx para configurar o Nginx.
- O Nginx depende dos serviços app1, app2 e app3, garantindo que eles sejam iniciados primeiro.
- O Nginx escuta na porta 80 e encaminha as requisições para os servidores backend.
- O serviço `cert-generator` gera certificados SSL autoassinados para o Nginx.
- O serviço `cert-generator` só inicia após gerar os certificados e mantém o container ativo com `tail -f /dev/null`.
- O serviço `cert-generator` tem um healthcheck que verifica se o certificado foi gerado.

### Dockerfile
```dockerfile
# Usa a versão leve do Python (Slim)
FROM python:3.9-slim
# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instala as dependências necessárias
RUN apt update && apt install -y net-tools bash

# Copia os arquivos necessários para o contêiner
COPY . .
# Instala as dependências necessárias (usa --no-cache para evitar arquivos desnecessários)
RUN pip install --no-cache-dir -r requirements.txt
# Comando para iniciar a aplicação usando Gunicorn
CMD ["sh", "-c", "gunicorn --workers 3 --bind 0.0.0.0:${PORT:-5000} app:app"]
```

### Hosts

Estamos usando o domínio `desweb.local` para testar a aplicação. Adicione o seguinte ao arquivo `hosts`:

```sh
127.0.0.1 desweb.local
```

> Se estiver usando WSL, o arquivo `hosts` está em `C:\Windows\System32\drivers\etc\hosts`. Você precisará editar como administrador. No Linux, o arquivo está em `/etc/hosts`.

### Comandos
```sh
docker ps
docker stats
docker compose ps
docker compose up -d --build
docker compose down
docker compose logs -f app1
docker compose logs -f app2
docker compose logs -f nginx --tail 100
docker-compose up -d --force-recreate nginx # Força a recriação do container
docker exec -it nginx /bin/bash # Acessa o container Nginx
docker exec nginx ls -l /etc/letsencrypt # Lista os certificados
docker exec -it app1 bash -c "netstat -tuln | grep 5000"
docker exec -it app2 bash -c "netstat -tuln | grep 5001"
curl -k http://localhost/oi  # -k: erro 301
curl -k https://localhost/oi  # -k: Ignora erros de certificado
for i in {1..10}; do curl -k https://localhost/oi; done

# Network
docker network ls
docker network inspect monolito_default
docker inspect nginx | grep IPAddress
docker inspect app1 | grep IPAddress
docker inspect app2 | grep IPAddress
docker inspect app3 | grep IPAddress
docker inspect cert-generator | grep IPAddress
docker port nginx
docker compose exec nginx curl http://app1:5000
docker compose exec nginx curl http://app2:5001/oi
```

### Para parar um container 

```sh
docker compose stop app1
docker compose stop app2
# assim testamos o backup
```

### Limpeza

```sh
docker compose down
docker system prune -a # Remove todos os containers, imagens e volumes não utilizados, ou seja, limpa tudo
```