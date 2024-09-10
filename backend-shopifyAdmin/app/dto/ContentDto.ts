export class ContentDto {
  private id: number;
  private type: "text" | "file";
  private value: string; //Either file url or text

  constructor(id: number, type: "text" | "file", value: string) {
    this.id = id;
    this.type = type;
    this.value = value;
  }

  public getId(): number {
    return this.id;
  }

  public getType(): "text" | "file" {
    return this.type;
  }

  public length(): number {
    return this.value.length;
  }
}
