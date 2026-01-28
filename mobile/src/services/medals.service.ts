import api from "../config/api.config";

export type MedalDTO = {
  key: string;
  title: string;
  icon: string;
  iconKind: "IONICON" | "IMAGE_URL";
  obtained: boolean;
  obtainedAt?: string | null;
  description?: string | null;
  progress?: { current: number; target: number } | null;
};

export type MedalWallResponse = {
  user: {
    id: string;
    username: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    level: number;
  };
  summary: {
    obtainedCount: number;
    total: number;
    totalLikes: number;
    followersCount: number;
  };
  medals: MedalDTO[];
};

export async function getMedalWall(userId: string) {
  const { data } = await api.get<MedalWallResponse>("/api/profile/medals", {
    params: { userId },
  });
  return data;
}
