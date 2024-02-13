let jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data
            .get()
            .localSave('csv','data.csv')
            }
}); //初始化jsPsych

let instruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <div class='experiment-instruction'> 
    <p>这是一个奇偶判断实验</p>
    <p>当你看到屏幕上的数字后，请按键反应</p>
    <p>如果数字是奇数（单数），请按 F 键</p>
    <p>如果数字是偶数（双数），请按 J 键</p>
    </div>
    `,
    post_trial_gap: 500
} //定义实验用的div，方便操控所有CSS

let trials = {
    type: jsPsychHtmlKeyboardResponse,
    save_trial_parameters:{
        trial_duration: true, 
        choices: true,
        post_trial_gap: true
    },
    data: {
        category: jsPsych.timelineVariable('category')
    },
    timeline:[
        {  //空屏
            stimulus: jsPsych.timelineVariable('content'), 
            choices: 'NO_KEYS',
            trial_duration: 1000
        },
        { //注视点
            stimulus: "<div class='experiment-content'>+</div>", 
             choices: 'NO_KEYS', 
            trial_duration: 500, 
            post_trial_gap: function() {
                random_interval = 400 + 200*Math.random();
                return random_interval;
            }
        },
        {  //刺激
            stimulus: jsPsych.timelineVariable('content'), 
            choices: ["f","j"],
            trial_duration: 150
        },
        {  //空屏
            stimulus: jsPsych.timelineVariable('content'), 
            choices: ["f","j"]
        }
    ],
    timeline_variables:[ 
        { content: "<div class='experiment-content'>1</div>", category: 1},
        { content: "<div class='experiment-content'>2</div>", category: 2},
        { content: "<div class='experiment-content'>3</div>", category: 1},
        { content: "<div class='experiment-content'>4</div>", category: 2},
        { content: "<div class='experiment-content'>5</div>", category: 1},
        { content: "<div class='experiment-content'>6</div>", category: 2}
    ],
    sample:{
        type: 'fixed-repetitions',
        size: 2
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
    <div class='experiment-instruction'><p>实验已结束</p></div>
    `,
    post_trial_gap: 500
}

jsPsych.run([
    instruction,trials,ending
])

