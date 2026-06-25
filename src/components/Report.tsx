import React from 'react';
import { PlaneDefinition, FlightPrepData } from '../types/aviation';
import { EnvelopeChart } from './EnvelopeChart';
import { cn, formatDuration } from '../lib/utils';

interface ReportProps {
  plane: PlaneDefinition;
  data: FlightPrepData;
  wb: any;
  tkPerf: any;
  ldPerf: any;
}

export const Report: React.FC<ReportProps> = ({ plane, data, wb, tkPerf, ldPerf }) => {
  return (
    <div className="hidden print:block p-8 bg-white text-black font-serif">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Flight Preparation Report</h1>
          <p className="text-sm font-bold mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{data.callsign}</p>
          <p className="text-sm">{plane.planetype}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Weight & Balance */}
        <section>
          <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">Weight & Balance</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-200">
              <tr><td className="py-1">Basic Empty Weight</td><td className="text-right font-bold">{plane.bew} kg</td></tr>
              <tr><td className="py-1">{plane.numSeats === 2 ? 'Passenger' : 'Pilot & Front Pax'}</td><td className="text-right font-bold">{data.pax0 + data.pax1} kg</td></tr>
              {plane.numSeats > 2 && (
                <tr><td className="py-1">Rear Passengers</td><td className="text-right font-bold">{data.pax2 + data.pax3} kg</td></tr>
              )}
              <tr><td className="py-1">Baggage {plane.bagmax2 > 0 ? '(Comp 1 & 2)' : ''}</td><td className="text-right font-bold">{data.baggage + data.baggage2} kg</td></tr>
              <tr><td className="py-1">Fuel ({data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel}L)</td><td className="text-right font-bold">{((data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel) * 0.72).toFixed(1)} kg</td></tr>
              <tr className="border-t-2 border-black">
                <td className="py-2 font-bold uppercase">All-Up Weight</td>
                <td className="py-2 text-right font-black text-lg">{wb.totalWeight.toFixed(1)} kg</td>
              </tr>
              <tr>
                <td className="py-2 font-bold uppercase">Center of Gravity</td>
                <td className="py-2 text-right font-black text-lg">{wb.cg.toFixed(2)} m</td>
              </tr>
              <tr>
                <td className="py-1 font-bold">Zero Fuel CG</td>
                <td className="py-1 text-right">{wb.cgNoFuel.toFixed(2)} m</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 p-3 border border-black text-xs">
            <p className="font-bold mb-1 uppercase tracking-wider">W&B Safety Status</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <p className="font-bold">{wb.isOverweight ? '❌ OVERWEIGHT' : '✅ WEIGHT OK'}</p>
              <p className="font-bold">{wb.isCgValid ? '✅ CG ENVELOPE OK' : '❌ CG OUTSIDE ENVELOPE'}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">Fuel & Endurance Planning</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-1">Total Fuel Capacity</td>
                  <td className="text-right font-bold">{(plane.maxmainfuel || 0) + (plane.maxwingfuel || 0) + (plane.maxauxfuel || 0)} L</td>
                </tr>
                <tr>
                  <td className="py-1">Total Fuel Loaded</td>
                  <td className="text-right font-bold">{data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel} L</td>
                </tr>
                <tr>
                  <td className="py-1">Fuel Weight (Density 0.72)</td>
                  <td className="text-right font-bold">{((data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel) * 0.72).toFixed(1)} kg</td>
                </tr>
                <tr>
                  <td className="py-1">Fuel Consumption Rate</td>
                  <td className="text-right font-bold">{plane.fuelrate} L/h</td>
                </tr>
                <tr className="border-t border-black font-bold">
                  <td className="py-1.5 uppercase text-black font-extrabold">Total Endurance</td>
                  <td className="py-1.5 text-right text-base text-black font-black">{formatDuration(wb.enduranceMinutes)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-xs">VFR Day Endurance (30m reserve)</td>
                  <td className="text-right font-bold text-emerald-700 text-xs">{formatDuration(wb.dayFlyingMinutes)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-xs">VFR Night Endurance (45m reserve)</td>
                  <td className="text-right font-bold text-indigo-700 text-xs">{formatDuration(wb.nightFlyingMinutes)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance */}
        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">Take-off (TOLD)</h2>
            <p className="text-xs mb-2">Conditions: {data.tkalt}ft, {data.tktemp}°C, {data.tkqnh}hPa (Zp: {Math.round(tkPerf.zp)}ft)</p>
            <table className="w-full text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 italic">
                  <th className="border border-black p-1">Metric</th>
                  <th className="border border-black p-1">0kts</th>
                  <th className="border border-black p-1">10kts</th>
                  <th className="border border-black p-1">20kts</th>
                  <th className="border border-black p-1">30kts</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">50ft (Asphalt)</td>
                  <td className="border border-black p-1 text-center font-black">{tkPerf.asphalt[0]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.asphalt[1]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.asphalt[2]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.asphalt[3]}m</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-black p-1">50ft (Grass x1.15)</td>
                  <td className="border border-black p-1 text-center font-black">{tkPerf.grass[0]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.grass[1]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.grass[2]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.grass[3]}m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">Landing (TOLD)</h2>
            <p className="text-xs mb-2">Conditions: {data.ldalt}ft, {data.ldtemp}°C, {data.ldqnh}hPa (Zp: {Math.round(ldPerf.zp)}ft)</p>
            <table className="w-full text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 italic">
                  <th className="border border-black p-1">Metric</th>
                  <th className="border border-black p-1">0kts</th>
                  <th className="border border-black p-1">10kts</th>
                  <th className="border border-black p-1">20kts</th>
                  <th className="border border-black p-1">30kts</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">50ft (Asphalt)</td>
                  <td className="border border-black p-1 text-center font-black">{ldPerf.asphalt[0]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.asphalt[1]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.asphalt[2]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.asphalt[3]}m</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-black p-1">50ft (Grass x1.15)</td>
                  <td className="border border-black p-1 text-center font-black">{ldPerf.grass[0]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.grass[1]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.grass[2]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.grass[3]}m</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-300 text-[10px] text-slate-500 italic">
        This report is generated for informational purposes. The Commander (CDB) is responsible for the final verification of all parameters. Distances include 50ft obstacle clearance.
      </div>

      <div className="mt-8 break-before-page">
        <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">Weight & Balance Envelope</h2>
        <div className="w-full flex justify-center p-4">
          <EnvelopeChart 
            plane={plane} 
            cg={wb.cg} 
            weight={wb.totalWeight} 
            cgNoFuel={wb.cgNoFuel} 
            weightNoFuel={wb.totalWeightNoFuel} 
            width={620}
            height={360}
          />
        </div>
        <div className="mt-4 flex justify-center gap-8 text-xs font-bold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Current State ({wb.cg.toFixed(2)}m, {wb.totalWeight.toFixed(1)}kg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-400 rotate-45" />
            <span>Zero Fuel State ({wb.cgNoFuel.toFixed(2)}m, {wb.totalWeightNoFuel.toFixed(1)}kg)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
