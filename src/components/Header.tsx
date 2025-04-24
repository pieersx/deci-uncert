import React from "react";
import { Calculator } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <Calculator className="h-8 w-8 mr-3" />
        <div>
          <h1 className="text-2xl font-bold">DecisionMatrix</h1>
          <p className="text-sm text-blue-100">Criterios de decisión bajo incertidumbre</p>
        </div>
      </div>
    </header>
  );
};

export default Header;