/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout'
import { RichContent } from '@/components/rich-content'
import { useTheme } from '@/context/theme-provider'
import { isLikelyHtml } from '@/lib/content-format'
import { useAuthStore } from '@/stores/auth-store'

import { useHomePageContent } from './hooks'

/**
 * Minimal landing page rendered when no admin-configured home content is set.
 * Aims for the AgentRouter.org visual style: clean top nav, single hero,
 * two feature blocks, slim footer with required AGPLv3 attribution.
 */
function MinimalLanding({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  const { t } = useTranslation()
  const systemName = t('AgentRouter')

  return (
    <PublicLayout showMainContainer={false}>
      <div className='min-h-screen bg-background text-foreground'>
        {/* Top nav */}
        <header className='border-b border-border/60'>
          <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold'>
                A
              </div>
              <span className='text-base font-semibold'>{systemName}</span>
              <span className='text-muted-foreground hidden text-sm sm:inline'>
                {t('AI Coding Gateway')}
              </span>
            </div>
            <nav className='flex items-center gap-3 text-sm'>
              <a
                href='#features'
                className='text-muted-foreground hover:text-foreground hidden sm:inline'
              >
                {t('Features')}
              </a>
              <a
                href='#start'
                className='text-muted-foreground hover:text-foreground hidden sm:inline'
              >
                {t('Quick Start')}
              </a>
              {isAuthenticated ? (
                <Button size='sm' variant='outline' render={<Link to='/dashboard' />}>
                  {t('Console')}
                </Button>
              ) : (
                <>
                  <Button size='sm' variant='ghost' render={<Link to='/sign-in' />}>
                    {t('Login')}
                  </Button>
                  <Button size='sm' render={<Link to='/sign-up' />}>
                    {t('Get Started')}
                  </Button>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className='px-4 py-20 sm:py-28'>
          <div className='mx-auto max-w-3xl text-center'>
            <div className='bg-muted text-muted-foreground mx-auto mb-6 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'>
              {t('Free Tier Available')}
            </div>
            <h1 className='text-foreground text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl'>
              {t('AI Coding Gateway')}
            </h1>
            <p className='text-muted-foreground mx-auto mt-6 max-w-2xl text-base sm:text-lg'>
              {t(
                'A self-hosted AI gateway with free quota. Route Claude Code, Codex, Gemini CLI and other coding tools through a single endpoint.'
              )}
            </p>
            <div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
              <Button size='lg' render={<Link to='/sign-up' />}>
                {t('Get Started')}
              </Button>
              <Button size='lg' variant='outline' render={<Link to='/sign-in' />}>
                {t('Sign In')}
              </Button>
            </div>
          </div>
        </section>

        {/* Feature blocks */}
        <section
          id='features'
          className='border-t border-border/60 px-4 py-16 sm:py-20'
        >
          <div className='mx-auto grid max-w-5xl gap-6 md:grid-cols-2'>
            <div className='bg-card text-card-foreground rounded-xl border p-8'>
              <div className='bg-primary/10 text-primary mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  className='h-5 w-5'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M12 2v20M2 12h20' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold'>
                {t('Free to Use')}
              </h3>
              <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                {t(
                  'We provide developers with whatever help we can — free quota to power your AI coding workflow.'
                )}
              </p>
            </div>
            <div className='bg-card text-card-foreground rounded-xl border p-8'>
              <div className='bg-accent/10 text-accent mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  className='h-5 w-5'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold'>
                {t('Multi-Tool Support')}
              </h3>
              <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                {t(
                  'Works with Claude Code, Codex, Gemini CLI, Cline, ZCode and many more — whatever you use, we support it.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Quick start */}
        <section
          id='start'
          className='border-t border-border/60 px-4 py-16 sm:py-20'
        >
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-foreground text-center text-2xl font-semibold sm:text-3xl'>
              {t('Quick Start')}
            </h2>
            <p className='text-muted-foreground mx-auto mt-3 max-w-xl text-center text-sm'>
              {t(
                'Three steps to route your coding tools through this gateway.'
              )}
            </p>
            <ol className='text-muted-foreground mt-10 space-y-4 text-sm'>
              <li className='flex gap-4'>
                <span className='bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                  1
                </span>
                <span>
                  {t(
                    'Complete the first-run setup wizard at /setup to create your admin account.'
                  )}
                </span>
              </li>
              <li className='flex gap-4'>
                <span className='bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                  2
                </span>
                <span>
                  {t(
                    'Add a channel in the admin panel with your AI provider base URL and API key.'
                  )}
                </span>
              </li>
              <li className='flex gap-4'>
                <span className='bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                  3
                </span>
                <span>
                  {t(
                    'Point your coding tool at this gateway base URL and start sending requests.'
                  )}
                </span>
              </li>
            </ol>
          </div>
        </section>

        {/* Footer with required AGPLv3 attribution */}
        <footer className='border-t border-border/60 px-4 py-10'>
          <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs sm:flex-row sm:text-left'>
            <div className='text-muted-foreground'>
              © {new Date().getFullYear()} {systemName}.{' '}
              <span>{t('All rights reserved.')}</span>
            </div>
            <div className='text-muted-foreground'>
              {t('Frontend design and development by')}{' '}
              <a
                href='https://github.com/QuantumNous/new-api'
                target='_blank'
                rel='noreferrer'
                className='text-foreground hover:text-primary underline'
              >
                {t('New API contributors')}
              </a>
              .
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  )
}

export function Home() {
  const { i18n, t } = useTranslation()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { resolvedTheme } = useTheme()
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user
  const { content, isLoaded, isUrl } = useHomePageContent()

  const syncIframePreferences = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { themeMode: resolvedTheme },
        '*',
      )
      iframeRef.current?.contentWindow?.postMessage(
        { lang: i18n.language },
        '*',
      )
    } catch {
      // Cross-origin frames may reject access while navigating.
    }
  }, [i18n.language, resolvedTheme])

  useEffect(() => {
    if (isUrl) {
      syncIframePreferences()
    }
  }, [isUrl, syncIframePreferences])

  if (!isLoaded) {
    return (
      <PublicLayout showMainContainer={false}>
        <main className='flex min-h-screen items-center justify-center'>
          <div className='text-muted-foreground'>{t('Loading...')}</div>
        </main>
      </PublicLayout>
    )
  }

  if (content) {
    if (isUrl) {
      return (
        <PublicLayout showMainContainer={false}>
          {/*
            allow-top-navigation-by-user-activation: the custom home page URL is
            admin-configured (trusted); this lets its target="_top" nav/menu links
            navigate the top-level window on user click. The default sandbox blocks
            this on desktop, while some mobile browsers allow it via allow-popups,
            causing inconsistent behavior. This token only permits user-activated
            top-level navigation and does NOT grant same-origin access.
          */}
          <iframe
            ref={iframeRef}
            src={content}
            className='h-screen w-full border-none'
            title={t('Custom Home Page')}
            sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation-by-user-activation'
            onLoad={syncIframePreferences}
          />
        </PublicLayout>
      )
    }

    const contentIsHtml = isLikelyHtml(content)

    if (contentIsHtml) {
      return (
        <PublicLayout showMainContainer={false}>
          <RichContent
            mode='html'
            htmlVariant='isolated'
            content={content}
            className='custom-home-content'
          />
        </PublicLayout>
      )
    }

    return (
      <PublicLayout>
        <div className='mx-auto max-w-6xl px-4 py-8'>
          <RichContent
            mode='markdown'
            content={content}
            className='custom-home-content'
          />
        </div>
      </PublicLayout>
    )
  }

  return <MinimalLanding isAuthenticated={isAuthenticated} />
}
