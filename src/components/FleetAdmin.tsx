import React, { useState } from 'react';
import { 
  Settings, 
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
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Fleet, PlaneDefinition } from '../types/aviation';
import { cn } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FleetAdminProps {
  fleet: Fleet;
  onUpdateFleet: (newFleet: Fleet) => void;
}

export const FleetAdmin: React.FC<FleetAdminProps> = ({ fleet, onUpdateFleet }) => {
  const [editingCallsign, setEditingCallsign] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlaneDefinition | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCallsign, setNewCallsign] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: (auth.currentUser as any)?.tenantId || null,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName,
          email: p.email,
          photoUrl: p.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleEdit = (callsign: string) => {
    setEditingCallsign(callsign);
    setEditForm({ ...fleet[callsign] });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingCallsign(null);
    setEditForm(null);
    setIsAdding(false);
    setNewCallsign('');
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    const targetCallsign = isAdding ? newCallsign : editingCallsign;
    if (!targetCallsign) return;

    setLoading(true);
    const path = `fleet/${targetCallsign}`;
    try {
      await setDoc(doc(db, 'fleet', targetCallsign), editForm);
      const newFleet = { ...fleet, [targetCallsign]: editForm };
      onUpdateFleet(newFleet);
      handleCancel();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (callsign: string) => {
    if (window.confirm(`Are you sure you want to delete ${callsign}?`)) {
      setLoading(true);
      const path = `fleet/${callsign}`;
      try {
        await deleteDoc(doc(db, 'fleet', callsign));
        const newFleet = { ...fleet };
        delete newFleet[callsign];
        onUpdateFleet(newFleet);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingCallsign(null);
    setNewCallsign('');
    setEditForm({
      arms: { auxfuel: 0, baggage: 0, baggage2: 0, bew: 0, front: 0, mainfuel: 0, wingfuel: 0, rear: 0 },
      bagmax: 0,
      bagmax2: 0,
      sumbagmax: 0,
      bew: 0,
      envelope: [],
      fuelrate: 0,
      maxauxfuel: 0,
      maxmainfuel: 0,
      maxwingfuel: 0,
      mtow: 0,
      planetype: '',
      unusable_mainfuel: 0,
      unusable_wingfuel: 0,
      unusable_auxfuel: 0,
      numSeats: 4,
      takeoff50ftGrid: [],
      landing50ftGrid: [],
    });
  };

  const updateFormField = (path: string, value: any) => {
    if (!editForm) return;
    const keys = path.split('.');
    if (keys.length === 1) {
      setEditForm({ ...editForm, [keys[0]]: value });
    } else if (keys.length === 2) {
      setEditForm({
        ...editForm,
        [keys[0]]: { ...(editForm as any)[keys[0]], [keys[1]]: value }
      });
    }
  };

  const addEnvelopePoint = () => {
    if (!editForm) return;
    updateFormField('envelope', [...editForm.envelope, [0, 0]]);
  };

  const removeEnvelopePoint = (index: number) => {
    if (!editForm) return;
    const newEnvelope = [...editForm.envelope];
    newEnvelope.splice(index, 1);
    updateFormField('envelope', newEnvelope);
  };

  const updateEnvelopePoint = (index: number, axis: 0 | 1, value: number) => {
    if (!editForm) return;
    const newEnvelope = [...editForm.envelope];
    newEnvelope[index] = [...newEnvelope[index]];
    newEnvelope[index][axis] = value;
    updateFormField('envelope', newEnvelope);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Fleet Management
          </h2>
          <p className="text-slate-500 text-sm">Configure aircraft characteristics, weight limits, and CG envelopes.</p>
        </div>
        <div className="flex items-center gap-4">
          {!auth.currentUser ? (
            <button 
              onClick={handleLogin}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{auth.currentUser.displayName}</p>
                <button onClick={handleLogout} className="text-[10px] text-rose-500 font-bold hover:underline">Log Out</button>
              </div>
              {!isAdding && !editingCallsign && (
                <button 
                  onClick={handleStartAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Aircraft
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {(isAdding || editingCallsign) && editForm ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">
              {isAdding ? 'New Aircraft Configuration' : `Editing ${editingCallsign}`}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCancel} 
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSave} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isAdding ? 'Create Aircraft' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Basic Info */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {isAdding && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Callsign</label>
                      <input 
                        type="text" 
                        value={newCallsign}
                        onChange={(e) => setNewCallsign(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="F-XXXX"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Plane Type</label>
                    <input 
                      type="text" 
                      value={editForm.planetype}
                      onChange={(e) => updateFormField('planetype', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">BEW (kg)</label>
                    <input 
                      type="number" 
                      value={editForm.bew}
                      onChange={(e) => updateFormField('bew', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">MTOW (kg)</label>
                    <input 
                      type="number" 
                      value={editForm.mtow}
                      onChange={(e) => updateFormField('mtow', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Seats (Count)</label>
                    <input 
                      type="number" 
                      value={editForm.numSeats}
                      onChange={(e) => updateFormField('numSeats', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </section>

              {/* Performance Data */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Handbook Performance Grids</h4>
                <div className="space-y-4">
                  <GridEditor 
                    label="Take-off 50ft Grid" 
                    value={editForm.takeoff50ftGrid} 
                    onChange={(v) => updateFormField('takeoff50ftGrid', v)} 
                  />
                  <GridEditor 
                    label="Landing 50ft Grid" 
                    value={editForm.landing50ftGrid} 
                    onChange={(v) => updateFormField('landing50ftGrid', v)} 
                  />
                </div>
              </section>

              {/* Baggage Caps */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Baggage Limits (kg)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Baggage 1 Max</label>
                    <input type="number" value={editForm.bagmax} onChange={(e) => updateFormField('bagmax', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Baggage 2 Max</label>
                    <input type="number" value={editForm.bagmax2} onChange={(e) => updateFormField('bagmax2', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </section>

              {/* Fuel Tanks */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Fuel Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max Main (L)</label>
                    <input type="number" value={editForm.maxmainfuel} onChange={(e) => updateFormField('maxmainfuel', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max Wing (L)</label>
                    <input type="number" value={editForm.maxwingfuel} onChange={(e) => updateFormField('maxwingfuel', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max Aux (L)</label>
                    <input type="number" value={editForm.maxauxfuel} onChange={(e) => updateFormField('maxauxfuel', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fuel Rate (L/h)</label>
                    <input type="number" value={editForm.fuelrate} onChange={(e) => updateFormField('fuelrate', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Unusable Fuel (Liters per tank)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Main</label>
                      <input type="number" value={editForm.unusable_mainfuel} onChange={(e) => updateFormField('unusable_mainfuel', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Wing</label>
                      <input type="number" value={editForm.unusable_wingfuel} onChange={(e) => updateFormField('unusable_wingfuel', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Aux</label>
                      <input type="number" value={editForm.unusable_auxfuel} onChange={(e) => updateFormField('unusable_auxfuel', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Lever Arms */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Lever Arms (m)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(editForm.arms).map((armKey) => (
                    <div key={armKey} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{armKey}</label>
                      <input 
                        type="number" 
                        step="0.001"
                        value={(editForm.arms as any)[armKey]}
                        onChange={(e) => updateFormField(`arms.${armKey}`, Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              {/* Envelope */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">CG Envelope Points</h4>
                  <button 
                    onClick={addEnvelopePoint}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Point
                  </button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {editForm.envelope.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">CG (m)</label>
                          <input 
                            type="number" 
                            step="0.001"
                            value={point[0]}
                            onChange={(e) => updateEnvelopePoint(idx, 0, Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                          <input 
                            type="number" 
                            value={point[1]}
                            onChange={(e) => updateEnvelopePoint(idx, 1, Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeEnvelopePoint(idx)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editForm.envelope.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">No envelope points defined.</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Points should be entered in order (clockwise or counter-clockwise) to define the polygon correctly on the chart.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(fleet).map(([cs, plane]: [string, PlaneDefinition]) => (
            <div key={cs} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(cs)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cs)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900">{cs}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{plane.planetype}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">BEW</p>
                    <p className="text-sm font-bold text-slate-700">{plane.bew} kg</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">MTOW</p>
                    <p className="text-sm font-bold text-slate-700">{plane.mtow} kg</p>
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

function GridEditor({ label, value, onChange }: { label: string, value: any, onChange: (v: any) => void }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      onChange(parsed);
    } catch (err: any) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        className={cn(
          "w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-[10px] font-mono outline-none focus:ring-2 min-h-[100px]",
          error ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-500"
        )}
      />
      {error && <p className="text-[9px] font-bold text-rose-500 ml-1">{error}</p>}
    </div>
  );
}
