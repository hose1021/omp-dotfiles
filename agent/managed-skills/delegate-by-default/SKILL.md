---
name: delegate-by-default
description: Fan out with task subagents by default instead of working solo
---

# Delegate by Default

The user prefers subagent dispatch over solo execution, even when the speedup is marginal.

- Fan out with `task` subagents by default: scouts for exploration, parallel workers for independent slices.
- Own decomposition, cross-slice contracts, and integration; cap concurrency at 32.
- Shared files get one integration owner; siblings coordinate through `hub` before touching them.
- Skip validation (lint/typecheck/tests) inside workers; run once at integration.
- Solo execution only for trivially small work (single-file tweak, one lookup) where dispatch costs more than doing it.
