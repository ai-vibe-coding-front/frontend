import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { verifyAccessToken } from '@/server/services/auth-service';
import { MyPageContent } from './MyPageContent';

export default async function MyPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!userId) {
    redirect(`${ROUTES.login}?redirect=${ROUTES.mypage}`);
  }

  return <MyPageContent />;
}
