var Game = function(){
	this.cheat = false;
	this.paused = false;
	this.settings = {
		sound: true,
	}
	
	this.events = {
		enemyWalkedOutside: new Signal(),
		orientationPortrait: new Signal(),
		orientationLandscape:new Signal(),
		start: new Signal(),
		gameOver: new Signal(),
		enemyDied:new Signal(),
		levelCompleted: new Signal(),
		showRemark: new Signal(),
	};		

	this.resizeListeners();	

	if( window.innerWidth > window.innerHeight ){
		this.init();
	}	
};

Game.prototype.getLevelsRequirements = function(){
	var total = 0;
	for( var i = 0; i <= this.level; i++ ){
		total += config.levelsRequirements[ i ] || config.levelsRequirements[ config.levelsRequirements.length - 1 ];
	}
	return total;
};

Game.prototype.getEnemiesIntervals = function(){
	return config.enemiesIntervals[ this.level ] || config.enemiesIntervals[ config.enemiesIntervals.length - 1 ];
};

Game.prototype.init = function(){		
	this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, {autoresize: true, roundPixels: true, antialias: true, transparent: true });
	
	document.body.appendChild( this.renderer.view);

	this.stage = new PIXI.Container();
	this.background = new Background( this.stage );
	this.charactersContainer = new PIXI.Container();
	this.stage.addChild( this.charactersContainer );
	setTimeout( function(){
		this.mainCharacter = new Character( this.charactersContainer, this.background.getTop(), this.isPaused.bind(this) );	
		this.mainCharacter.events.dead.addOnce( function(){
			this.levelSplash.show( 'death' );			
			this.events.gameOver.dispatch();
			this.levelSplash.events.hidden.addOnce( function(){
				this.restart();
			}.bind(this));
		}.bind(this));		
		this.soundManager = new SoundManager( this );
		this.remarks = new Remarks( this, this.stage, this.score.text.y + this.score.text.height / 2 );
	}.bind(this), 0);
	this.score = new Score( this.stage );
	this.enemies = [];
	this.navigation = new Navigation( this.stage );
	this.levelSplash = new LevelSplash( this.stage );	
	if( !isMobile ){
		this.navigation.hide();
	}

	this.animate();		

	this.addListeners();

	this.levelSplash.show( 'intro' );

	this.levelSplash.events.hidden.addOnce( function(){
		this.start();	

		
		this.levelSplash.events.hidden.addOnce( function(){
			this.score.text.alpha = 1;		
		}.bind(this));			
	}.bind(this));			
};


Game.prototype.animate = function() {
	this.checkEnemies();

	this.checkLevelRequirements();

    requestAnimationFrame(this.animate.bind(this));

    // render the container
    this.renderer.render(this.stage);
};

Game.prototype.addListeners = function(){
	this.navigation.events.buttonPressed.add( function(  buttonId  ){
		if( this.levelSplash.shown !== false )
			return;

		switch ( buttonId ) {
		  	case 'left':
		    	this.mainCharacter.move( -1 );
		    break;	
		  	case 'right':
		    	this.mainCharacter.move( 1 );
		    break;	
		    case 'up':
		    	this.mainCharacter.jump();
		    break;		  		  	
		    case 'down':
		    	// this.mainCharacter.stop();
		    break;		  		  	
		    case 'a':
		    	this.mainCharacter.attack( 'a' );
		    break;		    
         	case 'b':
         	    this.mainCharacter.attack( 'b' );         	    
		    break;
		    case 'sound':
         	    this.settings.sound = !this.settings.sound;
         	    if( this.settings.sound ){
         	    	this.navigation.buttons.sound.alpha = 1;
         	    	this.soundManager.player.unMute();
         	    } else {
         	    	this.navigation.buttons.sound.alpha = 0.6;
         	    	this.soundManager.player.setMute();
         	    }
		    break;
		    case 'powerup':
		    	this.mainCharacter.powerup();
		    break;
		}
	}.bind(this));
	this.navigation.events.buttonUnPressed.add( function( buttonId ){	
		this.moving = false;	
		this.mainCharacter.stop();
	}.bind(this));
	
	this.navigation.events.combo.add( function( comboId ){
		this.mainCharacter.combo( comboId );
	}.bind(this));


	this.levelSplash.events.optionChosen.addOnce( function( param ){								
		if( this.levelSplash.shown == 'death' ){
			if( param == 0 ){
				this.restart();
			} else {
				window.location.href = 'https://www.linkedin.com/in/kristiyan-ivanov-8b3b5671?trk=hp-identity-name';
			}
		} else if( this.levelSplash.shown == 'intro' ){
			window.location.href = 'https://www.linkedin.com/in/kristiyan-ivanov-8b3b5671?trk=hp-identity-name';
		}
	}.bind(this) );	

	var requirementsChanged = false;
	this.events.enemyDied.add( function(){
		if( this.level === 2 && this.getLevelsRequirements() - 1 >= this.score.value && !requirementsChanged ){
			setTimeout( function(){
				config.levelsRequirements[ this.level ] += 2;
				this.events.showRemark.dispatch( 'You just became team leader of a Dev team\n\tThe team got bigger and no longer consists only of developers.\n\tYou have to kill 2 more kittens now...' );
			}.bind(this), 500);
			requirementsChanged = true;			
		}
	}.bind(this));
};

Game.prototype.resizeListeners = function(){
	var resizeHandler = function(){		
		if( window.innerHeight > window.innerWidth ){						
			this.events.orientationPortrait.dispatch();
			this.showPortraitWarning();
			if( this.stage ){
				this.pause();
			}			
		} else {
			this.events.orientationLandscape.dispatch();			
			if( !this.stage ){
				setTimeout( function(){
					this.init();
				}.bind(this), 10);
			} else {
				this.resume();
			}
			this.hidePortraitWarning();						
		}		

	}.bind(this);
	
	setInterval( function(){
		resizeHandler();	
	}.bind(this), 100 );	

	window.onResize = resizeHandler;
};

Game.prototype.showPortraitWarning = function(){
	if( this.renderer )
		this.renderer.view.style.opacity = 0;

	document.getElementById( 'orientationWarning' ).style.width = Math.round( window.innerWidth * 0.8 ) + 'px';
	document.getElementById( 'orientationWarning' ).style.left = Math.round( window.innerWidth * 0.1 )  + 'px';
	document.getElementById( 'orientationWarning' ).style.top = Math.round( window.innerHeight * 0.25 )  + 'px';
	document.getElementById( 'orientationWarning' ).style.height = window.innerHeight  + 'px';
	document.getElementById( 'orientationWarning' ).innerHTML = isMobile ? 'Please turn your device to landscape mode' : 'Please resize your dev tools to take less place. The game is meant to be played in landscape orientation';
	document.getElementById( 'orientationWarning' ).style.opacity = 1;
};

Game.prototype.pause = function(){
	this.stage.alpha = 0.7;
	this.paused = true;
};

Game.prototype.resume = function(){
	this.stage.alpha = 1;
	this.paused = false;
};

Game.prototype.isPaused = function(){	
	return this.paused;
}

Game.prototype.hidePortraitWarning = function(){
	document.getElementById( 'orientationWarning' ).style.opacity = 0;
	if( this.renderer )
		this.renderer.view.style.opacity = 1;
}

// end of utility functions

Game.prototype.start = function(){
	this.changeLevel( 0 );	
	this.events.start.dispatch();
};

Game.prototype.killAllEnemies = function(){
	while( this.enemies.length ){
		this.enemies.pop().die();						
	}
}

Game.prototype.changeLevel = function( level ){	
	if( this.level >= 4 ){
		return;
	}

	clearInterval( this.enemiesInterval );

	this.killAllEnemies();	
	this.level = level;	

	if( this.level == 0 ){
		this.levelSplash.show( level );
		this.navigation.disableAtacks();					
		this.levelSplash.events.hidden.addOnce( function(){
			this.spawnEnemies();
		}.bind(this) );
	} else {
		this.mainCharacter.powerup();
		this.events.levelCompleted.dispatch(this.level);
		if( this.level == 1 ){			
			setTimeout( function(){				
				this.remarks.events.hidden.addOnce( function(){
					setTimeout( function(){
						this.levelSplash.show( level );
						this.navigation.enableAttacks();
					}.bind(this), 500);
				}.bind(this));
			}.bind(this), 3000 );
		} else {
			this.levelSplash.show( level );
		}
		this.levelSplash.events.hidden.addOnce( function(){
			this.spawnEnemies();		
		}.bind(this) );

		this.mainCharacter.stop();		
	} 		
};

Game.prototype.checkEnemies = function(){
	for( var i in this.enemies ){
		if( this.mainCharacter.objectInFront( this.enemies[i] ) ){			
			if( this.mainCharacter.attacking && checkIntersection( this.mainCharacter.getPolygons().hitArea, this.enemies[i].getPolygons().attackArea) ){
				this.enemies[i].die();
				this.enemies.splice( i, 1 );
				this.score.value++;
				if( this.score.value >= this.getLevelsRequirements() ){
					this.changeLevel( this.level + 1 );
				}
			} 
		} 
		if( this.enemies[i] && this.enemies[i].objectInFront( this.mainCharacter ) ){
			if( this.enemies[i] && this.enemies[i].type && !this.enemies[i].dead ){
				if( (this.enemies[i].type.name == 'sentient' || this.enemies[i].type.name == 'mad' )
					&& this.enemies[i].attacking && checkIntersection( this.enemies[i].getPolygons().attackArea, this.mainCharacter.getPolygons().hitArea) ){
					this.mainCharacter.die( this.enemies[i].type.name );
				}
				if( this.enemies[i].type.name == 'zombie' && checkIntersection( this.enemies[i].getPolygons().hitArea, this.mainCharacter.getPolygons().hitArea) ){
					this.mainCharacter.die( this.enemies[i].type.name );
				}
			}
		}		
		// console.log( this.mainCharacter.checkIntersection( this.enemies[i].getPolygonPoints() ) )
	}
};

Game.prototype.checkLevelRequirements = function(){
	if( this.mainCharacter && this.mainCharacter.dead )
		return;	

	if( this.level == 0 ){		
		var enemiesDodgedCounter = 0;
		for( var i in this.enemies ){
			if( this.enemies[i].x > this.mainCharacter.x + this.mainCharacter.width ){
				enemiesDodgedCounter++;								
			}			
		}
		this.score.value = enemiesDodgedCounter;		
		if( this.score.value >= this.getLevelsRequirements() ){
			this.changeLevel( this.level + 1 );			
		}
	}	
};

Game.prototype.spawnEnemy = function(){
	this.enemies.push( new Character( this.charactersContainer, this.background.getTop(),  this.isPaused.bind(this) ));
	var index = this.enemies.length - 1;
	this.enemies[ index ].events.ready.addOnce( function(){		
		if( this.level == 0 ){			
			this.enemies[ index ].setEnemy( Character.types.zombie, this.mainCharacter );
			this.enemies[ index ].x = 0;
		} else if( this.level == 1 ){			
			this.enemies[ index ].setEnemy( Character.types.zombie, this.mainCharacter );
			this.enemies[ index ].x = randInRange( 0, 1 ) ? 0 : window.innerWidth;
		} else if( this.level == 2 ){			
			this.enemies[ index ].setEnemy( Character.types.mad, this.mainCharacter );
			this.enemies[ index ].x = randInRange( 0, 1 ) ? 0 : window.innerWidth;
		}  else if( this.level == 3 ){
			this.enemies[ index ].setEnemy( Character.types.sentient, this.mainCharacter );
			this.enemies[ index ].x = randInRange( 0, 1 ) ? 0 : window.innerWidth;
		} else {
			this.enemies[ index ].setEnemy( Character.types.zombie, this.mainCharacter );
			this.enemies[ index ].x = 0;
		}
	}.bind(this));

	this.enemies[ this.enemies.length - 1 ].events.dead.addOnce( function( type ){
		this.events.enemyDied.dispatch( type );
	}.bind(this));

	this.enemies[ this.enemies.length - 1 ].events.destroy.addOnce( function( enemy ){
		var index = this.findEnemyIndex( enemy );		
		this.enemies[ index ].die();
		this.enemies.splice( index, 1 );
		this.events.enemyWalkedOutside.dispatch();
	}.bind(this));
};

Game.prototype.spawnEnemies = function(){
	if( !this.paused ){
		this.spawnEnemy();
	}		
	this.enemiesInterval = setInterval( function(){
		if( !this.paused ){
			this.spawnEnemy();
		}		
	}.bind(this), this.getEnemiesIntervals() );
};

Game.prototype.findEnemyIndex = function( enemy ){
	for( var i in this.enemies ){
		if( Object.equals( this.enemies[i], enemy ))
			return i;
	}
	return false;
}

Game.prototype.restart = function(){
//reposition character
//remove enemies
//reset abilities
	window.location = window.location;
}
window.onload = function(){
	var game = new Game();

	;;;window.game = game;
};