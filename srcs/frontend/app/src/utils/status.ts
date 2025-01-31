export const getStatusColor = (status: string): string | undefined => {
	switch (status) {
		case "ONLINE":
			return "green";
		case "OFFLINE":
			return "gray";
		case "IN_QUEUE":
			return "yellow";
		case "IN_GAME":
			return "red";
	}
};

export const getStatusText = (status: string): string | undefined => {
	switch (status) {
		case "ONLINE":
			return "Online";
		case "OFFLINE":
			return "Offline";
		case "IN_QUEUE":
			return "In queue";
		case "IN_GAME":
			return "In game";
	}
};
