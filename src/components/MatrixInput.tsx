import { ChevronRight, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Alternative, PayoffMatrix, State } from "../types";

interface MatrixInputProps {
  initialMatrix?: PayoffMatrix;
  onMatrixChange: (matrix: PayoffMatrix) => void;
  onCalculate: () => void;
}

const MatrixInput: React.FC<MatrixInputProps> = ({
  initialMatrix,
  onMatrixChange,
  onCalculate
}) => {
  const [matrix, setMatrix] = useState<PayoffMatrix>(
    initialMatrix || {
      alternatives: [
        { id: "a1", name: "Alternativa 1" },
        { id: "a2", name: "Alternativa 2" }
      ],
      states: [
        { id: "s1", name: "Estado 1" },
        { id: "s2", name: "Estado 2" }
      ],
      values: [
        [0, 0],
        [0, 0]
      ]
    }
  );

  useEffect(() => {
    if (initialMatrix) {
      setMatrix(initialMatrix);
    }
  }, [initialMatrix]);

  useEffect(() => {
    onMatrixChange(matrix);
  }, [matrix, onMatrixChange]);

  const addAlternative = () => {
    const newAlt: Alternative = {
      id: `a${matrix.alternatives.length + 1}`,
      name: `Alternativa ${matrix.alternatives.length + 1}`
    };

    const newValues = [...matrix.values];
    newValues.push(Array(matrix.states.length).fill(0));

    setMatrix({
      ...matrix,
      alternatives: [...matrix.alternatives, newAlt],
      values: newValues
    });
  };

  const addState = () => {
    const newState: State = {
      id: `s${matrix.states.length + 1}`,
      name: `Estado ${matrix.states.length + 1}`
    };

    const newValues = matrix.values.map(row => [...row, 0]);

    setMatrix({
      ...matrix,
      states: [...matrix.states, newState],
      values: newValues
    });
  };

  const removeAlternative = (index: number) => {
    if (matrix.alternatives.length <= 2) return;

    const newAlternatives = [...matrix.alternatives];
    newAlternatives.splice(index, 1);

    const newValues = [...matrix.values];
    newValues.splice(index, 1);

    setMatrix({
      ...matrix,
      alternatives: newAlternatives,
      values: newValues
    });
  };

  const removeState = (index: number) => {
    if (matrix.states.length <= 2) return;

    const newStates = [...matrix.states];
    newStates.splice(index, 1);

    const newValues = matrix.values.map(row => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    });

    setMatrix({
      ...matrix,
      states: newStates,
      values: newValues
    });
  };

  const updateAlternativeName = (index: number, name: string) => {
    const newAlternatives = [...matrix.alternatives];
    newAlternatives[index] = { ...newAlternatives[index], name };

    setMatrix({
      ...matrix,
      alternatives: newAlternatives
    });
  };

  const updateStateName = (index: number, name: string) => {
    const newStates = [...matrix.states];
    newStates[index] = { ...newStates[index], name };

    setMatrix({
      ...matrix,
      states: newStates
    });
  };

  const updateValue = (altIndex: number, stateIndex: number, value: number) => {
    const newValues = [...matrix.values];
    newValues[altIndex] = [...newValues[altIndex]];
    newValues[altIndex][stateIndex] = value;

    setMatrix({
      ...matrix,
      values: newValues
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Matriz de decisión</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {matrix.states.map((state, index) => (
                <th key={state.id} className="p-2 border">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={state.name}
                      onChange={(e) => updateStateName(index, e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                    {matrix.states.length > 2 && (
                      <button
                        onClick={() => removeState(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-2 border">
                <button
                  onClick={addState}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 p-1 rounded flex items-center justify-center"
                >
                  <Plus size={16} className="mr-1" /> Estado
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.alternatives.map((alt, altIndex) => (
              <tr key={alt.id}>
                <td className="p-2 border">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={alt.name}
                      onChange={(e) => updateAlternativeName(altIndex, e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                    {matrix.alternatives.length > 2 && (
                      <button
                        onClick={() => removeAlternative(altIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
                {matrix.states.map((state, stateIndex) => (
                  <td key={`${alt.id}-${state.id}`} className="p-2 border">
                    <input
                      type="number"
                      value={matrix.values[altIndex][stateIndex]}
                      onChange={(e) => updateValue(altIndex, stateIndex, Number(e.target.value))}
                      className="w-24 p-1 border rounded text-center"
                    />
                  </td>
                ))}
                <td className="p-2 border"></td>
              </tr>
            ))}
            <tr>
              <td className="p-2 border">
                <button
                  onClick={addAlternative}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 p-1 rounded flex items-center justify-center"
                >
                  <Plus size={16} className="mr-1" /> Alternativa
                </button>
              </td>
              {matrix.states.map((state) => (
                <td key={`new-${state.id}`} className="p-2 border"></td>
              ))}
              <td className="p-2 border"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onCalculate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors duration-300"
        >
          Calcular <ChevronRight className="ml-1" size={18} />
        </button>
      </div>
    </div>
  );
};

export default MatrixInput;
