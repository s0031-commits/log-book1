import { Code2, BookOpen, Eye, Lightbulb, ArrowRight, Share2, Users } from 'lucide-react';

interface WelcomeScreenProps {
  onNewEntry: () => void;
  onOpenShare: () => void;
  entryCount: number;
  userName: string;
}

export function WelcomeScreen({ onNewEntry, onOpenShare, entryCount, userName }: WelcomeScreenProps) {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="h-full flex items-center justify-center bg-[#0d1117] p-8">
      <div className="max-w-lg text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/20 mb-6">
          <Code2 className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          {greeting}, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{userName}</span>!
        </h1>
        <p className="text-gray-500 mb-8">
          Track your daily coding progress, write code, see it run, and share your learning journey.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#161b22] rounded-xl p-4 border border-gray-800/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Write Code</h3>
            <p className="text-[11px] text-gray-600">8+ languages supported</p>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4 border border-gray-800/50">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Live Preview</h3>
            <p className="text-[11px] text-gray-600">See results instantly</p>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4 border border-gray-800/50">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Reflect</h3>
            <p className="text-[11px] text-gray-600">Track your growth</p>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4 border border-gray-800/50">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Share</h3>
            <p className="text-[11px] text-gray-600">Invite & collaborate</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNewEntry}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] text-sm"
          >
            <Code2 className="w-4 h-4" />
            {entryCount === 0 ? 'Create Your First Entry' : 'New Entry'}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenShare}
            className="inline-flex items-center gap-2 bg-[#161b22] hover:bg-[#1c2333] text-purple-400 font-medium py-2.5 px-6 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share & Invite
          </button>
        </div>

        {entryCount > 0 && (
          <p className="mt-4 text-xs text-gray-600">
            You have {entryCount} {entryCount === 1 ? 'entry' : 'entries'}. Select one from the sidebar to view.
          </p>
        )}
      </div>
    </div>
  );
}
