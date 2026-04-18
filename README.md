# OpenRouter Simulator

A local Node.js server that mimics the [OpenRouter](https://openrouter.ai) API (OpenAI-compatible format). Lets you test AI-powered features without spending real tokens.

## Quick start

```bash
pnpm install
pnpm dev
```

Server starts on `http://localhost:5200`.

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5200` | Port to listen on |
| `API_TOKEN` | _(empty)_ | Required Bearer token. Leave empty to skip auth. |
| `DEFAULT_RESPONSE` | `Hello, you reached OpenRouter Simulator.` | Fallback reply for unmatched prompts |

## Prompt overrides

Create a `prompts.csv` file in the project root. When the incoming user message matches a row, the corresponding response is returned instead of the default. The file is loaded at startup; restart the server to pick up changes.

### Columns

| Column | Required | Description |
|---|---|---|
| `matchType` | No | `exact` (default) or `contain` — see below |
| `prompt` | Yes | The prompt string to match against |
| `response1` | Yes* | First (or only) response |
| `response2`–`response5` | No | Additional response variants |

\* At least one of `response1` or the legacy `response` column must be non-empty.

### Match types

- **`exact`** — the incoming message must equal the `prompt` value exactly (case-insensitive, trimmed). This is the default when `matchType` is omitted.
- **`contain`** — the incoming message must _contain_ the `prompt` value as a substring (case-insensitive).

### Multiple responses

If more than one `response` column has a non-empty value, one is chosen at random on each request. This lets you vary replies without changing the simulator's wiring.

```csv
matchType,prompt,response1,response2,response3,response4,response5
exact,what is 2+2,The answer is 4.,,,,
exact,hello,Hey there!,Hi! How can I help?,Hello!,,
contain,joke,Why don't scientists trust atoms? Because they make up everything!,I told my wife she was drawing her eyebrows too high. She looked surprised.,"Why can't you explain puns to kleptomaniacs? They always take things literally.",,
```

### Legacy format

The old two-column format (`prompt,response`) is still supported for backwards compatibility.

## API

The server exposes a single endpoint matching the OpenRouter/OpenAI chat completions shape.

**`POST /api/v1/chat/completions`**

Request:
```json
{
  "model": "any-string",
  "messages": [
    { "role": "user", "content": "hello" }
  ]
}
```

Response:
```json
{
  "id": "sim-<uuid>",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "any-string",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "Hey there!" },
    "finish_reason": "stop",
    "logprobs": null
  }],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0,
    "cache_creation_input_tokens": null,
    "cache_read_input_tokens": null
  },
  "service_tier": null
}
```

Auth error response (401):
```json
{
  "error": {
    "code": 401,
    "message": "Invalid API key",
    "metadata": null
  },
  "user_id": null
}
```

**`GET /`** — health check, returns `{ "status": "ok" }`.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start with ts-node (development) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled output |
| `pnpm test` | Run test suite |
| `pnpm test:watch` | Watch mode |
| `pnpm test:coverage` | Coverage report |
