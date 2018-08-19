 /*
 	[accuwar]: Turn-based Strategy Game
	Game Start View
*/ 

App.Views.GameStart = Backbone.View.extend({
	template: App.Utilities.template('startUp'),
	initialize: function() {
		this.render();
		App.Views.gameStartView = this;

		// Why? Because on re-render the button doesn't show up. This is all over stackoverflow.
		if(typeof FB != "undefined") {
			setTimeout(function() {
				FB.XFBML.parse(document.getElementById('content'));
			}, 100);
		}

	 	// Have to bind and unbind the range slider events on the fly
	 	// Event is different in IE
	 	if(!App.Utilities.detectIE()) {
	 		this.events['input #terrNumberInput'] = "toggleSliderLabel";
	 		this.delegateEvents();
	 	} else {
	 		this.events['change #terrNumberInput'] = "toggleSliderLabel";
	 		this.delegateEvents();	
	 	}

	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));

		return this;
	},
	events: {
		'keyup input[type="text"]' : 'validateSideName',
		'click #declareWar' : 'declareWar',
		'change .color-select' : 'updateIndicator',
		'mouseover .color-select' : 'raiseColorIndicator',
		'mouseout .color-select' : 'lowerColorIndicator',
		'focus .color-select' : 'raiseColorIndicator',
		'blur .color-select' : 'lowerColorIndicator',
		'change #noSound' : 'toggleSound',
		'change #randomMap' : 'toggleRandomMap',
		'change #showTips' : 'toggleTips'
	},
	toggleSound: function(e) {
		
		var isChecked = $(e.currentTarget)[0].checked;

		if(!isChecked) {
			$('#ambientMusic')[0].pause();
			App.Models.battleMapModel.set('audio', false);
			$('#soundState').text('Off');
		} else {
			
			if($('#ambientMusic').length === 0) {
				var whichAmbient = App.Constants.AMBIENT_MUSIC[_.random(0, (App.Constants.AMBIENT_MUSIC.length - 1))];

				var audioEl = $('<audio id="ambientMusic" hidden>' +
				  '<source src="' + whichAmbient + '" type="audio/mpeg"> ' +
				'</audio>');

				$('body').append(audioEl);

				audioEl[0].volume = App.Utilities.smallScreenOnly() ? 0.33 : 0.25;

				audioEl.bind('ended', App.Utilities.playNextTrack);
			}

			$('#ambientMusic')[0].play();
			App.Models.battleMapModel.set('audio', true);
			$('#soundState').text('On');
		}

	},
	toggleRandomMap: function(e) {
		
		var isChecked = $(e.currentTarget)[0].checked;

		if(!isChecked) {
			App.Models.battleMapModel.set('randomMap', false);
			$('#randomMapState').text('Off');
		} else {
			App.Models.battleMapModel.set('randomMap', true);
			$('#randomMapState').text('On');
		}

	},
	toggleTips: function(e) {
		
		var isChecked = $(e.currentTarget)[0].checked;

		if(!isChecked) {
			App.Models.battleMapModel.set('tipsMode', false);
			$('#tipsState').text('Off');
		} else {
			App.Models.battleMapModel.set('tipsMode', true);
			$('#tipsState').text('On');
		}

	},
	toggleSliderLabel: function(e) {
		var val = parseInt(e.currentTarget.value);

		if(val === App.Constants.STARTING_TERRITORIES_MOB) {
			$('#quickGame').removeClass('text-muted').addClass('active');
			$('#longGame').addClass('text-muted').removeClass('active');
		} else if(val === App.Constants.STARTING_TERRITORIES) {
			$('#longGame').removeClass('text-muted').addClass('active');
			$('#quickGame').addClass('text-muted').removeClass('active');
		}

	},
	raiseColorIndicator: function(e) { 
		$(e.currentTarget).parent().parent().prev().find('.select-indicator').addClass('raised');
	},
	lowerColorIndicator: function(e) {
		$(e.currentTarget).parent().parent().prev().find('.select-indicator').removeClass('raised');
	},
	validateSideName: function(e) {

		$('.error').remove();

		var val = e.currentTarget.value,
			key = window.event ? e.keyCode : e.which,
			isEnterKey = key === 13,
			errorEl = $('<p class="error" role="alert" aria-live="assertive"></p>'),
			newValidationObj = App.Utilities.validateName(val, 'empire'),
			invalidName = newValidationObj.errCode != 0;

		if(invalidName) {
			errorEl.html(newValidationObj.msg);
			$(e.currentTarget).addClass('invalid');
			$(errorEl).insertBefore($('.terr-slider-control'));
			$('#declareWar').prop('disabled', true);
			$('#specialMap').remove();
		} else {
			$(e.currentTarget).removeClass('invalid');
			var leftVal = $('#leftName').val(),
				rightVal = $('#rightName').val(),
				specialMode = App.Views.gameStartView.isSpecialMode(leftVal, rightVal);

			$('#specialMap').remove();

			if(specialMode && $('#specialMap').length === 0) {
				var p = $("<p class='bg-success text-center' id='specialMap'><span class='glyphicon glyphicon-globe'></span> Bonus unlocked!</p>");
				p.insertAfter($('#declareWar'));
			}

			// If both are valid and not equal
			var bothValid = App.Utilities.validateName(leftVal, 'empire').errCode === 0 && App.Utilities.validateName(rightVal, 'empire').errCode === 0;

			if(leftVal != rightVal && bothValid) {
				
				$('#declareWar').prop('disabled', false);
				$('.invalid').removeClass('invalid');

				// If enter key
				if(isEnterKey) {
		 			this.declareWar();
		 		}

			} else if (bothValid) {
				errorEl.text('Your empire name must be unique.');
				$(e.currentTarget).addClass('invalid');
				$(errorEl).insertBefore($('.terr-slider-control'));
				$('#declareWar').prop('disabled', true);
				$('#specialMap').remove();
			}

		}

		// If enter key was pressed and either input is empty, move focus to the empty input
		if(isEnterKey && e.currentTarget.id === "leftName" && !invalidName && $("#rightName").val() === "") {
			$("#rightName").focus();
		} else if (isEnterKey && e.currentTarget.id === "rightName" && !invalidName && $("#leftName").val() === "") {
			$("#leftName").focus();
		}

	},
	updateIndicator: function(e) {

		// Manually update the classes of the color indicator so that the animation will be smooth
		var thisSel = $(e.currentTarget);
		thisSel.parent().parent().parent().find('.select-indicator').attr('class', 'select-indicator raised ' + thisSel.val());

		var side = thisSel.attr('id').indexOf('left') != -1 ? 'left': 'right',
			oppSide = side === 'left' ? 'right' : 'left';

		// Update the model to re-render the color menu dropdowns ONLY
		var newColor = thisSel.val();
		var startAvailColorsArr = this.model.get('availableColorsArr');
		var player = side == 'left' ? 'p1' : 'p2';
		var startColor = this.model.get(player + 'Color');
		startAvailColorsArr.push(startColor);
		var newColorIndex = startAvailColorsArr.indexOf(newColor);
		if(newColorIndex > -1) {
			startAvailColorsArr.splice(newColorIndex, 1);
		}
		this.model.set(player + 'Color', newColor);
		this.model.set('availableColorsArr', startAvailColorsArr);

	},
	declareWar: function() {

		if(!this.model.get('stopClick')) {
			this.model.set('stopClick', true);

			$('.skip-link').attr('tabindex', '');

			// Since we don't want to rerender the battleMap view
			// The texture classes are modified based on the user's selection the old fashioned way

			var classes = App.Views.battleMap.$el.attr('class');

			if(App.Models.battleMapModel.get('randomMap')) {

				if(classes.indexOf('civil-war') != -1) {
					var oldMapStart = classes.indexOf('civil-war');
					var newClasses = classes.substring(0 , oldMapStart) + App.Views.battleMap.addMap();
				} else {
					var worldWarMapStart = classes.indexOf('world-war');
					var newClasses = classes.substring(0, worldWarMapStart) + App.Views.battleMap.addMap();
				}

			} else {

				if(classes.indexOf('texture') != -1) {
					var newMapClass = App.Models.battleMapModel.get('mapMode') == 'civilwar' ? 'civil-war' : 'world-war';
					var oldMapStart = classes.indexOf('texture');
					var newClasses = classes.substring(0 , oldMapStart) + newMapClass;
				} else {
					var newMapClass = App.Models.battleMapModel.get('mapMode') == 'civilwar' ? 'civil-war' : 'world-war';
					var oldMapStart = classes.indexOf(newMapClass);
					var newClasses = classes.substring(0 , oldMapStart) + newMapClass;
				}

			}

			App.Views.battleMap.$el.attr('class', newClasses);

			// Get the names and colors of the left and right sides

			var leftNameVal = $('#leftName').val().trim(),
				rightNameVal = $('#rightName').val().trim(),
				leftColor = $('#leftColor').val(),
				rightColor = $('#rightColor').val(),
				terrNumber = parseInt($('#terrNumberInput').val());

			App.Defaults.mobileMode = terrNumber != App.Constants.STARTING_TERRITORIES;

			App.Models.battleMapModel.set({
				'territories' : terrNumber,
				'mobileMode' : App.Defaults.mobileMode
			});

			App.Models.nationStats.get('left').set({
					'color': leftColor
				});
			App.Models.nationStats.get('right').set({
				'color': rightColor
			});
			App.Collections.terrCollection.changeColorsTerrNames();

			if(!App.Utilities.isMobile() || leftColor != 'blue' || rightColor != 'orange') {
				App.Utilities.restartSkipBeginning();
			}

			if(App.Views.gameStartView.isSpecialMode(leftNameVal, rightNameVal)) {
				// Special Map Mode
				App.Collections.terrCollection.specialMap(leftNameVal, rightNameVal);

				var newClass = '';
				if(!App.Models.battleMapModel.get('randomMap')
					 && ( (leftNameVal.toLowerCase() + rightNameVal.toLowerCase()).indexOf('civilwar') != -1 || (leftNameVal.toLowerCase() + rightNameVal.toLowerCase()).indexOf('college') != -1)) {
						newClass = 'civil-war';
						var oldClassIndex = App.Views.battleMap.$el.attr('class').indexOf('world-war') != -1 ? App.Views.battleMap.$el.attr('class').indexOf('world-war') : App.Views.battleMap.$el.attr('class').indexOf('texture');
						var newClasses = classes.substring(0 , oldClassIndex) + newClass;
						if(!App.Models.battleMapModel.get('randomMap')) {
							App.Views.battleMap.$el.attr('class', newClasses);
						}
				}

			}

			this.$el.parent().addClass('fadeout');
			$('#game').addClass('fadein');

			var specialModeText = "<p>The world is in crisis! Citizens gripped by fear and fury as rival alliances wage war for world&nbsp;domination.</p>";

			if (App.Models.battleMapModel.get('mapMode').length > 0) {

				var	worldWarMode = App.Models.battleMapModel.get('mapMode') === 'joshua' || App.Models.battleMapModel.get('mapMode') === 'wargames',
					civilWarMode = App.Models.battleMapModel.get('mapMode') === 'civilwar',
					marketWarMode = App.Models.battleMapModel.get('mapMode') === 'wallstreet',
					fictionWarMode = App.Models.battleMapModel.get('mapMode') === 'makebelieve',
					collegeWarMode = App.Models.battleMapModel.get('mapMode') === 'college';
				
				specialModeText = fictionWarMode ? "<p>The fictional universe is in crisis! Empires have joined forces and declared war on each other for control of the human&nbsp;imagination.</p>" : specialModeText,
				specialModeText = civilWarMode ? "<p>The Union is in crisis! A powerful confederation of rebel states has seceded from the Union and declared war on the United&nbsp;States.</p>" : specialModeText,
				specialModeText = marketWarMode ? "<p>The world economy is in crisis! Millions in fear as price wars between rival companies turn bloody in battle for precious&nbsp;marketshare.</p>" : specialModeText;
				specialModeText = collegeWarMode ? "<p>The university system is in crisis! Dorms are barricaded across the nation as a new alliance of schools fight to establish a new college athletic&nbsp;association.</p>" : specialModeText;

				leftNameVal = worldWarMode ? "Allies" : leftNameVal,
				rightNameVal = worldWarMode ? "Axis" : rightNameVal,
				leftNameVal = civilWarMode ? "America" : leftNameVal,
				rightNameVal = civilWarMode ? "Rebels" : rightNameVal,
				leftNameVal = marketWarMode ? "NYSE" : leftNameVal,
				rightNameVal = marketWarMode ? "NASDAQ" : rightNameVal,
				leftNameVal = fictionWarMode ? "Light" : leftNameVal,
				rightNameVal = fictionWarMode ? "Dark" : rightNameVal;
				leftNameVal = collegeWarMode ? "NCAA" : leftNameVal;
				rightNameVal = collegeWarMode ? "Alliance" : rightNameVal;
			}

			App.Models.nationStats.get('left').set('empName', leftNameVal);
			App.Models.nationStats.get('right').set('empName', rightNameVal);
			App.Models.nationStats.set('gameStarted', true);
			App.Collections.terrCollection.changeColorsTerrNames();

			if(worldWarMode) {

				var audioEl = '<audio id="easterEgg" hidden>' +
				  '<source src="audio/wargames.mp3" type="audio/mpeg"> ' +
				'</audio>';
				$('body').append(audioEl);

				$('#easterEgg')[0].play();

				$('#easterEgg')[0].volume = 1;

			}

			var enemyCapital = App.Utilities.activeSide() == 'left' ? App.Collections.terrCollection.getSideCapital('right') : App.Collections.terrCollection.getSideCapital('left');

			App.Views.battleMap.notify({
				icon: "glyphicon glyphicon-globe",
				titleTxt : "War Declared!",
				msgTxt : specialModeText + "<p>Attack neighboring territories occupied by the enemy to expand your empire and take control of enemy resources. Invade the enemy capital ("+enemyCapital+") to win the&nbsp;game.</p><p>To change tax rates, enact policies, and see details about your empire, click the menu button at the top corner of your&nbsp;screen.</p><p>Invest wisely in your economy and your military for the best chance of victory. Good&nbsp;luck!</p>",
				msgType: "info",
				delay: App.Constants.DELAY_INFINITE
			});

			// Launch fullscreen for browsers that support it!
			App.Utilities.launchFullScreen(document.documentElement);

			setTimeout(function() {
				App.Views.battleMap.smoothScroll('.terr:first-child');
				App.Views.gameStartView.closeView();
				$('#setup').remove();

			}, 600);

		}


	},
	isSpecialMode: function(name1, name2) {
		var name1Lower = name1.toLowerCase(),
			name2Lower = name2.toLowerCase(),
			specialModes = ['civilwar', 'wargames', 'joshua', 'wallstreet', 'makebelieve', 'college'];

		if(specialModes.indexOf(name1Lower + name2Lower) != -1) {
			return true;
		} else {
			return false;
		}

	},
	closeView: function() {
      this.unbind();
      this.undelegateEvents();
      this.remove();
	}

});