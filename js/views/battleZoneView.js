 /*
 	[accuwar]: Turn-based Strategy Game
	Battle Zone View
*/ 

App.Views.BattleZone = Backbone.View.extend({
	template: App.Utilities.template('battleBox'),
	initialize: function() {
		if(App.Utilities.smallScreenOnly()) {
			this.model.set('tipsMode', false);
		}
		this.render();
	},
	className: function() {
		if(App.Utilities.isMobile()) {
			return 'mobile';
		} else {
			return '';
		}
	},
	addMap: function() {
		var classes = ['texture-0', 'texture-1', 'texture-2', 'texture-3', 'texture-4'],
			 // map = App.Models.battleMapModel.get('mapMode') === 'worldwar' ? 'world-war' : classes[_.random(0, (classes.length - 1))];
			 map = App.Models.battleMapModel.get('randomMap') ? classes[_.random(0, (classes.length - 1))] : 'world-war';

		return map;

	},// Add classes to the container when initialized
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.addClass(this.className() + ' ' + this.addMap());
		return this;
	},
	deselect: function() {
		// Remove selected and selectedSection classes from the DOM (end action experience -> Deselected targets, battle zone, and selected element)
		var removeClasses = ['selected', 'selectedSection', 'pulse', 'shake'];
		App.Utilities.removeClassName(removeClasses);
		App.Collections.terrCollection.removeAttackRange(App.Models.selectedTerrModel);
		App.Collections.terrCollection.removeRecruitTarget();
		this.model.set('selectedMode', false);
		if(typeof App.Models.clickedTerrModel.cid != "undefined") {
			App.Models.clickedTerrModel.set('selected', false);
		}
		App.Models.selectedTerrModel = {};
		App.Views.selectedTerrView = {};
		App.Models.clickedTerrModel = {};
		App.Views.clickedTerrView = {};
		if(typeof App.Views.selectedFooterView.cid != "undefined") {
			App.Views.selectedFooterView.closeView();
		}

		var hasTurns = App.Collections.terrCollection.returnAnyTurnsLeft();

		if(!hasTurns) {
			App.Views.nationStatsView.closeMenu();		
			App.Views.nationStatsView.confirmNewTurn(false);
		}

		App.Models.nationStats.get('left').set({
			'terrs': App.Collections.terrCollection.getSideTerritories('left'),
			'terrsWithTurns': App.Collections.terrCollection.getSideTerritoriesWithTurns('left')
		});

		App.Models.nationStats.get('right').set({
			'terrs': App.Collections.terrCollection.getSideTerritories('right'),
			'terrsWithTurns': App.Collections.terrCollection.getSideTerritoriesWithTurns('right')
		});

		$('body').removeClass('terrSelected');

	},
	battle: function(attacking, defending) {

		App.Utilities.console('\n\n===================================ATTACK===================================');
		App.Utilities.console(attacking.get('name') + ' (' + attacking.get('armyPopulation') + ' units) attacks ' + defending.get('name') + ' (' + defending.get('armyPopulation') + ' units)!');

		// Fort Strength can give up to 50% strength bonus to a defending army depending on fort level
		var fortLevel = defending.get('fortLevel'),
			defenderFortBonus = 1 + ((fortLevel * defending.get('fortStrength')) / 100) / 10,
			defenderCapitalBonus;

		var attackXP = attacking.get('armyRank') > 1 ?  attacking.get('armyXP') + (attacking.get('armyRank') * 100) : Math.max(attacking.get('armyXP'), 1),
			defendXP = defending.get('armyRank') > 1 ? defending.get('armyXP') + (defending.get('armyRank') * 100) : Math.max(defending.get('armyXP'), 1);

		defenderCapitalBonus = defending.get('isCapital') ? 2.5 : 1; // Capital territory has a 25% defensive strength bonus

		// Computed attacker and defender strengths currently based on morale, population, and rank/XP
		var attackArmyTechBonus = 1 + (0.25 * App.Models.nationStats.get(attacking.get('side')).get('armyTechLvl'));
		var defendArmyTechBonus = 1 + (0.25 * App.Models.nationStats.get(defending.get('side')).get('armyTechLvl'));

		var attackerStrength = Math.round(attacking.get('armyPopulation') * attacking.get('morale') * (1 + (attackXP/100)) * attackArmyTechBonus / 100);
		var defenderStrength = Math.max(Math.round(defending.get('armyPopulation') * defending.get('morale') * (1 + (defendXP/100)) * defenderFortBonus * defendArmyTechBonus *  defenderCapitalBonus / 100), 1);

		// Generate attacker and defender odds
		var attackerOdds = attackerStrength / (attackerStrength + defenderStrength);
		var overwhelmingAttack = attackerOdds > 0.9;
		var defenderOdds = overwhelmingAttack ? Math.max(Math.random() - 0.1, 0) : Math.random(); // Overwhelming attack adds 10% chance of victory for attacker

		// Setting casualty rate variables
		var defCasRate = overwhelmingAttack ? Math.max(Math.random(), 0.20) : Math.random(), // Defender loses at least 20% of units during overwhelming attack
			attCasRate = Math.random(),
			fortDamage = Math.random();

		if(defenderOdds > attackerOdds) {
			// Defender Wins

			if(overwhelmingAttack) {
				// Defender Victory
				// Overwhelming Attack Bonus - Attacker losses greatly limited during a battle loss
				var defendingCasualties = defending.get('armyPopulation') * defCasRate;

				var attackingMaxLoss = 0;
				if(defending.get('morale') > 50) {
					attackingMaxLoss = defendingCasualties * 10;	
				} else {
					attackingMaxLoss = defendingCasualties * 5;
				}

				// Minimum fort damage of 25%, maximum of 50%
				while(fortDamage > 0.5 || fortDamage < 0.25) {
					fortDamage = Math.random();
				}
				
				var attackingMaxCasRate = attackingMaxLoss / attacking.get('armyPopulation');
				while(attCasRate > attackingMaxCasRate) {
					attCasRate = Math.random();
				}

			} else {
				// Defender Victory
				// No Overwhelming Attack Bonus - Currently unlimited attacker losses

				// Compute estimated attacker losses
				var attackLossesEst = attacking.get('armyPopulation') * attCasRate;
				var defLossRatioMax = attackLossesEst / defending.get('armyPopulation');

				// Maximum fort damage of 25%
				while(fortDamage > 0.25) {
					fortDamage = Math.random();
				}

				while(defCasRate > defLossRatioMax) {
					defCasRate = Math.random();
				}

			}

			this.updatePopulations(attacking, defending, defCasRate, attCasRate, fortDamage);

		} else {
			// Attacker wins

			if(overwhelmingAttack) {
				// Attacker Victory
				// Overwhelming Attack Bonus - Attacker losses greatly limited and total defeat odds greatly increased

				var lastStandDefPop = defending.get('armyPopulation'),
					lastStandAttPop = attacking.get('armyPopulation');

				// Last Stand Attacker Maximum Losses & maximum loss ratio
				var lastStandAttLossesMax = attacking.get('morale') > 80 ? lastStandDefPop * 4 : lastStandDefPop * 10;
				var attLossMaxRatio = lastStandAttLossesMax / lastStandAttPop;

				// Regenerate a random attacker casualty rate until it is less than the maximum ratio of attacker losses
				while(attCasRate > attLossMaxRatio) {
					attCasRate = Math.random();
				}

				// Minimum fort damage of 50% due to overwhelming attack
				while(fortDamage < 0.5) {
					fortDamage = Math.random();
				}

				var minDefLossRatio,
					lastStandAttLosses;

				//If the attacking army is 4 times the size of the defending army, they invade for certain
				if(lastStandAttPop / lastStandDefPop > 4) {
					defCasRate = 1;
				} else {

					// Compute estimated attacker losses
					lastStandAttLosses = attCasRate * lastStandAttPop;
					minDefLossRatio = Math.min(lastStandAttLosses / lastStandDefPop, 1);
					while(defCasRate < minDefLossRatio && minDefLossRatio !== 1) {
						defCasRate = Math.random();
					}

				}

				// Defender must lose at least as many units as the attacker (they lost to an overwhelming army after all)
				// If the defender's computed casualties are more than required minimum amount, set the number of losses equal to the population
				var defLosses = defCasRate * lastStandDefPop < lastStandAttLosses ? lastStandDefPop : defCasRate * lastStandDefPop;
				defCasRate = defLosses == lastStandDefPop ? 1 : defCasRate; // If the defender's computed losses and population are equal, set the casualty rate to 1, otherwise unchanged

			} else {
				// Attacker victory
				// No overwhelming attack bonusses

				var estDefLosses = defending.get('armyPopulation') * defCasRate;
				var maxAttLossRatio = estDefLosses / attacking.get('armyPopulation');

				while(attCasRate > maxAttLossRatio) {
					attCasRate = Math.random();
				}

				// Maximum fort damage of 50%, minimum of 35%
				while(fortDamage > 0.5 || fortDamage < 0.35) {
					fortDamage = Math.random();
				}

				// Compute estimated attacker losses
				var lastStandAttLosses = attCasRate * attacking.get('armyPopulation');

				// If estimate of attacker losses is greater than defender population, set defender casualty rate to 1
				if(lastStandAttLosses >= defending.get('armyPopulation')) {
					defCasRate = 1;
				}

			}

			this.updatePopulations(attacking, defending, defCasRate, attCasRate, fortDamage);

		}

	},
	updatePopulations: function(attacking, defending, defCasRate, attCasRate, fortDamage) {
			
		// Defense Army Variables
		var oldDefPop = defending.get('armyPopulation'),
			defCasualties = Math.round(oldDefPop * defCasRate),
			newDefPop = Math.max(oldDefPop - defCasualties, 0),
			oldDefFortStr = defending.get('fortStrength'),
			oldDefFortLvl = defending.get('fortLevel'),
			newDefFortStr = Math.max(Math.round(oldDefFortStr - (fortDamage * oldDefFortStr)), 1), //Minimum fort strength of 1
			newDefArmyRank,
			defSide = defending.get('side');

		// Attacking Army Variables
		var oldAttPop = attacking.get('armyPopulation'),
			attCasualties = Math.round(oldAttPop * attCasRate),
			newAttPop = Math.max(oldAttPop - attCasualties, 0),
			oldAttXP = attacking.get('armyXP'),
			oldDefXP = defending.get('armyXP'),
			newAttXP,
			newDefXP,
			newAttArmyRank;

		// Morale Variables
		var defMorale = Math.min(Math.round(defending.get('morale') * (newDefPop/oldDefPop) * (oldAttPop/newAttPop) * (attCasualties/defCasualties)), 100),
			oldDefMorale = defending.get('morale');
		var attMorale = Math.min(Math.round(attacking.get('morale') * (newAttPop/oldAttPop) * (oldDefPop/newDefPop) * (defCasualties/attCasualties)), 100),
			oldAttMorale = attacking.get('morale');

		// Defending armies left with 4,000 units or less with shattered morale  will surrender, disband, or die
		var moraleVictory = defMorale <= 10 && newDefPop > 0 && newDefPop < (2 * App.Constants.ATTACK_ARMY_MINIMUM) && newAttPop * (attacking.get('econStrength') / 100) > App.Constants.ATTACK_INVADE_ARMY_MINIMUM,
			popVictory = newAttPop * (attacking.get('econStrength') / 100) > App.Constants.ATTACK_INVADE_ARMY_MINIMUM && newDefPop < (2 * App.Constants.ATTACK_ARMY_MINIMUM),
			defCasRate = defCasRate != 1 && (moraleVictory || popVictory) ? 1 : defCasRate,
			newDefPop = defCasRate === 1 && (moraleVictory || popVictory) ? 0 : newDefPop,
			invasion = defCasRate === 1 && (newAttPop * (attacking.get('econStrength') / 100) > App.Constants.ATTACK_INVADE_ARMY_MINIMUM),
			stopInvasion = defCasRate === 1 && !invasion,
			invasion = stopInvasion ? false : invasion,
			defCasRate = stopInvasion ? (1 - Math.round(Math.random() * 2000) / defending.get('armyPopulation')) : defCasRate,  
			newDefPop = stopInvasion ? Math.max(Math.round(oldDefPop * (1 - defCasRate)), 0) : newDefPop,
			defWinner = attCasRate > defCasRate,
			winBattleXP = defWinner ? Math.round((attCasRate - defCasRate) * 200 / 10) : Math.round((defCasRate - attCasRate) * 200 / 10),
			loseBattleXP = Math.round(winBattleXP / 2),
			defRankUp = false,
			attRankUp = false,
			newAttWins = !defWinner ? 1 + App.Models.selectedTerrModel.get('armyWins') : App.Models.selectedTerrModel.get('armyWins'),
			newDefWins = defWinner ? 1 + App.Models.clickedTerrModel.get('armyWins') : App.Models.clickedTerrModel.get('armyWins');
			newAttLosses = defWinner ? 1 + App.Models.selectedTerrModel.get('armyLosses') : App.Models.selectedTerrModel.get('armyLosses'),
			newDefLosses = !defWinner ? 1 + App.Models.clickedTerrModel.get('armyLosses') : App.Models.selectedTerrModel.get('armyLosses');

		// Morale, XP, and Rank updates based on battle outcome
		if(defWinner) {
			//Defense wins

			newDefXP = Math.min(oldDefXP + App.Constants.XP_PER_BATTLE + winBattleXP, 100);
			newAttXP = Math.min(oldAttXP + App.Constants.XP_PER_BATTLE + loseBattleXP, 100);
			newAttArmyRank = Math.min(App.Utilities.newRank(newAttXP, attacking), App.Constants.MAX_RANK);
			newDefArmyRank = Math.min(App.Utilities.newRank(newDefXP, defending), App.Constants.MAX_RANK);
			defRankUp = newDefArmyRank > defending.get('armyRank');
			attRankUp = newAttArmyRank > attacking.get('armyRank');

			if(newDefArmyRank === App.Constants.MAX_RANK) {
				newDefXP = newDefXP === 100 ? newDefXP : oldDefXP + App.Constants.XP_PER_BATTLE + winBattleXP;
			} else {
				newDefXP = newDefXP === 100 ? oldDefXP + App.Constants.XP_PER_BATTLE + winBattleXP - 100 : newDefXP;
			}

			if(newAttArmyRank === App.Constants.MAX_RANK) {
				newAttXP = newAttXP === 100 ? newAttXP : oldAttXP + App.Constants.XP_PER_BATTLE + loseBattleXP;
			} else {
				newAttXP = newAttXP === 100 ? oldAttXP + App.Constants.XP_PER_BATTLE + loseBattleXP - 100 : newAttXP;
			}

			newAttXP = newAttXP === 100 ? oldAttXP + App.Constants.XP_PER_BATTLE + loseBattleXP - 100 : newAttXP;

			defMorale = Math.min((defMorale + 3), 100);

		} else if(invasion) {
			//Attacker wins - Invasion

			newDefWins = newAttWins;
			newDefLosses = newAttLosses;
			newAttXP = Math.min(oldAttXP + App.Constants.XP_PER_BATTLE + winBattleXP, 100);
			newAttArmyRank = Math.min(App.Utilities.newRank(newAttXP, attacking), App.Constants.MAX_RANK);

			//Invaded set the defensive territory rank variable equal to attacking territory rank value
			newDefArmyRank = newAttArmyRank;
			attRankUp = newDefArmyRank > attacking.get('armyRank');

			if(newAttArmyRank === App.Constants.MAX_RANK) {
				newDefXP = newAttXP = newAttXP === 100 ? newAttXP : oldAttXP + App.Constants.XP_PER_BATTLE + winBattleXP;
			} else {
				newDefXP = newAttXP = newAttXP === 100 ? oldAttXP + App.Constants.XP_PER_BATTLE + winBattleXP - 100 : newAttXP;
			}

			attMorale = Math.min((attMorale + 5), 100);		

		} else {
			//Attacker wins
			newDefXP = Math.min(oldDefXP + App.Constants.XP_PER_BATTLE + loseBattleXP, 100);
			newAttXP = Math.min(oldAttXP + App.Constants.XP_PER_BATTLE + winBattleXP, 100);
			newAttArmyRank = Math.min(App.Utilities.newRank(newAttXP, attacking), App.Constants.MAX_RANK);
			newDefArmyRank = Math.min(App.Utilities.newRank(newDefXP, defending), App.Constants.MAX_RANK);
			defRankUp = newDefArmyRank > defending.get('armyRank');
			attRankUp = newAttArmyRank > attacking.get('armyRank');

			if(newAttArmyRank === App.Constants.MAX_RANK) {
				newDefXP = newDefXP === 100 ? newDefXP : oldDefXP + App.Constants.XP_PER_BATTLE + loseBattleXP;
			} else {
				newDefXP = newDefXP === 100 ? oldDefXP + App.Constants.XP_PER_BATTLE + loseBattleXP - 100 : newDefXP;
			}

			if(newAttArmyRank === App.Constants.MAX_RANK) {
				newAttXP = newAttXP === 100 ? newAttXP : oldAttXP + App.Constants.XP_PER_BATTLE + winBattleXP;
			} else {
				newAttXP = newAttXP === 100 ? oldAttXP + App.Constants.XP_PER_BATTLE + winBattleXP - 100 : newAttXP;
			}

			attMorale = Math.min((attMorale + 3), 100);

		}

		// Battle impact on territories

		//Update Attacking Civilian Morale & GDP based on battle result
		var oldAttEconMorale = attacking.get('econMorale'),
			newAttEconMorale = App.Utilities.updateEconMorale({
			oldTerrArmyPop : oldAttPop,
			selectedArmyPop: newAttPop,
			oldEconPop: attacking.get('prvEconPopulation'),
			newMorale: oldAttEconMorale
		}),
			newAttEconStr = attacking.get('econStrength'),
			newAttEconPop = attacking.get('econPopulation'),
			newAttEconLvl = attacking.get('econLevel'),
			oldAttGDP = attacking.get('economicOutput'),
			updateAttGDP = App.Utilities.updateGDP({
				newMorale : newAttEconMorale,
				newEconStrength: newAttEconStr,
				newEconPopulation : newAttEconPop,
				newLevel : newAttEconLvl,
				ecGrowthRate: attacking.get('econGrowthPct')
			});

		//Update Defending Territory Economy
		var oldEconPop = defending.get('econPopulation'),
			newEconPop = oldEconPop,
			oldEconStr = defending.get('econStrength'),
			oldEconLvl = defending.get('econLevel'),
			newEconLvl = oldEconLvl,
			oldEconMorale = defending.get('econMorale'),
			oldDefGDP = defending.get('economicOutput'),
			defGDPGrowth = defending.get('econGrowthPct');

		// Update Defender Economic Population and Infrastructure Strength
		var newEconPopulation = App.Utilities.newEconPopCalc(oldEconPop, fortDamage, oldDefFortStr),
			newEconStrength = App.Utilities.newEconStrengthCalc(oldEconStr, fortDamage, oldDefFortStr);

		if(newEconStrength <= 0 && oldEconLvl > 1) {
			newEconStrength += 100;
			newEconLvl = oldEconLvl-1;
		} else if(newEconStrength < 0 && oldEconLvl == 1) {
			newEconStrength = 0;
		}

		// If attacking army was promoted, announce the alert
		if(attRankUp) {
			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-globe',
				titleTxt : "Army promoted at " + App.Models.selectedTerrModel.get('name') + "!",
				msgType: "success"
			});
		}

		var fortDestroyed = false,
			startFortLevel = oldDefFortLvl;
		//If fort strength falls below 5, destroy the fort's tech level so it will have to be rebuilt
		if(newDefFortStr <= 5 && oldDefFortLvl > 1) {
			oldDefFortLvl = 1;
			newDefFortStr = 1;
			fortDestroyed = true;

			var oldFortsLostArr = App.Models.nationStats.get(defSide).get('fortsLost'),
				newFortsLostArr = oldFortsLostArr.slice();
			
			newFortsLostArr.push(defending.get('name'));

			App.Models.nationStats.get(defSide).set('fortsLost', newFortsLostArr);

			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-globe',
				titleTxt : "Fort destroyed at&nbsp;" + App.Models.clickedTerrModel.get('name') + "!",
				msgType: "success"
			});

		}

		// Defender Governor Casualty?
		// If more than 1% of the civilian population dies, the governor has a 10% chance of being among them
		
		var governorDead = false;
		if(!defending.get('isCapital') && !defending.get('governorKilled') &&  1 - (newEconPopulation / oldEconPop) > 0.01 && Math.random() < 0.1) {
			governorDead = true;
			defending.set('governorKilled', true);
		}

		// Defender Civilian morale
		var newEconMorale = App.Utilities.updateEconMorale({
			governorCasualty: governorDead,
			selectedArmyPop: newDefPop,
			selectedFortStrength: newDefFortStr,
			econLevel: newEconLvl,
			econStrength : newEconStrength,
			econPopulation: newEconPopulation,
			newMorale : oldEconMorale,
			oldTerrArmyPop: oldDefPop,
			selectedFortLevel: oldDefFortLvl
		});

		//Defender GDP
		var updateDefGDP = App.Utilities.updateGDP({
			newLevel : newEconLvl,
			newEconPopulation : newEconPopulation,
			newEconStrength : newEconStrength,
			newMorale : newEconMorale,
			ecGrowthRate: defGDPGrowth
		});

		// Set the casualties
		var attArmyCasualties = attacking.get('armyCasualties') + (oldAttPop - newAttPop),
			defArmyCasualties = defending.get('armyCasualties') + (oldDefPop - newDefPop),
			defEconCasualties = defending.get('econCasualties') + (oldEconPop - newEconPopulation);

		// End of battle impact to territory economics

		// Battle Is Over - Set the new territory values
		attacking.set({
			'morale' : attMorale,
			'armyCasualties' : attArmyCasualties,
			'armyPopulation' : newAttPop,
			'prvPopulation' : oldAttPop,
			'armyXP' : newAttXP,
			'armyRank' : newAttArmyRank,
			'economicOutput': updateAttGDP,
			'econMorale' : newAttEconMorale,
			'armyWins': newAttWins,
			'armyLosses' : newAttLosses
		});

		defending.set({
			'morale' : defMorale,
			'armyCasualties' : defArmyCasualties,
			'fortStrength' : newDefFortStr,
			'fortLevel': oldDefFortLvl,
			'armyPopulation' : newDefPop,
			'prvPopulation' : oldDefPop,
			'armyXP' : newDefXP,
			'armyRank' : newDefArmyRank,
			'econCasualties': defEconCasualties,
			'econPopulation' : newEconPopulation,
			'prvEconPopulation': newEconPopulation,
			'econLevel' : newEconLvl,
			'econStrength' : newEconStrength,
			'economicOutput' : updateDefGDP,
			'econMorale' : newEconMorale,
			'armyWins': newDefWins,
			'armyLosses' : newDefLosses
		});

		if(invasion) {
			// Attacking Army Invades

			// Update global morale
			App.Collections.terrCollection.battleImpact(attacking, true);

			// Update nation stats models

			var attackingSide = attacking.get('side'),
				defendingSide = defending.get('side');

			var newDefNtlInvArmyCas = App.Models.nationStats.get(defendingSide).get('invasionArmyCasualties') + defArmyCasualties,
				newDefNtlInvEconCas = App.Models.nationStats.get(defendingSide).get('invasionEconCasualties') + defEconCasualties,
				newAttWins = App.Models.nationStats.get(attackingSide).get('battleWins') + 1,
				newDefLosses = App.Models.nationStats.get(defendingSide).get('battleLosses') + 1,
				newAttInvadedArr = App.Models.nationStats.get(attackingSide).get('invadedThisTurn').slice();

			newAttInvadedArr.push(defending.get('name'));
			
			var newDefLost = App.Models.nationStats.get(defendingSide).get('terrLostThisTurn').slice();
			newDefLost.push(defending.get('name'));

			App.Models.nationStats.get(attackingSide).set({
				'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal(attackingSide, 'armyPopulation'),
				'battleWins' : newAttWins,
				'invadedThisTurn' : newAttInvadedArr,
				'econPopulationNow' : App.Collections.terrCollection.returnSideTotal(attackingSide, 'armyPopulation'),
				'overallBattleWins': App.Models.nationStats.get(attackingSide).get('overallBattleWins') + 1
			});

			App.Models.nationStats.get(defendingSide).set({
				'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal(defendingSide, 'armyPopulation'),
				'battleLosses' : newDefLosses,
				'terrLostThisTurn' : newDefLost,
				'invasionEconCasualties' : newDefNtlInvEconCas,
				'invasionArmyCasualties' : newDefNtlInvArmyCas,
				'overallBattleLosses': App.Models.nationStats.get(defendingSide).get('overallBattleLosses') + 1
			});

			// Update console
			this.updateMessage(attacking, defending);

			var msg;
			var gameOver = false;
			var nationName = App.Models.nationStats.get(attacking.get('side')).get('empName');
			var loseNationName = App.Models.nationStats.get(defending.get('side')).get('empName');
			var enemyLeaderMsg;
			
			if(defending.get('isCapital')){

				if (App.Models.battleMapModel.get('audio')) {
				    $('#ambientMusic').unbind();

					App.Utilities.playVictoryTrack();

				    $('#ambientMusic').bind('ended', App.Utilities.playVictoryTrack);

				}

				var killEnemyLeader = Math.random() > 0.5;
				
				enemyLeaderMsg = killEnemyLeader ? 'The notorious leader of '+ loseNationName +' refused to surrender and was killed in battle. All remaining enemy forces quickly surrendered in the&nbsp;aftermath.' : 'The notorious leader of '+ loseNationName +' was captured attempting to escape the capital and has ordered the unconditional surrender of all enemy&nbsp;forces.';
				
				// If the capital has been invaded, automatically move units and skip renaming

				var attackingStartPop = attacking.get('armyPopulation');
				var transferringUnits = (attackingStartPop - App.Constants.ATTACK_ARMY_MINIMUM);

				defending.set({
					'morale': 100,
					'armyPopulation' : transferringUnits,
					'selected' : false,
					'side' : attackingSide,
					'armyXP' : newAttXP,
					'armyRank' : newAttArmyRank,
					'econCasualties': 0,
					'armyCasualties' : 0
				});

				attacking.set({
					'morale' : 100,
					'armyPopulation' : (attackingStartPop - transferringUnits),
					'armyXP' : newAttXP,
					'armyRank' : newAttArmyRank
				});

				App.Collections.terrCollection.nextTreasury();

				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-globe",
					titleTxt : "Game Over" ,
					msgTxt : nationName + " defeats&nbsp;" + loseNationName + "!",
					msgType : 'success'
				});

				//Delay the alert so last territory will render first (remove when we go to another approach)
				setTimeout(function() {

					var timeText = '';
					if(App.Models.nationStats.get('currentTurn') - App.Constants.START_TURN === 1) {
						timeText = ' 1 year ';
					} else if (App.Models.nationStats.get('currentTurn') - App.Constants.START_TURN === 0) {
						timeText = ' months ';
					} else if (App.Models.nationStats.get('currentTurn') - App.Constants.START_TURN > 1) {
						timeText = App.Models.nationStats.get('currentTurn') - App.Constants.START_TURN + ' years ';
					}

					var locationText = '';
					if(App.Models.battleMapModel.get('mapMode').indexOf('college') != -1) {
						locationText = ' the ' + defending.get('name') + ' campus';
					} else if(App.Models.battleMapModel.get('mapMode').indexOf('wallstreet') != -1) {
						locationText = ' the trading floor of ' + defending.get('name');
					} else {
						locationText = ' the streets of '+ defending.get('name');
					}

					var resultText = '';
					if(App.Models.battleMapModel.get('mapMode').indexOf('college') != -1) {
						resultText = ' secured the future for your athletic&nbsp;association';
					} else if(App.Models.battleMapModel.get('mapMode').indexOf('wallstreet') != -1) {
						resultText = ' driven your competition from the&nbsp;marketplace';
					} else if (App.Models.battleMapModel.get('mapMode').indexOf('civilwar') != -1) {
						resultText = ' secured the future for your great&nbsp;nation';
					} else {
						resultText = ' secured the future for your glorious&nbsp;empire';
					}

					var titleText = nationName + ' Victory!',
						messageHTML = '<p>Your forces march through ' + locationText + '! After ' + timeText + ' of bloodshed and countless lives lost, the ' + attacking.get('color') + ' flag has been raised over the ' + loseNationName + '&nbsp;capital!</p>' 
						+'<p>' + enemyLeaderMsg + '</p>'
				 		+'<p>Your triumph has brought glory to the people of ' + nationName + ' and ' + resultText + '.</p>';

					var confModalModel = new App.Models.Modal({
						title: nationName + ' Victory!',
						confBtnId: 'confEnd',
						modalMsg: messageHTML,
						confBtnClass: 'btn-danger',
						showCancelBtn: false
					});

					var confModalView = new App.Views.ConfModal({model: confModalModel});

					$('#oneModal').on('hidden.bs.modal', function(e) {
						$('#oneModal').off();
						App.Views.battleMap.deselect();
						App.Models.nationStats.set('sideTurn', 'left');
						App.Views.nationStatsView.restartGame(false);
					});

				}, 600);

			} else {

				// Conquer territory (not the capital)
				newObj = {
					invaded: {
						newEconStrength: newEconStrength,
						newEconPopulation: newEconPopulation,
						newEconLvl: newEconLvl,
						oldDefFortLvl: oldDefFortLvl,
						newDefFortStr: newDefFortStr,
						newEconMorale: newEconMorale,
						newDefPop: newDefPop
					},
					attacking: {
						newAttXP: newAttXP,
						newAttPop: newAttPop,
						newAttArmyRank: newAttArmyRank
					}
				};

				if(App.Utilities.activeSide() === 'left') {
					var indexOfInvadedTerr = _.indexOf(App.Views.rightViews, App.Views.clickedTerrView);
					App.Views.leftViews.push(App.Views.rightViews[indexOfInvadedTerr]);
					App.Views.rightViews = _.without(App.Views.rightViews, App.Views.rightViews[indexOfInvadedTerr]);
				} else {
					var indexOfInvadedTerr = _.indexOf(App.Views.leftViews, App.Views.clickedTerrView);
					App.Views.rightViews.push(App.Views.leftViews[indexOfInvadedTerr]);
					App.Views.leftViews = _.without(App.Views.leftViews, App.Views.leftViews[indexOfInvadedTerr]);
				}

				App.Utilities.console("Invasion complete:");
				App.Utilities.console("App.Views.leftViews:");
				App.Utilities.console(App.Views.leftViews);
				App.Utilities.console("App.Views.rightViews:");
				App.Utilities.console(App.Views.rightViews);

				App.Views.battleMap.battleResultWindow({
					attackerWins: true,
					attackerCivilianMoraleImpact: newAttEconMorale - oldAttEconMorale,
					attackerGDPImpact: updateAttGDP - oldAttGDP,
					attackerRankUp: attRankUp,
					defenderFortDamage: oldDefFortStr - newDefFortStr,
					defenderStartFortLevel : startFortLevel,
					defenderFortDestroyed: fortDestroyed,
					defenderInfrastructureDamage: oldEconStr - newEconStrength,
					defenderCivilianCasualties: oldEconPop - newEconPopulation,
					defenderCivilianMoraleImpact: oldEconMorale - newEconMorale,
					defenderGDPImpact: oldDefGDP - updateDefGDP,
					defenderRankUp: defRankUp,
					oldAttMorale: oldAttMorale,
					oldDefMorale: oldDefMorale,
					invasion: true,
					loser: defending,
					loserCas: oldDefPop - newDefPop,
					loserGainedXP: newDefXP - oldDefXP,
					loserMoraleImpact: defMorale - oldDefMorale,
					winner: attacking,
					winnerCas: oldAttPop - newAttPop,
					winnerGainedXP: newAttXP - oldAttXP,
					winnerMoraleImpact: attMorale - oldAttMorale,
					newObj : newObj
				});

			}

		} else if(!defWinner) {
			App.Collections.terrCollection.battleImpact(attacking, false);
			this.updateMessage(attacking, defending);

			var attSide = attacking.get('side'),
				defSide = defending.get('side');
			
			App.Models.nationStats.get(attSide).set({
				'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal(attSide, 'armyPopulation'),
				'battleWins': (App.Models.nationStats.get(attSide).get('battleWins') + 1),
				'overallBattleWins': App.Models.nationStats.get(attSide).get('overallBattleWins') + 1
			});

			App.Models.nationStats.get(defSide).set({
				'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal(defSide, 'armyPopulation'),
				'battleLosses': (App.Models.nationStats.get(defSide).get('battleLosses') + 1),
				'econPopulationNow': App.Collections.terrCollection.returnSideTotal(defSide, 'econPopulation'),
				'overallBattleLosses': App.Models.nationStats.get(defSide).get('overallBattleLosses') + 1
			});

			App.Views.battleMap.battleResultWindow({
				attackerWins: true,
				attackerCivilianMoraleImpact: newAttEconMorale - oldAttEconMorale,
				attackerGDPImpact: updateAttGDP - oldAttGDP,
				attackerRankUp: attRankUp,
				defenderFortDamage: oldDefFortStr - newDefFortStr,
				defenderStartFortLevel : startFortLevel,
				defenderFortDestroyed: fortDestroyed,
				defenderInfrastructureDamage: oldEconStr - newEconStrength,
				defenderCivilianCasualties: oldEconPop - newEconPopulation,
				defenderCivilianMoraleImpact: oldEconMorale - newEconMorale,
				defenderGDPImpact: oldDefGDP - updateDefGDP,
				defenderRankUp: defRankUp,
				defGovCas: governorDead,
				oldAttMorale: oldAttMorale,
				oldDefMorale: oldDefMorale,
				invasion: false,
				loser: defending,
				loserCas: oldDefPop - newDefPop,
				loserGainedXP: newDefXP - oldDefXP,
				loserMoraleImpact: defMorale - oldDefMorale,
				winner: attacking,
				winnerCas: oldAttPop - newAttPop,
				winnerGainedXP: newAttXP - oldAttXP,
				winnerMoraleImpact: attMorale - oldAttMorale,
				battleNotification: App.Utilities.randomBattleOutcome({
						attCasRate: attCasRate,
						defCasRate: defCasRate,
						attArmyCas: oldAttPop - newAttPop,
						defArmyCas: oldDefPop - newDefPop,
						defCivCas: oldEconPop - newEconPopulation
					})
			});

			endBattle();

		} else {
			App.Collections.terrCollection.battleImpact(defending, false);
			this.updateMessage(defending, attacking);

			var attSide = attacking.get('side'),
				defSide = defending.get('side');
			
			App.Models.nationStats.get(attSide).set({
				'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal(attSide, 'armyPopulation'),
				'battleLosses': (App.Models.nationStats.get(attSide).get('battleLosses') + 1),
				'overallBattleLosses': App.Models.nationStats.get(attSide).get('overallBattleLosses') + 1
			});

			App.Models.nationStats.get(defSide).set({
				'armyPopulationNow' : App.Collections.terrCollection.returnSideTotal(defSide, 'armyPopulation'),
				'battleWins': (App.Models.nationStats.get(defSide).get('battleWins') + 1),
				'overallBattleWins': App.Models.nationStats.get(defSide).get('overallBattleWins') + 1,
				'econPopulationNow': App.Collections.terrCollection.returnSideTotal(defSide, 'econPopulation')
			});

			App.Views.battleMap.battleResultWindow({
				attackerWins: false,
				attackerCivilianMoraleImpact: newAttEconMorale - oldAttEconMorale,
				attackerGDPImpact: updateAttGDP - oldAttGDP,
				attackerRankUp: attRankUp,
				defenderFortDamage: oldDefFortStr - newDefFortStr,
				defenderStartFortLevel : startFortLevel,
				defenderFortDestroyed: fortDestroyed,
				defenderInfrastructureDamage: oldEconStr - newEconStrength,
				defenderCivilianCasualties: oldEconPop - newEconPopulation,
				defenderCivilianMoraleImpact: oldEconMorale - newEconMorale,
				defenderGDPImpact: oldDefGDP - updateDefGDP,
				defenderRankUp: defRankUp,
				defGovCas: governorDead,
				oldAttMorale: oldAttMorale,
				oldDefMorale: oldDefMorale,
				invasion: false,
				loser: attacking,
				loserCas: oldAttPop - newAttPop,
				loserGainedXP: newAttXP - oldAttXP,
				loserMoraleImpact: attMorale - oldAttMorale,
				winner: defending,
				winnerCas: oldDefPop - newDefPop,
				winnerGainedXP: newDefXP - oldDefXP,
				winnerMoraleImpact: defMorale - oldDefMorale,
				battleNotification: App.Utilities.randomBattleOutcome({
						attCasRate: attCasRate,
						defCasRate: defCasRate,
						attArmyCas: oldAttPop - newAttPop,
						defArmyCas: oldDefPop - newDefPop,
						defCivCas: oldEconPop - newEconPopulation
					})
			});
			endBattle();
		}

		function endBattle() {

			App.Models.nationStats.get('left').set({
				'armyCasualties' : App.Collections.terrCollection.getSideCasualties('left', 'army'),
				'econCasualties' : App.Collections.terrCollection.getSideCasualties('left', 'econ'),
				'repairAllInfrastructureCost': App.Collections.terrCollection.returnTotalCost('econStrength', 'left'),
				'repairAllFortCost': App.Collections.terrCollection.returnTotalCost('fortStrength', 'left')
			});

			App.Models.nationStats.get('right').set({
				'armyCasualties' : App.Collections.terrCollection.getSideCasualties('right', 'army'),
				'econCasualties' : App.Collections.terrCollection.getSideCasualties('right', 'econ'),
				'repairAllInfrastructureCost': App.Collections.terrCollection.returnTotalCost('econStrength', 'right'),
				'repairAllFortCost': App.Collections.terrCollection.returnTotalCost('fortStrength', 'right')
			});

			App.Models.selectedTerrModel.set({
				'remainingTurns' : App.Models.selectedTerrModel.get('remainingTurns') - 1,
				'selected': false
			});

		}

		App.Collections.terrCollection.nextTreasury();

	},
	smoothScroll: function(selector) {
		// Scroll to a certain element
		document.querySelector(selector).scrollIntoView({ 
		  behavior: 'smooth' 
		});
	},
	battleResultWindow: function(resultObj) {

		// need to lock this window in place like we do for the invasion confirmation window

		var btnID = resultObj.invasion ? 'invasionStep' : 'battleNot',
			btnClass = resultObj.invasion ? 'btn-primary' : 'btn-danger',
			noTurnsTxt =  resultObj.invasion ?  '' : 'Ends turn for ' + App.Models.selectedTerrModel.get('name') + '.',
			attacking = resultObj.attackerWins ? resultObj.winner : resultObj.loser,
			defending = resultObj.attackerWins ?  resultObj.loser : resultObj.winner,
			newObj = resultObj.invasion ? resultObj.newObj : '',
			titleText = resultObj.attackerWins ? App.Models.selectedTerrModel.get('name') + ' strikes ' + App.Models.clickedTerrModel.get('name') : App.Models.selectedTerrModel.get('name') + ' army retreats';
			titleText = resultObj.invasion ? App.Models.clickedTerrModel.get('name') + ' invaded' : titleText;

		var defenderGDPStart = defending.previous('economicOutput') + resultObj.defenderGDPImpact,
			defenderGDPEnd = defending.get('economicOutput'),
			widthGDPStart = widthStartValue(defenderGDPStart, defenderGDPEnd),
			widthGDPEnd = widthEndValue(defenderGDPStart, defenderGDPEnd),
			defenderEconPopStart = defending.get('econPopulation') + resultObj.defenderCivilianCasualties,
			defenderEconPopEnd = defending.get('econPopulation'),
			widthEconPopStart =  widthStartValue(defenderEconPopStart, defenderEconPopEnd),
			widthEconPopEnd = widthEndValue(defenderEconPopStart, defenderEconPopEnd),
			widthEconStrStart = defending.get('econStrength') + resultObj.defenderInfrastructureDamage,
			defenderEconStrStart = widthEconStrStart,
			widthEconStrEnd = defending.get('econStrength'),
			defenderEconStrEnd = widthEconStrEnd,
			widthEconMorStart = defending.previous('econMorale') + resultObj.defenderCivilianMoraleImpact,
			defenderEconMorStart = widthEconMorStart,
			widthEconMorEnd = defending.get('econMorale'),
			defenderEconMorEnd = widthEconMorEnd,
			defenderArmyPopStart = resultObj.attackerWins ? defending.get('armyPopulation') + resultObj.loserCas : defending.get('armyPopulation') + resultObj.winnerCas,
			defenderArmyPopEnd = defending.get('armyPopulation'),
			widthArmyPopStart = widthStartValue(defenderArmyPopStart, defenderArmyPopEnd),
			widthArmyPopEnd = widthEndValue(defenderArmyPopStart, defenderArmyPopEnd),
			widthArmyMorStart = resultObj.oldDefMorale,
			defenderArmyMorStart = widthArmyMorStart,
			widthArmyMorEnd = resultObj.invasion ? 0 : defending.get('morale'),
			defenderArmyMorEnd = widthArmyMorEnd,
			widthFortStrStart = defending.get('fortStrength') + resultObj.defenderFortDamage,
			defenderFortStrStart = widthFortStrStart,
			widthFortStrEnd = defending.get('fortStrength') <= 5 ? 0 : defending.get('fortStrength'),
			defenderFortStrEnd = widthFortStrEnd,
			widthArmyXPStart = resultObj.attackerWins ? defending.get('armyXP') - resultObj.loserGainedXP : defending.get('armyXP') - resultObj.winnerGainedXP,
			defenderArmyXPStart = widthArmyXPStart, 
			widthArmyXPEnd = resultObj.invasion ? 0 : defending.get('armyXP'),
			defenderArmyXPEnd = widthArmyXPEnd;

		var attackerGDPStart = attacking.previous('economicOutput') - resultObj.attackerGDPImpact, // Need a different value for invasion
			attackerGDPEnd = attacking.get('economicOutput'),
			widthAttGDPStart = widthStartValue(attackerGDPStart, attackerGDPEnd),
			widthAttGDPEnd = widthEndValue(attackerGDPStart, attackerGDPEnd),
			attackerEconPopStart = attacking.get('econPopulation'),
			attackerEconPopEnd = attackerEconPopStart,
			widthAttEconPopStart = 100,
			widthAttEconPopEnd = widthAttEconPopStart,
			widthAttEconMorStart = attacking.previous('econMorale') - resultObj.attackerCivilianMoraleImpact,
			attackerEconMorStart = widthAttEconMorStart,
			widthAttEconMorEnd = attacking.get('econMorale'),
			attackerEconMorEnd = widthAttEconMorEnd,
			attackerArmyPopStart = resultObj.attackerWins ? attacking.get('armyPopulation') + resultObj.winnerCas : attacking.get('armyPopulation') + resultObj.loserCas,
			attackerArmyPopEnd = attacking.get('armyPopulation'),
			widthAttArmyPopStart = widthStartValue(attackerArmyPopStart, attackerArmyPopEnd),
			widthAttArmyPopEnd = widthEndValue(attackerArmyPopStart, attackerArmyPopEnd),
			widthAttArmyMorStart = resultObj.oldAttMorale,
			attackerArmyMorStart = widthAttArmyMorStart, 
			widthAttArmyMorEnd = attacking.get('morale'),
			attackerArmyMorEnd = widthAttArmyMorEnd,
			widthAttArmyXPStart = resultObj.attackerWins ? attacking.get('armyXP') - resultObj.winnerGainedXP : attacking.get('armyXP') - resultObj.loserGainedXP,
			attackerArmyXPStart = widthAttArmyXPStart,
			widthAttArmyXPEnd = attacking.get('armyXP'),
			attackerArmyXPEnd = widthAttArmyXPEnd;

		var defGDPBarArr = ['def', 'GDP', widthGDPStart,  widthGDPEnd, 'GDP', '$' + App.Utilities.addCommas(defenderGDPStart), '$' + App.Utilities.addCommas(defenderGDPEnd), App.Models.nationStats.get(defending.get('side')).get('color')],
			defEconPopBarArr = ['def', 'EconPop', widthEconPopStart, widthEconPopEnd, 'Population', App.Utilities.addCommas(defenderEconPopStart), App.Utilities.addCommas(defenderEconPopEnd), App.Models.nationStats.get(defending.get('side')).get('color')],
			defEconMorBarArr = ['def', 'EconMor', widthEconMorStart, widthEconMorEnd, 'Morale', defenderEconMorStart + '%', defenderEconMorEnd + '%', App.Models.nationStats.get(defending.get('side')).get('color')],
			defEconStrBarArr = ['def', 'EconStr', widthEconStrStart, widthEconStrEnd, 'Infrastructure', defenderEconStrStart + '%', defenderEconStrEnd + '%', App.Models.nationStats.get(defending.get('side')).get('color')],
			attGDPBarArr = ['att', 'GDP', widthAttGDPStart, widthAttGDPEnd, 'GDP', '$' + App.Utilities.addCommas(attackerGDPStart), '$' + App.Utilities.addCommas(attackerGDPEnd), App.Models.nationStats.get(attacking.get('side')).get('color')],
			attEconPopBarArr = ['att', 'EconPop', widthAttEconPopStart, widthAttEconPopEnd, 'Population', App.Utilities.addCommas(attackerEconPopStart), App.Utilities.addCommas(attackerEconPopEnd), App.Models.nationStats.get(attacking.get('side')).get('color')],
			attEconMorBarArr = ['att', 'EconMor', widthAttEconMorStart, widthAttEconMorEnd, 'Morale',  attackerEconMorStart + '%',  attackerEconMorEnd + '%', App.Models.nationStats.get(attacking.get('side')).get('color')],
			attEconStrBarArr = ['att', 'EconStr', attacking.get('econStrength'), attacking.get('econStrength'), 'Infrastructure', attacking.get('econStrength') + '%', attacking.get('econStrength') + '%', App.Models.nationStats.get(attacking.get('side')).get('color')],
			defArmyPopBarArr = ['def', 'ArmyPop', widthArmyPopStart, widthArmyPopEnd, 'Units',  App.Utilities.addCommas(defenderArmyPopStart),  App.Utilities.addCommas(defenderArmyPopEnd), App.Models.nationStats.get(defending.get('side')).get('color')],
			defArmyMorBarArr = ['def', 'ArmyMor', widthArmyMorStart, widthArmyMorEnd, 'Morale', defenderArmyMorStart + '%', defenderArmyMorEnd + '%', App.Models.nationStats.get(defending.get('side')).get('color')],
			defArmyXPBarArr = ['def', 'ArmyXP', widthArmyXPStart, widthArmyXPEnd, 'XP', defenderArmyXPStart, defenderArmyXPEnd, App.Models.nationStats.get(defending.get('side')).get('color')],
			defFortStrBarArr = ['def', 'FortStr', widthFortStrStart, widthFortStrEnd, 'Fort Strength', defenderFortStrStart + '%', defenderFortStrEnd + '%', App.Models.nationStats.get(defending.get('side')).get('color')],
			attArmyPopBarArr = ['att', 'ArmyPop', widthAttArmyPopStart, widthAttArmyPopEnd, 'Units', App.Utilities.addCommas(attackerArmyPopStart), App.Utilities.addCommas(attackerArmyPopEnd), App.Models.nationStats.get(attacking.get('side')).get('color')],
			attArmyMorBarArr = ['att', 'ArmyMor', widthAttArmyMorStart, widthAttArmyMorEnd, 'Morale', attackerArmyMorStart + '%', attackerArmyMorEnd + '%', App.Models.nationStats.get(attacking.get('side')).get('color')],
			attArmyXPBarArr = ['att', 'ArmyXP', widthAttArmyXPStart, widthAttArmyXPEnd, 'XP', attackerArmyXPStart, attackerArmyXPEnd, App.Models.nationStats.get(attacking.get('side')).get('color')],
			attFortStrBarArr = ['att', 'FortStr', attacking.get('fortStrength'), attacking.get('fortStrength'), 'Fort Strength', attacking.get('fortStrength') + '%', attacking.get('fortStrength') + '%', App.Models.nationStats.get(attacking.get('side')).get('color')];

		// Create array of arrays containing bars data
		var barsArr = [defArmyPopBarArr, defArmyMorBarArr, defArmyXPBarArr, defFortStrBarArr, attArmyPopBarArr, attArmyMorBarArr, attArmyXPBarArr, attFortStrBarArr, defGDPBarArr, defEconPopBarArr, defEconMorBarArr,
						defEconStrBarArr, attGDPBarArr, attEconPopBarArr, attEconMorBarArr, attEconStrBarArr],
			barObjsArr = [],
			messageHTML;

		// Loop through array to create bar objects and add them to the HTML
		var i = 0,
			barObj = {},
			fortDestroyedHTML,
			attArmyRankedUpHTML,
			defArmyRankedUpHTML,
			attNewRankObj = resultObj.attackerRankUp ? {newRank: attacking.get('armyRank'), armyPromoted: true} : {newRank: attacking.get('armyRank'), armyPromoted: false},
			defNewRankObj = resultObj.defenderRankUp ? {newRank: defending.get('armyRank'), armyPromoted: true} : {newRank: defending.get('armyRank'), armyPromoted: false},
			attStarGroupHTML = resultObj.attackerRankUp ? App.Utilities.makeStarGroup(attNewRankObj) : '',
			defStarGroupHTML = resultObj.defenderRankUp ? App.Utilities.makeStarGroup(defNewRankObj) : '',
			fortDestroyedHTML = resultObj.defenderFortDestroyed ? '<p class="text-center battle-update"><strong><span class="glyphicon glyphicon-fire" aria-hidden="true"></span> Fort destroyed!</strong></p>' : '',
			attArmyRankedUpHTML = resultObj.attackerRankUp ? '<p class="text-center battle-update"><strong>'+ attStarGroupHTML + '</strong></p>' : '',
			defArmyRankedUpHTML = resultObj.defenderRankUp ? '<p class="text-center battle-update"><strong>'+ defStarGroupHTML + '</strong></p>' : '',
			messagesHTML = resultObj.defenderRankUp ||  resultObj.attackerRankUp || resultObj.defenderFortDestroyed ? '<div class="col-xs-6 pull-' + defending.get('side') + '">' + fortDestroyedHTML + defArmyRankedUpHTML + '</div><div class="col-xs-6 pull-' + attacking.get('side') + '">' + attArmyRankedUpHTML + '</div>' : '';

		while (i < barsArr.length) {

			var sideName = barsArr[i][0] === 'def' ? defending.get('name') : attacking.get('name');

			barObj = {
				barid: barsArr[i][0] + barsArr[i][1] + 'Bar',
				widthVal: barsArr[i][2],
				updateWidthVal: barsArr[i][3],
				labelText : barsArr[i][4],
				textid : barsArr[i][0] + barsArr[i][1] + 'Txt',
				textVal : barsArr[i][5],
				updatedTextVal : barsArr[i][6],
				color: barsArr[i][7]
			};

			if(i === 0) {
				messageHTML = '<div class="row battle-result">' +
				'<div class="col-xs-6 pull-' + defending.get('side') + '"><h3 class="text-center" id="defHeading">Defender: '+defending.get('name')+'</h3></div>' +
				'<div class="col-xs-6 pull-' + attacking.get('side') + '"><h3 class="text-center" id="attHeading">Attacker: '+attacking.get('name')+'</h3></div>' +
				'<div class="clearfix"></div>' + messagesHTML +
				'<div class="container-fluid"><h3 class="text-center charts-header">Army</h3></div><div class="col-xs-6 pull-' + defending.get('side') + ' ' + defending.get('side') + '-side-color">';
			} else if(i === 4) {
				messageHTML += '</div><div class="col-xs-6 pull-' + attacking.get('side') + ' ' + attacking.get('side') + '-side-color">';
			} else if(i == 8) {
				messageHTML += '</div><div class="clearfix"></div><div class="container-fluid"><h3 class="text-center charts-header">Economy</h3></div><div class="col-xs-6 pull-' + defending.get('side') + ' ' + defending.get('side') + '-side-color">';
			} else if(i == 12) {
				messageHTML += '</div><div class="col-xs-6 pull-' + attacking.get('side') + ' ' + attacking.get('side') + '-side-color">';
			} else if (i == 15) {
				barObjsArr.push(barObj);
				messageHTML += progBarObjHTML(barObj);
				messageHTML += '</div><div class="clearfix"></div></div>';
			}

			if(i != 15) {
				barObjsArr.push(barObj);
				messageHTML += progBarObjHTML(barObj);
			}

			i++;
		}

		messageHTML += App.Utilities.isMobile() ? '<p class="br-alert text-center">Tap each bar to see the impact from the battle.</p>' : '';

		function progBarObjHTML(barObj) {
			return 	'<button class="fort-label no-btn current" aria-label="'+ sideName + ' '+barObj.labelText+' Before Attack: ' + barObj.textVal + ' After Attack: ' + barObj.updatedTextVal + '">' + 
					'<div id="'+ barObj.barid + '" class="prog-bar '+barObj.color+'" data-start-val="'+barObj.widthVal+'" data-end-val="'+barObj.updateWidthVal + '" style="width: ' + barObj.widthVal + '%"></div>' + 			
					'<div class="prog-txt"><strong>'+barObj.labelText+' <span class="prog-bar-text-val" id="'+barObj.textid+'" data-start-val="' + barObj.textVal + '" data-end-val="' + barObj.updatedTextVal + '">' + barObj.textVal + '</span></strong></div>' + 
					'</button>';
		}

		function widthStartValue(start, end) {
			return start > end ? 100 : (start / end) * 100;
		}
		function widthEndValue(start, end) {
			return start > end ? 100 - (Math.abs(start - end) / start * 100) : 100;
		}

		var confModalModel = new App.Models.Modal({
			title: titleText,
			confBtnId: btnID,
			showCancelBtn: false,
			modalMsg: messageHTML,
			noTurnsMsg: noTurnsTxt,
			confBtnClass: btnClass,
			attacking: attacking,
			defending: defending,
			newObj : newObj,
			animationOver: false,
			notification: resultObj.battleNotification,
			govKilled: resultObj.defGovCas
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});
		$('#oneModal .modal-dialog').addClass('modal-lg');
		$('#oneModal .modal-title').addClass('headline-title');


		setTimeout(function(){

			var defClass = !resultObj.attackerWins ? 'animated pulse' : '',
				defClass = resultObj.invasion ? 'animated hinge' : defClass,
				attClass = resultObj.attackerWins ? 'animated pulse' : '';

			$('#defHeading').addClass(defClass);
			$('#attHeading').addClass(attClass);

			var updDefGDPBarArr = ['def', 'GDP', widthGDPEnd + '%', '$' + App.Utilities.addCommas(defenderGDPEnd)],
				updDefEconPopBarArr = ['def', 'EconPop', widthEconPopEnd + '%', App.Utilities.addCommas(defenderEconPopEnd)],
				updDefEconStrBarArr = ['def', 'EconStr', widthEconStrEnd + '%', defenderEconStrEnd + '%'],
				updDefEconMorBarArr = ['def', 'EconMor', defenderEconMorEnd + '%', defenderEconMorEnd + '%'],
				updDefArmyPopBarArr = ['def', 'ArmyPop', widthArmyPopEnd + '%', App.Utilities.addCommas(defenderArmyPopEnd)],
				updDefArmyMorBarArr = ['def', 'ArmyMor', defenderArmyMorEnd + '%', defenderArmyMorEnd + '%'],
				updDefArmyXPBarArr = ['def', 'ArmyXP', defenderArmyXPEnd + '%', defenderArmyXPEnd],
				updDefFortStrBarArr = ['def', 'FortStr', widthFortStrEnd + '%', defenderFortStrEnd + '%'],
				updAttGDPBarArr = ['att', 'GDP', widthAttGDPEnd + '%', '$' + App.Utilities.addCommas(attackerGDPEnd)],
				updAttEconMorBarArr = ['att', 'EconMor', attackerEconMorEnd + '%', attackerEconMorEnd + '%'],
				updAttArmyPopBarArr = ['att', 'ArmyPop', widthAttArmyPopEnd + '%', App.Utilities.addCommas(attackerArmyPopEnd)],
				updAttArmyMorBarArr = ['att', 'ArmyMor', attackerArmyMorEnd + '%', attackerArmyMorEnd + '%'],
				updAttArmyXPBarArr = ['att', 'ArmyXP', attackerArmyXPEnd + '%', attackerArmyXPEnd];

			var barsArr = [updDefGDPBarArr, updDefEconPopBarArr, updDefEconStrBarArr, updDefEconMorBarArr, updDefArmyPopBarArr, updDefArmyMorBarArr, updDefArmyXPBarArr, updDefFortStrBarArr,
				updAttGDPBarArr, updAttEconMorBarArr, updAttArmyPopBarArr, updAttArmyMorBarArr, updAttArmyXPBarArr];

			for (var i = 0; i < barsArr.length; i++) { 
		 	 	$('#' + barsArr[i][0] + barsArr[i][1] + 'Bar').css('width', barsArr[i][2]);
		 	 	$('#' + barsArr[i][0] + barsArr[i][1] + 'Txt').text(barsArr[i][3]);
			}

			confModalView.model.set('animationOver', true);

		}, 1200);

	},
	updateMessage: function(winner, loser) {

			var loserPopulation = loser.get('armyPopulation'),
				winnerCas = winner.get('prvPopulation') - winner.get('armyPopulation'),
				loserCas = loser.get('prvPopulation') - loserPopulation;

			if(loserPopulation > 0) {
				App.Utilities.console(loser.get('name') + ' suffered ' + loserCas + ' casualties and was defeated!');
			} else if (loserPopulation == 0){
				App.Utilities.console(loser.get('name') + ' was destroyed!');
			}

			var winnerLossPct = Math.round(100 * winnerCas / winner.get('prvPopulation')),
				loserLossPct = Math.round(100 * loserCas / loser.get('prvPopulation'));

			App.Utilities.console('\nLosses');
			App.Utilities.console(winner.get('name') + ' : ' + winnerCas + ' (' + winnerLossPct + '%)');
			App.Utilities.console(loser.get('name') + ' : ' + loserCas + ' (' + loserLossPct + '%)\n\n');

			App.Utilities.console('Remaining Forces');
			App.Utilities.console(winner.get('name') + ' : ' + winner.get('armyPopulation') + ' (' + winner.get('morale') + ' morale)');
			App.Utilities.console(loser.get('name') + ' : ' + loser.get('armyPopulation') + ' (' + loser.get('morale') + ' morale)');
			App.Utilities.console('============================================================================\n\n');

	},
	notify: function(msgObj) {

		var titleTxt = msgObj.titleTxt ? msgObj.titleTxt : '',
			messageTxt = msgObj.msgTxt ? msgObj.msgTxt : '',
			icon = msgObj.icon ? msgObj.icon : '',
			delay = msgObj.delay ? msgObj.delay * 1000 : App.Constants.DELAY_DEFAULT * 1000,
			vert = msgObj.vert ? msgObj.vert : 'top',
			offset = msgObj.offset ? msgObj.offset : App.Utilities.isMobile() ? Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 9) : Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 15);

		if(msgObj.delay === 0) {
			delay = 0;
		}

		if (msgObj.msgType != 'info') {
			var align = App.Utilities.activeSide() === "left" ? "right" : "left",
				fadeDir = App.Utilities.activeSide() === "left" ? "Right" : "Left",
				enterVal = 'animated zoomIn' + fadeDir,
				exitVal = 'animated zoomOut' + fadeDir,
				offset = 20,
				colClass = "col-xs-5 col-md-4"
				type = App.Utilities.activeSide(),
				newestTop = true;
		} else if (msgObj.msgType == 'info') {
			var align = "center",
				enterVal = vert === 'top' ? 'animated zoomInDown' : 'animated zoomInUp',
				exitVal = vert === 'top' ? 'animated zoomOutUp' : 'animated zoomOutDown',
				type = "turn",
				colClass = delay > App.Constants.DELAY_SHORTEST * 1000 ? "col-xs-10 col-md-5 col-sm-8" : "col-xs-8 col-md-4 col-sm-5",
				offset = vert === 'bottom' ? 20 : offset,
				newestTop = vert === 'top' ? true : false;

				if(msgObj.delay === 0) {
					colClass  = "col-xs-10 col-md-5 col-sm-8";
				}
		}

		$.notify({
			// options
			icon: icon,
			title: titleTxt,
			message: messageTxt,
			//url: 'https://github.com/mouse0270/bootstrap-notify',
			//target: '_blank'
		},{
			// settings
			element: 'body',
			position: null,
			type: type,
			allow_dismiss: true,
			newest_on_top: newestTop,
			showProgressbar: false,
			placement: {
				from: vert,
				align: align
			},
			offset: offset,
			spacing: 10,
			z_index: 1031,
			delay: delay,
			timer: 1000,
			url_target: '_blank',
			mouse_over: 'pause',
			animate: {
				enter: enterVal,
				exit: exitVal
			},
			onShow: null,
			onShown: null,
			onClose: null,
			onClosed: null,
			icon_type: 'class',
			template: '<div data-notify="container" class="' + colClass + ' game-alert alert alert-{0} '+App.Models.nationStats.get(App.Utilities.activeSide()).get('color') +'" role="alert">' +
				'<button type="button" class="close" aria-label="Dismiss notification." data-notify="dismiss"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
				'<span data-notify="icon" aria-hidden="true"></span> ' +
				'<label data-notify="title">{1}</label> ' +
				'<p data-notify="message">{2}</p>' +
				'<div class="progress" data-notify="progressbar">' +
					'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
				'</div>' +
				'<a href="{3}" target="{4}" data-notify="url"></a>' +
			'</div>' 
		});

	}

});