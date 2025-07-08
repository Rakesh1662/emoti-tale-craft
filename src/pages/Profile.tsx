import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Save, BookOpen, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  username: string | null;
  user_id: string;
  created_at: string;
}

interface ProfileProps {
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username || '');
    } else if (error?.code === 'PGRST116') {
      // Profile doesn't exist, create one
      await createProfile();
    }
    setLoading(false);
  };

  const createProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        username: user.email?.split('@')[0] || ''
      })
      .select()
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username || '');
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profile updated! ✨",
        description: "Your storyteller profile has been saved."
      });
      setProfile({ ...profile, username });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <User className="h-8 w-8 text-primary" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your storyteller identity
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Storyteller Details
            </CardTitle>
            <CardDescription>
              Customize how you appear in the magical realm of stories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted/50"
              />
              <p className="text-sm text-muted-foreground">
                Your email cannot be changed here
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Storyteller Name</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your preferred name..."
                className="transition-all duration-200 focus:ring-primary/50"
              />
              <p className="text-sm text-muted-foreground">
                This name will appear in your stories and adventures
              </p>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Just now!'}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 hover:scale-105 transition-all duration-300"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                className="hover:scale-105 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;