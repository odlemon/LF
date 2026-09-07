import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApprovalPack,
  PricingGenerationJob,
  PricingScenario,
  ScenarioComparable,
  SubmitPartnerResponse,
  UpdateScenarioCommand,
} from "./types";

const base = (requestUid: string) =>
  `/api/v1/pricing-requests/${requestUid}/scenarios`;

export async function listScenarios(requestUid: string): Promise<PricingScenario[]> {
  const res = await apiClient.get<PricingScenario[]>(base(requestUid));
  return res.data;
}

export async function getScenario(
  requestUid: string,
  scenarioUid: string
): Promise<PricingScenario> {
  const res = await apiClient.get<PricingScenario>(
    `${base(requestUid)}/${scenarioUid}`
  );
  return res.data;
}

export async function generateScenarios(
  requestUid: string
): Promise<PricingScenario[]> {
  const res = await apiClient.post<PricingScenario[]>(
    `${base(requestUid)}/generate`
  );
  return res.data;
}

export async function startAsyncGenerate(
  requestUid: string
): Promise<PricingGenerationJob> {
  const res = await apiClient.post<PricingGenerationJob>(
    `${base(requestUid)}/generate/async`
  );
  return res.data;
}

export async function getGenerationStatus(
  requestUid: string
): Promise<PricingGenerationJob> {
  const res = await apiClient.get<PricingGenerationJob>(
    `${base(requestUid)}/generation-status`
  );
  return res.data;
}

export async function updateScenario(
  requestUid: string,
  scenarioUid: string,
  command: UpdateScenarioCommand
): Promise<PricingScenario> {
  const res = await apiClient.patch<PricingScenario>(
    `${base(requestUid)}/${scenarioUid}`,
    command
  );
  return res.data;
}

export async function preferScenario(
  requestUid: string,
  scenarioUid: string
): Promise<PricingScenario> {
  const res = await apiClient.post<PricingScenario>(
    `${base(requestUid)}/${scenarioUid}/prefer`
  );
  return res.data;
}

export async function submitScenarioToPartner(
  requestUid: string,
  scenarioUid: string,
  partnerUserUid?: string | null
): Promise<SubmitPartnerResponse> {
  const res = await apiClient.post<SubmitPartnerResponse>(
    `${base(requestUid)}/${scenarioUid}/submit-partner`,
    partnerUserUid ? { partnerUserUid } : {}
  );
  return res.data;
}

export async function listPricingApprovers(): Promise<
  import("./types").PricingApprover[]
> {
  const res = await apiClient.get<import("./types").PricingApprover[]>(
    "/api/v1/pricing-approvers"
  );
  return res.data;
}

export async function approveScenario(
  requestUid: string,
  scenarioUid: string,
  comment?: string
): Promise<PricingScenario> {
  const res = await apiClient.post<PricingScenario>(
    `${base(requestUid)}/${scenarioUid}/approve`,
    { comment }
  );
  return res.data;
}

export async function rejectScenario(
  requestUid: string,
  scenarioUid: string,
  comment?: string
): Promise<PricingScenario> {
  const res = await apiClient.post<PricingScenario>(
    `${base(requestUid)}/${scenarioUid}/reject`,
    { comment }
  );
  return res.data;
}

export async function getScenarioComparables(
  requestUid: string,
  scenarioUid: string
): Promise<ScenarioComparable[]> {
  const res = await apiClient.get<ScenarioComparable[]>(
    `${base(requestUid)}/${scenarioUid}/comparables`
  );
  return res.data;
}

export async function getApprovalPack(scenarioUid: string): Promise<ApprovalPack> {
  const res = await apiClient.get<ApprovalPack>(
    ENDPOINTS.PRICING_APPROVAL_PACK(scenarioUid)
  );
  return res.data;
}

export async function returnScenario(
  requestUid: string,
  scenarioUid: string,
  comment?: string
): Promise<PricingScenario> {
  const res = await apiClient.post<PricingScenario>(
    `${base(requestUid)}/${scenarioUid}/return`,
    { comment }
  );
  return res.data;
}
