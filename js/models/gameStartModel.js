 /*
 	[accuwar]: Turn-based Strategy Game
	GameStart Model
*/ 

App.Models.GameStart = Backbone.Model.extend({
	defaults: {
		aiDifficulty: 1,
		aiDifficultyLabels: ['Training', 'Easy', 'Advanced', 'Hard'],
		aiMode: true,
		allColorsArr: ['blue', 'orange', 'green', 'purple', 'pink'],
		availableColorsArr : ['green', 'purple', 'pink'],
		p1Color: 'blue',
		p2Color: 'orange',
		stopClick: false,
		inFullScreen: false
	}
});