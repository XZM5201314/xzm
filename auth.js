class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        
        // 创建默认管理员账号
        this.initializeAdmin();
        this.initializeEventListeners();
    }

    initializeAdmin() {
        if (!this.users.some(user => user.role === 'admin')) {
            const admin = {
                username: 'admin',
                phone: '18819156795',
                password: 'mumu0328', // 实际应用中应该使用加密密码
                role: 'admin'
            };
            this.users.push(admin);
            this.saveUsers();
        }
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        const user = this.users.find(u => u.phone === phone && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
        } else {
            this.showError('手机号或密码错误');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showError('两次输入的密码不一致');
            return;
        }

        if (this.users.some(u => u.phone === phone)) {
            this.showError('该手机号已被注册');
            return;
        }

        const newUser = {
            username,
            phone,
            password,
            role: 'user'
        };

        this.users.push(newUser);
        this.saveUsers();
        window.location.href = 'login.html';
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// 初始化认证系统
new AuthSystem(); 