import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { UiStringsProvider } from "@/lib/ui-strings";

const title = "الملف الرئيسي";
const code = 'const greeting = "مرحبا";\nconst done = true;';
const strings = { codeBlock: { copy: "نسخ الشيفرة", copied: "تم النسخ" } };

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <UiStringsProvider strings={strings} locale="ar">
        <CodeBlock data-testid="block">
          <CodeBlockHeader>
            <CodeBlockTitle>{title}</CodeBlockTitle>
            <CodeBlockActions>
              <CodeBlockCopyButton value={code} />
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockContent lineNumbers data-testid="content">
            {code}
          </CodeBlockContent>
        </CodeBlock>
      </UiStringsProvider>
    </div>
  );
}
