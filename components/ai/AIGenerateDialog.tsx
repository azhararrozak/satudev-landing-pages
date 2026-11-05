"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
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
import { Sparkles, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_BLOG_AI_MODEL,
  generateBlogArticle,
  generateBlogArticleStream,
  generateTitleSuggestions,
  parseGeneratedArticle,
  type GenerationOptions,
} from "@/lib/ai/blog-generator";
import { sumoPodAI } from "@/lib/ai/gemini-client";
import { cropBlobToAspectRatio } from "@/lib/ai/image-crop";

interface AIGenerateDialogProps {
  children?: ReactNode;
  onGenerated: (data: {
    title: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
  }) => void;
}

export function AIGenerateDialog({
  children,
  onGenerated,
}: AIGenerateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [useStreaming, setUseStreaming] = useState(true);
  const [autoGenerateImage, setAutoGenerateImage] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  const [options, setOptions] = useState<GenerationOptions>({
    topic: "",
    tone: "professional",
    length: "medium",
    keywords: [],
    targetAudience: "developers",
    language: "id",
    model: DEFAULT_BLOG_AI_MODEL,
  });

  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    const cleaned = keywordInput.trim();
    if (cleaned && options.keywords) {
      if (!options.keywords.includes(cleaned)) {
        setOptions({
          ...options,
          keywords: [...options.keywords, cleaned],
        });
      }
      setKeywordInput("");
    }
  };

  const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Prevent premature keyword insertion while IME composition is active
      if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) {
        return;
      }
      handleAddKeyword();
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
    if (!options.topic?.trim()) {
      toast.error("Masukkan topik terlebih dahulu");
      return;
    }

    setIsGeneratingTitles(true);
    try {
      const titles = await generateTitleSuggestions(
        options.topic.trim(),
        options.language,
        options.model
      );
      setTitleSuggestions(titles);
      if (titles.length > 0) {
        toast.success(`${titles.length} saran judul berhasil dibuat`);
      } else {
        toast.info("Belum ada saran judul yang cocok, silakan coba topik lain");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat saran judul"
      );
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerate = async () => {
    if (!options.topic?.trim()) {
      toast.error("Topik artikel wajib diisi");
      return;
    }

    setIsGenerating(true);
    setStreamedContent("");

    try {
      let finalTitle = "";
      let finalContent = "";
      let finalExcerpt = "";

      if (useStreaming) {
        let fullContent = "";
        for await (const chunk of generateBlogArticleStream(options)) {
          fullContent += chunk;
          setStreamedContent(fullContent);
        }

        const parsed = parseGeneratedArticle(fullContent, options.topic.trim());
        finalTitle = parsed.title;
        finalContent = parsed.content;
        finalExcerpt = parsed.excerpt;
      } else {
        const result = await generateBlogArticle(options);
        finalTitle = result.title;
        finalContent = result.content;
        finalExcerpt = result.excerpt;
      }

      if (!finalContent.replace(/<[^>]+>/g, "").trim()) {
        throw new Error(
          "AI tidak menghasilkan isi artikel. Silakan coba lagi atau pilih panjang artikel yang lebih pendek."
        );
      }

      let featuredImageUrl = "";
      if (autoGenerateImage) {
        try {
          toast.info("Sedang membuat gambar unggulan dengan Cloudflare Workers AI (FLUX.1 Schnell)...");
          const cleanSubject = finalTitle.replace(/["'“”]/g, "").trim();
          const imagePrompt = `Editorial visual artwork depicting the theme of ${cleanSubject}, modern minimalist digital illustration, vibrant colors, clean composition, high quality`;

          const rawBlob = await sumoPodAI.generateImage(imagePrompt, {
            steps: 4,
            noText: true,
          });

          if (rawBlob && rawBlob.size > 0) {
            // Crop image to standard 16:9 banner ratio (1280x720)
            const imageBlob = await cropBlobToAspectRatio(
              rawBlob,
              { w: 16, h: 9 },
              1280
            );

            const formData = new FormData();
            const ext = imageBlob.type === "image/png" ? "png" : "jpg";
            const fileName = `flux-${Date.now()}.${ext}`;
            const file = new File([imageBlob], fileName, {
              type: imageBlob.type || "image/jpeg",
            });
            formData.append("file", file);

            const uploadResponse = await fetch("/api/upload/featured-image", {
              method: "POST",
              body: formData,
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              if (uploadData.success && uploadData.url) {
                featuredImageUrl = uploadData.url;
                toast.success("Gambar unggulan berhasil dibuat");
              }
            }
          }
        } catch (imgError) {
          console.error("Failed to generate featured image:", imgError);
          toast.error(
            "Artikel selesai dibuat, namun pembuatan gambar otomatis gagal. Anda dapat mengunggah gambar secara manual."
          );
        }
      }

      onGenerated({
        title: finalTitle,
        content: finalContent,
        excerpt: finalExcerpt,
        featuredImage: featuredImageUrl || undefined,
      });

      toast.success("Draf artikel berhasil dibuat dengan SumoPod AI (GLM Flash)");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat artikel dengan AI"
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
      model: DEFAULT_BLOG_AI_MODEL,
    });
    setKeywordInput("");
    setStreamedContent("");
    setTitleSuggestions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button type="button" variant="outline" className="gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            <span>Bantu Draf AI</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#dfdfe0] bg-white text-[#19191b] rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 text-[#002253] text-xl font-extrabold">
            <span className="inline-flex items-center gap-2">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-[#0540ad]" />
              <span>Buat Draf Artikel dengan AI</span>
            </span>
            <span className="rounded-full border border-[#d0e6fe] bg-[#e8eefc] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#0540ad]">
              SumoPod · GLM Flash
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="ai-topic" className="text-[#002253] font-semibold">
              Topik atau Judul Artikel <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="ai-topic"
                name="topic"
                placeholder="Contoh: Arsitektur Next.js App Router untuk Aplikasi Skala Besar"
                value={options.topic}
                onChange={(e) =>
                  setOptions({ ...options, topic: e.target.value })
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateTitles}
                disabled={isGeneratingTitles || !options.topic?.trim()}
                title="Buat saran judul otomatis"
                aria-label="Buat saran judul otomatis"
                className="flex-shrink-0 border-[#dfdfe0] text-[#002253] hover:bg-[#e8eefc]"
              >
                {isGeneratingTitles ? (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Title Suggestions */}
          {titleSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[#002253] font-semibold">
                Pilih Saran Judul:
              </Label>
              <div className="space-y-1.5">
                {titleSuggestions.map((title, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setOptions({ ...options, topic: title })}
                    className="w-full text-left px-3.5 py-2 text-sm font-medium text-[#002253] bg-[#f8faff] border border-[#dfdfe0] hover:bg-[#e8eefc] rounded-xl transition-colors cursor-pointer"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="ai-audience"
                className="text-[#002253] font-semibold"
              >
                Target Pembaca
              </Label>
              <Input
                id="ai-audience"
                name="targetAudience"
                placeholder="Contoh: developers, UMKM, pebisnis"
                value={options.targetAudience}
                onChange={(e) =>
                  setOptions({ ...options, targetAudience: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="ai-language"
                className="text-[#002253] font-semibold"
              >
                Bahasa Artikel
              </Label>
              <select
                id="ai-language"
                name="language"
                value={options.language}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    language: e.target.value as "id" | "en",
                  })
                }
                className="w-full h-10 rounded-md border border-[#dfdfe0] bg-white px-3 py-2 text-sm text-[#19191b] focus:outline-none focus:ring-2 focus:ring-[#0540ad]/30"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Tone & Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ai-tone" className="text-[#002253] font-semibold">
                Gaya Bahasa (Tone)
              </Label>
              <select
                id="ai-tone"
                name="tone"
                value={options.tone}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    tone: e.target.value as
                      | "professional"
                      | "casual"
                      | "technical"
                      | "friendly",
                  })
                }
                className="w-full h-10 rounded-md border border-[#dfdfe0] bg-white px-3 py-2 text-sm text-[#19191b] focus:outline-none focus:ring-2 focus:ring-[#0540ad]/30"
              >
                <option value="professional">Profesional</option>
                <option value="technical">Teknis & Mendalam</option>
                <option value="friendly">Ramah & Edukatif</option>
                <option value="casual">Santai</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="ai-length"
                className="text-[#002253] font-semibold"
              >
                Panjang Artikel
              </Label>
              <select
                id="ai-length"
                name="length"
                value={options.length}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    length: e.target.value as "short" | "medium" | "long",
                  })
                }
                className="w-full h-10 rounded-md border border-[#dfdfe0] bg-white px-3 py-2 text-sm text-[#19191b] focus:outline-none focus:ring-2 focus:ring-[#0540ad]/30"
              >
                <option value="short">Ringkas (500–800 kata)</option>
                <option value="medium">Standar (1000–1500 kata)</option>
                <option value="long">Mendalam (2000–3000 kata)</option>
              </select>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <Label
              htmlFor="ai-keyword-input"
              className="text-[#002253] font-semibold"
            >
              Kata Kunci SEO (Opsional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="ai-keyword-input"
                name="keywordInput"
                placeholder="Ketik kata kunci lalu tekan Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddKeyword}
                className="border-[#dfdfe0] text-[#002253] hover:bg-[#e8eefc]"
              >
                Tambah
              </Button>
            </div>
            {options.keywords && options.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {options.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8eefc] text-[#002253] border border-[#d0e6fe] rounded-full text-xs font-semibold"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      aria-label={`Hapus kata kunci ${keyword}`}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Streaming & Optional Image Checkboxes */}
          <div className="rounded-2xl border border-[#dfdfe0] bg-[#f8faff] p-3.5 space-y-2.5">
            <label
              htmlFor="ai-streaming"
              className="flex items-center gap-2.5 cursor-pointer text-sm text-[#19191b]"
            >
              <input
                type="checkbox"
                id="ai-streaming"
                checked={useStreaming}
                onChange={(e) => setUseStreaming(e.target.checked)}
                className="h-4 w-4 rounded accent-[#0540ad]"
              />
              <span>
                Tampilkan proses penulisan secara langsung (streaming real-time)
              </span>
            </label>

            <label
              htmlFor="ai-auto-image"
              className="flex items-center gap-2.5 cursor-pointer text-sm text-[#66666b]"
            >
              <input
                type="checkbox"
                id="ai-auto-image"
                checked={autoGenerateImage}
                onChange={(e) => setAutoGenerateImage(e.target.checked)}
                className="h-4 w-4 rounded accent-[#0540ad]"
              />
              <span>
                Buat juga gambar unggulan otomatis (Cloudflare Workers AI · FLUX.1 Schnell)
              </span>
            </label>
          </div>

          {/* Streamed Content Preview */}
          {useStreaming && streamedContent && (
            <div className="space-y-1.5">
              <Label className="text-[#002253] font-semibold">
                Pratinjau Aliran Konten:
              </Label>
              <Textarea
                value={streamedContent}
                readOnly
                rows={8}
                className="font-mono text-xs bg-[#f8faff] border-[#dfdfe0]"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            disabled={isGenerating}
            className="rounded-full border-[#dfdfe0] px-5"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !options.topic?.trim()}
            className="rounded-full bg-[#0540ad] hover:bg-[#002253] text-white font-semibold px-6"
          >
            {isGenerating && (
              <Loader2 aria-hidden="true" className="h-4 w-4 mr-2 animate-spin" />
            )}
            {isGenerating ? "Menyusun Artikel..." : "Buat Artikel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
