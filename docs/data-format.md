# 데이터 형식

## ingredient-agent 입력

이미지 자체를 JSON에 넣기 어렵기 때문에 MVP 문서상으로는 이미지 파일명을 넣는 방식으로 정리합니다.

```json
{
  "imageFileName": "sample-ingredients.jpg",
  "description": "계란, 대파, 양파가 보이는 식재료 사진"
}
```

## ingredient-agent 출력

```json
{
  "ingredients": ["계란", "대파", "양파"]
}
```

## recipe-agent 입력

`ingredient-agent`의 출력과 같습니다.

```json
{
  "ingredients": ["계란", "대파", "양파"]
}
```

## recipe-agent 출력

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

## visual-agent 입력

`recipe-agent`의 출력 중에서 사용자가 선택한 메뉴 하나입니다.

```json
{
  "title": "대파계란덮밥",
  "usedIngredients": ["계란", "대파"],
  "time": "10분",
  "difficulty": "쉬움",
  "reason": "현재 가진 재료만으로 간단하게 만들 수 있고 조리 시간이 짧습니다."
}
```

## visual-agent 출력

```json
{
  "title": "대파계란덮밥",
  "ingredients": ["계란", "대파", "밥"],
  "time": "10분",
  "difficulty": "쉬움",
  "steps": [
    {
      "step": 1,
      "title": "재료 준비",
      "description": "대파를 송송 썰고 계란을 그릇에 풀어둡니다.",
      "tip": "칼질이 어렵다면 가위로 대파를 잘라도 됩니다."
    },
    {
      "step": 2,
      "title": "대파 볶기",
      "description": "팬에 식용유를 두르고 대파를 약한 불에서 볶아 향을 냅니다.",
      "tip": "대파가 타지 않도록 중간중간 저어주세요."
    },
    {
      "step": 3,
      "title": "계란 익히기",
      "description": "풀어둔 계란을 팬에 넣고 부드럽게 익힙니다.",
      "tip": "계란이 완전히 굳기 전에 불을 끄면 더 부드럽습니다."
    },
    {
      "step": 4,
      "title": "밥 위에 올리기",
      "description": "완성된 대파계란을 밥 위에 올려 마무리합니다.",
      "tip": "간이 부족하면 간장을 조금 추가해도 좋습니다."
    }
  ]
}
```

