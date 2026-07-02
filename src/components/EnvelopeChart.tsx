import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
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
  const { t } = useTranslation();

  // Prepare envelope data for the polygon
  const envelopeData = plane.envelope.map(([x, y]) => ({ x: Number(x.toFixed(4)), y }));
  
  // Add the first point at the end to close the polygon for the line
  const envelopeLineData = [...envelopeData, envelopeData[0]];

  const currentPoint = [{ x: Number(cg.toFixed(4)), y: weight }];
  const noFuelPoint = [{ x: Number(cgNoFuel.toFixed(4)), y: weightNoFuel }];

  // Calculate bounds to always include envelope and all CG points
  const points = [...plane.envelope.map(p => p[0]), cg, cgNoFuel, plane.arms.bew];
  const weightPoints = [...plane.envelope.map(p => p[1]), weight, weightNoFuel, plane.mtow, plane.bew];
  
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
        tickFormatter={(val) => Number(val.toFixed(4)).toString()}
        stroke={labelColor}
        label={{ value: t("centerOfGravityM"), offset: -10, position: "insideBottom", style: { fill: labelColor, fontSize: '11px', fontWeight: 'bold' } }}
      />
      <YAxis 
        type="number" 
        dataKey="y" 
        name="Weight" 
        unit="kg" 
        domain={[yMin, yMax]}
        tick={{ fontSize: 11, fill: labelColor }}
        tickFormatter={(val) => Math.round(val).toString()}
        stroke={labelColor}
        label={{ value: t("weightKg"), angle: -90, position: "insideLeft", style: { fill: labelColor, fontSize: '11px', fontWeight: 'bold' } }}
      />
      <ZAxis type="number" range={[100, 100]} />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number, name: string) => [name === 'CG' ? Number(value.toFixed(4)).toString() : value, name]} />
      
      {/* Envelope Polygon */}
      <Scatter 
        name={t("envelopeTooltip")} 
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
        label={{ value: t("mtow"), position: "top", style: { fill: '#dc2626', fontSize: '10px', fontWeight: 'bold' } }}
      />

      {/* Loading Path (Fuel burn) */}
      <ReferenceLine
        segment={[
          { x: Number(cg.toFixed(4)), y: weight },
          { x: Number(cgNoFuel.toFixed(4)), y: weightNoFuel }
        ]}
        stroke="#64748b"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {/* BEW Line */}
      <ReferenceLine 
        y={plane.bew} 
        stroke="#f59e0b" 
        strokeDasharray="5 5"
        strokeWidth={1.5}
        label={{ value: t("basicEmptyWeight"), position: "top", style: { fill: '#f59e0b', fontSize: '10px', fontWeight: 'bold' } }}
      />

      {/* Current CG Point */}
      <Scatter 
        name={t("currentCGTooltip")} 
        data={currentPoint} 
        fill="#22c55e" 
        stroke="#166534"
        strokeWidth={2}
        shape={<CurrentPoint />}
      />

      {/* Zero Fuel CG Point */}
      <Scatter 
        name={t("zeroFuelCGTooltip")} 
        data={noFuelPoint} 
        fill="#ef4444" 
        stroke="#991b1b"
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
    </div>
  );
};

export default EnvelopeChart;

