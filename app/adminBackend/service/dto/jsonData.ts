export class JsonData<T> {
  fromCache?: boolean;
  ok: boolean;
  status: "success" | "error";
  message: string;
  errors?: error[];
  data: T;

  constructor(
    ok: boolean,
    status: "success" | "error",
    message: string,
    errors?: error[],
    data?: T,
    fromCache?: boolean,
  ) {
    this.ok = status === "success";
    this.status = status;
    this.message = message;
    this.errors = errors;
    if (data) this.data = data;
    else this.data = {} as T;

    if (fromCache) this.fromCache = fromCache;
    else this.fromCache = false;
  }
}

export type error = {
  fieldId: string;
  field: string;
  message: string;
};
