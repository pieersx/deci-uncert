import { CriterionResult, DecisionResults, PayoffMatrix } from "../types";

/**
 * Calculates the Maximin criterion (Wald)
 * For profits: Selects the alternative with the best worst-case outcome
 * For costs: Selects the alternative with the lowest maximum cost
 */
export const calculateMaximin = (matrix: PayoffMatrix): CriterionResult => {
  const { values, isCost } = matrix;

  // Para costos, buscamos minimizar el máximo
  // Para ganancias, buscamos maximizar el mínimo
  const relevantValues = isCost
    ? values.map(row => Math.max(...row)) // Para costos, encontramos el máximo de cada fila
    : values.map(row => Math.min(...row)); // Para ganancias, encontramos el mínimo de cada fila

  const optimalIndex = isCost
    ? relevantValues.indexOf(Math.min(...relevantValues)) // Para costos, minimizamos
    : relevantValues.indexOf(Math.max(...relevantValues)); // Para ganancias, maximizamos

  const calculations = values.map((row, index) => {
    const value = isCost ? Math.max(...row) : Math.min(...row);
    return `Alternative ${index + 1}: ${isCost ? 'max' : 'min'}{${row.join(", ")}} = ${value}`;
  });

  return {
    name: "Pesimista (Maximin)",
    description: isCost
      ? "Selecciona la alternativa con el menor costo máximo"
      : "Selecciona la alternativa con la mejor ganancia mínima",
    calculations,
    values: relevantValues,
    optimalIndex,
    optimalValue: relevantValues[optimalIndex]
  };
};

/**
 * Calculates the Maximax criterion
 * For profits: Selects the alternative with the best best-case outcome
 * For costs: Selects the alternative with the lowest minimum cost
 */
export const calculateMaximax = (matrix: PayoffMatrix): CriterionResult => {
  const { values, isCost } = matrix;

  // Para costos, buscamos minimizar el mínimo
  // Para ganancias, buscamos maximizar el máximo
  const relevantValues = isCost
    ? values.map(row => Math.min(...row)) // Para costos, encontramos el mínimo de cada fila
    : values.map(row => Math.max(...row)); // Para ganancias, encontramos el máximo de cada fila

  const optimalIndex = isCost
    ? relevantValues.indexOf(Math.min(...relevantValues)) // Para costos, minimizamos
    : relevantValues.indexOf(Math.max(...relevantValues)); // Para ganancias, maximizamos

  const calculations = values.map((row, index) => {
    const value = isCost ? Math.min(...row) : Math.max(...row);
    return `Alternative ${index + 1}: ${isCost ? 'min' : 'max'}{${row.join(", ")}} = ${value}`;
  });

  return {
    name: "Optimista (Maximax)",
    description: isCost
      ? "Selecciona la alternativa con el menor costo mínimo"
      : "Selecciona la alternativa con la mejor ganancia máxima",
    calculations,
    values: relevantValues,
    optimalIndex,
    optimalValue: relevantValues[optimalIndex]
  };
};

/**
 * Calculates the Hurwicz criterion
 * Weighted average of best and worst outcomes based on optimism coefficient
 */
export const calculateHurwicz = (matrix: PayoffMatrix, alpha: number = 0.5): CriterionResult => {
  const { values, isCost } = matrix;
  const hurwiczValues = values.map(row => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    // Para costos, invertimos el coeficiente de optimismo
    return isCost
      ? alpha * min + (1 - alpha) * max // Para costos
      : alpha * max + (1 - alpha) * min; // Para ganancias
  });

  const optimalIndex = isCost
    ? hurwiczValues.indexOf(Math.min(...hurwiczValues))
    : hurwiczValues.indexOf(Math.max(...hurwiczValues));

  const calculations = values.map((row, index) => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    const value = isCost
      ? alpha * min + (1 - alpha) * max
      : alpha * max + (1 - alpha) * min;
    return `Alternative ${index + 1}: ${isCost ?
      `${alpha.toFixed(2)} × min{${row.join(", ")}} + ${(1 - alpha).toFixed(2)} × max{${row.join(", ")}} = ${alpha.toFixed(2)} × ${min} + ${(1 - alpha).toFixed(2)} × ${max}` :
      `${alpha.toFixed(2)} × max{${row.join(", ")}} + ${(1 - alpha).toFixed(2)} × min{${row.join(", ")}} = ${alpha.toFixed(2)} × ${max} + ${(1 - alpha).toFixed(2)} × ${min}`
    } = ${value.toFixed(2)}`;
  });

  return {
    name: "Hurwicz (α=" + alpha.toFixed(2) + ")",
    description: isCost
      ? `Promedio ponderado del mejor y peor costo con coeficiente de optimismo α=${alpha.toFixed(2)}`
      : `Promedio ponderado de la mejor y peor ganancia con coeficiente de optimismo α=${alpha.toFixed(2)}`,
    calculations,
    values: hurwiczValues,
    optimalIndex,
    optimalValue: hurwiczValues[optimalIndex]
  };
};

/**
 * Calculates the Laplace criterion
 * Assumes all states are equally likely
 */
export const calculateLaplace = (matrix: PayoffMatrix): CriterionResult => {
  const { values, isCost } = matrix;
  const numStates = matrix.states.length;
  const laplaceValues = values.map(row =>
    row.reduce((sum, value) => sum + value, 0) / numStates
  );

  const optimalIndex = isCost
    ? laplaceValues.indexOf(Math.min(...laplaceValues))
    : laplaceValues.indexOf(Math.max(...laplaceValues));

  const calculations = values.map((row, index) => {
    const avg = row.reduce((sum, value) => sum + value, 0) / numStates;
    return `Alternative ${index + 1}: (${row.join(" + ")}) / ${numStates} = ${avg.toFixed(2)}`;
  });

  return {
    name: "Laplace",
    description: isCost
      ? "Asume que todos los estados son igualmente probables (minimiza el costo promedio)"
      : "Asume que todos los estados son igualmente probables (maximiza la ganancia promedio)",
    calculations,
    values: laplaceValues,
    optimalIndex,
    optimalValue: laplaceValues[optimalIndex]
  };
};

/**
 * Calculates the regret (opportunity loss) matrix
 */
export const calculateRegretMatrix = (matrix: PayoffMatrix): number[][] => {
  const { values, isCost } = matrix;
  const numStates = matrix.states.length;
  const regretMatrix: number[][] = [];

  // Para cada estado, encontrar el valor óptimo
  const optimalPerState = Array(numStates).fill(0);
  for (let j = 0; j < numStates; j++) {
    optimalPerState[j] = isCost
      ? Math.min(...values.map(row => row[j])) // Para costos, el mínimo es óptimo
      : Math.max(...values.map(row => row[j])); // Para ganancias, el máximo es óptimo
  }

  // Calcular el arrepentimiento para cada alternativa y estado
  for (let i = 0; i < values.length; i++) {
    regretMatrix[i] = [];
    for (let j = 0; j < numStates; j++) {
      regretMatrix[i][j] = isCost
        ? values[i][j] - optimalPerState[j] // Para costos
        : optimalPerState[j] - values[i][j]; // Para ganancias
    }
  }

  return regretMatrix;
};

/**
 * Calculates the Minimax Regret criterion (Savage)
 * Minimizes the maximum regret
 */
export const calculateMinimaxRegret = (matrix: PayoffMatrix): CriterionResult => {
  const regretMatrix = calculateRegretMatrix(matrix);
  const maxRegrets = regretMatrix.map(row => Math.max(...row));
  const optimalIndex = maxRegrets.indexOf(Math.min(...maxRegrets));

  const calculations = regretMatrix.map((row, index) => {
    const maxRegret = Math.max(...row);
    return `Alternative ${index + 1}: max{${row.join(", ")}} = ${maxRegret}`;
  });

  return {
    name: "Savage",
    description: matrix.isCost
      ? "Minimiza el máximo arrepentimiento (diferencia de costo respecto al óptimo)"
      : "Minimiza el máximo arrepentimiento (pérdida de oportunidad)",
    calculations,
    values: maxRegrets,
    optimalIndex,
    optimalValue: maxRegrets[optimalIndex]
  };
};

/**
 * Calculates all decision criteria for a given payoff matrix
 */
export const calculateAllCriteria = (matrix: PayoffMatrix, alpha: number = 0.5): DecisionResults => {
  const results: CriterionResult[] = [
    calculateLaplace(matrix),
    calculateMaximax(matrix),
    calculateMaximin(matrix),
    calculateHurwicz(matrix, alpha),
    calculateMinimaxRegret(matrix)
  ];

  return {
    matrix,
    results,
    regretMatrix: calculateRegretMatrix(matrix)
  };
};

/**
 * Example decision matrices from class exercises
 */
// export const exampleMatrices: {[key: string]: PayoffMatrix} = {
//   example1: {
//     alternatives: [
//       { id: "a1", name: "Alternative 1" },
//       { id: "a2", name: "Alternative 2" },
//       { id: "a3", name: "Alternative 3" }
//     ],
//     states: [
//       { id: "s1", name: "State 1" },
//       { id: "s2", name: "State 2" },
//       { id: "s3", name: "State 3" },
//       { id: "s4", name: "State 4" }
//     ],
//     values: [
//       [3, 8, 2, 10],
//       [5, 4, 6, 3],
//       [9, 6, 4, 5]
//     ],
//     isCost: false
//   },
//   example2: {
//     alternatives: [
//       { id: "a1", name: "Alternative 1" },
//       { id: "a2", name: "Alternative 2" },
//       { id: "a3", name: "Alternative 3" },
//       { id: "a4", name: "Alternative 4" }
//     ],
//     states: [
//       { id: "s1", name: "State 1" },
//       { id: "s2", name: "State 2" },
//       { id: "s3", name: "State 3" }
//     ],
//     values: [
//       [10, 4, 7],
//       [5, 8, 6],
//       [8, 5, 4],
//       [6, 7, 9]
//     ],
//     isCost: false
//   }
// };
