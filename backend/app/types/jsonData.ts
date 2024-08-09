export class JsonData<T> {
  private ok: boolean;
  private status: "success" | "error";
  private message: string;
  private error?: string;
  data?: T;

  constructor(
    ok: boolean,
    status: "success" | "error",
    message: string,
    error?: string,
    data?: T,
  ) {
    this.ok = status === "success";
    this.status = status;
    this.message = message;
    this.error = error;
    this.data = data;
  }
}
