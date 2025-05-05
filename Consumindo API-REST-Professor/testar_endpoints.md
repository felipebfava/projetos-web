## 1. Registrar um novo usuário

```bash
# 1. Registrar um novo usuário
curl -X POST http://localhost:5000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"username": "fabricio.bizotto", "name": "Fabricio Bizotto", "email": "fabricio.bizotto@ifc.edu.br", "password": "123456"}'
```

# 2. Login (obter tokens)
```bash
curl -X POST http://localhost:5000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username": "fabricio.bizotto", "password": "123456"}'
```

> Após o login, você receberá um access_token e refresh_token
> Use o access_token para as requisições protegidas abaixo.
> O refresh_token pode ser usado para renovar o access_token.

# 3. Acessar endpoint protegido
```bash
curl -X GET http://localhost:5000/api/v1/protected \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

# 4. Ver perfil do usuário autenticado
```bash
curl -X GET http://localhost:5000/api/v1/profile \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

# 5. Renovar o token de acesso
```bash
curl -X POST http://localhost:5000/api/v1/refresh \
  -H "Authorization: Bearer SEU_REFRESH_TOKEN"
```

# 6. Logout (invalidar token atual)
```bash
curl -X DELETE http://localhost:5000/api/v1/logout \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

# 7. Obter informações da API
```bash
curl -X GET http://localhost:5000/api
```

# 8. Acessar documentação da API
```bash
curl -X GET http://localhost:5000/api/docs
```