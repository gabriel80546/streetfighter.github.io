
var g_canvas = null,
    g_context = null,
    g_boardWidth = 40,
    g_boardHeight = 40,
    g_board = '',
    g_history = [],
    g_historySize = 10,
    g_timeout = null,
    g_playing = false,
    g_dieIf = '23',
    g_bornIf = '3',
    g_tickDelay = 250,
    g_tickCount = 0,
    g_currentPopulation = 0,
    g_totalPopulation = 0,
    g_maxPopulation = null,
    g_minPopulation = null;

function initialize (id) {
    g_canvas = document.getElementById(id);
    g_context = g_canvas.getContext('2d');
    g_board = emptyBoard();
}

function emptyBoard () {
    var b = '';
    for (var i = 0; i < g_boardWidth * g_boardHeight; i++) {
	b += '0';
    }
    return b;
}

function modifyBoard (board, x, y, state) {
    var offset = x * g_boardWidth + y;
    return board.substring(0, offset) + new String(state).substring(0, 1) + board.substring(offset + 1);
}

function randomizeBoard () {
    for (var i = 0; i < 160; i++) {
        var x = Math.floor(Math.random() * g_boardWidth);
        var y = Math.floor(Math.random() * g_boardHeight);
	g_board = modifyBoard(g_board, x, y, '1');
    }
}

function unleashBuch () {
    var x = Math.floor(Math.random() * g_boardWidth);
    var y = Math.floor(Math.random() * g_boardHeight);
    g_board = modifyBoard(g_board, x, y, '2');
    drawBoard();
}

function nextBoard () {
    var newBoard = emptyBoard();

    for (var ix = 0; ix < g_boardWidth; ix++) {
        for (var iy = 0; iy < g_boardHeight; iy++) {
            // Rules taken from Wikipedia (except for the Buchanan stuff):
            // http://en.wikipedia.org/wiki/Conway%27s_life

            var n = neighbors(ix, iy);

	    if (g_board.charAt(ix * g_boardWidth + iy) !== '0') {
		if (g_board.charAt(ix * g_boardWidth + iy) === '2' || nearBuch(ix, iy)) {
		    newBoard = modifyBoard(newBoard, ix, iy, '2');
                }
                else if (g_dieIf.indexOf(n) !== -1) {
		    newBoard = modifyBoard(newBoard, ix, iy, '1');
                }
                else {
		    newBoard = modifyBoard(newBoard, ix, iy, '0');
                }
            }
            else {
                if (g_bornIf.indexOf(n) !== -1) {
		    newBoard = modifyBoard(newBoard, ix, iy, '1');
                }
                else {
		    newBoard = modifyBoard(newBoard, ix, iy, '0');
                }
            }
        }
    }
    g_board = newBoard;
}

function neighbors (x, y) {
    var n = 0;
    for (var ix = x - 1; ix <= x + 1; ix++) {
        for (var iy = y - 1; iy <= y + 1; iy++) {
            if (ix === x && iy === y) {
                continue;
            }
            if (ix >= 0 && ix < g_boardWidth && iy >= 0 && iy < g_boardHeight) {
		if (g_board.charAt(ix * g_boardWidth + iy) !== '0') {
                    n++;
                }
            }
        }
    }
    return n;
}

function nearBuch (x, y) {
    for (var ix = x - 1; ix <= x + 1; ix++) {
        for (var iy = y - 1; iy <= y + 1; iy++) {
            if (ix === x && iy === y) {
                continue;
            }
            if (ix >= 0 && ix < g_boardWidth && iy >= 0 && iy < g_boardHeight) {
		if (g_board.charAt(ix * g_boardWidth + iy) === '2') {
                    return true;
                }
            }
        }
    }
    return false;
}

function drawCell (x, y) {
    g_context.fillStyle = '#7c9';
    g_context.fillRect(x * 10, y * 10, 10, 10);
}

function drawBuch (x, y) {
    g_context.fillStyle = '#c44';
    g_context.fillRect(x * 10, y * 10, 10, 10);
}

function clearBoard () {
    g_context.fillStyle = '#fff';
    g_context.fillRect(0, 0, 400, 400);
}

function drawBoard () {
    for (var ix = 0; ix < g_boardWidth; ix++) {
        for (var iy = 0; iy < g_boardHeight; iy++) {
	    if (g_board.charAt(ix * g_boardWidth + iy) === '1') {
                drawCell(ix, iy);
            }
	    else if (g_board.charAt(ix * g_boardWidth + iy) === '2') {
                drawBuch(ix, iy);
            }
        }
    }
}

function archiveBoard () {
    if (g_history.length === g_historySize) {
	g_history = g_history.slice(1);
    }
    g_history.push(g_board);
}

function play () {
    var g_timeout = window.setTimeout(tick, g_tickDelay);
    g_playing = true;
}

function pause () {
    window.clearTimeout(g_timeout);
    g_playing = false;
}

function updateInfo () {
    $('#tickCount').text(g_tickCount);
    $('#population').text(g_currentPopulation);
    $('#avgPopulation').text(g_totalPopulation ? Math.round(g_totalPopulation / g_tickCount * 10) / 10
			                       : '');
    $('#maxPopulation').text(g_maxPopulation !== null ? g_maxPopulation : '');
    $('#minPopulation').text(g_minPopulation !== null ? g_minPopulation : '');
}

function updateCurrentPopulation () {
    g_currentPopulation = 0;
    for (var i = 0; i < g_board.length; i++) {
	if (g_board.charAt(i) !== '0') {
	    g_currentPopulation++;
	}
    }
    if (g_currentPopulation < g_minPopulation || g_minPopulation === null) {
	g_minPopulation = g_currentPopulation;
    }
    if (g_currentPopulation > g_maxPopulation || g_maxPopulation === null) {
	g_maxPopulation = g_currentPopulation;
    }
}

function tick () {
    archiveBoard();
    nextBoard();
    if (g_board !== g_history[g_history.length - 1]) {
	clearBoard();
	drawBoard();
	g_tickCount++;
	updateCurrentPopulation();
	g_totalPopulation += g_currentPopulation;
    }
    else {
	if (g_playing) {
	    g_playing = false;
	    uiPause();
	}
    }
    updateInfo();
    if (g_playing) {
        play();
    }
}

function loadPreset (preset) {
    var presets = {
	glider_gun: [[1,5], [1,6], [2,5], [2,6], [11,5], [11,6], [11,7], [12,4], [12,8], [13,3], [13,9], [14,3], [14,9],
		     [15,6], [16,4], [16,8], [17,5], [17,6], [17,7], [18,6], [21,3], [21,4], [21,5], [22,3], [22,4],
		     [22,5], [23,2], [23,6], [25,1], [25,2], [25,6], [25,7], [35,3], [35,4], [36,3], [36,4]
		    ],

        pulsar: [[16,14], [17,14], [18,14], [22,14], [23,14], [24,14], [14,16],
                 [19,16], [21,16], [26,16], [14,17], [19,17], [21,17], [26,17],
                 [14,18], [19,18], [21,18], [26,18], [16,19], [17,19], [18,19],
                 [22,19], [23,19], [24,19], [16,21], [17,21], [18,21], [22,21],
                 [23,21], [24,21], [14,22], [19,22], [21,22], [26,22], [14,23],
                 [19,23], [21,23], [26,23], [14,24], [19,24], [21,24], [26,24],
                 [16,26], [17,26], [18,26], [22,26], [23,26], [24,26]]
    };

    var b = emptyBoard();
    if (presets[preset]) {
	var a = presets[preset];
	for (var i = 0; i < a.length; i++) {
	    b = modifyBoard(b, a[i][0], a[i][1], '1');
	}
	g_board = b;
	clearBoard();
	drawBoard();
	updateCurrentPopulation();
	updateInfo();
    }
}