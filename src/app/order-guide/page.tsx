"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  Phone,
  Accessibility,
} from "lucide-react";

export default function OrderGuidePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<
    "package" | "wheelchair" | "individual" | null
  >(null);

  // 현재 팀 정보 가져오기
  const { team: currentTeam } = useCurrentTeam();

  // 휠체어 관련 창고가 있는지 확인
  const hasWheelchairWarehouses =
    currentTeam?.warehouses?.some((warehouse) =>
      warehouse.warehouseName.includes("휠체어")
    ) || false;

  const steps = [
    {
      id: 0,
      title: "발주 기능 안내",
      description: "설명이 필요한 발주 형식을 선택하고 다음 버튼을 눌러주세요",
      content: (
        <div
          className={`grid grid-cols-1 gap-4 sm:gap-6 ${
            hasWheelchairWarehouses ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {/* 휠리엑스 패키지 발주 */}
          <Card
            className={`p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedType === "package"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : ""
            }`}
            onClick={() => setSelectedType("package")}
          >
            <div className="text-center">
              <Package className="mx-auto mb-2 w-12 h-12 text-blue-600 sm:mb-4 sm:w-16 sm:h-16" />
              <h3 className="mb-1 text-lg font-semibold sm:mb-2 sm:text-xl">
                휠리엑스 패키지 발주
              </h3>
              <p className="mb-2 text-sm text-gray-600 sm:mb-4 sm:text-base">
                미리 구성된 패키지 단위로 발주합니다
              </p>
              <div className="space-y-1 text-xs text-gray-500 sm:text-sm">
                <div className="flex gap-1 justify-center items-center sm:gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>빠른 발주 처리</span>
                </div>
                <div className="flex gap-1 justify-center items-center sm:gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>일관된 품목 구성</span>
                </div>
                <div className="flex gap-1 justify-center items-center sm:gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>수량 조절 가능</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 휠체어 발주 - 휠체어 관련 창고가 있을 때만 표시 */}
          {hasWheelchairWarehouses && (
            <Card
              className={`p-4 sm:p-6 cursor-pointer transition-all transform hover:scale-105 hover:shadow-2xl ${
                selectedType === "wheelchair"
                  ? "ring-4 ring-purple-500 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border-purple-300 shadow-2xl"
                  : "border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-25 to-indigo-25"
              }`}
              onClick={() => setSelectedType("wheelchair")}
            >
              <div className="relative text-center">
                {selectedType === "wheelchair" && (
                  <div className="absolute -top-2 -right-2 px-2 py-1 text-xs font-bold text-white bg-purple-600 rounded-full shadow-lg">
                    추천
                  </div>
                )}
                <div className="flex justify-center items-center mx-auto mb-2 w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg sm:mb-4 sm:w-18 sm:h-18">
                  <Accessibility className="w-8 h-8 text-purple-700 sm:w-12 sm:h-12" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-purple-800 sm:mb-2 sm:text-xl">
                  휠체어 발주
                </h3>
                <p className="mb-2 text-sm font-medium text-purple-700 sm:mb-4 sm:text-base">
                  휠체어 전용 품목을 선택하여 발주합니다
                </p>
                <div className="space-y-1 text-xs text-purple-800 sm:text-sm">
                  <div className="flex gap-1 justify-center items-center sm:gap-2">
                    <div className="flex justify-center items-center w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-bold">휠체어 전용 품목</span>
                  </div>
                  <div className="flex gap-1 justify-center items-center sm:gap-2">
                    <div className="flex justify-center items-center w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-bold">빠른 선택 도구</span>
                  </div>
                  <div className="flex gap-1 justify-center items-center sm:gap-2">
                    <div className="flex justify-center items-center w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-bold">맞춤형 수량</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 개별 품목 발주 */}
          <Card
            className={`p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedType === "individual"
                ? "ring-2 ring-green-500 bg-green-50"
                : ""
            }`}
            onClick={() => setSelectedType("individual")}
          >
            <div className="text-center">
              <ShoppingCart className="mx-auto mb-2 w-12 h-12 text-green-600 sm:mb-4 sm:w-16 sm:h-16" />
              <h3 className="mb-1 text-lg font-semibold sm:mb-2 sm:text-xl">
                개별 품목 발주
              </h3>
              <p className="mb-2 text-sm text-gray-600 sm:mb-4 sm:text-base">
                원하는 품목을 개별적으로 선택하여 발주합니다
              </p>
              <div className="space-y-1 text-xs text-gray-500 sm:text-sm">
                <div className="flex gap-1 justify-center items-center sm:gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>유연한 품목 선택</span>
                </div>
                <div className="flex gap-1 justify-center items-center sm:gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>개별 수량 설정</span>
                </div>
                <div className="flex gap-1 justify-center items-center sm:gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>맞춤형 발주</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 1,
      title:
        selectedType === "package"
          ? "패키지 발주 방법"
          : selectedType === "wheelchair"
          ? "휠체어 발주 방법"
          : "개별 품목 발주 방법",
      description:
        selectedType === "package"
          ? "패키지 발주의 단계별 사용법을 안내합니다"
          : selectedType === "wheelchair"
          ? "휠체어 발주의 단계별 사용법을 안내합니다"
          : "개별 품목 발주의 단계별 사용법을 안내합니다",
      content:
        selectedType === "package" ? (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex gap-3 items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="mb-2 font-semibold text-blue-800">
                    패키지 발주란?
                  </h4>
                  <p className="text-sm text-blue-700">
                    자주 사용되는 품목들을 미리 묶어둔 패키지를 선택하여 한 번에
                    발주하는 방식입니다. 정비 작업에 필요한 모든 품목이 포함되어
                    있어 빠르고 효율적인 발주가 가능합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">창고 선택</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    발주할 창고를 선택합니다. 접근 권한이 있는 창고만
                    표시됩니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">예시:</span> &quot;서울 본사
                    창고&quot;, &quot;부산 지점 창고&quot;
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">패키지 선택</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    사용할 패키지를 선택합니다. 패키지명과 포함된 품목을 확인할
                    수 있습니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">예시:</span> &quot;엔진 오일
                    교체 패키지&quot;, &quot;브레이크 패드 교체 패키지&quot;
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">수량 설정</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    패키지 수량을 설정합니다. + / - 버튼으로 조절 가능합니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">예시:</span> 1개, 2개, 3개...
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">배송 정보 입력</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    수령인, 연락처, 배송지 주소를 입력합니다.
                  </p>
                  <div className="p-3 space-y-1 text-sm bg-gray-100 rounded">
                    <div>
                      <span className="font-medium">수령인:</span> 홍길동
                    </div>
                    <div>
                      <span className="font-medium">연락처:</span> 010-1234-5678
                    </div>
                    <div>
                      <span className="font-medium">주소:</span> 서울시
                      강남구...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">증빙서류 업로드</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    발주서, 견적서 등 필요한 증빙서류를 업로드합니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">필수:</span> 발주서, 견적서,
                    계약서 등
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">발주 요청</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    모든 정보를 확인한 후 발주를 요청합니다.
                  </p>
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded">
                    <span className="font-medium">완료:</span> 발주 요청이
                    접수되었습니다.
                  </div>
                  <div className="p-2 mt-2 text-xs text-blue-700 bg-blue-50 rounded border border-blue-200">
                    📧 <strong>알림:</strong> 요청자, 승인권자, 관리자에게
                    이메일 알림이 자동 발송됩니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedType === "wheelchair" ? (
          <div className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex gap-3 items-start">
                <div className="flex justify-center items-center w-6 h-6 bg-purple-100 rounded-full">
                  🦽
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-purple-800">
                    휠체어 발주란?
                  </h4>
                  <p className="text-sm text-purple-700">
                    휠체어 관련 전용 품목을 쉽고 빠르게 선택하여 발주하는
                    방식입니다. 휠체어 부품, 악세서리, 정비용품 등을 효율적으로
                    관리할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 rounded-lg border border-purple-200 bg-purple-25">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold text-purple-800">
                    휠체어 본체 품목 선택
                  </h4>
                  <p className="mb-2 text-sm text-gray-600">
                    휠체어 본체 관련 품목을 선택합니다.
                  </p>
                  <div className="p-3 text-sm bg-purple-50 rounded border border-purple-100">
                    <span className="font-medium">예시:</span> &quot;K-MS2 42/42
                    - 재고: 8개&quot;
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border border-purple-200 bg-purple-25">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold text-purple-800">
                    악세사리품 선택
                  </h4>
                  <p className="mb-2 text-sm text-gray-600">
                    휠체어 악세사리 및 부가 옵션 품목을 선택합니다. 쿠션, 벨트
                    등 다양한 옵션을 추가할 수 있습니다.
                  </p>
                  <div className="p-3 text-sm bg-purple-50 rounded border border-purple-100">
                    <span className="font-medium">예시:</span> 등받이 쿠션 1개,
                    안전벨트 1개, 수납 가방 1개
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border border-purple-200 bg-purple-25">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold text-purple-800">
                    배송 정보 입력
                  </h4>
                  <p className="mb-2 text-sm text-gray-600">
                    수령인, 연락처, 배송지 주소를 입력합니다. 휠체어 사용자의
                    특별 요청사항도 기록할 수 있습니다.
                  </p>
                  <div className="p-3 space-y-1 text-sm bg-purple-50 rounded border border-purple-100">
                    <div>
                      <span className="font-medium">수령인:</span> 김휠체어
                    </div>
                    <div>
                      <span className="font-medium">연락처:</span> 010-1234-5678
                    </div>
                    <div>
                      <span className="font-medium">주소:</span> 서울시
                      강남구...
                    </div>
                    <div>
                      <span className="font-medium">특별요청:</span> 1층 현관
                      배송 요청
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border border-purple-200 bg-purple-25">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold text-purple-800">
                    증빙서류 업로드
                  </h4>
                  <p className="mb-2 text-sm text-gray-600">
                    발주서, 견적서, 휠체어 사용자 확인서 등 필요한 증빙서류를
                    업로드합니다.
                  </p>
                  <div className="p-3 text-sm bg-purple-50 rounded border border-purple-100">
                    <span className="font-medium">필수:</span> 발주서, 견적서,
                    휠체어 사용자 확인서
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border border-purple-200 bg-purple-25">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold text-purple-800">
                    발주 요청
                  </h4>
                  <p className="mb-2 text-sm text-gray-600">
                    모든 정보를 확인한 후 휠체어 전용 발주를 요청합니다.
                  </p>
                  <div className="p-3 text-sm text-purple-700 bg-purple-100 rounded border border-purple-200">
                    <span className="font-medium">완료:</span> 휠체어 발주
                    요청이 접수되었습니다. 🦽
                  </div>
                  <div className="p-2 mt-2 text-xs text-purple-700 bg-purple-50 rounded border border-purple-200">
                    📧 <strong>알림:</strong> 요청자, 승인권자, 관리자, 휠체어
                    전담팀에게 이메일 알림이 자동 발송됩니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex gap-3 items-start">
                <Info className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="mb-2 font-semibold text-green-800">
                    개별 품목 발주란?
                  </h4>
                  <p className="text-sm text-green-700">
                    필요한 품목을 개별적으로 선택하여 발주하는 방식입니다. 특정
                    품목만 필요하거나 패키지에 없는 품목을 발주할 때 사용합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">창고 선택</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    발주할 창고를 선택합니다. 접근 권한이 있는 창고만
                    표시됩니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">예시:</span> &quot;서울 본사
                    창고&quot;, &quot;부산 지점 창고&quot;
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">품목 선택</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    발주할 품목을 하나씩 선택합니다. 품목명, 코드, 현재 재고를
                    확인할 수 있습니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">예시:</span> &quot;엔진 오일
                    (EO001) - 재고: 15개&quot;
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">수량 설정</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    각 품목별로 필요한 수량을 설정합니다. + / - 버튼으로 조절
                    가능합니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">예시:</span> 엔진 오일 5개,
                    브레이크 패드 2세트
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">배송 정보 입력</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    수령인, 연락처, 배송지 주소를 입력합니다.
                  </p>
                  <div className="p-3 space-y-1 text-sm bg-gray-100 rounded">
                    <div>
                      <span className="font-medium">수령인:</span> 홍길동
                    </div>
                    <div>
                      <span className="font-medium">연락처:</span> 010-1234-5678
                    </div>
                    <div>
                      <span className="font-medium">주소:</span> 서울시
                      강남구...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">증빙서류 업로드</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    발주서, 견적서 등 필요한 증빙서류를 업로드합니다.
                  </p>
                  <div className="p-3 text-sm bg-gray-100 rounded">
                    <span className="font-medium">필수:</span> 발주서, 견적서,
                    계약서 등
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg border">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold">발주 요청</h4>
                  <p className="mb-2 text-sm text-gray-600">
                    모든 정보를 확인한 후 발주를 요청합니다.
                  </p>
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded">
                    <span className="font-medium">완료:</span> 발주 요청이
                    접수되었습니다.
                  </div>
                  <div className="p-2 mt-2 text-xs text-blue-700 bg-blue-50 rounded border border-blue-200">
                    📧 <strong>알림:</strong> 요청자, 승인권자, 관리자에게
                    이메일 알림이 자동 발송됩니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
    },
    {
      id: 2,
      title: "주의사항 및 팁",
      description: "발주 시 알아두어야 할 중요한 정보들",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="mb-2 font-semibold text-yellow-800">주의사항</h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• 발주 전 현재 재고를 반드시 확인하세요</li>
                  <li>• 증빙서류는 반드시 업로드해야 합니다</li>
                  <li>• 배송 정보는 정확하게 입력해주세요</li>
                  <li>
                    • 발주 요청 후 상태는 &apos;발주 기록&apos;에서 확인할 수
                    있습니다
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 이메일 알림 안내 - 눈에 띄게 강조 */}
          <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-300 shadow-lg">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-blue-600 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="mb-3 text-lg font-bold text-blue-900">
                  📧 이메일 알림 서비스
                </h4>
                <p className="mb-3 font-medium text-blue-800">
                  발주 요청부터 완료까지 모든 과정에서 자동으로 이메일 알림이
                  발송됩니다!
                </p>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>
                      <strong>발주 요청 시:</strong> 요청자, 승인권자,
                      관리자에게 알림
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>
                      <strong>승인/반려 시:</strong> 요청자와 관련자들에게 상태
                      변경 알림
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>
                      <strong>출고 완료 시:</strong> 배송 시작 및 추적 정보 알림
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>
                      <strong>배송 완료 시:</strong> 최종 완료 및 설치 일정 안내
                    </span>
                  </div>
                </div>
                {/* <div className="p-3 mt-4 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>팁:</strong> 이메일 수신 설정은 계정 설정에서
                    변경할 수 있습니다. 중요한 발주는 반드시 이메일을
                    확인해주세요!
                  </p>
                </div> */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="p-4">
              <div className="flex gap-2 items-center mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">발주 처리 시간</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  • <strong>요청 접수:</strong> 즉시
                </div>
                <div>
                  • <strong>승인 처리:</strong> 1-2일
                </div>
                <div>
                  • <strong>출고 완료:</strong> 3-5일
                </div>
                <div>
                  • <strong>배송 완료:</strong> 5-7일
                </div>
              </div>
              <div className="p-2 mt-3 text-xs text-blue-700 bg-blue-50 rounded border border-blue-200">
                📧 <strong>각 단계마다 이메일 알림 발송!</strong>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-2 items-center mb-3">
                <Users className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">권한별 기능</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  • <strong>일반 사용자:</strong> 발주 요청만 가능
                </div>
                <div>
                  • <strong>1차승인권자:</strong> 발주 승인/반려
                </div>
                <div>
                  • <strong>관리자:</strong> 모든 기능 사용 가능
                </div>
                <div>
                  • <strong>외부업체:</strong> 발주 관련 기능만
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-2 items-center mb-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">배송 정보</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  • <strong>배송지:</strong> 정확한 주소 입력 필수
                </div>
                <div>
                  • <strong>수령인:</strong> 실제 수령 가능한 사람
                </div>
                <div>
                  • <strong>연락처:</strong> 배송 연락용 번호
                </div>
                <div>
                  • <strong>설치일:</strong> 희망 설치 일정
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-2 items-center mb-3">
                <Phone className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold">문의 및 지원</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  • <strong>기술 지원:</strong> 시스템 오류 시
                </div>
                <div>
                  • <strong>발주 문의:</strong> 품목 및 수량 관련
                </div>
                <div>
                  • <strong>배송 문의:</strong> 배송 일정 및 위치
                </div>
                <div>
                  • <strong>승인 문의:</strong> 승인 지연 시
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 0 && !selectedType) {
      alert("발주 유형을 선택해주세요.");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartOrder = () => {
    if (selectedType === "package") {
      router.push("/packageOrder");
    } else if (selectedType === "wheelchair") {
      router.push("/orderWheelchair");
    } else {
      router.push("/orderRequest");
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            발주 사용 가이드
          </h1>
          <p className="text-gray-600">
            패키지 발주와 개별 품목 발주의 사용법을 단계별로 안내합니다
          </p>
        </div>

        {/* 빠른 이동 버튼 */}
        <div className="mb-8">
          <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="flex gap-3 items-center mb-6">
              <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                바로 발주하기
              </h3>
            </div>
            <div
              className={`grid gap-6 ${
                hasWheelchairWarehouses
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {/* 패키지 발주 */}
              <button
                onClick={() => router.push("/packageOrder")}
                className="group relative overflow-hidden p-8 text-left bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:-translate-y-2 hover:from-blue-600 hover:to-blue-700 animate-wiggle"
                style={{
                  animation: 'wiggle 3s ease-in-out infinite'
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-50 transition-all duration-300 group-hover:w-40 group-hover:h-40"></div>
                <div className="relative">
                  <div className="flex justify-center items-center mb-4 w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-6">
                    <Package className="w-9 h-9 text-white" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-white">
                    패키지 발주
                  </h4>
                  <p className="mb-4 text-sm text-blue-100">
                    미리 구성된 패키지로 빠르게 발주
                  </p>
                  <div className="flex gap-2 items-center text-base font-bold text-white">
                    <span>지금 시작하기</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </button>

              {/* 휠체어 발주 */}
              {hasWheelchairWarehouses && (
                <button
                  onClick={() => router.push("/orderWheelchair")}
                  className="group relative overflow-hidden p-8 text-left bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:-translate-y-2 hover:from-purple-600 hover:to-purple-700"
                  style={{
                    animation: 'wiggle 3s ease-in-out infinite 0.5s'
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-50 transition-all duration-300 group-hover:w-40 group-hover:h-40"></div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 text-sm font-bold text-purple-600 bg-white rounded-full shadow-lg animate-pulse">
                    추천!
                  </div>
                  <div className="relative">
                    <div className="flex justify-center items-center mb-4 w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-6">
                      <Accessibility className="w-9 h-9 text-white" />
                    </div>
                    <h4 className="mb-3 text-xl font-bold text-white">
                      휠체어 발주
                    </h4>
                    <p className="mb-4 text-sm text-purple-100">
                      휠체어 전용 품목을 빠르게 선택
                    </p>
                    <div className="flex gap-2 items-center text-base font-bold text-white">
                      <span>지금 시작하기</span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                </button>
              )}

              {/* 개별 품목 발주 */}
              <button
                onClick={() => router.push("/orderRequest")}
                className="group relative overflow-hidden p-8 text-left bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:-translate-y-2 hover:from-green-600 hover:to-green-700"
                style={{
                  animation: 'wiggle 3s ease-in-out infinite 1s'
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-50 transition-all duration-300 group-hover:w-40 group-hover:h-40"></div>
                <div className="relative">
                  <div className="flex justify-center items-center mb-4 w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-6">
                    <ShoppingCart className="w-9 h-9 text-white" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-white">
                    개별 품목 발주
                  </h4>
                  <p className="mb-4 text-sm text-green-100">
                    원하는 품목을 자유롭게 선택
                  </p>
                  <div className="flex gap-2 items-center text-base font-bold text-white">
                    <span>지금 시작하기</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 발주 안내 콘텐츠 */}
        <Card className="p-8 bg-gray-50">
          {/* 진행률 표시 - 안내 영역 내부로 이동 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-semibold text-gray-700">
                단계 {currentStep + 1} / {steps.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% 완료
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>

          <div className="mb-8">{currentStepData.content}</div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex gap-2 items-center"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>

            <div className="flex gap-3">
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleStartOrder}
                  className="flex gap-2 items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg border-0 shadow-lg transition-all duration-200 transform hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105"
                >
                  <ShoppingCart className="w-6 h-6" />
                  발주 시작하기
                  <ArrowRight className="w-6 h-6" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex gap-2 items-center"
                >
                  다음
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
