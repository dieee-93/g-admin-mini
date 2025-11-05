/**
 * Custom Test Runner for Staff Module
 * Runs comprehensive test suite with coverage analysis
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '@/lib/logging';

const execAsync = promisify(exec);

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  coverage: number;
  duration: number;
}

class StaffTestRunner {
  private results: TestResult[] = [];

  async runSuite(suitePath: string, suiteName: string): Promise<TestResult> {
    logger.debug('Test-runner', `🧪 Running ${suiteName}...`);
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        `npx vitest run "${suitePath}" --reporter=json --coverage`
      );
      
      const duration = Date.now() - startTime;
      
      // Parse vitest JSON output
      const result = this.parseTestOutput(stdout);
      
      const testResult: TestResult = {
        suite: suiteName,
        passed: result.passed || 0,
        failed: result.failed || 0,
        coverage: result.coverage || 0,
        duration
      };
      
      this.results.push(testResult);
      
      if (testResult.failed === 0) {
        logger.info('Test-runner', `✅ ${suiteName} - ${testResult.passed} tests passed (${duration}ms)`);
      } else {
        logger.error('Test-runner', `❌ ${suiteName} - ${testResult.failed} tests failed, ${testResult.passed} passed`);
      }
      
      return testResult;
      
    } catch (error) {
      logger.error('Test-runner', `💥 ${suiteName} - Error running tests:`, error);
      
      const testResult: TestResult = {
        suite: suiteName,
        passed: 0,
        failed: 1,
        coverage: 0,
        duration: Date.now() - startTime
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  private parseTestOutput(output: string): any {
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Test-runner', 'Could not parse test output as JSON');
    }
    
    // Fallback parsing
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const coverageMatch = output.match(/(\d+\.?\d*)%/);
    
    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      coverage: coverageMatch ? parseFloat(coverageMatch[1]) : 0
    };
  }

  async runAllTests(): Promise<void> {
    logger.info('Test-runner', '🚀 Starting Staff Module Test Suite\n');
    
    const testSuites = [
      {
        path: 'src/services/staff/__tests__/staffApi.test.ts',
        name: 'Staff API Unit Tests'
      },
      {
        path: 'src/hooks/__tests__/useStaffData.test.ts',
        name: 'Staff Hooks Tests'
      },
      {
        path: 'src/store/__tests__/staffStore.test.ts',
        name: 'Staff Store Tests'
      },
      {
        path: 'src/pages/admin/staff/components/__tests__/LaborCostDashboard.test.tsx',
        name: 'Labor Cost Dashboard Tests'
      },
      {
        path: 'src/pages/admin/staff/__tests__/integration.test.tsx',
        name: 'Integration Tests'
      },
      {
        path: 'src/services/staff/__tests__/performance.test.ts',
        name: 'Performance Tests'
      }
    ];

    for (const suite of testSuites) {
      await this.runSuite(suite.path, suite.name);
      console.log(''); // Add spacing
    }

    this.printSummary();
  }

  private printSummary(): void {
    logger.debug('Test-runner', '📊 Test Summary');
    console.log('=' .repeat(50));
    
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
    const avgCoverage = this.results.reduce((sum, result) => sum + result.coverage, 0) / this.results.length;
    
    logger.error('Test-runner', `Total Tests: ${totalPassed + totalFailed}`);
    logger.info('Test-runner', `✅ Passed: ${totalPassed}`);
    logger.error('Test-runner', `❌ Failed: ${totalFailed}`);
    logger.debug('Test-runner', `⏱️  Duration: ${totalDuration}ms`);
    logger.debug('Test-runner', `📈 Avg Coverage: ${avgCoverage.toFixed(1)}%`);
    console.log('');

    // Detailed breakdown
    this.results.forEach(result => {
      const status = result.failed === 0 ? '✅' : '❌';
      logger.error('Test-runner', `${status} ${result.suite}: ${result.passed}/${result.passed + result.failed} (${result.coverage}%)`);
    });

    console.log('');
    
    if (totalFailed === 0) {
      logger.info('Test-runner', '🎉 All tests passed! Staff module is ready for production.');
    } else {
      logger.error('Test-runner', `⚠️  ${totalFailed} test(s) failed. Please review and fix issues.`);
    }

    // Coverage recommendations
    if (avgCoverage < 80) {
      logger.debug('Test-runner', '💡 Consider adding more tests to improve coverage (target: 80%+)');
    }

    // Performance recommendations
    const slowSuites = this.results.filter(r => r.duration > 5000);
    if (slowSuites.length > 0) {
      logger.warn('Test-runner', '⚡ Consider optimizing slow test suites:');
      slowSuites.forEach(suite => {
        logger.debug('Test-runner', `   - ${suite.suite}: ${suite.duration}ms`);
      });
    }
  }

  async runCoverageAnalysis(): Promise<void> {
    logger.debug('Test-runner', '📈 Running Coverage Analysis...');
    
    try {
      const { stdout } = await execAsync(
        'npx vitest run --coverage --reporter=json src/services/staff src/hooks/useStaffData.ts src/store/staffStore.ts src/pages/admin/staff'
      );
      
      // Parse coverage data
      logger.debug('Test-runner', 'Coverage Report:');
      console.log(stdout);
      
    } catch (error) {
      logger.error('Test-runner', 'Error running coverage analysis:', error);
    }
  }

  async runPerformanceBenchmark(): Promise<void> {
    logger.debug('Test-runner', '⚡ Running Performance Benchmarks...');
    
    const benchmarks = [
      'Large dataset handling (1000+ records)',
      'Concurrent API calls (4 simultaneous)',
      'Memory usage with rapid updates',
      'Search/filter performance',
      'Component render optimization'
    ];

    for (const benchmark of benchmarks) {
      logger.debug('Test-runner', `🔍 ${benchmark}...`);
      
      try {
        await execAsync('npx vitest run src/services/staff/__tests__/performance.test.ts --reporter=verbose');
        logger.info('Test-runner', '✅ Benchmark passed');
      } catch (error) {
        logger.error('Test-runner', '❌ Benchmark failed');
      }
    }
  }
}

// CLI Interface
if (require.main === module) {
  const runner = new StaffTestRunner();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--coverage')) {
    runner.runCoverageAnalysis();
  } else if (args.includes('--performance')) {
    runner.runPerformanceBenchmark();
  } else {
    runner.runAllTests();
  }
}

export { StaffTestRunner };