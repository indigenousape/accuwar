 /*
 	[accuwar]: Turn-based Strategy Game
	Nation Stats Model -- Statistics for both empires, which side is currently active, and what turn the game is on
*/ 

var startLeftArmy = App.Constants.TESTING_MODE ?  20000000 * App.Constants.STARTING_TERRITORIES : App.Constants.START_ARMY_UNITS * App.Constants.STARTING_TERRITORIES,
	startRightArmy = App.Constants.TESTING_MODE ? 20000000 * App.Constants.STARTING_TERRITORIES : App.Constants.START_ARMY_UNITS * App.Constants.STARTING_TERRITORIES;

var initTreasury = App.Utilities.isMobile() ? App.Constants.STARTING_TREASURY_MOB : App.Constants.STARTING_TREASURY,
	initInfraCost = App.Utilities.isMobile() ? 18000000000 : 50000000000,
	initEconPopulation = App.Utilities.isMobile() ? 90000000 : 250000000,
	initArmyPopulation = App.Utilities.isMobile() && !App.Constants.TESTING_MODE ? 2250000 : 6250000,
	initEconOutput = App.Utilities.isMobile() && !App.Constants.TESTING_MODE ? 720000000000 : 2000000000000;

// Class Side represents each empire
var Emp = Backbone.Model.extend({
    defaults: {
		activePolicies: App.Constants.POLICIES,
		activePolicyCount: 0,
		clickedPolicy: '',
		armiesPromoted: [],
		armyPopulationStart: initArmyPopulation,
		armyPopulationNow: initArmyPopulation,
		armyCasualties: 0,
		armyTechLvl: 1,
		armyTrainingSpend: 0,
		battleLosses: 0,
		battleWins: 0,
		color: '',
		econAvgTechLevel: 1,
		econCasualties: 0,
		econCrash: false,
		econCrashTurn: 0,
		econCrashTurnPrv: 0,
		econCrashPenalty: 0,
		econLevelSpend: 0,
		econOutput: initEconOutput,
		econOutputStart: initEconOutput,
		econPopulationStart: initEconPopulation,
		econPopulationNow: initEconPopulation,
		empName: '',
		fortLevelSpend: 0,
		fortsLost: [],
		highTaxTurnLength: 0,
		infrastructureSpend: 0,
		fortSpend: 0,
		invadedThisTurn: [],
		invasionArmyCasualties: 0,
		invasionEconCasualties: 0,
		lowTaxTurnLength: 0,
		nextTreasuryAddedEst: initTreasury,
		policyCosts: 0,
		recruitsThisTurn: 0,
		recruitsAuto: 0,
		recruitSpend: 0,
		repairAllInfrastructureCost: initInfraCost,
		repairAllFortCost: 0,
		taxRate: 0.25,
		taxesCollected: 0,
		terrs: [],
		terrsWithRecruits: [],
		terrsWithTurns: [],
		terrLostThisTurn: [],
		treasury: initTreasury,
		treasuryPrev: initTreasury,
		treasuryStart: initTreasury
    },
    returnLowTaxInfraDrag: function() {
		return Math.min(this.get('lowTaxTurnLength'), 5);
	}
});

var LeftModel = new Emp({
	color: 'blue'
});
var RightModel = new Emp({
	color: 'orange'
});

// Nation Stats Model
App.Models.NationStats = Backbone.Model.extend({
	defaults: {
		currentTurn: App.Constants.START_TURN,
		sideTurn: 'left',
		left: LeftModel,
		right: RightModel,
		fullScreen: false
	},
	setPolicies: function() {
		App.Collections.leftPolCollection = new App.Collections.Policies();
		App.Collections.rightPolCollection = new App.Collections.Policies();

		for(var i = 0; i < App.Constants.POLICIES.length; i++ ){
			App.Collections.leftPolCollection.add(App.Constants.POLICIES[i]);
			App.Collections.rightPolCollection.add(App.Constants.POLICIES[i]);
		}

	},
	getTaxRate: function() {
		return this.get(App.Utilities.activeSide()).get('taxRate');
	},
	setTaxRate: function(val) {
		var side = App.Utilities.activeSide(),
			newHighTaxTurnLength = val >= App.Constants.HIGH_TAX_MORALE_AMT ? Math.max(1, this.get(side).get('highTaxTurnLength')) : 0,
			newLowTaxTurnLength = val <= App.Constants.LOW_TAX_EC_CRASH_AMT ? Math.max(1, this.get(side).get('lowTaxTurnLength')) : 0,
			newNextTreasury = parseInt(App.Collections.terrCollection.returnSideTotal(side, 'economicOutput') * val);

		this.get(side).set({
			'nextTreasuryAddedEst' : newNextTreasury,
			'taxRate' : val,
			'highTaxTurnLength': newHighTaxTurnLength,
			'lowTaxTurnLength' : newLowTaxTurnLength,
			'econOutput': App.Collections.terrCollection.returnSideTotal(side, 'economicOutput')
		});

	},
	setEmpName: function(newName) {
		this.get(App.Utilities.activeSide()).set('empName', newName);
	},
	payForUpgradeAuto: function(treasury, side, pCosts) {
		// Nation with current turn pays for upgrades, unless side is specified

		App.Collections.terrCollection.nextTreasury();

		App.Models.nationStats.get(side).set({
			'treasury' : treasury,
			'treasuryPrev': treasury,
			'policyCosts' : pCosts
		});
	},
	payForUpgrade: function(treasury) {
		// Nation with current turn pays for upgrades, unless side is specified

		App.Collections.terrCollection.nextTreasury();

		App.Models.nationStats.get(App.Utilities.activeSide()).set({
			'treasury' : treasury,
			'treasuryPrev': treasury
		});

		if(!_.isEmpty(App.selectedTerrModel)) {
			App.Models.selectedTerrModel.setClickedTreasuryLimits();
		}

	},
	newTurnNationUpdates: function() {
		var leftHighTaxTurnLength = this.get('left').get('highTaxTurnLength') ? this.get('left').get('highTaxTurnLength') : 0,
			rightHighTaxTurnLength = this.get('right').get('highTaxTurnLength') ? this.get('right').get('highTaxTurnLength') : 0,
			leftLowTaxTurnLength = this.get('left').get('lowTaxTurnLength') ? this.get('left').get('lowTaxTurnLength') : 0,
			rightLowTaxTurnLength = this.get('right').get('lowTaxTurnLength') ? this.get('right').get('lowTaxTurnLength') : 0,
			newSide = this.get('sideTurn') != 'left' ? 'left' : 'right',
			newTurn = this.get('currentTurn');

		// If it was the right side's turn, start the next turn
		if(this.get('sideTurn') != 'left'){
			
			leftHighTaxTurnLength = this.get('left').get('taxRate') >= App.Constants.HIGH_TAX_MORALE_AMT ? this.get('left').get('highTaxTurnLength') + 1 : this.get('left').get('highTaxTurnLength');
			rightHighTaxTurnLength = this.get('right').get('taxRate') >= App.Constants.HIGH_TAX_MORALE_AMT ? this.get('right').get('highTaxTurnLength') + 1 : this.get('right').get('highTaxTurnLength');
			leftLowTaxTurnLength = this.get('left').get('taxRate') <= App.Constants.LOW_TAX_EC_CRASH_AMT ? this.get('left').get('lowTaxTurnLength') + 1 : this.get('left').get('lowTaxTurnLength');
			rightLowTaxTurnLength = this.get('right').get('taxRate') <= App.Constants.LOW_TAX_EC_CRASH_AMT ? this.get('right').get('lowTaxTurnLength') + 1 : this.get('right').get('lowTaxTurnLength');
			App.Collections.terrCollection.taxCollection();
 			App.Collections.terrCollection.nextTreasury();
 			newTurn++;

		}

		// Update nation stats model
 		this.set({
 			'currentTurn' : newTurn,
 			'sideTurn' : newSide
 		});

 		var currHighTaxTurnLength = App.Utilities.activeSide() === 'left' ? leftHighTaxTurnLength : rightHighTaxTurnLength;
 		App.Utilities.highTaxNotification(currHighTaxTurnLength);

 		var currLowTaxTurnLength = App.Utilities.activeSide() === 'left' ? leftLowTaxTurnLength : rightLowTaxTurnLength,
 			currGDPPenalty = App.Models.nationStats.get(App.Utilities.activeSide()).get('econCrashPenalty');

 		if(!App.Models.nationStats.get(App.Utilities.activeSide()).get('econCrash')) {
 			App.Utilities.lowTaxNotification(currLowTaxTurnLength);
 		} else {
 			App.Utilities.crashNotification(currGDPPenalty);
 		}

 		// Update left side model
 		this.get('left').set({
 			'highTaxTurnLength' : leftHighTaxTurnLength,
 			'lowTaxTurnLength' : leftLowTaxTurnLength,
 			'infrastructureSpend' : 0,
 			'fortSpend' : 0,
 			'econLevelSpend' : 0,
 			'fortLevelSpend': 0,
 			'recruitSpend' : 0,
 			'armyTrainingSpend' : 0
 		});

 		// Update right side model
 		this.get('right').set({
 			'highTaxTurnLength' : rightHighTaxTurnLength,
 			'lowTaxTurnLength' : rightLowTaxTurnLength,
 			'infrastructureSpend' : 0,
 			'fortSpend' : 0,
 			'econLevelSpend' : 0,
 			'fortLevelSpend': 0,
 			'recruitSpend' : 0,
 			'armyTrainingSpend' : 0
 		});

	}
});