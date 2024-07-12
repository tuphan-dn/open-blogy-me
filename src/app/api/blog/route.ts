import { Body, Injectable } from '@/interceptor'
import { NextRequest, NextResponse } from 'next/server'
import { resolve } from 'path'
import { dreelize, trielize } from './tree'
import { z } from 'zod'
import Fuse from 'fuse.js'

const PostDto = z.object({ q: z.string() })

function flattenTree({
  children = [],
  ...node
}: Tree): Array<Omit<Tree, 'children'>> {
  return [node, ...children.map((child) => flattenTree(child)).flat()]
}

class Route {
  @Injectable()
  static async GET() {
    const root = resolve(process.cwd(), './src/app/blog')
    const dree = dreelize(root)
    if (!dree) return NextResponse.json('Not Found', { status: 404 })
    const tree = trielize('', dree)
    return NextResponse.json(tree)
  }

  @Injectable()
  static async POST(
    _req: NextRequest,
    @Body(PostDto) { q }: z.infer<typeof PostDto>,
  ) {
    if (!q || q.length < 3) throw new Error('Bad Reuqest')
    const root = resolve(process.cwd(), './src/app/blog')
    const dree = dreelize(root)
    if (!dree) return NextResponse.json('Not Found', { status: 404 })
    const tree = trielize('', dree)
    const nodes = flattenTree(tree)
    const index = new Fuse(nodes, {
      ignoreLocation: true,
      keys: ['title', 'description', 'content'],
    })
    const re = index.search(q).map(({ item }) => item)
    return NextResponse.json(re)
  }
}

export const { GET, POST } = Route
