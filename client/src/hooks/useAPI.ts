import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/health`);
      if (!res.ok) throw new Error("Health check failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useProcessPDF = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      tool,
    }: {
      file: File;
      tool: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/pdf${tool}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Processing failed");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health"] });
    },
  });
};

export const usePDFHealth = () => {
  return useQuery({
    queryKey: ["pdf-health"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/pdf/health`);
      if (!res.ok) throw new Error("PDF service unavailable");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
};
