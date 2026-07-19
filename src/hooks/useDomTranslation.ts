import { useEffect } from 'react'
import type { Language } from '../game/types'
import { translateText } from '../i18n/i18n'

const textSources = new WeakMap<Text, string>()
const textRendered = new WeakMap<Text, string>()
const attributeSources = new WeakMap<Element, Map<string, string>>()
const attributeRendered = new WeakMap<Element, Map<string, string>>()
const translatedAttributes = ['aria-label', 'placeholder', 'title'] as const

function translateTextNode(node: Text, language: Language) {
  const current = node.data
  const lastRendered = textRendered.get(node)
  if (!textSources.has(node) || current !== lastRendered) textSources.set(node, current)
  const next = translateText(language, textSources.get(node) ?? current)
  textRendered.set(node, next)
  if (current !== next) node.data = next
}

function translateElementAttributes(element: Element, language: Language) {
  let sources = attributeSources.get(element)
  let rendered = attributeRendered.get(element)
  if (!sources) {
    sources = new Map()
    attributeSources.set(element, sources)
  }
  if (!rendered) {
    rendered = new Map()
    attributeRendered.set(element, rendered)
  }
  for (const attribute of translatedAttributes) {
    const current = element.getAttribute(attribute)
    if (current === null) continue
    if (!sources.has(attribute) || current !== rendered.get(attribute)) sources.set(attribute, current)
    const next = translateText(language, sources.get(attribute) ?? current)
    rendered.set(attribute, next)
    if (current !== next) element.setAttribute(attribute, next)
  }
}

function translateTree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, language)
    return
  }
  if (!(root instanceof Element) && !(root instanceof DocumentFragment)) return
  if (root instanceof Element) translateElementAttributes(root, language)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text, language)
    else translateElementAttributes(node as Element, language)
    node = walker.nextNode()
  }
}

export function useDomTranslation(language: Language) {
  useEffect(() => {
    document.documentElement.lang = language
    const root = document.getElementById('root')
    if (!root) return
    translateTree(root, language)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target as Text, language)
        else if (mutation.type === 'attributes') translateElementAttributes(mutation.target as Element, language)
        else for (const node of mutation.addedNodes) translateTree(node, language)
      }
    })
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    })
    return () => observer.disconnect()
  }, [language])
}

