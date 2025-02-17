import { Search, HelpCircle, MessageSquare, ArrowLeft, ArrowRight, RotateCw, Plus, X, Edit, Trash2, Send, Command, Keyboard } from 'lucide-react';
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
import { ThemeToggle } from '@/components/theme-toggle';

// Initialize EmailJS with your public key
initEmailJS('8rKt3GBNLxfV2nP4k');

const keyboardShortcuts = [
  { description: 'Quick Search', key: '⌘ K', windows: 'Ctrl K' },
  { description: 'New Tab', key: '⌘ T', windows: 'Ctrl T' },
  { description: 'Close Tab', key: '⌘ W', windows: 'Ctrl W' },
  { description: 'Reload Page', key: '⌘ R', windows: 'Ctrl R' },
  { description: 'Go Back', key: '⌘ ←', windows: 'Alt ←' },
  { description: 'Go Forward', key: '⌘ →', windows: 'Alt →' },
];

const browserControls = [
  { icon: Search, description: 'Quick search with ⌘K or click the search bar' },
  { icon: Plus, description: 'Add a new tab by clicking the + button' },
  { icon: ArrowLeft, description: 'Go back to the previous page' },
  { icon: ArrowRight, description: 'Go forward to the next page' },
  { icon: RotateCw, description: 'Reload the current page' },
  { icon: MessageSquare, description: 'Send feedback about Exped Browser' },
  { icon: HelpCircle, description: 'View keyboard shortcuts and help' },
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
    icon: 'https://img.icons8.com/?size=96&id=9a46bTk3awwI&format=png',
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
    icon: 'https://img.icons8.com/?size=96&id=xuvGCOXi8Wyg&format=png',
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
  const [mainSearchInput, setMainSearchInput] = useState<string>('');
  const [overlaySearchInput, setOverlaySearchInput] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
  const [mainSearchResults, setMainSearchResults] = useState<SearchResult[]>([]);
  const [overlaySearchResults, setOverlaySearchResults] = useState<SearchResult[]>([]);
  const [isMainSearching, setIsMainSearching] = useState(false);
  const [isOverlaySearching, setIsOverlaySearching] = useState(false);
  
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

  const createTabContent = (url: string) => {
    const link = links.find(link => link.url === url);
    
    return {
      url,
      title: link?.name || new URL(url).hostname,
      icon: link?.icon || `${new URL(url).origin}/favicon.ico`,
      content: (
        <div className="w-full h-full">
          <webview
            src={url}
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
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
            ...createTabContent(fullUrl),
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

  const handleMainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainSearchInput) {
      setMainSearchResults([]);
      return;
    }

    setIsMainSearching(true);
    try {
      if (mainSearchInput.match(/^https?:\/\//i) || (mainSearchInput.includes('.') && !mainSearchInput.includes(' '))) {
        const url = mainSearchInput.startsWith('http') ? mainSearchInput : `https://${mainSearchInput}`;
        navigateToUrl(url, activeTab);
        setMainSearchInput('');
        setMainSearchResults([]);
      } else {
        const results = await searchGoogle(mainSearchInput);
        setMainSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsMainSearching(false);
    }
  };

  const handleOverlaySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overlaySearchInput) {
      setOverlaySearchResults([]);
      return;
    }

    setIsOverlaySearching(true);
    try {
      if (overlaySearchInput.match(/^https?:\/\//i) || (overlaySearchInput.includes('.') && !overlaySearchInput.includes(' '))) {
        const url = overlaySearchInput.startsWith('http') ? overlaySearchInput : `https://${overlaySearchInput}`;
        navigateToUrl(url, activeTab);
        setOverlaySearchInput('');
        setOverlaySearchResults([]);
        setShowSearch(false);
      } else {
        const results = await searchGoogle(overlaySearchInput);
        setOverlaySearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsOverlaySearching(false);
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
          ...createTabContent(lastUrl),
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
          ...createTabContent(nextUrl),
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
  const canGoBack = (activeTabData?.history?.past?.length ?? 0) > 0;
  const canGoForward = (activeTabData?.history?.future?.length ?? 0) > 0;

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card shrink-0">
        <div className="flex items-center h-14 px-4 gap-4">
          <div className="flex items-center gap-1">
            <button 
              className={cn(
                "p-2 rounded-full transition-colors",
                canGoBack 
                  ? "hover:bg-muted text-muted-foreground" 
                  : "text-muted-foreground/40 cursor-not-allowed"
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
                  ? "hover:bg-muted text-muted-foreground" 
                  : "text-muted-foreground/40 cursor-not-allowed"
              )}
              onClick={goForward}
              disabled={!canGoForward}
              aria-label="Go forward"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-muted rounded-full text-muted-foreground" 
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
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
                tabIndex={0}
              >
                <img src={tab.icon} alt="" className="w-4 h-4 shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{tab.title}</span>
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 hover:bg-muted/80 rounded-full p-1"
                  aria-label={`Close ${tab.title}`}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            ))}
            <button
              onClick={addNewTab}
              className="p-2 hover:bg-muted rounded-lg shrink-0"
              aria-label="New Tab"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowFeedback(true)}
              className="flex items-center px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-full text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </button>
            <button 
              className="flex items-center px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-full text-sm"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </button>
            <ThemeToggle />
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
                <div className="bg-card rounded-xl p-8 shadow-sm">
                  <div className="flex justify-center mb-8">
                    <img src="/icon.svg" alt="Exped" className="w-16 h-16" />
                  </div>
                  
                  <form onSubmit={handleMainSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                      type="text"
                      placeholder="Search anything or enter a url"
                      className="w-full pl-10 h-12 text-lg"
                      value={mainSearchInput}
                      onChange={(e) => {
                        setMainSearchInput(e.target.value);
                        if (!e.target.value) {
                          setMainSearchResults([]);
                        }
                      }}
                    />
                  </form>

                  {isMainSearching ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="mt-4 text-muted-foreground">Searching...</p>
                    </div>
                  ) : mainSearchResults.length > 0 ? (
                    <div className="w-full">
                      <SearchResults 
                        results={mainSearchResults} 
                        onResultClick={(url) => {
                          navigateToUrl(url, activeTab);
                          setMainSearchInput('');
                          setMainSearchResults([]);
                        }} 
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="w-full px-4 pb-12">
              <div className="max-w-7xl mx-auto">
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="group relative"
                      >
                        <a
                          href={link.url}
                          onClick={(e) => handleLinkClick(e, link)}
                          className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-lg group-hover:bg-muted/80">
                            <img src={link.icon} alt={link.name} className="w-8 h-8" />
                          </div>
                          <span className="text-xs text-center text-muted-foreground">{link.name}</span>
                        </a>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                          <button
                            onClick={() => handleEditLink(link)}
                            className="p-1 rounded-full bg-background shadow-sm hover:bg-muted"
                            aria-label={`Edit ${link.name}`}
                          >
                            <Edit className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 rounded-full bg-background shadow-sm hover:bg-muted"
                            aria-label={`Delete ${link.name}`}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <Dialog open={showAddLink} onOpenChange={setShowAddLink}>
                      <DialogTrigger asChild>
                        <button className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group">
                          <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-lg group-hover:bg-muted/80">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-center text-muted-foreground">Add Link</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={newLink.name || ''}
                              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                              placeholder="e.g., Google"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                              id="url"
                              value={newLink.url || ''}
                              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                              placeholder="e.g., https://google.com"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="icon">Icon URL (optional)</Label>
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
        {showSearch && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-32 z-50"
            onClick={() => {
              setShowSearch(false);
              setOverlaySearchResults([]);
              setOverlaySearchInput('');
            }}
          >
            <div 
              className="bg-card rounded-lg shadow-lg w-full max-w-2xl mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4">
                <form onSubmit={handleOverlaySearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anything..."
                    className="w-full pl-12 pr-4 h-14 text-lg rounded-lg"
                    value={overlaySearchInput}
                    onChange={(e) => {
                      setOverlaySearchInput(e.target.value);
                      if (!e.target.value) {
                        setOverlaySearchResults([]);
                      }
                    }}
                  />
                </form>
              </div>
              
              {isOverlaySearching ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-muted-foreground">Searching...</p>
                </div>
              ) : overlaySearchResults.length > 0 ? (
                <div className="max-h-[60vh] overflow-hidden">
                  <SearchResults 
                    results={overlaySearchResults} 
                    onResultClick={(url) => {
                      navigateToUrl(url, activeTab);
                      setOverlaySearchInput('');
                      setShowSearch(false);
                      setOverlaySearchResults([]);
                    }} 
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}

        {showFeedback && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-32 z-50"
            onClick={() => setShowFeedback(false)}
          >
            <div 
              className="bg-card rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6"
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
                        <div className="w -4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Help Dialog */}
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Keyboard Shortcuts & Controls</DialogTitle>
              </DialogHeader>
              <div className="grid gap-8 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Keyboard className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-medium">Keyboard Shortcuts</h3>
                  </div>
                  <div className="grid gap-2">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {shortcut.key}
                          </kbd>
                          <span className="text-xs text-muted-foreground">or</span>
                          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {shortcut.windows}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Command className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-medium">Browser Controls</h3>
                  </div>
                  <div className="grid gap-3">
                    {browserControls.map((control, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-lg">
                          <control.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">{control.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
    </div>
  );
}

export default App;