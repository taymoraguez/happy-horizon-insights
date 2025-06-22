
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, TrendingUp, TrendingDown } from 'lucide-react';

// Mock website data with happiness scores
const websiteData = [
  { id: 1, name: 'YouTube', url: 'youtube.com', score: 8.9, visits: 156, category: 'Entertainment' },
  { id: 2, name: 'Spotify', url: 'spotify.com', score: 8.7, visits: 89, category: 'Music' },
  { id: 3, name: 'Instagram', url: 'instagram.com', score: 8.2, visits: 134, category: 'Social Media' },
  { id: 4, name: 'GitHub', url: 'github.com', score: 7.8, visits: 78, category: 'Development' },
  { id: 5, name: 'Netflix', url: 'netflix.com', score: 8.5, visits: 67, category: 'Entertainment' },
  { id: 6, name: 'Medium', url: 'medium.com', score: 7.9, visits: 45, category: 'Reading' },
  { id: 7, name: 'Reddit', url: 'reddit.com', score: 7.2, visits: 98, category: 'Social Media' },
  { id: 8, name: 'LinkedIn', url: 'linkedin.com', score: 6.8, visits: 56, category: 'Professional' },
  { id: 9, name: 'Stack Overflow', url: 'stackoverflow.com', score: 6.5, visits: 43, category: 'Development' },
  { id: 10, name: 'Twitter', url: 'twitter.com', score: 5.9, visits: 87, category: 'Social Media' },
  { id: 11, name: 'News Site', url: 'cnn.com', score: 4.8, visits: 34, category: 'News' },
  { id: 12, name: 'Work Portal', url: 'company-portal.com', score: 4.2, visits: 67, category: 'Work' },
  { id: 13, name: 'Banking Site', url: 'bank.com', score: 3.9, visits: 23, category: 'Finance' },
];

const getHappinessColor = (score: number) => {
  if (score >= 8) return 'text-green-600 bg-green-100';
  if (score >= 7) return 'text-green-500 bg-green-50';
  if (score >= 6) return 'text-yellow-600 bg-yellow-100';
  if (score >= 5) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Entertainment': 'bg-purple-100 text-purple-800',
    'Music': 'bg-pink-100 text-pink-800',
    'Social Media': 'bg-blue-100 text-blue-800',
    'Development': 'bg-gray-100 text-gray-800',
    'Reading': 'bg-indigo-100 text-indigo-800',
    'Professional': 'bg-green-100 text-green-800',
    'News': 'bg-red-100 text-red-800',
    'Work': 'bg-orange-100 text-orange-800',
    'Finance': 'bg-yellow-100 text-yellow-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const WebsiteAnalytics: React.FC = () => {
  const [selectedWebsite, setSelectedWebsite] = useState<typeof websiteData[0] | null>(null);

  // Sort websites by happiness score
  const sortedByHappiness = [...websiteData].sort((a, b) => b.score - a.score);
  const topTen = sortedByHappiness.slice(0, 10);
  const bottomTen = sortedByHappiness.slice(-10).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Website Rankings */}
      <div className="lg:col-span-2 space-y-6">
        {/* Top 10 Happiest Websites */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Top 10 Websites That Make You Happy
            </CardTitle>
            <CardDescription className="text-green-700">
              Websites that consistently boost your mood and happiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTen.map((website, index) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-4 bg-white/80 rounded-lg hover:bg-white/90 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => setSelectedWebsite(website)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{website.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {website.url}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(website.category)} variant="secondary">
                          {website.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{website.visits} visits</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{website.score}</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://${website.url}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom 10 Websites */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <TrendingDown className="h-5 w-5" />
              Bottom 10 Websites That Impact Your Mood
            </CardTitle>
            <CardDescription className="text-red-700">
              Websites that might be affecting your happiness negatively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomTen.map((website, index) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-4 bg-white/80 rounded-lg hover:bg-white/90 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => setSelectedWebsite(website)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{website.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {website.url}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(website.category)} variant="secondary">
                          {website.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{website.visits} visits</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">{website.score}</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://${website.url}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Website Details */}
      <div>
        <Card className="bg-white/70 backdrop-blur-sm sticky top-24">
          <CardHeader>
            <CardTitle>Website Details</CardTitle>
            <CardDescription>
              {selectedWebsite 
                ? `Analysis for ${selectedWebsite.name}`
                : 'Click on a website to view detailed analytics'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedWebsite ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedWebsite.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{selectedWebsite.url}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`https://${selectedWebsite.url}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">{selectedWebsite.score}</div>
                  <Badge className={getHappinessColor(selectedWebsite.score)}>
                    {selectedWebsite.score >= 8 ? 'Very Happy' : 
                     selectedWebsite.score >= 7 ? 'Happy' :
                     selectedWebsite.score >= 6 ? 'Neutral' :
                     selectedWebsite.score >= 5 ? 'Somewhat Negative' : 'Negative Impact'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Category</span>
                    <Badge className={getCategoryColor(selectedWebsite.category)} variant="secondary">
                      {selectedWebsite.category}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Visits</span>
                    <span className="font-semibold">{selectedWebsite.visits}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Happiness Rank</span>
                    <span className="font-semibold">
                      #{sortedByHappiness.findIndex(w => w.id === selectedWebsite.id) + 1} of {websiteData.length}
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Insights</h4>
                  <p className="text-sm text-blue-700">
                    {selectedWebsite.score >= 8 
                      ? "This website consistently brings you joy! Consider spending more time here when you need a mood boost."
                      : selectedWebsite.score >= 6
                      ? "This website has a neutral impact on your mood. It might be worth monitoring your usage patterns."
                      : "This website might be impacting your happiness negatively. Consider limiting your time here or being more mindful when visiting."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a website from the lists to view detailed analytics and insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
