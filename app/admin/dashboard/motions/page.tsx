export default function MotionsPage() {
  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Motions</h2>
        <p>Motions management interface will be displayed here.</p>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Motion History</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <p>No motion history available.</p>
        </div>
      </div>
    </div>
  )
}

