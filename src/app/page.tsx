import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"

const ColorGrid = dynamic(() => import('@/components/ColorGrid'), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-screen" />
})

export default function Home() {
  return (
    <main>
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <ColorGrid />
      </Suspense>
    </main>
  )
}