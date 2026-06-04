# MCP Guide — CareerPilot AI

A guide to utilizing Model Context Protocol (MCP) servers (GitHub, PostgreSQL, Redis) inside the Windsurf Cascade interface.

---

## Prerequisites

Before interacting with MCP utilities, make sure your local infrastructure containers are running:

```bash
docker compose up -d postgres redis
```

Verify your MCP servers status inside: **Windsurf → Settings → MCP** — all three components must show a green checkmark ✅.

---

## GitHub MCP

### Issues

```text
Create an issue titled "..." with description "..."
List all open issues in the repository
Close issue #15
Add a comment to issue #12: "..."
```

### Pull Requests

```text
List all open pull requests
What changes were introduced in PR #8?
Create a pull request from branch feature/X to main with description "..."
```

### Branches & Commits

```text
Create a branch named feature/email-verification off main
Display the latest 10 commits on the main branch
```

### Common Project Scenarios

```text
Create a GitHub issue from the task plan docs/tasks/TASK_FORGOT_PASSWORD_FLOW.md
Show all issues with the 'bug' label
Create a branch fix/kanban-drag-drop off main
```

---

## PostgreSQL MCP

> ⚠️ Requires a running database container: `docker compose up -d postgres`

### Schema & Structural Queries

```text
List all tables in the careerpilot schema
Display the table schema/structure for 'vacancies'
Are there any indexes defined on the 'applications' table?
What are the foreign keys configured on the 'interviews' table?
```

### Flyway Migrations

```text
List all applied Flyway migrations
Was migration V12 successfully applied?
```

### Debugging & Inspecting Records

```text
How many vacancies are assigned to user ID 1?
Show the last 5 application timelines with status 'OFFER'
Are there users in the database missing a profile record?
List all unread notifications
```

### Metrics & Analytics Checks

```text
How many AI requests were recorded in the last 7 days? (audit_log table)
What are the most frequent skill gaps?
Display the breakdown of job applications grouped by status
```

---

## Redis MCP

> ⚠️ Requires a running Redis container: `docker compose up -d redis`

### Cache Inspection

```text
List all active keys inside Redis
Show all keys related to AI response caching
What is the TTL for Redis key "..."?
Get/Display the value of Redis key "..."
```

### Cache Management

```text
Delete/Flush all AI response cache keys
Flush all keys in Redis (flushall)
What is the current count of keys in Redis?
```

### Common Project Scenarios

```text
Check if an analyze-vacancy response is cached for vacancy X
Invalidate/Flush the AI cache after modifying the assistant prompt patterns
Show cache objects stored for user ID 1
```

---

## Combined Scenarios

Examples of prompts that leverage multiple MCP servers concurrently:

```text
Find vacancies in the database that are missing a company, and create a GitHub issue about this problem.

Inspect the Redis cache — if there are any outdated keys, delete them and create a GitHub issue describing the issue.

Show the schema of the notifications table, and create a git branch named feature/notifications-improvements to implement a new feature.
```

---

## Troubleshooting

| Issue | Resolution |
|----------|---------|
| MCP Server displays ❌ | Restart Windsurf |
| PostgreSQL: connection refused | Run `docker compose up -d postgres` |
| Redis: connection refused | Run `docker compose up -d redis` |
| GitHub: unauthorized | Check if your Personal Access Token (PAT) inside `mcp_config.json` has expired |
| npx: package not found | Verify Node.js is installed: `node -v` |

Path to the global Windsurf MCP Configuration: `C:\Users\Александр\.codeium\windsurf\mcp_config.json`
