"use client";

import PartnerDetailPage from "../../khach-hang/[id]/page";

export const dynamic = "force-dynamic";

export default function PartnerDetailAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <PartnerDetailPage params={params} />;
}
