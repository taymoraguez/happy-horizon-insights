import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonAnalysis, usePersonAnalyses } from "@/hooks/useApi";
import { Loader2, MessageCircle, TrendingDown, TrendingUp } from "lucide-react";
import React, { useState } from "react";

const getHappinessColor = (score: number) => {
  if (score >= 0.5) return "text-green-600 bg-green-100";
  if (score >= 0.2) return "text-green-500 bg-green-50";
  if (score >= -0.2) return "text-yellow-600 bg-yellow-100";
  if (score >= -0.5) return "text-orange-600 bg-orange-100";
  return "text-red-600 bg-red-100";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getCorrelationLabel = (score: number) => {
  if (score >= 0.5) return "Very Positive";
  if (score >= 0.2) return "Positive";
  if (score >= -0.2) return "Neutral";
  if (score >= -0.5) return "Somewhat Negative";
  return "Negative Impact";
};

export const MessageAnalytics: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<PersonAnalysis | null>(
    null
  );

  // Automatically uses the latest TimeAnalysis
  const { data: contactData, loading, error } = usePersonAnalyses();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading person analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading person analytics: {error}</p>
      </div>
    );
  }

  if (!contactData || contactData.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>
          No person analytics data available. Run a sentiment analysis first.
        </p>
      </div>
    );
  }

  // Sort contacts by happiness score
  const sortedByHappiness = [...contactData].sort(
    (a, b) => b.correlation_coefficient - a.correlation_coefficient
  );
  const topTen = sortedByHappiness.slice(0, 10);
  const bottomTen = sortedByHappiness.slice(-10).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contact Rankings */}
      <div className="lg:col-span-2 space-y-6">
        {/* Top 10 Happiest Contacts */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Top 10 People Who Make You Happiest
            </CardTitle>
            <CardDescription className="text-green-700">
              Contacts whose interactions consistently boost your mood and bring
              joy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTen.map((contact, index) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-white/80 rounded-lg hover:bg-white/90 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-800 font-semibold">
                        {getInitials(contact.contact_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {contact.contact_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <MessageCircle className="h-3 w-3" />
                        {contact.days_interacted} days interacted •{" "}
                        {contact.total_messages} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {contact.correlation_coefficient.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom 10 Contacts */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <TrendingDown className="h-5 w-5" />
              Bottom 10 Contacts That Impact Your Mood
            </CardTitle>
            <CardDescription className="text-red-700">
              People whose interactions might be affecting your happiness levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomTen.map((contact, index) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-white/80 rounded-lg hover:bg-white/90 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-red-100 text-red-800 font-semibold">
                        {getInitials(contact.contact_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {contact.contact_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <MessageCircle className="h-3 w-3" />
                        {contact.days_interacted} days interacted •{" "}
                        {contact.total_messages} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {contact.correlation_coefficient.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Details */}
      <div>
        <Card className="bg-white/70 backdrop-blur-sm sticky top-24">
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              {selectedContact
                ? `Analysis for ${selectedContact.contact_name}`
                : "Click on a contact to view interaction details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContact ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="bg-gray-200 text-gray-800 font-bold text-lg">
                      {getInitials(selectedContact.contact_name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedContact.contact_name}
                  </h3>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {selectedContact.correlation_coefficient.toFixed(3)}
                  </div>
                  <Badge
                    className={getHappinessColor(
                      selectedContact.correlation_coefficient
                    )}
                  >
                    {getCorrelationLabel(
                      selectedContact.correlation_coefficient
                    )}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Days Interacted</span>
                    <span className="font-semibold">
                      {selectedContact.days_interacted}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Days Not Interacted</span>
                    <span className="font-semibold">
                      {selectedContact.days_not_interacted}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Messages</span>
                    <span className="font-semibold">
                      {selectedContact.total_messages}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Happiness Rank</span>
                    <span className="font-semibold">
                      #
                      {sortedByHappiness.findIndex(
                        (c) => c.id === selectedContact.id
                      ) + 1}{" "}
                      of {contactData.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">
                        Avg Sentiment When Interacted
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {selectedContact.avg_sentiment_when_interacted.toFixed(
                          3
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-600 font-medium">
                        Avg Sentiment When Not Interacted
                      </div>
                      <div className="text-lg font-bold text-red-700">
                        {selectedContact.avg_sentiment_when_not_interacted.toFixed(
                          3
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    💡 Insights
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedContact.correlation_coefficient >= 0.2
                      ? "Interactions with this person consistently make you happy! They're clearly a positive influence in your life."
                      : selectedContact.correlation_coefficient >= -0.2
                      ? "This person has a neutral impact on your mood. Interactions tend to be more functional or mixed in sentiment."
                      : "Interactions with this contact might be affecting your happiness negatively. Consider setting boundaries or addressing any issues."}
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    Significance Score:{" "}
                    {selectedContact.significance_score.toFixed(3)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>
                  Select a contact from the lists to view interaction analytics
                  and insights
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
