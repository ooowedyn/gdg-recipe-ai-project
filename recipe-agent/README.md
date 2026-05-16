# Recipe Agent

식재료 리스트를 바탕으로 만들 수 있는 한식 메뉴를 추천하는 에이전트입니다.

## 입력

`ingredient-agent`의 출력과 같습니다.

```json
{
  "ingredients": ["계란", "대파", "양파"]
}
```

## 출력

```json
{
  "recipes": [
    {
      "title": "대파계란덮밥",
      "usedIngredients": ["계란", "대파"],
      "time": "10분",
      "difficulty": "쉬움",
      "reason": "현재 가진 재료만으로 간단하게 만들 수 있고 조리 시간이 짧습니다."
    },
    {
      "title": "계란국",
      "usedIngredients": ["계란", "대파"],
      "time": "15분",
      "difficulty": "쉬움",
      "reason": "기본 재료만으로 만들 수 있는 간단한 국물 요리입니다."
    },
    {
      "title": "양파계란볶음",
      "usedIngredients": ["계란", "양파"],
      "time": "10분",
      "difficulty": "쉬움",
      "reason": "계란과 양파만으로 빠르게 만들 수 있는 반찬입니다."
    }
  ]
}
```

## 파일

- `sample-input.json`: 입력 예시
- `sample-output.json`: 출력 예시

## 작업 기준

- 추천 메뉴는 3개 이상 생성합니다.
- 보유 재료를 최대한 활용합니다.
- 조리 시간과 난이도를 함께 제공합니다.

