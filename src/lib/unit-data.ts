
import type { UnitCategory } from '@/types/units';

export const lengthUnits: UnitCategory = {
  name: 'Length',
  baseUnitSymbol: 'm',
  units: [
    { name: 'Meter', symbol: 'm', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Kilometer', symbol: 'km', toBaseFactor: 1000, fromBaseFactor: 0.001 },
    { name: 'Centimeter', symbol: 'cm', toBaseFactor: 0.01, fromBaseFactor: 100 },
    { name: 'Millimeter', symbol: 'mm', toBaseFactor: 0.001, fromBaseFactor: 1000 },
    { name: 'Micrometer', symbol: 'µm', toBaseFactor: 1e-6, fromBaseFactor: 1e6 },
    { name: 'Nanometer', symbol: 'nm', toBaseFactor: 1e-9, fromBaseFactor: 1e9 },
    { name: 'Mile', symbol: 'mi', toBaseFactor: 1609.34, fromBaseFactor: 1 / 1609.34 },
    { name: 'Yard', symbol: 'yd', toBaseFactor: 0.9144, fromBaseFactor: 1 / 0.9144 },
    { name: 'Foot', symbol: 'ft', toBaseFactor: 0.3048, fromBaseFactor: 1 / 0.3048 },
    { name: 'Inch', symbol: 'in', toBaseFactor: 0.0254, fromBaseFactor: 1 / 0.0254 },
    { name: 'Nautical Mile', symbol: 'nmi', toBaseFactor: 1852, fromBaseFactor: 1 / 1852 },
  ],
};

export const massUnits: UnitCategory = {
  name: 'Mass',
  baseUnitSymbol: 'kg',
  units: [
    { name: 'Kilogram', symbol: 'kg', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Gram', symbol: 'g', toBaseFactor: 0.001, fromBaseFactor: 1000 },
    { name: 'Milligram', symbol: 'mg', toBaseFactor: 1e-6, fromBaseFactor: 1e6 },
    { name: 'Microgram', symbol: 'µg', toBaseFactor: 1e-9, fromBaseFactor: 1e9 },
    { name: 'Metric Ton', symbol: 't', toBaseFactor: 1000, fromBaseFactor: 0.001 },
    { name: 'Pound', symbol: 'lb', toBaseFactor: 0.45359237, fromBaseFactor: 1 / 0.45359237 },
    { name: 'Ounce', symbol: 'oz', toBaseFactor: 0.0283495231, fromBaseFactor: 1 / 0.0283495231 },
    { name: 'Carat', symbol: 'ct', toBaseFactor: 0.0002, fromBaseFactor: 5000 },
  ],
};

export const temperatureUnits: UnitCategory = {
  name: 'Temperature',
  baseUnitSymbol: '°C', // Celsius as base for inter-conversion for the logic in SingleUnitConverter
  units: [
    { name: 'Celsius', symbol: '°C', toBaseFactor: 1, fromBaseFactor: 1, offset: 0 },
    { name: 'Fahrenheit', symbol: '°F', toBaseFactor: 5/9, fromBaseFactor: 9/5, offset: -32 }, // (F - 32) * 5/9 = C
    { name: 'Kelvin', symbol: 'K', toBaseFactor: 1, fromBaseFactor: 1, offset: -273.15 }, // K - 273.15 = C
  ],
};


export const dataStorageUnits: UnitCategory = {
  name: 'Data Storage',
  baseUnitSymbol: 'B', // Byte as base
  units: [
    { name: 'Bit', symbol: 'bit', toBaseFactor: 1/8, fromBaseFactor: 8 },
    { name: 'Byte', symbol: 'B', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Kilobyte (10³)', symbol: 'KB', toBaseFactor: 1000, fromBaseFactor: 1/1000 },
    { name: 'Megabyte (10⁶)', symbol: 'MB', toBaseFactor: 1000**2, fromBaseFactor: 1/(1000**2) },
    { name: 'Gigabyte (10⁹)', symbol: 'GB', toBaseFactor: 1000**3, fromBaseFactor: 1/(1000**3) },
    { name: 'Terabyte (10¹²)', symbol: 'TB', toBaseFactor: 1000**4, fromBaseFactor: 1/(1000**4) },
    { name: 'Petabyte (10¹⁵)', symbol: 'PB', toBaseFactor: 1000**5, fromBaseFactor: 1/(1000**5) },
    { name: 'Kibibyte (2¹⁰)', symbol: 'KiB', toBaseFactor: 1024, fromBaseFactor: 1/1024 },
    { name: 'Mebibyte (2²⁰)', symbol: 'MiB', toBaseFactor: 1024**2, fromBaseFactor: 1/(1024**2) },
    { name: 'Gibibyte (2³⁰)', symbol: 'GiB', toBaseFactor: 1024**3, fromBaseFactor: 1/(1024**3) },
    { name: 'Tebibyte (2⁴⁰)', symbol: 'TiB', toBaseFactor: 1024**4, fromBaseFactor: 1/(1024**4) },
    { name: 'Pebibyte (2⁵⁰)', symbol: 'PiB', toBaseFactor: 1024**5, fromBaseFactor: 1/(1024**5) },
  ],
};

export const speedUnits: UnitCategory = {
    name: "Speed",
    baseUnitSymbol: "m/s",
    units: [
        { name: "Meter per second", symbol: "m/s", toBaseFactor: 1, fromBaseFactor: 1 },
        { name: "Kilometer per hour", symbol: "km/h", toBaseFactor: 1000 / 3600, fromBaseFactor: 3600 / 1000 },
        { name: "Mile per hour", symbol: "mph", toBaseFactor: 0.44704, fromBaseFactor: 1 / 0.44704 },
        { name: "Foot per second", symbol: "ft/s", toBaseFactor: 0.3048, fromBaseFactor: 1 / 0.3048 },
        { name: "Knot", symbol: "kn", toBaseFactor: 0.514444, fromBaseFactor: 1 / 0.514444 },
        { name: "Mach (ISA SL)", symbol: "Mach", toBaseFactor: 340.3, fromBaseFactor: 1 / 340.3 }, // Approx. speed of sound at sea level
    ],
};

export const areaUnits: UnitCategory = {
  name: 'Area',
  baseUnitSymbol: 'm²',
  units: [
    { name: 'Square Meter', symbol: 'm²', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Square Kilometer', symbol: 'km²', toBaseFactor: 1000000, fromBaseFactor: 1 / 1000000 },
    { name: 'Square Centimeter', symbol: 'cm²', toBaseFactor: 0.0001, fromBaseFactor: 10000 },
    { name: 'Square Millimeter', symbol: 'mm²', toBaseFactor: 0.000001, fromBaseFactor: 1000000 },
    { name: 'Square Mile', symbol: 'mi²', toBaseFactor: 2589988.11, fromBaseFactor: 1 / 2589988.11 },
    { name: 'Square Yard', symbol: 'yd²', toBaseFactor: 0.836127, fromBaseFactor: 1 / 0.836127 },
    { name: 'Square Foot', symbol: 'ft²', toBaseFactor: 0.092903, fromBaseFactor: 1 / 0.092903 },
    { name: 'Square Inch', symbol: 'in²', toBaseFactor: 0.00064516, fromBaseFactor: 1 / 0.00064516 },
    { name: 'Hectare', symbol: 'ha', toBaseFactor: 10000, fromBaseFactor: 1 / 10000 },
    { name: 'Acre', symbol: 'acre', toBaseFactor: 4046.8564224, fromBaseFactor: 1 / 4046.8564224 },
  ],
};

export const volumeUnits: UnitCategory = {
  name: 'Volume',
  baseUnitSymbol: 'L', // Liter as base
  units: [
    { name: 'Liter', symbol: 'L', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Milliliter', symbol: 'mL', toBaseFactor: 0.001, fromBaseFactor: 1000 },
    { name: 'Cubic Meter', symbol: 'm³', toBaseFactor: 1000, fromBaseFactor: 0.001 },
    { name: 'Cubic Centimeter', symbol: 'cm³', toBaseFactor: 0.001, fromBaseFactor: 1000 }, // Same as mL
    { name: 'Cubic Millimeter', symbol: 'mm³', toBaseFactor: 0.000001, fromBaseFactor: 1000000 },
    { name: 'Gallon (US)', symbol: 'gal (US)', toBaseFactor: 3.78541, fromBaseFactor: 1 / 3.78541 },
    { name: 'Quart (US liquid)', symbol: 'qt (US)', toBaseFactor: 0.946353, fromBaseFactor: 1 / 0.946353 },
    { name: 'Pint (US liquid)', symbol: 'pt (US)', toBaseFactor: 0.473176, fromBaseFactor: 1 / 0.473176 },
    { name: 'Fluid Ounce (US)', symbol: 'fl oz (US)', toBaseFactor: 0.0295735, fromBaseFactor: 1 / 0.0295735 },
    { name: 'Tablespoon (US)', symbol: 'tbsp (US)', toBaseFactor: 0.0147868, fromBaseFactor: 1 / 0.0147868 },
    { name: 'Teaspoon (US)', symbol: 'tsp (US)', toBaseFactor: 0.00492892, fromBaseFactor: 1 / 0.00492892 },
    { name: 'Cubic Foot', symbol: 'ft³', toBaseFactor: 28.3168, fromBaseFactor: 1 / 28.3168 },
    { name: 'Cubic Inch', symbol: 'in³', toBaseFactor: 0.0163871, fromBaseFactor: 1 / 0.0163871 },
    { name: 'Gallon (Imperial)', symbol: 'gal (Imp)', toBaseFactor: 4.54609, fromBaseFactor: 1 / 4.54609 },
  ],
};

export const timeUnits: UnitCategory = {
  name: 'Time',
  baseUnitSymbol: 's', // Second as base
  units: [
    { name: 'Second', symbol: 's', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Millisecond', symbol: 'ms', toBaseFactor: 0.001, fromBaseFactor: 1000 },
    { name: 'Microsecond', symbol: 'µs', toBaseFactor: 1e-6, fromBaseFactor: 1e6 },
    { name: 'Nanosecond', symbol: 'ns', toBaseFactor: 1e-9, fromBaseFactor: 1e9 },
    { name: 'Minute', symbol: 'min', toBaseFactor: 60, fromBaseFactor: 1 / 60 },
    { name: 'Hour', symbol: 'hr', toBaseFactor: 3600, fromBaseFactor: 1 / 3600 },
    { name: 'Day', symbol: 'day', toBaseFactor: 86400, fromBaseFactor: 1 / 86400 },
    { name: 'Week', symbol: 'wk', toBaseFactor: 604800, fromBaseFactor: 1 / 604800 },
    { name: 'Month (avg 30.44 days)', symbol: 'mo', toBaseFactor: 2629746, fromBaseFactor: 1 / 2629746 }, // Avg days in month
    { name: 'Year (avg 365.24 days)', symbol: 'yr', toBaseFactor: 31556952, fromBaseFactor: 1 / 31556952 }, // Avg days in year
  ],
};

export const energyUnits: UnitCategory = {
  name: 'Energy',
  baseUnitSymbol: 'J',
  units: [
    { name: 'Joule', symbol: 'J', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Kilojoule', symbol: 'kJ', toBaseFactor: 1000, fromBaseFactor: 0.001 },
    { name: 'Megajoule', symbol: 'MJ', toBaseFactor: 1e6, fromBaseFactor: 1e-6 },
    { name: 'Calorie (thermochemical)', symbol: 'cal', toBaseFactor: 4.184, fromBaseFactor: 1 / 4.184 },
    { name: 'Kilocalorie (food Calorie)', symbol: 'kcal', toBaseFactor: 4184, fromBaseFactor: 1 / 4184 },
    { name: 'Watt-hour', symbol: 'Wh', toBaseFactor: 3600, fromBaseFactor: 1 / 3600 },
    { name: 'Kilowatt-hour', symbol: 'kWh', toBaseFactor: 3.6e6, fromBaseFactor: 1 / 3.6e6 },
    { name: 'Electronvolt', symbol: 'eV', toBaseFactor: 1.602176634e-19, fromBaseFactor: 1 / 1.602176634e-19 },
    { name: 'British Thermal Unit (BTU)', symbol: 'BTU', toBaseFactor: 1055.05585262, fromBaseFactor: 1 / 1055.05585262 },
    { name: 'Foot-pound', symbol: 'ft·lb', toBaseFactor: 1.3558179483, fromBaseFactor: 1 / 1.3558179483 },
  ],
};

export const powerUnits: UnitCategory = {
  name: 'Power',
  baseUnitSymbol: 'W',
  units: [
    { name: 'Watt', symbol: 'W', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Kilowatt', symbol: 'kW', toBaseFactor: 1000, fromBaseFactor: 0.001 },
    { name: 'Megawatt', symbol: 'MW', toBaseFactor: 1e6, fromBaseFactor: 1e-6 },
    { name: 'Gigawatt', symbol: 'GW', toBaseFactor: 1e9, fromBaseFactor: 1e-9 },
    { name: 'Horsepower (mechanical)', symbol: 'hp', toBaseFactor: 745.699872, fromBaseFactor: 1 / 745.699872 },
    { name: 'Horsepower (metric)', symbol: 'hp (M)', toBaseFactor: 735.49875, fromBaseFactor: 1 / 735.49875 },
    { name: 'Foot-pound/minute', symbol: 'ft·lb/min', toBaseFactor: 0.0225969658, fromBaseFactor: 1 / 0.0225969658 },
    { name: 'BTU/hour', symbol: 'BTU/hr', toBaseFactor: 0.29307107017, fromBaseFactor: 1 / 0.29307107017 },
  ],
};

export const pressureUnits: UnitCategory = {
  name: 'Pressure',
  baseUnitSymbol: 'Pa',
  units: [
    { name: 'Pascal', symbol: 'Pa', toBaseFactor: 1, fromBaseFactor: 1 },
    { name: 'Kilopascal', symbol: 'kPa', toBaseFactor: 1000, fromBaseFactor: 0.001 },
    { name: 'Megapascal', symbol: 'MPa', toBaseFactor: 1e6, fromBaseFactor: 1e-6 },
    { name: 'Hectopascal', symbol: 'hPa', toBaseFactor: 100, fromBaseFactor: 0.01 },
    { name: 'Bar', symbol: 'bar', toBaseFactor: 100000, fromBaseFactor: 0.00001 },
    { name: 'Millibar', symbol: 'mbar', toBaseFactor: 100, fromBaseFactor: 0.01 },
    { name: 'Pound per square inch (PSI)', symbol: 'PSI', toBaseFactor: 6894.75729, fromBaseFactor: 1 / 6894.75729 },
    { name: 'Standard atmosphere (atm)', symbol: 'atm', toBaseFactor: 101325, fromBaseFactor: 1 / 101325 },
    { name: 'Millimeter of mercury (mmHg)', symbol: 'mmHg', toBaseFactor: 133.322387415, fromBaseFactor: 1 / 133.322387415 },
    { name: 'Torr', symbol: 'Torr', toBaseFactor: 133.322368421, fromBaseFactor: 1 / 133.322368421 }, // Historically same as mmHg, slight modern diffs
    { name: 'Inch of mercury (inHg)', symbol: 'inHg', toBaseFactor: 3386.389, fromBaseFactor: 1 / 3386.389 },
  ],
};

export const allUnitCategories: UnitCategory[] = [
  lengthUnits,
  massUnits,
  temperatureUnits,
  dataStorageUnits,
  speedUnits,
  areaUnits,
  volumeUnits,
  timeUnits,
  energyUnits,
  powerUnits,
  pressureUnits,
];
