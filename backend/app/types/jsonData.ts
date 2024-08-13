export class JsonData<T> {
  ok: boolean;
  status: "success" | "error";
  message: string;
  error?: string;
  data: T;

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
    if (data) this.data = data;
    else this.data = {} as T;
  }
}
