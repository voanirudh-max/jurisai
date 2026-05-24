import { NextResponse } from "next/server";
import {
  GenerateAnnexXiError,
  generateAnnexXiDocument,
} from "../../../lib/generateAnnexXiDocument.js";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const document = await generateAnnexXiDocument(body);
    return NextResponse.json({ document });
  } catch (err) {
    if (err instanceof GenerateAnnexXiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 },
    );
  }
}
