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