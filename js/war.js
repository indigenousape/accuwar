 /*
 	[accuwar]: Turn-based Strategy Game
	Release: 3.2 Alpha
	Author: Josh Harris
	8/25/2018
*/ 

(function(){

	App.Models.battleMapModel = new App.Models.BattleZone();

	// Create the battle zone view and display it
	App.Views.battleMap = new App.Views.BattleZone({model: App.Models.battleMapModel});
	$('#game').prepend(App.Views.battleMap.$el);

	// Create the view to display the starting template
	App.Models.gameStartModel = new App.Models.GameStart();
	App.Views.gameStartView = new App.Views.GameStart({model: App.Models.gameStartModel});
	$('#setup').html(App.Views.gameStartView.$el);

	// Add the color menus now that the starting template is on the DOM
	// This is done so that the menus can be re-rendered when the user selects a color
	// without forcing the color-indicators to re-render, allowing their animations to transition smoothly
	App.Views.p1ColorView = new App.Views.ColorView({model: App.Models.gameStartModel});
	App.Views.p2ColorView = new App.Views.RightColorView({model: App.Models.gameStartModel});
	$('#p1ColorMenu').html(App.Views.p1ColorView.$el);
	$('#p2ColorMenu').html(App.Views.p2ColorView.$el);

	// Create the model to store the nation's statistics
	App.Models.nationStats = new App.Models.NationStats();

	// Create the view to display the nation stats template
	App.Views.nationStatsView = new App.Views.NationStats({model: App.Models.nationStats});

	// Create the collection to store the territories
	App.Collections.terrCollection = new App.Collections.Territories();

	// Build the territories and display them
	App.Utilities.makeTerritories();

	// Create full screen change events
	if(document.documentElement.msRequestFullscreen) {
		
		document.onmsfullscreenchange = function() {
			App.Models.nationStats.set('fullScreen', !!document.msFullscreenElement);
			setTimeout(function() {
		  		App.Views.nationStatsView.render();
			}, 250);
		};

	} else if(document.documentElement.mozRequestFullScreen) {

		document.onmozfullscreenchange = function() { App.Models.nationStats.set('fullScreen', !!document.mozFullScreenElement); };
		
	} else if(document.documentElement.webkitRequestFullScreen) {

		document.onwebkitfullscreenchange = function() { App.Models.nationStats.set('fullScreen', !!document.webkitFullscreenElement); };

	}

	if (App.Utilities.smallScreenOnly()) {
		App.Models.battleMapModel.set('tipsMode', false);
	}

	console.log('[accuwar]: Turn-based strategy game and battle simulator. Play free.');
	console.log('Release: -3.2 Alpha');
	console.log('Release Date: 08.26.2018');
	console.log('Author: Josh Harris');

})();