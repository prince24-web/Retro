import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

// Temporary in-memory store (in production use Supabase, Pinecone, or Chroma)
let vectorStore = [];

// Function to set the vector store from your embedding step
export function setVectorStore(store) {
  vectorStore = store;
}

// POST endpoint for semantic similarity search
export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Missing 'question' in request body" }, { status: 400 });
    }

    // Initialize Hugging Face Inference
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // Generate embedding for the query
    const queryEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-mpnet-base-v2",
      inputs: question,
    });

    // Flatten nested arrays (Hugging Face returns [ [vector] ])
    const queryVector = queryEmbedding.flat();

    // Compute cosine similarity
    const cosineSimilarity = (a, b) =>
      a.reduce((sum, ai, i) => sum + ai * b[i], 0) /
      (Math.sqrt(a.reduce((sum, ai) => sum + ai ** 2, 0)) *
        Math.sqrt(b.reduce((sum, bi) => sum + bi ** 2, 0)));

    // Compare with stored vectors
    const similarities = vectorStore.map((item) => ({
      text: item.text,
      score: cosineSimilarity(queryVector, item.embedding),
    }));

    // Sort and return top 3 results
    similarities.sort((a, b) => b.score - a.score);

    return NextResponse.json({ results: similarities.slice(0, 3) });
  } catch (error) {
    console.error("❌ Query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
