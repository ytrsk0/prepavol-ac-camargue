import React, { useState } from 'react';
import { 
  Settings, Eye, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Plane,
  Info,
  AlertCircle,
  Loader2,
  LogIn
} from 'lucide-react';
import { Fleet, PlaneDefinition } from '../types/aviation';
import { cn } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';

interface FleetAdminProps {
  fleet: Fleet;
  onUpdateFleet: (newFleet: Fleet) => void;
}

export const FleetAdmin: React.FC<FleetAdminProps> = ({ fleet, onUpdateFleet }) => {
  const { t } = useTranslation();
  const [editingCallsign, setEditingCallsign] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlaneDefinition | null>(null);

  const handleEdit = (callsign: string) => {
    setEditingCallsign(callsign);
    setEditForm({ ...fleet[callsign] });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            Fleet Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t("fleetDesc")}</p>
        </div>
      </div>

      {editingCallsign && editForm ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">{t("viewing")} {editingCallsign}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditingCallsign(null)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-0">
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-8">
              
              {/* 1. General Information */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("generalInformation")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("planeType")}</label>
                    <input disabled={true} type="text" value={editForm.planetype} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("numberOfSeats")}</label>
                    <input disabled={true} type="number" value={editForm.numSeats} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("fuelRate")}</label>
                    <input disabled={true} type="number" value={editForm.fuelrate} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                  </div>
                </div>
              </section>

              {/* 2. Mass & Balance Limits */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("massBalanceLimits")}</h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("mtow")}</label>
                      <input disabled={true} type="number" value={editForm.mtow} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("bew")}</label>
                      <input disabled={true} type="number" value={editForm.bew} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("bewArm")}</label>
                      <input disabled={true} type="number" value={editForm.arms.bew} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('frontSeats')}</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                        <input disabled={true} type="number" value={editForm.arms.front} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('rearSeats')}</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                        <input disabled={true} type="number" value={editForm.arms.rear} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('baggage1')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("maxKg")}</label>
                          <input disabled={true} type="number" value={editForm.bagmax} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                          <input disabled={true} type="number" value={editForm.arms.baggage} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('baggage2')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("maxKg")}</label>
                          <input disabled={true} type="number" value={editForm.bagmax2} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                          <input disabled={true} type="number" value={editForm.arms.baggage2} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("sumBaggage")}</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("maxKg")}</label>
                        <input disabled={true} type="number" value={editForm.sumbagmax} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('mainFuel')}</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("maxL")}</label>
                        <input disabled={true} type="number" value={editForm.maxmainfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("unusableL")}</label>
                          <input disabled={true} type="number" value={editForm.unusable_mainfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                          <input disabled={true} type="number" value={editForm.arms.mainfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('wingFuel')}</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("maxL")}</label>
                        <input disabled={true} type="number" value={editForm.maxwingfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("unusableL")}</label>
                          <input disabled={true} type="number" value={editForm.unusable_wingfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                          <input disabled={true} type="number" value={editForm.arms.wingfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('auxFuel')}</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("maxL")}</label>
                        <input disabled={true} type="number" value={editForm.maxauxfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("unusableL")}</label>
                          <input disabled={true} type="number" value={editForm.unusable_auxfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("armM")}</label>
                          <input disabled={true} type="number" value={editForm.arms.auxfuel} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. CG Envelope */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("cgEnvelope")}</h4>
                </div>
                <div className="space-y-3">
                  {editForm.envelope.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 group">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("cgM")}</label>
                          <input disabled={true} type="number" value={point[0]} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("weightKg")}</label>
                          <input disabled={true} type="number" value={point[1]} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {editForm.envelope.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t("noEnvelopePoints")}</p>
                    </div>
                  )}
                </div>
              </section>
              
              {/* 4. Performance Grids */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("performanceGrids")}</h4>
                <div className="space-y-6">
                  <GridEditor label={t("takeoff50ftGrid")} value={editForm.takeoff50ftGrid} />
                  <GridEditor label={t("landing50ftGrid")} value={editForm.landing50ftGrid} />
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(fleet).map(([cs, plane]: [string, PlaneDefinition]) => (
            <div key={cs} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(cs)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{cs}</h3>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{plane.planetype}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("bew").replace(" (kg)", "")}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{plane.bew} kg</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("mtow").replace(" (kg)", "")}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{plane.mtow} kg</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function GridEditor({ label, value }: { label: string, value: any }) {
  const { t } = useTranslation();
  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div className="text-xs text-slate-500">{t("noData")}</div>;
  }

  const weights = Object.keys(value[0].distances || {}).sort((a,b) => Number(a)-Number(b));

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">{label}</label>
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-[10px] text-right whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold">{t("altTemp")}</th>
              {weights.map(w => (
                <th key={w} className="px-2 py-1.5 font-semibold">{w} kg</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
            {value.map((pt: any, i: number) => (
              <tr key={i}>
                <td className="px-2 py-1.5 text-left font-mono">{pt.alt}ft / {pt.temp}°C</td>
                {weights.map(w => (
                  <td key={w} className="px-2 py-1.5 font-mono">{pt.distances[w] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
