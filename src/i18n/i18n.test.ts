import { describe, expect, it } from 'vitest'
import { isSupportedLanguage, translateText } from './i18n'

describe('Project Origin localization', () => {
  it('keeps English canonical text unchanged', () => {
    expect(translateText('en', 'New Game')).toBe('New Game')
  })

  it('translates exact interface and curriculum text into Simplified Chinese', () => {
    expect(translateText('zh-CN', 'New Game')).toBe('新游戏')
    expect(translateText('zh-CN', 'Computer Vision')).toBe('计算机视觉')
    expect(translateText('zh-CN', 'the')).toBe('这')
  })

  it('preserves whitespace around translated text nodes', () => {
    expect(translateText('zh-CN', '  Settings  ')).toBe('  设置  ')
  })

  it('translates dynamic stage and progress labels', () => {
    expect(translateText('zh-CN', 'STAGE 3 OF 4')).toBe('阶段 3 / 4')
    expect(translateText('zh-CN', '7 dots confused')).toBe('7 个点分类错误')
  })

  it('falls back safely for unknown authored text', () => {
    expect(translateText('zh-CN', 'ORI')).toBe('ORI')
    expect(isSupportedLanguage('zh-CN')).toBe(true)
    expect(isSupportedLanguage('fr')).toBe(false)
  })
})
