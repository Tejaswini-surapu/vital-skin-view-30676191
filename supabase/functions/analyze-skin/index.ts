import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SKIN_DISEASES = [
  "Acne Vulgaris", "Eczema (Dermatitis)", "Melanoma", "Psoriasis",
  "Ringworm (Fungal Infection)", "Rosacea", "Vitiligo", "Warts", "Lupus", "Impetigo"
];

const MODEL_CONFIGS = [
  {
    name: "DenseNet-121",
    model: "google/gemini-2.5-flash",
    description: "CNN with dense connections for feature reuse",
    promptExtra: "You are simulating a DenseNet-121 CNN classifier. Focus on dense feature extraction and hierarchical pattern recognition."
  },
  {
    name: "Vision Transformer (ViT)",
    model: "google/gemini-2.5-pro",
    description: "Transformer-based model using self-attention on image patches",
    promptExtra: "You are simulating a Vision Transformer (ViT) classifier. Focus on global context and self-attention across image patches for holistic analysis."
  },
  {
    name: "Swin Transformer",
    model: "google/gemini-2.5-flash",
    description: "Hierarchical vision transformer with shifted windows",
    promptExtra: "You are simulating a Swin Transformer classifier. Focus on multi-scale hierarchical feature extraction with shifted window attention for fine-grained details."
  }
];

async function analyzeWithModel(imageBase64: string, config: typeof MODEL_CONFIGS[0], apiKey: string) {
  const systemPrompt = `${config.promptExtra}

You are a dermatology AI assistant. Analyze skin images and classify into one of these 10 categories:
${SKIN_DISEASES.map((d, i) => `${i + 1}. ${d}`).join('\n')}

IMPORTANT: Educational purposes only. You must:
1. Analyze visual characteristics of the skin condition
2. Classify as one of the 10 diseases above
3. Provide a confidence score between 60-98% (realistic, never 100%)
4. Explain your reasoning

Respond ONLY in this exact JSON format:
{
  "disease": "Disease Name from the list",
  "confidence": 85.5,
  "reasoning": "Brief explanation of visual features",
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this skin image. Provide diagnosis in exact JSON format.' },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    console.error(`${config.name} error:`, response.status);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      const validDisease = SKIN_DISEASES.find(d =>
        d.toLowerCase() === result.disease?.toLowerCase() ||
        d.toLowerCase().includes(result.disease?.toLowerCase()) ||
        result.disease?.toLowerCase().includes(d.split(' ')[0].toLowerCase())
      );
      return {
        modelName: config.name,
        modelDescription: config.description,
        disease: validDisease || result.disease || "Unknown",
        confidence: Math.min(98, Math.max(50, Number(result.confidence) || 75)),
        reasoning: result.reasoning || "Analysis completed",
        recommendations: result.recommendations || ["Consult a dermatologist"],
      };
    }
  } catch (e) {
    console.error(`Parse error for ${config.name}:`, e);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Analyzing with 3 models...');

    // Run all 3 models in parallel
    const results = await Promise.allSettled(
      MODEL_CONFIGS.map(config => analyzeWithModel(imageBase64, config, LOVABLE_API_KEY))
    );

    const modelResults = results
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter(Boolean);

    if (modelResults.length === 0) {
      return new Response(JSON.stringify({ error: 'All models failed to analyze' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Pick the highest confidence result as primary
    const best = modelResults.reduce((a, b) => (a!.confidence > b!.confidence ? a : b))!;

    const prediction = {
      disease: best.disease,
      confidence: best.confidence,
      reasoning: best.reasoning,
      recommendations: best.recommendations,
      modelResults: modelResults,
    };

    console.log('Best prediction:', best.modelName, best.disease, best.confidence);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
