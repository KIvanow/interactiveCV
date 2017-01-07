var Navigation = function( stage ){
	this.stage = stage;
	this.padding = Math.round( window.innerHeight / 75 );
	this.buttonSize = Math.round( window.innerHeight / 7 );
	this.collor = 0xffffff;
	this.alpha = 0.5;

	this.events = {
		buttonPressed: new Signal(),
		buttonUnPressed: new Signal(),
		combo: new Signal(),
	};
	
	this.presses = [];

	this.buttons = {};

	this.canAttack = false;

	this.mainContainer = new PIXI.Container();
	this.stage.addChild( this.mainContainer );

	this.buttons.up = new PIXI.Graphics();
	this.buttons.up.type = 'square';	
	this.buttons.down = new PIXI.Graphics();
	this.buttons.down.type = 'square';
	this.buttons.left = new PIXI.Graphics();
	this.buttons.left.type = 'square';
	this.buttons.right = new PIXI.Graphics();
	this.buttons.right.type = 'square';
	this.buttons.a = new PIXI.Graphics();
	this.buttons.a.type = 'circle';	
	this.buttons.b = new PIXI.Graphics();
    this.buttons.b.type = 'circle';	

    this.buttons.sound = new PIXI.Graphics();
    this.buttons.sound.type = 'circleSmall';	

    this.buttons.powerup = new PIXI.Graphics();
    this.buttons.powerup.type = 'circleSmall';	

	for( var i in this.buttons ){		
		this.buttons[i].beginFill(0x000000, 0);
		this.buttons[i].lineStyle(4, this.collor, this.alpha);
		if( this.buttons[i].type == 'square' ){
			this.buttons[i].drawRoundedRect( 0, 0, this.buttonSize, this.buttonSize , 3);	
			this.mainContainer.addChild( this.buttons[i] );	
		} else if( this.buttons[i].type == 'circle' ){		
			this.buttons[i].drawCircle( 0, 0, this.buttonSize / 1.5 );
			this.stage.addChild( this.buttons[i] );	
		} else if( this.buttons[i].type == 'circleSmall' ){		
			this.buttons[i].drawCircle( 0, 0, this.buttonSize / 3 );
			this.stage.addChild( this.buttons[i] );	
		}

		this.buttons[i].interactive = true;
		(function( buttonId ){
			this.buttons[buttonId].on( 'touchstart', function(){
				if( 
					( buttonId == 'a' && !this.canAttack )
					|| ( buttonId =='b' && !this.canAttack )
				)
					return;

				this.events.buttonPressed.dispatch( buttonId );
				this.buttonPressed = buttonId;
			}.bind(this));

			this.buttons[buttonId].touchend = function( event ){
				this.events.buttonUnPressed.dispatch( buttonId );							
			}.bind(this);

			this.buttons[buttonId].touchmove = function( event ){				
				if( this.buttons.up.containsPoint( event.data.global ) ){
					this.events.buttonPressed.dispatch( 'up' );
				} else if( this.buttons.down.containsPoint( event.data.global ) ){
					this.events.buttonPressed.dispatch( 'down' );
				} else if( this.buttons.left.containsPoint( event.data.global ) ){				
					this.events.buttonPressed.dispatch( 'left' );
				} else if( this.buttons.right.containsPoint( event.data.global ) ){
					this.events.buttonPressed.dispatch( 'right' );
				} else {
					this.events.buttonUnPressed.dispatch( buttonId );							
				}
			}.bind(this);
		}.bind(this))( i );
	};
	
	this.buttons.down.y += this.buttons.up.getBounds().height * 2 - this.padding * 2;
	this.buttons.left.y += this.buttons.up.getBounds().height - this.padding;
	this.buttons.right.y += this.buttons.up.getBounds().height - this.padding;

	this.buttons.up.x += this.buttons.left.getBounds().width - this.padding;
	this.buttons.down.x += this.buttons.left.getBounds().width - this.padding;
	this.buttons.right.x += this.buttons.left.getBounds().width + this.buttons.up.getBounds().width - this.padding * 2;

	this.mainContainer.y = window.innerHeight / 2 - this.mainContainer.getBounds().height / 2;
	this.mainContainer.x = this.padding * 2;    
    
    this.buttons.a.y = this.mainContainer.y + this.buttons.a.height / 2;
	this.buttons.a.x = window.innerWidth - ( this.buttons.a.width + this.padding );
	this.buttons.b.y = this.buttons.a.y + this.buttons.a.height + this.padding;
	this.buttons.b.x = window.innerWidth - ( this.buttons.a.width + this.padding );

	this.aText = new PIXI.Text('A',{fontFamily : 'Arial', fontSize: this.buttons.a.height / 2.5, fill : this.collor, align : 'center'});
	this.aText.anchor.set( 0.5 );
	this.aText.alpha = this.alpha * 2;
	this.aText.x = this.padding / 4;
	this.buttons.a.addChild( this.aText );
	this.bText = new PIXI.Text('B',{fontFamily : 'Arial', fontSize: this.buttons.a.height / 2.5, fill : this.collor, align : 'center'});
	this.bText.anchor.set( 0.5 );
	this.bText.alpha = this.alpha * 2;
	this.bText.x = this.padding / 4;
	this.buttons.b.addChild( this.bText );

	this.buttons.sound.y = this.buttons.sound.height + this.padding;
	this.buttons.sound.x = window.innerWidth - ( this.buttons.sound.width + this.padding );

	this.soundText = new PIXI.Text('S',{fontFamily : 'Arial', fontSize: this.buttons.sound.height / 2.5, fill : this.collor, align : 'center'});
	this.soundText.anchor.set( 0.5 );
	this.soundText.alpha = this.alpha * 2;
	this.soundText.x = this.padding / 4;
	this.buttons.sound.addChild( this.soundText );


	this.buttons.powerup.y = this.buttons.sound.y + this.buttons.sound.height;
	this.buttons.powerup.x = window.innerWidth - ( this.buttons.powerup.width + this.padding );

	this.powerupText = new PIXI.Text('U',{fontFamily : 'Arial', fontSize: this.buttons.powerup.height / 2.5, fill : this.collor, align : 'center'});
	this.powerupText.anchor.set( 0.5 );
	this.powerupText.alpha = this.alpha * 2;
	this.powerupText.x = this.padding / 4;
	this.buttons.powerup.addChild( this.powerupText );

	this.addDesktopListeners();
	this.disableAtacks();
	this.trackCombos();
};

Navigation.prototype.trackCombos = function(){
	this.pressed = false;	
	var matches = 0;
	this.events.buttonPressed.add( function( key ){
		if( this.pressed )
			return;
		if( new Date() - this.lastTimestamp > 1000 ){
			this.presses.length = 0;
		}
		
		var temp = this.presses.slice( 0 );			
		this.lastTimestamp = new Date();	
		this.pressed = true;
		this.presses.push( key );
		
		configLoop:
		for( var i in config.combos ){
		    var y = 0;	         	
		        
		        if( temp.length >= config.combos[i].length && !!~temp.join().indexOf( config.combos[i].join() )){
		            this.presses.length = 0;
		            temp.length = 0;
		            this.events.combo.dispatch( i );
		            break configLoop;
		        }		    
		}
	}.bind(this));
	this.events.buttonUnPressed.add( function( key ){
	//can possibly lead to false positive since I don't track which button is pressed and just resset the flag. For now it should be ok
		this.pressed = false;
		
	}.bind(this));
};

Navigation.prototype.hide = function(){
	for( var i in this.buttons ){
		this.buttons[i].visible = false;
	}
};

Navigation.prototype.disableAtacks = function(){
	this.buttons.a.alpha = this.alpha / 3;
	this.buttons.b.alpha = this.alpha / 3;
	this.canAttack = false;
};

Navigation.prototype.enableAttacks = function(){
	this.buttons.a.alpha = this.alpha * 2;
	this.buttons.b.alpha = this.alpha * 2;
	this.canAttack = true;
};

Navigation.prototype.addDesktopListeners = function(){
	window.addEventListener("keyup", function(e){	
	    if(e.keyCode === 37) {
		this.events.buttonUnPressed.dispatch( 'left' );
	    } else if( e.keyCode === 39 ){
           	 this.events.buttonUnPressed.dispatch( 'right' );
	    } else if( e.keyCode === 38 ){
            this.events.buttonUnPressed.dispatch( 'up' );
	    } else if( e.keyCode === 40 ){
            this.events.buttonUnPressed.dispatch( 'down' );
	    } else if( e.keyCode === 65 && this.canAttack ){
	    	this.events.buttonUnPressed.dispatch( 'a' );
	    } else if( e.keyCode === 66 && this.canAttack ){
	    	this.events.buttonUnPressed.dispatch( 'b' );
	    } else if( e.keyCode === 83 ){
	    	this.events.buttonUnPressed.dispatch( 'sound' );
	    } else if( e.keyCode === 85 ){
	    	this.events.buttonUnPressed.dispatch( 'powerup' );
	    }
	}.bind(this));
	window.addEventListener("keydown", function(e){	
        // e.preventDefault();    
        console.log( e.keyCode );    
	    if(e.keyCode === 37) {
		this.events.buttonPressed.dispatch( 'left' );
	    } else if( e.keyCode === 39 ){
           	 this.events.buttonPressed.dispatch( 'right' );
	    } else if( e.keyCode === 38 ){
            this.events.buttonPressed.dispatch( 'up' );
	    } else if( e.keyCode === 40 ){
            this.events.buttonPressed.dispatch( 'down' );
	    } else if( e.keyCode === 65 && this.canAttack ){
	    	this.events.buttonPressed.dispatch( 'a' );
	    } else if( e.keyCode === 66 && this.canAttack ){
	    	this.events.buttonPressed.dispatch( 'b' );
	    } else if( e.keyCode === 83 ){
	    	this.events.buttonPressed.dispatch( 'sound' );
	    } else if( e.keyCode === 85 ){
	    	this.events.buttonPressed.dispatch( 'powerup' );
	    }
	}.bind(this));
}