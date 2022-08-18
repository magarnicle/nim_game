var game_board = document.getElementById("game_board");
var game_log = document.getElementById("game_log");
var players = [
    {"name": "Hugh", "type": "Human"},
    {"name": "Rob", "type": "Robot"}
];
var game_state = {
    "player_turn": 0,
    "stacks": [9, 9, 9],
    "misere": false
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
    return {"stack": 0, "index": 0};
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
        return;
    };
    game_state["player_turn"] = game_state["player_turn"] + 1
    if (game_state["player_turn"] == players.length){
        game_state["player_turn"] = 0;
    };
    update_game_board(game_state);
    if (players[game_state["player_turn"]]["type"] == "Robot"){
        robot_turn = get_robot_turn();
        setTimeout(take_turn, 2000, robot_turn["stack"], robot_turn["index"])
    }
};

update_game_board();
