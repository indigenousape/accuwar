 /*
 	[accuwar]: Turn-based Strategy Game
	Battlezone Model
*/ 

App.Models.BattleZone = Backbone.Model.extend({
	defaults: {
		selectedMode : false,
		mobileMode: false,
		mapMode: '',
		mapType: '',
		randomMap: false,
		territories: 9,
		audio: false,
		tipsMode: true
	}
});