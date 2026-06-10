import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTICLE_5_PROHIBITED_PRACTICES,
  computeEnergyReconciliation,
  postProcessGeneratedDocument,
  renderArticle5Boilerplate,
} from "../lib/annexXiDeterminism.js";

const SAMPLE_BODY = {
  modelName: "JurisLM-7B",
  prohibitedUseCases: {
    selectedCategories: ["Legal advice without legal supervision"],
    customDescription: "Autonomous employment decisions",
  },
  energyDisclosures: {
    totalTrainingEnergyKwh: "1250000",
    trainingComputeValue: "1000000",
    trainingComputeUnit: "GPU-hours",
    estimatedCo2eTonnes: "420",
    energyMethodology: "GPU-hours x 0.4 kW TDP x PUE 1.2 x 0.45 kg CO2e/kWh",
  },
};

test("Article 5(1) mapping is canonical and stable", () => {
  const socialScoring = ARTICLE_5_PROHIBITED_PRACTICES.find((p) => p.ref === "5(1)(c)");
  const biometric = ARTICLE_5_PROHIBITED_PRACTICES.find((p) => p.ref === "5(1)(g)");

  assert.ok(socialScoring?.text.includes("Social scoring"));
  assert.ok(biometric?.text.includes("Biometric categorisation"));

  const run1 = renderArticle5Boilerplate("JurisLM-7B");
  const run2 = renderArticle5Boilerplate("JurisLM-7B");
  assert.equal(run1, run2);
  assert.match(run1, /Article 5\(1\)\(c\).*Social scoring/s);
  assert.match(run1, /Article 5\(1\)\(g\).*Biometric categorisation/s);
});

test("postProcessGeneratedDocument injects fixed Section 9.2 Article 5 list", () => {
  const llmDoc = `# Doc

## 9. Intended Purpose and Use Restrictions

### 9.1 Intended Use Cases
Some uses.

### 9.2 Prohibited Use Cases
LLM hallucinated wrong Article 5 mapping here.

### 9.3 High-Risk Classification
Not high risk.
`;

  const out1 = postProcessGeneratedDocument(llmDoc, SAMPLE_BODY);
  const out2 = postProcessGeneratedDocument(llmDoc, SAMPLE_BODY);

  assert.equal(out1, out2);
  assert.match(out1, /Article 5\(1\)\(c\).*Social scoring/s);
  assert.match(out1, /Contractually Prohibited Uses/);
  assert.match(out1, /Legal advice without legal supervision/);
  assert.doesNotMatch(out1, /LLM hallucinated wrong Article 5 mapping/);
});

test("energy reconciliation uses fixed four-step structure", () => {
  const { methodologyBlock } = computeEnergyReconciliation(SAMPLE_BODY.energyDisclosures);

  assert.match(methodologyBlock, /Step 1 — GPU draw/);
  assert.match(methodologyBlock, /Step 2 — PUE adjustment/);
  assert.match(methodologyBlock, /Step 3 — Declared total and auxiliary infrastructure/);
  assert.match(methodologyBlock, /Step 4 — CO2e estimate/);

  const llmDoc = `## 6. Energy and Compute Disclosures

### 6.1 Energy Methodology
LLM invented inconsistent math.

## 7. Evaluation and Benchmarking
`;

  const out1 = postProcessGeneratedDocument(llmDoc, SAMPLE_BODY);
  const out2 = postProcessGeneratedDocument(llmDoc, SAMPLE_BODY);

  assert.equal(out1, out2);
  assert.match(out1, /Step 1 — GPU draw/);
  assert.doesNotMatch(out1, /LLM invented inconsistent math/);
});

test("CO2e disclaimer appears when declared differs from computed by >10%", () => {
  const { methodologyBlock, co2eDisclaimer } = computeEnergyReconciliation({
    ...SAMPLE_BODY.energyDisclosures,
    estimatedCo2eTonnes: "910",
  });

  assert.ok(co2eDisclaimer);
  assert.match(
    methodologyBlock,
    /The declared figure reflects the provider's own attribution methodology/,
  );
});
