import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Download, 
  RefreshCw, 
  Zap,
  Trash2,
  AlertCircle,
  Save
} from 'lucide-react';

// AI Image Generation Service
const generateImageWithAI = async (prompt: string, style: string, useAIEnhancement: boolean = true, onEnhancedPrompt?: (enhancedPrompt: string) => void): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    // If no API key is configured, use a fallback service
    if (!apiKey || apiKey === 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      console.warn('Hugging Face API key not configured, using fallback image service');
      return await generateWithFallbackService(prompt, style, useAIEnhancement, onEnhancedPrompt);
    }
    
    // Use Hugging Face's Stable Diffusion API
    const apiUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';
    
    // Enhance prompt based on settings
    let enhancedPrompt;
    if (useAIEnhancement) {
      enhancedPrompt = await enhancePromptWithAI(prompt, style);
    } else {
      enhancedPrompt = enhancePromptWithStyle(prompt, style);
    }
    
    // Notify caller about the enhanced prompt
    if (onEnhancedPrompt) {
      onEnhancedPrompt(enhancedPrompt);
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          negative_prompt: "blurry, bad quality, distorted, ugly, bad anatomy, worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 512,
          height: 512
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Hugging Face API failed: ${response.status} - ${errorText}. Using fallback.`);
      return await generateWithFallbackService(prompt, style, useAIEnhancement, onEnhancedPrompt);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
  } catch (error) {
    console.error('Primary image generation failed, using fallback:', error);
    return await generateWithFallbackService(prompt, style, useAIEnhancement, onEnhancedPrompt);
  }
};

// Fallback image generation using free services
const generateWithFallbackService = async (prompt: string, style: string, useAIEnhancement: boolean = true, onEnhancedPrompt?: (enhancedPrompt: string) => void): Promise<string> => {
  try {
    // Use Pollinations.ai - a free AI image generation service
    let enhancedPrompt;
    if (useAIEnhancement) {
      enhancedPrompt = await enhancePromptWithAI(prompt, style);
    } else {
      enhancedPrompt = enhancePromptWithStyle(prompt, style);
    }
    
    // Notify caller about the enhanced prompt
    if (onEnhancedPrompt) {
      onEnhancedPrompt(enhancedPrompt);
    }
    
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${Date.now()}`;
    
    // Test if the image loads properly
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Fallback service failed');
    }
    
    return imageUrl;
  } catch (error) {
    console.error('Fallback image generation failed:', error);
    throw new Error('All image generation services are currently unavailable. Please try again later.');
  }
};

// Enhanced prompt enhancement system
const enhancePromptWithStyle = (prompt: string, style: string): string => {
  // Base quality enhancers for business ads
  const qualityTerms = "high quality, detailed, professional, commercial grade, 8k resolution, marketing ready";
  
  // Style-specific enhancements for business advertisements
  const styleEnhancements = {
    professional: `${prompt}, ${qualityTerms}, professional business photography, corporate style, clean composition, studio lighting, executive quality, LinkedIn worthy`,
    modern: `${prompt}, ${qualityTerms}, modern design, contemporary business aesthetic, sleek interface, minimalist professional, tech startup vibe, innovative branding`,
    bold: `${prompt}, ${qualityTerms}, bold advertising design, eye-catching visuals, strong contrast, dynamic composition, attention-grabbing, impactful marketing`,
    clean: `${prompt}, ${qualityTerms}, clean business design, white background, minimal distractions, product focus, e-commerce ready, catalog quality`,
    luxury: `${prompt}, ${qualityTerms}, luxury brand aesthetic, premium quality, sophisticated design, high-end marketing, elegant composition, upscale appeal`,
    corporate: `${prompt}, ${qualityTerms}, corporate identity, business professional, company branding, formal presentation, boardroom ready, enterprise quality`
  };

  // Business-focused content enhancements
  const contentEnhancements = {
    product: "commercial product photography, e-commerce ready, clean background, perfect lighting, sales-focused",
    service: "professional service presentation, trustworthy appearance, client-focused imagery",
    team: "corporate team photography, professional headshots, business casual attire, office environment",
    office: "modern office space, professional workplace, business environment, corporate setting",
    technology: "tech product showcase, innovation focus, digital transformation, cutting-edge design",
    finance: "financial services imagery, trust and security focus, professional consulting appearance"
  };

  let enhancedPrompt = styleEnhancements[style as keyof typeof styleEnhancements] || `${prompt}, ${qualityTerms}`;

  // Detect business content type and add appropriate enhancements
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('product') || lowerPrompt.includes('item') || lowerPrompt.includes('goods')) {
    enhancedPrompt += `, ${contentEnhancements.product}`;
  }
  if (lowerPrompt.includes('service') || lowerPrompt.includes('consultation') || lowerPrompt.includes('support')) {
    enhancedPrompt += `, ${contentEnhancements.service}`;
  }
  if (lowerPrompt.includes('team') || lowerPrompt.includes('staff') || lowerPrompt.includes('employee') || lowerPrompt.includes('people')) {
    enhancedPrompt += `, ${contentEnhancements.team}`;
  }
  if (lowerPrompt.includes('office') || lowerPrompt.includes('workplace') || lowerPrompt.includes('business space')) {
    enhancedPrompt += `, ${contentEnhancements.office}`;
  }
  if (lowerPrompt.includes('technology') || lowerPrompt.includes('software') || lowerPrompt.includes('app') || lowerPrompt.includes('digital')) {
    enhancedPrompt += `, ${contentEnhancements.technology}`;
  }
  if (lowerPrompt.includes('finance') || lowerPrompt.includes('banking') || lowerPrompt.includes('investment') || lowerPrompt.includes('money')) {
    enhancedPrompt += `, ${contentEnhancements.finance}`;
  }

  return enhancedPrompt;
};

// Advanced prompt enhancement using AI
const enhancePromptWithAI = async (prompt: string, style: string): Promise<string> => {
  try {
    // Use Google Gemini to enhance the prompt
    const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.warn('Google AI API key not found, using basic enhancement');
      return enhancePromptWithStyle(prompt, style);
    }

    const enhancementRequest = {
      contents: [{
        parts: [{
          text: `You are a professional advertising and marketing visual expert. Enhance this business advertisement image prompt to create compelling, professional marketing visuals.

Original prompt: "${prompt}"
Business style: "${style}"

Please enhance this prompt by:
1. Adding professional business and marketing terminology
2. Including commercial photography techniques and lighting
3. Specifying composition that works well for advertisements
4. Adding terms that ensure high commercial quality
5. Making it optimized for business use and marketing campaigns
6. Keeping it under 200 words and marketing-focused

Focus on creating images suitable for: websites, social media ads, brochures, presentations, and professional marketing materials.

Return only the enhanced prompt without explanations.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancementRequest)
    });

    if (!response.ok) {
      throw new Error('AI enhancement failed');
    }

    const data = await response.json();
    const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (enhancedPrompt && enhancedPrompt.length > prompt.length) {
      return enhancedPrompt;
    } else {
      return enhancePromptWithStyle(prompt, style);
    }
  } catch (error) {
    console.warn('AI prompt enhancement failed, using basic enhancement:', error);
    return enhancePromptWithStyle(prompt, style);
  }
};

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: string;
  isFavorite: boolean;
  status: 'generating' | 'ready' | 'failed';
}

interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: string;
  savedAt: string;
  isFavorite: boolean;
  tags: string[];
  title: string;
  description: string;
}

interface UserCredits {
  remaining: number;
  total: number;
  lastUpdated: string;
}

interface GenerationSettings {
  prompt: string;
  style: string;
  aspectRatio: string;
  useAIEnhancement: boolean;
  businessType: string;
  businessCategory: string;
  businessSubcategory: string;
}

// Remove old UI and unused variables below
// (Remove notification, filter, showHelp, step, styles, aspectRatios, businessFlows, and related UI code)

const LOCAL_STORAGE_KEYS = {
  IMAGES: 'ai_generated_images',
  CREDITS: 'ai_image_credits',
  SETTINGS: 'ai_image_settings',
  LIBRARY: 'ai_image_library'
};

// Helper prompt type
interface HelperPrompt {
  id: string;
  name: string;
  hiddenPrompt: string;
}

const ImageGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [credits, setCredits] = useState<UserCredits>({ remaining: 25, total: 50, lastUpdated: new Date().toISOString() });
  const [activeTab, setActiveTab] = useState<'wizard' | 'viewport' | 'recent' | 'advanced' | 'settings'>('wizard');
  const [useAIEnhancement, setUseAIEnhancement] = useState(true);
  
  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardPrompt, setWizardPrompt] = useState('');

  const [helperPrompts, setHelperPrompts] = useState<HelperPrompt[]>([
    // Example default prompts
    { id: 'default1', name: 'Product Ad', hiddenPrompt: 'Highlight product features, call to action, professional ad copy.' },
    { id: 'default2', name: 'Service Ad', hiddenPrompt: 'Emphasize service benefits, trust, and customer satisfaction.' },
  ]);
  const [selectedHelperPromptIds, setSelectedHelperPromptIds] = useState<string[]>([]);
  const [newHelperName, setNewHelperName] = useState('');
  const [newHelperHidden, setNewHelperHidden] = useState('');

  // Add state for user details for each helper
  const [helperDetails, setHelperDetails] = useState<{ [helperId: string]: string }>({});
  const [helperDetailModal, setHelperDetailModal] = useState<{ open: boolean, helperId: string | null }>({ open: false, helperId: null });
  const [pendingHelperId, setPendingHelperId] = useState<string | null>(null);

  const wizardSteps = [
    'Select Style',
    'Select Ad Size',
    'Helper Prompts',
    'Enter Prompt',
    'Confirm & Generate'
  ];

  const styles = [
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'modern', name: 'Modern', icon: '✨' },
    { id: 'bold', name: 'Bold', icon: '🔥' },
    { id: 'clean', name: 'Clean', icon: '🧼' },
    { id: 'luxury', name: 'Luxury', icon: '💎' },
    { id: 'corporate', name: 'Corporate', icon: '🏢' },
  ];

  const socialAdSizes = [
    { id: 'instagram_post', name: 'Instagram Post (1:1)', dimensions: '1080x1080', aspect: '1:1' },
    { id: 'instagram_story', name: 'Instagram Story (9:16)', dimensions: '1080x1920', aspect: '9:16' },
    { id: 'facebook_ad', name: 'Facebook Ad (1.91:1)', dimensions: '1200x628', aspect: '1.91:1' },
    { id: 'twitter_banner', name: 'Twitter Banner (3:1)', dimensions: '1500x500', aspect: '3:1' },
    { id: 'linkedin_banner', name: 'LinkedIn Banner (4:1)', dimensions: '1584x396', aspect: '4:1' },
    { id: 'pinterest_pin', name: 'Pinterest Pin (2:3)', dimensions: '1000x1500', aspect: '2:3' },
    { id: 'youtube_thumbnail', name: 'YouTube Thumbnail (16:9)', dimensions: '1280x720', aspect: '16:9' },
    { id: 'tiktok_video', name: 'TikTok Video (9:16)', dimensions: '1080x1920', aspect: '9:16' },
  ];

  const [selectedAdSize, setSelectedAdSize] = useState(socialAdSizes[0].id);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage();
  }, [generatedImages, credits, prompt, selectedStyle, selectedAspectRatio, useAIEnhancement]);

  const loadFromLocalStorage = () => {
    try {
      // Load generated images
      const savedImages = localStorage.getItem(LOCAL_STORAGE_KEYS.IMAGES);
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages) as GeneratedImage[];
        setGeneratedImages(parsedImages);
      }

      // Load credits
      const savedCredits = localStorage.getItem(LOCAL_STORAGE_KEYS.CREDITS);
      if (savedCredits) {
        const parsedCredits = JSON.parse(savedCredits) as UserCredits;
        setCredits(parsedCredits);
      }

      // Load last settings
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as GenerationSettings;
        setPrompt(parsedSettings.prompt);
        setSelectedStyle(parsedSettings.style);
        setSelectedAspectRatio(parsedSettings.aspectRatio);
        if (parsedSettings.useAIEnhancement !== undefined) {
          setUseAIEnhancement(parsedSettings.useAIEnhancement);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.IMAGES, JSON.stringify(generatedImages));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CREDITS, JSON.stringify(credits));
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify({
        prompt,
        style: selectedStyle,
        aspectRatio: selectedAspectRatio,
        useAIEnhancement
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const saveToLibrary = (image: GeneratedImage) => {
    try {
      const savedImages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.LIBRARY) || '[]') as SavedImage[];
      
      const title = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
      const description = `AI-generated ${selectedStyle} style business advertisement`;
      
      const savedImage: SavedImage = {
        ...image,
        savedAt: new Date().toISOString(),
        title,
        description,
        tags: [selectedStyle].filter(Boolean)
      };
      
      savedImages.unshift(savedImage);
      localStorage.setItem(LOCAL_STORAGE_KEYS.LIBRARY, JSON.stringify(savedImages));
      
    } catch (error) {
      console.error('Error saving to library:', error);
    }
  };

  // Refactored generateImage to accept parameters
  const generateImage = async (customPrompt?: string, customStyle?: string, customAspectRatio?: string) => {
    const usePrompt = customPrompt !== undefined ? customPrompt : prompt;
    const useStyle = customStyle !== undefined ? customStyle : selectedStyle;
    const useAspect = customAspectRatio !== undefined ? customAspectRatio : selectedAspectRatio;

    if (!usePrompt.trim()) {
      return;
    }
    if (credits.remaining < 1) {
      return;
    }
    setIsGenerating(true);
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: '',
      prompt: usePrompt,
      style: useStyle,
      aspectRatio: useAspect,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      status: 'generating'
    };
    setGeneratedImages(prev => [newImage, ...prev]);
    setCredits(prev => ({
      ...prev,
      remaining: prev.remaining - 1,
      lastUpdated: new Date().toISOString()
    }));
    try {
      const imageUrl = await generateImageWithAI(usePrompt, useStyle, useAIEnhancement);
      setGeneratedImages(prev => prev.map(img =>
        img.id === newImage.id
          ? { ...img, status: 'ready', url: imageUrl }
          : img
      ));
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedImages(prev => prev.map(img =>
        img.id === newImage.id
          ? { ...img, status: 'failed' }
          : img
      ));
      setCredits(prev => ({
        ...prev,
        remaining: prev.remaining + 1,
        lastUpdated: new Date().toISOString()
      }));
    }
    setIsGenerating(false);
  };

  const downloadImage = (url: string) => {
    if (!url) {
      return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteImage = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'wizard' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setActiveTab('wizard')}>Wizard</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'viewport' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setActiveTab('viewport')}>Viewport</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'recent' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setActiveTab('recent')}>Recently Generated</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'advanced' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-6 mb-4">
        {activeTab === 'wizard' && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <div className="text-xs uppercase tracking-widest text-primary-600 font-bold mb-2">Step {wizardStep + 1} of {wizardSteps.length}</div>
              <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{wizardSteps[wizardStep]}</h2>
            </div>
            {/* Step Content - all steps use graphic layout */}
            {wizardStep === 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all shadow-sm ${selectedStyle === style.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'}`}
                  >
                    <span className="text-3xl mb-2">{style.icon}</span>
                    <span className="font-medium dark:text-white">{style.name}</span>
                  </button>
                ))}
              </div>
            )}
            {wizardStep === 1 && (
              <div className="grid grid-cols-1 gap-4 mb-6">
                {socialAdSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => {
                      setSelectedAdSize(size.id);
                      setWizardStep(2);
                    }}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all shadow-sm ${selectedAdSize === size.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'}`}
                  >
                    <span className="text-lg font-bold mb-1 dark:text-white">{size.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-300">{size.dimensions}</span>
                  </button>
                ))}
              </div>
            )}
            {wizardStep === 2 && (
              <div className="mb-6">
                <div className="mb-2 font-medium dark:text-gray-200">Select Helper Prompts (optional)</div>
                <div className="space-y-2 mb-4">
                  {helperPrompts.length === 0 && <div className="text-gray-400 text-sm">No helper prompts available. Add some in Settings.</div>}
                  {helperPrompts.map((hp) => (
                    <label key={hp.id} className="flex items-center gap-2 p-3 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedHelperPromptIds.includes(hp.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setPendingHelperId(hp.id);
                            setHelperDetailModal({ open: true, helperId: hp.id });
                          } else {
                            setSelectedHelperPromptIds(ids => ids.filter(id => id !== hp.id));
                            setHelperDetails(details => {
                              const newDetails = { ...details };
                              delete newDetails[hp.id];
                              return newDetails;
                            });
                          }
                        }}
                      />
                      <span className="font-medium dark:text-gray-200">{hp.name}</span>
                      {selectedHelperPromptIds.includes(hp.id) && (
                        <span className="ml-2 text-xs text-primary-600 dark:text-primary-300">✔</span>
                      )}
                    </label>
                  ))}
                </div>
                <div className="text-xs text-gray-400">Manage helper prompts in the Settings tab.</div>
                {/* Modal for entering helper detail */}
                {helperDetailModal.open && helperDetailModal.helperId && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                      <div className="mb-4 font-semibold text-lg dark:text-white">Describe for: {helperPrompts.find(h => h.id === helperDetailModal.helperId)?.name}</div>
                      <textarea
                        value={helperDetails[helperDetailModal.helperId] || ''}
                        onChange={e => setHelperDetails(details => ({ ...details, [helperDetailModal.helperId!]: e.target.value }))}
                        placeholder={`Describe your ${helperPrompts.find(h => h.id === helperDetailModal.helperId)?.name?.toLowerCase()} in detail...`}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none mb-2"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setHelperDetailModal({ open: false, helperId: null })}>Cancel</button>
                        <button className="px-3 py-1 rounded bg-primary-600 text-white" disabled={!(helperDetails[helperDetailModal.helperId] && helperDetails[helperDetailModal.helperId].trim())} onClick={() => {
                          setSelectedHelperPromptIds(ids => [...ids, helperDetailModal.helperId!]);
                          setHelperDetailModal({ open: false, helperId: null });
                        }}>Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {wizardStep === 3 && (
              <div className="mb-6 flex flex-col items-center">
                <textarea
                  value={wizardPrompt}
                  onChange={(e) => setWizardPrompt(e.target.value)}
                  placeholder="Describe your business ad image..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none mb-2"
                />
                <span className="text-xs text-gray-400">Focus on ad content and marketing goals.</span>
              </div>
            )}
            {wizardStep === 4 && (
              <div className="mb-6 text-left flex flex-col items-center">
                <div className="mb-2 dark:text-white"><b>Style:</b> <span className="dark:text-gray-200">{styles.find(s => s.id === selectedStyle)?.name}</span></div>
                <div className="mb-2 dark:text-white"><b>Ad Size:</b> <span className="dark:text-gray-200">{socialAdSizes.find(a => a.id === selectedAdSize)?.name}</span></div>
                <div className="mb-2 dark:text-white"><b>Helper Prompts:</b> <span className="dark:text-gray-200">{helperPrompts.filter(hp => selectedHelperPromptIds.includes(hp.id)).map(hp => hp.name).join(', ') || 'None'}</span></div>
                <div className="mb-2 dark:text-white"><b>Prompt:</b> <span className="dark:text-gray-200">{wizardPrompt}</span></div>
              </div>
            )}
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Back</button>
              {wizardStep < wizardSteps.length - 1 ? (
                <button onClick={() => setWizardStep(wizardStep + 1)} disabled={wizardStep === 3 && !wizardPrompt.trim()} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">Next</button>
              ) : (
                <button onClick={async () => {
                  // 1. Enhance each helper+detail, but preserve user detail verbatim
                  const enhancedHelpers: string[] = [];
                  for (const hpId of selectedHelperPromptIds) {
                    const hp = helperPrompts.find(h => h.id === hpId);
                    const detail = helperDetails[hpId] || '';
                    if (hp) {
                      // Stronger guardrails
                      const toEnhance = `You must not change or paraphrase the following user description. It must appear exactly, word for word, in the final prompt: "${detail}". ${hp.hiddenPrompt}`;
                      const enhanced = await enhancePromptWithAI(toEnhance, selectedStyle);
                      const safeEnhanced = enhanced.includes(detail) ? enhanced : `"${detail}" ${enhanced}`;
                      enhancedHelpers.push(safeEnhanced);
                    }
                  }
                  // 2. Enhance user prompt with strong guardrails
                  const userGuard = `You must not change or paraphrase the following user description. It must appear exactly, word for word, in the final prompt: "${wizardPrompt}".`;
                  const enhancedUserPrompt = await enhancePromptWithAI(userGuard, selectedStyle);
                  const safeUserPrompt = enhancedUserPrompt.includes(wizardPrompt) ? enhancedUserPrompt : `"${wizardPrompt}" ${enhancedUserPrompt}`;
                  // 3. Combine all (no further enhancement)
                  const finalPrompt = [safeUserPrompt, ...enhancedHelpers].filter(Boolean).join(' ');
                  const adSizeObj = socialAdSizes.find(a => a.id === selectedAdSize);
                  setPrompt(finalPrompt);
                  setSelectedStyle(selectedStyle);
                  if (adSizeObj) setSelectedAspectRatio(adSizeObj.aspect);
                  setActiveTab('viewport');
                  setWizardStep(0);
                  await generateImage(finalPrompt, selectedStyle, adSizeObj ? adSizeObj.aspect : selectedAspectRatio);
                }} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" disabled={!wizardPrompt.trim()}>Generate Image</button>
              )}
            </div>
            <div className="mt-4 text-center">
              <button className="text-xs text-gray-500 underline hover:text-primary-600" onClick={() => setActiveTab('advanced')}>Switch to Advanced Mode</button>
              <span className="mx-2">|</span>
              <button className="text-xs text-gray-500 underline hover:text-primary-600" onClick={() => setActiveTab('viewport')}>Use Normal Image Generator</button>
            </div>
          </div>
        )}
        {activeTab === 'viewport' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            {generatedImages.length > 0 && generatedImages[0].status === 'ready' ? (
              <>
                <img src={generatedImages[0].url} alt={generatedImages[0].prompt} className="max-h-[400px] rounded-lg shadow mb-4" />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveToLibrary(generatedImages[0])}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Save to Library
                  </button>
                  <button
                    onClick={() => downloadImage(generatedImages[0].url)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={async () => {
                      // Slightly change the prompt for redo
                      const creativeSeeds = [
                        'with a unique perspective',
                        'inspired by modern art',
                        'with a playful twist',
                        'with vibrant colors',
                        'with a cinematic look',
                        'with a dreamy atmosphere',
                        'with a touch of surrealism',
                        'with a bold composition',
                        'with a fresh angle',
                        'with creative lighting'
                      ];
                      const seed = creativeSeeds[Math.floor(Math.random() * creativeSeeds.length)];
                      const newPrompt = `${generatedImages[0].prompt} ${seed}`;
                      await generateImage(newPrompt, generatedImages[0].style, generatedImages[0].aspectRatio);
                    }}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                  >
                    Redo
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{generatedImages[0].prompt}</div>
              </>
            ) : generatedImages.length > 0 && generatedImages[0].status === 'generating' ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <div className="text-primary-600 dark:text-primary-300">Generating image...</div>
              </div>
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500">No image generated yet. Use the wizard to create one.</div>
            )}
          </div>
        )}
        {activeTab === 'recent' && (
          <div>
            {generatedImages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No images generated yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((image) => (
                  <div key={image.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow overflow-hidden flex flex-col">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                      {image.status === 'ready' && image.url ? (
                        <img src={image.url} alt={image.prompt} className="w-full h-full object-cover" />
                      ) : image.status === 'generating' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
                        </div>
                      ) : image.status === 'failed' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                      ) : null}
                      <button
                        onClick={() => saveToLibrary(image)}
                        className="absolute bottom-2 right-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                      >
                        <Save className="inline h-3 w-3 mr-1" /> Save
                      </button>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{image.prompt}</div>
                      <div className="flex gap-2 mt-auto">
                        <button onClick={() => downloadImage(image.url)} className="p-2 text-gray-400 hover:text-blue-600" title="Download"><Download className="h-4 w-4" /></button>
                        <button onClick={() => deleteImage(image.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'advanced' && (
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
            <p className="text-gray-500 mb-4">(Coming soon: All image generation parameters and options will be available here.)</p>
            <button
              className="text-xs text-gray-500 underline hover:text-primary-600"
              onClick={() => setActiveTab('wizard')}
            >
              Back to Wizard
            </button>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Manage Helper Prompts</h2>
            <div className="space-y-2 mb-4">
              {helperPrompts.map((hp) => (
                <div key={hp.id} className="flex items-center gap-2 p-3 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                  <span className="font-medium flex-1 dark:text-gray-200">{hp.name}</span>
                  <button className="text-xs text-blue-500 hover:underline" onClick={() => {
                    const newName = window.prompt('Edit prompt name:', hp.name);
                    if (newName !== null && newName.trim()) {
                      setHelperPrompts(hps => hps.map(x => x.id === hp.id ? { ...x, name: newName } : x));
                    }
                  }}>Edit Name</button>
                  <button className="text-xs text-blue-500 hover:underline" onClick={() => {
                    const newHidden = window.prompt('Edit hidden prompt:', hp.hiddenPrompt);
                    if (newHidden !== null && newHidden.trim()) {
                      setHelperPrompts(hps => hps.map(x => x.id === hp.id ? { ...x, hiddenPrompt: newHidden } : x));
                    }
                  }}>Edit Prompt</button>
                  <button className="text-xs text-red-500 hover:underline" onClick={() => setHelperPrompts(hps => hps.filter(x => x.id !== hp.id))}>Delete</button>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="mb-1 font-medium text-sm">Add New Helper Prompt</div>
              <input type="text" value={newHelperName} onChange={e => setNewHelperName(e.target.value)} placeholder="Prompt Name (shown to user)" className="w-full mb-2 px-2 py-1 border rounded" />
              <textarea value={newHelperHidden} onChange={e => setNewHelperHidden(e.target.value)} placeholder="Hidden prompt (used for ad generation)" className="w-full mb-2 px-2 py-1 border rounded" rows={2} />
              <button className="bg-primary-600 text-white px-3 py-1 rounded text-sm" disabled={!newHelperName.trim() || !newHelperHidden.trim()} onClick={() => {
                setHelperPrompts(hps => [
                  ...hps,
                  { id: Date.now().toString(), name: newHelperName, hiddenPrompt: newHelperHidden }
                ]);
                setNewHelperName('');
                setNewHelperHidden('');
              }}>Add Helper</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGeneration;
