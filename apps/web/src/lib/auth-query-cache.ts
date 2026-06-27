import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function removeAuthScopedQueries(queryClient: QueryClient) {
  queryClient.removeQueries({
    queryKey: queryKeys.users.all(),
    exact: false,
  });
  queryClient.removeQueries({
    queryKey: queryKeys.favorites.all(),
    exact: false,
  });
  queryClient.removeQueries({
    queryKey: queryKeys.recommendations.all(),
    exact: false,
  });
}
