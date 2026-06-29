# recipe-agent GPT API 실행 버전

식재료 리스트를 입력하면 GPT API를 호출해서 VSCode 터미널에 레시피 추천과 조리 과정을 출력합니다.

## 문서

- [Recipe Agent 구현 기획서](./Recipe%20Agent%20구현%20기획서.md)
- [visual-agent 연결 정리](./visual-agent-handoff.md)

## 실행 방법

먼저 `.env.example`을 참고해서 `.env` 파일을 만들고 API 키를 넣습니다.

```env
OPENAI_API_KEY=sk-proj-실제_API키
OPENAI_MODEL=gpt-5.5
```

그 다음 VSCode 터미널에서 실행합니다.

```powershell
.\run.bat
```

실행하면 GPT API 응답이 터미널에 바로 출력됩니다.

## 입력 형식

```json
{
  "ingredients": ["감자", "양파", "돼지고기"]
}
```

## 출력 형식

```text
1. 메뉴명
이름: 메뉴명
난이도: 쉬움
시간: 20분
사용 재료: 감자 1개(150g), 양파 1/2개(100g), 돼지고기 120g
기본 양념: 간장 1큰술(15ml), 식용유 1큰술(15ml), 참기름 1작은술(5ml)
추천 이유: 현재 가진 재료를 많이 활용할 수 있고 조리 과정이 간단합니다.
조리 과정:
1단계: 재료를 손질한다.
2단계: 팬을 예열한다.
3단계: 재료를 볶거나 익힌다.
4단계: 양념을 넣고 섞는다.
5단계: 접시에 담아 완성한다.
요리 팁: 불은 중불로 유지하면 타는 것을 줄일 수 있습니다.
```

`.env` 파일은 GitHub에 올리지 않습니다.

## visual-agent 연결

다음 담당자에게 전달할 형식은 `visual-agent-handoff.md`에 정리되어 있습니다.
