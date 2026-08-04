export type SecurityCertification = {
  id: string;
  shortLabel: string;
  fullLabel: string;
  summary: string;
  /** Official framework / standards site (same destinations Harvey uses). */
  externalHref: string;
};

/** Order and external links mirror Harvey’s enterprise cert strip. */
export const SECURITY_CERTIFICATIONS: SecurityCertification[] = [
  {
    id: "soc-2",
    shortLabel: "SOC 2 II",
    fullLabel: "SOC 2 Type II",
    summary:
      "Annual independent audit of security, availability, and confidentiality controls across the Lysp platform and operations.",
    externalHref:
      "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
  },
  {
    id: "ccpa",
    shortLabel: "CCPA",
    fullLabel: "CCPA",
    summary:
      "California privacy commitments for applicable personal information processed through Lysp on behalf of the firm.",
    externalHref: "https://oag.ca.gov/privacy/ccpa",
  },
  {
    id: "iso-27001",
    shortLabel: "ISO 27001",
    fullLabel: "ISO 27001",
    summary:
      "Information security management system covering risk assessment, access control, cryptography, and continuous improvement.",
    externalHref: "https://www.iso.org/standard/27001",
  },
  {
    id: "gdpr",
    shortLabel: "GDPR",
    fullLabel: "GDPR",
    summary:
      "European data-protection obligations: lawful processing, data subject rights, subprocessors, and transfer safeguards.",
    externalHref: "https://commission.europa.eu/law/law-topic/data-protection_en",
  },
  {
    id: "iso-27701",
    shortLabel: "ISO 27701",
    fullLabel: "ISO 27701",
    summary:
      "Privacy extension to ISO 27001 - how we govern personal data processing for firm users and client-facing workflows.",
    externalHref: "https://www.iso.org/standard/27701",
  },
  {
    id: "iso-42001",
    shortLabel: "ISO 42001",
    fullLabel: "ISO 42001",
    summary:
      "AI management system controls for responsible development, deployment, and oversight of AI used in pricing workflows.",
    externalHref: "https://www.iso.org/standard/42001",
  },
];
