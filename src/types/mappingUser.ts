export interface IMappingUser {
  id: number;
  mapping_id: string;
  userId: number;
  teamId: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
