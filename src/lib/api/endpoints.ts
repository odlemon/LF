export const ENDPOINTS = {
  DEMO_REQUESTS: {
    SUBMIT: "/v1/demo-requests",
    LIST: "/api/v1/admin/demo-requests",
    DETAIL: (uid: string) => `/api/v1/admin/demo-requests/${uid}`,
    UPDATE: (uid: string) => `/api/v1/admin/demo-requests/${uid}`,
  },
  MATTER_LEARNINGS: {
    BASE: "/v1/matter-learnings",
    BY_UID: (uid: string) => `/v1/matter-learnings/${uid}`,
  },
  AUTH: {
    LOGIN: "/v1/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/v1/auth/me",
    PASSWORD_RESET_REQUEST: "/v1/auth/password-reset/request",
    PASSWORD_RESET_REQUEST_PORTAL: "/v1/auth/password-reset/portal/request",
    // Shared: the token already identifies which account it belongs to.
    PASSWORD_RESET_CONFIRM: "/v1/auth/password-reset/confirm",
  },
  CLIENT_AUTH: {
    LOGIN: "/api/client-auth/login",
    LOGOUT: "/api/client-auth/logout",
    ME: "/api/client-auth/me",
  },
  PORTAL_ACCOUNT: {
    ME: "/api/v1/portal/me",
    UPDATE_ME: "/api/v1/portal/me",
    CHANGE_PASSWORD: "/api/v1/portal/me/password",
  },
  PRICING_REQUESTS: {
    LIST: "/api/v1/pricing-requests",
    CREATE: "/api/v1/pricing-requests",
    DETAIL: (uid: string) => `/api/v1/pricing-requests/${uid}`,
    CANCEL: (uid: string) => `/api/v1/pricing-requests/${uid}/cancel`,
    MESSAGES: (uid: string) => `/api/v1/pricing-requests/${uid}/messages`,
    MESSAGES_STREAM: (uid: string) => `/api/v1/pricing-requests/${uid}/messages/stream`,
    ATTACHMENTS: (uid: string) => `/api/v1/pricing-requests/${uid}/attachments`,
    ATTACHMENT: (uid: string, attachmentUid: string) =>
      `/api/v1/pricing-requests/${uid}/attachments/${attachmentUid}`,
    SCOPE: (uid: string) => `/api/v1/pricing-requests/${uid}/scope`,
    CONFIRM_SCOPE: (uid: string) => `/api/v1/pricing-requests/${uid}/scope/confirm`,
    RESET_SCOPE: (uid: string) => `/api/v1/pricing-requests/${uid}/scope/reset`,
    RESTORE_SCOPE: (uid: string) => `/api/v1/pricing-requests/${uid}/scope/restore`,
    PHASES: (uid: string) => `/api/v1/pricing-requests/${uid}/scope/phases`,
    PHASE: (uid: string, phaseUid: string) =>
      `/api/v1/pricing-requests/${uid}/scope/phases/${phaseUid}`,
    TASKS: (uid: string, phaseUid: string) =>
      `/api/v1/pricing-requests/${uid}/scope/phases/${phaseUid}/tasks`,
    TASK: (uid: string, phaseUid: string, taskUid: string) =>
      `/api/v1/pricing-requests/${uid}/scope/phases/${phaseUid}/tasks/${taskUid}`,
    ASSUMPTIONS: (uid: string) => `/api/v1/pricing-requests/${uid}/scope/assumptions`,
    ASSUMPTION: (uid: string, assumptionUid: string) =>
      `/api/v1/pricing-requests/${uid}/scope/assumptions/${assumptionUid}`,
    SCENARIOS: (uid: string) => `/api/v1/pricing-requests/${uid}/scenarios`,
    SCENARIOS_GENERATE: (uid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/generate`,
    SCENARIOS_GENERATE_ASYNC: (uid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/generate/async`,
    SCENARIOS_GENERATION_STATUS: (uid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/generation-status`,
    SCENARIOS_GENERATE_STREAM: (uid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/generate/stream`,
    SCENARIO: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}`,
    SCENARIO_PREFER: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}/prefer`,
    SCENARIO_SUBMIT_PARTNER: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}/submit-partner`,
    SCENARIO_APPROVE: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}/approve`,
    SCENARIO_REJECT: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}/reject`,
    SCENARIO_RETURN: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}/return`,
    SCENARIO_COMPARABLES: (uid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${uid}/scenarios/${scenarioUid}/comparables`,
  },
  PRICING_APPROVERS: "/api/v1/pricing-approvers",
  PRICING_APPROVAL_PACK: (scenarioUid: string) =>
    `/api/v1/pricing-approvals/${scenarioUid}/pack`,
  NOTIFICATIONS: {
    LIST: "/api/v1/me/notifications",
    UNREAD_COUNT: "/api/v1/me/notifications/unread-count",
    MARK_READ: (uid: string) => `/api/v1/me/notifications/${uid}/read`,
    MARK_ALL_READ: "/api/v1/me/notifications/read-all",
    STREAM: "/api/v1/me/notifications/stream",
  },
  NEGOTIATIONS: {
    LIST: "/api/v1/negotiations",
    DETAIL: (uid: string) => `/api/v1/negotiations/${uid}`,
    COUNTER: (uid: string) => `/api/v1/negotiations/${uid}/counter`,
    ACCEPT_COUNTER: (uid: string) => `/api/v1/negotiations/${uid}/accept-counter`,
    REJECT: (uid: string) => `/api/v1/negotiations/${uid}/reject`,
    WITHDRAW: (uid: string) => `/api/v1/negotiations/${uid}/withdraw`,
    AI_SUGGEST: (uid: string) => `/api/v1/negotiations/${uid}/ai/suggest`,
    AI_MESSAGES: (uid: string) => `/api/v1/negotiations/${uid}/ai/messages`,
    AI_MESSAGES_STREAM: (uid: string) =>
      `/api/v1/negotiations/${uid}/ai/messages/stream`,
    ENGAGEMENT_PACK: (uid: string) =>
      `/api/v1/negotiations/${uid}/engagement-pack`,
    ENGAGEMENT_PACK_SEND: (uid: string) =>
      `/api/v1/negotiations/${uid}/engagement-pack/send`,
    SEND_TO_CLIENT: (requestUid: string, scenarioUid: string) =>
      `/api/v1/pricing-requests/${requestUid}/scenarios/${scenarioUid}/send-to-client`,
    PORTAL_LIST: "/api/v1/portal/negotiations",
    PORTAL_DETAIL: (uid: string) => `/api/v1/portal/negotiations/${uid}`,
    PORTAL_ACCEPT: (uid: string) => `/api/v1/portal/negotiations/${uid}/accept`,
    PORTAL_REJECT: (uid: string) => `/api/v1/portal/negotiations/${uid}/reject`,
    PORTAL_COUNTER: (uid: string) => `/api/v1/portal/negotiations/${uid}/counter`,
    PORTAL_AI_SUGGEST: (uid: string) => `/api/v1/portal/negotiations/${uid}/ai/suggest`,
    PORTAL_AI_MESSAGES: (uid: string) =>
      `/api/v1/portal/negotiations/${uid}/ai/messages`,
    PORTAL_AI_MESSAGES_STREAM: (uid: string) =>
      `/api/v1/portal/negotiations/${uid}/ai/messages/stream`,
    PORTAL_ENGAGEMENT_PACK: (uid: string) =>
      `/api/v1/portal/negotiations/${uid}/engagement-pack`,
    PORTAL_ENGAGEMENT_PACK_ACK: (uid: string) =>
      `/api/v1/portal/negotiations/${uid}/engagement-pack/acknowledge`,
  },
  CLIENTS: {
    LIST: "/api/clients",
    DETAIL: (id: string) => `/api/clients/${id}`,
  },
  USERS: {
    LIST: "/api/v1/users",
    CREATE: "/api/v1/users",
    DETAIL: (uid: string) => `/api/v1/users/${uid}`,
    DEACTIVATE: (uid: string) => `/api/v1/users/${uid}/deactivate`,
    ASSIGN_ROLE: (userUid: string, roleUid: string) => `/api/v1/users/${userUid}/roles/${roleUid}`,
    REMOVE_ROLE: (userUid: string, roleUid: string) => `/api/v1/users/${userUid}/roles/${roleUid}`,
  },
  ROLES: {
    LIST: "/api/v1/roles",
    CREATE: "/api/v1/roles",
    ASSIGN_PERMISSIONS: (roleUid: string) => `/api/v1/roles/${roleUid}/permissions`,
    PERMISSIONS: "/api/v1/permissions",
  },
  FIRM: {
    DETAILS: (uid: string) => `/v1/firms/${uid}`,
    UPDATE: (uid: string) => `/v1/firms/${uid}`,
    PRACTICE_AREAS: "/v1/practice-areas",
    PRACTICE_AREA_DEACTIVATE: (uid: string) => `/v1/practice-areas/${uid}/deactivate`,
    FEE_EARNER_LEVELS: "/v1/fee-earner-levels",
    RATE_CARDS: "/v1/rate-cards",
    RATE_CARD_ACTIVATE: (uid: string) => `/v1/rate-cards/${uid}/activate`,
    RATE_CARD_ENTRIES: (uid: string) => `/v1/rate-cards/${uid}/entries`,
    FX_RATES: "/v1/fx-rates",
    FX_RATE_DETAIL: (uid: string) => `/v1/fx-rates/${uid}`,
    APPROVAL_MATRIX: "/v1/firm/approval-matrix",
    CLIENTS: "/api/v1/clients",
    CLIENT_DETAIL: (uid: string) => `/api/v1/clients/${uid}`,
    CLIENT_INVITE: (uid: string) => `/v1/clients/${uid}/portal-users`,
    GUARDRAILS: "/v1/firm/guardrails",
  },
  AUDIT_TRAIL: {
    BASE: "/v1/audit-trail",
    BY_UID: (uid: string) => `/v1/audit-trail/${uid}`,
  },
  DATA_ROOM: {
    SUMMARY: '/v1/data-room/summary',
    DATASETS: '/v1/data-room/datasets',
    DATASET_BY_UID: (uid: string) => `/v1/data-room/datasets/${uid}`,
    DATASET_DOCUMENTS: (uid: string) => `/v1/data-room/datasets/${uid}/documents`,
    DATASET_DOCUMENTS_BATCH: (uid: string) => `/v1/data-room/datasets/${uid}/documents/batch`,
    DOCUMENTS: '/v1/data-room/documents',
    DOCUMENT_BY_UID: (uid: string) => `/v1/data-room/documents/${uid}`,
    DOCUMENT_LOG: (uid: string) => `/v1/data-room/documents/${uid}/processing-logs`,
    DOCUMENT_RETRY: (uid: string) => `/v1/data-room/documents/${uid}/reprocess`,
    DOCUMENT_MAPPING: (uid: string) => `/v1/data-room/documents/${uid}/column-mapping`,
    RECORDS_PAST_MATTERS: '/v1/data-room/records/past-matters',
    RECORDS_TIME_ENTRIES: '/v1/data-room/records/time-entries',
    RECORDS_BILLING: '/v1/data-room/records/billing-history',
    RECORDS_RATE_HISTORY: '/v1/data-room/records/rate-card-history',
    RECORDS_BENCHMARKS: '/v1/data-room/records/market-benchmarks',
    MAPPING_TEMPLATES: '/v1/data-room/mapping-templates',
    MAPPING_TEMPLATE_DEFAULT: (uid: string) => `/v1/data-room/mapping-templates/${uid}/set-default`,
    FILE_STORAGE: '/v1/file-storage',
    FILE_STORAGE_BY_UID: (uid: string) => `/v1/file-storage/${uid}`,
    FILE_STORAGE_DOWNLOAD: (uid: string) => `/v1/file-storage/${uid}/download`,
    PMS_CONNECTORS: '/v1/data-room/pms-connectors',
    PMS_CONNECTOR_SYNC_NOW: (uid: string) => `/v1/data-room/pms-connectors/${uid}/sync-now`,
    PMS_CONNECTOR_TEST: (uid: string) => `/v1/data-room/pms-connectors/${uid}/test-connection`,
  },
  SSO: {
    IDENTITY_PROVIDERS: '/v1/sso/identity-providers',
    IDENTITY_PROVIDER_BY_UID: (uid: string) => `/v1/sso/identity-providers/${uid}`,
    VERIFY_ISSUER: '/v1/sso/identity-providers/verify-issuer',
    REDIRECT_URI: '/v1/sso/identity-providers/redirect-uri',
  },
  AI_CONFIG: {
    PROVIDERS: '/api/v1/ai-config/providers',
    ACTIVE: '/api/v1/ai-config/providers/active',
    BY_UID: (uid: string) => `/api/v1/ai-config/providers/${uid}`,
    ACTIVATE: (uid: string) => `/api/v1/ai-config/providers/${uid}/activate`,
    TEST: (uid: string) => `/api/v1/ai-config/providers/${uid}/test`,
    HEALTH: '/api/v1/ai-config/providers/health',
  },
  VOLUME_DISCOUNT: {
    LIST: '/v1/volume-discount-programs',
    CREATE: '/v1/volume-discount-programs',
    DETAIL: (uid: string) => `/v1/volume-discount-programs/${uid}`,
    UPDATE: (uid: string) => `/v1/volume-discount-programs/${uid}`,
    ACTIVATE: (uid: string) => `/v1/volume-discount-programs/${uid}/activate`,
    SPEND: (uid: string) => `/v1/volume-discount-programs/${uid}/spend`,
    DASHBOARD: (uid: string) => `/v1/volume-discount-programs/${uid}/dashboard`,
    PORTAL_LIST: '/v1/volume-discount-programs/portal/my-programs',
    PORTAL_DASHBOARD: (uid: string) => `/v1/volume-discount-programs/portal/my-programs/${uid}/dashboard`,
    PANEL_AGREEMENT: (uid: string) => `/v1/volume-discount-programs/${uid}/panel-agreement`,
    PANEL_SECONDMENT_USAGE: (uid: string) => `/v1/volume-discount-programs/${uid}/panel-agreement/secondment-usage`,
    PANEL_MFN_CHECK: (uid: string) => `/v1/volume-discount-programs/${uid}/panel-agreement/mfn-check`,
  },
  ANALYTICS: {
    FIRM_SUMMARY: "/api/v1/analytics/firm-summary",
    PRACTICE_AREA: (practiceAreaUid: string) =>
      `/api/v1/analytics/practice-areas/${practiceAreaUid}`,
    PRACTICE_AREA_LEADERBOARD: "/api/v1/analytics/practice-areas",
    CLIENT_LEADERBOARD: "/api/v1/analytics/clients",
    NEGOTIATION_RATE_INTELLIGENCE: (negotiationUid: string) =>
      `/api/v1/analytics/negotiations/${negotiationUid}/rate-intelligence`,
    CLIENT_INTELLIGENCE: (clientProfileUid: string) =>
      `/api/v1/analytics/clients/${clientProfileUid}/intelligence`,
    EXPORT_XLSX: "/api/v1/analytics/export.xlsx",
    BOARD_PACK_PDF: "/api/v1/analytics/board-pack.pdf",
    PARTNER_CONSISTENCY: "/api/v1/analytics/partner-consistency",
    ANOMALY_EFFECTIVENESS: "/api/v1/analytics/anomalies/effectiveness",
    ANOMALY_THRESHOLDS: "/api/v1/analytics/anomalies/thresholds",
    DIGEST_PREVIEW: "/api/v1/analytics/digest/preview",
    WIN_RATE: "/api/v1/analytics/win-rate",
    PROPOSAL_PERFORMANCE: "/api/v1/analytics/proposal-performance",
    CLIENT: (clientProfileUid: string) => `/api/v1/analytics/clients/${clientProfileUid}`,
    MATTER: (uid: string) => `/api/v1/analytics/matters/${uid}`,
    RATE_COMPLIANCE: "/api/v1/analytics/rate-compliance",
    RATE_RECOMMENDATIONS: "/api/v1/analytics/rate-recommendations",
    ANOMALIES: "/api/v1/analytics/anomalies",
    ANOMALY: (uid: string) => `/api/v1/analytics/anomalies/${uid}`,
    ANOMALY_RESOLVE: (uid: string) => `/api/v1/analytics/anomalies/${uid}/resolve`,
    ADVISOR_MESSAGES: "/api/v1/analytics/advisor/messages",
    ADVISOR_HISTORY: "/api/v1/analytics/advisor/history",
  },
  BILLING: {
    ACCOUNT: "/v1/billing/account",
    TRANSACTIONS: "/v1/billing/transactions",
    TRANSACTIONS_RECENT: "/v1/billing/transactions/recent",
    USAGE_SUMMARY: "/v1/billing/usage/summary",
    ADJUST: "/v1/billing/adjust",
  },
  METERING: {
    SUMMARY: "/v1/billing/metering/summary",
    BY_OFFICE: "/v1/billing/metering/by-office",
    BY_PRACTICE_AREA: "/v1/billing/metering/by-practice-area",
    BY_CLIENT: "/v1/billing/metering/by-client",
    BY_USER: "/v1/billing/metering/by-user",
    AI_DETAIL: "/v1/billing/metering/ai-detail",
    TREND: "/v1/billing/metering/trend",
    STATEMENT: "/v1/billing/metering/statement",
    STATEMENT_CSV: "/v1/billing/metering/statement.csv",
    STATEMENT_PDF: "/v1/billing/metering/statement.pdf",
    CONTRACT: "/v1/billing/metering/contract",
    ADMIN_FIRMS: "/v1/billing/metering/admin/firms",
    ADMIN_FIRM_STATEMENT: (firmUid: string) =>
      `/v1/billing/metering/admin/firms/${firmUid}/statement`,
    ADMIN_FIRM_STATEMENT_PDF: (firmUid: string) =>
      `/v1/billing/metering/admin/firms/${firmUid}/statement.pdf`,
  },
} as const;

