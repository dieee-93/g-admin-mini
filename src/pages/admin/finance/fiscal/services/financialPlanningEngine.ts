/**
 * Financial Planning Engine with Decimal.js Precision
 * Advanced financial analysis, cash flow modeling, and ROI calculations for restaurant operations
 */

import { DecimalUtils } from '@/lib/decimal';

export interface CashFlowProjection {
  period: string;
  revenue: number;
  operating_expenses: number;
  capital_expenses: number;
  tax_obligations: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
  cash_position: number;
  liquidity_ratio: number;
}

export interface ROIAnalysis {
  investment_amount: number;
  annual_revenue_increase: number;
  annual_cost_savings: number;
  payback_period_months: number;
  net_present_value: number;
  internal_rate_of_return: number;
  roi_percentage: number;
  risk_adjusted_roi: number;
  break_even_point: string;
}

export interface ProfitabilityAnalysis {
  gross_profit: number;
  gross_margin_percentage: number;
  operating_profit: number;
  operating_margin_percentage: number;
  net_profit: number;
  net_margin_percentage: number;
  ebitda: number;
  ebitda_margin: number;
  contribution_margin: number;
  break_even_revenue: number;
}

export interface BudgetVarianceAnalysis {
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  variance_type: 'favorable' | 'unfavorable';
  significance_level: 'critical' | 'moderate' | 'minor';
  recommended_action: string;
}

export interface FinancialRatios {
  liquidity_ratios: {
    current_ratio: number;
    quick_ratio: number;
    cash_ratio: number;
  };
  efficiency_ratios: {
    asset_turnover: number;
    inventory_turnover: number;
    receivables_turnover: number;
  };
  profitability_ratios: {
    gross_profit_margin: number;
    operating_profit_margin: number;
    net_profit_margin: number;
    return_on_assets: number;
  };
  leverage_ratios: {
    debt_to_equity: number;
    debt_service_coverage: number;
    interest_coverage: number;
  };
}

export interface ScenarioAnalysis {
  scenario_name: string;
  probability: number;
  revenue_impact: number;
  cost_impact: number;
  net_impact: number;
  key_assumptions: string[];
  risk_factors: string[];
  mitigation_strategies: string[];
}

/**
 * Generate detailed cash flow projections with decimal precision
 */
export function generateCashFlowProjection(
  baseData: {
    starting_cash: number;
    monthly_revenue: number;
    operating_expenses: number;
    capital_expenses_schedule: Array<{ month: number; amount: number; description: string }>;
    tax_rate: number;
    revenue_growth_rate: number;
    expense_inflation_rate: number;
  },
  periods: number = 12
): CashFlowProjection[] {
  const projections: CashFlowProjection[] = [];
  let cumulativeCashFlowDec = DecimalUtils.fromValue(0, 'financial');
  let cashPositionDec = DecimalUtils.fromValue(baseData.starting_cash, 'financial');

  const monthlyRevenueDec = DecimalUtils.fromValue(baseData.monthly_revenue, 'financial');
  const operatingExpensesDec = DecimalUtils.fromValue(baseData.operating_expenses, 'financial');
  const taxRateDec = DecimalUtils.fromValue(baseData.tax_rate, 'financial');
  const revenueGrowthDec = DecimalUtils.fromValue(baseData.revenue_growth_rate, 'financial');
  const expenseInflationDec = DecimalUtils.fromValue(baseData.expense_inflation_rate, 'financial');

  for (let period = 1; period <= periods; period++) {
    // Calculate revenue with growth
    const growthFactorDec = DecimalUtils.add(
      DecimalUtils.fromValue(1, 'financial'),
      DecimalUtils.multiply(
        revenueGrowthDec,
        DecimalUtils.fromValue((period - 1) / 12, 'financial'),
        'financial'
      ),
      'financial'
    );
    const periodRevenueDec = DecimalUtils.multiply(monthlyRevenueDec, growthFactorDec, 'financial');

    // Calculate expenses with inflation
    const inflationFactorDec = DecimalUtils.add(
      DecimalUtils.fromValue(1, 'financial'),
      DecimalUtils.multiply(
        expenseInflationDec,
        DecimalUtils.fromValue((period - 1) / 12, 'financial'),
        'financial'
      ),
      'financial'
    );
    const periodExpensesDec = DecimalUtils.multiply(operatingExpensesDec, inflationFactorDec, 'financial');

    // Find capital expenses for this period
    const capitalExpenses = baseData.capital_expenses_schedule.filter(exp => exp.month === period);
    const capitalExpensesDec = capitalExpenses.reduce((sum, exp) => 
      DecimalUtils.add(sum, DecimalUtils.fromValue(exp.amount, 'financial'), 'financial'),
      DecimalUtils.fromValue(0, 'financial')
    );

    // Calculate taxes (simplified - based on profit)
    const grossProfitDec = DecimalUtils.subtract(periodRevenueDec, periodExpensesDec, 'financial');
    const taxesDec = DecimalUtils.multiply(
      DecimalUtils.max(grossProfitDec, DecimalUtils.fromValue(0, 'financial')),
      taxRateDec,
      'financial'
    );

    // Calculate net cash flow
    const netCashFlowDec = DecimalUtils.subtract(
      DecimalUtils.subtract(
        DecimalUtils.subtract(periodRevenueDec, periodExpensesDec, 'financial'),
        capitalExpensesDec,
        'financial'
      ),
      taxesDec,
      'financial'
    );

    // Update cumulative and cash position
    cumulativeCashFlowDec = DecimalUtils.add(cumulativeCashFlowDec, netCashFlowDec, 'financial');
    cashPositionDec = DecimalUtils.add(cashPositionDec, netCashFlowDec, 'financial');

    // Calculate liquidity ratio (cash position vs monthly expenses)
    const liquidityRatioDec = DecimalUtils.divide(
      cashPositionDec,
      DecimalUtils.add(periodExpensesDec, capitalExpensesDec, 'financial'),
      'financial'
    );

    projections.push({
      period: `Month ${period}`,
      revenue: DecimalUtils.toNumber(periodRevenueDec),
      operating_expenses: DecimalUtils.toNumber(periodExpensesDec),
      capital_expenses: DecimalUtils.toNumber(capitalExpensesDec),
      tax_obligations: DecimalUtils.toNumber(taxesDec),
      net_cash_flow: DecimalUtils.toNumber(netCashFlowDec),
      cumulative_cash_flow: DecimalUtils.toNumber(cumulativeCashFlowDec),
      cash_position: DecimalUtils.toNumber(cashPositionDec),
      liquidity_ratio: DecimalUtils.toNumber(liquidityRatioDec)
    });
  }

  return projections;
}

/**
 * Calculate ROI analysis for investments with decimal precision
 */
export function calculateROIAnalysis(
  investmentData: {
    initial_investment: number;
    annual_revenue_increase: number;
    annual_cost_savings: number;
    implementation_costs: number;
    annual_maintenance_costs: number;
    project_lifespan_years: number;
    discount_rate: number;
    risk_factor: number;
  }
): ROIAnalysis {
  const initialInvestmentDec = DecimalUtils.fromValue(investmentData.initial_investment, 'financial');
  const implementationCostsDec = DecimalUtils.fromValue(investmentData.implementation_costs, 'financial');
  const totalInvestmentDec = DecimalUtils.add(initialInvestmentDec, implementationCostsDec, 'financial');
  
  const annualRevenueDec = DecimalUtils.fromValue(investmentData.annual_revenue_increase, 'financial');
  const annualSavingsDec = DecimalUtils.fromValue(investmentData.annual_cost_savings, 'financial');
  const maintenanceCostsDec = DecimalUtils.fromValue(investmentData.annual_maintenance_costs, 'financial');
  const discountRateDec = DecimalUtils.fromValue(investmentData.discount_rate, 'financial');
  const riskFactorDec = DecimalUtils.fromValue(investmentData.risk_factor, 'financial');
  
  // Calculate net annual benefit
  const grossBenefitDec = DecimalUtils.add(annualRevenueDec, annualSavingsDec, 'financial');
  const netAnnualBenefitDec = DecimalUtils.subtract(grossBenefitDec, maintenanceCostsDec, 'financial');

  // Calculate payback period
  const paybackPeriodDec = DecimalUtils.divide(totalInvestmentDec, netAnnualBenefitDec, 'financial');
  const paybackMonthsDec = DecimalUtils.multiply(paybackPeriodDec, DecimalUtils.fromValue(12, 'financial'), 'financial');

  // Calculate NPV
  let npvDec = DecimalUtils.multiply(totalInvestmentDec, DecimalUtils.fromValue(-1, 'financial'), 'financial'); // Negative initial investment
  
  for (let year = 1; year <= investmentData.project_lifespan_years; year++) {
    const yearDec = DecimalUtils.fromValue(year, 'financial');
    const discountFactorDec = DecimalUtils.pow(
      DecimalUtils.add(DecimalUtils.fromValue(1, 'financial'), discountRateDec, 'financial'),
      yearDec
    );
    const presentValueDec = DecimalUtils.divide(netAnnualBenefitDec, discountFactorDec, 'financial');
    npvDec = DecimalUtils.add(npvDec, presentValueDec, 'financial');
  }

  // Calculate simple ROI percentage
  const totalBenefitDec = DecimalUtils.multiply(
    netAnnualBenefitDec,
    DecimalUtils.fromValue(investmentData.project_lifespan_years, 'financial'),
    'financial'
  );
  const roiDec = DecimalUtils.multiply(
    DecimalUtils.divide(
      DecimalUtils.subtract(totalBenefitDec, totalInvestmentDec, 'financial'),
      totalInvestmentDec,
      'financial'
    ),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  // Calculate risk-adjusted ROI
  const riskAdjustmentDec = DecimalUtils.subtract(DecimalUtils.fromValue(1, 'financial'), riskFactorDec, 'financial');
  const riskAdjustedRoiDec = DecimalUtils.multiply(roiDec, riskAdjustmentDec, 'financial');

  // Simplified IRR calculation (approximate)
  const irrApproxDec = DecimalUtils.subtract(
    DecimalUtils.divide(netAnnualBenefitDec, totalInvestmentDec, 'financial'),
    discountRateDec,
    'financial'
  );
  const irrPercentDec = DecimalUtils.multiply(irrApproxDec, DecimalUtils.fromValue(100, 'financial'), 'financial');

  return {
    investment_amount: DecimalUtils.toNumber(totalInvestmentDec),
    annual_revenue_increase: DecimalUtils.toNumber(annualRevenueDec),
    annual_cost_savings: DecimalUtils.toNumber(annualSavingsDec),
    payback_period_months: DecimalUtils.toNumber(paybackMonthsDec),
    net_present_value: DecimalUtils.toNumber(npvDec),
    internal_rate_of_return: Math.max(0, DecimalUtils.toNumber(irrPercentDec)),
    roi_percentage: DecimalUtils.toNumber(roiDec),
    risk_adjusted_roi: DecimalUtils.toNumber(riskAdjustedRoiDec),
    break_even_point: `${Math.ceil(DecimalUtils.toNumber(paybackPeriodDec) * 12)} months`
  };
}

/**
 * Analyze profitability with comprehensive metrics
 */
export function analyzeProfitability(
  financialData: {
    revenue: number;
    cost_of_goods_sold: number;
    operating_expenses: number;
    depreciation: number;
    interest_expense: number;
    tax_rate: number;
    fixed_costs: number;
    variable_cost_rate: number;
  }
): ProfitabilityAnalysis {
  const revenueDec = DecimalUtils.fromValue(financialData.revenue, 'financial');
  const cogsDec = DecimalUtils.fromValue(financialData.cost_of_goods_sold, 'financial');
  const opExpensesDec = DecimalUtils.fromValue(financialData.operating_expenses, 'financial');
  const depreciationDec = DecimalUtils.fromValue(financialData.depreciation, 'financial');
  const interestDec = DecimalUtils.fromValue(financialData.interest_expense, 'financial');
  const taxRateDec = DecimalUtils.fromValue(financialData.tax_rate, 'financial');
  const fixedCostsDec = DecimalUtils.fromValue(financialData.fixed_costs, 'financial');
  const variableRateDec = DecimalUtils.fromValue(financialData.variable_cost_rate, 'financial');

  // Calculate gross profit
  const grossProfitDec = DecimalUtils.subtract(revenueDec, cogsDec, 'financial');
  const grossMarginDec = DecimalUtils.multiply(
    DecimalUtils.divide(grossProfitDec, revenueDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  // Calculate operating profit (EBIT)
  const operatingProfitDec = DecimalUtils.subtract(grossProfitDec, opExpensesDec, 'financial');
  const operatingMarginDec = DecimalUtils.multiply(
    DecimalUtils.divide(operatingProfitDec, revenueDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  // Calculate EBITDA
  const ebitdaDec = DecimalUtils.add(operatingProfitDec, depreciationDec, 'financial');
  const ebitdaMarginDec = DecimalUtils.multiply(
    DecimalUtils.divide(ebitdaDec, revenueDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  // Calculate net profit
  const ebitDec = operatingProfitDec;
  const ebtDec = DecimalUtils.subtract(ebitDec, interestDec, 'financial');
  const taxesDec = DecimalUtils.multiply(
    DecimalUtils.max(ebtDec, DecimalUtils.fromValue(0, 'financial')),
    taxRateDec,
    'financial'
  );
  const netProfitDec = DecimalUtils.subtract(ebtDec, taxesDec, 'financial');
  const netMarginDec = DecimalUtils.multiply(
    DecimalUtils.divide(netProfitDec, revenueDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  // Calculate contribution margin
  const variableCostsDec = DecimalUtils.multiply(revenueDec, variableRateDec, 'financial');
  const contributionMarginDec = DecimalUtils.subtract(revenueDec, variableCostsDec, 'financial');

  // Calculate break-even revenue
  const contributionMarginRateDec = DecimalUtils.divide(contributionMarginDec, revenueDec, 'financial');
  const breakEvenRevenueDec = DecimalUtils.divide(fixedCostsDec, contributionMarginRateDec, 'financial');

  return {
    gross_profit: DecimalUtils.toNumber(grossProfitDec),
    gross_margin_percentage: DecimalUtils.toNumber(grossMarginDec),
    operating_profit: DecimalUtils.toNumber(operatingProfitDec),
    operating_margin_percentage: DecimalUtils.toNumber(operatingMarginDec),
    net_profit: DecimalUtils.toNumber(netProfitDec),
    net_margin_percentage: DecimalUtils.toNumber(netMarginDec),
    ebitda: DecimalUtils.toNumber(ebitdaDec),
    ebitda_margin: DecimalUtils.toNumber(ebitdaMarginDec),
    contribution_margin: DecimalUtils.toNumber(contributionMarginDec),
    break_even_revenue: DecimalUtils.toNumber(breakEvenRevenueDec)
  };
}

/**
 * Perform budget variance analysis with decimal precision
 */
export function analyzeBudgetVariance(
  budgetItems: Array<{
    category: string;
    budgeted_amount: number;
    actual_amount: number;
    category_type: 'revenue' | 'expense';
    criticality: 'high' | 'medium' | 'low';
  }>
): BudgetVarianceAnalysis[] {
  return budgetItems.map(item => {
    const budgetedDec = DecimalUtils.fromValue(item.budgeted_amount, 'financial');
    const actualDec = DecimalUtils.fromValue(item.actual_amount, 'financial');

    // Calculate variance
    const varianceDec = DecimalUtils.subtract(actualDec, budgetedDec, 'financial');
    const variancePercentDec = DecimalUtils.multiply(
      DecimalUtils.divide(varianceDec, budgetedDec, 'financial'),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );

    const varianceAmount = DecimalUtils.toNumber(varianceDec);
    const variancePercentage = DecimalUtils.toNumber(variancePercentDec);

    // Determine if variance is favorable or unfavorable
    let varianceType: 'favorable' | 'unfavorable';
    if (item.category_type === 'revenue') {
      varianceType = varianceAmount >= 0 ? 'favorable' : 'unfavorable';
    } else { // expense
      varianceType = varianceAmount <= 0 ? 'favorable' : 'unfavorable';
    }

    // Determine significance level
    let significanceLevel: 'critical' | 'moderate' | 'minor';
    const absVariancePercent = Math.abs(variancePercentage);
    
    if (item.criticality === 'high' && absVariancePercent > 10) {
      significanceLevel = 'critical';
    } else if (absVariancePercent > 15) {
      significanceLevel = 'critical';
    } else if (absVariancePercent > 5) {
      significanceLevel = 'moderate';
    } else {
      significanceLevel = 'minor';
    }

    // Generate recommended action
    let recommendedAction = 'Monitor performance';
    
    if (significanceLevel === 'critical') {
      if (varianceType === 'unfavorable') {
        recommendedAction = item.category_type === 'revenue' 
          ? 'Immediate action required: Investigate revenue shortfall and implement corrective measures'
          : 'Cost control measures needed: Review and reduce expenses immediately';
      } else {
        recommendedAction = 'Analyze success factors and replicate in other areas';
      }
    } else if (significanceLevel === 'moderate') {
      recommendedAction = varianceType === 'unfavorable' 
        ? 'Review and adjust processes to improve performance'
        : 'Document and leverage successful strategies';
    }

    return {
      category: item.category,
      budgeted_amount: item.budgeted_amount,
      actual_amount: item.actual_amount,
      variance_amount: varianceAmount,
      variance_percentage: variancePercentage,
      variance_type: varianceType,
      significance_level: significanceLevel,
      recommended_action: recommendedAction
    };
  });
}

/**
 * Calculate comprehensive financial ratios
 */
export function calculateFinancialRatios(
  balanceSheetData: {
    current_assets: number;
    quick_assets: number;
    cash: number;
    total_assets: number;
    inventory: number;
    accounts_receivable: number;
    current_liabilities: number;
    total_debt: number;
    equity: number;
    annual_sales: number;
    cost_of_goods_sold: number;
    operating_profit: number;
    net_income: number;
    interest_expense: number;
    debt_service_payments: number;
  }
): FinancialRatios {
  // Convert all values to Decimal for precision
  const currentAssetsDec = DecimalUtils.fromValue(balanceSheetData.current_assets, 'financial');
  const quickAssetsDec = DecimalUtils.fromValue(balanceSheetData.quick_assets, 'financial');
  const cashDec = DecimalUtils.fromValue(balanceSheetData.cash, 'financial');
  const totalAssetsDec = DecimalUtils.fromValue(balanceSheetData.total_assets, 'financial');
  const inventoryDec = DecimalUtils.fromValue(balanceSheetData.inventory, 'financial');
  const receivablesDec = DecimalUtils.fromValue(balanceSheetData.accounts_receivable, 'financial');
  const currentLiabilitiesDec = DecimalUtils.fromValue(balanceSheetData.current_liabilities, 'financial');
  const totalDebtDec = DecimalUtils.fromValue(balanceSheetData.total_debt, 'financial');
  const equityDec = DecimalUtils.fromValue(balanceSheetData.equity, 'financial');
  const annualSalesDec = DecimalUtils.fromValue(balanceSheetData.annual_sales, 'financial');
  const cogsDec = DecimalUtils.fromValue(balanceSheetData.cost_of_goods_sold, 'financial');
  const operatingProfitDec = DecimalUtils.fromValue(balanceSheetData.operating_profit, 'financial');
  const netIncomeDec = DecimalUtils.fromValue(balanceSheetData.net_income, 'financial');
  const interestExpenseDec = DecimalUtils.fromValue(balanceSheetData.interest_expense, 'financial');
  const debtServiceDec = DecimalUtils.fromValue(balanceSheetData.debt_service_payments, 'financial');

  return {
    liquidity_ratios: {
      current_ratio: DecimalUtils.toNumber(
        DecimalUtils.divide(currentAssetsDec, currentLiabilitiesDec, 'financial')
      ),
      quick_ratio: DecimalUtils.toNumber(
        DecimalUtils.divide(quickAssetsDec, currentLiabilitiesDec, 'financial')
      ),
      cash_ratio: DecimalUtils.toNumber(
        DecimalUtils.divide(cashDec, currentLiabilitiesDec, 'financial')
      )
    },
    efficiency_ratios: {
      asset_turnover: DecimalUtils.toNumber(
        DecimalUtils.divide(annualSalesDec, totalAssetsDec, 'financial')
      ),
      inventory_turnover: DecimalUtils.toNumber(
        DecimalUtils.divide(cogsDec, inventoryDec, 'financial')
      ),
      receivables_turnover: DecimalUtils.toNumber(
        DecimalUtils.divide(annualSalesDec, receivablesDec, 'financial')
      )
    },
    profitability_ratios: {
      gross_profit_margin: DecimalUtils.toNumber(
        DecimalUtils.multiply(
          DecimalUtils.divide(
            DecimalUtils.subtract(annualSalesDec, cogsDec, 'financial'),
            annualSalesDec,
            'financial'
          ),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        )
      ),
      operating_profit_margin: DecimalUtils.toNumber(
        DecimalUtils.multiply(
          DecimalUtils.divide(operatingProfitDec, annualSalesDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        )
      ),
      net_profit_margin: DecimalUtils.toNumber(
        DecimalUtils.multiply(
          DecimalUtils.divide(netIncomeDec, annualSalesDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        )
      ),
      return_on_assets: DecimalUtils.toNumber(
        DecimalUtils.multiply(
          DecimalUtils.divide(netIncomeDec, totalAssetsDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        )
      )
    },
    leverage_ratios: {
      debt_to_equity: DecimalUtils.toNumber(
        DecimalUtils.divide(totalDebtDec, equityDec, 'financial')
      ),
      debt_service_coverage: DecimalUtils.toNumber(
        DecimalUtils.divide(operatingProfitDec, debtServiceDec, 'financial')
      ),
      interest_coverage: DecimalUtils.toNumber(
        DecimalUtils.divide(operatingProfitDec, interestExpenseDec, 'financial')
      )
    }
  };
}

/**
 * Perform scenario analysis for financial planning
 */
export function performScenarioAnalysis(
  baseCase: {
    annual_revenue: number;
    annual_costs: number;
    growth_rate: number;
  },
  scenarios: Array<{
    name: string;
    probability: number;
    revenue_change_percent: number;
    cost_change_percent: number;
    growth_rate_change: number;
    key_assumptions: string[];
  }>
): ScenarioAnalysis[] {
  const baseRevenueDec = DecimalUtils.fromValue(baseCase.annual_revenue, 'financial');
  const baseCostsDec = DecimalUtils.fromValue(baseCase.annual_costs, 'financial');
  const baseNetIncomeDec = DecimalUtils.subtract(baseRevenueDec, baseCostsDec, 'financial');

  return scenarios.map(scenario => {
    // Calculate revenue impact
    const revenueChangeDec = DecimalUtils.multiply(
      baseRevenueDec,
      DecimalUtils.fromValue(scenario.revenue_change_percent / 100, 'financial'),
      'financial'
    );
    const newRevenueDec = DecimalUtils.add(baseRevenueDec, revenueChangeDec, 'financial');

    // Calculate cost impact
    const costChangeDec = DecimalUtils.multiply(
      baseCostsDec,
      DecimalUtils.fromValue(scenario.cost_change_percent / 100, 'financial'),
      'financial'
    );
    const newCostsDec = DecimalUtils.add(baseCostsDec, costChangeDec, 'financial');

    // Calculate net impact
    const newNetIncomeDec = DecimalUtils.subtract(newRevenueDec, newCostsDec, 'financial');
    const netImpactDec = DecimalUtils.subtract(newNetIncomeDec, baseNetIncomeDec, 'financial');

    // Generate risk factors based on scenario characteristics
    const riskFactors: string[] = [];
    if (Math.abs(scenario.revenue_change_percent) > 20) {
      riskFactors.push('High revenue volatility');
    }
    if (scenario.cost_change_percent > 15) {
      riskFactors.push('Significant cost inflation');
    }
    if (scenario.probability < 0.3) {
      riskFactors.push('Low probability scenario with high impact');
    }

    // Generate mitigation strategies
    const mitigationStrategies: string[] = [];
    if (DecimalUtils.toNumber(netImpactDec) < 0) {
      mitigationStrategies.push('Develop contingency cost reduction plans');
      mitigationStrategies.push('Diversify revenue streams');
    }
    if (riskFactors.length > 1) {
      mitigationStrategies.push('Maintain higher cash reserves');
      mitigationStrategies.push('Consider insurance coverage');
    }

    return {
      scenario_name: scenario.name,
      probability: scenario.probability,
      revenue_impact: DecimalUtils.toNumber(revenueChangeDec),
      cost_impact: DecimalUtils.toNumber(costChangeDec),
      net_impact: DecimalUtils.toNumber(netImpactDec),
      key_assumptions: scenario.key_assumptions,
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies
    };
  });
}