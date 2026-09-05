---
name: omp-best-models-lookup
description: Look up current best models and skills for Oh My Pi via live rankings
---

# OMP Best-Models Lookup

Repeatable procedure to answer "best models/agents for OMP" with live data, not memory.

## Inputs
- `~/.omp/agent/config.yml` (current modelRoles)
- `~/.omp/marketplaces.json`, `installed_plugins.json` (already-installed plugins)

## Procedure
1. Run three TinyFish searches in parallel:
   - `tinyfish search query "best AI coding agents 2026 ranking" --pretty`
   - `tinyfish search query "Oh My Pi omp best models agents" --pretty`
   - `tinyfish search query "skills.sh leaderboard most installed agent skills" --pretty`
2. Fetch in parallel: `https://github.com/can1357/oh-my-pi`, `https://omp.sh/`, `https://www.skills.sh/`, plus top 2 ranking URLs from step 1.
3. Run `npx --yes skills find "coding agent"` for install-count ranking.
4. Compare `modelRoles` in config.yml against: Vellum SWE-Bench, Kilo live usage, Requesty Coding Index, Artificial Analysis intelligence.
5. Recommend: keep frontier roles (GPT-5.6 Sol/Luna, GPT-5.5, Claude Opus/Fable, Gemini Flash, Grok); add `retry.fallbackChains.default: [opencode-zen/nemotron-3-ultra-free]` only when rate-limited.
6. Recommend skills only by installs (>1K preferred): `openclaw/openclaw@coding-agent`, `sammcj/agentic-coding@critical-thinking-logical-reasoning`; skip reinstall of already-installed plugins.
7. Cite every ranking claim with its URL. Never recommend from memory alone.

## Boundaries
- Benchmarks decay fast; always re-search, never reuse old numbers.
- Do not create exhaustive skill crawls; stop at top installs per query.
