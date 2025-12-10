// src/app/api/activity/rocket-host-video/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // You can later make start/end dynamic or from DB
    const now = new Date();
    const startAt = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

    const event = {
      id: "rocket-host-video",
      title: "Rocket Host Video Collection",
      bannerImage:
        "https://your-cdn.com/rocket-host-banner.png", // replace with your image
      coinReward: 20000,
      startAt,
      endAt,
      // For your purple “Content” tab
      content: {
        heading: "Upload your best host video and win rewards!",
        points: [
          "Record a short, high-quality video as a host.",
          "Follow the platform rules and avoid prohibited content.",
          "Submit the video and wait for review approval.",
        ],
      },
      // For your “Rules” tab
      rules: {
        heading: "Event rules",
        points: [
          "Each user can only participate with original content.",
          "Videos violating community guidelines will be rejected.",
          "Coin rewards will be credited within 72 hours after review.",
          "The platform reserves the right to interpret final rules.",
        ],
      },
    };

    return NextResponse.json(event, { status: 200 });
  } catch (err) {
    console.error("rocket-host event error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
