// src/components/codex/codex-editor.tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { saveCodexVersionAction } from '@/lib/codex/actions'

interface CodexEditorProps {
  codexId: string
  initialContent: string
  initialTitle: string
}

type Mode = 'edit' | 'preview'

export function CodexEditor({ codexId, initialContent, initialTitle }: CodexEditorProps) {
  const [mode, setMode] = useState<Mode>('preview')
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleContentChange(val: string) {
    setContent(val)
    setIsDirty(true)
    setSaveStatus('idle')
  }

  function handleSave() {
    if (!isDirty) return
    startTransition(async () => {
      const result = await saveCodexVersionAction({
        codexId,
        title,
        content,
      })
      if (result.success) {
        setIsDirty(false)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          <button
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 transition-colors ${mode === 'preview' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
          >
            Lecture
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 transition-colors ${mode === 'edit' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
          >
            Éditer
          </button>
        </div>

        {mode === 'edit' && (
          <div className="flex items-center gap-2">
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600">Sauvegardé ✓</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-destructive">Erreur</span>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
            >
              {isSaving ? 'Sauvegarde…' : isDirty ? 'Sauvegarder' : 'À jour'}
            </button>
          </div>
        )}
      </div>

      {/* Contenu */}
      {mode === 'edit' ? (
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
            placeholder="Titre du Codex"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Commence à écrire ton Codex en Markdown…"
            className="w-full min-h-[60vh] resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {content.length} caractères · Markdown supporté
          </p>
        </div>
      ) : (
        <div className="min-h-[60vh] rounded-xl border border-border bg-background p-6">
          {content ? (
            <MarkdownPreview content={content} />
          ) : (
            <div className="flex h-full items-center justify-center text-center py-12">
              <div className="space-y-3">
                <p className="text-4xl opacity-20">◎</p>
                <p className="text-sm text-muted-foreground">
                  Ton Codex est vide.
                </p>
                <button
                  onClick={() => setMode('edit')}
                  className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                  Commencer à écrire →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Rendu Markdown minimal — sans dépendance externe
function MarkdownPreview({ content }: { content: string }) {
  // Conversion Markdown basique pour le MVP
  const html = content
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-medium mt-6 mb-2">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-medium mt-5 mb-1.5">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium mt-4 mb-1">$1</h3>')
    .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
    .replace(/\*(.+)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-border pl-4 text-muted-foreground italic my-3">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match
      return `<p class="leading-relaxed text-foreground/90">${match}</p>`
    })

  return (
    <article
      className="prose prose-sm max-w-none space-y-1 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
