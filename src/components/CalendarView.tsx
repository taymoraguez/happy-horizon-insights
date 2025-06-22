
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

// Mock data for happiness scores by date
const happinessData = {
  '2024-01-15': { score: 8.5, messages: ['Had a great coffee with Sarah!', 'Finished the project early'] },
  '2024-01-16': { score: 6.2, messages: ['Stressful meeting with client', 'Traffic was terrible'] },
  '2024-01-17': { score: 9.1, messages: ['Got promoted!', 'Celebrated with family dinner'] },
  '2024-01-18': { score: 7.8, messages: ['Productive day at work', 'Evening walk in the park'] },
  '2024-01-19': { score: 5.4, messages: ['Feeling a bit down', 'Rainy weather all day'] },
  '2024-01-20': { score: 8.9, messages: ['Weekend trip to the mountains', 'Beautiful sunset photos'] },
  '2024-01-21': { score: 7.2, messages: ['Lazy Sunday morning', 'Caught up on reading'] },
  '2024-01-22': { score: 8.3, messages: ['Great workout session', 'Met old friends'] },
  '2024-01-23': { score: 6.8, messages: ['Busy day at work', 'Ordered takeout'] },
  '2024-01-24': { score: 9.0, messages: ['Perfect weather today', 'Completed a challenging project'] },
  '2024-01-25': { score: 7.5, messages: ['Relaxing evening', 'Watched a good movie'] },
  '2024-01-26': { score: 5.8, messages: ['Feeling tired', 'Long commute'] },
  '2024-01-27': { score: 8.7, messages: ['Family dinner', 'Played board games'] },
  '2024-01-28': { score: 7.1, messages: ['Productive Sunday', 'Meal prep for the week'] },
};

const getHappinessColor = (score: number) => {
  if (score >= 8) return 'bg-green-500';
  if (score >= 7) return 'bg-green-400';
  if (score >= 6) return 'bg-yellow-400';
  if (score >= 5) return 'bg-orange-400';
  return 'bg-red-500';
};

const getHappinessLevel = (score: number) => {
  if (score >= 8) return 'Very Happy';
  if (score >= 7) return 'Happy';
  if (score >= 6) return 'Neutral';
  if (score >= 5) return 'Somewhat Sad';
  return 'Sad';
};

export const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date('2024-01-15'));
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const generateWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const weekDays = generateWeekDays(currentDate);
  const monthData = generateMonthDays(currentDate);

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
                </CardTitle>
                <CardDescription>
                  {viewMode === 'weekly' ? 'Weekly view' : 'Monthly view'} - Click on any day to view detailed happiness data
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('weekly')}
                    className="px-3 py-1 text-xs"
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('monthly')}
                    className="px-3 py-1 text-xs"
                  >
                    Monthly
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewMode === 'weekly' ? navigateWeek('prev') : navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewMode === 'weekly' ? navigateWeek('next') : navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'weekly' ? (
              <>
                <div className="text-center mb-4 text-lg font-semibold text-gray-700">
                  Week of {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {weekDays.map((date) => {
                    const dateKey = date.toISOString().split('T')[0];
                    const dayData = happinessData[dateKey];
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    
                    return (
                      <div
                        key={dateKey}
                        className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        } ${dayData ? getHappinessColor(dayData.score) : 'bg-gray-100'}`}
                        onClick={() => onDateSelect(date)}
                      >
                        <div className={`font-semibold text-center ${dayData ? 'text-white' : 'text-gray-600'}`}>
                          {date.getDate()}
                        </div>
                        {dayData && (
                          <div className="text-xs text-white text-center mt-1 font-bold">
                            {dayData.score}
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
                  {new Date(monthData.currentYear, monthData.currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {monthData.days.map((date, index) => {
                    const dateKey = date.toISOString().split('T')[0];
                    const dayData = happinessData[dateKey];
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isCurrentMonth = date.getMonth() === monthData.currentMonth;
                    
                    return (
                      <div
                        key={index}
                        className={`relative p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 min-h-[50px] flex flex-col items-center justify-center ${
                          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } ${dayData ? getHappinessColor(dayData.score) : 'bg-gray-100'} ${
                          !isCurrentMonth ? 'opacity-40' : ''
                        }`}
                        onClick={() => onDateSelect(date)}
                      >
                        <div className={`text-sm font-semibold ${dayData ? 'text-white' : 'text-gray-600'}`}>
                          {date.getDate()}
                        </div>
                        {dayData && (
                          <div className="text-xs text-white font-bold">
                            {dayData.score}
                          </div>
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
                ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                : 'Select a day to view details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate && (() => {
              const dateKey = selectedDate.toISOString().split('T')[0];
              const dayData = happinessData[dateKey];
              
              if (dayData) {
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800 mb-2">
                        {dayData.score}
                      </div>
                      <Badge 
                        className={`${getHappinessColor(dayData.score)} text-white border-0`}
                      >
                        {getHappinessLevel(dayData.score)}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Messages from this day:</h4>
                      <div className="space-y-2">
                        {dayData.messages.map((message, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700"
                          >
                            "{message}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-2xl mb-2">📅</div>
                    <p>No happiness data available for this day</p>
                  </div>
                );
              }
            })()}
            
            {!selectedDate && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">📋</div>
                <p>Click on a calendar day to view detailed happiness data and messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
