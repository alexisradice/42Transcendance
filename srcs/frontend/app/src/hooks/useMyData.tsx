import useSWR from "swr";
import { fetcherPrivate } from "../utils/fetcher";

export const useMyData = () => {
	const { data, error, isLoading, mutate } = useSWR(
		"/user/me",
		fetcherPrivate,
	);

	return {
		user: data,
		isLoading,
		error,
		mutate,
	};
};
