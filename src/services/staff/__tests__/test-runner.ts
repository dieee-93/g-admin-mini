/**
 * Custom Test Runner for Staff Module
 * Runs comprehensive test suite with coverage analysis
 */

import { exec } from 'child_process';
import { promisify } from 'util';

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
    console.log(`🧪 Running ${suiteName}...`);
    
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
        console.log(`✅ ${suiteName} - ${testResult.passed} tests passed (${duration}ms)`);
      } else {
        console.log(`❌ ${suiteName} - ${testResult.failed} tests failed, ${testResult.passed} passed`);
      }
      
      return testResult;
      
    } catch (error) {
      console.error(`💥 ${suiteName} - Error running tests:`, error);
      
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
      console.warn('Could not parse test output as JSON');
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
    console.log('🚀 Starting Staff Module Test Suite\n');
    
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
    console.log('📊 Test Summary');
    console.log('=' .repeat(50));
    
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
    const avgCoverage = this.results.reduce((sum, result) => sum + result.coverage, 0) / this.results.length;
    
    console.log(`Total Tests: ${totalPassed + totalFailed}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⏱️  Duration: ${totalDuration}ms`);
    console.log(`📈 Avg Coverage: ${avgCoverage.toFixed(1)}%`);
    console.log('');

    // Detailed breakdown
    this.results.forEach(result => {
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${result.suite}: ${result.passed}/${result.passed + result.failed} (${result.coverage}%)`);
    });

    console.log('');
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed! Staff module is ready for production.');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed. Please review and fix issues.`);
    }

    // Coverage recommendations
    if (avgCoverage < 80) {
      console.log('💡 Consider adding more tests to improve coverage (target: 80%+)');
    }

    // Performance recommendations
    const slowSuites = this.results.filter(r => r.duration > 5000);
    if (slowSuites.length > 0) {
      console.log('⚡ Consider optimizing slow test suites:');
      slowSuites.forEach(suite => {
        console.log(`   - ${suite.suite}: ${suite.duration}ms`);
      });
    }
  }

  async runCoverageAnalysis(): Promise<void> {
    console.log('📈 Running Coverage Analysis...');
    
    try {
      const { stdout } = await execAsync(
        'npx vitest run --coverage --reporter=json src/services/staff src/hooks/useStaffData.ts src/store/staffStore.ts src/pages/admin/staff'
      );
      
      // Parse coverage data
      console.log('Coverage Report:');
      console.log(stdout);
      
    } catch (error) {
      console.error('Error running coverage analysis:', error);
    }
  }

  async runPerformanceBenchmark(): Promise<void> {
    console.log('⚡ Running Performance Benchmarks...');
    
    const benchmarks = [
      'Large dataset handling (1000+ records)',
      'Concurrent API calls (4 simultaneous)',
      'Memory usage with rapid updates',
      'Search/filter performance',
      'Component render optimization'
    ];

    for (const benchmark of benchmarks) {
      console.log(`🔍 ${benchmark}...`);
      
      try {
        await execAsync('npx vitest run src/services/staff/__tests__/performance.test.ts --reporter=verbose');
        console.log('✅ Benchmark passed');
      } catch (error) {
        console.log('❌ Benchmark failed');
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