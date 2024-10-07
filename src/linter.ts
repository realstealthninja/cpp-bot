export interface DocumentationError {
  line: number;
  what: string;
}

export function CheckDocumentation(file: string[]): DocumentationError[] {
  var errors: DocumentationError[] = [];
  var line_count: number = 0;

  var previous_line: string = "";
  var in_comment: boolean = false;

  for (const line of file) {
    if (line.startsWith("/*")) {
      in_comment = true;
    }

    // rudimentary test for header comment
    if (line_count == 0 && !line.startsWith("/*")) {
      errors.push({
        line: 0,
        what: `File should begin with a [comment header](https://github.com/TheAlgorithms/C-Plus-Plus/blob/master/CONTRIBUTING.md#typical-structure-of-a-program)\n\
                \`\`\`cpp
                /**\n
                 * @file\n
                 * @brief Add one-line description here. Should contain a Wikipedia\n
                 * link or another source explaining the algorithm/implementation.\n
                 * @details\n
                 * This is a multi-line\n
                 * description containing links, references,\n
                 * math equations, etc.\n
                 * @author [Name](https://github.com/handle)\n
                 * @see related_file.cpp, another_file.cpp\n
                 */\n
                \`\`\``,
      });
    }

    // include documenation check
    if (line.startsWith("#include") && line.indexOf("///") == -1) {
      errors.push({
        line: line_count,
        what: `All includes must be documented with what functions of the header this file uses.\n
               \`\`\`cpp\n
               #include <cassert>   /// for assert\n
               #include <cstdint>   /// for std::uint32_t\n
               \`\`\`\n
               `,
      });
    }

    // namespace documentation check
    if (line.startsWith("namespace") && !previous_line.endsWith("*/")) {
      errors.push({
        line: line_count,
        what: `Namespaces must be documented\n
                \`\`\`cpp\n
                /**\n
                 * @namespace\n
                 * @brief <namespace description>\n
                 */\n
                 namespace name {\n
                \`\`\``,
      });
    }

    if (line.endsWith("*/")) {
      in_comment = false;
    }
    line_count++;
  }
  return errors;
}
