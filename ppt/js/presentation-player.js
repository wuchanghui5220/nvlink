// presentation-player.js
class PresentationPlayer {
    constructor(config) {
        this.config = config;
        this.currentPage = 0;
        this.totalPages = config.pages.length;
        this.init();
    }

    async init() {
        this.generatePageNumbers();
        await this.loadPage(0);
        this.bindEvents();
    }

    // 生成页码导航
    generatePageNumbers() {
        const numbersContainer = document.getElementById('page-numbers');
        for (let i = 0; i < this.totalPages; i++) {
            const pageNum = document.createElement('button');
            pageNum.textContent = i + 1;
            pageNum.className = i === 0 ? 'active' : '';
            pageNum.onclick = () => this.goToPage(i);
            numbersContainer.appendChild(pageNum);
        }
    }

    // 加载指定页面
    async loadPage(pageIndex) {
        try {
            const response = await fetch(this.config.pages[pageIndex]);
            const html = await response.text();
            
            // 提取页面主体内容（去除html、head、body标签）
            const content = this.extractPageContent(html);
            document.getElementById('page-content').innerHTML = content;
            
            this.updateNavigation(pageIndex);
        } catch (error) {
            console.error('Failed to load page:', error);
        }
    }

    // 提取页面内容
    extractPageContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 获取slide-container内容或整个body
        const slideContainer = doc.querySelector('.slide-container');
        return slideContainer ? slideContainer.outerHTML : doc.body.innerHTML;
    }

    // 更新导航状态
    updateNavigation(pageIndex) {
        // 更新页码按钮状态
        document.querySelectorAll('.page-numbers button').forEach((btn, index) => {
            btn.className = index === pageIndex ? 'active' : '';
        });

        // 更新前后按钮状态
        document.getElementById('prev-btn').disabled = pageIndex === 0;
        document.getElementById('next-btn').disabled = pageIndex === this.totalPages - 1;
        
        this.currentPage = pageIndex;
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('prev-btn').onclick = () => this.previousPage();
        document.getElementById('next-btn').onclick = () => this.nextPage();
        
        // 键盘导航
        document.onkeydown = (e) => {
            if (e.key === 'ArrowLeft') this.previousPage();
            if (e.key === 'ArrowRight') this.nextPage();
        };
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.loadPage(this.currentPage - 1);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.loadPage(this.currentPage + 1);
        }
    }

    goToPage(pageIndex) {
        this.loadPage(pageIndex);
    }
}

// 初始化函数
function initPlayer(config) {
    new PresentationPlayer(config);
}
