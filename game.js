class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

generate_state = function(n){
    var out = [];
    for(var i = 0; i < n; i++){
        for(var j = 0; j < n; j++){
            out.push({
                location: new Point(i, j),
                value: 0
            });
        }
    }

    rnd_coord = () => Math.floor(n*Math.random());
    for(var i = 0; i < 1000; i++){
        m = [rnd_coord(), rnd_coord()];
        M = [rnd_coord() + m[0],
             rnd_coord() + m[1]];
        if(M[0] - m[0] >= 1 &&
           M[1] - m[1] >= 1 &&
           M.concat(m).map(x => x < n).indexOf(false) == -1){
            out.forEach(function(e){
                if(e.location.x >= m[0] &&
                   e.location.y >= m[1] &&
                   e.location.x <= M[0] &&
                   e.location.y <= M[1]){
                    e.value = (e.value + 1) % 2
                }
            });
        }
    }

    return out;
}

render_state = function(state){
    for(i in state){
        var e = state[i];
        $(`#cell-${e.location.x}-${e.location.y}`)
            .addClass(`value-${e.value}`)
            .attr("data-value", e.value);
    }
}

clear_grid = function(){
    $("#game_container").html("");
}

resize_grid = function(n){
    var m = 0.7 * (Math.min($(window).height(), $(window).width()) / n);
    $(".cell").height(`${m}px`);
    $(".cell").width(`${m}px`);
}

generate_grid = function(n){
    var content = ""
    for(var i = 0; i < n; i++){
        content += '<div class="cell_row row" align="center">'
        for(var j = 0; j < n; j++){
            content += `<div id="cell-${i}-${j}" class="cell"></div>`
        }
        content += "</div>"
    }

    $("#game_container").html(content);

    resize_grid(n);
    $(window).resize(function(){
        resize_grid(n);
    }.bind(n, n));
}

get_selected = function(){
    var arr =  $(".selected").toArray().map(x => x.id.split("-"));
    return arr.map(x => new Point(Number(x[1]),
                                  Number(x[2])
                                 )
                  );
}

get_bounds = function(){
    if($(".selected-first").length > 0 && $(".selected-last").length > 0){
        var getP = arr => (x => new Point(Number(x[1]), Number(x[2])))(arr[0].id.split("-"));
        var p1 = getP($(".selected-first"));
        var p2 = getP($(".selected-last"));

        var xs = [p1.x, p2.x];
        var ys = [p1.y, p2.y];
    } else{
        var xs = get_selected().map(e => e.x);
        var ys = get_selected().map(e => e.y);
    }

    function sortNumber(a,b) {
        return a - b;
    }
    var m = new Point(xs.sort(sortNumber)[0], ys.sort(sortNumber)[0]);
    var M = new Point(xs.sort(sortNumber).pop(), ys.sort(sortNumber).pop());

    return [m, M]
}

$(document).mousedown(
    function(){
        $(".cell").hover(function(e){
            if($(".selected").length == 0){
                $(this).addClass("selected-first");
            }
            $(this).addClass("selected-last");
            $(".cell").removeClass("selected");
            var loc =  (x => new Point(Number(x[1]), Number(x[2])))(this.id.split("-"));
            $(".cell").filter(function(e){
                var bounds = get_bounds();
                var m = bounds[0];
                var M = bounds[1];
                var loc =  (x => new Point(Number(x[1]), Number(x[2])))(this.id.split("-"));
                return loc.x >= m.x &&
                    loc.x <= M.x &&
                    loc.y >= m.y &&
                    loc.y <= M.y
            }).addClass("selected")
            $(this).removeClass("selected-last");
        });
    }
);

is_legal_move = function(){

    var bounds = get_bounds();
    var m = bounds[0];
    var M = bounds[1];

    return Math.min(M.x - m.x, M.y - m.y) >= 1;
}

is_solved = function(){
    return $(".cell")
        .toArray()
        .map(e => Number($(`#${e.id}`).attr("data-value")) == 1)
        .indexOf(false) == -1;
}

$(document).mouseup(
    function(){
        $(".cell").off();
        if(is_legal_move()){
            $(".selected").each(function(e){
                var v = Number($(this).attr("data-value"));
                $(this).removeClass(`value-${v}`);
                $(this).addClass(`value-${(v + 1) % 2}`);
                $(this).attr("data-value", (v + 1) % 2);
            });
        }
        $(".cell").removeClass("selected");
        $(".cell").removeClass("selected-first");
        $(".cell").removeClass("selected-last");
        if(is_solved()){
            window.setTimeout(function(){
                alert("Good job!");
                next_level();
            }, 200);
        }
    }
);

$(document).on("touchstart",
               () => {
                   $(document).trigger("mousedown");
               }
              );


$(document).on("touchmove",
               (e) => {
                   var t = e.touches[0];
                   var id = document.elementFromPoint(t.clientX, t.clientY).id;
                   if(id.length > 2){
                       $(`#${id}`).trigger("mouseover");
                   }
               }
              );

$(document).on("touchend",
               () => {
                   $(document).trigger("mouseup");
               }
              );

next_level = function(){
    var lvl = Number($("#game_container").attr("data-level")) + 2;
    $("#game_container").attr("data-level", lvl);
    clear_grid();
    generate_grid(lvl);
    render_state(generate_state(lvl));
}

init = function(){
    $("#game_container").attr("data-level", 1);
    next_level();
}

$(document).ready( () => init() );
