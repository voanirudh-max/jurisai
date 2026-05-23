import assert from "node:assert/strict";
import test from "node:test";
import { jsPDF } from "jspdf";
import { generateAnnexXiDocument } from "../lib/generateAnnexXiDocument.js";
import {
  PDF_NON_ASCII_PATTERN,
  renderAnnexXiPdf,
} from "../lib/annexXiPdf.js";

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

/** Simulates worst-case model output with Unicode glyphs in critical sections. */
const UNICODE_STRESS_DOCUMENT = `# Annex XI Technical Documentation

**Document reference:** JURISAI-2026-001

### 1.1 Provider Legal Identity

Country of Establishment: India. Article 54 authorised representative appointed in Germany.

### 3.1 Training Pipeline

Pre-training → Supervised fine-tuning ⇒ Alignment optimisation ➔ Safety evaluation

### 3.3 Compute Estimate

Total training compute: **10²⁵ FLOPs** (approximately **1 × 10²³** GPU-hours).
Parameter count from provider form: 7 × 10⁹.

| Field | Value |
| --- | --- |
| Basis of Appointment | Mandate scope for Article 54 representative compliance |

**Note:** This post-table callout reflects a placeholder compliance statement maintained on file and shared with the authorised representative for regulatory inspection purposes under Article 53 of Regulation (EU) 2024/1689.

### 7.1 Intended Use Cases

Internal compliance research and document drafting assistance.
`;

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

function installAnthropicMock() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("api.anthropic.com")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ type: "text", text: UNICODE_STRESS_DOCUMENT }],
        }),
      };
    }
    return originalFetch(url, init);
  };
  return () => {
    globalThis.fetch = originalFetch;
  };
}

async function generateDocumentViaApi(fetchImpl) {
  return generateAnnexXiDocument(INDIA_PAYLOAD, {
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
  const restoreFetch = installAnthropicMock();
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-key";

  try {
    const generatedDocument = await generateDocumentViaApi(globalThis.fetch);
    assert.match(
      generatedDocument,
      /→|⇒|➔|×|²|³|⁵/,
      "mock document must include Unicode stress glyphs before PDF render",
    );

    const { drawn, pageCount } = auditPdfRender(
      generatedDocument,
      INDIA_PAYLOAD.modelName,
    );

    assertPdfDrawAudit(drawn, drawn[0]?.rightEdge ?? 0);

    const pipelineLine = drawn.find((d) =>
      /Pre-training\s*->\s*Supervised fine-tuning/i.test(d.text),
    );
    assert.ok(pipelineLine, "expected sanitized pipeline line in PDF output");

    const hasFlops25 = drawn.some((d) => /10\^25/.test(d.text));
    const hasMultiply23 = drawn.some((d) => /1 x 10\^23/i.test(d.text));
    assert.ok(hasFlops25, "expected 10^25 in PDF output");
    assert.ok(hasMultiply23, "expected 1 x 10^23 in PDF output");

    console.log(
      `PDF render audit passed: ${drawn.length} doc.text calls across ${pageCount} pages, 0 non-ASCII glyphs, 0 margin overflows`,
    );
  } finally {
    process.env.ANTHROPIC_API_KEY = previousKey;
    restoreFetch();
  }
});
