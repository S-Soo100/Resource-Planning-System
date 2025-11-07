"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Plus,
  Edit,
  Bug,
  Shield,
  TrendingUp,
} from "lucide-react";
import { APP_VERSION, APP_NAME } from "@/constants/version";

export default function UpdatePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "추가됨":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "변경됨":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "수정됨":
        return <Bug className="w-4 h-4 text-red-600" />;
      case "보안":
        return <Shield className="w-4 h-4 text-purple-600" />;
      case "개선됨":
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default:
        return <Tag className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-[1800px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  업데이트 내역
                </h1>
                <p className="text-sm text-gray-600">{APP_NAME} 변경사항</p>
              </div>
            </div>
            <div className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
              현재 버전: v{APP_VERSION}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 mx-auto max-w-[1800px]">
        <div className="space-y-8">
          {/* v1.8.1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.8.1
                  </h2>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                    최신
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-11-04
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* 추가됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("추가됨")}
                    <span className="ml-2">추가됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="mb-2 font-medium text-green-900">
                        <strong>캘린더 모달 URL 관리 기능</strong>: 뒤로가기로 모달 상태 유지
                      </h4>
                      <ul className="space-y-1 text-sm text-green-800 list-disc list-inside">
                        <li>모달 열림 상태를 URL 쿼리 파라미터로 관리 (eventType, eventId)</li>
                        <li>브라우저 뒤로가기 시 모달 상태 자동 복원</li>
                        <li>URL 공유 시 특정 이벤트 모달 직접 열기 가능</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="mb-2 font-medium text-green-900">
                        <strong>캘린더 모달에서 상세 페이지 이동</strong>: 빠른 상세 정보 접근
                      </h4>
                      <ul className="space-y-1 text-sm text-green-800 list-disc list-inside">
                        <li>모달 내 이벤트 클릭 시 해당 상세 페이지로 이동</li>
                        <li>시연: /demoRecord/[id]?teamId=[teamId]</li>
                        <li>발주: /orderRecord/[id]?teamId=[teamId]</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 개선됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("개선됨")}
                    <span className="ml-2">개선됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>발주 기록 모바일 UI 개선</strong>: 모바일 환경에서 발주 기록 가독성 향상
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800 list-disc list-inside">
                        <li>모바일 화면에서 발주 카드 레이아웃 최적화</li>
                        <li>탭 인터페이스 반응형 개선</li>
                        <li>터치 인터랙션 향상</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>발주 검색 기능 확장</strong>: 발주 기록 페이지 검색 범위 확대
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800 list-disc list-inside">
                        <li>기존: 발주자, 패키지명, 수령자만 검색 가능</li>
                        <li>추가: 발주 제목, 담당자, 배송 주소로도 검색 가능</li>
                        <li>총 6개 필드에서 검색 지원으로 발주 기록 찾기 용이성 향상</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 수정됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("수정됨")}
                    <span className="ml-2">수정됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="mb-2 font-medium text-blue-900">
                        <strong>캘린더 모달 무한 루프 수정</strong>: useEffect 최적화
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-800 list-disc list-inside">
                        <li>selectedEvent 상태 변경 조건 추가로 불필요한 업데이트 방지</li>
                        <li>Maximum update depth exceeded 에러 해결</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* v1.8.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.8.0
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-10-01
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* 추가됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("추가됨")}
                    <span className="ml-2">추가됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="mb-2 font-medium text-green-900">
                        <strong>캘린더 시연 이벤트 시각화 개선</strong>: 여러 날에 걸친 시연을 직관적으로 표시
                      </h4>
                      <ul className="space-y-1 text-sm text-green-800 list-disc list-inside">
                        <li>시연 ID별 8단계 색상 팔레트 적용 (보라색 계열: purple, violet, fuchsia, indigo)</li>
                        <li>시연 상태를 작은 뱃지로 표시 (요청, 승인, 출준, 출완, 종료, 반려)</li>
                        <li>시연 블럭이 날짜 셀의 전체 너비를 차지하도록 개선</li>
                        <li>여러 시연이 겹칠 때 레이어 기반 배치로 충돌 방지</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 개선됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("개선됨")}
                    <span className="ml-2">개선됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>시연 기간 표시 정확도 향상</strong>: 시연 시작일부터 종료일까지 모든 날짜에 이벤트 표시
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800 list-disc list-inside">
                        <li>예시: 10월 2일 17시 상차 ~ 10월 5일 21시 하차 → 10월 2일~5일 (4일간) 정확 표시</li>
                        <li>주간/월간 캘린더 모두에서 일관된 표시</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 수정됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("수정됨")}
                    <span className="ml-2">수정됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="mb-2 font-medium text-red-900">
                        <strong>시연 막대 연속성 개선</strong>: 중간 블럭의 좌우 테두리 제거로 하나의 연속된 막대처럼 표시
                      </h4>
                      <ul className="space-y-1 text-sm text-red-800 list-disc list-inside">
                        <li>시작일: 좌/위/아래 테두리만 표시</li>
                        <li>중간일: 위/아래 테두리만 표시</li>
                        <li>종료일: 우/위/아래 테두리만 표시</li>
                        <li>주의 경계에서도 자연스럽게 연결되도록 둥근 모서리 적용</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* v1.7.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.7.0
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-09-15
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* 개선됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("개선됨")}
                    <span className="ml-2">개선됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>시연 기록 페이지 UI/UX 대폭 개선</strong>: 정렬, 카드 레이아웃, 정보 표시 등 전면 개선
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        <li>• <strong>시연 시작일 기준 정렬</strong>: 최신순/오래된순 토글 정렬 기능 추가로 시연 일정 관리 효율성 증대</li>
                        <li>• <strong>카드 레이아웃 최적화</strong>: 2줄 구조 → 1줄 통합으로 화면 공간 효율성 향상</li>
                        <li>• <strong>인덱스 번호 표시</strong>: 페이지네이션 고려한 순차 번호로 목록 추적 편의성 개선</li>
                        <li>• <strong>카드 토글 기능</strong>: 클릭 시 시연 기간, 장소, 품목 등 상세 정보 확장 표시</li>
                        <li>• <strong>상세보기 버튼</strong>: 명확한 상세페이지 이동 버튼으로 사용자 경험 개선</li>
                        <li>• <strong>유료 시연 가격 표시</strong>: 유료 시연 시 금액 정보를 괄호 안에 명확히 표시</li>
                        <li>• <strong>배송 방법 정보</strong>: 시연 장소 뒤에 상차/하차 방법 표시로 물류 정보 가시성 향상</li>
                        <li>• <strong>품목 정보 정확성</strong>: item.teamItem.itemName 경로 수정으로 정확한 품목명 표시</li>
                        <li>• <strong>모바일 UI 최적화</strong>: 데스크톱과 동일한 카드 토글 및 상세보기 기능을 모바일에서도 제공</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>발주 기록 페이지 UI/UX 개선</strong>: 시연 기록과 동일한 패턴의 UI 향상
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        <li>• <strong>상세보기 버튼</strong>: 기존 화살표 버튼을 명확한 '상세보기' 버튼으로 교체</li>
                        <li>• <strong>카드 토글 기능</strong>: 상세보기 버튼 외 카드 클릭 시 발주 기간, 창고, 주소, 담당자, 품목, 메모 등 기본 정보 표시</li>
                        <li>• <strong>메모 정보 추가</strong>: 발주 메모를 노란색 하이라이트로 명확히 표시</li>
                        <li>• <strong>데이터 필드 정확성</strong>: receiverAddress, manager 등 올바른 필드 경로 적용</li>
                        <li>• <strong>모바일 UI 통합</strong>: OrderRecordTabsMobile에도 동일한 토글 및 상세보기 기능 적용</li>
                        <li>• <strong>반응형 디자인</strong>: 데스크톱과 모바일 환경에서 일관된 사용자 경험 제공</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>전체 프로젝트 날짜 표시 통합</strong>: 시간대 변환 오류를 해결하고 UTC 기반 정확한 날짜 표시로 통합
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        <li>• 발주 관리: createdAt, purchaseDate, outboundDate, installationDate 등 모든 날짜 필드 UTC 적용</li>
                        <li>• 시연 관리: createdAt, demoPaymentDate, demoStartDate, demoEndDate 등 모든 날짜 필드 UTC 적용</li>
                        <li>• 재고 관리: inboundDate, outboundDate 등 입출고 날짜 필드 UTC 적용</li>
                        <li>• formatDateForDisplayUTC, formatDateForDisplayFullUTC 함수 활용으로 일관된 날짜 표시</li>
                        <li>• 로컬 중복 formatDate 함수 제거 및 통합된 dateUtils 사용으로 코드 최적화</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 수정됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("수정됨")}
                    <span className="ml-2">수정됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="mb-2 font-medium text-red-900">
                        <strong>날짜 표시 시간대 변환 오류</strong>: DB 날짜와 화면 표시 날짜 불일치 문제 완전 해결
                      </h4>
                      <ul className="space-y-1 text-sm text-red-800">
                        <li>• UTC 16:46 → KST 01:46(다음날) 변환으로 인한 날짜 오차 제거</li>
                        <li>• 예시: DB "2025-09-15" → 화면 "9월 16일" 표시 오류 → "9월 15일" 정확 표시</li>
                        <li>• 사용자 입력 날짜가 그대로 정확히 표시되도록 개선</li>
                        <li>• 전체 시스템에서 일관된 날짜 표시 형식 적용</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 기술 개선 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("변경됨")}
                    <span className="ml-2">기술 개선</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="mb-2 font-medium text-blue-900">
                        <strong>코드 품질 및 성능 향상</strong>
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li>• 각 컴포넌트별 로컬 formatDate 함수 제거로 유지보수성 향상</li>
                        <li>• 불필요한 date-fns import 정리로 번들 크기 감소</li>
                        <li>• 통합된 dateUtils 함수 사용으로 타입 안전성 향상</li>
                        <li>• 새로운 날짜 필드 추가 시 일관된 처리 방식 보장</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* v1.6.4 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.6.4
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-08-05
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* 개선됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("개선됨")}
                    <span className="ml-2">개선됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="mb-2 font-medium text-orange-900">
                        <strong>발주/시연 승인 타임아웃 처리 개선</strong>:
                        중간관리자 승인 시 타임아웃 에러 개선
                      </h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        <li>
                          • 발주 상태 변경 API 타임아웃을 45초로 연장 (기존 15초
                          → 45초)
                        </li>
                        <li>
                          • 시연 상태 변경 API 타임아웃을 45초로 연장 (기존 15초
                          → 45초)
                        </li>
                        <li>
                          • 타임아웃 에러 시 서버에서 처리 완료 가능성 안내
                          메시지 추가
                        </li>
                        <li>
                          • 타임아웃 에러 발생 시 새로고침 버튼이 포함된 사용자
                          친화적 에러 모달 제공
                        </li>
                        <li>
                          • 발주 상세 페이지에서 타임아웃 에러 시 3초 후 자동
                          새로고침 확인 대화상자 표시
                        </li>
                        <li>
                          • 에러 상황별 맞춤형 해결 방법 안내 추가 (재고 부족,
                          권한 부족, 네트워크 오류 등)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 수정됨 */}
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                    {getIconForType("수정됨")}
                    <span className="ml-2">수정됨</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="mb-2 font-medium text-red-900">
                        <strong>승인 처리 시간 초과 문제</strong>: 발주 승인
                        처리가 10초 이상 걸릴 때 발생하는 타임아웃 에러 해결
                      </h4>
                      <ul className="space-y-1 text-sm text-red-800">
                        <li>
                          • 클라이언트 타임아웃 에러 발생 후에도 서버에서 정상
                          처리되는 상황 개선
                        </li>
                        <li>
                          • 사용자가 에러 후 새로고침하여 상태 확인 가능하도록
                          안내 개선
                        </li>
                        <li>• 네트워크 지연 상황에서의 사용자 경험 향상</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* v1.6.3 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.6.3
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-08-05
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                전화번호 포맷팅 개선, 한글 파일명 처리 개선, 사용자 정보 수정
                모달 데이터 반영 문제 해결
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>전화번호 포맷팅 개선</strong>: 발주 및 시연 상세
                      페이지의 전화번호 표시 방식 개선
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      11자리 010으로 시작하는 전화번호만 하이픈 포맷팅 적용 (
                      <code className="bg-gray-100 px-1 rounded">
                        01012345678
                      </code>{" "}
                      →{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        010-1234-5678
                      </code>
                      )
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      국제 전화번호(+로 시작) 및 기타 형식은 원본 그대로
                      표시하여 데이터 정확성 보장
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>앞뒤 공백 자동 제거로 데이터 정합성 향상</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>한글 파일명 처리 개선</strong>: 백엔드 요청에 맞춰
                      파일명 인코딩 방식 개선
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      한글 파일명이 포함된 파일 업로드 시 올바른 인코딩 처리
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>파일명 관련 로그 추가로 디버깅 용이성 향상</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>불필요한 로그 간소화로 성능 최적화</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>demoRecord 페이지 최적화</strong>: 새로고침 시
                      불필요한 warehouse API 호출 제거
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>페이지 새로고침 시 중복 API 호출 방지</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>성능 개선 및 네트워크 트래픽 감소</span>
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>데모 수정 날짜 파싱 오류</strong>: 서버에서 날짜
                      파싱 시 발생하는{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        Invalid Date
                      </code>{" "}
                      에러 해결
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      날짜 형식을{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        YYYY-MM-DD
                      </code>
                      로 단순화하여 서버 파싱 안정성 향상
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      빈 문자열이나 undefined 날짜 필드를 서버 전송 전에
                      제거하여 오류 방지
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>사용자 정보 수정 모달 데이터 반영 문제</strong>:
                      사용자 정보 수정 시 최신 데이터가 반영되지 않는 문제 해결
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      사용자 정보 수정 모달에서 최신 데이터 정확히 표시
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>실시간 데이터 동기화 개선</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>유저 수정 시 창고 목록 표시</strong>: 유저 수정 시
                      제한된 창고 목록을 alert으로 표시하는 기능 추가
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>창고 제한 기능 확인 및 개선</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>팀 멤버 창고 접근 권한 기능 개선</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>콘솔 로그 단순화로 디버깅 용이성 향상</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>동시성 문제 및 상태 반영 문제 해결</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.6.2 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.6.2
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-08-04
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 수정 권한 개선 및 UTC+9 시간대 처리
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>시연 수정 권한 개선</strong>: Admin 사용자는 모든
                      상태의 시연을 수정할 수 있도록 변경
                    </span>
                  </li>
                </ul>
              </div>

              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>UTC+9 시간대 처리</strong>: 시연 수정 시 한국
                      시간대 자동 변환
                    </span>
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>시간 처리 일관성</strong>: 시연 수정 시 시간대
                      불일치 문제 해결
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.6.1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.6.1
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-08-04
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                승인된 시연 수정 제한 기능 개선
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>승인된 시연 수정 제한</strong>: 승인된 시연의 수정
                      시도 시 적절한 에러 처리 추가
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      DemoEditModal에서 승인된 시연 수정 시도 시 프론트엔드에서
                      차단
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      시연 상세 페이지에서 승인된 시연에 대해 안내 메시지 표시
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      &quot;승인된 시연은 수정할 수 없습니다&quot; 메시지로
                      사용자에게 명확한 안내
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      백엔드 API 에러(400) 발생 전에 프론트엔드에서 사전 차단
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      모든 수정 불가능한 상태(승인, 반려, 출고팀 확인, 출고
                      완료, 출고 보류, 시연 종료)에 대한 통합 처리
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      권한 확인 로직 강화 (본인 작성 시연 또는 Admin만 수정
                      가능)
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      구체적인 에러 메시지 제공 (네트워크, 권한, 파일 업로드 등)
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      데이터 유효성 검증 강화 (수량, 날짜/시간 형식, 전화번호
                      형식 등)
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>동시성 문제 방지 (시연 상태 변경 시 수정 차단)</span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      추가 에러 상황 처리 (존재하지 않는 시연, 재고 부족, 서버
                      저장공간 부족 등)
                    </span>
                  </li>
                  <li className="flex items-start ml-4">
                    <span className="mr-2 text-gray-400">-</span>
                    <span>
                      시연 아이템 수량 제한 제거 (팀에서 알아서 처리하도록 허용)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.6.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.6.0
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-08-04
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                주문 품목 목록 UI 개선 및 제목 자동 생성 기능 추가
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>제목 자동 생성 기능</strong>: 발주 제목이 없을 때
                      자동으로 의미있는 제목 생성
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>아이템 코드 표시</strong>: 주문 품목 목록에서
                      아이템 이름과 함께 코드 표시
                    </span>
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>주문 품목 목록 UI 개선</strong>: PC 버전에서 더
                      나은 가독성과 사용성 제공
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>발주 목록 가독성 향상</strong>: 제목 자동 생성으로
                      더 명확한 발주 식별
                    </span>
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">•</span>
                    <span>
                      <strong>PC 레이아웃 구조</strong>: 발주 상세 정보 표시
                      방식 개선
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.8 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.8
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-08-01
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                Order 제목 필드 추가, 발주 시스템 개선
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>Order 제목 필드</strong>: 발주 시스템에
                      제목(title) 필드 추가
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>발주 폼 제목 입력</strong>: 모든 발주 폼에 제목
                      입력 필드 추가
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>발주 목록 제목 표시</strong>: OrderRecordTabs에서
                      제목 컬럼 추가
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>제목 필드 검증</strong>: 모든 발주 폼에서 제목
                      필수 입력 검증 추가
                    </span>
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>발주 목록 UI</strong>: 제목 컬럼 추가로 더 명확한
                      발주 식별 가능
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>사용자 경험</strong>: 제목 입력으로 발주 목적과
                      내용을 더 쉽게 파악 가능
                    </span>
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>타입 호환성</strong>: Order 관련 모든 타입에 title
                      필드 일관성 있게 추가
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.7 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.7
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-29
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                데모 코멘트 API 에러 수정, 사용자명 표시 문제 해결
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>데모 코멘트 API 에러</strong>: 댓글
                      불러오기/보내기 기능 완전 수정
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>데모 코멘트 사용자명 표시</strong>: 댓글
                      작성자명이 &apos;익명&apos;으로 표시되는 문제 해결
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>댓글 수정 기능</strong>: 수정할 내용을 제대로
                      전달하지 않는 문제 해결 및 PUT → PATCH 메서드 변경
                    </span>
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>데모 코멘트 디버깅</strong>: API 응답 및 댓글
                      데이터 콘솔 로그 추가
                    </span>
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">•</span>
                    <span>
                      <strong>데모 코멘트 타입 구조</strong>: DemoComment
                      인터페이스 개선
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.6 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.6
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-18
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 상세 페이지 구현, 상태 변경 드롭다운, 시연 수정 모달 추가
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>시연 상세 페이지</strong> - 시연 기록의 상세 정보
                      확인 및 관리
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>상태 변경 드롭다운</strong> - 권한별 시연 상태
                      변경 기능
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>시연 수정 모달</strong> - 시연 정보 및 시연품 수정
                      기능
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-600">•</span>
                    <span>
                      <strong>파일 관리 API</strong> - 시연 파일 업로드 및 삭제
                      기능
                    </span>
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>시연 목록 네비게이션</strong> - 상세보기 버튼으로
                      직관적인 이동
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>상태 변경 UI/UX</strong> - 그라데이션 배경과
                      향상된 드롭다운 디자인
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-orange-600">•</span>
                    <span>
                      <strong>에러 처리 및 로딩</strong> - 상세한 스켈레톤 UI와
                      토스트 알림
                    </span>
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>시연 목록 페이지 에러</strong> - lastExpandedId
                      변수 미정의 문제 해결
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>API 함수 누락</strong> - deleteDemoFile 함수 추가
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-600">•</span>
                    <span>
                      <strong>타입 캐스팅 이슈</strong> - DemoDetailResponse
                      타입 호환성 해결
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.5 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.5
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-18
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                DemoStatus enum 업데이트, 시연 상태 관리 시스템 개선, 출고자
                반려 상태 추가
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    DemoStatus enum 업데이트: demoShipmentCompleted →
                    shipmentCompleted, demoCompletedAndReturned → demoCompleted
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    새로운 상태 추가: rejectedByShipper (출고자 반려)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 상태 흐름 개선으로 더 세밀한 상태 관리 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    새로운 상태에 맞는 UI/UX 개선 (아이콘, 색상, 텍스트)
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 상태 변경 로직을 새로운 DemoStatus enum에 맞게 업데이트
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    상태 표시 텍스트를 각 상태별 명확한 한글 표시로 개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    권한 기반 상태 변경 로직에 새로운 상태 적용
                  </li>
                </ul>
              </div>

              {/* 문서화 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("문서화")}
                  <h3 className="font-medium text-gray-900">문서화</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 시스템 비즈니스 로직 문서에 새로운 상태 흐름 및 설명
                    반영
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    DemoStatus enum 문서화: 각 상태별 의미와 권한 설명 추가
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.4 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.4
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-18
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 시스템 개선, 시연 비용 입력 필드 포맷팅, API 미개발 상태
                명확히 표기
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 비용 입력 필드에 3자리씩 쉼표 구분 포맷팅 기능 (예:
                    1,000,000원)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 비용 필드에 VAT 포함 표기 추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    DemonstrationRequestForm에 API 미개발 상태 명확히 표기
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 비용 입력 시 사용자 경험 개선 (숫자 자동 포맷팅,
                    플레이스홀더 예시 추가)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    API 미개발 상태를 개발자와 사용자에게 명확히 알림 (콘솔
                    경고, 버튼 툴팁, 성공 메시지)
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 비용 입력 필드 타입을 number에서 text로 변경하여 쉼표
                    입력 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    불필요한 타입 정의 파일 정리 (demo-item-list-for-team-57.ts
                    삭제)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.3 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.3
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-15
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                IO History 페이지네이션 기능 추가, 모바일 OrderRecord 댓글 기능,
                Admin 발주 상태 변경 권한 확장
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    IO History 페이지 페이지네이션 기능 (페이지당 10개 항목,
                    필터 변경 시 자동 첫 페이지 이동)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    모바일 UI의 OrderRecord 댓글 기능 (댓글 작성/수정/삭제,
                    상대적 시간 표시)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Admin 전용 발주 상태 변경 기능 (발주 수정 시 상태 직접 변경
                    가능)
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    IO History 페이지 UI/UX 개선 (조회 기간 30일→3개월 확장,
                    반응형 레이아웃)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    OrderRecord 수정 기능 개선 (과거 날짜 검증 로직 제거, 더
                    유연한 날짜 설정)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    페이지네이션 필터 동기화 (필터 변경 시 페이지네이션 자동
                    초기화)
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 편집 활성화 문제 해결 (Admin 사용자 상태 변경
                    가능)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    오더 수정 시 상태 유지 문제 해결 (기존 발주 상태 올바르게
                    유지)
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    IO History 페이지 기본 조회 기간: 30일 → 3개월로 확장
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    OrderRecord 모바일 UI: 댓글 섹션이 모바일 환경에서도 표시
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Admin 권한 확장: 발주 상태 직접 변경 권한 추가
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.2 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.2
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-16
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                발주 상세 비로그인 접근 시 로그인 모달 표시,
                안내문구/오버레이/X버튼 조건부 노출 등 로그인 UX 대폭 개선
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상세(/orderRecord/[id]) 비로그인 접근 시
                    alert/리다이렉트 대신 로그인 모달 표시
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    안내문구를 로그인 카드 내부 상단에 명확하게 노출, UI 구조
                    개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    오버레이(회색 배경) 클릭 시 모달이 닫히지 않도록 UX 개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    로그인하지 않은 상태에서는 X(닫기) 버튼이 보이지 않음,
                    로그인 상태에서만 노출
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    LoginModal 컴포넌트의 변경은 해당 컴포넌트를 사용하는
                    페이지에만 적용, 타 페이지에는 side effect 없음
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    버전 1.5.2로 상향
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.1
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-05
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 신청 폼 및 시연 시스템 UI/UX 개선, 창고별 아이템 동적 선택,
                체크박스 로직 개선, 문서화 등
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 신청 폼 UI/UX 개선 (창고 선택 드롭다운 단일화, 자동
                    선택 로직 개선)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    창고별 실제 재고 아이템 목록 기반 동적 선택 UI 제공
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    체크박스 및 수량 조절 로직 개선 (teamItem 기준 일원화)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    불필요한 정보(창고 주소 등) 제거, 드롭다운만 노출
                  </li>
                </ul>
              </div>
              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    체크박스 동작 오류 및 전체 선택/해제 동작 오류 수정
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    선택된 아이템 요약 표시 오류 수정
                  </li>
                </ul>
              </div>
              {/* 문서화 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("문서화")}
                  <h3 className="font-medium text-gray-900">문서화</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    CHANGELOG, 시연 시스템 비즈니스 로직, 업데이트 내역 등 문서
                    최신화
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.0
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-04
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 시스템, 휠체어 발주 기능, 댓글 시스템 추가
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 시스템 구축 (요청/승인/시연출고/복귀 6단계 상태 관리)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    휠체어 전용 발주 시스템 (전용 창고/카테고리 제한)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    공통 컴포넌트 시스템 (8개 재사용 컴포넌트 구축)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    파일 업로드 시스템 (드래그 앤 드롭 지원)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    주소 검색 시스템 (다음 포스트 API 연동)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    품목 선택 모달 (카테고리별 필터링 지원)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    댓글 시스템 (발주별 실시간 소통 및 협업 기능)
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 시스템 콘셉트 4개에서 6개로 확장 (휠체어 발주, 데모
                    시연 추가)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 기능을 &quot;개발 중&quot;에서 정식 기능으로 변경
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    워크플로우 설명을 일반 발주와 시연으로 분리
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    카테고리 분류 체계에서 휠체어 관련 내용 구체화
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    공통 컴포넌트 재사용으로 코드 중복 제거 및 일관성 향상
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    색상 테마 시스템으로 발주 유형별 시각적 구분 강화
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    반응형 디자인 및 모바일 환경 최적화
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    접근성 향상: 모든 입력 필드에 적절한 라벨 및 접근성 속성
                    추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    댓글 시스템 UI/UX 개선: 상대적 시간 표시, 수정 표시 기능
                  </li>
                </ul>
              </div>

              {/* 보안 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("보안")}
                  <h3 className="font-medium text-gray-900">보안</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 시스템 권한별 상태 변경 제한 강화
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    휠체어 발주 시스템 창고 및 카테고리 접근 제한
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    팀 기반 데이터 격리 및 권한 관리 유지
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    댓글 시스템 보안: XSS 방지, 권한 기반 접근 제어
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.4.1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.4.1
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-06-20
                </div>
              </div>
              <p className="mt-2 text-gray-600">업체관리 기능 접근 권한 확장</p>
            </div>
            <div className="p-6 space-y-6">
              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    업체관리 기능을 재고관리 탭으로 이동
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    기존 관리자 탭에서 재고관리 탭으로 메뉴 위치 변경
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    user, moderator 권한 사용자도 업체관리 기능 접근 가능하도록
                    권한 확장
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    접근 권한을 [&quot;user&quot;, &quot;admin&quot;,
                    &quot;moderator&quot;]로 설정
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 경험 향상: 일반 사용자와 1차승인권자도 업체관리 기능
                    이용 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    메뉴 구조 개선: 업체관리 기능을 논리적으로 재고관리 탭에
                    배치
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.4.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.4.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-06-20
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                발주 상태 관리 및 재고 확인 시스템
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 변경 시 권한별 제한 기능 구현
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 관련 상태 변경 시 재고 확인 로직 추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 표시 개선 (아이콘 추가, UI 개선)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    서버 응답 호환성 개선 (&quot;주문 접수&quot; 문자열 처리)
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 수량 수정 로직 개선 (불필요한 재고 기록 생성 제거)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 변경 UI 개선 (권한에 따른 드롭다운 표시 제한)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    캐시 무효화 로직 개선 (화면 반영 문제 해결)
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 수량 수정 시 2개씩 증가하는 중복 업데이트 문제 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 수량 수정 후 화면에 반영되지 않는 캐시 동기화 문제 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 변경 시 권한 제한이 적용되지 않는 문제 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    &quot;주문 접수&quot; 상태 표시 오류 수정 (requested와 동일
                    처리)
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 경험 향상: 권한별 명확한 기능 제한으로 혼란 방지
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    성능 개선: 불필요한 재고 기록 생성 제거로 데이터베이스 부하
                    감소
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    UI/UX 개선: 상태별 아이콘과 직관적인 상태 표시
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    데이터 일관성: 올바른 캐시 무효화로 실시간 데이터 동기화
                    보장
                  </li>
                </ul>
              </div>

              {/* 보안 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("보안")}
                  <h3 className="font-medium text-gray-900">보안</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    권한별 발주 상태 변경 제한으로 비즈니스 로직 보호
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 확인 로직으로 출고 시 데이터 무결성 보장
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.3.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.3.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-06-11
                </div>
              </div>
              <p className="mt-2 text-gray-600">입출고 관리 시스템 개선</p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    /ioHistory 페이지에 입고/출고 버튼 및 기능 추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 처리 후 실시간 기록 반영 기능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 기록 조회와 작업이 한 페이지에서 가능한 통합 UI
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    AttachedFile 타입을 공통 타입으로 분리하여 재사용성 향상
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    /stock 페이지에서 입고/출고 버튼 제거 (재고 조회/수정 기능만
                    유지)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    /stock 페이지의 카테고리 토글이 기본적으로 열린 상태로 변경
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 기능을 /ioHistory 페이지로 이동하여 논리적 구조
                    개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    AttachedFile 타입을 /src/types/common.ts로 이동
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 관련 모든 메시지에서 &quot;발주&quot; →
                    &quot;출고&quot; 워딩 수정
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 모달 제목 및 버튼 텍스트 정확성 개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    TypeScript 빌드 에러 해결 (AttachedFile 타입 import 오류)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 처리 시 일관된 용어 사용으로 사용자 혼란 방지
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 경험 향상: 입출고 작업과 이력 확인이 한 곳에서 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    코드 구조 개선: 관심사 분리를 통한 유지보수성 향상
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    즉시 반영: 입고/출고 처리 후 바로 기록 목록에서 확인 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    타입 일관성: 공통 타입 사용으로 코드 중복 제거
                  </li>
                </ul>
              </div>

              {/* 보안 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("보안")}
                  <h3 className="font-medium text-gray-900">보안</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 기능에서 권한 제어 유지 (user 권한은 버튼 숨김)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.2.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.2.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-05-31
                </div>
              </div>
              <p className="mt-2 text-gray-600">창고 접근 권한 관리 시스템</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                창고별 접근 권한 관리 기능, 사용자별 창고 제한 설정, 권한 기반
                데이터 필터링 등의 보안 강화 업데이트가 포함되었습니다.
              </div>
            </div>
          </div>

          {/* v1.1.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.1.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-05-23
                </div>
              </div>
              <p className="mt-2 text-gray-600">발주 시스템 개선</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                발주 요청 후 부드러운 페이지 전환, 발주 상세 정보 확장 표시, UX
                개선 등이 포함되었습니다.
              </div>
            </div>
          </div>

          {/* v1.0.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.0.0
                  </h2>
                  <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded bg-gold-100 text-gold-800">
                    초기 릴리즈
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-04-29
                </div>
              </div>
              <p className="mt-2 text-gray-600">KARS 시스템 최초 출시</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                재고 관리, 발주 관리, 패키지 관리, 사용자 관리 등 핵심 기능들이
                포함된 초기 버전입니다.
              </div>
            </div>
          </div>

          {/* 새로운 기능 소개 */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              🆕 새로운 기능 소개
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* 시연 시스템 */}
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-lg font-semibold text-green-800">
                  🎯 시연 시스템
                </h3>
                <p className="mb-4 text-green-700">
                  제품 시연을 위한 전용 관리 시스템이 추가되었습니다. 일반
                  발주와 구분된 시연 전용 워크플로우로 효율적인 제품 시연 관리가
                  가능합니다.
                </p>
                <ul className="space-y-1 text-sm text-green-600">
                  <li>• 시연 요청부터 복귀까지 전체 프로세스 관리</li>
                  <li>• 시연 출고 시 자동 재고 차감 및 복귀 시 복구</li>
                  <li>• 시연 전용 상태 관리 (6단계)</li>
                  <li>• 팀별 데모 데이터 격리</li>
                </ul>
              </div>

              {/* 휠체어 발주 */}
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="mb-3 text-lg font-semibold text-purple-800">
                  🦽 휠체어 발주 시스템
                </h3>
                <p className="mb-4 text-purple-700">
                  휠체어 전용 창고와 카테고리로 제한된 전문 발주 시스템입니다.
                  보라색 테마로 일반 발주와 구분되어 사용하기 편리합니다.
                </p>
                <ul className="space-y-1 text-sm text-purple-600">
                  <li>• 휠체어 전용 창고로만 발주 제한</li>
                  <li>• 휠체어 관련 카테고리만 선택 가능</li>
                  <li>• 보라색 테마로 시각적 구분</li>
                  <li>• 기존 발주와 동일한 승인 워크플로우</li>
                </ul>
              </div>

              {/* 댓글 시스템 */}
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="mb-3 text-lg font-semibold text-blue-800">
                  💬 댓글 시스템
                </h3>
                <p className="mb-4 text-blue-700">
                  발주 기록에 대한 실시간 소통과 협업을 위한 댓글 기능이
                  추가되었습니다. 발주 관련 이슈나 질문에 즉시 피드백할 수
                  있습니다.
                </p>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li>• 발주별 실시간 댓글 작성 및 관리</li>
                  <li>• 권한 기반 수정/삭제 (작성자 본인 + Admin)</li>
                  <li>• 상대적 시간 표시 (방금 전, N분 전 등)</li>
                  <li>• 수정된 댓글 &quot;(수정됨)&quot; 표시</li>
                </ul>
              </div>

              {/* 공통 컴포넌트 */}
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  🔧 공통 컴포넌트 시스템
                </h3>
                <p className="mb-4 text-gray-700">
                  발주 관련 폼의 재사용 가능한 컴포넌트들이 추가되어 일관된
                  사용자 경험을 제공합니다.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 주소 검색, 파일 업로드 등 8개 공통 컴포넌트</li>
                  <li>• 테마별 색상 지원 (파란색, 보라색)</li>
                  <li>• 반응형 디자인 및 접근성 향상</li>
                  <li>• 코드 중복 제거 및 일관성 향상</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 최신 업데이트 내역 추가 */}
          <div className="mb-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 flex items-start">
            <div className="mr-3 mt-1">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#3B82F6"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold text-blue-700">
                팀 멤버 창고 접근 권한 기능 개선
              </div>
              <div className="text-sm text-gray-700 mt-1">
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    팀 멤버 수정 시 <b>창고 목록이 정확히 표시</b>되고,{" "}
                    <b>접근 제한 체크</b>가 정상 동작합니다.
                  </li>
                  <li>
                    창고 API 응답 구조에 맞춰 <b>창고 배열 추출 로직</b>을
                    개선했습니다.
                  </li>
                  <li>
                    불필요한 콘솔 로그를 <b>간결하게 정리</b>하여 디버깅이
                    쉬워졌습니다.
                  </li>
                  <li>
                    동시성 문제 및 상태 업데이트 타이밍을 보완하여{" "}
                    <b>실시간 반영</b>이 잘 됩니다.
                  </li>
                  <li>
                    UI에서 창고가 없거나 로딩 중일 때 <b>명확한 안내 메시지</b>
                    가 표시됩니다.
                  </li>
                </ul>
                <div className="text-xs text-gray-500 mt-2">2024-06-09</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
