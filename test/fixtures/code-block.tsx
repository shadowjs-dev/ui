import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";

const source = "const a = 1;\nconst b = 2;\nconst c = 3;\n";

export function Basic(props: { onCopy?: () => void }) {
  return (
    <CodeBlock data-testid="block">
      <CodeBlockHeader data-testid="header">
        <CodeBlockTitle>src/app.ts</CodeBlockTitle>
        <CodeBlockActions data-testid="actions">
          <CodeBlockCopyButton value={source} onCopy={props.onCopy} data-testid="copy" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent data-testid="content">{source}</CodeBlockContent>
      <CodeBlockFooter data-testid="footer">3 lines</CodeBlockFooter>
    </CodeBlock>
  );
}

export function Numbered() {
  return (
    <CodeBlock size="sm" variant="destructive" data-testid="block">
      <CodeBlockActions data-testid="floating">
        <CodeBlockCopyButton value="x" />
      </CodeBlockActions>
      <CodeBlockContent lineNumbers startLine={10} wrap data-testid="content" class="max-h-48">
        {source}
      </CodeBlockContent>
    </CodeBlock>
  );
}

export function Diff() {
  return (
    <CodeBlock>
      <CodeBlockContent data-testid="content" tabindex="-1">
        <CodeBlockLine variant="removed" data-testid="removed">
          const a = 1;
        </CodeBlockLine>
        <CodeBlockLine variant="added" data-testid="added">
          const a = 2;
        </CodeBlockLine>
        <CodeBlockLine variant="highlighted" data-testid="highlighted">
          return a;
        </CodeBlockLine>
        <CodeBlockLine data-testid="plain">done</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  );
}
