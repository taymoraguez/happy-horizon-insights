
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';

// Mock message data with happiness scores
const contactData = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    score: 9.2, 
    messageCount: 134,
    recentMessages: [
      "Can't wait for our coffee date tomorrow! ☕",
      "Thanks for always being there for me 💕",
      "That movie recommendation was perfect!",
      "Hope you have an amazing day!"
    ]
  },
  { 
    id: 2, 
    name: 'Mom', 
    score: 8.9, 
    messageCount: 89,
    recentMessages: [
      "Love you sweetheart! Call me when you can",
      "Made your favorite cookies today 🍪",
      "So proud of everything you're achieving",
      "Can't wait to see you this weekend"
    ]
  },
  { 
    id: 3, 
    name: 'Alex Chen', 
    score: 8.5, 
    messageCount: 156,
    recentMessages: [
      "That joke you told yesterday still has me laughing 😂",
      "Thanks for helping me with the project!",
      "You're such an inspiration",
      "Let's grab lunch soon!"
    ]
  },
  { 
    id: 4, 
    name: 'Best Friends Group', 
    score: 8.7, 
    messageCount: 278,
    recentMessages: [
      "Game night at my place this Friday!",
      "You guys are the best friends ever",
      "Can't stop laughing at these memes",
      "Thanks for making my birthday special"
    ]
  },
  { 
    id: 5, 
    name: 'Emily Rodriguez', 
    score: 8.1, 
    messageCount: 67,
    recentMessages: [
      "Your advice really helped me today",
      "Thanks for listening yesterday",
      "You always know what to say",
      "Looking forward to our trip!"
    ]
  },
  { 
    id: 6, 
    name: 'Dad', 
    score: 7.8, 
    messageCount: 45,
    recentMessages: [
      "Proud of you kiddo",
      "How's work going?",
      "Remember to take care of yourself",
      "Love you always"
    ]
  },
  { 
    id: 7, 
    name: 'Jake Miller', 
    score: 7.2, 
    messageCount: 98,
    recentMessages: [
      "Thanks for the help with coding",
      "That was a fun hangout session",
      "See you at the meeting tomorrow",
      "Hope your presentation goes well"
    ]
  },
  { 
    id: 8, 
    name: 'Work Team', 
    score: 6.5, 
    messageCount: 234,
    recentMessages: [
      "Meeting moved to 3 PM",
      "Please review the documents",
      "Deadline extended until Friday",
      "Good work on the presentation"
    ]
  },
  { 
    id: 9, 
    name: 'Lisa Park', 
    score: 5.8, 
    messageCount: 43,
    recentMessages: [
      "Can we talk about what happened?",
      "I think there was a misunderstanding",
      "Hope things get better soon",
      "Let me know if you need anything"
    ]
  },
  { 
    id: 10, 
    name: 'Mark Thompson', 
    score: 4.9, 
    messageCount: 67,
    recentMessages: [
      "This project is really stressing me out",
      "Can we discuss the issues tomorrow?",
      "I'm not sure about this decision",
      "Things have been difficult lately"
    ]
  },
  { 
    id: 11, 
    name: 'Karen Wilson', 
    score: 4.2, 
    messageCount: 23,
    recentMessages: [
      "We need to address this problem",
      "I'm disappointed with the outcome",
      "This isn't working for me",
      "We should reconsider our approach"
    ]
  },
  { 
    id: 12, 
    name: 'Difficult Client', 
    score: 3.1, 
    messageCount: 34,
    recentMessages: [
      "This is completely unacceptable",
      "I demand a full explanation",
      "This needs to be fixed immediately",
      "I'm very unsatisfied with the service"
    ]
  }
];

const getHappinessColor = (score: number) => {
  if (score >= 8) return 'text-green-600 bg-green-100';
  if (score >= 7) return 'text-green-500 bg-green-50';
  if (score >= 6) return 'text-yellow-600 bg-yellow-100';
  if (score >= 5) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const MessageAnalytics: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<typeof contactData[0] | null>(null);

  // Sort contacts by happiness score
  const sortedByHappiness = [...contactData].sort((a, b) => b.score - a.score);
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
              Contacts whose messages consistently boost your mood and bring joy
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
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-800">{contact.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <MessageCircle className="h-3 w-3" />
                        {contact.messageCount} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{contact.score}</div>
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
              People whose messages might be affecting your happiness levels
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
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-800">{contact.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <MessageCircle className="h-3 w-3" />
                        {contact.messageCount} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{contact.score}</div>
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
                ? `Message analysis for ${selectedContact.name}`
                : 'Click on a contact to view message details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContact ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="bg-gray-200 text-gray-800 font-bold text-lg">
                      {getInitials(selectedContact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedContact.name}</h3>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">{selectedContact.score}</div>
                  <Badge className={getHappinessColor(selectedContact.score)}>
                    {selectedContact.score >= 8 ? 'Very Positive' : 
                     selectedContact.score >= 7 ? 'Positive' :
                     selectedContact.score >= 6 ? 'Neutral' :
                     selectedContact.score >= 5 ? 'Somewhat Negative' : 'Negative Impact'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Messages</span>
                    <span className="font-semibold">{selectedContact.messageCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Happiness Rank</span>
                    <span className="font-semibold">
                      #{sortedByHappiness.findIndex(c => c.id === selectedContact.id) + 1} of {contactData.length}
                    </span>
                  </div>
                </div>

                {/* Recent Messages */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Recent Messages</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {selectedContact.recentMessages.map((message, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700"
                        >
                          "{message}"
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Insights */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Insights</h4>
                  <p className="text-sm text-blue-700">
                    {selectedContact.score >= 8 
                      ? "Messages from this person consistently make you happy! They're clearly a positive influence in your life."
                      : selectedContact.score >= 6
                      ? "This person has a neutral impact on your mood. Messages tend to be more functional or mixed in sentiment."
                      : "Messages from this contact might be affecting your happiness negatively. Consider setting boundaries or addressing any issues."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a contact from the lists to view message analytics and insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
