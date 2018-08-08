 /*
 	[accuwar]: Turn-based Strategy Game
	Two Prompt Modal View
*/ 

App.Views.TwoPromptModal = Backbone.View.extend({
	template: App.Utilities.template('tpModal'),
	initialize: function() {
		var thisView = this;
		this.render();

		$('#modalTarget').html(this.$el);
		$('#oneModal .modal-dialog').removeClass('modal-lg');

		this.model.set({
			'modalView' : thisView
		});

		$('#oneModal').on('shown.bs.modal', function() {
			$('#tp-input-1').focus();
			App.Views.battleMap.smoothScroll('.terr:first-child');
		});

	 	$('#oneModal').on('hidden.bs.modal', function(e) {
			$('#oneModal').off();
			thisView.closeView();
	 	});

	 	if(this.model.get('confBtnId') === 'confInvasion' && !App.Utilities.detectIE()) {
	 		this.events['input #tp-input-1'] = "showReinforcementResult";
	 		this.delegateEvents();
	 	} else if (this.model.get('confBtnId') === 'confInvasion') {
	 		this.events['change #tp-input-1'] = "showReinforcementResult";
	 		this.delegateEvents();	
	 	}

	 	App.Views.battleMap.smoothScroll('.modal-header');

	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	events: {
		'click #confInvasion' : 'confirmInvasion',
		'keyup #tp-input-2': 'nameValidator',
		'keyup #tp-input-1': 'keyPress'
	},
	closeView: function() {
    	this.unbind();
    	this.undelegateEvents();
    	this.remove();
    	App.Views.battleMap.smoothScroll('.terr:first-child');
	},
	enterKey: function(e) {
		var isKey = typeof e != 'undefined';
		if(isKey) {
			var key = window.event ? e.keyCode : e.which,
				isEnterKey = key === 13
		}

		if(isEnterKey) {
			this.confirmInvasion();
			return false;
		}
	},
	keyPress: function(e) {
		if(this.enterKey(e)) {
			this.confirmInvasion();
		};
	},
	showReinforcementResult: function() {

		var thisInput = $('#tp-input-1'),
			newUnitCount = parseInt(thisInput.val()),
			newToUnitDisplay = App.Utilities.addCommas(App.Models.clickedTerrModel.get('armyPopulation') + newUnitCount),
			newFromUnitDisplay = App.Utilities.addCommas(newUnitCount),
			newVals = App.Models.selectedTerrModel.returnNewMoraleXpRank(App.Models.clickedTerrModel, newUnitCount),
			dispFromRemaining = App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation') - newUnitCount);

		$('#remainingUnits').text(dispFromRemaining);
		// $('#invaderUnits').text(newFromUnitDisplay);
		$('#invaderMorale').text(newVals.fromMorale);
		$('#invadedXP').text(newVals.toXP);
		$('#invadedUnits').text(newToUnitDisplay);
		$('#invadedMorale').text(newVals.toMorale);

	},
	nameValidator: function(e) {

		var thisInput = $('#tp-input-2'),
			thisInputVal = thisInput.val(),
			errObj = App.Utilities.validateName(thisInputVal, 'territory');

		if(this.enterKey(e)) {

			// Validate for letters: validName function
			if(errObj.errCode === 0) {
				thisInput.removeClass("invalid");
				$('#error-message-2').html('');

				if(thisInputVal != App.Models.clickedTerrModel.get('name')) {
					$('#renameMsg').html(' and renamed ' + thisInputVal);
				} else {
					$('#renameMsg').html('');
				}

				$('.newTerrName').html(thisInputVal);

			} else {
				$('.newTerrName').html(App.Models.clickedTerrModel.get('name'));
				$('#renameMsg').html('');
				thisInput.addClass('invalid');

				$('#error-message-2').html(errObj.msg);
			}

		} else {

			if(errObj.errCode === 0) {
				thisInput.removeClass("invalid");
				$('#error-message-2').html('');
				if(thisInputVal != App.Models.clickedTerrModel.get('name')) {
					$('#renameMsg').html(' and renamed ' + thisInputVal);
				} else {
					$('#renameMsg').html('');
				}
				$('.newTerrName').html(thisInputVal);
			} else {

				$('.newTerrName').html(App.Models.clickedTerrModel.get('name'));
				$('#renameMsg').html('');

				if(thisInputVal != App.Models.clickedTerrModel.get('name')) {
					thisInput.addClass('invalid');
					$('#error-message-2').html(errObj.msg);
				}
			}

		}

	},
	confirmInvasion: function() {

		if(!this.model.get('stopClick')) {

			var thisView = this.model.get('modalView'),
				thatInput = $('#tp-input-2'),
				newName = thatInput.val(),
				validNewName = App.Utilities.validateName(newName, 'territory');

			// Exeption is because territory can be renamed after itself
			if (validNewName.errCode != 0 && newName != App.Models.clickedTerrModel.get('name')) {
				
				if(newName != App.Models.clickedTerrModel.get('name')) {
					$('#tp-error-msg-2').text(validNewName.msg);
					thatInput.addClass("invalid");
					$('.invalid').select();
					return false;
				}

			} else if (validNewName.errCode === 0 || (newName === App.Models.clickedTerrModel.get('name'))) {

				var transferringUnits = parseInt($('#tp-input-1').val()),
					newObj = thisView.model.get('newObj'),
					newInvaded = newObj.invaded,
					newAttacking = newObj.attacking,
					attacking = thisView.model.get('attacking'),
					defending = thisView.model.get('defending');

				var newSide = attacking.get('side'),
					oldSide = defending.get('side'),
					isNewName = newName != defending.get('name'),
					newNameText = isNewName ? ' and renamed it ' + newName : '',
					nationName = App.Views.nationStatsView.model.get(attacking.get('side')).get('empName');

				App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-globe',
					titleTxt : nationName + " Invades " + defending.get('name'),
					msgTxt : "The army defending " + defending.get('name') + " was defeated. " + attacking.get('name') + " army divisions have taken control of the territory"+newNameText+". The empire celebrates your victory!",
					msgType: "success"
				});

				App.Views.clickedTerrView.$el.find('.army > h2').removeClass('tada').addClass('tada');

				// Update Invaded Economics

				// Updating the selected territory so that the updateEconMorale & updateGDP functions will work correctly when fired
				App.Models.selectedTerrModel = defending;

				// Update Civilian Morale and GDP in invaded territory
				var invadedEconMorale = App.Utilities.updateEconMorale({
						selectedArmyPop: transferringUnits,
						econStrength: newInvaded.newEconStrength,
						econPopulation: newInvaded.newEconPopulation,
						econLevel: newInvaded.newEconLvl,
						selectedFortLevel: newInvaded.oldDefFortLvl,
						selectedFortStrength: newInvaded.newDefFortStr,
						newMorale : newInvaded.newEconMorale
					}),
					invadedGDP = App.Utilities.updateGDP({
						newLevel: newInvaded.newEconLvl,
						newMorale : invadedEconMorale,
						newEconPopulation: newInvaded.newEconPopulation,
						newEconStrength: newInvaded.newEconStrength,
						ecGrowthRate: defending.get('econGrowthPct')
					}),
					invadedFortRepairCost = App.Constants.FORT_STR_COST * newInvaded.oldDefFortLvl * (100 - newInvaded.newDefFortStr),
					invadedRebuildInfCost = Math.round(App.Constants.ECON_STR_COST * newInvaded.newEconLvl * ((100 - newInvaded.newEconStrength) / 10));

				// Resetting the selected territory variable to the attacking model for the econ and gdp calculations
				App.Models.selectedTerrModel = attacking;

				// Update the values of the defeated territory with the new name, transferred units, morale, and remaining turns
				defending.set({
					'morale': attacking.get('morale'),
					'name' : newName,
					'color' : attacking.get('color'),
					'armyPopulation' : transferringUnits,
					'prvPopulation' : transferringUnits,
					'remainingTurns' : 1,
					'selected' : true,
					'side' : newSide,
					'armyXP' : newAttacking.newAttXP,
					'armyRank' : newAttacking.newAttArmyRank,
					'econMorale' : invadedEconMorale,
					'economicOutput' : invadedGDP,
					'econLevel' : newInvaded.newEconLvl,
					'econPopulation' : newInvaded.newEconPopulation,
					'prvEconPopulation' : newInvaded.newEconPopulation,
					'currTreasury' : attacking.get('currTreasury'),
					'fortStrengthCost' : invadedFortRepairCost,
					'econStrengthCost' : invadedRebuildInfCost,
					'econCasualties': 0,
					'armyCasualties' : 0,
					'inRange': false
				});
				
				// Update Civilian Morale and GDP in invaders original territory
				var newAttackPop = attacking.get('armyPopulation') - transferringUnits;
				var invaderEconMorale = App.Utilities.updateEconMorale({
						selectedArmyPop: newAttackPop,
						oldTerrArmyPop: attacking.get('armyPopulation'),
						newMorale: attacking.get('econMorale')
					}),
					invaderEconStrength = attacking.get('econStrength'),
					invaderEconPop = attacking.get('econPopulation'),
					invaderEconLevel = attacking.get('econLevel'),
					invaderGDP = App.Utilities.updateGDP({
						newMorale : invaderEconMorale,
						newEconStrength: invaderEconStrength,
						newEconPopulation : invaderEconPop,
						newLevel : invaderEconLevel,
						ecGrowthRate: attacking.get('econGrowthPct')
					});

				attacking.set({
					'armyPopulation' : newAttackPop,
					'selected' : false,
					'armyXP' : newAttacking.newAttXP,
					'armyRank' : newAttacking.newAttArmyRank,
					'econMorale' : invaderEconMorale,
					'economicOutput' : invaderGDP,
					'remainingTurns' : attacking.get('remainingTurns') - 1
				});

				App.Collections.terrCollection.nextTreasury();

				$('#oneModal').modal('hide');

				App.Models.selectedTerrModel = App.Models.clickedTerrModel;
				App.Views.selectedTerrView = App.Views.clickedTerrView;
				App.Utilities.displayInRange();
				App.Models.battleMapModel.set('selectedMode', true);

				App.Models.nationStats.get('left').set({
					'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal('left', 'armyPopulation'),
					'armyCasualties' : App.Collections.terrCollection.getSideCasualties('left', 'army'),
					'econCasualties' : App.Collections.terrCollection.getSideCasualties('left', 'econ'),
					'econPopulationNow' : App.Collections.terrCollection.returnSideTotal('left', 'econPopulation'),
					'terrs': App.Collections.terrCollection.getSideTerritories('left'),
					'terrsWithTurns': App.Collections.terrCollection.getSideTerritoriesWithTurns('left')
				});

				App.Models.nationStats.get('right').set({
					'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal('right', 'armyPopulation'),
					'armyCasualties' : App.Collections.terrCollection.getSideCasualties('right', 'army'),
					'econCasualties' : App.Collections.terrCollection.getSideCasualties('right', 'econ'),
					'econPopulationNow' : App.Collections.terrCollection.returnSideTotal('right', 'econPopulation'),
					'terrs': App.Collections.terrCollection.getSideTerritories('right'),
					'terrsWithTurns': App.Collections.terrCollection.getSideTerritoriesWithTurns('right')
				});

				App.Views.selectedFooterView.closeView();
				App.Views.selectedFooterView = new App.Views.Footer({model: App.Models.selectedTerrModel});
				$('#footerZone').html(App.Views.selectedFooterView.$el);

				// If unable to invade or reinforce, need to call that out so user isn't confused
				if((App.Models.selectedTerrModel.get('armyPopulation') * App.Models.selectedTerrModel.get('econStrength') / 100) < 2 * App.Constants.ATTACK_ARMY_MINIMUM) {

					App.Views.battleMap.notify({
						icon: 'glyphicon glyphicon-globe',
						titleTxt : "Army Stuck in " + defending.get('name'),
						msgTxt : "The roads and bridges in " + defending.get('name') + " are badly damaged and need to be repaired for your army units to move to other territories.",
						msgType: "success"
					});

				}

				App.Views.selectedFooterView.raiseFooter();

				// Update the army tech level
				App.Models.nationStats.get(App.Utilities.activeSide()).set('armyTechLvl', App.Collections.terrCollection.returnAvgTechLevel(App.Utilities.activeSide()));

			}

			this.model.set('stopClick', true);

		}

	}
});