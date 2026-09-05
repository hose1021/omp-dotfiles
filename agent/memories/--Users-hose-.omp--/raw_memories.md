# Raw Memories

## 01a05f5e-6ff2-7013-9810-f1b376c0b0c7
updated_at: 1788452055
CONTEXT: harness is omp at /Users/hose/.omp loading opencode-compatible plugins

SUPERPOWERS PLUGIN:
- location: plugins/node_modules/superpowers v6.3.0, entry .opencode/plugins/superpowers.js
- hook `config`: registers plugins/node_modules/superpowers/skills into skills discovery -> SKILL.md files appear as native skill tool (brainstorming, writing-plans, subagent-driven-development, test-driven-development, systematic-debugging, etc.)
- hook `experimental.chat.messages.transform`: injects bootstrap block <EXTREMELY_IMPORTANT> + using-superpowers SKILL.md content into first user message each session, re-injected after compaction. Cached bootstrap, guard against double injection by checking for EXTREMELY_IMPORTANT. Must not do repeated disk work.
- rule: if >=1% chance skill applies, MUST invoke via skill tool BEFORE any response including clarifying questions
- expected pipeline: build request -> brainstorming -> using-git-worktrees -> writing-plans -> subagent-driven-development with TDD -> requesting-code-review between tasks -> finishing-a-development-branch; bugfix -> systematic-debugging first, verification-before-completion before done
- precedence: direct user instructions (AGENTS.md, chat) override skills; subagents on concrete task exempt from skill check
- explicit invoke: "use superpowers:brainstorming"; telemetry off via SUPERPOWERS_DISABLE_TELEMETRY

GIT WORKFLOW:
- trigger skill://git-wo[REDACTED] on any commit/branch/PR/push/release
- RTK rule: prefix shell commands with `rtk` (e.g., rtk git status)
- discipline: trunk-based, short-lived branches 1-3 days, atomic commits ~100 lines, conventional types feat/fix/refactor/test/docs/chore, message explains why not what, separate concerns, save-point pattern test->commit->continue

## 01a067e1-850b-74d5-8897-de27aee2e0ae
updated_at: 1788450321
Artifacts:
- /Users/hose/.omp/presentation.pdf — финальный результат, 12 слайдов
- /Users/hose/.omp/presentation.html — исходник для правок и перегенерации PDF
- Config source: /Users/hose/.omp/agent/config.yml (modelRoles, cycleOrder, enabledModels, modelProviderOrder)

Data sources used (reusable for future analytics):
- agent.db:model_perf (samples, output_tokens, gen_ms, ttft_ms) — статистика моделей
- agent.db:usage_history — лимиты провайдеров
- history.db — история промптов (~267)
- plugins: installed_plugins.json, omp-plugins.lock.json — выявлен дубликат superpowers из второго маркетплейса

Workflow (proven):
1. Собрать HTML с mermaid-диаграммами (6 шт, без картинок, только стрелки/схемы)
2. Отрендерить в browser tab name=pres, проверить 0 mermaid syntax errors + скриншот титула
3. Экспорт через page.pdf() в A4 landscape
4. Проверка извлечением текста PDF — SVG-диаграммы дают мусор в text-extract, это норма, валидировать визуально скриншотом

User requirement preserved: максимально информативно, стрелки/диаграммы, без картинок, на русском.

## 01a067d2-ed28-74af-ad4e-2261bd8749b8
updated_at: 1788448600
WORKFLOW: Propose conventional commit for staged changes -> 1) git_overview(staged=true) 2) git_file_diff for text files 3) analyze_files for deeper per-file summaries 4) propose_commit | split_commit.
STAGED SET ANALYZED: agent/last-changelog-version (1-line bump 18.1.2 -> 18.1.6, startup release-note marker), autoqa.db (16KB SQLite ledger, grievances table per-model tool-failure reports with pushed sync flag, 1 row pushed=1), omp-work-guide.pdf (1.7MB 20-page Russian field guide: modes/tools/approvals/workflows). Co-located but functionally independent.
DECISION: split_commit into 3 atomic commits: chore(agent): bumped changelog version marker to 18.1.6 / chore(autoqa): added grievances database for auto-QA reports / chore(docs): added omp work guide pdf.
PITFALL/VALIDATOR RULE: docs type requires documentation source changes (markdown/text); binary PDF alone fails validation -> reclassify as chore(docs). Past-tense summaries <=72 chars. Provide rationale per commit for atomicity/bisect/revert clarity.

## 01a067c8-91d1-75c3-9ca8-8769920f7f20
updated_at: 1788448258
Extension path: ~/.omp/agent/extensions/rtk.ts (~35 lines, auto-discovery, works in all omp modes incl. interactive + headless -p).
Hook: tool_call on bash tool -> runs `rtk rewrite <cmd>` (single source of mappings, same as rtk's own Claude hooks).
Exit handling: exit 0/3 -> revision { input: { command } } (rewritten command visible to approval-gate, preserves rtk ask-rules safety); exit 1/2, heredoc, already-rtk commands, failed rtk -> passthrough unchanged.
Verification: created /tmp/rtk-smoke git repo (dirty a.txt), ran `omp -p "Run shell command: git status..."`; model received compressed `* master\n M a.txt` not raw git text. `rtk rewrite "echo hi"` -> exit 1 passthrough confirmed. Cleaned up /tmp/rtk-smoke.
Pitfall/limitation: native read/grep/glob tools bypass bash so bypass rtk; same limitation as all rtk hook integrations. Future work if requested: wrappers for `rtk read/grep`.
Requirement: restart omp for interactive mode pickup.

## 01a06642-7da1-73ad-aac9-1759d9addc96
updated_at: 1788447562
BLOCK 1 - X/Twitter extraction workflow:
- Direct read of https://x.com/0xwhrrari/status/2093685107534000560 fails: method=twitter-blocked, Nitter instances unavailable.
- Workaround that works: curl https://cdn.syndication.twimg.com/tweet-result?id=2093685107534000560&lang=en&token=x returns Tweet JSON (favorite_count, created_at, text, user, entities).
- Example: tweet 2093685107534000560 by rari / 0xwhrrari (id 1675280785157287938, 2026-08-29) text was only t.co link https://t.co/3ANIWs48lJ -> expanded https://x.com/i/article/2093441687989186560 (X Article).
- Pitfall: requesting syndication API with article ID 2093441687989186560 returns X error HTML "Nothing to see here" / poodle page, not article content. Need browser open for X Articles.

BLOCK 2 - ~/.omp dotfiles rebase conflict resolution (macOS vs Windows host):
- Repo ~/.omp branch main had diverged: local wip commit vs origin/main from Windows host. Rebase produced conflicts in 3 files: agent/hooks/pre/safety-guard.ts, agent/config.yml, marketplaces.json.
- Decision: in all three take local/rebased wip side (during rebase = --theirs). Reason: on macOS.
- safety-guard.ts: local extended (17 git-rules) vs remote old (4 rules) -> take local.
- agent/config.yml: local full modelRoles (advisor/smol/slow/plan/vision) vs remote trimmed -> take local.
- marketplaces.json: local macOS paths (contains Users/hose, grep count 4) vs remote Windows paths C:\Users\hose\... -> take local.
- Resolution commands: git checkout --theirs <3 files> && git add <3 files> && GIT_EDITOR=true git rebase --continue; resulted in 34eb038 wip ahead of origin/main by 1, previous e8c48d4, 06a37e9.
- Verification: bun test safety-guard.test.ts passes 48/48 (76 expects) after rebase; git status shows ahead 1 plus untracked autoqa.db and omp-work-guide.pdf (1.8MB pdf + db intentionally left untracked, not committed).

BLOCK 3 - Durable constraints/pitfalls:
- safety-guard pre-hook blocks `git push` from agent bash; user must push manually.
- marketplaces.json contains machine-specific absolute paths; dotfiles synced macOS <-> Windows will conflict on every bidirectional sync. Future fix option: exclude machine paths from repo or split per-host.
- config.yml modelRoles also diverges per sync if trimmed on other host.

## 01a0679f-6427-70ca-8001-40924902e856
updated_at: 1788445088
WORKFLOW: Propose conventional commits via sequence: git_overview (list staged) -> git_file_diff (per-file diffs, max 10 files) -> git_hunk (when diff elided / large) -> split_commit. Do not skip hunk fetch when elision occurs; details needed for accurate feat scope.
CONSTRAINT split_commit: All staged files must be covered with no overlapping files. Even unwanted files must be grouped.
DECISION PATTERN observed: agent/hooks/pre/safety-guard.ts (+64/-3) as feat(agent-hooks) - expanded from git-only to non-git destructive blocks (git stash drop/clear, rm -rf against /, system dirs, home, ./.., chmod -R 777 absolute, curl|wget piped to shell, sudo rm/dd to raw device, DROP DATABASE/SCHEMA, TRUNCATE TABLE, DELETE FROM without WHERE). agent/config.yml as separate chore(agent) - default model opencode-go/glm-5.3-flash -> :high and reordered to end.
PITFALL binaries: autoqa.db + omp-work-guide.pdf (binary, new) likely accidentally staged local artifacts. Strategy: group into single chore commit so it can be dropped/unstaged as one unit, and explicitly recommend `git restore --staged <binaries>` + .gitignore. Do not mix binaries with code/config commits.

## 01a05f59-7df5-77a6-91bd-4a02aa89d354
updated_at: 1788306417
Goal: Make Ponytail active minimal-build policy in OMP and OpenCode, remove Caveman completely from active user config with clean cutover (no aliases, shims, state migration, duplicate local copies).
Tech stack: OMP 18.1.2, OpenCode 1.18.17, Bun-backed omp plugin manager, Node/npm, @dietrichgebert/ponytail@4.9.0 pinned (registry latest).
Architecture: OMP discovers pi.extensions ./pi-extension/index.js + pi.skills ./skills from installed package under ~/.omp/plugins (package.json, bun.lock, omp-plugins.lock.json). OpenCode resolves npm package and loads via opencode.json plugin array; package config hook loads .opencode/command/ and skills/, transform hook reads .ponytail-active and injects PONYTAIL MODE ACTIVE (default full, do not pre-create file).
Plan source: local://replace-caveman-with-ponytail-plan.md authoritative; must read before execution, verify each step.
Install order: Install official runtime before removing old one. OMP: rtk omp plugin install @dietrichgebert/ponytail@4.9.0 in ~/.omp. OpenCode: rtk npm install --save-exact @dietrichgebert/ponytail@4.9.0 in ~/.config/opencode. Verify: omp plugin list --json shows enabled 4.9.0, npm ls --prefix ~/.config/opencode @dietrichgebert/ponytail --depth=0 resolves 4.9.0. Registry fallback: omp plugin link /Users/hose/.pi/agent/git/github.com/DietrichGebert/ponytail (verified 4.9.0 checkout) and absolute plugin entry /Users/hose/.pi/agent/git/github.com/DietrichGebert/ponytail/.opencode/plugins/ponytail.mjs; do not hand-write adapter.
OpenCode cutover: opencode.json plugin = ["opencode-see-image@1.3.2", "@dietrichgebert/ponytail"]; preserve provider/MCP/sync/compaction/tool-output byte-for-byte except formatting.
Removals after load check: plugins/caveman/ (plugin.js, caveman-config.cjs, caveman-parse.cjs), commands/caveman.md, caveman-commit.md, caveman-compress.md, caveman-help.md, caveman-review.md, caveman-stats.md, skills/caveman/, caveman-commit/, caveman-compress/, caveman-help/, caveman-review/, caveman-stats/, .caveman-active (do not rename to .ponytail-active), skills/cavecrew/ + agents/cavecrew-investigator.md, cavecrew-builder.md, cavecrew-reviewer.md (competing compression system; Ponytail injects into subagents). AGENTS.md: remove <!-- caveman-begin --> to <!-- caveman-end --> block only, preserve Absolute Mode/memory/semantic-thinking/CodeGraph.
OMP global: Remove ~/.omp/agent/APPEND_SYSTEM.md after OMP install verified (extension before_agent_start injects rules). Preserve unrelated state: agent/last-changelog-version, autoqa.db, omp-work-guide.pdf. Treat session logs/history DBs/upstream dep docs as immutable evidence, do not rewrite for zero-grep.
Codex handling: ~/.codex/AGENTS.md is symlink -> /Users/hose/ai-config/AGENTS.md; edit resolved source per contingency, replace caveman block with official Ponytail rules, preserve CodeGraph + @RTK.md pointer. Delete 6 copied dirs: skills/caveman-{commit,compress,review}, skills-off/caveman{,-help,-stats}.
Ponytail official surface: ponytail, ponytail-review, ponytail-audit, ponytail-debt, ponytail-gain, ponytail-help + bundled skills. Do not create stubs for caveman-commit/compress/stats (no counterpart).
Verification (5): 1) omp plugin doctor --json all ok + pi-extension tests 23/23 pass. 2) Deterministic OpenCode plugin check (command + skills path + PONYTAIL MODE ACTIVE). Real rtk opencode run /ponytail status may fail if localhost:8000 unreachable (curl 000, log clean no plugin error) - anticipated provider failure, deterministic check stands. 3) OMP end-to-end skill://ponytail -> # Ponytail. 4) Path+text audit zero matches in 14 active locations. 5) git status in .omp shows only plugins/{package.json,bun.lock,omp-plugins.lock.json} modified + APPEND_SYSTEM.md deleted + pre-existing files.

## 01a05f4e-14cb-758b-b0a9-6d34e31025c2
updated_at: 1788306095
Goal: replace caveman with ponytail, delete caveman completely from .omp and other places.

Stack / Contract:
- Replacement is Ponytail 4.9.0, not local reimplementation. Upstream OpenCode plugin source + Pi extension are implementation contract.
- Plugin ID: @dietrichgebert/ponytail. Must be enabled in OMP, registered in opencode.json, provide /ponytail command, skills path, and PONYTAIL MODE ACTIVE system injection.
- Guidance skills used: deprecation-and-migration for clean replacement without dead aliases; writing-plans for self-contained plan.

Scope definition for "completely remove":
- Remove active user-owned integration, commands, skills, state, policy references.
- Explicitly out of scope (preserve): /Users/hose/.omp/agent/sessions, /Users/hose/.omp/logs, /Users/hose/.codex/sessions, historical transcripts/databases, and official Ponytail dependency's own benchmark/compatibility text; also /Users/hose/.pi/agent/git/github.com/DietrichGebert/ponytail as upstream comparison material.
- Old OpenCode policy/artifacts: commands/, skills/, agents/, plugins/, .caveman-active paths.
- Global fallback: /Users/hose/.codex/AGENTS.md, /Users/hose/.codex/skills/, /Users/hose/.codex/skills-off/.
- Intentionally removed with no compat layer: old specialized commands commit, compress, stats; cavecrew (Ponytail already injects build rules into subagents, no ponytailcrew alias).

Workflows / Verification (run from stated dirs, not diff alone):
1. OMP health in /Users/hose/.omp: rtk omp plugin list --json; rtk omp plugin doctor --json; rtk npm test --prefix /Users/hose/.omp/plugins/node_modules/@dietrichgebert/ponytail/pi-extension. Expect enabled ponytail 4.9.0, no error, tests pass.
2. OpenCode behavior in /Users/hose/.config/opencode: Node smoke check opencode.json contains ponytail, plugin.config registers runtime.command ponytail + skills paths, experimental.chat.system.transform injects instructions; then rtk opencode run "/ponytail status". If model endpoint unreachable, keep deterministic check and report connectivity separately.
3. E2E skill discovery from /tmp: rtk omp --no-session --model opencode-go/glm-5.3-flash -p 'Read skill://ponytail and output exactly its first Markdown heading.' Expect '# Ponytail'.
4. Active-reference audit via glob for *caveman* in .omp/agent/APPEND_SYSTEM.md, .omp/plugins, .config/opencode/.caveman-active, commands/caveman*, skills/caveman*, plugins/caveman*, .codex/skills/caveman*, skills-off/caveman* (expect no paths) + grep caveman|Caveman|CAVEMAN over active files only: .omp/plugins/package.json, omp-plugins.lock.json, installed_plugins.json, .config/opencode/AGENTS.md, opencode.json, package.json, package-lock.json, commands, skills, agents, plugins, .codex/AGENTS.md, skills, skills-off (expect no matches).
5. Working-tree safety in /Users/hose/.omp: rtk git status --short --branch. Only planned plugin files changed plus pre-existing agent/last-changelog-version, autoqa.db, omp-work-guide.pdf.

Pitfalls / Contingencies:
- If npm fails, use verified local Ponytail checkout fallback and verify absolute/link-based path before deleting old files.
- If /Users/hose/.codex/AGENTS.md is symlink/generated, edit resolved user-owned source only after confirming exact old block; preserve CodeGraph and RTK sections.
- Outcome in thread: silent abort (__omp.silent_abort__) after planning/reads; no completion confirmed. Future run must re-execute plan and verifications.

## 01a05f48-c2b8-7590-8da9-5d5879dcfaed
updated_at: 1788305161
ENV: home=/Users/hose, harness=omp (opencode-go, model glm-5.3-flash), not Claude Code.
SKILL caveman-stats: source=/Users/hose/.config/opencode/skills/caveman-stats/SKILL.md. Behavior: output injected by hooks/caveman-mode-tracker.js on /caveman-stats with decision=block; model does NOT compute numbers, no AI estimation. Includes Est. rule overhead (default 1250 input tokens/turn, override CAVEMAN_RULE_OVERHEAD_TOKENS) and Est. net; net-negative must be reported plainly per docs/HONEST-NUMBERS.md.
FINDING: lifetime history log ~/.config/caveman/.caveman-history.jsonl not found. Checked: ~/.config/caveman/, ~/.caveman/, ~/.caveman-history*, ~/.cache/caveman*, ~/.claude/hooks/ — all missing (ls exit 2). mdfind -name caveman found only ~/Programming/ponytail_repo/benchmarks/arms/caveman-SKILL.md, caveman.js, benchmarks/results/2026-06-12-caveman-vs-ponytail.md, 2026-06-12-v4-hardening-vs-caveman.md.
CONSTRAINT: No mode-tracker hook fired this session; cannot fabricate savings/sessions/ratio. Reported zero sessions, no data table.
REUSE: For future caveman-stats requests, first check tracker hook presence and history log path; if absent, report no-data honestly, ask for caveman-mode-tracker.js path if installed elsewhere.

## 01a05f40-06c4-71f1-adf2-98aa73930bcb
updated_at: 1788304776
ENVIRONMENT: omp harness at ~/.omp, not Claude Code plugin runtime. caveman-stats mode-tracker hook (hooks/caveman-stats.js / caveman-mode-tracker.js) not installed.
CHECKED PATHS WITH NEGATIVE RESULTS:
- ~/.config/caveman/.caveman-history.jsonl not found
- ~/.config/caveman/, ~/.cache/caveman/, ~/.local/share/caveman/ not found
- ~/.omp/plugins/cache/marketplaces/omc/hooks/ contains no caveman hook
- ~/.omp/plugins/cache/marketplaces/omc/skills/ contains no caveman skills
- superpowers plugin claude-plugins-official___superpowers___6.3.0 v6.3.0 has no caveman integration; hooks dir only hooks-cursor.json, hooks.json, run-hook.cmd, session-start
DECISION: Do not fabricate total saved / sessions / avg ratio. Report unavailable, not zero, per honest-reporting rule.
REQUIREMENT FOR FUTURE: Real caveman numbers need tracker hook firing plus CAVEMAN_RULE_OVERHEAD_TOKENS (default 1250/turn) for net-savings math, or run /caveman-stats in Claude Code where hook is installed.
PITFALL: Caveman response-style rules via AGENTS.md alone provide no token measurement.

## 01a05f3a-c123-7274-93d2-759dcb170ccd
updated_at: 1788304257
BEHAVIOR: Caveman mode active (full default). Persists until session ends or user says stop caveman / normal mode. Pattern [thing][action][reason]. [next step]. Drop articles/filler/pleasantries/hedging. Code/commits/security warnings in normal English.
CONSTRAINT: git push blocked for agents as outward-facing action. Error: git push is blocked for agents: outward-facing action. Run the push yourself after reviewing.
PITFALL RESOLVED: Chained shell containing push (git add/commit/push/status) blocked pre-execution — zero commits landed, verified via rtk git log/status showing old HEAD 61829e5 wip. Fix: run commits without push in chain.
WORKFLOW: Repo at /Users/hose/.omp using wrapper `rtk git ...`. Landed 2 commits: 75557e2 chore: update model config, add caveman system notes (agent/config.yml, models.yml, last-changelog-version, APPEND_SYSTEM.md); 0b457a7 chore: remove ponytail plugin (plugins/bun.lock, omp-plugins.lock.json, package.json). Status: main...origin/main [ahead 2].
DECISION: Left untracked autoqa.db (runtime DB, belongs in .gitignore) and omp-work-guide.pdf (1.8MB binary, unclear if repo material) uncommitted.
NEXT: User runs manually: git push origin main (~5 sec).

## 01a05f35-78a2-76c3-b734-72c951e4f0d1
updated_at: 1788304075
BASELINE INTENT:
- OMP-wide default Caveman response style, not Grug/Ponytail code-minimization. Keep compression + auto-clarity exceptions, drop code-minimization behavior.
- Integration point is native agent/APPEND_SYSTEM.md (appends while retaining OMP default tool/safety/workflow/context/skill/verification blocks).

PATH RESOLUTION:
- From /Users/hose/.omp run `rtk omp config path` and `rtk omp plugin list`. Path from `omp config path` is authoritative for user agent dir, including profile or PI_CODING_AGENT_DIR overrides. Expected /Users/hose/.omp/agent but use reported path for APPEND_SYSTEM.md and checks.
- Before mutation: read active plugin manifest, lock entry, Ponytail package manifest, confirm APPEND_SYSTEM.md absent or read current contents.

UNINSTALL WORKFLOW:
- `rtk omp plugin uninstall @dietrichgebert/ponytail` — must remove only dependency in plugins/package.json, lock entry in plugins/omp-plugins.lock.json, installed package in plugins/node_modules. Preserve superpowers and unrelated plugins.
- If `omp plugin list` already shows Ponytail absent, skip uninstall and verify manifest/lock state.
- NEVER hand-edit package.json / omp-plugins.lock.json unless CLI reports concrete repair failure and files re-read first.

INSTALL WORKFLOW:
- Create <active-agent-dir>/APPEND_SYSTEM.md with exact plain text, no YAML frontmatter, no Ponytail/Grug/Codex/full-skill duplicate:
# Caveman default response style\n\nApply concise, technically complete prose by default in every response.\n\n- Keep technical substance, code blocks, commands, API names, identifiers, numbers, and exact error strings unchanged.\n- Remove filler, pleasantries, repeated conclusions, and unnecessary hedging. Use short sentences or fragments when meaning stays clear.\n- Preserve the user's language. Do not invent abbreviations; technical names stay exact.\n- Write code, comments, documentation, commits, tickets, and third-party messages in normal clear prose; compress chat responses only.\n- Use normal full prose for security warnings, irreversible actions, ambiguous multi-step instructions, and clarification requests.\n- Default intensity is `full`. `stop caveman` or `normal mode` disables this style for the current session; `/caveman lite|full|ultra|wenyan-*` changes intensity only when that command is available.
- Rationale: inspected Caveman distribution has Pi profile but no local OMP plugin package/manifest; APPEND_SYSTEM.md sufficient for always-default behavior.

NEGATIVE CONSTRAINTS (one policy layer):
- Do NOT create ~/.omp/agent/AGENTS.md, ~/.omp/agent/RULES.md (would make `stop caveman` unhonorable), skill directory, custom extension, replacement prompt template. Do NOT edit Codex files, add Caveman as second plugin, copy full essay/SKILL.md.

VERIFICATION:
1. `rtk omp config path` + `rtk omp plugin list` — ponytail absent.
2. Static transition: `rtk python3 -c 'import json; from pathlib import Path; p=Path("plugins"); package=json.loads((p/"package.json").read_text()); lock=json.loads((p/"omp-plugins.lock.json").read_text()); assert "@dietrichgebert/ponytail" not in package.get("dependencies", {}); assert "@dietrichgebert/ponytail" not in lock.get("plugins", {}); assert not (p/"node_modules/@dietrichgebert/ponytail").exists()'` — exit 0, re-read and compare superpowers preserved.
3. Append file assert: check 5 required strings (heading, Keep technical substance..., Use normal full prose for security..., stop caveman, Default intensity is `full`.) and single heading count, no extra blocks.
4. Fresh OMP process required so appended prompt rebuilds. Test: `rtk omp -p --mode text --max-time 2m 'Explain JavaScript closures in Russian in no more than three short sentences...'` — expect Russian, <=3 short sentences, technical fact intact, no preamble. Then security/irreversible test must remain explicit uncompressed. `stop caveman` in session -> normal prose; new session restores default.

PITFALLS / RESIDUE:
- Unscoped `ponytail@1.0.57` in plugins/node_modules is unrelated npm package (Rethinking maintenance of multiple sites, Vladislav Zhabinsky), not plugin state — leave alone, do not delete.
- Empty `plugins/node_modules/@dietrichgebert/` scope dir left by npm uninstall is safe to remove via `rtk rmdir plugins/node_modules/@dietrichgebert`.

## 01a05ece-cdea-742a-a1e2-a8ec065dc4fd
updated_at: 1788303734
USER GOAL:
- Order/price taxi in Baku: from Rostropovicha 5 to Nargile (user wrote in Russian).
- Deliverable expected: prices/fare estimate, not actual booking.

DURABLE WORKFLOW:
- 1) Resolve pickup: Mstislav Rostropovich street 5, Baku (Məstislav Rostropoviç küçəsi).
- 2) Disambiguate destination "Nargile": multiple candidates in Baku (lounges/restaurants). Must ask/confirm which venue or provide estimates for top candidates.
- 3) Fare sources: Bolt and Yandex Go / Yango operate in Baku, prices in AZN (manat). Use web search for current tariff per km + Yandex Maps route with taxi tab for live estimate.
- 4) Answer in Russian (user language).

CONSTRAINTS / PITFALLS:
- Cannot complete real taxi order; only price research.
- Do not guess which Nargile without confirmation; venues differ in distance/price.
- Tariffs are volatile; treat per-km rates as time-stamped, re-verify per run.
- Prefer Yandex Maps / Yango estimator for Baku over generic search snippets.

## 01a05ec1-abb9-71c4-991c-3542035b899b
updated_at: 1788296949
SERVICE: Diet Line | Sağlam Qida (@diet_line.az) Baku - verified (blue check), 12.3k followers, diet + keto, detox waters, sugar/gluten-free. Highlights: client results, reviews. Packages: 10 or 20 day menus + bonus detox days. Order phone +994 99 888 0 1234.

PRICING MATH (durable): 450 AZN / ~22 weekdays / 3 meals = ~20.5 AZN/day, ~6.8 AZN/meal. 550 AZN full month (~30 days x3=90 meals) = ~6.1 AZN/meal. 550 for weekdays only (66 meals) = ~8.3 AZN/meal. Weekend add-on delta +100 AZN for ~24 meals = ~4.2 AZN/meal.

MARKET CONTEXT: Baku competitors (Slim Diet, Smart Smak, Healthy Life on Wolt/Bolt) daily diet programs >20 AZN/day. Cheap business-lunch 5-10 AZN for lunch only. Conclusion: 450 for verified diet-brand = below market, good deal if delivery included. 550 full-month with weekends = better value if weekends needed; 550 weekdays premium/keto still cheap for keto segment.

PITFALL / CHECKLIST: Confirm in DM: exact days covered, delivery included/zone, which program (standard diet vs keto - keto costs more to produce), sample menu. Diet portions calorie-restricted/smaller by design - set expectation.

## 01a05e81-3feb-7666-b9ee-baa3fd286053
updated_at: 1788293412
PLAN_SOURCE: local://omp-wo[REDACTED].md is authoritative; visible/compressed context secondary. Read failure must report exact path+error, never guess. If plan inline compressed/expired/unrecoverable, re-read file and continue until complete.
ARTIFACT: Final `omp-work-guide.pdf` in current workspace. Temp HTML source under /tmp. Do not add unrelated repo files. No dependency addition or project config change.
DECK_CONSTRAINTS: Single self-contained HTML, 16:9 slides, CSS-only visuals, no remote assets. System fonts with Cyrillic support, inline SVG/CSS diagrams for portability. Dark operator-field-guide: near-black navy canvas, cobalt/teal lines, acid-lime success, coral warnings, large numerals, compact code cards, grid/noise texture restrained. Legible when printed: high contrast, min 18px body, short lines, one takeaway per slide, no stock imagery.
SLIDE_ORDER_20: 1 Cover `OMP в работе` + `от первого промпта до автономных экспериментов` + tool/mode constellation. 2 Mental model prompt→session→model→tools→verification→durable result, model reasoning vs tool execution. 3 Start correctly: `omp --cwd`, `--add-dir`, context files/rules, session persistence, prompt formula objective+scope+constraints+acceptance. 4 Prompt patterns weak vs strong, reusable Russian template for bugfix/feature/review/investigation. 5 Model routing `--model`, `--smol`, `--slow`, `--plan`, thinking levels, cycling, provider catalog; fast vs reasoning. 6 Plan mode read-only exploration, `ask`, proposal/review, approve→implement; `Alt+Shift+P`, `plan.enabled`, `plan.defaultOnStartup`, `--plan-yolo` caveat. 7 Goal mode `/goal set <objective>`, show/pause/resume/drop, token budget, auto-continuation, terminal `complete/dropped/budget-limited`, measurable example, warn budget. 8 Vibe mode `/vibe`, director vs persistent workers, `fast`/`good`, spawn/send/wait/kill/list, independent workstreams, director verification. 9 Autoresearch clean git baseline→`autoresearch.sh`→`METRIC name=value`→`init_experiment`→`run_experiment`→`log_experiment keep/discard`; why log every run, rollback, experiment limit off-switch; mark experimental + measurable harness note. 10 Tool map I discovery/reading: `read`, `grep`, `glob`, `lsp` definition/references/diagnostics, `web_search` + when each. 11 Tool map II change/exec: `edit`, `write`, `bash`, `eval`, `debug`; surgical edits, runtime checks, dangerous command control. 12 Tool map III interaction/delegation: `ask`, `task`, `browser`, `checkpoint`, `todo`; browser open→run lifecycle, parent/child boundary. 13 Safety/approvals `always-ask`, `write`, `yolo`; per-tool allow/deny/prompt; shell destructive-pattern overrides; point-of-risk confirmation; safe default recommendation. 14 Agents/parallelism bundled/discovered, `task` batch context, schemas, isolation, parent auth, when to parallelize vs not; three-lane example with contracts. 15 Skills/rules/extensions: discovery/loading, `AGENTS.md`/project rules, extensions/hooks/plugins/MCP, magic keywords `ultrathink`, `orchestrate`, `workflowz` as turn-scoped not modes. 16 Sessions/continuity `--continue`, `--resume`, `--fork`, `--export`, `/share`; what to preserve, when to fork vs mutate. 17 Headless/automation `-p/--print`, `--mode json`, `rpc`, `acp`, stdin+`@file`, `--max-time`; one shell pipeline with machine JSON. 18 Git-centered delivery inspect diff, focused behavioral check, `omp git`/normal workflow, commit only verified; no-claim-without-evidence rule. 19 Three playbooks bugfix/feature/perf 4-6 steps each with mode+verification. 20 Final cheat sheet mode/tool/flag matrix, choose-when tree, compact commands; end `планируй → выполняй → проверяй → сохраняй контекст`.
GROUNDING_DOCS: `omp://cli-reference.md` launch flags/model/headless/subcommands; `omp://approval-mode.md` tiers/overrides; `omp://vibe-mode.md` tiers/lifecycle; `omp://tools/ask.md`; `omp://tools/checkpoint.md`; `omp://ta[REDACTED].md`+`omp://tools/task.md` batch/isolation/parent-auth/plan-restrictions; `omp://tools/browser.md` lifecycle; `omp://magic-keywords.md`; `omp://session-operations-export-share-fork-resume.md`+`omp://session.md`; `omp://providers.md`, `omp://models.md`, skills docs.
RENDER: Chromium/browser PDF with CSS `@page` size `13.333in 7.5in`, zero margins, print backgrounds, one slide per page. Fallback Python PDF stack with Cyrillic font preserving 16:9 if Chromium unavailable.
VERIFY: PDF opens, exactly 20 pages, 16:9 dimensions, extracted text contains title, `Plan mode`, `Goal mode`, `Vibe mode`, `Autoresearch`, `METRIC`, `--mode json`, no empty-text page. Render first/middle/last to images/browser check clipping/contrast/overflow/Cyrillic fallback. Fix+rere render before delivery.
FOOTERS_SAFETY: Concise `OMP docs: cli-reference · approval-mode · vibe-mode · tools/*` footers. No real API keys, destructive commands, irreversible external actions.

## 01a05e31-7bc9-726c-a53f-733432cc0b76
updated_at: 1788291923
Context: /Users/hose/.omp/agent/models.yml contained single line `providers:` which YAML parses as `providers: null`, violating schema requiring object. Warning: `Failed to load config file models, Schema error: providers: must be an object (was null)`.

Decision: Schema correction only; preserve intentionally empty custom-provider config. Replace entire models.yml content with exactly `providers: {}`. Do not restore deleted provider definitions or add API keys, discovery settings, cache records.

Constraints: Do not change /Users/hose/.omp/agent/config.yml (holds model roles and enabled-model patterns). Do not edit /Users/hose/.omp/agent/last-changelog-version or autoqa.db (unrelated working-tree changes). If models.yml already contains `providers: {}`, leave unchanged and run verification only.

Critical files: /Users/hose/.omp/agent/models.yml (root providers null -> {}), /Users/hose/.omp/agent/config.yml (leave unchanged).

Verification (run from /Users/hose/.omp): 1) rtk ruby -e 'require "yaml"; d=YAML.load_file("agent/models.yml"); raise "providers not object" unless d.is_a?(Hash) && d["providers"].is_a?(Hash); raise "providers not empty" unless d["providers"].empty?; puts "models.yml providers object OK"' => expect `models.yml providers object OK`. 2) rtk omp --version => exit 0, no schema error in output. 3) rtk git diff -- agent/models.yml => only providers: to providers: {}.

Contingency: If omp --version reports different schema error after fix, inspect new error before further config change.

Plan source: local://fix-models-providers-plan.md is authoritative; must read before execution, verify each step before next.

## 01a05d5f-77ef-71eb-a09e-d1947c9ad8aa
updated_at: 1788289765
REPO ai-job-search (/Users/hose/Programming/ai-job-search):
- branch master == origin/master at 7eb8ddd
- remotes: origin=https://github.com/hose1021/ai-job-search.git, upstream=https://github.com/MadsLorentzen/ai-job-search.git
- Uncommitted at check: .claude/skills/job-application-assistant/01-candidate-profile.md, 04-job-evaluation.md, 05-cv-templates.md, 07-interview-prep.md, .claude/skills/job-scraper/search-queries.md, CLAUDE.md + untracked cv/fonts/
- Decision: no commit/push performed in main repo without explicit scope; do not auto-commit fonts binaries.

OMP CONFIG (~/.omp/agent/config.yml):
- modelRoles.advisor=openai-codex/gpt-5.6-sol unchanged
- modelRoles.default switched to tokenrouter/z-ai/glm-5.3-free (was glm-5.3-flash per edit)
- Constraint: account catalog has only z-ai/glm-5.3-free (1M context, thinking low/high/max); glm-5.3-flash/glm-5.3 not listed = no access
- Verification: `omp --model tokenrouter/z-ai/glm-5.3-free -p "Reply with exactly: OK"` -> OK, ~36s wall (free-model latency/reasoning)
- Commit: [main 08ff123] chore: switch default model to tokenrouter glm-5.3-free, 1 file changed
- Pending: 2 ahead of origin/main (1110d62 + 08ff123). Push cmd: `git -C ~/.omp push origin main` (not executed in thread).

## 01a05e2d-88a7-768d-8a79-2c5c9c4070ca
updated_at: 1788286696
BLOCK: models-config-schema-constraint
- Config file `models` fails to load with `Schema error: providers: must be an object (was null)`
- `providers` must be an object `{}` at minimum, never null / missing-translated-as-null
- Fix direction: ensure default/empty config initializes `providers: {}` and loader/coercion handles null -> {}

BLOCK: rollout-workflow-used
- Used skills: systematic-debugging for bug-fix planning, writing-plans for implementation plan, git-wo[REDACTED]
- Plan artifact path pattern: `agent/sessions/-.omp/.../local/fix-models-providers-plan.md` (project default `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`)
- Plan scope: OMP models providers config fix

BLOCK: pitfall
- Null providers from empty/uninitialized YAML/JSON can pass through as null and trip strict object schema; validate and add regression test for null/empty providers.

## 01a05d81-edb1-7524-965a-46ffeaf19958
updated_at: 1788286399
Config file: /Users/hose/.omp/agent/config.yml
Final verified state via yaml.safe_load:
- modelRoles: advisor=openai-codex/gpt-5.6-sol, default=opencode-go/glm-5.3-flash, smol=opencode-go/glm-5.3-flash, slow=gpt-5.5:high, plan=gpt-5.5:high, vision=google/gemini-3.7-flash
- modelTags: luna=opencode-go/gpt-5.6-luna, kimi=opencode-go/kimi-k3 (free tag removed)
- cycleOrder: [smol, default, slow] (plan removed from cycle because duplicate of slow)
- enabledModels: [opencode-go/*, openai-codex/*, google/gemini-3.1-flash-lite, google/gemini-3.7-flash] (removed anthropic/claude-opus-4-6* glob and tokenrouter/*)
Decisions:
- Keep plan role for plan-mode Alt+Shift+P but point to gpt-5.5:high after Opus removal
- Menu total 41 models: 33 opencode-go + 6 openai-codex + 2 gemini
Pitfall resolved:
- Edit tool snapshot showed blank line 3 for `default:` but RAW line 3 verified as '  default: opencode-go/glm-5.3-flash' — display artifact, not file corruption. Always verify with re-read / yaml parse.
Workflow:
- After config.yml change, restart omp to apply; verify via Alt+M (menu) and Ctrl+P (cycle).

## 01a05d6c-a7dd-7271-bc6a-60e0418a5a7c
updated_at: 1788273800
FAILURE_BLOCK:
- model: z-ai/glm-5.3-flash
- api: openai-completions
- provider: tokenrouter
- errorStatus: 403
- error param: insufficient_user_quota
- errorMessage: User's credit limit is insufficient, remaining credit limit: $0.000000 (request id: 20260901144319724887004AhjQQ8Rb)
- stopReason: error, output empty, usage all zero

CONSTRAINT:
- Account has $0 remaining credit for this provider/model route; retries on same route will fail identically without top-up or route change.

WORKFLOW_LESSON:
- Treat 403 insufficient_user_quota as non-retryable on same credentials; fail fast, surface quota exhaustion, suggest alternate model/provider or credit top-up.
- Do not count as transient API error.

## 01a05d21-f1de-7016-8654-57de20cbbe2c
updated_at: 1788272930
BLOCK: OMP skill failure reported - universal-critical-thinking skill did not trigger in omp session.
BLOCK: OMP hook lifecycle - extension snapshot taken at session start (~17:38 local). Hooks added mid-session under hooks/pre (e.g. safety-guard.ts) are NOT loaded in current session.
DECISION: Verify hook behavior via fresh isolated session: omp -p in /tmp/hook-test correctly blocked push and surfaced exact reason text verbatim -> proves hook loads for new sessions.
WORKFLOW: push attempts in old session executed (git: Everything up-to-date) because pre-hook snapshot predated hook file. No publish occurred, repo stayed in sync - no risk taken.
PITFALL: Testing a newly added omp pre-push guard by retrying push in SAME session will always miss the block. Must start new omp session to see block live.
CONSTRAINT: Caffeine guidance used: peak 30-60min, half-life 5-6h, cutoff ~6h before sleep; 17:21 allows coffee only if sleep after 23:30 else decaf/tea, one cup not on empty stomach.

## 01a0531b-d78b-745d-9f8f-ad342d768e7c
updated_at: 1788100889
DECISION: Удаление Serena выполнено как удаление регистрации MCP-сервера, а не удаление данных.
WORKFLOW: Источник регистрации — ~/.claude.json -> mcpServers.serena (command был uvx). Удалено через python json pop + rewrite. Проверено: per-project регистраций serena нет, в plugins/installed_plugins.json serena не числится.
CONSTRAINT: Инструменты xd://mcp__serena_* остаются смонтированными в текущей сессии (подключены при старте) — исчезнут только при следующем запуске omp, выгрузить mid-session нельзя.
PITFALL: Каталоги данных .serena/ (project.yml, project.local.yml, memories/, cache/) в ~/.omp и других проектах не тронуты — инертны без сервера, удаление только по явному запросу пользователя.

## 01a05319-2e78-7040-8a8f-5c6308d7f561
updated_at: 1788100723
REMOVED peon-ping per user request 'remove peon'.
Components removed:
- Claude Code hooks in ~/.claude/settings.json: SessionStart, UserPromptSubmit, Stop, SubagentStart, PostToolUseFailure, PermissionRequest, SessionEnd, Notification, PreCompact -> stripped to 0 peon refs
- Dir ~/.claude/hooks/peon-ping/ deleted
- Skills symlinks in ~/.claude/skills/: peon-ping-toggle, peon-ping-config, peon-ping-use, peon-ping-log deleted (verified only resume-ats-optimizer remains)
- omp extension ~/.omp/agent/extensions/peon-ping/ deleted
- Sound packs ~/.openpeon/ deleted
- Homebrew formula peonping/tap/peon-ping 2.37.0 uninstalled; tap peonping/tap untapped
Verified clean: grep -ril peon ~/.claude = no output; no peon in PATH, ~/.zshrc/~/.bashrc/fish, Cursor/Copilot/Grok/Codex configs.
Pitfalls / decisions:
- Vendor uninstall.sh aborts on Codex step because scripts/codex-config.py never shipped. Hooks removal had already succeeded before abort, so finished rest manually. Do not re-run blindly.
- ~/.codex/config.toml `notify` entry is Codex's own computer-use client, NOT peon -> leave alone.
- brew unbound config warning unrelated to peon -> left alone.
- Running omp session extension instance may persist in memory but no-ops since peon.sh gone; next session clean.

## 01a05312-6ef5-70ae-95ad-2facdcb2b52e
updated_at: 1788100542
peon-ping verification on macOS (cwd /Users/hose/.omp):
- Binaries: `command -v peon-ping` not found; ~/.cargo/bin contains `peon` CLI and `peon-ping-setup`. Manage via `peon` CLI (`peon status`).
- Pitfall: `peon-ping-setup` does not recognize omp (Oh My Pi) as separate env; OpenCode plugin at ~/.config/opencode/plugins/peon-ping.ts is NOT loaded by omp.
- Decision: use official adapter shipped by peon-ping (`libexec/adapters/omp.sh`; `peon.sh` knows `omp` as source).
- Workflow: installed to user extension auto-discovery root `~/.omp/agent/extensions/peon-ping/` (peon-ping.ts + package.json manifest) per extension-loading.md. Full path: /Users/hose/.omp/agent/extensions/peon-ping/.
- Event mapping: session_start->SessionStart, turn_start->UserPromptSubmit, turn_end->Stop, tool_result isError->PostToolUseFailure, auto_compaction_start->PreCompact, session_shutdown->SessionEnd. Features: packs, rotation, notifications, trainer, spam detect.
- Constraint: current session won't pick up extension; MUST restart omp. Verify after restart with `peon status` + new session should play start sound.

## 01a052ea-ba30-7152-a448-74821efa65f5
updated_at: 1788099998
CONTEXT: User ran `brew install PeonPing/tap/peon-ping` (formula 2.37.0, dep python@3.14 bottle) on macOS 26.6.2 Build 25G83.
FAILURE: Homebrew errored `Your Command Line Tools (CLT) does not support macOS 26. It is either outdated or was modified.` with advice to update CLT or `sudo rm -rf /Library/Developer/CommandLineTools` + `sudo xcode-select --install` / download Xcode 26.3 CLT.
DIAGNOSIS WORKFLOW: `xcode-select -p` + `pkgutil --pkg-info=com.apple.pkg.CLTools_Executables` + `sw_vers` + `brew config | grep -i clt`. Observed CLT: 26.3 vs macOS 26.6.2 = version skew triggers Homebrew CLT check. Missing pkgutil receipt suggests modified/incomplete CLT. Later `/Library/Developer/CommandLineTools` deleted with no reinstall running.
CONSTRAINT: `sudo xcode-select --install` cannot be automated by agent - requires user sudo password + macOS GUI confirmation dialog + ~1-2GB Apple download. Check with `sudo -n true` - if `SUDO_NEEDS_PASSWORD`, hand off to user.
DECISION: Never run destructive `sudo rm -rf /Library/Developer/CommandLineTools` unprompted. Instruct user to run `sudo xcode-select --install` in own terminal, click Install, verify with `xcode-select -p`, then retry `brew install PeonPing/tap/peon-ping`.

## 01a052be-9234-7156-a6b3-3d2272b39e21
updated_at: 1788096431
BLOCK: model_availability
- provider=nvidia model=z-ai/glm-5.2 -> 410 Gone: "The model 'z-ai/glm-5.2' has reached its end of life on 2026-08-21T09:00:00Z and is no longer available." Do not select this model for future runs.
- provider=nvidia model=moonshotai/kimi-k3 -> observed 429 Too Many Requests and user-interrupted attempts; unreliable in this window.
- provider=opencode-go model=deepseek-v4-flash via openai-responses API succeeded as fallback and answered user capability question in Russian.
DECISION: Prefer working fallback (opencode-go/deepseek-v4-flash or other available model) over retired z-ai/glm-5.2; avoid retrying EOL model.

## 01a04ff8-df48-74d1-8581-24e3d42cdf06
updated_at: 1788048308
Repo: /Users/hose/.omp -> origin git@github.com:hose1021/omp-dotfiles.git, branch main tracking origin/main.
Workflow: use `rtk` prefix for shell (e.g. `rtk git status`, `rtk git log --oneline -3`, `rtk git diff`, `rtk git remote -v`). For raw git needing env control use `rtk proxy git <args>`. Skills referenced: caveman-commit for message, git-wo[REDACTED] for flow.
Pre-push check: `rtk git status` + `rtk git log origin/main..main`. If behind, `rtk git pull --rebase` before push; then `rtk git push -u origin main`.
Conflict precedent (2026-08-30): remote 93cd6e2 diverged with local 21e2946. Files agent/config.yml and agent/last-changelog-version conflicted. Resolution: agent/config.yml -> drop Windows `shellPath: C:\Program Files\Git\bin\bash.exe`, keep macOS form (modelRoles with advisor openai-codex/gpt-5.6-sol + default opencode-go/glm-5.3-flash:high, symbolPreset unicode, theme dark titanium, setupVersion 2, composer shape box). last-changelog-version -> keep newer 18.0.11. Resolve via write files, `rtk git add <files>`, `GIT_EDITOR=true rtk proxy git rebase --continue`, then push. Result commit 45e65d1, 9 files, 102 insertions.
Pitfall: `agent/config.yml.lock` was empty transient runtime file - do NOT commit. Other untracked state files ARE committed in this dotfiles repo: agent/models.yml, marketplaces.json, plugins/installed_plugins.json.
Marketplaces.json contains absolute catalogPath under /Users/hose/.omp/plugins/cache/marketplaces/ - expected in this personal dotfiles setup.

## 01a03e78-6dd5-7000-8369-61806fee6055
updated_at: 1787754839
WORKDIR: /Users/hose/.omp is now a git repo (git init -b main)
REMOTE: origin = git@github.com:hose1021/omp-dotfiles.git, branch main, 2 commits at setup (chore: initial dotfiles, feat: add skills library)
DECISION: User command "git init удали git pull" interpreted as init + delete colliding files + pull; confirmed by successful pull
PITFALL_RESOLVED: git pull refused due to 5 local untracked files overwriting repo-tracked files; deleted to allow checkout: agent/config.yml, agent/last-changelog-version, plugins/bun.lock, plugins/omp-plugins.lock.json, plugins/package.json
PENDING: 3 harness runtime files left untracked intentionally: agent/config.yml.lock, marketplaces.json, plugins/installed_plugins.json — candidate for .gitignore, user was asked but not confirmed
CONSTRAINT: ~/.omp contains live omp harness state (agent/, cache/, logs/, plugins/, run/); future git operations must avoid deleting runtime state blindly
