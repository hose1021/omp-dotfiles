# OMP response-style policy & plugin swap discipline

## Current policy surface
- Concise-by-default via agent/APPEND_SYSTEM.md (single policy layer — do NOT also create AGENTS.md/RULES.md, custom extension, or skill dirs; would break `stop caveman` honor).
- Keep: technical substance, code, commands, identifiers, numbers, exact error strings. Compress: chat prose only. Full prose: security warnings, irreversible actions, multi-step ambiguity, clarification requests. Preserve user language; no invented abbreviations.
- Escape: `stop caveman` / `normal mode` (session), intensity full default.

## Plugin replace/remove discipline (ponytail precedent)
- Install official runtime first (`rtk omp plugin install @dietrichgebert/ponytail@4.9.0`), verify load, then remove old integration — no dead aliases/stubs (cavecrew had no counterpart; Ponytail already injects into subagents).
- Uninstall via CLI only (`omp plugin uninstall`); never hand-edit package.json/omp-plugins.lock.json unless CLI fails with concrete error after re-reading files.
- Unrelated packages stay: unscoped `ponytail@1.0.57` in plugins/node_modules is a different npm project — do not delete. Empty `@dietrichgebert/` scope dir after uninstall is safe to rmdir.
- Deleted permanently (leave gone): peon-ping (all surfaces incl. brew tap; ~/.codex/config.toml `notify` is Codex's own, not peon), Serena MCP registration (.serena/ data dirs inert, remove only on explicit request).

## caveman-stats honesty rule
- No tracker hook / history log in omp → report unavailability, never fabricate savings/sessions/ratios. First check hook presence + ~/.config/caveman/.caveman-history.jsonl.

## Verification pattern for policy swaps
1) omp plugin list/doctor --json; 2) deterministic config check (plugin array, command, skills paths, injected marker); 3) E2E skill discovery headless; 4) zero-grep audit of active locations; 5) git status shows only planned changes.

## Superpowers interplay
- ≥1% chance a skill applies → invoke via skill tool before responding. Direct user instructions override skills. Bootstrap re-injected after compaction (guard: EXTREMELY_IMPORTANT marker).
