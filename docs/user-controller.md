# User Controller

O `UserController` é responsável por gerenciar todas as operações relacionadas aos usuários no sistema de encurtamento de URLs. Este controller fornece endpoints para autenticação, criação, leitura, atualização e exclusão de usuários.

## Endpoints Disponíveis

### 1. Login de Usuário
**POST** `/users/login`

Realiza a autenticação de um usuário e retorna um token JWT para acesso aos recursos protegidos.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário"
  }
}
```

**Exemplo de uso:**
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

### 2. Listar Todos os Usuários
**GET** `/users`

Retorna uma lista com todos os usuários cadastrados no sistema.

**Response (200 OK):**
```json
[
  {
    "id": "uuid-do-usuario-1",
    "email": "usuario1@exemplo.com",
    "name": "Usuário 1"
  },
  {
    "id": "uuid-do-usuario-2",
    "email": "usuario2@exemplo.com",
    "name": "Usuário 2"
  }
]
```

**Exemplo de uso:**
```bash
curl -X GET http://localhost:3000/users
```

### 3. Buscar Usuário por ID
**GET** `/users/:id`

Retorna os dados de um usuário específico pelo seu ID.

**Parâmetros:**
- `id` (string): ID único do usuário

**Response (200 OK):**
```json
{
  "id": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário"
}
```

**Exemplo de uso:**
```bash
curl -X GET http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000
```

### 4. Criar Novo Usuário
**POST** `/users`

Cria um novo usuário no sistema.

**Request Body:**
```json
{
  "email": "novousuario@exemplo.com",
  "name": "Nome do Novo Usuário",
  "password": "senha123"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-do-novo-usuario",
  "email": "novousuario@exemplo.com",
  "name": "Nome do Novo Usuário"
}
```

**Exemplo de uso:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novousuario@exemplo.com",
    "name": "Nome do Novo Usuário",
    "password": "senha123"
  }'
```

### 5. Atualizar Usuário
**PUT** `/users/:id`

Atualiza os dados de um usuário existente.

**Parâmetros:**
- `id` (string): ID único do usuário

**Request Body:**
```json
{
  "email": "emailatualizado@exemplo.com",
  "name": "Nome Atualizado"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-do-usuario",
  "email": "emailatualizado@exemplo.com",
  "name": "Nome Atualizado"
}
```

**Exemplo de uso:**
```bash
curl -X PUT http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "emailatualizado@exemplo.com",
    "name": "Nome Atualizado"
  }'
```

### 6. Excluir Usuário
**DELETE** `/users/:id`

Remove um usuário do sistema.

**Parâmetros:**
- `id` (string): ID único do usuário

**Response (204 No Content):**
Sem conteúdo no corpo da resposta.

**Exemplo de uso:**
```bash
curl -X DELETE http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000
```

## Observações Importantes

### Autenticação
- O endpoint de login retorna um token JWT que deve ser usado para acessar recursos protegidos
- O token deve ser incluído no header `Authorization` como `Bearer <token>` nas requisições protegidas

### Logging
- Todas as operações são registradas com logs detalhados incluindo:
  - Início do processamento da requisição
  - IDs dos usuários sendo processados
  - Finalização das operações

### Códigos de Status HTTP
- `200 OK`: Operação realizada com sucesso
- `201 Created`: Usuário criado com sucesso
- `204 No Content`: Usuário excluído com sucesso
- `400 Bad Request`: Dados inválidos na requisição
- `404 Not Found`: Usuário não encontrado
- `500 Internal Server Error`: Erro interno do servidor

### Segurança
⚠️ **Nota de Desenvolvimento**: O código atual possui um comentário indicando que a validação de senha com hash deve ser implementada em um ambiente de produção. Atualmente, o sistema assume que o usuário existe sem validação adequada da senha.

## Estrutura de DTOs

O controller utiliza os seguintes DTOs (Data Transfer Objects):

- `CreateUserDto`: Para criação de usuários
- `UpdateUserDto`: Para atualização de usuários
- `UserResponseDto`: Para resposta com dados do usuário
- `LoginUserDto`: Para dados de login
- `LoginResponseDto`: Para resposta do login com token

Estes DTOs garantem a validação e tipagem adequada dos dados trafegados através da API.
