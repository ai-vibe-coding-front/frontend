import { cookies } from "next/headers";
import { HomeContent } from "./HomeContent";
import { verifyAccessToken } from "@/server/services/auth-service";

export default async function HomePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const isLoggedIn = accessToken
    ? Boolean(await verifyAccessToken(accessToken))
    : false;

  return <HomeContent isLoggedIn={isLoggedIn} />;
}
