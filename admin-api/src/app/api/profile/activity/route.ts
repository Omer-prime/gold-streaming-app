// src/app/api/activity/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Static for now – later can move to DB
    const activities = [
      {
        id: "rocket-host-video",
        title: "Rocket Host Video Collection",
        shortDescription: "Upload your host video and win big coin rewards.",
        tag: "Event",
        coinReward: 20000,
        link: "/activity/rocket-host-video", // for frontend linking
      },
      // you can add more activities here later
    ];

    return NextResponse.json({ activities }, { status: 200 });
  } catch (err) {
    console.error("activity list error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
