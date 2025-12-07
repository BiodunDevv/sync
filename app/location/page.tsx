"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import {
  MapPin,
  Loader2,
  Settings,
  Home as HomeIcon,
  Navigation,
  Satellite,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import dynamic from "next/dynamic";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Dynamically import the map component with no SSR
const MapComponent = dynamic<MapComponentProps>(
  () => import("../../components/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
);

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export default function LocationPage() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support geolocation",
      });
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        // Get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}`
          );
          const data = await response.json();
          locationData.address = data.display_name;
        } catch (error) {
          console.error("Failed to fetch address:", error);
        }

        setLocation(locationData);
        setLoading(false);
        toast.success("Location found!", {
          description: "Your current location has been detected",
        });
      },
      (error) => {
        setLoading(false);
        let errorMessage = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        toast.error("Location Error", {
          description: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="flex h-screen bg-background flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-1000">
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <MapPin className="w-5 h-5 text-green-500" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Sync ~ Location
            </h1>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              GPS Tracking
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <HomeIcon className="w-4 h-4" />
            </Button>
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

      {/* Main Content */}
      <main className="flex-1 pt-16 relative">
        {!location ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Find Your Location
                </h2>
                <p className="text-muted-foreground text-base">
                  Click the button below to detect your current GPS coordinates
                  and view your location on an interactive satellite map
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-green-500" />
                    Features
                  </CardTitle>
                  <CardDescription>What you&apos;ll get:</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Real-time GPS coordinates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Satellite imagery view
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Interactive map controls
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Location accuracy indicator
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Address reverse lookup
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={getLocation}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Get My Location
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Location Info Card */}
            <div className="absolute top-4 left-4 right-4 z-500 pointer-events-none">
              <Card className="pointer-events-auto shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Your Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Latitude</p>
                      <p className="font-mono font-semibold">
                        {location.latitude.toFixed(6)}°
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Longitude</p>
                      <p className="font-mono font-semibold">
                        {location.longitude.toFixed(6)}°
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                    <p className="font-semibold">
                      ±{Math.round(location.accuracy)} meters
                    </p>
                  </div>
                  {location.address && (
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-xs leading-relaxed">
                        {location.address}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={getLocation}
                    disabled={loading}
                    size="sm"
                    className="w-full mt-2"
                    variant="outline"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Refresh Location
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="flex-1">
              <MapComponent
                latitude={location.latitude}
                longitude={location.longitude}
                accuracy={location.accuracy}
              />
            </div>
          </div>
        )}
      </main>

      {/* Settings Dialog */}
      <AlertDialog open={showSettings} onOpenChange={setShowSettings}>
        <AlertDialogContent className="max-w-md z-9999">
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
                  <strong className="text-foreground">Sync ~ Location</strong> -
                  GPS Tracking Service
                </p>
                <p>
                  Real-time location tracking with high-accuracy GPS and
                  satellite imagery powered by Leaflet.js and OpenStreetMap.
                </p>
                <p className="text-xs">Version 1.0.0 • Built with Next.js</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Real-time GPS tracking</li>
                <li>✓ Satellite imagery view</li>
                <li>✓ High-accuracy positioning</li>
                <li>✓ Reverse geocoding</li>
                <li>✓ Interactive map controls</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Your location data is processed locally and never stored on our
                servers. Location access requires your explicit permission.
              </p>
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
