"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  HeartHandshake, 
  Coffee, 
  Star, 
  Users, 
  MessageCircle, 
  Gift,
  Sparkles,
  Trophy,
  Crown,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  popular?: boolean;
  amount?: string;
}

interface FavoriteFeature {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  href: string;
}

export default function EnhancedSupportFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showThankYou, setShowThankYou] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mathHub_favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('mathHub_favorites', JSON.stringify([...newFavorites]));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (featureId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(featureId)) {
      newFavorites.delete(featureId);
      toast({
        title: "Removed from favorites",
        description: "Feature removed from your favorites list",
      });
    } else {
      newFavorites.add(featureId);
      toast({
        title: "Added to favorites! ⭐",
        description: "Feature saved to your favorites list",
      });
    }
    saveFavorites(newFavorites);
  };

  const supportOptions: SupportOption[] = [
    {
      id: 'coffee',
      title: 'Buy me a coffee',
      description: 'Support development with a small donation',
      icon: <Coffee className="w-5 h-5" />,
      action: () => {
        window.open('https://ko-fi.com/mathcomputing', '_blank');
        setShowThankYou(true);
        setTimeout(() => setShowThankYou(false), 3000);
      },
      popular: true,
      amount: '$3'
    },
    {
      id: 'sponsor',
      title: 'Monthly Sponsor',
      description: 'Become a monthly supporter for exclusive features',
      icon: <Crown className="w-5 h-5" />,
      action: () => {
        window.open('https://github.com/sponsors/mathcomputing', '_blank');
        toast({
          title: "Thank you for considering sponsorship! 👑",
          description: "Your support helps us build amazing math tools",
        });
      },
      amount: '$10/mo'
    },
    {
      id: 'feedback',
      title: 'Share Feedback',
      description: 'Help us improve with your suggestions',
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => {
        toast({
          title: "Feedback appreciated! 💬",
          description: "Your input helps make our tools better",
        });
      }
    },
    {
      id: 'community',
      title: 'Join Community',
      description: 'Connect with other math enthusiasts',
      icon: <Users className="w-5 h-5" />,
      action: () => {
        window.open('https://discord.gg/mathcomputing', '_blank');
        toast({
          title: "Welcome to the community! 🎉",
          description: "Connect with fellow math lovers",
        });
      }
    }
  ];

  const popularFeatures: FavoriteFeature[] = [
    {
      id: 'advanced-calc',
      name: 'Advanced Calculator',
      category: 'Core',
      icon: <Zap className="w-4 h-4" />,
      href: '/calculator'
    },
    {
      id: 'ai-solver',
      name: 'AI Math Solver',
      category: 'AI',
      icon: <Sparkles className="w-4 h-4" />,
      href: '/ai-math'
    },
    {
      id: '3d-graphing',
      name: '3D Graphing',
      category: 'Visualization',
      icon: <Trophy className="w-4 h-4" />,
      href: '/graphing'
    },
    {
      id: 'financial',
      name: 'Financial Tools',
      category: 'Business',
      icon: <Gift className="w-4 h-4" />,
      href: '/financial'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Support Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10" />
        <CardContent className="relative p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HeartHandshake className="w-6 h-6 text-pink-500" />
              <h3 className="text-xl font-bold">Support Our Mission</h3>
            </div>
            <p className="text-muted-foreground">
              Help us create the best mathematical computing platform
            </p>
          </div>

          {showThankYou && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-semibold">Thank you so much! Your support means everything! 💖</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-4 relative"
                onClick={option.action}
              >
                {option.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                    Popular
                  </Badge>
                )}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0 text-primary">
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold flex items-center gap-2">
                      {option.title}
                      {option.amount && (
                        <Badge variant="secondary" className="text-xs">
                          {option.amount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorites Section */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <h3 className="text-xl font-bold">Quick Access</h3>
            </div>
            <p className="text-muted-foreground">
              Save your favorite tools for easy access
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularFeatures.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {feature.category}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(feature.id)}
                  className="h-8 w-8 p-0"
                >
                  <Star
                    className={`w-4 h-4 ${
                      favorites.has(feature.id)
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              </div>
            ))}
          </div>

          {favorites.size > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-center text-muted-foreground">
                ⭐ You have {favorites.size} favorite tool{favorites.size !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}