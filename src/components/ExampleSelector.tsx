import React from "react";
import { exampleMatrices } from "../utils/decisionCriteria";

interface ExampleSelectorProps {
  onSelectExample: (exampleKey: string) => void;
}

const ExampleSelector: React.FC<ExampleSelectorProps> = ({ onSelectExample }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2 text-gray-700">Ejemplos de clase</h3>
      <div className="flex flex-wrap gap-3">
        {Object.keys(exampleMatrices).map((key) => (
          <button
            key={key}
            onClick={() => onSelectExample(key)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Ejemplo {key.replace("example", "")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExampleSelector;