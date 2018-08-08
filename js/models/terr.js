 /*
 	[accuwar]: Turn-based Strategy Game
	Territory Model
*/ 

App.Models.Territory = Backbone.Model.extend({
	defaults: {
		armyPopulation: App.Constants.START_ARMY_UNITS,
		armyPopulationCost: App.Constants.ARMY_UNIT_COST * App.Constants.RECRUIT_ARMY_MINIMUM,
		armyRecruits: 0,
		attackRange: 2,
		armyCasualties: 0,
		armyRank: 1,
		armyXP: 0,
		armyWins: 0,
		armyLosses: 0,
		column: 0,
		currTreasury: 0,
		econCasualties: 0,
		econGrowthPct: 0,
		econLevel: 1,
		econLevelCost: 20000000000,
		econLeveledUp: false,
		econMorale: 80,
		economicOutput: 80000000000,
		econPopulation: 10000000,
		econPopulationGrowthPct: 0,
		econStrength: 80,
		econStrengthCost: 2000000000,
		fortLevel: 1,
		fortLevelCost: 2000000000,
		fortLeveledUp: false,
		fortStrength: 100,
		fortStrengthCost: 0,
		inRange: false,
		isCapital: false,
		morale: 80, // Army morale
		name: '',
		prvEconPopulation: 10000000,
		prvEconPopulationGrowthPct: 0,
		prvPopulation: 250000,
		recruitTarget: false,
		remainingTurns: 1,
		row: 0,
		runTimer: false,
		selected: false,
		side : '',
		color : '',
		startEconomicOutput: 80000000000,
		startEconPopulation: 10000000,
		startPopulation: 250000,
		trainingArmyCost : App.Constants.ARMY_TRAINING_COST,
		trainingClicked : false,
		small: false
	},
	initialize: function() {
	},
	setName: function(name) {
		this.set('name', name);
	},
	getSide: function() {
		return this.get('name');
	},
	returnRecruitMoraleXPRank: function(arriving, reinforceAmt) {

		// Rank + XP Factors
		var startRecXP = arriving.get('armyRank') * 100 + arriving.get('armyXP'),
			startSendXP = 100,
			recXPratio = arriving.get('armyPopulation') / (arriving.get('armyPopulation') + reinforceAmt),
			sendXPratio = reinforceAmt / (reinforceAmt + arriving.get('armyPopulation')),
			newXP = Math.round(startRecXP * recXPratio + startSendXP * sendXPratio),
			newRank = arriving.get('armyRank') == 1 ? 1 : 0;

		if(newXP >= 100) {
			var newXPtot = newXP % 100;
			newRank = (newXP - newXPtot) / 100;
			newRank = Math.min(newRank, App.Constants.MAX_RANK);
		} else {
			newXPtot = newXP;
		}

		// Morale factors
		var arriverReinforcementRatio = reinforceAmt / arriving.get('armyPopulation'),
			newArriveMorale = Math.min(Math.round(arriving.get('morale') + (50 * arriverReinforcementRatio)), 100);

		return {
			toMorale : newArriveMorale,
			fromMorale : 80,
			toXP : newXPtot,
			toRank : newRank
		};
	},
	returnNewMoraleXpRank: function(arriving, reinforceAmt) {

		if(_.isEmpty(App.Models.clickedTerrModel)) {
			App.Models.clickedTerrModel = arriving;
		}

		if(_.isEmpty(App.Models.selectedTerrModel)) {
			App.Models.selectedTerrModel = arriving;
		}

		// Rank + XP Factors
		var startRecXP = App.Models.clickedTerrModel.get('armyRank') * 100 + App.Models.clickedTerrModel.get('armyXP'),
			startSendXP = App.Models.selectedTerrModel.get('armyRank') * 100 + App.Models.selectedTerrModel.get('armyXP'),
			recXPratio = App.Models.clickedTerrModel.get('armyPopulation') / (App.Models.clickedTerrModel.get('armyPopulation') + reinforceAmt),
			sendXPratio = reinforceAmt / (reinforceAmt + App.Models.clickedTerrModel.get('armyPopulation')),
			newXP = Math.round(startRecXP * recXPratio + startSendXP * sendXPratio),
			newRank = App.Models.clickedTerrModel.get('armyRank') == 1 ? 1 : 0;

		if(newXP >= 100) {
			var newXPtot = newXP % 100;
			newRank = (newXP - newXPtot) / 100;
			newRank = Math.min(newRank, App.Constants.MAX_RANK);
		} else {
			newXPtot = newXP;
		}

		// Morale factors
		var arriverReinforcementRatio = reinforceAmt / App.Models.clickedTerrModel.get('armyPopulation'),
			leavingReinforcementRatio = reinforceAmt / App.Models.selectedTerrModel.get('armyPopulation'),
			newArriveMorale = Math.min(Math.round(App.Models.clickedTerrModel.get('morale') + (50 * arriverReinforcementRatio)), 100),
			newLeavingMorale = Math.max(Math.round(parseInt(App.Models.selectedTerrModel.get('morale')) - (50 * leavingReinforcementRatio)), 0);

		return {
			toMorale : newArriveMorale,
			fromMorale : Math.max(Math.round(parseInt(App.Models.selectedTerrModel.get('morale')) - (50 * leavingReinforcementRatio)), 0),
			toXP : newXPtot,
			toRank : newRank
		};

	},
	incomingUnitsAuto: function(arriving, reinforceAmt, side) {
		var reinforcements = Math.round(reinforceAmt),
			newVals = this.returnRecruitMoraleXPRank(arriving, reinforceAmt),
			newEconPopulation = arriving.get('econPopulation') - reinforcements;

		// Send reinforcements to target territory
		var newArmyPop = reinforcements + this.get('armyPopulation');

		var econMorale = App.Utilities.updateEconMorale({
				newMorale: arriving.get('econMorale'),
				selectedArmyPop: newArmyPop
			}),
			updateThisGDP = App.Utilities.updateGDP({
				newMorale : econMorale,
				newEconStrength: arriving.get('econStrength'),
				newEconPopulation : newEconPopulation,
				newLevel : arriving.get('econLevel'),
				ecGrowthRate: arriving.get('econGrowthPct')

			});

		var newStartingEconPop = App.Models.nationStats.get(side).get('econPopulationStart') - reinforcements;

		arriving.set({
			'armyPopulation' : newArmyPop,
			'armyRecruits' : reinforcements,
			'econPopulation' : newEconPopulation,
			'morale' : newVals.toMorale,
			'armyXP' : newVals.toXP,
			'armyRank' : newVals.toRank,
			'econMorale' : econMorale,
			'economicOutput' : updateThisGDP
		});

		var newTerrsWithRecruits = App.Collections.terrCollection.getSideTerritoriesWithRecruits(side);
		var newNationRecruits = App.Collections.terrCollection.returnSideTotal(side, 'armyRecruits');

		App.Models.nationStats.get(side).set({
			'recruitsAuto': newNationRecruits,
			'terrsWithRecruits' : newTerrsWithRecruits,
			'econPopulationStart' : newStartingEconPop
		});

		App.Collections.terrCollection.nextTreasury();

	},
	incomingUnits: function(arriving, reinforceAmt) {
		
		var isPurchased = arriving === App.Models.selectedTerrModel,
			reinforcements = Math.round(reinforceAmt),
			armyRecruits = App.Models.selectedTerrModel.get('armyRecruits'),
			newVals = isPurchased ? this.returnRecruitMoraleXPRank(arriving, reinforceAmt) : this.returnNewMoraleXpRank(arriving, reinforceAmt),
			newEconPopulation = isPurchased ? App.Models.selectedTerrModel.get('econPopulation') - reinforceAmt : App.Models.selectedTerrModel.get('econPopulation');

		if(!isPurchased) {

			// Remove reinforcements from selected territory
			var newAttackPop = App.Models.selectedTerrModel.get('armyPopulation') - reinforcements;

			var econMorale = App.Utilities.updateEconMorale({
					newMorale: App.Models.selectedTerrModel.get('econMorale'),
					selectedArmyPop: newAttackPop
				}),
				updateThisGDP = App.Utilities.updateGDP({
					newMorale : econMorale,
					newEconStrength: App.Models.selectedTerrModel.get('econStrength'),
					newEconPopulation : App.Models.selectedTerrModel.get('econPopulation'),
					newLevel : App.Models.selectedTerrModel.get('econLevel'),
					ecGrowthRate: App.Models.selectedTerrModel.get('econGrowthPct')
				});

			App.Models.selectedTerrModel.set({
				'armyPopulation' : newAttackPop,
				'morale' : newVals.fromMorale,
				'remainingTurns' : 0,
				'selected' : false,
				'econMorale' : econMorale,
				'economicOutput' : updateThisGDP
			});

		} else {
			armyRecruits = reinforceAmt;
			var newNationRecruits = App.Collections.terrCollection.returnSideTotal(App.Utilities.activeSide(), 'armyRecruits') + armyRecruits;


		}
		// Send reinforcements to target territory
		reinforceAmt = reinforcements + this.get('armyPopulation');

		var newTurns = isPurchased ? this.get('remainingTurns') - 1 : this.get('remainingTurns');

		var econMorale = App.Utilities.updateEconMorale({
				newMorale: App.Models.clickedTerrModel.get('econMorale'),
				selectedArmyPop: reinforceAmt
			}),
			updateThisGDP = App.Utilities.updateGDP({
				newMorale : econMorale,
				newEconStrength: App.Models.clickedTerrModel.get('econStrength'),
				newEconPopulation : newEconPopulation,
				newLevel : App.Models.clickedTerrModel.get('econLevel'),
				ecGrowthRate: App.Models.clickedTerrModel.get('econGrowthPct')

			});

		App.Models.clickedTerrModel.set({
			'armyPopulation' : reinforceAmt,
			'morale' : newVals.toMorale,
			'armyXP' : newVals.toXP,
			'armyRank' : newVals.toRank,
			'econMorale' : econMorale,
			'economicOutput' : updateThisGDP,
			'remainingTurns' : newTurns
		});

		App.Models.selectedTerrModel.set({
			'econPopulation' : newEconPopulation,
			'armyRecruits' : armyRecruits
		});

		if(isPurchased) {
			var newTerrsWithRecruits = App.Collections.terrCollection.getSideTerritoriesWithRecruits(App.Utilities.activeSide());

			App.Models.nationStats.get(App.Utilities.activeSide()).set({
				'recruitsThisTurn': newNationRecruits,
				'terrsWithRecruits' : newTerrsWithRecruits
			});
		}

		setTimeout(function() {
			App.Utilities.flipEls(['.armyPopulation-main']);
		}, 100);

		App.Collections.terrCollection.nextTreasury();
	},
	setClickedTreasuryLimits: function() {

		var currStr = App.Models.selectedTerrModel.get('econStrength'),
			currLvl = App.Models.selectedTerrModel.get('econLevel'),
			diffToNextEconStr = Math.round(App.Constants.ECON_STR_COST * currLvl * ((100 - currStr) / 10)),
			currFortLvl = App.Models.selectedTerrModel.get('fortLevel'),
			diffToNextFortLvl = App.Constants.FORT_LVL_COST * (1 + currFortLvl),
			diffToFullFortStr = App.Constants.FORT_STR_COST * currFortLvl * (100 - App.Models.selectedTerrModel.get('fortStrength')),
			diffToNextEconLvl = App.Constants.ECON_LVL_UP_AMT * (1 + currLvl),
			diffToArmyTraining = ((100 - App.Models.selectedTerrModel.get('armyXP')) * 0.25) * (App.Constants.ARMY_TRAINING_COST * App.Models.selectedTerrModel.get('armyPopulation') / 1000);

		App.Models.selectedTerrModel.set({
			'currTreasury' : App.Utilities.getTreasury(),
			'econStrengthCost' : diffToNextEconStr,
			'fortLevelCost' : diffToNextFortLvl,
			'fortStrengthCost' : diffToFullFortStr,
			'econLevelCost' : diffToNextEconLvl,
			'trainingArmyCost' : diffToArmyTraining
		});

		App.Models.nationStats.get(App.Utilities.activeSide()).set({
			'repairAllInfrastructureCost' : App.Collections.terrCollection.returnTotalCost('econStrength', App.Utilities.activeSide()),
			'repairAllFortCost': App.Collections.terrCollection.returnTotalCost('fortStrength', App.Utilities.activeSide())
		});

	},
	trainTerrArmy: function() {

		var oldXP = App.Models.selectedTerrModel.get('armyXP'),
			newXP = oldXP + Math.round((100 - oldXP) * 0.25),
			oldMor = App.Models.selectedTerrModel.get('morale'),
			newMor = Math.min(Math.round(oldMor + (newXP - oldXP)), 100);

		App.Models.selectedTerrModel.set({
			'armyXP' : newXP,
			'morale' : newMor,
			'remainingTurns': App.Models.selectedTerrModel.get('remainingTurns') - 1,
			'selected' : false,
			'trainingClicked' : true
		});
	},
	upgradeTerrEconStr: function(model) {

		if(typeof model === "undefined") {
			model = App.Models.selectedTerrModel;
		}

		var econMorale = App.Utilities.updateEconMorale({
				econStrength : 100,
				newMorale: model.get('econMorale')
			}),
			updateThisGDP = App.Utilities.updateGDP({
				newMorale : econMorale,
				newEconStrength: 100,
				newEconPopulation : model.get('econPopulation'),
				newLevel : model.get('econLevel'),
				ecGrowthRate: model.get('econGrowthPct')
			});

		model.set({
			'economicOutput' : updateThisGDP,
			'econStrength' : 100,
			'econStrengthCost' : 0,
			'econMorale' : econMorale
		});

	},
	upgradeTerrArmyFortLevel: function() {

		var newLvl = 1 + App.Models.selectedTerrModel.get('fortLevel'),
			armyMorale = App.Models.selectedTerrModel.get('morale'),
			armyMorale = Math.round(armyMorale + (newLvl * 10)),
			armyMorale = Math.min(armyMorale, 100),
			econMorale = App.Utilities.updateEconMorale({
				selectedFortLevel : newLvl,
				newMorale : App.Models.selectedTerrModel.get('econMorale')
			}),
			updateThisGDP = App.Utilities.updateGDP({
				newMorale : econMorale,
				newEconStrength: App.Models.selectedTerrModel.get('econStrength'),
				newEconPopulation : App.Models.selectedTerrModel.get('econPopulation'),
				newLevel : App.Models.selectedTerrModel.get('econLevel'),
				ecGrowthRate: App.Models.selectedTerrModel.get('econGrowthPct')

			});

		App.Models.selectedTerrModel.set({
			'economicOutput' : updateThisGDP,
			'fortLevel' : newLvl,
			'econMorale' : econMorale,
			'fortLeveledUp': true,
			'morale' : armyMorale
		});		

	},
	repairTerrFortStr: function(model) {

		if(typeof model == "undefined") {
			model = App.Models.selectedTerrModel;
		}

		var oldArmyMorale = model.get('morale'),
			newArmyMorale = Math.round(oldArmyMorale + ((100 - model.get('fortStrength') / 2))),
			newArmyMorale = Math.min(newArmyMorale, 100);

		var econMorale = App.Utilities.updateEconMorale({
			selectedFortStrength : 100,
			newMorale: model.get('econMorale')
		}),
			updateGDP = App.Utilities.updateGDP({
				newMorale : econMorale,
				newEconStrength: model.get('econStrength'),
				newEconPopulation : model.get('econPopulation'),
				newLevel : model.get('econLevel'),
				ecGrowthRate: model.get('econGrowthPct')
			}); 

		model.set({
			'fortStrength' : 100,
			'fortStrengthCost' : 0,
			'economicOutput': updateGDP,
			'econMorale' : econMorale,
			'morale' : newArmyMorale
		});
	},
	upgradeTerrEconLevel: function(model, policyMode) {

		if(typeof model === "undefined") {
			model = App.Models.selectedTerrModel;
		}

		var nextLvl = parseInt(model.get('econLevel')) + 1,
			oldEconMorale = model.get('econMorale');

		var newMorale = App.Utilities.updateEconMorale({
			econLevel : nextLvl,
			newMorale: oldEconMorale
		}),
		updateThisGDP = App.Utilities.updateGDP({
			newLevel : nextLvl,
			newMorale : newMorale,
			newEconStrength: model.get('econStrength'),
			newEconPopulation : model.get('econPopulation'),
			ecGrowthRate: model.get('econGrowthPct')
		});

		var removeLevelUpButton = policyMode ? false : true;

		model.set({
			'economicOutput' : updateThisGDP,
			'econLevel' : nextLvl,
			'econLeveledUp' : removeLevelUpButton,
			'econMorale' : newMorale,
			'econLevelCost': App.Constants.ECON_LVL_UP_AMT * (1 + nextLvl)
		});

		App.Models.nationStats.get(model.get('side')).set('armyTechLvl', App.Collections.terrCollection.returnAvgTechLevel(model.get('side'))); 

	}

});