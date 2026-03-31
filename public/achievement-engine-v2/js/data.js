// Mock Data for Achievement Engine Platform V2

const mockData = {
    // 1. Tasks — 预置三种状态示例任务
    tasks: [
        {
            id: 1001,
            name: '2024届软件工程专业毕业要求达成度计算',
            desc: '面向2024届软件工程专业全体毕业生，评估各项毕业要求指标点与课程支撑关系，需满足工程教育认证标准。',
            status: 'completed',
            businessType: 'major',
            selectedTarget: { id: 'm1', name: '软件工程' },
            progress: 100,
            date: '2026-03-10'
        },
        {
            id: 1002,
            name: '面向对象程序设计课程达成度统计',
            desc: '对《面向对象程序设计》课程本学期的平时成绩、期末考试和实验报告进行综合达成度评估。',
            status: 'pending_calc',
            businessType: 'course',
            selectedTarget: { id: 'c1', name: '面向对象程序设计' },
            progress: 0,
            date: '2026-03-14'
        },
        {
            id: 1003,
            name: '计算机学院2024年教师岗位能力评估',
            desc: '尚未配置统计对象与规则，请进入任务开始配置。',
            status: 'pending_config',
            businessType: 'job',
            selectedTarget: null,
            progress: 0,
            date: '2026-03-17'
        }
    ],

    // 2. Objects (Students Only in Minimal Version)
    objects: {
        // 已完成任务 & 待计算任务 的对象池
        default: {
            students: [
                { id: "S2021001", name: "张伟", grade: "2021级", major: "软件工程", class: "软工1班", phone: "138****1234" },
                { id: "S2021002", name: "李娜", grade: "2021级", major: "软件工程", class: "软工1班", phone: "139****5678" },
                { id: "S2021003", name: "王强", grade: "2021级", major: "计算机科学", class: "计科2班", phone: "135****9012" },
                { id: "S2021004", name: "陈梅", grade: "2021级", major: "软件工程", class: "软工2班", phone: "136****3456" },
                { id: "S2021005", name: "刘阳", grade: "2021级", major: "软件工程", class: "软工1班", phone: "137****7890" }
            ]
        },
        // 待配置任务：空对象池
        empty: {
            students: []
        }
    },

    // 专业列表（模拟数据）
    majors: [
        { id: 'm1', name: '软件工程', year: '2024', targets: 5, requirements: 12, courses: 48 },
        { id: 'm2', name: '计算机科学与技术', year: '2024', targets: 6, requirements: 14, courses: 52 },
        { id: 'm3', name: '网络工程', year: '2024', targets: 4, requirements: 10, courses: 45 },
        { id: 'm4', name: '信息管理与信息系统', year: '2024', targets: 4, requirements: 11, courses: 42 },
        { id: 'm5', name: '数据科学与大数据技术', year: '2024', targets: 5, requirements: 13, courses: 50 },
        { id: 'm6', name: '人工智能', year: '2024', targets: 5, requirements: 12, courses: 46 },
        { id: 'm7', name: '电子信息工程', year: '2024', targets: 6, requirements: 15, courses: 55 },
        { id: 'm8', name: '通信工程', year: '2024', targets: 5, requirements: 12, courses: 48 }
    ],

    // 课程列表（模拟数据）
    courses: [
        { id: 'c1', name: '面向对象程序设计' },
        { id: 'c2', name: '数据结构与算法' },
        { id: 'c3', name: '计算机网络' },
        { id: 'c4', name: '操作系统原理' },
        { id: 'c5', name: '数据库原理与应用' },
        { id: 'c6', name: '软件工程导论' },
        { id: 'c7', name: '高等数学（上）' },
        { id: 'c8', name: '高等数学（下）' },
        { id: 'c9', name: '线性代数' },
        { id: 'c10', name: '概率论与数理统计' }
    ],

    // 学生库（用于从库中选择）
    studentLibrary: [
        { id: "S2022001", name: "赵志远", grade: "2022级", major: "软件工程", class: "软工1班", phone: "188****1111" },
        { id: "S2022002", name: "孙丽华", grade: "2022级", major: "计算机科学", class: "计科1班", phone: "188****2222" },
        { id: "S2022003", name: "周建军", grade: "2022级", major: "网络工程", class: "网工1班", phone: "188****3333" },
        { id: "S2022004", name: "吴春燕", grade: "2022级", major: "软件工程", class: "软工2班", phone: "188****4444" },
        { id: "S2022005", name: "郑浩然", grade: "2022级", major: "数据科学", class: "数科1班", phone: "188****5555" }
    ],

    // 3. Rules Tree
    rulesTree: [
        {
            id: 'r1',
            text: '毕业要求1: 工程知识',
            type: 'index',
            method: 'weighted-avg',
            status: 'configured',
            weight: 50,
            children: [
                {
                    id: 'r1-1',
                    text: '指标点1.1: 数学与自然科学基础',
                    type: 'sub-index',
                    method: 'weighted-avg',
                    status: 'configured',
                    weight: 60,
                    children: [
                        {
                            id: 'r1-1-1',
                            text: '高等数学',
                            type: 'leaf',
                            status: 'configured',
                            weight: 60,
                            dataItems: [
                                { id: 'di_1', type: 'item', text: '[课程] 高等数学期末成绩', source: 'course', weight: 70 },
                                { id: 'di_2', type: 'item', text: '[考试] 2023年终统测', source: 'exam', weight: 30 }
                            ]
                        },
                        {
                            id: 'r1-1-2',
                            text: '大学物理',
                            type: 'leaf',
                            status: 'configured',
                            weight: 40,
                            dataItems: [
                                { id: 'di_3', type: 'item', text: '[课程] 大学物理期末成绩', source: 'course', weight: 100 }
                            ]
                        }
                    ]
                },
                {
                    id: 'r1-2',
                    text: '指标点1.2: 复杂工程应用能力',
                    type: 'sub-index',
                    method: 'avg',
                    status: 'incomplete',
                    weight: 40,
                    children: [
                        {
                            id: 'r1-2-1',
                            text: '综合课程达成',
                            type: 'leaf',
                            status: 'incomplete',
                            weight: 80,
                            dataItems: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'r2',
            text: '毕业要求2: 问题分析',
            type: 'index',
            method: 'avg',
            status: 'incomplete',
            weight: 30,
            children: []
        },
        {
            id: 'r3',
            text: '毕业要求3: 设计与开发',
            type: 'index',
            method: 'avg',
            status: 'incomplete',
            weight: 20,
            children: []
        }
    ],

    // 4. Results
    results: {
        radarData: {
            indicators: [
                { name: '工程知识', max: 100 },
                { name: '问题分析', max: 100 },
                { name: '设计/开发', max: 100 },
                { name: '研究', max: 100 },
                { name: '使用现代工具', max: 100 },
                { name: '团队协作', max: 100 }
            ],
            values: [0.85, 0.78, 0.92, 0.70, 0.88, 0.95]
        }
    },

    // 5. Templates for initialization
    majorTemplateRules: [
        {
            id: 'tr1',
            text: '毕业要求1: 工程知识',
            type: 'index',
            method: 'weighted-avg',
            status: 'incomplete',
            weight: 30,
            children: [
                {
                    id: 'tr1-1',
                    text: '指标点1.1: 掌握数学、自然科学知识',
                    type: 'sub-index',
                    method: 'avg',
                    status: 'incomplete',
                    weight: 50,
                    children: []
                },
                {
                    id: 'tr1-2',
                    text: '指标点1.2: 能够将知识应用于复杂工程问题',
                    type: 'sub-index',
                    method: 'avg',
                    status: 'incomplete',
                    weight: 50,
                    children: []
                }
            ]
        },
        {
            id: 'tr2',
            text: '毕业要求2: 问题分析',
            type: 'index',
            method: 'avg',
            status: 'incomplete',
            weight: 20,
            children: []
        },
        {
            id: 'tr3',
            text: '毕业要求3: 设计/开发解决方案',
            type: 'index',
            method: 'avg',
            status: 'incomplete',
            weight: 20,
            children: []
        }
    ]
};
