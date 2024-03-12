/*Adaptive rotation SNARC effect experiment: Experiment*/
/*240302*/

//列表生成
const originalList = [
    { content: "1", parity: 1 },
    { content: "2", parity: 2 },
    { content: "3", parity: 1 },
    { content: "4", parity: 2 },
    { content: "5", parity: 1 },
    { content: "6", parity: 2 }
];

const orientationMark = ["+", "-"]

let rotationList = [];

let simpleList = [];

let resultList = [];

originalList.forEach(item => {
    orientationMark.forEach(orientation => {
        simpleList.push({ ...item, orientation });
    });
});

resultList = simpleList.concat(simpleList);

// 初始化全局参数

let parity_trial_times = 0; //休息试次检测变量
let rotation_trial_times = 0;

let rotation_value = 5; //旋转试次自适应需要的变量
let standard_rt = 400; //先随便写一个
let rotation_rt_list = [];

let parity_practice_corr_count = 0; //练习试次检测正确率的变量
let rotation_practice_corr_count = 0;

let participant_index;
let gender;
let age;
let grade;

let jsPsych = initJsPsych({
    on_finish: function () {
        jsPsych.data
            .get()
            .addToAll({ grade: grade, subject_index: participant_index, gender: gender, age: age, experiment_name: 'SNARC-rotation-adaptive' })
            .localSave('csv', participant_index.concat(Date(0).toLocaleString('zh-CN')).concat('.csv'))
    },
    on_close: function () {
        jsPsych.data
            .get()
            .addToAll({ grade: grade, subject_index: participant_index, gender: gender, age: age, experiment_name: 'SNARC-rotation-adaptive' })
            .localSave('csv', participant_index.concat(Date(0).toLocaleString('zh-CN')).concat('.csv'))
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
    <p>您的编号：<input type="text" name="participant_index" style="color:black" placeholder="如不知道，请询问实验人员"></p>
    <p>您的性别：<input type="radio" name="gender" value = "1" >男<input type="radio" name="gender" value = "2" >女</p>
    <p>您的年级：<input type="radio" name="grade" value = "2" >2<input type="radio" name="grade" value = "4" >4<input type="radio" name="grade" value = "6" >6</p>
    <p>您的年龄：<input type="text" name="age" style="color:black" placeholder="请输入阿拉伯数字，如23"></p>
    `,
    button_label: '提交',
    on_finish: function (data) {
        console.log(data.response);

        participant_index = data.response.participant_index;
        gender = data.response.gender;
        grade = data.response.grade;
        age = data.response.age;
    }
};

let instruction_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    css_classes: ['non-experiment'],
    message: `
    <p>感谢您的参与，即将进入实验</p>
    <p>实验将以全屏形式运行，实验过程中不使用鼠标</p>
    <p>准备好后点击按钮进入实验</p>
    `,
    button_label: '进入实验',
    delay_after: 1000
};

let browser_check = {
    type: jsPsychBrowserCheck
};

let instruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>欢迎加入实验！</p>
    <p>本实验分为两个阶段，两个阶段有不同的任务</p>
    <p>每个阶段开始前，都有练习流程帮助你熟悉实验</p>
    <p></p>
    <p>准备好后，按空格键进入实验</p>
    `,
    post_trial_gap: 1000,
    css_classes: "experiment-instruction",
    on_start: function () {
        document.addEventListener("keydown", endExperiment)
    },
    choices: " "
};

// 练习阶段提示，注意该段落被复用
let practice_instruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <div class='experiment-instruction'>
    <p>即将进入练习阶段</p>
    <p>练习正确率达到 70% 后，可进入正式实验</p>
    <p>按空格键开始</p>
    </div>
    `,
    choices: [' '],
    post_trial_gap: 1000
};

// 练习阶段结束、正式阶段开始前的指导语，注意该部分被复用
let practice_feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class='experiment-instruction'> 
    <p>练习阶段已结束，你的正确率已达到要求</p>
    <p>接下来将进入正式实验</p>
    <p>&nbsp;</p>
    <p>按空格键进入正式实验</p>
    </div>
    `,
    choices: [' ']
};

let instruction_parity = {
    type: jsPsychHtmlKeyboardResponse,
    timeline: [
        {   // 第一页
            stimulus: `
            <div class='experiment-instruction'>
            <h2>第一部分</h2>

            <p>这个部分的规则如下<br><br>
            当你看到奇数时，请按下<span style="color:orange"> F </span>键<br>
            当你看到偶数时，请按下<span style="color:orange"> J </span>键</p>

            <p>例如，当你看到 3 时，请按下 F 键<br>
            例如，当你看到 6 时，请按下 J 键</p>

            <p>注意，请不要用同一只手按键<br>
            请将左手放在 F 键上，右手放在 J 键上</p>

            <p>按空格键进入练习</p>
            </div>
            `,
            choices: [' '],
            post_trial_gap: 1000
        }
    ]
};

let parity_training = {
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
                let random_interval = 400 + Math.floor(200 * Math.random());
                return random_interval;
            }
        },
        {  //刺激
            stimulus: jsPsych.timelineVariable('content'),
            choices: ["f", "j"],
            //stimulus_duration: 150
            on_finish: function (data) {
                data.is_trial = false;
                data.trial_class = 'parity';
                //赋予正确答案值
                if (data.parity === 1) {
                    data.correct = (data.response === 'f');
                }
                else {
                    data.correct = (data.response === 'j');
                }

                if (data.correct) {
                    parity_practice_corr_count++
                }
            }
        },
        { //反馈，注意只有练习阶段有反馈
            stimulus: function () {
                let last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
                if (last_trial_correct) {
                    return "<p><span style='color:green; font-size:20%'>正确</span></p>";
                } else {
                    return "<p><span style='color:red; font-size:20%'>错误</span></p>";
                };
            },
            choices: 'NO_KEYS',
            trial_duration: 1000,
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
            let new_t = t.concat(t); //把目标数组复制两份，拼到一起

            let loop_state = true; // 初始化循环状态

            while (loop_state) {
                loop_state = false;

                for (let i = 0; i < new_t.length; i++) {
                    let rand_index = Math.floor(Math.random() * (new_t.length - i) + i); 
                    [new_t[i], new_t[rand_index]] = [new_t[rand_index], new_t[i]]; // 交换索引
                }

                let repeat = 1;

                for (let i = 1; i < new_t.length; i++) {
                    let parity = parity_training.timeline_variables[new_t[i]].parity;
                    let last_parity = parity_training.timeline_variables[new_t[i - 1]].parity;

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

            sampled_t = new_t.slice(0,10)
            return sampled_t;
        }
    },
    loop_function: function (data) {
        if (parity_practice_corr_count >= 7) {
            return false;
        }
        else {
            parity_practice_corr_count = 0;
            return true;
        }
    }
};

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
                let random_interval = 400 + Math.floor(200 * Math.random());
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
                if (data.parity === 1) {
                    data.correct = (data.response === 'f');
                }
                else {
                    data.correct = (data.response === 'j');
                }
            }
        },
        {  //休息试次
            css_classes: "experiment-instruction",
            timeline: [
                {
                    stimulus: `请休息片刻，稍后实验将继续`,
                    trial_duration: 30000,
                    choices: 'NO_KEYS'
                },
                {
                    stimulus: `休息已终止，按空格可继续实验`,
                    choices: ' '
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
        fn: function (t) {
            // 生成式伪随机序列算法
            // 思想：将需要放进数组的元素按照需要的分类分成两个池子，随后从左到右依次生成这个数组。
            // 如果两个池子的元素都符合条件，则随机选择一个；如果只有一个盒子满足条件，则只选择其中一个。

            const odd_list = t.filter(function(element, index) {
                return index % 2 == 0;
            });
            const even_list = t.filter(function(element, index) {
                return index % 2 != 0;
            });

            const original_odd_pool = [...Array(20)].flatMap(() => odd_list);
            const original_even_pool = [...Array(20)].flatMap(() => even_list);

            let new_t = [];
            let oddCount = 0;
            let evenCount = 0;
            let success = false;
            let index = -1;
            let odd_pool = [...original_odd_pool]
            let even_pool = [...original_even_pool];

            while (success != true) {
                let currentElement;

                // 取元素语句
                if (odd_pool.length === 0) {
                    if (even_pool.length === 0) {
                        // 生成成功，停止生成，结束循环
                        success = true;
                    } else {
                        if (evenCount === 3) {
                            // 偶数连续判断为真，生成失败，重新初始化
                            new_t = [];
                            oddCount = 0;
                            evenCount = 0;
                            index = -1;
                            odd_pool = [...original_odd_pool]
                            even_pool = [...original_even_pool];
                            continue;
                        } else {
                            // 随机取一个偶数，跳到判断
                            currentElement = even_pool[Math.floor(Math.random() * even_pool.length)];
                            index = even_pool.indexOf(currentElement);
                            if (index > -1) {
                                even_pool.splice(index, 1);
                            }
                        }
                    }
                } else if (even_pool.length === 0) {
                    if (oddCount === 3) {
                        // 奇数连续判断为真，生成失败，重新初始化
                        new_t = [];
                        oddCount = 0;
                        evenCount = 0;
                        index = -1;
                        odd_pool = [...original_odd_pool]
                        even_pool = [...original_even_pool];
                        continue;
                    } else {
                        // 随机取一个奇数，跳到判断
                        currentElement = odd_pool[Math.floor(Math.random() * odd_pool.length)];
                        index = odd_pool.indexOf(currentElement);
                        if (index > -1) {
                            odd_pool.splice(index, 1);
                        }
                    }
                } else {
                    if (oddCount === 3) {
                        // 奇数连续判断为真，取偶数
                        currentElement = even_pool[Math.floor(Math.random() * even_pool.length)];
                        index = even_pool.indexOf(currentElement);
                        if (index > -1) {
                            even_pool.splice(index, 1);
                        }
                    } else if (evenCount === 3) {
                        // 偶数连续判断为真，取奇数
                        currentElement = odd_pool[Math.floor(Math.random() * odd_pool.length)];
                        index = odd_pool.indexOf(currentElement);
                        if (index > -1) {
                            odd_pool.splice(index, 1);
                        }
                    } else {
                        // 随机选择一个池子，随机从中取一个数
                        const pool = Math.random() < 0.5 ? odd_pool : even_pool;
                        currentElement = pool[Math.floor(Math.random() * pool.length)];
                        index = pool.indexOf(currentElement);
                        if (index > -1) {
                            pool.splice(index, 1);
                        }
                    }
                }

                // 判断语句
                if (currentElement % 2 === 0) {
                    // 上面取的是偶数，偶数++，奇数=0
                    evenCount++;
                    oddCount = 0;
                } else {
                    // 上面取的是奇数，奇数++，偶数=0
                    oddCount++;
                    evenCount = 0;
                }

                // 将取到的元素添加到结果数组
                if (currentElement != undefined) {
                    new_t.push(currentElement);
                }
            }

            return new_t;
        }
    }
}

let instruction_rotation = {
    type: jsPsychHtmlKeyboardResponse,
    timeline: [
        {   // 第一页
            stimulus: `
            <div class='experiment-instruction'>
            <h2>第二部分</h2>

            <p>这个部分的规则如下<br><br>
            当你看到图形向左旋转时，请按下<span style="color:cyan"> F </span>键<br>
            当你看到图形向右旋转时，请按下<span style="color:cyan"> J </span>键</p>

            <p>按空格键查看下一页</p>
            </div>
            `,
            choices: [' '],
            post_trial_gap: 1000
        },
        {   // 第二页
            stimulus: `
            <div class='experiment-instruction'>
            <div class='experiment-content-rotation' style='transform: rotate(-5deg); font-size:500%'> 2 </div>
            <p>例如，当你看到这样的图形时，因为它朝<span style="color:cyan">左</span>旋转，因此请你按<span style="color:cyan"> F </span>键</p>
            <p>上面显示的数字和你要做的事情无关，你只需要判断它的方向</p>
            <p>按空格键查看下一页</p>
            </div>
            `,
            choices: [' '],
            post_trial_gap: 1000
        },
        {
            stimulus:`
            <div class='experiment-instruction'>
            <div class='experiment-content-rotation' style='transform: rotate(+5deg); font-size:500%'> 5 </div>
            <p>例如，当你看到这样的图形时，因为它朝<span style="color:cyan">右</span>旋转，因此请你按<span style="color:cyan"> J </span>键</p>
            <p>上面显示的数字和你要做的事情无关，你只需要判断它的方向</p>
            <p>按空格键进入练习阶段</p>
            </div>
            `,
            choices: [' '],
            post_trial_gap: 1000
        }
    ]
};

let rotation_training = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: "experiment-content",
    save_trial_parameters: {
        trial_duration: true,
        choices: true,
        post_trial_gap: true
    },
    data: {
        parity: jsPsych.timelineVariable('parity'),
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
                let random_interval = 400 + Math.floor(200 * Math.random());
                return random_interval;
            }
        },
        {  //刺激
            stimulus: () => "<div class='experiment-content-rotation' style='transform: rotate(" + jsPsych.timelineVariable('orientation') + rotation_value + "deg)'>" + jsPsych.timelineVariable('content') + "</div>",
            //怎么写得这么复杂的
            choices: ["f", "j"],
            //stimulus_duration: 150,
            on_finish: function (data) {
                data.is_trial = false;
                data.trial_class = 'rotation';
                //赋予正确答案值
                if (data.orientation === '-') {
                    data.correct = (data.response === 'f');
                }
                else {
                    data.correct = (data.response === 'j');
                }

                if (data.correct) {
                    rotation_practice_corr_count++
                }
            }
        },
        { //反馈，注意只有练习阶段有反馈
            stimulus: function () {
                let last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
                if (last_trial_correct) {
                    return "<p><span style='color:green; font-size:20%'>正确</span></p>";
                } else {
                    return "<p><span style='color:red; font-size:20%'>错误</span></p>";
                };
            },
            choices: 'NO_KEYS',
            trial_duration: 1000,
        }
    ],
    timeline_variables: resultList,
    sample: {
        type: 'custom',
        fn: function (t) { // 抄书上的
            let new_t = t.concat(t); //把目标数组复制两份，拼到一起

            let loop_state = true; // 初始化循环状态

            while (loop_state) {
                loop_state = false;

                for (let i = 0; i < new_t.length; i++) {
                    let rand_index = Math.floor(Math.random() * (new_t.length - i) + i); 
                    [new_t[i], new_t[rand_index]] = [new_t[rand_index], new_t[i]]; // 交换索引
                }

                let repeat = 1;

                for (let i = 1; i < new_t.length; i++) {
                    let orientation = rotation_training.timeline_variables[new_t[i]].orientation;
                    let last_orientation = rotation_training.timeline_variables[new_t[i - 1]].orientation;

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

            sampled_t = new_t.slice(0,10)
            return sampled_t;
        }
    },
    loop_function: function (data) {
        if (rotation_practice_corr_count >= 7) {
            return false;
        }
        else {
            rotation_practice_corr_count = 0;
            return true;
        }
    }
};

let rotation_trials = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: "experiment-content",
    save_trial_parameters: {
        trial_duration: true,
        choices: true,
        post_trial_gap: true
    },
    data: {
        parity: jsPsych.timelineVariable('parity'),
        orientation: jsPsych.timelineVariable('orientation'),
        rotation: rotation_value,
    },
    on_timeline_finish: function ( ) {
        average_rt = rotation_rt_list.reduce((a, b) => a + b, 0) / rotation_rt_list.length; //计算正确反应的反应时均值
        if ((average_rt - standard_rt) >= 5) {
            rotation_value -= 0.5; 
        }
        if ((average_rt - standard_rt) <= -5) {
            rotation_value += 0.5;
        }
    },
    on_timeline_start: function ( ) {
        rotation_rt_list = []; //重置反应时列表
    },
    timeline_variables: resultList,
    repetitions: 8,
    timeline: [
        {  //空屏
            stimulus: " ",
            choices: 'NO_KEYS',
            trial_duration: 1000
        },
        {   //注视点
            stimulus: "+",
            choices: 'NO_KEYS',
            trial_duration: 500,
            post_trial_gap: function () {
                let random_interval = 400 + Math.floor(200 * Math.random());
                return random_interval;
            }
        },
        {   //刺激
            stimulus: () => "<div class='experiment-content-rotation' style='transform: rotate(" + jsPsych.timelineVariable('orientation') + rotation_value + "deg)'>" + jsPsych.timelineVariable('content') + "</div>",
            //怎么写得这么复杂的
            choices: ["f", "j"],
            //stimulus_duration: 150,
            on_finish: function (data) {
                rotation_trial_times++

                data.is_trial = true;
                data.trial_class = 'rotation';
                data.rotation = rotation_value;

                //赋予正确答案值
                if (data.orientation === '-') {
                    data.correct = (data.response === 'f');
                }
                else {
                    data.correct = (data.response === 'j');
                }

                if (data.correct) { //将正确的反应时push进列表里
                    rotation_rt_list.push(data.rt);
                }
            }
        },
        /*{  //休息试次
            timeline: [
                {
                    stimulus: `请休息片刻，稍后实验将继续`,
                    trial_duration: 30000,
                    choices: 'NO_KEYS'
                },
                {
                    stimulus: `休息已终止，按空格可继续实验`,
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
        }*/
    ],
    sample: {
        type: 'custom',
        fn: function (t) {
            // 生成式伪随机序列算法
            // 思想：将需要放进数组的元素按照需要的分类分成两个池子，随后从左到右依次生成这个数组。
            // 如果两个池子的元素都符合条件，则随机选择一个；如果只有一个盒子满足条件，则只选择其中一个。

            const odd_list = t.filter(function(element, index) {
                return index % 2 == 0;
            });
            const even_list = t.filter(function(element, index) {
                return index % 2 != 0;
            });

            const original_odd_pool = [...Array(1)].flatMap(() => odd_list); 
            const original_even_pool = [...Array(1)].flatMap(() => even_list); 

            let new_t = [];
            let oddCount = 0;
            let evenCount = 0;
            let success = false;
            let index = -1;
            let odd_pool = [...original_odd_pool]
            let even_pool = [...original_even_pool];

            while (success != true) {
                let currentElement;

                // 取元素语句
                if (odd_pool.length === 0) {
                    if (even_pool.length === 0) {
                        // 生成成功，停止生成，结束循环
                        success = true;
                    } else {
                        if (evenCount === 3) {
                            // 偶数连续判断为真，生成失败，重新初始化
                            new_t = [];
                            oddCount = 0;
                            evenCount = 0;
                            index = -1;
                            odd_pool = [...original_odd_pool]
                            even_pool = [...original_even_pool];
                            continue;
                        } else {
                            // 随机取一个偶数，跳到判断
                            currentElement = even_pool[Math.floor(Math.random() * even_pool.length)];
                            index = even_pool.indexOf(currentElement);
                            if (index > -1) {
                                even_pool.splice(index, 1);
                            }
                        }
                    }
                } else if (even_pool.length === 0) {
                    if (oddCount === 3) {
                        // 奇数连续判断为真，生成失败，重新初始化
                        new_t = [];
                        oddCount = 0;
                        evenCount = 0;
                        index = -1;
                        odd_pool = [...original_odd_pool]
                        even_pool = [...original_even_pool];
                        continue;
                    } else {
                        // 随机取一个奇数，跳到判断
                        currentElement = odd_pool[Math.floor(Math.random() * odd_pool.length)];
                        index = odd_pool.indexOf(currentElement);
                        if (index > -1) {
                            odd_pool.splice(index, 1);
                        }
                    }
                } else {
                    if (oddCount === 3) {
                        // 奇数连续判断为真，取偶数
                        currentElement = even_pool[Math.floor(Math.random() * even_pool.length)];
                        index = even_pool.indexOf(currentElement);
                        if (index > -1) {
                            even_pool.splice(index, 1);
                        }
                    } else if (evenCount === 3) {
                        // 偶数连续判断为真，取奇数
                        currentElement = odd_pool[Math.floor(Math.random() * odd_pool.length)];
                        index = odd_pool.indexOf(currentElement);
                        if (index > -1) {
                            odd_pool.splice(index, 1);
                        }
                    } else {
                        // 随机选择一个池子，随机从中取一个数
                        const pool = Math.random() < 0.5 ? odd_pool : even_pool;
                        currentElement = pool[Math.floor(Math.random() * pool.length)];
                        index = pool.indexOf(currentElement);
                        if (index > -1) {
                            pool.splice(index, 1);
                        }
                    }
                }

                // 判断语句
                if (currentElement % 2 === 0) {
                    // 上面取的是偶数，偶数++，奇数=0
                    evenCount++;
                    oddCount = 0;
                } else {
                    // 上面取的是奇数，奇数++，偶数=0
                    oddCount++;
                    evenCount = 0;
                }

                // 将取到的元素添加到结果数组
                if (currentElement != undefined) {
                    new_t.push(currentElement);
                }
            }

            return new_t;
        }
    }
}

let ending = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>实验已结束</p>
    `,
    post_trial_gap: 500,
    css_classes: "experiment-instruction",
    on_start: function ( ) {
        jsPsych.data
            .get()
            .addToAll({ subject_index: participant_index, gender: gender, age: age, experiment_name: 'SNARC-rotation-adaptive'})
            .localSave('csv', 'data-'.concat(Date(0).toLocaleString('zh-CN')).concat('.csv'))
    },
}

jsPsych.run([
    welcome, data_collect, instruction_fullscreen, browser_check,
    instruction,
    instruction_parity, practice_instruction, parity_training, practice_feedback, parity_trials, 
    instruction_rotation, practice_instruction, rotation_training, practice_feedback, rotation_trials, 
    ending
])

