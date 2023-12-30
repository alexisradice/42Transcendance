export const colorFromStatus = (status: string): string | undefined => {
	switch (status) {
		case "ONLINE":
			return "green";
		case "OFFLINE":
			return "gray";
		case "IN_GAME":
			return "yellow";
	}
};
