import { MISSING_HEADER } from './strings.js'

export interface DocumentationError {
  line: number;
  what: string;
}

export function CheckDocumentation(file: string[]): DocumentationError[] {
  var errors: DocumentationError[] = [];
  var line_count: number = 0;

  var previous_line: string = "";
  // var in_comment: boolean = false;

  for (const line of file) {
    
    // if (line.startsWith("/*")) {
    //   in_comment = true;
    // }

    // rudimentary test for header comment
    if (line_count == 0 && !line.startsWith("/*")) {
      errors.push({
        line: 0,
        what: MISSING_HEADER,
      });
    }
    console.log(line);
    // include documenation check
    if (line.startsWith("#include") && line.indexOf("//") == -1) {
      errors.push({
        line: line_count,
        what: `All includes must be documented with what functions of the header this file uses.\n
               \`\`\`cpp
               #include <cassert>   /// for assert
               #include <cstdint>   /// for std::uint32_t
               \`\`\`\n
               `,
      });
    }

    // namespace documentation check
    if (line.startsWith("namespace") && !previous_line.endsWith("*/")) {
      errors.push({
        line: line_count,
        what: `Namespaces must be documented
                \`\`\`cpp
                /**
                 * @namespace
                 * @brief <namespace description>
                 */
                 namespace name {
                \`\`\``,
      });
    }

    // if (line.endsWith("*/")) {
    //   in_comment = false;
    // }
    previous_line = line;
    line_count++;
  }
  return errors;
}
