import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

export const axiosPrivate = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

export const fetcher = (url: string) =>
	axiosInstance.get(url).then((res) => res.data);

export const fetcherPrivate = (url: string) =>
	axiosPrivate.get(url).then((res) => res.data);
