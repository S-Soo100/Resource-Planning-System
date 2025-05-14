/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  TeamItem,
  CreateTeamItemDto,
  DeleteTeamItemResponse,
} from "@/types/(item)/team-item";

export const teamItemsApi = {
  getTeamItemsByTeam: async (
    teamId: number
  ): Promise<ApiResponse<TeamItem[]>> => {
    try {
      const response = await api.get(`/team-item/team/${teamId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 아이템 목록 획득에 실패했습니다." };
    }
  },

  createTeamItem: async (
    teamItemDto: CreateTeamItemDto
  ): Promise<ApiResponse<TeamItem>> => {
    try {
      const response = await api.post("/team-item", teamItemDto);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 아이템 생성에 실패했습니다." };
    }
  },

  updateTeamItem: async (
    id: number,
    teamItemDto: CreateTeamItemDto
  ): Promise<ApiResponse<TeamItem>> => {
    try {
      const response = await api.patch(`/team-item/${id}`, teamItemDto);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 아이템 수정에 실패했습니다." };
    }
  },

  deleteTeamItem: async (
    id: number
  ): Promise<ApiResponse<DeleteTeamItemResponse>> => {
    try {
      const response = await api.delete(`/team-item/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "팀 아이템 삭제에 실패했습니다." };
    }
  },
};
