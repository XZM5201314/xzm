class MainPage {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.initializeUI();
        this.initializeEventListeners();
        this.loadArticles();
        this.loadCarousel();
    }

    initializeUI() {
        const loggedInUI = document.querySelector('.logged-in');
        const loggedOutUI = document.querySelector('.logged-out');
        const usernameSpan = document.querySelector('.username');
        const commentForms = document.querySelectorAll('.comment-form');
        const adminLink = document.querySelector('.admin-link');

        if (this.currentUser) {
            // 用户已登录
            loggedInUI.style.display = 'flex';
            loggedOutUI.style.display = 'none';
            usernameSpan.textContent = this.currentUser.username;
            
            // 如果是管理员，显示管理入口
            if (this.currentUser.role === 'admin' && adminLink) {
                adminLink.style.display = 'block';
            }
            
            // 启用评论功能
            commentForms.forEach(form => {
                form.style.display = 'block';
            });
        } else {
            // 用户未登录
            loggedInUI.style.display = 'none';
            loggedOutUI.style.display = 'flex';
            if (adminLink) {
                adminLink.style.display = 'none';
            }
            
            // 禁用评论功能，显示登录提示
            commentForms.forEach(form => {
                form.style.display = 'none';
                const loginPrompt = document.createElement('p');
                loginPrompt.className = 'login-prompt';
                loginPrompt.innerHTML = '请<a href="login.html">登录</a>后发表评论';
                form.parentNode.insertBefore(loginPrompt, form);
            });
        }
    }

    initializeEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 为评论表单添加提交前的验证
        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        });
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        window.location.reload();
    }

    handleCommentSubmit(e) {
        e.preventDefault();
        if (!this.currentUser) {
            alert('请先登录后再评论');
            window.location.href = 'login.html';
            return;
        }
        
        // 处理评论提交逻辑...
        const form = e.target;
        const textarea = form.querySelector('textarea');
        const commentsList = form.parentElement.querySelector('.comments-list');

        if (textarea.value.trim()) {
            this.addComment(commentsList, textarea.value);
            textarea.value = '';
        }
    }

    addComment(container, content) {
        const comment = document.createElement('div');
        comment.className = 'comment-item';
        
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        comment.innerHTML = `
            <div class="comment-meta">
                <span class="comment-author">${this.currentUser.username}</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-content">${this.escapeHtml(content)}</div>
        `;

        container.insertBefore(comment, container.firstChild);
        
        // 保存评论到 localStorage
        this.saveComment({
            id: Date.now().toString(),
            author: this.currentUser.username,
            content: content,
            date: formattedDate,
            userId: this.currentUser.phone
        });
    }

    saveComment(comment) {
        const comments = JSON.parse(localStorage.getItem('comments')) || [];
        comments.unshift(comment);
        localStorage.setItem('comments', JSON.stringify(comments));
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadArticles() {
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        const articleGrid = document.querySelector('.article-grid');
        articleGrid.innerHTML = '';

        articles.forEach(article => {
            const articleElement = document.createElement('article');
            articleElement.className = 'article-card';
            articleElement.innerHTML = `
                <img src="${article.image}" alt="${article.title}">
                <div class="article-info">
                    <span class="article-category">${article.category}</span>
                    <h2>${article.title}</h2>
                    <time>${article.date}</time>
                    <p class="article-summary">${article.summary}</p>
                    <a href="#" class="read-more">阅读全文 →</a>
                    <div class="comments-section">
                        <h3>评论</h3>
                        <form class="comment-form">
                            <textarea placeholder="写下你的评论..." required></textarea>
                            <button type="submit">发表评论</button>
                        </form>
                        <div class="comments-list">
                            <!-- 评论将通过 JavaScript 动态添加 -->
                        </div>
                    </div>
                </div>
            `;
            articleGrid.appendChild(articleElement);
        });

        // 重新初始化评论功能
        this.initializeUI();
    }

    loadCarousel() {
        const carouselImages = JSON.parse(localStorage.getItem('carouselImages')) || [];
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.innerHTML = '';

        if (carouselImages.length === 0) {
            // 如果没有轮播图，显示默认图片
            carouselContainer.innerHTML = `
                <div class="carousel-slide">
                    <img src="default-carousel.jpg" alt="默认图片">
                    <div class="caption">欢迎访问我的博客</div>
                </div>
            `;
            return;
        }

        carouselImages
            .sort((a, b) => a.order - b.order)
            .forEach(image => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                slide.innerHTML = `
                    <img src="${image.url}" alt="${image.caption}">
                    <div class="caption">${image.caption}</div>
                `;
                carouselContainer.appendChild(slide);
            });
    }
}

// 初始化主页
document.addEventListener('DOMContentLoaded', () => {
    new MainPage();
}); 