// src/app/api/embed/route.js
import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

// 🧩 Initialize Supabase client
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Must be the service role key (not anon)
);

export async function POST(req) {
  try {
    const { docs } = await req.json();
    if (!docs?.length) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    // 🧠 Combine all text pages
    const fullText = docs.map((d) => d.pageContent).join("\n");
    console.log("📄 Total text length:", fullText.length);

    // ✂️ Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.createDocuments(
      docs.map((d) => d.pageContent),
      docs.map((d) => d.metadata)
    );

    console.log(`✂️ Split into ${splitDocs.length} chunks`);

    // 🔢 Initialize Hugging Face embeddings
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-mpnet-base-v2",
    });

    // 🧱 Store vectors in Supabase
    const vectorStore = await SupabaseVectorStore.fromDocuments(splitDocs, embeddings, {
      client: supabaseClient,
      tableName: "pdf_embeddings",
      queryName: "match_pdf_embeddings",
    });

    console.log("✅ Stored embeddings in Supabase");

    return NextResponse.json({
      success: true,
      message: "PDF embedded and stored successfully",
      chunks: splitDocs.length,
    });
  } catch (err) {
    console.error("❌ Embedding error:", err);
    return NextResponse.json(
      { error: err.message || "Embedding failed" },
      { status: 500 }
    );
  }
}
