import React, { useState } from 'react';
import { Layout, Palette, Eye, Save, Edit, Trash2, Code, BarChart3, Wand2, Type, Image, Square, Circle } from 'lucide-react';
// Import landing page element components
import { HeaderSection } from './landingPageElements/HeaderSection';
import { HeroSection } from './landingPageElements/HeroSection';
import { FeaturesSection } from './landingPageElements/FeaturesSection';
import { TestimonialsSection } from './landingPageElements/TestimonialsSection';
import { CTASection } from './landingPageElements/CTASection';
import { FooterSection } from './landingPageElements/FooterSection';

interface AILandingPageBuilderProps {}

interface LandingPage {
  id: string;
  name: string;
  description: string;
  template: string;
  isPublished: boolean;
  createdAt: string;
  visits: number;
  conversions: number;
  conversionRate: number;
  url: string;
}

// Add a type for page elements
interface PageElement {
  id: string;
  type: string;
  content: string;
}

const AILandingPageBuilder: React.FC<AILandingPageBuilderProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'templates' | 'analytics' | 'componentBuilder'>('overview');
  
  const [landingPages, setLandingPages] = useState<LandingPage[]>([
    {
      id: '1',
      name: 'Product Launch Page',
      description: 'AI-generated landing page for new product launch',
      template: 'modern-saas',
      isPublished: true,
      createdAt: '2024-01-15',
      visits: 1247,
      conversions: 89,
      conversionRate: 7.1,
      url: 'https://example.com/product-launch',
    },
    {
      id: '2',
      name: 'Lead Generation Page',
      description: 'High-converting page for lead capture',
      template: 'minimal-lead',
      isPublished: false,
      createdAt: '2024-01-18',
      visits: 0,
      conversions: 0,
      conversionRate: 0,
      url: 'https://example.com/lead-gen',
    },
  ]);

  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [pageElements, setPageElements] = useState<PageElement[]>([]);

  // State for AI-generated custom components
  interface CustomComponent {
    id: string;
    name: string;
    content: string;
  }
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  const [componentPrompt, setComponentPrompt] = useState('');

  // Add element type chooser for AI component builder
  const elementTypes = [
    { value: 'section', label: 'Section' },
    { value: 'card', label: 'Card' },
    { value: 'faq', label: 'FAQ' },
    { value: 'pricing', label: 'Pricing Table' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'custom', label: 'Custom' },
  ];
  const [selectedElementType, setSelectedElementType] = useState(elementTypes[0].value);

  const templates = [
    {
      id: 'modern-saas',
      name: 'Modern SaaS',
      description: 'Clean, professional design for SaaS products',
      preview: '/templates/modern-saas.jpg',
      elements: ['hero', 'features', 'pricing', 'testimonials', 'cta'],
    },
    {
      id: 'minimal-lead',
      name: 'Minimal Lead Gen',
      description: 'Simple, focused design for lead generation',
      preview: '/templates/minimal-lead.jpg',
      elements: ['hero', 'form', 'benefits', 'cta'],
    },
    {
      id: 'product-showcase',
      name: 'Product Showcase',
      description: 'Perfect for showcasing product features',
      preview: '/templates/product-showcase.jpg',
      elements: ['hero', 'features', 'gallery', 'testimonials', 'cta'],
    },
    {
      id: 'event-landing',
      name: 'Event Landing',
      description: 'Optimized for event registration',
      preview: '/templates/event-landing.jpg',
      elements: ['hero', 'agenda', 'speakers', 'registration', 'cta'],
    },
  ];

  // Simulate AI content for each element type
  const aiElementContent = (type: string, prompt: string) => {
    switch (type) {
      case 'hero':
        return `Welcome to your modern landing page! ${prompt}`;
      case 'features':
        return '• Fast and reliable\n• Modern design\n• Easy integration';
      case 'cta':
        return 'Get Started Now!';
      case 'gallery':
        return 'Gallery of product images.';
      case 'testimonials':
        return '“This product changed my business!” – Happy Customer';
      case 'form':
        return 'Contact us form section.';
      case 'header':
        return 'Your Company Name';
      case 'footer':
        return '© 2025 Your Company. All rights reserved.';
      default:
        return `${type} section`;
    }
  };

  const generateWithAI = async () => {
    // Modern SaaS template structure
    const modernElements = [
      'header',
      'hero',
      'features',
      'testimonials',
      'cta',
      'footer',
    ];
    const newElements = modernElements.map((type, idx) => ({
      id: `${Date.now()}-${idx}`,
      type,
      content: aiElementContent(type, aiPrompt),
    }));
    const newPage: LandingPage = {
      id: Date.now().toString(),
      name: 'AI Generated Page',
      description: `Generated from: "${aiPrompt}"`,
      template: 'modern-saas',
      isPublished: false,
      createdAt: new Date().toISOString().split('T')[0],
      visits: 0,
      conversions: 0,
      conversionRate: 0,
      url: `https://example.com/ai-generated-${Date.now()}`,
    };
    setLandingPages([...landingPages, newPage]);
    setSelectedPage(newPage);
    setPageElements(newElements);
    setIsEditing(true);
    setActiveTab('builder');
    setAiPrompt('');
  };

  // Simulate AI generation of a custom component
  const generateCustomComponent = () => {
    const newComponent: CustomComponent = {
      id: Date.now().toString(),
      name: `Custom Component ${customComponents.length + 1}`,
      content: `AI-generated component: ${componentPrompt}`,
    };
    setCustomComponents([...customComponents, newComponent]);
    setComponentPrompt('');
  };

  // When a page is selected for editing, load its elements (mock for now)
  React.useEffect(() => {
    if (selectedPage) {
      // In a real app, fetch elements from backend or page data
      setPageElements([
        { id: '1', type: 'hero', content: 'Hero Section' },
        { id: '2', type: 'features', content: 'Features Section' },
      ]);
    } else {
      setPageElements([]);
    }
  }, [selectedPage]);

  // Add element to builder
  const addElement = (type: string) => {
    setPageElements([
      ...pageElements,
      { id: Date.now().toString(), type, content: `${type.charAt(0).toUpperCase() + type.slice(1)} Section` },
    ]);
  };

  // Remove element
  const removeElement = (id: string) => {
    setPageElements(pageElements.filter(e => e.id !== id));
  };

  // Edit element content
  const editElementContent = (id: string, content: string) => {
    setPageElements(pageElements.map(e => e.id === id ? { ...e, content } : e));
  };

  // Save changes to landing page
  const savePage = () => {
    if (!selectedPage) return;
    setLandingPages(landingPages.map(page =>
      page.id === selectedPage.id ? { ...page, /* add elements to page if needed */ } : page
    ));
    setIsEditing(false);
    setActiveTab('overview');
  };

  // Inline editing helpers
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Update parsedElements to support inline editing
  const handleElementClick = (elId: string, type: string, value: string) => {
    setEditingElementId(elId);
    setEditingValue(value);
  };
  const handleEditSave = (elId: string, type: string) => {
    setParsedElements(parsedElements.map(e => {
      if (e.id !== elId) return e;
      let html = e.html;
      if (type === 'text') {
        // Replace first text node in html
        html = html.replace(/>[^<]+</, '>' + editingValue + '<');
      } else if (type === 'img') {
        html = html.replace(/src="[^"]*"/, 'src="' + editingValue + '"');
      } else if (type === 'video') {
        html = html.replace(/src="[^"]*"/, 'src="' + editingValue + '"');
      }
      return { ...e, html };
    }));
    setEditingElementId(null);
    setEditingValue('');
  };

  // Download HTML
  const downloadHtml = () => {
    const html = parsedElements.map(e => e.html).join('\n');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (templateName || 'landing') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Publish (stub)
  const publishLanding = () => {
    alert('Landing page published! (stub)');
  };

  // Preview toggle
  const [showPreview, setShowPreview] = useState(true);

  // In renderComponentBuilder, update parsedElements preview to allow inline editing
  const renderComponentBuilder = () => (
    <div className="space-y-8">
      {/* AI Component Generator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Component Builder</h3>
        <div className="flex gap-4 mb-4">
          <select
            value={selectedElementType}
            onChange={e => setSelectedElementType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {elementTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <input
            value={componentPrompt}
            onChange={e => setComponentPrompt(e.target.value)}
            placeholder="Describe the component you want to create"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={generateCustomComponent}
            disabled={!componentPrompt.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium whitespace-nowrap"
          >
            Generate Component
          </button>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Components</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customComponents.map(comp => (
              <div key={comp.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 relative">
                <input
                  className="font-bold mb-2 bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white w-full"
                  value={comp.name}
                  onChange={e => renameComponent(comp.id, e.target.value)}
                />
                <div className="text-gray-700 dark:text-gray-200 mb-2">{comp.content}</div>
                <div className="border rounded p-2 mt-1 bg-white dark:bg-gray-900">
                  {/* Live preview for generated component (if HTML) */}
                  <div dangerouslySetInnerHTML={{ __html: comp.content }} />
                </div>
                <button className="absolute top-2 right-2 text-red-600" onClick={() => deleteComponent(comp.id)}>
                  Delete
                </button>
              </div>
            ))}
            {customComponents.length === 0 && (
              <div className="text-gray-400">No components yet. Generate one above!</div>
            )}
          </div>
        </div>
      </div>
      {/* HTML/CSS Paste & Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Import HTML & CSS as Template</h3>
        <input
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          placeholder="Template Name"
          className="mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <textarea
          value={htmlInput}
          onChange={e => setHtmlInput(e.target.value)}
          placeholder="Paste HTML here"
          rows={4}
          className="mb-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <textarea
          value={cssInput}
          onChange={e => setCssInput(e.target.value)}
          placeholder="Paste CSS here"
          rows={2}
          className="mb-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <div className="flex gap-2 mb-2">
          <button onClick={parseHtmlCss} className="px-4 py-2 bg-blue-600 text-white rounded-md">Breakdown</button>
          <button onClick={saveTemplateFromParsed} disabled={parsedElements.length === 0 || !templateName.trim()} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400">Save as Template</button>
          <button onClick={convertParsedToReact} disabled={parsedElements.length === 0 || !templateName.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400">Convert to React Components</button>
        </div>
        {parsedElements.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-2 mb-2">
              <button onClick={() => setShowPreview(true)} className={`px-4 py-2 rounded-md ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Preview</button>
              <button onClick={() => setShowPreview(false)} className={`px-4 py-2 rounded-md ${!showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Edit</button>
              <button onClick={publishLanding} className="px-4 py-2 bg-green-600 text-white rounded-md">Publish</button>
              <button onClick={downloadHtml} className="px-4 py-2 bg-purple-600 text-white rounded-md">Download</button>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Landing Page {showPreview ? 'Preview' : 'Editor'}</h4>
            <ul className="list-disc ml-6">
              {parsedElements.map(e => (
                <li key={e.id} className="mb-4">
                  <span className="font-bold">{e.name}:</span>
                  <div className="border rounded p-2 mt-1 bg-white dark:bg-gray-900">
                    {showPreview ? (
                      <div dangerouslySetInnerHTML={{ __html: e.html + '<style>' + e.css + '</style>' }} />
                    ) : (
                      <EditableHtml
                        html={e.html}
                        css={e.css}
                        elId={e.id}
                        editingElementId={editingElementId}
                        editingValue={editingValue}
                        onElementClick={handleElementClick}
                        onEditSave={handleEditSave}
                        setEditingValue={setEditingValue}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Layout className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {landingPages.length}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Total Pages</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {landingPages.reduce((total, page) => total + page.visits, 0)}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Total Visits</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {landingPages.reduce((total, page) => total + page.conversions, 0)}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Total Conversions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Wand2 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {landingPages.filter(p => p.isPublished).length}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Published Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generation Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Wand2 className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Landing Page Generator</h3>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the landing page you want to create... (e.g., 'Create a landing page for a fitness app targeting young professionals with a modern, energetic design')"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={generateWithAI}
            disabled={!aiPrompt.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium whitespace-nowrap"
          >
            Generate with AI
          </button>
        </div>
      </div>

      {/* Landing Pages List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Landing Pages</h3>
            <button
              onClick={() => setActiveTab('templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create from Template
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Page Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {landingPages.map((page) => (
                <tr key={page.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Layout className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{page.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{page.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      page.isPublished 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {page.visits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {page.conversionRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedPage(page);
                        setIsEditing(true);
                        setActiveTab('builder');
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      <Code className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Helper to render the correct element component
  const renderElementComponent = (el: PageElement) => {
    switch (el.type) {
      case 'header':
        return <HeaderSection content={el.content} />;
      case 'hero':
        return <HeroSection content={el.content} />;
      case 'features':
        return <FeaturesSection content={el.content} />;
      case 'testimonials':
        return <TestimonialsSection content={el.content} />;
      case 'cta':
        return <CTASection content={el.content} />;
      case 'footer':
        return <FooterSection content={el.content} />;
      default:
        return <div className="p-4 bg-gray-100 rounded">{el.content}</div>;
    }
  };

  const renderBuilder = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Page Builder */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedPage ? `Editing: ${selectedPage.name}` : 'Page Builder'}
            </h3>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                onClick={savePage}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
          {/* Render each element as a component */}
          <div className="space-y-4">
            {pageElements.map((el) => (
              <div key={el.id} className="relative group">
                {renderElementComponent(el)}
                <button className="absolute top-2 right-2 text-red-600 opacity-0 group-hover:opacity-100 transition" onClick={() => removeElement(el.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {pageElements.length === 0 && (
              <div className="text-gray-400 text-center">No elements yet. Add from the right panel.</div>
            )}
          </div>
        </div>
      </div>

      {/* Elements Panel */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Page Elements</h4>
          <div className="space-y-2">
            {[
              { icon: Type, label: 'Header', type: 'header' },
              { icon: Square, label: 'Hero Section', type: 'hero' },
              { icon: Layout, label: 'Features', type: 'features' },
              { icon: Circle, label: 'Call to Action', type: 'cta' },
              { icon: Image, label: 'Gallery', type: 'gallery' },
              { icon: Edit, label: 'Testimonials', type: 'testimonials' },
              { icon: Square, label: 'Form', type: 'form' },
              { icon: Layout, label: 'Footer', type: 'footer' },
            ].map(({ icon: Icon, label, type }) => (
              <button
                key={type}
                className="w-full flex items-center p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => addElement(type)}
              >
                <Icon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900 dark:text-white">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Choose a Template</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Layout className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{template.description}</p>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                    Use Template
                  </button>
                  <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Landing Page Analytics</h3>
        <p className="text-gray-600 dark:text-gray-400">Detailed analytics dashboard coming soon...</p>
      </div>
    </div>
  );

  // Management for editing/renaming/deleting components
  const renameComponent = (id: string, newName: string) => {
    setCustomComponents(customComponents.map(c => c.id === id ? { ...c, name: newName } : c));
  };
  const deleteComponent = (id: string) => {
    setCustomComponents(customComponents.filter(c => c.id !== id));
  };

  // HTML/CSS paste and breakdown
  const [htmlInput, setHtmlInput] = useState('');
  const [cssInput, setCssInput] = useState('');
  const [parsedElements, setParsedElements] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');

  const parseHtmlCss = () => {
    // Smarter breakdown: split by semantic tags and major blocks, and try to label header/hero/features
    const sectionTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'form', 'div'];
    const regex = new RegExp(`<(${sectionTags.join('|')})[^>]*>([\s\S]*?)<\/\\1>`, 'gi');
    const matches = [...htmlInput.matchAll(regex)];
    let elements = matches.map((m, i) => {
      const tag = m[1];
      const attrs = m[0].match(/(id|class)="([^"]+)"/);
      let name = tag.charAt(0).toUpperCase() + tag.slice(1);
      if (attrs && attrs[2]) {
        const attrVal = attrs[2].toLowerCase();
        if (attrVal.includes('hero')) name = 'Hero';
        else if (attrVal.includes('features')) name = 'Features';
        else if (attrVal.includes('header')) name = 'Header';
        else name += ' - ' + attrs[2].split(' ')[0];
      } else if (tag === 'header') {
        name = 'Header';
      }
      return {
        id: `${Date.now()}-${i}`,
        name,
        html: m[0],
        css: cssInput,
      };
    });
    // Fallback: if nothing found, treat whole HTML as one element
    if (elements.length === 0 && htmlInput.trim()) {
      elements = [{
        id: `${Date.now()}-0`,
        name: 'Full HTML',
        html: htmlInput,
        css: cssInput,
      }];
    }
    setParsedElements(elements);
  };
  const saveTemplateFromParsed = () => {
    // Save as a new custom component template
    setCustomComponents([
      ...customComponents,
      ...parsedElements.map(e => ({ id: e.id, name: `${templateName} - ${e.name}`, content: e.html + '\n<style>' + e.css + '</style>' })),
    ]);
    setHtmlInput('');
    setCssInput('');
    setParsedElements([]);
    setTemplateName('');
  };

  // Convert parsed elements to React components and save as files
  const convertParsedToReact = async () => {
    for (const el of parsedElements) {
      const compName = (templateName + '_' + el.name).replace(/\W+/g, '') + 'Component';
      const reactCode = `import React from 'react';\n\nexport const ${compName} = () => (\n  <>\n    {/* Converted from HTML/CSS */}\n    <style>{\`${el.css}\`}</style>\n    ${el.html}\n  </>\n);\n`;
      // Save as a new file in landingPageElements
      await window.copilot.create_file({
        filePath: `z:/geminiCliApps/adaptive-saas-crm3/components/landingPageElements/${compName}.tsx`,
        content: reactCode,
      });
    }
    setParsedElements([]);
    setTemplateName('');
  };

  // EditableHtml component (inline, at bottom of file)
  const EditableHtml = ({ html, css, elId, editingElementId, editingValue, onElementClick, onEditSave, setEditingValue }: any) => {
    // Parse html string and render with inline editing for text, img, video
    // For demo, only handle first text, img, video node
    const textMatch = html.match(/>([^<]+)</);
    const imgMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*>/);
    const videoMatch = html.match(/<video[^>]*src="([^"]*)"[^>]*>/);
    return (
      <div>
        <style>{css}</style>
        {textMatch && (
          editingElementId === elId && (
            <input
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              onBlur={() => onEditSave(elId, 'text')}
              className="border px-2 py-1 rounded w-full mb-2"
              autoFocus
            />
          )
        )}
        {imgMatch && (
          editingElementId === elId && (
            <input
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              onBlur={() => onEditSave(elId, 'img')}
              className="border px-2 py-1 rounded w-full mb-2"
              autoFocus
            />
          )
        )}
        {videoMatch && (
          editingElementId === elId && (
            <input
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              onBlur={() => onEditSave(elId, 'video')}
              className="border px-2 py-1 rounded w-full mb-2"
              autoFocus
            />
          )
        )}
        {/* Render HTML with click handlers for editing */}
        <div
          onClick={() => {
            if (textMatch) onElementClick(elId, 'text', textMatch[1]);
            else if (imgMatch) onElementClick(elId, 'img', imgMatch[1]);
            else if (videoMatch) onElementClick(elId, 'video', videoMatch[1]);
          }}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ cursor: 'pointer' }}
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Wand2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Landing Page Builder</h1>
              <p className="text-gray-600 dark:text-gray-400">Create high-converting landing pages with AI assistance</p>
            </div>
          </div>
          
          {selectedPage && isEditing && (
            <button
              onClick={() => {
                setSelectedPage(null);
                setIsEditing(false);
                setActiveTab('overview');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back to Overview
            </button>
          )}
        </div>
        
        {/* Tab Navigation */}
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'Overview', icon: Layout },
            { key: 'builder', label: 'Page Builder', icon: Edit },
            { key: 'templates', label: 'Templates', icon: Palette },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            { key: 'componentBuilder', label: 'Component Builder', icon: Wand2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'builder' && renderBuilder()}
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'componentBuilder' && renderComponentBuilder()}
    </div>
  );
};

export default AILandingPageBuilder;
