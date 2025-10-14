// app/api/store-vectors/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { ids, documents, embeddings, metadatas } = body;

    if (!ids || !documents || !embeddings) {
      return NextResponse.json({ error: 'missing payload arrays' }, { status: 400 });
    }

    // build rows to insert/upsert
    const rows = ids.map((id, i) => ({
      id,
      document: documents[i] ?? null,
      embedding: embeddings[i],      // array -> will be cast into vector
      metadata: metadatas?.[i] ?? null
    }));

    // upsert (insert or update)
    const { data, error } = await supabase
      .from('pdf_embeddings')
      .upsert(rows, { onConflict: ['id'] });

    if (error) throw error;

    return NextResponse.json({ ok: true, count: data.length });
  } catch (err) {
    console.error('store-vectors error', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
