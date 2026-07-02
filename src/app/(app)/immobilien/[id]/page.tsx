import { PropertyDetail } from "@/components/properties/detail/property-detail";

export default async function ImmobilienDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyDetail id={id} />;
}
