"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  generateBlogArticle,
  generateBlogArticleStream,
  generateTitleSuggestions,
  type GenerationOptions,
} from "@/lib/ai/blog-generator";

interface AIGenerateDialogProps {
  children?: ReactNode;
  onGenerated: (data: {
    title: string;
    content: string;
    excerpt: string;
  }) => void;
}

export function AIGenerateDialog({ children, onGenerated }: AIGenerateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [useStreaming, setUseStreaming] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  const [options, setOptions] = useState<GenerationOptions>({
    topic: "",
    tone: "professional",
    length: "medium",
    keywords: [],
    targetAudience: "developers",
    language: "id",
    model: "gpt-5-nano",
  });

  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    if (keywordInput.trim() && options.keywords) {
      setOptions({
        ...options,
        keywords: [...options.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    if (options.keywords) {
      setOptions({
        ...options,
        keywords: options.keywords.filter((_, i) => i !== index),
      });
    }
  };

  const handleGenerateTitles = async () => {
    if (!options.topic) {
      toast.error("Masukkan topik terlebih dahulu");
      return;
    }

    setIsGeneratingTitles(true);
    try {
      const titles = await generateTitleSuggestions(
        options.topic,
        options.language,
        options.model
      );
      setTitleSuggestions(titles);
      toast.success(`${titles.length} judul berhasil di-generate`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal generate judul");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerate = async () => {
    if (!options.topic) {
      toast.error("Topik artikel harus diisi");
      return;
    }

    setIsGenerating(true);
    setStreamedContent("");

    try {
      if (useStreaming) {
        // Generate with streaming
        let fullContent = "";
        for await (const chunk of generateBlogArticleStream(options)) {
          fullContent += chunk;
          setStreamedContent(fullContent);
        }

        // Parse the streamed content
        onGenerated({
          title: options.topic,
          content: fullContent,
          excerpt: fullContent.substring(0, 160),
        });

        toast.success("Artikel berhasil di-generate!");
      } else {
        // Generate without streaming
        const result = await generateBlogArticle(options);
        onGenerated(result);
        toast.success("Artikel berhasil di-generate!");
      }

      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal generate artikel"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setOptions({
      topic: "",
      tone: "professional",
      length: "medium",
      keywords: [],
      targetAudience: "developers",
      language: "id",
      model: "gpt-5-nano",
    });
    setKeywordInput("");
    setStreamedContent("");
    setTitleSuggestions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Artikel dengan AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topik Artikel <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                placeholder="Contoh: React Hooks untuk Pemula"
                value={options.topic}
                onChange={(e) =>
                  setOptions({ ...options, topic: e.target.value })
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleGenerateTitles}
                disabled={isGeneratingTitles || !options.topic}
                title="Generate title suggestions"
              >
                {isGeneratingTitles ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Title Suggestions */}
          {titleSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Saran Judul:</Label>
              <div className="space-y-1">
                {titleSuggestions.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => setOptions({ ...options, topic: title })}
                    className="w-full text-left px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="Contoh: developers, pemula, business owners"
              value={options.targetAudience}
              onChange={(e) =>
                setOptions({ ...options, targetAudience: e.target.value })
              }
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <select
              id="tone"
              value={options.tone}
              onChange={(e) =>
                setOptions({
                  ...options,
                  tone: e.target.value as "professional" | "casual" | "technical" | "friendly",
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <Label htmlFor="length">Panjang Artikel</Label>
            <select
              id="length"
              value={options.length}
              onChange={(e) =>
                setOptions({
                  ...options,
                  length: e.target.value as "short" | "medium" | "long",
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="short">Short (500-800 kata)</option>
              <option value="medium">Medium (1000-1500 kata)</option>
              <option value="long">Long (2000-3000 kata)</option>
            </select>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label>Keywords (Opsional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Tambahkan keyword"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
              />
              <Button variant="outline" onClick={handleAddKeyword}>
                Tambah
              </Button>
            </div>
            {options.keywords && options.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {options.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(index)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model AI</Label>
            <select
              id="model"
              value={options.model}
              onChange={(e) =>
                setOptions({ ...options, model: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="gpt-5-nano">GPT-5 Nano (Fast)</option>
              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
              <option value="claude-sonnet-4">Claude Sonnet 4</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Bahasa</Label>
            <select
              id="language"
              value={options.language}
              onChange={(e) =>
                setOptions({ ...options, language: e.target.value as "id" | "en" })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Streaming Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="streaming"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="streaming" className="cursor-pointer">
              Gunakan streaming (lihat proses generate secara real-time)
            </Label>
          </div>

          {/* Streamed Content Preview */}
          {useStreaming && streamedContent && (
            <div className="space-y-2">
              <Label>Preview:</Label>
              <Textarea
                value={streamedContent}
                readOnly
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            disabled={isGenerating}
          >
            Batal
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !options.topic}
          >
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isGenerating ? "Generating..." : "Generate Artikel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
