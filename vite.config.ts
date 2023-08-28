import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import {resolve, join} from 'node:path'
import {readdirSync, statSync} from 'node:fs'


// noinspection JSUnusedGlobalSymbols
/**
 * See https://vitejs.dev/config/
 */
export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ["src/framework"],
        })
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src/framework"),
        },
    },
    publicDir: false,
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'src/framework/index.ts'),
            name: 'ExtendMe!',
            // the proper extensions will be added
            fileName: 'extend-me',
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into the library
            external: [
                ...listExcludedFiles(join(__dirname, "src"),
                    "framework",
                    "framework/test",
                ),
                "ajv",
                "react",
                "react-dom",
                "zustand",
            ],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    "ajv": 'Ajv',
                    "react": 'React',
                    "react-dom": 'ReactDom',
                    "zustand": 'Zustand',
                },
            },
        },
    },
})


function listExcludedFiles(dirPath: string,
                           includes?: string,
                           excludes?: string): string[] {
    const files: string[] = [];
    const handleFile = (file: string) => files.push(file);
    listExcludedFilesRec(dirPath, "", handleFile);

    function match(path: string, pattern?: string) {
        return pattern === path
            || path.startsWith(pattern + "/");
    }

    const excludedFiles = files.filter(file => {
        if (excludes && match(file, excludes)) {
            return true;
        }
        return !includes || !match(file, includes);

    }).map(file => join(dirPath, file));
    console.log(`Excluding ${excludedFiles.length} files.`);
    // console.log("Excluded files:", excludedFiles)
    return excludedFiles;
}

function listExcludedFilesRec(rootPath: string,
                              relPath: string,
                              onFile: (file: string) => void) {
    const absPath = relPath !== "" ? `${rootPath}/${relPath}` : rootPath;
    readdirSync(absPath).forEach(name => {
        const absEntry = `${absPath}/${name}`;
        const relEntry = relPath !== "" ? `${relPath}/${name}` : name;
        if (statSync(absEntry).isDirectory()) {
            listExcludedFilesRec(
                rootPath,
                relEntry,
                onFile
            );
        } else {
            onFile(relEntry);
        }
    });
}
