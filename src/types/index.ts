export interface Alternative {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface PayoffMatrix {
  alternatives: Alternative[];
  states: State[];
  values: number[][]; // [alternativeIndex][stateIndex]
}

export interface CriterionResult {
  name: string;
  description: string;
  calculations: string[];
  values: number[];
  optimalIndex: number;
  optimalValue: number;
}

export interface DecisionResults {
  matrix: PayoffMatrix;
  results: CriterionResult[];
  regretMatrix?: number[][];
}