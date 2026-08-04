export const PricingRequestStatus = {
  DRAFT: "DRAFT",
  IN_PROGRESS: "IN_PROGRESS",
  SCOPE_GENERATED: "SCOPE_GENERATED",
  SCOPE_CONFIRMED: "SCOPE_CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type PricingRequestStatusEnum =
  (typeof PricingRequestStatus)[keyof typeof PricingRequestStatus];
