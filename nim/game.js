var players = [
    {"name": "Hugh", "type": "Human"},
    {"name": "Rob", "type": "Robot"}
];
var game_state = {
    "player_turn": 0,
    "stacks": [9, 9, 9]
};

function log(message){
    console.log(message);
};


function game_over(){
    for (stack in game_state["stacks"]){
        if (stack > 0){
            return false;
        };
    };
    return true;
};

function update_game_board(){
    return true;
};

function get_winner(){
    return players[0];
};

function get_robot_turn(){
    return {"stack": 0, "index": 0};
};

function take_turn(stack, index){
    game_state["stacks"][turn["stack"]] = index;
    game_state["player_turn"] = game_state["player_turn"] + 1
    if (game_state["player_turn"] == players.length){
        game_state["player_turn"] = 0;
    };
    update_game_board(game_state);
    if game_over(){
        var winner = get_winner();
        log(winner);
    };
    if (players[game_state["player_turn"]]["type"] == "Robot"){
        robot_turn = get_robot_turn();
        sleep(3);
        take_turn(robot_turn["stack"], robot_turn["index"])
    }
};
