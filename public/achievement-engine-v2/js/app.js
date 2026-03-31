document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// App State
const state = {
    currentTask: null, // null means global dashboard view
    activeModule: 'dashboard', 
    currentFilter: 'all', // all, major, course, research, custom
    setupMode: 'global', // 'global' or 'stepped'
    steppedPhase: 1, // 1: structure construction, 2: rule configuration
};

// Main Initialization
function initApp() {
    setupNavigation();
    renderGlobalDashboard();
    
    // Check initial theme to set icon correctly
    const isDark = document.body.classList.contains('theme-dark');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        if (isDark) {
            themeIcon.classList.replace('ph-sun', 'ph-moon');
        } else {
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        }
    }
}

window.toggleTheme = function() {
    const isDark = document.body.classList.contains('theme-dark');
    const themeIcon = document.getElementById('themeIcon');
    if (isDark) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        if(themeIcon) themeIcon.classList.replace('ph-moon', 'ph-sun');
    } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        if(themeIcon) themeIcon.classList.replace('ph-sun', 'ph-moon');
    }
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!state.currentTask) return; // Ignore if in dashboard mode
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const moduleName = item.getAttribute('data-module');
            state.activeModule = moduleName;
            
            updateBreadcrumb();
            renderModule(moduleName);
        });
    });
}

function enterTaskContext(taskId) {
    const task = mockData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    state.currentTask = task;
    state.activeModule = 'objects'; // Default to first module
    
    // Update UI
    document.getElementById('mainSidebar').style.display = 'flex';
    document.getElementById('sidebarTaskName').textContent = task.name;
    document.getElementById('mainContentArea').style.borderTopLeftRadius = 'var(--radius-lg)';
    document.getElementById('mainContentArea').style.borderBottomLeftRadius = 'var(--radius-lg)';
    document.getElementById('globalTaskActions').style.display = 'block';
    updateGlobalTaskActions();
    
    // Set Sidebar Active
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if(nav.getAttribute('data-module') === 'objects') nav.classList.add('active');
    });

    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) historyBtn.style.display = 'block';

    updateBreadcrumb();
    renderModule('objects');
}

window.exitTaskContext = function() {
    state.currentTask = null;
    state.activeModule = 'dashboard';
    
    document.getElementById('mainSidebar').style.display = 'none';
    document.getElementById('mainContentArea').style.borderRadius = '0';
    document.getElementById('globalTaskActions').style.display = 'none';
    
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) historyBtn.style.display = 'none';
    
    updateBreadcrumb();
    renderGlobalDashboard();
}

window.updateGlobalTaskActions = function() {
    const container = document.getElementById('globalTaskActions');
    if (!state.currentTask) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';
    
    if (state.currentTask.status === 'processing' || state.currentTask.status === 'completed') {
        let statusText = state.currentTask.status === 'completed' ? '计算完成' : '计算中...';
        container.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: center;">
                <span class="badge ${state.currentTask.status}">${statusText} (配置已锁定)</span>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button class="btn-primary" style="background: var(--gradient-brand); box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); border: none; padding: 6px 20px; font-size: 0.95rem; border-radius: 20px;" onclick="triggerCalculationEngine()">
                <i class="ph-fill ph-play-circle" style="font-size: 1.1rem;"></i> 启动引擎计算
            </button>
        `;
    }
}

window.withdrawCalculation = function() {
    if(confirm("确定要撤回计算吗？这将丢失当前的计算结果，并允许重新修改配置。")) {
        state.currentTask.status = 'pending';
        state.currentTask.progress = 0;
        updateGlobalTaskActions();
        renderModule(state.activeModule);
        alert("已撤回计算，配置现已解锁。");
    }
}

window.triggerCalculationEngine = function() {
    if(confirm("启动计算后，所有对象和规则配置将被锁定，不可修改。确定要启动吗？")) {
        state.currentTask.status = 'processing';
        state.currentTask.progress = 10;
        updateGlobalTaskActions();
        renderModule(state.activeModule);
        alert("🚀 达成度计算引擎已启动！\n配置已处于锁定状态。");
    }
}

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('topBreadcrumb');
    if (!state.currentTask) {
        breadcrumb.innerHTML = `<span style="color: var(--text-primary); cursor: pointer;" onclick="exitTaskContext()">达成度引擎</span>`;
    } else {
        const moduleNames = {
            'objects': '统计对象管理',
            'rules': '统计规则设定',
            'results': '计算结果预览',
            'reports': 'AI分析与报告'
        };
        const currentModName = moduleNames[state.activeModule] || '';
        breadcrumb.innerHTML = `
            <span style="color: var(--text-muted); cursor: pointer;" onclick="exitTaskContext()">达成度引擎</span> 
            <i class="ph ph-caret-right" style="color: var(--text-muted); font-size: 0.9em;"></i>
            <span style="color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom;">${state.currentTask.name}</span>
            <i class="ph ph-caret-right" style="color: var(--text-muted); font-size: 0.9em;"></i>
            <span style="color: var(--accent-primary);">${currentModName}</span>
        `;
    }
}

// Module Rendering
function renderModule(moduleName) {
    const container = document.getElementById('moduleContainer');
    
    container.innerHTML = '';

    switch(moduleName) {
        case 'objects': renderObjects(container); break;
        case 'rules': renderRules(container); break;
        case 'results': renderResults(container); break;
        case 'reports': renderReports(container); break;
    }
}

/* Module Render Functions */
function renderGlobalDashboard() {
    const container = document.getElementById('moduleContainer');
    
    // Business type definitions for labels
    const bizTypes = {
        'all': { label: '全部项目', icon: 'ph-squares-four' },
        'major': { label: '专业达成度', icon: 'ph-graduation-cap' },
        'course': { label: '课程达成度', icon: 'ph-book-bookmark' },
        'research': { label: '科研考核', icon: 'ph-microscope' },
        'job': { label: '岗位能力', icon: 'ph-briefcase' },
        'custom': { label: '自定义计算', icon: 'ph-cube' }
    };

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div>
                <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">欢迎使用达成度评价引擎</h1>
                <p style="color: var(--text-secondary); font-size: 1rem;">深入业务数据，自动化追踪各项指标达成情况，助力每一份教学与业务成果的精准计算与客观分析。</p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn-primary" style="padding: 12px 24px; font-size: 1rem; background: var(--bg-surface); border: 1px solid var(--accent-primary); color: var(--text-primary);" onclick="openCreateTaskModal()"><i class="ph ph-plus"></i> 新建计算任务</button>
            </div>
        </div>
        
        <h3 style="margin-bottom: 16px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;"><i class="ph-fill ph-list-dashes"></i> 达成度业务任务列表</h3>
    `;

    if (mockData.tasks.length === 0) {
        // Minimalist Empty State
        html += `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; background: var(--bg-panel); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
                <i class="ph ph-folder-dashed" style="font-size: 64px; margin-bottom: 16px; opacity: 0.3; color: var(--text-muted);"></i>
                <h3 style="margin: 0 0 8px 0; font-size: 1.25rem; color: var(--text-primary);">暂无运行中的计算任务</h3>
                <p style="color: var(--text-secondary); margin: 0 0 24px 0;">点击右上角「新建计算任务」将新的教学成果核算配置加入引擎。</p>
                <button class="btn-primary" onclick="openCreateTaskModal()"><i class="ph ph-plus"></i> 新建计算任务</button>
            </div>
        `;
    } else {
        html += `<div class="dashboard-grid">`;
        mockData.tasks.forEach(task => {
            // Task States: pending_config, pending_calc, completed
            let statusText = '';
            let badgeClass = '';
            let colorClass = '';
            
            if (task.status === 'pending_calc' || task.status === 'processing') {
                statusText = '待计算';
                badgeClass = 'processing';
                colorClass = 'green';
            } else if (task.status === 'completed') {
                statusText = '已完成';
                badgeClass = 'completed';
                colorClass = 'blue';
            } else {
                statusText = '待配置';
                badgeClass = 'pending';
                colorClass = 'orange';
            }
            
            let bizTypeObj = bizTypes[task.businessType] || bizTypes['custom'];

            html += `
                <div class="card task-card glass" style="cursor: pointer; position: relative; overflow: hidden;" onclick="enterTaskContext(${task.id})">
                    <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent-${colorClass === 'blue' ? 'primary' : colorClass});"></div>
                    
                    <div class="task-header" style="display:flex; justify-content:space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                        <div style="flex:1; min-width:200px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-left: 12px;">
                                <span style="font-size: 0.75rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.1); padding: 2px 8px; border-radius: 4px; color: var(--accent-primary); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                                    <i class="ph ${bizTypeObj.icon}"></i> ${bizTypeObj.label}
                                </span>
                            </div>
                            <h3 class="task-title" style="padding-left: 12px; margin-top: 0; font-size: 1.1rem; line-height: 1.4; word-break: break-all;">${task.name}</h3>
                        </div>
                        <span class="badge ${badgeClass}" style="flex-shrink: 0; white-space: nowrap;">${statusText}</span>
                    </div>
                    <p class="task-desc" style="padding-left: 12px; margin-top: 8px; line-height: 1.5; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${task.desc}</p>
                    
                    <div class="task-footer" style="padding-left: 12px; margin-top: 24px; border-top: 1px dashed var(--border-color); padding-top: 16px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
                        <span style="color:var(--text-muted); font-size: 0.85rem; white-space: nowrap; flex-shrink: 0;"><i class="ph ph-clock"></i> 最近更新: ${task.date}</span>
                        <div style="display:flex; flex-wrap: wrap; gap:8px; flex-shrink: 0;">
                            <button class="btn-icon" style="padding:5px 12px;font-size:0.82rem;border-radius:var(--radius-md);border:1px solid rgba(239,68,68,0.3);color:#ef4444;white-space:nowrap;flex-shrink:0;" onclick="event.stopPropagation();deleteTask(${task.id})"><i class="ph ph-trash"></i> 删除</button>
                            <button class="btn-primary" style="padding: 5px 14px; font-size: 0.85rem; background: rgba(99,102,241,0.1); border: 1px solid var(--accent-primary); color: var(--accent-primary);white-space:nowrap;flex-shrink:0;" onclick="event.stopPropagation(); enterTaskContext(${task.id});"><i class="ph ph-arrow-right"></i> 进入任务</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    container.innerHTML = html;

    // Make wrapper functions global
    window.enterTaskContext = enterTaskContext;
    window.openCreateTaskModal = function() {
        document.getElementById('createTaskModal').style.display = 'flex';
        wizardGoBack();
        document.getElementById('newTaskName').value = '';
        document.getElementById('newTaskDesc').value = '';
    };
    
    // Mount Engine Settings Drawer
    window.openEngineSettings = function() {
        document.getElementById('engineSettingsOverlay').style.display = 'block';
        // Add a small delay to trigger CSS transition
        setTimeout(() => {
            document.getElementById('engineSettingsDrawer').classList.add('open');
        }, 10);
        // Open default tab
        switchEngineSettingTab('datasource');
    };
    
    window.closeEngineSettings = function() {
        document.getElementById('engineSettingsDrawer').classList.remove('open');
        setTimeout(() => {
            document.getElementById('engineSettingsOverlay').style.display = 'none';
        }, 400); // match css transition duration
    };
    
    window.switchEngineSettingTab = function(tabId) {
        // Toggle tab styles
        document.querySelectorAll('.eng-setting-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.eng-setting-tab[data-target="${tabId}"]`);
        if(activeTab) activeTab.classList.add('active');
        
        // Toggle content panels
        document.querySelectorAll('.eng-setting-panel').forEach(p => p.style.display = 'none');
        const activePanel = document.getElementById(`engPanel-${tabId}`);
        if(activePanel) activePanel.style.display = 'block';
    }
}

// Wizard Logic Context variables
let selectedTemplateType = 'major';

window.closeCreateTaskModal = function() {
    document.getElementById('createTaskModal').style.display = 'none';
};

window.selectTemplate = function(el) {
    const cards = document.querySelectorAll('.template-card');
    cards.forEach(card => {
        card.style.borderColor = 'var(--border-color)';
        if(card.getAttribute('data-type') === 'custom') {
            card.style.background = 'transparent';
        } else {
            card.style.background = 'var(--bg-panel)';
        }
        card.querySelector('.template-check').style.display = 'none';
        card.classList.remove('selected');
    });

    el.style.borderColor = 'var(--accent-primary)';
    el.style.background = 'rgba(99,102,241,0.05)';
    el.querySelector('.template-check').style.display = 'block';
    el.classList.add('selected');
    
    selectedTemplateType = el.getAttribute('data-type');
    showWizardInlineExpand(selectedTemplateType);
};

window.wizardSelectedTarget = null;

// Inline expand for major/course selection in wizard
window.filterWizardInline = function() {
    const q = document.getElementById('wizardInlineSearch').value.trim();
    renderWizardInlineList(q);
};

function renderWizardInlineList(filter) {
    const listEl = document.getElementById('wizardInlineList');
    const type = selectedTemplateType;
    let sourceData = [];
    if (type === 'major' || type === 'job') {
        sourceData = mockData.majors || [];
    } else if (type === 'course') {
        sourceData = mockData.courses || [];
    }
    const matched = sourceData.filter(d => d.name.includes(filter || ''));
    listEl.innerHTML = matched.map(d => {
        let tagsHtml = '';
        if (selectedTemplateType === 'major' || selectedTemplateType === 'job') {
            tagsHtml = `
                <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                    <span style="font-size:0.75rem;padding:1px 6px;background:rgba(99,102,241,0.08);color:var(--accent-primary);border-radius:4px;border:1px solid rgba(99,102,241,0.1);">${d.year}届</span>
                    <span style="font-size:0.75rem;padding:1px 6px;background:rgba(16,185,129,0.08);color:var(--accent-green);border-radius:4px;border:1px solid rgba(16,185,129,0.1);">${d.targets} 培养目标</span>
                    <span style="font-size:0.75rem;padding:1px 6px;background:rgba(6,182,212,0.08);color:var(--accent-cyan);border-radius:4px;border:1px solid rgba(6,182,212,0.1);">${d.requirements} 毕业要求</span>
                    <span style="font-size:0.75rem;padding:1px 6px;background:rgba(245,158,11,0.08);color:var(--accent-orange);border-radius:4px;border:1px solid rgba(245,158,11,0.1);">${d.courses} 课程</span>
                </div>
            `;
        }
        return `
            <div class="selectable-item${window.wizardSelectedTarget && window.wizardSelectedTarget.id === d.id ? ' selected' : ''}"
                 onclick="selectWizardTarget('${d.id}','${d.name.replace(/'/g, "\\'")}')"
                 style="padding:12px;cursor:pointer;border-bottom:1px solid var(--border-color);transition:background 0.15s;">
                <div style="font-weight:500;font-size:0.95rem;color:var(--text-primary);">${d.name}</div>
                ${tagsHtml}
            </div>`;
    }).join('');
    if (!matched.length) listEl.innerHTML = '<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:0.85rem;">未找到相关选项</div>';
}

window.selectWizardTarget = function(id, name) {
    window.wizardSelectedTarget = { id, name };
    renderWizardInlineList(document.getElementById('wizardInlineSearch').value);
    const sel = document.getElementById('wizardInlineSelected');
    sel.style.display = 'flex';
    sel.innerHTML = `<i class="ph-fill ph-check-circle"></i> 已选择：<strong>${name}</strong>`;
};

window.showWizardInlineExpand = function(type) {
    const zone = document.getElementById('wizardInlineExpand');
    const label = document.getElementById('wizardInlineLabelText');
    window.wizardSelectedTarget = null;
    document.getElementById('wizardInlineSearch').value = '';
    const sel = document.getElementById('wizardInlineSelected');
    if (sel) sel.style.display = 'none';

    if (type === 'major') { zone.style.display='block'; label.textContent='选择关联专业'; renderWizardInlineList(''); }
    else if (type === 'job') { zone.style.display='block'; label.textContent='选择关联专业'; renderWizardInlineList(''); }
    else if (type === 'course') { zone.style.display='block'; label.textContent='选择关联课程'; renderWizardInlineList(''); }
    else { zone.style.display='none'; }
};

window.wizardGoNext = function() {
    document.getElementById('wizardStep1').style.display = 'none';
    document.getElementById('wizardStep2').style.display = 'block';
    document.getElementById('wizardBtnBack').style.display = 'block';
    document.getElementById('wizardBtnNext').style.display = 'none';
    document.getElementById('wizardBtnSubmit').style.display = 'flex';
};

window.wizardGoBack = function() {
    document.getElementById('wizardStep1').style.display = 'block';
    document.getElementById('wizardStep2').style.display = 'none';
    document.getElementById('wizardBtnBack').style.display = 'none';
    document.getElementById('wizardBtnNext').style.display = 'flex';
    document.getElementById('wizardBtnSubmit').style.display = 'none';
};

window.submitNewTask = function() {
    const title = document.getElementById('newTaskName').value.trim();
    if(!title) {
        alert("请输入任务名称");
        return;
    }
    
    // Create mock task object
    const newTask = {
        id: Date.now(),
        name: title,
        desc: document.getElementById('newTaskDesc').value || '尚未填写任务描述，请进入任务详情进行补充。',
        status: 'pending_config',
        businessType: selectedTemplateType,
        selectedTarget: window.wizardSelectedTarget,
        progress: 0,
        date: new Date().toISOString().split('T')[0]
    };

    mockData.tasks.unshift(newTask);
    
    // Auto-initialize rulesTree for major template
    if (selectedTemplateType === 'major' && window.wizardSelectedTarget) {
        if (mockData.majorTemplateRules && mockData.majorTemplateRules.length > 0) {
            // Deep clone the template rules
            mockData.rulesTree = JSON.parse(JSON.stringify(mockData.majorTemplateRules));
            console.log("Auto-initialized rulesTree for major:", window.wizardSelectedTarget.name);
        }
    } else if (selectedTemplateType === 'custom') {
        mockData.rulesTree = []; // Clear for custom
    }
    
    closeCreateTaskModal();
    renderGlobalDashboard();
}

window.deleteTask = function(taskId) {
    if (!confirm('确定要删除此任务吗？删除后无法恢复。')) return;
    const idx = mockData.tasks.findIndex(t => t.id === taskId);
    if (idx > -1) { mockData.tasks.splice(idx, 1); renderGlobalDashboard(); }
};

function renderObjects(container) {
    const isLocked = state.currentTask.status === 'pending_calc' || state.currentTask.status === 'processing' || state.currentTask.status === 'completed';
    const lockWarning = isLocked ? `
        <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(245,158,11,0.1); border: 1px solid var(--accent-orange); border-radius: 8px; color: var(--accent-orange); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-lock-key"></i> 任务已进入计算阶段，统计对象池被锁定，不可调整底层学生元数据。</div>
            <button class="btn-icon" style="color: var(--accent-orange); border: 1px solid var(--accent-orange); padding: 4px 12px; border-radius: 6px; font-size: 0.85rem;" onclick="withdrawCalculation()">
                停止计算并解锁
            </button>
        </div>` : '';
    
    let html = `
        <div class="card glass" style="flex: 1; display: flex; flex-direction: column;">
            ${lockWarning}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                <div>
                    <h2 class="section-title" style="margin: 0;"><i class="ph-fill ph-users"></i> 统计对象管理</h2>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div class="search-box" style="display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px 16px; height: 36px;">
                        <i class="ph ph-magnifying-glass" style="color: var(--text-muted); margin-right: 8px;"></i>
                        <input type="text" placeholder="检索学号 / 姓名..." style="background: transparent; border: none; color: var(--text-primary); outline: none; padding: 0;">
                    </div>
                    <button class="btn-primary" style="background: transparent; color: ${isLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; border: 1px solid ${isLocked ? 'var(--border-color)' : 'var(--accent-green)'}; height: 36px; ${isLocked ? 'cursor: not-allowed; opacity: 0.6;' : ''}" ${isLocked ? 'disabled' : ''} onclick="openModal('importStudentModal')">
                        <i class="ph ph-upload-simple"></i> 批量导入学生
                    </button>
                    ${!isLocked ? `<button class="btn-primary" style="height: 36px;" onclick="openModal('addStudentModal')"><i class="ph ph-plus"></i> 添加学生</button>` : ''}
                </div>
            </div>

            <div class="table-wrapper" id="objectTableContainer">
                <!-- Table rendered directly -->
            </div>
        </div>
    `;
    container.innerHTML = html;
    
    let tableHtml = '<table class="data-table"><thead><tr>';
    tableHtml += '<th>学号</th><th>姓名</th><th>年级</th><th>专业</th><th>班级</th><th style="text-align: right;">操作 / 状态</th></tr></thead><tbody>';
    const isPendingConfig = state.currentTask.status === 'pending_config';
    const students = isPendingConfig ? mockData.objects.empty.students : mockData.objects.default.students;

    if (students.length === 0) {
        document.getElementById('objectTableContainer').innerHTML = `
            <div style="padding:60px 24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:var(--radius-lg);margin-top:8px;">
                <i class="ph ph-users" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:12px;"></i>
                <p style="font-size:1rem;margin:0 0 16px 0;">统计对象池为空，请点击「添加学生」或「批量导入学生」</p>
            </div>`;
        return;
    }

    students.forEach(s => {
        tableHtml += `<tr>
            <td>${s.id}</td><td>${s.name}</td><td>${s.grade}</td><td><span style="background: rgba(99,102,241,0.05); color: var(--accent-primary); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; border: 1px solid rgba(99,102,241,0.1);">${s.major}</span></td><td>${s.class}</td>
            <td style="text-align: right;"><div class="action-links" style="justify-content: flex-end;">${!isLocked ? '<a onclick="alert(\"编辑功能演示\")">编辑</a><a class="delete" style="color: var(--accent-orange);" onclick="alert(\"移除功能演示\")">移除</a>' : '<a style="color: var(--text-muted); cursor: not-allowed; opacity: 0.6;">编辑</a><a style="color: var(--text-muted); cursor: not-allowed; opacity: 0.6;">移除</a>'}</div></td>
        </tr>`;
    });
    tableHtml += '</tbody></table>';
    document.getElementById('objectTableContainer').innerHTML = tableHtml;
}

const bindTreeEvents = (root) => {
        root.querySelectorAll('.tree-label').forEach(label => {
            label.addEventListener('click', (e) => {
                if (e.target.classList.contains('tree-expander')) return;
                document.querySelectorAll('.tree-label').forEach(l => l.classList.remove('active'));
                label.classList.add('active');
                const nodeId = label.getAttribute('data-id');
                state.currentRuleNodeId = nodeId;
                const n = findNodeById(mockData.rulesTree, nodeId);
                const lbl = document.getElementById('trialNodeLabel');
                if (lbl) lbl.textContent = '— ' + (n ? n.text : '');
                renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
            });
        });
        root.querySelectorAll('.tree-expander').forEach(exp => {
            exp.addEventListener('click', (e) => {
                e.stopPropagation();
                exp.classList.toggle('collapsed');
                const ch = exp.closest('.tree-node').querySelector('.tree-children');
                if (ch) ch.classList.toggle('collapsed');
            });
        });
    };

function renderRules(container) {
    let html = `
        <div style="display:flex;flex-direction:column;height:100%;gap:0;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-shrink:0;">
                <div>
                    <h2 class="section-title" style="margin:0;font-size:1.4rem;display:flex;align-items:center;">
                        <i class="ph-fill ph-tree-structure" style="margin-right:8px;"></i> 统计规则设置
                        <div class="setup-mode-toggle">
                            <button class="mode-btn ${state.setupMode === 'global' ? 'active' : ''}" onclick="window.setSetupMode('global')">全局模式</button>
                            <button class="mode-btn ${state.setupMode === 'stepped' ? 'active' : ''}" onclick="window.setSetupMode('stepped')">分段向导</button>
                        </div>
                    </h2>
                </div>
                ${state.setupMode === 'global' ? `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:2px;">
                    <button class="btn-primary" style="padding:6px 16px;font-size:0.85rem;border-radius:6px;box-shadow:0 4px 12px rgba(99,102,241,0.15);" onclick="openAddIndexModal('root')">
                        <i class="ph ph-plus"></i> 新增一级指标
                    </button>
                    <button class="btn-icon" style="color:var(--accent-cyan);font-size:0.85rem;padding:6px 14px;border-radius:6px;border:1px solid rgba(6,182,212,0.3);background:var(--bg-surface);" onclick="openRootRuleModal()" title="一级指标计算规则"><i class="ph ph-sliders-horizontal"></i> 计算规则</button>
                </div>
                ` : '<div></div>'}
            </div>
            ${state.setupMode === 'stepped' ? `
            <div class="stepped-header" style="display:flex;align-items:center;justify-content:center;gap:32px;padding:24px 0;background:var(--bg-surface);border-bottom:1px solid var(--border-color);">
                <div class="phase-step" style="display:flex;flex-direction:column;align-items:center;gap:8px;transition:all 0.3s;position:relative;${state.steppedPhase === 1 ? 'color:var(--accent-primary);' : 'color:var(--accent-green);'}">
                    <div class="phase-num" style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;${state.steppedPhase === 1 ? 'background:var(--accent-primary);color:#fff;border:none;' : 'background:transparent;color:var(--accent-green);border:2px solid var(--accent-green);'}">
                        ${state.steppedPhase > 1 ? '<i class="ph-bold ph-check"></i>' : '1'}
                    </div>
                    <span style="font-weight:600;font-size:0.95rem;">第一步：构建体系结构</span>
                </div>
                <div style="width:120px;height:2px;background:${state.steppedPhase === 2 ? 'var(--accent-green)' : 'var(--border-color)'};opacity:0.6;margin-top:-24px;border-radius:2px;"></div>
                <div class="phase-step" style="display:flex;flex-direction:column;align-items:center;gap:8px;transition:all 0.3s;position:relative;opacity:${state.steppedPhase === 2 ? '1' : '0.5'};${state.steppedPhase === 2 ? 'color:var(--accent-primary);' : 'color:var(--text-muted);'}">
                    <div class="phase-num" style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;${state.steppedPhase === 2 ? 'background:var(--accent-primary);color:#fff;border:none;' : 'background:transparent;color:var(--text-muted);border:2px solid var(--text-muted);'}">
                        2
                    </div>
                    <span style="font-weight:600;font-size:0.95rem;">第二步：配置计算规则</span>
                </div>
            </div>
            ` : ''}

            <div class="split-layout" style="flex:1;min-height:0;${state.setupMode === 'stepped' && state.steppedPhase === 1 ? 'display:flex;justify-content:center;padding:24px;background:var(--bg-panel);' : ''}">
                <div class="sidebar-panel glass" style="display:flex;flex-direction:column;padding:0;overflow:hidden;${state.setupMode === 'stepped' && state.steppedPhase === 1 ? 'flex:1;max-width:none;width:100%;border-right:none;border:1px solid var(--border-color);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.05);' : ''}">
                    <div style="padding:14px 16px;border-bottom:1px solid var(--border-color);flex-shrink:0;display:flex;justify-content:space-between;align-items:center;">
                        <h3 class="section-title" style="font-size:0.95rem;margin:0;"><i class="ph-fill ph-tree-structure"></i> 评价指标体系</h3>
                        ${state.setupMode === 'stepped' ? `
                        <div style="display:flex;gap:6px;">
                            ${state.steppedPhase === 1 ? `
                                <button class="btn-primary" style="padding:4px 12px;font-size:0.8rem;border-radius:6px;" onclick="openAddIndexModal('root')"><i class="ph ph-plus"></i> 新增一级指标</button>
                            ` : ''}
                            ${state.steppedPhase === 2 ? `
                                <button class="btn-icon" style="color:var(--accent-cyan);font-size:0.8rem;padding:4px 8px;border-radius:6px;border:1px solid rgba(6,182,212,0.3);" onclick="openRootRuleModal()" title="一级指标计算规则"><i class="ph ph-sliders-horizontal"></i> 计算规则</button>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                    <div class="tree-container" style="flex:1;overflow-y:auto;padding:10px 6px;">
                        ${buildTreeHtml(mockData.rulesTree)}
                    </div>
                </div>
                ${!(state.setupMode === 'stepped' && state.steppedPhase === 1) ? `
                <div class="main-panel glass" id="ruleMainPanel" style="overflow-y:auto;">
                    ${mockData.rulesTree.length === 0 ? `
                        <div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);flex-direction:column;gap:16px;padding:40px;text-align:center;">
                            <div style="width:80px;height:80px;background:rgba(99,102,241,0.05);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                                <i class="ph ph-tree-structure" style="font-size:3rem;color:var(--accent-primary);opacity:0.4;"></i>
                            </div>
                            <h3 style="color:var(--text-primary);margin:0;">评价指标体系尚为空白</h3>
                            <p style="max-width:320px;line-height:1.6;font-size:0.95rem;">您可以点击右上角的「<b>新增一级指标</b>」按钮，或者选择预置业务模板自动导入指标体系。</p>
                            <button class="btn-primary" style="margin-top:12px;padding:10px 24px;" onclick="openAddIndexModal('root')"><i class="ph ph-plus"></i> 立即创建第一个一级指标</button>
                        </div>
                    ` : `
                        <div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);flex-direction:column;gap:16px;">
                            <i class="ph ph-hand-pointing" style="font-size:48px;opacity:0.4;"></i>
                            <p>请在左侧选择一个指标节点进行配置</p>
                        </div>
                    `}
                </div>
                ` : ''}
            </div>
            ${(state.setupMode === 'stepped' && state.steppedPhase === 1) ? `
            <div style="padding:16px;text-align:center;background:var(--bg-surface);border-top:1px solid var(--border-color);flex-shrink:0;box-shadow:0 -4px 12px rgba(0,0,0,0.02);">
                <button class="btn-primary" style="padding:10px 32px;font-size:1.05rem;border-radius:24px;box-shadow:0 4px 12px rgba(99,102,241,0.25);letter-spacing:0.5px;transition:all 0.2s;" onclick="window.setSteppedPhase(2)">结构无误，进入第二步配置规则 👉</button>
            </div>
            ` : ''}
            <div class="trial-calc-bar" id="trialCalcBar" style="${(state.setupMode === 'stepped' && state.steppedPhase === 1) ? 'display:none;' : ''}">
                <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                    <i class="ph-fill ph-flask" style="font-size:1.2rem;color:var(--accent-cyan);"></i>
                    <span style="font-weight:600;color:var(--text-primary);font-size:0.9rem;">试算</span>
                    <span id="trialNodeLabel" style="font-size:0.82rem;color:var(--text-muted);">— 点击节点后可试算</span>
                </div>
                <div style="display:flex;align-items:center;gap:20px;flex:1;justify-content:center;" id="trialResultArea"></div>
                <div style="display:flex;gap:8px;flex-shrink:0;">
                    ${state.setupMode === 'stepped' && state.steppedPhase === 2 ? `
                    <button class="btn-icon" style="border:1px solid var(--accent-orange);color:var(--accent-orange);padding:5px 14px;border-radius:var(--radius-md);font-size:0.85rem;" onclick="window.setSteppedPhase(1)">
                        <i class="ph ph-arrow-u-up-left"></i> 返回修改结构
                    </button>
                    ` : ''}
                    <button class="btn-primary" style="padding:6px 20px;border-radius:8px;font-size:0.9rem;box-shadow:0 4px 12px rgba(99,102,241,0.2);" onclick="runGlobalTrialModal()">
                        <i class="ph ph-lightning"></i> 全局深度试算
                    </button>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    

    bindTreeEvents(container);
    // auto-click disabled to prevent blocking

    window.refreshRuleTree = function() {
        const tc = document.querySelector('.tree-container');
        if (!tc) return;
        tc.innerHTML = buildTreeHtml(mockData.rulesTree);
        bindTreeEvents(tc);
        const curId = state.currentRuleNodeId;
        if (curId) {
            const lbl = tc.querySelector(`.tree-label[data-id="${curId}"]`);
            if (lbl) lbl.classList.add('active');
        }
    };

    window.setSetupMode = function(mode) {
        if (state.setupMode === mode) return;
        state.setupMode = mode;
        if (mode === 'stepped') state.steppedPhase = 1;
        state.currentRuleNodeId = null; // Clear selection on mode switch
        document.querySelector('.nav-item[data-module="rules"]').click(); // Re-render
    };

    window.setSteppedPhase = function(phase) {
        state.steppedPhase = phase;
        state.currentRuleNodeId = null; // Clear selection on phase switch
        document.querySelector('.nav-item[data-module="rules"]').click(); // Re-render
    };
}


function findNodeById(nodes, id) {
    for (let node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            let found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

function getNodeLevel(nodes, nodeId, currentLevel = 1) {
    for (let node of nodes) {
        if (node.id === nodeId) return currentLevel;
        if (node.children) {
            let level = getNodeLevel(node.children, nodeId, currentLevel + 1);
            if (level !== -1) return level;
        }
    }
    return -1;
}

function renderRuleMainPanel(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    const panel = document.getElementById('ruleMainPanel');
    
    // --- Phase 1: Structure Construction Preview ---
    if (state.setupMode === 'stepped' && state.steppedPhase === 1) {
        return; // Main panel is completely hidden in Phase 1 per user request. UI handled directly in renderRules.
    }

    if (!node) return;

    // ─── shared helpers ───────────────────────────────────────────
    const isLocked = state.currentTask.status === 'processing' || state.currentTask.status === 'completed';
    const isSteppedPhase2 = state.setupMode === 'stepped' && state.steppedPhase === 2;
    const hideStructureEdit = isLocked || isSteppedPhase2; // hide structure edits in phase 2 mode
    const da = isLocked ? 'disabled' : (isSteppedPhase2 ? 'disabled' : ''); // Name editing locked in Phase 2
    const formDA = isLocked ? 'disabled' : ''; // For config values like weights and method it uses regular lock state
    
    let lockBanner = '';
    if (isLocked) {
        lockBanner = `
        <div style="margin-bottom:18px;padding:10px 14px;background:rgba(245,158,11,0.1);border:1px solid var(--accent-orange);border-radius:8px;color:var(--accent-orange);display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;"><i class="ph-fill ph-lock-key"></i> 任务已进入计算阶段，规则已锁定，不可修改。</div>
            <button class="btn-icon" style="color: var(--accent-orange); border: 1px solid var(--accent-orange); padding: 4px 12px; border-radius: 6px; font-size: 0.85rem;" onclick="withdrawCalculation()">
                <i class="ph ph-stop"></i> 停止计算并解锁
            </button>
        </div>`;
    }
    
    let phase2Hint = isSteppedPhase2 ? `<div style="position:relative;display:inline-flex;align-items:center;margin-left:8px;color:var(--accent-primary);cursor:help;" onmouseenter="this.querySelector('.phase2-tooltip').style.opacity='1';this.querySelector('.phase2-tooltip').style.visibility='visible';this.querySelector('.phase2-tooltip').style.transform='translateY(0)';" onmouseleave="this.querySelector('.phase2-tooltip').style.opacity='0';this.querySelector('.phase2-tooltip').style.visibility='hidden';this.querySelector('.phase2-tooltip').style.transform='translateY(-5px)';">
        <i class="ph-fill ph-warning-circle" style="font-size:1.3rem;"></i>
        <div class="phase2-tooltip" style="position:absolute;top:100%;left:0;margin-top:8px;width:260px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;padding:14px;font-size:0.85rem;line-height:1.5;box-shadow:0 8px 30px rgba(0,0,0,0.12);opacity:0;visibility:hidden;transform:translateY(-5px);transition:all 0.2s ease;z-index:9999;font-weight:normal;letter-spacing:0.5px;">
            <div style="position:absolute;top:-6px;left:12px;width:10px;height:10px;background:var(--bg-card);border-top:1px solid var(--border-color);border-left:1px solid var(--border-color);transform:rotate(45deg);"></div>
            <div style="position:relative;z-index:2;"><i class="ph-fill ph-info" style="color:var(--accent-primary);margin-right:4px;"></i>当前为分段向导<b style="color:var(--accent-primary);">第二步</b>。左侧体系结构为了保障规则安全已被锁定。<br><br>请在当前面板为该指标配置各项计算规则及权重参数。</div>
        </div>
    </div>` : '';
    
    const statusLabel = { configured:'✅ 已配置', incomplete:'⚠️ 未完成', failed:'❌ 试算失败' }[node.status] || '';
    const statusColor = { configured:'var(--accent-green)', incomplete:'var(--accent-orange)', failed:'var(--accent-secondary)' }[node.status] || 'var(--text-muted)';

    // ─── 1. INTERMEDIATE NODE (index / sub-index) ─────────────────
    if (node.type === 'index' || node.type === 'sub-index') {
        const level = getNodeLevel(mockData.rulesTree, node.id);
        const titleText = level === 1 ? '一级指标配置' : '子指标配置';
        const badgeLabel = `第 ${level} 级指标`;
        const badgeClass = level === 1 ? 'completed' : 'processing';
        const isWeighted = node.method === 'weighted-avg';

        const weightRows = (isWeighted && node.children && node.children.length > 0)
            ? node.children.map(c => {
                let icon = 'ph-calculator'; // Default for calc nodes
                if (c.type === 'index' || c.type === 'sub-index') icon = 'ph-tree-structure';
                if (c.type === 'leaf-ref') icon = 'ph-link';
                
                return `<tr>
                    <td><div style="font-size:0.9rem;color:var(--text-primary);"><i class="ph-fill ${icon}" style="color:${['leaf-calc','leaf-ref','data'].includes(c.type)?'var(--accent-orange)':'var(--accent-primary)'};"></i> ${c.text}</div></td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <input type="range" class="weight-slider" min="0" max="100" value="${c.weight||0}" style="width:80px;" ${formDA} oninput="syncWeightInput(this,'wi_${c.id}')">
                            <input type="number" id="wi_${c.id}" class="form-control weight-input" data-id="${c.id}" value="${c.weight||0}" style="width:68px;padding:5px 8px;" ${formDA} oninput="syncWeightSlider(this);checkWeightSum()">
                            <span style="color:var(--text-muted);">%</span>
                        </div>
                    </td>
                </tr>`;
            }).join('')
            : '';

        panel.innerHTML = `
            ${lockBanner}
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:14px;margin-bottom:20px;">
                <h2 class="section-title" style="margin:0;display:flex;align-items:center;"><i class="ph-fill ph-tree-structure" style="color:var(--accent-primary);margin-right:8px;"></i> ${titleText} ${phase2Hint}</h2>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:0.8rem;color:${statusColor};">${statusLabel}</span>
                    <span class="badge ${badgeClass}" style="padding:4px 12px;border-radius:20px;font-weight:600;">${badgeLabel}</span>
                </div>
            </div>

            <div class="form-group">
                <label>节点名称</label>
                <input type="text" class="form-control" value="${node.text}" ${da} onchange="updateNodeText('${node.id}',this.value)">
            </div>

            <div class="form-group" style="padding:16px;background:var(--bg-panel);border-radius:var(--radius-md);border:1px solid var(--border-color);position:relative;">
                <div style="position:absolute;right:16px;top:16px;display:flex;gap:8px;">
                    ${!hideStructureEdit ? `
                        <button class="btn-primary" style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.3);color:var(--accent-primary);font-size:0.8rem;padding:4px 12px;height:28px;border-radius:4px;" onclick="window.openAddMixedNodeModal('${node.id}')"><i class="ph ph-plus-circle"></i> 添加子节点</button>
                    ` : ''}
                </div>
                <label style="margin-bottom:12px;display:block;font-weight:600;">子节点列表</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:0;min-height:24px;">
                    ${(node.children && node.children.length > 0)
                        ? node.children.map(c => {
                            const isCalc = ['leaf','leaf-calc','leaf-ref','data'].includes(c.type);
                            const clr = isCalc
                                ? 'color:var(--accent-orange);background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.3);'
                                : 'color:var(--accent-primary);background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.3);';
                            const icon = isCalc ? 'ph-calculator' : 'ph-tree-structure';
                            return `<span style="font-size:0.82rem;padding:3px 12px;border-radius:20px;border:1px solid transparent;${clr};display:flex;align-items:center;gap:4px;"><i class="ph-fill ${icon}"></i> ${c.text}</span>`;
                          }).join('')
                        : '<span style="color:var(--text-muted);font-size:0.9rem;">暂无子项，请点击右上角按钮添加</span>'}
                </div>
            </div>

            <div class="form-group">
                <div style="display:flex;gap:16px;">
                    <div style="flex:1;">
                        <label>计算规则 <span style="font-weight:normal;font-size:0.82rem;color:var(--text-muted);">(向下汇总计算)</span></label>
                        <select class="form-control" id="parentMethodSel" ${formDA} onchange="updateParentMethod('${node.id}',this.value)">
                            <option value="avg" ${node.method==='avg'?'selected':''}>简单平均（所有子项均分）</option>
                            <option value="weighted-avg" ${node.method==='weighted-avg'?'selected':''}>加权平均（按比例折算）</option>
                            <option value="sum" ${node.method==='sum'?'selected':''}>求和（累加所有子项）</option>
                            <option value="min" ${node.method==='min'?'selected':''}>取最小值（短板基准法）</option>
                            <option value="custom" ${node.method==='custom'?'selected':''}>自定义表达式</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label>达成度判别阈值 <span style="font-weight:normal;font-size:0.82rem;color:var(--text-muted);">(通过此线即达成)</span></label>
                        <input type="number" step="0.01" class="form-control" value="${node.threshold||60}" placeholder="例：60" ${da} onchange="updateNodeThreshold('${node.id}',this.value)">
                    </div>
                </div>
            </div>

            ${isWeighted && node.children && node.children.length > 0 ? `
            <div class="form-group">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <label style="margin:0;">子项权重分配</label>
                    ${!isLocked ? `<button class="btn-icon" style="font-size:0.82rem;padding:3px 10px;border:1px solid var(--accent-cyan);color:var(--accent-cyan);border-radius:var(--radius-md);" onclick="splitWeightEqually('${node.id}')"><i class="ph ph-equals"></i> 平均分配</button>` : ''}
                </div>
                <table class="data-table" style="background:var(--bg-panel);border-radius:var(--radius-md);overflow:hidden;">
                    <thead><tr><th>子项名称</th><th>权重占比</th></tr></thead>
                    <tbody>${weightRows}</tbody>
                </table>
                <div id="weightValidationMsg" style="margin-top:8px;font-size:0.85rem;display:flex;align-items:center;gap:6px;"></div>
            </div>` : ''}

            ${node.method === 'custom' ? `
            <div class="form-group formula-levels">
                <label style="color:var(--accent-cyan);">自定义聚合表达式</label>
                <div class="formula-tab-bar">
                    <button class="formula-tab active" onclick="switchFormulaTab(this,'fl2')">L2 表达式</button>
                    <button class="formula-tab" onclick="switchFormulaTab(this,'fl3')">L3 脚本</button>
                </div>
                <div id="fl2" class="formula-panel" style="display:block;">
                    <input type="text" class="form-control formula-input" value="${node.formulaExpr||''}" placeholder="例: val_child1 * 0.6 + val_child2 * 0.4" ${da}>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:6px;">变量名格式：val_{子节点ID}，可用 +−×÷ 和括号</p>
                </div>
                <div id="fl3" class="formula-panel" style="display:none;">
                    <textarea class="form-control formula-input" rows="5" placeholder="// JavaScript 脚本，返回 0-100 的数值\nreturn (values['r1_1'] * 0.6 + values['r1_2'] * 0.4);" ${da}>${node.formulaScript||''}</textarea>
                </div>
            </div>` : ''}

            ${!isLocked ? `<div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:16px;">
                <button class="btn-icon" style="color:var(--accent-secondary);font-size:0.88rem;" onclick="deleteNode('${node.id}')"><i class="ph ph-trash"></i> 删除此节点</button>
                <button class="btn-primary" onclick="saveNodeConfig('${node.id}')"><i class="ph ph-check"></i> 保存配置</button>
            </div>` : ''}
        `;
        if (isWeighted && weightRows) setTimeout(checkWeightSum, 50);

    // ─── 2. LEAF — REFERENCE TYPE (leaf-ref) ─────────────────────
    } else if (node.type === 'leaf-ref') {
        const rt = node.refType || 'external';
        const tabStyle = (active) => active
            ? 'background:var(--accent-primary);color:#fff;border-color:var(--accent-primary);'
            : 'background:transparent;color:var(--text-secondary);border-color:var(--border-color);';

        let refContent = '';
        if (rt === 'external') {
            refContent = `
                <div class="form-group">
                    <label>数据表</label>
                    <select class="form-control" ${da}>
                        <option ${node.refTable==='教务系统'?'selected':''}>教务系统</option>
                        <option>科研管理平台</option>
                        <option>HR系统</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>字段</label>
                    <input type="text" class="form-control" value="${node.refField||''}" placeholder="如：期末总评分" ${da}>
                </div>
                <div class="form-group">
                    <label>筛选条件 <span style="font-weight:normal;font-size:0.8rem;color:var(--text-muted);">（可继承父节点）</span></label>
                    <input type="text" class="form-control" value="${node.refFilter||''}" placeholder="如：学年=2023-2024，学期=秋" ${da}>
                </div>`;
        } else if (rt === 'indicator') {
            const refs = node.refIndicators || [];
            const refRows = refs.map(r => `
                <tr>
                    <td><span style="color:var(--accent-primary);">${r.name}</span></td>
                    <td><div style="display:flex;align-items:center;gap:6px;">
                        <input type="number" class="form-control" value="${r.weight}" style="width:68px;padding:5px 8px;" ${da}>
                        <span style="color:var(--text-muted);">%</span>
                        ${!isLocked?`<button onclick="removeRefIndicator('${node.id}','${r.id}')" style="background:none;border:none;color:var(--accent-secondary);cursor:pointer;"><i class="ph ph-x"></i></button>`:''}
                    </div></td>
                </tr>`).join('');
            refContent = `
                <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
                    <p style="font-size:0.88rem;color:var(--text-secondary);margin:0;">当前引用 ${refs.length} 个指标节点：</p>
                    ${!isLocked?`<button class="btn-icon" style="border:1px solid var(--accent-primary);color:var(--accent-primary);padding:4px 12px;border-radius:var(--radius-md);font-size:0.82rem;" onclick="openIndicatorPicker('${node.id}')"><i class="ph ph-plus"></i> 添加引用指标</button>`:''}
                </div>
                ${refs.length > 0 ? `<table class="data-table" style="background:var(--bg-panel);border-radius:var(--radius-md);">
                    <thead><tr><th>指标名称</th><th>权重占比</th></tr></thead>
                    <tbody>${refRows}</tbody>
                </table>` : `<div style="padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:var(--radius-md);">暂未引用任何指标，点击「添加引用指标」</div>`}`;
        } else {
            refContent = `
                <div class="form-group">
                    <label>手动录入值</label>
                    <input type="number" class="form-control" value="${node.manualValue||''}" placeholder="直接输入 0-100 的数值" ${da}>
                </div>
                <p style="font-size:0.82rem;color:var(--text-muted);">适用于已知固定结果、不需要从数据源动态计算的场景。</p>`;
        }

        panel.innerHTML = `
            ${lockBanner}
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:14px;margin-bottom:20px;">
                <h2 class="section-title" style="margin:0;display:flex;align-items:center;"><i class="ph-fill ph-link" style="color:var(--accent-primary);margin-right:8px;"></i> 引用节点配置 ${phase2Hint}</h2>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:0.8rem;color:${statusColor};">${statusLabel}</span>

                </div>
            </div>
            <div class="form-group">
                <label>节点名称</label>
                <input type="text" class="form-control" value="${node.text}" ${da}>
            </div>
            <div class="form-group">
                <label>引用来源</label>
                <div style="display:flex;gap:8px;margin-top:4px;">
                    <button style="flex:1;padding:8px;border:1px solid;border-radius:var(--radius-md);cursor:pointer;font-size:0.85rem;${tabStyle(rt==='external')}" onclick="switchRefType('${node.id}','external')"><i class="ph ph-database"></i> 外部数据源</button>
                    <button style="flex:1;padding:8px;border:1px solid;border-radius:var(--radius-md);cursor:pointer;font-size:0.85rem;${tabStyle(rt==='indicator')}" onclick="switchRefType('${node.id}','indicator')"><i class="ph ph-graph"></i> 已有指标</button>
                    <button style="flex:1;padding:8px;border:1px solid;border-radius:var(--radius-md);cursor:pointer;font-size:0.85rem;${tabStyle(rt==='manual')}" onclick="switchRefType('${node.id}','manual')"><i class="ph ph-pencil-simple"></i> 手动录入</button>
                </div>
            </div>
            <div style="padding:16px;background:var(--bg-panel);border-radius:var(--radius-md);border:1px solid var(--border-color);">
                ${refContent}
            </div>
            ${!isLocked ? `<div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:16px;">
                <button class="btn-icon" style="color:var(--accent-secondary);font-size:0.88rem;" onclick="deleteNode('${node.id}')"><i class="ph ph-trash"></i> 删除节点</button>
                <button class="btn-primary" onclick="saveNodeConfig('${node.id}')"><i class="ph ph-check"></i> 保存配置</button>
            </div>` : ''}
        `;

    // ─── 3. LEAF — CALC TYPE (leaf-calc) ─────────────────────────
    } else if (node.type === 'leaf' || node.type === 'leaf-calc' || node.type === 'data') {
        const items = node.dataItems || [];
        const fl = node.formulaLevel || 'L1';
        const ft = node.formulaTemplate || 'single';
        const nm = node.aggMethod || node.method || 'avg';
        

        const renderDataItem = (item, depth=0) => {
            if (item.type === 'group') {
                const childHtml = (item.children||[]).map(c => renderDataItem(c, depth+1)).join('');
                return `<div class="data-group-card" style="margin:8px 0;border:1px solid var(--border-color);border-radius:var(--radius-md);overflow:hidden;">
                    <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg-panel);cursor:pointer;" onclick="toggleGroup('${item.id}')">
                        <i class="ph ph-caret-down group-arrow-${item.id}" style="font-size:0.85rem;color:var(--text-muted);transition:transform 0.2s;"></i>
                        <i class="ph-fill ph-folder" style="color:var(--accent-primary);"></i>
                        <span style="font-weight:500;flex:1;">${item.text}</span>
                        <span style="font-size:0.8rem;color:var(--text-muted);margin-right:8px;">聚合: ${({avg:'均值',sum:'求和',min:'最小',weighted:'加权'})[item.method]||item.method} · 权重 ${item.weight||0}%</span>
                        ${!isLocked?`<button style="background:none;border:none;color:var(--accent-secondary);cursor:pointer;padding:0;" onclick="event.stopPropagation();deleteDataItem('${node.id}','${item.id}')"><i class="ph ph-trash"></i></button>`:''}
                    </div>
                    <div id="grp_${item.id}" style="padding:8px 14px 8px 28px;">${childHtml}
                        ${!isLocked?`<button style="width:100%;margin-top:6px;padding:5px;border:1px dashed var(--border-color);border-radius:var(--radius-md);background:transparent;color:var(--text-muted);cursor:pointer;font-size:0.82rem;" onclick="addItemToGroup('${node.id}','${item.id}')"><i class="ph ph-plus"></i> 向此分组添加数据项</button>`:''}
                    </div>
                </div>`;
            }
            return `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-panel);border-radius:var(--radius-md);margin:4px 0;border:1px solid var(--border-color);">
                <i class="ph-fill ph-sliders-horizontal" style="color:var(--accent-orange);flex-shrink:0;"></i>
                <span style="flex:1;font-size:0.9rem;">${item.text}</span>
                ${!isLocked?`<button style="background:none;border:none;color:var(--accent-secondary);cursor:pointer;padding:0;" onclick="deleteDataItem('${node.id}','${item.id}')"><i class="ph ph-trash"></i></button>`:''}
            </div>`;
        };

        const itemsHtml = items.length > 0
            ? items.map(i => renderDataItem(i)).join('')
            : `<div style="padding:24px;text-align:center;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:var(--radius-md);">暂无数据项，点击下方按钮添加</div>`;

        
        const customFormula = node.customFormula || '';

        // Friendly formula builder: each data item as a named token
        const itemTokens = (node.dataItems || []).map((d, i) => {
            const label = d.text.replace(/\[.*?\]\s*/,'').substring(0,14);
            return {
                id: d.id, label: label, varName: `[${label}]`, weight: d.weight||0
            };
        });

        // Weight rows (shown only for 'weighted')
        const weightRowsHtml = nm === 'weighted' && itemTokens.length ? `
            <div style="margin-top:10px;border:1px solid var(--border-color);border-radius:var(--radius-md);overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-panel);border-bottom:1px solid var(--border-color);">
                    <label style="margin:0;font-size:0.88rem;font-weight:500;">数据项权重分配</label>
                    ${!isLocked ? `<button class="btn-icon" style="font-size:0.82rem;padding:3px 10px;border:1px solid var(--accent-cyan);color:var(--accent-cyan);border-radius:var(--radius-md);" onclick="splitWeightEqually('${node.id}')"><i class="ph ph-equals"></i> 平均分配</button>` : ''}
                </div>
                <table class="data-table" style="margin:0;">
                    <thead><tr><th>数据项</th><th style="width:140px;">权重</th></tr></thead>
                    <tbody>${itemTokens.map(t=>`
                        <tr>
                            <td style="font-size:0.88rem;">${t.label}…</td>
                            <td><div style="display:flex;align-items:center;gap:6px;">
                                <input type="range" min="0" max="100" value="${t.weight}" style="width:68px;" oninput="syncLeafWeight('${node.id}','${t.id}',this.value);document.getElementById('lw_${t.id}').value=this.value">
                                <input type="number" id="lw_${t.id}" value="${t.weight}" style="width:52px;padding:3px 6px;font-size:0.82rem;" class="form-control" ${da} oninput="syncLeafWeight('${node.id}','${t.id}',this.value)">
                                <span style="color:var(--text-muted);font-size:0.82rem;">%</span>
                            </div></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
                <div id="leafWeightMsg_${node.id}" style="padding:6px 12px;font-size:0.82rem;border-top:1px solid var(--border-color);"></div>
            </div>` : (nm === 'weighted' && !itemTokens.length ? `<p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">请先添加数据项后再配置权重。</p>` : '');

        // Friendly formula builder (shown only for 'custom')
        const customPanelHtml = nm === 'custom' ? `
            <div style="margin-top:10px;animation:fadeIn 0.2s ease;">
                <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.85rem;color:var(--text-secondary);">请直输入计算表达式，或使用下方「AI 智能推荐」生成：</span>
                </div>
                ${itemTokens.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                    ${itemTokens.map(t=>`<button class="btn-icon" onclick="insertFormulaToken('${node.id}','${t.varName}')"
                        style="padding:4px 12px;border:1px solid rgba(99,102,241,0.3);border-radius:16px;background:rgba(99,102,241,0.06);color:var(--accent-primary);font-size:0.82rem;cursor:pointer;">
                        + 插入 <strong>${t.varName}</strong>
                    </button>`).join('')}
                </div>` : ''}
                <div style="position:relative;">
                    <textarea id="customFormulaInput_${node.id}" class="form-control formula-input" rows="3"
                        oninput="(function(e){ const node = findNodeById(mockData.rulesTree, '${node.id}'); if(node) node.customFormula = e.target.value; })(event)"
                        placeholder="请输入公式，或通过上方标签插入数据项变元" ${da} style="font-family:monospace;font-size:0.95rem;background:var(--bg-panel);color:var(--accent-primary);font-weight:600;">${customFormula}</textarea>
                </div>
                ${itemTokens.length ? `<div style="margin-top:8px;padding:8px 12px;background:var(--bg-panel);border-radius:var(--radius-md);font-size:0.8rem;color:var(--text-muted);">
                    变量说明：${itemTokens.map(t=>`<strong style="color:var(--text-secondary);">${t.varName}</strong> = ${t.label}…`).join('，')}
                </div>` : ''}

                <!-- 内联 AI 推荐面板 -->
                <div style="margin-top:16px;text-align:right;">
                    <button onclick="const b=document.getElementById('aiInlineBody_${node.id}');const i=this.querySelector('.ph-caret-down');if(b.style.display==='none'){b.style.display='block';i.style.transform='rotate(180deg)';}else{b.style.display='none';i.style.transform='rotate(0)';}" style="padding:6px 16px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.4);border-radius:20px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;color:var(--accent-cyan);font-weight:600;font-size:0.85rem;transition:all 0.2s;">
                        <i class="ph-fill ph-sparkle"></i> 智能生成公式 <i class="ph ph-caret-down" style="transition:transform 0.2s;transform:rotate(0);"></i>
                    </button>
                </div>
                <div id="aiInlineBody_${node.id}" style="display:none;margin-top:12px;background:linear-gradient(135deg,rgba(6,182,212,0.05),transparent);border:1px solid rgba(6,182,212,0.2);border-radius:var(--radius-md);overflow:hidden;padding:16px;">
                    <textarea id="aiInlineDesc_${node.id}" rows="2" class="form-control" placeholder="用自然语言描述计算逻辑，例如：平时考核30%，期末70%，任一低分则不及格..." style="font-size:0.85rem;margin-bottom:10px;resize:vertical;"></textarea>
                    
                    <button id="aiInlineGenBtn_${node.id}" onclick="runInlineAiFormula('${node.id}')" style="width:100%;padding:8px;background:linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.15));border:1px solid var(--accent-cyan);border-radius:var(--radius-md);color:var(--accent-cyan);font-weight:600;cursor:pointer;font-size:0.85rem;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;">
                        <i class="ph-fill ph-sparkle"></i> 生成推荐公式
                    </button>
                    
                    <div id="aiInlineLoading_${node.id}" style="display:none;text-align:center;padding:12px;color:var(--text-muted);font-size:0.85rem;">
                        <i class="ph ph-spinner" style="animation:spin 1s linear infinite;"></i> AI 正在为您推导公式规律...
                    </div>
                    
                    <div id="aiInlineResultBox_${node.id}" style="display:none;margin-top:12px;">
                        <div style="padding:10px 12px;background:rgba(6,182,212,0.05);border:1px dashed rgba(6,182,212,0.3);border-radius:var(--radius-md);">
                            <code id="aiInlineSuggestion_${node.id}" style="display:block;font-size:0.85rem;color:var(--text-primary);font-family:monospace;word-break:break-all;margin-bottom:6px;"></code>
                            <div id="aiInlineExplain_${node.id}" style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;"></div>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:10px;">
                            <button onclick="applyInlineAiFormula('${node.id}')" style="flex:1;padding:6px;background:var(--accent-cyan);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;font-weight:600;font-size:0.85rem;display:flex;align-items:center;justify-content:center;gap:6px;">
                                <i class="ph ph-check"></i> 引用
                            </button>
                            <button onclick="discardInlineAiFormula('${node.id}')" style="flex:1;padding:6px;border:1px solid var(--border-color);border-radius:var(--radius-md);background:transparent;color:var(--text-secondary);cursor:pointer;font-size:0.85rem;">
                                放弃
                            </button>
                        </div>
                    </div>
                </div>

            </div>` : '';

        const formulaHtml = `
            <div class="form-group" style="background:var(--bg-panel);padding:12px 14px;border-radius:var(--radius-md);border:1px solid var(--border-color);">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <label style="margin:0;white-space:nowrap;font-size:0.88rem;">数据项计算规则</label>
                    <select class="form-control" style="flex:1;padding:5px 10px;font-size:0.88rem;" ${da} onchange="selectAggMethod('${node.id}',null,this.value)">
                        <option value="min" ${nm==='min'?'selected':''}>取最低值（短板基准法）</option>
                        <option value="avg" ${nm==='avg'?'selected':''}>简单平均（算数均值）</option>
                        <option value="weighted" ${nm==='weighted'?'selected':''}>加权平均（按权重折算）</option>
                        <option value="custom" ${nm==='custom'?'selected':''}>自定义公式</option>
                    </select>
                </div>
                ${weightRowsHtml}
                ${customPanelHtml}
            </div>`;

        panel.innerHTML = `
            ${lockBanner}
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:14px;margin-bottom:20px;">
                <h2 class="section-title" style="margin:0;display:flex;align-items:center;"><i class="ph-fill ph-calculator" style="color:var(--accent-orange);margin-right:8px;"></i> 计算节点配置 ${phase2Hint}</h2>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:0.8rem;color:${statusColor};">${statusLabel}</span>

                </div>
            </div>
            <div class="form-group">
                <label>节点名称</label>
                <input type="text" class="form-control" value="${node.text}" ${da}>
            </div>
            <div class="form-group">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <label style="margin:0;">数据项</label>
                    ${!isLocked ? `<button class="btn-icon" style="font-size:0.82rem;padding:4px 12px;border:1px solid var(--accent-orange);color:var(--accent-orange);border-radius:var(--radius-md);" onclick="openAddDataItemModalV2('${node.id}')"><i class="ph ph-plus"></i> 添加数据项</button>` : ''}
                </div>
                <div id="dataItemsContainer_${node.id}">${itemsHtml}</div>
            </div>
            ${formulaHtml}
            ${!isLocked ? `<div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:16px;">
                <button class="btn-icon" style="color:var(--accent-secondary);font-size:0.88rem;" onclick="deleteNode('${node.id}')"><i class="ph ph-trash"></i> 删除节点</button>
                <button class="btn-primary" onclick="saveNodeConfig('${node.id}')"><i class="ph ph-check"></i> 保存配置</button>
            </div>` : ''}
        `;
        if (nm === 'custom') setTimeout(() => updateFormulaPreview(nodeId), 50);
        if (nm === 'weighted') setTimeout(() => checkLeafWeightSum(nodeId), 50);
    }
    
    // Append Node Trial Block to every node config panel
    panel.insertAdjacentHTML('beforeend', `
        <div style="margin-top:24px;padding:16px;background:rgba(6,182,212,0.05);border:1px solid rgba(6,182,212,0.2);border-radius:var(--radius-md);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-flask" style="color:var(--accent-cyan);"></i> 节点试算</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">用添加的数据项试算当前节点的数据并给出计算结果和调整建议</div>
                    <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:4px;">即时校验计算规则闭环，并探测异常低分与缺考孤岛的数据。</div>
                </div>
                <button class="btn-primary" style="background:var(--bg-surface);border:1px solid var(--accent-cyan);color:var(--accent-cyan);padding:6px 16px;font-size:0.85rem;" onclick="runSingleNodeTrial('${node.id}')"><i class="ph ph-play"></i> 试算当前节点</button>
            </div>
        </div>
    `);
}

window.updateNodeThreshold = function(nodeId, val) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if(node) node.threshold = parseFloat(val) || 60;
};

// ==========================================
// Support Functions for Dynamic UI Updates
// ==========================================

window.toggleRuleSourceParams = function(val) {
    document.getElementById('ruleParam_internal').style.display = 'none';
    document.getElementById('ruleParam_upload').style.display = 'none';
    document.getElementById('ruleParam_3rd-party').style.display = 'none';
    const target = document.getElementById('ruleParam_' + val);
    if(target) target.style.display = 'block';
};

window.updateParentMethod = function(nodeId, method) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if(node) {
        node.method = method;
        renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50); // Re-render to show weight distribution or formulas
    }
}

window.checkWeightSum = function() {
    const inputs = document.querySelectorAll('.weight-input');
    if (inputs.length === 0) return;
    
    let sum = 0;
    inputs.forEach(input => {
        sum += parseFloat(input.value) || 0;
    });
    
    const msgBox = document.getElementById('weightValidationMsg');
    if(sum === 100) {
        msgBox.style.color = 'var(--accent-green)';
        msgBox.innerHTML = '<i class="ph-fill ph-check-circle"></i> 当前子项权重总和恰等于 100%，逻辑有效。';
    } else {
        msgBox.style.color = 'var(--accent-secondary)';
        msgBox.innerHTML = `<i class="ph-fill ph-warning-circle"></i> 警告: 当前子项权重总和为 <strong style="color: var(--text-primary); margin: 0 4px;">${sum}%</strong>，引擎要求分配比例总和应严格等于 100%。`;
    }
}

function buildTreeHtml(nodes, level = 0) {
    const statusIcon = { configured: '✅', incomplete: '⚠️', failed: '❌' };
    const typeIconMap = {
        'index': (level === 0) ? 'ph-circles-three-plus' : 'ph-tree-structure',
        'sub-index': 'ph-tree-structure',
        'leaf-ref': 'ph-link',
        'leaf-calc': 'ph-calculator',
        'data': 'ph-calculator'
    };

    let html = `<ul class="tree-list" style="${level > 0 ? 'padding-left: 18px;' : ''}">`;
    nodes.forEach(node => {
        const icon = typeIconMap[node.type] || 'ph-file-text';
        const hasChildren = node.children && node.children.length > 0;
        const expandIcon = hasChildren
            ? `<i class="ph ph-caret-down tree-expander"></i>`
            : `<span style="width:16px;display:inline-block;"></span>`;
        const hideStatus = state.setupMode === 'stepped' && state.steppedPhase === 1;
        const sIcon = hideStatus ? '' : (statusIcon[node.status] || '');
        const sTitle = hideStatus ? '' : ({ configured:'已配置', incomplete:'未完成', failed:'试算失败' }[node.status] || '');

        const actionHtml = (state.setupMode === 'stepped' && state.steppedPhase === 1) ? `
            <div class="tree-node-actions">
                ${['index','sub-index'].includes(node.type) ? `
                    <button class="node-action-btn" title="添加子节点" onclick="event.stopPropagation(); window.openAddMixedNodeModal('${node.id}')"><i class="ph ph-plus-circle"></i></button>
                ` : ''}
                <button class="node-action-btn" title="重命名" onclick="event.stopPropagation(); window.editNodeNameStepped('${node.id}')"><i class="ph ph-pencil-simple"></i></button>
                <button class="node-action-btn danger" title="删除当前项" onclick="event.stopPropagation(); window.deleteNodeStepped('${node.id}')"><i class="ph ph-trash"></i></button>
            </div>
        ` : '';

        html += `<li class="tree-node" data-id="${node.id}">
            <div class="tree-label" data-type="${node.type}" data-id="${node.id}" title="${node.text}">
                ${expandIcon}
                <i class="ph-fill ${icon} tree-icon"></i>
                <span class="tree-node-text">${node.text}</span>
                ${sIcon ? `<span class="tree-status-badge" title="${sTitle}">${sIcon}</span>` : ''}
                ${actionHtml}
            </div>`;
        if (hasChildren) {
            html += `<div class="tree-children">` + buildTreeHtml(node.children, level + 1) + `</div>`;
        }
        html += '</li>';
    });
    html += '</ul>';
    return html;
}

function renderResults(container) {
    let topScore = Math.floor(Math.random() * 20 + 75) + '.' + Math.floor(Math.random() * 10);
    const indicators = mockData.results.radarData.indicators;
    const values = mockData.results.radarData.values;
    
    let passCount = 0;
    let tableRows = '';
    indicators.forEach((ind, i) => {
        const val = values[i];
        if (val >= 0.7) passCount++;
        tableRows += `
            <tr>
                <td style="font-weight: 500; color: var(--text-primary);">${ind.name}</td>
                <td style="font-family: monospace; font-size: 1.1rem; color: var(--text-primary); font-weight: 600;">${val.toFixed(2)}</td>
                <td><span style="color: ${val >= 0.7 ? 'var(--accent-green)' : 'var(--accent-orange)'}; font-size: 0.9rem;"><i class="ph-fill ${val >= 0.7 ? 'ph-check-circle' : 'ph-warning'}"></i> ${val >= 0.7 ? '评价达标' : '需重点突破'}</span></td>
            </tr>
        `;
    });
    const passRate = ((passCount / indicators.length) * 100).toFixed(0);
    const displayTopScore = (parseFloat(topScore) / 100).toFixed(2);


    let html = `
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h2 class="section-title" style="margin: 0; font-size: 1.4rem;"><i class="ph-fill ph-chart-line-up"></i> 统计结果预览</h2>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">当前展示任务: <span style="color: var(--text-primary);">${state.currentTask.name}</span></p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-muted); background: var(--bg-panel); padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border-color);">
                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i> 本次计算最终完成于: <span style="color: var(--text-primary); font-family: monospace;">${new Date().toLocaleString('zh-CN', { hour12: false })}</span>
            </div>
        </div>
        
        <!-- Big Number Highlight -->
        <div class="glass" style="margin-bottom: 24px; padding: 32px 48px; border-radius: var(--radius-xl); border: 1px solid rgba(99,102,241,0.3); background: linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(22,25,37,0.4) 100%); display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; min-height: 180px;">
            <div style="position: absolute; right: -50px; bottom: -50px; font-size: 12rem; color: rgba(99,102,241,0.05);"><i class="ph-fill ph-target"></i></div>
            <div style="z-index: 1; display: flex; gap: 60px; align-items: flex-end;">
                <div>
                    <div style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-trophy" style="color: var(--accent-orange);"></i> 引擎推演总体达成度</div>
                    <div style="font-size: 4.8rem; font-weight: 800; color: var(--accent-primary); line-height: 1.1; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(99,102,241,0.4); padding-bottom: 4px;">
                        ${displayTopScore}
                    </div>
                </div>
                <div style="margin-bottom: 8px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 40px;">
                    <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: 8px;">综合达标率</div>
                    <div style="font-size: 2.2rem; font-weight: 700; color: var(--accent-cyan);">${passRate}<span style="font-size: 1.2rem; margin-left: 2px;">%</span></div>
                </div>
            </div>
            <div style="text-align: right; z-index: 1;">
                <button class="btn-primary" style="padding: 12px 24px; font-size: 1rem;"><i class="ph-fill ph-microsoft-excel-logo"></i> 导出达成数据明细</button>
            </div>
        </div>

        <div style="display: flex; gap: 24px; height: 100%;">
            <!-- Big Table Area -->
            <div style="flex: 2; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: 24px; display: flex; flex-direction: column;">
                <h3 class="section-title" style="margin-bottom: 16px;"><i class="ph-fill ph-table"></i> 核心考核维度成绩明细清册</h3>
                <div style="overflow-x: auto; flex: 1;">
                    <table class="data-table" style="width: 100%; min-width: 600px; border-radius: var(--radius-md); overflow: hidden;">
                        <thead>
                            <tr style="background: var(--bg-surface);">
                                <th style="padding: 16px; border-bottom: 1px solid var(--border-color);">考核维度名称</th>
                                <th style="padding: 16px; border-bottom: 1px solid var(--border-color);">达成度折算核准值</th>
                                <th style="padding: 16px; border-bottom: 1px solid var(--border-color);">当前状态系统判定</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- AI Area -->
            <div class="chart-card glass ai-card" style="flex: 1; margin: 0; min-height: 480px; display: flex; flex-direction: column;">
                <div class="ai-header" style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); margin: -24px -24px 20px -24px;">
                    <i class="ph-fill ph-sparkle"></i> AI 智能专家诊断报告
                </div>
                <div class="ai-content" style="flex: 1;">
                    <p style="font-size: 0.95rem; line-height: 1.6;">基于当前引擎挂载源数据的聚类分析，本期达成度整体表现评价级别评为 <strong style="color: var(--accent-cyan);">良好</strong>。</p>
                    <p style="font-size: 0.95rem; margin-top: 16px;">发现如下关联短板项需着重跟进：</p>
                    <ul style="padding-left: 20px; font-size: 0.9rem; line-height: 1.8; color: var(--text-secondary);">
                        <li><strong style="color:var(--text-primary);">研究能力 (70%)</strong>：相较于其他核心指标偏低了约20个百分点，算法建议在下学期的相关课程设计环节中强制增加自主探究性实验考察比例。</li>
                        <li><strong style="color:var(--text-primary);">问题分析 (78%)：</strong>处于临界值徘徊区间，建议增加横向拉通的综合性案例分析答卷环节。</li>
                    </ul>
                    <div style="margin-top: 24px; padding: 12px; background: rgba(99,102,241,0.05); border-left: 3px solid var(--accent-primary); font-size: 0.85rem; color: var(--text-secondary);">
                        <strong>趋势推演预测</strong>：若持续保持该运行态势与教学方法资源库，下期“团队协作”相关指标将稳定处于优势地带（置信区间 92%~98%）。
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function renderReports(container) {
    let html = `
        <div style="margin-bottom: 24px;">
            <h2 class="section-title" style="margin: 0; font-size: 1.4rem;"><i class="ph-fill ph-magic-wand"></i> AI分析与报告</h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">当前归属任务: <span style="color: var(--text-primary);">${state.currentTask.name}</span></p>
        </div>
        <div style="display: flex; gap: 24px; height: 100%;">
            <div style="flex: 2; display: flex; flex-direction: column;">
                <div class="card glass" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(22,25,37,0.8) 100%);">
                    <div>
                        <h2 class="section-title" style="margin: 0;"><i class="ph-fill ph-magic-wand"></i> AI 分析报告引擎</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">基于大语言模型自动生成深度分析与改进建议报告</p>
                    </div>
                    <button class="btn-primary"><i class="ph ph-plus"></i> 创建新报告模板</button>
                </div>
                
                <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-clock-counter-clockwise"></i> 历史生成报告</h3>
                <div class="report-list">
                    <div class="report-card glass">
                        <div class="report-info">
                            <div class="report-title"><i class="ph-fill ph-file-pdf" style="color: #ef4444;"></i> 2023-2024学年秋季学期软件工程专业达成度报告</div>
                            <div class="report-meta">
                                <span><i class="ph ph-calendar"></i> 2024-01-15 14:30</span>
                                <span><i class="ph ph-user"></i>由系统 AI 自动生成</span>
                                <span><i class="ph ph-file-text"></i>5 个图表模块, 2 个分析维度</span>
                            </div>
                        </div>
                        <div class="report-actions">
                            <button class="btn-icon" title="在线预览"><i class="ph ph-eye"></i></button>
                            <button class="btn-icon" title="下载 PDF"><i class="ph ph-download-simple"></i></button>
                        </div>
                    </div>
                    <div class="report-card glass">
                        <div class="report-info">
                            <div class="report-title"><i class="ph-fill ph-file-pdf" style="color: #ef4444;"></i> 2023年度科研指标完成情况简报</div>
                            <div class="report-meta">
                                <span><i class="ph ph-calendar"></i> 2023-12-20 09:15</span>
                                <span><i class="ph ph-user"></i>李老师 生成</span>
                            </div>
                        </div>
                        <div class="report-actions">
                            <button class="btn-icon" title="在线预览"><i class="ph ph-eye"></i></button>
                            <button class="btn-icon" title="下载 PDF"><i class="ph ph-download-simple"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-panel glass" style="flex: 1;">
                <h3 class="section-title" style="font-size: 1rem;"><i class="ph-fill ph-gear"></i> 快速生成报告设置</h3>
                
                <div class="form-group" style="margin-top: 16px;">
                    <label>关联任务</label>
                    <select class="form-control">
                        <option>2023-2024学年秋季学期计算机专业毕业要求达成度计算</option>
                        <option>2023年度教师科研考核达成统计</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>包含数据模块</label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; color: var(--text-primary);"><input type="checkbox" checked> 达成度雷达图与多维分析</label>
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; color: var(--text-primary);"><input type="checkbox" checked> 班级横向散点/柱状图对比</label>
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; color: var(--text-primary);"><input type="checkbox" checked> 原始统计指标明细表</label>
                    </div>
                </div>

                <div class="form-group">
                    <label>AI 分析偏好</label>
                    <select class="form-control">
                        <option>侧重发现短板与改进建议 (严格模式)</option>
                        <option>侧重整体情况与亮点总结 (汇报模式)</option>
                        <option>无 AI 分析，仅生成数据图表</option>
                    </select>
                </div>

                <button class="btn-primary" style="margin-top: auto; justify-content: center; padding: 12px;"><i class="ph ph-lightning"></i> 立即由 AI 生成</button>
            </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// ==========================================
// Cascade Selection Logic for Data Source Config
// ==========================================

window.sysCascadeState = {
    module: null,
    instanceId: null,
    instanceName: null
};

// Mock lookup data for the 4 core systems
const mockSysData = {
    course: [
        { id: 'c1', name: '软件工程导论' },
        { id: 'c2', name: '计算机网络' },
        { id: 'c3', name: '数据库原理' }
    ],
    exam: [
        { id: 'e1', name: '2023-2024第一学期期末机考' },
        { id: 'e2', name: 'C语言程序设计随堂测验' }
    ],
    eval: [
        { id: 'ev1', name: '学生互评-项目路演表现' },
        { id: 'ev2', name: '教师主观评价-平时答疑积极性' }
    ],
    form: [
        { id: 'f1', name: '大学生社会实践登记表(分数)' },
        { id: 'f2', name: '蓝桥杯等竞赛获奖认定申报表' }
    ]
};

window.resetSysCascade = function() {
    // V2 compatible reset: check existence before access
    const echo = document.getElementById('dtSelectionEcho');
    if (echo) echo.style.display = 'none';
    const stepD = document.getElementById('dtStepD');
    if (stepD) stepD.style.display = 'none';
    const search = document.getElementById('dtStepCSearch');
    if (search) search.value = '';
    
    if (typeof renderDtInstances === 'function') renderDtInstances('');
    
    // Safety check for cards
    const sysCard = document.getElementById('dtCard_sys');
    const uploadCard = document.getElementById('dtCard_upload');
    if (sysCard && uploadCard) {
        sysCard.style.borderColor = 'var(--accent-primary)';
        sysCard.style.background = 'rgba(99,102,241,0.05)';
        uploadCard.style.borderColor = 'var(--border-color)';
        uploadCard.style.background = 'transparent';
    }
};;

window.updateRadioCardStyles = function() {
    // Only applies if we have mini radio cards, but currently the main choices are .radio-card not .mini. So we'll select those too.
    document.querySelectorAll('.radio-card').forEach(card => card.classList.remove('selected'));
    const checked = document.querySelectorAll('.radio-card input:checked');
    checked.forEach(input => input.closest('.radio-card').classList.add('selected'));
}

window.onSysModuleChange = function(val) {
    window.sysCascadeState.module = val;
    window.sysCascadeState.instanceId = null;
    window.sysCascadeState.instanceName = null;
    
    updateRadioCardStyles();
    
    document.getElementById('sysInstanceStep').style.display = 'block';
    
    document.getElementById('sysInstanceSearch').value = '';
    renderSysInstanceList();
    updateSysEcho();
}

function renderSysInstanceList(filter = '') {
    const listDom = document.getElementById('sysInstanceList');
    const data = mockSysData[window.sysCascadeState.module] || [];
    
    const matched = data.filter(d => d.name.includes(filter));
    
    listDom.innerHTML = matched.map(d => `
        <div class="selectable-item ${window.sysCascadeState.instanceId === d.id ? 'selected' : ''}" onclick="onSysInstanceSelect('${d.id}', '${d.name}')">
            ${d.name}
        </div>
    `).join('');
    
    if(matched.length === 0) {
        listDom.innerHTML = `<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 0.85rem;">搜不到相关结果...</div>`;
    }
}

window.filterSysInstances = function() {
    renderSysInstanceList(document.getElementById('sysInstanceSearch').value.trim());
}

window.onSysInstanceSelect = function(id, name) {
    window.sysCascadeState.instanceId = id;
    window.sysCascadeState.instanceName = name;
    
    renderSysInstanceList(document.getElementById('sysInstanceSearch').value.trim());
    updateSysEcho();
}

function updateSysEcho() {
    const echoDom = document.getElementById('sysSelectionEcho');
    const parts = [];
    
    const modMap = {
        'course': '教务课程数据',
        'exam': '线上考试系统',
        'eval': '教学评价系统',
        'form': '动态系统表单'
    };
    
    if (window.sysCascadeState.module) {
        parts.push(modMap[window.sysCascadeState.module] || window.sysCascadeState.module);
    }
    if (window.sysCascadeState.instanceName) {
        parts.push(window.sysCascadeState.instanceName);
    } else {
        parts.push('正在选择实例...');
    }
    
    if(parts.length > 0) {
        echoDom.style.display = 'block';
        echoDom.innerHTML = `<div style="display:flex; align-items:center;"><i class="ph-fill ph-check-circle" style="font-size: 1.1rem; margin-right: 8px;"></i> <span style="color:var(--text-secondary); margin-right:4px;">已选定接入点:</span> <strong style="color: var(--accent-primary); letter-spacing: 0.5px;">${parts.join(' <span style="color:var(--border-color);margin:0 4px;">/</span> ')}</strong></div>`;
    } else {
        echoDom.style.display = 'none';
    }
}

window.confirmAddIndex = function() {
    const titleDom = document.querySelector('#addIndexModal .modal-body input[type="text"]');
    if (!titleDom || !titleDom.value.trim()) {
        alert('请填写维度名称！'); return;
    }
    const parentNode = findNodeById(mockData.rulesTree, state.currentRuleNodeId);
    if(parentNode) {
        if(!parentNode.children) parentNode.children = [];
        parentNode.children.push({
            id: 'i_' + Date.now(),
            text: titleDom.value.trim(),
            type: 'sub-index',
            method: 'avg'
        });
        alert('维度节点创建成功！');
        closeModal('addIndexModal');
        titleDom.value = '';
        renderRuleMainPanel(state.currentRuleNodeId);
        
        // Re-render tree if function exists globally
        if(typeof renderRuleTree === 'function') renderRuleTree();
    }
}


// ==========================================
// 新增辅助函数集合
// ==========================================

// --- 权重相关 ---
window.splitWeightEqually = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;

    if (node.children && node.children.length > 0) {
        const each = Math.floor(100 / node.children.length);
        const rem = 100 - each * node.children.length;
        node.children.forEach((c, i) => { c.weight = each + (i === 0 ? rem : 0); });
    } else if (node.dataItems && node.dataItems.length > 0) {
        let flatItems = [];
        const flatten = (arr) => { arr.forEach(i => { if (i.children) flatten(i.children); else flatItems.push(i); }); };
        flatten(node.dataItems);
        if (flatItems.length === 0) return;
        const each = Math.floor(100 / flatItems.length);
        const rem = 100 - each * flatItems.length;
        flatItems.forEach((c, i) => { c.weight = each + (i === 0 ? rem : 0); });
    } else {
        return;
    }
    
    renderRuleMainPanel(nodeId); 
    setTimeout(() => {
        updateFormulaPreview(nodeId);
        if (node.type === 'leaf-calc' && (node.method === 'weighted' || node.aggMethod === 'weighted')) {
            if (window.checkLeafWeightSum) window.checkLeafWeightSum(nodeId);
        }
    }, 50);
};

window.syncWeightInput = function(slider, inputId) {
    const inp = document.getElementById(inputId);
    if (inp) { inp.value = slider.value; checkWeightSum(); }
};

window.syncWeightSlider = function(input) {
    const sliders = document.querySelectorAll('.weight-slider');
    sliders.forEach(s => {
        const inp = document.getElementById('wi_' + s.dataset.id);
        if (inp === input) { s.value = input.value; }
    });
};

// --- 节点文字更新 ---
window.updateNodeText = function(nodeId, val) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) { node.text = val; refreshRuleTree(); }
};

// --- 保存节点（状态更新） ---
window.saveNodeConfig = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) {
        node.status = 'configured';
        refreshRuleTree();
        const sb = { configured:'✅ 已配置', incomplete:'⚠️ 未完成', failed:'❌ 试算失败' };
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;bottom:100px;right:32px;z-index:9999;padding:10px 20px;background:var(--accent-green);color:#fff;border-radius:var(--radius-md);font-size:0.9rem;box-shadow:0 4px 16px rgba(0,0,0,0.3);transition:opacity 0.4s;';
        flash.textContent = '✅ 配置已保存';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 400); }, 1800);
    }
};

// --- 删除节点 ---
window.deleteNode = function(nodeId) {
    if (!confirm('确定删除此节点及其所有子节点？')) return;
    const removeFrom = (nodes, id) => {
        const idx = nodes.findIndex(n => n.id === id);
        if (idx > -1) { nodes.splice(idx, 1); return true; }
        return nodes.some(n => n.children && removeFrom(n.children, id));
    };
    removeFrom(mockData.rulesTree, nodeId);
    state.currentRuleNodeId = null;
    refreshRuleTree();
    document.getElementById('ruleMainPanel').innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);flex-direction:column;gap:16px;"><i class="ph ph-hand-pointing" style="font-size:48px;opacity:0.4;"></i><p>请在左侧选择一个指标节点进行配置</p></div>';
};

// --- 叶子节点身份切换 ---
window.switchLeafType = function(nodeId, newType) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    node.type = newType;
    node.status = 'incomplete';
    if (newType === 'leaf-calc' && !node.dataItems) node.dataItems = [];
    if (newType === 'leaf-ref' && !node.refType) node.refType = 'external';
    renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
    refreshRuleTree();
};

// --- 引用型来源切换 ---
window.switchRefType = function(nodeId, refType) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) { node.refType = refType; renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50); }
};

// --- 移除引用指标 ---
window.removeRefIndicator = function(nodeId, refId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node && node.refIndicators) {
        node.refIndicators = node.refIndicators.filter(r => r.id !== refId);
        renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
    }
};

// --- 公式分级切换（计算型叶子） ---
window.switchFormulaLevel = function(nodeId, level, btn) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) node.formulaLevel = level;
    ['L1','L2','L3'].forEach(l => {
        const p = document.getElementById('flpanel_' + l);
        if (p) p.style.display = l === level ? 'block' : 'none';
    });
    btn.closest('.formula-tab-bar').querySelectorAll('.formula-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

// --- 公式 Tab 切换（中间节点 custom） ---
window.switchFormulaTab = function(btn, targetId) {
    document.querySelectorAll('.formula-panel').forEach(p => p.style.display = 'none');
    const t = document.getElementById(targetId);
    if (t) t.style.display = 'block';
    btn.closest('.formula-tab-bar').querySelectorAll('.formula-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

// --- 分组展开/折叠 ---
window.toggleGroup = function(groupId) {
    const body = document.getElementById('grp_' + groupId);
    const arrow = document.querySelector('.group-arrow-' + groupId);
    if (!body) return;
    const isCollapsed = body.style.display === 'none';
    body.style.display = isCollapsed ? '' : 'none';
    if (arrow) arrow.style.transform = isCollapsed ? '' : 'rotate(-90deg)';
};

// --- 删除数据项/分组 ---
window.deleteDataItem = function(nodeId, itemId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node || !node.dataItems) return;
    const removeItem = (arr, id) => {
        const idx = arr.findIndex(i => i.id === id);
        if (idx > -1) { arr.splice(idx, 1); return true; }
        return arr.some(i => i.children && removeItem(i.children, id));
    };
    removeItem(node.dataItems, itemId);
    renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
};

// --- 向分组追加数据项 ---
window.addItemToGroup = function(nodeId, groupId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node || !node.dataItems) return;
    const findGroup = (arr, id) => {
        for (let item of arr) {
            if (item.id === id) return item;
            if (item.children) { const f = findGroup(item.children, id); if (f) return f; }
        }
    };
    const group = findGroup(node.dataItems, groupId);
    if (!group) return;
    const name = prompt('请输入数据项名称：'); // will fix later with UI
    openAddDataItemModalV2(nodeId); return;
    if (!group.children) group.children = [];
    group.children.push({ id: 'di_' + Date.now(), type: 'item', text: name, weight: 0 });
    renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
};

// --- 新建分组 Modal ---
window.openCreateGroupModal = function(nodeId) {
    const name = prompt('请输入分组名称：'); // will fix later with UI
    openAddDataItemModalV2(nodeId); return;
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    if (!node.dataItems) node.dataItems = [];
    node.dataItems.push({
        id: 'grp_' + Date.now(),
        type: 'group',
        text: name,
        weight: 0,
        method: 'avg',
        collapsed: false,
        children: []
    });
    renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
};

// --- 添加数据项到根级 ---
window.openAddDataItemModal = function(nodeId, groupId) {
    // prompt removed
    openAddDataItemModalV2(nodeId); return;
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    if (!node.dataItems) node.dataItems = [];
    node.dataItems.push({ id: 'di_' + Date.now(), type: 'item', text: name, weight: 0 });
    renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
};

// --- 添加子指标 ---
window.editNodeNameStepped = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    const newName = prompt('修改当前节点名称：', node.text);
    if (newName && newName.trim()) {
        node.text = newName.trim();
        if (window.refreshRuleTree) window.refreshRuleTree();
    }
};

window.openAddMixedNodeModal = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    state.currentRuleNodeId = nodeId;
    
    openModal('addIndexModal');
    
    const header = document.querySelector('#addIndexModal h3');
    if(header) {
        header.innerHTML = '<i class="ph-fill ph-plus-circle" style="color:var(--accent-primary);"></i> 添加子节点';
    }
    
    const body = document.querySelector('#addIndexModal .modal-body');
    if (!body.dataset.originalHtml) {
        body.dataset.originalHtml = body.innerHTML;
    }
    
    body.innerHTML = `
        <div class="form-group" style="margin-bottom:24px;">
            <label style="font-size:1rem;font-weight:600;color:var(--text-primary);display:block;margin-bottom:12px;">第一步：选择节点业务类型</label>
            <div style="display:flex;gap:16px;">
                <label id="mixedTypeOption1" style="flex:1;display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:14px;border:2px solid var(--accent-primary);border-radius:12px;background:rgba(99,102,241,0.05);transition:all 0.2s;">
                    <input type="radio" name="mixedNodeType" value="sub-index" style="margin-top:2px;" checked onchange="window.updateMixedNodeForm()">
                    <div>
                        <div class="opt-title" style="font-weight:600;margin-bottom:4px;color:var(--accent-primary);">指标层级</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.4;">用于向下拆分更细维度的结构，不可直接计算考评成绩。</div>
                    </div>
                </label>
                <label id="mixedTypeOption2" style="flex:1;display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:14px;border:2px solid var(--border-color);border-radius:12px;transition:all 0.2s;">
                    <input type="radio" name="mixedNodeType" value="leaf-calc" style="margin-top:2px;" onchange="window.updateMixedNodeForm()">
                    <div>
                        <div class="opt-title" style="font-weight:600;margin-bottom:4px;color:var(--text-primary);">计算节点</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.4;">位于结构底层的原子节点，用于直插或换算最终数据得分。</div>
                    </div>
                </label>
            </div>
        </div>

        <div id="mixedNodeFormArea" style="animation:fadeIn 0.3s ease; border-top:1px dashed var(--border-color); padding-top:20px;">
            <div id="mixedNodeHint" style="background:rgba(99,102,241,0.06);border:1px dashed rgba(99,102,241,0.3);color:var(--accent-primary);padding:10px 14px;border-radius:8px;font-size:0.85rem;margin-bottom:16px;">
                <b><i class="ph-fill ph-info"></i> 操作提示：</b>此操作将添加一个可继续向下拓展拆分结构的<b>指标层级</b>。一旦确定，如果需要直插成绩数据需在该层级下继续添加节点。
            </div>
            <div class="form-group">
                <label id="mixedNodeNameLabel">指标层级名称</label>
                <input type="text" id="mixedNodeNameInput" class="form-control" placeholder="例如：平时成绩、综合素质考核等">
            </div>
            <div class="form-group">
                <label id="mixedNodeDescLabel">补充说明（选填）</label>
                <textarea id="mixedNodeDescInput" class="form-control" rows="2" placeholder="简要描述该维度考查的侧重点..."></textarea>
            </div>
        </div>
    `;

    window.updateMixedNodeForm = function() {
        const typeRadios = document.getElementsByName('mixedNodeType');
        let selectedType = 'sub-index';
        for (let r of typeRadios) { if(r.checked) selectedType = r.value; }
        
        const opt1 = document.getElementById('mixedTypeOption1');
        const opt2 = document.getElementById('mixedTypeOption2');
        if (selectedType === 'sub-index') {
            opt1.style.borderColor = 'var(--accent-primary)';
            opt1.style.background = 'rgba(99,102,241,0.05)';
            opt1.querySelector('.opt-title').style.color = 'var(--accent-primary)';
            opt2.style.borderColor = 'var(--border-color)';
            opt2.style.background = 'transparent';
            opt2.querySelector('.opt-title').style.color = 'var(--text-primary)';
            
            document.getElementById('mixedNodeHint').style.background = 'rgba(99,102,241,0.06)';
            document.getElementById('mixedNodeHint').style.borderColor = 'rgba(99,102,241,0.3)';
            document.getElementById('mixedNodeHint').style.color = 'var(--accent-primary)';
            document.getElementById('mixedNodeHint').innerHTML = '<b><i class="ph-fill ph-info"></i> 操作提示：</b>此操作将添加一个可继续向下拓展拆分结构的<b>指标层级</b>。一旦确定，如果需要直插成绩数据需在该层级下继续添加节点。';
            
            document.getElementById('mixedNodeNameLabel').textContent = '指标层级名称';
            document.getElementById('mixedNodeNameInput').placeholder = '例如：平时成绩、综合素质考核等';
        } else {
            opt2.style.borderColor = 'var(--accent-orange)';
            opt2.style.background = 'rgba(245,158,11,0.05)';
            opt2.querySelector('.opt-title').style.color = 'var(--accent-orange)';
            opt1.style.borderColor = 'var(--border-color)';
            opt1.style.background = 'transparent';
            opt1.querySelector('.opt-title').style.color = 'var(--text-primary)';
            
            document.getElementById('mixedNodeHint').style.background = 'rgba(245,158,11,0.06)';
            document.getElementById('mixedNodeHint').style.borderColor = 'rgba(245,158,11,0.3)';
            document.getElementById('mixedNodeHint').style.color = 'var(--accent-orange)';
            document.getElementById('mixedNodeHint').innerHTML = '<b><i class="ph-fill ph-info"></i> 操作提示：</b>此操作将添加一个不可拆分的<b>底层计算节点</b>。添加完毕后，系统将允许直接在配置面板里为它挂载考评数据并自由换算。';
            
            document.getElementById('mixedNodeNameLabel').textContent = '计算节点名称';
            document.getElementById('mixedNodeNameInput').placeholder = '例如：期末笔试卷面分、答辩结果等';
        }
    };

    const confirmBtn = document.querySelector('#addIndexModal .btn-primary');
    confirmBtn.onclick = function() {
        const input = document.getElementById('mixedNodeNameInput');
        const descInput = document.getElementById('mixedNodeDescInput');
        if (!input) { closeModal('addIndexModal'); return; }
        
        const name = input.value.trim();
        const desc = descInput ? descInput.value.trim() : '';
        if (!name) { alert('请输入名称'); return; }
        
        const typeRadios = document.getElementsByName('mixedNodeType');
        let selectedType = 'sub-index';
        for(let r of typeRadios) { if(r.checked) selectedType = r.value; }
        
        if (!node.children) node.children = [];
        
        if (selectedType === 'sub-index') {
            node.children.push({
                id: 'si_' + Date.now(),
                text: name,
                desc: desc,
                type: 'sub-index',
                method: 'avg',
                status: 'incomplete',
                weight: 0,
                children: []
            });
        } else {
            node.children.push({
                id: 'lf_' + Date.now(),
                text: name,
                desc: desc,
                type: 'leaf-calc',
                status: 'incomplete',
                weight: 0,
                dataItems: [],
                ruleConfig: { defaultScore: 0, customFormula: '' }
            });
        }
        
        closeModal('addIndexModal');
        if(window.refreshRuleTree) window.refreshRuleTree();
        if(state.setupMode === 'global' && window.renderRuleMainPanel) window.renderRuleMainPanel(nodeId);
    };
};

window.deleteNodeStepped = function(nodeId) {
    if (confirm('确定要删除该节点及其所有子节点吗？')) {
        const removeNode = (arr, id) => {
            const idx = arr.findIndex(n => n.id === id);
            if (idx > -1) { arr.splice(idx, 1); return true; }
            return arr.some(n => n.children && removeNode(n.children, id));
        };
        removeNode(mockData.rulesTree, nodeId);
        if (state.currentRuleNodeId === nodeId) state.currentRuleNodeId = null;
        if (window.refreshRuleTree) window.refreshRuleTree();
        
        // ensure main panel clears up if we're in Phase 1
        if (state.setupMode === 'stepped' && state.steppedPhase === 1) {
            document.querySelector('.nav-item[data-module="rules"]').click(); 
        }
    }
};

window.openAddChildModal = function(nodeId) {

    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    state.currentRuleNodeId = nodeId;
    // 使用已有的 addIndexModal，但不通过 prompt，而是让用户在弹窗输入
    openModal('addIndexModal');
    
    const header = document.querySelector('#addIndexModal h3');
    if(header) {
        header.innerHTML = '<i class="ph-fill ph-folder-plus" style="color:var(--accent-primary);"></i> 添加指标层级';
        let desc = document.getElementById('addIndexModalDesc');
        if (!desc) {
            desc = document.createElement('div');
            desc.id = 'addIndexModalDesc';
            desc.style.padding = '10px 14px';
            desc.style.borderRadius = '8px';
            desc.style.marginBottom = '16px';
            desc.style.fontSize = '0.85rem';
            const body = document.querySelector('#addIndexModal .modal-body');
            body.insertBefore(desc, body.firstChild);
        }
        desc.style.background = 'rgba(99,102,241,0.06)';
        desc.style.border = '1px dashed rgba(99,102,241,0.3)';
        desc.style.color = 'var(--accent-primary)';
        desc.innerHTML = '<b><i class="ph-fill ph-info"></i> 操作提示：</b>此操作将添加一个可继续拆分的<b>指标层级</b>，用于向下汇总得分。如果该节点为底层不再拆分，且要作为最终数据节点，请考虑添加“计算节点”。';
        desc.style.display = 'block';
        let rg = document.getElementById('addIndexModalRadioGroup');
        if(rg) rg.style.display = 'none';
    }

    // 修改确认按钮逻辑为动态绑定
    const confirmBtn = document.querySelector('#addIndexModal .btn-primary');
    confirmBtn.onclick = function() {
        const input = document.querySelector('#addIndexModal .form-control');
        const name = input.value.trim();
        if (!name) { alert('请输入名称'); return; }
        if (!node.children) node.children = [];
        node.children.push({
            id: 'si_' + Date.now(),
            text: name,
            type: 'sub-index',
            method: 'avg',
            status: 'incomplete',
            weight: 0,
            children: []
        });
        input.value = '';
        closeModal('addIndexModal');
        refreshRuleTree();
        renderRuleMainPanel(nodeId);
    };
};

// --- 添加叶子节点 ---
window.openAddLeafModal = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    state.currentRuleNodeId = nodeId;
    // 同样复用 addIndexModal，或者我们可以简单利用其布局
    openModal('addIndexModal');
    const header = document.querySelector('#addIndexModal h3');
    if(header) {
        header.innerHTML = '<i class="ph-fill ph-plus-circle" style="color:var(--accent-orange);"></i> 添加计算节点';
        let desc = document.getElementById('addIndexModalDesc');
        if (!desc) {
            desc = document.createElement('div');
            desc.id = 'addIndexModalDesc';
            desc.style.padding = '10px 14px';
            desc.style.borderRadius = '8px';
            desc.style.marginBottom = '16px';
            desc.style.fontSize = '0.85rem';
            const body = document.querySelector('#addIndexModal .modal-body');
            body.insertBefore(desc, body.firstChild);
        }
        desc.style.background = 'rgba(245,158,11,0.06)';
        desc.style.border = '1px dashed rgba(245,158,11,0.3)';
        desc.style.color = 'var(--accent-orange)';
        desc.innerHTML = '<b><i class="ph-fill ph-info"></i> 操作提示：</b>此操作将添加一个不可拆分的<b>底层计算节点</b>。添加后可直接赋予其权重比例和计算公式源。如果需要往下拆分结构，请添加“指标层级”。';
        desc.style.display = 'block';
        let rg = document.getElementById('addIndexModalRadioGroup');
        if(rg) rg.style.display = 'none';
    }
    
    const confirmBtn = document.querySelector('#addIndexModal .btn-primary');
    confirmBtn.onclick = function() {
        const input = document.querySelector('#addIndexModal .form-control');
        const name = input.value.trim();
        if (!name) { alert('请输入名称'); return; }
        if (!node.children) node.children = [];
        node.children.push({
            id: 'lf_' + Date.now(),
            text: name,
            type: 'leaf-calc',
            status: 'incomplete',
            weight: 0,
            dataItems: [],
            formulaLevel: 'L1',
            formulaTemplate: 'single'
        });
        input.value = '';
        closeModal('addIndexModal');
        refreshRuleTree();
        renderRuleMainPanel(nodeId);
    };
};

window.openAddIndexModal = function(parentId) {
    openModal('addIndexModal');
    const header = document.querySelector('#addIndexModal h3');
    if(header) header.innerHTML = '<i class="ph-fill ph-plus-circle" style="color:var(--accent-cyan);"></i> 新增一级指标';
    
    const body = document.querySelector('#addIndexModal .modal-body');
    if (body && body.dataset.originalHtml) {
        body.innerHTML = body.dataset.originalHtml;
    }
    
    const confirmBtn = document.querySelector('#addIndexModal .btn-primary');
    confirmBtn.onclick = function() {
        const formControls = document.querySelectorAll('#addIndexModal .modal-body .form-control');
        const input = formControls.length > 0 ? formControls[0] : null;
        const name = input ? input.value.trim() : '';
        if (!name) { alert('请输入名称'); return; }
        
        const newNode = {
            id: 'r_' + Date.now(),
            text: name,
            type: 'index',
            method: 'avg',
            status: 'incomplete',
            weight: 0,
            children: []
        };

        if (parentId === 'root') {
            mockData.rulesTree.push(newNode);
        } else {
            const parent = findNodeById(mockData.rulesTree, parentId);
            if (parent) {
                newNode.id = 'si_' + Date.now();
                newNode.type = 'sub-index';
                if (!parent.children) parent.children = [];
                parent.children.push(newNode);
            }
        }
        
        input.value = '';
        closeModal('addIndexModal');
        refreshRuleTree();
        if (parentId !== 'root') renderRuleMainPanel(parentId);
    };
};

// --- 一键默认规则 ---
window.applyDefaultRules = function() {
    if (!confirm('将所有中间节点设为「简单平均」，权重均分，叶子节点继承父节点筛选条件。确认？')) return;
    const applyDefaults = (nodes) => {
        nodes.forEach(node => {
            if (node.type === 'index' || node.type === 'sub-index') {
                node.method = 'avg';
                if (node.children && node.children.length > 0) {
                    const each = Math.floor(100 / node.children.length);
                    const rem = 100 - each * node.children.length;
                    node.children.forEach((c, i) => { c.weight = each + (i === 0 ? rem : 0); });
                    applyDefaults(node.children);
                }
            }
        });
    };
    applyDefaults(mockData.rulesTree);
    refreshRuleTree();
    if (state.currentRuleNodeId) renderRuleMainPanel(state.currentRuleNodeId);
    alert('✅ 已一键应用默认规则！');
};

// --- 试算功能 ---
window.runTrialCalc = function(scope) {
    const area = document.getElementById('trialResultArea');
    if (!area) return;
    area.innerHTML = `<span style="color:var(--text-muted);font-size:0.85rem;"><i class="ph ph-spinner" style="animation:spin 1s linear infinite;"></i> 正在全局试算...</span>`;
    
    setTimeout(() => {
        const scores = mockData.rulesTree.map(n => `${n.text.slice(0,8)}…: ${(60+Math.random()*35).toFixed(1)}`);
        const total = (65 + Math.random() * 25).toFixed(1);
        area.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;font-size:0.82rem;flex-wrap:wrap;">
                ${scores.map(s => `<span style="color:var(--text-secondary);">${s}</span>`).join('')}
                <span style="color:var(--accent-green);font-weight:700;font-size:0.95rem;">综合达成度: ${total}</span>
            </div>`;
    }, 900);
};

// --- 单节点深度试算 ---
window.runSingleNodeTrial = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    
    document.getElementById('singleNodeTrialModal').style.display = 'flex';
    const content = document.getElementById('singleNodeTrialContent');
    content.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;gap:16px;">
        <i class="ph ph-spinner" style="font-size:2rem;color:var(--accent-cyan);animation:spin 1s linear infinite;"></i>
        <span style="color:var(--text-secondary);">正在试算...</span>
    </div>`;
    
    setTimeout(() => {
        const score = (60 + Math.random() * 35).toFixed(1);
        const threshold = node.threshold || 60;
        const passed = parseFloat(score) >= threshold;
        const resultColor = passed ? 'var(--accent-green)' : 'var(--accent-secondary)';
        
        // 缺考孤岛模拟
        const missingCount = Math.floor(Math.random() * 5);
        const missingHtml = missingCount > 0 ? `
            <div style="margin-top:16px;padding:12px 16px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-md);">
                <div style="color:var(--accent-secondary);font-weight:600;display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-warning-circle"></i> 缺考预警：发现 ${missingCount} 名学生缺失底层数据项成绩</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">
                    数据源：${node.text} 关联的数据集存在记录缺失。<br>
                    <strong>处理建议：</strong>请返回左侧导航的「统计对象管理」补充成绩记录。
                </div>
            </div>
        ` : `
            <div style="margin-top:16px;padding:12px 16px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:var(--radius-md);">
                <div style="color:var(--accent-green);font-weight:600;display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-check-circle"></i> 数据完备无缺失</div>
            </div>
        `;
        
        // 低分过滤列表模拟
        const lowStuCount = Math.floor(Math.random() * 4) + 1;
        let pList = '';
        for(let i=0; i<lowStuCount; i++) {
            const sc = (Math.random()*threshold).toFixed(1);
            pList += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:0.85rem;color:var(--text-primary);width:80px;">学号: 202${Math.floor(Math.random()*10000)}</span>
                    <span style="font-size:0.85rem;color:var(--accent-secondary);font-weight:600;">得分: ${sc}</span>
                </div>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-muted);cursor:pointer;">
                    <input type="checkbox" checked style="width:14px;height:14px;accent-color:var(--accent-orange);"> 勾选此学生
                </label>
            </div>`;
        }

        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div>
                    <div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">节点名称</div>
                    <div style="font-weight:600;font-size:1.15rem;color:var(--text-primary);">${node.text}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">试算结果 (标准阈值: ${threshold})</div>
                    <div style="font-weight:700;font-size:2rem;color:${resultColor};display:flex;align-items:center;gap:8px;">
                        ${score} ${passed ? '<i class="ph-fill ph-check-circle" style="font-size:1.2rem;"></i>' : '<i class="ph-fill ph-warning-circle" style="font-size:1.2rem;"></i>'}
                    </div>
                </div>
            </div>
            
            <h4 style="margin:24px 0 12px 0;font-size:0.95rem;color:var(--text-primary);display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-database"></i> 异常学生数据以及分析</h4>
            ${missingHtml}
            
            <div style="margin-top:24px;border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg-card);">
                <div style="padding:12px 16px;background:var(--bg-surface);border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:600;font-size:0.9rem;color:var(--text-primary);display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-trend-down" style="color:var(--accent-orange);"></i> 数据异常学生清单</span>
                    <span style="font-size:0.8rem;color:var(--text-muted);">支持勾选学生</span>
                </div>
                <div style="padding:8px 16px;">
                    ${pList}
                    <div style="display:flex;justify-content:flex-end;align-items:center;gap:12px;padding-top:16px;margin-top:8px;border-top:1px solid var(--border-color);">
                        <button onclick="document.getElementById('singleNodeTrialModal').style.display='none'" style="padding:6px 16px;border:1px solid var(--border-color);border-radius:var(--radius-md);background:transparent;color:var(--text-primary);cursor:pointer;font-size:0.85rem;">取消</button>
                        <button class="btn-primary" style="padding:6px 16px;font-size:0.85rem;border-radius:var(--radius-md);box-shadow:0 4px 12px rgba(99,102,241,0.2);" onclick="alert('执行完毕，所选异常学生数据已被移除。'); document.getElementById('singleNodeTrialModal').style.display='none';">移除所选学生</button>
                    </div>
                </div>
            </div>
        `;
    }, 1500);
};

// --- 全局深度试算 ---
window.runGlobalTrialModal = function() {
    document.getElementById('globalTrialModal').style.display = 'flex';
    const content = document.getElementById('globalTrialContent');
    content.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;gap:16px;">
        <i class="ph ph-spinner" style="font-size:2.5rem;color:var(--accent-primary);animation:spin 1s linear infinite;"></i>
        <span style="color:var(--text-secondary);font-size:1.05rem;">正在执行全盘指标拓扑遍历计算与底层数据巡检...</span>
    </div>`;
    
    setTimeout(() => {
        const totalScore = (65 + Math.random() * 25).toFixed(1);
        const globalThreshold = parseFloat(document.getElementById('rootGlobalThreshold')?.value || 60);
        const passed = parseFloat(totalScore) >= globalThreshold;
        const resultColor = passed ? 'var(--accent-green)' : 'var(--accent-secondary)';
        
        // 缺考孤岛模拟 (全局)
        const missingCount = Math.floor(Math.random() * 12);
        const missingHtml = missingCount > 0 ? `
            <div style="margin-top:16px;padding:12px 16px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-md);">
                <div style="color:var(--accent-secondary);font-weight:600;display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-warning-circle"></i> 全局数据源缺席预警：发现 ${missingCount} 名学生存在关键核心数据缺失</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">
                    受影响的考核点：通常分布于【实验成绩】、【教务系统-期末互评】等子域。<br>
                    <strong>处理建议：</strong>请前往「统计对象管理」补充上述人员信息，或继续执行将会采用“视同放弃/按零分统计”的兜底降级策略。
                </div>
            </div>
        ` : `
            <div style="margin-top:16px;padding:12px 16px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:var(--radius-md);">
                <div style="color:var(--accent-green);font-weight:600;display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-check-circle"></i> 全局考核数据图谱完备率 100%</div>
            </div>
        `;
        
        // 极值分布
        const lowStuCount = Math.floor(Math.random() * 8) + 2;
        let pList = '';
        for(let i=0; i<lowStuCount; i++) {
            const sc = (Math.random()*globalThreshold).toFixed(1);
            pList += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:0.85rem;color:var(--text-primary);width:80px;">学号: 202${Math.floor(Math.random()*10000)}</span>
                    <span style="font-size:0.85rem;color:var(--accent-secondary);font-weight:600;">总评落地: ${sc}</span>
                </div>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-muted);cursor:pointer;">
                    <input type="checkbox" checked style="width:14px;height:14px;accent-color:var(--accent-orange);"> 放逐此孤立低分样本
                </label>
            </div>`;
        }

        // 核心子指标分布
        const scores = mockData.rulesTree.map(n => `
            <div style="background:var(--bg-surface);border:1px solid var(--border-color);padding:10px 14px;border-radius:8px;display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px;">
                <span style="font-size:0.85rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${n.text}">${n.text}</span>
                <span style="font-weight:600;font-size:1.1rem;color:var(--text-primary);">${(60+Math.random()*35).toFixed(1)}</span>
            </div>
        `).join('');

        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div>
                    <div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">参与核算一级指标数</div>
                    <div style="font-weight:600;font-size:1.15rem;color:var(--text-primary);">${mockData.rulesTree.length} 个基座节点</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:4px;">全盘总评达成度试算均值 (标准通用阈值: ${globalThreshold})</div>
                    <div style="font-weight:700;font-size:2.2rem;color:${resultColor};display:flex;align-items:center;gap:8px;">
                        ${totalScore} ${passed ? '<i class="ph-fill ph-check-circle" style="font-size:1.4rem;"></i>' : '<i class="ph-fill ph-warning-circle" style="font-size:1.4rem;"></i>'}
                    </div>
                </div>
            </div>
            
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
                ${scores}
            </div>
            
            <h4 style="margin:20px 0 12px 0;font-size:0.95rem;color:var(--text-primary);display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-shield-check"></i> 全局数据清洗与诊断层</h4>
            ${missingHtml}
            
            <div style="margin-top:24px;border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg-card);">
                <div style="padding:12px 16px;background:var(--bg-surface);border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:600;font-size:0.9rem;color:var(--text-primary);display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-trend-down" style="color:var(--accent-orange);"></i> 失效预警：全局拖拽底盘的极值学生名单</span>
                    <span style="font-size:0.8rem;color:var(--text-muted);">已拦截 ${lowStuCount} 人</span>
                </div>
                <div style="padding:8px 16px;">
                    ${pList}
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;margin-top:8px;">
                        <span style="font-size:0.8rem;color:var(--text-muted);">* 选择剔除后，系统全局重算此引擎时将自动对上述名单实施软删除（不改变数据底层）。</span>
                        <button class="btn-primary" style="padding:6px 16px;font-size:0.85rem;border-radius:6px;box-shadow:0 4px 12px rgba(99,102,241,0.2);" onclick="alert('执行完毕，全局异常名单已被清洗并剥离统计底池。'); document.getElementById('globalTrialModal').style.display='none';"><i class="ph ph-magic-wand"></i> 全局清洗并重新试算</button>
                    </div>
                </div>
            </div>
        `;
    }, 2000);
};

// --- 指标选择器弹窗 ---
window.openIndicatorPicker = function(nodeId) {
    const modal = document.getElementById('indicatorPickerModal');
    if (!modal) { _buildIndicatorPickerModal(nodeId); return; }
    modal.dataset.targetNodeId = nodeId;
    modal.style.display = 'flex';
    _renderIndicatorPickerList(nodeId);
};

function _buildIndicatorPickerModal(nodeId) {
    const d = document.createElement('div');
    d.id = 'indicatorPickerModal';
    d.dataset.targetNodeId = nodeId;
    d.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;';
    d.innerHTML = `
        <div style="width:560px;max-width:90vw;background:var(--bg-surface);border:1px solid var(--border-highlight);border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
            <div style="padding:20px 24px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;display:flex;align-items:center;gap:8px;"><i class="ph-fill ph-graph" style="color:var(--accent-primary);"></i> 选择引用指标</h3>
                <button class="icon-btn" onclick="document.getElementById('indicatorPickerModal').style.display='none'"><i class="ph ph-x"></i></button>
            </div>
            <div style="padding:20px 24px;max-height:50vh;overflow-y:auto;" id="indicatorPickerList"></div>
            <div style="padding:16px 24px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-panel);">
                <button class="btn-icon" style="border:1px solid var(--border-color);padding:6px 16px;border-radius:var(--radius-md);" onclick="document.getElementById('indicatorPickerModal').style.display='none'">取消</button>
                <button class="btn-primary" onclick="_confirmPickedIndicators()"><i class="ph ph-check"></i> 确认添加</button>
            </div>
        </div>`;
    document.body.appendChild(d);
    _renderIndicatorPickerList(nodeId);
}

window._pickedIndicators = {};
function _renderIndicatorPickerList(nodeId) {
    window._pickedIndicators = {};
    const list = document.getElementById('indicatorPickerList');
    if (!list) return;
    const targetNode = findNodeById(mockData.rulesTree, nodeId);
    const existingIds = new Set((targetNode?.refIndicators || []).map(r => r.id));
    const rows = mockData.rulesTree.filter(n => n.id !== nodeId && !existingIds.has(n.id)).map(n => `
        <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-md);cursor:pointer;border:1px solid var(--border-color);margin-bottom:8px;background:var(--bg-panel);">
            <input type="checkbox" value="${n.id}" data-name="${n.text}" style="width:16px;height:16px;" onchange="_onPickIndicator(this)">
            <div>
                <div style="font-weight:500;">${n.text}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">状态: ${{ configured:'✅已配置', incomplete:'⚠️未完成', failed:'❌失败'}[n.status]||'—'}</div>
            </div>
        </label>`).join('');
    list.innerHTML = rows || '<p style="color:var(--text-muted);text-align:center;">暂无可引用的指标</p>';
}

window._onPickIndicator = function(cb) {
    if (cb.checked) { window._pickedIndicators[cb.value] = cb.dataset.name; }
    else { delete window._pickedIndicators[cb.value]; }
};

window._confirmPickedIndicators = function() {
    const modal = document.getElementById('indicatorPickerModal');
    const nodeId = modal.dataset.targetNodeId;
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    if (!node.refIndicators) node.refIndicators = [];
    Object.entries(window._pickedIndicators).forEach(([id, name]) => {
        if (!node.refIndicators.find(r => r.id === id)) {
            node.refIndicators.push({ id, name, weight: 0 });
        }
    });
    modal.style.display = 'none';
    renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50);
};

// updateParentMethod 原有函数升级（支持新 method 值）
window.updateParentMethod = function(nodeId, method) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) { node.method = method; renderRuleMainPanel(nodeId); setTimeout(() => updateFormulaPreview(nodeId), 50); }
};

// CSS spin keyframe (for trial calc loading)
if (!document.getElementById('newStyleSheet')) {
    const st = document.createElement('style');
    st.id = 'newStyleSheet';
    st.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        .tree-node-text { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0; }
        .tree-status-badge { font-size:0.75rem; flex-shrink:0; margin-left:2px; }
        .tree-label { display:flex; align-items:center; gap:4px; overflow:hidden; }
        .trial-calc-bar { display:flex; align-items:center; gap:16px; padding:10px 20px; border-top:1px solid var(--border-color); background:var(--bg-card); border-radius:0 0 var(--radius-lg) var(--radius-lg); flex-shrink:0; min-height:52px; }
        .formula-levels { background:var(--bg-panel); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-color); }
        .formula-tab-bar { display:flex; gap:6px; margin-bottom:10px; }
        .formula-tab { padding:4px 12px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:transparent; color:var(--text-secondary); cursor:pointer; font-size:0.82rem; }
        .formula-tab.active { background:var(--accent-primary); color:#fff; border-color:var(--accent-primary); }
        .formula-input { font-family: monospace; background:rgba(6,182,212,0.04); border-color:var(--accent-cyan) !important; }
        .data-group-card { transition:box-shadow 0.2s; }
        .data-group-card:hover { box-shadow:0 2px 8px rgba(99,102,241,0.15); }

        /* Setup Mode Toggle Styles */
        .setup-mode-toggle { display:inline-flex; background:rgba(99,102,241,0.06); border:1px solid var(--border-color); border-radius:30px; padding:3px; gap:2px; margin-left:16px; }
        .mode-btn { border:none; background:transparent; padding:4px 14px; border-radius:20px; font-size:0.8rem; cursor:pointer; color:var(--text-muted); transition:all 0.2s; }
        .mode-btn.active { background:var(--accent-primary); color:#fff; box-shadow:0 2px 6px rgba(99,102,241,0.3); }
        .mode-btn:hover:not(.active) { background:rgba(99,102,241,0.1); color:var(--text-primary); }

        /* Tree Action Buttons (Phase 1) */
        .tree-node-actions { display:none; align-items:center; gap:6px; margin-left:auto; padding-right:8px; }
        .tree-node:hover .tree-node-actions { display:flex; }
        .node-action-btn { background:transparent; border:none; padding:2px; cursor:pointer; color:var(--text-muted); transition:color 0.2s; border-radius:4px; display:flex; align-items:center; justify-content:center; }
        .node-action-btn:hover { color:var(--accent-primary); background:rgba(99,102,241,0.1); }
        .node-action-btn.danger:hover { color:var(--accent-secondary); background:rgba(239,68,68,0.1); }
        
        /* Stepped Phase Header */
        .stepped-header { display:flex; align-items:center; gap:20px; padding:12px 20px; background:rgba(99,102,241,0.03); border-radius:var(--radius-md); border:1px dashed var(--accent-primary); margin-bottom:16px; }
        .phase-step { display:flex; align-items:center; gap:8px; opacity:0.5; font-weight:500; font-size:0.9rem; }
        .phase-step.active { opacity:1; color:var(--accent-primary); }
        .phase-step.done { opacity:1; color:var(--accent-green); }
        .phase-num { width:20px; height:20px; border-radius:50%; background:currentColor; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; }
    `;
    document.head.appendChild(st);
}


// ──────────────────────────────────────────
// V2: Root Rule Apply
// ──────────────────────────────────────────
window.openRootRuleModal = function() {
    openModal('rootRuleModal');
    // Check if any root nodes are weighted to set initial radio
    const isAnyWeighted = mockData.rulesTree.some(n => n.method === 'weighted-avg' || n.method === 'weighted');
    const method = isAnyWeighted ? 'weighted' : 'avg';
    
    const radio = document.querySelector(`input[name="rootRuleMethod"][value="${method}"]`);
    if (radio) {
        radio.checked = true;
        setRootRulePreview(method);
    }
    buildRootWeightPanel();
};

window.applyRootRule = function() {
    const method = document.querySelector('input[name="rootRuleMethod"]:checked').value;
    const threshInp = document.getElementById('rootGlobalThreshold');
    const globalThresh = threshInp ? (parseFloat(threshInp.value) || 60) : 60;

    if (method === 'weighted') {
        // Save weights from inputs before applying
        mockData.rulesTree.forEach(n => {
            const inp = document.getElementById('rrw_'+n.id);
            if (inp) n.weight = parseFloat(inp.value)||0;
            n.method = 'weighted-avg'; // Use standard terminology
            n.threshold = globalThresh;
        });
    } else {
        mockData.rulesTree.forEach(n => { 
            n.method = method; 
            n.threshold = globalThresh;
        });
    }
    closeModal('rootRuleModal');
    refreshRuleTree();
    if (state.currentRuleNodeId) renderRuleMainPanel(state.currentRuleNodeId);
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;bottom:100px;right:32px;z-index:9999;padding:10px 20px;background:var(--accent-cyan);color:#fff;border-radius:var(--radius-md);font-size:0.9rem;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
    flash.textContent = '✅ 一级指标计算规则已应用';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity='0'; flash.style.transition='opacity 0.4s'; setTimeout(()=>flash.remove(),400); }, 1800);
};

// Show/hide root weight panel when radio changes
window.setRootRulePreview = function(method) {
    const panel = document.getElementById('rrWeightPanel');
    if (!panel) return;
    panel.style.display = method === 'weighted' ? 'block' : 'none';
};

// Build root weight panel content
function buildRootWeightPanel() {
    const rows = mockData.rulesTree.map(n => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color);">
            <span style="flex:1;font-size:0.9rem;color:var(--text-primary);">${n.text}</span>
            <div style="display:flex;align-items:center;gap:6px;">
                <input type="range" min="0" max="100" value="${n.weight||0}" style="width:80px;" oninput="document.getElementById('rrw_${n.id}').value=this.value;checkRootWeightSum()">
                <input type="number" id="rrw_${n.id}" value="${n.weight||0}" style="width:52px;padding:3px 6px;font-size:0.82rem;" class="form-control" oninput="checkRootWeightSum()">
                <span style="color:var(--text-muted);font-size:0.82rem;">%</span>
            </div>
        </div>`).join('');
    const panel = document.getElementById('rrWeightPanel');
    if (panel) {
        panel.innerHTML = `
            <div style="margin-top:14px;padding:14px;background:var(--bg-panel);border-radius:var(--radius-md);border:1px solid var(--border-color);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <label style="font-size:0.88rem;font-weight:500;margin:0;">各一级指标权重设置</label>
                    <button onclick="splitRootWeightEqually()" style="font-size:0.78rem;padding:3px 10px;border:1px solid var(--accent-cyan);border-radius:12px;background:transparent;color:var(--accent-cyan);cursor:pointer;">平均分配</button>
                </div>
                ${rows}
                <div id="rootWeightMsg" style="margin-top:8px;font-size:0.82rem;display:flex;align-items:center;gap:5px;"></div>
            </div>`;
        checkRootWeightSum();
    }
}

window.checkRootWeightSum = function() {
    const inputs = document.querySelectorAll('[id^="rrw_"]');
    const sum = Array.from(inputs).reduce((a,i) => a+(parseFloat(i.value)||0), 0);
    const msg = document.getElementById('rootWeightMsg');
    if (!msg) return;
    if (Math.abs(sum-100) < 0.01) {
        msg.style.color='var(--accent-green)';
        msg.innerHTML='<i class="ph-fill ph-check-circle"></i> 权重总和 100%，配置有效';
    } else {
        msg.style.color='var(--accent-secondary)';
        msg.innerHTML=`<i class="ph-fill ph-warning-circle"></i> 当前总和 <strong>${sum}%</strong>，需等于 100%`;
    }
};

window.splitRootWeightEqually = function() {
    const n = mockData.rulesTree.length;
    if (!n) return;
    const each = Math.floor(100/n);
    const rem = 100 - each*n;
    mockData.rulesTree.forEach((node, i) => {
        const v = each + (i===0?rem:0);
        const inp = document.getElementById('rrw_'+node.id);
        if (inp) inp.value = v;
    });
    checkRootWeightSum();
};

// ──────────────────────────────────────────
// V2: Add Student Modal Logic
// ──────────────────────────────────────────
window.switchAddStTab = function(tab) {
    document.getElementById('addStPane1').style.display = tab===1 ? 'block' : 'none';
    document.getElementById('addStPane2').style.display = tab===2 ? 'block' : 'none';
    document.getElementById('addStTab1').style.borderBottom = tab===1 ? '2px solid var(--accent-primary)' : '2px solid transparent';
    document.getElementById('addStTab2').style.borderBottom = tab===2 ? '2px solid var(--accent-primary)' : '2px solid transparent';
    document.getElementById('addStTab1').style.color = tab===1 ? 'var(--accent-primary)' : 'var(--text-secondary)';
    document.getElementById('addStTab2').style.color = tab===2 ? 'var(--accent-primary)' : 'var(--text-secondary)';
    document.getElementById('addStTab1').style.fontWeight = tab===1 ? '600' : '400';
    document.getElementById('addStTab2').style.fontWeight = tab===2 ? '600' : '400';
    if (tab===2) renderStudentLib('');
};

window.filterStudentLib = function(input) { renderStudentLib(input.value.trim()); };

function renderStudentLib(filter) {
    const list = document.getElementById('studentLibList');
    if (!list) return;
    const matched = (mockData.studentLibrary||[]).filter(s => s.name.includes(filter)||s.id.includes(filter));
    list.innerHTML = matched.map(s => `
        <div class="selectable-item" onclick="selectStudentFromLib('${s.id}','${s.name}','${s.phone}')" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
            <div><div style="font-weight:500;font-size:0.9rem;">${s.name}</div><div style="font-size:0.78rem;color:var(--text-muted);">${s.id} · ${s.grade} ${s.class}</div></div>
            <span style="font-size:0.8rem;color:var(--text-muted);">${s.phone}</span>
        </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem;">未找到匹配学生</div>';
}

let _libSelectedStudent = null;
window.selectStudentFromLib = function(id, name, phone) {
    _libSelectedStudent = { id, name, phone };
    document.querySelectorAll('#studentLibList .selectable-item').forEach(el => el.style.background='');
    event.currentTarget.style.background = 'rgba(99,102,241,0.08)';
};

window.confirmAddStudent = function() {
    const pane1 = document.getElementById('addStPane1');
    if (pane1.style.display !== 'none') {
        const name = document.getElementById('newStName').value.trim();
        const phone = document.getElementById('newStPhone').value.trim();
        if (!name) { alert('请输入学生姓名'); return; }
        const grade = document.getElementById('newStGrade').value.trim() || '未知年级';
        const cls = document.getElementById('newStClass').value.trim() || '未知班级';
        const targetPool = state.currentTask.status === 'pending_config' ? 'empty' : 'default';
        mockData.objects[targetPool].students.unshift({ id: 'S'+Date.now(), name, grade, major:'—', class:cls, phone: phone||'未填写' });
    } else {
        if (!_libSelectedStudent) { alert('请先从学生库中选择一名学生'); return; }
        const { id, name, phone } = _libSelectedStudent;
        const targetPool = state.currentTask.status === 'pending_config' ? 'empty' : 'default';
        mockData.objects[targetPool].students.unshift({ id, name, grade:'—', major:'—', class:'—', phone });
        _libSelectedStudent = null;
    }
    closeModal('addStudentModal');
    renderModule('objects');
};

window.handleImportDrop = function(e) {
    e.preventDefault();
    document.getElementById('importDropZone').style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file) { const el = document.getElementById('importFileName'); el.style.display='flex'; el.textContent='✓ 已选择: '+file.name; }
};

window.handleImportFile = function(input) {
    if (input.files.length) { const el = document.getElementById('importFileName'); el.style.display='flex'; el.textContent='✓ 已选择: '+input.files[0].name; }
};

// ──────────────────────────────────────────
// V2: Add Data Item Modal Logic
// ──────────────────────────────────────────
// V2: all platforms use course list at step 3, activities at step 4
const _dtMockCourses = [
    {id:'c1',name:'面向对象程序设计'},{id:'c2',name:'数据结构与算法'},
    {id:'c3',name:'计算机网络'},{id:'c4',name:'操作系统原理'},{id:'c5',name:'数据库原理与应用'}
];
const _dtMockForms = [
    {id:'f1',name:'毕业生离校满意度问卷'},{id:'f2',name:'教师课堂教学质量评价表'},
    {id:'f3',name:'企业导师评价单'},{id:'f4',name:'第二课堂参与度申报表'}
];
const _dtMockHubTables = [
    {id:'h1',name:'教务主库成绩宽表(dws_jw_score)'},{id:'h2',name:'学工系统荣誉表(ods_xg_honor)'},
    {id:'h3',name:'图书馆借阅统计表(ads_lib_read)'},{id:'h4',name:'科研成果明细表(dwd_ky_achieve)'}
];
const _dtMockActivities = {
    course: [
        {id:'a1',name:'2023-2024第一次平时作业',type:'作业'},
        {id:'a2',name:'2023-2024第二次平时作业',type:'作业'},
        {id:'a3',name:'期中测验',type:'考试'},
        {id:'a4',name:'期末综合考试',type:'考试'},
        {id:'a5',name:'课程学习报告',type:'学习任务'},
        {id:'a6',name:'课程讨论区参与',type:'学习任务'},
        {id:'a7',name:'视频观看总时长',type:'学习任务'},
        {id:'a8',name:'随堂在线测验平均分',type:'测验'},
        {id:'a9',name:'互动问答区被点赞数',type:'学习任务'},
        {id:'a10',name:'期中课程设计大作业',type:'作业'}
    ],
    exam: [
        {id:'e1',name:'2024年春季期末机考',type:'考试'},
        {id:'e2',name:'C语言随堂测验A卷',type:'考试'},
        {id:'e3',name:'软件工程综合测评',type:'考试'}
    ],
    eval: [
        {id:'ev1',name:'学生互评—路演表现',type:'互评'},
        {id:'ev2',name:'教师主观评—答疑积极性',type:'教师评价'},
        {id:'ev3',name:'小组协作能力综合评价',type:'互评'}
    ],
    form: [
        {id:'f_a1',name:'问卷总得分',type:'系统表单'},
        {id:'f_a2',name:'单项选择题得分比例',type:'系统表单'},
        {id:'f_a3',name:'主观题AI评判分',type:'系统表单'}
    ],
    hub: [
        {id:'h_a1',name:'折算后最终成绩（score_final）',type:'数据中台'},
        {id:'h_a2',name:'考勤扣分（penalty_attend）',type:'数据中台'},
        {id:'h_a3',name:'奖项等级赋分（honor_level_score）',type:'数据中台'},
        {id:'h_a4',name:'文献阅读量基数（read_count）',type:'数据中台'}
    ]
};
const _dtMockData = { course: _dtMockCourses, exam: _dtMockCourses, eval: _dtMockCourses, form: _dtMockForms, hub: _dtMockHubTables };
let _dtState = { type:'system', plat:'course', instanceId:null, instanceName:null, selectedActivities: [], nodeId: null };

window.openAddDataItemModalV2 = function(nodeId) {
    _dtState = { type:'system', plat:'course', instanceId:null, instanceName:null, selectedActivities: [], nodeId };
    openModal('addDataModal');
    renderDtInstances('');
    updateDtEcho();
};

window.selectDataType = function(type) {
    _dtState.type = type;
    _dtState.instanceId = null; _dtState.instanceName = null;
    document.getElementById('dtCard_sys').style.borderColor = type==='system' ? 'var(--accent-primary)' : 'var(--border-color)';
    document.getElementById('dtCard_sys').style.background = type==='system' ? 'rgba(99,102,241,0.05)' : 'transparent';
    document.getElementById('dtCard_upload').style.borderColor = type==='upload' ? 'var(--accent-primary)' : 'var(--border-color)';
    document.getElementById('dtCard_upload').style.background = type==='upload' ? 'rgba(99,102,241,0.05)' : 'transparent';
    document.getElementById('dtUploadZone').style.display = type==='upload' ? 'block' : 'none';
    document.getElementById('dtSystemCascade').style.display = type==='system' ? 'block' : 'none';
    updateDtEcho();
};

window.selectDataPlat = function(btn, plat) {
    _dtState.plat = plat; _dtState.instanceId = null; _dtState.instanceName = null;
    document.querySelectorAll('.dt-plat-btn').forEach(b => {
        b.style.borderColor='var(--border-color)'; b.style.background='transparent';
        b.querySelector('i').style.color = 'var(--text-muted)';
    });
    btn.style.borderColor='var(--accent-primary)'; btn.style.background='rgba(99,102,241,0.08)';
    btn.querySelector('i').style.color = 'var(--accent-primary)';
    
    // Update step 3 labels and placeholders
    const stepCLabel = document.getElementById('dtStepCLabel');
    if (stepCLabel) {
        if (plat === 'form') stepCLabel.textContent = '第三步：选择使用哪个表单';
        else if (plat === 'hub') stepCLabel.textContent = '第三步：选择数据表';
        else stepCLabel.textContent = '第三步：选择课程';
    }
    const searchInput = document.getElementById('dtStepCSearch');
    if (searchInput) {
        if (plat === 'form') searchInput.placeholder = '搜索表单名称...';
        else if (plat === 'hub') searchInput.placeholder = '搜索数据表名称...';
        else searchInput.placeholder = '搜索课程或实例名称...';
        searchInput.value = '';
    }

    renderDtInstances('');
    document.getElementById('dtStepD').style.display = 'none';
    updateDtEcho();
};

window.filterDtInstances = function() {
    renderDtInstances(document.getElementById('dtStepCSearch').value.trim());
};

function renderDtInstances(filter) {
    const list = document.getElementById('dtInstanceList');
    const dataList = _dtMockData[_dtState.plat] || _dtMockCourses;
    const data = dataList.filter(d => d.name.includes(filter||''));
    const notFoundText = _dtState.plat === 'form' ? '未找到匹配表单' : (_dtState.plat === 'hub' ? '未找到匹配数据表' : '未找到匹配课程');
    list.innerHTML = data.map(d => `
        <div class="selectable-item${_dtState.instanceId===d.id?' selected':''}" onclick="selectDtInstance('${d.id}','${d.name}')"
             style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border-color);font-size:0.9rem;">${d.name}</div>`
    ).join('') || `<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:0.85rem;">${notFoundText}</div>`;
}

function renderDtActivities(filter) {
    const acts = (_dtMockActivities[_dtState.plat] || []).filter(a =>
        !filter || a.name.includes(filter) || a.type.includes(filter));
    const actList = document.getElementById('dtActivityList');
    if (!actList) return;
    actList.innerHTML = acts.map(a => {
        const isSelected = _dtState.selectedActivities.some(sa => sa.id === a.id);
        return `
        <tr class="dt-act-row${isSelected?' selected':''}" style="${isSelected?'background:rgba(99,102,241,0.06);':''}" onclick="toggleDtActivity('${a.id}','${a.name.replace(/'/g,"\\'")}','${a.type}')">
            <td style="padding:8px 12px;width:40px;text-align:center;">
                <input type="checkbox" ${isSelected?'checked':''} style="cursor:pointer;" onclick="event.stopPropagation(); toggleDtActivity('${a.id}','${a.name.replace(/'/g,"\\'")}','${a.type}')">
            </td>
            <td style="padding:8px 12px;cursor:pointer;font-size:0.88rem;">
                <div style="font-weight:500;color:var(--text-primary);">${a.name}</div>
            </td>
            <td style="padding:8px 12px;width:80px;text-align:center;">
                <span style="font-size:0.78rem;padding:2px 8px;border-radius:12px;background:rgba(99,102,241,0.08);color:var(--accent-primary);border:1px solid rgba(99,102,241,0.2);">${a.type}</span>
            </td>
        </tr>`;
    }).join('') || `<tr><td colspan="3" style="padding:14px;text-align:center;color:var(--text-muted);font-size:0.85rem;">未找到活动项</td></tr>`;
}

window.toggleDtActivity = function(id, name, type) {
    const idx = _dtState.selectedActivities.findIndex(sa => sa.id === id);
    if (idx > -1) {
        _dtState.selectedActivities.splice(idx, 1);
    } else {
        _dtState.selectedActivities.push({ id, name, type });
    }
    const searchInput = document.querySelector('#dtStepD input');
    renderDtActivities(searchInput ? searchInput.value.trim() : '');
    updateDtEcho();
};

window.selectDtActivity = function(id, name, type) {
    _dtState.activityId = id; _dtState.activityName = name; _dtState.activityType = type;
    document.querySelectorAll('.dt-act-row').forEach(r => r.classList.remove('selected'));
    event.currentTarget.closest('.dt-act-row').classList.add('selected');
    event.currentTarget.closest('.dt-act-row').style.background = 'rgba(99,102,241,0.06)';
    updateDtEcho();
};

window.selectDtInstance = function(id, name) {
    _dtState.instanceId = id; 
    _dtState.instanceName = name;
    _dtState.selectedActivities = [];
    const stepD = document.getElementById('dtStepD');
    if (stepD) {
        stepD.style.display = 'block';
        const plat = _dtState.plat;
        const step4Label = (plat === 'form' || plat === 'hub') ? '第四步：选择要用哪几个数据字段计算' : '第四步：选择活动项';
        const searchPlaceholder = (plat === 'form' || plat === 'hub') ? '搜索字段...' : '搜索活动项...';
        const nameHeader = (plat === 'form' || plat === 'hub') ? '名称' : '活动项名称';

        stepD.innerHTML = `
            <div style="height:1px;background:var(--border-color);margin-bottom:14px;"></div>
            <label style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
                <span>${step4Label}</span>
                <div style="display:flex;align-items:center;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;padding:4px 8px;">
                    <i class="ph ph-magnifying-glass" style="color:var(--text-muted);margin-right:6px;font-size:0.85rem;"></i>
                    <input type="text" placeholder="${searchPlaceholder}" style="background:transparent;border:none;color:var(--text-primary);outline:none;width:140px;font-size:0.82rem;" oninput="renderDtActivities(this.value.trim())">
                </div>
            </label>
            <div style="border:1px solid var(--border-color);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);max-height:160px;overflow-y:auto;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:var(--bg-panel);">
                        <th style="padding:7px 12px;width:40px;"></th><th style="padding:7px 12px;font-size:0.8rem;text-align:left;font-weight:500;color:var(--text-secondary);">${nameHeader}</th>
                        <th style="padding:7px 12px;font-size:0.8rem;text-align:center;font-weight:500;color:var(--text-secondary);width:80px;">类型</th>
                    </tr></thead>
                    <tbody id="dtActivityList"></tbody>
                </table>
            </div>`;
    }
    renderDtActivities('');
    updateDtEcho();
    renderDtInstances(document.querySelector('#dtStepCSearch')?.value.trim() || '');
};

window.selectDtInstance_old = function(id, name) {
    _dtState.instanceId = id; _dtState.instanceName = name;
    _dtState.selectedActivities = [];
    renderDtInstances(document.getElementById('dtStepCSearch').value.trim());
    const stepD = document.getElementById('dtStepD');
    stepD.style.display = 'block';
    // Populate activity table
    const platMap = { course:'课程平台', exam:'考试系统', eval:'评价系统' };
    stepD.innerHTML = `
        <div style="height:1px;background:var(--border-color);margin-bottom:14px;"></div>
        <label style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
            <span>第四步：选择活动项</span>
            <div style="display:flex;align-items:center;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;padding:4px 8px;">
                <i class="ph ph-magnifying-glass" style="color:var(--text-muted);margin-right:6px;font-size:0.85rem;"></i>
                <input type="text" placeholder="搜索活动项..." style="background:transparent;border:none;color:var(--text-primary);outline:none;width:140px;font-size:0.82rem;" oninput="renderDtActivities(this.value.trim())">
            </div>
        </label>
        <div style="border:1px solid var(--border-color);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);max-height:160px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:var(--bg-panel);">
                    <th style="padding:7px 12px;width:40px;"></th><th style="padding:7px 12px;font-size:0.8rem;text-align:left;font-weight:500;color:var(--text-secondary);">活动项名称</th>
                    <th style="padding:7px 12px;font-size:0.8rem;text-align:center;font-weight:500;color:var(--text-secondary);width:80px;">类型</th>
                </tr></thead>
                <tbody id="dtActivityList"></tbody>
            </table>
        </div>`;
    renderDtActivities('');
    updateDtEcho();
};

window.selectDataDim = function(btn) {
    _dtState.dim = btn.dataset.dim;
    document.querySelectorAll('.dt-dim-btn').forEach(b => {
        b.style.borderColor='var(--border-color)'; b.style.background='transparent'; b.style.color='var(--text-secondary)';
    });
    btn.style.borderColor='var(--accent-primary)'; btn.style.background='rgba(99,102,241,0.08)'; btn.style.color='var(--accent-primary)';
    updateDtEcho();
};

function updateDtEcho() {
    const echo = document.getElementById('dtSelectionEcho');
    const nameEl = document.getElementById('dtDataItemName');
    if (!echo) return;
    if (_dtState.type === 'upload') { echo.style.display='none'; if(nameEl) nameEl.textContent=''; return; }
    const platMap = { course:'课程平台', exam:'考试系统', eval:'评价系统', form:'系统表单', hub:'数据中台' };
    const parts = [platMap[_dtState.plat] || _dtState.plat];
    if (_dtState.instanceName) parts.push(_dtState.instanceName);
    if (_dtState.selectedActivities.length > 0) {
        const actLabel = _dtState.selectedActivities.length === 1 
            ? _dtState.selectedActivities[0].name + (_dtState.selectedActivities[0].type ? '【'+_dtState.selectedActivities[0].type+'】' : '')
            : `已选 ${_dtState.selectedActivities.length} 项活动/字段`;
        parts.push(actLabel);
    }
    echo.style.display = 'flex';
    echo.innerHTML = '<i class="ph-fill ph-check-circle" style="margin-right:6px;"></i>已选: <strong style="margin-left:4px;">' + parts.join(' › ') + '</strong>';
    if (nameEl) {
        if (_dtState.selectedActivities.length === 1) {
             nameEl.textContent = '['+platMap[_dtState.plat]+'] ' + _dtState.selectedActivities[0].name;
        } else if (_dtState.selectedActivities.length > 1) {
             nameEl.textContent = '['+platMap[_dtState.plat]+'] 批量添加' + _dtState.selectedActivities.length + '项';
        } else if (_dtState.instanceName) {
             nameEl.textContent = '['+platMap[_dtState.plat]+'] ' + _dtState.instanceName;
        } else {
             nameEl.textContent = '';
        }
    }
}

window.handleDtFileUpload = function(input) {
    if (input.files.length) { const el=document.getElementById('dtUploadFileName'); el.style.display='flex'; el.textContent='✓ '+input.files[0].name; }
};

window.confirmAddDataV2 = function() {
    if (_dtState.type === 'system') {
        if (!_dtState.instanceId) { alert('请先在第三步进行选择'); return; }
        if (!_dtState.selectedActivities.length) { alert('请在第四步勾选具体数据项/活动'); return; }
        const platMap = { course:'课程', exam:'考试', eval:'评价', form:'表单', hub:'中台' };
        const node = findNodeById(mockData.rulesTree, _dtState.nodeId);
        if (!node) return;
        if (!node.dataItems) node.dataItems = [];
        
        _dtState.selectedActivities.forEach((act, idx) => {
            const typeTag = act.type ? '【'+act.type+'】' : '';
            node.dataItems.push({
                id: 'di_'+Date.now()+'_'+idx, type:'item', weight:0, source: _dtState.plat,
                text: '['+platMap[_dtState.plat]+'] '+act.name+typeTag
            });
        });
    } else {
        const fn = document.getElementById('dtFileInput').files[0];
        if (!fn) { alert('请先选择要导入的文件'); return; }
        const node = findNodeById(mockData.rulesTree, _dtState.nodeId);
        if (!node) return;
        if (!node.dataItems) node.dataItems = [];
        node.dataItems.push({ id:'di_'+Date.now(), type:'item', weight:0, source:'upload', text:'[上传] '+fn.name });
    }
    closeModal('addDataModal');
    renderRuleMainPanel(_dtState.nodeId);
    refreshRuleTree();
};

// ── Selectable list hover style ──
(function(){
    const st = document.createElement('style');
    st.textContent = `.selectable-item:hover{background:rgba(99,102,241,0.06);} .selectable-item.selected{background:rgba(99,102,241,0.1);color:var(--accent-primary);}`;
    document.head.appendChild(st);
})();

// ──────────────────────────────────────────
// V2: Aggregation Method Selector for Leaf Nodes
// ──────────────────────────────────────────
window.selectAggMethod = function(nodeId, btn, method) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    node.aggMethod = method;
    node.method = method; 
    renderRuleMainPanel(nodeId); 
    if (method === 'custom' || method === 'weighted') {
        setTimeout(() => {
            if (method === 'custom') updateFormulaPreview(nodeId);
            if (method === 'weighted') checkLeafWeightSum(nodeId);
        }, 50);
    }
};

// ──────────────────────────────────────────
// V2: AI Formula Recommendation Flow (Inline Version)
// ──────────────────────────────────────────
// Simulated AI formula generation
const _aiFormulaTemplates = [
    { keywords: ['60', '40'], formula: 'v1*0.6 + v2*0.4', explain: '提取了 60% 和 40% 的权重分配进行加权求和，结果范围为 0-100。' },
    { keywords: ['30', '平时', '作业'], formula: 'v1*0.7 + v2*0.3', explain: '识别到期末和平时作业的比例关系，推荐按 7:3 加权，可在此基础上微调。' },
    { keywords: ['不及格', '60', '低分'], formula: 'Math.min(v1, v2, v3) < 60 ? Math.min(v1, v2, v3) * 0.5 : ((v1+v2+v3)/3)', explain: '检测到短板规则：若任一数据项低于60分，整体得分减半；否则取简单平均值。' },
    { keywords: ['最高', 'max', '取优'], formula: 'Math.max(v1, v2, v3)', explain: '取所有数据项中的最高分作为最终得分，适用于鼓励型评价场景。' },
    { keywords: [''], formula: '(v1+v2+v3)/3', explain: '未识别到特定权重关键词，暂推荐使用简单算术平均值。' }
];

window.runInlineAiFormula = function(nodeId) {
    const descInput = document.getElementById('aiInlineDesc_' + nodeId);
    if (!descInput) return;
    const desc = descInput.value.trim();
    if (!desc) { alert('请先输入计算逻辑描述'); return; }
    
    document.getElementById('aiInlineLoading_' + nodeId).style.display = 'block';
    document.getElementById('aiInlineResultBox_' + nodeId).style.display = 'none';
    document.getElementById('aiInlineGenBtn_' + nodeId).style.display = 'none';

    // Simulate AI thinking delay
    setTimeout(() => {
        let chosen = _aiFormulaTemplates[_aiFormulaTemplates.length - 1];
        for (const t of _aiFormulaTemplates.slice(0, -1)) {
            if (t.keywords.some(k => desc.includes(k))) { chosen = t; break; }
        }
        
        const node = findNodeById(mockData.rulesTree, nodeId);
        const getVName = (idx) => {
            if (node && node.dataItems && node.dataItems[idx]) {
                return '[' + node.dataItems[idx].text.replace(/\[.*?\]\s*/,'').substring(0,14) + ']';
            }
            return '[数据项' + (idx + 1) + ']';
        };
        let finalFormula = chosen.formula.replace(/v1/g, getVName(0))
                                        .replace(/v2/g, getVName(1))
                                        .replace(/v3/g, getVName(2));

        document.getElementById('aiInlineLoading_' + nodeId).style.display = 'none';
        document.getElementById('aiInlineSuggestion_' + nodeId).textContent = finalFormula;
        document.getElementById('aiInlineExplain_' + nodeId).innerHTML = '<i class="ph-fill ph-info" style="color:var(--accent-cyan);margin-right:4px;"></i>' + chosen.explain;
        
        document.getElementById('aiInlineResultBox_' + nodeId).style.display = 'block';
        document.getElementById('aiInlineGenBtn_' + nodeId).style.display = 'flex';
        document.getElementById('aiInlineGenBtn_' + nodeId).innerHTML = '<i class="ph-fill ph-arrows-clockwise"></i> 重新生成';
    }, 1400);
};

window.applyInlineAiFormula = function(nodeId) {
    const formulaStr = document.getElementById('aiInlineSuggestion_' + nodeId).textContent;
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) {
        node.customFormula = formulaStr;
        node.aggMethod = 'custom';
    }
    
    // Fill the actual textarea
    const ta = document.getElementById('customFormulaInput_' + nodeId);
    if (ta) ta.value = formulaStr;
    
    updateFormulaPreview(nodeId);
    
    // Hide inline result
    discardInlineAiFormula(nodeId);
};

window.discardInlineAiFormula = function(nodeId) {
    const descInput = document.getElementById('aiInlineDesc_' + nodeId);
    if (descInput) descInput.value = '';
    
    document.getElementById('aiInlineResultBox_' + nodeId).style.display = 'none';
    const genBtn = document.getElementById('aiInlineGenBtn_' + nodeId);
    if (genBtn) {
        genBtn.style.display = 'flex';
        genBtn.innerHTML = '<i class="ph-fill ph-sparkle"></i> 生成推荐公式';
    }
};

// V2: insert token into custom formula textarea
window.insertFormulaToken = function(nodeId, varName) {
    const ta = document.getElementById('customFormulaInput_' + nodeId);
    if (!ta) return;
    const pos = ta.selectionStart || ta.value.length;
    ta.value = ta.value.slice(0, pos) + varName + ta.value.slice(pos);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + varName.length;
    // Persist to node
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (node) { node.customFormula = ta.value; updateFormulaPreview(nodeId); }
};

// V2: sync leaf item weight
window.syncLeafWeight = function(nodeId, itemId, val) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node || !node.dataItems) return;
    const findItem = (arr) => { for(let i of arr){ if(i.id===itemId) return i; if(i.children) {const f=findItem(i.children);if(f)return f;} } };
    const item = findItem(node.dataItems);
    if (item) { item.weight = parseFloat(val)||0; checkLeafWeightSum(nodeId); }
};

// V2: update formula preview with styled chips
window.updateFormulaPreview = function(nodeId) {
    const ta = document.getElementById('customFormulaInput_' + nodeId);
    const preview = document.getElementById('formulaPreview_' + nodeId);
    if (!ta || !preview) return;
    
    let formula = ta.value;
    const node = findNodeById(mockData.rulesTree, nodeId);
    if (!node) return;
    
    const sourceItems = node.dataItems && node.dataItems.length > 0 ? node.dataItems : (node.children || []);
    const itemTokens = sourceItems.map((d, i) => {
        const label = d.text.replace(/\[.*?\]\s*/,'').substring(0,14);
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return {
            varName: `\\[${escapedLabel}\\]`,
            label: label
        };
    });
    
    // Replace varNames with styled spans for preview
    let styled = formula;
    itemTokens.forEach(t => {
        const regex = new RegExp(t.varName, 'g');
        styled = styled.replace(regex, `<span style="background:rgba(99,102,241,0.1);color:var(--accent-primary);padding:1px 6px;border-radius:4px;border:1px solid rgba(99,102,241,0.2);margin:0 2px;font-weight:600;font-size:0.85rem;">${t.label}…</span>`);
    });
    
    preview.innerHTML = styled || '<span style="color:var(--text-muted);">暂未输入公式，点击下方标签插入</span>';
    // Sync to node
    node.customFormula = formula;
};

window.checkLeafWeightSum = function(nodeId) {
    const node = findNodeById(mockData.rulesTree, nodeId);
    const nm = node.aggMethod || node.method || 'avg';
    if (!node || nm !== 'weighted') return;
    const items = node.dataItems || [];
    const sum = items.reduce((a, b) => a + (parseFloat(b.weight)||0), 0);
    const msg = document.getElementById('leafWeightMsg_' + nodeId);
    if (!msg) return;
    if (Math.abs(sum-100) < 0.01) {
        msg.style.color = 'var(--accent-green)';
        msg.innerHTML = '<i class="ph-fill ph-check-circle"></i> 权重总和 100%，配置有效';
    } else {
        msg.style.color = 'var(--accent-secondary)';
        msg.innerHTML = '<i class="ph-fill ph-warning-circle"></i> 当前总和 <strong>' + sum + '%</strong>，需等于 100%';
    }
};
