
/**
 * @fileOverview A Genkit flow for currency conversion.
 * This uses an expanded set of mock data and can attempt cross-conversions via USD.
 *
 * - convertCurrency - A function that handles the currency conversion.
 * - CurrencyConversionInput - The input type for the convertCurrency function.
 * - CurrencyConversionOutput - The return type for the convertCurrency function.
 */

import { z } from 'zod'; // Import Zod directly

// Define a schema for the input of the currency conversion flow
const CurrencyConversionInputSchema = z.object({
  amount: z.number().positive().describe('The amount of money to convert.'),
  sourceCurrency: z.string().min(3).max(3).describe('The source currency code (e.g., USD).'),
  targetCurrency: z.string().min(3).max(3).describe('The target currency code (e.g., EUR).'),
});
export type CurrencyConversionInput = z.infer<typeof CurrencyConversionInputSchema>;

// Define a schema for the output of the currency conversion flow
const CurrencyConversionOutputSchema = z.object({
  convertedAmount: z.number().optional().describe('The converted amount in the target currency.'),
  rate: z.number().optional().describe('The conversion rate used.'),
  message: z.string().optional().describe('A message about the conversion, e.g., if it is mocked or how it was derived.')
});
export type CurrencyConversionOutput = z.infer<typeof CurrencyConversionOutputSchema>;

// Mock exchange rates to USD. In a real app, these would come from an API.
const mockRatesToUSD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08, // 1 EUR = 1.08 USD
  JPY: 0.0064, // 1 JPY = 0.0064 USD
  GBP: 1.27, // 1 GBP = 1.27 USD
  INR: 0.012, // 1 INR = 0.012 USD
  AUD: 0.66, // 1 AUD = 0.66 USD
  CAD: 0.73, // 1 CAD = 0.73 USD
  CHF: 1.11, // 1 CHF = 1.11 USD
  CNY: 0.14, // 1 CNY = 0.14 USD
  NZD: 0.61, // 1 NZD = 0.61 USD
  SGD: 0.74, // 1 SGD = 0.74 USD
  BRL: 0.20, // 1 BRL = 0.20 USD
  ZAR: 0.053, // 1 ZAR = 0.053 USD
  // Add more currencies as needed
};

// This function performs the mock conversion logic directly.
async function performMockCurrencyConversion(input: CurrencyConversionInput): Promise<CurrencyConversionOutput> {
  const { amount, sourceCurrency, targetCurrency } = input;

  if (sourceCurrency === targetCurrency) {
    return {
      convertedAmount: amount,
      rate: 1,
      message: `1 ${sourceCurrency} = 1 ${targetCurrency} (Same currency). Rates are for demonstration.`,
    };
  }

  const sourceToUsdRate = mockRatesToUSD[sourceCurrency];
  const targetToUsdRate = mockRatesToUSD[targetCurrency];

  if (sourceToUsdRate && targetToUsdRate) {
    // Convert source to USD, then USD to target
    const amountInUSD = amount * sourceToUsdRate;
    const convertedAmount = amountInUSD / targetToUsdRate;
    const effectiveRate = sourceToUsdRate / targetToUsdRate; // Overall rate from source to target
    
    return {
      convertedAmount,
      rate: effectiveRate,
      message: `Mock rate (derived via USD): 1 ${sourceCurrency} ≈ ${effectiveRate.toFixed(4)} ${targetCurrency}. Rates are for demonstration.`,
    };
  } else {
    let missingCurrencies = [];
    if (!sourceToUsdRate) missingCurrencies.push(sourceCurrency);
    if (!targetToUsdRate) missingCurrencies.push(targetCurrency);
    
    return {
      // convertedAmount: undefined, // Explicitly undefined
      // rate: undefined, // Explicitly undefined
      message: `Mock rate for ${missingCurrencies.join(' and ')} not available. Current rates are for demonstration only.`,
    };
  }
}

// Exported function to be called by client components.
// This function directly invokes the local mock logic.
export async function convertCurrency(input: CurrencyConversionInput): Promise<CurrencyConversionOutput> {
  // For a static build, we directly call the local logic.
  // Any Genkit specific `ai.defineFlow` or `ai.definePrompt` should be avoided here for pure static export.
  return performMockCurrencyConversion(input);
}
