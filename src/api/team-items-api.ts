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

  // 이미지 업로드 (최대 5MB, JPG/JPEG/PNG/GIF/WebP)
  uploadTeamItemImage: async (
    id: number,
    file: File
  ): Promise<ApiResponse<TeamItem>> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(`/team-item/${id}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "이미지 업로드에 실패했습니다." };
    }
  },

  // 이미지 삭제
  deleteTeamItemImage: async (
    id: number
  ): Promise<ApiResponse<TeamItem>> => {
    try {
      const response = await api.delete(`/team-item/${id}/image`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "이미지 삭제에 실패했습니다." };
    }
  },
};
