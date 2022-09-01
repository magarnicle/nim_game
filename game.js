var game_board = document.getElementById("game_board");
var game_log = document.getElementById("game_log");
var reset_button = document.getElementById("reset_button")
var players = [];
var game_state = {};
function reset(){
    players = [
        {"name": "Hugh", "type": "Human"},
        {"name": "Rob", "type": "Robot"}
    ];
    game_state = {
        "player_turn": 0,
        "stacks": [9, 9, 9],
        "misere": true,
        "robot_level": 2,
    };
    reset_button.style = "visibility:hidden";
    game_log.innerHTML = "Welcome to Nim!"
    update_game_board();
};

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
    var all_stacks_display = '';
    for (var stack in game_state["stacks"]){
        var stack_display = '    <tr id="stack_' + stack + '">\n      <td>Stack ' + stack + ":</td>\n";
        for (var j=0; j<game_state["stacks"][stack]; j++){
            stack_display = stack_display + '      <td id="coin_' + j + '" onmouseup="take_turn(' + stack + ', ' + j + ')">' + j + '</td>\n';
        };
        stack_display = stack_display + '    </tr>\n';
        all_stacks_display = all_stacks_display + stack_display;
    };
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
    var stack_choice = valid_stacks[Math.floor(Math.random() * valid_stacks.length)]
    var index_choice = Math.floor(Math.random() * game_state["stacks"][stack_choice])
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
                this_best = true;
            } else {
                if (future_nim_number < lowest_nim_number["nim_number"]){
                    this_best = true;
                };
                if (future_nim_number == lowest_nim_number["nim_number"] && i < lowest_nim_number["coins_taken"]){
                    this_best = true;
                };
            };
            if (this_best){
                lowest_nim_number = {"stack": stack, "index": future_stacks[stack], "coins_taken": i + 1, "nim_number": future_nim_number};
            };
        };
        future_stacks[stack] = saved_coin_number;
    };
    if (game_state["misere"]){
        // We might have to modify our move if all remaining stacks have a single coin
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
            if (single_stacks % 2 == 0){
                // We need to leave an odd number of single-coin stacks. See if we can
                // take one less coin from our selected stack
                if (game_state["stacks"][lowest_nim_number["stack"]] > 2){
                    lowest_nim_number["index"]++;
                } else {
                    // Remove a stack
                    for (var stack of game_state["stacks"]){
                        if (game_state["stacks"][stack] > 1){
                            lowest_nim_number["stack"] = stack;
                            lowest_nim_number["index"] = 0;
                            break
                        };
                        if (game_state["stacks"][stack] == 1){
                            lowest_nim_number["stack"] = stack;
                            lowest_nim_number["index"] = 0;
                        };
                    };
                }
            };
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

function take_turn(stack, index){
    log(players[game_state["player_turn"]]["name"] + " took down to " + index + " on stack " + stack);
    game_state["stacks"][stack] = index;
    if (game_over()){
        update_game_board(game_state);
        if (game_state["misere"]){
            log("Game over! " + players[game_state["player_turn"]]["name"] + " lost!!");
        } else {
            log("Game over! " + players[game_state["player_turn"]]["name"] + " won!!");
        };
        reset_button.style = "visibility:visible";
        return;
    };
    game_state["player_turn"] = game_state["player_turn"] + 1
    if (game_state["player_turn"] == players.length){
        game_state["player_turn"] = 0;
    };
    update_game_board(game_state);
    if (players[game_state["player_turn"]]["type"] == "Robot"){
        var robot_turn = get_robot_turn();
        setTimeout(take_turn, 1000, robot_turn["stack"], robot_turn["index"])
    }
};

reset();
