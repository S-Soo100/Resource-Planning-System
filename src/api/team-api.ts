/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import { Team, CreateTeamRequest, UpdateTeamRequest } from "@/types/team";

export const teamApi = {
  // 팀 생성
  createTeam: async (data: CreateTeamRequest): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.post<Team>("/team", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "팀 생성에 실패했습니다." };
    }
  },

  // 모든 팀 조회
  getAllTeams: async (): Promise<ApiResponse<Team[]>> => {
    try {
      const response = await api.get<Team[]>("/team");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "팀 목록 조회에 실패했습니다." };
    }
  },

  // 단일 팀 조회
  getTeam: async (id: string): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.get<Team>(`/team/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "팀 조회에 실패했습니다." };
    }
  },

  // 팀 정보 수정
  updateTeam: async (
    id: string,
    data: UpdateTeamRequest
  ): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.patch<Team>(`/team/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "팀 정보 수정에 실패했습니다." };
    }
  },

  // 팀 삭제
  deleteTeam: async (id: string): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.delete<Team>(`/team/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "팀 삭제에 실패했습니다." };
    }
  },

  // 팀에 사용자 추가
  addUserToTeam: async (
    teamId: string,
    userId: string
  ): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.post<Team>(`/team/${teamId}/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "사용자 추가에 실패했습니다." };
    }
  },

  // 팀에서 사용자 제거
  removeUserFromTeam: async (
    teamId: string,
    userId: string
  ): Promise<ApiResponse<Team>> => {
    try {
      const response = await api.delete<Team>(`/team/${teamId}/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "사용자 제거에 실패했습니다." };
    }
  },
};
