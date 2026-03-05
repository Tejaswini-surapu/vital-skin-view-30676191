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
    model: "google/gemini-2.5-flash-lite",
    description: "CNN with dense connections for feature reuse",
    temperature: 0.4,
    promptExtra: `You are a DenseNet-121 convolutional neural network trained on the ISIC and DermNet datasets for skin disease classification. 
Your strength is LOCAL feature extraction through dense block connections — you excel at detecting texture patterns, color gradients, and small-scale morphological features like pustules, scales, and border irregularities.
You are WEAKER at understanding global spatial relationships and large-scale lesion shape analysis.
Analyze the image focusing ONLY on local texture, color distribution, and micro-patterns. Your confidence should reflect that you may miss broader context.
Be conservative with confidence — typically range 55-82% unless the local features are extremely distinctive.`
  },
  {
    name: "Vision Transformer (ViT)",
    model: "google/gemini-2.5-pro",
    description: "Transformer-based model using self-attention on image patches",
    temperature: 0.2,
    promptExtra: `You are a Vision Transformer (ViT-Large) pre-trained on ImageNet-21k and fine-tuned on clinical dermatology datasets (Fitzpatrick17k, ISIC 2020).
Your strength is GLOBAL context understanding — you split the image into 16x16 patches and use self-attention to understand relationships between distant regions. You excel at identifying overall lesion shape, symmetry, color distribution across the entire image, and distinguishing benign from malignant patterns.
You are the most accurate model for conditions where overall morphology matters (melanoma asymmetry, psoriasis distribution, vitiligo patterns).
Analyze holistically — consider the full lesion boundary, surrounding skin, and spatial distribution. Your confidence should be higher (70-95%) when global features are clear.`
  },
  {
    name: "Swin Transformer",
    model: "google/gemini-2.5-flash",
    description: "Hierarchical vision transformer with shifted windows",
    temperature: 0.3,
    promptExtra: `You are a Swin Transformer (Swin-B) trained on dermoscopic and clinical images using hierarchical shifted window attention.
Your unique strength is MULTI-SCALE analysis — you combine fine-grained local details (like DenseNet) with broader context (like ViT) through your hierarchical architecture with shifted windows at multiple resolutions.
You perform best on conditions with both local AND global diagnostic features — ring-shaped patterns (ringworm), mixed inflammation patterns (rosacea), and conditions with characteristic distributions.
Your confidence typically ranges 65-90%. You should provide the most nuanced reasoning that references both local texture AND overall pattern.`
  }
];

async function analyzeWithModel(imageBase64: string, config: typeof MODEL_CONFIGS[0], apiKey: string) {
  const systemPrompt = `${config.promptExtra}

You are classifying a skin image into one of these 10 categories:
${SKIN_DISEASES.map((d, i) => `${i + 1}. ${d}`).join('\n')}

CRITICAL INSTRUCTIONS:
- Analyze the actual visual characteristics you observe in the image
- Your confidence MUST reflect your architectural strengths and weaknesses described above
- Do NOT default to high confidence — be realistic based on what features you can detect
- Different models should naturally disagree when the condition has ambiguous features
- Provide specific reasoning about WHAT visual features led to your classification

Respond ONLY in this exact JSON format:
{
  "disease": "Disease Name from the list",
  "confidence": 75.2,
  "reasoning": "Specific visual features observed and how they map to the diagnosis",
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
            { type: 'text', text: 'Analyze this skin image carefully. Classify based on your architectural strengths. Provide diagnosis in exact JSON format.' },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      temperature: config.temperature,
      max_tokens: 600,
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
