/**
 * rtk extension — auto-rewrites bash tool calls through rtk (https://github.com/rtk-ai/rtk)
 * to compress command output before it reaches the LLM.
 *
 * Uses `rtk rewrite <cmd>` as the single source of truth for mappings/permissions:
 *   exit 0 + stdout -> rewrite   exit 1 -> no equivalent, pass through
 *   exit 2 -> deny rule, pass through (omp's own approval gate still applies)
 *   exit 3 -> ask rule, rewrite (omp approval gate still sees the rewritten command)
 * Any other exit / spawn failure -> pass through unchanged.
 */
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export default function rtkExtension(pi: ExtensionAPI) {
	pi.setLabel("rtk (bash output compression)");

	pi.on("tool_call", async (event) => {
		if (event.toolName !== "bash") return;
		const command = event.input.command;
		if (typeof command !== "string" || !command.trim()) return;
		// Heredocs never rewrite (same guard as rtk's own hooks), already-wrapped
		// commands don't need a subprocess round-trip.
		if (command.includes("<<") || /^\s*rtk(\s|$)/.test(command)) return;

		let proc;
		try {
			proc = Bun.spawnSync(["rtk", "rewrite", command], {
				stdout: "pipe",
				stderr: "pipe",
			});
		} catch {
			return; // rtk missing/broken -> transparent passthrough
		}
		const code = proc.exitCode;
		if (code !== 0 && code !== 3) return;
		const rewritten = proc.stdout.toString().trim();
		if (!rewritten || rewritten === command) return;
		return { input: { ...event.input, command: rewritten } };
	});
}
