import { Item } from './item';

export class Book extends Item {
  title: string;
  author: string;
  description: string;
  genre: string;
  published: Date;
  pages: number;

  constructor(
    title: string = '',
    author: string = '',
    description: string = '',
    genre: string = '',
    published: Date = new Date(),
    pages: number = 0
  ) {
    super();
    this.title = title;
    this.author = author;
    this.description = description;
    this.genre = genre;
    this.published = published;
    this.pages = pages;
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  getAuthor(): string {
    return this.author;
  }

  setAuthor(author: string): void {
    this.author = author;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getGenre(): string {
    return this.genre;
  }

  setGenre(genre: string): void {
    this.genre = genre;
  }

  getPublished(): Date {
    return this.published;
  }

  setPublished(published: Date): void {
    this.published = published;
  }

  getPages(): number {
    return this.pages;
  }

  setPages(pages: number): void {
    this.pages = pages;
  }
}
