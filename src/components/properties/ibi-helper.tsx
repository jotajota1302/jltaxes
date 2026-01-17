'use client';

import { useTranslations } from 'next-intl';
import { X, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IbiHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * IbiHelper Component
 * Visual guide explaining where to find cadastral value on IBI receipt
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets
 * A11Y-05: Clear visual guidance
 */
export function IbiHelper({ isOpen, onClose }: IbiHelperProps) {
  const t = useTranslations('property.ibiHelper');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ibi-helper-title"
    >
      <Card className="max-w-lg mx-4 w-full">
        <CardHeader className="relative">
          <CardTitle id="ibi-helper-title" className="flex items-center gap-2">
            <FileText className="h-6 w-6" aria-hidden="true" />
            {t('title')}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">{t('description')}</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </span>
              <p className="text-base pt-1">{t('step1')}</p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </span>
              <p className="text-base pt-1">{t('step2')}</p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </span>
              <p className="text-base pt-1">{t('step3')}</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-base text-amber-800 dark:text-amber-200">
              {t('note')}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <a
              href="https://www.sedecatastro.gob.es/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              {t('linkText')}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <Button onClick={onClose}>{t('title').includes('encontrar') || t('title').includes('find') ? 'OK' : 'OK'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * IbiHelperInline Component
 * Non-modal version for inline display
 */
export function IbiHelperInline() {
  const t = useTranslations('property.ibiHelper');

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" aria-hidden="true" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-base text-muted-foreground">{t('description')}</p>

        <ol className="list-decimal list-inside space-y-2 text-base">
          <li>{t('step1')}</li>
          <li>{t('step2')}</li>
          <li>{t('step3')}</li>
        </ol>

        <p className="text-sm text-muted-foreground italic">{t('note')}</p>

        <a
          href="https://www.sedecatastro.gob.es/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline text-base"
        >
          {t('linkText')}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </CardContent>
    </Card>
  );
}
