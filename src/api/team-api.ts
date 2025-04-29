/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  IUserTeam,
  UserTeamMapping,
} from "@/types/team";

export const teamApi = {
  // 팀 생성
  createTeam: async (
    data: CreateTeamRequest
  ): Promise<ApiResponse<IUserTeam>> => {
    try {
      const response = await api.post<{ success: boolean; data: IUserTeam }>(
        "/team",
        data
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 생성에 실패했습니다." };
    }
  },

  // 모든 팀 조회
  getAllTeams: async (): Promise<ApiResponse<Team[]>> => {
    try {
      const response = await api.get<{ success: boolean; data: Team[] }>(
        "/team"
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 목록 조회에 실패했습니다." };
    }
  },

  // 단일 팀 조회
  getTeam: async (id: number): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.get<{ success: boolean; data: Team }>(
        `/team/${id}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 조회에 실패했습니다." };
    }
  },

  // 팀 정보 수정
  updateTeam: async (
    id: number,
    data: UpdateTeamRequest
  ): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.patch<{ success: boolean; data: Team }>(
        `/team/${id}`,
        data
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 정보 수정에 실패했습니다." };
    }
  },

  // 팀 삭제
  deleteTeam: async (id: number): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.delete<{ success: boolean; data: Team }>(
        `/team/${id}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 삭제에 실패했습니다." };
    }
  },

  // 팀에 사용자 추가
  addUserToTeam: async (
    teamId: number,
    userId: number
  ): Promise<ApiResponse<UserTeamMapping>> => {
    try {
      const response = await api.post<{
        success: boolean;
        data: UserTeamMapping;
      }>(`/team/${teamId}/user/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "사용자 추가에 실패했습니다." };
    }
  },

  // 팀에서 사용자 제거
  removeUserFromTeam: async (
    teamId: number,
    userId: number
  ): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.delete<{ success: boolean; data: Team }>(
        `/team/${teamId}/user/${userId}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "사용자 제거에 실패했습니다." };
    }
  },
};
