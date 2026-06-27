import React, { useState, useEffect, useMemo } from 'react';
import { Eye,  
  Plane, 
  Users, 
  Briefcase, 
  Fuel, 
  Navigation, 
  Wind, 
  Thermometer, 
  Gauge, 
  Printer, 
  History, 
  Settings,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  CloudRain,
  Timer,
  Sun,
  Moon,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FLEET } from './data/fleet';
import { calculateWeightAndBalance, calculateAltitudes, predictDistance } from './lib/calculations';
import { FlightPrepData, PerformanceResult, Fleet as FleetType } from './types/aviation';
import { EnvelopeChart } from './components/EnvelopeChart';
import { FleetAdmin } from './components/FleetAdmin';
import { Report } from './components/Report';
import { cn, formatDuration } from './lib/utils';
import { TranslationContext, useTranslation } from './hooks/useTranslation';
import { translations, Locale } from './locales';

const INITIAL_DATA: FlightPrepData = {
  callsign: 'FBUPS',
  pax0: 80,
  pax1: 0,
  pax2: 0,
  pax3: 0,
  baggage: 0,
  baggage2: 0,
  mainfuel: 50,
  leftwingfuel: 0,
  rightwingfuel: 0,
  auxfuel: 0,
  tkalt: 0,
  tktemp: 15,
  tkqnh: 1013,
  ldalt: 0,
  ldtemp: 15,
  ldqnh: 1013,
};

export default function App() {
  const [fleet, setFleet] = useState<FleetType>(FLEET);
  const [data, setData] = useState<FlightPrepData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'prep' | 'fleet' | 'docs'>('prep');
  const [statsData, setStatsData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [locale, setLocale] = useState<Locale>('fr');
  const t = (key: keyof typeof translations['en']) => translations[locale][key] || key as string;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  
  const plane = useMemo(() => fleet[data.callsign] || Object.values(fleet)[0], [fleet, data.callsign]);

  // Clear invalid data when plane changes
  useEffect(() => {
    setData(prev => {
      const updates: Partial<FlightPrepData> = {};
      
      // Clear rear seats if 2-seater
      if (plane.numSeats <= 2) {
        if (prev.pax2 !== 0) updates.pax2 = 0;
        if (prev.pax3 !== 0) updates.pax3 = 0;
      }
      
      // Clear baggage 2 if not supported
      if (plane.bagmax2 <= 0) {
        if (prev.baggage2 !== 0) updates.baggage2 = 0;
      }

      // Check baggage 1 max
      if (prev.baggage > plane.bagmax) {
        updates.baggage = plane.bagmax;
      }
      
      // Clear unsupported fuel tanks and constrain existing ones
      if (plane.maxmainfuel <= 0 && prev.mainfuel > 0) updates.mainfuel = 0;
      else if (prev.mainfuel > plane.maxmainfuel) updates.mainfuel = plane.maxmainfuel;

      if (plane.maxwingfuel <= 0 && (prev.leftwingfuel > 0 || prev.rightwingfuel > 0)) {
        updates.leftwingfuel = 0;
        updates.rightwingfuel = 0;
      } else {
        if (prev.leftwingfuel > plane.maxwingfuel) updates.leftwingfuel = plane.maxwingfuel;
        if (prev.rightwingfuel > plane.maxwingfuel) updates.rightwingfuel = plane.maxwingfuel;
      }

      if (plane.maxauxfuel <= 0 && prev.auxfuel > 0) updates.auxfuel = 0;
      else if (prev.auxfuel > plane.maxauxfuel) updates.auxfuel = plane.maxauxfuel;

      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [plane]);

  const wb = useMemo(() => calculateWeightAndBalance(plane, data), [plane, data]);
  
  const tkPerf = useMemo(() => {
    const alts = calculateAltitudes(data.tkalt, data.tkqnh, data.tktemp);
    const perf = predictDistance(plane.takeoff50ftGrid, plane.mtow, alts.zp, data.tktemp, wb.totalWeight, 'takeoff', plane.planetype);
    return { ...alts, ...perf };
  }, [plane, data, wb.totalWeight]);

  const ldPerf = useMemo(() => {
    const alts = calculateAltitudes(data.ldalt, data.ldqnh, data.ldtemp);
    const perf = predictDistance(plane.landing50ftGrid, plane.mtow, alts.zp, data.ldtemp, wb.totalWeight, 'landing', plane.planetype);
    return { ...alts, ...perf };
  }, [plane, data, wb.totalWeight]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: name === 'callsign' ? value : Number(value)
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 print:bg-white transition-colors duration-200">
      {/* Printable Report */}
      <Report plane={plane} data={data} wb={wb} tkPerf={tkPerf} ldPerf={ldPerf} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm print:hidden transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200 dark:shadow-none">
            <Plane className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Prepavol <span className="text-blue-600 dark:text-blue-400">v2</span></h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('appTitle')}</p>
          </div>
        </div>

        <nav className="flex items-center w-full md:w-auto overflow-x-auto justify-start md:justify-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl transition-colors hide-scrollbar">
          <button 
            onClick={() => setActiveTab('prep')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
              activeTab === 'prep' 
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <Navigation className="w-4 h-4" />
            {t('preparationTab')}
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
              activeTab === 'fleet' 
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <Eye className="w-4 h-4" />
            {t('fleetTab')}
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
              activeTab === 'docs' 
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <BookOpen className="w-4 h-4" />
            {t('documentationTab')}
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors font-bold text-sm uppercase"
            title={locale === 'fr' ? "Switch to English" : "Passer en Français"}
          >
            {locale}
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={theme === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={handlePrint}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={t('printFlightPlan')}
          >
            <Printer className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Yannick Teresiak</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('pilot')} • {t('aeroclub')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-slate-800 shadow-md" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 print:hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'prep' ? (
            <motion.div 
              key="prep"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Inputs */}
              <div className="lg:col-span-4 space-y-6">
                {/* Plane Selection */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center gap-2 mb-6">
              <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("aircraftConfiguration")}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">{t("selectAircraft")}</label>
                <select 
                  name="callsign"
                  value={data.callsign}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                >
                  {Object.keys(fleet).map(cs => (
                    <option key={cs} value={cs}>{cs} ({fleet[cs].planetype})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("emptyWeight")}</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{plane.bew} kg</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t("mtow")}</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{plane.mtow} kg</p>
                </div>
              </div>
            </div>
          </section>

          {/* Loading Inputs */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("loadingAndFuel")}</h2>
            </div>

            <div className="space-y-6">
              {/* Passengers */}
              <div className="grid grid-cols-2 gap-4">
                <WeightInput label={t("pilotL")} name="pax0" value={data.pax0} onChange={handleInputChange} icon={<Users className="w-3.5 h-3.5" />} />
                <WeightInput label={t("paxFrontR")} name="pax1" value={data.pax1} onChange={handleInputChange} icon={<Users className="w-3.5 h-3.5" />} />
                
                {plane.numSeats > 2 && (
                  <>
                    <WeightInput label={t("paxRearL")} name="pax2" value={data.pax2} onChange={handleInputChange} icon={<Users className="w-3.5 h-3.5" />} />
                    <WeightInput label={t("paxRearR")} name="pax3" value={data.pax3} onChange={handleInputChange} icon={<Users className="w-3.5 h-3.5" />} />
                  </>
                )}
              </div>

              {/* Baggage */}
              <div className="grid grid-cols-2 gap-4">
                <WeightInput label={t("baggage1")} name="baggage" value={data.baggage} max={plane.bagmax} onChange={handleInputChange} icon={<Briefcase className="w-3.5 h-3.5" />} />
                {plane.bagmax2 > 0 && (
                  <WeightInput label={t("baggage2")} name="baggage2" value={data.baggage2} max={plane.bagmax2} onChange={handleInputChange} icon={<Briefcase className="w-3.5 h-3.5" />} />
                )}
              </div>

              {/* Fuel */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("fuelTanksLiters")}</label>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full transition-colors">
                    <Fuel className="w-3 h-3" />
                    0.72 kg/L
                  </div>
                </div>
                
                <div className="space-y-3">
                  {plane.maxmainfuel > 0 && (
                    <FuelSlider label={t("mainTank")} name="mainfuel" value={data.mainfuel} max={plane.maxmainfuel} onChange={handleInputChange} />
                  )}
                  {plane.maxwingfuel > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <FuelSlider label={t("leftWing")} name="leftwingfuel" value={data.leftwingfuel} max={plane.maxwingfuel} onChange={handleInputChange} />
                      <FuelSlider label={t("rightWing")} name="rightwingfuel" value={data.rightwingfuel} max={plane.maxwingfuel} onChange={handleInputChange} />
                    </div>
                  )}
                  {plane.maxauxfuel > 0 && (
                    <FuelSlider label={t("auxiliary")} name="auxfuel" value={data.auxfuel} max={plane.maxauxfuel} onChange={handleInputChange} />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Environmental Data */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center gap-2 mb-6">
              <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("environmentalConditions")}</h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">{t("takeoffSite")}</p>
                <div className="grid grid-cols-3 gap-3">
                  <EnvInput label="Alt (ft)" name="tkalt" value={data.tkalt} onChange={handleInputChange} icon={<Navigation className="w-3 h-3" />} />
                  <EnvInput label="Temp (°C)" name="tktemp" value={data.tktemp} onChange={handleInputChange} icon={<Thermometer className="w-3 h-3" />} />
                  <EnvInput label="QNH" name="tkqnh" value={data.tkqnh} onChange={handleInputChange} icon={<Gauge className="w-3 h-3" />} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">{t("landingSite")}</p>
                <div className="grid grid-cols-3 gap-3">
                  <EnvInput label="Alt (ft)" name="ldalt" value={data.ldalt} onChange={handleInputChange} icon={<Navigation className="w-3 h-3" />} />
                  <EnvInput label="Temp (°C)" name="ldtemp" value={data.ldtemp} onChange={handleInputChange} icon={<Thermometer className="w-3 h-3" />} />
                  <EnvInput label="QNH" name="ldqnh" value={data.ldqnh} onChange={handleInputChange} icon={<Gauge className="w-3 h-3" />} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatusCard 
              label={t("allUpWeight")} 
              value={`${wb.totalWeight.toFixed(1)} kg`} 
              isValid={!wb.isOverweight} 
              errorMsg={wb.isOverweight ? `Exceeds MTOW by ${(wb.totalWeight - plane.mtow).toFixed(1)}kg` : null}
            />
            <div className={cn(
              "p-5 rounded-2xl border transition-all duration-300 col-span-1 sm:col-span-1",
              wb.enduranceMinutes > 45 
                ? "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm" 
                : "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 shadow-lg shadow-rose-100 dark:shadow-none"
            )}>
              <div className="flex items-center justify-between mb-1">
                <p className={cn("text-[10px] font-bold uppercase tracking-wider", wb.enduranceMinutes > 45 ? "text-slate-400 dark:text-slate-500" : "text-rose-400 dark:text-rose-400")}>{t("vfrDayEndurance")}</p>
                <Timer className={cn("w-4 h-4", wb.enduranceMinutes > 45 ? "text-emerald-500" : "text-rose-500")} />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className={cn("text-2xl font-black", wb.enduranceMinutes > 45 ? "text-slate-900 dark:text-white" : "text-rose-700 dark:text-rose-400")}>{formatDuration(wb.dayFlyingMinutes)}</h3>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400 dark:text-slate-500">{t("vfrNight")}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatDuration(wb.nightFlyingMinutes)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400 dark:text-slate-500">{t("totalEndurance")}</span>
                  <span className="text-slate-500 dark:text-slate-400">{formatDuration(wb.enduranceMinutes)}</span>
                </div>
              </div>
              {wb.enduranceMinutes <= 45 && (
                <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Critical Fuel Level
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatusCard 
              label={t("loadedCg")} 
              value={`${wb.cg.toFixed(2)} m`} 
              isValid={wb.isCgValid}
              subValue={t("fullFuel")}
              icon={<Users className="w-4 h-4" />}
            />
            <StatusCard 
              label={t("zeroFuelCg")} 
              value={`${wb.cgNoFuel.toFixed(2)} m`} 
              isValid={wb.isCgNoFuelValid}
              subValue={t("postFlight")}
              icon={<Fuel className="w-4 h-4" />}
            />
          </div>

          {/* CG Chart */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("wbEnvelope")}</h2>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{t("current")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rotate-45" />
                  <span>{t("zeroFuel")}</span>
                </div>
              </div>
            </div>
            <EnvelopeChart 
              plane={plane} 
              cg={wb.cg} 
              weight={wb.totalWeight} 
              cgNoFuel={wb.cgNoFuel} 
              weightNoFuel={wb.totalWeightNoFuel} 
            />
          </section>

          {/* Performance Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceCard 
              title={t("takeoffPerformance")} 
              type="takeoff"
              perf={tkPerf}
            />
            <PerformanceCard 
              title={t("landingPerformance")} 
              type="landing"
              perf={ldPerf}
            />
          </div>

          {/* Documentation / Info */}
          <section className="bg-blue-600 p-8 rounded-2xl shadow-xl shadow-blue-200 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">{t("safetyFirst")}</h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-2xl mb-6">
                {t("flightPrepDisclaimerText")}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-300" />
                  POH Parity Guaranteed
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-300" />
                  Real-time Calculations
                </div>
              </div>
            </div>
            <Plane className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 -rotate-12" />
          </section>
        </div>
      </motion.div>
          ) : activeTab === 'docs' ? (
            <motion.div 
              key="docs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <section id="documentation" className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Prepavol Guide & Documentation
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Official documentation, fleet specifications, and system requirements for Aéroclub de Camargue pilots.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: User Guide & Calculations */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t("flightPreparationGuide")}</h3>
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
                        <p>
                          <strong>Prepavol v2</strong> {t("flightPrepDesc1")}
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5">
                          <li><strong>Mass & Balance:</strong> {t("flightPrepList1")}</li>
                          <li><strong>Performance Predictions:</strong> {t("flightPrepList2")}</li>
                          <li><strong>Corrections:</strong> {t("flightPrepList3")}</li>
                        </ul>
                      </div>
                    </div>

                    
                  </div>

                  {/* Right Column: Editing the Fleet */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t("editingTheFleet")}</h3>
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
                        <p>
                          {t("editingFleetDesc")}
                        </p>
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                          <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-1.5">
                            <Info className="w-4 h-4" />
                            {t('howToSubmitChanges')}
                          </h4>
                          <ol className="list-decimal pl-4 space-y-1 text-blue-900/80 dark:text-blue-400/80">
                            <li>{t("howToStep1")} <a href="https://github.com/ytrsk0/prepavol-ac-camargue.git" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">{t("howToStep1Link")}</a>.</li>
                            <li>{t("howToStep2")} <code>src/data/fleet.ts</code>.</li>
                            <li>{t("howToStep3")}</li>
                            <li>{t("howToStep4")}</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t("pohModelParity")}</h3>
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
                        <p>
                          {t("pohModelDesc1")} (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">&lambda; = 1e-4</code>):
                        </p>
                        <p className="font-mono bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                          y = &beta;₀ + &beta;₁Zp + &beta;₂Tk + &beta;₃W
                        </p>
                        <p>
                          This model provides precise, non-oscillating calculations over the standard bilinear interpolations, ensuring safe flight preparation margins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="fleet"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <FleetAdmin fleet={fleet} onUpdateFleet={setFleet} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400 print:hidden transition-colors">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5" />
          <a href="https://github.com/ytrsk0/prepavol-ac-camargue.git" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-blue-600 transition-colors">Prepavol v2</a>
        </div>
        <p className="text-xs">© 2024 Yannick Teresiak • {t('builtFor')}</p>
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveTab('docs')} className="text-xs hover:text-slate-600 dark:hover:text-slate-200 transition-colors">{t("documentationTab")}</button>
          <a href="mailto:yannick.teresiak@gmail.com" className="text-xs hover:text-slate-600 dark:hover:text-slate-200 transition-colors">{t("support")}</a>
        </div>
      </footer>
    </div>
    </TranslationContext.Provider>
  );
}

// Sub-components

function WeightInput({ label, name, value, onChange, icon, max }: any) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">
        {icon}
        {label}
      </label>
      <input 
        type="number" 
        name={name}
        value={value}
        onChange={onChange}
        max={max}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
      />
    </div>
  );
}

function EnvInput({ label, name, value, onChange, icon }: any) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
        {icon}
        {label}
      </label>
      <input 
        type="number" 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
      />
    </div>
  );
}

function FuelSlider({ label, name, value, max, onChange }: any) {
  const percentage = (value / max) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value} / {max} L</span>
      </div>
      <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn(
            "absolute top-0 left-0 h-full transition-colors",
            percentage > 90 ? "bg-blue-600" : percentage > 20 ? "bg-blue-500" : "bg-amber-500"
          )}
        />
        <input 
          type="range" 
          name={name}
          min="0" 
          max={max} 
          value={value}
          onChange={onChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
}

function StatusCard({ label, value, isValid, errorMsg, icon }: any) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-300",
      isValid 
        ? "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm" 
        : "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 shadow-lg shadow-rose-100 dark:shadow-none"
    )}>
      <div className="flex items-center justify-between mb-1">
        <p className={cn("text-[10px] font-bold uppercase tracking-wider", isValid ? "text-slate-400 dark:text-slate-500" : "text-rose-400 dark:text-rose-400")}>{label}</p>
        {isValid ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={cn("text-2xl font-black", isValid ? "text-slate-900 dark:text-white" : "text-rose-700 dark:text-rose-400")}>{value}</h3>
        {icon && <span className="text-slate-300 dark:text-slate-600">{icon}</span>}
      </div>
      {errorMsg && (
        <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}

function PerformanceCard({ title, type, perf }: any) {
  const { t } = useTranslation();
  const [showFormula, setShowFormula] = useState(false);
  
  const c = perf.modelCoeffs || [0, 0, 0, 0];
  
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {type === 'takeoff' ? <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400 rotate-180" />}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <button 
          onClick={() => setShowFormula(!showFormula)}
          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <Settings className="w-3 h-3" />
          {showFormula ? 'Hide Formula' : 'Show Formula'}
        </button>
      </div>

      <AnimatePresence>
        {showFormula && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 space-y-4"
          >
            <div className="p-4 bg-slate-900 rounded-xl text-[10px] font-mono text-slate-300 space-y-3">
              <div>
                <p className="text-emerald-400 font-bold mb-1">// First-Degree Multi-linear Calibration Model</p>
                <div className="space-y-1">
                  <p>y = β₀ + β₁Zp + β₂Tₖ + β₃W</p>
                  <p className="text-slate-400">{t("coeffs")}: [{c.map((x:any)=>x.toFixed(3)).join(', ')}]</p>
                  <p className="text-slate-500 italic mt-1">{t("modelStatus")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2">{t("metric")}</th>
                <th className="px-3 py-2 text-center">0kts</th>
                <th className="px-3 py-2 text-center">10kts</th>
                <th className="px-3 py-2 text-center">20kts</th>
                <th className="px-3 py-2 text-center">30kts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td className="px-3 py-2 font-bold text-slate-600 dark:text-slate-300">{t("distance50ft")} ({t("asphalt")})</td>
                <td className="px-3 py-2 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{perf.asphalt[0]}m</td>
                <td className="px-3 py-2 text-center font-mono text-slate-500 dark:text-slate-400">{perf.asphalt[1]}m</td>
                <td className="px-3 py-2 text-center font-mono text-slate-500 dark:text-slate-400">{perf.asphalt[2]}m</td>
                <td className="px-3 py-2 text-center font-mono text-slate-500 dark:text-slate-400">{perf.asphalt[3]}m</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-emerald-50/50 dark:bg-emerald-950/10">
                <td className="px-3 py-2 font-bold text-emerald-800 dark:text-emerald-400">{t("distance50ft")} ({t("grass")})</td>
                <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300">{perf.grass[0]}m</td>
                <td className="px-3 py-2 text-center font-mono text-slate-500 dark:text-slate-400">{perf.grass[1]}m</td>
                <td className="px-3 py-2 text-center font-mono text-slate-500 dark:text-slate-400">{perf.grass[2]}m</td>
                <td className="px-3 py-2 text-center font-mono text-slate-500 dark:text-slate-400">{perf.grass[3]}m</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">{t("densityAltitude")}: {Math.round(perf.zd)} ft</p>
            <p className="text-[9px] font-medium text-blue-600 dark:text-blue-400 leading-tight mt-0.5">
              Figures predicted using a pure Linear Regression model trained on raw POH data. Headwind and surface adjustment factors match original Robin specifications exactly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
