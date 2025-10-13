import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { question } = await req.json();
    console.log("🔍 Received question:", question);

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    // 1️⃣ Check if we have documents
    const { data: docCount } = await supabase
      .from("pdf_embeddings")
      .select("id", { count: "exact" });

    if (!docCount || docCount.length === 0) {
      return NextResponse.json({
        answer: "No documents found in the database. Please upload a PDF first.",
        sources: [],
      });
    }

    // 2️⃣ Initialize embeddings
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-mpnet-base-v2",
    });

    // 3️⃣ Search in Supabase
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: "pdf_embeddings",
      queryName: "match_pdf_embeddings",
    });

    const relevantDocs = await vectorStore.similaritySearch(question, 5);
    if (relevantDocs.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant information in the documents to answer your question.",
        sources: [],
      });
    }

    // 4️⃣ Build context with source tags
    const context = relevantDocs
      .map(
        (doc, index) =>
       `Source ${index + 1} (File: ${doc.metadata?.source || "unknown"}, Page: ${doc.metadata?.pageNumber || "?"}):\n${doc.pageContent}`
      )
      .join("\n\n");

    // 5️⃣ Ask Gemini with citation instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    const prompt = `
You are a helpful assistant that answers questions based only on the provided document context.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${question}

Instructions:
- Provide a clear, concise answer.
- Do NOT make up citations that aren’t in the context.
- If the context doesn’t answer the question, say so clearly.
`;

    console.log("📤 Sending to Gemini...");
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log("✅ Gemini response received");

    // 6️⃣ Return answer + sources
    return NextResponse.json({
      answer,
      sources: relevantDocs.map((doc, i) => ({
        id: i + 1,
        preview: doc.pageContent.substring(0, 200) + "...",
        metadata: doc.metadata,
        })),
    });
  } catch (err) {
    console.error("❌ Chat error:", err);
    return NextResponse.json({ error: `Chat failed: ${err.message}` }, { status: 500 });
  }
}
