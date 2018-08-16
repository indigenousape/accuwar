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
		fortLevelCost: 20000000000,
		fortLeveledUp: false,
		fortStrength: 100,
		fortStrengthCost: 0,
		governorKilled: false,
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
		empName: '',
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
	incomingUnitsAuto: function(arriving, reinforceAmt, side) {
		var reinforcements = Math.round(reinforceAmt),
			newVals = App.Utilities.returnRecruitMoraleXPRank(arriving, reinforceAmt),
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
			newVals = isPurchased ? App.Utilities.returnRecruitMoraleXPRank(arriving, reinforceAmt) : App.Utilities.returnNewMoraleXpRank(arriving, reinforceAmt),
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
	}

});