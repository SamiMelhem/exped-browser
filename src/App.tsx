import { Search, HelpCircle, MessageSquare, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const apps = [
  { name: 'Google', icon: 'https://img.icons8.com/?size=48&id=17949&format=png' },
  { name: 'Google Calendar', icon: 'https://img.icons8.com/?size=48&id=WKF3bm1munsk&format=png' },
  { name: 'YouTube', icon: 'https://img.icons8.com/?size=48&id=19318&format=png' },
  { name: 'Notion', icon: 'https://img.icons8.com/?size=64&id=uVERmCBZZACL&format=png' },
  { name: 'Gmail', icon: 'https://img.icons8.com/?size=48&id=qyRpAggnV0zH&format=png' },
  { name: 'GitHub', icon: 'https://img.icons8.com/?size=64&id=4Z2nCrz5iPY2&format=png' },
  { name: 'Google Sheets', icon: 'https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico' },
  { name: 'Google Slides', icon: 'https://img.icons8.com/?size=48&id=joSAjc9l7dOp&format=png' },
  { name: 'Mailchimp', icon: 'https://img.icons8.com/?size=32&id=S0bZcuZA1OYb&format=png' },
  { name: 'Framer', icon: 'https://img.icons8.com/?size=24&id=XKFRdQOs24QU&format=png' },
  { name: 'Firebase', icon: 'https://img.icons8.com/?size=48&id=87330&format=png' },
  { name: 'Google Docs', icon: 'https://img.icons8.com/?size=48&id=v0YYnU84T2c4&format=png' },
  { name: 'Google Meet', icon: 'https://img.icons8.com/?size=48&id=pE97I4t7Il9M&format=png' },
  { name: 'Slack', icon: 'https://slack.com/favicon.ico' },
  { name: 'Canva', icon: 'https://img.icons8.com/?size=48&id=EZQdGLNeo7JI&format=png' },
  { name: 'Figma', icon: 'https://static.figma.com/app/icon/1/favicon.ico' },
  { name: 'ChatGPT', icon: 'https://img.icons8.com/?size=50&id=FBO05Dys9QCg&format=png' },
  { name: 'Reddit', icon: 'https://img.icons8.com/?size=50&id=12463&format=png' },
  { name: 'LinkedIn', icon: 'https://www.linkedin.com/favicon.ico' },
  { name: 'Dropbox', icon: 'https://img.icons8.com/?size=48&id=13657&format=png' },
  { name: 'Google Drive', icon: 'https://img.icons8.com/?size=48&id=VLr4hUR8iMGF&format=png' },
  { name: 'Miro', icon: 'https://tpc.googlesyndication.com/simgad/17683044474449817863?sqp=-oaymwEKCCAQICABUAFYAQ&rs=AOga4qmd8GM3BhqvxGGi6eZ37Cnr7NhcFQ' },
  { name: 'Asana', icon: 'https://img.icons8.com/?size=80&id=Vc0EWw2N94Kt&format=png' }
];

export default function App() {
  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white shrink-0">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <RotateCcw className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Help and Feedback Buttons */}
          <div className="flex items-center gap-2">
            <button className="flex items-center px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-full text-sm">
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Logo and Search Section */}
        <div className="w-full px-4 py-12">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img src="/icon.svg" alt="Exped" className="w-16 h-16" />
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  type="text"
                  placeholder="Search anything or enter a url"
                  className="w-full pl-10 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="w-full px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Tabs defaultValue="saved" className="mb-6">
                <TabsList>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                  <TabsTrigger value="default">Default</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {apps.map((app) => (
                  <a
                    key={app.name}
                    href="#"
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200">
                      <img src={app.icon} alt={app.name} className="w-8 h-8" />
                    </div>
                    <span className="text-xs text-center text-gray-600">{app.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}