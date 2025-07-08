import React, { useState } from 'react';
import { 
  Video, 
  Download, 
  RefreshCw, 
  Wand2,
  Clock,
  Monitor,
  Play,
  Zap,
  Settings,
  FileVideo,
  Pause,
  Volume2
} from 'lucide-react';

interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail: string;
  prompt: string;
  duration: number;
  resolution: string;
  style: string;
  createdAt: string;
  status: 'processing' | 'ready' | 'failed';
}

const VideoGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('15');
  const [selectedResolution, setSelectedResolution] = useState('1080p');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const durations = [
    { id: '5', name: '5 seconds', cost: 2 },
    { id: '15', name: '15 seconds', cost: 5 },
    { id: '30', name: '30 seconds', cost: 10 },
    { id: '60', name: '1 minute', cost: 20 },
  ];

  const resolutions = [
    { id: '720p', name: '720p (HD)', dimensions: '1280x720' },
    { id: '1080p', name: '1080p (Full HD)', dimensions: '1920x1080' },
    { id: '4k', name: '4K (Ultra HD)', dimensions: '3840x2160' },
  ];

  const styles = [
    { id: 'realistic', name: 'Realistic', icon: '📹' },
    { id: 'animated', name: 'Animated', icon: '🎬' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎭' },
    { id: 'documentary', name: 'Documentary', icon: '📺' },
    { id: 'commercial', name: 'Commercial', icon: '📢' },
    { id: 'artistic', name: 'Artistic', icon: '🎨' },
  ];

  const mockGeneratedVideos: GeneratedVideo[] = [
    {
      id: '1',
      url: '#',
      thumbnail: '/api/placeholder/400/225',
      prompt: 'A modern office environment with people working on computers',
      duration: 15,
      resolution: '1080p',
      style: 'realistic',
      createdAt: '2024-07-04 14:30:00',
      status: 'ready'
    },
    {
      id: '2',
      url: '#',
      thumbnail: '/api/placeholder/400/225',
      prompt: 'Abstract geometric shapes moving in sync with upbeat music',
      duration: 30,
      resolution: '1080p',
      style: 'animated',
      createdAt: '2024-07-04 14:25:00',
      status: 'processing'
    },
    {
      id: '3',
      url: '#',
      thumbnail: '/api/placeholder/400/225',
      prompt: 'Product showcase for a new smartphone with dramatic lighting',
      duration: 15,
      resolution: '4k',
      style: 'commercial',
      createdAt: '2024-07-04 14:20:00',
      status: 'ready'
    }
  ];

  const generateVideo = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: '#',
        thumbnail: '/api/placeholder/400/225',
        prompt,
        duration: parseInt(selectedDuration),
        resolution: selectedResolution,
        style: selectedStyle,
        createdAt: new Date().toISOString(),
        status: 'processing'
      };
      
      setGeneratedVideos([newVideo, ...generatedVideos]);
      setIsGenerating(false);
      
      // Simulate processing completion
      setTimeout(() => {
        setGeneratedVideos(prev => prev.map(v => 
          v.id === newVideo.id ? { ...v, status: 'ready' } : v
        ));
      }, 10000);
    }, 3000);
  };

  const downloadVideo = (url: string) => {
    // Implementation for downloading the video
    console.log('Downloading video:', url);
  };

  const toggleVideoPlay = (videoId: string) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId);
  };

  const getStatusBadge = (status: GeneratedVideo['status']) => {
    const styles = {
      processing: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      ready: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      failed: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCostForDuration = (duration: string) => {
    const durationOption = durations.find(d => d.id === duration);
    return durationOption ? durationOption.cost : 0;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Video Generation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create professional videos with AI-powered generation tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary-600" />
              Generate Video
            </h2>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your video
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A professional product demonstration showing key features..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Clock className="inline h-4 w-4 mr-1" />
                Video Duration
              </label>
              <div className="space-y-2">
                {durations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`w-full p-3 text-sm rounded-lg border-2 transition-all flex items-center justify-between ${
                      selectedDuration === duration.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="font-medium">{duration.name}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {duration.cost} credits
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Monitor className="inline h-4 w-4 mr-1" />
                Resolution
              </label>
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {resolutions.map((resolution) => (
                  <option key={resolution.id} value={resolution.id}>
                    {resolution.name} - {resolution.dimensions}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Settings className="inline h-4 w-4 mr-1" />
                Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 text-sm rounded-lg border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{style.icon}</div>
                    <div className="font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVideo}
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
                  Generate Video ({getCostForDuration(selectedDuration)} credits)
                </>
              )}
            </button>

            {/* Credits Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Credits Remaining:</strong> 35/100
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Video generation costs vary by duration
              </div>
            </div>
          </div>
        </div>

        {/* Generated Videos Gallery */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Generated Videos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your recently generated videos will appear here
            </p>
          </div>

          {generatedVideos.length === 0 && mockGeneratedVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No videos generated yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start by describing the video you want to create
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...generatedVideos, ...mockGeneratedVideos].map((video) => (
                <div key={video.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                    {/* Video Thumbnail */}
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center">
                      <div className="text-center">
                        <Video className="h-12 w-12 text-primary-400 mx-auto mb-2" />
                        <div className="text-sm text-primary-600 dark:text-primary-400">
                          {video.resolution} • {video.duration}s
                        </div>
                      </div>
                    </div>
                    
                    {/* Play Button Overlay */}
                    {video.status === 'ready' && (
                      <button
                        onClick={() => toggleVideoPlay(video.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                      >
                        <div className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors">
                          {playingVideo === video.id ? (
                            <Pause className="h-6 w-6 text-gray-800" />
                          ) : (
                            <Play className="h-6 w-6 text-gray-800 ml-1" />
                          )}
                        </div>
                      </button>
                    )}
                    
                    {/* Processing Overlay */}
                    {video.status === 'processing' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center text-white">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <div className="text-sm">Processing...</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(video.status)}
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            {styles.find(s => s.id === video.style)?.name || video.style}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-gray-400" />
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{video.duration}s</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {video.prompt}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {video.status === 'ready' && (
                          <button
                            onClick={() => downloadVideo(video.url)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Download video"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Video details"
                        >
                          <FileVideo className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGeneration;
