import React from "react";
import { CriterionResult, DecisionResults } from "../types";

interface ResultsDisplayProps {
  results: DecisionResults;
  onBack: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onBack }) => {
  const { matrix, results: criteriaResults, regretMatrix } = results;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Resultados</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">Matriz de pagos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border"></th>
                {matrix.states.map((state) => (
                  <th key={state.id} className="p-2 border bg-gray-100">
                    {state.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.alternatives.map((alt, altIndex) => (
                <tr key={alt.id}>
                  <td className="p-2 border bg-gray-100 font-medium">
                    {alt.name}
                  </td>
                  {matrix.values[altIndex].map((value, stateIndex) => (
                    <td key={`${alt.id}-${matrix.states[stateIndex].id}`} className="p-2 border text-center">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {regretMatrix && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Matriz de arrepentimiento para Criterio de Savage</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border"></th>
                  {matrix.states.map((state) => (
                    <th key={state.id} className="p-2 border bg-gray-100">
                      {state.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.alternatives.map((alt, altIndex) => (
                  <tr key={alt.id}>
                    <td className="p-2 border bg-gray-100 font-medium">
                      {alt.name}
                    </td>
                    {regretMatrix[altIndex].map((value, stateIndex) => (
                      <td key={`regret-${alt.id}-${matrix.states[stateIndex].id}`} className="p-2 border text-center">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {criteriaResults.map((result, index) => (
          <CriterionResultDisplay
            key={index}
            result={result}
            alternatives={matrix.alternatives}
          />
        ))}
      </div>

      <div className="space-y-8 mt-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">Resumen de Resultados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-gray-100">Alternativas</th>
                {criteriaResults.map((result, index) => (
                  <th key={index} className="p-2 border bg-gray-100">
                    {result.name.split(" (")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.alternatives.map((alt, altIndex) => (
                <tr key={alt.id}>
                  <td className="p-2 border font-medium">
                    {alt.name}
                  </td>
                  {criteriaResults.map((result, criterionIndex) => (
                    <td
                      key={`${alt.id}-${criterionIndex}`}
                      className={`p-2 border text-center ${
                        result.optimalIndex === altIndex
                          ? 'bg-green-100 font-semibold text-green-800'
                          : ''
                      }`}
                    >
                      {result.values[altIndex].toFixed(2)}
                      {result.optimalIndex === altIndex && ' ✓'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium"
        >
          Volver a la matriz
        </button>
      </div>
    </div>
  );
};

interface CriterionResultDisplayProps {
  result: CriterionResult;
  alternatives: { id: string; name: string }[];
}

const CriterionResultDisplay: React.FC<CriterionResultDisplayProps> = ({
  result,
  alternatives
}) => {
  const { name, description, calculations, values, optimalIndex } = result;

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-1 text-blue-700">{name}</h3>
      <p className="text-gray-600 mb-3">{description}</p>

      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-gray-700">Cálculos:</h4>
        {calculations.map((calc, index) => (
          <div
            key={index}
            className={`p-2 rounded-md ${index === optimalIndex ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}
          >
            {calc}
            {index === optimalIndex && (
              <span className="ml-2 text-green-600 font-medium">← Óptimo</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <p className="font-medium text-blue-800">
          Decisión óptima: <span className="text-blue-900">{alternatives[optimalIndex].name}</span>
          {result.name === "Minimax Regret (Savage)"
            ? ` con mínimo arrepentimiento máximo de ${result.optimalValue}`
            : ` con valor de ${result.optimalValue}`}
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
