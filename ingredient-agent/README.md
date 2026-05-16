# Ingredient Agent

사진 속 식재료를 인식하고 식재료 리스트를 생성하는 에이전트입니다.

## 입력

이미지 자체를 JSON에 넣기 어렵기 때문에 MVP에서는 이미지 파일명을 입력값으로 사용합니다.

```json
{
  "imageFileName": "sample-ingredients.jpg",
  "description": "계란, 대파, 양파가 보이는 식재료 사진"
}
```

## 출력

```json
{
  "ingredients": ["계란", "대파", "양파"]
}
```

## 파일

- `sample-input.json`: 입력 예시
- `sample-output.json`: 출력 예시

## 작업 기준

- 식재료 이름은 한국어로 작성합니다.
- 확실하지 않은 재료는 임의로 추가하지 않습니다.
- 출력 형식은 `docs/data-format.md`를 따릅니다.

