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

        App.Collections.terrCollection.removeAttackRange();

        _.each(enemyTerritoriesArr, function(model) {
            
            if(Math.abs(parseInt(model.get('row')) - row) < range && Math.abs(parseInt(model.get('column')) - column) < range) {
                model.set('inRange', true);
            }

        });

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
    casualtiesTotal: function() {
        return this.getSideCasualties('left', 'army') + this.getSideCasualties('right', 'army');
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
    getSideTerritoriesWithRecruits: function(s) {

        var recruitTerrs = _.chain(this.models)
                            .sortBy(function(model) { return model.get('armyRecruits') })
                            .reverse()
                            .filter(function(model) {return model.get('side') == s && model.get('armyRecruits') > 0 })
                            .value();

        return recruitTerrs;
    },
    getSideTerritoriesWithTurns: function(s) {

        return _.filter(this.models, function(model) { return model.get('side') === s && model.get('remainingTurns') != 0});

    },
    multiplePoliciesInFull: function(policiesInFullObj) {

        // Get side territories collection
        var array = _.chain(this.models)
                    .filter(function(model) { return model.get('side') === policiesInFullObj[0].side })
                    .value();

        var repairInfra = !_.isEmpty(_.findWhere(policiesInFullObj, {id: 'repair_infra'})),
            repairForts = !_.isEmpty(_.findWhere(policiesInFullObj, {id: 'repair_forts'})),
            recruitUnits = !_.isEmpty(_.findWhere(policiesInFullObj, {id: 'recruit_army'})),
            upgradeTech = !_.isEmpty(_.findWhere(policiesInFullObj, {id: 'upgrade_tech'})),
            upgradeForts = !_.isEmpty(_.findWhere(policiesInFullObj, {id: 'upgrade_forts'}));

        var recruitIndex = _.findIndex(policiesInFullObj, function(policy) { return policy.id == 'recruit_army' });

        _.each(array, function(model) {
            var newInfrastrength = repairInfra ? 100 : model.get('econStrength'),
                newFortStrength = repairForts ? 100 : model.get('fortStrength'),
                newUnits =  recruitUnits ? model.get('armyPopulation') + policiesInFullObj[recruitIndex].amount : model.get('armyPopulation'),
                newEconPopulation = recruitUnits ? model.get('econPopulation') - policiesInFullObj[recruitIndex].amount : model.get('econPopulation'),
                newEconLevel = upgradeTech && model.get('econStrength') === 100 && model.get('econLevel') < App.Constants.MAX_TECH_LEVEL || upgradeTech && repairInfra && model.get('econLevel') < App.Constants.MAX_TECH_LEVEL ? model.get('econLevel') + 1 : model.get('econLevel'),
                newFortLevel = upgradeForts && model.get('fortStrength') === 100 && model.get('fortLevel') < App.Constants.MAX_FORT_LEVEL || upgradeForts && repairForts && model.get('fortLevel') < App.Constants.MAX_FORT_LEVEL ? model.get('fortLevel') + 1 : model.get('fortLevel'),
                recruits = recruitUnits ? policiesInFullObj[recruitIndex].amount : 0,
                newEconStrengthCost = repairInfra ? 0 : model.get('econStrengthCost'),
                newFortStrengthCost = repairForts ? 0 : model.get('fortStrengthCost'),
                newFortLevelCost = upgradeForts && model.get('fortStrength') === 100 && model.get('fortLevel') < App.Constants.MAX_FORT_LEVEL || upgradeForts && repairForts && model.get('fortLevel') < App.Constants.MAX_FORT_LEVEL ? App.Constants.FORT_LVL_COST * (1 + newFortLevel) : model.get('fortLevelCost'),
                newEconLevelCost = upgradeTech && model.get('econStrength') === 100 && model.get('econLevel') < App.Constants.MAX_TECH_LEVEL || upgradeTech && repairInfra && model.get('econLevel') < App.Constants.MAX_TECH_LEVEL ? App.Constants.ECON_LVL_UP_AMT * (1 + newEconLevel) : model.get('econLevelCost');

            var newVals = App.Utilities.returnRecruitMoraleXPRank(model, recruits),
                oldArmyMorale = newVals.toMorale,
                newArmyMorale = Math.round(oldArmyMorale + ((100 - newFortStrength / 2))),
                newArmyMorale = Math.min(newArmyMorale, 100);

            var ecMorale = App.Utilities.updateEconMorale({
                selectedFortStrength : newFortStrength,
                econStrength: newInfrastrength,
                econPopulation: newEconPopulation,
                selectedArmyPop: newUnits,
                econLevel: newEconLevel,
                selectedFortLevel: newFortLevel,
                newMorale: model.get('econMorale')
            }),
                updateGDP = App.Utilities.updateGDP({
                    newMorale : ecMorale,
                    newEconStrength: newInfrastrength,
                    newEconPopulation : newEconPopulation,
                    newLevel : newEconLevel,
                    ecGrowthRate: model.get('econGrowthPct')
                });

            model.set({
                econPopulation: newEconPopulation,
                startEconPopulation: newEconPopulation,
                prvEconPopulation: newEconPopulation,
                econMorale: ecMorale,
                econStrength: newInfrastrength,
                fortStrength: newFortStrength,
                armyPopulation: newUnits,
                startPopulation: newUnits,
                prvPopulation: newUnits,
                econLevel: newEconLevel,
                fortLevel: newFortLevel,
                morale: newVals.toMorale,
                armyRank: newVals.toRank,
                armyXP: newVals.toXP,
                armyRecruits : recruits,
                recruitsAuto: recruits,
                economicOutput: updateGDP,
                startEconomicOutput: updateGDP,
                econStrengthCost: newEconStrengthCost,
                fortStrengthCost: newFortStrengthCost,
                fortLevelCost: newFortLevelCost,
                econLevelCost: newEconLevelCost
            });

        });
        if(App.Collections.terrCollection.newTechLevel(policiesInFullObj[0].side)) {
            var oldTechLevel = App.Models.nationStats.get(policiesInFullObj[0].side).get('armyTechLvl');
            App.Models.nationStats.get(policiesInFullObj[0].side).set('armyTechLvl', (oldTechLevel+1)); 
        }


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

        // Set GDP crashes caused by low taxes and random chance
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

        // Set and execute policies
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

            var leftPolicies = [];
            var rightPolicies = [];

            for (var i = 0; i < yearPolicies.length; i++) {

                if(yearPolicies[i].enabled != 0) {
                    var side = yearPolicies[i].side;

                    var activePolicies = [];

                    for (var j = 0; j < yearPolicies[i].policies.length; j++) {
                        if(yearPolicies[i].policies[j].priority != 0 && yearPolicies[i].policies[j].side == yearPolicies[i].side) {
                            activePolicies.push(yearPolicies[i].policies[j]);

                            if (yearPolicies[i].side === 'left') {
                                leftPolicies.push(yearPolicies[i].policies[j]);
                            } else if (yearPolicies[i].side === 'right') {
                                rightPolicies.push(yearPolicies[i].policies[j]);
                            }

                        }
                    }

                    _.sortBy(leftPolicies, 'priority');
                    _.sortBy(rightPolicies, 'priority');

                    _.sortBy(activePolicies, 'priority');

                }
            }

            // Policies work for the left side
            var leftRunningTotalCost = 0;
            var prioritiesAffordableInFull = [];
            var partialPriority = [];

            for (var i = 0; i < leftPolicies.length; i++) {

                var thisPolicyCost = this.returnPolicyCost(leftPolicies[i], !_.isEmpty(_.findWhere(prioritiesAffordableInFull, { id: 'repair_infra'})), !_.isEmpty(_.findWhere(prioritiesAffordableInFull, { id: 'repair_forts'})));

                var affordableInFull = App.Utilities.getTreasuryAuto(leftPolicies[i].side) - leftRunningTotalCost > thisPolicyCost;

                leftRunningTotalCost += affordableInFull && thisPolicyCost > 0 ? thisPolicyCost : 0;

                if(affordableInFull && thisPolicyCost > 0){
                    prioritiesAffordableInFull.push(leftPolicies[i]);

                    switch (leftPolicies[i].id) {

                        case 'recruit_army':
                            App.Models.nationStats.get(leftPolicies[i].side).set({
                                'recruitSpend': thisPolicyCost,
                                'recruitsAuto': leftPolicies[i].amount * App.Models.nationStats.get(leftPolicies[i].side).get('terrs').length,
                                'overallRecruits': leftPolicies[i].amount * App.Models.nationStats.get(leftPolicies[i].side).get('terrs').length,
                                'armyPopulationNow': App.Models.nationStats.get(leftPolicies[i].side).get('armyPopulationNow') + (leftPolicies[i].amount * App.Models.nationStats.get(leftPolicies[i].side).get('terrs').length),
                                'terrsWithRecruits' : App.Models.nationStats.get(leftPolicies[i].side).get('terrs'),
                                'econPopulationStart' : App.Models.nationStats.get(leftPolicies[i].side).get('econPopulation') - (leftPolicies[i].amount * App.Models.nationStats.get(leftPolicies[i].side).get('terrs').length),
                                'recruitsThisTurn': (leftPolicies[i].amount * App.Models.nationStats.get(leftPolicies[i].side).get('terrs').length)
                            });
                            break;
                        case 'repair_infra':
                            App.Models.nationStats.get(leftPolicies[i].side).set('infrastructureSpend', thisPolicyCost);
                            break;
                        case 'repair_forts':
                            App.Models.nationStats.get(leftPolicies[i].side).set('fortSpend', thisPolicyCost);
                            break;
                        case 'upgrade_tech':
                            App.Models.nationStats.get(leftPolicies[i].side).set('econLevelSpend', thisPolicyCost);
                            break;
                        case 'upgrade_forts':
                            App.Models.nationStats.get(leftPolicies[i].side).set('fortLevelSpend', thisPolicyCost);
                            break;
                        default:
                            return false;
                    }

                } else if (thisPolicyCost > 0) {
                    partialPriority.push(leftPolicies[i]);
                    break;
                }

            }

            // Carry out policies the empire can afford to do in all territories by
            // cycling through each territory once, and carrying out multiple policies at once

            if(prioritiesAffordableInFull.length > 0) {
                App.Collections.terrCollection.multiplePoliciesInFull(prioritiesAffordableInFull);
                var newNationalTreasury = App.Models.nationStats.get('left').get('treasury') - leftRunningTotalCost;
                App.Models.nationStats.payForUpgradeAuto(newNationalTreasury, 'left', leftRunningTotalCost + App.Models.nationStats.get('left').get('policyCosts'));
            }

            if (partialPriority.length > 0) {
                // Carry out partial policy the old way, by cycling through each territory 
                switch(partialPriority[0].id) {
                    case 'repair_infra':
                        App.Collections.terrCollection.repairAllInfrastructurePolicy(partialPriority[0].side);
                        break;
                    case 'repair_forts':
                        App.Collections.terrCollection.repairAllFortsPolicy(partialPriority[0].side);
                        break;
                    case 'upgrade_tech':
                        App.Collections.terrCollection.updgradeAllTechLevelsPolicy(partialPriority[0].side);
                        break;
                    case 'upgrade_forts':
                        App.Collections.terrCollection.updgradeAllFortsPolicy(partialPriority[0].side);
                        break;
                    case 'recruit_army':
                        App.Collections.terrCollection.recruitPolicy(partialPriority[0].side);
                        break;
                    default:
                        return false;
                }
            }

            // Policies work for the right side
            var rightRunningTotalCost = 0;
            var prioritiesAffordableInFullRight = [];
            var partialPriorityRight = [];

            for (var i = 0; i < rightPolicies.length; i++) {

                var thisPolicyCost = this.returnPolicyCost(rightPolicies[i], !_.isEmpty(_.findWhere(prioritiesAffordableInFullRight, { id: 'repair_infra'})), !_.isEmpty(_.findWhere(prioritiesAffordableInFullRight, { id: 'repair_forts'})));

                var affordableInFull = App.Utilities.getTreasuryAuto(rightPolicies[i].side) - rightRunningTotalCost > thisPolicyCost;

                rightRunningTotalCost += affordableInFull && thisPolicyCost > 0 ? thisPolicyCost : 0;

                if(affordableInFull && thisPolicyCost > 0){
                    prioritiesAffordableInFullRight.push(rightPolicies[i]);

                    switch (rightPolicies[i].id) {

                        case 'recruit_army':
                            App.Models.nationStats.get(rightPolicies[i].side).set({
                                'recruitSpend': thisPolicyCost,
                                'recruitsAuto': rightPolicies[i].amount * App.Models.nationStats.get(rightPolicies[i].side).get('terrs').length,
                                'overallRecruits': rightPolicies[i].amount * App.Models.nationStats.get(rightPolicies[i].side).get('terrs').length,
                                'armyPopulationNow': App.Models.nationStats.get(rightPolicies[i].side).get('armyPopulationNow') + (rightPolicies[i].amount * App.Models.nationStats.get(rightPolicies[i].side).get('terrs').length),
                                'terrsWithRecruits' : App.Models.nationStats.get(rightPolicies[i].side).get('terrs'),
                                'econPopulationStart' : App.Models.nationStats.get(rightPolicies[i].side).get('econPopulation') - (rightPolicies[i].amount * App.Models.nationStats.get(rightPolicies[i].side).get('terrs').length),
                                'recruitsThisTurn': (rightPolicies[i].amount * App.Models.nationStats.get(rightPolicies[i].side).get('terrs').length)
                            });
                            break;
                        case 'repair_infra':
                            App.Models.nationStats.get(rightPolicies[i].side).set('infrastructureSpend', thisPolicyCost);
                            break;
                        case 'repair_forts':
                            App.Models.nationStats.get(rightPolicies[i].side).set('fortSpend', thisPolicyCost);
                            break;
                        case 'upgrade_tech':
                            App.Models.nationStats.get(rightPolicies[i].side).set('econLevelSpend', thisPolicyCost);
                            break;
                        case 'upgrade_forts':
                            App.Models.nationStats.get(rightPolicies[i].side).set('fortLevelSpend', thisPolicyCost);
                            break;
                        default:
                            return false;
                    }

                } else if (thisPolicyCost > 0) {
                    partialPriorityRight.push(rightPolicies[i]);
                    break;
                }

            }

            // Carry out policies the empire can afford to do in all territories by
            // cycling through each territory once, and carrying out multiple policies at once

            if(prioritiesAffordableInFullRight.length > 0) {
                App.Collections.terrCollection.multiplePoliciesInFull(prioritiesAffordableInFullRight);
                var newNationalTreasury = App.Models.nationStats.get('right').get('treasury') - rightRunningTotalCost;
                App.Models.nationStats.payForUpgradeAuto(newNationalTreasury, 'right', rightRunningTotalCost + App.Models.nationStats.get('right').get('policyCosts'));
            }

            if (partialPriorityRight.length > 0) {
                // Carry out partial policy the old way, by cycling through each territory 
                switch(partialPriorityRight[0].id) {
                    case 'repair_infra':
                        App.Collections.terrCollection.repairAllInfrastructurePolicy(partialPriorityRight[0].side);
                        break;
                    case 'repair_forts':
                        App.Collections.terrCollection.repairAllFortsPolicy(partialPriorityRight[0].side);
                        break;
                    case 'upgrade_tech':
                        App.Collections.terrCollection.updgradeAllTechLevelsPolicy(partialPriorityRight[0].side);
                        break;
                    case 'upgrade_forts':
                        App.Collections.terrCollection.updgradeAllFortsPolicy(partialPriorityRight[0].side);
                        break;
                    case 'recruit_army':
                        App.Collections.terrCollection.recruitPolicy(partialPriorityRight[0].side);
                        break;
                    default:
                        return false;
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
                overallEconCasualties: App.Models.nationStats.get('right').get('overallEconCasualties') + App.Collections.terrCollection.getSideCasualties('right', 'econ'),
                repairAllInfrastructureCost: this.returnTotalCost('econStrength', 'right'),
                repairAllFortCost: this.returnTotalCost('fortStrength', 'right')
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
			
            // If the current model is a left side territory and AT THIS POINT the left side has the active turn (which is currently ending)
            // Set the model's remaingin turns to zero, otherwise set it to 1
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
                overallArmyPromotions: App.Models.nationStats.get('right').get('overallArmyPromotions') + App.Models.nationStats.get('right').get('armiesPromoted').length,
                overallFortsDestroyed: App.Models.nationStats.get('right').get('overallFortsDestroyed') + rightFortsDestroyedThisTurn,
                overallFortsLost: App.Models.nationStats.get('right').get('overallFortsLost') + leftFortsDestroyedThisTurn,
                overallInvasions: App.Models.nationStats.get('right').get('overallInvasions') + App.Models.nationStats.get('right').get('invadedThisTurn').length,
                overallLostTerrs: App.Models.nationStats.get('right').get('overallLostTerrs') + App.Models.nationStats.get('right').get('terrLostThisTurn').length,
                overallRecruits: App.Models.nationStats.get('right').get('overallRecruits') + App.Models.nationStats.get('right').get('recruitsThisTurn'),
                recruitsAuto: 0,
				recruitsThisTurn: rightRecruits,
				terrLostThisTurn: [],
                terrsWithRecruits: rightTerrWithRecruits
	 		});

 		}

	},
    minPointsToUpgrade: function(s) {
        // Half of territories must be at the next level to upgrade
        // At minimum, all other territories can have a tech level of 1 and the upgrade
        // will still apply which is why Math.round(App.Models.nationStats.get(s).get('terrs').length / 2)
        // is added (tech level of 1 for each of the remaining half of the territories)
        var nextSideLevel = App.Models.nationStats.get(s).get('armyTechLvl') + 1;

        return Math.round((Math.ceil(App.Models.nationStats.get(s).get('terrs').length / 2) * nextSideLevel) + (Math.floor(App.Models.nationStats.get(s).get('terrs').length / 2) * (nextSideLevel - 1)));
    },
    sideTechLevelPoints: function(s) {
        return _.chain(this.models)
                            .filter(function(model) {return model.get('side') == s})
                            .reduce(function(memo, model){ return memo + model.get('econLevel'); }, 0)
                            .value();
    },
    newTechLevel: function(s) {

        if(App.Collections.terrCollection.sideTechLevelPoints(s) >= App.Collections.terrCollection.minPointsToUpgrade(s) && App.Models.nationStats.get(s).get('armyTechLvl') <= App.Constants.MAX_TECH_LEVEL) {

            var sideTerrs = _.chain(this.models)
                                .filter(function(model) {return model.get('side') == s})
                                .value();

            _.each(sideTerrs, function(model) {

                var oldArmyMorale = model.get('morale'),
                    newArmyMorale = Math.round(oldArmyMorale + (App.Constants.ARMY_TECH_LEVEL_MORALE_BOOST * oldArmyMorale)),
                    newArmyMorale = Math.min(newArmyMorale, 100);

                model.set({
                    'morale': newArmyMorale,
                })
            });

            return true;
        } else {
            return false;
        }

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
                App.Models.nationStats.get(s).set('policyCosts', policyCosts);
            }

        });
    },
    recruitTarget: function() {

        var recruitTerritoriesArr = _.chain(this.models)
            .filter(function(selected) { return selected.get('side') === App.Utilities.activeSide() })
            .value();

        _.each(recruitTerritoriesArr, function(model) {
            model.set('recruitTarget', true);
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
    removeRecruitTarget: function() {

        var recruitTerritoriesArr = _.chain(this.models)
            .filter(function(selected) { return selected.get('side') === App.Utilities.activeSide() })
            .value();

        _.each(recruitTerritoriesArr, function(model) {
            model.set('recruitTarget', false);
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
    returnAnyTurnsLeft: function() {
        var terrWithRemainingTurns = false;

        // Receives the side to filter the models, then adds the values from the model at "property" together and returns the results
        var terrWithRemainingTurns = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === App.Utilities.activeSide() })
                        .some(function(model) { return model.get('remainingTurns') > 0;})
                        .value();

        return terrWithRemainingTurns;

    },
    returnTerrsWithBorders: function(s) {

        var terrsArrHasSelected =  _.chain(this.models)
                                .filter(function(selected) { return selected.get('side') === s && selected.get('isBorder') && selected.get('remainingTurns') > 0 })
                                .some(function(model) { return model.get('selected') })
                                .value();

        // If there is a selected territory, guarantee that it will be at the top of the returned list
        if(terrsArrHasSelected) {

            var selectedTerrsArr = _.chain(this.models)
                                .filter(function(selected) { return selected.get('side') === s && selected.get('isBorder') && selected.get('remainingTurns') > 0 })
                                .sortBy(function(model){ return model.get('selected') })
                                .reverse()
                                .value();

            return selectedTerrsArr;
        } else {
            // Otherwise just return the border territories with turns remaining for a particular side
            // but randomly switch between the order of selecting them from bottom to top and from top to bottom.

            var terrsArr = [];

            if (Math.random() > 0.5) {
                // From the top to the bottom of the map
                terrsArr = _.chain(this.models)
                            .filter(function(selected) { return selected.get('side') === s && selected.get('isBorder') && selected.get('remainingTurns') > 0 })
                            .value();
            } else {
                // From bottom to the top of the map
                terrsArr = _.chain(this.models)
                            .filter(function(selected) { return selected.get('side') === s && selected.get('isBorder') && selected.get('remainingTurns') > 0 })
                            .reverse()
                            .value();
            }

            return terrsArr;
        }

    },
    returnTerrsInRange: function(s) {
        var terrsArr = _.chain(this.models)
                            .filter(function(selected) { return selected.get('side') === s && selected.get('inRange') })
                            .sortBy(function(model){ return model.get('morale') })
                            .sortBy(function(model){ return model.get('armyPopulation') })
                            .value();

        return terrsArr;
    },
    hasTwoCapitals: function(s) {
        var hasTwoCapitalsArr = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === s && model.get('isCapital') })
                        .value();

        return hasTwoCapitalsArr.length > 1;
    },
    updateAllBorders: function() {
        _.each(this.models, function(model) {
            var borderObj = App.Collections.terrCollection.returnBorders(model);
            model.set({
                borderRight: borderObj.rightB,
                borderLeft: borderObj.leftB,
                borderTop: borderObj.topB,
                borderBottom: borderObj.bottomB,
                isBorder: borderObj.hasBorder
            });
        });
    },
    returnBorders: function(m) {
        var row = m.get('row');
        var column = m.get('column');

        var rightNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row && model.get('column') === column + 1 && model.get('side') != m.get('side') })
                            .value()[0];

        var leftNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row && model.get('column') === column - 1 && model.get('side') != m.get('side') })
                            .value()[0];

        var topNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row - 1 && model.get('column') === column && model.get('side') != m.get('side')  })
                            .value()[0];

        var topRightNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row - 1 && model.get('column') === column + 1 && model.get('side') != m.get('side')  })
                            .value()[0];

        var topLeftNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row - 1 && model.get('column') === column - 1 && model.get('side') != m.get('side')  })
                            .value()[0];

        var bottomNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row + 1 && model.get('column') === column && model.get('side') != m.get('side') })
                            .value()[0];

        var bottomRightNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row + 1 && model.get('column') === column + 1 && model.get('side') != m.get('side') })
                            .value()[0];

        var bottomLeftNeighbor = _.chain(this.models)
                            .filter(function(model) { return model.get('row') === row + 1 && model.get('column') === column - 1 && model.get('side') != m.get('side') })
                            .value()[0];

        var rightBorder = rightNeighbor ? true : false,
            leftBorder = leftNeighbor ? true : false,
            topBorder = topNeighbor ? true : false,
            bottomBorder = bottomNeighbor ? true : false,
            topRightBorder = topRightNeighbor ? true : false,
            topLeftBorder = topLeftNeighbor ? true : false,
            bottomRightBorder = bottomRightNeighbor ? true : false,
            bottomLeftBorder = bottomLeftNeighbor ? true : false,
            otherBorders = topRightBorder || topLeftBorder || bottomRightBorder || bottomLeftBorder;

        var borderObj = {
            topB: topBorder,
            rightB: rightBorder,
            bottomB: bottomBorder,
            leftB: leftBorder,
            hasBorder: (rightBorder || leftBorder || topBorder || bottomBorder || otherBorders)
        }

        return borderObj;

    },
    returnPolicyCost: function(policy, infFlag, ftFlag) {

        var totPolicyCost = 0,
            costFunction = {},
            type = '',
            recruits = 0,
            infraFlag = infFlag ? infFlag : false,
            fortFlag = ftFlag ? ftFlag : false;

        switch(policy.id) {
            case 'repair_infra':
                costFunction = App.Utilities.returnTerrInfraCost;
                type = 'econStrength';
                break;
            case 'repair_forts':
                costFunction = App.Utilities.returnTerrFortCost;
                type = 'fortStrength';
                break;
            case 'upgrade_tech':
                costFunction = App.Utilities.returnTechUpgradeCost;
                type = 'econStrength';
                break;
            case 'upgrade_forts':
                costFunction = App.Utilities.returnFortLevelCost;
                type = 'fortStrength';
                break;
            case 'recruit_army':
                costFunction = App.Utilities.returnRecruitCost;
                recruits = policy.amount;
                break;
            default:
                return false;
        }

        //Receives the side to filter the models, then adds the values returned from the utility function together and returns the results

        // If it's infrastructure or fort strength that needs repairing, use a total function that checks the side and damage before adding up the cost
        if(policy.id === 'repair_infra' || policy.id === 'repair_forts') {

            totPolicyCost = _.chain(this.models)
                            .filter(function(model) { return model.get('side') === policy.side && model.get(type) != 100})
                            .reduce(function(memo, model){ return memo + costFunction(model); }, 0)
                            .value();

        } else if ((!infraFlag && policy.id === 'upgrade_tech') || (!fortFlag && policy.id === 'upgrade_forts')) {

            totPolicyCost = _.chain(this.models)
                            .filter(function(model) { return model.get('side') === policy.side && model.get(type) === 100})
                            .reduce(function(memo, model){ return memo + costFunction(model); }, 0)
                            .value();

        } else if (infraFlag && policy.id === 'upgrade_tech' || fortFlag && policy.id === 'upgrade_forts') {

            totPolicyCost = _.chain(this.models)
                            .filter(function(model) { return model.get('side') === policy.side})
                            .reduce(function(memo, model){ return memo + costFunction(model); }, 0)
                            .value();

        } else if (policy.id === 'recruit_army') {

            totPolicyCost = _.chain(this.models)
                            .filter(function(model) { return model.get('side') === policy.side && recruits < (model.get('econPopulation') / 2)})
                            .reduce(function(memo, model){ return memo + costFunction(recruits); }, 0)
                            .value();
        }

        return totPolicyCost;        

    },
    returnSelectedView: function(cid) {
        var view = _.chain(App.Views.allViews)
            .filter(function(selected) { return selected.model.cid === cid })
            .value();
 
            return view[0];

    },
    returnSideTotal: function(s, property) {
        // Receives the side to filter the models, then adds the values from the model at "property" together and returns the results
        var total = _.chain(this.models)
                        .filter(function(model) { return model.get('side') === s })
                        .reduce(function(memo, model){ return memo + model.get(property); }, 0)
                        .value();

        return total;
    },
    returnSortedByArmyPopulation: function(s) {
        var rightTerrsArr = _.chain(this.models)
                            .filter(function(selected) { return selected.get('side') === s })
                            .sortBy(function(model){ return model.get('armyPopulation') })
                            .filter(function(model) { return model.get('armyPopulation') < App.Constants.MIN_ARMY_FOR_MORALE })
                            .value();

        return rightTerrsArr;

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
    specialMap: function(name1, name2) {

        var empNamesTogether = App.Models.gameStartModel.get('aiMode') ? name1.toLowerCase() : name1.toLowerCase() + name2.toLowerCase(),
            terrNames = App.Utilities.territoryNames(empNamesTogether);

        _.each(this.models, function(model) {
            var terrLen = terrNames.length,
                thisTerrIndex = _.random(0, (terrLen - 1));

            model.set('name', terrNames[thisTerrIndex]);
            
            terrNames.splice(thisTerrIndex, 1);
        
        });

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
                App.Models.nationStats.get(s).set('policyCosts', policyCosts);
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
                App.Models.nationStats.get(s).set('policyCosts', policyCosts);
            }

        });
    }
});