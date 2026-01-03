# AI Blog Article Generator

Sistem automation untuk generate artikel blog menggunakan Puter.js AI API.

## 📁 Struktur Folder

```
lib/ai/
├── puter-client.ts          # Puter AI SDK client wrapper
├── blog-generator.ts         # Main generator service
└── prompts/
    └── blog-prompts.ts       # Template prompts untuk berbagai kebutuhan

components/ai/
└── AIGenerateDialog.tsx      # Dialog UI untuk generate artikel
```

## 🚀 Cara Penggunaan

### 1. Generate Artikel Lengkap

```typescript
import { generateBlogArticle } from '@/lib/ai/blog-generator';

const article = await generateBlogArticle({
  topic: 'React Hooks untuk Pemula',
  tone: 'professional',
  length: 'medium',
  keywords: ['react', 'hooks', 'useState'],
  targetAudience: 'developers',
  language: 'id',
  model: 'gpt-5-nano'
});

console.log(article.title);
console.log(article.content);
console.log(article.excerpt);
```

### 2. Generate dengan Streaming

```typescript
import { generateBlogArticleStream } from '@/lib/ai/blog-generator';

for await (const chunk of generateBlogArticleStream({
  topic: 'Next.js 15 Features',
  model: 'gemini-2.5-flash-lite'
})) {
  console.log(chunk); // Real-time streaming
}
```

### 3. Generate Title Suggestions

```typescript
import { generateTitleSuggestions } from '@/lib/ai/blog-generator';

const titles = await generateTitleSuggestions(
  'Artificial Intelligence',
  'id',
  'gpt-5-nano'
);
// Returns: ['5 Cara Memahami AI...', 'Panduan Lengkap AI...', ...]
```

### 4. Generate Excerpt

```typescript
import { generateExcerpt } from '@/lib/ai/blog-generator';

const excerpt = await generateExcerpt(
  'Judul Artikel',
  'Konten artikel yang panjang...',
  'id'
);
```

### 5. Improve Content

```typescript
import { improveContent } from '@/lib/ai/blog-generator';

const improved = await improveContent(
  'Konten artikel...',
  'seo', // 'grammar' | 'seo' | 'engagement' | 'readability'
  'id'
);
```

## 🎨 UI Component

### AIGenerateDialog

Dialog component untuk generate artikel dengan UI yang user-friendly.

```tsx
import { AIGenerateDialog } from '@/components/ai/AIGenerateDialog';

<AIGenerateDialog
  onGenerated={(data) => {
    // Handle generated article
    setFormData({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt
    });
  }}
/>
```

**Features:**
- ✅ Topic input dengan title suggestions
- ✅ Configurable tone, length, keywords
- ✅ Multiple AI model options
- ✅ Streaming support dengan real-time preview
- ✅ Bilingual (ID/EN)

## 🤖 Available Models

- `gpt-5-nano` - Fast, efficient (Default)
- `gemini-2.5-flash-lite` - Good for streaming
- `claude-sonnet-4` - High quality, detailed

## 📝 Prompt Templates

### System Prompt
Mendefinisikan role dan behavior AI sebagai content writer profesional.

### Full Article Prompt
Generate artikel lengkap dengan struktur:
- Title (SEO-friendly)
- Meta description
- Opening paragraph
- Multiple headings (H2, H3)
- Main content
- Conclusion
- Call-to-action

### Title Generation
Generate 5 title suggestions yang menarik dan SEO-friendly.

### Excerpt Generation  
Generate ringkasan menarik (150-160 karakter).

### Content Improvement
Improve konten dengan fokus:
- `grammar` - Perbaiki grammar dan typo
- `seo` - Optimasi SEO
- `engagement` - Tingkatkan engagement
- `readability` - Tingkatkan readability

### Section Expansion
Expand bagian tertentu dengan detail lebih lengkap.

## 🔧 Configuration

### Generation Options

```typescript
interface GenerationOptions {
  topic: string;                                    // Required
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  keywords?: string[];
  targetAudience?: string;
  language?: 'id' | 'en';
  model?: string;
  useStreaming?: boolean;
}
```

### Default Values
```typescript
{
  tone: 'professional',
  length: 'medium',
  keywords: [],
  targetAudience: 'developers',
  language: 'id',
  model: 'gpt-5-nano',
  useStreaming: false
}
```

## 🌐 Puter AI Integration

### Client Initialization
```typescript
import { puterAI } from '@/lib/ai/puter-client';

// Auto-initialize on first use
await puterAI.initialize();

// Check availability
if (puterAI.isAvailable()) {
  // Ready to use
}
```

### Direct API Call
```typescript
const response = await puterAI.chat('Your prompt', {
  model: 'gpt-5-nano',
  stream: false,
  temperature: 0.7,
  max_tokens: 2000
});
```

### Streaming API
```typescript
for await (const chunk of puterAI.chatStream('Your prompt', {
  model: 'gemini-2.5-flash-lite'
})) {
  console.log(chunk);
}
```

## 📊 Response Format

### Generated Article
```typescript
interface GeneratedArticle {
  title: string;      // Extracted from H1 or first line
  content: string;    // HTML formatted content
  excerpt: string;    // Meta description or first paragraph
}
```

## 🎯 Best Practices

1. **Topic Selection**
   - Be specific and clear
   - Include target keywords in topic

2. **Model Selection**
   - Use `gpt-5-nano` for fast generation
   - Use `gemini-2.5-flash-lite` for streaming
   - Use `claude-sonnet-4` for high-quality content

3. **Keywords**
   - Add 3-5 relevant keywords
   - Don't over-stuff keywords

4. **Streaming**
   - Enable for long articles (>1000 words)
   - Provides better user experience
   - Shows real-time progress

5. **Error Handling**
   - Always wrap in try-catch
   - Provide user-friendly error messages
   - Log errors for debugging

## 🔒 Security Notes

- Puter SDK loads from CDN (https://js.puter.com/v2/)
- No API keys required (handled by Puter)
- Client-side generation only
- Rate limits apply per Puter's policies

## 🐛 Troubleshooting

### Puter SDK not loading
```typescript
// Check if SDK is loaded
if (!(window as any).puter) {
  console.error('Puter SDK not loaded');
}
```

### Generation timeout
- Try shorter article length
- Use faster model (gpt-5-nano)
- Check network connection

### Empty response
- Check topic is not empty
- Verify model name is correct
- Try different prompt parameters

## 📚 Additional Resources

- [Puter AI Documentation](https://docs.puter.com/AI/chat/)
- [Available Models List](https://puter.com/puterai/chat/models)
- [Puter GitHub](https://github.com/HeyPuter)

## 🔄 Future Enhancements

- [ ] Image generation integration
- [ ] Multi-language support expansion
- [ ] Content scheduling
- [ ] A/B testing for titles
- [ ] Analytics integration
- [ ] Batch article generation
- [ ] Custom prompt templates
- [ ] Voice-to-text integration
