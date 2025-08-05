# URL Controller

O `UrlController` é o controlador principal do sistema de encurtamento de URLs. Ele gerencia todas as operações relacionadas ao encurtamento, listagem e redirecionamento de URLs, oferecendo funcionalidades tanto para usuários anônimos quanto autenticados.

## Endpoints Disponíveis

### 1. Encurtar URL (Público)
**POST** `/shorten`

Cria uma versão encurtada de uma URL fornecida. # Ver suas URLs
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Editar URL Existentendpoint é público, mas se o usuário estiver autenticado, a URL será associada à sua conta.

**Características:**
- ✅ Público (não requer autenticação)
- 🔒 Autenticação opcional (se JWT token fornecido, associa ao usuário)
- 📊 Suporte para usuários anônimos

**Request Body:**
```json
{
  "originalUrl": "https://www.exemplo.com/pagina-muito-longa-com-parametros?param1=valor1&param2=valor2"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-da-url",
  "originalUrl": "https://www.exemplo.com/pagina-muito-longa-com-parametros?param1=valor1&param2=valor2",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "userId": "uuid-do-usuario",
  "createdAt": "2025-08-04T10:30:00Z",
  "clickCount": 0
}
```

**Exemplos de uso:**

**Usuário anônimo:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

**Usuário autenticado:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

### 2. Minhas URLs (Requer Autenticação)
**GET** `/my-urls`

Lista todas as URLs criadas pelo usuário autenticado.

**Características:**
- 🔒 **REQUER AUTENTICAÇÃO** (JWT Token obrigatório)
- 👤 Retorna apenas URLs do usuário logado

**Headers Obrigatórios:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-da-url-1",
    "originalUrl": "https://www.meusite.com/pagina1",
    "shortCode": "usr123",
    "shortUrl": "http://localhost:3000/usr123",
    "userId": "uuid-do-usuario-logado",
    "createdAt": "2025-08-04T09:15:00Z",
    "clickCount": 42
  },
  {
    "id": "uuid-da-url-2",
    "originalUrl": "https://www.meusite.com/pagina2",
    "shortCode": "usr456",
    "shortUrl": "http://localhost:3000/usr456",
    "userId": "uuid-do-usuario-logado",
    "createdAt": "2025-08-04T10:20:00Z",
    "clickCount": 8
  }
]
```

**Exemplo de uso:**
```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Editar URL (Requer Autenticação)
**PUT** `/urls/:shortCode`

Permite editar uma URL existente, atualizando a URL original e/ou o código encurtado. **Só permite editar URLs que pertencem ao usuário autenticado.**

**Características:**
- 🔒 **REQUER AUTENTICAÇÃO** (JWT Token obrigatório)
- 👤 Só permite editar URLs do próprio usuário
- 🔄 Permite alterar URL original e código encurtado
- ⚠️ Validação de duplicatas de código

**Parâmetros de URL:**
- `shortCode` (string): Código atual da URL a ser editada

**Headers Obrigatórios:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "originalUrl": "https://www.novo-exemplo.com",
  "shortCode": "novo123"
}
```

**Observações sobre o body:**
- Ambos os campos são opcionais
- Se `shortCode` for fornecido, deve ser único no sistema
- Se `originalUrl` for fornecida, deve ser uma URL válida

**Response (200 OK):**
```json
{
  "id": "uuid-da-url",
  "originalUrl": "https://www.novo-exemplo.com",
  "shortCode": "novo123",
  "shortUrl": "http://localhost:3000/novo123",
  "userId": "uuid-do-usuario",
  "userName": "Nome do Usuário",
  "createdAt": "2025-08-04T10:30:00Z",
  "updatedAt": undefined,
  "deletedAt": null,
  "accessCount": 15
}
```

**Possíveis Erros:**
- **401 Unauthorized**: Token JWT inválido ou ausente
- **404 Not Found**: Código da URL não encontrado ou não pertence ao usuário
- **409 Conflict**: Novo código já existe ou URL inválida
- **400 Bad Request**: Dados de entrada inválidos

**Exemplos de uso:**

**Alterar apenas a URL original:**
```bash
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.nova-url.com"
  }'
```

**Alterar apenas o código:**
```bash
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "shortCode": "novo-codigo"
  }'
```

**Alterar ambos:**
```bash
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.site-atualizado.com",
    "shortCode": "site-novo"
  }'
```

### 4. Deletar URL (Requer Autenticação)
**DELETE** `/urls/:shortCode`

Remove permanentemente uma URL encurtada do sistema. **Só permite deletar URLs que pertencem ao usuário autenticado.**

**Características:**
- 🔒 **REQUER AUTENTICAÇÃO** (JWT Token obrigatório)
- 👤 Só permite deletar URLs do próprio usuário
- 🗑️ Exclusão permanente (não há soft delete)
- ⚠️ Ação irreversível

**Parâmetros de URL:**
- `shortCode` (string): Código da URL a ser deletada

**Headers Obrigatórios:**
```
Authorization: Bearer <jwt-token>
```

**Response (204 No Content):**
- Sem conteúdo no corpo da resposta
- Status 204 indica sucesso na exclusão

**Possíveis Erros:**
- **401 Unauthorized**: Token JWT inválido ou ausente
- **404 Not Found**: Código da URL não encontrado ou não pertence ao usuário

**Exemplos de uso:**

**Deletar uma URL:**
```bash
curl -X DELETE http://localhost:3000/urls/abc123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Verificar se a URL foi deletada (deve retornar 404):**
```bash
curl -v http://localhost:3000/abc123
```

### 5. Redirecionamento (Público)
**GET** `/:shortCode`

Redireciona o usuário para a URL original baseada no código encurtado fornecido.

**Características:**
- ✅ Público (acesso direto via browser ou qualquer cliente HTTP)
- 🔄 Redirecionamento HTTP 302 (temporário)
- 📈 Incrementa contador de cliques automaticamente

**Parâmetros:**
- `shortCode` (string): Código único da URL encurtada

**Response:**
- **302 Found**: Redirecionamento para a URL original
- **404 Not Found**: Código não encontrado

**Exemplo de URL de sucesso:**
```
GET http://localhost:3000/abc123
→ Redireciona para: https://www.google.com
```

**Response de erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Short code xyz999 not found",
  "error": "Not Found"
}
```

**Exemplos de uso:**

**Via browser:**
```
http://localhost:3000/abc123
```

**Via curl (mostrando redirecionamento):**
```bash
curl -v http://localhost:3000/abc123
```

**Via curl (seguindo redirecionamento):**
```bash
curl -L http://localhost:3000/abc123
```

## Fluxo de Autenticação

### Autenticação Opcional vs Obrigatória

| Endpoint | Autenticação | Comportamento |
|----------|-------------|---------------|
| `POST /shorten` | **Opcional** | Sem token: URL anônima<br>Com token: URL associada ao usuário |
| `GET /my-urls` | **Obrigatória** | Apenas URLs do usuário autenticado |
| `PUT /urls/:shortCode` | **Obrigatória** | Edita URL do próprio usuário |
| `DELETE /urls/:shortCode` | **Obrigatória** | Remove URL do próprio usuário |
| `GET /:shortCode` | **Não requerida** | Redirecionamento público |

### Como usar o Token JWT

Para endpoints que suportam ou requerem autenticação, inclua o header:

```
Authorization: Bearer <seu-jwt-token>
```

**Exemplo:**
```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

## Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| **200 OK** | Sucesso | Listagem de URLs, edição de URL |
| **201 Created** | Criado com sucesso | URL encurtada criada |
| **204 No Content** | Sucesso sem conteúdo | URL deletada com sucesso |
| **302 Found** | Redirecionamento | Código válido encontrado |
| **400 Bad Request** | Dados inválidos | URL inválida ou dados malformados |
| **401 Unauthorized** | Não autorizado | Token JWT inválido ou ausente (para `/my-urls`) |
| **404 Not Found** | Não encontrado | Código de URL não existe |
| **500 Internal Server Error** | Erro interno | Erro no servidor |

## Logging e Monitoramento

O controller implementa logging detalhado para todas as operações:

### Logs de Encurtamento
```
Processing request to shorten URL: https://www.google.com for user: uuid-123
Successfully shortened URL with code: abc123
```

### Logs de Listagem
```
Processing request to get URLs for authenticated user: uuid-123
Retrieved 5 URLs for user: uuid-123
```

### Logs de Edição
```
Processing request to update URL with short code: abc123
Successfully updated URL with short code: abc123
```

### Logs de Exclusão
```
Processing request to delete URL with short code: abc123
Successfully deleted URL with short code: abc123
```

### Logs de Redirecionamento
```
Processing redirect request for short code: abc123
Redirecting abc123 to https://www.google.com
```

### Logs de Erro
```
Error redirecting short code xyz999: Short code not found
```

## Estrutura de DTOs

### CreateUrlDto
Usado para criar URLs encurtadas:
```typescript
{
  originalUrl: string; // URL original a ser encurtada
}
```

### UpdateUrlDto
Usado para editar URLs existentes:
```typescript
{
  originalUrl?: string; // Nova URL original (opcional)
  shortCode?: string;   // Novo código encurtado (opcional)
}
```

### UrlResponseDto
Resposta padrão com dados da URL:
```typescript
{
  id: string;           // ID único da URL
  originalUrl: string;  // URL original
  shortCode: string;    // Código encurtado
  shortUrl: string;     // URL completa encurtada
  userId?: string;      // ID do usuário (se autenticado)
  userName?: string;    // Nome do usuário (se autenticado)
  createdAt: Date;      // Data de criação
  updatedAt?: Date;     // Data de atualização (undefined se nunca editada)
  deletedAt: Date | null; // Data de exclusão (sempre null - sem soft delete)
  accessCount: number;  // Número de acessos
}
```

## Casos de Uso Comuns

### 1. Usuário Anônimo Encurta URL
```bash
# 1. Encurtar URL
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.exemplo.com"}'

# 2. Usar URL encurtada
curl -L http://localhost:3000/abc123
```

### 2. Usuário Autenticado Gerencia URLs
```bash
# 1. Fazer login (no user controller)
TOKEN=$(curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha"}' \
  | jq -r '.accessToken')

# 2. Encurtar URL autenticado
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"originalUrl": "https://www.exemplo.com"}'

# 3. Ver suas URLs
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Usuário Autenticado Gerencia URLs
```bash
# Editar URL e código
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.nova-url.com",
    "shortCode": "novo-codigo"
  }'

# Verificar se a edição funcionou
curl -L http://localhost:3000/novo-codigo
```

### 5. Deletar URL
```bash
# Deletar uma URL específica
curl -X DELETE http://localhost:3000/urls/abc123

# Tentar acessar a URL deletada (deve retornar 404)
curl -v http://localhost:3000/abc123
```

## Observações de Segurança

- 🔒 URLs de usuários autenticados ficam associadas à conta
- 🌐 URLs anônimas não têm proprietário definido
- 🗑️ Operações de exclusão são permanentes e não podem ser desfeitas
- 📊 Todos os acessos são contabilizados no `clickCount`
- 🔍 Logs detalhados permitem auditoria de uso
