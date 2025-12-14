import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Link as LinkIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync content updates from parent (mainly for clearing the form)
  useEffect(() => {
    if (editorRef.current) {
        // We compare the current innerHTML with the new value.
        // We only update the DOM if they are different. 
        // This check prevents the cursor from jumping to the start when typing,
        // because we don't overwrite the DOM while the user is interacting with it
        // unless the parent explicitly changes it (e.g. reset to empty string).
        if (value !== editorRef.current.innerHTML) {
             // Edge case: if value is empty string, clear it. 
             // If value is structurally different, update it.
             // This simple check covers the "reset" use case which is the most important for controlled inputs here.
             editorRef.current.innerHTML = value;
        }
    }
  }, [value]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
        editorRef.current.focus();
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title }: any) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        execCommand(command, arg);
      }}
      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50">
        <ToolbarButton icon={Bold} command="bold" title="Bold" />
        <ToolbarButton icon={Italic} command="italic" title="Italic" />
        <ToolbarButton icon={Underline} command="underline" title="Underline" />
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                const url = prompt("Enter URL:");
                if (url) execCommand("createLink", url);
            }}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Link"
        >
            <LinkIcon size={16} />
        </button>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 flex flex-col cursor-text" onClick={() => editorRef.current?.focus()}>
        <div
            ref={editorRef}
            className="flex-1 p-4 min-h-[300px] outline-none prose prose-sm max-w-none overflow-y-auto"
            contentEditable
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            role="textbox"
            aria-multiline="true"
            style={{
                minHeight: '300px'
            }}
        />
        
        {!value && (
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm select-none">
                {placeholder}
            </div>
        )}
      </div>
    </div>
  );
};