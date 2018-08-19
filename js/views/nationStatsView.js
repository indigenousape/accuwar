 /*
 	[accuwar]: Turn-based Strategy Game
	Nation Stats View	
*/ 

App.Views.NationStats = Backbone.View.extend({
	el: '#nationStats',
	template: App.Utilities.template('sideStats'),
	initialize: function() {

		this.model.on('change', this.render, this); // when the models change, re-render the view
		this.model.get('left').on('change', this.render, this);
		this.model.get('right').on('change', this.render, this);
		this.render();

	},
	className: function() {
		if(App.Models.battleMapModel.get('mobileMode')) {
			return 'mobile';
		} else {
			return '';
		}
	},
	render: function() {

		if(typeof $mainSidebar != 'undefined') {
			$mainSidebar.off();	
		} else if(typeof $secSidebar != 'undefined') {
			$secSidebar.off();
		}

		var newClasses = this.className();
		this.$el.addClass(newClasses);
		this.$el.html(this.template(this.model.toJSON()));

		App.Utilities.console("Nation Stats View Rendered:")
		App.Utilities.console(this.model);

		var $mainSidebar = $( "#sidebar-main" ),
			$secSidebar = $( "#sidebar-secondary" );

		var width = Math.min(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) * 0.45, 300);

		if(App.Utilities.activeSide() == 'left') {

			$mainSidebar.simplerSidebar( {
				attr: "sidebar-main",
				align: "left",
				mask: {
					display: false
				},
				selectors: {
					trigger: "#sidebar-main-trigger",
					quitter: ".quitter"
				},
				sidebar: {
					width: width
				},
			    events: {
			        callbacks: {
			            animation: {
			                open: function() {
			                	$('.sidebar-container button, .sidebar-container select, .sidebar-container a, .sidebar-container, .quitter').attr('tabindex', 0);
			                	$('.quitter').focus();
			                },
			                close: function() {
			                	$('.sidebar-container button, .sidebar-container select, .sidebar-container a, .sidebar-container, .quitter').attr('tabindex', -1);
			                	$('#sidebar-main-trigger').focus();
			                }
			            }
			        }
			    }
			} );

		} else {

			$secSidebar.simplerSidebar( {
				attr: "sidebar-secondary",
				mask: {
					display: false
				},
				selectors: {
					trigger: "#sidebar-secondary-trigger",
					quitter: ".quitter"
				},
				sidebar: {
					width: width
				},
			    events: {
			        callbacks: {
			            animation: {
			                open: function() {
			                	$('.sidebar-container button, .sidebar-container select, .sidebar-container a').attr('tabindex', 0);
			                	$('.quitter').attr('tabindex', 0);
			                	$('.quitter').focus();
			                },
			                close: function() {
			                	$('.sidebar-container button, .sidebar-container select, .sidebar-container a').attr('tabindex', -1);
			                	$('.quitter').attr('tabindex', -1);
			                	$('#sidebar-secondary-trigger').focus();
			                }
			            }
			        }
			    }
			});

		}

		// Initializes and reinitializes tooltips when sidebar is updated
		$(function () {
			$('[data-toggle="popover"]').popover('destroy');
			$('[data-toggle="popover"]').popover();
		});

		return this;
	},
	events: {
		'click .changeTax' : 'changeTax',
		'click .sideName' : 'changeName',
		'click .newTurn': 'confirmNewTurn',
		'click .restart' : 'restartGame',
		'click .sideRebuildAllInf' : 'rebuildEmpInfrastructure',
		'click .sideRebuildAllFort' : 'rebuildEmpForts',
		'click .exitFullScreen' : 'exitFullScreen',
		'click .launchFullScreen' : 'launchFullScreen',
		'click .stopMusic' : 'stopMusic',
		'click .startMusic' : 'startMusic',
		'click .skipSong' : 'nextTrack',
		'click .policy' : 'policyClick',
		'click .disableTips' : 'disableTips',
		'click .sidebarTerr' : 'selectTerr',
		'click .budget' : 'budgetModal',
		'click #recruitSidebar' : 'recruitSidebar'
	},
	selectTerr: function(e) {

		var modelCid = $(e.currentTarget).attr('data-cid');
		var modelParentView = App.Collections.terrCollection.returnSelectedView(modelCid);
		modelParentView.terrClick();

		var raise = $(e.currentTarget).attr('data-raise') === 'true';

		if(modelParentView.model.get('remainingTurns') > 0 && raise) {
			App.Views.selectedFooterView.raiseFooter();
		}

	},
	closeMenu: function() {
		$('.close-menu').trigger('click');
	},
	changeName: function(that) {
		var side = that.currentTarget.getAttribute('data-side'),
			oldName = this.model.get(side).get('empName'),
			canUpdate = App.Utilities.activeSide() === side;

		// User can't update enemy empire name
		if(!canUpdate) {
			App.Views.battleMap.notify({
				titleTxt : "You can't rename your enemy's&nbsp;empire.",
				msgType: "danger",
				icon: 'glyphicon glyphicon-remove-sign'
			});

			return false;
		}

		var spModalModel = new App.Models.Modal({
			title: 'Change Empire Name: ' + oldName,
			confBtnId: 'confNewEmpName',
			modalMsg: '<p>Enter your empire\'s new name:</p>'
		});

		var spModalView = new App.Views.SinglePromptModal({model: spModalModel});

	},
	changeTax: function(e) {

		var side = e.currentTarget.getAttribute('data-side'),
			canUpdate = App.Utilities.activeSide() === side;

		if(!canUpdate) {
			App.Views.battleMap.notify({
				titleTxt : "You can't update your enemy's tax&nbsp;rate.",
				msgType: "danger",
				icon: 'glyphicon glyphicon-remove-sign'
			});

			return false;
		}

		var empNam = App.Models.nationStats.get(side).get('empName'),
			outputTotal = App.Collections.terrCollection.returnSideTotal(side, 'economicOutput'),
			estNextTaxes = Math.round(outputTotal * this.model.getTaxRate()),
			dispNextTaxes = App.Utilities.addCommas(estNextTaxes),
			newTreasuryEst = this.model.get(side).get('treasury') + estNextTaxes,
			newTreasuryEst = App.Utilities.addCommas(newTreasuryEst),
			messageHTML = '<div class="row container-fluid"><label>Current Tax Rate:</label> ' + parseInt(this.model.getTaxRate() * 100) + '%</div>' +
							'<div class="row container-fluid"><label>Est. Taxes Collected:</label> $<span id="projTaxes">' + dispNextTaxes + '</span></div>' +
							'<div class="row container-fluid"><label>Est. Next Turn Treasury:</label> $<span id="projTreasury">' + newTreasuryEst + '</span></div>' + 
							'<p class="form-text"><label>New Tax Rate:</label> <span id="projTaxRate">' + parseInt(this.model.getTaxRate() * 100) + '</span>%</p>';

		var spModalModel = new App.Models.Modal({
			title: 'Change Tax Rate: ' + empNam,
			confBtnId: 'confNewTaxRate',
			modalMsg: messageHTML,
			impactMsg: 'Changing tax rates will impact citizen&nbsp;morale.',
			impactClass: 'text-muted',
			rangeMax: 100,
			rangeMin: 0,
			rangeVal: Math.round(this.model.getTaxRate() * 100),
			rangeStep: 1,
			showRange: true
		});

		var spModalView = new App.Views.SinglePromptModal({model: spModalModel});
		if(App.Utilities.isMobile()) {
			$('#spInput').attr('type', 'number');
		}

		$('#spInput').val(parseInt(this.model.getTaxRate() * 100));
		
	},
	budgetModal: function() {

		var modalHTML = '';
		modalHTML += '<div id="budgetTable"></div>';


		var confModalModel = new App.Models.Modal({
			title: App.Utilities.getActiveEmpireName() + ' ' + App.Models.nationStats.get('currentTurn') + ' Budget',
			confBtnId: '',
			modalMsg: modalHTML,
			confBtnClass: 'btn-primary',
			showCancelBtn: false
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});
		//$('#oneModal .modal-dialog').addClass('modal-lg');
		App.Views.budgetView = new App.Views.BudgetView({model: App.Models.nationStats.get(App.Utilities.activeSide())});
		$('#budgetTable').html(App.Views.budgetView.$el);

	},
	policyClick: function(e) {

		var currSideName = this.model.get(App.Utilities.activeSide()).get('empName');
		var clickedPolicy = e.currentTarget.getAttribute('data-pol-id');
		App.Models.nationStats.set('clickedPolicy', clickedPolicy);
		var clickedPolIndex = _.pluck(App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicies'), 'id');
		var clickedPolIndex = _.indexOf(clickedPolIndex, clickedPolicy);

		// TO DO Keeping commented construction below for use with AI
		// if(!confirmFirst) {
		// 	App.Views.nationStatsView.updater();
		// } else {

			// Build out the HTML for the modal with the checkboxes to activate policies
			
			var modalHTML = '';
			var policiesArr = App.Models.nationStats.get(App.Utilities.activeSide()).get('activePolicies');

			// Element for the active policies view

			modalHTML += '<h3>Available Policies</h3>';

			modalHTML += '<p>Policies are tasks that can be carried out automatically throughout your empire with any leftover funds before the start of the next year.</p>';

			modalHTML += '<div class="available-policies-container">';
			for (var m = 0; m < policiesArr.length; m++) {

				if(policiesArr[m].priority != 0 && policiesArr[m].side === App.Utilities.activeSide()) {
					modalHTML += '<label for="'+policiesArr[m].id+'"><input type="checkbox" id="'+policiesArr[m].id+'" value="'+policiesArr[m].id+'" name="available-policies" class="available-policies" checked> '+policiesArr[m].title+'</label>';
				} else if(policiesArr[m].side === App.Utilities.activeSide()) {
					modalHTML += '<label for="'+policiesArr[m].id+'"><input type="checkbox" id="'+policiesArr[m].id+'" value="'+policiesArr[m].id+'" name="available-policies" class="available-policies"> '+policiesArr[m].title+ '</label>';
				}
			}

			modalHTML += '</div>';

			modalHTML += '<div id="enactedPolicies" role="status" aria-live="assertive"></div>';


			var confModalModel = new App.Models.Modal({
				title: 'Update Policies',
				confBtnId: 'confUpdatePolicy',
				modalMsg: modalHTML,
				confBtnClass: 'btn-primary',
				showCancelBtn: false
			});

			var confModalView = new App.Views.ConfModal({model: confModalModel});
			$('#oneModal .modal-dialog').addClass('modal-lg');
			App.Views.policiesView = new App.Views.PolicyView({model: App.Models.nationStats.get(App.Utilities.activeSide())});
			$('#enactedPolicies').html(App.Views.policiesView.$el);

		// }

	},
	confirmNewTurn: function(confirmFirst) {

		var currSideName = this.model.get(App.Utilities.activeSide()).get('empName');

		if(!confirmFirst) {
			App.Views.nationStatsView.updater();
		} else {

			var confModalModel = new App.Models.Modal({
				title: 'End Turn: Year ' + App.Models.nationStats.get('currentTurn'),
				confBtnId: 'confNewTurn',
				modalMsg: '<p>End turn for '+App.Utilities.getActiveEmpireName() + '?</p>',
				impactMsg: App.Collections.terrCollection.getSideTerritoriesWithTurns(App.Utilities.activeSide()).length + '/' +  App.Collections.terrCollection.getSideTerritories(App.Utilities.activeSide()).length + ' territory turns&nbsp;remaining.',
				impactClass: 'text-muted',
				confBtnClass: 'btn-danger'
			});

			var confModalView = new App.Views.ConfModal({model: confModalModel});

		}

	},
	disableTips: function() {
		App.Models.battleMapModel.set('tipsMode', false);
		this.render();
	},
	exitFullScreen: function() {
		App.Utilities.exitFullScreen();
		this.model.set('fullScreen', false);
	},
	launchFullScreen: function() {
		App.Utilities.launchFullScreen(document.documentElement);
		this.model.set('fullScreen', true);
	},
	recruitSidebar: function() {
		var modelCid = $('.sidebar-recruit-menu').val();
		var modelParentView = App.Collections.terrCollection.returnSelectedView(modelCid);
		modelParentView.terrClick();
		App.Utilities.recruitUnitsModal(App.Models.selectedTerrModel);
		App.Views.selectedFooterView.raiseFooter();
	},
	startMusic: function() {
		App.Models.battleMapModel.set('audio', true);
		if($('#ambientMusic').length === 0) {
			var whichAmbient = App.Constants.AMBIENT_MUSIC[_.random(0, (App.Constants.AMBIENT_MUSIC.length - 1))];

			var audioEl = $('<audio id="ambientMusic" hidden>' +
			  '<source src="' + whichAmbient + '" type="audio/mpeg"> ' +
			'</audio>');

			$('body').append(audioEl);

			audioEl[0].volume = App.Utilities.smallScreenOnly() ? 0.33 : 0.25;

			audioEl.bind('ended', App.Utilities.playNextTrack);
		}

		$('#ambientMusic')[0].play();

		this.render();
	},
	stopMusic: function() {
		App.Models.battleMapModel.set('audio', false);
		$('#ambientMusic')[0].pause();
		this.render();
	},
	nextTrack: function() {
		App.Utilities.playNextTrack();
	},
	updater: function() {

		var currLeftTurn = App.Utilities.activeSide() === 'left',
		 	newTurn = !currLeftTurn ? App.Models.nationStats.get('currentTurn') + 1 : App.Models.nationStats.get('currentTurn'),
		 	newSide = currLeftTurn ? 'right' : 'left',
		 	footerOpen = $('#dropFooter').hasClass('drop');

		 if(footerOpen) {
		 	App.Views.selectedFooterView.closeView();
		 }

		 if(App.Models.battleMapModel.get('tipsMode') && (newTurn > (App.Constants.START_TURN + 3))) {
			App.Models.battleMapModel.set('tipsMode', false);
			$('[data-toggle="popover"]').popover('destroy');
		 }

		if(!currLeftTurn) {

			var casTotal = App.Collections.terrCollection.casualtiesTotal(); // Get total casualties for the user's turn before updating populations

	 		if(casTotal > 0){
	 			var leftArmyCas = App.Utilities.addCommas(App.Collections.terrCollection.getSideCasualties('left', 'army')),
	 				leftEconCas = App.Utilities.addCommas(App.Collections.terrCollection.getSideCasualties('left', 'econ')),
	 				rightArmyCas = App.Utilities.addCommas(App.Collections.terrCollection.getSideCasualties('right', 'army')),
	 				rightEconCas = App.Utilities.addCommas(App.Collections.terrCollection.getSideCasualties('right', 'econ')),
	 				econTotalCas = App.Collections.terrCollection.getSideCasualties('left', 'econ') + App.Collections.terrCollection.getSideCasualties('right', 'econ'),
	 				armyTotalCas = App.Collections.terrCollection.getSideCasualties('left', 'army') + App.Collections.terrCollection.getSideCasualties('right', 'army'),
	 				totalCas = App.Utilities.addCommas(econTotalCas + armyTotalCas),
	 				leftName = App.Models.nationStats.get('left').get('empName'),
	 				rightName = App.Models.nationStats.get('right').get('empName'),
	 				messageHTML = "<ul class='casualties-list'><li>" + leftName + "</li><li>" + leftArmyCas + " Army casualties</li>" +
	 								"<li>" + leftEconCas + " Civilian casualties</li></ul>" +
	 								"<ul class='casualties-list'><li>" + rightName + "</li><li>" + rightArmyCas + " Army casualties</li>" +
	 								"<li>" + rightEconCas + " Civilian casualties</li></ul>";

				casTotal = App.Utilities.addCommas(casTotal);
				App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-globe',
					titleTxt : 'WAR RAGES ON, ' + totalCas + '&nbsp;DEAD',
					msgTxt : messageHTML,
					msgType: 'info',
					delay: App.Constants.DELAY_INFINITE
				});

				App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-globe',
					titleTxt: 'Start of Year ' + (1 + App.Models.nationStats.get('currentTurn')) + ' for&nbsp;' + App.Models.nationStats.get('left').get('empName'),
					msgType: 'info',
					delay: 3,
					vert: 'bottom',
					offset: 20
				});

	 		} else {
	 			App.Views.battleMap.notify({
					icon: 'glyphicon glyphicon-globe',
					titleTxt: 'Start of Year ' + (1 + App.Models.nationStats.get('currentTurn')) + ' for&nbsp;' + App.Models.nationStats.get('left').get('empName'),
					msgType: 'info',
					delay: 3,
					vert: 'bottom',
					offset: 20
				});
	 		}

		} else {
			App.Views.battleMap.notify({
				icon: 'glyphicon glyphicon-globe',
				titleTxt: 'Start of Year ' + App.Models.nationStats.get('currentTurn') + ' for&nbsp;' + App.Models.nationStats.get('right').get('empName'),
				msgType: 'info',
				delay: 3,
				vert: 'bottom',
				offset: 20
			});

		}

		// Update army populations, fort strengths, and morale values in each territory
		App.Collections.terrCollection.newTurnUpdate();
		
		if(App.Constants.LOGGING) {
			App.Utilities.console("Nation Stats Updated:");
 			App.Utilities.console(App.Models.nationStats.attributes);
 		}
		
		App.Models.nationStats.newTurnNationUpdates();
		App.Views.battleMap.deselect();

		$('.turn-counter .glyphicon').removeClass('endOfTurn').addClass('endOfTurn');
		$('.'+App.Utilities.activeSide()+'-stats > .sideName').removeClass('tada').addClass('tada');

		if( !currLeftTurn) {
			App.Utilities.warpEls(['.treasury-tot', '.changeTax']);
		}

		// if(currLeftTurn) {
		// 	App.Utilities.console("AI LOGIC TIME");

			// Sample Attack Structure
		// 	setTimeout(function() {

		// 		$("#collapseTerrsRight .sidebarTerr")[0].click();

		// 		setTimeout(function() {
		// 			$('.inrange .army').mouseup();

		// 			setTimeout(function() {
		// 				$('#confAttack').click();

		// 				setTimeout(function() {
		// 					$('#battleNot').click();

		// 					setTimeout(function() {
		// 						nextAttack();
		// 					}, 1500);

		// 				}, 600);

		// 			}, 600);

		// 		}, 800);

		// 	}, 1500);

		// }

		// function nextAttack() {

		// 	setTimeout(function() {

		// 			$("#collapseTerrsRight .sidebarTerr")[2].click();

		// 			setTimeout(function() {
		// 				$('.inrange .army').mouseup();

		// 				setTimeout(function() {
		// 					$('#confAttack').click();

		// 					setTimeout(function() {
		// 						$('#battleNot').click();
		// 					}, 600);

		// 				}, 600);

		// 			}, 800);

		// 	}, 1500);

		// }

	},
	rebuildEmpInfrastructure: function() {

		var allTxt = App.Collections.terrCollection.getSideTerritoriesWithTurns(App.Utilities.activeSide()).length === App.Collections.terrCollection.getSideTerritories(App.Utilities.activeSide()).length ? '' : ' with turns&nbsp;remaining';
		var messageHTML = '<p>Spend $' + App.Utilities.addCommas(App.Collections.terrCollection.returnTotalCost('econStrength')) + ' to repair damaged infrastructure in all territories'+allTxt+'?</p>';

		var confModalModel = new App.Models.Modal({
			title: 'Repair All Infrastructure: ' + App.Utilities.getActiveEmpireName(),
			confBtnId: 'repairAllInfrastructure',
			impactMsg: 'Strengthens citizen morale, population growth, and&nbsp;GDP.',
			modalMsg: messageHTML,
			affordAll: false,
			confBtnTxt: 'Repair All',
			repairAllId: ''
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});
	},
	rebuildEmpForts: function() {
		var allTxt = App.Collections.terrCollection.getSideTerritoriesWithTurns(App.Utilities.activeSide()).length === App.Collections.terrCollection.getSideTerritories(App.Utilities.activeSide()).length ? '' : ' in territories with turns&nbsp;remaining';
		var messageHTML = '<p>Spend $' + App.Utilities.addCommas(App.Collections.terrCollection.returnTotalCost('fortStrength')) + ' to repair all damaged forts'+allTxt+'?</p>';

		var confModalModel = new App.Models.Modal({
			title: 'Repair All Forts: ' + App.Utilities.getActiveEmpireName(),
			confBtnId: 'repairAllFortStr',
			impactMsg: 'Improves defense Strength bonus. Impacts citizen and army&nbsp;morale.',
			modalMsg: messageHTML,
			affordAll: false,
			repairAllId: '',
			confBtnTxt: 'Repair All'
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});
	},
	restartGame: function(showCancelBtnFlag) {

		if(typeof showCancelBtnFlag == 'undefined') {
			showCancelBtnFlag = true;
		}

		var confModalModel = new App.Models.Modal({
			title: 'Restart Game',
			confBtnId: 'confNewGame',
			modalMsg: '<p>Start a new game?</p>',
			confBtnClass: 'btn-danger',
			showCancelBtn: showCancelBtnFlag
		});

		var confModalView = new App.Views.ConfModal({model: confModalModel});

	}
});