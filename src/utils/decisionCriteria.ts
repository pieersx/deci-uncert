import { CriterionResult, DecisionResults, PayoffMatrix } from "../types";

/**
 * Calculates the Maximin criterion (Wald)
 * Selects the alternative with the best worst-case outcome
 */
export const calculateMaximin = (matrix: PayoffMatrix): CriterionResult => {
  const { values } = matrix;
  const minValues = values.map(row => Math.min(...row));
  const optimalIndex = minValues.indexOf(Math.max(...minValues));

  const calculations = values.map((row, index) => {
    const min = Math.min(...row);
    return `Alternative ${index + 1}: min{${row.join(", ")}} = ${min}`;
  });

  return {
    name: "Pesimista (Wald)",
    description: "Selecciona la alternativa con el mejor resultado en el peor de los casos.",
    calculations,
    values: minValues,
    optimalIndex,
    optimalValue: minValues[optimalIndex]
  };
};

/**
 * Calculates the Maximax criterion
 * Selects the alternative with the best best-case outcome
 */
export const calculateMaximax = (matrix: PayoffMatrix): CriterionResult => {
  const { values } = matrix;
  const maxValues = values.map(row => Math.max(...row));
  const optimalIndex = maxValues.indexOf(Math.max(...maxValues));

  const calculations = values.map((row, index) => {
    const max = Math.max(...row);
    return `Alternative ${index + 1}: max{${row.join(", ")}} = ${max}`;
  });

  return {
    name: "Optimista",
    description: "Selecciona la alternativa con el mejor resultado posible",
    calculations,
    values: maxValues,
    optimalIndex,
    optimalValue: maxValues[optimalIndex]
  };
};

/**
 * Calculates the Hurwicz criterion
 * Weighted average of best and worst outcomes based on optimism coefficient
 */
export const calculateHurwicz = (matrix: PayoffMatrix, alpha: number = 0.5): CriterionResult => {
  const { values } = matrix;
  const hurwiczValues = values.map(row => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    return alpha * max + (1 - alpha) * min;
  });

  const optimalIndex = hurwiczValues.indexOf(Math.max(...hurwiczValues));

  const calculations = values.map((row, index) => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    const value = alpha * max + (1 - alpha) * min;
    return `Alternative ${index + 1}: ${alpha.toFixed(2)} × max{${row.join(", ")}} + ${(1 - alpha).toFixed(2)} × min{${row.join(", ")}} = ${alpha.toFixed(2)} × ${max} + ${(1 - alpha).toFixed(2)} × ${min} = ${value.toFixed(2)}`;
  });

  return {
    name: "Hurwicz (α=" + alpha.toFixed(2) + ")",
    description: `Promedio ponderado de los mejores y peores resultados con coeficiente de optimismo α=${alpha.toFixed(2)}`,
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
    description: "Supone que todos los estados tienen la misma probabilidad",
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
  const { values } = matrix;
  const numStates = matrix.states.length;
  const regretMatrix: number[][] = [];

  // For each state, find the maximum value
  const maxPerState = Array(numStates).fill(0);
  for (let j = 0; j < numStates; j++) {
    maxPerState[j] = Math.max(...values.map(row => row[j]));
  }

  // Calculate regret for each alternative and state
  for (let i = 0; i < values.length; i++) {
    regretMatrix[i] = [];
    for (let j = 0; j < numStates; j++) {
      regretMatrix[i][j] = maxPerState[j] - values[i][j];
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
    description: "Minimiza el arrepentimiento máximo (pérdida de oportunidad)",
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
export const exampleMatrices: {[key: string]: PayoffMatrix} = {
  example1: {
    alternatives: [
      { id: "a1", name: "Alternativa 1" },
      { id: "a2", name: "Alternativa 2" },
      { id: "a3", name: "Alternativa 3" }
    ],
    states: [
      { id: "s1", name: "Estado 1" },
      { id: "s2", name: "Estado 2" },
      { id: "s3", name: "Estado 3" },
      { id: "s4", name: "Estado 4" }
    ],
    values: [
      [3, 8, 2, 10],
      [5, 4, 6, 3],
      [9, 6, 4, 5]
    ]
  },
  example2: {
    alternatives: [
      { id: "a1", name: "Alternativa 1" },
      { id: "a2", name: "Alternativa 2" },
      { id: "a3", name: "Alternativa 3" },
      { id: "a4", name: "Alternativa 4" }
    ],
    states: [
      { id: "s1", name: "Estado 1" },
      { id: "s2", name: "Estado 2" },
      { id: "s3", name: "Estado 3" }
    ],
    values: [
      [10, 4, 7],
      [5, 8, 6],
      [8, 5, 4],
      [6, 7, 9]
    ]
  }
};
