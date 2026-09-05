# OMP config & model management

## Files (~/.omp/agent/)
- config.yml: modelRoles, modelTags, cycleOrder, enabledModels. Do NOT hold provider definitions.
- models.yml: must contain `providers: {}` at minimum — a bare `providers:` parses as null and fails schema ("providers: must be an object (was null)"). Fix = replace whole file with `providers: {}`; never restore deleted providers or keys.

## Verified state
- modelRoles: advisor=openai-codex/gpt-5.6-sol, default/smol=opencode-go/glm-5.3-flash:high, slow=gpt-5.5:high, plan=gpt-5.5:high, vision=google/gemini-3.7-flash.
- cycleOrder [smol, default, slow] (plan removed as duplicate). Menu ~41 models.

## Pitfalls
- Restart omp after config edits; verify Alt+M menu / Ctrl+P cycle or `omp --version` for schema errors.
- Edit-tool snapshots can show blank lines that don't exist — always re-read / YAML-parse before trusting.
- Non-retryable errors: tokenrouter 403 insufficient_user_quota ($0 credit); nvidia z-ai/glm-5.2 → 410 Gone (EOL). Prefer fallback opencode-go/deepseek-v4-flash. tokenrouter only has z-ai/glm-5.3-free (~36s, 1M ctx).

## Verification snippet
`rtk ruby -e 'require "yaml"; d=YAML.load_file("agent/models.yml"); raise unless d["providers"].is_a?(Hash)'`
`rtk omp --version` (no schema error)
`rtk omp --model <model> -p "Reply with exactly: OK"`
