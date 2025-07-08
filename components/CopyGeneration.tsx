import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  RefreshCw, 
  Wand2,
  Target,
  Users,
  Zap,
  CheckCircle,
  BookOpen,
  Mail,
  MessageSquare,
  Globe
} from 'lucide-react';

interface GeneratedCopy {
  id: string;
  content: string;
  type: string;
  prompt: string;
  tone: string;
  audience: string;
  createdAt: string;
}

const CopyGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('social-media');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedAudience, setSelectedAudience] = useState('business');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);

  const copyTypes = [
    { id: 'social-media', name: 'Social Media Post', icon: MessageSquare },
    { id: 'email-subject', name: 'Email Subject Line', icon: Mail },
    { id: 'ad-copy', name: 'Advertisement Copy', icon: Target },
    { id: 'blog-intro', name: 'Blog Introduction', icon: BookOpen },
    { id: 'product-description', name: 'Product Description', icon: FileText },
    { id: 'website-copy', name: 'Website Copy', icon: Globe },
  ];

  const tones = [
    { id: 'professional', name: 'Professional', emoji: '💼' },
    { id: 'casual', name: 'Casual', emoji: '😊' },
    { id: 'friendly', name: 'Friendly', emoji: '🤝' },
    { id: 'authoritative', name: 'Authoritative', emoji: '🎯' },
    { id: 'playful', name: 'Playful', emoji: '🎉' },
    { id: 'urgent', name: 'Urgent', emoji: '⚡' },
  ];

  const audiences = [
    { id: 'business', name: 'Business Professionals' },
    { id: 'consumers', name: 'General Consumers' },
    { id: 'tech-savvy', name: 'Tech-Savvy Users' },
    { id: 'young-adults', name: 'Young Adults (18-35)' },
    { id: 'enterprise', name: 'Enterprise Clients' },
    { id: 'startups', name: 'Startups & Entrepreneurs' },
  ];

  const mockGeneratedCopies: GeneratedCopy[] = [
    {
      id: '1',
      content: '🚀 Transform your business with AI-powered CRM solutions! Streamline your workflow, boost productivity, and watch your sales soar. Ready to revolutionize your customer relationships? #CRM #AI #BusinessGrowth',
      type: 'social-media',
      prompt: 'Create a social media post about our AI CRM system',
      tone: 'professional',
      audience: 'business',
      createdAt: '2024-07-04 14:30:00'
    },
    {
      id: '2',
      content: 'Last Chance: Your AI Revolution Awaits Inside',
      type: 'email-subject',
      prompt: 'Email subject line for final discount offer',
      tone: 'urgent',
      audience: 'consumers',
      createdAt: '2024-07-04 14:25:00'
    },
    {
      id: '3',
      content: 'Imagine a CRM that thinks like you do. Our AI-powered platform learns your business patterns, predicts customer needs, and automates routine tasks so you can focus on what matters most - building relationships that drive growth.',
      type: 'ad-copy',
      prompt: 'Advertisement copy for AI CRM targeting small businesses',
      tone: 'professional',
      audience: 'business',
      createdAt: '2024-07-04 14:20:00'
    }
  ];

  const generateCopy = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newCopy: GeneratedCopy = {
        id: Date.now().toString(),
        content: 'Generated copy content will appear here based on your prompt and settings. This is a placeholder for the AI-generated content.',
        type: selectedType,
        prompt,
        tone: selectedTone,
        audience: selectedAudience,
        createdAt: new Date().toISOString()
      };
      
      setGeneratedCopies([newCopy, ...generatedCopies]);
      setIsGenerating(false);
    }, 3000);
  };

  const copyCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // You might want to show a toast notification here
  };

  const getTypeIcon = (typeId: string) => {
    const type = copyTypes.find(t => t.id === typeId);
    return type ? type.icon : FileText;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Copy Generation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create compelling marketing copy with AI-powered writing assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary-600" />
              Generate Copy
            </h2>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe what you need
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create a compelling social media post about our new AI features..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Copy Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Target className="inline h-4 w-4 mr-1" />
                Copy Type
              </label>
              <div className="space-y-2">
                {copyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full p-3 text-sm rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedType === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tone of Voice
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-3 text-sm rounded-lg border-2 transition-all ${
                      selectedTone === tone.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{tone.emoji}</div>
                    <div className="font-medium">{tone.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Users className="inline h-4 w-4 mr-1" />
                Target Audience
              </label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {audiences.map((audience) => (
                  <option key={audience.id} value={audience.id}>
                    {audience.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCopy}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Copy
                </>
              )}
            </button>

            {/* Credits Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Credits Remaining:</strong> 42/50
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Each generation costs 1 credit
              </div>
            </div>
          </div>
        </div>

        {/* Generated Copy Gallery */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Generated Copy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your recently generated copy will appear here
            </p>
          </div>

          {generatedCopies.length === 0 && mockGeneratedCopies.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No copy generated yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start by describing what kind of copy you need
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {[...generatedCopies, ...mockGeneratedCopies].map((copy) => {
                const TypeIcon = getTypeIcon(copy.type);
                const copyType = copyTypes.find(t => t.id === copy.type);
                const tone = tones.find(t => t.id === copy.tone);
                const audience = audiences.find(a => a.id === copy.audience);

                return (
                  <div key={copy.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {copyType?.name || copy.type}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              {tone?.emoji} {tone?.name}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              {audience?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyCopyToClipboard(copy.content)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Prompt:</strong> {copy.prompt}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {copy.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>
                        Generated {new Date(copy.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        <span>Ready to use</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyGeneration;
