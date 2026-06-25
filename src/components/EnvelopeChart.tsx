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
  width?: number | string;
  height?: number | string;
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
  width,
  height,
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
  const forceLight = width !== undefined;
  const gridColor = (isDark && !forceLight) ? '#334155' : '#cbd5e1';
  const labelColor = (isDark && !forceLight) ? '#94a3b8' : '#334155';

  const chartElement = (
    <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 25 }} width={typeof width === 'number' ? width : undefined} height={typeof height === 'number' ? height : undefined}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis 
        type="number" 
        dataKey="x" 
        name="CG" 
        unit="m" 
        domain={[xMin, xMax]} 
        tick={{ fontSize: 11, fill: labelColor }}
        stroke={labelColor}
        label={{ value: "Center of Gravity (m)", offset: -10, position: "insideBottom", style: { fill: labelColor, fontSize: '11px', fontWeight: 'bold' } }}
      />
      <YAxis 
        type="number" 
        dataKey="y" 
        name="Weight" 
        unit="kg" 
        domain={[yMin, yMax]}
        tick={{ fontSize: 11, fill: labelColor }}
        stroke={labelColor}
        label={{ value: "Weight (kg)", angle: -90, position: "insideLeft", style: { fill: labelColor, fontSize: '11px', fontWeight: 'bold' } }}
      />
      <ZAxis type="number" range={[100, 100]} />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      
      {/* Envelope Polygon */}
      <Scatter 
        name="Envelope" 
        data={envelopeLineData} 
        fill="transparent" 
        line={{ stroke: '#2563eb', strokeWidth: 2 }}
        shape={<NoPoint />}
      />

      {/* MTOW Line */}
      <ReferenceLine 
        y={plane.mtow} 
        stroke="#dc2626" 
        strokeDasharray="5 5"
        strokeWidth={1.5}
        label={{ value: "MTOW", position: "top", style: { fill: '#dc2626', fontSize: '10px', fontWeight: 'bold' } }}
      />

      {/* Loading Path (Fuel burn) */}
      <Scatter 
        name="Fuel Burn Path" 
        data={[...currentPoint, ...noFuelPoint]} 
        fill="transparent" 
        stroke="#64748b" 
        strokeWidth={1.5} 
        strokeDasharray="4 4"
        line 
        shape={<NoPoint />}
      />

      {/* Current CG Point */}
      <Scatter 
        name="Current CG" 
        data={currentPoint} 
        fill="#2563eb" 
        stroke="#1e3a8a"
        strokeWidth={2}
        shape={<CurrentPoint />}
      />

      {/* Zero Fuel CG Point */}
      <Scatter 
        name="Zero Fuel CG" 
        data={noFuelPoint} 
        fill="#475569" 
        stroke="#0f172a"
        strokeWidth={2}
        shape={<ZeroFuelPoint />}
      />
    </ScatterChart>
  );

  if (typeof width === 'number' && typeof height === 'number') {
    return (
      <div 
        style={{ width: `${width}px`, height: `${height}px` }} 
        className="bg-white p-4 rounded-xl border border-black/20 flex items-center justify-center"
      >
        {chartElement}
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <ResponsiveContainer width="100%" height="100%">
        {chartElement}
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
