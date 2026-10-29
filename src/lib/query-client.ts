import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Today's views fetch explicitly (mount, tick events, post-action
			// invalidation) — never refetch just because the window regained focus.
			refetchOnWindowFocus: false,
		},
	},
});
