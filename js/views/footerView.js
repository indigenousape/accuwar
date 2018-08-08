 /*
 	[accuwar]: Turn-based Strategy Game
	Footer View
*/ 

App.Views.Footer = Backbone.View.extend({
	template: App.Utilities.template('footerTemplate'),
	initialize: function() {
		this.model.on('change', this.render, this); // when the model changes, re-render the view
		App.Views.selectedFooterView = this;

		this.count = 0;
		this.whichArr = 'army';
		this.startCount = true;

		this.render();

	},
	render: function() {

		var footerRaised = $('#dropFooter').hasClass('drop');

		this.$el.html(this.template(this.model.toJSON()));

		// Corrects button switching from Show to Hide on render
		if(footerRaised) {
			$('#dropFooter').removeClass('raise').addClass('drop');
			$('#footerZone').addClass('lift');
		}

		// Initializes and reinitializes tooltips when footer is updated
		$(function () {
			$('[data-toggle="tooltip"]').tooltip('destroy');
			$('[data-toggle="tooltip"]').tooltip();
			$('[data-toggle="popover"]').popover('destroy');
			$('[data-toggle="popover"]').popover();
		});

		// Start of detail rotator feature

		if(App.Models.battleMapModel.get('selectedMode')) {

			// Find out how many zeros
			var armyPopLen = App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation')).length,
				econPopLen =  App.Utilities.addCommas(App.Models.selectedTerrModel.get('econPopulation')).length;

			var armyWidthsObj = {
				army11: 152,
				army10: 144,
				army9: 137,
				army7: 125,
				army6: 117,
				army5: 109
			}

			var econWidthsObj = {
				econ11: 152,
				econ10: 145,
				econ9: 136,
				econ7: 125,
				econ6: 116,
				econ5: 107
			}

			this.count = 0; // count of stats within a group to display
			this.whichArr = 'army'; // which group of stats to display
			this.startCount = true; // restarting the count
			this.armyWidth = armyWidthsObj['army' + armyPopLen];
			this.econWidth = econWidthsObj['econ' + econPopLen];

			// Self executing timer method ref: https://stackoverflow.com/questions/3138756/calling-a-function-every-60-seconds
			// Fires each time the view is rendered
			// Captures initializing and re-rendering when values are updated
			(function() {
				var timeOut = 3000;
				// If the timeOut function ID doesn't exist in the App, create it
				if(App.Timers.main === 0) {
					App.Timers.main = setTimeout((function rotator() {

						if(App.Models.battleMapModel.get('selectedMode')) {
							// Rotating function executes in selectedMode once every timeOut / 1000 seconds

							App.Views.selectedFooterView.detailsRotator({
								startCount: this.startCount,
								i: App.Views.selectedFooterView.count,
								whichArr: App.Views.selectedFooterView.whichArr
							});

							// Create an inner t
							App.Timers.inner = setTimeout(rotator, timeOut);
						} else if (App.Timers.main) {
							clearTimeout(App.Timers.main);
							clearTimeout(App.Timers.inner);
						}

					}), timeOut);

				}

			})();

		}

	},
	events: {
		'click #repairFort' : 'repairFort',
		'click #closeFooter' : 'closeFooter',
		'click .drop' : 'dropFooter',
		'click .raise' : 'raiseFooter',
		'click #recruitUnits' : 'recruitUnits',
		'click #investEcon' : 'investEcon',
		'click #investEconStr' : 'investEconStr',
		'click .selectedTitle' : 'updateTerrName',
		'click #upgradeFort' : 'upgradeFortLevel',
		'click #trainArmy' : 'trainArmy'
	},
	detailsRotator: function(tick) {

		var fixedStr = tick.whichArr === 'army' ? 'Army: ' + App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation')) + ' units' : 'Population: ' + App.Utilities.addCommas(App.Models.selectedTerrModel.get('econPopulation'));

		var oppTickWhich = tick.whichArr == 'army' ? 'econ' : 'army';

		var armyMsgsLen = $('[data-msgs="army"]').length,
			armyMsgEls = $('[data-msgs="army"]'),
			econMsgsLen = $('[data-msgs="econ"]').length,
			econMsgEls = $('[data-msgs="econ"]'),
			moveUpScEl = $($('[data-msgs="'+tick.whichArr+'"]')[this.count]),
			updateScEl = $($('[data-msgs="'+tick.whichArr+'"]')[this.count + 1]),
			newNextScEl = $('[data-msgs="'+tick.whichArr+'"]').length === this.count ? $($('[data-msgs="'+oppTickWhich+'"]')[0]) : $($('[data-msgs="'+tick.whichArr+'"]')[this.count + 2]);

		// if(App.Constants.LOGGING) {
		// 	console.log(this.count);
		// 	console.log(tick.whichArr);
		// 	console.log(moveUpScEl);
		// }

		var updatePrEl = $('.primary-item.fadeOutUp'),
			moveUpPrEl = $('.primary-item.fadeInUp'),
			switchPrEl = false;

		if(tick.whichArr === 'army' && tick.i === armyMsgsLen - 1) {

			this.count = 0;
			this.whichArr = 'econ';
			newNextScEl = $($('[data-msgs="'+this.whichArr+'"]')[this.count + 1]);
			updateScEl = $($('[data-msgs="'+this.whichArr+'"]')[this.count]);
			moveUpScEl = $($('[data-msgs="'+tick.whichArr+'"]')[tick.i]);
			fixedStr = 'Population: ' + App.Utilities.addCommas(App.Models.selectedTerrModel.get('econPopulation'));
			switchPrEl = true;

		} else if (tick.whichArr === 'econ' && tick.i === econMsgsLen - 1) {
			this.count = 0;
			this.whichArr = 'army';
			newNextScEl = $($('[data-msgs="'+this.whichArr+'"]')[this.count + 1]);
			updateScEl = $($('[data-msgs="'+this.whichArr+'"]')[this.count]);
			moveUpScEl = $($('[data-msgs="'+tick.whichArr+'"]')[tick.i]);
			fixedStr = 'Army: ' + App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation')) + ' units';
			switchPrEl = true;
			
		} else {

			if(this.count === $('[data-msgs="'+tick.whichArr+'"]').length && !this.startCount) {
				moveUpPrEl.removeClass('fadeInUp').addClass('fadeOutUp');
				updatePrEl.html(fixedStr).removeClass('fadeOutUp').addClass('fadeInUp');
			} else if (this.count === $('[data-msgs="'+tick.whichArr+'"]').length && this.startCount && App.Models.selectedTerrModel.get('isCapital')) {
				this.count++;
			}

			this.count++;

		}

		if(switchPrEl && !this.startCount) {
			moveUpPrEl.removeClass('fadeInUp').addClass('fadeOutUp');
			updatePrEl.html(fixedStr).removeClass('fadeOutUp').addClass('fadeInUp');
			
			if(App.Utilities.smallScreenOnly() && this.whichArr == 'army') {
				updatePrEl.parent().width(this.armyWidth);
			} else if (App.Utilities.smallScreenOnly() && this.whichArr == 'econ') {
				updatePrEl.parent().width(this.econWidth);
			} else if (!App.Utilities.smallScreenOnly()) {
				updatePrEl.parent().css('width', '');
			};

		}

		moveUpScEl.removeClass('fadeOutUp fadeInUp').addClass('fadeOutUp');
		updateScEl.removeClass('fadeOutUp fadeInUp next').addClass('fadeInUp active');

		if(this.startCount) {
			this.startCount = false;
		}

	},
	trainArmy: function() {

		var diffToNext = ((100 - this.model.get('armyXP')) * 0.25) * (App.Constants.ARMY_TRAINING_COST * this.model.get('armyPopulation') / 1000);

		var confModalModel = new App.Models.Modal({
			title: "Train Units",
			confBtnClass: 'btn-danger',
			confBtnId: 'trainTerrArmyXP',
			noTurnsMsg: 'Ends turn for ' + this.model.get('name') +'.',
			impactMsg: '+' + Math.round((100 - this.model.get('armyXP')) * 0.25) + ' XP',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(diffToNext) + ' training the army stationed at ' + this.model.get('name') + '?</p>',
			diffToNext: diffToNext
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	updateTerrName: function() {
		
		var canUpdate = App.Utilities.activeSide() === this.model.get('side');

		if(!canUpdate)
			return false;
		
		var thisInput = $('#spInput'),
			spModalModel = new App.Models.Modal({
				title: 'Update Territory Name: ' + App.Models.selectedTerrModel.get('name'),
				confBtnId: 'confNewTerrName',
				modalMsg: '<p>Enter your territory\'s new name:</p>'
			});

		var spModalView = new App.Views.SinglePromptModal({model: spModalModel});

	},
	investEconStr: function() {

		var diffToNext = App.Utilities.returnTerrInfraCost(this.model),
			allTxt = App.Collections.terrCollection.getSideTerritoriesWithTurns(App.Utilities.activeSide()).length === App.Collections.terrCollection.getSideTerritories(App.Utilities.activeSide()).length ? '' : ' with turns&nbsp;remaining',
			showAffordAll = App.Collections.terrCollection.returnTotalCost('econStrength') < App.Utilities.getTreasury() && App.Collections.terrCollection.returnTotalCost('econStrength') > 0 && App.Collections.terrCollection.returnTotalCost('econStrength') != App.Utilities.returnTerrInfraCost(App.Models.selectedTerrModel),
			affordAllMsg = showAffordAll ? '<p>Or spend $' + App.Utilities.addCommas(App.Collections.terrCollection.returnTotalCost('econStrength')) + ' to repair damaged infrastructure in all territories'+allTxt+'?</p>' : '',
			confBtnTxt = showAffordAll ? 'Repair ' + this.model.get('name') : 'Confirm';

		var confModalModel = new App.Models.Modal({
			title: 'Repair Infrastructure',
			confBtnId: 'rebuildInfrastructure',
			impactMsg: 'Strengthens citizen morale, population growth, and GDP.',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(diffToNext) + ' to repair damaged infrastructure in ' + this.model.get('name') + ' (Tech Level&nbsp;' + (this.model.get('econLevel')) + ')?</p>'
							+ affordAllMsg,
			diffToNext: diffToNext,
			affordAll: showAffordAll,
			repairAllId: 'repairAllInfrastructure',
			confBtnTxt: confBtnTxt
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	upgradeFortLevel: function() {

		var newLvl = 1 + this.model.get('fortLevel');

		var confModalModel = new App.Models.Modal({
			title: 'Upgrade Fort Level',
			confBtnId: 'upgradeTerrFortLevel',
			impactMsg: '+' + newLvl + '0% Defense Strength bonus at full strength. Strengthens army and citizen morale.',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(App.Constants.FORT_LVL_COST * newLvl) + ' to upgrade the defenses at ' + this.model.get('name') + ' to Level ' + newLvl + '?</p>',
			diffToNext: App.Constants.FORT_LVL_COST * newLvl
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	repairFort: function() {

		var showAffordAll = App.Collections.terrCollection.returnTotalCost('fortStrength') < App.Utilities.getTreasury() && App.Collections.terrCollection.returnTotalCost('fortStrength') > 0 && App.Utilities.returnTerrFortCost(this.model) != App.Collections.terrCollection.returnTotalCost('fortStrength'),
			allTxt = App.Collections.terrCollection.getSideTerritoriesWithTurns(App.Utilities.activeSide()).length === App.Collections.terrCollection.getSideTerritories(App.Utilities.activeSide()).length ? '' : ' in territories with turns&nbsp;remaining',
			affordAllMsg = showAffordAll ?  '<p>Or spend $' + App.Utilities.addCommas(App.Collections.terrCollection.returnTotalCost('fortStrength')) + ' to repair all damaged forts'+allTxt+'?</p>' : '',
			confBtnTxt = showAffordAll ? 'Repair ' + this.model.get('name') : 'Confirm';

		var confModalModel = new App.Models.Modal({
			title: 'Repair Fort',
			confBtnId: 'repairTerrFort',
			impactMsg: 'Up to ' + this.model.get('fortLevel') + '0% Defense Strength bonus. Impacts citizen and army morale.',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(App.Utilities.returnTerrFortCost(this.model)) + ' to repair the damage at Ft. ' + this.model.get('name') + ' (Level ' + this.model.get('fortLevel') + ')?</p>'
							+ affordAllMsg,
			diffToNext: App.Utilities.returnTerrFortCost(this.model),
			affordAll: showAffordAll,
			repairAllId: 'repairAllFortStr',
			confBtnTxt: confBtnTxt
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	recruitUnits: function() {

		var spModalModel = new App.Models.Modal({
				title: 'Recruit Army Units: ' + App.Models.selectedTerrModel.get('name'),
				confBtnId: 'confNewRecruits',
				modalMsg: '<p class="form-text">How many army units should ' + App.Models.selectedTerrModel.get('name') + ' recruit from the civilian population?</p>',
				impactMsg: '<span>Cost $<span id="recruitCost">' + App.Utilities.addCommas( Math.round(10000 * App.Constants.COST_PER_RECRUIT)) + '</span></span><span class="pull-right"><span id="recruitCount">10,000</span> Units</span>',
				impactClass: 'text-muted',
				noTurnsMsg: 'Ends turn for ' + this.model.get('name') + '.',
				confBtnClass: 'btn-danger',
				showRange: true,
				rangeMin: App.Constants.RECRUIT_ARMY_MINIMUM,
				rangeMax: App.Utilities.recruitMax() - App.Utilities.recruitMax()%100,
				rangeVal: 10000
			});

		var spModalView = new App.Views.SinglePromptModal({model: spModalModel});

	},
	investEcon: function() {
		var nextLvl = parseInt(this.model.get('econLevel')) + 1,
			diffToNext = App.Constants.ECON_LVL_UP_AMT * nextLvl,
			messageHTML = '<p>Spend $' + App.Utilities.addCommas(diffToNext) + ' to upgrade the economy of ' + this.model.get('name') + ' to Level&nbsp;' + nextLvl + '?</p>';

		var confModalModel = new App.Models.Modal({
			title: 'Upgrade Economy Tech Level',
			confBtnId: 'upgradeTerrEcon',
			impactMsg: 'Strengthens citizen morale, population growth, and GDP.',
			modalMsg: messageHTML,
			diffToNext: diffToNext
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	closeFooter: function() {
		App.Views.selectedTerrView.terrClick();
	},
	raiseFooter: function() {
		$('#dropFooter').addClass('drop').removeClass('raise');
		$('#footerZone').toggleClass('lift');

	},
	dropFooter: function() {
		$('#dropFooter').removeClass('drop').addClass('raise');
		$('#footerZone').toggleClass('lift');
	},
	closeView: function() {
	 	$('#footerZone').removeClass('lift');
	 	$('[data-toggle="tooltip"]').off();
	 	$('#footerZone [data-toggle="popover"]').off();
	 	clearTimeout(App.Timers.main);
	 	clearTimeout(App.Timers.inner);
	 	App.Timers.main = 0;
	 	App.Views.selectedFooterView = {};
    	this.unbind();
    	this.undelegateEvents();
    	this.remove();
	}
});