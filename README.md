# QR_Checker - 전자출입명부(KI-Pass) QR코드 생성기
[![TypeScript](https://img.shields.io/badge/Built%20with-Typescript-informational?logo=typescript)](https://www.typescriptlang.org/)
[![Passed](https://img.shields.io/badge/Build-Passed-success)](#)
[![License](https://img.shields.io/github/license/pinmilk/QR_Checker)](./LICENSE)
- Note: It can stop working anytime.
        You should register on Naver KI-Pass.
- 전달: 이 프로그램은 언제든지 작동을 멈출 수 있습니다.
        당신은 네이버 KI-Pass에 등록을 해야 합니다.
## 사용법

### 1. 저장소 복제
```bash
git clone https://github.com/PinMilk/QR_Checker
```
위 명령어로 QR_Checker 레포를 클론합니다.

### 2. 코드 짜기
아래와 같이 코드를 짭니다.
```typescript
import { QRChecker } from './';

new QRChecker('username'/** 네이버 ID */, 'password' /** 네이버 비밀번호 */)
    .getQR()
    .then(res => console.log(res))
    .catch(e => console.log(e));
```

### 3. TypeScript 빌드
이 레포가 있는 디렉토리에서 아래 명령어로 타입스크립트를 빌드해줍니다!
```bash
tsc
```
### 4. Enjoy
이제 Express 등을 이용하여, 특정 URL로 접속하면 QR코드를 출력하는 형식으로 만들거나,
안드로이드, iOS 등으로 QR코드를 출력하는 앱을 만들어 사용할 수 있습니다.
## Reference
py_naver_login([neicebee](https://github.com/neicebee/py_naver_login))
## License
QR_Checker is following MIT License.