// 价格分析和图表功能

let priceChart = null;

// 刷新分析页面产品选择下拉框
function refreshAnalysisProductSelect() {
    if (!app) return;

    const select = document.getElementById('analysisProductSelect');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">选择产品查看价格走势</option>';

    if (app.products.length === 0) {
        select.innerHTML += '<option value="" disabled>暂无产品数据</option>';
        return;
    }

    app.products.forEach(product => {
        const quoteCount = app.quotes.filter(q => q.productId === product.id).length;
        select.innerHTML += `<option value="${product.id}">${escapeHtml(product.model)} (${quoteCount}条记录)</option>`;
    });

    // 恢复之前的选择
    if (currentValue && app.products.find(p => p.id === currentValue)) {
        select.value = currentValue;
    }
}

// 更新价格走势图表
function updatePriceChart() {
    const productSelect = document.getElementById('analysisProductSelect');
    const timeRangeSelect = document.getElementById('timeRange');

    if (!productSelect || !timeRangeSelect || !app) return;

    const productId = productSelect.value;
    const timeRange = parseInt(timeRangeSelect.value);

    if (!productId) {
        clearChart();
        return;
    }

    const product = app.products.find(p => p.id === productId);
    if (!product) {
        clearChart();
        return;
    }

    // 获取时间范围内的报价数据
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);

    const productQuotes = app.quotes
        .filter(q => q.productId === productId && new Date(q.date) >= cutoffDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (productQuotes.length === 0) {
        showNoDataChart(product.model);
        return;
    }

    // 准备图表数据
    const chartData = prepareChartData(productQuotes);
    renderPriceChart(chartData, product.model);
}

// 准备图表数据
function prepareChartData(quotes) {
    const groupedData = new Map();

    // 按日期分组并计算平均价格
    quotes.forEach(quote => {
        const date = quote.date;
        if (!groupedData.has(date)) {
            groupedData.set(date, []);
        }
        groupedData.get(date).push(parseFloat(quote.price));
    });

    // 转换为图表数据格式
    const labels = [];
    const prices = [];
    const minPrices = [];
    const maxPrices = [];

    Array.from(groupedData.entries())
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .forEach(([date, priceArray]) => {
            labels.push(formatDateForChart(date));

            const avgPrice = priceArray.reduce((sum, price) => sum + price, 0) / priceArray.length;
            prices.push(avgPrice.toFixed(2));

            minPrices.push(Math.min(...priceArray).toFixed(2));
            maxPrices.push(Math.max(...priceArray).toFixed(2));
        });

    return { labels, prices, minPrices, maxPrices };
}

// 渲染价格图表
function renderPriceChart(data, productName) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // 销毁现有图表
    if (priceChart) {
        priceChart.destroy();
    }

    // 创建新图表
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: '平均价格',
                    data: data.prices,
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgb(13, 110, 253)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: '最高价格',
                    data: data.maxPrices,
                    borderColor: 'rgb(25, 135, 84)',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: '最低价格',
                    data: data.minPrices,
                    borderColor: 'rgb(220, 53, 69)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${productName} - 价格走势分析`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ¥${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '日期'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: '价格 (¥)'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 显示无数据图表
function showNoDataChart(productName) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['暂无数据'],
            datasets: [{
                label: '价格',
                data: [0],
                borderColor: 'rgb(108, 117, 125)',
                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${productName} - 暂无报价数据`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

// 清空图表
function clearChart() {
    if (priceChart) {
        priceChart.destroy();
        priceChart = null;
    }

    const ctx = document.getElementById('priceChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 显示提示文本
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6c757d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('请选择产品查看价格走势', ctx.canvas.width / 2, ctx.canvas.height / 2);
}

// 格式化日期用于图表显示
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
    });
}

// 导出数据功能
function exportData(format = 'csv') {
    if (!app || app.quotes.length === 0) {
        app.showAlert('暂无数据可导出', 'warning');
        return;
    }

    const data = app.quotes.map(quote => {
        const product = app.products.find(p => p.id === quote.productId);
        return {
            产品型号: product ? product.model : '已删除的产品',
            客户: quote.customer || '',
            价格: quote.price,
            日期: quote.date,
            备注: quote.notes || ''
        };
    });

    if (format === 'csv') {
        exportToCSV(data);
    }
}

// 导出CSV文件
function exportToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `报价数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    app.showAlert('数据导出成功', 'success');
}

// 设置图表相关事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const productSelect = document.getElementById('analysisProductSelect');
    const timeRangeSelect = document.getElementById('timeRange');

    if (productSelect) {
        productSelect.addEventListener('change', updatePriceChart);
    }

    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', updatePriceChart);
    }

    // 初始化图表
    setTimeout(() => {
        clearChart();
    }, 100);
});

// 在app对象上添加相关方法
if (typeof QuoteApp !== 'undefined') {
    QuoteApp.prototype.refreshAnalysisProductSelect = refreshAnalysisProductSelect;
    QuoteApp.prototype.updatePriceChart = updatePriceChart;
}