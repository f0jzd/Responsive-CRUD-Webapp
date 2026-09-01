export interface Book {
  id: number;
  title: string;
  author: string;
  publicationDate: string;
  description?: string;
  coverImageUrl?: string;
  creatorId: number;
  creatorEmail?: string;
  createdAtUtc: string;
}

export interface BookInput {
  title: string;
  author: string;
  publicationDate: string;
  description?: string;
  coverImageUrl?: string;
}

export interface Quote {
  id: number;
  ownerId: number;
  text: string;
  author?: string;
  createdAtUtc: string;
}

export interface QuoteInput {
  text: string;
  author?: string;
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
