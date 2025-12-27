import React from "react";
import { TExecutionLog } from "../types";

interface ExecutionLogProps {
  logs: TExecutionLog[];
  isExecuting: boolean;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({
  logs,
  isExecuting,
}) => {
  return (
    <div className="w-full h-[200px] p-4 bg-[#1e1e1e] text-[#d4d4d4] border-t border-[#333] flex flex-col font-mono md:w-[300px] md:h-full md:border-t-0 md:border-l">
      <h2 className="m-0 mb-4 text-lg text-white border-b border-[#333] pb-2">
        Execution Log
      </h2>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {logs.length === 0 && !isExecuting && (
          <div className="text-gray-500 italic p-4 text-center">
            No execution logs yet. Click Execute to run the pipeline.
          </div>
        )}
        {isExecuting && logs.length === 0 && (
          <div className="text-gray-500 italic p-4 text-center">
            Preparing to execute pipeline...
          </div>
        )}
        {logs.map((log, index) => (
          <div
            key={index}
            className="p-2 bg-[#252526] rounded border-l-[3px] border-blue-500 flex flex-col gap-1"
          >
            <span className="text-[11px] text-[#858585]">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-[13px] text-[#d4d4d4]">{log.message}</span>
          </div>
        ))}
        {isExecuting && logs.length > 0 && (
          <div className="p-2 bg-[#252526] rounded border-l-[3px] border-green-500 flex flex-col gap-1 animate-pulse">
            Running pipeline...
          </div>
        )}
      </div>
    </div>
  );
};
