import sys

with open('./index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<div class="form-group">' in line and '数据来源设定' in lines[i+1]:
        start_idx = i
    if '</div>' in line and '<!-- Upload Fields removed for Minimalist Version -->' in line:
        pass # Not there yet
    if '<div id="uploadFields"' in line:
        end_idx = i + 12

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]
    
    replacement = """                <div class="form-group">
                    <label>1. 选择目标业务系统接口</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
                        <label class="radio-card" style="display: flex; gap: 12px; padding: 12px; border: 1px solid var(--accent-primary); border-radius: var(--radius-md); background: rgba(99,102,241,0.05); cursor: pointer;">
                            <input type="radio" name="sysModule" value="course" checked onclick="onSysModuleChange('course')" style="margin-top: 4px;">
                            <div>
                                <div style="font-weight: 500; color: var(--text-primary);">教务课程数据</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">调取排课名单及期末成绩。</div>
                            </div>
                        </label>
                        <label class="radio-card" style="display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: transparent; cursor: pointer;">
                            <input type="radio" name="sysModule" value="exam" onclick="onSysModuleChange('exam')" style="margin-top: 4px;">
                            <div>
                                <div style="font-weight: 500; color: var(--text-primary);">线上考试系统</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">获取机考总成绩。</div>
                            </div>
                        </label>
                        <label class="radio-card" style="display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: transparent; cursor: pointer;">
                            <input type="radio" name="sysModule" value="eval" onclick="onSysModuleChange('eval')" style="margin-top: 4px;">
                            <div>
                                <div style="font-weight: 500; color: var(--text-primary);">教学评价系统</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">获取考核主观分数。</div>
                            </div>
                        </label>
                        <label class="radio-card" style="display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: transparent; cursor: pointer;">
                            <input type="radio" name="sysModule" value="form" onclick="onSysModuleChange('form')" style="margin-top: 4px;">
                            <div>
                                <div style="font-weight: 500; color: var(--text-primary);">动态系统表单</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">提取填报的数值结果。</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Step 2: Instance Selection -->
                <div id="sysInstanceStep" style="margin-top: 16px; border-top: 1px dashed var(--border-color); padding-top: 16px;">
                    <label>2. 挂载具体目标实例</label>
                    <div class="search-box" style="display: flex; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; margin-top: 8px; margin-bottom: 8px;">
                        <i class="ph ph-magnifying-glass" style="color: var(--text-muted); margin-right: 8px;"></i>
                        <input type="text" id="sysInstanceSearch" placeholder="搜索课程或表单名称..." style="background: transparent; border: none; color: var(--text-primary); outline: none; padding: 0; width: 100%;" onkeyup="filterSysInstances()">
                    </div>
                    <div id="sysInstanceList" style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-panel);">
                        <!-- list items injected here -->
                    </div>
                </div>

                <!-- Echo Area -->
                <div id="sysSelectionEcho" style="display: none; padding: 12px 16px; margin-top: 16px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.2); border-radius: var(--radius-md); font-size: 0.9rem; color: var(--accent-primary); line-height: 1.5;">
                    <!-- Echo path injected by JS -->
                </div>\n"""
    
    lines.insert(start_idx, replacement)
    
    with open('./index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("HTML updated successfully.")
else:
    print(f"Failed to find boundaries: start={start_idx}, end={end_idx}")

