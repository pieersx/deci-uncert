import React from "react";

interface HurwiczAlphaSliderProps {
  alpha: number;
  onChange: (alpha: number) => void;
}

const HurwiczAlphaSlider: React.FC<HurwiczAlphaSliderProps> = ({ alpha, onChange }) => {
  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="alpha-slider" className="font-medium text-gray-700">
          Coeficiente de optimismo (α) para Hurwicz:
        </label>
        <span className="text-blue-600 font-semibold">{alpha.toFixed(2)}</span>
      </div>
      
      <input
        id="alpha-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={alpha}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Pesimista (0)</span>
        <span>Optimista (1)</span>
      </div>
    </div>
  );
};

export default HurwiczAlphaSlider;