import { useRouterState } from "@tanstack/react-router";

export function useNotFound() {
  const matches = useRouterState({ select: (state) => state.matches });

  return {
    isNotFound: matches.some(
      (match) => match.status === "notFound" || match._notFound,
    ),
  };
}
