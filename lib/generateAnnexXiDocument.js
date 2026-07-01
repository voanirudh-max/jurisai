import {
  DOCUMENT_SECTION_SKELETON,
  computeEnergyReconciliation,
  postProcessGeneratedDocument,
} from "./annexXiDeterminism.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export const EU_MEMBER_STATES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

const SYSTEM_PROMPT = `You are an EU AI Act compliance expert. Generate a formal Annex XI technical documentation package under Regulation (EU) 2024/1689 Article 53(1)(a). Output must be structured, precise, and regulation-compliant. Use formal legal document formatting with clear section headers.

DOCUMENT NUMBERING (v1.1) — FIXED SKELETON:
Use EXACTLY this section and subsection numbering. Do not renumber, skip, or merge sections. Cross-references (e.g. "see Section 9.3") MUST use only numbers from this skeleton:
${DOCUMENT_SECTION_SKELETON}
(Additional supplementary sections may follow as 10+ if needed.)

FORMATTING REQUIREMENTS:
- Use clean markdown only: # / ## / ### for headings, **bold** for emphasis, GitHub-flavored tables for tabular data, ordered or unordered lists for enumerations, and --- for section breaks.
- DO NOT produce ASCII art, box diagrams, character-based illustrations, or any drawing made from |, -, +, =, box-drawing or block characters used as diagrams.
- Use ASCII-safe notation throughout. Write compute as 10^25 FLOPs or GPU-hours; parameter counts as 7 x 10^9; multiplication as "x" not the unicode multiply sign; CO2e not CO₂e; arrows as " -> " not unicode arrows. Never use superscript digits, subscripts, or unicode multiplication signs.
- When describing pipelines, use " -> " separators or numbered lists. Never use Unicode arrows.
- Tables must be valid GitHub-flavored markdown with a separator row.

SECTION 1 — PROVIDER IDENTIFICATION (REQUIRED FIRST NUMBERED SECTION):
Generate "## 1. Provider Identification" as the first numbered section, before any model description. Include a regulator-grade identity table covering:
- Provider legal name
- Trade name / brand (if different from legal name)
- Legal form
- Registered address
- Country of establishment
- Provider contact email
- Company registration number and VAT/tax number (if provided)
- Compliance contact details (if provided)

Include an explicit Article 54 authorised-representative statement under "### 1.3 Authorised Representative (Article 54)". If the provider is established outside the EU, name the authorised representative with address and contact email (mandatory under Article 54(1)). If EU-established, state under 1.3 that Article 54 appointment does not apply. If a representative table is used, label the representative country field exactly "Representative's Country of Establishment". The provider table must use "Country of Establishment".

SECTION 6 — ENERGY AND COMPUTE DISCLOSURES:
Generate "## 6. Energy and Compute Disclosures" after Training Data Governance and before Evaluation. Include "### 6.1 Energy Methodology" as a placeholder heading only — the four-step methodology narrative (GPU draw, PUE adjustment, declared total, CO2e) is injected post-generation from server-computed values. Do NOT invent energy reconciliation math and do NOT include CO2e attribution disclaimers (those are injected post-generation). Cover other Annex XI Section 1(j) fields: total training energy (kWh), training compute with unit, infrastructure/data center locations, estimated CO2e emissions (tonnes), and inference energy per query. Use plain ASCII: CO2e, x for multiplication.

SECTION 8 — RED-TEAMING AND ADVERSARIAL EVALUATION:
Generate "## 8. Red-Teaming and Adversarial Evaluation" after Evaluation and before Intended Purpose. Cover Annex XI Section 2 adversarial testing: approach (internal/external/both/none), adversarial categories tested, team composition and qualifications, methodology summary, findings and mitigations, residual risks, and exercise dates.

SECTION 9 — INTENDED PURPOSE (formerly Section 7):
Generate three subsections:
### 9.1 Intended Use Cases — reference Article 53(1)(a)
### 9.2 Prohibited Use Cases — include this heading only; Article 5(1) prohibited-practices list and contractual prohibitions are injected post-generation. Do NOT generate, paraphrase, or renumber Article 5(1)(a) through 5(1)(h).
### 9.3 High-Risk Classification (per Annex III) — reference Article 6

Use formal compliance documentation tone throughout.`;

function modalitiesList(modalities) {
  if (!modalities || typeof modalities !== "object") return "None selected";
  const on = Object.entries(modalities)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k);
  return on.length ? on.join(", ") : "None selected";
}

function cleanText(value) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : "(not provided)";
}

function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return "(not provided)";
  return String(value);
}

function renderProviderIdentification(providerName, identity) {
  if (!identity || typeof identity !== "object") {
    return `Provider legal name: ${cleanText(providerName)}
Provider identification details: (not provided)`;
  }

  const countryOfEstablishment =
    typeof identity.countryOfEstablishment === "string"
      ? identity.countryOfEstablishment.trim()
      : "";
  const isEUEstablished = EU_MEMBER_STATES.includes(countryOfEstablishment);
  const legalName = cleanText(identity.legalName || providerName);

  const lines = [
    `Provider legal name: ${legalName}`,
    `Trade name / brand: ${cleanText(identity.tradeName)}`,
    `Legal form: ${cleanText(identity.legalForm)}`,
    `Registered address: ${cleanText(identity.registeredAddress)}`,
    `Country of establishment: ${cleanText(countryOfEstablishment)}`,
    `Provider contact email: ${cleanText(identity.contactEmail)}`,
    `Company registration number: ${cleanText(identity.companyRegistrationNumber)}`,
    `VAT / tax number: ${cleanText(identity.vatNumber)}`,
    `Compliance contact name: ${cleanText(identity.complianceContactName)}`,
    `Compliance contact role: ${cleanText(identity.complianceContactRole)}`,
    `Compliance contact email: ${cleanText(identity.complianceContactEmail)}`,
  ];

  if (!countryOfEstablishment) {
    lines.push(
      "EU establishment status: Undetermined pending country selection.",
      "Article 54 authorised representative: Cannot be assessed until country of establishment is provided.",
    );
  } else if (!isEUEstablished) {
    const rep =
      identity.authorisedRepresentative &&
      typeof identity.authorisedRepresentative === "object"
        ? identity.authorisedRepresentative
        : {};
    lines.push(
      "EU establishment status: Provider is established outside the EU.",
      "Article 54 authorised representative: Required for non-EU GPAI providers (Article 54(1)).",
      `Authorised representative name: ${cleanText(rep.name)}`,
      `Authorised representative address: ${cleanText(rep.address)}`,
      `Authorised representative contact email: ${cleanText(rep.contactEmail)}`,
    );
  } else {
    lines.push(
      "EU establishment status: Provider is established within the EU.",
      "Article 54 authorised representative: Not required because the provider is EU-established.",
    );
  }

  return lines.map((line) => `- ${line}`).join("\n");
}

function renderEnergyDisclosures(energy) {
  if (!energy || typeof energy !== "object") return "(not provided)";
  const compute =
    energy.trainingComputeValue && energy.trainingComputeUnit
      ? `${energy.trainingComputeValue} ${energy.trainingComputeUnit}`
      : "(not provided)";
  return [
    `- Total training energy consumed (kWh): ${cleanNumber(energy.totalTrainingEnergyKwh)}`,
    `- Training compute: ${compute}`,
    `- Training infrastructure / data center location(s): ${cleanText(energy.trainingInfrastructureLocations)}`,
    `- Estimated CO2e emissions from training (tonnes): ${cleanNumber(energy.estimatedCo2eTonnes)}`,
    `- Methodology for energy estimate: ${cleanText(energy.energyMethodology)}`,
    `- Inference energy per query: ${cleanText(energy.inferenceEnergyPerQuery)}`,
  ].join("\n");
}

function renderRedTeaming(redTeam) {
  if (!redTeam || typeof redTeam !== "object") return "(not provided)";
  const categories = Array.isArray(redTeam.adversarialCategories)
    ? redTeam.adversarialCategories.filter((c) => typeof c === "string" && c.trim())
    : [];
  const custom =
    typeof redTeam.customAdversarialCategories === "string"
      ? redTeam.customAdversarialCategories.trim()
      : "";
  const allCategories = custom
    ? [...categories, ...custom.split(",").map((c) => c.trim()).filter(Boolean)]
    : categories;

  return [
    `- Red-teaming approach: ${cleanText(redTeam.approach)}`,
    `- Adversarial categories covered: ${allCategories.length ? allCategories.join(", ") : "(none selected)"}`,
    `- Red-team composition and qualifications: ${cleanText(redTeam.teamComposition)}`,
    `- Methodology summary: ${cleanText(redTeam.methodologySummary)}`,
    `- Summary of findings and mitigations: ${cleanText(redTeam.findingsAndMitigations)}`,
    `- Residual risks identified: ${cleanText(redTeam.residualRisks)}`,
    `- Date(s) of red-teaming exercise: ${cleanText(redTeam.exerciseDates)}`,
  ].join("\n");
}

function renderUseCases(group) {
  if (!group || typeof group !== "object") return "(not provided)";
  const categories = Array.isArray(group.selectedCategories)
    ? group.selectedCategories.filter((c) => typeof c === "string" && c.trim())
    : [];
  const description =
    typeof group.customDescription === "string" ? group.customDescription.trim() : "";

  if (!categories.length && !description) return "(not provided)";

  const lines = [];
  if (categories.length) {
    lines.push(...categories.map((c) => `  - ${c}`));
  }
  if (description) {
    if (lines.length) lines.push("");
    lines.push(`  Additional description: ${description}`);
  }
  return `\n${lines.join("\n")}`;
}

function renderHighRiskClassification(hrc) {
  if (!hrc || typeof hrc !== "object") return "(not provided)";

  if (hrc.isHighRisk === true) {
    const categories = Array.isArray(hrc.applicableCategories)
      ? hrc.applicableCategories.filter((c) => typeof c === "string" && c.trim())
      : [];
    if (!categories.length) {
      return "\n  Classified as high-risk under Annex III, but no categories were selected by the provider.\n  (high-risk indicated but no categories selected)";
    }
    const justifications =
      hrc.justifications && typeof hrc.justifications === "object"
        ? hrc.justifications
        : {};
    const lines = [
      "  Classified as high-risk under Annex III for the following categories:",
    ];
    for (const category of categories) {
      const j =
        typeof justifications[category] === "string"
          ? justifications[category].trim()
          : "";
      lines.push(`  - ${category}`);
      lines.push(`      Justification: ${j || "(no justification provided)"}`);
    }
    return `\n${lines.join("\n")}`;
  }

  if (hrc.isHighRisk === false) {
    const j =
      typeof hrc.notHighRiskJustification === "string"
        ? hrc.notHighRiskJustification.trim()
        : "";
    return `\n  Not classified as high-risk under Annex III. Justification: ${
      j || "(no justification provided)"
    }`;
  }

  return "(not provided)";
}

export function buildUserMessage(body) {
  const m = modalitiesList(body.modalities);
  const providerBlock = renderProviderIdentification(
    body.providerName,
    body.providerLegalIdentity,
  );
  const energyBlock = renderEnergyDisclosures(body.energyDisclosures);
  const { factsForPrompt } = computeEnergyReconciliation(body.energyDisclosures);
  const redTeamBlock = renderRedTeaming(body.redTeaming);
  const intendedBlock = renderUseCases(body.intendedUseCases);
  const prohibitedBlock = renderUseCases(body.prohibitedUseCases);
  const highRiskBlock = renderHighRiskClassification(body.highRiskClassification);

  return `Generate a complete Annex XI technical documentation package for the following GPAI model.

SECTION 1 — PROVIDER IDENTIFICATION (render as "## 1. Provider Identification" first)
${providerBlock}

MODEL OVERVIEW (render as "## 2. Model Overview")
- Model name: ${body.modelName ?? "(not provided)"}
- Provider display name: ${body.providerName ?? "(not provided)"}
- Version number: ${body.versionNumber ?? "(not provided)"}
- Release date: ${body.releaseDate ?? "(not provided)"}

ARCHITECTURE (render as "## 3. Model Architecture and System Design")
- Model architecture: ${body.modelArchitecture ?? "(not provided)"}
- Number of parameters: ${body.numberOfParameters ?? "(not provided)"}
- Modalities: ${m}

TRAINING PROCESS (render as "## 4. Training Process")
- Pre-training description: ${body.preTrainingDescription ?? "(not provided)"}
- Fine-tuning description: ${body.fineTuningDescription ?? "(not provided)"}
- Alignment techniques (RLHF / DPO / other): ${body.alignmentTechniques ?? "(not provided)"}
- Total FLOPs estimate: ${body.totalFlopsEstimate ?? "(not provided)"}

TRAINING DATA (render as "## 5. Training Data Governance")
- Data sources: ${body.dataSources ?? "(not provided)"}
- Data collection method: ${body.dataCollectionMethod ?? "(not provided)"}
- Filtering and preprocessing applied: ${body.filteringPreprocessing ?? "(not provided)"}
- Human vs synthetic data ratio: ${body.humanVsSyntheticRatio ?? "(not provided)"}

ENERGY AND COMPUTE DISCLOSURES (render as "## 6. Energy and Compute Disclosures" after training data, before evaluation)
${energyBlock}

SERVER-COMPUTED ENERGY RECONCILIATION (for Section 6.1 — do not recalculate; these values are authoritative):
${factsForPrompt}

EVALUATION (render as "## 7. Evaluation and Benchmarking")
- Benchmarks used: ${body.benchmarksUsed ?? "(not provided)"}
- Evaluation results summary: ${body.evaluationResultsSummary ?? "(not provided)"}
- Known limitations: ${body.knownLimitations ?? "(not provided)"}

RED-TEAMING (render as "## 8. Red-Teaming and Adversarial Evaluation" after evaluation)
${redTeamBlock}

INTENDED PURPOSE (render as "## 9. Intended Purpose and Use Restrictions")
9.1 — Intended use cases:${intendedBlock}

9.2 — Prohibited use cases (contractual only; Article 5 list is injected server-side):${prohibitedBlock}

9.3 — High-risk classification (per Annex III):${highRiskBlock}`;
}

export class GenerateAnnexXiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "GenerateAnnexXiError";
    this.status = status;
  }
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504, 529]);
const RETRY_BACKOFF_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableAnthropicFailure(status, networkErr) {
  if (networkErr) return true;
  return RETRYABLE_STATUS.has(status);
}

async function callAnthropic(apiKey, userContent, fetchImpl, attempt = 0) {
  let anthropicRes;
  let networkErr = null;

  try {
    anthropicRes = await fetchImpl(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });
  } catch (err) {
    networkErr = err;
    anthropicRes = null;
  }

  if (networkErr) {
    const detail =
      networkErr instanceof Error
        ? networkErr.cause instanceof Error
          ? networkErr.cause.message
          : networkErr.message
        : "unknown network error";

    if (attempt === 0 && isRetryableAnthropicFailure(0, true)) {
      console.error("[generate] Anthropic network error, retrying once:", detail);
      await sleep(RETRY_BACKOFF_MS);
      return callAnthropic(apiKey, userContent, fetchImpl, attempt + 1);
    }

    throw new GenerateAnnexXiError(
      `Cannot reach Anthropic API (network error: ${detail}). Check your internet connection and that api.anthropic.com is reachable.`,
      502,
    );
  }

  const data = await anthropicRes.json().catch(() => ({}));

  if (!anthropicRes.ok) {
    console.error("[generate] Anthropic API error:", {
      status: anthropicRes.status,
      body: data,
    });

    if (attempt === 0 && isRetryableAnthropicFailure(anthropicRes.status, false)) {
      await sleep(RETRY_BACKOFF_MS);
      return callAnthropic(apiKey, userContent, fetchImpl, attempt + 1);
    }

    const upstreamMsg =
      data?.error?.message ??
      (typeof data?.error === "string" ? data.error : null);

    let friendly;
    if (anthropicRes.status === 401) {
      friendly =
        "Anthropic rejected the API key as invalid (HTTP 401). The key was likely revoked — generate a new one at console.anthropic.com and update ANTHROPIC_API_KEY in .env.local, then restart the dev server.";
    } else if (anthropicRes.status === 403) {
      friendly =
        "Anthropic refused the request (HTTP 403). The API key may not have access to the requested model or your workspace is restricted.";
    } else if (anthropicRes.status === 429) {
      friendly =
        "Anthropic rate-limited the request (HTTP 429). Wait a moment and try again.";
    } else if (anthropicRes.status >= 500) {
      friendly = `Anthropic API server error (HTTP ${anthropicRes.status}). This is upstream — retry in a minute.`;
    } else {
      friendly = `Anthropic API error (HTTP ${anthropicRes.status})`;
    }

    const finalMsg = upstreamMsg
      ? `${friendly} — upstream message: ${upstreamMsg}`
      : friendly;
    throw new GenerateAnnexXiError(finalMsg, anthropicRes.status);
  }

  return data;
}

/**
 * Call Anthropic to generate Annex XI markdown from form payload.
 * @param {object} body Form payload
 * @param {{ apiKey?: string, fetchImpl?: typeof fetch }} [options]
 * @returns {Promise<string>} Generated markdown document
 */
export async function generateAnnexXiDocument(body, options = {}) {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new GenerateAnnexXiError(
      "ANTHROPIC_API_KEY is not configured on the server. Add it to .env.local and restart `next dev`.",
      500,
    );
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const userContent = buildUserMessage(body);
  const data = await callAnthropic(apiKey, userContent, fetchImpl);

  const textBlock = Array.isArray(data.content)
    ? data.content.find((c) => c.type === "text")
    : null;
  const rawDocument = textBlock?.text ?? "";

  if (!rawDocument) {
    throw new GenerateAnnexXiError(
      "Anthropic returned an empty response. Please retry; if it persists the model may have refused the request.",
      502,
    );
  }

  return postProcessGeneratedDocument(rawDocument, body);
}
