var Remarks = function( game, stage, y ){
	this.game = game;
	this.stage = stage;
	this.offsetY = y;
	this.fontSize = isMobile ? window.innerWidth / 40 : window.innerWidth / 60;
	
	this.text = new PIXI.Text( '',{fontFamily : 'Arial', fontSize: this.fontSize, fill : '#ffffff', align : 'center'});
	this.stage.addChild( this.text );
	this.text.anchor.set( 0.5 );	
	this.text.x = window.innerWidth / 2;	

	this.events = {
		shown: new Signal(),
		hidden: new Signal()
	}	

	this.addListeners();
};

Remarks.prototype.show = function( text ) {	
	this.text.text = text;	
	var endY = 	this.offsetY + this.text.height / 1.8;
	this.text.y = endY + this.text.height / 2;
	this.shown = true;	
	this.text.visible = true;
	new TimelineMax().to( this.text, 0.1, { y: endY, force3D:true, onComplete: function(){
	}});
	new TimelineMax().to( this.text, 0.1, { alpha: 0.8, force3D:true, onComplete: function(){
        this.events.shown.dispatch();
    }.bind(this)});  
};

Remarks.prototype.hide = function() {
	new TimelineMax().to( this.text, 0.1, { y: this.text.y + this.text.height * 2, force3D:true, onComplete: function(){
	}});
	new TimelineMax().to( this.text, 0.1, { alpha: 0, force3D:true, onComplete: function(){
        this.text.visible = false;
        this.shown = false;
        this.events.hidden.dispatch();
    }.bind(this)});  
};

Remarks.prototype.addListeners = function(){
	// counters
	var uPresses = 0;
	// the first show
	this.game.levelSplash.events.hidden.addOnce( function(){
		this.game.levelSplash.events.hidden.addOnce( function(){		
			if( !isMobile ){
				this.show( 'Hello desktop user, \n\t you can use your arrow keys to move and \n\t \'s\' to toggle sound, \'u\' to upgrade yourself, \'a\' \ \'b\' to attack on later levels' + '\n\t\n\t(just wait for an enemy to be close, jump and press left, to jump over it)' ); 
			} else {
				this.show( '(just wait for an enemy to be close, jump and press left, to jump over it)' );
			}
		}.bind(this));			
	}.bind(this));		


	this.game.events.levelCompleted.add( function( level ){
		if( level == 1 ){
			this.show( 'Well done! You managed to dodge some zombie kittens');
			setTimeout( function(){
				this.hide();
			}.bind(this), 3000 );

			this.game.levelSplash.events.hidden.addOnce( function(){
				this.show( 'You can now use \'a\' and \'b\' to attack now' ); 			
			}.bind(this) );
		} else if( level == 2 ){
			this.hide();
		} else if( level == 3 ){
			this.game.levelSplash.events.hidden.addOnce( function(){
				this.show( 'These enemies will attack only when near you!\n\tJump over them, like in level one, and backstab them!' ); 			
			}.bind(this) );
		}
	}.bind(this));

	this.game.navigation.events.buttonPressed.add( function( button ){
		if( button == 'powerup' ){
			uPresses++;
			if( uPresses % 5 == 0 ){
				if( this.shown ){
					this.hide();
					this.events.hidden.addOnce( function(){
						this.show( 'Don\'t abuse the power up so much' + new Array( Math.round( uPresses / 5 ) ).fill('!').join('') );
					}.bind(this));
				} else {
					this.show( 'Don\'t abuse the power up so much' + new Array( Math.round( uPresses / 5 ) ).fill('!').join('') );
				}
			}
		}
	}.bind(this));

	this.game.events.gameOver.add( function(){
		this.hide();
	}.bind(this));
	
	this.game.levelSplash.events.start.add( function(){
		this.hide();
	}.bind(this));

	// this.game.events.enemyDied.add( function(){
	// 	if( this.game.levelSplash.shown )
	// 		return;
	// 	if( !!~config.levelsRequirements.indexOf( this.game.score.value ) )
	// 		return;

	// 	if( this.shown ){
	// 		this.hide();
	// 		this.events.hidden.addOnce( function(){
	// 			this.show( 'Nice going, just ' + (this.game.getLevelsRequirements() - this.game.score.value) + ' kittens remaining');
	// 		}.bind(this));
	// 	} else {
	// 		this.show( 'Nice going, just ' + (this.game.getLevelsRequirements() - this.game.score.value) + ' kittens remaining');
	// 	}
	// 	// console.log( this.game.score.value, this.game.checkLevelRequirements() );
	// }.bind(this));

	this.game.events.showRemark.add( function( text ){
		if( this.shown ){
			this.hide();
			this.events.hidden.addOnce( function(){
				this.show( text );
			}.bind(this))
		} else {
			this.show( text );
		}
	}.bind(this));
};