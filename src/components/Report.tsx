import React from 'react';
import { PlaneDefinition, FlightPrepData } from '../types/aviation';
import { EnvelopeChart } from './EnvelopeChart';
import { cn, formatDuration } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';

interface ReportProps {
  plane: PlaneDefinition;
  data: FlightPrepData;
  wb: any;
  tkPerf: any;
  ldPerf: any;
}

export const Report: React.FC<ReportProps> = ({ plane, data, wb, tkPerf, ldPerf }) => {
  const { t } = useTranslation();
  return (
    <div className="hidden print:block p-8 bg-white text-black font-serif">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">{t("flightPrepReport")}</h1>
          <p className="text-sm font-bold mt-1">{t("generatedOn")} {new Date().toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{data.callsign}</p>
          <p className="text-sm">{plane.planetype}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Weight & Balance */}
        <section>
          <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">{t("weightAndBalance")}</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-200">
              <tr><td className="py-1">{t("basicEmptyWeight")}</td><td className="text-right font-bold">{plane.bew} kg</td></tr>
              <tr><td className="py-1">{plane.numSeats === 2 ? t('pax') : t('pilotFrontPax')}</td><td className="text-right font-bold">{data.pax0 + data.pax1} kg</td></tr>
              {plane.numSeats > 2 && (
                <tr><td className="py-1">{t("rearPax")}</td><td className="text-right font-bold">{data.pax2 + data.pax3} kg</td></tr>
              )}
              <tr><td className="py-1">{t("baggage")} {plane.bagmax2 > 0 ? `(${t("baggageComp").replace("Bagages ", "")})` : ""}</td><td className="text-right font-bold">{data.baggage + data.baggage2} kg</td></tr>
              <tr><td className="py-1">{t("fuel")} ({data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel}L)</td><td className="text-right font-bold">{((data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel) * 0.72).toFixed(1)} kg</td></tr>
              <tr className="border-t-2 border-black">
                <td className="py-2 font-bold uppercase">{t("allUpWeight")}</td>
                <td className="py-2 text-right font-black text-lg">{wb.totalWeight.toFixed(1)} kg</td>
              </tr>
              <tr>
                <td className="py-2 font-bold uppercase">{t("cg")}</td>
                <td className="py-2 text-right font-black text-lg">{wb.cg.toFixed(2)} m</td>
              </tr>
              <tr>
                <td className="py-1 font-bold">{t("zeroFuelCG")}</td>
                <td className="py-1 text-right">{wb.cgNoFuel.toFixed(2)} m</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 p-3 border border-black text-xs">
            <p className="font-bold mb-1 uppercase tracking-wider">{t("wbSafetyStatus")}</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <p className="font-bold">{wb.isOverweight ? t("overweight") : t("weightOk")}</p>
              <p className="font-bold">{wb.isCgValid ? t("cgEnvelopeOk") : t("cgOutside")}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">{t("fuelAndEndurancePlanning")}</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-1">{t("totalFuelCapacity")}</td>
                  <td className="text-right font-bold">{(plane.maxmainfuel || 0) + (plane.maxwingfuel || 0) + (plane.maxauxfuel || 0)} L</td>
                </tr>
                <tr>
                  <td className="py-1">{t("totalFuelLoaded")}</td>
                  <td className="text-right font-bold">{data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel} L</td>
                </tr>
                <tr>
                  <td className="py-1">{t("fuelWeight")}</td>
                  <td className="text-right font-bold">{((data.mainfuel + data.leftwingfuel + data.rightwingfuel + data.auxfuel) * 0.72).toFixed(1)} kg</td>
                </tr>
                <tr>
                  <td className="py-1">{t("fuelConsumptionRate")}</td>
                  <td className="text-right font-bold">{plane.fuelrate} L/h</td>
                </tr>
                <tr className="border-t border-black font-bold">
                  <td className="py-1.5 uppercase text-black font-extrabold">{t("totalEnduranceReport")}</td>
                  <td className="py-1.5 text-right text-base text-black font-black">{formatDuration(wb.enduranceMinutes)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-xs">{t("vfrDayEnduranceReport")}</td>
                  <td className="text-right font-bold text-emerald-700 text-xs">{formatDuration(wb.dayFlyingMinutes)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-xs">{t("vfrNightEnduranceReport")}</td>
                  <td className="text-right font-bold text-indigo-700 text-xs">{formatDuration(wb.nightFlyingMinutes)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance */}
        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">{t("takeoffPerformance")}</h2>
            <p className="text-xs mb-2">Conditions: {data.tkalt}ft, {data.tktemp}°C, {data.tkqnh}hPa (Zp: {Math.round(tkPerf.zp)}ft, Zd: {Math.round(tkPerf.zd)}ft)</p>
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
                  <td className="border border-black p-1">{t("distance50ft")} ({t("asphalt")})</td>
                  <td className="border border-black p-1 text-center font-black">{tkPerf.asphalt[0]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.asphalt[1]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.asphalt[2]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.asphalt[3]}m</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-black p-1">{t("distance50ft")} ({t("grass")})</td>
                  <td className="border border-black p-1 text-center font-black">{tkPerf.grass[0]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.grass[1]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.grass[2]}m</td>
                  <td className="border border-black p-1 text-center">{tkPerf.grass[3]}m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">{t("landingPerformance")}</h2>
            <p className="text-xs mb-2">Conditions: {data.ldalt}ft, {data.ldtemp}°C, {data.ldqnh}hPa (Zp: {Math.round(ldPerf.zp)}ft, Zd: {Math.round(ldPerf.zd)}ft)</p>
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
                  <td className="border border-black p-1">{t("distance50ft")} ({t("asphalt")})</td>
                  <td className="border border-black p-1 text-center font-black">{ldPerf.asphalt[0]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.asphalt[1]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.asphalt[2]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.asphalt[3]}m</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-black p-1">{t("distance50ft")} ({t("grass")})</td>
                  <td className="border border-black p-1 text-center font-black">{ldPerf.grass[0]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.grass[1]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.grass[2]}m</td>
                  <td className="border border-black p-1 text-center">{ldPerf.grass[3]}m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">{t("remindersTitle")}</h2>
            <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
              <li>{t("pressureAltitudeReminder")}</li>
              <li>{t("tisaReminder")}</li>
              <li>{t("densityAltitudeReminder")}</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-300 text-[10px] text-slate-500 italic">
        <p>{t("informationalReport")}</p>
      </div>

      <div className="mt-8 break-before-page">
        <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">{t("wbEnvelope")}</h2>
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
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{t("currentState")} ({wb.cg.toFixed(2)}m, {wb.totalWeight.toFixed(1)}kg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rotate-45" />
            <span>{t("zeroFuelState")} ({wb.cgNoFuel.toFixed(2)}m, {wb.totalWeightNoFuel.toFixed(1)}kg)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

