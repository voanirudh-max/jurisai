import assert from "node:assert/strict";
import test from "node:test";
import { jsPDF } from "jspdf";
import { generateAnnexXiDocument } from "../lib/generateAnnexXiDocument.js";
import {
  PDF_NON_ASCII_PATTERN,
  renderAnnexXiPdf,
} from "../lib/annexXiPdf.js";

/** Full India Annex XI form payload with Unicode in fields that flow to sections 3.1 and 3.3. */
const INDIA_PAYLOAD = {
  modelName: "JurisLM-7B",
  providerName: "JurisAI Private Limited",
  providerLegalIdentity: {
    legalForm: "Private Limited",
    registeredAddress: "Bengaluru, Karnataka, India",
    countryOfEstablishment: "India",
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

const MIN_RENDERED_PAGES = 12;

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
 * Build a full-length Annex XI mock that embeds form payload fields into the
 * sections they populate in real generations (3.1 pipeline, 3.3 compute, 2.x params).
 */
function buildFullAnnexXiMockDocument(form) {
  const identity = form.providerLegalIdentity ?? {};
  const authRep = identity.authorisedRepresentative ?? {};
  const intended = form.intendedUseCases ?? {};
  const prohibited = form.prohibitedUseCases ?? {};
  const highRisk = form.highRiskClassification ?? {};

  let doc = `# Annex XI Technical Documentation — ${form.modelName}

**Document reference:** JURISAI-2026-001

## 1. Executive Summary

${complianceParagraphs(8, `Model ${form.modelName} (${form.versionNumber}, released ${form.releaseDate}).`)}

${evidenceTable("1.1 Provider Legal Identity")}

Legal entity: ${form.providerName}. Legal form: ${identity.legalForm}. Registered address: ${identity.registeredAddress}. Country of Establishment: ${identity.countryOfEstablishment}. Company registration: ${identity.companyRegistrationNumber}. VAT: ${identity.vatNumber}. Compliance contact: ${identity.complianceContactName}, ${identity.complianceContactRole}, ${identity.complianceContactEmail}.

Article 54 authorised representative (non-EU provider): ${authRep.name}, ${authRep.address}, ${authRep.contactEmail}.

${complianceParagraphs(6, "Section 1.1 provider legal identity.")}

## 2. Model Architecture and System Design

Architecture type: ${form.modelArchitecture}. Parameter count: ${form.numberOfParameters}. Modalities: text, code.

${complianceParagraphs(8, "Architecture and parameterisation under Annex XI Section 2.")}

${evidenceTable("2.1 Parameterisation Summary")}

## 3. Training Process

Data sources: ${form.dataSources}. Collection method: ${form.dataCollectionMethod}. Filtering: ${form.filteringPreprocessing}. Human/synthetic ratio: ${form.humanVsSyntheticRatio}.

${complianceParagraphs(4, "Training process overview.")}

### 3.1 Training Pipeline

The provider describes the end-to-end training pipeline as follows:

${form.preTrainingDescription}

Fine-tuning stage: ${form.fineTuningDescription}

Alignment techniques: ${form.alignmentTechniques}

Pipeline summary line: Pre-training → Supervised fine-tuning ⇒ Alignment optimisation ➔ Safety evaluation.

${complianceParagraphs(6, "Section 3.1 training pipeline stages and controls.")}

${evidenceTable("3.2 Training Controls Matrix")}

### 3.3 Compute Estimate

Total training compute reported by the provider: ${form.totalFlopsEstimate}.

Secondary estimate notation: 10²⁵ FLOPs total with 1 × 10²³ GPU-hours equivalent load.

${complianceParagraphs(6, "Section 3.3 compute estimation methodology.")}

## 4. Training Data Governance

${complianceParagraphs(10, "Training data governance and provenance.")}
${evidenceTable("4.2 Data Provenance Controls")}
${complianceParagraphs(8, "Data licensing and retention.")}
${evidenceTable("4.3 Filtering and Preprocessing")}
${complianceParagraphs(8, "Synthetic data controls.")}
${evidenceTable("4.4 Human vs Synthetic Ratio")}

## 5. Evaluation and Benchmarking

Benchmarks: ${form.benchmarksUsed}. Results: ${form.evaluationResultsSummary}. Known limitations: ${form.knownLimitations}.

${complianceParagraphs(10, "Evaluation methodology.")}
${evidenceTable("5.2 Benchmark Results")}
${complianceParagraphs(8, "Limitation management.")}

## 6. Risk Management and Systemic Risk

${complianceParagraphs(10, "Systemic risk assessment.")}
${evidenceTable("6.2 Systemic Risk Threshold Analysis")}

## 7. Intended Purpose and Use Restrictions

### 7.1 Intended Use Cases

Selected categories: ${(intended.selectedCategories ?? []).join(", ")}.
Additional description: ${intended.customDescription ?? "(not provided)"}.

${complianceParagraphs(6, "Section 7.1 intended use.")}

### 7.2 Prohibited Use Cases

Selected prohibitions: ${(prohibited.selectedCategories ?? []).join(", ")}.
Additional restrictions: ${prohibited.customDescription ?? "(not provided)"}.

${complianceParagraphs(6, "Section 7.2 prohibited use.")}

### 7.3 High-Risk Classification

High-risk: ${highRisk.isHighRisk ? "Yes" : "No"}. Justification: ${highRisk.notHighRiskJustification ?? "(not provided)"}.

${complianceParagraphs(6, "Section 7.3 Annex III classification.")}
`;

  for (let section = 8; section <= 14; section++) {
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
        "generateAnnexXiDocument prompt must include section 3.1 pipeline field with Unicode",
      );
      assert.ok(
        userContent.includes(formPayload.totalFlopsEstimate),
        "generateAnnexXiDocument prompt must include section 3.3 compute field with Unicode",
      );
      assert.ok(
        userContent.includes(formPayload.numberOfParameters),
        "generateAnnexXiDocument prompt must include parameter count field with Unicode",
      );
      assert.ok(
        userContent.includes(formPayload.providerLegalIdentity.countryOfEstablishment),
        "generateAnnexXiDocument prompt must include India country of establishment",
      );

      const document = buildFullAnnexXiMockDocument(formPayload);

      assert.match(
        document,
        /### 3\.1 Training Pipeline[\s\S]*→[\s\S]*### 3\.3 Compute Estimate[\s\S]*²/,
        "mock document must embed Unicode pipeline/compute fields inside sections 3.1 and 3.3",
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

test("PDF render pipeline: India generation + Unicode stress -> ASCII-only, in-margin text", async () => {
  const restoreFetch = installAnthropicMock(INDIA_PAYLOAD);
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-key";

  try {
    const generatedDocument = await generateDocumentViaApi(
      globalThis.fetch,
      INDIA_PAYLOAD,
    );

    assert.ok(
      generatedDocument.includes(INDIA_PAYLOAD.preTrainingDescription),
      "generated document must embed preTrainingDescription Unicode inside body text",
    );
    assert.ok(
      generatedDocument.includes(INDIA_PAYLOAD.totalFlopsEstimate),
      "generated document must embed totalFlopsEstimate Unicode inside body text",
    );
    assert.match(
      generatedDocument,
      /### 3\.1 Training Pipeline/,
      "generated document must reach section 3.1",
    );
    assert.match(
      generatedDocument,
      /### 3\.3 Compute Estimate/,
      "generated document must reach section 3.3",
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

    const pipelineLine = drawn.find((d) =>
      /Pre-training\s*->\s*supervised fine-tuning/i.test(d.text),
    );
    assert.ok(
      pipelineLine,
      `expected sanitized section 3.1 pipeline line in PDF output (pages audited: ${pageCount})`,
    );

    const hasFlops25 = drawn.some((d) => /10\^25/.test(d.text));
    const hasMultiply23 = drawn.some((d) => /1 x 10\^23/i.test(d.text));
    assert.ok(hasFlops25, "expected 10^25 in PDF output from section 3.3");
    assert.ok(hasMultiply23, "expected 1 x 10^23 in PDF output from section 3.3");

    console.log(
      `PDF render audit passed: ${drawn.length} doc.text calls across ${pageCount} pages (minimum ${MIN_RENDERED_PAGES}), 0 non-ASCII glyphs, 0 margin overflows`,
    );
  } finally {
    process.env.ANTHROPIC_API_KEY = previousKey;
    restoreFetch();
  }
});
