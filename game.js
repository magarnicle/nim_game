var game_board = document.getElementById("game_board");
var game_log = document.getElementById("game_log");
var start_game_button = document.getElementById("start_button")
var reset_button = document.getElementById("reset_button")
var settings = document.getElementById("settings");
var misere_button = document.getElementById("misere_button");
var starting_player = document.getElementsByName("starting_player");
var game_state = {};
var saved_game_state = {};

function reset(){
    for (key of Object.keys(saved_game_state)){
        if (key == "players" || key == "stacks"){
            game_state[key] = Array.from(saved_game_state[key]);
        } else {
            game_state[key] = saved_game_state[key];
        };
    }
    enable_settings();
    start_game_button.style.visibility = "visible";
    game_log.innerHTML = "Welcome to Nim, again!"
    update_game_board();
};

function enable_settings(){
    for (var node of settings.children){
        node.disabled = false;
    }
};

function disable_settings(){
    for (var node of settings.children){
        node.disabled = true;
    }
};

function new_game(){
    reset_button.style = "visibility: hidden";
    var stacks = []
    for (var i=0; i<Math.round(Math.random() * 5); i++){
        stacks.push(Math.round(Math.random() * 10));
    };
    if (stacks.length < 2){
        stacks.push(Math.round(Math.random() * 10));
    };
    stacks.sort(function(a, b){return a - b});
    var player_turn = starting_player[0].checked ? 0 : 1;
    game_state = {
        "players": [
            {"name": "You", "type": "Human"},
            {"name": "Robot", "type": "Robot"}
        ],
        "player_turn": player_turn,
        "stacks": stacks,
        "misere": misere_button.checked,
        "locked": true,
        "robot_level": 2
    };
    for (key of Object.keys(game_state)){
        if (key == "players" || key == "stacks"){
            saved_game_state[key] = Array.from(game_state[key]);
        } else {
            saved_game_state[key] = game_state[key];
        };
    };
    enable_settings();
    start_game_button.style = "visibility: visible";
    game_log.innerHTML = "Welcome to Nim!"
    update_game_board();
};

function start_game(){
    game_state["locked"] = false;
    start_game_button.style = "visibility: hidden";
    reset_button.style = "visibility: visible";
    var player_turn = starting_player[0].checked ? 0 : 1;
    game_state["player_turn"] = player_turn;
    game_state["misere"] = misere_button.checked;
    game_state["robot_level"] = 2;
    if (game_state["players"][game_state["player_turn"]]["type"] == "Robot"){
        var robot_turn = get_robot_turn();
        game_state["locked"] = true;
        setTimeout(_take_turn, 500, robot_turn["stack"], robot_turn["index"], true)
    }
    disable_settings();
    update_game_board();
}

function log(message){
    console.log(message);
    game_log.innerHTML = game_log.innerHTML + "<br>" + message;
};


function game_over(){
    for (var stack of game_state["stacks"]){
        if (stack > 0){
            return false;
        };
    };
    return true;
};

function update_game_board(){
    update_game_board_vertical();
    //update_game_board_horizontal();
};

function update_game_board_horizontal(){
    var all_stacks_display = '';
    for (var stack in game_state["stacks"]){
        var stack_display = '    <tr  style="border-style: solid" id="stack_' + stack + '">\n      <td style="border-style: solid">Stack ' + stack + ":</td>\n";
        for (var i=0; i<game_state["stacks"][stack]; i++){
            stack_display += '      <td style="border-style: solid" id="coin_' + stack + ',' + i + '" onmouseup="take_turn(' + stack + ', ' + i + ')">' + i + '</td>\n';
        };
        stack_display += '    </tr>\n';
        all_stacks_display += stack_display;
    };
    game_board.innerHTML = all_stacks_display;
};

function update_game_board_vertical(){
    var all_stacks_display = ''
    var max_coins = Math.max(...saved_game_state["stacks"])
    for (var i=max_coins-1; i>=0; i--){
        all_stacks_display += '    <tr style="border-style: solid" >'
        for (var stack in game_state["stacks"]){
            if (game_state["stacks"][stack] > i){
                all_stacks_display += '      <td class="coin" id="coin_' + stack + ',' + i + '" onmousedown="highlight_coins(' + stack + ', ' + i + ')"onmouseover="highlight_coins(' + stack + ', ' + i + ')" onmouseout="highlights_off()" style="border-style: solid" id="coin_' + i + '" onmouseup="take_turn(' + stack + ', ' + i + ')">' + '</td>\n';
            } else {
                all_stacks_display += '      <td style="border-style: none"></td>\n';
            }
        };
        all_stacks_display += '    </tr>'
    }
    all_stacks_display += '    <tr style="border-style: solid" >'
    for (var stack in game_state["stacks"]){
        all_stacks_display += '\n      <td id="stack_' + stack + '" style="border-top-style: solid; color: #999999" ></td>\n';
    };
    all_stacks_display += '\n</tr>'
    game_board.innerHTML = all_stacks_display;
};

function get_robot_turn(){
    switch (game_state["robot_level"]) {
        case 0:
            return get_robot_turn_level_0()
            break;
        case 1:
            return get_robot_turn_level_1()
            break
        case 2:
            return get_robot_turn_level_2()
            break
        default:
            return get_robot_turn_level_0()
    };
};

function get_valid_stacks(){
    var valid_stacks = [];
    for (var stack in game_state["stacks"]){
        if (game_state["stacks"][stack] > 0){
            console.log("stack " + stack + " is valid with " + game_state["stacks"][stack] + " coins")
            valid_stacks.push(stack)
        }
    }
    return valid_stacks;
};

function get_robot_turn_level_0(){
    var valid_stacks = get_valid_stacks();
    var stack_choice = valid_stacks[Math.round(Math.random() * (valid_stacks.length - 1))]
    var index_choice = Math.round(Math.random() * game_state["stacks"][stack_choice])
    return {"stack": stack_choice, "index": index_choice};
};

function get_robot_turn_level_1(){
    // Just stall - take one off the biggest stack each time until you can win.
    var valid_stacks = get_valid_stacks();
    if (valid_stacks.length == 1){
        stack_choice = valid_stacks[0];
        if (game_state["misere"] && game_state["stacks"][stack_choice] > 1){
            index_choice = 1;
        } else {
            index_choice = 0;
        }
    } else {
        var max_coins_index = 0;
        for (var stack in valid_stacks){
            if (game_state["stacks"][stack] > game_state["stacks"][max_coins_index]){
                max_coins_index = stack;
            };
        };
        stack_choice = max_coins_index;
        index_choice = game_state["stacks"][stack_choice] - 1;
    };
    return {"stack": stack_choice, "index": index_choice};
};

function get_robot_turn_level_2(){
    var valid_stacks = get_valid_stacks();
    if (valid_stacks.length == 1){
        var stack_choice = valid_stacks[0];
        if (game_state["misere"] && game_state["stacks"][stack_choice] > 1){
            var index_choice = 1;
        } else {
            var index_choice = 0;
        }
        return {"stack": stack_choice, "index": index_choice};
    };
    var current_nim_number = calculate_nim_number(game_state["stacks"]);
    var future_stacks = Array.from(game_state["stacks"]);
    var lowest_nim_number = null;
    var possible_losing_moves = [];
    for (var stack in future_stacks){
        var saved_coin_number = future_stacks[stack];
        if (saved_coin_number == 0){
            continue;
        };
        for (var i=0; i < saved_coin_number; i++){
            future_stacks[stack] = future_stacks[stack] - 1;
            var this_best = false;
            var future_nim_number = calculate_nim_number(future_stacks);
            if (lowest_nim_number === null){
                if (future_nim_number == 0){
                    this_best = true;
                } else {
                    possible_losing_moves.push({"stack": stack, "index": future_stacks[stack]})
                };
            } else {
                if (future_nim_number == 0){
                    if (lowest_nim_number["nim_number"] == 0){
                        // Win quickly
                        if (i > lowest_nim_number["coins_taken"]){
                            this_best = true;
                        };
                    } else {
                        this_best = true;
                    };
                } else if (lowest_nim_number["nim_number"] != 0){
                    possible_losing_moves.push({"stack": stack, "index": future_stacks[stack]})
                };
            };
            if (this_best){
                lowest_nim_number = {"stack": stack, "index": future_stacks[stack], "coins_taken": i + 1, "nim_number": future_nim_number};
            };
        };
        future_stacks[stack] = saved_coin_number;
    };
    if (lowest_nim_number === null){
        lowest_nim_number = possible_losing_moves[Math.round(Math.random() * (possible_losing_moves.length - 1))]
    }
    // Are we at the end game?
    future_stacks[lowest_nim_number["stack"]] = lowest_nim_number["index"];
    var single_stacks = 0;
    var multi_stacks = false;
    for (var stack in future_stacks){
        if (future_stacks[stack] > 1){
            multi_stacks = true;
            break
        };
        if (future_stacks[stack] == 1){
            single_stacks++;
        };
    };
    if (!multi_stacks){
        // For misere, we need to leave an odd number of single-coin stacks. For normal mode we want an even number.
        if (single_stacks % 2 == 0){
            if (game_state["misere"]){
                lowest_nim_number["index"] = 0;
            };
        } else {
            if (!game_state["misere"]){
                lowest_nim_number["index"] = 0;
            }
        };
    };
    return {"stack": lowest_nim_number["stack"], "index": lowest_nim_number["index"]};
};

function calculate_nim_number(stacks){
    // bitwise-xor all the stacks together
    var nim_number = 0;
    for (var stack in stacks){
        nim_number = nim_number ^ stacks[stack]
    };
    return nim_number;
};

function sleep(milliseconds){
    start = Date.now()
    while (Date.now().valueOf() - start.valueOf() < milliseconds){
        continue    
    };
}

function take_turn(stack, index){
    if (!game_state["locked"]){
        _take_turn(stack, index, false);
    };
};

function _take_turn(stack, index, lock){
    if (lock){
        game_state["locked"] = true;
    };
    log(game_state["players"][game_state["player_turn"]]["name"] + " took coins " + (Number(index) + 1) + " and up on stack " + (Number(stack) + 1));
    game_state["stacks"][stack] = index;
    if (game_over()){
        update_game_board(game_state);
        if (game_state["misere"]){
            other_player = game_state["player_turn"] ^ 1;
            log("Game over! " + game_state["players"][other_player]["name"] + " won!!");
        } else {
            log("Game over! " + game_state["players"][game_state["player_turn"]]["name"] + " won!!");
        };
        return;
    };
    game_state["player_turn"] = game_state["player_turn"] + 1
    if (game_state["player_turn"] == game_state["players"].length){
        game_state["player_turn"] = 0;
    };
    update_game_board(game_state);
    if (game_state["players"][game_state["player_turn"]]["type"] == "Robot"){
        var robot_turn = get_robot_turn();
        sleep(300);
        highlight_coins(robot_turn["stack"], robot_turn["index"]);
        game_state["locked"] = true;
        setTimeout(_take_turn, 200, robot_turn["stack"], robot_turn["index"], true)
    }
    if (lock){
        game_state["locked"] = false;
    };
};

function highlight_coins(stack, index){
    if (game_state["locked"]){
        return;
    };
    for (var i=index; i<game_state["stacks"][stack]; i++){
        var coin = document.getElementById("coin_" + stack + "," + i);
        coin.style.backgroundColor = "#0088AA88";
    };
};

function highlights_off(){
    var coins = document.getElementsByClassName("coin");
    for (coin of coins){
        coin.style.backgroundColor = null;
    };

};

new_game();
