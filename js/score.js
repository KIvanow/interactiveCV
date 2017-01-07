var Score = function( stage ){
	this.stage = stage;
	this.fontSize = isMobile ? window.innerWidth / 30 : window.innerWidth / 40;
	this.prefix = 'Kittens smitten: ';
	this.text = new PIXI.Text( this.prefix + '0',{fontFamily : 'Arial', fontSize: this.fontSize, fill : '#ffffff', align : 'center'});
	this.text.anchor.set( 0.5 );
	this.stage.addChild( this.text );
	this.text.y = this.text.getBounds().height;
	this.text.x = window.innerWidth / 2;
	this.text.alpha = 0;
	this.scaleAnimationDuration = 0.075;	
};

Object.defineProperty( Score.prototype, 'value', {
	get: function() { 
		return this._value || 0; 
	},
	set: function( val ){ 
		if( this._value == val )
			return;
		this._value = val;		
		
		new TimelineMax().to( this.text.scale, this.scaleAnimationDuration, { x: 1.2, force3D:true });
		// new TimelineMax().to( this.text, this.scaleAnimationDuration, { tint: 0xff0000, force3D:true });
        new TimelineMax().to( this.text.scale, this.scaleAnimationDuration, { y: 1.2, force3D:true, onComplete: function(){
            this.text.text = this.prefix + val;
            console.log( val );
            // new TimelineMax().to( this.text, this.scaleAnimationDuration, { tint: 0xffffff, force3D:true });
            new TimelineMax().to( this.text.scale, this.scaleAnimationDuration, { delay: this.scaleAnimationDuration * 2, x: 1, force3D:true });
            new TimelineMax().to( this.text.scale, this.scaleAnimationDuration, { delay: this.scaleAnimationDuration * 2, y: 1, force3D:true, onComplete: function(){
                
            }});    
        }.bind(this)});   		
	},	
});