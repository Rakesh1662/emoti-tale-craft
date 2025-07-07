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
    const { genre, chapters, userInput, emotionData, isInitial } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build the story context
    let storyContext = `You are an expert interactive storyteller creating a personalized ${genre} story.`;
    
    if (emotionData) {
      storyContext += ` The user is currently feeling ${emotionData.dominant_emotion} (${Math.round(emotionData.confidence * 100)}% confidence).`;
      storyContext += ` Adapt the story tone and events to acknowledge and respond to this emotional state.`;
    }

    // Add previous chapters context
    if (chapters && chapters.length > 0) {
      storyContext += `\n\nPrevious story chapters:\n`;
      chapters.forEach((chapter: any, index: number) => {
        if (chapter.userInput) {
          storyContext += `User input ${index + 1}: ${chapter.userInput}\n`;
        }
        storyContext += `Chapter ${index + 1}: ${chapter.content}\n\n`;
      });
    }

    let prompt;
    if (isInitial) {
      prompt = `${storyContext}

Create an engaging opening chapter for a ${genre} story. The opening should:
- Set an intriguing scene that immediately draws the reader in
- Establish the main character and setting
- Present an interesting situation or conflict
- End with a moment that invites the reader to participate in the story
- Be approximately 150-200 words
- Use vivid, immersive descriptions

Also provide 3-4 compelling choice options for what the character might do next.

Format your response as JSON:
{
  "content": "The story chapter text...",
  "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
}`;
    } else {
      prompt = `${storyContext}

The user just said: "${userInput}"

Continue the story by:
- Incorporating the user's input naturally into the narrative
- ${emotionData ? `Responding to their ${emotionData.dominant_emotion} emotional state appropriately` : 'Maintaining story flow'}
- Advancing the plot with interesting developments
- Creating vivid, engaging descriptions
- Ending with a moment that sets up the next user interaction
- Keep the chapter focused and around 100-150 words

Also provide 3-4 relevant choice options based on the current situation.

Format your response as JSON:
{
  "content": "The story chapter text...",
  "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a master storyteller who creates immersive, emotionally intelligent interactive stories. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const storyResponse = data.choices[0].message.content;

    try {
      const parsedResponse = JSON.parse(storyResponse);
      return new Response(
        JSON.stringify(parsedResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return new Response(
        JSON.stringify({
          content: storyResponse,
          choices: ["Continue the adventure", "Look around carefully", "Think about the situation", "Ask for help"]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});