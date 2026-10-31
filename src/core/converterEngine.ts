import { UnitCategory } from '../types';

export interface CategoryInfo {
  name: UnitCategory;
  units: string[];
  baseUnit: string;
  symbols: Record<string, string>;
  factors?: Record<string, number>;
}

export const CONVERSION_CATEGORIES: Record<UnitCategory, CategoryInfo> = {
  Length: {
    name: 'Length',
    baseUnit: 'Meters',
    units: [
      'Kilometers',
      'Meters',
      'Centimeters',
      'Millimeters',
      'Miles',
      'Yards',
      'Feet',
      'Inches',
    ],
    symbols: {
      Kilometers: 'km',
      Meters: 'm',
      Centimeters: 'cm',
      Millimeters: 'mm',
      Miles: 'mi',
      Yards: 'yd',
      Feet: 'ft',
      Inches: 'in',
    },
    factors: {
      Kilometers: 1000.0,
      Meters: 1.0,
      Centimeters: 0.01,
      Millimeters: 0.001,
      Miles: 1609.344,
      Yards: 0.9144,
      Feet: 0.3048,
      Inches: 0.0254,
    },
  },
  Weight: {
    name: 'Weight',
    baseUnit: 'Kilograms',
    units: ['Kilograms', 'Grams', 'Milligrams', 'Pounds', 'Ounces'],
    symbols: {
      Kilograms: 'kg',
      Grams: 'g',
      Milligrams: 'mg',
      Pounds: 'lb',
      Ounces: 'oz',
    },
    factors: {
      Kilograms: 1.0,
      Grams: 0.001,
      Milligrams: 0.000001,
      Pounds: 0.45359237,
      Ounces: 0.028349523125,
    },
  },
  Temperature: {
    name: 'Temperature',
    baseUnit: 'Celsius',
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    symbols: {
      Celsius: '°C',
      Fahrenheit: '°F',
      Kelvin: 'K',
    },
  },
  Speed: {
    name: 'Speed',
    baseUnit: 'Meters/second',
    units: ['Kilometers/hour', 'Miles/hour', 'Meters/second', 'Knots'],
    symbols: {
      'Kilometers/hour': 'km/h',
      'Miles/hour': 'mph',
      'Meters/second': 'm/s',
      Knots: 'kn',
    },
    factors: {
      'Kilometers/hour': 1000.0 / 3600.0,
      'Miles/hour': 1609.344 / 3600.0,
      'Meters/second': 1.0,
      Knots: 1852.0 / 3600.0,
    },
  },
  Time: {
    name: 'Time',
    baseUnit: 'Seconds',
    units: ['Seconds', 'Minutes', 'Hours', 'Days', 'Weeks'],
    symbols: {
      Seconds: 's',
      Minutes: 'min',
      Hours: 'h',
      Days: 'd',
      Weeks: 'wk',
    },
    factors: {
      Seconds: 1.0,
      Minutes: 60.0,
      Hours: 3600.0,
      Days: 86400.0,
      Weeks: 604800.0,
    },
  },
  Area: {
    name: 'Area',
    baseUnit: 'Square meters',
    units: ['Square meters', 'Square kilometers', 'Square feet', 'Acres', 'Hectares'],
    symbols: {
      'Square meters': 'm²',
      'Square kilometers': 'km²',
      'Square feet': 'ft²',
      Acres: 'ac',
      Hectares: 'ha',
    },
    factors: {
      'Square meters': 1.0,
      'Square kilometers': 1000000.0,
      'Square feet': 0.09290304,
      Acres: 4046.8564224,
      Hectares: 10000.0,
    },
  },
  Volume: {
    name: 'Volume',
    baseUnit: 'Liters',
    units: ['Liters', 'Milliliters', 'Cubic meters', 'Gallons', 'Cups'],
    symbols: {
      Liters: 'L',
      Milliliters: 'mL',
      'Cubic meters': 'm³',
      Gallons: 'gal',
      Cups: 'cup',
    },
    factors: {
      Liters: 1.0,
      Milliliters: 0.001,
      'Cubic meters': 1000.0,
      Gallons: 3.785411784,
      Cups: 0.2365882365,
    },
  },
};

export function convertUnits(
  category: UnitCategory,
  value: number,
  fromUnit: string,
  toUnit: string
): { success: boolean; result?: number; formula?: string; error?: string } {
  if (isNaN(value)) {
    return { success: false, error: 'Input must be a valid numeric value' };
  }

  const catData = CONVERSION_CATEGORIES[category];
  if (!catData) {
    return { success: false, error: `Invalid category: ${category}` };
  }

  if (fromUnit === toUnit) {
    return {
      success: true,
      result: value,
      formula: `1 ${fromUnit} = 1 ${toUnit}`,
    };
  }

  // Handle Temperature
  if (category === 'Temperature') {
    if (fromUnit === 'Kelvin' && value < 0) {
      return { success: false, error: 'Kelvin cannot be below Absolute Zero (0 K)' };
    }

    let celsius = value;
    if (fromUnit === 'Fahrenheit') {
      celsius = (value - 32) * (5 / 9);
    } else if (fromUnit === 'Kelvin') {
      celsius = value - 273.15;
    }

    let converted = celsius;
    if (toUnit === 'Fahrenheit') {
      converted = celsius * (9 / 5) + 32;
    } else if (toUnit === 'Kelvin') {
      converted = celsius + 273.15;
    }

    if (toUnit === 'Kelvin' && converted < 0) {
      return { success: false, error: 'Result is below Absolute Zero (0 K)' };
    }

    const formulaMap: Record<string, string> = {
      'Celsius->Fahrenheit': `(${value}°C × 9/5) + 32 = ${converted.toFixed(4)}°F`,
      'Fahrenheit->Celsius': `(${value}°F - 32) × 5/9 = ${converted.toFixed(4)}°C`,
      'Celsius->Kelvin': `${value}°C + 273.15 = ${converted.toFixed(4)}K`,
      'Kelvin->Celsius': `${value}K - 273.15 = ${converted.toFixed(4)}°C`,
      'Fahrenheit->Kelvin': `(${value}°F - 32) × 5/9 + 273.15 = ${converted.toFixed(4)}K`,
      'Kelvin->Fahrenheit': `(${value}K - 273.15) × 9/5 + 32 = ${converted.toFixed(4)}°F`,
    };

    const key = `${fromUnit}->${toUnit}`;
    return {
      success: true,
      result: converted,
      formula: formulaMap[key] || `${value} ${fromUnit} = ${converted.toFixed(4)} ${toUnit}`,
    };
  }

  // Standard Linear Factors
  const factors = catData.factors;
  if (!factors || !factors[fromUnit] || !factors[toUnit]) {
    return { success: false, error: `Invalid units for ${category}` };
  }

  const fromFactor = factors[fromUnit];
  const toFactor = factors[toUnit];
  const baseValue = value * fromFactor;
  const result = baseValue / toFactor;
  const ratio = fromFactor / toFactor;

  const formula = `1 ${fromUnit} = ${ratio < 0.0001 || ratio > 10000 ? ratio.toExponential(4) : ratio.toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`;

  return {
    success: true,
    result,
    formula,
  };
}
