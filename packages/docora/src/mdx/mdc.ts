import type { Element, ElementContent } from 'hast'
import type { Handlers, State } from 'mdast-util-to-hast'

interface ComponentNode {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  children?: unknown[]
}

function toElement(
  state: State,
  node: ComponentNode,
  tagName: string,
  properties: Element['properties'] = {},
): Element {
  return {
    type: 'element',
    tagName,
    properties: { ...(node.attributes as Element['properties']), ...properties },
    children: state.all(node as never) as ElementContent[],
  }
}

export const mdcHandlers = {
  containerComponent: (state: State, node: ComponentNode) =>
    toElement(state, node, node.name ?? 'div'),
  textComponent: (state: State, node: ComponentNode) => toElement(state, node, node.name ?? 'span'),
  leafComponent: (state: State, node: ComponentNode) => toElement(state, node, node.name ?? 'div'),
  componentContainerSection: (state: State, node: ComponentNode) =>
    toElement(state, node, 'mdc-slot', { 'data-slot': node.name ?? '' }),
} as unknown as Handlers
