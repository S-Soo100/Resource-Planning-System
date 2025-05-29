export type IAuth = {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  accessLevel: "user" | "admin" | "supplier" | "moderator";
};
