#usando spyne
#pip install spyne
from spyne import Application, rpc, ServiceBase, Integer, Unicode
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication

from wsgiref.simple_server import make_server

import math

class MDCCalculator(ServiceBase):

    def CalculateMDCRequest(ctx, x, y):
        mdc = math.gcd(x, y) #talvez não precise
        return f"{x // mdc}:{y // mdc}"

#tns = target namespace, boa prática para criar conexão cliente-servidor
#in_protocol = protocolo de entrada usando soap 1.1 e validando o xml com a biblioteca lxml
#out_protocol = protocolo de saída usando soap 1.1 conforme entrada
app = Application(
    [MDCCalculator],
    tns='http://localhost:8000/mdc',
    name='MDCService',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

# Executar usando WSGI
if __name__ == '__main__':
    wsgi_app = WsgiApplication(app)
    server = make_server('0.0.0.0', 8000, wsgi_app)
    
    #Responde as requisições até que o processo seja encerrado
    server.serve_forever()
    
    #ou usar
    #Responde uma requisição e sai
    #server.handle_request()
