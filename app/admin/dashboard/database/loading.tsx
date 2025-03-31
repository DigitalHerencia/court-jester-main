export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl font-bold">Loading database information...</div>
        <div className="text-foreground/60">Please wait while we fetch the database data.</div>
      </div>
    </div>
  )
}

