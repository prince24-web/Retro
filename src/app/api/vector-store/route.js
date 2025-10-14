// src/app/api/embed/route.js
import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  console.log("🚀 /api/embed called");

  try {
    // Step 1: Parse input
    const { docs } = await req.json();
    console.log("📥 Received docs:", Array.isArray(docs) ? docs.length : 0);

    if (!docs?.length) {
      console.warn("⚠️ No documents provided!");
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    // Step 2: Combine text
    const fullText = docs.map((d) => d.pageContent).join("\n");
    console.log("📄 Total text length:", fullText.length);

    // Step 3: Split text
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.createDocuments(
      docs.map((d) => d.pageContent),
      docs.map((d) => d.metadata)
    );
    console.log(`✂️ Split into ${splitDocs.length} chunks`);
    console.log("🧩 Example chunk:", splitDocs[0]?.pageContent?.slice(0, 100));

    // Step 4: Initialize embeddings
    console.log("⚙️ Initializing HuggingFace embeddings...");
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-mpnet-base-v2",
    });

    // Step 5: Test embedding generation
    console.log("🧠 Generating test embedding for first chunk...");
    const testEmbedding = await embeddings.embedQuery(splitDocs[0].pageContent);
    console.log("✅ Test embedding length:", testEmbedding?.length);

    // Step 6: Store embeddings in Supabase
    console.log("📦 Uploading embeddings to Supabase...");
    const vectorStore = await SupabaseVectorStore.fromDocuments(splitDocs, embeddings, {
      client: supabaseClient,
      tableName: "pdf_embeddings",
      queryName: "match_pdf_embeddings",
    });

    console.log("✅ Successfully stored embeddings in Supabase");

    // Step 7: Confirm count in Supabase
    const { count, error: countError } = await supabaseClient
      .from("pdf_embeddings")
      .select("id", { count: "exact", head: true });

    if (countError) console.error("⚠️ Count check error:", countError);
    else console.log("📊 Total rows in Supabase:", count);

    // Step 8: Finish
    return NextResponse.json({
      success: true,
      message: "PDF embedded and stored successfully",
      chunks: splitDocs.length,
      totalRows: count ?? "unknown",
    });
  } catch (err) {
    console.error("❌ Embedding error:", err);
    return NextResponse.json(
      { error: err.message || "Embedding failed" },
      { status: 500 }
    );
  }
}
