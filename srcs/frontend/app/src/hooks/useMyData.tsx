import useSWR, { SWRConfiguration } from "swr";
import { fetcherPrivate } from "../utils/fetcher";
import { MyData } from "../types";

export const useMyData = (options?: SWRConfiguration) => {
	const { data, error, isLoading, mutate } = useSWR<MyData>(
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
