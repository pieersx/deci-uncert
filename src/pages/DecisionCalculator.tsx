import { Info } from "lucide-react";
import React, { useCallback, useState } from "react";
import Header from "../components/Header";
import HurwiczAlphaSlider from "../components/HurwiczAlphaSlider";
import MatrixInput from "../components/MatrixInput";
import ResultsDisplay from "../components/ResultsDisplay";
import { DecisionResults, PayoffMatrix } from "../types";
import { calculateAllCriteria } from "../utils/decisionCriteria";

const DecisionCalculator: React.FC = () => {
  const [matrix, setMatrix] = useState<PayoffMatrix | null>(null);
  const [alpha, setAlpha] = useState<number>(0.5);
  const [results, setResults] = useState<DecisionResults | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleMatrixChange = useCallback((newMatrix: PayoffMatrix) => {
    setMatrix(newMatrix);
  }, []);

  const handleCalculate = () => {
    if (matrix) {
      const calculatedResults = calculateAllCriteria(matrix, alpha);
      setResults(calculatedResults);
      setShowResults(true);
    }
  };

  // const handleSelectExample = (exampleKey: string) => {
  //   if [exampleKey]) {
  //     setMatrix[exampleKey]);
  //     setShowResults(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criterios de Decisión en Condición de Incertidumbre</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Esta aplicación calcula automáticamente los resultados de los criterios de decisión bajo incertidumbre:
            Laplace, Optimista, Pesimista, Hurwicz y Savage.
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md flex items-start">
          <Info className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-blue-800">Instrucciones</h3>
            <p className="text-blue-700 text-sm">
              1. Ingrese los valores en la matriz de decisión.
              <br />
              2. Ajuste el coeficiente de optimismo para el criterio de Hurwicz.
              <br />
              3. Haga clic en "Calcular" para obtener los resultados.
              <br />
              4. Para volver a la matriz de decisión, haga clic en "Volver a la matriz" al final.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Configuración</h2>
          </div>

          {/* <ExampleSelector onSelectExample={handleSelectExample} /> */}

          <HurwiczAlphaSlider alpha={alpha} onChange={setAlpha} />
        </div>

        {showResults && results ? (
          <ResultsDisplay results={results} onBack={() => setShowResults(false)} />
        ) : (
          <MatrixInput
            initialMatrix={matrix || undefined}
            onMatrixChange={handleMatrixChange}
            onCalculate={handleCalculate}
          />
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>DecisionMatrix - Aplicación para resolución de criterios en condición de incertidumbre © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default DecisionCalculator;
