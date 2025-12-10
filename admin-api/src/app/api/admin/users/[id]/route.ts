// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE /api/admin/users/:id
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 required in Next 15 app router

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid user id" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // safety: don’t delete admins from this panel
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin users cannot be deleted from this panel" },
        { status: 400 }
      );
    }

    // 🔥 Hard delete – remove all dependent rows first
    await prisma.$transaction(async (tx) => {
      // Wallet
      await tx.wallet.deleteMany({ where: { userId: id } });

      // Streams + stream messages + gifts
      await tx.stream.deleteMany({ where: { hostId: id } });
      await tx.message.deleteMany({ where: { senderId: id } });
      await tx.giftTransaction.deleteMany({
        where: {
          OR: [{ senderId: id }, { receiverId: id }],
        },
      });

      // Follows / friendships
      await tx.follow.deleteMany({
        where: {
          OR: [{ followerId: id }, { followingId: id }],
        },
      });
      await tx.friendship.deleteMany({
        where: {
          OR: [{ userAId: id }, { userBId: id }],
        },
      });

      // Profile visits
      await tx.profileVisit.deleteMany({
        where: {
          OR: [{ visitorId: id }, { visitedId: id }],
        },
      });

      // Points + settings
      await tx.userPointLedger.deleteMany({ where: { userId: id } });
      await tx.userSettings.deleteMany({ where: { userId: id } });

      // Blocks
      await tx.userBlock.deleteMany({
        where: {
          OR: [{ userId: id }, { blockedId: id }],
        },
      });

      // Honors
      await tx.userHonor.deleteMany({ where: { userId: id } });

      // Moments + their likes/comments/saves
      await tx.momentLike.deleteMany({ where: { userId: id } });
      await tx.momentComment.deleteMany({ where: { userId: id } });
      await tx.momentSave.deleteMany({ where: { userId: id } });
      await tx.moment.deleteMany({ where: { userId: id } });

      // Fan club
      await tx.fanClubMember.deleteMany({ where: { userId: id } });
      await tx.fanClub.deleteMany({ where: { ownerId: id } });

      // Live applications
      await tx.liveApplication.deleteMany({ where: { userId: id } });

      // PK battles
      await tx.pKBattle.deleteMany({
        where: {
          OR: [{ hostId: id }, { opponentId: id }],
        },
      });

      // Chat (threads + messages)
      await tx.chatMessage.deleteMany({ where: { senderId: id } });
      await tx.chatThread.deleteMany({
        where: {
          OR: [{ userAId: id }, { userBId: id }],
        },
      });

      // Notifications
      await tx.notification.deleteMany({ where: { userId: id } });

      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
