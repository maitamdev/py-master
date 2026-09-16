import type { ExerciseTest } from '@/types';

/**
 * Result for a single test case check.
 */
export interface TestResult {
  testId: string;
  testName: string;
  passed: boolean;
  expected: string;
  actual: string;
  inputs?: string;
}

/**
 * Overall grading result for an exercise submission.
 */
export interface GradingResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  testResults: TestResult[];
  summary: string;
}

/**
 * Normalize output string for comparison:
 * - Trim leading/trailing whitespace
 * - Normalize line endings to \n
 * - Remove trailing whitespace on each line
 * - Remove trailing empty lines
 */
function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Grades exercise output against a single test case.
 */
function gradeTest(actualOutput: string, test: ExerciseTest): TestResult {
  const expected = normalizeOutput(test.expected_output || '');
  const actual = normalizeOutput(actualOutput);

  return {
    testId: test.id,
    testName: test.name,
    passed: actual === expected,
    expected,
    actual,
    inputs: test.input,
  };
}

/**
 * Grade an exercise by running actual output against all test cases.
 * For exercises with inputs, the caller must run the code once per test case
 * and provide outputs as an array matching the tests array.
 *
 * @param outputs - Array of actual outputs, one per test case
 * @param tests - Array of test cases
 */
export function gradeExercise(
  outputs: string[],
  tests: ExerciseTest[]
): GradingResult {
  if (tests.length === 0) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      testResults: [],
      summary: 'Bài tập này chưa có test case tự động.',
    };
  }

  const testResults: TestResult[] = tests.map((test, index) => {
    const actualOutput = outputs[index] || '';
    return gradeTest(actualOutput, test);
  });

  const passedTests = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;
  const passed = passedTests === totalTests;

  let summary: string;
  if (passed) {
    summary = `🎉 Chúc mừng! Tất cả ${totalTests} test đều đạt!`;
  } else {
    summary = `Đạt ${passedTests}/${totalTests} test case.`;
  }

  return {
    passed,
    totalTests,
    passedTests,
    testResults,
    summary,
  };
}
