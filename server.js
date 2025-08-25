console.log('체크포인트 1: server.js 파일 실행 시작');

// 필요한 라이브러리들을 가져옵니다.
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

console.log('체크포인트 2: 라이브러리 및 변수 선언 완료');

// '비밀번호: 사용자이름' 객체
const userPasswords = {
    '0011': '김주석',
    'banana456': 'Lee',
    'cherry789': 'Park'
};

// POST 요청의 본문(body)을 해석하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// 세션 미들웨어 설정
app.use(session({
    secret: 'a-very-secret-key-that-is-long-and-random', // 비밀 키
    resave: false,
    saveUninitialized: true,
}));

console.log('체크포인트 3: 미들웨어 설정 완료');

// 로그인 페이지를 보여주는 라우트
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 비밀번호를 확인하는 라우트
app.post('/login', (req, res) => {
    const { password } = req.body;
    const user = userPasswords[password];

    if (user) {
        req.session.user = user;
        console.log(`[로그인 성공] ${user} 님이 접속했습니다.`);
        res.redirect('/');
    } else {
        console.log('[로그인 실패] 잘못된 비밀번호가 입력되었습니다.');
        res.redirect('/login');
    }
});
// (추가) 현재 로그인된 사용자가 누구인지 알려주는 API
app.get('/api/whoami', (req, res) => {
    if (req.session.user) {
        res.json({ loggedInUser: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
// 메인 페이지 및 기타 파일들을 보호하는 로직
app.use((req, res, next) => {
    if (req.session.user) {
        next(); // 로그인 상태이면 다음 단계로 진행
    } else {
        res.redirect('/login'); // 로그인 상태가 아니면 로그인 페이지로
    }
});

// 로그인 된 사용자에게만 파일을 보여줌
app.use(express.static(path.join(__dirname)));

console.log('체크포인트 4: 라우트 및 로직 설정 완료');

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행되었습니다.`);
});