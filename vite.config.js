import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import electron from "vite-plugin-electron";

export default defineConfig(({ command }) => ({
    root: "src/renderer",
    plugins: [
        react(),
        electron({
            main: {
                entry: "src/main/main.js",
            },
            preload: {
                input: "src/main/preload.js",
            },
        }),
    ],
    build: {
        outDir: resolve(__dirname, "dist/renderer"),
        emptyOutDir: true,
    },
    publicDir: command === "serve"
        ? resolve(__dirname, "dev_storage") // Use in dev
        : false,                            // Exclude in build
}));
