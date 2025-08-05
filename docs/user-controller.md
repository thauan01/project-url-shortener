# User Controller

The `UserController` is responsible for managing all user-related operations in the URL shortening system. This controller provides endpoints for authentication, creation, reading, updating, and deletion of users.

## Available Endpoints

### 1. User Login
**POST** `/users/login`

Performs user authentication and returns a JWT token for accessing protected resources.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Usage example:**
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. List All Users
**GET** `/users`

Returns a list of all users registered in the system.

**Response (200 OK):**
```json
[
  {
    "id": "user-uuid-1",
    "email": "user1@example.com",
    "name": "User 1"
  },
  {
    "id": "user-uuid-2",
    "email": "user2@example.com",
    "name": "User 2"
  }
]
```

**Usage example:**
```bash
curl -X GET http://localhost:3000/users
```

### 3. Find User by ID
**GET** `/users/:id`

Returns data for a specific user by their ID.

**Parameters:**
- `id` (string): Unique user ID

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name"
}
```

**Usage example:**
```bash
curl -X GET http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000
```

### 4. Create New User
**POST** `/users`

Creates a new user in the system.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User Name",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "id": "new-user-uuid",
  "email": "newuser@example.com",
  "name": "New User Name"
}
```

**Usage example:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User Name",
    "password": "password123"
  }'
```

### 5. Update User
**PUT** `/users/:id`

Updates data for an existing user.

**Parameters:**
- `id` (string): Unique user ID

**Request Body:**
```json
{
  "email": "updatedemail@example.com",
  "name": "Updated Name"
}
```

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "updatedemail@example.com",
  "name": "Updated Name"
}
```

**Usage example:**
```bash
curl -X PUT http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updatedemail@example.com",
    "name": "Updated Name"
  }'
```

### 6. Delete User
**DELETE** `/users/:id`

Removes a user from the system.

**Parameters:**
- `id` (string): Unique user ID

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
