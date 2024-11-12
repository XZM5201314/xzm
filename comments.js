class CommentSystem {
    constructor() {
        this.initializeComments();
    }

    initializeComments() {
        // 为所有评论表单添加提交事件监听器
        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        });
    }

    handleCommentSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const textarea = form.querySelector('textarea');
        const commentsList = form.parentElement.querySelector('.comments-list');

        if (textarea.value.trim()) {
            this.addComment(commentsList, textarea.value);
            textarea.value = ''; // 清空输入框
        }
    }

    addComment(container, content) {
        const comment = document.createElement('div');
        comment.className = 'comment-item';
        
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        comment.innerHTML = `
            <div class="comment-meta">
                <span class="comment-author">访客</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-content">${this.escapeHtml(content)}</div>
        `;

        container.insertBefore(comment, container.firstChild);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// 初始化评论系统
document.addEventListener('DOMContentLoaded', () => {
    new CommentSystem();
}); 