// 产品报价管理系统主应用逻辑

class QuoteApp {
    constructor() {
        this.products = [];
        this.quotes = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.setDefaultDate();
    }

    // 数据管理
    loadData() {
        try {
            const savedProducts = localStorage.getItem('quote_products');
            const savedQuotes = localStorage.getItem('quote_quotes');

            this.products = savedProducts ? JSON.parse(savedProducts) : [];
            this.quotes = savedQuotes ? JSON.parse(savedQuotes) : [];

            console.log('数据加载完成:', { products: this.products.length, quotes: this.quotes.length });
        } catch (error) {
            console.error('数据加载失败:', error);
            this.showAlert('数据加载失败，请检查浏览器存储设置', 'danger');
        }
    }

    saveData() {
        try {
            localStorage.setItem('quote_products', JSON.stringify(this.products));
            localStorage.setItem('quote_quotes', JSON.stringify(this.quotes));
            console.log('数据保存完成');
        } catch (error) {
            console.error('数据保存失败:', error);
            this.showAlert('数据保存失败，请检查浏览器存储空间', 'danger');
        }
    }

    // 事件监听器设置
    setupEventListeners() {
        // 标签页切换事件
        const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                this.onTabChange(target);
            });
        });

        // 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', () => {
            this.refreshAll();
        });

        // 页面离开前保存数据
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    // 标签页切换处理
    onTabChange(target) {
        switch (target) {
            case '#dashboard':
                this.updateDashboard();
                break;
            case '#products':
                this.refreshProductTable();
                break;
            case '#quotes':
                if (typeof refreshQuoteTable === 'function') {
                    refreshQuoteTable();
                }
                this.updateQuoteProductSelect();
                if (typeof updateCustomerSelect === 'function') {
                    updateCustomerSelect();
                }
                break;
            case '#analysis':
                this.refreshAnalysisProductSelect();
                this.updatePriceChart();
                break;
        }
    }

    // 仪表板更新
    updateDashboard() {
        const stats = this.calculateStats();

        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalQuotes').textContent = stats.totalQuotes;
        document.getElementById('monthlyQuotes').textContent = stats.monthlyQuotes;
        document.getElementById('monthlyTotal').textContent = stats.monthlyTotal;

        this.updateRecentQuotes();
    }

    // 统计数据计算
    calculateStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 本月报价记录
        const monthlyQuotesData = this.quotes.filter(quote => {
            const quoteDate = new Date(quote.date);
            return quoteDate.getMonth() === currentMonth && quoteDate.getFullYear() === currentYear;
        });

        const monthlyQuotesCount = monthlyQuotesData.length;

        // 计算本月报价总额（优先使用totalPrice，向后兼容price字段）
        const monthlyTotal = monthlyQuotesData.reduce((sum, quote) => {
            const price = parseFloat(quote.totalPrice || quote.price || 0);
            return sum + price;
        }, 0);

        // 转换为万元显示
        const monthlyTotalWan = (monthlyTotal / 10000).toFixed(1);

        return {
            totalProducts: this.products.length,
            totalQuotes: this.quotes.length,
            monthlyQuotes: monthlyQuotesCount,
            monthlyTotal: `${monthlyTotalWan}万元`
        };
    }

    // 更新最近报价记录
    updateRecentQuotes() {
        const container = document.getElementById('recentQuotes');
        const recentQuotes = this.quotes
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentQuotes.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">暂无报价记录</p>';
            return;
        }

        container.innerHTML = recentQuotes.map(quote => {
            const product = this.products.find(p => p.id === quote.productId);
            const productName = product ? product.model : '未知产品';

            return `
                <div class="quote-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${productName}</h6>
                            <p class="text-muted mb-1">${quote.customer || '未指定客户'}</p>
                            <small class="text-muted">${this.formatDate(quote.date)}</small>
                        </div>
                        <div class="text-end">
                            <div class="quote-price">¥${parseFloat(quote.totalPrice || quote.price || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 刷新所有数据
    refreshAll() {
        this.refreshProductTable();
        if (typeof refreshQuoteTable === 'function') {
            refreshQuoteTable();
        }
        this.updateQuoteProductSelect();
        if (typeof updateCustomerSelect === 'function') {
            updateCustomerSelect();
        }
        this.refreshAnalysisProductSelect();
        this.updateDashboard();
    }

    // 设置默认日期
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('quoteDate');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    // 工具方法
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // 显示提示信息
    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // 确认对话框
    confirmDelete(message) {
        return confirm(message || '确定要删除吗？此操作无法撤销。');
    }
}

// 全局应用实例
let app;

// 数据导出功能
function exportAllData() {
    console.log('exportAllData function called');

    if (!app) {
        console.log('app not available');
        alert('应用未初始化');
        return;
    }

    console.log('app available, products:', app.products.length, 'quotes:', app.quotes.length);

    try {
        // 准备导出数据
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            products: app.products,
            quotes: app.quotes,
            statistics: {
                totalProducts: app.products.length,
                totalQuotes: app.quotes.length
            }
        };

        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        // 生成文件名
        const now = new Date();
        const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
        const filename = `产品报价系统数据备份_${timestamp}.json`;

        // 创建下载链接并触发下载
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // 清理URL对象
        URL.revokeObjectURL(url);

        console.log('Export successful, file downloaded');
        app.showAlert(`数据导出成功！已导出 ${app.products.length} 个产品和 ${app.quotes.length} 条报价记录`, 'success');

    } catch (error) {
        console.error('数据导出失败:', error);
        app.showAlert('数据导出失败，请重试', 'danger');
    }
}


// 数据导入功能
function importAllData(input) {
    if (!app) {
        alert('应用未初始化');
        return;
    }

    const file = input.files[0];
    if (!file) {
        return;
    }

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.json')) {
        app.showAlert('请选择JSON格式的数据文件', 'danger');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);

            // 验证数据格式
            if (!importData.products || !importData.quotes) {
                app.showAlert('数据文件格式不正确，缺少必要的数据字段', 'danger');
                return;
            }

            // 检查数据版本兼容性
            if (importData.version && importData.version !== '1.0') {
                if (!confirm('数据文件版本可能不兼容，是否继续导入？')) {
                    return;
                }
            }

            // 确认导入操作
            const confirmMessage = `准备导入数据：\n产品数量：${importData.products.length}\n报价记录：${importData.quotes.length}\n\n注意：这将覆盖当前所有数据，是否继续？`;

            if (!confirm(confirmMessage)) {
                return;
            }

            // 导入数据
            app.products = importData.products || [];
            app.quotes = importData.quotes || [];

            // 保存到localStorage
            app.saveData();

            // 刷新所有界面
            refreshAllViews();

            app.showAlert(`数据导入成功！已导入 ${app.products.length} 个产品和 ${app.quotes.length} 条报价记录`, 'success');

        } catch (error) {
            console.error('数据导入失败:', error);
            app.showAlert('数据文件解析失败，请检查文件格式', 'danger');
        } finally {
            // 清空文件输入
            input.value = '';
        }
    };

    reader.onerror = function() {
        app.showAlert('文件读取失败，请重试', 'danger');
        input.value = '';
    };

    reader.readAsText(file);
}

// 刷新所有视图
function refreshAllViews() {
    if (!app) return;

    try {
        // 刷新仪表板
        app.updateDashboard();

        // 刷新产品相关视图
        if (typeof refreshProductTable === 'function') {
            refreshProductTable();
        }
        if (typeof updateFilterManufacturerSelect === 'function') {
            updateFilterManufacturerSelect();
        }

        // 刷新报价相关视图
        if (typeof refreshQuoteTable === 'function') {
            refreshQuoteTable();
        }
        if (typeof updateQuoteProductSelect === 'function') {
            updateQuoteProductSelect();
        }
        if (typeof updateFilterProductSelect === 'function') {
            updateFilterProductSelect();
        }
        if (typeof updateFilterCustomerSelect === 'function') {
            updateFilterCustomerSelect();
        }
        if (typeof updateCustomerSelect === 'function') {
            updateCustomerSelect();
        }

        // 刷新图表
        if (typeof app.updatePriceChart === 'function') {
            app.updatePriceChart();
        }

        console.log('所有视图刷新完成');
    } catch (error) {
        console.error('视图刷新时出错:', error);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    app = new QuoteApp();
    console.log('产品报价管理系统初始化完成');
});