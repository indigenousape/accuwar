 /*
 	[accuwar]: Turn-based Strategy Game
	Territories Collection
*/ 

// Territory Territories Collection
App.Collections.Territories = Backbone.Collection.extend({
    model: App.Models.Territory,
    attackRange: function(selected) {

        var range = selected.get('attackRange');
        var row = selected.get('row');
        var column = selected.get('column');
        var enemyTerritoriesArr = _.chain(this.models)
            .filter(function(selected) { return selected.get('side') != App.Utilities.activeSide() })
            .value();

        _.each(enemyTerritoriesArr, function(model) {
            
            if(Math.abs(parseInt(model.get('row')) - row) < range && Math.abs(parseInt(model.get('column')) - column) < range) {
                model.set('inRange', true);
            }

        });

    },
    removeAttackRange: function(model) {

        var enemyTerritoriesArr = _.chain(this.models)
            .filter(function(model) { return model.get('side') != App.Utilities.activeSide() })
            .value();

        _.each(enemyTerritoriesArr, function(model) {
            
            if(model.get('inRange')) {
                model.set('inRange', false);
            }
        
        });
    },
    casualtiesTotal: function() {
        return this.getSideCasualties('left', 'army') + this.getSideCasualties('right', 'army');
    },
    returnAvgTechLevel: function(s) {
        var totalTechLevel = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === s })
                        .reduce(function(memo, model){ return memo + model.get('econLevel'); }, 0)
                        .value();

        var terrs = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === s })
                        .value();

        return Math.round(totalTechLevel/_.size(terrs));

    },
    specialMap: function(name1, name2) {

    	var empNamesTogether = name1.toLowerCase() + name2.toLowerCase(),
    		terrNames = App.Utilities.territoryNames(empNamesTogether);

    	_.each(this.models, function(model) {
            var terrLen = terrNames.length,
                thisTerrIndex = _.random(0, (terrLen - 1));

            model.set('name', terrNames[thisTerrIndex]);
			
            terrNames.splice(thisTerrIndex, 1);
   		
    	});

    },
    changeColorsTerrNames: function() {

        _.each(this.models, function(model) {
            model.set({
                'color': App.Models.nationStats.get(model.get('side')).get('color'),
                'empName' : App.Models.nationStats.get(model.get('side')).get('empName')
            } )
        });

    },
    duplicateNameCheck: function(name, type) {

        if(type === 'territory') {

            var isDuplicate = _.chain(this.models)
                .some(function(model) { return model.get('name') === name; })
                .value();

            return isDuplicate;

        } else if (type === 'empire') {

            return App.Utilities.getEnemyEmpireName() === name; 

        }

    },
    recruitTarget: function() {

        var recruitTerritoriesArr = _.chain(this.models)
            .filter(function(selected) { return selected.get('side') === App.Utilities.activeSide() })
            .value();

        _.each(recruitTerritoriesArr, function(model) {
            model.set('recruitTarget', true);
        });

    },
    returnSelectedView: function(cid) {
        var view = _.chain(App.Views.allViews)
            .filter(function(selected) { return selected.model.cid === cid })
            .value();
 
            return view[0];

    },
    removeRecruitTarget: function() {

        var recruitTerritoriesArr = _.chain(this.models)
            .filter(function(selected) { return selected.get('side') === App.Utilities.activeSide() })
            .value();

        _.each(recruitTerritoriesArr, function(model) {
            model.set('recruitTarget', false);
        });

    },
    returnAnyTurnsLeft: function() {
    	var terrWithRemainingTurns = false;

        // Receives the side to filter the models, then adds the values from the model at "property" together and returns the results
        var terrWithRemainingTurns = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === App.Utilities.activeSide() })
                        .some(function(model) { return model.get('remainingTurns') > 0;})
                        .value();

    	return terrWithRemainingTurns;

    },
    updgradeAllTechLevelsPolicy: function(s) {

        // Create an array from the collection
        // Filter out only the models that match the side passed to the function
        // and those with econ strength equal to 100 and levels below the maximum
        // then sort by the levels in ascending order

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === s && model.get('econLevel') < App.Constants.MAX_TECH_LEVEL && model.get('econStrength') === 100; })
                    .sortBy(function(model){ return model.get('econLevel'); })
                    .value();

        _.each(array, function(model) {

            if(App.Utilities.getTreasuryAuto(s) > model.get('econLevelCost')) {
                var policyCosts = App.Models.nationStats.get(s).get('policyCosts') + model.get('econLevelCost');
                App.Models.nationStats.payForUpgradeAuto(App.Utilities.getTreasuryAuto(s) - model.get('econLevelCost'), s, policyCosts);
                App.Utilities.upgradeTerrEconLevel(model, true);
            }

        });
    },
    updgradeAllFortsPolicy: function(s) {

        // Create an array from the collection
        // Filter out only the models that match the side passed to the function
        // and those with econ strength equal to 100 and levels below the maximum
        // then sort by the levels in ascending order

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === s && model.get('fortLevel') < App.Constants.MAX_FORT_LEVEL && model.get('fortStrength') === 100; })
                    .sortBy(function(model){ return model.get('fortLevel'); })
                    .value();

        _.each(array, function(model) {

            if(App.Utilities.getTreasuryAuto(s) > model.get('fortLevelCost')) {
                var policyCosts = App.Models.nationStats.get(s).get('policyCosts') + model.get('fortLevelCost');
                App.Models.nationStats.payForUpgradeAuto(App.Utilities.getTreasuryAuto(s) - model.get('fortLevelCost'), s, policyCosts);
                App.Utilities.upgradeTerrArmyFortLevel(model, true);
            }

        });
    },  
    repairAllFortsPolicy: function(s) {

        // Create an array from the collection
        // Filter out only the models that match the side passed to the function
        // and those with strength less than 100, then sort by the strength in ascending order

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === s && model.get('fortStrength') < 100 })
                    .sortBy(function(model){ return model.get('fortStrength') })
                    .value();

        _.each(array, function(model) {

            if(App.Utilities.getTreasuryAuto(s) > model.get('fortStrengthCost')) {
                var policyCosts = App.Models.nationStats.get(s).get('policyCosts') + model.get('fortStrengthCost');
                App.Models.nationStats.payForUpgradeAuto(App.Utilities.getTreasuryAuto(s) - model.get('fortStrengthCost'), s, policyCosts);
                App.Utilities.repairTerrFortStr(model);
                App.Models.nationStats.get(s).set('repairAllFortCost', App.Collections.terrCollection.returnTotalCost('fortStrength'));
            }

        });
    },
    recruitPolicy: function(s) {
        var recruits = _.findWhere(App.Models.nationStats.get(s).get('activePolicies'), {'id': 'recruit_army'}).amount;
        var recruitCost = App.Constants.ARMY_UNIT_COST * recruits;

        // Create an array from the collection
        // Filter out only the models that match the side passed to the function
        // and those without the population to support the number of recruits,
        // then sort territories by the army size from smallest to largest

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === s && recruits < model.get('econPopulation') })
                    .sortBy(function(model){ return model.get('armyPopulation') })
                    .value();

        _.each(array, function(model) {

            if(recruitCost < App.Utilities.getTreasuryAuto(s)) {
                var policyCosts = App.Models.nationStats.get(s).get('policyCosts') + recruitCost;
                App.Models.nationStats.payForUpgradeAuto(App.Utilities.getTreasuryAuto(s) - recruitCost, s, policyCosts);
                model.incomingUnitsAuto(model, recruits, s);
            }

        });
    },
    repairAllInfrastructurePolicy: function(s) {

        // Create an array from the collection
        // Filter out only the models that match the side passed to the function
        // and those with strength less than 100, then sort by the strength in ascending order

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === s && model.get('econStrength') < 100 })
                    .sortBy(function(model){ return model.get('econStrength') })
                    .value();

        _.each(array, function(model) {

            if(App.Utilities.getTreasuryAuto(s) > model.get('econStrengthCost')) {
                var policyCosts = App.Models.nationStats.get(s).get('policyCosts') + model.get('econStrengthCost');
                App.Models.nationStats.payForUpgradeAuto(App.Utilities.getTreasuryAuto(s) - model.get('econStrengthCost'), s, policyCosts);
                App.Utilities.upgradeTerrEconStr(model);
            }

        });
    },
    repairAllInfrastructure: function() {

        // Create an array from the models
        // Filter to return only models that match the active side
        // have remaining turns, and an econ strength below 100

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === App.Utilities.activeSide() && model.get('econStrength') < 100 && model.get('remainingTurns') > 0 })
                    .value();

        _.each(array, function(model) {
            App.Utilities.upgradeTerrEconStr(model);
        });

    },
    repairAllForts: function() {

        // Create an array from the models
        // Filter to return only models that match the active side,
        // have turns, and are in need of fort repair

        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === App.Utilities.activeSide() && model.get('fortStrength') < 100 && model.get('remainingTurns') > 0 })
                    .value();

    	_.each(array, function(model) {
    		App.Utilities.repairTerrFortStr(model);
    	});
    },
    returnTotalCost: function(type, s) { 
        var totCost = 0,
            costFunction = {};

        if(type === 'fortStrength') {
            costFunction = App.Utilities.returnTerrFortCost;
        } else if (type === 'econStrength') {
            costFunction = App.Utilities.returnTerrInfraCost;
        }


        if(typeof s === 'undefined') {
            s = App.Utilities.activeSide();
        }

        //Receives the side to filter the models, then adds the values returned from the utility function together and returns the results


        if(App.Utilities.activeSide() === s) {

            var totCost = _.chain(this.models)
                            .filter(function(model) { return model.get('side') === s && model.get(type) != 100 && model.get('remainingTurns') > 0})
                            .reduce(function(memo, model){ return memo + costFunction(model); }, 0)
                            .value(); // && model.get('fortStrength') != 100

        } else {

            var totCost = _.chain(this.models)
                                .filter(function(model) { return model.get('side') === s && model.get(type) != 100})
                                .reduce(function(memo, model){ return memo + costFunction(model); }, 0)
                                .value(); // && model.get('fortStrength') != 100

        }


        return totCost;

    },
    getSideCapital: function(s) {

        var capital = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === s && model.get('isCapital') })
                    .value()

        return capital[0].get('name');

    },
    getSideCasualties: function(side, type) {

        var casualties = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === side })
                        .reduce(function(memo, model){ return memo + model.get(type + 'Casualties'); }, 0)
                        .value();

        if(type === 'army') {
            return (casualties + App.Models.nationStats.get(side).get('invasionArmyCasualties'));
        } else if (type === 'econ') {
            return (casualties + App.Models.nationStats.get(side).get('invasionEconCasualties'));
        }

    },
    getSideTerritories: function(s) {

        return _.chain(this.models)
                .filter(function(model) { return model.get('side') === s })
                .sortBy(function(model) { return model.get('remainingTurns') })
                .partition(function(model) {return model.get('remainingTurns') > 0 })
                .flatten()
                .value();

    },
    getSideTerritoriesWithTurns: function(s) {

        return _.filter(this.models, function(model) { return model.get('side') === s && model.get('remainingTurns') != 0});

    },
    returnSideTotal: function(s, property) {
        // Receives the side to filter the models, then adds the values from the model at "property" together and returns the results
        var total = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === s })
                        .reduce(function(memo, model){ return memo + model.get(property); }, 0)
                        .value();

        return total;
    },
    getSideTerritoriesWithRecruits: function(s) {

        var recruitTerrs = _.chain(this.models)
                            .sortBy(function(model) { return model.get('armyRecruits') })
                            .reverse()
                            .filter(function(model) {return model.get('side') == s && model.get('armyRecruits') > 0 })
                            .value();

        return recruitTerrs;
    },
    taxCollection: function() {

    	var leftTaxesCollected = 0,
    		rightTaxesCollected = 0,
    		leftTaxRate = App.Views.nationStatsView.model.get('left').get('taxRate'),
 			rightTaxRate = App.Views.nationStatsView.model.get('right').get('taxRate');
    	
    	_.each(this.models, function(model){
    		
    		if (model.get('side') === 'left') {
    			leftTaxesCollected += Math.round(model.get('economicOutput') * leftTaxRate);
    		} else if (model.get('side') === 'right') {
    			rightTaxesCollected += Math.round(model.get('economicOutput') * rightTaxRate);
    		}

    	});

    	var newLeftTreasury = App.Views.nationStatsView.model.get('left').get('treasury') + leftTaxesCollected,
    		newRightTreasury = App.Views.nationStatsView.model.get('right').get('treasury') + rightTaxesCollected;

    	App.Views.nationStatsView.model.get('left').set({
    		'treasury': newLeftTreasury,
    		'treasuryStart': newLeftTreasury,
    		'treasuryPrev': newLeftTreasury,
            'taxesCollected': leftTaxesCollected
    	});

    	App.Views.nationStatsView.model.get('right').set({
    		'treasury': newRightTreasury,
    		'treasuryStart': newRightTreasury,
    		'treasuryPrev': newRightTreasury,
            'taxesCollected' : rightTaxesCollected
    	});

    },
    nextTreasury: function() {
    	// Move this function from the terrCollection into the nationStats model

    	var leftOutputTotal = this.returnSideTotal('left', 'economicOutput'),
    		rightOutputTotal = this.returnSideTotal('right', 'economicOutput'),
    		leftNextTreasuryAddedEst = Math.round(leftOutputTotal * App.Models.nationStats.get('left').get('taxRate')),
    		rightNextTreasuryAddedEst = Math.round(rightOutputTotal * App.Models.nationStats.get('right').get('taxRate'));

 		App.Models.nationStats.get('left').set({
 			'nextTreasuryAddedEst' : leftNextTreasuryAddedEst,
            'econOutput' : this.returnSideTotal('left', 'economicOutput')
 		});

 		App.Models.nationStats.get('right').set({
 			'nextTreasuryAddedEst' : rightNextTreasuryAddedEst,
            'econOutput' : this.returnSideTotal('right', 'economicOutput')
 		});

    },
    updateAllMoraleGDP: function(taxRate, side) {

   		var oldTaxRate = App.Views.nationStatsView.model.get(side).get('taxRate');

   		_.each(this.models, function(model){

   			App.Models.selectedTerrModel = model;

    		if (model.get('side') === side) {

    			var updatedMorale = App.Utilities.updateEconMorale({
    				selectedTaxRate : taxRate,
    				oldTaxRate : oldTaxRate,
    				newMorale : App.Models.selectedTerrModel.get('econMorale')
    			});

    			var updatedTerrGDP = App.Utilities.updateGDP({
    				newMorale : updatedMorale,
    				newLevel : App.Models.selectedTerrModel.get('econLevel'),
    				newEconPopulation: App.Models.selectedTerrModel.get('econPopulation'),
    				newEconStrength: App.Models.selectedTerrModel.get('econStrength'),
    				ecGrowthRate: App.Models.selectedTerrModel.get('econGrowthPct')
    			});

    			App.Models.selectedTerrModel.set({
    				econMorale: updatedMorale,
    				economicOutput: updatedTerrGDP
    			});

    		}

    	});

    	App.Models.selectedTerrModel = App.Models.clickedTerrModel;

    },
    battleImpact: function(winner, invaded) {

		var winningSide = winner.get('side');

		// Update army and economic morale values in all territories after an attack
		App.Collections.terrCollection.forEach(function(model, index) {

			var beforeTurnMor = model.get('morale'),
				afterTurnMor,
				beforeTurnEconMor = model.get('econMorale'),
				afterTurnEconMor,
				beforeTurnGDP = model.get('economicOutput'),
				afterTurnGDP;

			if(model.get('side') == winningSide) {
				afterTurnMor = invaded ? Math.min(beforeTurnMor + 5, 100) : Math.min(beforeTurnMor + 2, 100);
				afterTurnEconMor = invaded ? Math.min(beforeTurnEconMor + 5, 100) : Math.min(beforeTurnEconMor + 3, 100);
    			var afterTurnGDP = App.Utilities.updateGDP({
    				newMorale : afterTurnEconMor,
    				newLevel : model.get('econLevel'),
    				newEconPopulation: model.get('econPopulation'),
    				newEconStrength: model.get('econStrength'),
    				ecGrowthRate: model.get('econGrowthPct')
    			});

			} else {
				afterTurnMor = invaded ? Math.max(beforeTurnMor - 5, 1) : Math.max(beforeTurnMor - 2, 1);
				afterTurnEconMor = invaded ? Math.max(beforeTurnEconMor - 5, 1) : Math.max(beforeTurnEconMor - 3, 1);
    			var afterTurnGDP = App.Utilities.updateGDP({
    				newMorale : afterTurnEconMor,
    				newLevel : model.get('econLevel'),
    				newEconPopulation: model.get('econPopulation'),
    				newEconStrength: model.get('econStrength'),
    				ecGrowthRate: model.get('econGrowthPct')
    			});
			} 

			model.set({ 
				'morale' : afterTurnMor,
				'econMorale' : afterTurnEconMor,
				'economicOutput' : afterTurnGDP
			});

		});
	},
	newTurnUpdate: function() {

		var currLeftTurn = App.Utilities.activeSide() === 'left',
			endLeftPop = 0,
		 	endRightPop = 0,
		 	newLeftEconStartPop = 0,
		 	newRightEconStartPop = 0;

		 var leftLowTaxCrash = !currLeftTurn ? (App.Models.nationStats.get('left').get('lowTaxTurnLength') > 3 && Math.random() < 0.25) : App.Models.nationStats.get('left').get('econCrash'),
			 rightLowTaxCrash = !currLeftTurn ? (App.Models.nationStats.get('right').get('lowTaxTurnLength') > 3 && Math.random() < 0.25) : App.Models.nationStats.get('right').get('econCrash'),
             leftRegCrash = !currLeftTurn ? !leftLowTaxCrash && (Math.random() < 0.15 && App.Models.nationStats.get('left').get('taxRate') < Math.random()) : false,
             rightRegCrash = !currLeftTurn ? !rightLowTaxCrash && (Math.random() < 0.15 && App.Models.nationStats.get('right').get('taxRate') < Math.random()) : false,
			 isCrash = false,
			 lowTaxPenalty,
             leftCrashGDPPenalty = leftLowTaxCrash ? App.Constants.GDP_PENALTY_LOW_TAX + (Math.random() / 20) : 1,
             leftCrashGDPPenalty = leftRegCrash ? App.Constants.GDP_PENALTY_REG_CRASH + (Math.random() / 20) : leftCrashGDPPenalty,
             rightCrashGDPPenalty = rightLowTaxCrash ? App.Constants.GDP_PENALTY_LOW_TAX + (Math.random() / 20) : 1,
             rightCrashGDPPenalty = rightRegCrash ? App.Constants.GDP_PENALTY_REG_CRASH + (Math.random() / 20) : rightCrashGDPPenalty,
			 leftGDPPenalty = 0,
			 rightGDPPenalty = 0;

		if((leftLowTaxCrash || leftRegCrash) && !currLeftTurn) {
			App.Models.nationStats.get('left').set('econCrash', true);

            if(App.Models.nationStats.get('left').get('econCrashTurn') === (App.Models.nationStats.get('currentTurn') - 1)) {
                App.Models.nationStats.get('left').set('econCrashTurnPrv', App.Models.nationStats.get('left').get('econCrashTurn'));
            }
            
            App.Models.nationStats.get('left').set('econCrashTurn', App.Models.nationStats.get('currentTurn'));
		
        } else if(!currLeftTurn) {
			App.Models.nationStats.get('left').set('econCrash', false);
            if(App.Models.nationStats.get('left').get('econCrashTurn') != 0) {
                App.Models.nationStats.get('left').set('econCrashTurnPrv', App.Models.nationStats.get('left').get('econCrashTurn'));
            }
			App.Models.nationStats.get('left').set('econCrashTurn', 0);
		}

		if((rightLowTaxCrash || rightRegCrash) && !currLeftTurn) {
			App.Models.nationStats.get('right').set('econCrash', true);
            if(App.Models.nationStats.get('right').get('econCrashTurn') === (App.Models.nationStats.get('currentTurn') - 1)) {
			    App.Models.nationStats.get('right').set('econCrashTurnPrv', App.Models.nationStats.get('right').get('econCrashTurn'));
            }
            App.Models.nationStats.get('right').set('econCrashTurn', App.Models.nationStats.get('currentTurn'));
		} else if(!currLeftTurn) {
			App.Models.nationStats.get('right').set('econCrash', false);
            if(App.Models.nationStats.get('right').get('econCrashTurn') != 0) {
                App.Models.nationStats.get('right').set('econCrashTurnPrv', App.Models.nationStats.get('right').get('econCrashTurn'));
            }
			App.Models.nationStats.get('right').set('econCrashTurn', 0);
		}

        if(!currLeftTurn) {

            // Reset policy costs

            App.Models.nationStats.get('left').set('policyCosts', 0);
            App.Models.nationStats.get('right').set('policyCosts', 0);

            // Carry out policies

            var yearPolicies = [
                {
                    side: 'left',
                    policies: App.Models.nationStats.get('left').get('activePolicies'),
                    enabled: App.Models.nationStats.get('left').get('activePolicyCount')
                },
                {
                    side: 'right',
                    policies: App.Models.nationStats.get('right').get('activePolicies'),
                    enabled: App.Models.nationStats.get('right').get('activePolicyCount')
                }
            ]

            for (var i = 0; i < yearPolicies.length; i++) {

                if(yearPolicies[i].enabled != 0) {
                    var side = yearPolicies[i].side;

                    var activePolicies = [];

                    for (var j = 0; j < yearPolicies[i].policies.length; j++) {
                        if(yearPolicies[i].policies[j].priority != 0 && yearPolicies[i].policies[j].side == yearPolicies[i].side) {
                            activePolicies.push(yearPolicies[i].policies[j]);
                        }
                    }

                    _.sortBy(activePolicies, 'priority');

                    for (var k = 0; k < activePolicies.length; k++) {

                        switch(activePolicies[k].id) {

                            case 'repair_infra':
                                App.Collections.terrCollection.repairAllInfrastructurePolicy(side);
                                break;
                            case 'repair_forts':
                                App.Collections.terrCollection.repairAllFortsPolicy(side);
                                break;
                            case 'upgrade_tech':
                                App.Collections.terrCollection.updgradeAllTechLevelsPolicy(side);
                                break;
                            case 'upgrade_forts':
                                App.Collections.terrCollection.updgradeAllFortsPolicy(side);
                                break;
                            case 'recruit_army':
                                App.Collections.terrCollection.recruitPolicy(side);
                                break;
                            default:
                                return false;

                        }
                    }
                }
            }

        }

        if(!currLeftTurn) {
            // Store what must be stored on the nation model before the turn resets
            App.Models.nationStats.get('left').set({
                overallArmyCasualties: App.Models.nationStats.get('left').get('overallArmyCasualties') + App.Collections.terrCollection.getSideCasualties('left', 'army'),
                overallEconCasualties: App.Models.nationStats.get('left').get('overallEconCasualties') + App.Collections.terrCollection.getSideCasualties('left', 'econ')
            });

            App.Models.nationStats.get('right').set({
                overallArmyCasualties: App.Models.nationStats.get('right').get('overallArmyCasualties') + App.Collections.terrCollection.getSideCasualties('right', 'army'),
                overallEconCasualties: App.Models.nationStats.get('right').get('overallEconCasualties') + App.Collections.terrCollection.getSideCasualties('right', 'econ')
            });
        }

		// Update army populations, fort strengths, and morale values in each territory
		App.Collections.terrCollection.forEach(function(model, index) {

			var side = model.get('side'),
				beforeTurnPop = model.get('armyPopulation'),
				beforeTurnFortStr = model.get('fortStrength'),
				beforeTurnFortLvl = model.get('fortLevel'),
				newRemainingTurns = 0,
				leftSideTerr = side === 'left',
                lowTaxPenalty = leftSideTerr ? leftCrashGDPPenalty : rightCrashGDPPenalty;

			model.set('prvPopulation', model.get('armyPopulation'));
			
			if(leftSideTerr) {
				newRemainingTurns = currLeftTurn ? 0 : 1;
			} else {
				newRemainingTurns = currLeftTurn ? 1 : 0;
			}

			if(!currLeftTurn){

				//Econ Population Growth
				var beforeTurnEconPop = model.get('econPopulation'),
					beforeTurnEconGDP = model.get('economicOutput'),
					beforeTurnEconLevel = model.get('econLevel'),
					beforeTurnEconMorale = model.get('econMorale'),
					newEconStrength = Math.max(model.get('econStrength') - App.Models.nationStats.get(side).returnLowTaxInfraDrag(), 0),
                    crashGDPPenalty = 0;

                if(model.get('side') === 'left' && leftLowTaxCrash) {
                    isCrash = true;
                } else if(model.get('side') === 'right' && rightLowTaxCrash) {
                    isCrash = true;
                } else {
                    isCrash = false;
                }
				
				var highTaxTurnLength = leftSideTerr ? App.Models.nationStats.get('left').get('highTaxTurnLength') : App.Models.nationStats.get('right').get('highTaxTurnLength');
				var lowTaxTurnLength = leftSideTerr ? App.Models.nationStats.get('left').get('lowTaxTurnLength') : App.Models.nationStats.get('right').get('lowTaxTurnLength');

				var gdpGrowthRate = App.Utilities.newGDPGrowthRate({
					econPop: beforeTurnEconPop,
					econMorale: beforeTurnEconMorale,
					econStrength: newEconStrength,
					econLevel: beforeTurnEconLevel,
					highTaxTurnLength: highTaxTurnLength,
					lowTaxTurnLength: lowTaxTurnLength,
					lowTaxCrash: isCrash
				});

				var econPopGrowthRate = App.Utilities.newEconPopGrowthRate({
						econPop: beforeTurnEconPop,
						econMorale: beforeTurnEconMorale,
						econLevel: beforeTurnEconLevel,
						econStrengh: newEconStrength,
						highTaxTurnLength: highTaxTurnLength,
						lowTaxCrash: isCrash
					}),
					afterTurnEconPop = beforeTurnEconPop + Math.round(econPopGrowthRate * beforeTurnEconPop);

				var taxRate = App.Models.nationStats.get(side).get('taxRate'),
					leftHighTaxTurnLength = side === 'left' ? App.Models.nationStats.get('left').get('highTaxTurnLength') : 0,
					rightHighTaxTurnLength = side === 'right' ? App.Models.nationStats.get('right').get('highTaxTurnLength') : 0,
					leftLowTaxTurnLength = side === 'left' ?  App.Models.nationStats.get('left').get('lowTaxTurnLength') : 0,
					rightLowTaxTurnLength = side === 'right' ?  App.Models.nationStats.get('left').get('lowTaxTurnLength') : 0;

				//Econ Morale
				var afterTurnEconMorale = App.Utilities.updateEconMorale({
					selectedArmyPop: beforeTurnPop,
					selectedFortStrength: beforeTurnFortStr,
					selectedFortLevel : beforeTurnFortLvl,
					econLevel: beforeTurnEconLevel,
					econStrength : newEconStrength,
					econPopulation: beforeTurnEconPop,
					newMorale : beforeTurnEconMorale,
					oldTaxRate: taxRate,
					genTaxBonuses : true,
					selectedTaxRate : taxRate,
					leftHighTaxTurnLength: leftHighTaxTurnLength,
					rightHighTaxTurnLength: rightHighTaxTurnLength,
					leftLowTaxTurnLength: leftLowTaxTurnLength,
					rightLowTaxTurnLength: rightLowTaxTurnLength,
					side: side
				});

				var afterTurnFortStr = Math.min(Math.round(beforeTurnFortStr + (model.get('armyPopulation') / 10000)), 100);
				var beforeTurnMor = model.get('morale');
                var crashMoraleDrag = model.get('side') === 'left' && leftLowTaxCrash || model.get('side') === 'right' && rightLowTaxCrash,
                    crashMoraleDrag = crashMoraleDrag ? 10 : 0;
				var afterTurnMor = Math.min(Math.round((beforeTurnMor + 5) * App.Constants.LEVEL_0_MOR_PER_TURN_MULT), 100) - crashMoraleDrag;


                var afterTurnGDP = App.Utilities.updateGDP({
                    newMorale: afterTurnEconMorale,
                    newLevel: model.get('econLevel'),
                    newEconPopulation: afterTurnEconPop,
                    newEconStrength: newEconStrength,
                    ecGrowthRate: gdpGrowthRate
                }),
                    afterTurnGDP = Math.round(lowTaxPenalty * afterTurnGDP);
                
                crashGDPPenalty = Math.round(afterTurnGDP - lowTaxPenalty * afterTurnGDP);

                // End of function ?
                if(side == 'left') {
                    newLeftEconStartPop += afterTurnEconPop;
                    leftGDPPenalty += crashGDPPenalty;
                } else {
                    newRightEconStartPop += afterTurnEconPop;
                    rightGDPPenalty += crashGDPPenalty;
                }


                var newArmyRecruits = 0;
                if(App.Models.nationStats.get(side).get('recruitsAuto') > 0 ) {
                    newArmyRecruits = model.get('armyRecruits');
                }

				model.set( {
					'armyCasualties' : 0,
					'armyPopulation' : beforeTurnPop,
					'armyRecruits' : newArmyRecruits,
					'prvPopulation' : beforeTurnPop,
					'startPopulation' : beforeTurnPop,
					'morale' : afterTurnMor,
					'fortStrength' : afterTurnFortStr,
					'economicOutput' : afterTurnGDP,
                    'governorKilled' : false,
					'startEconomicOutput' : afterTurnGDP,
					'econCasualties' : 0,
					'econPopulation' : afterTurnEconPop,
					'prvEconPopulation' : afterTurnEconPop,
					'startEconPopulation' : afterTurnEconPop,
					'econMorale' : afterTurnEconMorale,
					'econStrength' : newEconStrength,
					'econLeveledUp' : false,
					'fortLeveledUp': false,
					'remainingTurns' : newRemainingTurns,
					'selected' : false,
					'trainingClicked' : false,
					'econPopulationGrowthPct' : econPopGrowthRate * 100,
					'econGrowthPct': gdpGrowthRate * 100
				});

                App.Utilities.flipEls(['.armyPopulation-main', '.fortStrength-main']);

			} else {

				model.set( {
					'remainingTurns' : newRemainingTurns,
					'selected' : false,
					'trainingClicked' : false
				});

                // This is where the AI logic will start

			}
		
		});


        if(!currLeftTurn) {

            var leftFortsDestroyedThisTurn = App.Models.nationStats.get('right').get('fortsLost').length;
            var rightFortsDestroyedThisTurn = App.Models.nationStats.get('left').get('fortsLost').length;

            var leftRecruits = 0;
            var leftTerrWithRecruits = [];
            if (App.Models.nationStats.get('left').get('recruitsAuto') > 0) {
                leftRecruits = App.Models.nationStats.get('left').get('recruitsAuto');
                leftTerrWithRecruits = App.Models.nationStats.get('left').get('terrsWithRecruits');
            }

	 		App.Models.nationStats.get('left').set({
	 			armyPopulationStart: this.returnSideTotal('left', 'armyPopulation'),
                armyPopulationNow: this.returnSideTotal('left', 'armyPopulation'),
	 			armyCasualties: 0,
				econPopulationStart: newLeftEconStartPop,
				econPopulationNow: this.returnSideTotal('left', 'econPopulation'),
				armiesPromoted: [],
				battleLosses: 0,
				battleWins: 0,
				econCasualties: 0,
				econCrashPenalty: leftGDPPenalty,
                econOutput: this.returnSideTotal('left', 'economicOutput'),
                econOutputStart: this.returnSideTotal('left', 'economicOutput'),
				fortsLost: [],
				invadedThisTurn: [],
				invasionArmyCasualties: 0,
				invasionEconCasualties: 0,
                overallArmyPromotions: App.Models.nationStats.get('left').get('overallArmyPromotions') + App.Models.nationStats.get('left').get('armiesPromoted').length,
                overallFortsDestroyed: App.Models.nationStats.get('left').get('overallFortsDestroyed') + leftFortsDestroyedThisTurn,
                overallFortsLost: App.Models.nationStats.get('left').get('overallFortsLost') + rightFortsDestroyedThisTurn,
                overallInvasions: App.Models.nationStats.get('left').get('overallInvasions') + App.Models.nationStats.get('left').get('invadedThisTurn').length,
                overallLostTerrs: App.Models.nationStats.get('left').get('overallLostTerrs') + App.Models.nationStats.get('left').get('terrLostThisTurn').length,
                overallRecruits: App.Models.nationStats.get('left').get('overallRecruits') + App.Models.nationStats.get('left').get('recruitsThisTurn'),
                recruitsAuto: 0,
				recruitsThisTurn: leftRecruits,
				terrLostThisTurn: [],
                terrsWithRecruits: leftTerrWithRecruits,
				repairAllInfrastructureCost: this.returnTotalCost('econStrength', 'left'),
				repairAllFortCost: this.returnTotalCost('fortStrength', 'left')
	 		});

            var rightRecruits = 0;
            var rightTerrWithRecruits = [];
            if (App.Models.nationStats.get('right').get('recruitsAuto') > 0) {
                rightRecruits = App.Models.nationStats.get('right').get('recruitsAuto');
                rightTerrWithRecruits = App.Models.nationStats.get('right').get('terrsWithRecruits');
            }

	 		App.Models.nationStats.get('right').set({
	 			armyPopulationStart: this.returnSideTotal('right', 'armyPopulation'),
                armyPopulationNow: this.returnSideTotal('right', 'armyPopulation'),
	 			armyCasualties: 0,
				econPopulationStart: newRightEconStartPop,
				econPopulationNow: this.returnSideTotal('right', 'econPopulation'),
				armiesPromoted: [],
				battleLosses: 0,
				battleWins: 0,
				econCasualties: 0,
				econCrashPenalty: rightGDPPenalty,
                econOutput: this.returnSideTotal('right', 'economicOutput'),
                econOutputStart: this.returnSideTotal('right', 'economicOutput'),
				fortsLost: [],
				invadedThisTurn: [],
				invasionArmyCasualties: 0,
				invasionEconCasualties: 0,
                overallArmyCasualties: App.Models.nationStats.get('right').get('overallArmyCasualties') + App.Collections.terrCollection.getSideCasualties('right', 'army'),
                overallArmyPromotions: App.Models.nationStats.get('right').get('overallArmyPromotions') + App.Models.nationStats.get('right').get('armiesPromoted').length,
                overallEconCasualties: App.Models.nationStats.get('right').get('overallEconCasualties') + App.Collections.terrCollection.getSideCasualties('right', 'econ'),
                overallFortsDestroyed: App.Models.nationStats.get('right').get('overallFortsDestroyed') + rightFortsDestroyedThisTurn,
                overallFortsLost: App.Models.nationStats.get('right').get('overallFortsLost') + leftFortsDestroyedThisTurn,
                overallInvasions: App.Models.nationStats.get('right').get('overallInvasions') + App.Models.nationStats.get('right').get('invadedThisTurn').length,
                overallLostTerrs: App.Models.nationStats.get('right').get('overallLostTerrs') + App.Models.nationStats.get('right').get('terrLostThisTurn').length,
                overallRecruits: App.Models.nationStats.get('right').get('overallRecruits') + App.Models.nationStats.get('right').get('recruitsThisTurn'),
                recruitsAuto: 0,
				recruitsThisTurn: rightRecruits,
				terrLostThisTurn: [],
                terrsWithRecruits: rightTerrWithRecruits,
				repairAllInfrastructureCost: this.returnTotalCost('econStrength', 'right'),
				repairAllFortCost: this.returnTotalCost('fortStrength', 'right')
	 		});

 		}

	}
});