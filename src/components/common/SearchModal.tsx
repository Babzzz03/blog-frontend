'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, CommandIcon, Clock, TrendingUp } from 'lucide-react';
import { postService } from '@/services/post.service';
import { Post } from '@/types';

const recentSearches = ['Next.js development', 'React hooks', 'Tailwind CSS tips', 'TypeScript best practices'];
const popularSearches = ['Web development', 'Frontend frameworks', 'UI/UX design', 'JavaScript'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await postService.getPosts({ searchTerm: query, limit: 5 });
        setResults(data.posts);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(`/blog/${slug}`);
  };

  const handleQuickSearch = (term: string) => {
    onOpenChange(false);
    router.push(`/blog?searchTerm=${encodeURIComponent(term)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[800px] p-0">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Command className="rounded-lg border shadow-md">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="ml-auto pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs">
                    <CommandIcon className="h-3 w-3" />K
                  </kbd>
                </div>

                <div className="p-4">
                  <ScrollArea className="h-[50vh] pr-4">
                    {query && results.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium mb-3">Results</p>
                        {results.map((post) => (
                          <button
                            key={post._id}
                            onClick={() => handleSelect(post.slug)}
                            className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted text-left"
                          >
                            <span className="text-sm font-medium">{post.title}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {query && !isSearching && results.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground text-sm">
                        No results found for "{query}"
                      </motion.div>
                    )}

                    {!query && (
                      <>
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Recent Searches</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {recentSearches.map((s) => (
                              <Button key={s} variant="outline" className="justify-between h-auto py-2" onClick={() => handleQuickSearch(s)}>
                                {s} <ArrowRight className="h-4 w-4" />
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Popular Topics</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {popularSearches.map((s) => (
                              <Button key={s} variant="outline" className="justify-between h-auto py-2" onClick={() => handleQuickSearch(s)}>
                                {s} <ArrowRight className="h-4 w-4" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </ScrollArea>
                </div>
              </Command>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
