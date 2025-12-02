"use client";

import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
import { ChatSession, TranslationHistory } from "@/lib/types";
import {
  Loader2,
  Send,
  Copy,
  Check,
  Settings,
  Share2,
  Edit2,
  Languages,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Featured Nigerian Languages
const NIGERIAN_LANGUAGES = [
  { code: "ig", name: "🇳🇬 Igbo", flag: "🇳🇬" },
  { code: "yo", name: "🇳🇬 Yoruba", flag: "🇳🇬" },
  { code: "ha", name: "🇳🇬 Hausa", flag: "🇳🇬" },
];

const QUICK_LANGUAGES = [
  { code: "en", name: "🇺🇸 English", flag: "🇺🇸" },
  { code: "ig", name: "🇳🇬 Igbo", flag: "🇳🇬" },
  { code: "yo", name: "🇳🇬 Yoruba", flag: "🇳🇬" },
  { code: "ha", name: "🇳🇬 Hausa", flag: "🇳🇬" },
];

const OTHER_LANGUAGES = [
  { code: "af", name: "Afrikaans" },
  { code: "ar", name: "Arabic" },
  { code: "zh-Hans", name: "Chinese (Simplified)" },
  { code: "zh-Hant", name: "Chinese (Traditional)" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "zu", name: "Zulu" },
];

const STORAGE_KEY = "sync_chat_sessions";
const ACTIVE_SESSION_KEY = "sync_active_session";

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("ig");
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [retranslatingIndex, setRetranslatingIndex] = useState<number | null>(
    null
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const CHARACTER_LIMIT = 5000;

  const activeSession = chatSessions.find((s) => s.id === activeSessionId);

  // Load chat sessions from local storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);
        if (
          savedActiveId &&
          sessions.some((s: ChatSession) => s.id === savedActiveId)
        ) {
          setActiveSessionId(savedActiveId);
        }
      } catch (e) {
        console.error("Failed to parse sessions:", e);
      }
    }
  }, []);

  // Save chat sessions to local storage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Save active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.conversations, isThinking]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date().toISOString(),
      conversations: [],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const deleteSession = (sessionId: string) => {
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    // Create a new session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: sourceText.slice(0, 30) + (sourceText.length > 30 ? "..." : ""),
        timestamp: new Date().toISOString(),
        conversations: [],
      };
      setChatSessions((prev) => [newSession, ...prev]);
      sessionId = newSession.id;
      setActiveSessionId(sessionId);
    }

    setLoading(true);
    setIsThinking(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setIsThinking(false);

      // Add to conversations in the active session
      const newEntry: TranslationHistory = {
        timestamp: new Date().toISOString(),
        source_text: sourceText,
        translated_text: data.translatedText,
        target_language: data.targetLanguage,
        detected_language: data.detectedLanguage,
      };

      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                conversations: [...session.conversations, newEntry],
                title:
                  session.conversations.length === 0
                    ? sourceText.slice(0, 30) +
                      (sourceText.length > 30 ? "..." : "")
                    : session.title,
              }
            : session
        )
      );
      setSourceText("");
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed. Please try again.");
      setIsThinking(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChatSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setShowClearAlert(false);
  };

  const quickSelectLanguage = (code: string) => {
    setTargetLanguage(code);
  };

  const retranslateMessage = async (index: number, newLanguage: string) => {
    if (!activeSession) return;

    const conversation = activeSession.conversations[index];
    setRetranslatingIndex(index);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: conversation.source_text,
          targetLanguage: newLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();

      // Update the specific conversation
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                conversations: session.conversations.map((conv, i) =>
                  i === index
                    ? {
                        ...conv,
                        translated_text: data.translatedText,
                        target_language: data.targetLanguage,
                      }
                    : conv
                ),
              }
            : session
        )
      );
    } catch (error) {
      console.error("Retranslation error:", error);
      alert("Retranslation failed. Please try again.");
    } finally {
      setRetranslatingIndex(null);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success("Copied to clipboard!", {
        description: "Translation copied successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy", {
        description: "Please try again",
      });
    }
  };

  const shareText = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: text,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!", {
          description: "Share via clipboard",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to share:", error);
        toast.error("Failed to share");
      }
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

  const startEditMessage = (index: number) => {
    if (!activeSession) return;
    const conv = activeSession.conversations[index];
    setEditText(conv.source_text);
    setEditingIndex(index);
  };

  const saveEditedMessage = async (index: number) => {
    if (!activeSession || !editText.trim()) return;

    const conversation = activeSession.conversations[index];
    setLoading(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: editText,
          targetLanguage: conversation.target_language,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();

      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                conversations: session.conversations.map((conv, i) =>
                  i === index
                    ? {
                        ...conv,
                        source_text: editText,
                        translated_text: data.translatedText,
                        detected_language: data.detectedLanguage,
                        edited: true,
                        editedAt: new Date().toISOString(),
                      }
                    : conv
                ),
              }
            : session
        )
      );

      setEditingIndex(null);
      setEditText("");
      toast.success("Message updated!");
    } catch (error) {
      console.error("Edit translation error:", error);
      toast.error("Failed to update message");
    } finally {
      setLoading(false);
    }
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
            {chatSessions.map((session) => (
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        {chatSessions.length > 0 && (
          <div className="p-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearAlert(true)}
              className="w-full"
            >
              Clear All Chats
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-60 md:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Chats</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
                {chatSessions.map((session) => (
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
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {chatSessions.length > 0 && (
              <div className="p-4 border-t">
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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Sync
              </h1>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Powered by Azure
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="pt-20 pb-[140px] sm:pb-40">
            <div className="max-w-3xl mx-auto w-full">
              {!activeSession || activeSession.conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
                      Welcome to Sync
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg">
                      Start translating to Nigerian languages and more
                    </p>
                  </div>

                  {/* Quick Language Suggestions */}
                  <div className="w-full max-w-md">
                    <p className="text-base sm:text-lg font-medium mb-3 text-muted-foreground">
                      Popular Nigerian Languages:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {NIGERIAN_LANGUAGES.map((lang) => (
                        <Button
                          key={lang.code}
                          variant="outline"
                          className="h-auto py-3 flex flex-col items-center gap-1"
                          onClick={() => quickSelectLanguage(lang.code)}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-sm">
                            {lang.name.replace("🇳🇬 ", "")}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {activeSession.conversations.map((conv, index) => (
                    <div
                      key={index}
                      className="px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                    >
                      {/* User Message - TOP RIGHT */}
                      <div className="flex gap-2 sm:gap-3 justify-end mb-3 sm:mb-4">
                        <div className="max-w-[85%] sm:max-w-[70%] flex justify-end">
                          <div className="inline-block">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(
                                  conv.editedAt || conv.timestamp
                                )}
                              </span>
                              {conv.edited && (
                                <span className="text-xs text-muted-foreground italic">
                                  (edited)
                                </span>
                              )}
                              <Popover
                                open={editingIndex === index}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingIndex(null);
                                    setEditText("");
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 hover:bg-muted"
                                    onClick={() => startEditMessage(index)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-sm">
                                      Edit Message
                                    </h4>
                                    <Textarea
                                      value={editText}
                                      onChange={(e) =>
                                        setEditText(e.target.value)
                                      }
                                      className="min-h-[100px]"
                                      placeholder="Edit your message..."
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setEditingIndex(null);
                                          setEditText("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => saveEditedMessage(index)}
                                        disabled={!editText.trim() || loading}
                                      >
                                        {loading ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          "Save"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-foreground bg-primary/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5">
                              {conv.source_text}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
                          U
                        </div>
                      </div>
                      {/* AI Response - BOTTOM LEFT */}
                      <div className="flex gap-2 sm:gap-3">
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs sm:text-sm">
                          AI
                        </div>
                        <div className="flex-1 space-y-2 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {conv.target_language.toUpperCase()} from{" "}
                              {conv.detected_language.toUpperCase()}
                            </span>
                          </div>
                          {retranslatingIndex === index ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Translating...</span>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm sm:text-base leading-relaxed">
                                {conv.translated_text}
                              </p>
                              {/* Action Buttons */}
                              <div className="flex items-center gap-1 pt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs hover:bg-muted"
                                  onClick={() =>
                                    copyToClipboard(conv.translated_text, index)
                                  }
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1 text-green-500" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs hover:bg-muted"
                                  onClick={() =>
                                    shareText(conv.translated_text)
                                  }
                                >
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Share
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs hover:bg-muted"
                                      disabled={retranslatingIndex === index}
                                    >
                                      <Languages className="w-3 h-3 mr-1" />
                                      Translate
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>
                                      Nigerian Languages
                                    </DropdownMenuLabel>
                                    {NIGERIAN_LANGUAGES.map((lang) => (
                                      <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() =>
                                          retranslateMessage(index, lang.code)
                                        }
                                      >
                                        {lang.name}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>
                                      Other Languages
                                    </DropdownMenuLabel>
                                    {OTHER_LANGUAGES.map((lang) => (
                                      <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() =>
                                          retranslateMessage(index, lang.code)
                                        }
                                      >
                                        {lang.name}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {isThinking && (
                    <div className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex gap-2 sm:gap-3">
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs sm:text-sm">
                          AI
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-background border-t z-10">
          <div className="px-3 py-3 sm:py-4 max-w-3xl mx-auto w-full">
            {/* Input Box */}
            <div className="relative flex items-end gap-2 rounded-2xl focus-within:border-border transition-colors">
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder="Message Sync..."
                disabled={loading}
                className="flex-1 bg-transparent px-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-0 resize-none min-h-10 max-h-[200px]"
                rows={1}
              />
              <Button
                onClick={handleTranslate}
                disabled={!sourceText.trim() || loading}
                size="icon"
                className="rounded-lg h-8 w-8 shrink-0 self-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Character Count Warning */}
            {sourceText.length > CHARACTER_LIMIT * 0.8 && (
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-500">
                {sourceText.length >= CHARACTER_LIMIT ? (
                  <span className="font-medium">
                    ⚠️ Character limit reached ({CHARACTER_LIMIT} max)
                  </span>
                ) : (
                  <span>
                    {sourceText.length}/{CHARACTER_LIMIT} characters (limit
                    warning)
                  </span>
                )}
              </div>
            )}

            {/* Language Selector Pills */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {QUICK_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => quickSelectLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    targetLanguage === lang.code
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-auto h-7 text-xs border-0 bg-muted/50 hover:bg-muted px-2.5 rounded-lg">
                  <SelectValue placeholder="More" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Nigerian Languages
                  </div>
                  {NIGERIAN_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                    Other Languages
                  </div>
                  {OTHER_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAlert} onOpenChange={setShowClearAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chat history and conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, clear all
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
            {/* Theme Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Theme</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Theme is managed by your system preferences. Toggle dark/light
                mode from your OS settings.
              </p>
            </div>

            {/* Character Limit Info */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Translation Limits</h3>
              <p className="text-sm text-muted-foreground">
                Maximum characters per translation:{" "}
                {CHARACTER_LIMIT.toLocaleString()}
              </p>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2">About</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Sync</strong> - AI
                  Translation for Nigerian Languages
                </p>
                <p>
                  Powered by Azure Translator API with support for Igbo, Yoruba,
                  Hausa, and 20+ other languages.
                </p>
                <p className="text-xs">
                  Version 1.0.0 • Built with Next.js & Azure
                </p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Chat-style interface</li>
                <li>✓ Multiple session management</li>
                <li>✓ Instant retranslation</li>
                <li>✓ Local storage persistence</li>
                <li>✓ Copy to clipboard</li>
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

      {/* Toast Container */}
      <Toaster position="bottom-right" />
    </div>
  );
}
