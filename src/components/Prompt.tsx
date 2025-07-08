import React, { useState, useEffect } from "react";

interface PromptProps {
  open: boolean;
  label: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
  className?: string;
}

export const Prompt: React.FC<PromptProps> = ({
  open,
  label,
  onSubmit,
  onClose,
  className,
}) => {
  const [val, setVal] = useState("");

  useEffect(() => {
    if (open) {
      setVal("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (val.trim()) {
      onSubmit(val.trim());
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 ${className}`}>
      <div className="bg-white dark:bg-gray-800 p-6 w-80 rounded-xl shadow-lg flex flex-col gap-4">
        <label className="font-medium text-gray-700 dark:text-gray-200">{label}</label>
        <input
          autoFocus
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none dark:bg-gray-700 dark:text-white"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={!val.trim()}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
