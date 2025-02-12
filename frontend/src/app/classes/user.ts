export class User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  // Password field is only used for registration--*never* stored in the runtime for login.
  password: string;
  created_at: Date;

  constructor(
    user: {
      user_id?: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
      created_at?: Date;
    } = {}
  ) {
    this.user_id = user.user_id || -1;
    this.username = user.username || '';
    this.first_name = user.first_name || '';
    this.last_name = user.last_name || '';
    this.email = user.email || '';
    this.password = user.password || '';
    this.created_at = user.created_at || new Date(-1);
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

  getPassword(): string {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }
}
