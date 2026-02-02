// src/app/api/admin/store/upload/route.ts
import { NextRequest } from "next/server";
import { handleStoreUpload } from "../../../../lib/storeUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return handleStoreUpload(req);
}
