// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✔️ définie' : '❌ non définie');
  try {
    const { history } = await request.json();
    console.log('Header Authorization:', `Bearer ${process.env.OPENROUTER_API_KEY}`);

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        messages: history,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json({ error: errorText }, { status: resp.status });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
