"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tagIds: string[]) => void;
  label?: string;
}

export function TagSelector({ selectedTags, onChange, label }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter((id) => id !== tagId));
  };

  const getSelectedTagsData = () => {
    return tags.filter((tag) => selectedTags.includes(tag.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="text-sm text-slate-500">Loading tags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {/* Selected Tags Display */}
      {getSelectedTagsData().length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-md bg-slate-50">
          {getSelectedTagsData().map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tag Selection Dropdown */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start"
        >
          {selectedTags.length === 0
            ? "Select tags"
            : `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`}
        </Button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {tags.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 text-center">
                No tags available. Create tags first.
              </div>
            ) : (
              <div className="p-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-slate-100 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className={isSelected ? "font-medium text-blue-700" : ""}>
                        {tag.name}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Select multiple tags to categorize your post
      </p>
    </div>
  );
}
