/**
 * Advanced Financial Modeling Engine
 * Monte Carlo simulations, portfolio optimization, and risk analysis
 */

export interface PortfolioAsset {
  symbol: string;
  name: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
  price: number;
  dividend?: number;
}

export interface MonteCarloConfig {
  simulations: number;
  timeHorizon: number; // in years
  initialValue: number;
  confidence: number; // for VaR calculation
}

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  conditionalVaR: number;
  beta: number;
  alpha: number;
  treynorRatio: number;
  informationRatio: number;
}

export interface MonteCarloResults {
  finalValues: number[];
  paths: number[][];
  statistics: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    valueAtRisk: number;
    conditionalVaR: number;
    probabilityOfLoss: number;
    expectedShortfall: number;
  };
  percentiles: { [key: number]: number };
}

export interface EfficientFrontier {
  returns: number[];
  volatilities: number[];
  weights: number[][];
  sharpeRatios: number[];
  optimalPortfolio: {
    weights: number[];
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
}

export interface BlackScholesResult {
  callPrice: number;
  putPrice: number;
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
  };
  impliedVolatility?: number;
}

export interface BondPricing {
  price: number;
  yieldToMaturity: number;
  duration: number;
  modifiedDuration: number;
  convexity: number;
  macaulayDuration: number;
}

export interface RiskMetrics {
  beta: number;
  alpha: number;
  correlation: number;
  tracking_error: number;
  information_ratio: number;
  treynor_ratio: number;
  jensen_alpha: number;
  m2_measure: number;
}

export class AdvancedFinancialEngine {

  /**
   * Monte Carlo simulation for portfolio or investment analysis
   */
  static runMonteCarloSimulation(
    assets: PortfolioAsset[],
    config: MonteCarloConfig,
    correlationMatrix?: number[][]
  ): MonteCarloResults {
    const { simulations, timeHorizon, initialValue } = config;
    const dt = 1 / 252; // Daily time step (252 trading days per year)
    const steps = Math.floor(timeHorizon * 252);
    
    const finalValues: number[] = [];
    const paths: number[][] = [];
    
    // Calculate portfolio expected return and volatility
    const portfolioReturn = assets.reduce((sum, asset) => sum + asset.weight * asset.expectedReturn, 0);
    const portfolioVolatility = this.calculatePortfolioVolatility(assets, correlationMatrix);
    
    // Run simulations
    for (let sim = 0; sim < simulations; sim++) {
      const path: number[] = [initialValue];
      let currentValue = initialValue;
      
      for (let step = 1; step <= steps; step++) {
        // Geometric Brownian Motion
        const randomShock = this.boxMullerRandom();
        const drift = (portfolioReturn - 0.5 * portfolioVolatility * portfolioVolatility) * dt;
        const diffusion = portfolioVolatility * Math.sqrt(dt) * randomShock;
        
        currentValue = currentValue * Math.exp(drift + diffusion);
        path.push(currentValue);
      }
      
      finalValues.push(currentValue);
      paths.push(path);
    }
    
    // Calculate statistics
    const sortedFinalValues = [...finalValues].sort((a, b) => a - b);
    const mean = finalValues.reduce((sum, val) => sum + val, 0) / simulations;
    const variance = finalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (simulations - 1);
    const std = Math.sqrt(variance);
    
    const confidenceLevel = config.confidence || 0.95;
    const varIndex = Math.floor((1 - confidenceLevel) * simulations);
    const valueAtRisk = initialValue - sortedFinalValues[varIndex];
    
    // Calculate Conditional VaR (Expected Shortfall)
    const tailValues = sortedFinalValues.slice(0, varIndex);
    const conditionalVaR = tailValues.length > 0 ? 
      initialValue - (tailValues.reduce((sum, val) => sum + val, 0) / tailValues.length) : 0;
    
    const probabilityOfLoss = sortedFinalValues.filter(val => val < initialValue).length / simulations;
    const expectedShortfall = conditionalVaR;
    
    // Calculate percentiles
    const percentiles: { [key: number]: number } = {};
    [5, 10, 25, 50, 75, 90, 95, 99].forEach(p => {
      const index = Math.floor((p / 100) * simulations);
      percentiles[p] = sortedFinalValues[index];
    });
    
    return {
      finalValues,
      paths,
      statistics: {
        mean,
        median: sortedFinalValues[Math.floor(simulations / 2)],
        std,
        min: sortedFinalValues[0],
        max: sortedFinalValues[simulations - 1],
        valueAtRisk,
        conditionalVaR,
        probabilityOfLoss,
        expectedShortfall
      },
      percentiles
    };
  }

  /**
   * Portfolio optimization using Modern Portfolio Theory
   */
  static optimizePortfolio(
    assets: PortfolioAsset[],
    riskFreeRate: number = 0.02,
    correlationMatrix?: number[][],
    constraints?: { minWeight?: number; maxWeight?: number }
  ): EfficientFrontier {
    const n = assets.length;
    const returns = assets.map(asset => asset.expectedReturn);
    const volatilities = assets.map(asset => asset.volatility);
    
    // Generate correlation matrix if not provided
    const corrMatrix = correlationMatrix || this.generateCorrelationMatrix(n);
    
    // Generate efficient frontier points
    const numPoints = 100;
    const minReturn = Math.min(...returns);
    const maxReturn = Math.max(...returns);
    const targetReturns = this.linspace(minReturn, maxReturn, numPoints);
    
    const frontierReturns: number[] = [];
    const frontierVolatilities: number[] = [];
    const frontierWeights: number[][] = [];
    const sharpeRatios: number[] = [];
    
    for (const targetReturn of targetReturns) {
      try {
        const result = this.optimizeForTargetReturn(
          returns,
          volatilities,
          corrMatrix,
          targetReturn,
          constraints
        );
        
        if (result) {
          frontierReturns.push(result.expectedReturn);
          frontierVolatilities.push(result.volatility);
          frontierWeights.push(result.weights);
          
          const sharpeRatio = (result.expectedReturn - riskFreeRate) / result.volatility;
          sharpeRatios.push(sharpeRatio);
        }
      } catch (error) {
        // Skip infeasible points
        continue;
      }
    }
    
    // Find optimal portfolio (maximum Sharpe ratio)
    const maxSharpeIndex = sharpeRatios.indexOf(Math.max(...sharpeRatios));
    const optimalPortfolio = {
      weights: frontierWeights[maxSharpeIndex],
      expectedReturn: frontierReturns[maxSharpeIndex],
      volatility: frontierVolatilities[maxSharpeIndex],
      sharpeRatio: sharpeRatios[maxSharpeIndex]
    };
    
    return {
      returns: frontierReturns,
      volatilities: frontierVolatilities,
      weights: frontierWeights,
      sharpeRatios,
      optimalPortfolio
    };
  }

  /**
   * Calculate comprehensive portfolio metrics
   */
  static calculatePortfolioMetrics(
    portfolio: PortfolioAsset[],
    marketReturns: number[],
    riskFreeRate: number = 0.02,
    correlationMatrix?: number[][]
  ): PortfolioMetrics {
    const portfolioReturn = portfolio.reduce((sum, asset) => sum + asset.weight * asset.expectedReturn, 0);
    const portfolioVolatility = this.calculatePortfolioVolatility(portfolio, correlationMatrix);
    
    // Calculate portfolio returns time series (simplified)
    const portfolioReturns = marketReturns.map(marketReturn => 
      portfolioReturn + (marketReturn - 0.1) * 0.8 // Simplified relationship
    );
    
    // Sharpe Ratio
    const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
    
    // Sortino Ratio (using downside deviation)
    const downsideReturns = portfolioReturns.filter(r => r < riskFreeRate);
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((sum, r) => sum + Math.pow(r - riskFreeRate, 2), 0) / downsideReturns.length
    );
    const sortinoRatio = (portfolioReturn - riskFreeRate) / downsideDeviation;
    
    // Maximum Drawdown
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);
    
    // Value at Risk (95% confidence)
    const sortedReturns = [...portfolioReturns].sort((a, b) => a - b);
    const varIndex = Math.floor(0.05 * sortedReturns.length);
    const valueAtRisk = -sortedReturns[varIndex];
    
    // Conditional VaR
    const tailReturns = sortedReturns.slice(0, varIndex);
    const conditionalVaR = tailReturns.length > 0 ? 
      -(tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length) : 0;
    
    // Beta (portfolio sensitivity to market)
    const beta = this.calculateBeta(portfolioReturns, marketReturns);
    
    // Alpha (risk-adjusted excess return)
    const alpha = portfolioReturn - (riskFreeRate + beta * (0.1 - riskFreeRate)); // Assuming 10% market return
    
    // Treynor Ratio
    const treynorRatio = (portfolioReturn - riskFreeRate) / beta;
    
    // Information Ratio (assuming benchmark return of 8%)
    const benchmarkReturn = 0.08;
    const trackingError = Math.sqrt(
      portfolioReturns.reduce((sum, r) => sum + Math.pow(r - benchmarkReturn, 2), 0) / portfolioReturns.length
    );
    const informationRatio = (portfolioReturn - benchmarkReturn) / trackingError;
    
    return {
      expectedReturn: portfolioReturn,
      volatility: portfolioVolatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      valueAtRisk,
      conditionalVaR,
      beta,
      alpha,
      treynorRatio,
      informationRatio
    };
  }

  /**
   * Black-Scholes option pricing
   */
  static blackScholes(
    spotPrice: number,
    strikePrice: number,
    timeToExpiry: number,
    riskFreeRate: number,
    volatility: number,
    dividendYield: number = 0
  ): BlackScholesResult {
    const d1 = (Math.log(spotPrice / strikePrice) + 
                (riskFreeRate - dividendYield + 0.5 * volatility * volatility) * timeToExpiry) / 
               (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
    
    const callPrice = spotPrice * Math.exp(-dividendYield * timeToExpiry) * this.normalCDF(d1) - 
                     strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2);
    
    const putPrice = strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(-d2) - 
                    spotPrice * Math.exp(-dividendYield * timeToExpiry) * this.normalCDF(-d1);
    
    // Greeks
    const delta = Math.exp(-dividendYield * timeToExpiry) * this.normalCDF(d1);
    const gamma = Math.exp(-dividendYield * timeToExpiry) * this.normalPDF(d1) / 
                 (spotPrice * volatility * Math.sqrt(timeToExpiry));
    const theta = -(spotPrice * this.normalPDF(d1) * volatility * Math.exp(-dividendYield * timeToExpiry)) / 
                  (2 * Math.sqrt(timeToExpiry)) - 
                  riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2);
    const vega = spotPrice * Math.exp(-dividendYield * timeToExpiry) * this.normalPDF(d1) * Math.sqrt(timeToExpiry);
    const rho = strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2);
    
    return {
      callPrice,
      putPrice,
      greeks: { delta, gamma, theta, vega, rho }
    };
  }

  /**
   * Bond pricing and analytics
   */
  static priceBond(
    faceValue: number,
    couponRate: number,
    yearsToMaturity: number,
    yieldToMaturity: number,
    frequency: number = 2
  ): BondPricing {
    const periodsToMaturity = yearsToMaturity * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const periodYield = yieldToMaturity / frequency;
    
    // Calculate bond price
    let price = 0;
    let duration = 0;
    let convexity = 0;
    
    for (let t = 1; t <= periodsToMaturity; t++) {
      const discountFactor = Math.pow(1 + periodYield, -t);
      const cashFlow = t === periodsToMaturity ? couponPayment + faceValue : couponPayment;
      
      price += cashFlow * discountFactor;
      duration += (t / frequency) * cashFlow * discountFactor;
      convexity += (t / frequency) * (t / frequency + 1 / frequency) * cashFlow * discountFactor;
    }
    
    const macaulayDuration = duration / price;
    const modifiedDuration = macaulayDuration / (1 + yieldToMaturity / frequency);
    convexity = convexity / price;
    
    return {
      price,
      yieldToMaturity,
      duration: macaulayDuration,
      modifiedDuration,
      convexity,
      macaulayDuration
    };
  }

  /**
   * Risk metrics calculation
   */
  static calculateRiskMetrics(
    assetReturns: number[],
    marketReturns: number[],
    riskFreeRate: number = 0.02
  ): RiskMetrics {
    const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    // Beta calculation
    const covariance = assetReturns.reduce((sum, r, i) => 
      sum + (r - assetMean) * (marketReturns[i] - marketMean), 0) / (assetReturns.length - 1);
    const marketVariance = marketReturns.reduce((sum, r) => 
      sum + Math.pow(r - marketMean, 2), 0) / (marketReturns.length - 1);
    const beta = covariance / marketVariance;
    
    // Alpha calculation
    const alpha = assetMean - (riskFreeRate + beta * (marketMean - riskFreeRate));
    
    // Correlation
    const assetStd = Math.sqrt(assetReturns.reduce((sum, r) => 
      sum + Math.pow(r - assetMean, 2), 0) / (assetReturns.length - 1));
    const marketStd = Math.sqrt(marketVariance);
    const correlation = covariance / (assetStd * marketStd);
    
    // Tracking error
    const trackingDifferences = assetReturns.map((r, i) => r - marketReturns[i]);
    const trackingError = Math.sqrt(trackingDifferences.reduce((sum, diff) => 
      sum + Math.pow(diff, 2), 0) / (trackingDifferences.length - 1));
    
    // Information ratio
    const informationRatio = (assetMean - marketMean) / trackingError;
    
    // Treynor ratio
    const treynorRatio = (assetMean - riskFreeRate) / beta;
    
    // Jensen's Alpha
    const jensenAlpha = alpha;
    
    // M² measure
    const sharpeAsset = (assetMean - riskFreeRate) / assetStd;
    const m2Measure = sharpeAsset * marketStd + riskFreeRate;
    
    return {
      beta,
      alpha,
      correlation,
      tracking_error: trackingError,
      information_ratio: informationRatio,
      treynor_ratio: treynorRatio,
      jensen_alpha: jensenAlpha,
      m2_measure: m2Measure
    };
  }

  /**
   * Value at Risk calculation using historical simulation
   */
  static calculateVaR(
    returns: number[],
    confidence: number = 0.95,
    timeHorizon: number = 1
  ): { var: number; expectedShortfall: number } {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidence) * returns.length);
    const var95 = -sortedReturns[varIndex] * Math.sqrt(timeHorizon);
    
    // Expected Shortfall (Conditional VaR)
    const tailReturns = sortedReturns.slice(0, varIndex);
    const expectedShortfall = tailReturns.length > 0 ? 
      -(tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length) * Math.sqrt(timeHorizon) : 0;
    
    return {
      var: var95,
      expectedShortfall
    };
  }

  // === UTILITY METHODS ===

  private static calculatePortfolioVolatility(
    assets: PortfolioAsset[],
    correlationMatrix?: number[][]
  ): number {
    const n = assets.length;
    const weights = assets.map(asset => asset.weight);
    const volatilities = assets.map(asset => asset.volatility);
    
    // Use provided correlation matrix or assume no correlation
    const corrMatrix = correlationMatrix || Array(n).fill(null).map(() => Array(n).fill(0.3));
    
    // Fill diagonal with 1s
    for (let i = 0; i < n; i++) {
      corrMatrix[i][i] = 1;
    }
    
    let portfolioVariance = 0;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        portfolioVariance += weights[i] * weights[j] * volatilities[i] * volatilities[j] * corrMatrix[i][j];
      }
    }
    
    return Math.sqrt(portfolioVariance);
  }

  private static generateCorrelationMatrix(n: number): number[][] {
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          // Generate random correlation between -0.5 and 0.5
          matrix[i][j] = matrix[j][i] = (Math.random() - 0.5);
        }
      }
    }
    
    return matrix;
  }

  private static optimizeForTargetReturn(
    returns: number[],
    volatilities: number[],
    correlationMatrix: number[][],
    targetReturn: number,
    constraints?: { minWeight?: number; maxWeight?: number }
  ): { weights: number[]; expectedReturn: number; volatility: number } | null {
    const n = returns.length;
    const minWeight = constraints?.minWeight || 0;
    const maxWeight = constraints?.maxWeight || 1;
    
    // Simplified quadratic programming solution
    // This is a basic implementation - real optimization would use more sophisticated methods
    const weights = this.solveQuadraticProgramming(returns, volatilities, correlationMatrix, targetReturn, minWeight, maxWeight);
    
    if (!weights) return null;
    
    const expectedReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);
    const volatility = this.calculateVolatilityFromWeights(weights, volatilities, correlationMatrix);
    
    return { weights, expectedReturn, volatility };
  }

  private static solveQuadraticProgramming(
    returns: number[],
    volatilities: number[],
    correlationMatrix: number[][],
    targetReturn: number,
    minWeight: number,
    maxWeight: number
  ): number[] | null {
    const n = returns.length;
    
    // Simplified approach: Equal weight with adjustments
    let weights = Array(n).fill(1 / n);
    
    // Iterative adjustment to meet target return
    for (let iter = 0; iter < 100; iter++) {
      const currentReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);
      const returnDiff = targetReturn - currentReturn;
      
      if (Math.abs(returnDiff) < 0.001) break;
      
      // Adjust weights proportionally
      const totalAdjustment = returnDiff / n;
      for (let i = 0; i < n; i++) {
        weights[i] += totalAdjustment * (returns[i] / Math.max(...returns));
        weights[i] = Math.max(minWeight, Math.min(maxWeight, weights[i]));
      }
      
      // Normalize weights
      const weightSum = weights.reduce((sum, w) => sum + w, 0);
      weights = weights.map(w => w / weightSum);
    }
    
    return weights;
  }

  private static calculateVolatilityFromWeights(
    weights: number[],
    volatilities: number[],
    correlationMatrix: number[][]
  ): number {
    const n = weights.length;
    let portfolioVariance = 0;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        portfolioVariance += weights[i] * weights[j] * volatilities[i] * volatilities[j] * correlationMatrix[i][j];
      }
    }
    
    return Math.sqrt(portfolioVariance);
  }

  private static boxMullerRandom(): number {
    // Box-Muller transformation for normal random numbers
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private static normalPDF(x: number): number {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  }

  private static erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  private static calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = returns[0];
    
    for (let i = 1; i < returns.length; i++) {
      if (returns[i] > peak) {
        peak = returns[i];
      } else {
        const drawdown = (peak - returns[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  }

  private static calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    const covariance = assetReturns.reduce((sum, r, i) => 
      sum + (r - assetMean) * (marketReturns[i] - marketMean), 0) / (assetReturns.length - 1);
    const marketVariance = marketReturns.reduce((sum, r) => 
      sum + Math.pow(r - marketMean, 2), 0) / (marketReturns.length - 1);
    
    return covariance / marketVariance;
  }

  private static linspace(start: number, stop: number, num: number): number[] {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + step * i);
  }
}