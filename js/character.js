var Character = function( stage, y, isPausedFunction ){
	this.stage = stage;
	
	this.minimumY = y;

	this.isPaused = isPausedFunction;

	this.ready = false;
	
	this.prefix = "cat";	
	
	this.animationSpeed = 0.2;
	this.resourcesPath = 'animations/cat_animations.json';

	this.anchor = { x: 0.5, y: 0.5 };
	this.container = new PIXI.Container();
	this.container.alpha = 0;
	stage.addChild( this.container );
	this.defaultOrientation = 1;		

	this.events = {
		ready: new Signal(),
		animationFinished: new Signal(),
		destroy: new Signal(),
		dead: new Signal(),
		attack: new Signal(),
	}

	// var obj = {};
	// obj[ this.prefix + 'idle' ] = 4;
	this.animations = {
		cat_idle: {
			frames: 4,
			loop: true,
			type: 'idle'
		},
		cat_combo: {
			frames: 24,
			loop: false,
			type: 'attack'
		},		
		cat_die: {
			frames: 8,
			loop: false,	
		},
		cat_double_punch: {
			frames: 14,
			loop: false,
			type: 'attack'	
		},
		cat_hadouken: {
			frames: 19,
			loop: false,
			type: 'attack'		
		},		
		cat_jump: {
			frames: 14,
			loop: true,
			type: 'movement'
		},
		cat_kick1: {
			frames: 14,
			loop: false,
			type: 'attack'
		},
		cat_kick2: {
			frames: 8,
			loop: false,
			type: 'attack'
		},
		cat_punch1: {
			frames: 12,
			loop: false,
			type: 'attack'
		},
		cat_uppercut1: {
			frames: 18,
			loop: false,
			type: 'attack'
		},
		cat_uppercut2: {
			frames: 6,
			loop: false,
			type: 'attack'
		},
		cat_walk: {
			frames: 4,
			loop: true,
			type: 'movement'
		},		
	};

	this.loadImages();
};

Character.types = {
	zombie: {
		name: 'zombie', 
		tint: 0x2faf2f,
	},
	sentient: {
		name: 'sentient', 
		tint: 0xaf2f2f,
	},
	mad: {
		name: 'mad', 
		tint: 0xaf2f2f,
	}
};

Character.prototype.loadImages = function(){		
	if( !PIXI.loader.resources[ this.resourcesPath ] ){
		PIXI.loader.add(this.resourcesPath).load( this.loadedImages.bind(this) );
	} else {
		setTimeout( function(){ //fix for the events.ready listener
			this.loadedImages()
		}.bind(this));
	}	
}

Character.prototype.loadedImages = function(){	
	this.createMovieClips();

	for( var i in this.animations ){
		this.container.addChild( this.animations[i].movieClip );
	}	

	this.width = this.animations[ 'cat_idle' ].movieClip.texture.width;
	this.height = this.animations[ 'cat_idle' ].movieClip.texture.height;

	this.jumpHeight = this.height * this.anchor.y * 2.5;

	this.scale = window.innerHeight / (this.height * 3);

	this.moveSpeed = Math.round( (this.width * this.scale) / 25 );
	
	this.play( 'idle' );	
	
	this.hitArea = new PIXI.Polygon( 
		new PIXI.Point( -this.width * this.scale * 0.14 / 2, -this.height * this.scale * 0.4 / 2 ),
		new PIXI.Point( -this.width * this.scale * 0.14 / 2 + this.width * this.scale * 0.14, -this.height * this.scale * 0.4 / 2 ),
		new PIXI.Point( -this.width * this.scale * 0.14 / 2 + this.width * this.scale * 0.14, -this.height * this.scale * 0.4 / 2 + this.height * this.scale * 0.4),
		new PIXI.Point( -this.width * this.scale * 0.14 / 2,-this.height * this.scale * 0.4 / 2 + this.height * this.scale * 0.4)
	);					
	// this.container.addChild( this.hitArea );
	
	this.attackArea = new PIXI.Polygon( 
		new PIXI.Point( -this.width * this.scale * 0.14 / 2, -this.height * this.scale * 0.4 / 2 ),
		new PIXI.Point( -this.width * this.scale * 0.14 / 2 + this.width * this.scale * 0.14 * 2, -this.height * this.scale * 0.4 / 2 ),
		new PIXI.Point( -this.width * this.scale * 0.14 / 2 + this.width * this.scale * 0.14 * 2, -this.height * this.scale * 0.4 / 2 + this.height * this.scale * 0.4),
		new PIXI.Point( -this.width * this.scale * 0.14 / 2,-this.height * this.scale * 0.4 / 2 + this.height * this.scale * 0.4)
	);					
	// this.container.addChild( this.attackArea );

	this.x = window.innerWidth / 2;
	this.y = this.minimumY + this.height;	

	new TimelineMax().to( this.container, 0.33, { alpha: 1, force3D:true, onComplete: function(){
					
	}.bind(this) });	

	this.events.ready.dispatch();

	this.ready = true;
}

Object.defineProperty( Character.prototype, 'animationSpeed', {
	get: function() { 
		return this._animationSpeed || 0; 
	},
	set: function( val ){ 
		this._animationSpeed = val;
		for( var i in this.animations ){
			this.animations[i].movieClip.animationSpeed = val;
		}			
	},	
});

Object.defineProperty( Character.prototype, 'x', {
	get: function() { 
		return this._x || 0; 
	},
	set: function( val ){ 
		if( this.isPaused() )
			return;

		if( !this.enemy && (val + this.width / 2 >= window.innerWidth || val <= this.width / 2 ) )
			return;
		if( this.dead )
			return;

		this._x = val;
		this.container.x = val;
	},	
});

Object.defineProperty( Character.prototype, 'y', {
	get: function() { 
		return this._y || 0; 
	},
	set: function( val ){
	if( this.isPaused() ) 
		return;

		this._y = val;
		this.container.y = val;
	},	
});

Object.defineProperty( Character.prototype, 'tint', {
	get: function() { 
		return this._tint || 0; 
	},
	set: function( val ){ 
		this._tint = val;
		for( var i in this.animations ){
			this.animations[i].movieClip.tint = val;
		}
	},	
});

Object.defineProperty( Character.prototype, 'scale', {
	get: function() { 
		return this._scale || 0; 
	},
	set: function( val ){ 
		this._scale = val;
		for( var i in this.animations ){
			this.animations[i].movieClip.scale.set( val );
		}
	},	
});

Object.defineProperty( Character.prototype, 'orientation', {
	get: function() { 
		return this._orientation || this.defaultOrientation; 
	},
	set: function( val ){ 
		this._orientation = val;
		for( var i in this.animations ){
			this.animations[i].movieClip.scale.x = val * this.scale;
		}
	},	
});


Character.prototype.move = function( dir ){			
	this.attacking = false;
	if( this.moving || this.dead ){
		return;
	}
	if( this.orientation != dir ){
		this.orientation *= -1;
		clearInterval( this.moveInterval );
	}

	this.moving = true;
	if( !this.jumping ){
		this.play( "walk" );
	}
	
	clearInterval( this.moveInterval );
	var that = this;
	var move = function(){				
		this.x += dir * this.moveSpeed;	
		if( this.x - this.width * this.scale > window.innerWidth || this.x + this.width < 0 ){
			this.events.destroy.dispatch( this );
		}
		this.moveInterval = setTimeout( move.bind(this), this.jumping ? 50 : 100 )
	}.bind(this);

	move();
};

Character.prototype.stop = function(){
	if( this.attacking ){
		return;
	}	

	clearInterval( this.moveInterval );
	this.moving = false;	
	if( !this.jumping ){
		this.play( "idle" );
	}
};

Character.prototype.die = function( whatKilledYou ){
	if( this.dead )
		return;

	this.events.dead.dispatch( this.type );
	this.dead = true;
	this.play( 'die' );		

	if( this.attackInterval ){
		clearInterval( this.attackInteval );
	}

	new TimelineMax().to( this.container, 0.75, { alpha: 0, force3D:true, onComplete: function(){
		// if( whatKilledYou == 'zombie' ){
		// 	alert( 'Your kitten was eaten by a zombie' );
		// } else if( whatKilledYou == 'sentient' ){
		// 	alert( 'Your kitten was killed by another kitten' );
		// } else if( whatKilledYou == 'mad' ){
		// 	alert( 'Your kitten was killed by another kitten' );
		// }
		this.destroy();
	}.bind(this) });	
};

Character.prototype.jump = function(){
	if( this.jumping ){
		return;
	}
	this.attacking = false;
	this.stop();
	this.play( 'jump' );
	this.jumping = true;
	clearTimeout( this.jumpingTimeout );
	new TimelineMax().to( this, 0.75, { y: this.y - this.jumpHeight * this.scale, force3D:true, onComplete: function(){				
		new TimelineMax().to( this, 1, { y: this.y + this.jumpHeight * this.scale, force3D:true });
		this.jumpingTimeout = setTimeout( function(){			
			if( !this.dead ){
				if( this.moving ){
					this.play( 'walk' );
				} else {
					this.play('idle');
				}			
				this.jumping = false;
			}			
		}.bind(this), 0.75 * 1000)
	}.bind(this)  });
};

Character.prototype.attack = function( type ){
	if( this.attacking || this.jumping )
		return;
	
	this.moving = false;
	this.stop();

	this.attacking = true;	
	this.events.attack.dispatch( type );
	if( type == 'a' ){
		randInRange( 0, 1 ) == 0 ? this.play( 'punch1' ) : this.play( 'uppercut2' );
	} else if( type =='b' ){
		this.play( 'kick' + randInRange( 1, 2 ) );
	}
};

Character.prototype.createMovieClips = function() {	
	for( var i in this.animations ){
		var anim = [];
		for( var counter = 0; counter < this.animations[i].frames; counter++ ){
			anim.push( PIXI.Texture.fromFrame( i + '-' + counter + ".png" ) );			
		}
		
		this.animations[i].movieClip = new PIXI.extras.AnimatedSprite( anim );
		this.animations[i].movieClip.loop = this.animations[i].loop;
		this.animations[i].movieClip.animationSpeed = this.animationSpeed;
		this.animations[i].movieClip.alpha = 0;
		this.animations[i].movieClip.anchor = this.anchor;
		
		(function( animationId ){
			this.animations[animationId].movieClip.onComplete = function(){
				this.events.animationFinished.dispatch( animationId );
				if( !this.dead ){
					this.play( 'idle' );				
				}
			}.bind(this);			
		}.bind(this))(i)
	}	
	this.events.animationFinished.add( function( animationId ){			
		this.attacking = false;
	}.bind(this));
};

Character.prototype.play = function( anim ){	
	for( var i in this.animations ){		
		this.animations[i].movieClip.stop();
		this.animations[i].movieClip.alpha = 0;
	}
	if( anim !== false ){
		this.animations[ this.prefix + "_" + anim ].movieClip.alpha = 1;
		this.animations[ this.prefix + "_" + anim ].movieClip.gotoAndPlay(0);		
	}	
};

Character.prototype.powerup = function(){
	this.animationSpeed *= 1.04;
	this.moveSpeed *= 1.04;
};

Character.prototype.setEnemy = function( type, mainCharacter ){	
	type = type || 'regular';
	this.tint = type.tint;
	this.enemy = true;
	this.type = type;
	this.moveSpeed *= 0.7;
	this.animationSpeed *= 0.7;	

	this.mainCharacter = mainCharacter;

	setTimeout( function(){
		if( this.x == 0 ){
			this.move( 1 );
		} else {
			this.move( -1 );
		}
	}.bind(this), 1);	
	
	if( this.type.name == 'zombie' ){
		// nada, just walk
	} else if( this.type.name == 'mad' ){
		this.attackInterval = setInterval( function(){			
			randInRange( 0, 1 ) ? this.attack( 'a' ) : this.attack( 'b' );
			this.events.animationFinished.addOnce( function( animationId ){			
				setTimeout( function(){
					this.move( this.orientation );
				}.bind(this));
			}.bind(this));
		}.bind(this), randInRange( 2000, 5000 ) );
	} else if( this.type.name == 'sentient' ){
		this.attackInterval = setInterval( function(){	
			if( Math.abs(this.mainCharacter.x - this.x) < this.width * 2 ){
				randInRange( 0, 1 ) ? this.attack( 'a' ) : this.attack( 'b' );
			}			
		}.bind(this), 500)
	}
};

Character.prototype.updatePolygons = function( polygon ){
	var updatedPoints = [];
	if( !polygon ){
		return new PIXI.Polygon();
	}
	for( var i in polygon.points ){
		if( i % 2 == 0 ){
			updatedPoints.push( polygon.points[i] + this.x )
		} else {
			updatedPoints.push( polygon.points[i] + this.y )
		}
	}
	return new PIXI.Polygon( updatedPoints );
};

Character.prototype.getPolygons = function(){
	// if( this.debugPolygons ){
	// 	for( var i in this.debugPolygons ){
	// 		this.stage.removeChild( this.debugPolygons[i] );
	// 	}
	// 	this.debugPolygons.length = 0;
	// } else{
	// 	this.debugPolygons = [];
	// }

	// this.debugPolygons.push( new PIXI.Graphics() )
	// this.debugPolygons[ this.debugPolygons.length - 1 ].beginFill(0xFFFF00, 0.1);
	// this.debugPolygons[ this.debugPolygons.length - 1 ].drawPolygon( this.updatePolygons( this.hitArea ) );

	// this.debugPolygons.push( new PIXI.Graphics() )
	// this.debugPolygons[ this.debugPolygons.length - 1 ].beginFill(0xFF0000, 0.1);
	// this.debugPolygons[ this.debugPolygons.length - 1 ].drawPolygon( this.updatePolygons( this.attackArea ) );

	// for( var i in this.debugPolygons ){
	// 	this.stage.addChild( this.debugPolygons[i] );
	// }

	return { hitArea: this.updatePolygons( this.hitArea ), attackArea: this.updatePolygons( this.attackArea ) };
};

Character.prototype.objectInFront = function( object ){
	if( !object )
		return false;
	if( this.orientation == 1 ){
		if( this.x < object.x )
			return true;
		return false;
	} else {
		if( this.x > object.x )
			return true;
		return false;
	}
};

Character.prototype.destroy = function(){
	clearInterval( this.moveInterval );
	this.stage.removeChild( this.container );
	
	this.container.destroy( {children: true});
};