// 필요한 라이브러리들을 가져옵니다.
const express = require('express');
const path = require('path');
const session = require('express-session');

// Express 앱을 생성합니다.
const app = express();
// Render.com이 지정하는 포트를 사용하거나, 없으면 3000번 포트를 사용합니다.
const PORT = process.env.PORT || 3000;

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
    cookie: { secure: false } // https가 아닐 때도 세션을 허용 (Render는 프록시 뒤에서 https 처리)
}));

// --- 라우트(주소) 설정 ---

// 1. 메인 페이지 ('/') 라우트
app.get('/', (req, res) => {
    // 사용자가 로그인했는지 세션을 확인합니다.
    if (req.session.user) {
        // 로그인했다면, 메인 단가표 페이지(index.html)를 보냅니다.
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        // 로그인하지 않았다면, 로그인 페이지로 보냅니다.
        res.redirect('/login');
    }
});

// 2. 로그인 페이지 ('/login')를 보여주는 라우트
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 3. 로그인 요청을 처리하는 라우트
app.post('/login', (req, res) => {
    const { password } = req.body;
    const user = userPasswords[password];

    if (user) {
        // 비밀번호가 맞으면, 세션에 사용자 정보를 저장합니다.
        req.session.user = user;
        console.log(`[로그인 성공] ${user} 님이 접속했습니다.`);
        // 메인 페이지로 리다이렉트합니다.
        res.redirect('/');
    } else {
        // 비밀번호가 틀리면, 다시 로그인 페이지로 보냅니다.
        console.log('[로그인 실패] 잘못된 비밀번호가 입력되었습니다.');
        res.redirect('/login');
    }
});

// 4. 현재 로그인된 사용자가 누구인지 알려주는 API
app.get('/api/whoami', (req, res) => {
    if (req.session.user) {
        res.json({ loggedInUser: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// 5. 기타 정적 파일(sw.js, 아이콘 등)을 제공하는 미들웨어
// 이 미들웨어는 위의 라우트들에서 처리되지 않은 모든 요청에 대해 실행됩니다.
app.use(express.static(path.join(__dirname)));


// 서버를 시작합니다.
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT} 에서 실행되었습니다.`);
});
