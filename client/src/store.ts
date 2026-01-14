import { create } from "zustand";

interface Tool {
  id: string;
  name: string;
  description: string;
  endpoint: string;
}

interface ToolStore {
  tools: Tool[];
  selectedTool: Tool | null;
  selectTool: (tool: Tool) => void;
  clearSelection: () => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  tools: [
    {
      id: "extract-text",
      name: "Extract Text",
      description: "Pull all text from your PDF in seconds.",
      endpoint: "/api/pdf/extract-text",
    },
    {
      id: "convert-images",
      name: "Convert to Images",
      description: "Save each page as a high-quality image.",
      endpoint: "/api/pdf/convert-to-images",
    },
    {
      id: "merge",
      name: "Merge PDFs",
      description: "Combine multiple PDFs into one.",
      endpoint: "/api/pdf/merge",
    },
    {
      id: "split",
      name: "Split PDF",
      description: "Separate pages or ranges into new files.",
      endpoint: "/api/pdf/split",
    },
    {
      id: "compress",
      name: "Compress",
      description: "Reduce file size without losing quality.",
      endpoint: "/api/pdf/compress",
    },
  ],
  selectedTool: null,
  selectTool: (tool: Tool) => set({ selectedTool: tool }),
  clearSelection: () => set({ selectedTool: null }),
}));

interface UIStore {
  isDark: boolean;
  toggleDark: () => void;
  showProcessing: boolean;
  showResults: boolean;
  setShowProcessing: (show: boolean) => void;
  setShowResults: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDark: false,
  toggleDark: () => set((state) => ({ isDark: !state.isDark })),
  showProcessing: false,
  showResults: false,
  setShowProcessing: (show: boolean) => set({ showProcessing: show }),
  setShowResults: (show: boolean) => set({ showResults: show }),
}));
