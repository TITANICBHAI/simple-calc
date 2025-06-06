"use client";
import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertCurrency, type CurrencyConversionInput, type CurrencyConversionOutput } from '@/ai/flows/currency-converter-flow';

// Expanded list of currencies for UI, matching the flow's capabilities
const currencies = [
	{ code: 'USD', name: 'US Dollar' },
	{ code: 'EUR', name: 'Euro' },
	{ code: 'JPY', name: 'Japanese Yen' },
	{ code: 'GBP', name: 'British Pound' },
	{ code: 'AUD', name: 'Australian Dollar' },
	{ code: 'CAD', name: 'Canadian Dollar' },
	{ code: 'CHF', name: 'Swiss Franc' },
	{ code: 'CNY', name: 'Chinese Yuan' },
	{ code: 'INR', name: 'Indian Rupee' },
	{ code: 'NZD', name: 'New Zealand Dollar' },
	{ code: 'SGD', name: 'Singapore Dollar' },
	{ code: 'BRL', name: 'Brazilian Real' },
	{ code: 'ZAR', name: 'South African Rand' },
];

const CurrencyConverter: React.FC = () => {
	const [amount, setAmount] = useState<string>('');
	const [fromCurrency, setFromCurrency] = useState<string>('USD');
	const [toCurrency, setToCurrency] = useState<string>('EUR');
	const [result, setResult] = useState<CurrencyConversionOutput | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { toast } = useToast();

	const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (/^\d*\.?\d*$/.test(value)) {
			setAmount(value);
		}
	};

	const handleSwapCurrencies = () => {
		const temp = fromCurrency;
		setFromCurrency(toCurrency);
		setToCurrency(temp);
		setResult(null);
	};

	const handleSubmit = async () => {
		if (!amount || parseFloat(amount) <= 0) {
			toast({ title: 'Invalid Amount', description: 'Please enter a valid amount to convert.', variant: 'destructive' });
			return;
		}
		if (fromCurrency === toCurrency) {
			setResult({
				convertedAmount: parseFloat(amount),
				rate: 1,
				message: `1 ${fromCurrency} = 1 ${toCurrency} (Same currency). Rates are for demonstration.`,
			});
			return;
		}

		setIsLoading(true);
		setResult(null);

		try {
			const input: CurrencyConversionInput = {
				amount: parseFloat(amount),
				sourceCurrency: fromCurrency,
				targetCurrency: toCurrency,
			};
			const conversionResult = await convertCurrency(input);
			setResult(conversionResult);
			if (conversionResult.convertedAmount !== undefined && conversionResult.convertedAmount !== null) {
				toast({
					title: 'Conversion Successful',
					description: `${amount} ${fromCurrency} is approx. ${conversionResult.convertedAmount?.toFixed(2)} ${toCurrency}. ${conversionResult.message || ''}`,
					duration: 5000,
				});
			} else {
				toast({ title: 'Conversion Info', description: conversionResult.message || 'Could not perform conversion.', variant: 'default', duration: 5000 });
			}
		} catch (error) {
			console.error('Currency conversion error:', error);
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
			toast({ title: 'Conversion Error', description: `Could not fetch conversion rates. ${errorMessage}`, variant: 'destructive' });
			setResult({ message: `Error: Could not process conversion. ${errorMessage}` });
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setAmount('');
		setFromCurrency('USD');
		setToCurrency('EUR');
		setResult(null);
		setIsLoading(false);
		toast({ title: 'Currency Converter Reset', description: 'Fields cleared.' });
	};

	return (
		<Card className="w-full shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center text-xl">
					<ArrowRightLeft className="mr-2 h-6 w-6 text-accent" />
					Currency Converter
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
					<Input
						id="amount"
						type="text"
						inputMode="decimal"
						value={amount}
						onChange={handleAmountChange}
						placeholder="100.00"
						aria-label="Amount to convert"
					/>
				</div>

				<div className="flex items-end space-x-2">
					<div className="flex-1">
						<Label htmlFor="fromCurrency" className="text-sm font-medium">From</Label>
						<Select value={fromCurrency} onValueChange={(value) => { setFromCurrency(value); setResult(null); }}>
							<SelectTrigger id="fromCurrency" aria-label="Source currency">
								<SelectValue placeholder="Select currency" />
							</SelectTrigger>
							<SelectContent>
								{currencies.map(c => (
									<SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button variant="ghost" size="icon" onClick={handleSwapCurrencies} aria-label="Swap currencies" className="mb-1">
						<RefreshCw className="h-5 w-5 text-muted-foreground hover:text-accent" />
					</Button>

					<div className="flex-1">
						<Label htmlFor="toCurrency" className="text-sm font-medium">To</Label>
						<Select value={toCurrency} onValueChange={(value) => { setToCurrency(value); setResult(null); }}>
							<SelectTrigger id="toCurrency" aria-label="Target currency">
								<SelectValue placeholder="Select currency" />
							</SelectTrigger>
							<SelectContent>
								{currencies.map(c => (
									<SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<Button onClick={handleSubmit} disabled={isLoading} className="w-full">
					{isLoading ? 'Converting...' : 'Convert'}
				</Button>

				{result && (
					<div className="space-y-2 pt-3 border-t border-border mt-4">
						{result.convertedAmount !== undefined && result.convertedAmount !== null && (
							<p className="text-2xl font-bold text-accent text-center">
								{result.convertedAmount.toFixed(2)} {toCurrency}
							</p>
						)}
						{result.message && (
							<p className="text-sm text-muted-foreground text-center px-2">{result.message}</p>
						)}
						<p className="text-xs text-muted-foreground text-center pt-2">
							Note: Displayed rates are for demonstration purposes only and may not reflect real-time market values.
						</p>
					</div>
				)}
				{!result && (
					<p className="text-xs text-muted-foreground text-center pt-2">
						Enter an amount and select currencies to convert. Rates are for demonstration.
					</p>
				)}
			</CardContent>
			<CardFooter>
				<Button variant="outline" onClick={handleReset} className="w-full">
					Reset
				</Button>
				<ins className="adsbygoogle"
					style={{ display: 'block', textAlign: 'center' }}
					data-ad-client="ca-pub-1074051846339488"
					data-ad-slot="8922282796"
					data-ad-format="auto"
					data-full-width-responsive="true"></ins>
				<script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
			</CardFooter>
		</Card>
	);
};

export default CurrencyConverter;
