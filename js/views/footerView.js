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
			$('#footerZone [data-toggle="tooltip"]').tooltip('destroy');
			$('#footerZone [data-toggle="tooltip"]').tooltip();
			$('#footerZone [data-toggle="popover"]').popover('destroy');
			$('#footerZone [data-toggle="popover"]').popover();
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
		'click #trainArmy' : 'trainArmy',
		'click .nav-tabs a' : 'navTabs'
	},
	navTabs: function(e) {

		var thisEl = $(e.currentTarget);
		var isActive = thisEl.parent().hasClass('active');

		if(!isActive) {
			var theText = thisEl.parent().find('.hide-mob').text();
			$('#militaryTabName').text(theText);
		}

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

		var diffToNext = Math.round(25 * App.Constants.ARMY_TRAINING_COST * (this.model.get('armyPopulation') / 1000));

		var confModalModel = new App.Models.Modal({
			title: "Train Units",
			confBtnClass: 'btn-danger',
			confBtnId: 'trainTerrArmyXP',
			noTurnsMsg: 'Ends turn for ' + this.model.get('name') +'.',
			impactMsg: '+25 XP',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(diffToNext) + ' to train the army units stationed at Ft.&nbsp;' + this.model.get('name') + '?</p>',
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
			affordAllMsg = showAffordAll ? '<p>Or spend $' + App.Utilities.addCommas(App.Collections.terrCollection.returnTotalCost('econStrength')) + ' to repair damaged infrastructure in all&nbsp;territories'+allTxt+'?</p>' : '',
			confBtnTxt = showAffordAll ? 'Repair ' + this.model.get('name') : 'Confirm';

		var polIndex = _.pluck(App.Utilities.activeEmpire().get('activePolicies'), 'id'),
			polIndex = _.indexOf(polIndex, 'repair_infra'),
			polIsActive = polIndex != -1 ? App.Utilities.activeEmpire().get('activePolicies')[polIndex].priority : false,
			repairPolHTML = !polIsActive ? '<p class="small">To automate repairs, activate the <a href="#" class="modal-link" id="repairInfPol" data-pol-id="repair_infra">Repair infrastructure policy</a>.</p>' : '';

		var confModalModel = new App.Models.Modal({
			title: 'Repair Infrastructure: Tech Level&nbsp;' + this.model.get('econLevel'),
			confBtnId: 'rebuildInfrastructure',
			impactMsg: 'Strengthens growth, citizen morale, and&nbsp;GDP.',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(diffToNext) + ' to repair damaged infrastructure in ' + this.model.get('name') + '?</p>'
							+ affordAllMsg + repairPolHTML,
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
			impactMsg: '+' + App.Constants.FORT_LVL_STRENGTH_BONUS + '% Defense Bonus. Strengthens army and civilian&nbsp;morale.',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(App.Constants.FORT_LVL_COST * newLvl) + ' to upgrade the defenses at ' + this.model.get('name') + ' to Level&nbsp;' + newLvl + '?</p>',
			diffToNext: App.Constants.FORT_LVL_COST * newLvl
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	repairFort: function() {

		var showAffordAll = App.Collections.terrCollection.returnTotalCost('fortStrength') < App.Utilities.getTreasury() && App.Collections.terrCollection.returnTotalCost('fortStrength') > 0 && App.Utilities.returnTerrFortCost(this.model) != App.Collections.terrCollection.returnTotalCost('fortStrength'),
			allTxt = App.Collections.terrCollection.getSideTerritoriesWithTurns(App.Utilities.activeSide()).length === App.Collections.terrCollection.getSideTerritories(App.Utilities.activeSide()).length ? '' : ' in territories with turns&nbsp;remaining',
			affordAllMsg = showAffordAll ?  '<p>Or spend $' + App.Utilities.addCommas(App.Collections.terrCollection.returnTotalCost('fortStrength')) + ' to repair all damaged forts'+allTxt+'?</p>' : '',
			confBtnTxt = showAffordAll ? 'Repair ' + this.model.get('name') : 'Confirm';

		var polIndex = _.pluck(App.Utilities.activeEmpire().get('activePolicies'), 'id'),
			polIndex = _.indexOf(polIndex, 'repair_forts'),
			polIsActive = polIndex != -1 ? App.Utilities.activeEmpire().get('activePolicies')[polIndex].priority : false,
			repairPolHTML = !polIsActive ? '<p class="small">To automate repairs, activate the <a href="#" class="modal-link" id="repairFortPol" data-pol-id="repair_forts">Repair forts policy</a>.</p>' : '';

		var confModalModel = new App.Models.Modal({
			title: 'Repair Fort: Level&nbsp;' + this.model.get('fortLevel'),
			confBtnId: 'repairTerrFort',
			impactMsg: 'Protects territory from attack. Impacts citizen and army&nbsp;morale.',
			modalMsg: '<p>Spend $' + App.Utilities.addCommas(App.Utilities.returnTerrFortCost(this.model)) + ' to repair the damage at Ft. ' + this.model.get('name') + '?</p>'
							+ affordAllMsg + repairPolHTML,
			diffToNext: App.Utilities.returnTerrFortCost(this.model),
			affordAll: showAffordAll,
			repairAllId: 'repairAllFortStr',
			confBtnTxt: confBtnTxt
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	recruitUnits: function() {
		App.Utilities.recruitUnitsModal(this.model);
	},
	investEcon: function() {
		var nextLvl = parseInt(this.model.get('econLevel')) + 1,
			diffToNext = App.Constants.ECON_LVL_UP_AMT * nextLvl,
			aboveOrBelowTxt = '',
			aboveOrBelowArmyTechLevelTxt = '';
		
		if(this.model.get('econLevel') > App.Utilities.activeEmpire().get('armyTechLvl')) {
			aboveOrBelowTxt = 'above';
		} else if (this.model.get('econLevel') < App.Utilities.activeEmpire().get('armyTechLvl')) {
			aboveOrBelowTxt = 'below';
		}

		if(App.Utilities.activeEmpire().get('armyTechLvl') > App.Utilities.enemyEmpire().get('armyTechLvl')) {
			aboveOrBelowArmyTechLevelTxt = '<strong>more advanced</strong> than';
		} else if (App.Utilities.activeEmpire().get('armyTechLvl') < App.Utilities.enemyEmpire().get('armyTechLvl')) {
			aboveOrBelowArmyTechLevelTxt = '<strong>less advanced</strong> than';
		} else {
			aboveOrBelowArmyTechLevelTxt = '<strong>equally advanced</strong> as';
		}
		
		var messageHTML = '<p>Spend $' + App.Utilities.addCommas(diffToNext) + ' to upgrade the technology in ' + App.Models.selectedTerrModel.get('name') + ' to Level&nbsp;' + nextLvl + '?</p>';
			
		messageHTML += '<p class="small">' + this.model.get('name') + ' has <strong>' + aboveOrBelowTxt + ' average</strong> technology compared to the other territories in the ' + App.Utilities.getActiveEmpireName() + '&nbsp;empire.</p>';

		messageHTML += '<p class="small">Weapons technology in the ' + App.Utilities.getActiveEmpireName() + ' empire is ' + aboveOrBelowArmyTechLevelTxt + ' the&nbsp;enemy\'s.</p>';

		messageHTML += '<p class="small"><strong>Note:</strong> Infrastructure repair costs in ' + this.model.get('name') + ' will rise as Tech Level increases.</p>';

		var confModalModel = new App.Models.Modal({
			title: 'Upgrade Tech Level',
			confBtnId: 'upgradeTerrEcon',
			impactMsg: 'Stengthens growth, citizen morale, and&nbsp;GDP.',
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
	 	$('#footerZone [data-toggle="tooltip"]').off();
	 	$('#footerZone [data-toggle="popover"]').off();
    	this.unbind();
    	this.undelegateEvents();
    	this.remove();
	 	clearTimeout(App.Timers.main);
	 	clearTimeout(App.Timers.inner);
	 	App.Timers.main = 0;
	 	App.Views.selectedFooterView = {};
	}
});