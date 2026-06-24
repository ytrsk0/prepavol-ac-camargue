import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    let errorMessage = error?.message || 'An unexpected error occurred.';
    try {
      const parsedError = JSON.parse(errorMessage);
      if (parsedError.error && parsedError.operationType) {
        errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
      }
    } catch (e) {
      // Not JSON
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-200">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
