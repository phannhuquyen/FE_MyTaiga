# Connect Figma to Antigravity

1. In Antigravity, open Settings.
2. Open Customizations / Installed MCP Servers.
3. Choose Add MCP and search for Figma. Install/connect the Figma server if it is available in the MCP store.
4. Complete the Figma authentication/authorization flow if requested. Being signed in to Google in Antigravity does not, by itself, prove that Figma access is connected.
5. Open the correct Figma file. In Dev Mode, select a specific frame or component and copy its URL. Prefer a frame-level link rather than only a file homepage when implementing one screen.
6. Ask the agent to verify it can retrieve this exact frame, its layers, components, variables and relevant assets. Do not begin coding until it reports whether access succeeded.
7. If the MCP server cannot see the file, check Figma sharing/access permissions. As a fallback, provide screenshots for each relevant state and export/share the variable list and assets; mark those sources as manual rather than MCP-verified.

The Figma MCP server supplies structured design context; it is not a one-click finished-code generator. The agent still needs project rules, screen scope, variable mapping, implementation and visual QA.
