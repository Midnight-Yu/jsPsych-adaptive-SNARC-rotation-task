//列表生成
const originalList = [
    { content: "1", parity: 1 },
    { content: "2", parity: 2 },
    { content: "3", parity: 1 },
    { content: "4", parity: 2 },
    { content: "5", parity: 1 },
    { content: "6", parity: 2 }
];

const rotationValues = ["5deg", "7deg", "9deg", "11deg", "13deg"];

const orientationMark = ["+", "-"]

const rotationList = [];

const resultList = [];

originalList.forEach(item => {
    rotationValues.forEach(rotation => {
        rotationList.push({ ...item, rotation });
    });
});

rotationList.forEach(item => {
    orientationMark.forEach(orientation => {
        resultList.push({ ...item, orientation });
    });
});

console.log(resultList);

// 初始化全局参数

let parity_trial_times = 0;
let rotation_trial_times = 0;

var participant_index;
var gender;
var age;

let jsPsych = initJsPsych({
    on_finish: function () {
        jsPsych.data
            .get()
            .addToAll({ subject_index: participant_index, gender: gender, age: age })
            .localSave('csv', 'data-'.concat(Date(0).toLocaleString('zh-CN')).concat('.csv'))
    },
    on_close: function () {
        jsPsych.data
            .get()
            .addToAll({ subject_index: participant_index, gender: gender, age: age })
            .localSave('csv', 'data-'.concat(Date(0).toLocaleString('zh-CN')).concat('.csv'))
    }
}); //初始化jsPsych

// 注册一个listener，用于实验强制退出
function endExperiment(e) {
    if (e.key === 'Escape') {
        jsPsych.endExperiment('实验已终止');
        document.removeEventListener("keydown", endExperiment);
    }
};

let welcome = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ['non-experiment'],
    stimulus: `
    <p>欢迎参加本次实验！</p>
    <p>在实验开始前，我们会收集一些用于分析的必要信息</p>
    <p>点击下方按钮开始</p>
    `,
    choices: ['开始实验']
};

// 数据收集
let data_collect = {
    type: jsPsychSurveyHtmlForm,
    css_classes: ['non-experiment'],
    html: `
    <p>您的编号：<input type="text" name="participant_index" style="color:black" placeholder="如不知道，请询问主试"></p>
    <p>您的性别：<input type="radio" name="gender" value = "1" >男<input type="radio" name="gender" value = "2" >女</p>
    <p>您的年龄：<input type="text" name="age" style="color:black" placeholder="请输入数字，如23"></p>
    `,
    button_label: '提交',
    on_finish: function (data) {
        console.log(data.response);

        participant_index = data.response.participant_index;
        gender = data.response.gender;
        age = data.response.age;
    }
};

let instruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>这是一个奇偶判断实验</p>
    <p>当你看到屏幕上的数字后，请按键反应</p>
    <p>如果数字是奇数（单数），请按 F 键</p>
    <p>如果数字是偶数（双数），请按 J 键</p>
    `,
    post_trial_gap: 500,
    css_classes: "experiment-instruction",
    on_start: function () {
        document.addEventListener("keydown", endExperiment)
    },
}

let parity_trials = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: "experiment-content",
    save_trial_parameters: {
        trial_duration: true,
        choices: true,
        post_trial_gap: true
    },
    data: {
        parity: jsPsych.timelineVariable('parity')
    },
    timeline: [
        {  //空屏
            stimulus: " ",
            choices: 'NO_KEYS',
            trial_duration: 1000
        },
        { //注视点
            stimulus: "+",
            choices: 'NO_KEYS',
            trial_duration: 500,
            post_trial_gap: function () {
                random_interval = 400 + 200 * Math.random();
                return random_interval;
            }
        },
        {  //刺激
            stimulus: jsPsych.timelineVariable('content'),
            choices: ["f", "j"],
            //stimulus_duration: 150
            on_finish: function (data) {
                parity_trial_times++

                data.is_trial = true;
                data.trial_class = 'parity';
                //赋予正确答案值
                if (data.category === 1) {
                    data.correct = (data.response === 'f');
                }
                else {
                    data.correct = (data.response === 'j');
                }
            }
        },
        {  //休息试次
            timeline: [
                {
                    stimulus: `休息试次 30s`,
                    trial_duration: 30000,
                    choices: 'NO_KEYS'
                },
                {
                    stimulus: `休息已终止，按空格继续`,
                },
            ],
            conditional_function: function () {
                if (parity_trial_times % 24 === 0) {
                    return true
                }
                else {
                    return false
                }
            },
        }
    ],
    timeline_variables: [
        { content: "1", parity: 1 },
        { content: "2", parity: 2 },
        { content: "3", parity: 1 },
        { content: "4", parity: 2 },
        { content: "5", parity: 1 },
        { content: "6", parity: 2 }
    ],
    sample: {
        type: 'custom',
        fn: function (t) { // 抄书上的
            let new_t = t.concat(t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t); //把目标数组复制二十份，拼到一起

            let loop_state = true; // 初始化循环状态

            while (loop_state) {
                loop_state = false;

                for (let i = 0; i < new_t.length; i++) {
                    let rand_index = Math.floor(Math.random() * (new_t.length - i) + i); // 这个随机怎么搞的？？？我没看懂啊？？？
                    [new_t[i], new_t[rand_index]] = [new_t[rand_index], new_t[i]]; // 交换索引
                }

                let repeat = 1;

                for (let i = 1; i < new_t.length; i++) {
                    console.log([new_t[i], new_t[i - 1]])
                    console.log([parity_trials.timeline_variables[new_t[i]].parity, parity_trials.timeline_variables[new_t[i - 1]].parity])

                    let parity = parity_trials.timeline_variables[new_t[i]].parity;
                    let last_parity = parity_trials.timeline_variables[new_t[i - 1]].parity;

                    if (parity === last_parity) {
                        repeat++;
                    }
                    else {
                        repeat = 1;
                    }

                    if (repeat >= 4) {
                        loop_state = true;
                        break;
                    }
                }
            }

            return new_t;
        }
    },
}

let rotation_trials = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: "experiment-content",
    save_trial_parameters: {
        trial_duration: true,
        choices: true,
        post_trial_gap: true
    },
    data: {
        category: jsPsych.timelineVariable('category'),
        orientation: jsPsych.timelineVariable('orientation'),
        rotation: jsPsych.timelineVariable('rotation'),
    },
    timeline: [
        {  //空屏
            stimulus: " ",
            choices: 'NO_KEYS',
            trial_duration: 1000
        },
        { //注视点
            stimulus: "+",
            choices: 'NO_KEYS',
            trial_duration: 500,
            post_trial_gap: function () {
                random_interval = 400 + 200 * Math.random();
                return random_interval;
            }
        },
        {  //刺激
            stimulus: () => "<div class='experiment-content-rotation' style='transform: rotate(" + jsPsych.timelineVariable('orientation') + jsPsych.timelineVariable('rotation') + ")'>" + jsPsych.timelineVariable('content') + "</div>",
            //怎么写得这么复杂的
            choices: ["f", "j"],
            //stimulus_duration: 150,
            on_finish: function (data) {
                rotation_trial_times++

                data.is_trial = true;
                data.trial_class = 'rotation';
                //赋予正确答案值
                if (data.orientation === '-') {
                    data.correct = (data.response === 'f');
                }
                else {
                    data.correct = (data.response === 'j');
                }
            }
        },
        {  //休息试次
            timeline: [
                {
                    stimulus: `休息试次 30s`,
                    trial_duration: 30000,
                    choices: 'NO_KEYS'
                },
                {
                    stimulus: `休息已终止，按空格继续`,
                    choices: ' '
                },
            ],
            conditional_function: function () {
                if (rotation_trial_times % 24 === 0) {
                    return true
                }
                else {
                    return false
                }
            },
        }
    ],
    timeline_variables: resultList,
    sample: {
        type: 'custom',
        fn: function (t) { // 抄书上的
            let new_t = t.concat(t,t); //把目标数组复制三份，拼到一起

            let loop_state = true; // 初始化循环状态

            while (loop_state) {
                loop_state = false;

                for (let i = 0; i < new_t.length; i++) {
                    let rand_index = Math.floor(Math.random() * (new_t.length - i) + i); // 这个随机怎么搞的？？？我没看懂啊？？？
                    [new_t[i], new_t[rand_index]] = [new_t[rand_index], new_t[i]]; // 交换索引
                }

                let repeat = 1;

                for (let i = 1; i < new_t.length; i++) {
                    console.log([new_t[i], new_t[i - 1]])
                    console.log([rotation_trials.timeline_variables[new_t[i]].orientation, rotation_trials.timeline_variables[new_t[i - 1]].orientation])

                    let orientation = rotation_trials.timeline_variables[new_t[i]].orientation;
                    let last_orientation = rotation_trials.timeline_variables[new_t[i - 1]].orientation;

                    if (orientation === last_orientation) {
                        repeat++;
                    }
                    else {
                        repeat = 1;
                    }

                    if (repeat >= 4) {
                        loop_state = true;
                        break;
                    }
                }
            }

            return new_t;
        }
    },
}

let ending = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>实验已结束</p>
    `,
    post_trial_gap: 500,
    css_classes: "experiment-instruction"
}

jsPsych.run([
    welcome, data_collect, instruction, parity_trials, rotation_trials, ending
])

