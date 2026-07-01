"use client";

import Link from "next/link";
import { useState } from "react";

const FLOP_TIERS = {
  under: "Under 10²³ FLOPs",
  band23: "10²³–10²⁴ FLOPs",
  band24: "10²⁴–10²⁵ FLOPs",
  above25: "Above 10²⁵ FLOPs",
};

const FAQ_ITEMS = [
  {
    q: "Does EU AI Act apply to my company if I'm not based in Europe?",
    a: "Yes. Article 53(2) explicitly extends all GPAI provider obligations to companies outside the EU if their models are placed on the EU market or put into service in Europe. If EU users or businesses can access your model via API, you have full Article 53 obligations regardless of where your company is incorporated.",
  },
  {
    q: "What exactly is Annex XI and why do I need it?",
    a: "Annex XI is the mandatory technical documentation format specified under Article 53(1)(a) of Regulation (EU) 2024/1689. It covers 9 categories including model architecture, training process, FLOPs estimate, data provenance, and evaluation results. Every GPAI model provider must produce this documentation before placing their model on the EU market.",
  },
  {
    q: "Is a model card or README the same as Annex XI documentation?",
    a: "No. A model card covers roughly 2 of the 9 mandatory Annex XI categories. Annex XI requires specific legal framing around IP rights, training data provenance, FLOPs measurement, and known limitations that standard model cards do not include. JurisAI generates documentation that specifically satisfies all 9 Annex XI mandatory fields.",
  },
  {
    q: "What's the difference between a GPAI provider and a GPAI deployer?",
    a: "A provider develops or trains the GPAI model and places it on the market. A deployer integrates an existing GPAI model into their own AI system. If you fine-tune a base model and offer it to others, you are a provider with full Article 53 obligations. If you only use an API without modification, you are likely a deployer with reduced obligations.",
  },
  {
    q: "What happens if I don't comply?",
    a: "Under Article 101, non-compliance with GPAI obligations can result in fines up to 3% of global annual turnover, or €15 million — whichever is higher. The AI Office, established under the regulation, has the power to request documentation, conduct model evaluations, and restrict or withdraw non-compliant models from the EU market.",
  },
  {
    q: "Does JurisAI replace a lawyer?",
    a: "No. JurisAI generates the structured documentation draft that your legal team reviews and certifies. The same way tax software produces a return that an accountant signs off on — JurisAI produces the artifact, your legal team provides the authority. This reduces legal costs from €5,000–€20,000 to a fraction of that.",
  },
];

function IconX() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-dim"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.5 8l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaceholderBar({ className = "" }) {
  return (
    <div
      className={`h-2 rounded-sm bg-placeholder ${className}`}
      aria-hidden
    />
  );
}

/** TODO: swap this CSS preview for a real screenshot of a generated PDF. */
function HeroDocumentPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
      <div
        className="absolute inset-x-3 top-3 bottom-[-8px] rounded-lg bg-paper-shadow"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-lg border border-hairline border-t-[3px] border-t-accent bg-surface p-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-dim">
              Regulation (EU) 2024/1689 · Art. 53(1)(a)
            </p>
            <p className="font-serif mt-1 text-[14px] font-medium leading-snug text-ink">
              Annex XI Technical Documentation
            </p>
          </div>
          <span className="shrink-0 rounded px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-accent bg-accent-tint">
            READY
          </span>
        </div>

        <div className="mt-4 space-y-0 divide-y divide-hairline">
          <div className="py-3">
            <p className="text-[11px] font-medium text-ink">
              1 · Provider Identification
            </p>
            <PlaceholderBar className="mt-2 w-full" />
            <PlaceholderBar className="mt-1.5 w-[85%]" />
          </div>

          <div className="border-l-2 border-l-accent bg-[#EEF1EC] py-3 pl-3 -ml-px">
            <p className="text-[11px] font-medium text-accent">
              1.3 · Article 54 Authorised Rep
            </p>
            <p className="mt-1 text-[10px] text-muted">
              Non-EU provider — required ✓
            </p>
          </div>

          <div className="py-3">
            <p className="text-[11px] font-medium text-ink">
              6 · Energy &amp; Compute Disclosures
            </p>
            <PlaceholderBar className="mt-2 w-[78%]" />
          </div>

          <div className="py-3">
            <p className="text-[11px] font-medium text-ink">
              8 · Red-Teaming &amp; Adversarial Eval
            </p>
            <PlaceholderBar className="mt-2 w-[70%]" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
          <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-dim">
            18 PAGES · ASCII-CLEAN
          </p>
          <p className="text-[10px] font-medium text-muted">⤓ PDF</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [riskQ1, setRiskQ1] = useState(null);
  const [riskQ2, setRiskQ2] = useState(null);
  const [riskQ3, setRiskQ3] = useState(null);
  const [riskQ4, setRiskQ4] = useState(null);
  const [riskSubmitted, setRiskSubmitted] = useState(false);
  const [riskIncomplete, setRiskIncomplete] = useState(false);

  const [faqOpen, setFaqOpen] = useState(() =>
    Object.fromEntries(FAQ_ITEMS.map((_, i) => [String(i), false])),
  );

  const flopsAbove10_23 =
    riskQ2 === "band23" || riskQ2 === "band24" || riskQ2 === "above25";

  const riskTier =
    riskQ1 === "no"
      ? "limited"
      : riskQ1 === "yes" &&
          flopsAbove10_23 &&
          riskQ3 === "yes" &&
          riskQ4 === "yes"
        ? "full"
        : riskQ1 === "yes"
          ? "standard"
          : null;

  function toggleFaq(index) {
    const key = String(index);
    setFaqOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleRiskCheck() {
    if (
      riskQ1 === null ||
      riskQ2 === null ||
      riskQ3 === null ||
      riskQ4 === null
    ) {
      setRiskIncomplete(true);
      setRiskSubmitted(false);
      return;
    }
    setRiskIncomplete(false);
    setRiskSubmitted(true);
  }

  const riskDocs = {
    full: [
      "Annex XI technical documentation (all 9 mandatory categories)",
      "Annex XII information package for downstream providers",
      "Copyright compliance policy (Article 53(1)(c))",
      "Training data summary with lawful basis (Article 53(1)(d))",
      "EU database registration dossier (where applicable)",
      "Systemic-risk–related disclosures and FLOPs evidence",
    ],
    standard: [
      "Annex XI technical documentation (core GPAI fields)",
      "Annex XII downstream capability and limitation summary",
      "Copyright and reservation-of-rights policy draft",
      "Training data provenance summary",
    ],
    limited: [
      "Optional transparency annex (best practice)",
      "Internal model card aligned to voluntary codes",
      "Deployer-facing usage guidelines (if you later enter the EU market)",
    ],
  };

  const tierLabel = {
    full: { headline: "FULL ARTICLE 53 OBLIGATIONS APPLY", priority: "PRIORITY · HIGH" },
    standard: { headline: "STANDARD GPAI OBLIGATIONS APPLY", priority: "PRIORITY · MEDIUM" },
    limited: { headline: "LIMITED EU AI ACT EXPOSURE", priority: "PRIORITY · LOW" },
  };

  const labelClass =
    "font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim";
  const primaryBtnClass =
    "juris-cta-primary inline-flex items-center justify-center rounded-[7px] bg-ink px-5 py-3 text-center text-[13px] font-medium uppercase tracking-[0.08em] text-bg";
  const secondaryBtnClass =
    "juris-cta-secondary inline-flex items-center justify-center rounded-[7px] border border-hairline bg-transparent px-5 py-3 text-center text-[13px] font-medium uppercase tracking-[0.08em] text-ink";

  return (
    <div className="min-h-screen bg-bg text-ink">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes juris-hero-fade-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .juris-hero-h1 { opacity: 0; animation: juris-hero-fade-up 0.6s ease forwards; }
          .juris-hero-sub { opacity: 0; animation: juris-hero-fade-up 0.6s ease 0.1s forwards; }
          .juris-hero-cta { opacity: 0; animation: juris-hero-fade-up 0.6s ease 0.2s forwards; }
          .juris-hero-preview { opacity: 0; animation: juris-hero-fade-up 0.6s ease 0.15s forwards; }
          .juris-card {
            transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
          }
          .juris-card:hover {
            border-color: #d5cfc4;
            background-color: #ffffff;
            transform: translateY(-2px);
          }
          .juris-table-row { transition: background-color 0.2s ease; }
          .juris-table-row:hover { background-color: #f7f4ee; }
          .juris-faq-panel { overflow: hidden; transition: max-height 0.3s ease; }
          .juris-risk-option {
            transition: border-color 0.15s ease, background-color 0.15s ease;
          }
          .juris-risk-option:hover { border-color: #c9c2b6; }
          .juris-cta-primary {
            transition: transform 0.2s ease, background-color 0.2s ease;
          }
          .juris-cta-primary:hover {
            transform: translateY(-1px);
            background-color: #3a342c;
          }
          .juris-cta-secondary { transition: border-color 0.2s ease, color 0.2s ease; }
          .juris-cta-secondary:hover { border-color: #9a917f; color: #211e19; }
        `,
        }}
      />

      {/* Top nav */}
      <header className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-hairline bg-bg px-6 py-4 sm:px-12">
        <div className="flex items-center">
          <span className="text-[14px] font-bold tracking-[0.14em] text-ink">
            JURIS
          </span>
          <span className="text-[14px] font-bold tracking-[0.14em] text-ink">
            AI
          </span>
        </div>
        <p className="font-sans text-left text-[11px] font-medium uppercase tracking-[0.08em] leading-snug text-dim sm:text-right">
          Articles 51–56 · Regulation (EU) 2024/1689
        </p>
      </header>

      {/* Enforcement banner */}
      <div className="w-full border-b border-hairline bg-chrome px-4 py-2.5 text-center">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] leading-relaxed text-dim sm:px-8">
          GPAI OBLIGATIONS UNDER ARTICLES 51–56 ENFORCED SINCE AUGUST 2, 2025 · NON-COMPLIANCE UP TO 3% OF GLOBAL ANNUAL TURNOVER
        </p>
      </div>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-6 py-9 sm:px-12 sm:py-[36px]">
          <div className="grid items-center gap-10 lg:grid-cols-[58%_42%] lg:gap-12">
            <div>
              <div className="inline-flex items-center rounded-[5px] border border-[#c8d5cb] bg-accent-tint px-3 py-1 font-sans text-[10.5px] font-medium uppercase tracking-[0.07em] text-accent">
                Regulation (EU) 2024/1689 · Annex XI compliance
              </div>

              <h1 className="juris-hero-h1 font-serif mt-8 max-w-[760px] text-[37px] font-medium leading-[1.1] tracking-[-0.015em] text-ink">
                Your GPAI model is already subject to EU law.
              </h1>

              <p className="juris-hero-sub mt-6 max-w-[31em] text-[15px] leading-[1.6] text-muted">
                JurisAI generates your complete Article 53 documentation package —
                Annex XI, Annex XII, copyright compliance policy, and training data
                summary — in under 10 minutes.
              </p>

              <div className="juris-hero-cta mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/generate"
                  className={`${primaryBtnClass} sm:min-w-[300px]`}
                >
                  Generate Annex XI Documentation →
                </Link>
                <Link
                  href="#what-jurisai-generates"
                  className={`${secondaryBtnClass} sm:min-w-[240px]`}
                >
                  See what Annex XI requires
                </Link>
              </div>

              <p className="font-sans mt-6 text-[11px] font-medium uppercase tracking-[0.08em] leading-relaxed text-dim">
                Enforced since August 2025 · Article 53(1)(a) · Regulation (EU) 2024/1689
              </p>
            </div>

            <div className="juris-hero-preview lg:pt-2">
              <HeroDocumentPreview />
            </div>
          </div>
        </section>

        {/* Enforcement status */}
        <section className="border-y border-hairline bg-bg px-6 py-12 sm:px-12">
          <div className="mx-auto max-w-[1100px] border border-hairline bg-surface px-6 py-10 sm:px-12">
            <h2 className="font-serif text-center text-[24px] font-medium leading-tight tracking-tight text-ink sm:text-[32px]">
              GPAI obligations are not coming. They&apos;re here.
            </h2>

            <div className="mt-8 space-y-3 text-center">
              <p className="font-sans text-[12px] font-medium uppercase tracking-[0.1em] leading-relaxed text-ink sm:text-[13px]">
                Articles 51–56 enforced since August 2, 2025
              </p>
              <p className="font-sans text-[12px] font-medium uppercase tracking-[0.1em] leading-relaxed text-muted sm:text-[13px]">
                Non-compliance: up to 3% of global annual turnover or €15M, whichever is higher (Article 101)
              </p>
            </div>

            <p className="font-sans mx-auto mt-8 max-w-[820px] text-center text-[10px] font-medium uppercase tracking-[0.08em] leading-relaxed text-dim sm:px-4">
              High-risk system provisions deferred to December 2, 2027 under the May 2026 Digital Omnibus agreement — GPAI provider obligations were NOT delayed.
            </p>
          </div>
        </section>

        {/* Obligation cards */}
        <section
          id="what-jurisai-generates"
          className="mx-auto max-w-[1200px] scroll-mt-6 px-6 py-16 sm:px-12 sm:py-20"
        >
          <p className={labelClass}>What JurisAI generates</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              {
                ref: "Art. 53(1)(a)",
                title: "Annex XI technical documentation",
                desc: "9-section technical disclosure covering architecture, training process, FLOPs, data provenance, and evaluation results.",
                footnote: "Required before market placement",
              },
              {
                ref: "Art. 53(1)(b)",
                title: "Annex XII downstream package",
                desc: "Capabilities, limitations, and intended purpose documentation for every provider building on your GPAI model.",
                footnote: "Required for all downstream providers",
              },
              {
                ref: "Art. 101",
                title: "Penalty exposure assessment",
                desc: "Non-compliance fines up to 3% of global annual turnover. Identify your exposure before the AI Office does.",
                footnote: "Enforced now",
              },
            ].map((c) => (
              <article
                key={c.ref}
                className="juris-card flex flex-col border border-hairline bg-surface p-6"
              >
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
                  {c.ref}
                </p>
                <h3 className="font-serif mt-3 text-[16px] font-medium leading-snug text-ink">
                  {c.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-[1.7] text-muted">
                  {c.desc}
                </p>
                <p className="font-sans mt-6 border-t border-hairline pt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
                  {c.footnote}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-hairline bg-bg px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-[1200px]">
            <p className={labelClass + " text-center"}>HOW IT WORKS</p>

            <div className="relative mt-14">
              <div
                className="pointer-events-none absolute left-[8%] right-[8%] top-4 z-0 hidden h-px border-t border-dashed border-hairline md:block"
                aria-hidden
              />

              <div className="relative z-10 grid gap-10 md:grid-cols-4 md:gap-6">
                {[
                  {
                    title: "Answer questions about your model",
                    desc: "Architecture, training, data sources.",
                  },
                  {
                    title: "JurisAI maps to regulation",
                    desc: "Every input mapped to its Annex XI obligation.",
                  },
                  {
                    title: "AI generates your documentation",
                    desc: "Structured, regulation-aligned output.",
                  },
                  {
                    title: "Download your compliance pack",
                    desc: "PDF ready for AI Office submission.",
                  },
                ].map((step, i) => (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center text-center"
                  >
                    {i > 0 && (
                      <div
                        className="absolute -top-6 left-1/2 z-0 h-6 w-px -translate-x-1/2 border-l border-dashed border-hairline md:hidden"
                        aria-hidden
                      />
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink bg-bg text-[13px] font-semibold text-ink">
                      {i + 1}
                    </div>
                    <h3 className="font-serif mt-4 text-[14px] font-medium leading-snug text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[240px] text-[12px] leading-[1.7] text-muted">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Risk check */}
        <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-12 sm:pb-20">
          <div className="border border-hairline bg-surface p-[40px]">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
              FREE GPAI RISK ASSESSMENT
            </p>
            <h2 className="font-serif mt-4 text-[24px] font-medium leading-tight text-ink sm:text-[28px]">
              Does EU AI Act apply to your model?
            </h2>
            <p className="mt-3 max-w-[640px] text-[14px] leading-[1.7] text-muted">
              Answer 4 questions to find out exactly which obligations apply to you.
            </p>

            <div className="mt-10 space-y-10">
              {/* Q1 */}
              <div>
                <p className="mb-3 text-[13px] font-medium text-ink">
                  Q1 · Is your model accessible via API or deployed in Europe?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {["yes", "no"].map((v) => {
                    const selected = riskQ1 === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setRiskQ1(v);
                          setRiskSubmitted(false);
                        }}
                        className={`juris-risk-option cursor-pointer rounded-[7px] border px-[16px] py-[12px] text-left text-[14px] sm:min-w-[120px] ${
                          selected
                            ? "border-ink bg-bg text-ink"
                            : "border-hairline bg-surface text-muted"
                        }`}
                      >
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q2 */}
              <div>
                <p className="mb-3 text-[13px] font-medium text-ink">
                  Q2 · Estimate your total training compute
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(FLOP_TIERS).map(([key, label]) => {
                    const selected = riskQ2 === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setRiskQ2(key);
                          setRiskSubmitted(false);
                        }}
                        className={`juris-risk-option cursor-pointer rounded-[7px] border px-[16px] py-[12px] text-left text-[13px] leading-snug ${
                          selected
                            ? "border-ink bg-bg text-ink"
                            : "border-hairline bg-surface text-muted"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q3 */}
              <div>
                <p className="mb-3 text-[13px] font-medium text-ink">
                  Q3 · Does your model generate text, images, audio, or video?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {["yes", "no"].map((v) => {
                    const selected = riskQ3 === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setRiskQ3(v);
                          setRiskSubmitted(false);
                        }}
                        className={`juris-risk-option cursor-pointer rounded-[7px] border px-[16px] py-[12px] text-left text-[14px] sm:min-w-[120px] ${
                          selected
                            ? "border-ink bg-bg text-ink"
                            : "border-hairline bg-surface text-muted"
                        }`}
                      >
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q4 */}
              <div>
                <p className="mb-3 text-[13px] font-medium text-ink">
                  Q4 · Is your model available to downstream developers or businesses?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {["yes", "no"].map((v) => {
                    const selected = riskQ4 === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setRiskQ4(v);
                          setRiskSubmitted(false);
                        }}
                        className={`juris-risk-option cursor-pointer rounded-[7px] border px-[16px] py-[12px] text-left text-[14px] sm:min-w-[120px] ${
                          selected
                            ? "border-ink bg-bg text-ink"
                            : "border-hairline bg-surface text-muted"
                        }`}
                      >
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleRiskCheck}
                className={`${primaryBtnClass} px-6`}
              >
                Check my obligations →
              </button>
            </div>

            {riskIncomplete && (
              <p className="font-sans mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                Please answer all four questions to see your obligation level.
              </p>
            )}

            {riskSubmitted && riskTier && (
              <div
                className="mt-10 border border-hairline bg-bg p-6 sm:p-8"
                role="status"
              >
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
                  {tierLabel[riskTier].priority}
                </p>
                <p className="font-serif mt-3 text-[18px] font-medium uppercase tracking-[0.04em] text-ink sm:text-[20px]">
                  {tierLabel[riskTier].headline}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-muted">
                  {riskTier === "full" &&
                    "Based on your answers, you likely qualify as a GPAI provider with systemic-risk-level documentation duties. You need the full documentation stack below before EU market placement or service."}
                  {riskTier === "standard" &&
                    "Your profile suggests core GPAI provider obligations under Article 53. Generate the documents below to align with Annex XI and XII before scaling EU access."}
                  {riskTier === "limited" &&
                    "If you do not place a GPAI model on the EU market or put it into service in Europe, many Article 53 provider obligations may not attach yet. Voluntary documentation still reduces partner and investor risk."}
                </p>
                <ul className="mt-6 space-y-2 text-[14px] text-ink">
                  {riskDocs[riskTier].map((d) => (
                    <li key={d} className="flex gap-3">
                      <span className="mt-2 inline-block h-px w-3 shrink-0 bg-hairline" aria-hidden />
                      <span className="text-muted">{d}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/generate" className={`${primaryBtnClass} px-6`}>
                    Generate these documents →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Fine calculator strip */}
        <section className="w-full border-y border-hairline bg-chrome px-6 py-12 text-center sm:px-12">
          <p className="mx-auto max-w-[900px] font-serif text-[15px] leading-[1.7] text-ink sm:text-[16px]">
            A company with €10M annual revenue faces up to €300,000 in fines for missing Annex XI documentation.
          </p>
          <p className="font-sans mt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
            Article 101 · Regulation (EU) 2024/1689
          </p>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-12 sm:py-20">
          <p className={labelClass + " text-center"}>JURISAI VS THE ALTERNATIVE</p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse border border-hairline text-left text-[14px]">
              <thead>
                <tr className="border-b border-hairline bg-surface">
                  <th className="font-sans px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-dim sm:px-5">
                    Feature
                  </th>
                  <th className="font-sans border-l border-hairline px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-dim sm:px-5">
                    Without JurisAI
                  </th>
                  <th className="font-sans border-l border-hairline px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-dim sm:px-5">
                    With JurisAI
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Time to generate Annex XI documentation", "3–6 months with lawyers", "Under 10 minutes"],
                  ["Cost", "€5,000–€20,000 legal fees", "From €2,000/month per model"],
                  ["Regulation accuracy", "Depends on lawyer's AI Act knowledge", "Built on 50-node GPAI ontology"],
                  ["Article 53 coverage", "Partial — most lawyers miss sub-obligations", "Complete — all 4 Article 53(1) obligations"],
                  ["Update when model changes", "Pay lawyers again", "Regenerate in minutes"],
                  ["Annex XI + XII bundle", "Two separate engagements", "Included in one flow"],
                  ["FLOPs-based systemic risk assessment", "Rarely included", "Built into the generator"],
                  ["Ready for AI Office submission", "After lengthy review cycles", "Download and submit"],
                ].map((row, idx) => (
                  <tr
                    key={row[0]}
                    className={`juris-table-row border-b border-hairline ${idx % 2 === 0 ? "bg-bg" : "bg-surface"}`}
                  >
                    <td className="px-4 py-4 text-[14px] text-ink sm:px-5">{row[0]}</td>
                    <td className="border-l border-hairline px-4 py-4 sm:px-5">
                      <div className="flex gap-2">
                        <IconX />
                        <span className="text-[14px] text-muted">{row[1]}</span>
                      </div>
                    </td>
                    <td className="border-l border-hairline px-4 py-4 sm:px-5">
                      <div className="flex gap-2">
                        <IconCheck />
                        <span className="text-[14px] text-ink">{row[2]}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-hairline bg-bg px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-[1200px]">
            <p className={labelClass + " text-center"}>WHAT COMPLIANCE EXPERTS SAY</p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  quote:
                    "The GPAI documentation gap is real. Most providers have no idea what Annex XI requires until an audit reveals it. A tool that generates this automatically is exactly what the market needs.",
                  role: "AI Audit Methodology Developer",
                },
                {
                  quote:
                    "Awareness is the first barrier — most AI companies don't know they have an obligation at all. Once they understand, speed to documentation is everything.",
                  role: "AI Governance & Compliance Consultant",
                },
                {
                  quote:
                    "The Article 53 documentation stack is non-trivial. Getting it right requires understanding 9 mandatory Annex XI categories that most compliance generalists overlook.",
                  role: "AI Governance Founder",
                },
              ].map((t) => (
                <article
                  key={t.role}
                  className="juris-card flex flex-col border border-hairline bg-surface p-[24px]"
                >
                  <p className="flex-1 text-[14px] italic leading-[1.7] text-ink">
                    “{t.quote}”
                  </p>
                  <p className="font-sans mt-6 text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
                    {t.role}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[820px] px-6 py-16 sm:px-12 sm:py-20">
          <p className={labelClass + " text-center"}>FREQUENTLY ASKED QUESTIONS</p>

          <div className="mt-10 border-t border-hairline">
            {FAQ_ITEMS.map((item, index) => {
              const open = faqOpen[String(index)];
              return (
                <div key={item.q} className="border-b border-hairline py-5">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={open}
                  >
                    <span className="font-serif text-[15px] font-medium text-ink">
                      {item.q}
                    </span>
                    <span className="font-sans shrink-0 text-[16px] text-ink" aria-hidden>
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className="juris-faq-panel"
                    style={{ maxHeight: open ? 2000 : 0 }}
                  >
                    <p className="pt-3 text-[13px] leading-[1.7] text-muted">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-bg px-6 py-20 text-center sm:px-12">
          <h2 className="font-serif mx-auto max-w-[720px] text-[28px] font-medium leading-tight text-ink sm:text-[36px]">
            Generate your compliance documentation today.
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-[1.7] text-muted sm:text-[15px]">
            Built specifically for GPAI model providers. Covers every Article 53 obligation.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/generate" className={`${primaryBtnClass} px-8 py-3.5`}>
              Start Annex XI Generator →
            </Link>
          </div>
          <p className="font-sans mx-auto mt-6 max-w-[640px] text-[10px] font-medium uppercase tracking-[0.12em] leading-relaxed text-dim">
            No account required · Under 10 minutes · Regulation (EU) 2024/1689 aligned
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-chrome px-6 py-8 sm:px-12">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] font-bold tracking-[0.14em] text-ink">
            JURISAI
          </div>
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim sm:text-right">
            Built for GPAI providers navigating Regulation (EU) 2024/1689
          </p>
        </div>
      </footer>
    </div>
  );
}
