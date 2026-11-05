"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { sumoPodAI } from "@/lib/ai/gemini-client";
import { cropBlobToAspectRatio } from "@/lib/ai/image-crop";
import Image from "next/image";

interface FeaturedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function FeaturedImageUpload({ value, onChange }: FeaturedImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isTextless, setIsTextless] = useState(true);
  const [selectedRatio, setSelectedRatio] = useState<"16:9" | "1:1">("16:9");
  const [imagePrompt, setImagePrompt] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/featured-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAIGenerate = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setIsGenerating(true);
    setPreviewImage(null);

    try {
      console.log('Starting AI image generation with prompt:', imagePrompt);
      
      // Generate image with Cloudflare Workers AI (FLUX.1 [schnell])
      const rawImageBlob = await sumoPodAI.generateImage(imagePrompt, {
        steps: 4,
        noText: isTextless,
      });

      console.log('Image generated, blob size:', rawImageBlob.size, 'type:', rawImageBlob.type);

      // Verify blob is valid
      if (!rawImageBlob || rawImageBlob.size === 0) {
        throw new Error('Generated image is empty or invalid');
      }

      // Crop to 16:9 banner ratio if selected
      const imageBlob =
        selectedRatio === "16:9"
          ? await cropBlobToAspectRatio(rawImageBlob, { w: 16, h: 9 }, 1280)
          : rawImageBlob;

      // Create preview
      const previewUrl = URL.createObjectURL(imageBlob);
      setPreviewImage(previewUrl);

      // Upload to server
      const formData = new FormData();
      const ext = imageBlob.type === 'image/png' ? 'png' : 'jpg';
      const fileName = `flux-${Date.now()}.${ext}`;
      
      console.log('Creating File from Blob with filename:', fileName);
      
      // Create a File from Blob with proper filename
      const file = new File([imageBlob], fileName, { type: imageBlob.type || 'image/jpeg' });
      
      console.log('File created:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      formData.append('file', file);

      console.log('Uploading to server...');

      const response = await fetch('/api/upload/featured-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      console.log('Upload response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save generated image');
      }

      onChange(data.url);
      toast.success('Image generated successfully!');
      setIsAIDialogOpen(false);
      setImagePrompt('');
      
      // Cleanup preview URL
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('AI Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="featuredImage">Featured Image</Label>
        <div className="flex gap-2">
          {/* Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isGenerating}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>

          {/* AI Generate Button */}
          <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isUploading || isGenerating}
              >
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span>Generate Gambar AI</span>
                  </span>
                  <span className="rounded-full border border-orange-200 bg-orange-50 dark:bg-orange-950/40 dark:border-orange-800 px-2.5 py-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                    FLUX.1 Schnell
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imagePrompt">Image Description *</Label>
                  <Textarea
                    id="imagePrompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate... e.g., 'A modern office with natural lighting, professional photography'"
                    rows={4}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-slate-500">
                    Be specific for better results. Include style, mood, colors, and details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Rasio Aspek
                    </Label>
                    <select
                      value={selectedRatio}
                      onChange={(e) =>
                        setSelectedRatio(e.target.value as "16:9" | "1:1")
                      }
                      className="w-full h-8 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 font-medium"
                    >
                      <option value="16:9">16:9 (Banner Blog)</option>
                      <option value="1:1">1:1 (Persegi / Square)</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 flex items-center">
                    <label
                      htmlFor="textless-toggle"
                      className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id="textless-toggle"
                        checked={isTextless}
                        onChange={(e) => setIsTextless(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#0540ad]"
                      />
                      <span>Tanpa teks (Pure Image)</span>
                    </label>
                  </div>
                </div>

                {previewImage && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <Image
                        src={previewImage}
                        alt="Generated preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAIDialogOpen(false);
                      setImagePrompt('');
                      if (previewImage) {
                        URL.revokeObjectURL(previewImage);
                        setPreviewImage(null);
                      }
                    }}
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !imagePrompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* URL Input */}
      <div className="relative">
        <Input
          id="featuredImage"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL here..."
          type="text"
          disabled={isUploading || isGenerating}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Image Preview */}
      {value && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <Image
              src={value}
              alt="Featured image preview"
              fill
              className="object-cover"
              onError={() => {
                toast.error('Failed to load image preview');
              }}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Upload an image (max 5MB), generate with AI, or paste an image URL
      </p>
    </div>
  );
}
