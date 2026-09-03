// Deterministic safety guardrail for agent commands (omp native pre-hook).
// Runs before every bash tool call; blocks destructive commands so the
// model cannot silently push, wipe, overwrite, or pipe remote code into a shell.
// Contract: HookFactory = (pi: HookAPI) => void; block = { block: true, reason }.
const BLOCKED: Array<{ re: RegExp; reason: string }> = [
	// --- git: outward-facing / destructive ---
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
	{
		re: /\bgit\s+stash\s+(drop|clear)\b/,
		reason: "git stash drop/clear is blocked for agents: destroys stashed work with no recovery. Run it yourself if intended.",
	},
	// --- filesystem wipes: recursive rm against root, system dirs, home, or parents ---
	// ponytail: cwd is unknown inside the hook, so absolute paths under the cwd are
	// also blocked; escape hatch is running the command yourself. Upgrade path:
	// thread the tool-call cwd into the matcher and whitelist targets under it.
	{
		re: /\brm\s+(?:-[a-zA-Z]+\s+)*["']?\/(?:["'\s*]|$)/,
		reason: "rm against filesystem root is blocked for agents. Run it yourself if truly intended.",
	},
	{
		re: /\brm\s+(?:-{1,2}[\w-]*[rR][\w-]*\s+)+["']?\/(?:["'\s*]|$)/,
		reason: "rm against filesystem root is blocked for agents. Run it yourself if truly intended.",
	},
	{
		re: /\brm\s+(?:-{1,2}[\w-]*[rR][\w-]*\s+)+["']?\/(?:etc|usr|bin|sbin|boot|System|Library|var|Users|home|opt|private)\b/,
		reason: "rm against a system directory is blocked for agents. Run it yourself if truly intended.",
	},
	{
		re: /\brm\s+(?:-{1,2}[\w-]*[rR][\w-]*\s+)+["']?(?:~\/?|\$HOME\/?)(?:["'\s]|$)/,
		reason: "rm against your home directory is blocked for agents. Run it yourself if truly intended.",
	},
	{
		// '..' is always dangerous as a recursive-rm target; a bare '.' is dangerous
		// unless path-qualified ('./build' is fine, '.'/'../' is not).
		re: /\brm\s+(?:-{1,2}[\w-]*[rR][\w-]*\s+)+["']?(?:\.\.(?:\/|["'\s]|$)|\.(?:["'\s]|$))/,
		reason: "recursive rm against '.'/'..' is blocked for agents: deletes the current tree or its parent. Run it yourself if truly intended.",
	},
	{
		re: /\bchmod\s+-R\s+777\s+\//,
		reason: "chmod -R 777 on an absolute path is blocked for agents. Run it yourself if truly intended.",
	},
	{
		re: /\b(?:curl|wget)\b[^|;&]*\|\s*(?:sudo\s+)?(?:ba|z|da|k|fi)?sh\b/,
		reason: "Piping curl/wget into a shell is blocked for agents: unreviewed remote code execution. Download, inspect, then run yourself.",
	},
	// --- privilege escalation with destructive intent ---
	{
		re: /\bsudo\s+rm\b/,
		reason: "sudo rm is blocked for agents. Run it yourself if truly intended.",
	},
	{
		re: /\bsudo\s+dd\b[^;|&]*\bof=\/dev\//,
		reason: "sudo dd to a raw device is blocked for agents: can wipe disks. Run it yourself if truly intended.",
	},
	// --- databases: mass destructive statements ---
	// ponytail: DELETE-without-WHERE is a text heuristic (catches the common
	// `DELETE FROM t;` / `delete from t"` forms), not a SQL parser — prepared
	// statements and multi-line SQL may slip through. Upgrade path: parse with
	// the actual client driver if this ever becomes a real gap.
	{
		re: /\b(?:DROP\s+(?:DATABASE|SCHEMA)|TRUNCATE\s+TABLE)\b/i,
		reason: "DROP DATABASE/SCHEMA and TRUNCATE TABLE are blocked for agents. Run it yourself if truly intended.",
	},
	{
		re: /\bDELETE\s+FROM\s+("[^"]*"|'[^']*'|`[^`]*`|[\w."']+)\s*;/i,
		reason: "DELETE FROM without a WHERE clause is blocked for agents: deletes every row. Run it yourself if truly intended.",
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
