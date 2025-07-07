import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const huggingFaceKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!huggingFaceKey) {
      throw new Error('Hugging Face API key not configured');
    }

    // Use emotion classification model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            return_all_scores: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API failed: ${response.status}`);
    }

    const emotions = await response.json();
    
    // Handle the response format
    let emotionScores;
    if (Array.isArray(emotions) && emotions.length > 0) {
      emotionScores = emotions[0];
    } else if (Array.isArray(emotions)) {
      emotionScores = emotions;
    } else {
      emotionScores = [];
    }

    // Find dominant emotion
    let dominantEmotion = { label: 'neutral', score: 0 };
    const allEmotions: Record<string, number> = {};

    emotionScores.forEach((emotion: { label: string; score: number }) => {
      allEmotions[emotion.label] = emotion.score;
      if (emotion.score > dominantEmotion.score) {
        dominantEmotion = emotion;
      }
    });

    const emotionData = {
      dominant_emotion: dominantEmotion.label,
      confidence: dominantEmotion.score,
      all_emotions: allEmotions
    };

    return new Response(
      JSON.stringify({ emotion: emotionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-emotion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});