# URL Controller

The `UrlController` is the main controller of the URL shortening system. It manages all operations related to URL shortening, listing, and redirection, offering functionalities for both anonymous and authenticated users.

## Available Endpoints

### 1. Shorten URL (Public)
**POST** `/shorten`

Creates a shortened version of a provided URL. This endpoint is public, but if the user is authenticated, the URL will be associated with their account.

**Features:**
- ✅ Public (no authentication required)
- 🔒 Optional authentication (if JWT token provided, associates to user)
- 📊 Support for anonymous users

**Request Body:**
```json
{
  "originalUrl": "https://www.example.com/very-long-page-with-parameters?param1=value1&param2=value2"
}
```

**Response (201 Created):**
```json
{
  "id": "url-uuid",
  "originalUrl": "https://www.example.com/very-long-page-with-parameters?param1=value1&param2=value2",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "userId": "user-uuid",
  "createdAt": "2025-08-04T10:30:00Z",
  "clickCount": 0
}
```

**Usage Examples:**

**Anonymous user:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

**Authenticated user:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

### 2. My URLs (Requires Authentication)
**GET** `/my-urls`

Lists all URLs created by the authenticated user.

**Features:**
- 🔒 **REQUIRES AUTHENTICATION** (JWT Token mandatory)
- 👤 Returns only URLs from the logged user

**Required Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
[
  {
    "id": "url-uuid-1",
    "originalUrl": "https://www.mysite.com/page1",
    "shortCode": "usr123",
    "shortUrl": "http://localhost:3000/usr123",
    "userId": "logged-user-uuid",
    "createdAt": "2025-08-04T09:15:00Z",
    "clickCount": 42
  },
  {
    "id": "url-uuid-2",
    "originalUrl": "https://www.mysite.com/page2",
    "shortCode": "usr456",
    "shortUrl": "http://localhost:3000/usr456",
    "userId": "logged-user-uuid",
    "createdAt": "2025-08-04T10:20:00Z",
    "clickCount": 8
  }
]
```

**Usage Example:**
```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Edit URL (Requires Authentication)
**PUT** `/urls/:shortCode`

Allows editing an existing URL, updating the original URL and/or the short code. **Only allows editing URLs that belong to the authenticated user.**

**Features:**
- 🔒 **REQUIRES AUTHENTICATION** (JWT Token mandatory)
- 👤 Only allows editing URLs owned by the user
- 🔄 Allows changing original URL and short code
- ⚠️ Duplicate code validation

**URL Parameters:**
- `shortCode` (string): Current code of the URL to be edited

**Required Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "originalUrl": "https://www.new-example.com",
  "shortCode": "new123"
}
```

**Body Notes:**
- Both fields are optional
- If `shortCode` is provided, it must be unique in the system
- If `originalUrl` is provided, it must be a valid URL

**Response (200 OK):**
```json
{
  "id": "url-uuid",
  "originalUrl": "https://www.new-example.com",
  "shortCode": "new123",
  "shortUrl": "http://localhost:3000/new123",
  "userId": "user-uuid",
  "userName": "User Name",
  "createdAt": "2025-08-04T10:30:00Z",
  "updatedAt": undefined,
  "deletedAt": null,
  "accessCount": 15
}
```

**Possible Errors:**
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: URL code not found or doesn't belong to user
- **409 Conflict**: New code already exists or invalid URL
- **400 Bad Request**: Invalid input data

**Usage Examples:**

**Change only the original URL:**
```bash
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.new-url.com"
  }'
```

**Change only the code:**
```bash
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "shortCode": "new-code"
  }'
```

**Change both:**
```bash
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.updated-site.com",
    "shortCode": "new-site"
  }'
```

### 4. Delete URL (Requires Authentication)
**DELETE** `/urls/:shortCode`

Permanently removes a shortened URL from the system. **Only allows deleting URLs that belong to the authenticated user.**

**Features:**
- 🔒 **REQUIRES AUTHENTICATION** (JWT Token mandatory)
- 👤 Only allows deleting URLs owned by the user
- 🗑️ Permanent deletion (no soft delete)
- ⚠️ Irreversible action

**URL Parameters:**
- `shortCode` (string): Code of the URL to be deleted

**Required Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (204 No Content):**
- No content in response body
- Status 204 indicates successful deletion

**Possible Errors:**
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: URL code not found or doesn't belong to user

**Usage Examples:**

**Delete a URL:**
```bash
curl -X DELETE http://localhost:3000/urls/abc123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Verify if URL was deleted (should return 404):**
```bash
curl -v http://localhost:3000/abc123
```

### 5. Redirection (Public)
**GET** `/:shortCode`

Redirects the user to the original URL based on the provided short code.

**Features:**
- ✅ Public (direct access via browser or any HTTP client)
- 🔄 HTTP 302 (temporary) redirection
- 📈 Automatically increments click counter

**Parameters:**
- `shortCode` (string): Unique code of the shortened URL

**Response:**
- **302 Found**: Redirect to original URL
- **404 Not Found**: Code not found

**Successful URL example:**
```
GET http://localhost:3000/abc123
→ Redirects to: https://www.google.com
```

**Error response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Short code xyz999 not found",
  "error": "Not Found"
}
```

**Usage Examples:**

**Via browser:**
```
http://localhost:3000/abc123
```

**Via curl (showing redirection):**
```bash
curl -v http://localhost:3000/abc123
```

**Via curl (following redirection):**
```bash
curl -L http://localhost:3000/abc123
```

## Authentication Flow

### Optional vs Required Authentication

| Endpoint | Authentication | Behavior |
|----------|-------------|---------------|
| `POST /shorten` | **Optional** | Without token: Anonymous URL<br>With token: URL associated with user |
| `GET /my-urls` | **Required** | Only URLs from authenticated user |
| `PUT /urls/:shortCode` | **Required** | Edit user's own URL |
| `DELETE /urls/:shortCode` | **Required** | Remove user's own URL |
| `GET /:shortCode` | **Not required** | Public redirection |

### How to use JWT Token

For endpoints that support or require authentication, include the header:

```
Authorization: Bearer <your-jwt-token>
```

**Exemplo:**
```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

## HTTP Status Codes

| Code | Meaning | When It Occurs |
|--------|-------------|---------------|
| **200 OK** | Success | URL listing, URL editing |
| **201 Created** | Successfully created | Shortened URL created |
| **204 No Content** | Success without content | URL successfully deleted |
| **302 Found** | Redirection | Valid code found |
| **400 Bad Request** | Invalid data | Invalid URL or malformed data |
| **401 Unauthorized** | Unauthorized | Invalid or missing JWT token (for `/my-urls`) |
| **404 Not Found** | Not found | URL code doesn't exist |
| **500 Internal Server Error** | Internal error | Server error |

## Logging and Monitoring

The controller implements detailed logging for all operations:

### Shortening Logs
```
Processing request to shorten URL: https://www.google.com for user: uuid-123
Successfully shortened URL with code: abc123
```

### Listing Logs
```
Processing request to get URLs for authenticated user: uuid-123
Retrieved 5 URLs for user: uuid-123
```

### Editing Logs
```
Processing request to update URL with short code: abc123
Successfully updated URL with short code: abc123
```

### Deletion Logs
```
Processing request to delete URL with short code: abc123
Successfully deleted URL with short code: abc123
```

### Redirection Logs
```
Processing redirect request for short code: abc123
Redirecting abc123 to https://www.google.com
```

### Error Logs
```
Error redirecting short code xyz999: Short code not found
```

## DTO Structure

### CreateUrlDto
Used to create shortened URLs:
```typescript
{
  originalUrl: string; // Original URL to be shortened
}
```

### UpdateUrlDto
Used to edit existing URLs:
```typescript
{
  originalUrl?: string; // New original URL (optional)
  shortCode?: string;   // New short code (optional)
}
```

### UrlResponseDto
Standard response with URL data:
```typescript
{
  id: string;           // Unique URL ID
  originalUrl: string;  // Original URL
  shortCode: string;    // Short code
  shortUrl: string;     // Complete shortened URL
  userId?: string;      // User ID (if authenticated)
  userName?: string;    // User name (if authenticated)
  createdAt: Date;      // Creation date
  updatedAt?: Date;     // Update date (undefined if never edited)
  deletedAt: Date | null; // Deletion date (always null - no soft delete)
  accessCount: number;  // Number of accesses
}
```

## Common Use Cases

### 1. Anonymous User Shortens URL
```bash
# 1. Shorten URL
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.example.com"}'

# 2. Use shortened URL
curl -L http://localhost:3000/abc123
```

### 2. Authenticated User Manages URLs
```bash
# 1. Login (in user controller)
TOKEN=$(curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}' \
  | jq -r '.accessToken')

# 2. Shorten URL authenticated
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"originalUrl": "https://www.example.com"}'

# 3. View your URLs
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Authenticated User Edits URLs
```bash
# Edit URL and code
curl -X PUT http://localhost:3000/urls/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.new-url.com",
    "shortCode": "new-code"
  }'

# Verify if the edit worked
curl -L http://localhost:3000/new-code
```

### 4. Delete URL
```bash
# Delete a specific URL
curl -X DELETE http://localhost:3000/urls/abc123

# Try to access the deleted URL (should return 404)
curl -v http://localhost:3000/abc123
```

## Security Notes

- 🔒 URLs from authenticated users are associated with their account
- 🌐 Anonymous URLs have no defined owner
- 🗑️ Delete operations are permanent and cannot be undone
- 📊 All accesses are counted in `clickCount`
- 🔍 Detailed logs allow usage auditing
