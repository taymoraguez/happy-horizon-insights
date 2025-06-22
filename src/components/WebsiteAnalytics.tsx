import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWebsiteAnalyses, WebsiteAnalysis } from "@/hooks/useApi";
import {
  ExternalLink,
  Globe,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";

const getHappinessColor = (score: number) => {
  if (score >= 0.5) return "text-green-600 bg-green-100";
  if (score >= 0.2) return "text-green-500 bg-green-50";
  if (score >= -0.2) return "text-yellow-600 bg-yellow-100";
  if (score >= -0.5) return "text-orange-600 bg-orange-100";
  return "text-red-600 bg-red-100";
};

const formatDomain = (domain: string) => {
  // Add www. prefix if not present for display
  return domain.startsWith("www.") ? domain : `www.${domain}`;
};

const getCorrelationLabel = (score: number) => {
  if (score >= 0.5) return "Very Positive Impact";
  if (score >= 0.2) return "Positive Impact";
  if (score >= -0.2) return "Neutral Impact";
  if (score >= -0.5) return "Negative Impact";
  return "Very Negative Impact";
};

export const WebsiteAnalytics: React.FC = () => {
  const [selectedWebsite, setSelectedWebsite] =
    useState<WebsiteAnalysis | null>(null);

  // Automatically uses the latest TimeAnalysis
  const { data: websiteData, loading, error } = useWebsiteAnalyses();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading website analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading website analytics: {error}</p>
      </div>
    );
  }

  if (!websiteData || websiteData.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>
          No website analytics data available. Run a sentiment analysis first.
        </p>
      </div>
    );
  }

  // Sort websites by correlation coefficient
  const sortedByHappiness = [...websiteData].sort(
    (a, b) => b.correlation_coefficient - a.correlation_coefficient
  );
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
                      <div className="font-semibold text-gray-800">
                        {website.domain}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {formatDomain(website.domain)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {website.days_visited} days visited
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {website.total_visits} total visits
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {website.correlation_coefficient.toFixed(3)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://${website.domain}`, "_blank");
                        }}
                        title="Visit domain homepage"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                      {website.example_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(website.example_url, "_blank");
                          }}
                          title="Visit example page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
                      <div className="font-semibold text-gray-800">
                        {website.domain}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {formatDomain(website.domain)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {website.days_visited} days visited
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {website.total_visits} total visits
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {website.correlation_coefficient.toFixed(3)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://${website.domain}`, "_blank");
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
                ? `Analysis for ${selectedWebsite.domain}`
                : "Click on a website to view detailed analytics"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedWebsite ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedWebsite.domain}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {formatDomain(selectedWebsite.domain)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://${selectedWebsite.domain}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {selectedWebsite.correlation_coefficient.toFixed(3)}
                  </div>
                  <Badge
                    className={getHappinessColor(
                      selectedWebsite.correlation_coefficient
                    )}
                  >
                    {getCorrelationLabel(
                      selectedWebsite.correlation_coefficient
                    )}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Days Visited</span>
                    <span className="font-semibold">
                      {selectedWebsite.days_visited}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Days Not Visited</span>
                    <span className="font-semibold">
                      {selectedWebsite.days_not_visited}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Visits</span>
                    <span className="font-semibold">
                      {selectedWebsite.total_visits}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Happiness Rank</span>
                    <span className="font-semibold">
                      #
                      {sortedByHappiness.findIndex(
                        (w) => w.id === selectedWebsite.id
                      ) + 1}{" "}
                      of {websiteData.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">
                        Avg Sentiment When Visited
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {selectedWebsite.avg_sentiment_when_visited.toFixed(3)}
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-600 font-medium">
                        Avg Sentiment When Not Visited
                      </div>
                      <div className="text-lg font-bold text-red-700">
                        {selectedWebsite.avg_sentiment_when_not_visited.toFixed(
                          3
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    💡 Insights
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedWebsite.correlation_coefficient >= 0.2
                      ? "This website consistently brings you joy! Consider spending more time here when you need a mood boost."
                      : selectedWebsite.correlation_coefficient >= -0.2
                      ? "This website has a neutral impact on your mood. It might be worth monitoring your usage patterns."
                      : "This website might be impacting your happiness negatively. Consider limiting your time here or being more mindful when visiting."}
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    Significance Score:{" "}
                    {selectedWebsite.significance_score.toFixed(3)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>
                  Select a website from the lists to view detailed analytics and
                  insights
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
