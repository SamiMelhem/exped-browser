import { Search, HelpCircle, MessageSquare, ArrowLeft, ArrowRight, RotateCw, Plus, X, Edit, Trash2, Send, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { init as initEmailJS, send as sendEmail } from '@emailjs/browser';
import { searchGoogle, type SearchResult } from '@/lib/google-search';
import { SearchResults } from '@/components/search-results';

// Initialize EmailJS with your public key
initEmailJS('8rKt3GBNLxfV2nP4k');

// Define trusted domains that should open directly in a new tab
const trustedDomains = [
  'google.com',
  'www.google.com',
  'chat.openai.com',
  'mail.google.com',
  'github.com',
  'www.github.com',
  'notion.so',
  'www.notion.so',
  'linkedin.com',
  'www.linkedin.com',
  'youtube.com',
  'www.youtube.com',
  'reddit.com',
  'www.reddit.com'
];

// Default links with correct URLs and behaviors
const defaultLinks = [
  { 
    id: '1', 
    name: 'Google', 
    url: 'https://www.google.com', 
    icon: 'https://www.google.com/favicon.ico',
    directOpen: true 
  },
  { 
    id: '2', 
    name: 'Gmail', 
    url: 'https://mail.google.com', 
    icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
    directOpen: true 
  },
  { 
    id: '3', 
    name: 'YouTube', 
    url: 'https://www.youtube.com', 
    icon: 'https://www.youtube.com/favicon.ico',
    directOpen: true 
  },
  { 
    id: '4', 
    name: 'GitHub', 
    url: 'https://github.com', 
    icon: 'https://github.com/favicon.ico',
    directOpen: true 
  },
  { 
    id: '5', 
    name: 'Notion', 
    url: 'https://www.notion.so', 
    icon: 'https://www.notion.so/images/favicon.ico',
    directOpen: true 
  },
  { 
    id: '6', 
    name: 'LinkedIn', 
    url: 'https://www.linkedin.com', 
    icon: 'https://www.linkedin.com/favicon.ico',
    directOpen: true 
  },
  { 
    id: '7', 
    name: 'ChatGPT', 
    url: 'https://chat.openai.com', 
    icon: 'https://chat.openai.com/favicon.ico',
    directOpen: true 
  },
  { 
    id: '8', 
    name: 'Reddit', 
    url: 'https://www.reddit.com', 
    icon: 'https://www.reddit.com/favicon.ico',
    directOpen: true 
  }
];

interface AppLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  directOpen?: boolean;
}

interface TabHistory {
  past: string[];
  future: string[];
  current: string;
}

interface Tab {
  id: string;
  title: string;
  icon: string;
  url: string;
  content?: React.ReactNode;
  history: TabHistory;
}

function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      title: 'New Tab',
      icon: '/icon.svg',
      url: '',
      content: null,
      history: {
        past: [],
        future: [],
        current: ''
      }
    }
  ]);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [searchInput, setSearchInput] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState<Partial<AppLink>>({});
  const [editingLink, setEditingLink] = useState<AppLink | null>(null);
  const [links, setLinks] = useState<AppLink[]>(() => {
    const saved = localStorage.getItem('appLinks');
    return saved ? JSON.parse(saved) : defaultLinks;
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const feedbackInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('appLinks', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return;

    try {
      const url = new URL(newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`);
      const icon = newLink.icon || `${url.origin}/favicon.ico`;
      
      if (editingLink) {
        setLinks(links.map(link => 
          link.id === editingLink.id 
            ? { ...newLink, id: editingLink.id, icon, url: url.toString() } as AppLink
            : link
        ));
      } else {
        setLinks([...links, { 
          id: Math.random().toString(36).substr(2, 9),
          name: newLink.name,
          icon,
          url: url.toString()
        }]);
      }
      
      setNewLink({});
      setEditingLink(null);
      setShowAddLink(false);
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  const handleEditLink = (link: AppLink) => {
    setEditingLink(link);
    setNewLink(link);
    setShowAddLink(true);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSendingFeedback(true);

    try {
      const response = await sendEmail(
        'service_affaobj',  // Your EmailJS service ID
        'template_ktrivu7', // Your EmailJS template ID
        {
          from_name: feedbackName.trim() || 'Anonymous User',
          message: feedbackMessage.trim(),
          to_email: 'SaMiLMelhem23@gmail.com',
          reply_to: 'noreply@exped.browser'
        }
      );

      if (response.status === 200) {
        toast.success('Feedback sent successfully!');
        setFeedbackName('');
        setFeedbackMessage('');
        setShowFeedback(false);
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const addNewTab = () => {
    const newTab = {
      id: Math.random().toString(),
      title: 'New Tab',
      icon: '/icon.svg',
      url: '',
      content: null,
      history: {
        past: [],
        future: [],
        current: ''
      }
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      return;
    }

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTab === tabId) {
      const index = tabs.findIndex(tab => tab.id === tabId);
      const newActiveTab = newTabs[Math.max(0, index - 1)];
      setActiveTab(newActiveTab.id);
    }
  };

  const updateTabHistory = (tabId: string, newUrl: string) => {
    setTabs(prevTabs => prevTabs.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          history: {
            past: [...tab.history.past, tab.history.current].filter(Boolean),
            future: [],
            current: newUrl
          }
        };
      }
      return tab;
    }));
  };

  const shouldOpenDirectly = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return trustedDomains.some(domain => urlObj.hostname.endsWith(domain));
    } catch {
      return false;
    }
  };

  const createTabContent = (url: string, tabId: string) => {
    const link = links.find(link => link.url === url);
    
    return {
      url,
      title: link?.name || new URL(url).hostname,
      icon: link?.icon || `${new URL(url).origin}/favicon.ico`,
      content: (
        <div className="w-full h-full">
          <iframe
            ref={el => iframeRefs.current[tabId] = el}
            src={url}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title={link?.name || new URL(url).hostname}
          />
        </div>
      )
    };
  };

  const navigateToUrl = (url: string, tabId: string) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(fullUrl); // Validate URL

      setTabs(tabs.map(tab => {
        if (tab.id === tabId) {
          const newTab = {
            ...tab,
            ...createTabContent(fullUrl, tabId)
          };
          updateTabHistory(tabId, fullUrl);
          return newTab;
        }
        return tab;
      }));
    } catch (error) {
      console.error('Invalid URL:', url);
      toast.error('Please enter a valid URL');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput) return;

    setIsSearching(true);
    try {
      if (searchInput.match(/^https?:\/\//i) || (searchInput.includes('.') && !searchInput.includes(' '))) {
        const url = searchInput.startsWith('http') ? searchInput : `https://${searchInput}`;
        navigateToUrl(url, activeTab);
        setSearchInput('');
        setShowSearch(false);
      } else {
        const results = await searchGoogle(searchInput);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, link: AppLink) => {
    e.preventDefault();
    navigateToUrl(link.url, activeTab);
  };

  const goBack = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab || tab.history.past.length === 0) return;

    const lastUrl = tab.history.past[tab.history.past.length - 1];
    setTabs(prevTabs => prevTabs.map(t => {
      if (t.id === activeTab) {
        return {
          ...t,
          ...createTabContent(lastUrl, activeTab),
          history: {
            past: t.history.past.slice(0, -1),
            future: [t.history.current, ...t.history.future],
            current: lastUrl
          }
        };
      }
      return t;
    }));
  };

  const goForward = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab || tab.history.future.length === 0) return;

    const nextUrl = tab.history.future[0];
    setTabs(prevTabs => prevTabs.map(t => {
      if (t.id === activeTab) {
        return {
          ...t,
          ...createTabContent(nextUrl, activeTab),
          history: {
            past: [...t.history.past, t.history.current],
            future: t.history.future.slice(1),
            current: nextUrl
          }
        };
      }
      return t;
    }));
  };

  const reload = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (tab?.url) {
      navigateToUrl(tab.url, activeTab);
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const canGoBack = activeTabData ? activeTabData.history.past.length > 0 : false;
  const canGoForward = activeTabData ? activeTabData.history.future.length > 0 : false;

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      <header className="border-b bg-white shrink-0">
        <div className="flex items-center h-14 px-4 gap-4">
          <div className="flex items-center gap-1">
            <button 
              className={cn(
                "p-2 rounded-full transition-colors",
                canGoBack 
                  ? "hover:bg-gray-100 text-gray-600" 
                  : "text-gray-300 cursor-not-allowed"
              )}
              onClick={goBack}
              disabled={!canGoBack}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button 
              className={cn(
                "p-2 rounded-full transition-colors",
                canGoForward 
                  ? "hover:bg-gray-100 text-gray-600" 
                  : "text-gray-300 cursor-not-allowed"
              )}
              onClick={goForward}
              disabled={!canGoForward}
              aria-label="Go forward"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600" 
              onClick={reload}
              aria-label="Reload"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-1 min-w-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors group relative min-w-[140px] max-w-[200px] cursor-pointer",
                  activeTab === tab.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
                tabIndex={0}
              >
                <img src={tab.icon} alt="" className="w-4 h-4 shrink-0" />
                <span className="text-sm text-gray-600 truncate">{tab.title}</span>
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full p-1"
                  aria-label={`Close ${tab.title}`}
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            ))}
            <button
              onClick={addNewTab}
              className="p-2 hover:bg-gray-100 rounded-lg shrink-0"
              aria-label="New Tab"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowFeedback(true)}
              className="flex items-center px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-full text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </button>
            <button className="flex items-center px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-full text-sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeTabData?.content ? (
          <div className="w-full h-full">
            {activeTabData.content}
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
            <div className="w-full px-4 py-12">
              <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="flex justify-center mb-8">
                    <img src="/icon.svg" alt="Exped" className="w-16 h-16" />
                  </div>
                  
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input 
                      type="text"
                      placeholder="Search anything or enter a url"
                      className="w-full pl-10 h-12 text-lg"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </form>

                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="w-full">
                      <SearchResults 
                        results={searchResults} 
                        onResultClick={(url) => {
                          navigateToUrl(url, activeTab);
                          setSearchInput('');
                          setSearchResults([]);
                        }} 
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="w-full px-4 pb-12">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="group relative"
                      >
                        <a
                          href={link.url}
                          onClick={(e) => handleLinkClick(e, link)}
                          className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200">
                            <img src={link.icon} alt={link.name} className="w-8 h-8" />
                          </div>
                          <span className="text-xs text-center text-gray-600">{link.name}</span>
                        </a>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                          <button
                            onClick={() => handleEditLink(link)}
                            className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-50"
                            aria-label={`Edit ${link.name}`}
                          >
                            <Edit className="h-3 w-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-50"
                            aria-label={`Delete ${link.name}`}
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <Dialog open={showAddLink} onOpenChange={setShowAddLink}>
                      <DialogTrigger asChild>
                        <button className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200">
                            <Plus className="w-6 h-6 text-gray-600" />
                          </div>
                          <span className="text-xs text-center text-gray-600">Add Link</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                              Name
                            </label>
                            <Input
                              id="name"
                              value={newLink.name || ''}
                              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                              placeholder="e.g., Google"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="url" className="text-sm font-medium">
                              URL
                            </label>
                            <Input
                              id="url"
                              value={newLink.url || ''}
                              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                              placeholder="e.g., https://google.com"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="icon" className="text-sm font-medium">
                              Icon URL (optional)
                            </label>
                            <Input
                              id="icon"
                              value={newLink.icon || ''}
                              onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                              placeholder="e.g., https://example.com/icon.png"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleAddLink}>
                            {editingLink ? 'Save Changes' : 'Add Link'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Search Overlay */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
          onClick={() => {
            setShowSearch(false);
            setSearchResults([]);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-12 pr-4 h-14 text-lg rounded-lg"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </form>
            </div>
            
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[60vh] overflow-hidden">
                <SearchResults 
                  results={searchResults} 
                  onResultClick={(url) => {
                    navigateToUrl(url, activeTab);
                    setSearchInput('');
                    setShowSearch(false);
                    setSearchResults([]);
                  }} 
                />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      {showFeedback && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
          onClick={() => setShowFeedback(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold">Send Feedback</h2>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  ref={feedbackInputRef}
                  placeholder="Tell us about your experience with Exped Browser..."
                  className="h-32"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={isSendingFeedback}
                >
                  {isSendingFeedback ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;