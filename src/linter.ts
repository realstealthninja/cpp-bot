import Init, { format } from "@wasm-fmt/clang-format";

/**
 * @brief lints a given file using clang format
 * @param file the file to be formated
 * @returns the formatted output
 */
async function lintFile(file: string[]): Promise<string[]> {
    await Init();

    return format(file.join("\n"), "main.cpp", "Google").split("\n");
    
}