# OMP conventional commit workflow (with rtk + safety constraints)

## Rules
- Prefix all shell with `rtk` (rtk git status). Raw git needing env control: `rtk proxy git <args>`.
- `git push` is blocked by safety-guard for agents — land commits, then tell the user to push manually.
- Hooks/pre-guard only load in fresh sessions; test hook behavior via `omp -p` in a temp dir.

## Commit proposal pipeline
1. `rtk git status` / git_overview(staged=true) — list staged files.
2. git_file_diff for text files; git_hunk whenever diff is elided/large (never skip).
3. analyze_files if deeper per-file summary needed.
4. split_commit: every staged file covered exactly once; unwanted artifacts grouped into a single chore commit + recommend `git restore --staged <binaries>` and .gitignore entry.

## Conventional commit rules
- Types: feat/fix/refactor/test/docs/chore. Scope by component (e.g. feat(agent-hooks), chore(agent)).
- Past-tense summary ≤72 chars explaining WHY not WHAT. Atomic commits (~100 lines), separate concerns, rationale per commit for bisect/revert.
- docs type requires text source changes; a lone binary PDF → chore(docs).

## Rebase/divergence (macOS ↔ Windows dotfiles)
- On macOS, prefer local/rebased side (--theirs during rebase) for: agent/hooks/pre/safety-guard.ts, agent/config.yml, marketplaces.json (machine-specific absolute paths).
- Resolve: git checkout --theirs <files> && git add <files> && GIT_EDITOR=true git rebase --continue.
- Pre-push: check status + origin/main..main; pull --rebase if behind.
- Never commit agent/config.yml.lock (transient). Historically untracked: autoqa.db, omp-work-guide.pdf, agent/last-changelog-version bumps.
