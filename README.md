# NODE-10 — Rate Limiting & Throttling with Redis

**Node.js + Express.js + Redis | Practice Project**

This project implements an **exact sliding-window API rate limiter** using Redis sorted sets and an atomic Lua script. It demonstrates IP-based, authenticated-user-based, and validated-API-token-based limits, `429 Too Many Requests` responses, `Retry-After` headers, and shared limits across multiple Express instances.

This README is based on the attached NODE-10 practice document and focuses on the commands required to **set up, run, and test** that project.

## 1. Requirements

Install and have available:

- **Node.js and npm**
- **Docker Desktop**, running (to start the Redis container)
- A terminal; the examples below use **Windows PowerShell** for HTTP tests and multi-instance setup.

## 2. Create the project

Run in your terminal:

```powershell
mkdir node-rate-limiting
cd node-rate-limiting
npm init -y
```

Install runtime dependencies:

```powershell
npm install express redis dotenv express-rate-limit
```

Install development and testing dependencies:

```powershell
npm install --save-dev jest supertest nodemon
```

**Note:** `express-rate-limit` is included to compare the standard library with the custom Redis Lua implementation. The main practice routes use the **custom** limiter; do not apply both limiters to the same route.

## 3. Configure npm commands

Add or update the `scripts` property in `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest --runInBand",
    "test:coverage": "jest --coverage --runInBand"
  }
}
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon (automatic restart on file changes). |
| `npm start` | Start the API with Node.js. |
| `npm test` | Run Jest / Supertest tests sequentially. |
| `npm run test:coverage` | Run the tests and generate the coverage report. |

## 4. Configure environment variables

Create `.env` in the project root:

```dotenv
PORT=3000
REDIS_URL=redis://localhost:6379
TRUST_PROXY=false
```

Create `.env.example` with safe example values. Add these entries to `.gitignore`:

```gitignore
node_modules/
.env
coverage/
```

The automated tests in the attached document use `redis://localhost:6379/15` by default, keeping test data separate from the development database (`/0`). You may set `TEST_REDIS_URL` if you need a different **nonproduction** test Redis database.

## 5. Run Redis using Docker

First, **start Docker Desktop**. For the first run, create the Redis container:

```powershell
docker run -d --name rate-limit-redis -p 6379:6379 redis:7-alpine
```

Check that Redis is responding:

```powershell
docker exec rate-limit-redis redis-cli ping
```

Expected output:

```text
PONG
```

If the Redis container already exists but is stopped, **do not run `docker run` again**. Start the existing container instead:

```powershell
docker start rate-limit-redis
```

Then verify with `docker exec rate-limit-redis redis-cli ping`.

## 6. Start the API

From the project root, after creating the source files described in the practice document:

```powershell
npm run dev
```

Expected output:

```text
Server running on port 3000
```

Alternatively, start without Nodemon:

```powershell
npm start
```

API base URL: `http://localhost:3000`.

## 7. Test API rate limits manually

Open a **second Windows PowerShell terminal** while Redis and the API are running. These commands use `curl.exe` (not the PowerShell `curl` alias).

### 7.1 Public API — limit: 5 requests per 60 seconds per IP

Send six requests:

```powershell
1..6 | ForEach-Object {
  curl.exe -s -o NUL -w '%{http_code}\n' http://localhost:3000/api/public
}
```

Expected status codes within a fresh 60-second window:

```text
200
200
200
200
200
429
```

View the response headers, including `Retry-After`, after the quota has been reached:

```powershell
curl.exe -i http://localhost:3000/api/public
```

**Note:** The limiter uses a *rolling* 60-second window. If you have already made requests, the first result may be `429`; wait for the oldest counted request to expire before repeating a fresh-window test.

### 7.2 Profile API — limit: 10 requests per 60 seconds per authenticated user

Send 11 requests for the first demo user:

```powershell
1..11 | ForEach-Object {
  curl.exe -s -o NUL -w '%{http_code}\n' -H 'Authorization: Bearer demo-user-token' http://localhost:3000/api/profile
}
```

Expected: first 10 return `200`; the 11th returns `429` in a fresh window.

Check that the second demo user has an **independent** quota:

```powershell
curl.exe -i -H 'Authorization: Bearer second-user-token' http://localhost:3000/api/profile
```

Expected: `200` for this user's first request.

### 7.3 Partner API — limit: 8 requests per 60 seconds per validated API token

Send nine requests using the first practice token:

```powershell
1..9 | ForEach-Object {
  curl.exe -s -o NUL -w '%{http_code}\n' -H 'X-API-Key: partner-token-123' http://localhost:3000/api/partner
}
```

Expected: first 8 return `200`; the ninth returns `429` in a fresh window.

Check the second token's independent quota:

```powershell
curl.exe -i -H 'X-API-Key: partner-token-456' http://localhost:3000/api/partner
```

Expected: `200` for this token's first request.

The demo bearer tokens and API keys are **practice fixtures only**, not production credentials.

### 7.4 Health check — not rate-limited

```powershell
curl.exe -i http://localhost:3000/healthz
```

Expected: `200 OK` while the application is healthy. This endpoint is exempt from rate limiting.

## 8. Run automated tests

Keep **Redis running**. The tests use Jest, Supertest, and Redis database `15` by default.

Run tests:

```powershell
npm test
```

Run tests with coverage:

```powershell
npm run test:coverage
```

The attached project document tests:

- Requests allowed within the limit and blocked beyond it
- Sliding-window expiry and independent keys
- Atomic behavior under concurrent requests
- HTTP `429` and `Retry-After`
- Unrestricted `/healthz`
- Sharing a rate limit across Express instances
- HTTP `503` when Redis checking fails (fail-closed behavior)

**Do not run the integration tests against production Redis.**

## 9. Verify two Node.js instances share the same Redis limit

Keep Redis running. Start two **separate Windows PowerShell terminals**, each in the project directory and using the same `REDIS_URL`.

**Terminal 1:**

```powershell
$env:PORT=3000
npm start
```

**Terminal 2:**

```powershell
$env:PORT=3001
npm start
```

In a **third PowerShell terminal**, send six requests alternating between the ports:

```powershell
3000,3001,3000,3001,3000,3001 | ForEach-Object {
  curl.exe -s -o NUL -w '%{http_code}\n' "http://localhost:$_/api/public"
}
```

Expected, when starting with a fresh 60-second window from the same client IP:

```text
200
200
200
200
200
429
```

Both API processes must connect to the **same Redis server**, with the **same limit policy and key construction**. This exercise tests multiple Express instances, not a full Redis Cluster deployment.

## 10. Endpoints and policies

| Endpoint | Key strategy | Limit | Behavior |
| --- | --- | --- | --- |
| `GET /api/public` | Client IP | 5 requests / 60 sec | `429` when exceeded |
| `GET /api/profile` | Verified user ID | 10 requests / 60 sec | Requires demo bearer token |
| `GET /api/partner` | Hash of validated API token | 8 requests / 60 sec | Requires demo `X-API-Key` |
| `GET /healthz` | None | Unlimited | Health check exemption |

A blocked request returns HTTP `429 Too Many Requests` and a dynamically computed `Retry-After` header. The documented Redis failure policy returns `503 Service Unavailable` if the limiter cannot check Redis.

## 11. Important correction found while reviewing the attached document

In the document's `src/middleware/rateLimiter.js` example, the key is shown as:

```js
`rate-limit:policyName:{key}`
```

That is a **constant string**, so different users, tokens, and policies would accidentally share the **same Redis rate-limit key**.

Use a JavaScript template literal with interpolation instead:

```js
`rate-limit:${policyName}:${key}`
```

This change is essential for the independent-user, independent-token, and per-policy behavior described in the project. Apply it in `checkRateLimit(...)` before testing. Do not use client-supplied identity strings as trusted rate-limit keys without authentication or validation.

## 12. Quick command reference

| Task | Command |
| --- | --- |
| Initialize project | `npm init -y` |
| Install dependencies | `npm install express redis dotenv express-rate-limit` |
| Install dev dependencies | `npm install --save-dev jest supertest nodemon` |
| Create Redis container | `docker run -d --name rate-limit-redis -p 6379:6379 redis:7-alpine` |
| Start existing Redis container | `docker start rate-limit-redis` |
| Check Redis connection | `docker exec rate-limit-redis redis-cli ping` |
| Start development server | `npm run dev` |
| Start normal server | `npm start` |
| Run tests | `npm test` |
| Run coverage | `npm run test:coverage` |

---

**Project scope:** Redis-backed exact sliding-window rate limiting using Node.js and Express, with practice-only authentication, isolated tests, basic structured logging, and a multi-instance consistency check. The attached document does **not** require a frontend, production authentication service, queue-based throttling, or a monitoring dashboard.
