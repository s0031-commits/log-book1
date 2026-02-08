import { Code2, BookOpen, Eye, Lightbulb, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onNewEntry: () => void;
  entryCount: number;
}

export function WelcomeScreen({ onNewEntry, entryCount }: WelcomeScreenProps) {
  return (
    <div className="h-full flex items-center justify-center bg-[#0d1117] p-8">
      <div className="max-w-lg text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/20 mb-6">
          <Code2 className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">CodeLog</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Your personal coding journal. Track your daily progress, write code, see it run, and reflect on what you've learned.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#161b22] rounded-xl p-4 border border-gray-800/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Write Code</h3>
            <p className="text-[11px] text-gray-600">Support for 8+ languages</p>
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
            <p className="text-[11px] text-gray-600">Track your understanding</p>
          </div>
        </div>

        {entryCount === 0 ? (
          <button
            onClick={onNewEntry}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
          >
            Create Your First Entry
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Select an entry from the sidebar or create a new one
            </p>
            <button
              onClick={onNewEntry}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] text-sm"
            >
              <Code2 className="w-4 h-4" />
              New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
