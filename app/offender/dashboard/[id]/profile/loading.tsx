// app/offender/dashboard/[id]/profile/loading.tsx
export default function Loading() {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center animate-pulse">
          <h2 className="text-3xl font-bold text-muted">Loading Profile...</h2>
          <p className="text-muted-foreground mt-2 font-kings">Retrieving your case file from the depths of the system.</p>
        </div>
      </div>
    );
  }
  