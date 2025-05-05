from flask import Flask, request, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
from dotenv import load_dotenv
import os
from uuid import uuid4 #gerar id do usuário
import time

# Carrega as variáveis de ambiente
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Tempo de expiração do token de atualização (30 dias)
app.config['JWT_REFRESH_THRESHOLD_SECONDS'] = 60  # Limite para renovar o token (por exemplo, 60 segundos antes da expiração)

# Configuração para armazenar tokens revogados
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Armazenamento de tokens revogados
# Na prática, você deveria usar Redis ou um banco de dados para armazenar tokens revogados
BLACKLIST = set()

# Modelo do usuário
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'email': self.email
        }

# Callback para verificar se um token foi revogado
@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in BLACKLIST

# Criar blueprint para a versão 1 da API
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# API V1
@api_v1.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@api_v1.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

@api_v1.route('/logout', methods=['DELETE'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    BLACKLIST.add(jti)
    return jsonify({'message': 'Successfully logged out'}), 200

@api_v1.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    jti = get_jwt()['jti']  # Pegar o ID do refresh token atual
    
    # Invalidar o refresh token atual (adicioná-lo à blacklist)
    BLACKLIST.add(jti)
    
    # Criar novos tokens
    new_access_token = create_access_token(identity=current_user_id)
    new_refresh_token = create_refresh_token(identity=current_user_id)
    
    return jsonify(access_token=new_access_token, 
                   refresh_token=new_refresh_token), 200

@api_v1.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

@api_v1.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = db.session.query(User).get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

# Raiz da API - Informações sobre a versão
@app.route('/api', methods=['GET'])
def api_info():
    return jsonify({
        'api_name': 'Authentication API',
        'version': 'v1',
        'base_url': '/api/v1',
        'endpoints': [
            '/register', 
            '/login', 
            '/logout', 
            '/refresh', 
            '/protected', 
            '/profile'
        ],
        'documentation': '/api/docs'  # Endpoint fictício para documentação
    }), 200

# Documentação da API
@app.route('/api/docs', methods=['GET'])
def api_docs():
    # Na vida real, isso poderia servir uma documentação Swagger/OpenAPI
    return jsonify({
        'message': 'Na vida real, isso poderia servir uma documentação Swagger/OpenAPI.',
        'example': 'https://api.ufrn.br/servicos'
    }), 200

# Registrar o blueprint no aplicativo
app.register_blueprint(api_v1)

# Redirecionar para a API v1 se acessar a raiz
@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Welcome to the Authentication API',
        'api_version': '/api/v1',
        'api_info': '/api'
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)