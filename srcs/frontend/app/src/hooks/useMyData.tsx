import useSWR, { SWRConfiguration } from "swr";
import { fetcherPrivate } from "../utils/fetcher";

export const useMyData = (options?: SWRConfiguration) => {
	const { data, error, isLoading, mutate } = useSWR(
		"/user/me",
		fetcherPrivate,
		options,
	);

	return {
		user: data,
		isLoading,
		error,
		mutate,
	};
};
