// 간단한 서버 테스트
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 테스트 데이터
const users = [
    {
        id: 1,
        email: 'enterprise@demo.com',
        password: '$2a$10$5j5GVgXXx5eNHFJGZJjJbOWbgKqGK6mTTgTgqI8wPGvxZX5QOXhZa', // demo123
        managerName: '김담당',
        companyName: '데모기업',
        role: 'enterprise'
    }
];

const adminUser = {
    id: 'admin',
    email: 'admin@koreagpt.org',
    password: 'admin123!@#',
    role: 'admin'
};

// JWT 토큰 생성
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'test_secret_key',
        { expiresIn: '7d' }
    );
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 일반 로그인
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);
        
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const token = generateToken(user);
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                managerName: user.managerName,
                companyName: user.companyName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 관리자 로그인
app.post('/api/auth/admin/login', (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Admin login attempt:', email);
        
        if (email === adminUser.email && password === adminUser.password) {
            const token = generateToken(adminUser);
            
            res.json({
                message: 'Admin login successful',
                token,
                user: adminUser
            });
        } else {
            res.status(400).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 회원가입
app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            email,
            password,
            managerName,
            position,
            phone,
            companyName,
            businessNumber,
            industry,
            employeeCount
        } = req.body;
        
        console.log('Register attempt:', email);
        
        // 중복 확인
        const existing = users.find(u => u.email === email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // 비밀번호 해시
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            managerName,
            position,
            phone,
            companyName,
            businessNumber,
            industry,
            employeeCount,
            role: 'enterprise'
        };
        
        users.push(newUser);
        
        const token = generateToken(newUser);
        
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                managerName: newUser.managerName,
                companyName: newUser.companyName
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 프로그램 목록
app.get('/api/enterprise/programs', (req, res) => {
    const programs = [
        {
            id: 1,
            programCode: 'BASIC-001',
            programName: 'ChatGPT 기초 과정',
            description: 'AI 기초 이해와 ChatGPT 활용법',
            pricePerPerson: 200000,
            duration: '1일 (8시간)',
            programLevel: 'basic',
            isActive: true
        },
        {
            id: 2,
            programCode: 'INTER-001',
            programName: '업무 자동화 과정',
            description: '실무 적용 가능한 자동화 스킬',
            pricePerPerson: 350000,
            duration: '2일 (16시간)',
            programLevel: 'intermediate',
            isActive: true
        },
        {
            id: 3,
            programCode: 'ADV-001',
            programName: 'AI 전문가 과정',
            description: '고급 AI 활용 및 전략 수립',
            pricePerPerson: 500000,
            duration: '3일 (24시간)',
            programLevel: 'advanced',
            isActive: true
        }
    ];
    
    res.json(programs);
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET  /api/health');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/auth/admin/login');
    console.log('- POST /api/auth/register');
    console.log('- GET  /api/enterprise/programs');
});

// 테스트 비밀번호 생성 (demo123)
// bcrypt.hash('demo123', 10).then(hash => console.log('Hashed password:', hash));