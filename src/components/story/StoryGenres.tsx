import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sword, Heart, Zap, TreePine, Crown, Skull } from 'lucide-react';

interface Genre {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const genres: Genre[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical realms filled with dragons, wizards, and ancient mysteries',
    icon: <Crown className="h-6 w-6" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Thrilling quests and dangerous journeys across unknown lands',
    icon: <Sword className="h-6 w-6" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Tales of love, passion, and heartwarming connections',
    icon: <Heart className="h-6 w-6" />,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    description: 'Futuristic worlds with advanced technology and space exploration',
    icon: <Zap className="h-6 w-6" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'mystery',
    name: 'Mystery',
    description: 'Puzzling enigmas and thrilling detective adventures',
    icon: <Skull className="h-6 w-6" />,
    color: 'from-gray-600 to-gray-800'
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Stories set in beautiful natural settings with environmental themes',
    icon: <TreePine className="h-6 w-6" />,
    color: 'from-green-500 to-emerald-500'
  }
];

interface StoryGenresProps {
  onSelectGenre: (genre: string) => void;
}

export const StoryGenres: React.FC<StoryGenresProps> = ({ onSelectGenre }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Choose Your Story Adventure
        </h2>
        <p className="text-muted-foreground">
          Select a genre to begin crafting your personalized interactive story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {genres.map((genre) => (
          <Card 
            key={genre.id}
            className="group hover:shadow-magical transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer"
            onClick={() => onSelectGenre(genre.id)}
          >
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${genre.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                {genre.icon}
              </div>
              <CardTitle className="text-xl text-foreground">{genre.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-muted-foreground mb-4">
                {genre.description}
              </CardDescription>
              <Button 
                variant="outline" 
                className="w-full border-border/50 hover:bg-secondary/50 transition-magical group-hover:border-primary/50"
              >
                Start {genre.name} Story
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};