import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { verifyAccessToken } from "@/server/services/auth-service";
import { FavoritesContent } from "./FavoritesContent";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!userId) {
    redirect(`${ROUTES.login}?redirect=${ROUTES.mypageFavorites}`);
  }

  return <FavoritesContent />;
}
