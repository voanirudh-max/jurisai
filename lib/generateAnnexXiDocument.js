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

FORMATTING REQUIREMENTS:
- Use clean markdown only: # / ## / ### for headings, **bold** for emphasis, GitHub-flavored tables for tabular data, ordered or unordered lists for enumerations, and --- for section breaks.
- DO NOT produce ASCII art, box diagrams, character-based illustrations, or any drawing made from |, -, +, =, ─, │, ┌, ┐, └, ┘, ├, ┤, ┬, ┴, ┼, ▲, ▼, ◀, ▶, ║, ╔, ╗, ╚, ╝, █, ░, ▒, ▓, or similar box-drawing or block characters.
- Use ASCII-safe notation throughout the generated document. Write compute values as 10^25 FLOPs, 10^23 FLOPs, etc.; write parameter counts as 7 x 10^9, 70 x 10^9, etc. Never use superscript digits or the multiplication sign.
- When describing the training pipeline or any workflow, present it as a numbered list of stages with a short title and a one-sentence description for each stage. You MAY use one plain ASCII sequence line with " -> " separators (for example, "Pre-training -> Supervised fine-tuning -> Preference optimisation -> Safety evaluation"), or use the word "then". Never use Unicode arrows or construct multi-line diagrams.
- Tables must be valid GitHub-flavored markdown (\`| col | col |\` with a \`| --- | --- |\` separator row).
- Inline code (backticks) is only for short technical identifiers; do not wrap prose in code blocks.

SECTION 1.1 REQUIREMENTS (PROVIDER LEGAL IDENTITY):
Generate a formally labeled subsection titled "### 1.1 Provider Legal Identity". It must include a clean regulator-grade identity table or block for the provider, covering the legal entity/provider name, legal form, registered address, country of establishment, company registration number, VAT/tax number, and compliance contact details.

Section 1.1 must also include an explicit authorised-representative statement. Under Article 54 of the EU AI Act, a provider of a general-purpose AI model established outside the EU must, by written mandate, appoint an authorised representative established in the EU. If the provider is established outside the EU, name the authorised representative and include their address and contact email. If the provider is EU-established, state that Article 54 authorised-representative appointment does not apply because the provider is established within the EU.

If an authorised representative table is generated in Section 1.1.2, the representative country field must be labeled exactly "Representative's Country of Establishment". The provider identity table in Section 1.1.1 must keep the label "Country of Establishment". Do not use the same "Country of Establishment" label for both provider and representative tables.

SECTION 7 REQUIREMENTS (INTENDED PURPOSE):
For Section 7, generate three formally labeled subsections:

### 7.1 Intended Use Cases
Using the provider's selected categories and additional description above, write a regulator-defensible description of intended uses with specificity about operational context. Reference EU AI Act Article 53(1)(a).

### 7.2 Prohibited Use Cases
Using the provider's selected prohibitions and additional restrictions above, write a formal statement of uses explicitly prohibited. Where any selected item corresponds to EU AI Act Article 5 (prohibited practices), cite Article 5. Where the prohibition is a provider-set restriction, state it as such.

### 7.3 High-Risk Classification (per Annex III)
If high-risk: state each applicable Annex III category, the provider's justification, and reference EU AI Act Article 6 and the relevant Annex III paragraph. If not high-risk: formally state that the model does not fall under Annex III high-risk categories, include the provider's justification, and reference Article 6 negatively.

Use formal compliance documentation tone matching the rest of the document.`;

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

function renderProviderLegalIdentity(providerName, identity) {
  if (!identity || typeof identity !== "object") {
    return `Legal entity / provider name: ${cleanText(providerName)}
Legal identity details: (not provided)
EU establishment status: Undetermined pending country selection.
Authorised representative: Cannot be assessed until country of establishment is provided.`;
  }

  const countryOfEstablishment =
    typeof identity.countryOfEstablishment === "string"
      ? identity.countryOfEstablishment.trim()
      : "";
  const isEUEstablished = EU_MEMBER_STATES.includes(countryOfEstablishment);
  const lines = [
    `Legal entity / provider name: ${cleanText(providerName)}`,
    `Legal form: ${cleanText(identity.legalForm)}`,
    `Registered address: ${cleanText(identity.registeredAddress)}`,
    `Country of establishment: ${cleanText(countryOfEstablishment)}`,
    `Company registration number: ${cleanText(identity.companyRegistrationNumber)}`,
    `VAT / tax number: ${cleanText(identity.vatNumber)}`,
    `Compliance contact name: ${cleanText(identity.complianceContactName)}`,
    `Compliance contact role: ${cleanText(identity.complianceContactRole)}`,
    `Compliance contact email: ${cleanText(identity.complianceContactEmail)}`,
  ];

  if (!countryOfEstablishment) {
    lines.push(
      "EU establishment status: Undetermined pending country selection.",
      "Article 54 authorised representative: Cannot be assessed until the country of establishment is provided.",
    );
  } else if (!isEUEstablished) {
    const rep =
      identity.authorisedRepresentative &&
      typeof identity.authorisedRepresentative === "object"
        ? identity.authorisedRepresentative
        : {};
    lines.push(
      "EU establishment status: Provider is established outside the EU.",
      "Article 54 authorised representative: Required for non-EU GPAI providers.",
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
  const providerLegalIdentityBlock = renderProviderLegalIdentity(
    body.providerName,
    body.providerLegalIdentity,
  );
  const intendedBlock = renderUseCases(body.intendedUseCases);
  const prohibitedBlock = renderUseCases(body.prohibitedUseCases);
  const highRiskBlock = renderHighRiskClassification(body.highRiskClassification);

  return `Generate a complete Annex XI technical documentation package for the following GPAI model:

MODEL IDENTITY
- Model name: ${body.modelName ?? "(not provided)"}
- Provider name: ${body.providerName ?? "(not provided)"}
- Version number: ${body.versionNumber ?? "(not provided)"}
- Release date: ${body.releaseDate ?? "(not provided)"}

SECTION 1.1 — PROVIDER LEGAL IDENTITY
${providerLegalIdentityBlock}

ARCHITECTURE
- Model architecture: ${body.modelArchitecture ?? "(not provided)"}
- Number of parameters: ${body.numberOfParameters ?? "(not provided)"}
- Modalities: ${m}

TRAINING PROCESS
- Pre-training description: ${body.preTrainingDescription ?? "(not provided)"}
- Fine-tuning description: ${body.fineTuningDescription ?? "(not provided)"}
- Alignment techniques (RLHF / DPO / other): ${body.alignmentTechniques ?? "(not provided)"}
- Total FLOPs estimate: ${body.totalFlopsEstimate ?? "(not provided)"}

TRAINING DATA
- Data sources: ${body.dataSources ?? "(not provided)"}
- Data collection method: ${body.dataCollectionMethod ?? "(not provided)"}
- Filtering and preprocessing applied: ${body.filteringPreprocessing ?? "(not provided)"}
- Human vs synthetic data ratio: ${body.humanVsSyntheticRatio ?? "(not provided)"}

EVALUATION
- Benchmarks used: ${body.benchmarksUsed ?? "(not provided)"}
- Evaluation results summary: ${body.evaluationResultsSummary ?? "(not provided)"}
- Known limitations: ${body.knownLimitations ?? "(not provided)"}

INTENDED PURPOSE
7.1 — Intended use cases:${intendedBlock}

7.2 — Prohibited use cases:${prohibitedBlock}

7.3 — High-risk classification (per Annex III):${highRiskBlock}`;
}

export class GenerateAnnexXiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "GenerateAnnexXiError";
    this.status = status;
  }
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

  let anthropicRes;
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
  } catch (networkErr) {
    const detail =
      networkErr instanceof Error
        ? networkErr.cause instanceof Error
          ? networkErr.cause.message
          : networkErr.message
        : "unknown network error";
    throw new GenerateAnnexXiError(
      `Cannot reach Anthropic API (network error: ${detail}). Check your internet connection and that api.anthropic.com is reachable.`,
      502,
    );
  }

  const data = await anthropicRes.json().catch(() => ({}));

  if (!anthropicRes.ok) {
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

  const textBlock = Array.isArray(data.content)
    ? data.content.find((c) => c.type === "text")
    : null;
  const document = textBlock?.text ?? "";

  if (!document) {
    throw new GenerateAnnexXiError(
      "Anthropic returned an empty response. Please retry; if it persists the model may have refused the request.",
      502,
    );
  }

  return document;
}
