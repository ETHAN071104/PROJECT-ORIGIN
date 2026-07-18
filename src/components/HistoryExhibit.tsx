import { useEffect, useState } from 'react'
import type { HistoryEntry, ModernBuilderEntry, PersonEntry } from '../data/historyArchive'
import { MODERN_BUILDERS_NOTE } from '../data/historyArchive'

interface PanelFrameProps {
  align: 'left' | 'right'
  label: string
  onClose: () => void
  children: React.ReactNode
}

function useCloseKeys(onAction: () => void, onClose: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.code === 'Enter' || event.code === 'KeyE' || event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) onAction()
      }
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onAction, onClose])
}

function PanelFrame({ align, label, onClose, children }: PanelFrameProps) {
  return (
    <aside className={`archive-panel is-${align}`} role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" className="archive-panel-close" aria-label={`Close ${label}`} onClick={onClose}>×</button>
      {children}
    </aside>
  )
}

export function ArchiveIcon({ icon, portrait = false }: { icon: string; portrait?: boolean }) {
  return (
    <span className={`archive-icon archive-icon-${icon} ${portrait ? 'is-portrait' : ''}`} aria-hidden="true">
      <i /><i /><i /><b /><b />
    </span>
  )
}

export function HistoryExhibit({ entry, side, read }: { entry: HistoryEntry; side: 'left' | 'right'; read: boolean }) {
  return (
    <section className={`history-exhibit exhibit-${side} ${read ? 'is-read' : ''}`} aria-label={`${entry.year} ${entry.title} history exhibit`}>
      <span className="exhibit-year">{entry.year}</span>
      <ArchiveIcon icon={entry.icon} />
      <strong>{entry.title}</strong>
      <span className="exhibit-read-light" aria-hidden="true" />
    </section>
  )
}

export function HistoryEntryPanel({ entry, align, onClose }: { entry: HistoryEntry; align: 'left' | 'right'; onClose: () => void }) {
  const [showWhy, setShowWhy] = useState(false)
  const advance = () => {
    if (entry.longText && !showWhy) setShowWhy(true)
    else onClose()
  }
  useCloseKeys(advance, onClose)

  return (
    <PanelFrame align={align} label={`${entry.year} ${entry.title}`} onClose={onClose}>
      <div className="archive-panel-heading">
        <ArchiveIcon icon={entry.icon} />
        <div><span>{entry.year} // {entry.category}</span><h2>{entry.title}</h2></div>
      </div>
      {entry.relatedNames && (
        <div className="archive-related-names">{entry.relatedNames.map((name) => <span key={name}>{name}</span>)}</div>
      )}
      <p>{showWhy && entry.longText ? entry.longText : entry.shortText}</p>
      <footer>
        {entry.longText && !showWhy && <button type="button" onClick={() => setShowWhy(true)}>WHY IT MATTERS</button>}
        {showWhy && <span>WHY IT MATTERS</span>}
        <button type="button" onClick={onClose}>CLOSE</button>
      </footer>
    </PanelFrame>
  )
}

export function PersonEntryPanel({ person, align, onClose }: { person: PersonEntry; align: 'left' | 'right'; onClose: () => void }) {
  useCloseKeys(onClose, onClose)
  return (
    <PanelFrame align={align} label={person.name} onClose={onClose}>
      <div className="archive-panel-heading person-heading">
        <ArchiveIcon icon={person.portraitKey} portrait />
        <div><span>PEOPLE OF AI // {person.category}</span><h2>{person.name}</h2></div>
      </div>
      <p>{person.contribution}</p>
      <footer><button type="button" onClick={onClose}>CLOSE</button></footer>
    </PanelFrame>
  )
}

export function ModernBuildersPanel({ builders, align, onClose }: { builders: readonly ModernBuilderEntry[]; align: 'left' | 'right'; onClose: () => void }) {
  useCloseKeys(onClose, onClose)
  return (
    <PanelFrame align={align} label="Modern Builders" onClose={onClose}>
      <div className="archive-panel-heading">
        <ArchiveIcon icon="builders" />
        <div><span>OPTIONAL ARCHIVE DISPLAY</span><h2>MODERN BUILDERS</h2></div>
      </div>
      <div className="modern-builder-list">
        {builders.map((builder) => (
          <div key={builder.name}>
            <strong>{builder.name}</strong><span>{builder.category}</span><p>{builder.contribution}</p>
          </div>
        ))}
      </div>
      <blockquote>{MODERN_BUILDERS_NOTE}</blockquote>
      <footer><button type="button" onClick={onClose}>CLOSE</button></footer>
    </PanelFrame>
  )
}
