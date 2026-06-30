export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-muted p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-heading text-4xl tracking-tight">
          PrepaList<span className="text-accent-foreground">.</span>
        </span>
        <span className="font-heading text-base italic text-muted-foreground">
          Planifie tes repas, simplifie tes courses.
        </span>
      </div>
      {children}
    </div>
  );
}
