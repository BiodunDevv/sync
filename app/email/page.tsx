"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Mail,
  Check,
  Menu,
  X,
  Settings,
  Home as HomeIcon,
  Trash2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface EmailMessage {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "sent" | "failed";
}

interface EmailSession {
  id: string;
  title: string;
  timestamp: string;
  emails: EmailMessage[];
}

const STORAGE_KEY = "sync_email_sessions";
const ACTIVE_SESSION_KEY = "sync_active_email_session";

export default function EmailPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSessions, setEmailSessions] = useState<EmailSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = emailSessions.find((s) => s.id === activeSessionId);

  // Load email sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setEmailSessions(sessions);
        if (
          savedActiveId &&
          sessions.some((s: EmailSession) => s.id === savedActiveId)
        ) {
          setActiveSessionId(savedActiveId);
        }
      } catch (e) {
        console.error("Failed to parse sessions:", e);
      }
    }
  }, []);

  // Save email sessions to localStorage whenever they change
  useEffect(() => {
    if (emailSessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emailSessions));
    }
  }, [emailSessions]);

  // Save active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.emails]);

  const createNewSession = () => {
    const newSession: EmailSession = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date().toISOString(),
      emails: [],
    };
    setEmailSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const deleteSession = (sessionId: string) => {
    setEmailSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const handleClearHistory = () => {
    setEmailSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setShowClearAlert(false);
    toast.success("All email sessions cleared");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !subject || !message) {
      toast.error("All fields are required");
      return;
    }

    // Create a new session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      const newSession: EmailSession = {
        id: Date.now().toString(),
        title: subject.slice(0, 30) + (subject.length > 30 ? "..." : ""),
        timestamp: new Date().toISOString(),
        emails: [],
      };
      setEmailSessions((prev) => [newSession, ...prev]);
      sessionId = newSession.id;
      setActiveSessionId(sessionId);
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newEmail: EmailMessage = {
          id: Date.now().toString(),
          recipient,
          subject,
          message,
          timestamp: new Date().toISOString(),
          status: "sent",
        };

        setEmailSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  emails: [...session.emails, newEmail],
                  title:
                    session.emails.length === 0
                      ? subject.slice(0, 30) +
                        (subject.length > 30 ? "..." : "")
                      : session.title,
                }
              : session
          )
        );

        setRecipient("");
        setSubject("");
        setMessage("");

        toast.success("Email sent successfully!", {
          description: `Sent to ${recipient}`,
          duration: 3000,
        });
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to send email", {
        description: errorMessage,
      });

      const failedEmail: EmailMessage = {
        id: Date.now().toString(),
        recipient,
        subject,
        message,
        timestamp: new Date().toISOString(),
        status: "failed",
      };

      setEmailSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                emails: [...session.emails, failedEmail],
                title:
                  session.emails.length === 0
                    ? subject.slice(0, 30) + (subject.length > 30 ? "..." : "")
                    : session.title,
              }
            : session
        )
      );
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
            {emailSessions.map((session) => (
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
        {emailSessions.length > 0 && (
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
        {emailSessions.length === 0 && (
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
              <h2 className="font-semibold">Email Chats</h2>
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
                {emailSessions.map((session) => (
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
            {emailSessions.length > 0 && (
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
            {emailSessions.length === 0 && (
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
              <Mail className="w-5 h-5 text-purple-500" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Sync ~ Email
              </h1>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Powered by Brevo
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
          <div className="pt-20 pb-60 sm:pb-[260px]">
            <div className="max-w-3xl mx-auto w-full">
              {!activeSession || activeSession.emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
                  <Mail className="w-16 h-16 text-purple-500 mb-4" />
                  <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
                    Welcome to Sync ~ Email
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    Send professional emails powered by Brevo API
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {activeSession.emails.map((email) => (
                    <div
                      key={email.id}
                      className="px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                    >
                      {/* User Message - TOP RIGHT */}
                      <div className="flex gap-2 sm:gap-3 justify-end mb-3 sm:mb-4">
                        <div className="max-w-[85%] sm:max-w-[70%] flex justify-end">
                          <div className="inline-block">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(email.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm sm:text-base leading-relaxed text-foreground bg-primary/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 space-y-1">
                              <p className="font-semibold">{email.subject}</p>
                              <p className="text-xs opacity-80">
                                To: {email.recipient}
                              </p>
                              <p className="mt-2">{email.message}</p>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
                          U
                        </div>
                      </div>

                      {/* AI Response - BOTTOM LEFT */}
                      <div className="flex gap-2 sm:gap-3">
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs sm:text-sm">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-2 pt-0.5">
                          <div className="flex items-center gap-2">
                            {email.status === "sent" ? (
                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                                <Check className="w-3 h-3" />
                                Email sent successfully
                              </span>
                            ) : (
                              <span className="text-xs text-red-500">
                                Failed to send email
                              </span>
                            )}
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed">
                            {email.status === "sent"
                              ? `Your email has been sent to ${email.recipient} with the subject "${email.subject}"`
                              : `Failed to send email to ${email.recipient}`}
                          </p>
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

        {/* Input Area - Fixed at Bottom */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-background border-t z-10">
          <form
            onSubmit={handleSendEmail}
            className="px-3 py-3 sm:py-4 max-w-3xl mx-auto w-full space-y-2"
          >
            <Input
              type="email"
              placeholder="Recipient email..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={loading}
              className="text-sm"
              required
            />
            <Input
              type="text"
              placeholder="Subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              className="text-sm"
              required
            />
            <div className="flex items-end gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendEmail(e);
                  }
                }}
                placeholder="Message Sync Email..."
                disabled={loading}
                className="flex-1 text-sm resize-none min-h-[60px] max-h-[120px]"
                rows={2}
                required
              />
              <Button
                type="submit"
                disabled={!recipient || !subject || !message || loading}
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
            <AlertDialogTitle>Clear All Email Chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all email sessions and conversations.
              This action cannot be undone.
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
                  <strong className="text-foreground">Sync ~ Email</strong> -
                  Professional Email Service
                </p>
                <p>
                  Powered by Brevo API for reliable and fast email delivery with
                  professional HTML templates.
                </p>
                <p className="text-xs">Version 1.0.0 • Built with Next.js</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Chat-style interface</li>
                <li>✓ Session management</li>
                <li>✓ Professional HTML templates</li>
                <li>✓ Send status tracking</li>
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
