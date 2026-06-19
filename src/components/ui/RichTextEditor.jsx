import { useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { cleanPdfText } from '../../utils/textUtils';

const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
      active ? 'bg-violet-100 text-violet-600' : 'text-slate-500 hover:bg-slate-100 hover:text-ink-950'
    }`}
  >
    {children}
  </button>
);

export function RichTextEditor({ value, onChange, placeholder, rows = 6 }) {
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, blockquote: false, code: false, horizontalRule: false }),
      Underline,
    ],
    content: value || '',
    onCreate: ({ editor }) => { editorRef.current = editor; },
    onUpdate: ({ editor }) => { editorRef.current = editor; onChange(editor.getHTML()); },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[' + (rows * 1.6) + 'rem] prose prose-sm max-w-none text-sm text-[#111118] leading-relaxed',
      },
      handlePaste: (view, event) => {
        // If clipboard has rich HTML (Word, Google Docs), let TipTap handle normally
        const richHtml = event.clipboardData?.getData('text/html');
        if (richHtml && richHtml.trim()) return false;

        const plain = event.clipboardData?.getData('text/plain');
        if (!plain) return false;

        // PDF paste: join broken lines within paragraphs, preserve paragraph breaks
        const cleaned = cleanPdfText(plain);
        const insertHtml = cleaned.split('\n\n').map(p => `<p>${p}</p>`).join('');
        if (editorRef.current) {
          editorRef.current.chain().insertContent(insertHtml).run();
          return true;
        }
        return false;
      },
    },
  });

  // Garante que o conteúdo inicial carregue no modo edição
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value, false);
    }
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const groups = [
    [
      { label: 'N', title: 'Negrito', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { label: 'I', title: 'Itálico', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), italic: true },
      { label: 'S', title: 'Sublinhado', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), underline: true },
      { label: 'R', title: 'Tachado', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), strike: true },
    ],
    [
      { label: 'H1', title: 'Título 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
      { label: 'H2', title: 'Título 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
      { label: 'H3', title: 'Título 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    ],
    [
      { label: '≡', title: 'Lista com marcadores', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      { label: '1.', title: 'Lista numerada', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    ],
  ];

  return (
    <div className="border border-ink-600 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-violet-400/50 focus-within:border-transparent transition-all bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-ink-600 bg-ink-700 flex-wrap">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-4 bg-ink-600 mx-1" />}
            {group.map((btn) => (
              <ToolbarBtn key={btn.label} onClick={btn.action} active={btn.active} title={btn.title}>
                <span className={`${btn.italic ? 'italic' : ''} ${btn.underline ? 'underline' : ''} ${btn.strike ? 'line-through' : ''}`}>
                  {btn.label}
                </span>
              </ToolbarBtn>
            ))}
          </div>
        ))}
        <div className="ml-auto">
          <ToolbarBtn
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Limpar formatação"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16l10-10 7 7-1.5 1.5"/>
              <path d="M6.5 17.5l5-5"/>
            </svg>
          </ToolbarBtn>
        </div>
      </div>

      {/* Editor */}
      <div className="px-3 py-2.5 bg-ink-700 focus-within:bg-white transition-colors">
        {!editor.getText() && !editor.isFocused && (
          <p className="absolute text-sm text-slate-400 pointer-events-none select-none">{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
