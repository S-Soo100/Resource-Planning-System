import { CalendarEvent, DemoEventDetails, DemoSpanInfo } from '@/types/calendar/calendar';

/**
 * 제목 표시 여부 결정
 */
export function shouldShowTitle(spanInfo: DemoSpanInfo | undefined, columnIndex: number): boolean {
  if (!spanInfo) return true; // 1일짜리는 항상 표시

  // 시작일은 항상 표시
  if (spanInfo.isStart) return true;

  // 중간일 또는 종료일이지만 주의 첫 번째 열(월요일)이면 표시
  if (columnIndex === 0) return true;

  return false;
}

/**
 * 시연 ID별 레이어 인덱스 계산
 * 겹치는 시연들은 다른 레이어에 배치
 */
export function calculateDemoLayers(
  demos: (CalendarEvent & { type: 'demo' })[],
  dateMap: Map<string, number>
): Map<number, number> {
  // 시연 ID별로 그룹화
  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();

  demos.forEach(demo => {
    const id = (demo.details as DemoEventDetails).id;
    if (!demoGroups.has(id)) {
      demoGroups.set(id, []);
    }
    demoGroups.get(id)!.push(demo);
  });

  // 각 시연의 시작-종료 인덱스 계산
  const demoRanges: Array<{ id: number; start: number; end: number }> = [];

  demoGroups.forEach((events, id) => {
    const indices = events
      .map(e => {
        const dateStr = e.date.split('T')[0];
        return dateMap.get(dateStr);
      })
      .filter((i): i is number => i !== undefined)
      .sort((a, b) => a - b);

    if (indices.length > 0) {
      demoRanges.push({
        id,
        start: indices[0],
        end: indices[indices.length - 1]
      });
    }
  });

  // 레이어 할당 (겹치는 것들은 다른 레이어)
  const layerMap = new Map<number, number>();
  const layers: typeof demoRanges[] = [];

  demoRanges.forEach(range => {
    let layerIndex = 0;

    // 겹치지 않는 레이어 찾기
    while (layerIndex < layers.length) {
      const hasOverlap = layers[layerIndex].some(existing =>
        !(range.end < existing.start || existing.end < range.start)
      );

      if (!hasOverlap) break;
      layerIndex++;
    }

    // 새 레이어 생성 필요시
    if (layerIndex >= layers.length) {
      layers.push([]);
    }

    layers[layerIndex].push(range);
    layerMap.set(range.id, layerIndex);
  });

  return layerMap;
}
