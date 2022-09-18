임시 가이드

<사전에 할것>
1. cordova 설치
2. nodejs , npm 설치
3. git 설치

<설치> 
1. npm install -g frontle
2. frontle create 프로젝트이름
3. 프로젝트 안으로 들어가기
4. frontle install
5. cordova platform add browser
6. cordova run browser --live-reload

<모듈 설치>
- frontle install // package.json에 적힌 패키지들 전부 자동 설치
- frontle install "npm 모듈 이름"
    - 설치한 모듈이름 js에 적으면 경로 자동완성됨.
- frontle uninstall "npm 모듈 이름"

<업데이트>
1. 깃에 먼저 작업물 백업
2. frontle update
   1. 변경되는 파일 잘 판단하기

<빌드>
1. frontle switch // 빌드되고나서 한번 더 치면 원래 환경으로 돌아감
2. frontle switch prod // 프로덕트로 빌드, frontle.env.mode 값이 dev에서 prod가 됨

<기타>
- frontle help // 명령어 보기
- frontle -v // 버전 보기