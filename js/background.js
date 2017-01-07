var Background = function( stage ){		
	this.filter = new PIXI.filters.PixelateFilter();
	this.pixelateSize = window.innerHeight / 10;
	this.filter.size = { x: this.pixelateSize, y: this.pixelateSize};
	
	if( isMobile ){
		for( var i in config.ground.elements ){
			config.ground.elements[i].height / 2;
		}
	}

	this.container = new PIXI.Container();
	stage.addChild( this.container );

	this.skyContainer = new PIXI.Container();
	this.container.addChild( this.skyContainer );
	
	this.groundContainer = new PIXI.Container();
	this.container.addChild( this.groundContainer );	

	this.addGround();
	this.addSky();

	this.groundContainer.cacheAsBitmap = true;
};

Background.prototype.addSky = function(){
	var texture = new PIXI.gradientTexture( 1, window.innerHeight, ["#6a4aaf", "#6a4aaf", "#ba49b2", "#d17b55" ] );
	var skyBackground = new PIXI.extras.TilingSprite( texture, window.innerWidth + this.pixelateSize, window.innerHeight + this.pixelateSize);		
	skyBackground.x = -this.pixelateSize / 2;
	skyBackground.y = -this.pixelateSize / 2;
	
	skyBackground.filters = [ this.filter ];
	this.skyContainer.addChild( skyBackground );
	skyBackground.cacheAsBitmap = true;	

	this.createCloud();	
	setTimeout( function(){
		this.createCloud();
	}.bind(this), 3500 );
};

Background.prototype.createCloud = function(){	
	var cloud = new PIXI.Container();
	var numberOfCircles = randInRange( config.sky.minCircles, config.sky.maxCircles );
	var cloudParts = [];
	var alpha = 1 - randInRange( 0, 4 ) / 10;
	for( var i = 0; i < numberOfCircles; i++ ){
		cloudParts[i] = new PIXI.Graphics();
		cloudParts[i].beginFill( 0xFFFFFF, alpha );
		console.log( alpha );
		cloudParts[i].drawCircle(0, 0, randInRange( config.sky.minCircleRadius, config.sky.maxCircleRadius ) );
		cloudParts[i].endFill();
		cloudParts[i].x = cloudParts[i - 1] ? randInRange( cloudParts[i-1].x, cloudParts[i-1].x + cloudParts[i].width / 2.2 ) : 0;
		cloudParts[i].y = cloudParts[i - 1] ? randInRange( cloudParts[i-1].y, cloudParts[i-1].y + cloudParts[i].height / 2.2 ) * (i % 2 == 0 ? 1 : -1) : 0;
		cloud.addChild( cloudParts[i] );
	}			
	cloud.x = -cloud.width;
	cloud.y = randInRange( cloud.height, cloud.height * 2);
	cloud.cacheAsBitmap = true;
	console.log( cloud.alpha );
	cloud.filters = [ this.filter ];	
	this.skyContainer.addChild( cloud );

	new TimelineMax().to( cloud, randInRange( config.sky.minSpeed, config.sky.maxSpeed ), { x: window.innerWidth + cloud.width, force3D:true, onComplete: function(){
        this.skyContainer.removeChild( cloud );
        cloud.destroy( true );
        this.createCloud();
    }.bind(this)});      
	cloud.cacheAsBitmap = true;
};

Background.prototype.createGround = function( groundHeight, colors, addBorder ){
	var groundPolygon = new PIXI.Graphics();
	var offset = window.innerHeight - groundHeight;
	var backgroundPath = [];		

	backgroundPath.push( new PIXI.Point( -1 / config.ground.numberOfPoints * (window.innerWidth + this.pixelateSize), window.innerHeight ) );
	for( var i = -1; i <= config.ground.numberOfPoints; i++ ){
		backgroundPath.push( new PIXI.Point( i / config.ground.numberOfPoints * (window.innerWidth + this.pixelateSize), randInRange( offset * (1 + config.ground.offsetDiff), offset * ( 1 - config.ground.offsetDiff ) ) ) );
	}
	backgroundPath.push( new PIXI.Point( window.innerWidth + this.pixelateSize, window.innerHeight ) );
	groundPolygon.beginFill( 0 );
	groundPolygon.drawPolygon( backgroundPath );
	groundPolygon.endFill();		
	this.groundContainer.addChild( groundPolygon );

	var texture = new PIXI.gradientTexture( 1, groundHeight, colors );
	var tilingSprite = new PIXI.extras.TilingSprite( texture, window.innerWidth + this.pixelateSize, groundHeight );	
	tilingSprite.y = offset * ( 1 - config.ground.offsetDiff ) - 1;
	tilingSprite.x = -this.pixelateSize / 2;
	tilingSprite.mask = groundPolygon;	
	tilingSprite.filters = [ this.filter ];	

	if( addBorder ){
		this.addPolygonBorder( this.groundContainer, backgroundPath, 3 );
	}

	this.groundContainer.addChild( tilingSprite );
};

Background.prototype.addPolygonBorder = function( container, path, offset ){
	var topBorder = new PIXI.Graphics();
	var topBorderPath = [];
	for( var i in path ){
		topBorderPath.push( new PIXI.Point( path[i].x, path[i].y - offset) );
	}
	var groundPolygon = new PIXI.Graphics();
	groundPolygon.beginFill( 0xFF0000 );
	groundPolygon.drawPolygon( topBorderPath );
	groundPolygon.endFill();		
	container.addChild( groundPolygon );
	groundPolygon.filters = [ this.filter ];
}

Background.prototype.addGround = function(){	
	for( var i in config.ground.elements ){
		this.createGround( config.ground.elements[i].height, config.ground.elements[i].gradient, config.ground.elements[i].border );
	}
	this.groundContainer.y += this.pixelateSize / 2;
};

Background.prototype.getTop = function(){
	return this.groundContainer.getBounds().y;
}