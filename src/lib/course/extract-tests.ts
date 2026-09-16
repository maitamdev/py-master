import type { ExerciseTest } from '@/types';

/**
 * Parses `<sample-output>` blocks from exercise description text
 * and extracts test cases with inputs (from **bold** markers) and expected outputs.
 *
 * Pattern:
 *   <sample-output>
 *   What is your name? **Paul**
 *   Paul
 *   Paul
 *   </sample-output>
 *
 * Produces:
 *   { inputs: ["Paul"], expected_output: "What is your name? Paul\nPaul\nPaul" }
 */
export function extractTestsFromDescription(description: string): ExerciseTest[] {
  if (!description) return [];

  const tests: ExerciseTest[] = [];

  // Match all <sample-output>...</sample-output> blocks
  const sampleRegex = /<sample-output>\s*\n?([\s\S]*?)\s*<\/sample-output>/gi;
  let match: RegExpExecArray | null;
  let testIndex = 0;

  while ((match = sampleRegex.exec(description)) !== null) {
    const rawBlock = match[1];
    if (!rawBlock.trim()) continue;

    const inputs: string[] = [];
    const outputLines: string[] = [];

    // Process each line in the sample-output block
    const lines = rawBlock.split('\n');
    for (const line of lines) {
      // Skip completely empty lines at start/end (but preserve mid-content empty lines)
      // Extract bold **input** markers from the line
      const inputRegex = /\*\*([^*]*)\*\*/g;
      let lineInputMatch: RegExpExecArray | null;
      let processedLine = line;

      while ((lineInputMatch = inputRegex.exec(line)) !== null) {
        inputs.push(lineInputMatch[1]);
      }

      // Strip the bold markers from the line to get expected output
      processedLine = processedLine.replace(/\*\*([^*]*)\*\*/g, '$1');

      outputLines.push(processedLine);
    }

    // Trim leading/trailing empty lines from the output block
    const trimmedLines = [...outputLines];
    while (trimmedLines.length > 0 && trimmedLines[0].trim() === '') {
      trimmedLines.shift();
    }
    while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1].trim() === '') {
      trimmedLines.pop();
    }

    const expectedOutput = trimmedLines.join('\n');

    if (expectedOutput) {
      testIndex++;
      tests.push({
        id: `auto-test-${testIndex}`,
        name: inputs.length > 0
          ? `Test ${testIndex} (đầu vào: ${inputs.join(', ')})`
          : `Test ${testIndex}`,
        input: inputs.length > 0 ? inputs.join('\n') : undefined,
        expected_output: expectedOutput,
        hidden: false,
      });
    }
  }

  return tests;
}
