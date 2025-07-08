import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StoryGenres } from '@/components/story/StoryGenres';
import { StoryInterface } from '@/components/story/StoryInterface';
import Profile from './Profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, BookOpen, Sparkles, User } from 'lucide-react';

interface UserStory {
  id: string;
  title: string;
  genre: string;
  updated_at: string;
  is_completed: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'genres' | 'story' | 'profile'>('genres');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [userStories, setUserStories] = useState<UserStory[]>([]);

  useEffect(() => {
    if (user) {
      loadUserStories();
    }
  }, [user]);

  const loadUserStories = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('stories')
      .select('id, title, genre, updated_at, is_completed')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setUserStories(data);
    }
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentView('story');
  };

  const handleBackToGenres = () => {
    setCurrentView('genres');
    setSelectedGenre('');
    loadUserStories(); // Refresh stories when going back
  };

  const handleProfileView = () => {
    setCurrentView('profile');
  };

  const handleBackFromProfile = () => {
    setCurrentView('genres');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (currentView === 'story') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary p-6">
        <StoryInterface genre={selectedGenre} onBack={handleBackToGenres} />
      </div>
    );
  }

  if (currentView === 'profile') {
    return <Profile onBack={handleBackFromProfile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-primary" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Story Weaver
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.split('@')[0] || 'Storyteller'}!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleProfileView}
              className="border-border/50 hover:bg-secondary/50 hover:shadow-story hover:scale-105 transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-border/50 hover:bg-secondary/50 hover:shadow-story hover:scale-105 transition-all duration-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Recent Stories */}
        {userStories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Your Recent Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userStories.map((story) => (
                <Card key={story.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-story transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      {story.title}
                      {story.is_completed && <Sparkles className="h-4 w-4 text-accent" />}
                    </CardTitle>
                    <CardDescription>
                      {story.genre.charAt(0).toUpperCase() + story.genre.slice(1)} • {formatDate(story.updated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-border/50 hover:bg-secondary/50"
                      onClick={() => handleGenreSelect(story.genre)}
                    >
                      Continue Story
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Genre Selection */}
        <StoryGenres onSelectGenre={handleGenreSelect} />
      </div>
    </div>
  );
};

export default Dashboard;