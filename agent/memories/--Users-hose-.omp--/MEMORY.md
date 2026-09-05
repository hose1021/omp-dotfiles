# Long-term Memory — omp harness (macOS, /Users/hose)

## Environment
- Harness: omp (opencode-go) at ~/.omp, NOT Claude Code. Superpowers plugin v6.3.0 installed (skills discovery + bootstrap injection with EXTREMELY_IMPORTANT guard; re-injected after compaction). Rule: if ≥1% chance a skill applies, invoke it first; direct user instructions override skills; subagents on concrete tasks exempt.
- RTK rule: prefix shell commands with `rtk` (rtk git status, rtk omp ...); raw env control via `rtk proxy git <args>`.
- rtk omp extension at ~/.omp/agent/extensions/rtk.ts hooks bash tool_call → rtk rewrite; exit 0/3 rewrite, 1/2 passthrough. Native read/grep/glob bypass rtk. Restart omp for pickup.
- safety-guard pre-hook (agent/hooks/pre/safety-guard.ts, 17 git/destructive rules) blocks `git push` from agent bash and destructive ops (rm -rf /, sudo rm, curl|sh, DROP DATABASE, etc.). User pushes manually. Hooks added mid-session do NOT load — verify in fresh `omp -p` session.

## Dotfiles repo (~/.omp → git@github.com:hose1021/omp-dotfiles.git, main)
- Trunk flow: short-lived branches, atomic conventional commits (~100 lines, feat/fix/refactor/test/docs/chore, message explains why). Commit workflow: git_overview(staged) → git_file_diff → git_hunk if elided → split_commit (full coverage, no overlaps, rationale per commit). Past-tense summaries ≤72 chars.
- docs-type validation requires text source; binary PDF alone → chore(docs). Binaries staged by accident: group into one chore commit and recommend git restore --staged + .gitignore; don't mix with code.
- Historically untracked, intentionally: autoqa.db (grievances ledger), omp-work-guide.pdf (1.8MB), agent/last-changelog-version bump marker. agent/config.yml.lock is transient — never commit.
- Rebase conflicts macOS vs Windows host: take local (macOS) side — safety-guard.ts, agent/config.yml, marketplaces.json (machine-specific absolute paths; will conflict every sync; future fix: split per-host or exclude). Resolve: git checkout --theirs <files> && git add && GIT_EDITOR=true git rebase --continue. Verify with bun test safety-guard.test.ts (48/48).

## Model config (agent/config.yml + models.yml)
- modelRoles: advisor=openai-codex/gpt-5.6-sol, default/smol=opencode-go/glm-5.3-flash:high, slow/plan=gpt-5.5:high, vision=google/gemini-3.7-flash. cycleOrder [smol, default, slow]. enabledModels: opencode-go/*, openai-codex/*, gemini variants. 41 models. Restart omp after edits; verify Alt+M / Ctrl+P.
- models.yml must be `providers: {}` minimum — `providers:` (null) trips schema error "providers: must be an object". Fix = explicit empty mapping; add null→{} regression guard.
- Quota/EOL pitfalls: tokenrouter z-ai/glm-5.3-flash → 403 insufficient_user_quota is non-retryable (fail fast). nvidia z-ai/glm-5.2 → 410 EOL (2026-08-21); nvidia kimi-k3 unreliable (429). Working fallback: opencode-go/deepseek-v4-flash. tokenrouter catalog only has z-ai/glm-5.3-free (1M ctx, ~36s latency).
- Edit-tool snapshot artifacts: always verify file content via re-read / YAML parse before believing blank lines.

## Caveman/Ponytail history (current state: see below)
- Caveman was replaced by Ponytail 4.9.0 (@dietrichgebert/ponytail, official runtime, no aliases/stubs; opencode.json plugin array; cavecrew deleted because Ponytail injects into subagents). caveman-stats unavailable in omp (no tracker hook, no ~/.config/caveman/.caveman-history.jsonl) — never fabricate savings numbers.
- If user re-requests caveman-style default: single OMP-native agent/APPEND_SYSTEM.md policy (concise by default, keep code/security/clarifications in full prose, `stop caveman` / `normal mode` disables, intensity `full`), one policy layer, no AGENTS.md/RULES.md duplicates. Uninstall plugins via CLI only; never hand-edit package.json/lock unless CLI fails.

## Artifacts
- ~/.omp/presentation.pdf (12 slides, A4 landscape, Russian) + presentation.html source; data from agent.db:model_perf, usage_history, history.db (~267 prompts). Workflow: HTML+mermaid → browser render check (0 syntax errors) → page.pdf() → validate visually (SVG text-extract garbage is normal).
- omp-work-guide.pdf: 20-slide 16:9 Russian field guide; CSS-only, system Cyrillic fonts, @page 13.333in 7.5in zero margins.

## External lookups
- X/Twitter: direct read blocked; working: curl https://cdn.syndication.twimg.com/tweet-result?id=<id>&lang=en&token=x → Tweet JSON. X Articles need browser (syndication API with article ID fails).
- Baku: taxi fares via Yandex Go/Bolt in AZN (disambiguate venue, tariffs volatile); Diet Line (@diet_line.az, +994 99 888 0 1234) 450 AZN weekdays / 550 month ≈ 6–8 AZN/meal, below market; confirm days/delivery/program in DM. Answer in Russian.
- Removed integrations (leave alone): Serena MCP (only registration removed from ~/.claude.json; .serena data dirs inert), peon-ping (fully removed incl. brew tap; ~/.codex/config.toml notify is Codex's own, not peon). ponytail@1.0.57 in plugins/node_modules is an unrelated npm package — do not delete.

## Misc
- Caffeine: peak 30–60min, half-life 5–6h, cutoff ~6h before sleep.
- ai-job-search repo: /Users/hose/Programming/ai-job-search, master synced, remotes origin hose1021 / upstream MadsLorentzen; don't auto-commit fonts binaries.
