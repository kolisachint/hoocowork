# Run / restart the dev server

`npm run dev` runs the backend (`tsx server/index.js`) and the Vite client under `concurrently`. Because `tsx` runs without `--watch`, server-side changes need a process restart — and a stale runner left over from the previous session will keep the old code in memory.

## One-shot restart

Run from the project root. Kills any leftover `concurrently` / `tsx` / `vite` processes belonging to this checkout, waits for them to exit, then relaunches `npm run dev` in the background with logs streaming to `/tmp/claudecodeui2-dev.log`:

```bash
PIDS=$(ps aux | grep -E "claudecodeui2/node_modules/.bin/(concurrently|tsx|vite)" | grep -v grep | awk '{print $2}'); [ -n "$PIDS" ] && kill -9 $PIDS 2>/dev/null; sleep 2; (nohup npm run dev > /tmp/claudecodeui2-dev.log 2>&1 &)
```

Tail the log to confirm boot:

```bash
tail -f /tmp/claudecodeui2-dev.log
```

You should see, in order :
- `VITE v… ready` (Vite client at <http://localhost:5173>)
- `Server URL: http://localhost:3001` (backend)
- `Initial session synchronization complete { processedByProvider: { … } }`

## When to use it

- After editing any file under `server/` (no HMR for the backend).
- After upgrading deps or changing TS config.
- Whenever the in-memory `scan_state` or session caches need to be refreshed from the DB.

Frontend-only changes under `src/` reload via Vite HMR — no restart needed.

## Manually starting the dev server (foreground)

```bash
npm run dev
```

This is the same command but tied to your terminal. Use the one-shot above when you want it to survive your shell session.
