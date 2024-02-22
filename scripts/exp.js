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

// console.log(resultList);

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
        fn: function (t) {
            // 生成式伪随机序列算法
            // 思想：将需要放进数组的元素按照需要的分类分成两个池子，随后从左到右依次生成这个数组。
            // 如果两个池子的元素都符合条件，则随机选择一个；如果只有一个盒子满足条件，则只选择其中一个。

            // 这里t的构成：[0, 1, 2, 3, 4, 5]
            // 可以明确知道的是，0，2，4分别对应奇数，1，3，5分别对应偶数，我们需要20份这个数组

            // 第一步，创建数字池
            // 在原始输入实际上不会修改的情况下，在函数内硬定义列表也不是一个坏事，但是注意这个方法不能推广
            // 需要推广的情况下，已知原始数组中的两种类别是交替排列的，那么把奇数元素抽出来，偶数元素抽出来分成两个list就可以了
            const odd_list = t.filter(function(element, index) {
                return index % 2 == 0;
            });
            const even_list = t.filter(function(element, index) {
                return index % 2 != 0;
            });

            const original_odd_pool = [...Array(20)].flatMap(() => odd_list);
            const original_even_pool = [...Array(20)].flatMap(() => even_list);

            //console.log(odd_pool)
            //console.log(even_pool)

            // 第二步，开始生成
            // 初始化 生成空数组
            // 初始化 两个判断变量 初始值为0
            // 
            // 循环下列语句
            // 取元素语句
            // if 奇数池子没有元素了 
            //  if 偶数池子也没有元素了 生成成功 停止生成 结束循环
            //  if 偶数池子还有元素 
            //   if 偶数连续判断为真 生成失败 重新初始化
            //   else 随机取一个偶数 跳到判断
            // if 偶数池子没有元素了
            //  if 奇数连续判断为真 生成失败 重新初始化
            //  else 随机取一个奇数 跳到判断
            // if 奇数和偶数都有
            //  if 奇数连续判断为真 取偶数
            //  if 偶数连续判断为真 取奇数
            //  else 随机选择一个池子 随机从中取一个数
            // 
            // 判断语句
            // if 上面取的是奇数 奇数++ 偶数=0
            // else 上面取的是偶数 偶数++ 奇数=0
            // if 奇数==3 奇数连续判断=true
            // else 奇数连续判断=false
            // if 偶数==3 偶数连续判断=true
            // else 偶数连续判断=false

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
                // console.log(currentElement);
                if (currentElement != undefined) {
                    new_t.push(currentElement);
                }
                // console.log(new_t);
            }

            return new_t;
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
        fn: function (t) {
            // 生成式伪随机序列算法
            // 思想：将需要放进数组的元素按照需要的分类分成两个池子，随后从左到右依次生成这个数组。
            // 如果两个池子的元素都符合条件，则随机选择一个；如果只有一个盒子满足条件，则只选择其中一个。

            // 第一步，创建数字池
            // 在原始输入实际上不会修改的情况下，在函数内硬定义列表也不是一个坏事，但是注意这个方法不能推广
            // 需要推广的情况下，已知原始数组中的两种类别是交替排列的，那么把奇数元素抽出来，偶数元素抽出来分成两个list就可以了
            // 有一件好事是：这个list的旋转方向正好是交替排列的，这不巧了吗（

            const odd_list = t.filter(function(element, index) {
                return index % 2 == 0;
            });
            const even_list = t.filter(function(element, index) {
                return index % 2 != 0;
            });

            const original_odd_pool = [...Array(3)].flatMap(() => odd_list); //这个地方只需要复制3份
            const original_even_pool = [...Array(3)].flatMap(() => even_list); 

            //console.log(odd_pool)
            //console.log(even_pool)

            // 第二步，开始生成
            // 初始化 生成空数组
            // 初始化 两个判断变量 初始值为0
            // 
            // 循环下列语句
            // 取元素语句
            // if 奇数池子没有元素了 
            //  if 偶数池子也没有元素了 生成成功 停止生成 结束循环
            //  if 偶数池子还有元素 
            //   if 偶数连续判断为真 生成失败 重新初始化
            //   else 随机取一个偶数 跳到判断
            // if 偶数池子没有元素了
            //  if 奇数连续判断为真 生成失败 重新初始化
            //  else 随机取一个奇数 跳到判断
            // if 奇数和偶数都有
            //  if 奇数连续判断为真 取偶数
            //  if 偶数连续判断为真 取奇数
            //  else 随机选择一个池子 随机从中取一个数
            // 
            // 判断语句
            // if 上面取的是奇数 奇数++ 偶数=0
            // else 上面取的是偶数 偶数++ 奇数=0
            // if 奇数==3 奇数连续判断=true
            // else 奇数连续判断=false
            // if 偶数==3 偶数连续判断=true
            // else 偶数连续判断=false

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
                // console.log(currentElement);
                if (currentElement != undefined) {
                    new_t.push(currentElement);
                }
                // console.log(new_t);
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

