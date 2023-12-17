export class HttpException extends Error {
	status: string;
	constructor(message: string, status: number | string) {
		super(message);
		this.status = typeof status === "number" ? status.toString() : status;
	}
}
