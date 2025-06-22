import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDays } from "@/hooks/useApi";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  refreshKey?: number; // Add refresh key to trigger API reload
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

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  refreshKey = 0,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");

  // Calculate date range for API query based on current view
  const dateRange = useMemo(() => {
    if (viewMode === "weekly") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return {
        start_date: startOfWeek.toISOString().split("T")[0],
        end_date: endOfWeek.toISOString().split("T")[0],
      };
    } else {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Extend to show full calendar grid (previous/next month days)
      const startOfCalendar = new Date(startOfMonth);
      startOfCalendar.setDate(
        startOfCalendar.getDate() - startOfMonth.getDay()
      );
      const endOfCalendar = new Date(endOfMonth);
      endOfCalendar.setDate(
        endOfCalendar.getDate() + (6 - endOfMonth.getDay())
      );

      return {
        start_date: startOfCalendar.toISOString().split("T")[0],
        end_date: endOfCalendar.toISOString().split("T")[0],
      };
    }
  }, [currentDate, viewMode]);

  // Fetch data from API
  const { data: daysData, loading, error } = useDays(dateRange);

  // Convert API data to lookup object
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

  // Refresh data when refreshKey changes
  useEffect(() => {
    // The useDays hook will automatically refresh when dependencies change
  }, [refreshKey]);

  const generateWeekDays = (startDate: Date) => {
    const days = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);

    // Get the first day of the week for the first day of the month
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const current = new Date(startDate);

    // Generate 6 weeks worth of days (42 days)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { days, currentMonth: month, currentYear: year };
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const weekDays = generateWeekDays(currentDate);
  const monthData = generateMonthDays(currentDate);

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
                  Happiness Calendar
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  {viewMode === "weekly" ? "Weekly view" : "Monthly view"} -
                  Click on any day to view detailed happiness data
                  {daysData.length > 0 && (
                    <span className="ml-2 text-green-600">
                      ({daysData.length} days with data)
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "weekly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("weekly")}
                    className="px-3 py-1 text-xs"
                    disabled={loading}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={viewMode === "monthly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("monthly")}
                    className="px-3 py-1 text-xs"
                    disabled={loading}
                  >
                    Monthly
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    viewMode === "weekly"
                      ? navigateWeek("prev")
                      : navigateMonth("prev")
                  }
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    viewMode === "weekly"
                      ? navigateWeek("next")
                      : navigateMonth("next")
                  }
                  disabled={loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "weekly" ? (
              <>
                <div className="text-center mb-4 text-lg font-semibold text-gray-700">
                  Week of{" "}
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {weekDays.map((date) => {
                    const dateKey = date.toISOString().split("T")[0];
                    const dayData = happinessData[dateKey];
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();

                    return (
                      <div
                        key={dateKey}
                        className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                          isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
                        } ${
                          dayData
                            ? getHappinessColor(dayData.score)
                            : "bg-gray-100"
                        } ${loading ? "opacity-60" : ""}`}
                        onClick={() => !loading && onDateSelect(date)}
                      >
                        <div
                          className={`font-semibold text-center ${
                            dayData ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        {dayData && (
                          <div className="text-xs text-white text-center mt-1 font-bold">
                            {dayData.score.toFixed(1)}
                          </div>
                        )}
                        {dayData && (
                          <div className="text-xs text-white text-center opacity-80">
                            {dayData.message_count} msgs
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4 text-lg font-semibold text-gray-700">
                  {new Date(
                    monthData.currentYear,
                    monthData.currentMonth
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {monthData.days.map((date, index) => {
                    const dateKey = date.toISOString().split("T")[0];
                    const dayData = happinessData[dateKey];
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();
                    const isCurrentMonth =
                      date.getMonth() === monthData.currentMonth;

                    return (
                      <div
                        key={index}
                        className={`relative p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 min-h-[60px] flex flex-col items-center justify-center ${
                          isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                        } ${
                          dayData
                            ? getHappinessColor(dayData.score)
                            : "bg-gray-100"
                        } ${!isCurrentMonth ? "opacity-40" : ""} ${
                          loading ? "opacity-60" : ""
                        }`}
                        onClick={() => !loading && onDateSelect(date)}
                      >
                        <div
                          className={`text-sm font-semibold ${
                            dayData ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        {dayData && (
                          <>
                            <div className="text-xs text-white font-bold">
                              {dayData.score.toFixed(1)}
                            </div>
                            <div className="text-xs text-white opacity-80">
                              {dayData.message_count}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
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
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Day Details</CardTitle>
            <CardDescription>
              {selectedDate
                ? `${selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                : "Select a day to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate &&
              (() => {
                const dateKey = selectedDate.toISOString().split("T")[0];
                const dayData = happinessData[dateKey];

                if (dayData) {
                  return (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-800 mb-2">
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

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-700">
                            Sentiment Score
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {dayData.sentiment.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            (-1.0 to 1.0)
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-700">
                            Classification
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {dayData.sentiment_label}
                          </div>
                          <div className="text-xs text-gray-500">
                            AI Analysis
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-500">
                        💡 This happiness score is calculated from your
                        messages, emails, and other communications analyzed by
                        AI sentiment analysis.
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
                  Days with data will be colored based on sentiment analysis of
                  your messages.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
