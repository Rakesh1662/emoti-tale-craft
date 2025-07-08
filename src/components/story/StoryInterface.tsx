import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Heart, Smile, Frown, Angry, AlertTriangle, Meh, Send, Sparkles, BookOpen } from 'lucide-react';

interface StoryInterfaceProps {
  genre: string;
  onBack: () => void;
}

interface EmotionData {
  dominant_emotion: string;
  confidence: number;
  all_emotions: Record<string, number>;
}

interface StoryChapter {
  id: number;
  content: string;
  userInput: string;
  emotionData?: EmotionData;
  choices?: string[];
  timestamp: string;
}

const emotionIcons: Record<string, React.ReactNode> = {
  joy: <Smile className="h-4 w-4" />,
  sadness: <Frown className="h-4 w-4" />,
  anger: <Angry className="h-4 w-4" />,
  fear: <AlertTriangle className="h-4 w-4" />,
  surprise: <AlertTriangle className="h-4 w-4" />,
  love: <Heart className="h-4 w-4" />,
  neutral: <Meh className="h-4 w-4" />
};

export const StoryInterface: React.FC<StoryInterfaceProps> = ({ genre, onBack }) => {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    initializeStory();
  }, [genre]);

  const initializeStory = async () => {
    if (!user) return;

    const title = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Adventure`;
    setStoryTitle(title);

    // Create new story in database
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        title,
        genre,
        content: []
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating story",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setStoryId(data.id);

    // Generate initial story chapter
    await generateStoryChapter('', true);
  };

  const analyzeEmotion = async (text: string): Promise<EmotionData | null> => {
    if (!text.trim()) return null;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text }
      });

      if (error) throw new Error('Failed to analyze emotion');
      return data.emotion;

    } catch (error) {
      console.error('Emotion analysis error:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStoryChapter = async (userInput: string, isInitial = false) => {
    if (!storyId && !isInitial) return;

    setIsGenerating(true);
    
    try {
      // Analyze user emotion if there's input
      let emotionData: EmotionData | null = null;
      if (userInput.trim()) {
        emotionData = await analyzeEmotion(userInput);
      }

      // Generate story content
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: {
          genre,
          chapters: chapters.map(c => ({ content: c.content, userInput: c.userInput })),
          userInput,
          emotionData,
          isInitial
        }
      });

      if (error) throw new Error('Failed to generate story');
      
      const newChapter: StoryChapter = {
        id: chapters.length + 1,
        content: data.content,
        userInput,
        emotionData: emotionData || undefined,
        choices: data.choices,
        timestamp: new Date().toISOString()
      };

      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      setCurrentInput('');

      // Update story in database
      if (storyId) {
        await supabase
          .from('stories')
          .update({
            content: updatedChapters as any,
            emotion_data: emotionData as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', storyId);

        // Update progress
        await supabase
          .from('story_progress')
          .upsert({
            story_id: storyId,
            user_id: user!.id,
            current_chapter: updatedChapters.length,
            emotional_state: emotionData as any,
            last_interaction: new Date().toISOString()
          });
      }

    } catch (error) {
      console.error('Story generation error:', error);
      toast({
        title: "Story generation failed",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isGenerating) return;

    await generateStoryChapter(currentInput);
  };

  const handleChoiceClick = (choice: string) => {
    setCurrentInput(choice);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-border/50 hover:bg-secondary/50"
        >
          ← Back to Genres
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
            {storyTitle}
          </h1>
          <Badge variant="secondary" className="mt-1">
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </Badge>
        </div>
        <div className="w-20" />
      </div>

      {/* Story Content */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              {chapter.userInput && (
                <div className="mb-4 p-3 bg-secondary/30 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">You said:</span>
                    {chapter.emotionData && (
                      <div className="flex items-center gap-1">
                        {emotionIcons[chapter.emotionData.dominant_emotion] || emotionIcons.neutral}
                        <span className="text-xs text-muted-foreground capitalize">
                          {chapter.emotionData.dominant_emotion} ({Math.round(chapter.emotionData.confidence * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm italic">{chapter.userInput}</p>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none text-foreground">
                {chapter.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {chapter.choices && chapter.choices.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Quick choices:</p>
                  <div className="flex flex-wrap gap-2">
                    {chapter.choices.map((choice, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleChoiceClick(choice)}
                        className="text-xs border-border/50 hover:bg-secondary/50"
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Input Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky bottom-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What happens next?
            {isAnalyzing && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                Analyzing emotion...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Describe what you want to do, how you feel, or what you're thinking..."
              className="min-h-20 bg-secondary/30 border-border/50 focus:border-primary resize-none"
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Your emotions and choices shape the story uniquely for you ✨
              </p>
              <Button 
                type="submit" 
                disabled={!currentInput.trim() || isGenerating}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-magical transition-all duration-300"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Weaving story...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Continue Story
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};