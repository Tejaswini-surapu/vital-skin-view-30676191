// Skin Disease Detection Service
// Uses Lovable AI (Gemini Vision) for real image analysis

import { supabase } from "@/integrations/supabase/client";

export interface PredictionResult {
  disease: string;
  confidence: number;
  description: string;
  reasoning?: string;
  recommendations: string[];
}

export interface DiseaseInfo {
  name: string;
  description: string;
  symptoms: string[];
  commonTreatments: string[];
}

export const SKIN_DISEASES: DiseaseInfo[] = [
  {
    name: "Acne Vulgaris",
    description: "A common skin condition that occurs when hair follicles become clogged with oil and dead skin cells.",
    symptoms: ["Whiteheads", "Blackheads", "Pimples", "Cysts", "Nodules"],
    commonTreatments: ["Topical retinoids", "Benzoyl peroxide", "Salicylic acid", "Antibiotics"]
  },
  {
    name: "Eczema (Dermatitis)",
    description: "A condition that causes the skin to become inflamed, itchy, cracked, and rough.",
    symptoms: ["Dry skin", "Itching", "Red patches", "Bumps", "Thickened skin"],
    commonTreatments: ["Moisturizers", "Corticosteroid creams", "Antihistamines", "Light therapy"]
  },
  {
    name: "Melanoma",
    description: "The most serious type of skin cancer, developing in the cells that give skin its color.",
    symptoms: ["Asymmetrical moles", "Irregular borders", "Color changes", "Diameter changes", "Evolving appearance"],
    commonTreatments: ["Surgical removal", "Immunotherapy", "Targeted therapy", "Radiation therapy"]
  },
  {
    name: "Psoriasis",
    description: "A chronic autoimmune condition that causes rapid buildup of skin cells, leading to scaling.",
    symptoms: ["Red patches with silvery scales", "Dry cracked skin", "Itching", "Burning", "Thickened nails"],
    commonTreatments: ["Topical steroids", "Vitamin D analogues", "Phototherapy", "Biologics"]
  },
  {
    name: "Ringworm (Fungal Infection)",
    description: "A fungal infection that causes a ring-shaped, red, itchy rash on the skin.",
    symptoms: ["Ring-shaped rash", "Scaly borders", "Clear center", "Itching", "Spreading patches"],
    commonTreatments: ["Antifungal creams", "Oral antifungals", "Keeping area dry", "Antifungal powders"]
  },
  {
    name: "Rosacea",
    description: "A chronic skin condition causing redness and visible blood vessels on the face.",
    symptoms: ["Facial redness", "Visible blood vessels", "Bumps and pimples", "Eye irritation", "Thickened skin"],
    commonTreatments: ["Topical antibiotics", "Azelaic acid", "Laser therapy", "Oral antibiotics"]
  },
  {
    name: "Vitiligo",
    description: "A condition where the skin loses its pigment cells, resulting in white patches.",
    symptoms: ["White patches on skin", "Premature whitening of hair", "Loss of color in mouth", "Color loss in eyes"],
    commonTreatments: ["Topical corticosteroids", "Phototherapy", "Depigmentation", "Skin grafting"]
  },
  {
    name: "Warts",
    description: "Small, grainy skin growths caused by the human papillomavirus (HPV).",
    symptoms: ["Rough bumps", "Flesh-colored growths", "Black pinpoints", "Clusters of growths"],
    commonTreatments: ["Salicylic acid", "Cryotherapy", "Laser treatment", "Surgical removal"]
  },
  {
    name: "Lupus",
    description: "An autoimmune disease that can cause skin manifestations including the characteristic butterfly rash.",
    symptoms: ["Butterfly-shaped facial rash", "Skin lesions", "Photosensitivity", "Discoid rashes", "Hair loss"],
    commonTreatments: ["Antimalarial drugs", "Corticosteroids", "Immunosuppressants", "Sun protection"]
  },
  {
    name: "Impetigo",
    description: "A highly contagious bacterial skin infection characterized by red sores.",
    symptoms: ["Red sores", "Honey-colored crusts", "Blisters", "Itching", "Swollen lymph nodes"],
    commonTreatments: ["Topical antibiotics", "Oral antibiotics", "Proper hygiene", "Wound care"]
  }
];

// Disease descriptions for AI results
const diseaseDescriptions: Record<string, string> = {
  "Acne Vulgaris": "A common skin condition that occurs when hair follicles become clogged with oil and dead skin cells.",
  "Eczema (Dermatitis)": "A condition that causes the skin to become inflamed, itchy, cracked, and rough.",
  "Melanoma": "The most serious type of skin cancer, developing in the cells that give skin its color.",
  "Psoriasis": "A chronic autoimmune condition that causes rapid buildup of skin cells, leading to scaling.",
  "Ringworm (Fungal Infection)": "A fungal infection that causes a ring-shaped, red, itchy rash on the skin.",
  "Rosacea": "A chronic skin condition causing redness and visible blood vessels on the face.",
  "Vitiligo": "A condition where the skin loses its pigment cells, resulting in white patches.",
  "Warts": "Small, grainy skin growths caused by the human papillomavirus (HPV).",
  "Lupus": "An autoimmune disease that can cause skin manifestations including the characteristic butterfly rash.",
  "Impetigo": "A highly contagious bacterial skin infection characterized by red sores."
};

// Real AI-powered prediction using Gemini Vision
export const predictSkinDisease = async (imageFile: File): Promise<PredictionResult> => {
  // Convert image to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  // Call the edge function
  const { data, error } = await supabase.functions.invoke('analyze-skin', {
    body: { imageBase64: base64 }
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to analyze image');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  // Get description for the predicted disease
  const description = diseaseDescriptions[data.disease] || 
    `Analysis indicates possible ${data.disease}. Please consult a dermatologist for accurate diagnosis.`;

  return {
    disease: data.disease,
    confidence: data.confidence,
    description: description,
    reasoning: data.reasoning,
    recommendations: data.recommendations || [
      "Consult a dermatologist for professional diagnosis",
      "Do not self-medicate based on this prediction",
      "Keep the affected area clean and protected",
      "Monitor for any changes in symptoms"
    ]
  };
};

export const getDiseaseInfo = (diseaseName: string): DiseaseInfo | undefined => {
  return SKIN_DISEASES.find(d => 
    d.name.toLowerCase() === diseaseName.toLowerCase() ||
    d.name.toLowerCase().includes(diseaseName.toLowerCase()) ||
    diseaseName.toLowerCase().includes(d.name.split(' ')[0].toLowerCase())
  );
};
