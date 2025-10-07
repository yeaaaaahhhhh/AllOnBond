## 브랜딩

- 서비스명: All on bond (All on board 언어유희)
- 톤&매너: 신뢰감+친절, 금융 계산 근거를 투명하게 공개
- 테마: 트렌디한 하늘색 계열, 명도 대비 확보

### 컬러 팔레트 (WCAG 대비 고려)
- Primary 600: #2FA7F5 (버튼/링크)
- Primary 700: #1C8EDB (호버)
- Primary 800: #156FB0 (활성/강조)
- Primary 50:  #EAF6FF (배경 틴트)
- Gray 900:    #0F172A (본문)
- Gray 600:    #475569 (보조 텍스트)
- Gray 400:    #94A3B8 (옅은 텍스트, "기준일" 표기용)
- Success 600: #16A34A
- Warning 600: #D97706
- Error 600:   #DC2626

### 디자인 토큰 예시
```json
{
  "color": {
    "primary": {
      "50": "#EAF6FF",
      "600": "#2FA7F5",
      "700": "#1C8EDB",
      "800": "#156FB0"
    },
    "gray": {
      "400": "#94A3B8",
      "600": "#475569",
      "900": "#0F172A"
    },
    "semantic": {
      "success": "#16A34A",
      "warning": "#D97706",
      "error":   "#DC2626"
    }
  },
  "radius": { "sm": 6, "md": 10, "lg": 14 },
  "shadow": { "sm": "0 1px 2px rgba(0,0,0,.06)", "md": "0 6px 20px rgba(0,0,0,.08)" },
  "spacing": { "xs": 8, "sm": 12, "md": 16, "lg": 24, "xl": 32 },
  "font": { "family": "Inter, Pretendard, system-ui", "sizeBase": 16 }
}
```

### 로고/파비콘
- 단순 텍스트 로고: "All on bond"에서 bond의 b에 원형 쿠폰 아이콘
- 파비콘: 하늘색 배경에 흰색 채권/쿠폰 심볼
