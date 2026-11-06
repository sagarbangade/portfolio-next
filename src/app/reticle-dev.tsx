'use client';
import { useEffect } from 'react';
import { uiStore } from '@/lib/ui-store';

/** Dev-only: connect Reticle + install the React adapter, after hydration. */
export function ReticleDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    let off: (() => void) | undefined;
    void import('@reticlehq/react').then(
      ({ reticle, install, registerCapabilities, registerStore }) => {
        install();
        // Both provided by withReticle() in next.config. The bridge rejects a connect with no token;
        // the root makes source paths repo-relative instead of absolute.
        const token = process.env.NEXT_PUBLIC_RETICLE_TOKEN;
        const root = process.env.NEXT_PUBLIC_RETICLE_ROOT;
        // withReticle() finds the daemon serving this project on every dev-server start. It wins over
        // any port written into this file at install time, so moving the daemon needs no edit here.
        const url = process.env.NEXT_PUBLIC_RETICLE_URL;
        reticle.connect({
          projectId: 'portfolio-88fe6a78', ...(url ? { url } : {}),
          ...(token ? { token } : {}),
          ...(root ? { root } : {}),
        });

        // The shared UI store (theme, palette, filters, active section). Passing the store itself wires
        // subscribe too, so every mutation emits a diff.
        registerStore('ui', uiStore);

        // Components dispatch `portfolio:signal` DOM events so they never import Reticle; forward them here.
        const onSignal = (e: Event) => {
          const { name, data } = (e as CustomEvent<{ name: string; data?: Record<string, unknown> }>).detail;
          reticle.signal(name, data);
        };
        window.addEventListener('portfolio:signal', onSignal);
        off = () => window.removeEventListener('portfolio:signal', onSignal);

        registerCapabilities({
          testids: [
            'open-palette', 'command-palette', 'palette-input', 'theme-toggle', 'menu-toggle', 'mobile-menu',
            'nav-resume', 'cta-work', 'cta-resume', 'copy-email', 'hero-stats', 'local-time', 'project-grid',
            'project-card', 'experience-globe', 'education-panel', 'edu-btech', 'edu-masai', 'skill-evidence', 'core-react', 'core-aws', 'yt-sort-latest', 'yt-sort-popular', 'yt-sort-liked', 'exp-inspironlabs', 'exp-immverseai', 'exp-asterisc',
          ],
          signals: ['theme:changed', 'palette:open', 'palette:run', 'menu:open', 'menu:close', 'email:copied', 'section:active', 'experience:step', 'skills:select', 'education:step'],
          stores: ['ui'],
        });
      },
    );
    return () => off?.();
  }, []);
  return null;
}
