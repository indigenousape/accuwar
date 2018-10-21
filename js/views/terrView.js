 /*
 	[accuwar]: Turn-based Strategy Game
	Territory View
*/ 

App.Views.Terr = Backbone.View.extend({
	className: function() {
		var classes = 'terr ';
		
		if(this.model.get('small')) {
			classes += ' small ';
		}

		if(this.model.get('inRange')) {
			classes += ' inrange ';
		}

		if(this.model.get('recruitTarget')) {
			classes += ' reinforce ';
		}

		if(this.model.get('remainingTurns') === 0) {
			classes += ' noTurns ';
		}

		if(this.model.get('isCapital')) {
			classes += ' capital ';
		}

		if(this.model.get('selected')) {
			classes += ' selected ';
		}

		if(this.model.get('borderLeft')) {
			classes += ' borderLeft ';
		}

		if(this.model.get('borderRight')) {
			classes += ' borderRight ';
		}

		if(this.model.get('borderBottom')) {
			classes += ' borderBottom ';
		}

		if(this.model.get('borderTop')) {
			classes += ' borderTop ';
		}

		classes += this.model.get('side') + ' ' + App.Models.nationStats.get(this.model.get('side')).get('color');

		return classes;

	},// Add classes to the container when initialized
	template: App.Utilities.template('terrTemplate'), // pass id of territory template from the index page to global template function to bind the model
	initialize: function() {
		this.model.on('change', this.render, this); // when the model changes, re-render the view
		this.render();

	 	// If in Mobile mode a click event is bound to the territory
	 	// If in desktop mouse up events are used to accommodate people who may click and drag 
	 	if(App.Utilities.smallScreenOnly()) {
	 		this.events['click .army'] = 'terrClick';
	 		this.events['click .no-btn'] = 'terrClick';
			this.events['click .army > label'] = 'terrClick';
			this.events['click .army > h2'] = 'terrClick';
	 		this.delegateEvents();
		} else {
	 		this.events['mouseup .army'] = 'terrClick';
			this.events['mouseup .no-btn'] = 'terrClick';
			this.events['mouseup .army > label'] = 'terrClick';
			this.events['mouseup .army > h2'] = 'terrClick';
	 		this.delegateEvents();	
	 	}

	},
	events: {
		'keyup .army' : 'terrFocus'
	},
	terrFocus: function(e) {
		if(App.Utilities.isEnterKey(e)) {
			this.terrClick();
		} else if (App.Utilities.isEscKey(e)) {
			this.unfocus();
		}

	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));

		var newClasses = this.className();
		this.$el.attr("class", "terr");
		this.$el.addClass(newClasses);
		return this;
	},
	unfocus: function() { 
		this.$el.find('.army').blur();
	},
	deselect: function() {
		App.Views.nationStatsView.closeMenu();

		App.Views.battleMap.notify({
			icon: "glyphicon glyphicon-remove-sign",
			titleTxt : App.Models.clickedTerrModel.get('name') + " deselected.",
			delay: App.Constants.DELAY_SHORTEST
		});

		// Deselect the clicked territory
		App.Views.battleMap.deselect();

		if(!App.Utilities.isMobile()) {
			this.$el.find('.army').focus();
		}
	},
	terrClick: function(e) {

		var removeClasses = ['pulse', 'shake'];
		App.Utilities.removeClassName(removeClasses);

		App.Models.clickedTerrModel = this.model;
		App.Views.clickedTerrView = this;
		
		var selectedMode = App.Views.battleMap.model.get('selectedMode'),
			selfClick = App.Models.clickedTerrModel.get('selected') && selectedMode,
			battleMode = false;

		// No turns error
		if(App.Models.clickedTerrModel.get('remainingTurns') === 0 && !selectedMode) {
			var name = App.Models.clickedTerrModel.get('name'),
				isTurn = App.Models.clickedTerrModel.get('side') === App.Utilities.activeSide();
			
			if(isTurn) {
				// Own territory is out of turns
				App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-exclamation-sign',
					titleTxt : name + " is out of&nbsp;turns.",
					msgTxt : "Select another territory from your empire, or click the End Turn&nbsp;button.",
					msgType: "warning",
					delay: App.Constants.DELAY_SHORTEST
				});

				this.$el.find(".army").addClass('animated shake');

			} else {
				// Enemy territory, not selectable
				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-exclamation-sign",
					titleTxt : name + " belongs to the&nbsp;enemy.",
					msgTxt : "You must invade this territory with units from a territory of your&nbsp;own.",
					msgType : "warning",
					delay: App.Constants.DELAY_SHORTEST
				});

				this.$el.find(".army").addClass('animated shake');

			}

			return false;
		}

		if(selfClick) {

			this.deselect();

			App.Views.nationStatsView.render();

			return false;

		} // If not, proceed to selected territory mode
		else if (!selectedMode) {

			App.Views.nationStatsView.closeMenu();

			var side = App.Models.clickedTerrModel.get('side');
			App.Utilities.console(App.Models.clickedTerrModel);

			App.Models.selectedTerrModel = App.Models.clickedTerrModel;

			App.Views.nationStatsView.render();

			// Select the territory message OR message about the territory's limitations
				// Not enough morale to attack
				// Not enough units given infrastructure to attack or invade
				// Not enough units to attack or invade (but infrastructure is okay)
				// Not enough units to reinforce (with or without infrastructure constraint)

			if(!App.Utilities.returnSelectedTerritoryIsLimited(App.Models.selectedTerrModel)) {

				// Close any open alerts when a territory is selected
				// to prevent the alerts from obscuring the territory they want to attack
				$('.game-alert .close').each(function() {
					this.click()
				});

				App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-ok-sign',
					titleTxt : App.Models.clickedTerrModel.get('name') + " selected.",
					msgTxt : "Select a territory in "+App.Utilities.getEnemyEmpireName()+" to attack or in "+App.Utilities.getActiveEmpireName()+" to send&nbsp;units.",
					delay: App.Constants.DELAY_SHORTEST
				});

			} else {

				var selectedTerrObj = App.Utilities.returnSelectedTerritoryLimits(),
					len = selectedTerrObj.length,
					titleTxt = App.Models.clickedTerrModel.get('name') + '&nbsp;selected.',
					msgTxt = '';

				if( (selectedTerrObj.moraleLimit && !selectedTerrObj.popLimit) ) {

						msgTxt = 'Army can not attack. ' + selectedTerrObj.moraleLimit;


				} else if ((!selectedTerrObj.moraleLimit && !selectedTerrObj.invLimit) || selectedTerrObj.popLimit) {

						msgTxt = 'Army can not attack or send reinforcements. ' + selectedTerrObj.popLimit;

				} else if (selectedTerrObj.moraleLimit && selectedTerrObj.popLimit) {

						msgTxt = 'Army can not attack or send reinforcements. ' + selectedTerrObj.popLimit + ' ' + selectedTerrObj.moraleLimit;

				} else if (selectedTerrObj.invLimit) {

						msgTxt = 'Army can not invade. ' + selectedTerrObj.invLimit;

				}

				App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-exclamation-sign',
					titleTxt : titleTxt,
					msgTxt : msgTxt
				});

			}

			App.Utilities.setClickedTreasuryLimits(); // Sets the current treasury and upgrade costs to the model
			App.Views.selectedTerrView = this;
			App.Views.battleMap.model.set('selectedMode', true);
			App.Models.clickedTerrModel.set('selected', true);

			this.$el.find(".army").addClass('animated pulse');

			selectedMode = true;

			App.Views.selectedFooterView = new App.Views.Footer({model: App.Models.clickedTerrModel});
			$('#footerZone').html(App.Views.selectedFooterView.$el);

			//Update the UI to reflect selected mode
			$('#game').addClass('selectedSection');

			App.Utilities.displayInRange();

			if (App.Utilities.smallScreenOnly()) {
				$('#selectedFixedRotator').width(App.Views.selectedFooterView.armyWidth);
			}

			$('body').addClass('terrSelected');

			if(!App.Utilities.isMobile()) {
				this.$el.find('.army').focus();
			}

			return false;

		}

		// Do the clicked territory and previously selected territory's sides match
		var sidesMatch = App.Models.selectedTerrModel.get('side') == App.Models.clickedTerrModel.get('side');
		var needsReinfStr = "Send reinforcements from another territory and try&nbsp;again.",
			needsMor = "send reinforcements from another territory and try&nbsp;again."
		var rebuildFortStr = "Repair damaged forts and upgrade damaged&nbsp;forts.";

		if(App.Models.selectedTerrModel.get('fortStrength') < 100) {
			needsMor = "Repair your fort and try again.";
		} else if(App.Models.selectedTerrModel.get('fortStrength') === 100 && App.Models.selectedTerrModel.get('fortLevel') != 10) {
			needsMor = "Upgrade your fort to the next tech level and try again.";
		} else {
			needsMor = needsReinfStr;
		}

		if(!sidesMatch && !this.model.get('inRange')) {
			var name = App.Models.clickedTerrModel.get('name');
			var hasPop = App.Utilities.enoughPopToAttack(App.Models.selectedTerrModel);
			var hasMor = App.Models.selectedTerrModel.get('morale') > App.Constants.ATTACK_MORALE_MINIMUM;
			var selectedName = App.Models.selectedTerrModel.get('name');

			if(hasPop && hasMor) {
				// Out of range
				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-exclamation-sign",
					titleTxt : name + " is out of&nbsp;range.",
					msgType: "warning",
					delay: App.Constants.DELAY_SHORTEST
				});
				this.$el.find(".army").addClass('animated shake');
				return false;
			} else if(!hasPop) {
				var text = "";
				if(App.Models.selectedTerrModel.get('armyPopulation') > App.Constants.ATTACK_ARMY_MINIMUM) {
					text = "Rebuild the damaged infrastructure in " + selectedName + " so that your units can travel and attack other&nbsp;territories.";
				} else {
					text = selectedName + " does not have enough units ("+App.Constants.ATTACK_ARMY_MINIMUM+" min) to attack&nbsp;" +name+ ".\n\n" + needsReinfStr;
				}

				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-exclamation-sign",
					titleTxt : selectedName + " can not&nbsp;attack.",
					msgTxt : text,
					msgType: "warning"
				});

				this.$el.find(".army").addClass('animated shake');

				return false;
			} else if(!hasMor) {

				text = "The " + selectedName + " army does not have enough morale ("+ App.Constants.ATTACK_MORALE_MINIMUM + " min) to attack&nbsp;" +name+ ".\n\n" + needsMor;

				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-exclamation-sign",
					titleTxt : selectedName + " can not&nbsp;attack.",
					msgTxt : text,
					msgType: "warning"
				});

				this.$el.find(".army").addClass('animated shake');

				return false;
			}

		}

		// Reinforce target : If the map is in selected mode, the selected territory was not clicked, and the sides match
		var reinforceMode = selectedMode && !selfClick && sidesMatch;

		if(!selfClick && selectedMode) {
			// A territory has been selected and the clicked territory is not the currently selected territory
			
			var hasTurns = App.Models.selectedTerrModel.get('remainingTurns') > 0;
			var selectedName = App.Models.selectedTerrModel.get('name');

			if(hasTurns && !reinforceMode) {
				//Attack mode 

				var selectedName = App.Models.selectedTerrModel.get('name'),
					clickedName = App.Models.clickedTerrModel.get('name');
				App.Models.clickedTerrModel.set('selected', false);

				// Error messages
				// Attacking territory does not meet minimum morale or army population requirements
				if (!App.Utilities.enoughPopToAttack(App.Models.selectedTerrModel)) {
					
					var text = "";
					if(App.Models.selectedTerrModel.get('armyPopulation') > App.Constants.ATTACK_ARMY_MINIMUM) {
						text = "Rebuild the damaged infrastructure in " + selectedName + " so that your units can travel and attack other&nbsp;territories.";
					} else {
						text = selectedName + " does not have enough units ("+App.Constants.ATTACK_ARMY_MINIMUM+" min) to attack&nbsp;" +clickedName+ ".\n\n" + needsReinfStr;
					}

					App.Views.battleMap.notify({
						icon: "glyphicon glyphicon-exclamation-sign",
						titleTxt : selectedName + " can not&nbsp;attack.",
						msgTxt : text,
						msgType: "warning"
					});

					this.$el.find(".army").addClass('animated shake');

					return false;

				} else if (App.Models.selectedTerrModel.get('morale') <= App.Constants.ATTACK_MORALE_MINIMUM) {
					text = selectedName + " does not have enough morale ("+ App.Constants.ATTACK_MORALE_MINIMUM + " min) to attack&nbsp;" +clickedName+ ".\n\n" + needsReinfStr;
					
					App.Views.battleMap.notify({
						icon: "glyphicon glyphicon-exclamation-sign",
						titleTxt : selectedName + " can not&nbsp;attack.",
						msgTxt : text,
						msgType: "warning"
					});

					this.$el.find(".army").addClass('animated shake');

					return false;
				}

				// Start of Attack Confirmation Dialog

				App.Views.clickedTerrView.attackTerr();

			} else if (hasTurns && reinforceMode) {
				// Reinforce Mode

				// Confirm Territory has capacity to send reinforcements to the clicked territory and alert user why if it does not 
				if(!App.Utilities.enoughPopToReinforce(App.Models.selectedTerrModel)) {

					var text = "";
					if(App.Models.selectedTerrModel.get('armyPopulation') > App.Constants.ATTACK_ARMY_MINIMUM) {
						text = "Rebuild the damaged infrastructure in " + selectedName + " so that your units can travel and attack other&nbsp;territories.";
					} else {
						text = selectedName + " does not have enough units ("+App.Constants.ATTACK_ARMY_MINIMUM+" min) to send reinforcements to&nbsp;" +App.Models.clickedTerrModel.get('name')+ ".\n\n" + needsReinfStr;
					}

					App.Views.battleMap.notify({
						icon: "glyphicon glyphicon-exclamation-sign",
						titleTxt : selectedName + " can not&nbsp;reinforce.",
						msgTxt : text,
						msgType: "warning"
					});

					this.$el.find(".army").addClass('animated shake');

					return false;
				}

				App.Views.clickedTerrView.reinforceTerr();

			}

		}

	},
	attackTerr: function() {
		var titleText = 'Attack ' + App.Models.clickedTerrModel.get('name') + ' from ' + App.Models.selectedTerrModel.get('name') + '?',
			dispAttArmyPop = App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation')),
			dispDefPop = App.Utilities.addCommas(App.Models.clickedTerrModel.get('armyPopulation')),
			attackerTechBonus = App.Utilities.activeEmpire().get('armyTechLvl') * 25,
			defenderTechBonus = App.Utilities.enemyEmpire().get('armyTechLvl') * 25,

			toStr = '<div class="pull-right"><span class="glyphicon glyphicon-user"></span> ('+App.Models.clickedTerrModel.get('armyWins') +' - '+ App.Models.clickedTerrModel.get('armyLosses') + ')</div>' +
			'<div><label class="top-label">Defender: '+App.Models.clickedTerrModel.get('name')+'</label></div><div><label>Army:</label> ' + dispDefPop + ' units</div>' +
				'<div><label>Rank: ' + App.Utilities.makeStarGroup({newRank: App.Models.clickedTerrModel.get('armyRank'), armyPromoted: false}) + '</label></div>' + 
				'<div><label>Experience:</label> ' + App.Models.clickedTerrModel.get('armyXP') + ' XP</div>' +
				'<div><label>Morale:</label> ' + App.Models.clickedTerrModel.get('morale') + '%</div><div><label>Weapons Tech:</label> +' + defenderTechBonus + '%</div>' +
				'<div class="fort-data"><div><label>Fort Strength: </label> ' + App.Models.clickedTerrModel.get('fortStrength') + '%</div><div><label>Fort Level:</label> +' + (App.Models.clickedTerrModel.get('fortLevel') * App.Constants.FORT_LVL_STRENGTH_BONUS) + '%</div>' +
				'</div>',
			fromStr = '<div class="pull-right"><span class="glyphicon glyphicon-user"></span> ('+App.Models.selectedTerrModel.get('armyWins') +' - '+ App.Models.selectedTerrModel.get('armyLosses') + ')</div>' +
			'<div><label class="top-label">Attacker: '+App.Models.selectedTerrModel.get('name')+'</label></div><div><label>Army:</label> ' + dispAttArmyPop + ' units</div>' +
				'<div><label>Rank: ' + App.Utilities.makeStarGroup({newRank: App.Models.selectedTerrModel.get('armyRank'), armyPromoted: false}) + '</label></div>' +
				'<div><label>Experience:</label> ' + App.Models.selectedTerrModel.get('armyXP') + ' XP</div>' +
				'<div><label>Morale:</label> ' + App.Models.selectedTerrModel.get('morale') + '%</div>' +
				'<div><label>Weapons Tech:</label> +' + attackerTechBonus + '%</div>',
			invasionLimit = Math.round(App.Models.selectedTerrModel.get('armyPopulation') * (App.Models.selectedTerrModel.get('econStrength') / 100)),
			infraWarningHTML = App.Models.selectedTerrModel.get('econStrength') < 100 ? '<small class="text-danger text-center center-block">Only '+ App.Utilities.addCommas(invasionLimit) +' units available to invade due to '+App.Models.selectedTerrModel.get('econStrength')+'% infrastructure in ' + App.Models.selectedTerrModel.get('name') + '.</small>' : '',
			
			messageHTML = '<div class="modal-two-terr-container '+App.Models.selectedTerrModel.get('color')+'"><div class="col-xs-6 pull-' + App.Models.selectedTerrModel.get('side') + ' '+App.Models.selectedTerrModel.get('color')+' modal-side-container">' + fromStr + '</div><div class="col-xs-6 defender-col pull-' + App.Models.clickedTerrModel.get('side') + ' '+App.Models.clickedTerrModel.get('color')+' modal-side-container">' + toStr + '</div><div class="clearfix"></div></div>' + infraWarningHTML;

			var confModalModel = new App.Models.Modal({
				title: titleText,
				confBtnId: 'confAttack',
				modalMsg: messageHTML,
				noTurnsMsg: 'Ends turn for ' + App.Models.selectedTerrModel.get('name') +'.',
				confBtnClass: 'btn-danger'
			});

			var confModalView = new App.Views.ConfModal({model: confModalModel});

	},
	reinforceTerr: function() {
		var reinforceMax = (App.Models.selectedTerrModel.get('armyPopulation') - App.Constants.ATTACK_ARMY_MINIMUM) * (App.Models.selectedTerrModel.get('econStrength') / 100),
			reinforceMax = Math.round(reinforceMax),
			infraWarningHTML = App.Models.selectedTerrModel.get('econStrength') < 100 ? '<small class="text-danger text-center center-block" tabindex="0">Only '+App.Utilities.addCommas(reinforceMax)+' reinforcements available due to ' + App.Models.selectedTerrModel.get('econStrength') + '% infrastructure in&nbsp;' + App.Models.selectedTerrModel.get('name') + '.</small>' : '',
			newVals = App.Utilities.returnNewMoraleXpRank(App.Models.clickedTerrModel, Math.round(reinforceMax/2)),
			toStr = '<div class="pull-right"><span class="glyphicon glyphicon-user" aria-hidden="true"></span> ('+App.Models.clickedTerrModel.get('armyWins') +' - '+ App.Models.clickedTerrModel.get('armyLosses') + ')</div>' +
						'<div><label class="top-label">To: '+App.Models.clickedTerrModel.get('name')+'</label></div><div><label>Army:</label> <span id="toUnits">' + App.Utilities.addCommas(App.Models.clickedTerrModel.get('armyPopulation') + Math.round(reinforceMax/2)) + '</span> Units</div>' +
						'<div><label>Rank: <span id="toRank">' + App.Utilities.makeStarGroup({newRank: newVals.toRank, armyPromoted: false}) + '</span></label></div>' +
						'<div><label>Experience:</label> <span id="toXP">' + newVals.toXP + '</span> XP</div>' +
						'<div><label>Morale:</label> <span id="toMorale">' + newVals.toMorale + '</span>%</div>',
			fromStr = '<div class="pull-right"><span class="glyphicon glyphicon-user" aria-hidden="true"></span> ('+App.Models.selectedTerrModel.get('armyWins') +' - '+ App.Models.selectedTerrModel.get('armyLosses') + ')</div>' +
				'<div><label class="top-label">From: '+App.Models.selectedTerrModel.get('name')+'</label></div>' +
				'<div><label>Army:</label> <span id="remainingUnits">' + App.Utilities.addCommas(Math.round(reinforceMax/2)) + '</span> Units</div>' +
				'<div><label>Rank: ' + App.Utilities.makeStarGroup({newRank: App.Models.selectedTerrModel.get('armyRank'), armyPromoted: false}) +  '</label></div>' + 
				'<div><label>Experience:</label> ' + App.Models.selectedTerrModel.get('armyXP') + ' XP</div>' +
				'<div><label>Morale:</label> <span id="fromMorale">' + newVals.fromMorale + '</span>%</div>',
			messageHTML = '<div class="modal-two-terr-container '+App.Models.selectedTerrModel.get('color')+'"><div class="col-xs-6 reinf-col pull-left '+App.Models.selectedTerrModel.get('color')+' modal-side-container" tabindex="0">' + fromStr + '</div><div class="col-xs-6 reinf-col pull-right '+App.Models.clickedTerrModel.get('color')+' modal-side-container" tabindex="0">' + toStr
				+ '</div><div class="clearfix"></div></div>' + infraWarningHTML + '<p class="form-text" id="sp-label">How many army units would you like to send to&nbsp;' + App.Models.clickedTerrModel.get('name') + '?</p>';

		var spModalModel = new App.Models.Modal({
			title: 'Send Army Units from ' + App.Models.selectedTerrModel.get('name') + ' to&nbsp;' + App.Models.clickedTerrModel.get('name'),
			confBtnId: 'confReinforce',
			modalMsg: messageHTML,
			impactMsg: 'Strengthens morale in '+App.Models.clickedTerrModel.get('name')+'. Weakens morale in '+App.Models.selectedTerrModel.get('name')+'. Impacts army XP in&nbsp;' + App.Models.clickedTerrModel.get('name') + '.',
			impactClass: 'text-muted',
			noTurnsMsg: 'Ends turn for ' + App.Models.selectedTerrModel.get('name') + '.',
			confBtnClass: 'btn-danger',
			showRange: true,
			rangeMin: App.Constants.ATTACK_ARMY_MINIMUM,
			rangeMax: reinforceMax,
			rangeVal: Math.round(reinforceMax/2),
			ariaLabel: 'sp-label'
		});

		var spModalView = new App.Views.SinglePromptModal({model: spModalModel});

	},
	invadeTerr: function(attacking, defending, newObj) {

		var newInvaded = newObj.invaded,
			newAttacking = newObj.attacking,
			transferringUnitsMax = (App.Models.selectedTerrModel.get('armyPopulation') - App.Constants.ATTACK_ARMY_MINIMUM) * (App.Models.selectedTerrModel.get('econStrength') / 100),
			transferringUnitsMax = transferringUnitsMax - transferringUnitsMax%100,
			transferringUnits = Math.min(Math.round(transferringUnitsMax/2) - Math.round(transferringUnitsMax/2)%100, App.Constants.ATTACK_INVADE_ARMY_MINIMUM),
			infraWarningHTML = App.Models.selectedTerrModel.get('econStrength') < 100 ? '<small class="text-danger text-center center-block">Only '+App.Utilities.addCommas(transferringUnitsMax)+' units available to invade due to '+App.Models.selectedTerrModel.get('econStrength') +'% infrastructure in&nbsp;' + App.Models.selectedTerrModel.get('name') + '.</small>' : '',
			toStr = '<div class="pull-right"><span class="glyphicon glyphicon-user"></span> ('+App.Models.clickedTerrModel.get('armyWins') +' - '+ App.Models.clickedTerrModel.get('armyLosses') + ')</div>' +
					'<div><label class="top-label">To: <span class="newTerrName">'+App.Models.clickedTerrModel.get('name')+'</span></label></div>' +
					'<div><label>Army:</label> <span id="invadedUnits">' + App.Utilities.addCommas(transferringUnits) + '</span> units</div>' +
						'<div><label>Rank: <span id="invadedRank">' + App.Utilities.makeStarGroup({newRank: App.Models.clickedTerrModel.get('armyRank'), armyPromoted: false}) + '</span></label></div>' +
						'<div><label>Experience:</label> <span id="invadedXP">' + App.Models.clickedTerrModel.get('armyXP') + '</span> XP</div>' +
						'<div><label>Morale:</label> <span id="invadedMorale">' + App.Models.selectedTerrModel.get('morale') + '</span>%</div>',
			fromStr = '<div class="pull-right"><span class="glyphicon glyphicon-user"></span> ('+App.Models.selectedTerrModel.get('armyWins') +' - '+ App.Models.selectedTerrModel.get('armyLosses') + ')</div>' +
				'<div><label class="top-label">From: '+App.Models.selectedTerrModel.get('name')+'</label></div>' +
				'<div><label>Army:</label> <span id="remainingUnits">' + App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation') - transferringUnits) + '</span> units</div>' +
				'<div><label>Rank: ' + App.Utilities.makeStarGroup({newRank: App.Models.selectedTerrModel.get('armyRank'), armyPromoted: false}) + '</label></div>' +
				'<div><label>Experience:</label> ' + App.Models.selectedTerrModel.get('armyXP') + ' XP</div>' +
				'<div><label>Morale:</label> <span id="invaderMorale">' + App.Models.selectedTerrModel.get('morale') + '</span>%</div>',

			messageHTML = '<div class="modal-two-terr-container '+App.Models.clickedTerrModel.get('color')+'"><div class="col-xs-6 reinf-col pull-' + App.Models.selectedTerrModel.get('side') + ' '+App.Models.selectedTerrModel.get('color')+' modal-side-container">' + fromStr + '</div>' +
			'<div class="col-xs-6 reinf-col pull-' + App.Models.clickedTerrModel.get('side') + ' '+App.Models.clickedTerrModel.get('color')+' modal-side-container">' + toStr + '</div><div class="clearfix"></div></div><div class="clearfix"></div>' + infraWarningHTML +
			'<p class="form-text" id="send-label">How many army units would you like to send from ' + App.Models.selectedTerrModel.get('name') + ' to secure&nbsp;<span class="newTerrName">' + App.Models.clickedTerrModel.get('name') + '</span>?</p>';

		var tpModalModel = new App.Models.Modal({
			title: '<span>'  + App.Models.clickedTerrModel.get('name') + '</span> invaded<span id="renameMsg"></span>!',
			confBtnId: 'confInvasion',
			modalMsg: messageHTML,
			modalMsg2: '<p class="form-text" id="rename-label">Enter a new name for this territory:</p>',
			noTurnsMsg: "Ends turn for " + App.Models.selectedTerrModel.get('name') + ".",
			confBtnClass: 'btn-danger',
			attacking: attacking,
			defending: defending,
			newObj : newObj,
			rangeMin: App.Constants.ATTACK_INVADE_ARMY_MINIMUM,
			rangeMax: transferringUnitsMax,
			rangeVal: transferringUnits,
			showRange: true
		});

		App.Views.tpModalView = new App.Views.TwoPromptModal({model: tpModalModel});

		$('#tp-input-2').val(App.Models.clickedTerrModel.get('name'));
		
		App.Utilities.selectOrFocus('tp-input-1');

	}

});