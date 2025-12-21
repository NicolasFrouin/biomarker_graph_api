import { Analyte, Observation, Unit } from 'prisma/generated/client';

export const conversions = {
  glucose: {
    'mg/dL->mmol/L': (v: number) => v * 0.0555,
    'mmol/L->mg/dL': (v: number) => v / 0.0555,
  },
  creatinine: {
    'mg/dL->µmol/L': (v: number) => v * 88.4,
    'µmol/L->mg/dL': (v: number) => v / 88.4,
  },
};

/**
 * Converts the observation value to the default unit of the analyte.
 */
export function convertObservationValueToDefaultUnit(
  observation: Observation & {
    analyte: Analyte & { defaultTargetUnit: Unit };
    analyteAllowedUnit: { unit: Unit };
  },
  endUnit?: Unit,
): number {
  const fromUnit = observation.analyteAllowedUnit.unit.name;
  const toUnit = endUnit
    ? endUnit.name
    : observation.analyte.defaultTargetUnit.name;
  if (fromUnit === toUnit) {
    return observation.value;
  }
  const conversionKey = `${fromUnit}->${toUnit}`;
  const conversionFn = conversions[observation.analyte.name]?.[conversionKey];
  if (!conversionFn) {
    throw new Error(
      `No conversion available from ${fromUnit} to ${toUnit} for loinc ${observation.analyte.name}`,
    );
  }
  return conversionFn(observation.value);
}
