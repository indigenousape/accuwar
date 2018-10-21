 /*
 	[accuwar]: Turn-based Strategy Game
	Single Prompt Modal View
*/ 

App.Views.SinglePromptModal = Backbone.View.extend({
	template: App.Utilities.template('spModal'),
	initialize: function() {
		var thisView = this;
		$('#modalLiveRegion').html('');
		this.render();

		$('#modalTarget').html(this.$el);
		App.Utilities.showModal();

		this.model.set({
			'modalView' : thisView
		});

		if(!this.model.get('showRange')) {
			$('#oneModal').on('shown.bs.modal', function() {
				App.Utilities.selectOrFocus('spInput');
				App.Views.battleMap.smoothScroll('.terr:first-child');
			});
		} else {

			$('#oneModal').on('shown.bs.modal', function() {
				$('#spRangeInput').focus();
				App.Views.battleMap.smoothScroll('.terr:first-child');
			});

		}

	 	$('#oneModal').on('hidden.bs.modal', function(e) {
			thisView.closeView();
			$('#oneModal').off();
	 	});

	 	// Have to bind and unbind the range slider events on the fly
	 	// Event is different in IE
	 	if(this.model.get('confBtnId') === 'confNewTaxRate' && !App.Utilities.detectIE()) {
	 		this.events['input #spRangeInput'] = "showTaxResult";
	 		this.delegateEvents();
	 	} else if(this.model.get('confBtnId') === 'confNewTaxRate') {
	 		this.events['change #spRangeInput'] = "showTaxResult";
	 		this.delegateEvents();	
	 	}

	 	if(this.model.get('confBtnId') === 'confReinforce' && !App.Utilities.detectIE()) {
	 		this.events['input #spRangeInput'] = "showReinforcementsResult";
	 		this.delegateEvents();
	 	} else if (this.model.get('confBtnId') === 'confReinforce') {
	 		this.events['change #spRangeInput'] = "showReinforcementsResult";
	 		this.delegateEvents();	
	 	}

	 	if(this.model.get('confBtnId') === 'confNewRecruits' && !App.Utilities.detectIE()) {
	 		this.events['input #spRangeInput'] = "showRecruitResult";
	 		this.delegateEvents();
	 	} else if (this.model.get('confBtnId') === 'confNewRecruits') {
	 		this.events['change #spRangeInput'] = "showRecruitResult";
	 		this.delegateEvents();	
	 	}

	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	events: {
		'click #confNewEmpName' : 'changeTheEmpireName',
		'keyup #spInput': 'keyValidator',
		'click #confNewTaxRate' : 'changeTheTaxRate',
		'click #confNewTerrName' : 'changeTheTerritoryName',
		'click #confNewRecruits' : 'recruitTheUnits',
		'click #confReinforce' : 'sendTheReinforcements',
		'keyup #spRangeInput' : 'rangeSliderKeypress',
		'click #recruitArmyPol' : 'policyLinkClick'
	},
	changeTheEmpireName: function() {

		if(!this.model.get('stopClick')) {

			var thisName = $('#spInput').val(),
				cancelRename = !thisName;

			if(cancelRename)
				return false;

			if (App.Utilities.validateName($('#spInput').val(), 'empire').errCode != 0) {
				
				this.nameValidation('empire');
				$('#spInput').addClass("invalid").select();
				return false;

			} else {

				// Announce the update
				App.Views.battleMap.notify({
						icon: "glyphicon glyphicon-globe",
						titleTxt : App.Utilities.getActiveEmpireName() + " empire renamed to&nbsp;" + thisName + ".",
						msgType : 'success'
				});

				// Change name nation stats model function
				App.Models.nationStats.setEmpName(thisName);
				App.Collections.terrCollection.changeColorsTerrNames();

				$('.' + App.Utilities.activeSide() + '-stats .sideName').removeClass('tada').addClass('tada');

				// Close the modal
				$('#oneModal').modal('hide');

			}

			this.model.set('stopClick', true);
		}


	},
	changeTheTaxRate: function() {

		if(!this.model.get('stopClick')) {

			var updatedTaxRate = parseInt($('#spRangeInput').val()) / 100;

			if(updatedTaxRate != App.Utilities.activeEmpire().get('taxRate')) {

				App.Collections.terrCollection.updateAllMoraleGDP(updatedTaxRate, App.Utilities.activeSide());

				var titleQualifier = '',
					msgQualifier = '',
					ecQualifier = '';

				if(App.Models.nationStats.getTaxRate() > updatedTaxRate) {
					titleQualifier = 'lowered';
					msgQualifier = 'pleased';
					ecQualifier = 'upward';
				} else if (App.Models.nationStats.getTaxRate() < updatedTaxRate) {
					titleQualifier = 'raised';
					msgQualifier = 'unhappy';
					ecQualifier = 'downward';
				}

				var msgHTML = 'Citizens across ' + App.Utilities.getActiveEmpireName() + ' are ' + msgQualifier + ' with the news. Economic forecasts revised&nbsp;' + ecQualifier + '.',
					confTitleText = 'Tax rate ' + titleQualifier + ' to&nbsp;' + Math.round(updatedTaxRate * 100) + '%.';

				App.Models.nationStats.setTaxRate(updatedTaxRate);
				$('.' + App.Utilities.activeSide() + '-stats .changeTax').removeClass('tada').addClass('tada');

				App.Views.battleMap.notify({
						icon: 'glyphicon glyphicon-globe',
						titleTxt : confTitleText,
						msgTxt: msgHTML,
						msgType : 'success'
				});

				// Close the modal
				$('#oneModal').modal('hide');

				if(App.Models.battleMapModel.get('selectedMode')) {
					App.Utilities.displayInRange();
				}

			} else {

				// Close the modal
				$('#oneModal').modal('hide');

			}

			this.model.set('stopClick', true);

		}

	},
	changeTheTerritoryName: function() {

		if(!this.model.get('stopClick')) {

			var thisInput = $('#spInput'),
				thisName = thisInput.val(),
				cancelRename = !thisName;

			if(cancelRename)
				return false;

			if (App.Utilities.validateName($('#spInput').val(), 'territory').errCode != 0) {
				
				this.nameValidation('territory');
				thisInput.addClass("invalid").select();
				return false;

			} else {

				var oldName = App.Models.selectedTerrModel.get('name');

				// Change name in territory's model
				App.Models.selectedTerrModel.setName(thisInput.val());

				$('.selectedTitle.animated').removeClass('tada').addClass('tada');
				App.Views.selectedTerrView.$el.find('.army > h2').removeClass('tada').addClass('tada');

				App.Views.battleMap.notify({
						icon: "glyphicon glyphicon-globe",
						titleTxt : oldName + " territory renamed to&nbsp;" + App.Models.selectedTerrModel.get('name') + ".",
						msgType : 'success'
				});

				// Close the modal
				$('#oneModal').modal('hide');

			}

			this.model.set('stopClick', true);

		}

	},
	closeView: function() {
    	this.unbind();
    	this.undelegateEvents();
    	this.remove();
    	App.Views.battleMap.smoothScroll('.terr:first-child');
	},
	rangeSliderKeypress: function(e) {
		if(App.Utilities.isEnterKey(e)) {
			this.enterPress(this.model.get('confBtnId'));
		}
	},
	enterPress: function(id) {
		// Controls which function is fired if enter is pressed

		switch(id) {

			case 'confNewEmpName':
				this.changeTheEmpireName();
				break;
			case 'confNewTerrName':
				this.changeTheTerritoryName();
				break;
			case 'confNewRecruits':
				this.recruitTheUnits();
				break;
			case 'confReinforce':
				this.sendTheReinforcements();
				break;
			case 'confNewTaxRate':
				this.changeTheTaxRate();
				break;
			default:
				// Will never execute
				return false; 

		}

		return false;

	},
	nameValidation: function(beingNamed) {

		if(App.Utilities.validateName($('#spInput').val(), beingNamed).errCode === 0) {
			$('#spInput').removeClass("invalid");
			$('#error-message, #modalLiveRegion').html('');
		} else {
			$('#spInput').addClass("invalid");
			$('#error-message, #modalLiveRegion').html(App.Utilities.validateName($('#spInput').val(), beingNamed).msg);
		}

	},
	keyValidator: function(e) {

		var id = this.model.get('confBtnId');

		if(App.Utilities.isEnterKey(e)) {
			this.enterPress(this.model.get('confBtnId'));
		}

		if(id == 'confNewEmpName') {
			this.nameValidation('empire');
		} else if(id == 'confNewTerrName') {
			this.nameValidation('territory');
		}

	},
	policyLinkClick: function(e) {
		App.Views.nationStatsView.policyClick(e);
	},
	showRecruitResult: function() {
		var thisInputVal = parseInt($('#spRangeInput').val()),
			recruitCost = App.Utilities.returnRecruitCost(thisInputVal);

		$('#recruitCost').text(App.Utilities.addCommas(recruitCost));
		$('#recruitCount').text(App.Utilities.addCommas(thisInputVal));

		$('#modalLiveRegion').html(App.Utilities.addCommas(thisInputVal) + ' Units. Cost $' + App.Utilities.addCommas(recruitCost));
		
	},
	showReinforcementsResult: function() {

		var thisInput = $('#spRangeInput'),
			thisInputVal = thisInput.val(),
			reinforceMax = (App.Models.selectedTerrModel.get('armyPopulation') - App.Constants.ATTACK_ARMY_MINIMUM) * (App.Models.selectedTerrModel.get('econStrength') / 100),
			reinforceMax = Math.round(reinforceMax),
			dispFromReinforceMax = App.Utilities.addCommas(reinforceMax),
			dispToArmyPop = App.Utilities.addCommas(App.Models.clickedTerrModel.get('armyPopulation')),
			dispFromRemaining = App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation') - reinforceMax);

		var newUnitCount = parseInt(thisInputVal),
			newToUnitDisplay = App.Utilities.addCommas(App.Models.clickedTerrModel.get('armyPopulation') + newUnitCount),
			newFromUnitDisplay = App.Utilities.addCommas(thisInputVal),
			newVals = App.Utilities.returnNewMoraleXpRank(App.Models.clickedTerrModel, newUnitCount),
			newRemaining = App.Utilities.addCommas(App.Models.selectedTerrModel.get('armyPopulation') - newUnitCount);

		$('#remainingUnits').text(newRemaining);
		//$('#fromUnits').text(newFromUnitDisplay);
		$('#fromMorale').text(newVals.fromMorale);
		$('#toRank').html(App.Utilities.makeStarGroup({newRank: newVals.toRank, armyPromoted: false}));
		$('#toXP').text(newVals.toXP);
		$('#toUnits').text(newToUnitDisplay);
		$('#toMorale').text(newVals.toMorale);

		$('#modalLiveRegion').html('From: ' + App.Models.selectedTerrModel.get('name') + '. Army: ' + newRemaining + ' units remaining.\nRank: ' + App.Models.selectedTerrModel.get('armyRank') + '.\nExperience: ' + App.Models.selectedTerrModel.get('armyXP') + '.\nMorale: ' + newVals.fromMorale + '%.\n'
			+ 'To: ' + App.Models.clickedTerrModel.get('name') + '. Army: ' + newToUnitDisplay + ' units. Rank: ' + newVals.toRank + '. Experience: ' + newVals.toXP + '. Morale: ' + newVals.toMorale + '%.');

	},
	showTaxResult: function() {

		var currTaxRate = parseInt(App.Utilities.activeEmpire().get('taxRate') * 100),
			outputTotal = App.Collections.terrCollection.returnSideTotal(App.Utilities.activeSide(), 'economicOutput'),
			estNextTaxes = parseInt(outputTotal * App.Models.nationStats.getTaxRate()),
			dispNextTaxes = App.Utilities.addCommas(estNextTaxes),
			newTreasuryEst = App.Utilities.getTreasury() + estNextTaxes,
			newTreasuryEst = App.Utilities.addCommas(newTreasuryEst),
			thisVal = parseInt($('#spRangeInput').val());

		if(thisVal != currTaxRate) {

			var errorMsg = '';

			if(thisVal > App.Utilities.returnHighTaxLimit()) {
				errorMsg = 'Tax rates above ' + App.Utilities.returnHighTaxLimit() + '% will greatly anger your citizens and damage your economy over time until you lower&nbsp;them.';
				$('#error-message').html(errorMsg);
			} else if (thisVal < App.Utilities.returnLowTaxLimit()) {
				errorMsg = 'Tax rates below ' + App.Utilities.returnLowTaxLimit() + '% will rapidly grow your economy, but at the risk of more frequent market crashes until taxes are raised&nbsp;again.';
				$('#error-message').html(errorMsg);
			} else {
				$('#error-message').html('');
			}

			var estNextTaxes = parseInt(outputTotal * (thisVal / 100)),
				dispProjNextTaxes = App.Utilities.addCommas(estNextTaxes),
				projNextTreasury = App.Utilities.getTreasury() + estNextTaxes,
				dispProjNextTreasury = App.Utilities.addCommas(projNextTreasury),
				moraleImpactNumber,
				impactMsg = '';

			if(thisVal > (100 * App.Models.nationStats.getTaxRate())) {
				moraleImpactNumber = thisVal - Math.round(100 * App.Models.nationStats.getTaxRate());
				impactMsg = '-' + moraleImpactNumber + ' civilian morale each territory. Shrinks the&nbsp;economy.';
				$('#impact-msg').attr('class', 'text-danger').html(impactMsg);
			} else {
				moraleImpactNumber =  Math.round(100 * App.Models.nationStats.getTaxRate()) - thisVal;
				var rapidlyTxt = thisVal < 15 ? "&nbsp;rapidly" : "";
				impactMsg = '+' + moraleImpactNumber + ' civilian morale each territory. Grows the&nbsp;economy' + rapidlyTxt + '.';
				$('#impact-msg').attr('class', 'text-success').html(impactMsg);
			}

			$('#projTaxRate').text(thisVal);
			$('#projTaxes').text(dispProjNextTaxes);
			$('#projTreasury').text(dispProjNextTreasury);

			$('#modalLiveRegion').html('Projected Tax Rate: ' + thisVal + '%\nProjected Tax Income: $' + dispProjNextTaxes + '\nProjected Treasury: $' + dispProjNextTreasury + '\n' + impactMsg + '\n' + errorMsg);

		} else {
			$('#projTaxRate').text(currTaxRate);
			$('#projTaxes').text(App.Utilities.addCommas(estNextTaxes));
			$('#projTreasury').text(newTreasuryEst);
			$('#impact-msg').html(this.model.get('impactMsg')).removeClass('text-danger text-success').addClass(this.model.get('impactClass'));
		}

	},
	recruitTheUnits: function() {

		if(!this.model.get('stopClick')) {

			var recruitedUnits = parseInt($('#spRangeInput').val()),
				newUnitCost = App.Utilities.returnRecruitCost(recruitedUnits),
				treasury = App.Utilities.getTreasury() - newUnitCost,
				newEconPop = App.Models.selectedTerrModel.get('econPopulation') - recruitedUnits,
				newSideRecruitspend = App.Utilities.activeEmpire().get('recruitSpend');

			App.Models.selectedTerrModel.incomingUnits(App.Models.selectedTerrModel, recruitedUnits);
			App.Utilities.flipEls(['.armyPopulation-main']);

			App.Models.nationStats.payForUpgrade(treasury);

			App.Utilities.activeEmpire().set({
				'armyPopulationNow': (App.Utilities.activeEmpire().get('armyPopulationNow') + recruitedUnits),
				'econPopulationNow': (App.Utilities.activeEmpire().get('econPopulationNow') - recruitedUnits),
				'recruitSpend': (newSideRecruitspend + newUnitCost)
			});

			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-user',
				titleTxt : "Uncle " + App.Utilities.getActiveEmpireName() + " Wants&nbsp;You",
				msgTxt: "Drill sergeants at Ft. " + App.Models.selectedTerrModel.get('name') + " give " + App.Utilities.addCommas(recruitedUnits) + " citizen recruits a warm&nbsp;welcome.",
				msgType:'success'
			});
			App.Views.battleMap.deselect();

			App.Utilities.warpEls(['.treasury-tot', '.changeTax']);

			// Close the modal
			$('#oneModal').modal('hide');

			this.model.set('stopClick', true);

		}

	},
	sendTheReinforcements: function() {

		if(!this.model.get('stopClick')) {

			var newUnits = parseInt($('#spRangeInput').val());

			// Calculate the impact on troop levels, morale, XP, and rank
			App.Models.clickedTerrModel.incomingUnits(App.Models.clickedTerrModel, newUnits);

			App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-user",
					titleTxt : App.Utilities.addCommas(newUnits) + " units sent to&nbsp;" + App.Models.clickedTerrModel.get('name')
			});

			App.Views.battleMap.deselect();

			App.Utilities.warpEls(['.changeTax']);

			// Close the modal
			$('#oneModal').modal('hide');

			this.model.set('stopClick', true);

		}

	}
});