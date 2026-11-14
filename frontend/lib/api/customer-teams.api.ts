import { apiFetch } from "./client";

export interface CustomerTeamRecord {
  id: string;
  name: string;
  note: string | null;
  createdAt: string | null;
  customerCount: number;
}

export async function getCustomerTeams(): Promise<CustomerTeamRecord[]> {
  return apiFetch<CustomerTeamRecord[]>("/customer-teams");
}

export async function createCustomerTeam(data: {
  name: string;
  note?: string;
}): Promise<CustomerTeamRecord> {
  return apiFetch<CustomerTeamRecord>("/customer-teams", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomerTeam(
  id: string,
  patch: { name?: string; note?: string }
): Promise<CustomerTeamRecord> {
  return apiFetch<CustomerTeamRecord>(`/customer-teams/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteCustomerTeam(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/customer-teams/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function assignCustomerTeam(
  customerIds: string[],
  teamId: string | null
): Promise<number> {
  const result = await apiFetch<{ updated: number }>("/customers/team", {
    method: "PATCH",
    body: JSON.stringify({ customerIds, teamId }),
  });
  return result.updated;
}
