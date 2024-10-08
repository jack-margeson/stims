export class Item {
  static id: number;
  item_id: number;
  metadata: object;
  name: string;
  status: number;
  image: string;

  constructor(
    item_id: number = 0,
    metadata: object = {},
    name: string = '',
    status: number = 0,
    image: string = ''
  ) {
    this.item_id = item_id;
    this.metadata = metadata;
    this.name = name;
    this.status = status;
    this.image = image;
  }

  getItemId(): number {
    return this.item_id;
  }

  setItemId(item_id: number): void {
    this.item_id = item_id;
  }

  getMetadata(): object {
    return this.metadata;
  }

  setMetadata(metadata: object): void {
    this.metadata = metadata;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getStatus(): number {
    return this.status;
  }

  setStatus(status: number): void {
    this.status = status;
  }

  getImage(): string {
    return this.image;
  }

  setImage(image: string): void {
    this.image = image;
  }
}
