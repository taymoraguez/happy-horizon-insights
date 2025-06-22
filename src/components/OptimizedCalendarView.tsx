import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useDays,
  useHappiestMessages,
  useSaddestMessages,
} from "@/hooks/useApi";
import {
  Calendar as CalendarIcon,
  Frown,
  Loader2,
  MessageCircle,
  Smile,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./OptimizedCalendarView.css";

interface OptimizedCalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  refreshKey?: number;
}

// Convert sentiment score (-1 to 1) to happiness score (0 to 10)
const sentimentToHappiness = (sentiment: number): number => {
  return Math.max(0, Math.min(10, ((sentiment + 1) / 2) * 10));
};

const getHappinessColor = (score: number) => {
  if (score >= 8) return "bg-green-500";
  if (score >= 7) return "bg-green-400";
  if (score >= 6) return "bg-yellow-400";
  if (score >= 5) return "bg-orange-400";
  return "bg-red-500";
};

const getHappinessLevel = (score: number) => {
  if (score >= 8) return "Very Happy";
  if (score >= 7) return "Happy";
  if (score >= 6) return "Neutral";
  if (score >= 5) return "Somewhat Sad";
  return "Sad";
};

// Helper function to format message text
const formatMessageText = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const OptimizedCalendarView: React.FC<OptimizedCalendarViewProps> =
  React.memo(({ selectedDate, onDateSelect, refreshKey = 0 }) => {
    const [activeStartDate, setActiveStartDate] = useState(new Date());

    // Calculate date range for current month view with some buffer
    const dateRange = useMemo(() => {
      const startOfMonth = new Date(
        activeStartDate.getFullYear(),
        activeStartDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        activeStartDate.getFullYear(),
        activeStartDate.getMonth() + 1,
        0
      );

      // Add buffer days for calendar grid
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - 7); // Week buffer before
      const endDate = new Date(endOfMonth);
      endDate.setDate(endDate.getDate() + 7); // Week buffer after

      return {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      };
    }, [activeStartDate]);

    // Fetch happiness data for the current view
    const { data: daysData, loading, error } = useDays(dateRange);

    // Memoize selected date string to prevent unnecessary API calls
    const selectedDateString = useMemo(
      () => selectedDate?.toISOString().split("T")[0],
      [selectedDate]
    );

    // Fetch messages for selected date only when needed
    const { data: happiestMessages, loading: loadingHappiest } =
      useHappiestMessages({
        date: selectedDateString,
        limit: 5,
      });
    const { data: saddestMessages, loading: loadingSaddest } =
      useSaddestMessages({
        date: selectedDateString,
        limit: 5,
      });

    // Memoize happiness data conversion
    const happinessData = useMemo(() => {
      const dataMap: Record<
        string,
        {
          score: number;
          sentiment: number;
          message_count: number;
          sentiment_label: string;
        }
      > = {};

      daysData.forEach((day) => {
        const happinessScore = sentimentToHappiness(day.sentiment);
        dataMap[day.date] = {
          score: happinessScore,
          sentiment: day.sentiment,
          message_count: day.message_count,
          sentiment_label: day.sentiment_label,
        };
      });

      return dataMap;
    }, [daysData]);

    // Handle date selection
    const handleDateChange = useCallback(
      (value: Date | Date[]) => {
        const date = Array.isArray(value) ? value[0] : value;
        onDateSelect(date);
      },
      [onDateSelect]
    );

    // Handle month navigation
    const handleActiveStartDateChange = useCallback(
      ({ activeStartDate }: { activeStartDate: Date }) => {
        setActiveStartDate(activeStartDate);
      },
      []
    );

    // Custom tile content to show happiness data
    const tileContent = useCallback(
      ({ date }: { date: Date }) => {
        const dateKey = date.toISOString().split("T")[0];
        const dayData = happinessData[dateKey];

        if (!dayData) return null;

        return (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
            <div
              className={`w-4 h-4 rounded-full ${getHappinessColor(
                dayData.score
              )}`}
              title={`Happiness: ${dayData.score.toFixed(1)} (${
                dayData.message_count
              } messages)`}
            />
          </div>
        );
      },
      [happinessData]
    );

    // Custom tile className to highlight selected date
    const tileClassName = useCallback(
      ({ date }: { date: Date }) => {
        const dateKey = date.toISOString().split("T")[0];
        const dayData = happinessData[dateKey];
        const isSelected = selectedDate?.toDateString() === date.toDateString();

        let classes = "calendar-tile";

        if (dayData) {
          classes += " has-data";
        }

        if (isSelected) {
          classes += " selected";
        }

        return classes;
      },
      [happinessData, selectedDate]
    );

    // Refresh data when refreshKey changes
    useEffect(() => {
      // The useDays hook will automatically refresh when dependencies change
    }, [refreshKey]);

    if (error) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center text-red-600 py-8">
                  <div className="text-2xl mb-2">⚠️</div>
                  <p>Error loading calendar data: {error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Happiness Calendar (Optimized)
                    {loading && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Click on any day to view detailed happiness data
                    {daysData.length > 0 && (
                      <span className="ml-2 text-green-600">
                        ({daysData.length} days with data)
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  onActiveStartDateChange={handleActiveStartDateChange}
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  showNeighboringMonth={false}
                  className="react-calendar-custom"
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Very Happy (8.0+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span>Happy (7.0-7.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Neutral (6.0-6.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span>Somewhat Sad (5.0-5.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Sad (0-4.9)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day Details Section */}
        <div>
          <Card className="bg-white/70 backdrop-blur-sm h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Day Messages
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? `${selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}`
                  : "Select a day to view messages"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate &&
                (() => {
                  const dateKey = selectedDate.toISOString().split("T")[0];
                  const dayData = happinessData[dateKey];

                  if (dayData) {
                    return (
                      <div className="space-y-6">
                        {/* Day Summary */}
                        <div className="text-center bg-gray-50 p-4 rounded-lg">
                          <div className="text-3xl font-bold text-gray-800 mb-2">
                            {dayData.score.toFixed(1)}
                          </div>
                          <Badge
                            className={`${getHappinessColor(
                              dayData.score
                            )} text-white border-0 mb-2`}
                          >
                            {getHappinessLevel(dayData.score)}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            Based on {dayData.message_count} messages
                          </div>
                        </div>

                        {/* Happiest Messages */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Smile className="h-4 w-4 text-green-600" />
                            <h4 className="font-semibold text-green-600">
                              Top 5 Happiest Messages
                            </h4>
                            {loadingHappiest && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                          </div>
                          <ScrollArea className="h-40">
                            <div className="space-y-2">
                              {happiestMessages.length > 0 ? (
                                happiestMessages.map((message, index) => (
                                  <div
                                    key={message.id}
                                    className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500"
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <span className="text-xs font-medium text-green-700">
                                        #{index + 1} • {message.source}
                                      </span>
                                      <span className="text-xs font-bold text-green-600">
                                        +{message.sentiment.toFixed(2)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {formatMessageText(message.text)}
                                    </p>
                                    {message.contact && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        To: {message.contact}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-gray-500 py-4">
                                  <Smile className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">
                                    No happy messages found
                                  </p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>

                        <Separator />

                        {/* Saddest Messages */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Frown className="h-4 w-4 text-red-600" />
                            <h4 className="font-semibold text-red-600">
                              Top 5 Saddest Messages
                            </h4>
                            {loadingSaddest && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                          </div>
                          <ScrollArea className="h-40">
                            <div className="space-y-2">
                              {saddestMessages.length > 0 ? (
                                saddestMessages.map((message, index) => (
                                  <div
                                    key={message.id}
                                    className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <span className="text-xs font-medium text-red-700">
                                        #{index + 1} • {message.source}
                                      </span>
                                      <span className="text-xs font-bold text-red-600">
                                        {message.sentiment.toFixed(2)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {formatMessageText(message.text)}
                                    </p>
                                    {message.contact && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        To: {message.contact}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-gray-500 py-4">
                                  <Frown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">
                                    No sad messages found
                                  </p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-2xl mb-2">📅</div>
                        <p>No sentiment data available for this day</p>
                        <p className="text-sm mt-2">
                          Try refreshing to analyze recent messages, or check if
                          there were any communications on this date.
                        </p>
                      </div>
                    );
                  }
                })()}

              {!selectedDate && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-2xl mb-2">📋</div>
                  <p>
                    Click on a calendar day to view detailed sentiment analysis
                  </p>
                  <p className="text-sm mt-2">
                    Days with data will be colored based on sentiment analysis
                    of your messages.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  });

OptimizedCalendarView.displayName = "OptimizedCalendarView";
