import 'react-tiptap-base-editor/dist/styles/index.css'
import { TiptapEditor, TiptapEditorProps } from 'react-tiptap-base-editor'

const Editor = (props: TiptapEditorProps) => {
  return <TiptapEditor {...props} />
}

export { Editor }
export type { TiptapEditorProps as EditorProps }
