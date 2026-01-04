// 产品管理功能

// 产品显示状态
let isShowingAllProducts = false;
const DEFAULT_PRODUCT_LIMIT = 10;

// 检查是否有筛选条件
function hasProductFilters() {
    const modelFilter = document.getElementById('filterProductModel');
    const manufacturerFilter = document.getElementById('filterManufacturer');
    const dateFromFilter = document.getElementById('filterProductDateFrom');
    const dateToFilter = document.getElementById('filterProductDateTo');

    return (modelFilter && modelFilter.value.trim()) ||
           (manufacturerFilter && manufacturerFilter.value) ||
           (dateFromFilter && dateFromFilter.value) ||
           (dateToFilter && dateToFilter.value);
}

// 切换产品显示模式
function toggleProductView() {
    isShowingAllProducts = !isShowingAllProducts;
    refreshProductTable();
}

// 筛选产品记录
function getFilteredProducts() {
    if (!app || !app.products) return [];

    let filteredProducts = [...app.products];

    // 产品型号筛选
    const modelFilter = document.getElementById('filterProductModel');
    if (modelFilter && modelFilter.value.trim()) {
        const searchTerm = modelFilter.value.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.model && product.model.toLowerCase().includes(searchTerm)
        );
    }

    // 厂商筛选
    const manufacturerFilter = document.getElementById('filterManufacturer');
    if (manufacturerFilter && manufacturerFilter.value) {
        filteredProducts = filteredProducts.filter(product =>
            product.manufacturer === manufacturerFilter.value
        );
    }

    // 创建日期范围筛选
    const dateFromFilter = document.getElementById('filterProductDateFrom');
    const dateToFilter = document.getElementById('filterProductDateTo');

    if (dateFromFilter && dateFromFilter.value) {
        filteredProducts = filteredProducts.filter(product => {
            const createDate = product.createDate ? product.createDate.split('T')[0] : '';
            return createDate >= dateFromFilter.value;
        });
    }

    if (dateToFilter && dateToFilter.value) {
        filteredProducts = filteredProducts.filter(product => {
            const createDate = product.createDate ? product.createDate.split('T')[0] : '';
            return createDate <= dateToFilter.value;
        });
    }

    return filteredProducts;
}

// 刷新产品表格
function refreshProductTable() {
    if (!app) return;

    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    const filteredProducts = getFilteredProducts();
    const hasFilters = hasProductFilters();

    // 更新控制按钮的显示状态
    updateProductTableControls(filteredProducts.length, hasFilters);

    if (filteredProducts.length === 0) {
        const allProducts = app.products || [];
        if (allProducts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暂无产品数据</td></tr>';
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">没有符合筛选条件的产品</td></tr>';
        }
        return;
    }

    // 决定显示的产品数量
    let displayProducts = filteredProducts;
    if (!hasFilters && !isShowingAllProducts && filteredProducts.length > DEFAULT_PRODUCT_LIMIT) {
        displayProducts = filteredProducts.slice(0, DEFAULT_PRODUCT_LIMIT);
    }

    tableBody.innerHTML = displayProducts.map(product => {
        const quoteCount = app.quotes.filter(q => q.productId === product.id).length;
        const createDate = app.formatDate(product.createDate);

        return `
            <tr>
                <td>
                    <strong>${escapeHtml(product.model)}</strong>
                </td>
                <td>
                    <span class="badge bg-secondary">${escapeHtml(product.manufacturer || 'Nvidia')}</span>
                </td>
                <td>${escapeHtml(product.description || '-')}</td>
                <td>${createDate}</td>
                <td>
                    <span class="badge bg-primary">${quoteCount}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="editProduct('${product.id}')">
                            编辑
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')">
                            删除
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // 更新显示计数
    updateProductCounts(displayProducts.length, filteredProducts.length);
}

// 更新产品表格控制按钮
function updateProductTableControls(totalProducts, hasFilters) {
    const controlsDiv = document.getElementById('productTableControls');
    const toggleBtn = document.getElementById('toggleProductViewBtn');

    if (!controlsDiv || !toggleBtn) return;

    // 如果有筛选条件或产品数量少于等于限制数量，隐藏控制按钮
    if (hasFilters || totalProducts <= DEFAULT_PRODUCT_LIMIT) {
        controlsDiv.style.display = 'none';
        return;
    }

    // 显示控制按钮
    controlsDiv.style.display = 'block';

    // 更新按钮文本和图标
    const icon = toggleBtn.querySelector('i');
    if (isShowingAllProducts) {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up me-1"></i>收起';
        icon.className = 'fas fa-chevron-up me-1';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down me-1"></i>查看更多产品';
        icon.className = 'fas fa-chevron-down me-1';
    }
}

// 更新产品计数显示
function updateProductCounts(displayed, total) {
    const displayedSpan = document.getElementById('displayedProductCount');
    const totalSpan = document.getElementById('totalProductCount');

    if (displayedSpan && totalSpan) {
        displayedSpan.textContent = displayed;
        totalSpan.textContent = total;
    }
}

// 更新筛选厂商下拉框
function updateFilterManufacturerSelect() {
    if (!app) return;

    const select = document.getElementById('filterManufacturer');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">全部厂商</option>';

    if (app.products.length === 0) return;

    // 获取所有唯一的厂商名称
    const manufacturers = [...new Set(app.products
        .map(product => product.manufacturer || 'Nvidia')
        .filter(manufacturer => manufacturer && manufacturer.trim())
    )].sort();

    manufacturers.forEach(manufacturer => {
        const selected = currentValue === manufacturer ? 'selected' : '';
        select.innerHTML += `<option value="${manufacturer}" ${selected}>${escapeHtml(manufacturer)}</option>`;
    });
}

// 清除产品筛选条件
function clearProductFilters() {
    const filterProductModel = document.getElementById('filterProductModel');
    const filterManufacturer = document.getElementById('filterManufacturer');
    const filterProductDateFrom = document.getElementById('filterProductDateFrom');
    const filterProductDateTo = document.getElementById('filterProductDateTo');

    if (filterProductModel) filterProductModel.value = '';
    if (filterManufacturer) filterManufacturer.value = '';
    if (filterProductDateFrom) filterProductDateFrom.value = '';
    if (filterProductDateTo) filterProductDateTo.value = '';

    // 重置显示状态
    isShowingAllProducts = false;

    refreshProductTable();
}

// 保存产品
function saveProduct() {
    if (!app) return;

    const model = document.getElementById('productModel').value.trim();
    const manufacturer = document.getElementById('productManufacturer').value.trim();
    const description = document.getElementById('productDescription').value.trim();

    // 验证必填字段
    if (!model) {
        app.showAlert('请输入产品型号', 'danger');
        return;
    }

    if (!manufacturer) {
        app.showAlert('请输入厂商名称', 'danger');
        return;
    }

    // 检查产品型号是否已存在
    const existingProduct = app.products.find(p =>
        p.model.toLowerCase() === model.toLowerCase() &&
        p.id !== getCurrentEditingProductId()
    );

    if (existingProduct) {
        app.showAlert('该产品型号已存在', 'danger');
        return;
    }

    const editingId = getCurrentEditingProductId();

    if (editingId) {
        // 编辑现有产品
        const productIndex = app.products.findIndex(p => p.id === editingId);
        if (productIndex !== -1) {
            app.products[productIndex] = {
                ...app.products[productIndex],
                model: model,
                manufacturer: manufacturer,
                description: description,
                updateDate: new Date().toISOString()
            };
            app.showAlert('产品信息已更新', 'success');
        }
    } else {
        // 添加新产品
        const newProduct = {
            id: app.generateId(),
            model: model,
            manufacturer: manufacturer,
            description: description,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };

        app.products.push(newProduct);
        app.showAlert('产品添加成功', 'success');
    }

    // 保存数据并刷新界面
    app.saveData();
    refreshProductTable();
    updateFilterManufacturerSelect();
    app.updateQuoteProductSelect();
    if (app.updateFilterProductSelect) app.updateFilterProductSelect();
    app.refreshAnalysisProductSelect();
    app.updateDashboard();

    // 关闭模态框并重置表单
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if (modal) {
        modal.hide();
    }
    resetProductForm();
}

// 编辑产品
function editProduct(productId) {
    if (!app) return;

    const product = app.products.find(p => p.id === productId);
    if (!product) {
        app.showAlert('产品未找到', 'danger');
        return;
    }

    // 填充表单
    document.getElementById('productModel').value = product.model;
    document.getElementById('productManufacturer').value = product.manufacturer || 'Nvidia';
    document.getElementById('productDescription').value = product.description || '';

    // 更新厂商选择下拉框
    const manufacturerSelect = document.getElementById('manufacturerSelect');
    if (manufacturerSelect) {
        const manufacturer = product.manufacturer || 'Nvidia';
        const options = Array.from(manufacturerSelect.options);
        const matchingOption = options.find(opt => opt.value === manufacturer);

        if (matchingOption) {
            manufacturerSelect.value = manufacturer;
        } else {
            manufacturerSelect.value = 'custom';
        }
    }

    // 设置编辑状态
    setCurrentEditingProductId(productId);

    // 更新模态框标题
    document.querySelector('#productModal .modal-title').textContent = '编辑产品';

    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// 删除产品
function deleteProduct(productId) {
    if (!app) return;

    const product = app.products.find(p => p.id === productId);
    if (!product) {
        app.showAlert('产品未找到', 'danger');
        return;
    }

    // 检查是否有相关报价记录
    const relatedQuotes = app.quotes.filter(q => q.productId === productId);
    let confirmMessage = `确定要删除产品"${product.model}"吗？`;

    if (relatedQuotes.length > 0) {
        confirmMessage += `\n\n注意：该产品有 ${relatedQuotes.length} 条相关报价记录，删除产品后这些报价记录也将被删除。`;
    }

    if (!app.confirmDelete(confirmMessage)) {
        return;
    }

    // 删除产品
    app.products = app.products.filter(p => p.id !== productId);

    // 删除相关报价记录
    if (relatedQuotes.length > 0) {
        app.quotes = app.quotes.filter(q => q.productId !== productId);
        app.showAlert(`已删除产品及其 ${relatedQuotes.length} 条相关报价记录`, 'success');
    } else {
        app.showAlert('产品删除成功', 'success');
    }

    // 保存数据并刷新界面
    app.saveData();
    refreshProductTable();
    updateFilterManufacturerSelect();
    app.refreshQuoteTable();
    app.updateQuoteProductSelect();
    if (app.updateFilterProductSelect) app.updateFilterProductSelect();
    app.refreshAnalysisProductSelect();
    app.updateDashboard();
}

// 重置产品表单
function resetProductForm() {
    document.getElementById('productForm').reset();
    setCurrentEditingProductId(null);
    document.querySelector('#productModal .modal-title').textContent = '添加产品';
}

// 获取和设置当前编辑的产品ID
let currentEditingProductId = null;

function getCurrentEditingProductId() {
    return currentEditingProductId;
}

function setCurrentEditingProductId(id) {
    currentEditingProductId = id;
}

// HTML转义函数
function escapeHtml(text) {
    if (typeof text !== 'string') return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 设置产品模态框事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('hidden.bs.modal', function() {
            resetProductForm();
        });

        // 添加表单提交事件
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProduct();
            });
        }

        // 添加产品型号输入验证
        const productModelInput = document.getElementById('productModel');
        if (productModelInput) {
            productModelInput.addEventListener('input', function() {
                this.value = this.value.replace(/^\s+/, ''); // 移除开头空格
            });
        }

        // 添加厂商选择下拉框事件监听器
        const manufacturerSelect = document.getElementById('manufacturerSelect');
        const manufacturerInput = document.getElementById('productManufacturer');
        if (manufacturerSelect && manufacturerInput) {
            manufacturerSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    manufacturerInput.value = '';
                    manufacturerInput.focus();
                } else {
                    manufacturerInput.value = this.value;
                }
            });
        }

        // 产品筛选控件事件监听器
        const filterProductModel = document.getElementById('filterProductModel');
        const filterManufacturer = document.getElementById('filterManufacturer');
        const filterProductDateFrom = document.getElementById('filterProductDateFrom');
        const filterProductDateTo = document.getElementById('filterProductDateTo');

        if (filterProductModel) {
            filterProductModel.addEventListener('input', refreshProductTable);
        }

        if (filterManufacturer) {
            filterManufacturer.addEventListener('change', refreshProductTable);
        }

        if (filterProductDateFrom) {
            filterProductDateFrom.addEventListener('change', refreshProductTable);
        }

        if (filterProductDateTo) {
            filterProductDateTo.addEventListener('change', refreshProductTable);
        }
    }

    // 初始化筛选下拉框
    updateFilterManufacturerSelect();
});

// 将产品管理相关函数暴露到全局作用域
window.toggleProductView = toggleProductView;

// 在app对象上添加相关方法
if (typeof QuoteApp !== 'undefined') {
    QuoteApp.prototype.refreshProductTable = refreshProductTable;
    QuoteApp.prototype.updateFilterManufacturerSelect = updateFilterManufacturerSelect;
}