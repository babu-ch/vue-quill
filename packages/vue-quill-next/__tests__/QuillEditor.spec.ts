import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QuillEditor } from '../src/components/QuillEditor'
import { nextTick, ComponentPublicInstance } from 'vue'

const { mockSetContents, mockClipboardConvert } = vi.hoisted(() => ({
  mockSetContents: vi.fn(),
  mockClipboardConvert: vi.fn(),
}))

vi.mock('quill', () => {
  /* eslint-disable-next-line no-unused-vars */
  function MockQuill(this: Record<string, unknown>) {
    this.root = { innerHTML: '' }
    this.clipboard = { convert: mockClipboardConvert }
    this.setContents = mockSetContents
    this.on = vi.fn()
    this.getModule = vi.fn().mockReturnValue({ container: null })
    this.hasFocus = vi.fn().mockReturnValue(false)
  }
  return { default: MockQuill }
})

describe('QuillEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClipboardConvert.mockReturnValue({ ops: [{ insert: 'test\n' }] })
  })

  describe('setHTML', () => {
    it('should use clipboard.convert to process Quill v1 HTML format', async () => {
      const wrapper = mount(QuillEditor, {
        props: {
          contentType: 'html',
        },
      })

      await nextTick()

      const quillEditor = wrapper.vm as ComponentPublicInstance & {
        /* eslint-disable-next-line no-unused-vars */
        setHTML: (html: string) => void
      }

      // Clear mocks after initial mount
      mockClipboardConvert.mockClear()
      mockSetContents.mockClear()

      const quillV1Html = '<ul><li>test</li></ul>'
      quillEditor.setHTML(quillV1Html)

      // Verify clipboard.convert was called with { html } format
      expect(mockClipboardConvert).toHaveBeenCalledWith({ html: quillV1Html })
      // Verify setContents was called with the converted delta
      expect(mockSetContents).toHaveBeenCalledWith(
        { ops: [{ insert: 'test\n' }] },
        'api',
      )
    })
  })

  describe('pasteHTML', () => {
    it('should use clipboard.convert with correct { html } argument format', async () => {
      const wrapper = mount(QuillEditor, {
        props: {
          contentType: 'html',
        },
      })

      await nextTick()

      const quillEditor = wrapper.vm as ComponentPublicInstance & {
        /* eslint-disable-next-line no-unused-vars */
        pasteHTML: (html: string, source?: string) => void
      }

      // Clear mocks after initial mount
      mockClipboardConvert.mockClear()
      mockSetContents.mockClear()

      const quillV1Html = '<ul><li>test</li></ul>'
      quillEditor.pasteHTML(quillV1Html)

      // Verify clipboard.convert was called with { html } format
      expect(mockClipboardConvert).toHaveBeenCalledWith({ html: quillV1Html })
      // Verify setContents was called
      expect(mockSetContents).toHaveBeenCalled()
    })
  })
})
