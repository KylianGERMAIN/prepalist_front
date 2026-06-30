export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-2xl font-bold tracking-tight">PrepaList</span>
        <span className="text-sm text-muted-foreground">
          Planifie tes repas, simplifie tes courses.
        </span>
      </div>
      {children}
    </div>
  );
}
