import { CollectionsWorkspace } from "@/features/collections/components/CollectionsWorkspace";

export default function CollectionsPage() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
          Collections
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Track due, overdue and upcoming customer collections.
        </p>
      </div>

      <CollectionsWorkspace />
    </div>
  );
}
