# Yaepe

HCE-F를 이용한 안드로이드용 e-amusement pass 에뮬레이션 앱입니다.
실제 카드 없이 스마트폰을 아케이드 기기에 태그하여 카드처럼 사용할 수 있습니다.

현재 버전: **1.0.0**

한국어 | [English](README.en.md)

## 다운로드

[최신 릴리스](https://github.com/creveld/yaepe/releases/latest)에서 APK를 내려받아 설치할 수 있습니다.

## 요구사항

- Android 7.0 (API 24) 이상
- NFC 및 HCE-F(NFC-F) 을 지원하는 기기

## 주요 기능

- **3D 카드 목록** — 실제 카드를 참고하여 만든 카드를 세로로 쌓아 보여 주고, 스크롤해서 고르도록 합니다.
- **카드 활성화 (HCE-F)** — 카드를 탭하면 그 카드로 에뮬레이션이 시작됩니다. 활성화된 카드는 배지로 표시되고, 카드 아트워크가 배경에 흐리게 비칩니다.
- **카드 관리** — 카드 추가, 이름 변경, 삭제. 카드 번호(SID)는 자동으로 생성되며 필요하면 새로 발급할 수 있습니다.
- **KONAMI ID 확인/복사** — 카드 번호를 KONAMI ID로 변환해 4자리씩 보여 줍니다. 편집 화면의 미리보기에서 번호를 탭하면 클립보드에 복사됩니다.
- **커스텀 디자인** — 갤러리에서 고른 이미지를 카드 앞면으로 사용할 수 있습니다.
- **태그 알림** — 카드가 리더기에 인식되면 알림으로 알려 줍니다. (Android 13 이상은 알림 권한 필요)
- **테마** — Material 3 기반 모노크롬 라이트/다크 테마. 헤더 오른쪽 버튼으로 전환합니다.
- **다국어** — 기기 언어에 따라 한국어/영어로 표시됩니다.

## 사용 방법

1. 오른쪽 아래 **+** 버튼으로 카드를 추가합니다.
2. 카드 이름을 입력하고 **저장**합니다. 카드 번호는 자동으로 만들어지고, **카드 번호 변경**으로 새 번호를 발급할 수 있습니다.
3. 메인 화면에서 카드를 탭하면 카드가 **활성화**됩니다. 활성화될 때 짧게 진동합니다.
4. 스마트폰을 아케이드 리더기에 대면 카드가 인식됩니다.
5. 카드를 다시 탭하면 에뮬레이션이 중지됩니다.

카드의 연필 아이콘을 누르면 편집 화면으로 이동합니다. 이름과 커스텀 디자인을 바꾸거나 카드를 삭제할 수 있으며, 활성화된 카드를 삭제하면 에뮬레이션도 함께 중지됩니다.

> 에뮬레이션은 앱이 화면에 떠 있는 동안에만 동작합니다. 앱을 백그라운드로 보내면 일시 중지되고, 다시 열면 재개됩니다.

## 참고사항

- 케이스를 착용하면 인식률이 크게 떨어지는 경우가 있습니다. 카드가 인식되지 않으면 케이스를 제거하고 시도해 보세요.
- 카드 번호를 변경한 뒤에는 이전 번호로 되돌릴 수 없습니다.
- 카드 정보는 기기 안(AsyncStorage)에만 저장됩니다.

## 이전 버전(eAMEMu)에서 올라오는 경우

YaEPe는 독립적으로 개발되며, 이전 eAMEMu와는 별도의 앱으로 설치됩니다. 저장된 카드도 이전되지 않습니다.

## 개발

### 준비물

- Node.js 18 이상 (`.node-version`)
- JDK 17
- Android SDK 33 (Build Tools 33.0.0), NDK 23.1.7779620

### 실행 (개발용)

```bash
npm install
npm start                       # Metro 번들러
npx react-native run-android    # 또는 cd android && ./gradlew :app:installDebug
```

디버그 빌드는 Metro에서 JavaScript를 불러옵니다. 실기기를 USB로 연결해 실행할 때는 `adb reverse tcp:8081 tcp:8081`이 필요합니다.

### 검사

```bash
npx tsc --noEmit
npm run lint
npm test
```

### 릴리스 빌드 (컴퓨터 없이 쓰는 APK)

```bash
npm run android:release         # cd android && ./gradlew assembleRelease
```

릴리스 APK에는 JavaScript 번들과 Hermes 바이트코드가 통째로 들어 있어 **Metro나 컴퓨터 없이 단독으로 실행**됩니다. 밖에서 쓸 때는 이 APK를 설치하세요. (디버그 빌드는 Metro에서 JavaScript를 받아오므로 개발할 때만 사용합니다.)

산출물은 `android/app/build/outputs/apk/release/app-release.apk`입니다. `android/keystore.properties`가 있으면 그 키스토어로, 없으면 디버그 키로 서명되어 바로 설치할 수 있습니다.

```properties
storeFile=/path/to/keystore
storePassword=...
keyAlias=...
keyPassword=...
```

### 프로젝트 구조

```
App.tsx                 내비게이션, 테마, 쿼리 클라이언트 설정
src/components          카드, 3D 캐러셀, 다이얼로그 등 UI 컴포넌트
src/screens             메인 화면, 카드 추가/편집 화면
src/data                카드 저장소 (AsyncStorage)
src/modules             네이티브 모듈 래퍼 (HCE-F, 카드 번호 변환, 알림 권한)
src/state               활성 카드 상태
src/themes              Material 3 테마, 여백 스케일
src/locales             한국어/영어 번역
android/app/src/main/java/eamu/ceed/yaepe
                        HCE-F 서비스 및 네이티브 모듈 (Java/Kotlin)
```

## Special Thanks

- [@dogelition_man](https://github.com/ledoge) — 카드 번호 변환 코드 제공
- [@juchan1220](https://github.com/juchan1220) — 원본 eAMEMu / eAMEMu_RN
