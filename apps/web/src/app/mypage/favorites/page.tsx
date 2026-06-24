import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/server/services/auth-service";
import { FavoritesContent } from "./FavoritesContent";

const FAVORITES_PATH = "/mypage/favorites";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!userId) {
    redirect(`/login?redirect=${FAVORITES_PATH}`);
  }

  return <FavoritesContent />;
}
