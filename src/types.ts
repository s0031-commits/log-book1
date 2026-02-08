// ============================================================
// CORE APPLICATION TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;
  createdAt: number;
}

export interface BlogEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  language: Language;
  code: string;
  summary: string;
  reflection: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ShareInvite {
  id: string;
  code: string;
  entryIds: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  permission: 'view';
  createdAt: number;
  label: string;
}

export interface AcceptedShare {
  shareId: string;
  shareCode: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  label: string;
  acceptedAt: number;
}

export type Language =
  | 'javascript'
  | 'html'
  | 'css'
  | 'python'
  | 'typescript'
  | 'react'
  | 'sql'
  | 'web';

export type View = 'feed' | 'new' | 'detail' | 'edit' | 'shared-detail';

export const LANGUAGES: { value: Language; label: string; color: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', color: '#f7df1e', icon: 'JS' },
  { value: 'typescript', label: 'TypeScript', color: '#3178c6', icon: 'TS' },
  { value: 'html', label: 'HTML', color: '#e34f26', icon: '<>' },
  { value: 'css', label: 'CSS', color: '#264de4', icon: '#' },
  { value: 'python', label: 'Python', color: '#3776ab', icon: 'PY' },
  { value: 'react', label: 'React JSX', color: '#61dafb', icon: '⚛' },
  { value: 'web', label: 'HTML+CSS+JS', color: '#4ade80', icon: '🌐' },
  { value: 'sql', label: 'SQL', color: '#f29111', icon: 'DB' },
];

export const AVATAR_COLORS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
];

// ============================================================
// SUPABASE DATABASE TYPES (uncomment when using Supabase)
// ============================================================
/*
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_color: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_color?: string;
        };
        Update: {
          display_name?: string;
          avatar_color?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          language: string;
          code: string;
          summary: string;
          reflection: string;
          tags: string[];
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          language: string;
          code: string;
          summary?: string;
          reflection?: string;
          tags?: string[];
          date: string;
        };
        Update: {
          title?: string;
          language?: string;
          code?: string;
          summary?: string;
          reflection?: string;
          tags?: string[];
          date?: string;
          updated_at?: string;
        };
      };
      shares: {
        Row: {
          id: string;
          code: string;
          owner_id: string;
          label: string;
          permission: string;
          created_at: string;
        };
        Insert: {
          code: string;
          owner_id: string;
          label: string;
          permission?: string;
        };
        Update: {
          label?: string;
        };
      };
      share_entries: {
        Row: { share_id: string; entry_id: string };
        Insert: { share_id: string; entry_id: string };
        Update: never;
      };
      accepted_shares: {
        Row: {
          id: string;
          share_id: string;
          user_id: string;
          accepted_at: string;
        };
        Insert: {
          share_id: string;
          user_id: string;
        };
        Update: never;
      };
    };
  };
}
*/

// ============================================================
// SAMPLE DATA (for first-time users)
// ============================================================

export function getSampleEntries(userId: string): BlogEntry[] {
  const now = Date.now();
  return [
    {
      id: 'sample-1',
      userId,
      date: new Date().toISOString().split('T')[0],
      title: 'Learning Array Methods in JavaScript',
      language: 'javascript',
      code: `// Array methods I learned today\nconst fruits = ['apple', 'banana', 'cherry', 'date'];\n\n// .map() - transforms each element\nconst uppercased = fruits.map(f => f.toUpperCase());\nconsole.log('Mapped:', uppercased);\n\n// .filter() - keeps elements that pass a test\nconst longNames = fruits.filter(f => f.length > 5);\nconsole.log('Filtered:', longNames);\n\n// .reduce() - combines all elements into one value\nconst totalLength = fruits.reduce((sum, f) => sum + f.length, 0);\nconsole.log('Total chars:', totalLength);\n\n// .find() - returns first match\nconst found = fruits.find(f => f.startsWith('c'));\nconsole.log('Found:', found);\n\n// Chaining methods together!\nconst result = fruits\n  .filter(f => f.length > 4)\n  .map(f => f.toUpperCase())\n  .sort();\nconsole.log('Chained result:', result);`,
      summary: 'Today I learned about JavaScript array methods: map, filter, reduce, and find. These are higher-order functions that take callback functions as arguments.',
      reflection: 'I think array methods are used everywhere in real apps — like filtering a list of products, mapping data to UI components, or reducing a cart to a total price.',
      tags: ['arrays', 'functional', 'methods'],
      createdAt: now - 86400000,
      updatedAt: now - 86400000,
    },
    {
      id: 'sample-2',
      userId,
      date: new Date().toISOString().split('T')[0],
      title: 'Building a Card Component with CSS',
      language: 'web',
      code: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body {\n    font-family: 'Segoe UI', sans-serif;\n    background: #1a1a2e;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    min-height: 100vh;\n    margin: 0;\n  }\n  .card {\n    background: linear-gradient(135deg, #16213e, #0f3460);\n    border-radius: 16px;\n    padding: 32px;\n    max-width: 320px;\n    box-shadow: 0 20px 60px rgba(0,0,0,0.3);\n    border: 1px solid rgba(255,255,255,0.1);\n    transition: transform 0.3s ease;\n  }\n  .card:hover {\n    transform: translateY(-8px);\n  }\n  .card h2 {\n    color: #e94560;\n    margin: 0 0 12px 0;\n    font-size: 1.5em;\n  }\n  .card p {\n    color: #a8a8b3;\n    line-height: 1.6;\n    margin: 0 0 20px 0;\n  }\n  .card .tag {\n    display: inline-block;\n    background: rgba(233, 69, 96, 0.2);\n    color: #e94560;\n    padding: 4px 12px;\n    border-radius: 20px;\n    font-size: 0.85em;\n    margin-right: 8px;\n  }\n</style>\n</head>\n<body>\n  <div class="card">\n    <h2>🚀 Project Alpha</h2>\n    <p>A beautiful card component with gradients, shadows, and hover effects.</p>\n    <span class="tag">CSS</span>\n    <span class="tag">Design</span>\n    <span class="tag">UI</span>\n  </div>\n</body>\n</html>`,
      summary: 'Created a modern card component using CSS gradients, box-shadow, border-radius, and hover transitions.',
      reflection: 'Cards are used in almost every web app — social media posts, product listings, dashboard widgets. Understanding how to style them with gradients and shadows makes UIs look much more professional.',
      tags: ['css', 'design', 'components'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-3',
      userId,
      date: new Date(now - 86400000).toISOString().split('T')[0],
      title: 'Python List Comprehensions',
      language: 'python',
      code: `# List comprehensions - a concise way to create lists\n\n# Basic: squares of numbers 1-10\nsquares = [x**2 for x in range(1, 11)]\nprint("Squares:", squares)\n\n# With condition: even squares only\neven_squares = [x**2 for x in range(1, 11) if x % 2 == 0]\nprint("Even squares:", even_squares)\n\n# String manipulation\nwords = ["hello", "world", "python", "is", "awesome"]\nlong_words = [w.upper() for w in words if len(w) > 3]\nprint("Long words:", long_words)\n\n# Nested comprehension: flatten a 2D list\nmatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nflat = [num for row in matrix for num in row]\nprint("Flattened:", flat)\n\n# Dictionary comprehension\nword_lengths = {w: len(w) for w in words}\nprint("Word lengths:", word_lengths)`,
      summary: 'Learned Python list comprehensions — a powerful one-liner syntax for creating and transforming lists.',
      reflection: 'List comprehensions replace many for-loops and make code more Pythonic. I think they are used in data processing, cleaning datasets, and anywhere you need to transform collections efficiently.',
      tags: ['python', 'lists', 'comprehensions'],
      createdAt: now - 172800000,
      updatedAt: now - 172800000,
    },
  ];
}
