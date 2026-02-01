import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertInterview } from "@shared/schema";

// POST /api/interviews
export function useCreateInterview() {
  return useMutation({
    mutationFn: async (data: InsertInterview) => {
      const res = await fetch(api.interviews.create.path, {
        method: api.interviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create interview");
      return api.interviews.create.responses[201].parse(await res.json());
    },
  });
}

// GET /api/interviews/:id
export function useInterview(id: number | string) {
  return useQuery({
    queryKey: [api.interviews.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.interviews.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch interview");
      return api.interviews.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: 5000, // Poll occasionally for status updates
  });
}

// POST /api/interviews/:id/next
export function useNextStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userResponse }: { id: number; userResponse?: string }) => {
      const url = buildUrl(api.interviews.next.path, { id });
      const res = await fetch(url, {
        method: api.interviews.next.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userResponse }),
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      return api.interviews.next.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the interview query to fetch the new messages
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, Number(variables.id)] });
    },
  });
}

// POST /api/interviews/:id/complete
export function useCompleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.interviews.complete.path, { id });
      const res = await fetch(url, {
        method: api.interviews.complete.method,
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to complete interview");
      return api.interviews.complete.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, String(id)] });
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, Number(id)] });
    },
  });
}
