import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Sparkles, Heart, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative mb-8">
            <BookOpen className="h-20 w-20 text-primary mx-auto mb-4" />
            <Sparkles className="h-8 w-8 text-accent absolute top-0 right-1/2 translate-x-6 animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Story Weaver
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Where your emotions shape enchanting interactive stories. 
            Experience personalized adventures that respond to your heart and soul.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-magical transition-all duration-300 text-lg px-8 py-6"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Begin Your Adventure
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="border-border/50 hover:bg-secondary/50 text-lg px-8 py-6 transition-magical"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Enter Story Realm
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-story transition-all duration-300">
              <CardHeader className="text-center">
                <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Emotional Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stories that understand and respond to your feelings, creating deeper connections and meaningful experiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-story transition-all duration-300">
              <CardHeader className="text-center">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-lg">AI-Powered Narratives</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI creates unique storylines that adapt and evolve based on your choices and emotional responses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-story transition-all duration-300">
              <CardHeader className="text-center">
                <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Endless Adventures</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore fantasy realms, sci-fi worlds, romantic tales, and mysterious adventures that never end.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
