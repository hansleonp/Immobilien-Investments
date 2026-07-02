export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ComingSoon({ milestone }: { milestone: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-white text-sm text-neutral-400">
      Dieser Bereich entsteht in {milestone}.
    </div>
  );
}
