/**
 * Blog Article Generation Prompts
 * Template prompts untuk generate berbagai jenis artikel blog
 */

export interface BlogPromptParams {
  topic?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  keywords?: string[];
  targetAudience?: string;
  language?: 'id' | 'en';
}

/**
 * Generate system prompt untuk blog article
 */
export function getSystemPrompt(language: 'id' | 'en' = 'id'): string {
  if (language === 'id') {
    return `Kamu adalah seorang content writer profesional yang ahli dalam menulis artikel blog yang engaging dan informatif. 
Tugas kamu adalah membuat artikel blog yang:
- Terstruktur dengan baik (intro, body, conclusion)
- SEO-friendly dengan penggunaan keywords yang natural
- Mudah dibaca dan dipahami
- Memiliki call-to-action yang relevan
- Menggunakan bahasa Indonesia yang baik dan benar`;
  }
  
  return `You are a professional content writer specialized in creating engaging and informative blog articles.
Your task is to create blog articles that are:
- Well-structured (intro, body, conclusion)
- SEO-friendly with natural keyword usage
- Easy to read and understand
- Include relevant call-to-action
- Written in proper English`;
}

/**
 * Generate prompt untuk artikel lengkap
 */
export function generateFullArticlePrompt(params: BlogPromptParams): string {
  const {
    topic = 'teknologi web development',
    tone = 'professional',
    length = 'medium',
    keywords = [],
    targetAudience = 'developers',
    language = 'id',
  } = params;

  const lengthGuide = {
    short: language === 'id' ? '500-800 kata' : '500-800 words',
    medium: language === 'id' ? '1000-1500 kata' : '1000-1500 words',
    long: language === 'id' ? '2000-3000 kata' : '2000-3000 words',
  };

  const toneGuide = {
    professional: language === 'id' ? 'profesional dan formal' : 'professional and formal',
    casual: language === 'id' ? 'santai dan bersahabat' : 'casual and friendly',
    technical: language === 'id' ? 'teknis dan detail' : 'technical and detailed',
    friendly: language === 'id' ? 'ramah dan mudah dipahami' : 'friendly and easy to understand',
  };

  if (language === 'id') {
    return `Buatkan artikel blog yang lengkap dengan spesifikasi berikut:

Topik: ${topic}
Target Audience: ${targetAudience}
Tone: ${toneGuide[tone]}
Panjang: ${lengthGuide[length]}
${keywords.length > 0 ? `Keywords yang harus dimasukkan: ${keywords.join(', ')}` : ''}

Struktur artikel harus mencakup:
1. Judul yang menarik dan SEO-friendly
2. Meta description (150-160 karakter)
3. Paragraf pembuka yang engaging
4. Beberapa sub-heading (H2 dan H3)
5. Konten utama dengan penjelasan detail
6. Kesimpulan yang kuat
7. Call-to-action di akhir artikel

Format output dalam HTML dengan tag yang sesuai (<h1>, <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>).
Pastikan artikel mudah dibaca, informatif, dan menarik untuk target audience.`;
  }

  return `Create a complete blog article with the following specifications:

Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${toneGuide[tone]}
Length: ${lengthGuide[length]}
${keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}

Article structure should include:
1. Attractive and SEO-friendly title
2. Meta description (150-160 characters)
3. Engaging opening paragraph
4. Multiple sub-headings (H2 and H3)
5. Main content with detailed explanations
6. Strong conclusion
7. Call-to-action at the end

Format output in HTML with appropriate tags (<h1>, <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>).
Make sure the article is easy to read, informative, and engaging for the target audience.`;
}

/**
 * Generate prompt untuk title saja
 */
export function generateTitlePrompt(topic: string, language: 'id' | 'en' = 'id'): string {
  if (language === 'id') {
    return `Buatkan 5 judul artikel blog yang menarik dan SEO-friendly tentang: "${topic}"

Kriteria judul:
- Maksimal 60 karakter
- Menarik perhatian pembaca
- Menggunakan power words
- SEO-friendly
- Jelas menggambarkan isi artikel

Format: Berikan dalam format list (1-5) tanpa penjelasan tambahan.`;
  }

  return `Create 5 attractive and SEO-friendly blog article titles about: "${topic}"

Title criteria:
- Maximum 60 characters
- Attention-grabbing
- Use power words
- SEO-friendly
- Clearly describes the content

Format: Provide in list format (1-5) without additional explanation.`;
}

/**
 * Generate prompt untuk excerpt
 */
export function generateExcerptPrompt(
  title: string,
  content: string,
  language: 'id' | 'en' = 'id'
): string {
  const contentPreview = content.substring(0, 500);
  
  if (language === 'id') {
    return `Buatkan excerpt atau ringkasan menarik untuk artikel blog dengan:

Judul: ${title}
Konten (preview): ${contentPreview}...

Kriteria excerpt:
- Maksimal 150-160 karakter
- Menarik dan menggambarkan isi artikel
- Mendorong pembaca untuk membaca seluruh artikel
- Tidak menggunakan kata "artikel" atau "tulisan"

Berikan hanya excerpt-nya saja, tanpa penjelasan tambahan.`;
  }

  return `Create an attractive excerpt or summary for a blog article with:

Title: ${title}
Content (preview): ${contentPreview}...

Excerpt criteria:
- Maximum 150-160 characters
- Attractive and describes the article content
- Encourages readers to read the full article
- Don't use words like "article" or "post"

Provide only the excerpt, without additional explanation.`;
}

/**
 * Generate prompt untuk improve content
 */
export function generateImprovePrompt(
  content: string,
  improvement: 'grammar' | 'seo' | 'engagement' | 'readability',
  language: 'id' | 'en' = 'id'
): string {
  const improvements = {
    grammar: {
      id: 'Perbaiki grammar, tata bahasa, dan typo',
      en: 'Fix grammar, syntax, and typos'
    },
    seo: {
      id: 'Optimasi untuk SEO dengan keyword placement yang lebih baik',
      en: 'Optimize for SEO with better keyword placement'
    },
    engagement: {
      id: 'Tingkatkan engagement dengan bahasa yang lebih menarik',
      en: 'Increase engagement with more attractive language'
    },
    readability: {
      id: 'Tingkatkan readability dengan struktur yang lebih baik',
      en: 'Improve readability with better structure'
    }
  };

  const instruction = improvements[improvement][language];

  if (language === 'id') {
    return `${instruction} pada konten berikut:

${content}

Berikan hasil yang sudah diperbaiki dalam format HTML yang sama.`;
  }

  return `${instruction} in the following content:

${content}

Provide the improved result in the same HTML format.`;
}

/**
 * Generate prompt untuk expand section
 */
export function generateExpandPrompt(
  section: string,
  context: string,
  language: 'id' | 'en' = 'id'
): string {
  if (language === 'id') {
    return `Kembangkan bagian berikut dengan lebih detail dan informatif:

Bagian yang akan dikembangkan:
${section}

Konteks artikel:
${context}

Buatkan paragraf yang lebih panjang dan detail (3-5 paragraf) dengan:
- Penjelasan yang lebih mendalam
- Contoh konkret jika relevan
- Data atau fakta pendukung
- Tetap konsisten dengan tone artikel

Format dalam HTML dengan tag <p>, <ul>, <strong> yang sesuai.`;
  }

  return `Expand the following section with more detail and information:

Section to expand:
${section}

Article context:
${context}

Create longer and more detailed paragraphs (3-5 paragraphs) with:
- Deeper explanations
- Concrete examples if relevant
- Supporting data or facts
- Consistent with article tone

Format in HTML with appropriate <p>, <ul>, <strong> tags.`;
}
