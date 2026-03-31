import sys

with open('./js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if 'window.sysCascadeState =' in line:
        start_idx = i
        break

if start_idx != -1:
    # Delete from start_idx to the end
    del lines[start_idx:]
    
    replacement = """window.sysCascadeState = {
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
    window.sysCascadeState.module = 'course';
    window.sysCascadeState.instanceId = null;
    window.sysCascadeState.instanceName = null;
    
    document.querySelector('input[name="sysModule"][value="course"]').checked = true;
    
    updateRadioCardStyles();
    
    document.getElementById('sysInstanceStep').style.display = 'block';
    document.getElementById('sysSelectionEcho').style.display = 'none';
    
    document.getElementById('sysInstanceSearch').value = '';
    renderSysInstanceList();
}

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
"""
    lines.append(replacement)
    
    with open('./js/app.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("JS updated successfully.")
else:
    print("Failed to find boundaries")
