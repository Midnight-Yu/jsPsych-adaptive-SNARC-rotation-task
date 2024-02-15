//列表生成
const originalList = [
    { content: "1", category: 1 },
    { content: "2", category: 2 },
    { content: "3", category: 1 },
    { content: "4", category: 2 },
    { content: "5", category: 1 },
    { content: "6", category: 2 }
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


let jsPsych = initJsPsych({
    on_finish: function () {
        jsPsych.data
            .get()
            .localSave('csv', 'data.csv')
    }
}); //初始化jsPsych

let instruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>这是一个奇偶判断实验</p>
    <p>当你看到屏幕上的数字后，请按键反应</p>
    <p>如果数字是奇数（单数），请按 F 键</p>
    <p>如果数字是偶数（双数），请按 J 键</p>
    `,
    post_trial_gap: 500,
    css_classes: "experiment-instruction"
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
        category: jsPsych.timelineVariable('category')
    },
    timeline: [
        {  //空屏
            stimulus:" ",
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
            stimulus_duration: 150
        }
    ],
    timeline_variables: [
        { content: "1", category: 1 },
        { content: "2", category: 2 },
        { content: "3", category: 1 },
        { content: "4", category: 2 },
        { content: "5", category: 1 },
        { content: "6", category: 2 }
    ],
    sample: {
        type: 'fixed-repetitions',
        size: 20
    },
    on_finish: function (data) {
        //赋予正确答案值
        if (data.category === 1) {
            data.correct = (data.response === 'f');
        }
        else {
            data.correct = (data.response === 'j');
        }
    }
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
        category: jsPsych.timelineVariable('category')
    },
    timeline: [
        {  //空屏
            stimulus:" ",
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
            stimulus: () => "<div class='experiment-content-rotation' style='transform: rotate(" + jsPsych.timelineVariable('orientation') + jsPsych.timelineVariable('rotation') + ")'>"+jsPsych.timelineVariable('content')+"</div>",
            //怎么写得这么复杂的
            choices: ["f", "j"],
            stimulus_duration: 150,
        }
    ],
    timeline_variables: resultList,
    sample: {
        type: 'fixed-repetitions',
        size: 3
    },
    on_finish: function (data) {
        //赋予正确答案值
        if (data.category === 1) {
            data.correct = (data.response === 'f');
        }
        else {
            data.correct = (data.response === 'j');
        }
    }
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
    instruction, /*parity_trials,*/ rotation_trials, ending
])

