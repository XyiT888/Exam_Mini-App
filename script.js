// 题目数据
const data = [
    {
        id: 1,
        qs: '1. HTML5 中 canvas 元素的用途是什么？',
        as: '绘制图形',
        opts: ['绘制图形', '播放音频', '用于存储数据', '显示视频']
    },
    {
        id: 2,
        qs: '2. CSS 中，box-sizing 属性的作用是什么？',
        as: '设置盒模型的计算方式',
        opts: [
            '设置边框大小',
            '设置盒模型的计算方式',
            '控制元素的高度和宽度',
            '控制元素的背景色'
        ]
    },
    {
        id: 3,
        qs: '3. 在 JavaScript 中，let 和 var 的主要区别是什么？',
        as: 'let 具有块级作用域，var 具有函数级作用域',
        opts: [
            'let 具有块级作用域，var 具有函数级作用域',
            'let 是 ES6 的新特性，var 是 ES5 的旧特性',
            'let 可以重新声明，var 不能重新声明',
            'let 只能用于常量，var 可以用于变量'
        ]
    },
    {
        id: 4,
        qs: '4. 在 JavaScript 中，如何获取数组的长度？',
        as: 'array.length',
        opts: [
            'array.getLength()',
            'array.size()',
            'array.length',
            'array.length()'
        ]
    },
    {
        id: 5,
        qs: '5. Vue.js 中，哪个生命周期钩子在组件创建后首次被调用？',
        as: 'created',
        opts: ['created', 'mounted', 'beforeCreate', 'updated']
    }
];

// DOM元素
const startScreen = document.getElementById('start-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const exitBtn = document.getElementById('exit-btn');
const jgexitBtn = document.getElementById('jg-exit-btn');
const continueBtn = document.getElementById('continue-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionEl = document.getElementById('schedule-num');
const totalQuestionsEl = document.getElementById('total-questions');
const timeLeftEl = document.getElementById('time-left');
const timeProgressEl = document.querySelector('.time-progress');
const finalScoreEl = document.getElementById('final-score');
const resultMessageEl = document.getElementById('result-message');

// 考试状态
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

// 初始化
// 初始化函数
function init() {
    // 将data数组的长度赋值给totalQuestionsEl的textContent属性
    totalQuestionsEl.textContent = data.length;
    // 显示start屏幕
    showScreen('start');
}

// 显示指定屏幕
// 函数showScreen用于显示指定名称的屏幕
function showScreen(screenName) {
    // 1. 处理开始界面的特殊逻辑
    if (screenName === 'start') {
        startScreen.style.display = 'flex'; // 显示开始界面
    } else {
        startScreen.style.display = 'none'; // 隐藏开始界面
    }
    // 2. 其他界面用active控制。遍历所有屏幕，移除active类
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 根据传入的screenName参数，显示对应的屏幕
    switch(screenName) {
        case 'start':
            // 显示开始屏幕
            startScreen.classList.add('active');
            break;
        case 'instructions':
            // 显示说明屏幕
            instructionsScreen.classList.add('active');
            break;
        case 'quiz':
            // 显示问答屏幕，并加载问题，开始计时
            quizScreen.classList.add('active');
            loadQuestion();
            startTimer();
            break;
        case 'result':
            // 显示结果屏幕，并显示结果
            resultScreen.classList.add('active');
            showResult();
            break;
    }
}

// 加载题目
// 加载问题
function loadQuestion() {
    // 获取当前问题
    const question = data[currentQuestionIndex];
    // 设置当前问题索引
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    // 设置问题文本
    questionText.textContent = question.qs;
    
    // 清空选项容器
    optionsContainer.innerHTML = '';
    // 遍历选项
    question.opts.forEach(option => {
        // 创建选项元素
        const optionEl = document.createElement('div');
        // 添加选项类名
        optionEl.classList.add('option');
        // 设置选项文本
        optionEl.textContent = option;
        // 添加点击事件
        optionEl.addEventListener('click', () => selectOption(optionEl, option));
        // 将选项元素添加到选项容器中
        optionsContainer.appendChild(optionEl);
    });
    
    // 重置计时器
    resetTimer();
    timeProgressEl.style.width = '0%'; // 强制进度条归零（确保视觉同步）
    // 隐藏下一题按钮
    nextBtn.classList.add('hidden');
}

// 选择选项
// 选择选项函数
function selectOption(optionEl, selectedOption) {
    // 获取当前题目
    const question = data[currentQuestionIndex];
    // 获取所有选项
    const options = document.querySelectorAll('.option');
    
    // 禁用所有选项
    options.forEach(opt => {
        opt.classList.add('disabled');
        opt.style.cursor = 'not-allowed';
    });
    
    // 检查答案
    if (selectedOption === question.as) {/**严格相等运算符，它不仅比较两个值的值是否相等，还比较它们的类型是否相同。 */
        // 如果答案正确，添加正确类
        optionEl.classList.add('correct');
        // 更新分数
        score++;
    } else {
        // 如果答案错误，添加错误类
        optionEl.classList.add('incorrect');
        // 标记正确答案
        options.forEach(opt => {
            if (opt.textContent === question.as) {
                opt.classList.add('correct');
            }
        });
    }
    
    // 显示下一题按钮
    nextBtn.classList.remove('hidden');
    // 停止计时器
    clearInterval(timer);
}

// 下一题
// 函数nextQuestion用于加载下一个问题
function nextQuestion() {
    // 将当前问题索引加1
    currentQuestionIndex++;
    // 如果当前问题索引小于数据长度
    if (currentQuestionIndex < data.length) {
        // 加载问题
        loadQuestion();
        // 开始计时器
        startTimer();
    } else {
        // 否则，显示结果页面
        showScreen('result');
    }
}

// 计时器
// 开始计时器函数
function startTimer() {
    // 重置计时器
    resetTimer();
    // 设置定时器，每秒执行一次
    timer = setInterval(() => {
        // 时间减一
        timeLeft--;
        // 更新时间显示
        timeLeftEl.textContent = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
        // 更新时间进度条
        timeProgressEl.style.width = `${((15-timeLeft) / 15) * 100}%`;
        
        // 如果时间小于等于0，清除定时器，调用时间到函数
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }, 1000);
}

// 重置计时器函数
function resetTimer() {
    // 清除计时器
    clearInterval(timer);
    // 将剩余时间设置为15秒
    timeLeft = 15;
    // 将剩余时间显示在页面上
    timeLeftEl.textContent = timeLeft;
    // 将进度条设置为100%
    timeProgressEl.style.width = '0%';
}

// 定义一个函数，当时间到时调用
function timeUp() {
    // 获取当前问题的数据
    const question = data[currentQuestionIndex];
    // 获取所有的选项
    const options = document.querySelectorAll('.option');
    
    // 遍历所有的选项
    options.forEach(opt => {
        // 给选项添加一个禁用样式
        opt.classList.add('disabled');
        // 如果选项的文本内容等于问题的答案
        if (opt.textContent === question.as) {
            // 给选项添加一个正确样式
            opt.classList.add('correct');
        }
    });
    
    // 移除下一个按钮的隐藏样式
    nextBtn.classList.remove('hidden');
}

// 显示结果
// 显示最终结果
function showResult() {
    // 将最终得分显示在页面上
    finalScoreEl.textContent = score;
    
    // 定义一个变量，用于存储结果信息
    let message = '';
    // 如果得分等于题目数量，则显示“太棒了！🎉您答对了所有题目！”
    if (score === data.length) {
        message = '太棒了！您答对了所有题目！';
    // 如果得分大于等于题目数量的70%，则显示“做得不错！您的成绩良好。”
    } else if (score >= data.length * 0.7) {
        message = '做得不错！您的成绩良好。';
    // 如果得分大于等于题目数量的50%，则显示“及格了，但还有提升空间。”
    } else if (score >= data.length * 0.5) {
        message = '及格了，但还有提升空间。';
    // 否则，显示“需要继续努力，加油！”
    } else {
        message = '需要继续努力，加油！';
    }
    
    // 将结果信息显示在页面上
    resultMessageEl.textContent = message;
}

// 重置考试
// 重置测验函数
function resetQuiz() {
    // 将当前问题索引重置为0
    currentQuestionIndex = 0;
    // 将分数重置为0
    score = 0;
    // 将剩余时间重置为15秒
    timeLeft = 15;
    // 清除计时器
    clearInterval(timer);
}

// 事件监听
startBtn.addEventListener('click', () => showScreen('instructions'));
exitBtn.addEventListener('click', () => showScreen('start'));
jgexitBtn.addEventListener('click', () => showScreen('start'));
continueBtn.addEventListener('click', () => showScreen('quiz'));
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => {
    resetQuiz();
    showScreen('quiz');
});

// 初始化应用
init();