import React, { useState } from 'react';
import { X, Terminal, Cpu, ChevronRight, Activity, Clock } from 'lucide-react';
import type { ObservabilityStep } from '../types';

interface ObservabilityDrawerProps {
  trace: ObservabilityStep[];
  latencyMs?: number;
  onClose: () => void;
}

export const ObservabilityDrawer: React.FC<ObservabilityDrawerProps> = ({
  trace,
  latencyMs,
  onClose
}) => {
  const [showRaw, setShowRaw] = useState<boolean>(false);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#120E0C]/95 border-l border-amber-500/30 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft">
      
      {/* Drawer Header */}
      <div className="p-5 border-b border-amber-500/20 bg-stone-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-white flex items-center gap-2">
              Agent Execution Observability
            </h3>
            <p className="text-[11px] text-stone-400 font-mono">Google ADK Multi-Tool Tracing</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900 border border-stone-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Latency & Status Banner */}
      <div className="px-5 py-3 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity className="w-3.5 h-3.5" />
          <span>Execution Success</span>
        </div>
        {latencyMs && (
          <div className="flex items-center gap-1 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{latencyMs} ms total</span>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
        
        {trace.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No query execution trace available yet.</p>
            <p className="text-[10px] text-stone-600">Send a chat message to inspect agent reasoning steps.</p>
          </div>
        ) : (
          trace.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/15 hover:border-amber-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-stone-200">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  {step.step_name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                  Step {idx + 1}
                </span>
              </div>

              <p className="text-stone-300 leading-relaxed text-[11px]">
                {step.detail}
              </p>

              {step.data && (
                <div className="mt-2 p-2 rounded-xl bg-stone-950 border border-stone-800 text-[10px] text-amber-200/80 overflow-x-auto">
                  <pre>{JSON.stringify(step.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}

      </div>

      {/* Raw JSON toggle footer */}
      <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-amber-400 hover:underline"
        >
          {showRaw ? 'Hide Raw Trace Payload' : 'View Raw JSON Trace'}
        </button>
      </div>

      {showRaw && (
        <div className="p-4 bg-black border-t border-stone-800 text-[10px] text-emerald-400 font-mono max-h-48 overflow-y-auto">
          <pre>{JSON.stringify(trace, null, 2)}</pre>
        </div>
      )}

    </div>
  );
};
