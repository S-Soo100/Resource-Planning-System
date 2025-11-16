# TeamItem 이미지 업로드 API

> **프론트엔드 개발자용** - TeamItem 이미지 업로드/삭제 API 명세

## 📋 개요

- 품목 이미지 업로드 (최대 5MB)
- 품목 이미지 삭제
- 품목 조회 시 imageUrl 필드 자동 포함
- 새 이미지 업로드 시 기존 이미지 자동 교체

**지원 형식**: JPG, JPEG, PNG, GIF, WebP

---

## 🔐 인증

모든 API는 JWT 인증 필수

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📡 API 엔드포인트

### 1. 이미지 업로드

```
POST /team-item/:id/image
```

**요청**
- Content-Type: `multipart/form-data`
- Path Parameter: `id` (number) - TeamItem ID
- Body: `image` (File) - 이미지 파일 (최대 5MB)

**성공 응답 (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "itemCode": "ITEM-001",
    "itemName": "노트북",
    "memo": "사무용 노트북",
    "imageUrl": "https://storage.googleapis.com/erp-bucket/team-items/노트북_a1b2c3d4.jpg",
    "teamId": 1,
    "categoryId": 1,
    "team": {
      "id": 1,
      "teamName": "개발팀"
    }
  }
}
```

**에러 응답**
- `404`: 품목을 찾을 수 없음
- `400`: 파일 없음 / 잘못된 파일 형식 / 파일 크기 초과

---

### 2. 이미지 삭제

```
DELETE /team-item/:id/image
```

**요청**
- Path Parameter: `id` (number) - TeamItem ID

**성공 응답 (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "itemCode": "ITEM-001",
    "itemName": "노트북",
    "imageUrl": null
  }
}
```

**에러 응답**
- `404`: 품목을 찾을 수 없음 / 삭제할 이미지가 없음

---

### 3. 품목 조회 (imageUrl 포함)

```
GET /team-item/:id
GET /team-item
GET /team-item/team/:teamId
```

기존 조회 API 응답에 `imageUrl` 필드가 자동으로 포함됩니다.

---

## 💻 구현 예시

### JavaScript (Fetch)

```javascript
// 이미지 업로드
async function uploadImage(teamItemId, file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`/team-item/${teamItemId}/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.data.imageUrl;
}

// 이미지 삭제
async function deleteImage(teamItemId) {
  const response = await fetch(`/team-item/${teamItemId}/image`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}
```

### React + Axios

```typescript
import axios from 'axios';

// 이미지 업로드
const uploadImage = async (teamItemId: number, file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(
    `/team-item/${teamItemId}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data.imageUrl;
};

// 이미지 삭제
const deleteImage = async (teamItemId: number) => {
  await axios.delete(`/team-item/${teamItemId}/image`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

---

## ⚠️ 주의사항

### 파일 제한
- **최대 크기**: 5MB
- **지원 형식**: JPG, JPEG, PNG, GIF, WebP

### 이미지 교체
- 새 이미지 업로드 시 기존 이미지는 **자동으로 삭제**됨
- 별도 삭제 API 호출 불필요

### CORS
- 이미지 URL은 Google Cloud Storage에서 제공
- 브라우저에서 직접 접근 가능

---

## 📚 관련 문서

- [TeamItem API 전체 명세](./item_spec.md)
- [이미지 업로드 기능 상세 명세](./item-image-feature.md)

---

**작성일**: 2025-11-14
**버전**: 2.0
