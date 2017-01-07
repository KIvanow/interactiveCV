var config = {
	levelsRequirements: [1, 3, 4, 1 ],
	enemiesIntervals: [ 6 * 1000, 3 * 1000, 4 * 1000, 5 * 1000 ],
	ground: {
		numberOfPoints: 200,
		offsetDiff: 0.02,
		elements: [
			{
				height: window.innerHeight * 0.3,
				gradient: ["#af7e17", "#967c1f" ],
				border: true
			},
			{
				height: window.innerHeight * 0.25,
				gradient: ["#715c1d", "#2d461e" ],
				border: false
			}
		]
	},
	sky: {
		maxSpeed: 15,
		minSpeed: 30,
		minCircles: 3,
		maxCircles: 10,
		minCircleRadius: 10,
		maxCircleRadius: 20
	},
	combos: {
		special: [ 'a', 'a', 'a' ],
	},
	maximumComboDelay: 500,
  	sound:{
		resources: [
			"sounds/all.ogg",
    			"sounds/all.mp3",    		
		],
		spritemap: {
			attack1: {
				start: 0,
				end: 2,
				loop: false
			},
			attack2: {
				start: 3,
				end: 5,
				loop: false
			},
			attack3: {
				start: 6,
				end: 6.270975056689342,
				loop: false
			},
			button_click: {
				start: 8,
				end: 8.70530612244898,
				loop: false
			},
			completetask: {
				start: 10,
				end: 10.687505668934241,
				loop: false
			},
			death: {
				start: 12,
				end: 14,
				loop: false,
				effects: {
					volume: 0.6,
					fadeIn: 0.2,
					fadeOut: 0.2,
				}
			},
			deathZombie: {
				start: 15,
				end: 17,
				loop: false,
				effects: {
					volume: 0.6,
					fadeIn: 0.2,
					fadeOut: 0.2,
				}
			},
			gameLooseSound2: {
				start: 18,
				end: 20.56,
				loop: false,
				effects: {
					volume: 0.8,
					fadeIn: 0.2,
					fadeOut: 0.2,
				}
			},
			hardRock: {
				start: 22,
				end: 149.16408163265305,
				loop: true,
				effects: {
					volume: 0.5,
					fadeIn: 0.2,
					fadeOut: 0.2,
				}
			},
			om: {
				start: 151,
				end: 153.0527664399093,
				loop: false
			}
		}
	}
}