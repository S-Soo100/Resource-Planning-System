"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function OrderGuidePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<
    "package" | "individual" | null
  >(null);

  const steps = [
    {
      id: 0,
      title: "발주 유형 선택",
      description: "어떤 방식으로 발주하시겠습니까?",
      content: (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
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
                패키지 발주
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
                필요한 품목을 개별적으로 선택하여 발주합니다
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
        selectedType === "package" ? "패키지 발주 방법" : "개별 품목 발주 방법",
      description:
        selectedType === "package"
          ? "패키지 발주의 단계별 사용법을 안내합니다"
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
    } else {
      router.push("/orderRequest");
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="container px-4 mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            발주 사용 가이드
          </h1>
          <p className="text-gray-600">
            패키지 발주와 개별 품목 발주의 사용법을 단계별로 안내합니다
          </p>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              단계 {currentStep + 1} / {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% 완료
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <Card className="p-8 mb-8">
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

        {/* 빠른 이동 버튼 */}
        <div className="text-center">
          <div className="flex flex-col gap-4 justify-center sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/packageOrder")}
              className="flex gap-2 items-center"
            >
              <Package className="w-4 h-4" />
              패키지 발주 바로가기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/orderRequest")}
              className="flex gap-2 items-center"
            >
              <ShoppingCart className="w-4 h-4" />
              개별 품목 발주 바로가기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/orderRecord")}
              className="flex gap-2 items-center"
            >
              <FileText className="w-4 h-4" />
              발주 기록 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
