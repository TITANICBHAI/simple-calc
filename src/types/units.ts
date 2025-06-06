
export interface Unit {
  name: string; // e.g., "Meter", "Kilogram"
  symbol: string; // e.g., "m", "kg"
  // Factor to convert from this unit TO the category's base unit
  // e.g., for Kilometer, factor would be 1000 (1 km = 1000 m, if meter is base)
  // e.g., for Centimeter, factor would be 0.01 (1 cm = 0.01 m, if meter is base)
  toBaseFactor: number; 
  // Factor to convert FROM the category's base unit TO this unit
  // e.g., for Kilometer, factor would be 0.001 (1 m = 0.001 km)
  // e.g., for Centimeter, factor would be 100 (1m = 100 cm)
  fromBaseFactor: number;
  offset?: number; // For units like Celsius/Fahrenheit (for base unit conversion)
  displayOffset?: number; // For direct conversion between temperature scales
}

export interface UnitCategory {
  name: string; // e.g., "Length", "Mass"
  baseUnitSymbol: string; // The symbol of the base unit for this category (e.g., "m" for Length)
  units: Unit[];
}
