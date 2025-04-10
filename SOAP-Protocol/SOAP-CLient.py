#importar biblioteca zeep -> pip install zeep
from zeep import Client

# URL do WSDL do serviço
wsdl = 'http://www.dneonline.com/calculator.asmx?WSDL'

# Cria um cliente SOAP
client = Client(wsdl)

# Exemplo de chamada para somar dois números
num1 = 10
num2 = 5
resultado = client.service.Add(num1, num2)
print(f'A soma de {num1} e {num2} é: {resultado}')
