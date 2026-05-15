import { NextResponse } from "next/server";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are an EU AI Act compliance expert. Generate a formal Annex XI technical documentation package under Regulation (EU) 2024/1689 Article 53(1)(a). Output must be structured, precise, and regulation-compliant. Use formal legal document formatting with clear section headers.

FORMATTING REQUIREMENTS:
- Use clean markdown only: # / ## / ### for headings, **bold** for emphasis, GitHub-flavored tables for tabular data, ordered or unordered lists for enumerations, and --- for section breaks.
- DO NOT produce ASCII art, box diagrams, character-based illustrations, or any drawing made from |, -, +, =, ─, │, ┌, ┐, └, ┘, ├, ┤, ┬, ┴, ┼, ▲, ▼, ◀, ▶, ║, ╔, ╗, ╚, ╝, █, ░, ▒, ▓, or similar box-drawing or block characters.
- When describing the training pipeline or any workflow, present it as a numbered list of stages with a short title and a one-sentence description for each stage. You MAY use the single arrow character → on one line to summarise a sequence (e.g. "Pre-training → Supervised fine-tuning → Preference optimisation → Safety evaluation"), but never construct multi-line diagrams.
- Tables must be valid GitHub-flavored markdown (\`| col | col |\` with a \`| --- | --- |\` separator row).
- Inline code (backticks) is only for short technical identifiers; do not wrap prose in code blocks.`;

function modalitiesList(modalities) {
  if (!modalities || typeof modalities !== "object") return "None selected";
  const on = Object.entries(modalities)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k);
  return on.length ? on.join(", ") : "None selected";
}

function buildUserMessage(body) {
  const m = modalitiesList(body.modalities);

  return `Generate a complete Annex XI technical documentation package for the following GPAI model:

MODEL IDENTITY
- Model name: ${body.modelName ?? "(not provided)"}
- Provider name: ${body.providerName ?? "(not provided)"}
- Version number: ${body.versionNumber ?? "(not provided)"}
- Release date: ${body.releaseDate ?? "(not provided)"}

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
- Intended use cases: ${body.intendedUseCases ?? "(not provided)"}
- Prohibited use cases: ${body.prohibitedUseCases ?? "(not provided)"}
- High-risk AI system use cases (yes/no): ${body.highRiskAiSystem ?? "(not provided)"}`;
}

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY is not configured on the server. Add it to .env.local and restart `next dev`.",
        },
        { status: 500 },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userContent = buildUserMessage(body);

    let anthropicRes;
    try {
      anthropicRes = await fetch(ANTHROPIC_URL, {
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
      return NextResponse.json(
        {
          error: `Cannot reach Anthropic API (network error: ${detail}). Check your internet connection and that api.anthropic.com is reachable.`,
        },
        { status: 502 },
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
      return NextResponse.json(
        { error: finalMsg },
        { status: anthropicRes.status },
      );
    }

    const textBlock = Array.isArray(data.content)
      ? data.content.find((c) => c.type === "text")
      : null;
    const document = textBlock?.text ?? "";

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Anthropic returned an empty response. Please retry; if it persists the model may have refused the request.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ document });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 },
    );
  }
}
