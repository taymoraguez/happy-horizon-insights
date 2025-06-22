import { MapView } from "@/components/MapView";
import { MessageAnalytics } from "@/components/MessageAnalytics";
import { OptimizedCalendarView } from "@/components/OptimizedCalendarView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteAnalytics } from "@/components/WebsiteAnalytics";
import { djangoPost } from "@/lib/django";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Calculate date range - 4 months ago to tomorrow
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1); // tomorrow
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 4); // 4 months ago

      // Create a new TimeAnalysis via the Django API using our utility
      const newAnalysis = await djangoPost("/api/time-analyses/", {
        name: `Analysis ${new Date().toISOString().split("T")[0]}`,
        description: "Sentiment analysis generated from dashboard refresh",
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });

      console.log("New analysis created:", newAnalysis);
      setRefreshKey((prev) => prev + 1);

      // Show success message (you could add a toast notification here)
      alert(
        `Analysis "${newAnalysis.name}" created successfully! Status: ${newAnalysis.status}`
      );
    } catch (error) {
      console.error("Error creating analysis:", error);
      alert(
        `Error creating analysis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                HappyTracker
              </h1>
              <p className="text-gray-600 mt-1">
                Your Personal Happiness Analytics Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 hover:bg-gray-100/80"
                title="Refresh Stats"
              >
                <RefreshCw
                  className={`h-4 w-4 text-gray-600 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">8.2</div>
                <div className="text-sm text-gray-500">
                  Current Happiness Score
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8" key={refreshKey}>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7.8</div>
              <p className="text-green-100 text-sm">+0.3 from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Locations Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-blue-100 text-sm">Across 3 cities</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Websites Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">247</div>
              <p className="text-purple-100 text-sm">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Messages Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-pink-100 text-sm">From 15 contacts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Calendar View
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Location Map
            </TabsTrigger>
            <TabsTrigger
              value="websites"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Website Analytics
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              People Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <OptimizedCalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              refreshKey={refreshKey}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <MapView />
          </TabsContent>

          <TabsContent value="websites" className="space-y-6">
            <WebsiteAnalytics />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessageAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
