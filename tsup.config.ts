import { defineConfig } from "tsup";

export default defineConfig({
	loader: { ".proto": "text" },
	entry: ["src/index.ts"],
	format: ["cjs", "esm"], // Build for commonJS and ESmodules
	dts: true, // Generate declaration file (.d.ts)
	splitting: false,
	sourcemap: true,
	clean: true
});
