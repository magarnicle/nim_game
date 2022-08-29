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
        "misere": false
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
    for (stack of game_state["stacks"]){
        if (stack > 0){
            return false;
        };
    };
    return true;
};

function update_game_board(){
    var all_stacks_display = '';
    for (stack in game_state["stacks"]){
        stack_display = '    <tr id="stack_' + stack + '">\n      <td>Stack ' + stack + ":</td>\n";
        for (var j=0; j<game_state["stacks"][stack]; j++){
            stack_display = stack_display + '      <td id="coin_' + j + '" onmouseup="take_turn(' + stack + ', ' + j + ')">' + j + '</td>\n';
        };
        stack_display = stack_display + '    </tr>\n';
        all_stacks_display = all_stacks_display + stack_display;
    };
    game_board.innerHTML = all_stacks_display;
};

function get_robot_turn(){
    var valid_stacks = [];
    for (stack in game_state["stacks"]){
        if (game_state["stacks"][stack] > 0){
            console.log("stack " + stack + " is valid with " + game_state["stacks"][stack] + " coins")
            valid_stacks.push(stack)
        }
    }
    stack_choice = valid_stacks[Math.floor(Math.random() * valid_stacks.length)]
    index_choice = Math.floor(Math.random() * game_state["stacks"][stack_choice])
    return {"stack": stack_choice, "index": index_choice};
};

function take_turn(stack, index){
    log(players[game_state["player_turn"]]["name"] + " took down to " + index + " on stack " + stack);
    game_state["stacks"][stack] = index;
    if (game_over()){
        update_game_board(game_state);
        if (game_state["misere"]){
            log("Game over! " + players[game_state["player_turn"]]["name"] + " won!!");
        } else {
            log("Game over! " + players[game_state["player_turn"]]["name"] + " lost!!");
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
        robot_turn = get_robot_turn();
        setTimeout(take_turn, 1000, robot_turn["stack"], robot_turn["index"])
    }
};

reset();
