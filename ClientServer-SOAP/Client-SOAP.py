from zeep import Client

# URL do WSDL do serviço
wsdl = 'http://0.0.0.0:8000/?wsdl'

# Cria um cliente SOAP
client = Client(wsdl)

#resolução hd
x = 1280
y = 720

aspect_ratio = client.service.CalculateMDCRequest(x, y)

print("Aspect Ratio:", aspect_ratio)
