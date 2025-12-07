"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import {
  Loader2,
  Send,
  Cloud,
  Menu,
  X,
  Settings,
  Home as HomeIcon,
  Trash2,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  temperature: {
    current: number;
    feels_like: number;
    min: number;
    max: number;
  };
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: number;
  visibility: number;
  sunrise: number;
  sunset: number;
  timezone: number;
}

interface WeatherMessage {
  id: string;
  city: string;
  timestamp: string;
  weather?: WeatherData;
  error?: string;
}

interface WeatherSession {
  id: string;
  title: string;
  timestamp: string;
  searches: WeatherMessage[];
}

const STORAGE_KEY = "sync_weather_sessions";
const ACTIVE_SESSION_KEY = "sync_active_weather_session";

export default function WeatherPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherSessions, setWeatherSessions] = useState<WeatherSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = weatherSessions.find((s) => s.id === activeSessionId);

  // Load weather sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setWeatherSessions(sessions);
        if (
          savedActiveId &&
          sessions.some((s: WeatherSession) => s.id === savedActiveId)
        ) {
          setActiveSessionId(savedActiveId);
        }
      } catch (e) {
        console.error("Failed to parse sessions:", e);
      }
    }
  }, []);

  // Save weather sessions to localStorage whenever they change
  useEffect(() => {
    if (weatherSessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherSessions));
    }
  }, [weatherSessions]);

  // Save active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.searches]);

  const createNewSession = () => {
    const newSession: WeatherSession = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date().toISOString(),
      searches: [],
    };
    setWeatherSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const deleteSession = (sessionId: string) => {
    setWeatherSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const handleClearHistory = () => {
    setWeatherSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setShowClearAlert(false);
    toast.success("All weather sessions cleared");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    // Create a new session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      const newSession: WeatherSession = {
        id: Date.now().toString(),
        title: city.trim(),
        timestamp: new Date().toISOString(),
        searches: [],
      };
      setWeatherSessions((prev) => [newSession, ...prev]);
      sessionId = newSession.id;
      setActiveSessionId(sessionId);
    }

    const searchCity = city.trim();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(searchCity)}`
      );

      const data = await response.json();

      // Check if the response contains an error
      if (data.error) {
        toast.error("City not found", {
          description: data.error,
        });
        setCity("");
        setLoading(false);
        return;
      }

      const newMessage: WeatherMessage = {
        id: Date.now().toString(),
        city: searchCity,
        timestamp: new Date().toISOString(),
        weather: data,
      };

      setWeatherSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                searches: [...session.searches, newMessage],
                title:
                  session.searches.length === 0
                    ? `${data.location.name}, ${data.location.country}`
                    : session.title,
              }
            : session
        )
      );

      setCity("");
      toast.success(`Weather data fetched for ${data.location.name}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch weather";

      toast.error("Failed to fetch weather", {
        description: errorMessage,
      });
      setCity("");
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return then.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card shrink-0">
        <div className="p-4 border-b">
          <Button onClick={createNewSession} className="w-full" size="sm">
            + New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {weatherSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent ${
                  activeSessionId === session.id ? "bg-accent" : ""
                }`}
                onClick={() => setActiveSessionId(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        {weatherSessions.length > 0 && (
          <div className="p-4 border-t space-y-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearAlert(true)}
              className="w-full"
            >
              Clear All Chats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </div>
        )}
        {weatherSessions.length === 0 && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Weather Chats</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 border-b">
              <Button
                onClick={() => {
                  createNewSession();
                  setSidebarOpen(false);
                }}
                className="w-full"
                size="sm"
              >
                + New Chat
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {weatherSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      activeSessionId === session.id ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {weatherSessions.length > 0 && (
              <div className="p-4 border-t space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowClearAlert(true);
                  }}
                  className="w-full"
                >
                  Clear All Chats
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Back to Services
                </Button>
              </div>
            )}
            {weatherSessions.length === 0 && (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Back to Services
                </Button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 relative">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 md:left-64 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10">
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Cloud className="w-5 h-5 text-blue-500" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Sync ~ Weather
              </h1>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Powered by OpenWeather
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="pt-20 pb-[100px]">
            <div className="max-w-3xl mx-auto w-full">
              {!activeSession || activeSession.searches.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
                  <Cloud className="w-16 h-16 text-blue-500 mb-4" />
                  <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
                    Welcome to Sync ~ Weather
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    Get real-time weather data for any city
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {activeSession.searches.map((search) => (
                    <div
                      key={search.id}
                      className="px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                    >
                      {/* User Message - RIGHT */}
                      <div className="flex gap-2 sm:gap-3 justify-end mb-3 sm:mb-4">
                        <div className="max-w-[85%] sm:max-w-[70%] flex justify-end">
                          <div className="inline-block">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(search.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm sm:text-base leading-relaxed text-foreground bg-primary/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5">
                              {search.city}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
                          U
                        </div>
                      </div>

                      {/* AI Response - LEFT */}
                      <div className="flex gap-2 sm:gap-3">
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs sm:text-sm">
                          <Cloud className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-2 pt-0.5">
                          {search.error ? (
                            <div className="text-sm sm:text-base leading-relaxed text-red-500">
                              {search.error}
                            </div>
                          ) : search.weather ? (
                            <div className="bg-muted rounded-xl p-4 space-y-4">
                              {/* City Header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-bold">
                                    {search.weather.location.name},{" "}
                                    {search.weather.location.country}
                                  </h3>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {search.weather.weather.description}
                                  </p>
                                </div>
                                <img
                                  src={`https://openweathermap.org/img/wn/${search.weather.weather.icon}@2x.png`}
                                  alt={search.weather.weather.description}
                                  className="w-16 h-16"
                                />
                              </div>

                              {/* Temperature */}
                              <div className="text-5xl font-bold">
                                {search.weather.temperature.current}°C
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Feels like{" "}
                                {search.weather.temperature.feels_like}°C
                              </p>

                              {/* Weather Metrics Grid */}
                              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <Droplets className="w-5 h-5 text-blue-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Humidity
                                    </p>
                                    <p className="font-semibold">
                                      {search.weather.humidity}%
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Wind className="w-5 h-5 text-green-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Wind Speed
                                    </p>
                                    <p className="font-semibold">
                                      {search.weather.wind.speed} m/s
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Gauge className="w-5 h-5 text-purple-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Pressure
                                    </p>
                                    <p className="font-semibold">
                                      {search.weather.pressure} hPa
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Eye className="w-5 h-5 text-orange-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Visibility
                                    </p>
                                    <p className="font-semibold">
                                      {(
                                        search.weather.visibility / 1000
                                      ).toFixed(1)}{" "}
                                      km
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Sunrise/Sunset */}
                              <div className="flex items-center justify-around pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <Sunrise className="w-5 h-5 text-yellow-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Sunrise
                                    </p>
                                    <p className="font-semibold">
                                      {new Date(
                                        search.weather.sunrise * 1000
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Sunset className="w-5 h-5 text-red-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Sunset
                                    </p>
                                    <p className="font-semibold">
                                      {new Date(
                                        search.weather.sunset * 1000
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Input - Fixed at Bottom */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-background border-t z-10">
          <form
            onSubmit={handleSearch}
            className="px-3 py-3 sm:py-4 max-w-3xl mx-auto w-full"
          >
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Message Sync Weather..."
                disabled={loading}
                className="flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!city.trim() || loading}
                size="icon"
                className="rounded-lg h-10 w-10 shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Clear History Confirmation */}
      <AlertDialog open={showClearAlert} onOpenChange={setShowClearAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Weather Chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all weather sessions and search
              history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog */}
      <AlertDialog open={showSettings} onOpenChange={setShowSettings}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Settings</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Application settings and information
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">About</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Sync ~ Weather</strong> -
                  Real-time Weather Service
                </p>
                <p>
                  Powered by OpenWeather API for accurate and up-to-date weather
                  information worldwide.
                </p>
                <p className="text-xs">Version 1.0.0 • Built with Next.js</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Chat-style interface</li>
                <li>✓ Session management</li>
                <li>✓ Real-time weather data</li>
                <li>✓ Detailed weather metrics</li>
                <li>✓ Local storage persistence</li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSettings(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-right" />
    </div>
  );
}
