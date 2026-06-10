import assert from "node:assert/strict";
import test from "node:test";
import { jsPDF } from "jspdf";
import { generateAnnexXiDocument } from "../lib/generateAnnexXiDocument.js";
import {
  PDF_NON_ASCII_PATTERN,
  renderAnnexXiPdf,
} from "../lib/annexXiPdf.js";

/** Full India Annex XI form payload with Unicode in fields that flow to sections 4.1 and 4.3. */
const INDIA_PAYLOAD = {
  modelName: "JurisLM-7B",
  providerName: "JurisAI Private Limited",
  providerLegalIdentity: {
    legalName: "JurisAI Private Limited",
    tradeName: "JurisAI",
    legalForm: "Private Limited",
    registeredAddress: "Bengaluru, Karnataka, India",
    countryOfEstablishment: "India",
    contactEmail: "contact@jurisai.example",
    companyRegistrationNumber: "U12345KA2026PTC000001",
    vatNumber: "GSTIN 29ABCDE1234F1Z5",
    complianceContactName: "Anika Rao",
    complianceContactRole: "Head of Compliance",
    complianceContactEmail: "compliance@jurisai.example",
    authorisedRepresentative: {
      name: "JurisAI EU Representative GmbH",
      address: "Friedrichstrasse 100, 10117 Berlin, Germany",
      contactEmail: "eu-rep@jurisai.example",
    },
  },
  energyDisclosures: {
    totalTrainingEnergyKwh: "1250000",
    trainingComputeValue: "1.2e23",
    trainingComputeUnit: "GPU-hours",
    trainingInfrastructureLocations: "Hyderabad, India; Frankfurt, Germany",
    estimatedCo2eTonnes: "420",
    energyMethodology: "GPU-hours x hardware TDP x PUE x grid carbon intensity",
    inferenceEnergyPerQuery: "~0.8 Wh per 1k-token response",
  },
  redTeaming: {
    approach: "both",
    adversarialCategories: [
      "Bias",
      "Jailbreak",
      "Prompt injection",
      "Harmful content",
      "Factuality",
    ],
    customAdversarialCategories: "Legal advice misuse",
    teamComposition:
      "Internal security engineers plus external penetration testing firm with ML safety credentials.",
    methodologySummary:
      "Structured attack libraries, scenario-based prompt injection suites, and bias evaluation rubrics.",
    findingsAndMitigations:
      "Jailbreak attempts reduced via system-prompt hardening; harmful content filters tightened.",
    residualRisks:
      "Residual hallucination risk in legal citation contexts; mitigated via human-in-the-loop review.",
    exerciseDates: "2026-03-15 to 2026-04-02",
  },
  versionNumber: "1.0.1",
  releaseDate: "2026-05-21",
  modelArchitecture: "Decoder-only transformer",
  numberOfParameters: "7 × 10⁹",
  modalities: { text: true, image: false, audio: false, video: false, code: true },
  preTrainingDescription:
    "Pre-training → supervised fine-tuning ⇒ alignment optimisation ➔ safety evaluation.",
  fineTuningDescription: "Instruction-tuned on compliance research and legal drafting examples.",
  alignmentTechniques: "Supervised fine-tuning followed by DPO.",
  totalFlopsEstimate: "10²⁵ FLOPs (approximately 1 × 10²³ GPU-hours)",
  dataSources: "Licensed legal corpora, regulatory texts, internal compliance examples.",
  dataCollectionMethod: "Licensed ingestion and curated internal dataset assembly.",
  filteringPreprocessing: "Deduplication, PII filtering, copyright-source tracking.",
  humanVsSyntheticRatio: "90% human-originated / 10% synthetic",
  benchmarksUsed: "Internal legal QA benchmark, summarization benchmark.",
  evaluationResultsSummary: "Meets internal quality thresholds for research assistance.",
  knownLimitations: "May hallucinate citations; requires human professional review.",
  intendedUseCases: {
    selectedCategories: ["Text generation", "Summarization", "Question answering"],
    customDescription: "Used internally for compliance research and document drafting",
  },
  prohibitedUseCases: {
    selectedCategories: [
      "Medical diagnosis without clinical oversight",
      "Legal advice without legal supervision",
    ],
    customDescription: "Autonomous decision-making in employment contexts",
  },
  highRiskClassification: {
    isHighRisk: false,
    applicableCategories: [],
    justifications: {},
    notHighRiskJustification:
      "Model is a general-purpose research assistant not deployed in any Annex III high-risk context",
  },
};

const REQUIRED_SECTION_HEADINGS = [
  "Provider Identification",
  "Energy and Compute Disclosures",
  "Red-Teaming and Adversarial Evaluation",
];

const MIN_RENDERED_PAGES = 16;

const REFERENCE_PATTERNS = [
  /document\s+reference(?:\s+number)?\s*[:\-]\s*\*?\*?\s*([A-Z0-9][A-Z0-9._\-\/]{3,})/i,
  /reference\s+number\s*[:\-]\s*\*?\*?\s*([A-Z0-9][A-Z0-9._\-\/]{3,})/i,
];

function extractReferenceNumber(text) {
  if (!text) return null;
  for (const pattern of REFERENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].replace(/[*\s]+$/g, "");
  }
  return null;
}

function complianceParagraphs(count, context) {
  return Array.from(
    { length: count },
    (_, i) =>
      `Paragraph ${i + 1}: ${context} The provider maintains audit-ready Annex XI records under Article 53(1)(a) of Regulation (EU) 2024/1689, including traceability for supervisory review, authorised representative inspection, and internal compliance sign-off.`,
  ).join("\n\n");
}

function postTableNote(sectionLabel) {
  return `**Note:** Post-table callout for ${sectionLabel} — placeholder compliance language maintained on file and shared with the authorised representative for regulatory inspection under Article 53.\n\n`;
}

function evidenceTable(sectionLabel) {
  return `### ${sectionLabel}\n\n| Field | Value |\n| --- | --- |\n| Regulatory basis | Article 53(1)(a) |\n| Documentation status | Complete for review |\n| Provider country | India |\n\n${postTableNote(sectionLabel)}`;
}

/**
 * Build a full-length Annex XI mock (v1.1 numbering) embedding form fields into
 * the sections they populate, including Unicode stress in training pipeline/compute.
 */
function buildFullAnnexXiMockDocument(form) {
  const identity = form.providerLegalIdentity ?? {};
  const authRep = identity.authorisedRepresentative ?? {};
  const energy = form.energyDisclosures ?? {};
  const redTeam = form.redTeaming ?? {};
  const intended = form.intendedUseCases ?? {};
  const prohibited = form.prohibitedUseCases ?? {};
  const highRisk = form.highRiskClassification ?? {};

  const redTeamCategories = [
    ...(redTeam.adversarialCategories ?? []),
    ...(redTeam.customAdversarialCategories
      ? redTeam.customAdversarialCategories.split(",").map((c) => c.trim())
      : []),
  ].filter(Boolean);

  let doc = `# Annex XI Technical Documentation — ${form.modelName}

**Document reference:** JURISAI-2026-001

## 1. Provider Identification

Provider legal name: ${identity.legalName || form.providerName}. Trade name: ${identity.tradeName || "(same as legal name)"}. Legal form: ${identity.legalForm}. Registered address: ${identity.registeredAddress}. Country of Establishment: ${identity.countryOfEstablishment}. Provider contact email: ${identity.contactEmail}. Company registration: ${identity.companyRegistrationNumber}. VAT: ${identity.vatNumber}.

Article 54 authorised representative (non-EU provider): ${authRep.name}, ${authRep.address}, ${authRep.contactEmail}.

${complianceParagraphs(6, "Section 1 provider identification.")}
${evidenceTable("1.1 Provider Identity Table")}

## 2. Model Overview

${complianceParagraphs(8, `Model ${form.modelName} (${form.versionNumber}, released ${form.releaseDate}).`)}

## 3. Model Architecture and System Design

Architecture type: ${form.modelArchitecture}. Parameter count: ${form.numberOfParameters}. Modalities: text, code.

${complianceParagraphs(8, "Architecture and parameterisation under Annex XI Section 3.")}
${evidenceTable("3.1 Parameterisation Summary")}

## 4. Training Process

${complianceParagraphs(4, "Training process overview.")}

### 4.1 Training Pipeline

The provider describes the end-to-end training pipeline as follows:

${form.preTrainingDescription}

Fine-tuning stage: ${form.fineTuningDescription}

Alignment techniques: ${form.alignmentTechniques}

Pipeline summary line: Pre-training → Supervised fine-tuning ⇒ Alignment optimisation ➔ Safety evaluation.

${complianceParagraphs(6, "Section 4.1 training pipeline stages and controls.")}
${evidenceTable("4.2 Training Controls Matrix")}

### 4.3 Compute Estimate

Total training compute reported by the provider: ${form.totalFlopsEstimate}.

Secondary estimate notation: 10²⁵ FLOPs total with 1 × 10²³ GPU-hours equivalent load.

${complianceParagraphs(6, "Section 4.3 compute estimation methodology.")}

## 5. Training Data Governance

Data sources: ${form.dataSources}. Collection method: ${form.dataCollectionMethod}. Filtering: ${form.filteringPreprocessing}. Human/synthetic ratio: ${form.humanVsSyntheticRatio}.

${complianceParagraphs(10, "Training data governance and provenance.")}
${evidenceTable("5.2 Data Provenance Controls")}
${complianceParagraphs(8, "Data licensing and retention.")}
${evidenceTable("5.3 Filtering and Preprocessing")}
${complianceParagraphs(8, "Synthetic data controls.")}
${evidenceTable("5.4 Human vs Synthetic Ratio")}

## 6. Energy and Compute Disclosures

Total training energy consumed: ${energy.totalTrainingEnergyKwh} kWh.

Training compute: ${energy.trainingComputeValue} ${energy.trainingComputeUnit}.

Training infrastructure locations: ${energy.trainingInfrastructureLocations}.

Estimated CO2e emissions: ${energy.estimatedCo2eTonnes} tonnes.

Energy methodology: ${energy.energyMethodology}.

Inference energy per query: ${energy.inferenceEnergyPerQuery}.

${complianceParagraphs(8, "Section 6 energy and carbon disclosure methodology.")}

### 6.1 Energy Methodology

Placeholder LLM energy narrative.

${evidenceTable("6.2 Energy Disclosure Summary")}

## 7. Evaluation and Benchmarking

Benchmarks: ${form.benchmarksUsed}. Results: ${form.evaluationResultsSummary}. Known limitations: ${form.knownLimitations}.

${complianceParagraphs(10, "Evaluation methodology.")}
${evidenceTable("7.2 Benchmark Results")}
${complianceParagraphs(8, "Limitation management.")}

## 8. Red-Teaming and Adversarial Evaluation

Red-teaming approach: ${redTeam.approach}.

Adversarial categories covered: ${redTeamCategories.join(", ")}.

Team composition: ${redTeam.teamComposition}.

Methodology: ${redTeam.methodologySummary}.

Findings and mitigations: ${redTeam.findingsAndMitigations}.

Residual risks: ${redTeam.residualRisks}.

Exercise dates: ${redTeam.exerciseDates}.

${complianceParagraphs(8, "Section 8 red-teaming and adversarial evaluation.")}
${evidenceTable("8.1 Red-Team Exercise Summary")}

## 9. Intended Purpose and Use Restrictions

### 9.1 Intended Use Cases

Selected categories: ${(intended.selectedCategories ?? []).join(", ")}.
Additional description: ${intended.customDescription ?? "(not provided)"}.

${complianceParagraphs(6, "Section 9.1 intended use.")}

### 9.2 Prohibited Use Cases

Selected prohibitions: ${(prohibited.selectedCategories ?? []).join(", ")}.
Additional restrictions: ${prohibited.customDescription ?? "(not provided)"}.

${complianceParagraphs(6, "Section 9.2 prohibited use.")}

### 9.3 High-Risk Classification

High-risk: ${highRisk.isHighRisk ? "Yes" : "No"}. Justification: ${highRisk.notHighRiskJustification ?? "(not provided)"}.

${complianceParagraphs(6, "Section 9.3 Annex III classification.")}
`;

  for (let section = 10; section <= 14; section++) {
    doc += `\n## ${section}. Supplementary Compliance Annex ${section}\n\n`;
    doc += complianceParagraphs(10, `Supplementary Annex XI section ${section}.`);
    doc += evidenceTable(`${section}.2 Supporting Evidence Table`);
    doc += complianceParagraphs(8, `Continued section ${section} documentation.`);
  }

  return doc;
}

function installAnthropicMock(formPayload) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("api.anthropic.com")) {
      const reqBody = JSON.parse(init.body);
      const userContent = reqBody.messages?.[0]?.content ?? "";

      assert.ok(
        userContent.includes(formPayload.preTrainingDescription),
        "generateAnnexXiDocument prompt must include training pipeline field with Unicode",
      );
      assert.ok(
        userContent.includes(formPayload.totalFlopsEstimate),
        "generateAnnexXiDocument prompt must include compute field with Unicode",
      );
      assert.ok(
        userContent.includes(formPayload.energyDisclosures.totalTrainingEnergyKwh),
        "generateAnnexXiDocument prompt must include energy disclosure fields",
      );
      assert.ok(
        userContent.includes(formPayload.redTeaming.approach),
        "generateAnnexXiDocument prompt must include red-teaming fields",
      );
      assert.ok(
        userContent.includes(formPayload.providerLegalIdentity.legalName),
        "generateAnnexXiDocument prompt must include provider legal name",
      );
      assert.ok(
        userContent.includes(formPayload.providerLegalIdentity.countryOfEstablishment),
        "generateAnnexXiDocument prompt must include India country of establishment",
      );

      const document = buildFullAnnexXiMockDocument(formPayload);

      for (const heading of REQUIRED_SECTION_HEADINGS) {
        assert.ok(
          document.includes(heading),
          `mock document must contain section heading: ${heading}`,
        );
      }

      assert.match(
        document,
        /## 4\. Training Process[\s\S]*### 4\.1 Training Pipeline[\s\S]*→[\s\S]*### 4\.3 Compute Estimate[\s\S]*²/,
        "mock document must embed Unicode pipeline/compute fields inside training sections",
      );

      return {
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ type: "text", text: document }],
        }),
      };
    }
    return originalFetch(url, init);
  };
  return () => {
    globalThis.fetch = originalFetch;
  };
}

async function generateDocumentViaApi(fetchImpl, formPayload) {
  return generateAnnexXiDocument(formPayload, {
    apiKey: "test-key",
    fetchImpl,
  });
}

function auditPdfRender(generatedDocument, modelName) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const drawn = [];

  const { pageCount, rightEdge } = renderAnnexXiPdf({
    doc,
    generatedDocument,
    modelName,
    documentReference: extractReferenceNumber(generatedDocument),
    auditTextDraw: (entry) => {
      drawn.push(entry);
    },
  });

  return { drawn, pageCount, rightEdge };
}

function assertPdfDrawAudit(drawn, rightEdge) {
  const marginEpsilon = 0.5;

  for (const entry of drawn) {
    if (PDF_NON_ASCII_PATTERN.test(entry.text)) {
      const preview = entry.text.slice(0, 120);
      throw new Error(
        `Non-ASCII glyph in doc.text on page ${entry.page}: ${JSON.stringify(preview)}`,
      );
    }

    if (entry.x + entry.width > entry.rightEdge + marginEpsilon) {
      const preview = entry.text.slice(0, 120);
      throw new Error(
        `Text overflow on page ${entry.page} (x=${entry.x.toFixed(2)} width=${entry.width.toFixed(2)} rightEdge=${entry.rightEdge.toFixed(2)}): ${JSON.stringify(preview)}`,
      );
    }
  }

  assert.ok(drawn.length > 0, "expected at least one doc.text call");
  assert.equal(drawn[0].rightEdge, rightEdge);
}

function assertSectionHeadingsInPdf(drawn, pageCount) {
  const allText = drawn.map((d) => d.text).join("\n");
  for (const heading of REQUIRED_SECTION_HEADINGS) {
    assert.ok(
      allText.includes(heading),
      `missing section heading in PDF output: "${heading}" (audited ${pageCount} pages)`,
    );
  }
}

test("PDF render pipeline: India generation + Unicode stress -> ASCII-only, in-margin text", async () => {
  const restoreFetch = installAnthropicMock(INDIA_PAYLOAD);
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-key";

  try {
    const generatedDocument = await generateDocumentViaApi(
      globalThis.fetch,
      INDIA_PAYLOAD,
    );

    for (const heading of REQUIRED_SECTION_HEADINGS) {
      assert.ok(
        generatedDocument.includes(heading),
        `generated document missing section heading: ${heading}`,
      );
    }

    assert.ok(
      generatedDocument.includes(INDIA_PAYLOAD.preTrainingDescription),
      "generated document must embed preTrainingDescription Unicode inside body text",
    );
    assert.ok(
      generatedDocument.includes(INDIA_PAYLOAD.energyDisclosures.energyMethodology),
      "generated document must embed energy methodology",
    );
    assert.ok(
      generatedDocument.includes(INDIA_PAYLOAD.redTeaming.findingsAndMitigations),
      "generated document must embed red-teaming findings",
    );
    assert.match(
      generatedDocument,
      /Article 5\(1\)\(c\).*Social scoring/s,
      "generated document must contain canonical Article 5(1)(c) social scoring citation",
    );
    assert.match(
      generatedDocument,
      /Step 1 — GPU draw/,
      "generated document must contain server-computed energy methodology steps",
    );
    assert.match(
      generatedDocument,
      /### 4\.1 Training Pipeline/,
      "generated document must reach training pipeline subsection",
    );

    const { drawn, pageCount } = auditPdfRender(
      generatedDocument,
      INDIA_PAYLOAD.modelName,
    );

    assert.ok(
      pageCount >= MIN_RENDERED_PAGES,
      `expected at least ${MIN_RENDERED_PAGES} rendered PDF pages, got ${pageCount}`,
    );

    assertPdfDrawAudit(drawn, drawn[0]?.rightEdge ?? 0);
    assertSectionHeadingsInPdf(drawn, pageCount);

    const pipelineLine = drawn.find((d) =>
      /Pre-training\s*->\s*supervised fine-tuning/i.test(d.text),
    );
    assert.ok(
      pipelineLine,
      `expected sanitized training pipeline line in PDF output (pages audited: ${pageCount})`,
    );

    const hasFlops25 = drawn.some((d) => /10\^25/.test(d.text));
    const hasMultiply23 = drawn.some((d) => /1 x 10\^23/i.test(d.text));
    assert.ok(hasFlops25, "expected 10^25 in PDF output from compute section");
    assert.ok(hasMultiply23, "expected 1 x 10^23 in PDF output from compute section");

    const hasCo2e = drawn.some((d) => /CO2e/i.test(d.text));
    assert.ok(hasCo2e, "expected CO2e (ASCII) in PDF energy section");

    console.log(
      `PDF render audit passed: ${drawn.length} doc.text calls across ${pageCount} pages (minimum ${MIN_RENDERED_PAGES}), 0 non-ASCII glyphs, 0 margin overflows, all v1.1 section headings present`,
    );
  } finally {
    process.env.ANTHROPIC_API_KEY = previousKey;
    restoreFetch();
  }
});
