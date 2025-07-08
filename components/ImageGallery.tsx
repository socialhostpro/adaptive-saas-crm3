import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Download, 
  Trash2, 
  Heart, 
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Tag,
  Star,
  Eye
} from 'lucide-react';

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

const LOCAL_STORAGE_KEY = 'ai_image_library';

const ImageGallery: React.FC = () => {
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);

  const styles = [
    { id: 'all', name: 'All Styles' },
    { id: 'professional', name: 'Professional' },
    { id: 'modern', name: 'Modern' },
    { id: 'bold', name: 'Bold' },
    { id: 'clean', name: 'Clean' },
    { id: 'luxury', name: 'Luxury' },
    { id: 'corporate', name: 'Corporate' },
  ];

  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsedImages = JSON.parse(saved) as SavedImage[];
        setSavedImages(parsedImages);
      }
    } catch (error) {
      console.error('Error loading saved images:', error);
    }
  };

  const saveSavedImages = (images: SavedImage[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving images:', error);
    }
  };

  const toggleFavorite = (imageId: string) => {
    const updatedImages = savedImages.map(img =>
      img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
    );
    setSavedImages(updatedImages);
    saveSavedImages(updatedImages);
  };

  const deleteImage = (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image from your library?')) {
      const updatedImages = savedImages.filter(img => img.id !== imageId);
      setSavedImages(updatedImages);
      saveSavedImages(updatedImages);
    }
  };

  const downloadImage = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredImages = savedImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'favorites' && image.isFavorite) ||
                         (selectedFilter === 'recent' && new Date(image.savedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesStyle = selectedStyle === 'all' || image.style === selectedStyle;
    
    return matchesSearch && matchesFilter && matchesStyle;
  });

  const sortedImages = [...filteredImages].sort((a, b) => 
    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Image Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your permanent collection of AI-generated business advertisements
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search images by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Filter by type */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'favorites' | 'recent')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Images</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent (7 days)</option>
            </select>
          </div>

          {/* Filter by style */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              {styles.map(style => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {sortedImages.length} image{sortedImages.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Images Grid/List */}
      {sortedImages.length === 0 ? (
        <div className="text-center py-12">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No images in your library yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate some images and save them to your library to see them here
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {sortedImages.map((image) => (
            <div key={image.id} className={
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'
                : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex gap-4 p-4 hover:shadow-xl transition-shadow'
            }>
              <div className={
                viewMode === 'grid'
                  ? 'aspect-square bg-gray-100 dark:bg-gray-700 relative group'
                  : 'w-32 h-32 bg-gray-100 dark:bg-gray-700 relative group rounded-lg overflow-hidden flex-shrink-0'
              }>
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => downloadImage(image.url, image.title)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(image.id)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    >
                      {image.isFavorite ? (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      ) : (
                        <Heart className="h-4 w-4 text-gray-700" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {image.title}
                  </h3>
                  {image.isFavorite && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {image.description}
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
                    {image.style}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {image.aspectRatio}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(image.savedAt).toLocaleDateString()}
                  </span>
                  {viewMode === 'list' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedImage(image)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => downloadImage(image.url, image.title)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(image.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {image.isFavorite ? (
                          <Heart className="h-3 w-3 text-red-500 fill-current" />
                        ) : (
                          <Heart className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedImage.title}
                </h2>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full max-w-md mx-auto rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedImage.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Original Prompt</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedImage.prompt}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>Style: {selectedImage.style}</span>
                  <span>Aspect Ratio: {selectedImage.aspectRatio}</span>
                  <span>Saved: {new Date(selectedImage.savedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadImage(selectedImage.url, selectedImage.title)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedImage.id)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {selectedImage.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
