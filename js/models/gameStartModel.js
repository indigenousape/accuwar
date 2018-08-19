 /*
 	[accuwar]: Turn-based Strategy Game
	GameStart Model
*/ 

App.Models.GameStart = Backbone.Model.extend({
	defaults: {
		allColorsArr: ['blue', 'orange', 'green', 'purple', 'pink'],
		availableColorsArr : ['green', 'purple', 'pink'],
		p1Color: 'blue',
		p2Color: 'orange',
		stopClick: false
	}
});