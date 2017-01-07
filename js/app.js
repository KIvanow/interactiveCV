require.config({
	paths: {
		main: "./",
		libs: "./libs"
	}
});

require( ["main/game", "js/libs/pixi.js"], function( Game, PIXI ){
	window.game = new Game();
});