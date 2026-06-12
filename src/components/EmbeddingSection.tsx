/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Compass, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

interface WordVector {
  word: string;
  x: number; // Dimension 1: "Royalty Strength" (0 to 100)
  y: number; // Dimension 2: "Feminine/Gender Scale" (0 to 100)
  category: "Royalty" | "Gender" | "Time" | "Tech";
  description: string;
}

// Fixed coordinates in our 2D concept space (0-100 grid scale)
const WORD_LIBRARY: WordVector[] = [
  { word: "King", x: 85, y: 15, category: "Royalty", description: "Royal status, masculine association" },
  { word: "Queen", x: 85, y: 85, category: "Royalty", description: "Royal status, feminine association" },
  { word: "Prince", x: 65, y: 20, category: "Royalty", description: "Junior royalty, masculine association" },
  { word: "Princess", x: 65, y: 80, category: "Royalty", description: "Junior royalty, feminine association" },
  { word: "Man", x: 10, y: 15, category: "Gender", description: "Common status, masculine association" },
  { word: "Woman", x: 10, y: 85, category: "Gender", description: "Common status, feminine association" },
  { word: "Boy", x: 15, y: 30, category: "Gender", description: "Young status, masculine association" },
  { word: "Girl", x: 15, y: 70, category: "Gender", description: "Young status, feminine association" },
  { word: "Laptop", x: 2, y: 45, category: "Tech", description: "Modern technological appliance" },
  { word: "Server", x: 4, y: 55, category: "Tech", description: "Heavy infrastructure computing node" },
];

export default function EmbeddingSection() {
  const [selectedWord, setSelectedWord] = useState<WordVector | null>(WORD_LIBRARY[0]);
  const [mathStage, setMathStage] = useState<"none" | "start" | "subtract" | "add" | "result">("none");
  const [hoveredWord, setHoveredWord] = useState<WordVector | null>(null);

  // Math simulation coordinates
  const getMathPointerCoords = () => {
    switch (mathStage) {
      case "start":
        return { x: 85, y: 15 }; // King
      case "subtract":
        return { x: 85, y: 50 }; // Moving left/down away from masculinity
      case "add":
        return { x: 50, y: 85 }; // Moving up towards femininity
      case "result":
        return { x: 85, y: 85 }; // Queen
      default:
        return null;
    }
  };

  const pointerCoords = getMathPointerCoords();

  return (
    <div className="space-y-8" id="embedding-section">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider font-mono">
          Step 02 / Mathematical Modeling
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
          Word Embeddings: Mapping Meaning to Coordinates
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">
          How can a neural network understand that a <strong>dog</strong> and a <strong>puppy</strong> are almost identical?
          By converting every token ID into a list of coordinates (a vector) in a multi-dimensional map.
          Words with similar definitions sleep right next to each other in this coordinate space!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Interactive 2D Coordinate Grid */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-850 pb-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 font-sans flex items-center gap-2">
              <Compass size={16} className="text-emerald-500" />
              Spatially Mapping Concepts (2D Slice)
            </h3>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              DIM 1: Royalty | DIM 2: Gender
            </span>
          </div>

          {/* SVG Grid Area */}
          <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-gray-50/50 dark:bg-gray-950/40 rounded-xl border border-gray-100 dark:border-gray-900/60 p-4 select-none">
            {/* Grid Helper lines */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full overflow-visible font-mono text-[3px] text-gray-300 dark:text-gray-800"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 2 L 10 5 L 0 8 z" fill="currentColor" />
                </marker>
              </defs>

              {/* Grid axes */}
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke="currentColor"
                strokeWidth="0.25"
                strokeDasharray="1 2"
              />
              <line
                x1="50"
                y1="0"
                x2="50"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.25"
                strokeDasharray="1 2"
              />

              {/* Axis labels */}
              <text x="94" y="53" fill="currentColor" fontWeight="bold">
                Masculine
              </text>
              <text x="2" y="53" fill="currentColor" fontWeight="bold">
                Feminine
              </text>
              <text x="52" y="5" fill="currentColor" fontWeight="bold">
                Royalty
              </text>
              <text x="52" y="98" fill="currentColor" fontWeight="bold">
                Common
              </text>

              {/* Draw static word nodes */}
              {WORD_LIBRARY.map((node) => {
                const isSelected = selectedWord?.word === node.word;
                const isHeadingTowards = mathStage === "result" && node.word === "Queen";
                return (
                  <g
                    key={node.word}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedWord(node)}
                    onMouseEnter={() => setHoveredWord(node)}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    <circle
                      cx={node.y} // Swap x/y for standard visual layout representation of axes
                      cy={100 - node.x}
                      r={isSelected ? "2.5" : "1.8"}
                      fill={
                        node.category === "Royalty"
                          ? "#10b981"
                          : node.category === "Gender"
                          ? "#3b82f6"
                          : "#8b5cf6"
                      }
                      className="transition-all duration-300 border border-white"
                      filter={isSelected ? "drop-shadow(0 2px 4px rgba(16,185,129,0.4))" : ""}
                    />
                    <text
                      x={node.y}
                      y={100 - node.x - (isSelected ? 3.5 : 2.8)}
                      textAnchor="middle"
                      fill={isSelected ? "#10b981" : "currentColor"}
                      fontSize={isSelected ? "4.5" : "3.5"}
                      fontWeight={isSelected ? "bold" : "600"}
                      className="transition-all duration-200 fill-gray-800 dark:fill-gray-200"
                    >
                      {node.word}
                    </text>
                  </g>
                );
              })}

              {/* Dynamic Coordinate math trajectory arrows */}
              {mathStage !== "none" && (
                <>
                  {/* Step 1 direction: Start at KING (y:15, x:85) */}
                  {mathStage !== "start" && (
                    <line
                      x1="15"
                      y1="15"
                      x2="15"
                      y2="85"
                      stroke="#ef4444"
                      strokeWidth="0.6"
                      markerEnd="url(#arrow)"
                    />
                  )}
                  {/* Step 2 direction: King - Man + Woman */}
                  {mathStage === "add" && (
                    <line
                      x1="15"
                      y1="85"
                      x2="85"
                      y2="85"
                      stroke="#3b82f6"
                      strokeWidth="0.6"
                      markerEnd="url(#arrow)"
                      strokeDasharray="1 1"
                    />
                  )}
                  {mathStage === "result" && (
                    <line
                      x1="15"
                      y1="15"
                      x2="85"
                      y2="15"
                      stroke="#10b981"
                      strokeWidth="0.8"
                      markerEnd="url(#arrow)"
                    />
                  )}
                </>
              )}

              {/* Moving point representation of prompt algebra */}
              {pointerCoords && (
                <circle
                  cx={pointerCoords.y}
                  cy={100 - pointerCoords.x}
                  r="3.5"
                  fill="#ef4444"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Right Side: Algebraic Interactive Game & Explanation */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Embedding Inspector */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200/80 dark:border-gray-800 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                <Compass size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Coordinate Inspector
                </span>
              </div>

              {selectedWord ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-sans">
                      Word: &quot;{selectedWord.word}&quot;
                    </h4>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                      {selectedWord.category} Category
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {selectedWord.description}
                    </p>
                  </div>

                  {/* Dimension Bars */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-500 mb-1">
                        <span>Royalty Scale (Dimension 1)</span>
                        <span className="font-bold text-emerald-500">{selectedWord.x}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${selectedWord.x}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-500 mb-1">
                        <span>Femininity scale (Dimension 2)</span>
                        <span className="font-bold text-blue-500">{selectedWord.y}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${selectedWord.y}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Select a point on the grid to watch vector coordinates.</p>
              )}
            </div>

            {/* Bottom note */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-4 text-[11px] text-gray-400 leading-normal flex flex-col gap-2">
              <div className="flex items-start gap-1.5">
                <HelpCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Real-world embeddings don&apos;t use 2 dimensions. They map words across **1,536 to 4,096 dimensions** to capture subtle nuances!
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-950 p-2.5 sm:p-3 rounded text-[10px] leading-relaxed text-gray-500 border border-gray-200/50 dark:border-gray-850">
                <strong>How Similarity is measured:</strong> Models use **Cosine Similarity** (calculating the cosine of the angle between two multi-dimensional arrows) or **Dot Product** math. If vectors point in the exact identical direction, the metric scores 1.0 (highly synonymous), whereas orthogonal vectors score 0.0 (completely unrelated).
              </div>
            </div>
          </div>

          {/* Interactive Math Panel */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-5 border border-emerald-100/50 dark:border-emerald-950/50 space-y-4">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles size={14} /> Interactive Vector Math
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              LLMs learn conceptual associations with simple vector addition and subtraction! Experience this yourself by clicking the simulator stages below.
            </p>

            <div className="bg-white dark:bg-gray-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-lg p-3 text-center">
              <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                King <span className="text-red-500 font-semibold">- Man</span> <span className="text-blue-500 font-semibold">+ Woman</span> = <span className="text-emerald-600 dark:text-emerald-400 font-bold underline">Queen</span>
              </span>
            </div>

            {/* Stages Slider button group */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => setMathStage("start")}
                className={`py-1.5 px-1 rounded text-[10px] font-mono border transition-all ${
                  mathStage === "start"
                    ? "bg-emerald-600 text-white border-emerald-600 scale-[1.02] shadow-sm font-bold"
                    : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                }`}
              >
                1. Start (King)
              </button>
              <button
                onClick={() => setMathStage("subtract")}
                className={`py-1.5 px-1 rounded text-[10px] font-mono border transition-all ${
                  mathStage === "subtract"
                    ? "bg-emerald-600 text-white border-emerald-600 scale-[1.02] shadow-sm font-bold"
                    : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                }`}
              >
                2. - Man
              </button>
              <button
                onClick={() => setMathStage("add")}
                className={`py-1.5 px-1 rounded text-[10px] font-mono border transition-all ${
                  mathStage === "add"
                    ? "bg-emerald-600 text-white border-emerald-600 scale-[1.02] shadow-sm font-bold"
                    : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                }`}
              >
                3. + Woman
              </button>
              <button
                onClick={() => setMathStage("result")}
                className={`py-1.5 px-1 rounded text-[10px] font-mono border transition-all ${
                  mathStage === "result"
                    ? "bg-emerald-600 text-white border-emerald-600 scale-[1.02] shadow-sm font-bold"
                    : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                }`}
              >
                4. Result
              </button>
            </div>

            {mathStage !== "none" && (
              <div className="text-[10px] leading-relaxed text-emerald-800 dark:text-emerald-400 italic pt-1">
                {mathStage === "start" && "We locate the word vector 'King' which sits high in royalty and masculinity."}
                {mathStage === "subtract" && "Subtracting the 'Man' vector slides our position downwards, removing masculine gender associations."}
                {mathStage === "add" && "Adding the 'Woman' vector pushes our coordinate straight towards corresponding feminine royalty spaces."}
                {mathStage === "result" && "Calculations complete! The closest vocabulary vector to our final coordinate is 'Queen'."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
