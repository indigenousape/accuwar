 /*
 	[accuwar]: Turn-based Strategy Game
	Confirmation Dialog Modal View
*/ 

App.Views.ConfModal = Backbone.View.extend({
	template: App.Utilities.template('confModal'),
	initialize: function() {
		var thisView = this;
		$('#modalLiveRegion').html('');
		this.render();
		$('#modalTarget').html(this.$el);
		$('#oneModal .modal-dialog').removeClass('modal-lg');
		App.Utilities.showModal();

		$('#oneModal').on('shown.bs.modal', function(e) {
			
			if($('.modal-footer .btn-primary').length > 0 && !App.Utilities.smallScreenOnly()) {
				$('.modal-footer .btn-primary').focus();
			} else if (!App.Utilities.smallScreenOnly()) {
				$('.modal-footer .btn-danger').focus();
			}

			App.Views.battleMap.smoothScroll('.terr:first-child');
		
		});

	 	$('#oneModal').on('hidden.bs.modal', function() {

 			App.Utilities.console("Before");
	 		App.Utilities.console($._data( $("#oneModal")[0], "events" ));

	 		$('#oneModal').off();
			thisView.closeView();

 			App.Utilities.console("After");
 			App.Utilities.console($._data( $("#oneModal")[0], "events" ));
	 	
	 	});

	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	events: {
		'click #trainTerrArmyXP' : 'trainTheArmy',
		'click #repairAllFortStr' : 'repairAllForts',
		'click #rebuildInfrastructure': 'rebuildTheInfrastructure',
		'click #upgradeTerrFortLevel' : 'updateTheFortLevel',
		'click #repairTerrFort': 'repairTheFort',
		'click #upgradeTerrEcon': 'upgradeTheEconomy',
		'click #confAttack' : 'attackTheTerritory',
		'click #confNewGame' : 'restartTheGame',
		'click #confNewTurn' : 'endTheTurn',
		'click #invasionStep' : 'invadeTheTerritory',
		'click #repairAllInfrastructure' : 'rebuildAllInfrastructure',
		'click .current' : 'currentClick',
		'click .previous' : 'mouseOutBar',
		'mouseover .fort-label' : 'mouseOverBar',
		'mouseout .fort-label' : 'mouseOutBar',
		'focusin .fort-label' : 'mouseOverBar',
		'focusout .fort-label' : 'mouseOutBar',
		'click #battleNot' : 'battleNotification',
		'click #confUpdatePolicy' : 'confUpdatePolicy',
		'change .available-policies' : 'toggleEnactPolicy'
	},
	attackTheTerritory: function() {

		if(App.Views.clickedTerrView.model.get('inRange') && !this.model.get('stopClick')) {
			App.Views.battleMap.battle(App.Models.selectedTerrModel, App.Models.clickedTerrModel);
			$(".modal-footer .btn-danger").focus();
			App.Views.battleMap.smoothScroll('.modal-header');
			this.model.set('stopClick', true);
		}

	},
	battleNotification: function() { 

		if(this.model.get('govKilled')) {
			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-globe',
				titleTxt : "Governor of " + App.Models.clickedTerrModel.get('name') + " Killed",
				msgTxt : "Flags lowered as citizens gather to pay respects for local&nbsp;leader.",
				msgType: "success"
			});
		}
		App.Views.battleMap.notify(this.model.get('notification'));
		App.Views.battleMap.deselect();
		App.Utilities.warpEls(['.treasury-tot', '.changeTax']);
	},
	closeView: function() {
		$('#oneModal, #oneModal .fort-label').off();
    	this.unbind();
    	this.undelegateEvents();
    	this.remove();
    	$('#oneModal .modal-dialog').removeClass('modal-lg');
    	App.Views.battleMap.smoothScroll('.terr:first-child');
	},
	toggleEnactPolicy: function(e) {
		var policyID = e.currentTarget.value;
		var polArr = _.where(App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicies'), {side: App.Utilities.activeSide()});
		var clickedPolIndexInSidePolicies = _.pluck(polArr, 'id');
		var indexInSidePolicies = _.indexOf(clickedPolIndexInSidePolicies, policyID);
		
		polArr[indexInSidePolicies].priority = e.currentTarget.checked ? (App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicyCount') + 1) : 0;

		if(App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicyCount') > 1
			&& !e.currentTarget.checked
			&& indexInSidePolicies < polArr.length - 1) {
			
			for(var i = 0; i < ((polArr.length - 1) - indexInSidePolicies); i++ ) {
				polArr[indexInSidePolicies + (i + 1)].priority = polArr[indexInSidePolicies + (i + 1)].priority - 1;
			}
		
		}

		if(policyID === 'recruit_army') {
			polArr[indexInSidePolicies].amount = 25000;
		}

		polArr = _.sortBy(polArr, 'priority');

		var activeCount = e.currentTarget.checked ? App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicyCount') + 1 : App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicyCount') - 1;

		App.Models.nationStats.get(App.Utilities.activeSide()).set('activePolicies', polArr);
		App.Models.nationStats.get(App.Utilities.activeSide()).set('activePolicyCount', activeCount);

		// Logging
		App.Utilities.console(App.Utilities.activeSide() + ' side policies: ');
		App.Utilities.console(App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicies'));
		var enemySide = App.Utilities.activeSide() === 'left' ? 'right' : 'left';
		App.Utilities.console(enemySide + ' side policies: ');
		App.Utilities.console(App.Models.nationStats.get(enemySide).get('activePolicies'));

	},
	confUpdatePolicy: function() {
		if(!this.model.get('stopClick')) {

			if(App.Models.nationStats.get(App.Utilities.activeSide()).changedAttributes().activePolicyCount != undefined) {
				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-globe",
					titleTxt : "Polices Updated in&nbsp;" + App.Utilities.getActiveEmpireName(),
					msgType: 'left'
				});
			}
			this.model.set('stopClick', true);
		}
	},
	endTheTurn: function() {
		if(!this.model.get('stopClick')) {
			App.Views.battleMap.deselect();
			App.Views.nationStatsView.updater();
			this.model.set('stopClick', true);
		}
	},
	invadeTheTerritory: function() {
		if(!this.model.get('stopClick')) {
			App.Views.selectedTerrView.invadeTerr(App.Models.selectedTerrModel, App.Models.clickedTerrModel, this.model.get('newObj'));
			this.model.set('stopClick', true);
		}
	},
	currentClick : function(e) {

		$.each($('.previous'), function() {
			this.click();
		});

		this.mouseOverBar(e);

	},
	mouseOutBar: function(e) {

		// App.Utilities.console(e.type);

		if(!App.Utilities.smallScreenOnly() || e.type === 'click' || (App.Utilities.smallScreenOnly() && e.type === 'mouseout')) {
			var thisEl = e.currentTarget;
			if(this.model.get('animationOver')) {
				$(thisEl).addClass('current').removeClass('previous');
				$(thisEl.firstChild).css('width', $(thisEl.firstChild).data('endVal') + '%');
				$(thisEl).find('.prog-bar-text-val').text($(thisEl).find('.prog-bar-text-val').data('endVal'));
			}
		}

	},
	mouseOverBar: function(e) {

		// App.Utilities.console(e.type);

		if(!App.Utilities.smallScreenOnly() || e.type === 'click') {

			var thisEl = e.currentTarget;
			if(this.model.get('animationOver')) {
				$(thisEl).addClass('previous').removeClass('current');
				$(thisEl.firstChild).css('width', $(thisEl.firstChild).data('startVal') + '%');
				$(thisEl).find('.prog-bar-text-val').text($(thisEl).find('.prog-bar-text-val').data('startVal'));
			}

		}

	},
	rebuildTheInfrastructure: function() {

		if(!this.model.get('stopClick')) {

			var cost = this.model.get('diffToNext'),
				treasury = App.Utilities.getTreasury() - cost,
				diff = 100 - App.Models.selectedTerrModel.get('econStrength'),
				newSideInfraspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('infrastructureSpend');

			App.Utilities.upgradeTerrEconStr();
			App.Utilities.flipEls(['.econStrength-bar', '.econMorale-bar', '.econMorale-bar', '.economicOutput-bar']);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('repairAllInfrastructureCost', App.Collections.terrCollection.returnTotalCost('econStrength'));
			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('infrastructureSpend', (newSideInfraspend + cost));
			App.Utilities.displayInRange();
			App.Utilities.setClickedTreasuryLimits();

			var infraMsgsArr = [
					['Traffic flowing', _.random(Math.round(diff/2), diff), 'more smoothly through'],
					['Highways re-open in', diff, 'of'],
					['Commute times down',  _.random(Math.round(diff/2), diff), 'in'],
					['Army surveyors declare', 100, 'of roads passable in']
				],
				msgArrNum = _.random(0, infraMsgsArr.length - 1);

			App.Views.battleMap.notify({
				icon: "glyphicon glyphicon-wrench",
				titleTxt: "Infrastructure Repaired",
				msgTxt : infraMsgsArr[msgArrNum][0] +" "+infraMsgsArr[msgArrNum][1]+"% "+infraMsgsArr[msgArrNum][2]+" "+ App.Models.selectedTerrModel.get('name') +" after completion of $" + App.Utilities.addCommas(cost) + " reconstruction&nbsp;project.",
				msgType: 'left'
			});

			this.model.set('stopClick', true);
		}

	},
	rebuildAllInfrastructure: function() {

		if(!this.model.get('stopClick')) {

			var cost = App.Collections.terrCollection.returnTotalCost('econStrength'),
				treasury = App.Utilities.getTreasury() - cost,
				newSideInfraspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('infrastructureSpend');

			App.Collections.terrCollection.repairAllInfrastructure();
			App.Models.nationStats.get(App.Utilities.activeSide()).set('repairAllInfrastructureCost', 0);
			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('infrastructureSpend', (newSideInfraspend + cost));
			
			if(App.Models.battleMapModel.get('selectedMode')) {
				App.Utilities.flipEls(['.econStrength-bar', '.econMorale-bar', '.econMorale-bar', '.economicOutput-bar']);
				App.Utilities.displayInRange();
			}

			var minNum = Math.round(cost / App.Constants.ECON_STR_COST / App.Models.nationStats.get(App.Utilities.activeSide()).get('terrs').length * 10);

			var allInfraMsgsArr = [
					['Traffic flowing', _.random(Math.round(minNum/2), minNum), 'more smoothly through'],
					['Highways re-open in', minNum, 'of'],
					['Commute times down',  _.random(Math.round(minNum/2), minNum), 'in'],
					['Army engineers report', 100, 'of roads clear for unit movements across']
				],
				allMsgArrNum = _.random(0, allInfraMsgsArr.length - 1);

			App.Views.battleMap.notify({
				icon: "glyphicon glyphicon-wrench",
				titleTxt : "Infrastructure Repaired",
				msgTxt: allInfraMsgsArr[allMsgArrNum][0] +" "+allInfraMsgsArr[allMsgArrNum][1]+"% "+allInfraMsgsArr[allMsgArrNum][2]+" "+ App.Utilities.getActiveEmpireName() +" after completion of $" + App.Utilities.addCommas(cost) + " national reconstruction&nbsp;project.",
				msgType: 'left'
			});

			this.model.set('stopClick', true);

		}

	},
	restartTheGame: function() {

		if(!this.model.get('stopClick')) {
			App.Utilities.setNextTrack();
			$('#ambientMusic')[0].pause();
			$('#ambientMusic').off();
			$('#ambientMusic').bind('ended', App.Utilities.playNextTrack);

			App.Utilities.removeClassName(['selected', 'selectedSection']);
			App.Models.battleMapModel = new App.Models.BattleZone();
			App.Views.battleMap = new App.Views.BattleZone({model: App.Models.battleMapModel});
			$('#game').html(App.Views.battleMap.$el);
			$('#game').removeClass('fadein');
			$('.army, #sidebar-main-trigger, #sidebar-secondary-trigger, .changeTax, newTurn, .sideName').attr('tabindex', -1);
			$('body').prepend($('<div id="setup"></div>'));

			var LeftModel = new Emp({
				armyPopulationStart: App.Constants.START_ARMY_UNITS,
				color: 'blue'
			});
			        	
			var RightModel = new Emp({
				armyPopulationStart: App.Constants.START_ARMY_UNITS,
				color: 'orange'
			});
			App.Models.nationStats = new App.Models.NationStats({
				'left' : LeftModel,
				'right' : RightModel
			});
			App.Views.nationStatsView = new App.Views.NationStats({model: App.Models.nationStats});
			App.Collections.terrCollection = new App.Collections.Territories();
			App.Utilities.makeTerritories();
			App.Views.gameStartView = new App.Views.GameStart({model: App.Models.gameStartModel});
			$('#setup').html(App.Views.gameStartView.$el);
			App.Views.p1ColorView = new App.Views.ColorView({model: App.Models.gameStartModel});
			App.Views.p2ColorView = new App.Views.RightColorView({model: App.Models.gameStartModel});
			$('#p1ColorMenu').html(App.Views.p1ColorView.$el);
			$('#p2ColorMenu').html(App.Views.p2ColorView.$el);

			this.model.set('stopClick', true);

		}

	},
	repairTheFort: function() {

		if(!this.model.get('stopClick')) {

			var treasury = App.Utilities.getTreasury() - this.model.get('diffToNext'),
				newSideFortspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('fortSpend');

			App.Views.battleMap.notify({
				titleTxt : "+" + (100 - App.Models.selectedTerrModel.get('fortStrength')) + "% Fort Strength",
				msgTxt : "Spirits lifted by $" + App.Utilities.addCommas(this.model.get('diffToNext')) + " investment in repairs at Fort&nbsp;" + App.Models.selectedTerrModel.get('name') + ".",
				msgType:'success'
			});

			App.Utilities.repairTerrFortStr();
			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('fortSpend', (newSideFortspend + this.model.get('diffToNext')));
			App.Utilities.displayInRange();
			App.Utilities.flipEls(['.econMorale-bar', '.econMorale-bar', '.fortStrength-main', '.economicOutput-bar']);

			this.model.set('stopClick', true);

		}

	},
	repairAllForts: function() {

		if(!this.model.get('stopClick')) {

			var cost = App.Collections.terrCollection.returnTotalCost('fortStrength'),
				treasury = App.Utilities.getTreasury() - cost,
				newSideFortspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('fortSpend');

			App.Collections.terrCollection.repairAllForts();
			
			if(App.Models.battleMapModel.get('selectedMode')) {
				App.Utilities.displayInRange();
				App.Utilities.flipEls(['.econMorale-bar', '.econMorale-bar', '.fortStrength-main', '.economicOutput-bar']);
			}

			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set({
				'fortSpend': (newSideFortspend + cost),
				'repairAllFortCost' : 0
			});

			App.Views.battleMap.notify({
				icon: "glyphicon glyphicon-wrench",
				titleTxt : "All Forts Repaired in&nbsp;" + App.Utilities.getActiveEmpireName(),
				msgTxt: "Cost: $" + App.Utilities.addCommas(cost),
				msgType: 'left'
			});

			this.model.set('stopClick', true);

		}

	},
	trainTheArmy: function() {

		if(!this.model.get('stopClick')) {

			var treasury = App.Utilities.getTreasury() - this.model.get('diffToNext')
				startXP = App.Models.selectedTerrModel.get('armyXP'),
				newSideTrainingspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('armyTrainingSpend');

			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('armyTrainingSpend', (newSideTrainingspend + this.model.get('diffToNext')));
			App.Utilities.trainTerrArmy();


			App.Views.battleMap.notify({
				titleTxt : "+" + (App.Models.selectedTerrModel.get('armyXP') - startXP) + " Army XP in&nbsp;" + App.Models.selectedTerrModel.get('name'),
				msgType:'success',
				delay: App.Constants.DELAY_SHORTEST,
				icon: 'glyphicon glyphicon-signal'
			});

			App.Views.battleMap.deselect();

			this.model.set('stopClick', true);

		}

	},
	upgradeTheEconomy: function() {

		if(!this.model.get('stopClick')) {

			var treasury = Math.round(App.Utilities.getTreasury() - this.model.get('diffToNext')),
				newSideLevelspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('econLevelSpend');

			App.Utilities.upgradeTerrEconLevel();

			App.Utilities.flipEls(['.econMorale-bar', '.econMorale-bar', '.econLevel-bar', '.economicOutput-bar']);

			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('econLevelSpend', (newSideLevelspend + this.model.get('diffToNext')));

			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-education',
				titleTxt : "Tech Level Upgraded in&nbsp;" + App.Models.selectedTerrModel.get('name'),
				msgType:'success',
				delay: App.Constants.DELAY_SHORTEST,
			});

			this.model.set('stopClick', true);

		}

	},
	updateTheFortLevel: function() {

		if(!this.model.get('stopClick')) {

			var treasury = App.Utilities.getTreasury() - this.model.get('diffToNext'),
				newSideFortLevelspend = App.Models.nationStats.get(App.Utilities.activeSide()).get('fortLevelSpend');

			App.Utilities.upgradeTerrArmyFortLevel();
			App.Utilities.flipEls(['.econMorale-bar', '.econMorale-bar', '.fortStrength-main', '.economicOutput-bar']);
			App.Models.nationStats.payForUpgrade(treasury);
			App.Models.nationStats.get(App.Utilities.activeSide()).set('fortLevelSpend', (newSideFortLevelspend + this.model.get('diffToNext')));
			App.Utilities.displayInRange();

			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-signal',
				titleTxt : "Fort Upgraded: Level&nbsp;" + App.Models.selectedTerrModel.get('fortLevel'),
				msgTxt : "Everyone feels safer in " + App.Models.selectedTerrModel.get('name') + " after installation of new $" + App.Utilities.addCommas(this.model.get('diffToNext')) + "&nbsp;defenses.",
				msgType:'success'
			});

			this.model.set('stopClick', true);

		}

	}

});