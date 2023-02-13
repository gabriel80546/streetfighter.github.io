$(function () {
    initialize('gameBoard');
    if (location.hash !== '') {
	loadPreset(location.hash.substring(1));
    }
    else {
	randomizeBoard();
	drawBoard();
	updateCurrentPopulation();
	updateInfo();
    }

    $('#playpause').click(function () {
        if (g_playing) {
	    uiPause();
        }
        else {
	    uiPlay();
        }
    });

    $('#onetick').click(function () {
        if (!g_playing) {
	    refreshRules();
            tick();
        }
    });

    $('#gameBoard').click(function (evt) {
        var x = Math.floor((evt.pageX - $(this).offset().left) / 10);
        var y = Math.floor((evt.pageY - $(this).offset().top) / 10);
	if (g_board.charAt(x * g_boardWidth + y) === '0') {
	    g_board = modifyBoard(g_board, x, y, '1');
        }
	/*else if (g_board.charAt(x * g_boardWidth + y) === '1') {
	    g_board = modifyBoard(g_board, x, y, '2');
        }*/
        else {
	    g_board = modifyBoard(g_board, x, y, '0');
        }
        clearBoard();
        drawBoard();
	updateCurrentPopulation();
	updateInfo();
    });

    $('#gameBoard').mousemove(function (evt) {
	
    });

    $('#clear').click(function () {
        g_board = emptyBoard();
        clearBoard();
	updateCurrentPopulation();
	updateInfo();
    });

    $('#randomize').click(function () {
        randomizeBoard();
        clearBoard();
        drawBoard();
	updateCurrentPopulation();
	updateInfo();
    });

    $('#buchanan').click(function () {
        unleashBuch();
    });

    $('#resetSettings').click(function () {
	g_dieIf = '23';
	g_bornIf = '3';
	$('#rules').val('23/3');
	g_tickDelay = 250;
	$('#speedSlider').slider('value', 50);
    });

    $('#resetInfo').click(function () {
	g_tickCount = 0;
	g_totalPopulation = 0;
	g_maxPopulation = null;
	g_minPopulation = null;
	updateInfo();
    });

    $('#speedSlider').slider({
	change: function (evt, ui) {
	    g_tickDelay = 501 - (ui.value / 100) * 500;
	},
	value: 50
    });

    $('#presets a').click(function () {
	var preset = $(this).attr('href').substring(1);
	loadPreset(preset);
    });
});

function refreshRules () {
    var re = /^([0-8]+)\/([0-8]+)$/;
    var matches = re.exec($("#rules").val());
    if (matches) {
	g_dieIf = matches[1];
	g_bornIf = matches[2];
    }
    else {
	g_dieIf = "23";
	g_bornIf = "3";
	$("#rules").val("23/3");
    }
}

function uiPause () {
    pause();
    $('#playpause').text("Play");
}

function uiPlay () { 
    refreshRules();
    play();
    $('#playpause').text("Pause");
}

