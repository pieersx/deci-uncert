import { CriterionResult, DecisionResults, PayoffMatrix } from "../types";

/**
 * Calcula el criterio de Pesimista (Maximin)
 * Para beneficios: Selecciona la alternativa con el mejor resultado en el peor caso.
 * Para costos: Selecciona la alternativa con el costo máximo más bajo.
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
    name: `Pesimista ${isCost ? "(Maximin)" : "(Minimax)"}`,
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
 * Calcula el criterio Optimista (Maximax)
 * Para beneficios: Selecciona la alternativa con el mejor resultado posible.
 * Para costos: Selecciona la alternativa con el costo mínimo más bajo.
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
    name: `Optimista ${isCost ? "(Minimix)" : "(Maximax)"}`,
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
 * Calcula el criterio de Hurwicz
 * Promedio ponderado de los mejores y peores resultados según el coeficiente de optimismo
 * H = α (mejor evento) + (1- α) (peor evento)
 */
export const calculateHurwicz = (matrix: PayoffMatrix, alpha: number = 0.5): CriterionResult => {
  const { values } = matrix;
  const hurwiczValues = values.map(row => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    // Para costos, invertimos el coeficiente de optimismo
    return alpha * max + (1 - alpha) * min; // Para ganancias
  });

  const optimalIndex = hurwiczValues.indexOf(Math.max(...hurwiczValues));

  const calculations = values.map((row, index) => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    const value = alpha * max + (1 - alpha) * min;

    return `Alternative ${index + 1}: ${alpha.toFixed(2)} × max{${row.join(", ")}} + ${(1 - alpha).toFixed(2)} × min{${row.join(", ")}} = ${alpha.toFixed(2)} × ${max} + ${(1 - alpha).toFixed(2)} × ${min}} = ${value.toFixed(2)}`;
  });

  return {
    name: "Hurwicz (α=" + alpha.toFixed(2) + ")",
    description:  `Promedio ponderado de la mejor y peor ganancia con coeficiente de optimismo α=${alpha.toFixed(2)}`,
    calculations,
    values: hurwiczValues,
    optimalIndex,
    optimalValue: hurwiczValues[optimalIndex]
  };
};

/**
 * Calcula el criterio de Laplace.
 * Supone que todos los estados son igualmente probables.
 */
export const calculateLaplace = (matrix: PayoffMatrix): CriterionResult => {
  const { values } = matrix;
  const numStates = matrix.states.length;
  const laplaceValues = values.map(row =>
    row.reduce((sum, value) => sum + value, 0) / numStates
  );

  const optimalIndex = laplaceValues.indexOf(Math.max(...laplaceValues));

  const calculations = values.map((row, index) => {
    const avg = row.reduce((sum, value) => sum + value, 0) / numStates;
    return `Alternative ${index + 1}: (${row.join(" + ")}) / ${numStates} = ${avg.toFixed(2)}`;
  });

  return {
    name: "Laplace",
    description: "Asume que todos los estados son igualmente probables (maximiza la ganancia promedio)",
    calculations,
    values: laplaceValues,
    optimalIndex,
    optimalValue: laplaceValues[optimalIndex]
  };
};

/**
 * Calcula la matriz de arrepentimiento (pérdida de oportunidad)
 */
export const calculateRegretMatrix = (matrix: PayoffMatrix): number[][] => {
  const { values } = matrix;
  const numStates = matrix.states.length;
  const regretMatrix: number[][] = [];

  // Para cada estado, encontrar el valor óptimo
  const optimalPerState = Array(numStates).fill(0);
  for (let j = 0; j < numStates; j++) {
    optimalPerState[j] = Math.max(...values.map(row => row[j])); // Para ganancias, el máximo es óptimo
  }

  // Calcular el arrepentimiento para cada alternativa y estado
  for (let i = 0; i < values.length; i++) {
    regretMatrix[i] = [];
    for (let j = 0; j < numStates; j++) {
      regretMatrix[i][j] = optimalPerState[j] - values[i][j]; // Para ganancias
    }
  }

  return regretMatrix;
};

/**
 * Calcula el criterio de arrepentimiento mínimo (Savage)
 * Minimiza el arrepentimiento máximo
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
