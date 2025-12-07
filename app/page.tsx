"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Cloud,
  Languages,
  Loader2,
  Sparkles,
  MapPin,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";

export default function Home() {
  const router = useRouter();
  const [loadingService, setLoadingService] = useState<string | null>(null);

  const cloudServices = [
    {
      title: "Translate",
      description: "Real-time translation powered by Azure AI",
      icon: Languages,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
      path: "/translate",
    },
    {
      title: "Email",
      description: "Professional email delivery via Brevo",
      icon: Mail,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
      path: "/email",
    },
    {
      title: "Weather",
      description: "Live weather data from OpenWeather",
      icon: Cloud,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10 hover:bg-blue-600/20",
      path: "/weather",
    },
    {
      title: "Location",
      description: "Real-time GPS tracking with satellite view",
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
      path: "/location",
    },
  ];

  const handleLaunchService = (path: string) => {
    setLoadingService(path);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Sync
            </h1>
          </div>
          <AnimatedThemeToggler />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
          <div className="max-w-7xl w-full space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Welcome to Sync
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                An app that shows different examples of cloud services
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cloudServices.map((service, index) => {
                const Icon = service.icon;
                const isLoading = loadingService === service.path;

                return (
                  <Card
                    key={service.path}
                    className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
                  >
                    <CardHeader className="pb-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${service.bgColor} flex items-center justify-center transition-colors mb-3`}
                      >
                        <Icon className={`w-6 h-6 ${service.color}`} />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => handleLaunchService(service.path)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Launching...
                          </>
                        ) : (
                          "Launch Service"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="text-center pt-8 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Cloud-Powered</span>
                </div>
                <span>•</span>
                <span>Secure</span>
                <span>•</span>
                <span>Real-Time</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
