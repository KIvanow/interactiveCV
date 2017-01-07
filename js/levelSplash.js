var LevelSplash = function( stage ){
	this.stage = stage;	
	this.levelSplashContainer = new PIXI.Container();

	this.events = {
		start: new Signal(),
		shown: new Signal(),
		hidden: new Signal(),
		optionChosen: new Signal(),
	};

	this.texts = [];

	this.levelSplashContainer.interactive = true;
	this.levelSplashContainer.on( 'tap', function(){		
		this.hide();
	}.bind(this));

	this.levelSplashContainer.on( 'click', function(){		
		this.hide();
	}.bind(this));

	this.fade = new PIXI.Graphics();
	this.fade.beginFill( 0x000000, 0.85 );
	this.fade.drawRect( 0, 0, window.innerWidth, window.innerHeight );
	this.levelSplashContainer.addChild( this.fade );

	this.stage.addChild( this.levelSplashContainer );

	this.mainFontSize = window.innerWidth / 20;	

	this.levelSplashContainer.alpha = 0;

	this.sentanceEnd = ' kittens to finish the level \n\t \n\t \n\t Press anywhere to start';

	this.splashTexts = {
		intro: { 
			level: 'Intro',
			explanation: '\n\tI believe that regular CVs are boring\
			\n\t so I decided to make a small game instead. \
			\n\t Each level\'s difficulty and length are loosely based \
			\n\t on the given period of my "carreer".\
			\n\t The source is intentionally left unminified.\
			\n\t \
			\n\t If you are interested in working with me\
			\n\t consider this game as both CV and code sample.',
			options: [ '\n\t If you want to read the "boring" CV version press here'],			
		},	
		death: { 
			level: 'Game Over... \n\t',			
			explanation: 'You have died \n\t',
			options: [ 'To play the game again press here \n\t', 'To read the "boring" CV version press here'],
		},	
	}

	this.levelTexts = [			
		{ 
			level: 'Level: 1 \n\t',
			heading: 'Elsys: 2007 - 2012 \n\t',
			explanation: 'Since you are just a student in this level \n\t you can only jump to avoid enemies (zombies). \n\t Avoid ' + config.levelsRequirements[0] + this.sentanceEnd
		},
		{ 
			level: 'Level: 2 \n\t',
			heading: 'Elsys Thesis Project \n\t',
			explanation: 'You can now start to fight against the zombies. \n\t Defeat ' + config.levelsRequirements[1] + this.sentanceEnd			
		},
		{ 
			level: 'Level: 3 \n\t',
			heading: 'Mobile Developer at Cayetano: 2012 - 2014',
			explanation: 'The enemies can attack as well now. Have fun. \n\t Defeat ' + config.levelsRequirements[2] + this.sentanceEnd
		},
		{ 
			level: 'Level: 4 \n\t',
			heading: 'Mobile Team Team Leader at Cayetano: current',
			explanation: 'The enemies will attack only when you are near as well now. \n\t Defeat ' + config.levelsRequirements[3] + this.sentanceEnd
		},
		{
			level: '',
			heading: 'You completed all of the levels. \n\t Kill zombie kittens to your heart content!\n\tHave fun!',
		}
	]
};

LevelSplash.prototype.createTexts = function( source, addListeners ){
	for( var i in source ){
		if( typeof source[i] != 'string' ){
			this.createTexts( source[i], true );
			return;
		}
		this.texts.push( new PIXI.Text( source[i],{fontFamily : 'Arial', fontSize: this.mainFontSize * Math.max( 0.5, 1 - ( 1 + this.texts.length ) * 2 / 10 ), fill : '#ffffff', align : 'center'}) );
		this.texts[ this.texts.length - 1 ].anchor.set( 0.5, 0 );
		this.levelSplashContainer.addChild( this.texts[ this.texts.length - 1 ] );	
		this.texts[ this.texts.length - 1 ].x = window.innerWidth / 2;				
		this.texts[ this.texts.length - 1 ].y = this.texts.length > 1 ? this.texts[ this.texts.length -1 -1 ].getBounds().height + this.texts[ this.texts.length -1 -1 ].y : this.texts[ this.texts.length - 1 ].getBounds().height / 2;

		if( addListeners ){
			this.texts[ this.texts.length - 1 ].interactive = true;
			(function(index){				
				this.texts[ this.texts.length - 1 ].on( 'tap', function(){		
					this.events.optionChosen.dispatch( index );
				}.bind(this));

				this.texts[ this.texts.length - 1 ].on( 'click', function(){		
					this.events.optionChosen.dispatch( index );
				}.bind(this));			
			}.bind(this))( i );
		}
	}
};

LevelSplash.prototype.show = function( level ) {
	this.shown = level;
	this.events.start.dispatch();
	if( level === parseInt( level, 10 ) ){
		this.createTexts( this.levelTexts[ level ] );
	} else {
		this.createTexts( this.splashTexts[ level ] );
	}	

	// this.levelSplashIndex.y = this.levelSplashIndex.getBounds().height;
	// this.levelSplashHeading.y = this.levelSplashIndex.getBounds().y + this.levelSplashIndex.getBounds().height;
	// this.levelSplashExplanation.y = this.levelSplashHeading.getBounds().y + (source.heading ? this.levelSplashHeading.getBounds().height * 2 : this.levelSplashHeading.getBounds().height );

	this.levelSplashContainer.visible = true;
	new TimelineMax().to( this.levelSplashContainer, 0.4, { alpha: 1, force3D:true, onComplete: function(){
        this.events.shown.dispatch();
    }.bind(this)});  
};

LevelSplash.prototype.hide = function() {
	new TimelineMax().to( this.levelSplashContainer, 0.4, { alpha: 0, force3D:true, onComplete: function(){
        this.levelSplashContainer.visible = false;
        this.shown = false;
        
        this.removeTexts();

        this.events.hidden.dispatch();
    }.bind(this)});  
};

LevelSplash.prototype.removeTexts = function(){
	for( var i in this.texts ){
		this.levelSplashContainer.removeChild( this.texts[ i ] );
	}
	this.texts.length = 0;
}