export interface IOrderRecord {
  id: number; // 자동생성될 발주아이디
  orderer: string; // 보내는 사람, 보통 user name
  package: string; // 패키지, 휠체어 혹은 휠리엑스 플레이 베이직 등등
  quantity: number; // 갯수
  date: string; // 날짜 스트링으로 찍어서 보낼것(202x-xx-xx)
  address: string; // 주소, 상세주소까지 다 포함해서 1줄로 보낼 듯
  recipient: string; // 받는 사람
  recipientPhone: string; // 받는 사람 전화번호
  additionalItems: string; // 추가물품
  quote: string; // 견적서 보기 기능(string) 은 아닐 수 있음
  status: string; // number가 될 거 같기도 한데, 요청 -> 수락 -> 배송중 -> 완료 - 보류 등등??
  orderSheet: string; // 파일[] 로 될것이고, 필요한 파일들 첨부한 경우 여기에다 보관
}
