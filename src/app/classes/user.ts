export class User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: Date;

  constructor(user: {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
  }) {
    this.user_id = user.user_id;
    this.username = user.username;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.created_at = user.created_at;
  }

  getUserId(): number {
    return this.user_id;
  }

  getUsername(): string {
    return this.username;
  }

  getFirstName(): string {
    return this.first_name;
  }

  getLastName(): string {
    return this.last_name;
  }

  getEmail(): string {
    return this.email;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }
}
