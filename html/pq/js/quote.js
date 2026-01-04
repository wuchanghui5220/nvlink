// 报价管理功能

// 报价显示状态
let isShowingAllQuotes = false;
const DEFAULT_QUOTE_LIMIT = 10;

// 检查是否有筛选条件
function hasQuoteFilters() {
    const productFilter = document.getElementById('filterProduct');
    const customerFilter = document.getElementById('filterCustomer');
    const dateFromFilter = document.getElementById('filterDateFrom');
    const dateToFilter = document.getElementById('filterDateTo');

    return (productFilter && productFilter.value) ||
           (customerFilter && customerFilter.value) ||
           (dateFromFilter && dateFromFilter.value) ||
           (dateToFilter && dateToFilter.value);
}

// 切换报价显示模式
function toggleQuoteView() {
    isShowingAllQuotes = !isShowingAllQuotes;
    refreshQuoteTable();
}

// 筛选报价记录
function getFilteredQuotes() {
    if (!app || !app.quotes) return [];

    let filteredQuotes = [...app.quotes];

    // 产品筛选
    const productFilter = document.getElementById('filterProduct');
    if (productFilter && productFilter.value) {
        filteredQuotes = filteredQuotes.filter(quote => quote.productId === productFilter.value);
    }

    // 客户筛选
    const customerFilter = document.getElementById('filterCustomer');
    if (customerFilter && customerFilter.value) {
        filteredQuotes = filteredQuotes.filter(quote =>
            quote.customer && quote.customer.toLowerCase().includes(customerFilter.value.toLowerCase())
        );
    }

    // 日期范围筛选
    const dateFromFilter = document.getElementById('filterDateFrom');
    const dateToFilter = document.getElementById('filterDateTo');

    if (dateFromFilter && dateFromFilter.value) {
        filteredQuotes = filteredQuotes.filter(quote => quote.date >= dateFromFilter.value);
    }

    if (dateToFilter && dateToFilter.value) {
        filteredQuotes = filteredQuotes.filter(quote => quote.date <= dateToFilter.value);
    }

    return filteredQuotes;
}

// 刷新报价表格
function refreshQuoteTable() {
    if (!app) return;

    const tableBody = document.getElementById('quotesTableBody');
    if (!tableBody) return;

    const filteredQuotes = getFilteredQuotes();
    const hasFilters = hasQuoteFilters();

    // 更新控制按钮的显示状态
    updateQuoteTableControls(filteredQuotes.length, hasFilters);

    if (filteredQuotes.length === 0) {
        const allQuotes = app.quotes || [];
        if (allQuotes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">暂无报价记录</td></tr>';
        } else {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">没有符合筛选条件的记录</td></tr>';
        }
        return;
    }

    // 按日期降序排列（最新的在前面）
    const sortedQuotes = filteredQuotes.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 决定显示的记录数量
    let displayQuotes = sortedQuotes;
    if (!hasFilters && !isShowingAllQuotes && sortedQuotes.length > DEFAULT_QUOTE_LIMIT) {
        displayQuotes = sortedQuotes.slice(0, DEFAULT_QUOTE_LIMIT);
    }

    tableBody.innerHTML = displayQuotes.map(quote => {
        const product = app.products.find(p => p.id === quote.productId);
        const productName = product ? product.model : '已删除的产品';
        const quantity = quote.quantity || 1;
        const unitPrice = parseFloat(quote.unitPrice || quote.price || 0).toFixed(2);
        const totalPrice = parseFloat(quote.totalPrice || quote.price || 0).toFixed(2);
        const formattedDate = app.formatDate(quote.date);

        return `
            <tr ${!product ? 'class="table-warning"' : ''}>
                <td>
                    <strong>${escapeHtml(productName)}</strong>
                    ${!product ? '<br><small class="text-warning">产品已删除</small>' : ''}
                </td>
                <td>${escapeHtml(quote.customer || '-')}</td>
                <td>
                    <span class="badge bg-info">${quantity}</span>
                </td>
                <td>
                    <span class="text-success">¥${unitPrice}</span>
                </td>
                <td>
                    <span class="fw-bold text-success">¥${totalPrice}</span>
                </td>
                <td>${formattedDate}</td>
                <td>
                    ${quote.notes ? `<span title="${escapeHtml(quote.notes)}">${escapeHtml(quote.notes.substring(0, 20))}</span>` : '-'}
                    ${quote.notes && quote.notes.length > 20 ? '...' : ''}
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="editQuote('${quote.id}')">
                            编辑
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="deleteQuote('${quote.id}')">
                            删除
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // 更新显示计数
    updateQuoteCounts(displayQuotes.length, sortedQuotes.length);
}

// 更新报价表格控制按钮
function updateQuoteTableControls(totalQuotes, hasFilters) {
    const controlsDiv = document.getElementById('quoteTableControls');
    const toggleBtn = document.getElementById('toggleQuoteViewBtn');

    if (!controlsDiv || !toggleBtn) return;

    // 如果有筛选条件或记录数量少于等于限制数量，隐藏控制按钮
    if (hasFilters || totalQuotes <= DEFAULT_QUOTE_LIMIT) {
        controlsDiv.style.display = 'none';
        return;
    }

    // 显示控制按钮
    controlsDiv.style.display = 'block';

    // 更新按钮文本和图标
    const icon = toggleBtn.querySelector('i');
    if (isShowingAllQuotes) {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up me-1"></i>收起';
        icon.className = 'fas fa-chevron-up me-1';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down me-1"></i>查看更多记录';
        icon.className = 'fas fa-chevron-down me-1';
    }
}

// 更新报价计数显示
function updateQuoteCounts(displayed, total) {
    const displayedSpan = document.getElementById('displayedQuoteCount');
    const totalSpan = document.getElementById('totalQuoteCount');

    if (displayedSpan && totalSpan) {
        displayedSpan.textContent = displayed;
        totalSpan.textContent = total;
    }
}

// 更新报价产品选择下拉框
function updateQuoteProductSelect() {
    if (!app) return;

    const select = document.getElementById('quoteProduct');
    if (!select) return;

    select.innerHTML = '<option value="">请选择产品</option>';

    if (app.products.length === 0) {
        select.innerHTML += '<option value="" disabled>暂无产品，请先添加产品</option>';
        return;
    }

    app.products.forEach(product => {
        select.innerHTML += `<option value="${product.id}">${escapeHtml(product.model)}</option>`;
    });
}

// 更新筛选产品下拉框
function updateFilterProductSelect() {
    if (!app) return;

    const select = document.getElementById('filterProduct');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">全部产品</option>';

    if (app.products.length === 0) return;

    app.products.forEach(product => {
        const selected = currentValue === product.id ? 'selected' : '';
        select.innerHTML += `<option value="${product.id}" ${selected}>${escapeHtml(product.model)}</option>`;
    });
}

// 更新筛选客户下拉框
function updateFilterCustomerSelect() {
    if (!app) return;

    const select = document.getElementById('filterCustomer');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">全部客户</option>';

    if (app.quotes.length === 0) return;

    // 获取所有唯一的客户名称
    const customers = [...new Set(app.quotes
        .map(quote => quote.customer)
        .filter(customer => customer && customer.trim())
        .map(customer => customer.trim())
    )].sort();

    customers.forEach(customer => {
        const selected = currentValue === customer ? 'selected' : '';
        select.innerHTML += `<option value="${customer}" ${selected}>${escapeHtml(customer)}</option>`;
    });
}

// 更新客户选择下拉框
function updateCustomerSelect() {
    if (!app) return;

    const select = document.getElementById('customerSelect');
    if (!select) return;

    // 保存当前选择
    const currentValue = select.value;

    // 重建选项
    select.innerHTML = '<option value="new">新客户</option>';

    if (app.quotes.length === 0) return;

    // 获取所有唯一的客户名称
    const customers = [...new Set(app.quotes
        .map(quote => quote.customer)
        .filter(customer => customer && customer.trim())
        .map(customer => customer.trim())
    )].sort();

    if (customers.length > 0) {
        // 添加分隔选项
        select.innerHTML += '<option disabled>─────── 已有客户 ───────</option>';

        customers.forEach(customer => {
            select.innerHTML += `<option value="${customer}">${escapeHtml(customer)}</option>`;
        });
    }

    // 恢复之前的选择，如果还存在的话
    const options = Array.from(select.options);
    const matchingOption = options.find(opt => opt.value === currentValue);
    if (matchingOption) {
        select.value = currentValue;
    }
}

// 清除筛选条件
function clearQuoteFilters() {
    const filterProduct = document.getElementById('filterProduct');
    const filterCustomer = document.getElementById('filterCustomer');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');

    if (filterProduct) filterProduct.value = '';
    if (filterCustomer) filterCustomer.value = '';
    if (filterDateFrom) filterDateFrom.value = '';
    if (filterDateTo) filterDateTo.value = '';

    // 重置显示状态
    isShowingAllQuotes = false;

    refreshQuoteTable();
}

// 导出报价数据
function exportQuoteData() {
    if (!app) return;

    const filteredQuotes = getFilteredQuotes();

    if (filteredQuotes.length === 0) {
        app.showAlert('没有数据可以导出', 'warning');
        return;
    }

    // 准备导出数据
    const exportData = filteredQuotes.map(quote => {
        const product = app.products.find(p => p.id === quote.productId);
        const productModel = product ? product.model : '已删除的产品';
        const manufacturer = product ? (product.manufacturer || 'Nvidia') : '未知';
        const quantity = quote.quantity || 1;
        const unitPrice = parseFloat(quote.unitPrice || quote.price || 0);
        const totalPrice = parseFloat(quote.totalPrice || quote.price || 0);

        return {
            '产品型号': productModel,
            '厂商': manufacturer,
            '客户': quote.customer || '',
            '数量': quantity,
            '单价': unitPrice.toFixed(2),
            '总价': totalPrice.toFixed(2),
            '报价日期': quote.date,
            '备注': quote.notes || ''
        };
    });

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '报价记录');

    // 设置列宽
    const colWidths = [
        { wch: 20 }, // 产品型号
        { wch: 12 }, // 厂商
        { wch: 15 }, // 客户
        { wch: 8 },  // 数量
        { wch: 12 }, // 单价
        { wch: 12 }, // 总价
        { wch: 12 }, // 报价日期
        { wch: 25 }  // 备注
    ];
    ws['!cols'] = colWidths;

    // 生成文件名
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
    let filename = `报价记录_${timestamp}.xlsx`;

    // 如果有筛选条件，在文件名中体现
    const filters = [];
    const productFilter = document.getElementById('filterProduct');
    const customerFilter = document.getElementById('filterCustomer');
    const dateFromFilter = document.getElementById('filterDateFrom');
    const dateToFilter = document.getElementById('filterDateTo');

    if (productFilter && productFilter.value) {
        const product = app.products.find(p => p.id === productFilter.value);
        if (product) filters.push(product.model);
    }

    if (customerFilter && customerFilter.value) {
        filters.push(customerFilter.value);
    }

    if (dateFromFilter && dateFromFilter.value) {
        filters.push(`从${dateFromFilter.value}`);
    }

    if (dateToFilter && dateToFilter.value) {
        filters.push(`到${dateToFilter.value}`);
    }

    if (filters.length > 0) {
        const filterStr = filters.join('_').replace(/[<>:"/\\|?*]/g, '');
        filename = `报价记录_${filterStr}_${timestamp}.xlsx`;
    }

    // 下载文件
    XLSX.writeFile(wb, filename);

    app.showAlert(`已导出 ${filteredQuotes.length} 条记录`, 'success');
}

// 保存报价
function saveQuote() {
    if (!app) return;

    const productId = document.getElementById('quoteProduct').value;
    const customer = document.getElementById('quoteCustomer').value.trim();
    const quantity = document.getElementById('quoteQuantity').value;
    const unitPrice = document.getElementById('quoteUnitPrice').value;
    const totalPrice = document.getElementById('quoteTotalPrice').value;
    const date = document.getElementById('quoteDate').value;
    const notes = document.getElementById('quoteNotes').value.trim();

    // 验证必填字段
    if (!productId) {
        app.showAlert('请选择产品', 'danger');
        return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
        app.showAlert('请输入有效的数量', 'danger');
        return;
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
        app.showAlert('请输入有效的单价', 'danger');
        return;
    }

    if (!date) {
        app.showAlert('请选择报价日期', 'danger');
        return;
    }

    // 验证日期不能是未来日期
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
        app.showAlert('报价日期不能是未来日期', 'danger');
        return;
    }

    // 验证产品是否存在
    const product = app.products.find(p => p.id === productId);
    if (!product) {
        app.showAlert('选择的产品不存在', 'danger');
        return;
    }

    const editingId = getCurrentEditingQuoteId();

    if (editingId) {
        // 编辑现有报价
        const quoteIndex = app.quotes.findIndex(q => q.id === editingId);
        if (quoteIndex !== -1) {
            app.quotes[quoteIndex] = {
                ...app.quotes[quoteIndex],
                productId: productId,
                customer: customer,
                quantity: parseInt(quantity),
                unitPrice: parseFloat(unitPrice).toFixed(2),
                totalPrice: parseFloat(totalPrice).toFixed(2),
                price: parseFloat(totalPrice).toFixed(2), // 为了兼容性保留price字段
                date: date,
                notes: notes,
                updateDate: new Date().toISOString()
            };
            app.showAlert('报价记录已更新', 'success');
        }
    } else {
        // 添加新报价
        const newQuote = {
            id: app.generateId(),
            productId: productId,
            customer: customer,
            quantity: parseInt(quantity),
            unitPrice: parseFloat(unitPrice).toFixed(2),
            totalPrice: parseFloat(totalPrice).toFixed(2),
            price: parseFloat(totalPrice).toFixed(2), // 为了兼容性保留price字段
            date: date,
            notes: notes,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };

        app.quotes.push(newQuote);
        app.showAlert('报价记录添加成功', 'success');
    }

    // 保存数据并刷新界面
    app.saveData();
    refreshQuoteTable();
    updateFilterProductSelect();
    updateFilterCustomerSelect();
    updateCustomerSelect(); // 更新客户选择下拉框
    app.updateDashboard();
    app.updatePriceChart();

    // 关闭模态框并重置表单
    const modal = bootstrap.Modal.getInstance(document.getElementById('quoteModal'));
    if (modal) {
        modal.hide();
    }
    resetQuoteForm();
}

// 编辑报价
function editQuote(quoteId) {
    if (!app) return;

    const quote = app.quotes.find(q => q.id === quoteId);
    if (!quote) {
        app.showAlert('报价记录未找到', 'danger');
        return;
    }

    // 检查产品是否还存在
    const product = app.products.find(p => p.id === quote.productId);
    if (!product) {
        app.showAlert('该报价关联的产品已被删除，无法编辑', 'danger');
        return;
    }

    // 填充表单
    document.getElementById('quoteProduct').value = quote.productId;

    // 更新客户选择下拉框
    updateCustomerSelect();

    // 处理客户选择
    const customerName = quote.customer || '';
    document.getElementById('quoteCustomer').value = customerName;

    // 设置客户选择下拉框
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect && customerName) {
        const options = Array.from(customerSelect.options);
        const matchingOption = options.find(opt => opt.value === customerName);

        if (matchingOption) {
            customerSelect.value = customerName;
        } else {
            customerSelect.value = 'new';
        }
    }

    document.getElementById('quoteQuantity').value = quote.quantity || 1;
    document.getElementById('quoteUnitPrice').value = quote.unitPrice || quote.price || 0;
    document.getElementById('quoteTotalPrice').value = quote.totalPrice || quote.price || 0;
    document.getElementById('quoteDate').value = quote.date;
    document.getElementById('quoteNotes').value = quote.notes || '';

    // 设置编辑状态
    setCurrentEditingQuoteId(quoteId);

    // 更新模态框标题
    document.querySelector('#quoteModal .modal-title').textContent = '编辑报价';

    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('quoteModal'));
    modal.show();
}

// 删除报价
function deleteQuote(quoteId) {
    if (!app) return;

    const quote = app.quotes.find(q => q.id === quoteId);
    if (!quote) {
        app.showAlert('报价记录未找到', 'danger');
        return;
    }

    const product = app.products.find(p => p.id === quote.productId);
    const productName = product ? product.model : '已删除的产品';

    if (!app.confirmDelete(`确定要删除产品"${productName}"在${quote.date}的报价记录吗？`)) {
        return;
    }

    // 删除报价
    app.quotes = app.quotes.filter(q => q.id !== quoteId);

    app.showAlert('报价记录删除成功', 'success');

    // 保存数据并刷新界面
    app.saveData();
    refreshQuoteTable();
    updateFilterProductSelect();
    updateFilterCustomerSelect();
    updateCustomerSelect(); // 更新客户选择下拉框
    app.updateDashboard();
    app.updatePriceChart();
}

// 计算总价
function calculateTotalPrice() {
    const quantityInput = document.getElementById('quoteQuantity');
    const unitPriceInput = document.getElementById('quoteUnitPrice');
    const totalPriceInput = document.getElementById('quoteTotalPrice');

    if (!quantityInput || !unitPriceInput || !totalPriceInput) return;

    const quantity = parseInt(quantityInput.value) || 0;
    const unitPrice = parseFloat(unitPriceInput.value) || 0;
    const totalPrice = quantity * unitPrice;

    totalPriceInput.value = totalPrice.toFixed(2);
}

// 重置报价表单
function resetQuoteForm() {
    document.getElementById('quoteForm').reset();
    setCurrentEditingQuoteId(null);
    document.querySelector('#quoteModal .modal-title').textContent = '添加报价';

    // 重新设置默认值
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
    document.getElementById('quoteQuantity').value = 1;
    document.getElementById('quoteTotalPrice').value = '0.00';

    // 重置客户选择状态
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
        customerSelect.value = 'new';
    }
}

// 获取和设置当前编辑的报价ID
let currentEditingQuoteId = null;

function getCurrentEditingQuoteId() {
    return currentEditingQuoteId;
}

function setCurrentEditingQuoteId(id) {
    currentEditingQuoteId = id;
}

// 价格输入验证
function validatePriceInput(input) {
    let value = input.value;

    // 移除非数字和非小数点字符
    value = value.replace(/[^0-9.]/g, '');

    // 确保只有一个小数点
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    // 限制小数位数为2位
    if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    input.value = value;
}

// 设置报价模态框事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const quoteModal = document.getElementById('quoteModal');
    if (quoteModal) {
        quoteModal.addEventListener('hidden.bs.modal', function() {
            resetQuoteForm();
        });

        quoteModal.addEventListener('shown.bs.modal', function() {
            updateQuoteProductSelect();
            updateFilterProductSelect();
            updateFilterCustomerSelect();
            updateCustomerSelect(); // 更新客户选择下拉框
        });

        // 添加表单提交事件
        const quoteForm = document.getElementById('quoteForm');
        if (quoteForm) {
            quoteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveQuote();
            });
        }

        // 数量输入事件
        const quantityInput = document.getElementById('quoteQuantity');
        if (quantityInput) {
            quantityInput.addEventListener('input', function() {
                calculateTotalPrice();
            });
        }

        // 单价输入事件
        const unitPriceInput = document.getElementById('quoteUnitPrice');
        if (unitPriceInput) {
            unitPriceInput.addEventListener('input', function() {
                validatePriceInput(this);
                calculateTotalPrice();
            });
        }

        // 客户名称输入清理
        const customerInput = document.getElementById('quoteCustomer');
        if (customerInput) {
            customerInput.addEventListener('input', function() {
                this.value = this.value.replace(/^\s+/, ''); // 移除开头空格
            });
        }

        // 客户选择下拉框事件监听器
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect && customerInput) {
            customerSelect.addEventListener('change', function() {
                if (this.value === 'new') {
                    customerInput.value = '';
                    customerInput.focus();
                } else {
                    customerInput.value = this.value;
                }
            });
        }

        // 筛选控件事件监听器
        const filterProduct = document.getElementById('filterProduct');
        const filterCustomer = document.getElementById('filterCustomer');
        const filterDateFrom = document.getElementById('filterDateFrom');
        const filterDateTo = document.getElementById('filterDateTo');

        if (filterProduct) {
            filterProduct.addEventListener('change', refreshQuoteTable);
        }

        if (filterCustomer) {
            filterCustomer.addEventListener('change', refreshQuoteTable);
        }

        if (filterDateFrom) {
            filterDateFrom.addEventListener('change', refreshQuoteTable);
        }

        if (filterDateTo) {
            filterDateTo.addEventListener('change', refreshQuoteTable);
        }
    }

    // 初始化筛选下拉框
    updateFilterProductSelect();
    updateFilterCustomerSelect();
    updateCustomerSelect();
});

// 将报价管理相关函数暴露到全局作用域
window.toggleQuoteView = toggleQuoteView;

// 在app对象上添加相关方法
if (typeof QuoteApp !== 'undefined') {
    QuoteApp.prototype.refreshQuoteTable = refreshQuoteTable;
    QuoteApp.prototype.updateQuoteProductSelect = updateQuoteProductSelect;
    QuoteApp.prototype.updateFilterProductSelect = updateFilterProductSelect;
    QuoteApp.prototype.updateFilterCustomerSelect = updateFilterCustomerSelect;
    QuoteApp.prototype.updateCustomerSelect = updateCustomerSelect;
}