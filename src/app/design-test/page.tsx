"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Download, Settings, Check, X, Star, Calendar } from "lucide-react";

// ────────────────────────────────────────────────────────────
// 컬러 팔레트 데이터 (hex 직접 사용 — Tailwind 동적 클래스 감지 이슈 회피)
// ────────────────────────────────────────────────────────────
const backgroundColors = [
  { token: "Back-Lowest-00", label: "Lowest / 00", hex: "#FFFFFF", border: true },
  { token: "Back-Low-10",    label: "Low / 10",    hex: "#F9FAFD" },
  { token: "Back-Mid-20",    label: "Mid / 20",    hex: "#F3F6F8" },
  { token: "Back-High-25",   label: "High / 25",   hex: "#ECF0F4" },
  { token: "Back-Highest-30",label: "Highest / 30",hex: "#E3E9ED" },
];

const textColors = [
  { token: "Text-Highest-100", label: "Highest / 100", hex: "#171725" },
  { token: "Text-High-90",     label: "High / 90",     hex: "#434E58" },
  { token: "Text-Low-70",      label: "Low / 70",      hex: "#78828A" },
  { token: "Text-Lowest-60",   label: "Lowest / 60",   hex: "#9CA4AB" },
];

const primaryColors = [
  { token: "Primary-Main",      label: "Primary Main",      hex: "#5B5BD6", textHex: "#FFFFFF" },
  { token: "Primary-Container", label: "Primary Container",  hex: "#E8E8FF", textHex: "#1B0070" },
];

const errorColors = [
  { token: "Error-Main",      label: "Error Main",      hex: "#BA1A1A", textHex: "#FFFFFF" },
  { token: "Error-Container", label: "Error Container",  hex: "#FFDAD6", textHex: "#410002" },
];

const outlineColors = [
  { token: "Outline",         label: "Outline",         hex: "#78818A", textHex: "#FFFFFF" },
  { token: "Outline-Variant", label: "Outline Variant", hex: "#C2C8CE", textHex: "#171725" },
];

const grayColors = [
  { token: "Gray-Sub-High-80",     label: "Sub High / 80",  hex: "#66707A", textHex: "#FFFFFF" },
  { token: "Gray-Sub-Low-50",      label: "Sub Low / 50",   hex: "#BFC6CC", textHex: "#FFFFFF" },
  { token: "Gray-Sub-Disabled-40", label: "Disabled / 40",  hex: "#CED1D3", textHex: "#434E58" },
];

// ────────────────────────────────────────────────────────────
// 서브 컴포넌트: 컬러 칩
// ────────────────────────────────────────────────────────────
function ColorChip({
  hex,
  label,
  token,
  border = false,
}: {
  hex: string;
  label: string;
  token: string;
  textHex?: string;
  border?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`h-16 rounded-lg ${border ? "border border-[#E3E9ED]" : ""}`}
        style={{ backgroundColor: hex }}
      />
      <div className="text-xs font-medium text-Text-High-90">{label}</div>
      <div className="text-[10px] text-Text-Low-70 font-mono">{hex}</div>
      <div className="text-[10px] text-Text-Lowest-60 font-mono">{token}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 서브 컴포넌트: 타이포그래피 스케일
// ────────────────────────────────────────────────────────────
const typeScales = [
  { name: "Display Large",   size: "text-[57px]", weight: "font-normal", leading: "leading-[64px]", desc: "57px / 400 / 64px" },
  { name: "Display Medium",  size: "text-[45px]", weight: "font-normal", leading: "leading-[52px]", desc: "45px / 400 / 52px" },
  { name: "Display Small",   size: "text-[36px]", weight: "font-normal", leading: "leading-[44px]", desc: "36px / 400 / 44px" },
  { name: "Headline Large",  size: "text-[32px]", weight: "font-normal", leading: "leading-10",     desc: "32px / 400 / 40px" },
  { name: "Headline Medium", size: "text-[28px]", weight: "font-normal", leading: "leading-9",      desc: "28px / 400 / 36px" },
  { name: "Headline Small",  size: "text-2xl",    weight: "font-normal", leading: "leading-8",      desc: "24px / 400 / 32px" },
  { name: "Title Large",     size: "text-[22px]", weight: "font-normal", leading: "leading-7",      desc: "22px / 400 / 28px" },
  { name: "Title Medium",    size: "text-base",   weight: "font-medium", leading: "leading-6",      desc: "16px / 500 / 24px" },
  { name: "Title Small",     size: "text-sm",     weight: "font-medium", leading: "leading-5",      desc: "14px / 500 / 20px" },
  { name: "Body Large",      size: "text-base",   weight: "font-normal", leading: "leading-6",      desc: "16px / 400 / 24px" },
  { name: "Body Medium",     size: "text-sm",     weight: "font-normal", leading: "leading-5",      desc: "14px / 400 / 20px" },
  { name: "Body Small",      size: "text-xs",     weight: "font-normal", leading: "leading-4",      desc: "12px / 400 / 16px" },
  { name: "Label Large",     size: "text-sm",     weight: "font-medium", leading: "leading-5",      desc: "14px / 500 / 20px — 버튼" },
  { name: "Label Medium",    size: "text-xs",     weight: "font-medium", leading: "leading-4",      desc: "12px / 500 / 16px — 칩" },
  { name: "Label Small",     size: "text-[11px]", weight: "font-medium", leading: "leading-4",      desc: "11px / 500 / 16px" },
];

// ────────────────────────────────────────────────────────────
// 서브 컴포넌트: M3 버튼 5종
// ────────────────────────────────────────────────────────────
function M3Buttons() {
  const btnBase = "h-10 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
      {/* Filled */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-28 text-xs text-Text-Low-70 shrink-0">Filled</span>
        <button className={`${btnBase} px-6 bg-Primary-Main text-white hover:brightness-90 active:brightness-85`}>
          확인
        </button>
        <button className={`${btnBase} pl-4 pr-6 bg-Primary-Main text-white hover:brightness-90`}>
          <Plus size={18} /> 추가
        </button>
        <button disabled className={`${btnBase} px-6 bg-Gray-Sub-Disabled-40 text-Text-Low-70`}>
          비활성
        </button>
      </div>

      {/* Tonal */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-28 text-xs text-Text-Low-70 shrink-0">Tonal</span>
        <button className={`${btnBase} px-6 bg-Primary-Container text-[#1B0070] hover:bg-[#D4D4FF] active:bg-[#C4C4FF]`}>
          확인
        </button>
        <button className={`${btnBase} pl-4 pr-6 bg-Primary-Container text-[#1B0070] hover:bg-[#D4D4FF]`}>
          <Download size={18} /> 내보내기
        </button>
        <button disabled className={`${btnBase} px-6 bg-Gray-Sub-Disabled-40 text-Text-Low-70`}>
          비활성
        </button>
      </div>

      {/* Outlined */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-28 text-xs text-Text-Low-70 shrink-0">Outlined</span>
        <button className={`${btnBase} px-6 bg-transparent text-Primary-Main border border-Outline hover:bg-Primary-Container/30 focus:border-Primary-Main`}>
          취소
        </button>
        <button className={`${btnBase} pl-4 pr-6 bg-transparent text-Primary-Main border border-Outline hover:bg-Primary-Container/30`}>
          <Settings size={18} /> 설정
        </button>
        <button disabled className={`${btnBase} px-6 bg-transparent border border-Gray-Sub-Disabled-40 text-Text-Low-70`}>
          비활성
        </button>
      </div>

      {/* Text */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-28 text-xs text-Text-Low-70 shrink-0">Text</span>
        <button className={`${btnBase} px-3 bg-transparent text-Primary-Main hover:bg-Primary-Container/30`}>
          더보기
        </button>
        <button className={`${btnBase} pl-3 pr-4 bg-transparent text-Primary-Main hover:bg-Primary-Container/30`}>
          <Star size={18} /> 즐겨찾기
        </button>
        <button disabled className={`${btnBase} px-3 bg-transparent text-Text-Low-70`}>
          비활성
        </button>
      </div>

      {/* Elevated */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-28 text-xs text-Text-Low-70 shrink-0">Elevated</span>
        <button className={`${btnBase} px-6 bg-Back-Low-10 text-Primary-Main shadow-sm hover:shadow-md active:shadow-sm`}>
          가져오기
        </button>
        <button className={`${btnBase} pl-4 pr-6 bg-Back-Low-10 text-Primary-Main shadow-sm hover:shadow-md`}>
          <Calendar size={18} /> 일정
        </button>
        <button disabled className={`${btnBase} px-6 bg-Gray-Sub-Disabled-40 text-Text-Low-70 shadow-none`}>
          비활성
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 서브 컴포넌트: M3 칩 4종
// ────────────────────────────────────────────────────────────
function M3Chips() {
  const [filterSelected, setFilterSelected] = useState<Record<string, boolean>>({
    "승인 완료": false,
    "진행 중": false,
    "대기": false,
  });

  const chipBase = "h-8 rounded-lg text-xs font-medium inline-flex items-center transition-all disabled:cursor-not-allowed";

  return (
    <div className="space-y-6">
      {/* Assist Chip */}
      <div>
        <p className="text-xs font-medium text-Text-Low-70 mb-3">Assist Chip — 작업 제안, 선택 상태 없음</p>
        <div className="flex flex-wrap gap-2">
          <button className={`${chipBase} px-4 bg-transparent border border-Outline text-Text-High-90 hover:bg-Back-High-25`}>
            캘린더 추가
          </button>
          <button className={`${chipBase} pl-2 pr-4 bg-transparent border border-Outline text-Text-High-90 hover:bg-Back-High-25 gap-2`}>
            <Calendar size={16} className="text-Primary-Main" />
            일정 저장
          </button>
          <button disabled className={`${chipBase} px-4 bg-transparent border border-Gray-Sub-Disabled-40 text-Text-Low-70`}>
            비활성
          </button>
        </div>
      </div>

      {/* Filter Chip */}
      <div>
        <p className="text-xs font-medium text-Text-Low-70 mb-3">Filter Chip — 토글 필터, 클릭하면 선택/해제</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterSelected).map(([label, selected]) => (
            <button
              key={label}
              onClick={() => setFilterSelected(prev => ({ ...prev, [label]: !selected }))}
              className={`${chipBase} transition-all gap-1.5
                ${selected
                  ? "pl-2 pr-4 bg-Primary-Container text-Text-High-90 border-0"
                  : "px-4 bg-transparent text-Text-High-90 border border-Outline hover:bg-Back-High-25"
                }`}
            >
              {selected && <Check size={14} />}
              {label}
            </button>
          ))}
          <button disabled className={`${chipBase} px-4 bg-Gray-Sub-Disabled-40 text-Text-Low-70`}>
            비활성
          </button>
        </div>
      </div>

      {/* Input Chip */}
      <div>
        <p className="text-xs font-medium text-Text-Low-70 mb-3">Input Chip — 입력 태그, X로 제거 가능</p>
        <div className="flex flex-wrap gap-2">
          {["홍길동", "김철수", "이영희"].map((name) => (
            <div key={name} className={`${chipBase} pl-3 pr-1.5 bg-transparent border border-Outline text-Text-High-90 gap-1`}>
              <span>{name}</span>
              <button className="hover:bg-Back-High-25 rounded p-0.5 transition-colors">
                <X size={14} className="text-Text-Low-70" />
              </button>
            </div>
          ))}
          <div className={`${chipBase} pl-2 pr-1.5 bg-Back-High-25 border-0 text-Text-High-90 gap-1`}>
            <Star size={14} className="text-Primary-Main" />
            <span>즐겨찾기</span>
            <button className="hover:bg-Back-Highest-30 rounded p-0.5 transition-colors">
              <X size={14} className="text-Text-Low-70" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Chip */}
      <div>
        <p className="text-xs font-medium text-Text-Low-70 mb-3">Suggestion Chip — 자동완성 추천</p>
        <div className="flex flex-wrap gap-2">
          {["휠체어", "보행기", "목발", "지팡이", "전동침대"].map((item) => (
            <button key={item} className={`${chipBase} px-4 bg-transparent border border-Outline text-Text-High-90 hover:bg-Back-High-25`}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 서브 컴포넌트: 기존 CTA/Pill 버튼
// ────────────────────────────────────────────────────────────
function LegacyButtons() {
  return (
    <div className="space-y-6">
      {/* CTA rounded-lg */}
      <div>
        <p className="text-xs font-medium text-Text-Low-70 mb-3">CTA — rounded-lg (전체 너비형)</p>
        <div className="flex flex-col gap-3 max-w-xs">
          <button className="h-14 w-full bg-Primary-Main rounded-full text-white text-lg font-semibold">확인</button>
          <button className="h-14 w-full bg-Text-Highest-100 rounded-full text-white text-lg font-semibold">확인</button>
          <button className="h-14 w-full bg-Back-High-25 rounded-full text-Text-High-90 text-lg font-semibold">확인</button>
          <button disabled className="h-14 w-full bg-Gray-Sub-Disabled-40 rounded-full text-white text-lg font-semibold cursor-not-allowed">비활성</button>
        </div>
      </div>

      {/* Pill rounded-full */}
      <div>
        <p className="text-xs font-medium text-Text-Low-70 mb-3">Pill — rounded-full</p>
        <div className="flex flex-wrap gap-3">
          <button className="h-12 px-6 bg-Primary-Main rounded-full text-white text-base font-semibold">확인</button>
          <button className="h-12 px-6 bg-Text-Highest-100 rounded-full text-white text-base font-semibold">확인</button>
          <button className="h-12 px-6 bg-Back-High-25 rounded-full text-Text-High-90 text-base font-semibold">확인</button>
          <button disabled className="h-12 px-6 bg-Gray-Sub-Disabled-40 rounded-full text-white text-base font-semibold cursor-not-allowed">비활성</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────────────────────
export default function DesignTestPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-Back-Low-10">
      {/* Header */}
      <div className="bg-Back-Lowest-00 shadow-sm sticky top-0 z-10">
        <div className="px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-Text-Low-70 hover:text-Text-High-90 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">뒤로</span>
          </button>
          <span className="text-Text-Lowest-60">/</span>
          <h1 className="text-base font-bold text-Text-Highest-100">디자인 테스트</h1>
          <span className="text-[10px] text-Text-Low-70 bg-Back-High-25 px-2 py-0.5 rounded-full">M3 기반</span>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-4xl mx-auto">

        {/* ── 1. 컬러 팔레트 ── */}
        <section className="bg-Back-Lowest-00 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-Text-Highest-100 border-b border-Back-Highest-30 pb-3">
            컬러 팔레트
          </h2>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">Surface Container (배경 계열)</p>
            <div className="grid grid-cols-5 gap-3">
              {backgroundColors.map((c) => <ColorChip key={c.token} {...c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">On Surface (텍스트 / 아이콘)</p>
            <div className="grid grid-cols-4 gap-3">
              {textColors.map((c) => <ColorChip key={c.token} {...c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">Primary</p>
            <div className="grid grid-cols-4 gap-3">
              {primaryColors.map((c) => <ColorChip key={c.token} {...c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">Error</p>
            <div className="grid grid-cols-4 gap-3">
              {errorColors.map((c) => <ColorChip key={c.token} {...c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">Outline</p>
            <div className="grid grid-cols-4 gap-3">
              {outlineColors.map((c) => <ColorChip key={c.token} {...c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">Gray Sub</p>
            <div className="grid grid-cols-4 gap-3">
              {grayColors.map((c) => <ColorChip key={c.token} {...c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-Text-Low-70 mb-3">Neutral</p>
            <div className="grid grid-cols-4 gap-3">
              <ColorChip token="Neutral-White" label="White" hex="#FFFFFF" border />
              <ColorChip token="Neutral-Black" label="Black" hex="#0C0B17" />
            </div>
          </div>
        </section>

        {/* ── 2. 타이포그래피 스케일 ── */}
        <section className="bg-Back-Lowest-00 rounded-xl shadow-sm p-6 space-y-2">
          <h2 className="text-sm font-bold text-Text-Highest-100 border-b border-Back-Highest-30 pb-3 mb-4">
            타이포그래피 — M3 Type Scale (Pretendard)
          </h2>
          {typeScales.map((s) => (
            <div key={s.name} className="flex items-baseline gap-4 py-1 border-b border-Back-Low-10 last:border-0">
              <span className="w-36 text-[10px] text-Text-Low-70 shrink-0 font-mono">{s.name}</span>
              <span className={`${s.size} ${s.weight} ${s.leading} text-Text-Highest-100 flex-1 truncate`}>
                가나다 ABC 123
              </span>
              <span className="text-[10px] text-Text-Lowest-60 shrink-0 hidden sm:block">{s.desc}</span>
            </div>
          ))}
        </section>

        {/* ── 3. M3 버튼 5종 ── */}
        <section className="bg-Back-Lowest-00 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-Text-Highest-100 border-b border-Back-Highest-30 pb-3">
            M3 Button — 5종 (높이 40px / rounded-full)
          </h2>
          <M3Buttons />
        </section>

        {/* ── 4. M3 칩 4종 ── */}
        <section className="bg-Back-Lowest-00 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-Text-Highest-100 border-b border-Back-Highest-30 pb-3">
            M3 Chip — 4종 (높이 32px / rounded-lg)
          </h2>
          <M3Chips />
        </section>

        {/* ── 5. 기존 CTA / Pill 버튼 ── */}
        <section className="bg-Back-Lowest-00 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-Text-Highest-100 border-b border-Back-Highest-30 pb-3">
            기존 CTA / Pill 버튼 (레거시 참고용)
          </h2>
          <LegacyButtons />
        </section>

        {/* ── 6. 추가 영역 ── */}
        <section className="bg-Back-Lowest-00 rounded-xl shadow-sm p-6 border-2 border-dashed border-Back-Highest-30">
          <p className="text-sm text-Text-Low-70 text-center">+ 여기에 테스트할 컴포넌트 추가</p>
        </section>

      </div>
    </div>
  );
}
