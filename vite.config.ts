import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import { resolve, join } from "node:path";
import { readdirSync, statSync } from "node:fs";

// noinspection JSUnusedGlobalSymbols
/**
 * See https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/framework"],
      exclude: ["src/**/*.test.*", "src/framework/test/**/*"],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/framework"),
    },
  },
  publicDir: false,
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/framework/index.ts"),
      name: "ExtendMe!",
      // the proper extensions will be added
      fileName: "extend-me",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into the library
      external: [
        ...listExcludedFiles(join(__dirname, "src")),
        "ajv",
        "react",
        "react-dom",
        "zustand",
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          ajv: "Ajv",
          react: "React",
          "react-dom": "ReactDom",
          zustand: "Zustand",
        },
      },
    },
  },
  test: {
    coverage: {
      exclude: ["src/demo", "src/framework/test/extensions/**"],
    },
  },
});

function listExcludedFiles(dirPath: string): string[] {
  const files: string[] = [];
  const handleFile = (file: string) => files.push(file);
  listAllFiles(dirPath, "", handleFile);

  function isTestFile(path: string) {
    return (
      path.startsWith("demo/") ||
      path.includes(".test.") ||
      path.startsWith("test/")
    );
  }

  const excludedFiles = files
    .filter(isTestFile)
    .map((file) => join(dirPath, file));

  console.log(`Excluding ${excludedFiles.length} files.`);
  console.log("Excluded files:", excludedFiles);
  return excludedFiles;
}

function listAllFiles(
  rootPath: string,
  relPath: string,
  onFile: (file: string) => void
) {
  const absPath = relPath !== "" ? `${rootPath}/${relPath}` : rootPath;
  readdirSync(absPath).forEach((name) => {
    const absEntry = `${absPath}/${name}`;
    const relEntry = relPath !== "" ? `${relPath}/${name}` : name;
    if (statSync(absEntry).isDirectory()) {
      listAllFiles(rootPath, relEntry, onFile);
    } else {
      onFile(relEntry);
    }
  });
}
