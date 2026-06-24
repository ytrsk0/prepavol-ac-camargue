import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Polygon,
  Cell,
  Label,
} from 'recharts';
import { PlaneDefinition } from '../types/aviation';

interface EnvelopeChartProps {
  plane: PlaneDefinition;
  cg: number;
  weight: number;
  cgNoFuel: number;
  weightNoFuel: number;
}

const NoPoint = () => null;

const CurrentPoint = (props: any) => {
  const { cx, cy, fill, stroke, strokeWidth } = props;
  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
};

const ZeroFuelPoint = (props: any) => {
  const { cx, cy, fill, stroke, strokeWidth } = props;
  const size = 6;
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={`rotate(45, ${cx}, ${cy})`}
    />
  );
};

export const EnvelopeChart: React.FC<EnvelopeChartProps> = ({
  plane,
  cg,
  weight,
  cgNoFuel,
  weightNoFuel,
}) => {
  // Prepare envelope data for the polygon
  const envelopeData = plane.envelope.map(([x, y]) => ({ x, y }));
  
  // Add the first point at the end to close the polygon for the line
  const envelopeLineData = [...envelopeData, envelopeData[0]];

  const currentPoint = [{ x: cg, y: weight }];
  const noFuelPoint = [{ x: cgNoFuel, y: weightNoFuel }];

  // Calculate bounds to always include envelope and both CG points
  const points = [...plane.envelope.map(p => p[0]), cg, cgNoFuel];
  const weightPoints = [...plane.envelope.map(p => p[1]), weight, weightNoFuel, plane.mtow];
  
  const xMin = Math.min(...points) * 0.9;
  const xMax = Math.max(...points) * 1.1;
  const yMin = Math.min(...weightPoints) * 0.8;
  const yMax = Math.max(...weightPoints) * 1.05;

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const labelColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-[400px] bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="CG" 
            unit="m" 
            domain={[xMin, xMax]} 
            tick={{ fontSize: 12, fill: labelColor }}
            stroke={labelColor}
            label={{ value: "Center of Gravity (m)", offset: -10, position: "insideBottom", style: { fill: labelColor, fontSize: '12px' } }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Weight" 
            unit="kg" 
            domain={[yMin, yMax]}
            tick={{ fontSize: 12, fill: labelColor }}
            stroke={labelColor}
            label={{ value: "Weight (kg)", angle: -90, position: "insideLeft", style: { fill: labelColor, fontSize: '12px' } }}
          />
          <ZAxis type="number" range={[100, 100]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          
          {/* Envelope Polygon */}
          <Scatter 
            name="Envelope" 
            data={envelopeLineData} 
            fill="transparent" 
            line={{ stroke: '#3b82f6', strokeWidth: 2 }}
            shape={<NoPoint />}
          />

          {/* MTOW Line */}
          <ReferenceLine 
            y={plane.mtow} 
            stroke="#ef4444" 
            strokeDasharray="5 5"
            label={{ value: "MTOW", position: "top", style: { fill: '#ef4444', fontSize: '10px', fontWeight: 'bold' } }}
          />

          {/* Loading Path (Fuel burn) */}
          <Scatter 
            name="Fuel Burn Path" 
            data={[...currentPoint, ...noFuelPoint]} 
            fill="transparent" 
            stroke="#94a3b8" 
            strokeWidth={1} 
            strokeDasharray="3 3"
            line 
            shape={<NoPoint />}
          />

          {/* Current CG Point */}
          <Scatter 
            name="Current CG" 
            data={currentPoint} 
            fill="#3b82f6" 
            stroke="#fff"
            strokeWidth={2}
            shape={<CurrentPoint />}
          />

          {/* Zero Fuel CG Point */}
          <Scatter 
            name="Zero Fuel CG" 
            data={noFuelPoint} 
            fill="#94a3b8" 
            stroke="#fff"
            strokeWidth={2}
            shape={<ZeroFuelPoint />}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Current State</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-400 rotate-45" />
          <span>Zero Fuel State</span>
        </div>
      </div>
    </div>
  );
};
