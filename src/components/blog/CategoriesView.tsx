'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '@/hooks/use-content-translation';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesView() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then((data) => { setCategories(data); setIsLoading(false); }).catch(() => setIsLoading(false));
  }, []);

  const { translated: translatedNames } = useContentTranslation(
    categories.map((c) => c.name),
    categories.map((c) => `${c._id}_name`),
  );
  const { translated: translatedDescs } = useContentTranslation(
    categories.map((c) => c.description || ''),
    categories.map((c) => `${c._id}_desc`),
  );

  return (
    <div className="container min-h-screen mx-auto px-4 py-12">
      <motion.h1 className="text-4xl font-bold mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        {t('categories.title')}
      </motion.h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">{t('categories.none')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div key={category._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Link href={`/blog?category=${encodeURIComponent(category.name)}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                
                  <CardHeader>
                    <CardTitle className="text-base">{translatedNames[index] ?? category.name}</CardTitle>
                  </CardHeader>
                  {category.description && (
                    <CardContent className="!pt-0" >
                      <p className="text-sm text-muted-foreground">{translatedDescs[index] || category.description}</p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
