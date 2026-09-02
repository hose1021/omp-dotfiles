// Deterministic safety guardrail for agent git commands (omp native pre-hook).
// Runs before every bash tool call; blocks destructive git commands so the
// model cannot silently push, reset, clean, or force-delete branches.
// Contract: HookFactory = (pi: HookAPI) => void; block = { block: true, reason }.
const BLOCKED: Array<{ re: RegExp; reason: string }> = [
	{
		re: /\bgit\s+push\b/,
		reason:
			"git push is blocked for agents: outward-facing action. Run the push yourself after reviewing.",
	},
	{
		re: /\bgit\s+reset\s+--hard\b/,
		reason: "git reset --hard is blocked for agents: destroys working-tree changes. Run it yourself if intended.",
	},
	{
		re: /\bgit\s+clean\s+-[a-zA-Z]*[fx][a-zA-Z]*/,
		reason: "git clean -f/-x is blocked for agents: deletes untracked files. Run it yourself if intended.",
	},
	{
		re: /\bgit\s+branch\s+-D\b/,
		reason: "git branch -D is blocked for agents: force-deletes a branch. Run it yourself if intended.",
	},
];

export default function (pi: { on: (event: string, handler: (e: unknown) => unknown) => void }): void {
	pi.on("tool_call", (event: unknown) => {
		const call = event as { toolName?: string; input?: { command?: unknown } };
		if (call?.toolName !== "bash") return;
		const command = typeof call.input?.command === "string" ? call.input.command : "";
		for (const { re, reason } of BLOCKED) {
			if (re.test(command)) {
				return { block: true, reason };
			}
		}
	});
}
