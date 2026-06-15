import React from 'react'
import type { Block } from '@/lib/blog'

/** Minimal inline formatter: **bold** and [label](url). */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="text-foreground font-semibold">
          {m[1]}
        </strong>
      )
    } else {
      nodes.push(
        <a key={key++} href={m[3]} className="text-brand hover:underline">
          {m[2]}
        </a>
      )
    }
    last = regex.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function BlogContent({ body }: { body: Block[] }) {
  return (
    <div className="space-y-6">
      {body.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={i} className="text-2xl font-semibold text-foreground mt-10 mb-2">
                {block.text}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="text-xl font-semibold text-foreground mt-6 mb-1">
                {block.text}
              </h3>
            )
          case 'ul':
            return (
              <ul key={i} className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            )
          case 'quote':
            return (
              <blockquote
                key={i}
                className="border-l-2 border-brand pl-5 py-1 text-lg text-foreground italic"
              >
                {renderInline(block.text)}
              </blockquote>
            )
          default:
            return (
              <p key={i} className="text-muted leading-relaxed text-[1.05rem]">
                {renderInline(block.text)}
              </p>
            )
        }
      })}
    </div>
  )
}
