//React 정적 웹사이트를 ElasticBeanStalk같은 Node.js 환경에서 배포하기 위한 서버코드
const express = require('express'); //Express모듈을 불러와서 express라는 이름으로 사용하겠다.
const path = require('path');//파일 경로나 디렉토리 경로를 OS에 맞게 안전하게 조합할 수 있게 해준다.

const app = express(); //express 객체 생성하기 get(), use(), listen()메서드를 사용할 수 있게 해준다.
const port = process.env.PORT || 8080; //설정한 포트가 있으면 사용하고 아니면 8080을 사용해라

app.use(express.static(path.join(__dirname, 'build')));
//build/ 폴더안의 정적파일들을 자동으로 서빙

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
//사용자가 어떤 경로로 들어와도 index.html을 리턴
//React Router같은 SPA(Single Page Application)는 브라우저 URL로 라우팅을 해야하기 때문에, 서버는 항상
//index.html을 리턴해야한다.

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
//실제 서버를 지정한 포트에서 실행