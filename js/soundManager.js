var SoundManager = function( game ){
	this.player = new AudioWrapper();

	// game.events.start.addOnce( function(){
	if( this.player.isReady() ){
		this.player.playBackground( 'hardRock');
	} else {
		this.player.events.ready.addOnce( function(){
			this.player.playBackground( 'hardRock');
		}.bind(this));
	}

	game.events.gameOver.add( function(){
		this.player.play( 'gameLooseSound2' );
	}.bind(this));

	game.navigation.events.buttonPressed.add( function( button ){
		var excluded = [ 'up', 'down', 'left', 'right', 'a', 'b'];
		if( !!~excluded.indexOf( button ) )
			return;
		this.player.play( 'button_click' );
	}.bind(this));

	game.events.enemyDied.add( function( enemy ){
		if( enemy.name == 'zombie' ){
			this.player.play( 'deathZombie' );
		} else {
			this.player.play( 'death' );
		}
	}.bind(this));

	game.mainCharacter.events.attack.add( function(){
		this.player.play( 'attack1' );
	}.bind(this));

	game.events.levelCompleted.add( function(){
		this.player.play( 'completetask' );
	}.bind(this))
}