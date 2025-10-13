import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the correct environment variable name
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { question } = await req.json(); // Remove chatHistory for now
    
    console.log("🔍 Step 1: Received question:", question);
    
    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    // 1. Check if we have documents in the database first
    const { data: docCount, error: countError } = await supabase
      .from('pdf_embeddings')
      .select('id', { count: 'exact' });

    console.log("📊 Database document count:", docCount?.length || 0);
    
    if (!docCount || docCount.length === 0) {
      return NextResponse.json({
        answer: "No documents found in the database. Please upload a PDF first.",
        sources: []
      });
    }

    // 2. Convert question to vector
    console.log("🔍 Step 2: Initializing embeddings...");
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-mpnet-base-v2",
    });

    // 3. Semantic search in Supabase
    console.log("🔍 Step 3: Searching for similar documents...");
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: "pdf_embeddings",
      queryName: "match_pdf_embeddings",
    });
    
    const relevantDocs = await vectorStore.similaritySearch(question, 5);
    console.log("📄 Found relevant documents:", relevantDocs.length);

    if (relevantDocs.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant information in the documents to answer your question.",
        sources: []
      });
    }

    // 4. Build context from relevant chunks
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
    console.log("📝 Context length:", context.length);

    // 5. Generate answer with Gemini
    console.log("🤖 Step 4: Calling Gemini...");
    
    // ✅ Use the correct model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite" // Changed from "gemini-2.0-pro"
    });
    
    const prompt = `
Based on the following document context, answer the user's question.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${question}

Please provide a helpful answer based only on the document context. If the context doesn't contain relevant information, say "I couldn't find relevant information in the document to answer this question."
`;

    console.log("📤 Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    console.log("✅ Gemini response received");

    return NextResponse.json({
      answer,
      sources: relevantDocs.map(doc => ({
        content: doc.pageContent.substring(0, 200) + "...",
        metadata: doc.metadata
      }))
    });
    
  } catch (err) {
    console.error("❌ Detailed chat error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    
    // Return more specific error information
    return NextResponse.json({ 
      error: `Chat failed: ${err.message}` 
    }, { status: 500 });
  }
}