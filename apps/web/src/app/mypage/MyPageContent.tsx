"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { ApiClientError, apiClient } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6 4l4 4-4 4"
      stroke="#3f2a24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SavedHeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5C17 12.5 10 17 10 17Z"
      fill="#7d543c"
      stroke="#7d543c"
      strokeWidth="1.5"
    />
  </svg>
);

export function MyPageContent() {
  const router = useRouter();
  const { user, isLoading, error, isUnauthorized } = useCurrentUser();
  const [logoutErrorMessage, setLogoutErrorMessage] = useState<string | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isUnauthorized) {
      router.replace(`${ROUTES.login}?redirect=${ROUTES.mypage}`);
    }
  }, [isUnauthorized, router]);

  const userErrorMessage = useMemo(() => {
    if (!error || isUnauthorized) {
      return null;
    }

    if (
      error instanceof ApiClientError &&
      error.errorCode === "USER_NOT_FOUND"
    ) {
      return "사용자 정보를 찾을 수 없습니다.";
    }

    return "사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  }, [error, isUnauthorized]);

  const errorMessage = logoutErrorMessage ?? userErrorMessage;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutErrorMessage(null);

    try {
      await apiClient<null>("/api/auth/logout", {
        method: "POST",
      });
      router.replace(ROUTES.home);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(ROUTES.home);
        router.refresh();
        return;
      }

      setLogoutErrorMessage(
        "로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-[#f0ebe3] min-h-screen flex items-center justify-center">
      <div className="bg-[rgba(251,249,244,0.95)] w-[390px] min-h-screen shadow-[0px_16px_36px_0px_rgba(51,31,15,0.18)] flex flex-col">
        <div className="bg-[#faf7f2] h-[56px] flex items-center justify-between px-5 shrink-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="size-10 flex items-center justify-center rounded-full"
          >
            <Image
              src="/icons/back-arrow.svg"
              alt="뒤로가기"
              width={16}
              height={16}
            />
          </button>
          <p className="font-bold text-[20px] text-[#251e19] leading-[28px] tracking-[-0.5px]">
            마이페이지
          </p>
          <div className="size-10" />
        </div>

        <div className="flex-1 flex flex-col gap-6 items-center px-5 pt-3 pb-6 overflow-y-auto">
          <div className="bg-[#fefefe] shadow-[0px_2px_6px_0px_rgba(63,42,36,0.06)] rounded-[32px] w-[350px] flex flex-col items-center justify-center p-6 gap-1">
            {user ? (
              <>
                <p className="font-bold text-[22px] text-[#251e19] leading-[30px] tracking-[-0.3px]">
                  {user.nickname}
                </p>
                <p className="font-normal text-[14px] text-[#8c6e63] leading-[20px] tracking-[0.14px]">
                  {user.email}
                </p>
              </>
            ) : isLoading ? (
              <>
                <div className="h-[30px] w-24 rounded bg-[#eee7df] animate-pulse" />
                <div className="h-5 w-40 rounded bg-[#eee7df] animate-pulse" />
              </>
            ) : (
              <>
                <p className="font-bold text-[22px] text-[#251e19] leading-[30px]">
                  -
                </p>
                <p className="font-normal text-[14px] text-[#8c6e63] leading-[20px]">
                  -
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push(ROUTES.mypageFavorites)}
            className="w-full flex items-center gap-4 p-6 text-left"
          >
            <div className="bg-[#f0e4d4] rounded-full size-12 flex items-center justify-center shrink-0">
              <SavedHeartIcon />
            </div>

            <div className="flex flex-col gap-1 flex-1 items-start">
              <p className="font-medium text-[14px] text-[#716456] leading-[20px] tracking-[0.28px]">
                저장한 관심 행사
              </p>
              <p className="font-bold text-[20px] text-[#251e19] leading-[28px] tracking-[-0.2px]">
                {user
                  ? `${user.favoriteCount}개`
                  : isLoading
                    ? "불러오는 중"
                    : "-개"}
              </p>
            </div>

            <ChevronRightIcon />
          </button>

          {errorMessage && (
            <p
              role="alert"
              className="px-4 text-center text-[13px] leading-5 text-red-600"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-center py-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="font-medium text-[14px] text-[#8c6e63] leading-[20px] tracking-[0.28px] underline underline-offset-2 disabled:opacity-50"
            >
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>

        <div className="shrink-0">
          <BottomNav
            activeTab="my"
            onTabChange={(tab) => {
              if (tab === "home") router.push(ROUTES.home);
              if (tab === "curation") router.push(ROUTES.questions);
              if (tab === "recommend") router.push(ROUTES.recommendations);
            }}
          />
        </div>
      </div>
    </div>
  );
}
