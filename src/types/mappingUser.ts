export interface IMappingUser {
  id: number;
  mapping_id: string;
  userId: number;
  teamId: number;
  // 팀별 권한 필드 (v2.3 - 백엔드 TEAM_ROLE_API)
  accessLevel?: "user" | "moderator" | "admin" | "supplier";
  isAdmin?: boolean;
  restrictedWhs?: string | null;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
