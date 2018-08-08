 /*
 	[accuwar]: Turn-based Strategy Game
	Release: -2.9 Pre-Alpha
	Author: Josh Harris
	7/22/2018
*/

var startYear = new Date();
startYear = startYear.getFullYear();

window.App = {
	Models: {
		battleMapModel: {},
		clickedTerrModel: {},
		gameStartModel: {},
		nationStats: {},
		selectedTerrModel: {}
	},
	Collections: {
		terrCollection: {}
	},
	Constants: {
		AMBIENT_MUSIC: ['audio/ambient-1.mp3', 'audio/ambient-2.mp3', 'audio/ambient-3.mp3', 'audio/ambient-4.mp3', 'audio/ambient-5.mp3',
						'audio/ambient-6.mp3', 'audio/ambient-7.mp3', 'audio/ambient-8.mp3', 'audio/ambient-9.mp3', 'audio/ambient-10.mp3',
						'audio/ambient-11.mp3', 'audio/ambient-12.mp3', 'audio/ambient-13.mp3', 'audio/ambient-14.mp3', 'audio/ambient-15.mp3',
						'audio/ambient-16.mp3', 'audio/ambient-17.mp3', 'audio/ambient-18.mp3', 'audio/ambient-19.mp3', 'audio/ambient-20.mp3',
						'audio/ambient-21.mp3', 'audio/ambient-22.mp3', 'audio/ambient-23.mp3', 'audio/ambient-24.mp3', 'audio/ambient-25.mp3',
						'audio/ambient-26.mp3', 'audio/ambient-27.mp3'],
		COLOR_OPTIONS: ['blue', 'orange', 'green', 'purple', 'pink'],
		COLOR_OPTIONS_DISP: ['Blue', 'Orange', 'Green', 'Purple', 'Pink'],
		DELAY_SHORTEST: 3, // Notification delays (in seconds)
		DELAY_DEFAULT: 5,
		DELAY_LONGEST: 12,
		DELAY_INFINITE: 0,
		LEVEL_0_POP_PER_TURN_MULT: 1.05, // Army population growth rate
		LEVEL_0_MOR_PER_TURN_MULT: 1.05, // Army morale growth rate
		LOGGING: false, // Sets whether console messages are logged
		ATTACK_MORALE_MINIMUM: 20, // Minimum unit morale required to attack
		ATTACK_ARMY_MINIMUM: 2000, // Minimum army units required to attack 
		ATTACK_INVADE_ARMY_MINIMUM: 10000, // Minimum army units required to invade
		RECRUIT_ARMY_MINIMUM: 1000, // Minimum army units available to recruit
		ARMY_TRAINING_COST: 10000000, // Training cost per 1000 units
		ARMY_UNIT_COST: 50000, // Per unit cost
		FORT_STR_COST: 500000000, // Per 10 strength added
		ECON_STR_COST: 1000000000, // Per 10 strength added
		FORT_LVL_COST: 10000000000, // Per fort level, per territory
		MIN_ARMY_FOR_MORALE: 250000,
		XP_PER_BATTLE: 5,
		MAX_RANK: 5,
		MAX_TECH_LEVEL: 10,
		ECON_LVL_UP_AMT: 10000000000,
		HIGH_TAX_MORALE_AMT: 0.5,
		LOW_TAX_EC_CRASH_AMT: 0.15,
		GDP_PENALTY_LOW_TAX: 0.9,
		TESTING_MODE: false, // Set to true to give left side a huge advantage and other test conditions
		PER_THOUSAND_UNIT_TRANSFER_COST: 5000,
		MIN_ECON_POP_RECRUITING: 1000,
		COST_PER_RECRUIT: 50000,
		PLAYER_1_DEF_START_COLOR: 'blue',
		PLAYER_2_DEF_START_COLOR: 'orange',
		STARTING_TREASURY: 500000000000,
		STARTING_TREASURY_MOB: 180000000000,
		STARTING_TERRITORIES: 25,
		STARTING_TERRITORIES_MOB: 9,
		START_TURN: startYear,
		START_ARMY_UNITS: 250000,
		MIN_ECON_STR_TO_ATTACK: 20,
		POLICIES: [
			{ 
				side: 'left',
				id: 'repair_infra',
				title: 'Repair infrastructure',
				priority: 0
			},
			{
				side: 'left',
				id: 'repair_forts',
				title: 'Repair forts',
				priority: 0
			},
			{ 
				side: 'left',
				id: 'recruit_army',
				title: 'Recruit army units',
				priority: 0,
				amount: 25000
			},
			{ 
				side: 'left',
				id: 'upgrade_tech',
				title: 'Upgrade technology',
				priority: 0
			},
			{ 
				side: 'right',
				id: 'repair_infra',
				title: 'Repair infrastructure',
				priority: 0
			},
			{
				side: 'right',
				id: 'repair_forts',
				title: 'Repair forts',
				priority: 0
			},
			{ 
				side: 'right',
				id: 'recruit_army',
				title: 'Recruit army units',
				priority: 0,
				amount: 25000
			},
			{ 
				side: 'right',
				id: 'upgrade_tech',
				title: 'Upgrade technology',
				priority: 0
			}
			]
	},
	Defaults: {
		mobileMode: true
	},
	Views: {
		allViews: [],
		battleMap: {},
		clickedTerrView: {},
		gameStartView: {},
		policiesView: {},
		leftViews: [],
		rightViews: [],
		nationStatsView: {},
		p1ColorView: {},
		p2ColorView: {},
		selectedFooterView: {},
		selectedTerrView: {},
		terrView: {}
	},
	Timers: {
		main: 0,
		inner: 0
	},
	Utilities: {
		activeSide: function() {
			return App.Models.nationStats.get('sideTurn');
		},
		addCommas: function(num) {
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		capitalizeStr: function(str) {
			return str.charAt(0).toUpperCase() + str.slice(1);
		},
		crashNotification: function(currGDPPenalty) {

			var formattedGDPPenalty = currGDPPenalty > 1000000000 ? currGDPPenalty - (currGDPPenalty%1000000000) : currGDPPenalty - (currGDPPenalty%1000000),
				sinceLastCrash = App.Models.nationStats.get(this.activeSide()).get('econCrashTurn') - App.Models.nationStats.get(this.activeSide()).get('econCrashTurnPrv');

			var againTxt = sinceLastCrash <= 2 && sinceLastCrash > 0 ? 'again' : '';

			var msgObj = {
				icon: "glyphicon glyphicon-globe",
				titleTxt : this.randomSource() + ": Market " + this.marketAdjective() + " "+ againTxt + " in " + App.Models.nationStats.get(this.activeSide()).get('empName'),
				msgTxt : "$" + this.addCommas(Math.round(formattedGDPPenalty)) + " wiped out from the economy in " + App.Models.nationStats.get('currentTurn') + ". Market fever blamed. Economists recommend raising taxes to stabilize nerves."
			};
			App.Views.battleMap.notify(msgObj);

		},
		detectIE: function() {
			var ua = window.navigator.userAgent;

			var msie = ua.indexOf('MSIE ');
			if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
			}

			var trident = ua.indexOf('Trident/');
			if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
			}

			var edge = ua.indexOf('Edge/');
			if (edge > 0) {
			// Edge (IE 12+) => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
			}

			// other browser
			return false;

		},
		displayInRange: function() {
			// Displays reinforcement and attack targets
			if(App.Utilities.enoughPopToAttack(App.Models.selectedTerrModel) && App.Models.selectedTerrModel.get('morale') > App.Constants.ATTACK_MORALE_MINIMUM) {
				App.Collections.terrCollection.attackRange(App.Models.selectedTerrModel);
			} else {
				App.Collections.terrCollection.removeAttackRange(App.Models.selectedTerrModel);
			}

			if(App.Utilities.enoughPopToReinforce(App.Models.selectedTerrModel)) {
				App.Collections.terrCollection.recruitTarget();
			}

		},
		enoughMoraleToAttack: function(territory) {
			return territory.get('morale') > App.Constants.ATTACK_MORALE_MINIMUM;
		},
		enoughPopToAttack: function(territory) {

			var infraDrag = territory.get('econStrength') / 100;
			if((territory.get('armyPopulation') * infraDrag) > (2 * App.Constants.ATTACK_ARMY_MINIMUM)) {
				return true;
			} else {
				return false;
			}

		},
		enoughPopToInvade: function(territory) {
			var infraDrag = territory.get('econStrength') / 100;
			if(territory.get('armyPopulation') * infraDrag > App.Constants.ATTACK_INVADE_ARMY_MINIMUM) {
				return true;
			} else {
				return false;
			}
		},
		enoughPopToReinforce: function(territory) {

			var infraDrag = territory.get('econStrength') / 100;
			if((territory.get('armyPopulation') * infraDrag) > (2 * App.Constants.ATTACK_ARMY_MINIMUM)) {
				return true;
			} else {
				return false;
			}

		},
		exitFullScreen: function() {
			if(document.exitFullscreen) {
				document.exitFullscreen();
			} else if(document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if(document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if(document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		},
		flipEls: function(els) {
			for(var i = 0; i < els.length; i++) {
				$(els[i]).each(function() {
					$(this).removeClass('flipInX').addClass('flipInX');
				});
			}

			setTimeout(function(){
				var elsArr = els;
				for(var i = 0; i < elsArr.length; i++) {
					$(elsArr[i]).each(function() {
						$(this).removeClass('flipInX');
					});
				}
			}, 1250);

		},
		getActiveEmpireName: function() {
			return App.Models.nationStats.get(App.Utilities.activeSide()).get('empName');
		},
		getEnemyEmpireName: function() {
			var enemySide = App.Utilities.activeSide() === 'left' ? 'right' : 'left';
			return App.Models.nationStats.get(enemySide).get('empName');
		},
		getTreasuryAuto: function(side) {
			return App.Models.nationStats.get(side).get('treasury');
		},
		getTreasury: function() {
			return App.Models.nationStats.get(this.activeSide()).get('treasury');
		},
		growthDrags: function(property) {
			var drag = property < 50 ? 5 - (property * 10 / 100) : 0
			return drag;
		},	
		highTaxNotification: function(highTaxTurnLength) {

			var msgTitle = "",
				msgText = "",
				showMsg = false,
				highTaxTurnLength = highTaxTurnLength > 14 ? _.random(2, highTaxTurnLength) : highTaxTurnLength;

			switch(highTaxTurnLength) {
			    case 2:
			    	msgTitle = "WaPo: Outrage Over High Taxes";
			        msgText = "<p>Business leaders warn that high taxes will damage the " + this.getActiveEmpireName() + " economy over time.</p>";
			        showMsg = true;
			        break;
			    case 3:
			        msgTitle = "Bloomberg: " + this.getActiveEmpireName() + " Shoppers Spend Less";
			        msgText = "<p>Citizens across " + this.getActiveEmpireName() + " are spending less after tax hike. Business owners are nervous for the future.</p>";
			        showMsg = true;
			        break;
			    case 4:
			        msgTitle = "WSJ: " + this.getActiveEmpireName() + " Businesses Flee";
			        msgText = "<p>Recession fears as major employers close up shop and seek lower tax rates elsewhere. Citizens are scrambling to find work.</p>";
			        showMsg = true;
			        break;
			    case 5:
			        msgTitle = "CNN: Citizens Demand Lower Taxes";
			        msgText = "<p>Angry citizens pack town halls across " + this.getActiveEmpireName() + " demanding tax relief to combat shrinking economy.</p>";
			        showMsg = true;
			        break;
			    case 6:
			        msgTitle = "NPR: Homelessness in " + this.getActiveEmpireName();
			        msgText = "<p>Desperation across " + this.getActiveEmpireName() + " as high taxes drive jobs away. Community leaders urge tax relief.</p>";
			        showMsg = true;
			        break;
			    case 7:
			        msgTitle = "MSNBC: Nationwide Protests Erupt";
			        msgText = "<p>Protests disrupt peaceful communities across " + this.getActiveEmpireName() + " as angry citizens take to the streets over high taxes, scarce jobs, and unresponsive leaders.</p>";
			        showMsg = true;
			        break;
			    case 8:
			        msgTitle = "Fox: Riots Grip " + this.getActiveEmpireName();
			        msgText = "<p>Thousands injured as demonstrations against failing economy grow violent. Hundreds arrested.</p>";
			        showMsg = true;
			        break;
			    case 9:
			        msgTitle = "WSJ: " + this.getActiveEmpireName() + " Economy in Danger Zone";
			        msgText = "<p>Economists warn tax relief needed soon or the " + this.getActiveEmpireName() + " economy may never recover.</p>";
			        showMsg = true;
			        break;
			    case 10:
			        msgTitle = "NPR: Citizens Leaving " + this.getActiveEmpireName();
			        msgText = "<p>Long lines at the border as citizens flee " + this.getActiveEmpireName() + " to seek a better life elsewhere.</p>";
			        showMsg = true;
			        break;
			    case 11:
			        msgTitle = "Fox: Crime Wave Strikes " + this.getActiveEmpireName();
			        msgText = "<p>Murders, robberies, and gang violence on the increase as depression continues. Citizens desperate for help.</p>";
			        showMsg = true;
			        break;
			    case 12:
			        msgTitle = "NYT: " + this.getActiveEmpireName() + " Economy Continues Plunge";
			        msgText = "<p>No end in sight as the " + this.getActiveEmpireName() + " economy continues to shrink. Advisors recommend tax cuts.</p>";
			        showMsg = true;
			        break;
			    case 13:
			        msgTitle = "AP: Depression Continues in " + this.getActiveEmpireName();
			        msgText = "<p>Citizens desperate as crime and unemployment spiral out of control in " + this.getActiveEmpireName() + ". Business leaders urge tax cut.</p>";
			        showMsg = true;
			        break;
			    case 14:
			        msgTitle = "NYT: Leaders Silent in " + this.getActiveEmpireName();
			        msgText = "<p>Citizens furious as government officials refuse to take steps to save crashing economy.</p>";
			        showMsg = true;
			        break;
			    default:
			        showMsg = false;
			}

			if (showMsg) {
				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-globe",
					titleTxt : msgTitle,
					msgTxt : msgText
				});
			}

		},
		inReinforceMode: function() {
			return $('.reinforce').length > 0; // Refactor, use a collection method instead
		},
		isEnterKey: function(e) {
			
			var isKey = typeof e != 'undefined',
				isEnterKey = false;

			if(isKey) {
				var key = window.event ? e.keyCode : e.which,
					isEnterKey = key === 13;
			}

			return isEnterKey;

		},
		isEscKey: function(e) {
			
			var isKey = typeof e != 'undefined',
				isEscKey = false;

			if(isKey) {
				var key = window.event ? e.keyCode : e.which,
					isEscKey = key === 27;
			}

			return isEscKey;

		},
		isFullScreen: function(element) {
			return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		},
		isMobile: function() {
			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
				h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
				smallScreen = w <= 1024 || (w < 1280 && h < 813);

			// check the screen
			if(!smallScreen) {
				smallScreen = App.Defaults.mobileMode;
			}

			return smallScreen;
		},
		isSafari: function() {
			var ua = navigator.userAgent.toLowerCase(); 
			if (ua.indexOf('safari') != -1) { 
			  if (ua.indexOf('chrome') === -1) {
			    return true;
			  } else {
			  	return false;
			  }
			} else {
				return false;
			}
		},
		smallScreenOnly: function() {

			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
				h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
				smallScreen = w <= 1200 || (w < 1280 && h < 813);

			return smallScreen;
		},
		isMobileDevice: function() {
			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
				h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
				mobileDevice = w < 1200 && h < 813;

			return mobileDevice;
		},
		launchFullScreen: function(element) {
			if(element.requestFullscreen) {
				element.requestFullscreen();
			} else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		},
		console: function(msg) {
			if(App.Constants.LOGGING) {
				console.log(msg);
			}
		},
		playVictoryTrack: function() {
			$('#ambientMusic').attr('src', 'audio/victory.mp3');
		    $('#ambientMusic')[0].pause();
		    $('#ambientMusic')[0].load();
		    $('#ambientMusic')[0].oncanplaythrough = $('#ambientMusic')[0].play();
		},
		lowTaxNotification: function(lowTaxTurnLength) {

			var msgTitle = "",
				msgText = "",
				showMsg = false,
				lowTaxTurnLength = lowTaxTurnLength > 15 ? _.random(0, (lowTaxTurnLength)) : lowTaxTurnLength;

			switch(lowTaxTurnLength) {
			    case 2:
			    	var growthTxt = this.returnRecentCrash() ? 'growing' : 'recovering';
			        msgTitle = "WaPo: Spending Up Across " + this.getActiveEmpireName();
			        msgText = "<p>Shops stay open late as citizens open their wallets in the rapidly " + growthTxt + " economy.</p>";
			        showMsg = true;
			        break;
			    case 3:
			    	var growthTxt = this.returnRecentCrash() ? 'Business Booms' : 'Strong Recovery';
			        msgTitle = this.randomSource() + ": " + growthTxt + " Across " + this.getActiveEmpireName();
			        msgText = "<p>New jobs opening up across " + this.getActiveEmpireName() + " as businesses take advantage of low corporate tax rates.</p>";
			        showMsg = true;
			        break;
			    case 4:
			    	var riskTxt = this.returnRecentCrash() ? 'Red Hot' : 'Recovering';
			        msgTitle = this.randomSource() + ": "+riskTxt+" Economy At Risk?";
			        msgText = "<p>Experts warn keeping taxes too low for too long risks market crashes in " + this.getActiveEmpireName() + ".</p>";
			        showMsg = true;
			        break;
			    case 5:
			    	var reTxt = this.returnRecentCrash() ? 'Soars' : 'Recovering';
			        msgTitle = this.randomSource() + ": Real Estate Market "+reTxt+" in " + App.Models.nationStats.get('currentTurn');
			        msgText = "<p>People are taking advantage of low interest rates and buying second and third homes across the empire.</p>";
			        showMsg = true;
			        break;
			    case 6:
			        msgTitle = "NPR: Infrastructure Crumbling Across " + this.getActiveEmpireName();
			        msgText = "<p>Territories are struggling to maintain roads, bridges, and tunnels with less funding from the empire. Experts suggest raising taxes.</p>";
			        showMsg = true;
			        break;
			    case 7:
			    	var mktTxt = this.returnRecentCrash() ? 'Breaks Records' : 'Strengthening';
			        msgTitle = this.randomSource() + ": " + this.getActiveEmpireName() + " Stock Market " + mktTxt;
			        msgText = "<p>Stock traders rejoice as the " + this.getActiveEmpireName() + " stock market sets new records for growth in " + App.Models.nationStats.get('currentTurn') + ".</p>";
			        showMsg = true;
			        break;
			    case 8:
			    	var empTxt = this.returnRecentCrash() ? 'at All Time Lows' : 'Shrinking';
			    	var ecTxt = this.returnRecentCrash() ? 'to boom' : 'strong recovery';
			        msgTitle = "WaPo: " + this.getActiveEmpireName() + " Unemployment " + empTxt;
			        msgText = "<p>Employers scramble to find workers as economy continues "+ecTxt+" in " + App.Models.nationStats.get('currentTurn') + ".</p>";
			        showMsg = true;
			        break;
			    case 9:
			        msgTitle = "NPR: Poverty Declines Across " + this.getActiveEmpireName();
			        msgText = "<p>Citizens enjoying higher pay and higher standards of living all across the empire. Leaders credit business-friendly tax environment.</p>";
			        showMsg = true;
			        break;
			    case 10:
			    	var crashTxt = this.returnRecentCrash(4) ? 'a Thing of the Past?' : 'Here to Stay?';
			    	var specTxt = this.returnRecentCrash(4) ? 'and self-regulation are the keys to a healthy economy' : 'are like gambling with the ' + this.getActiveEmpireName() + ' economy';
			        msgTitle = this.randomSource() + ": Market Crashes " + crashTxt;
			        msgText = "<p>Experts say low taxes "+specTxt+".</p>";
			        showMsg = true;
			        break;
			    case 11:
			        msgTitle = "AAA: Citizens On The Go";
			        msgText = "<p>Citizens in " + this.getActiveEmpireName() + " planning longer vacations, more family trips in " + App.Models.nationStats.get('currentTurn') + ".</p>";
			        showMsg = true;
			        break;
			    case 12:
			    	var strongTxt = this.returnRecentCrash() ? 'another strong year for the economy' : 'a strong economic recovery';
			        msgTitle = this.randomSource() + ": Strong Growth Forecast in " + App.Models.nationStats.get('currentTurn');
			        msgText = "<p>Low taxes mean big business in " + this.getActiveEmpireName() + ". Experts predict "+strongTxt+".</p>";
			        showMsg = true;
			        break;
			    case 13:
			        msgTitle = "WaPo: Higher Taxes Ahead?";
			        msgText = "<p>Leaders seeking re-election in " + this.returnNextElectionYear() + " face increasing pressure to raise taxes to shore up crumbling infrastructure, fund the military, and stabilize the economy.</p>";
			        showMsg = true;
			        break;
			    case 14:
			    	var extraTxt = this.returnRecentCrash() ? '' : ' despite recent hardships';
			        msgTitle = "Fox News: Immigrants Flock to " + this.getActiveEmpireName();
			        msgText = "<p>The Red Cross reports long lines at the border as immigrants come to " + this.getActiveEmpireName() + " seeking new opportunities"+extraTxt+".</p>";
			        showMsg = true;
			        break;
			    case 15:
			    	var fraudAmt = App.Models.nationStats.get(this.activeSide()).get('treasury') > 100000000000 ? _.random(50, 250) + ' billion' : _.random(50, 250) + ' million';
			        msgTitle = "MSNBC: Corporate Scandals Make Headlines";
			        msgText = "<p>Industry titans face charges as investors seek damages following $"+fraudAmt+" financial fraud. Leaders promise stronger regulations.</p>";
			        showMsg = true;
			        break;
			    default:
			        showMsg = false;
			}

			if (showMsg) {
				App.Views.battleMap.notify({
					icon: "glyphicon glyphicon-globe",
					titleTxt : msgTitle,
					msgTxt : msgText
				});
			}

		},
		makeStarGroup: function(newRankObj) {

			var starGroup = newRankObj.updateRank ? '<span class="rank-stars"><strong>' : '<span class="rank-stars"><strong>',
				emptyStarHTML = '<span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>',
				filledStarHTML = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>';
			// Start counter at one since rank starts at one
			for(var i = 1; i <= newRankObj.newRank; i++) {
				starGroup += filledStarHTML;
			}

			for (var i = App.Constants.MAX_RANK; i > newRankObj.newRank; i--) {
				starGroup += emptyStarHTML;
			}

			starGroup += newRankObj.armyPromoted ? '</strong> Army promoted!</span> ' : '</strong></span>';

			return starGroup;

		},
		makeTerritories: function() {

			var eachSide = parseInt(App.Models.battleMapModel.get('territories')),
				smallScreen = eachSide === App.Constants.STARTING_TERRITORIES_MOB,
				rows = smallScreen ? 3 : 5,
				leftTerrsArr = [],
				rightTerrsArr = [];

			//Builds territory containers and adds them into one container
			//Separates left from right and assigns the capital
			var terrArr = new Array(),
				counter = 0,
				row = 1,
				leftRow = 0,
				rightRow = 0,
				leftTotal = 0,
				rightTotal = 0,
				capitalLeft = smallScreen ? 3 : 10,
				capitalRight = smallScreen ? 5 : 14,
				borderStartLeft = smallScreen ? 2 : 4,
				borderStartRight = smallScreen ? 3 : 5;

			// Passing arbitrary value to territory names function to get the default territory names array
			// Make World War the default by passing 'worldwar' here
			var startingTerritories = App.Utilities.territoryNames('left', 'right');

			for(var i = 1; i <= (eachSide * 2); ++i) {

				var thisTerrIndex = _.random(0, (startingTerritories.length - 1)),
				 	thisTerr = startingTerritories[thisTerrIndex];
				
				startingTerritories.splice(thisTerrIndex, 1);

				if(counter < (eachSide / rows)) {

					leftRow++;

					var armyPopulation = App.Constants.TESTING_MODE ? 2500000 : App.Constants.START_ARMY_UNITS;
					var xp = App.Constants.TESTING_MODE ? 99 : 0;
					var mor = App.Constants.TESTING_MODE ? 20 : 80;

					var fortLevel = counter === borderStartLeft ? 2 : 1;

					if(leftTotal != capitalLeft) {
						terrArr[i] = new App.Models.Territory({
							'name' : thisTerr,
							'side': 'left',
							'color' : 'blue',
							'armyPopulation' : armyPopulation,
							'startPopulation' : armyPopulation,
							'armyXP' : xp,
							'morale' : mor,
							'fortLevel': fortLevel,
							'small' : smallScreen,
							'color' : App.Models.gameStartModel.get('p1Color'),
							'column' : (counter + 1),
							'row' : row
						});
					} else {
						terrArr[i] = new App.Models.Territory({
							'name' : thisTerr,
							'side': 'left',
							'color' : 'orange',
							'armyRank' : 2,
							'isCapital' : true,
							'fortLevel' : 5,
							'small' : smallScreen,
							'color' : App.Models.gameStartModel.get('p1Color'),
							'column': (counter + 1),
							'row' : row
						});
					}
					

					leftTerrsArr.push(terrArr[i]);
					leftTotal++;
					counter++;

				} else {
					var xp = App.Constants.TESTING_MODE ? 0 : 0;
					var armyPopulation = App.Constants.TESTING_MODE ? 10000 : App.Constants.START_ARMY_UNITS;
					rightRow++;
					var fortLevel = counter === borderStartRight ? 2 : 1;
					var fortStrength = App.Constants.TESTING_MODE ? 10 : 100;

					if(rightTotal != capitalRight) {
						terrArr[i] = new App.Models.Territory({
							'name' : thisTerr,
							'side': 'right',
							'remainingTurns' : 0,
							'armyXP' : xp,
							'armyPopulation' : armyPopulation,
							'fortLevel': fortLevel,
							'fortStrength' : fortStrength,
							'small' : smallScreen,
							'color' : App.Models.gameStartModel.get('p2Color'),
							'column': (counter + 1),
							'row' : row
						});
					} else {
						
						terrArr[i] = new App.Models.Territory({
							'name' : thisTerr,
							'side': 'right',
							'remainingTurns' : 0,
							'isCapital' : true,
							'armyRank' : 2,
							'fortLevel' : 5,
							'small' : smallScreen,
							'color' : App.Models.gameStartModel.get('p2Color'),
							'column': (counter + 1),
							'row' : row
						});
					}

					rightTerrsArr.push(terrArr[i]);

					rightTotal++;
					counter++;

					if (counter == 2*rows) {
						counter = 0;
						row++;
					}

				}

				App.Views.terrView = new App.Views.Terr({model : terrArr[i]});

				if(terrArr[i].get('side') === 'left') {
					App.Views.leftViews.push(App.Views.terrView);
				} else {
					App.Views.rightViews.push(App.Views.terrView);
				}

				App.Collections.terrCollection.add(terrArr[i]);
				App.Views.allViews.push(App.Views.terrView);

				$('#battleZone').append(App.Views.terrView.$el);

			}

			App.Utilities.console("App.Views.leftViews: ");
			App.Utilities.console(App.Views.leftViews);
			App.Utilities.console("App.Views.rightViews: ");
			App.Utilities.console(App.Views.rightViews);


			App.Utilities.console("App.Views.allViews: ");
			App.Utilities.console(App.Views.allViews);

			App.Models.nationStats.get('left').set({
				'terrs': leftTerrsArr,
				'terrsWithTurns' : leftTerrsArr
			});

			App.Models.nationStats.get('right').set({
				'terrs': rightTerrsArr,
				'terrsWithTurns' : rightTerrsArr
			});

			App.Utilities.console("Territories Generated:")
			App.Utilities.console(App.Collections.terrCollection);

			App.Models.battleMapModel.set('mobileMode', smallScreen);

		},
		marketAdjective: function() {

			var adjArr = [" crashes " , " tumbles " , " collapses ", " plummets ", " plunges ", " drops suddenly ", " panic ", " sell-off "],
				rand = _.random(0, (adjArr.length - 1));

			return adjArr[rand];

		},
		newEconPopCalc: function(econPop, fortDamage, fortStrength) {
				
			var civCasRate,
				fortDamageMultiple = 1 + (100 - fortStrength) / 100;
			if(fortDamage >= 0.45) {
				civCasRate = (3 + fortDamage) / 100;
			} else if(fortDamage >= 0.35) {
				civCasRate = (2 + fortDamage) / 100;
			} else if(fortDamage >= 0.25) {
				civCasRate = (1 + fortDamage) / 100;
			} else {
				civCasRate = Math.random();
				while(civCasRate > 0.01){
					civCasRate = Math.random();
				}
			}

			econPop -= Math.round(econPop * (fortDamageMultiple * civCasRate));

			return econPop;
		},
		newEconPopGrowthRate: function(econPopObj) {
			// Max population growth is 5% (when population is 1,000,000+)
			var growthRate = 0,
				moralePiece = ((econPopObj.econMorale - 25) * Math.random()) / 50, // 1.5% max
				econStrPiece = ((econPopObj.econStrengh - 25) * Math.random()) / 50, // 1.5% max
				smallPopulation = econPopObj.econPop < 1000000 ? Math.random() * 10 : 0, // Max 10% boost if population is small
				highTaxPenalty = econPopObj.highTaxTurnLength ? econPopObj.highTaxTurnLength / 5 : 0,
				lowTaxCrashPenalty = econPopObj.lowTaxCrash ? 0.25 : 0,
				growthRate = smallPopulation + moralePiece + (econPopObj.econLevel / 5) + econStrPiece - this.growthDrags(econPopObj.econMorale) - this.growthDrags(econPopObj.econStrength) - highTaxPenalty - lowTaxCrashPenalty;

			return growthRate / 100;
		},
		newEconStrengthCalc: function(oldEconStrength, fortDamage, fortStrength) {
			var econDamage,
				fortDamageMultiple = 1 + (100 - fortStrength) / 100;
			if(fortDamage >= 0.75) {
				econDamage = Math.min(fortDamage, 0.9);
			} else if(fortDamage >= 0.5) {
				econDamage = Math.min(fortDamage, 0.8);
			} else if(fortDamage >= 0.25) {
				econDamage = Math.min(fortDamage, 0.5);
			} else {
				econDamage = fortDamage;
			}

			oldEconStrength -= oldEconStrength > 15 ?  Math.round(oldEconStrength * (fortDamageMultiple * econDamage)) :  Math.round(oldEconStrength * fortDamageMultiple * econDamage);

			return Math.round(oldEconStrength);
		},
		newGDPGrowthRate: function(econGDPObj) {
			var smallPopulation = econGDPObj.econPop < 1000000 ? Math.random() * 10 : 0, //Max 10% boost to GDP growth rate if population is small
				morale = Math.random() * 2 * (econGDPObj.econMorale / 100),
				econStrength = Math.random() * 2 * (econGDPObj.econStrength / 100),
				econLevel = econGDPObj.econLevel / 5,
				lowTaxes = econGDPObj.lowTaxTurnLength > 0 ? (econGDPObj.lowTaxTurnLength / 4) + Math.random() : 0,
				lowTaxes = econGDPObj.lowTaxCrash ? Math.random() * -5 + -5  : lowTaxes,  
				gdpGrowthRate =  smallPopulation + morale + econStrength + econLevel - this.growthDrags(econGDPObj.econMorale) - this.growthDrags(econGDPObj.econStrength) - this.growthDrags(econGDPObj.econStrength) - Math.min(econGDPObj.highTaxTurnLength, 10) + lowTaxes;
				return gdpGrowthRate / 100;
		},
		newRank : function(newXP, territory) {
			// Returns an army's updated rank based on gained experience during a turn
			var levelUp = newXP === 100,
				newRank = levelUp ? territory.get('armyRank') + 1 : territory.get('armyRank');

			if(levelUp && newRank <= App.Constants.MAX_RANK) {

				App.Utilities.console(territory.get('name') + ' was promoted to Rank ' + (1 + territory.get('armyRank')) + '.');

				var oldPromotedArr = App.Models.nationStats.get(territory.get('side')).get('armiesPromoted'),
					newPromotedArr = oldPromotedArr.slice();

				newPromotedArr.push(territory.get('name'));

				App.Models.nationStats.get(territory.get('side')).set('armiesPromoted', newPromotedArr);

			}

			return newRank;
		},
		setNextTrack: function() {
			var currSong = $('#ambientMusic')[0].currentSrc.substring($('#ambientMusic')[0].currentSrc.indexOf('audio/'));

			var indexOfCurrSong = App.Constants.AMBIENT_MUSIC.indexOf(currSong);
			var newSongArr;

		 	if(indexOfCurrSong != -1) {
			 	newSongArr = App.Constants.AMBIENT_MUSIC.slice();
			 	newSongArr.splice(indexOfCurrSong, 1);
		 	} else {
		 		newSongArr = App.Constants.AMBIENT_MUSIC;
		 	}

		 	newSong = newSongArr[_.random(0, (newSongArr.length - 1))];

			$('#ambientMusic').attr('src', newSong);
		},
		playNextTrack: function() {

			App.Utilities.setNextTrack();

		    /***************/
		    $('#ambientMusic')[0].pause();
		    $('#ambientMusic')[0].load();//suspends and restores all audio element

		    $('#ambientMusic')[0].oncanplaythrough = $('#ambientMusic')[0].play();

		},
		randomBattleOutcome: function(obj) {
			// Rename to reflect it returns a message

			var title = '',
				adjArr = [],
				isSkirmish = (obj.attCasRate < 0.05 && obj.defCasRate < 0.05) || obj.defArmyCas < 5000 && obj.attArmyCas < 5000,
				destroyArr = ['Annihilates', 'Nearly Destroys', 'Devastates', 'Wipes Out', 'Massacres', 'Slaughters', 'Decimates', 'Demolishes', 'Butchers', 'Mows Down', 'Obliterates'],
				blowOutArr = ['Clobbers', 'Thrashes', 'Overpowers', 'Shreds', 'Trounces', 'Overwhelms', 'Beats Up', 'Dominates', 'Shatters', 'Crushes'],
				winArr = ['Defeats', 'Blitzes', 'Whips', 'Assaults', 'Hammers', 'Bruises', 'Beats', 'Pummels', 'Ambushes', 'Pounds', 'Routes', 'Hits', 'Shells', 'Attacks'],
				closeWinArr = ['Narrowly Defeats', 'Edges', 'Barely Beats'],
				closeWinHighCasArr = ['Outlasts', 'Outfights', 'Outmaneuvers', 'Outflanks'],
				skirmishWinArr = ['Skirmishes with', 'Clashes with', 'Raids', 'Trades Mortars with', 'Exchanges Artillery Fire with', 'Exchanges Rocket Fire with'],
				defWinArr = ['Repels', 'Defeats', 'Beats', 'Routes', 'Fends Off', 'Holds Off', 'Beats Back', 'Drives Back', 'Pushes Back', 'Fights Off'];

			if (obj.attCasRate < obj.defCasRate) {

				if (isSkirmish) {
					adjArr = skirmishWinArr;
				} else if (obj.defCasRate - obj.attCasRate < 0.1 && obj.defCasRate < 0.75 && obj.attCasRate < 0.75) {
					adjArr = closeWinArr;
				} else if (obj.defCasRate - obj.attCasRate < 0.1 && obj.defCasRate >= 0.75 && obj.attCasRate >= 0.75) {
					adjArr = closeWinHighCasArr;
				} else if ((obj.defCasRate >= 0.05 && obj.defCasRate < 0.4 && obj.defCasRate/obj.attCasRate < 2) || obj.attCasRate >= 0.33) {
					adjArr = winArr;
				} else if (obj.defCasRate >= 0.4 && obj.attCasRate < 0.33 || obj.defCasRate/obj.attCasRate >= 2) {

					if(obj.defCasRate > 0.85) {
						adjArr = destroyArr;
					} else {
						adjArr = blowOutArr;
					}

				} else {
					adjArr = winArr;
				}

			} else {

				if (isSkirmish) {
					adjArr = skirmishWinArr;
				} else if (obj.attCasRate - obj.defCasRate < 0.1 && obj.defCasRate < 0.75 && obj.attCasRate < 0.75) {
					adjArr = closeWinArr;
				} else if (obj.defCasRate - obj.attCasRate < 0.1 && obj.defCasRate >= 0.75 && obj.attCasRate >= 0.75) {
					adjArr = closeWinHighCasArr;
				} else if ((obj.attCasRate >= 0.05 && obj.attCasRate < 0.4 && obj.attCasRate/obj.defCasRate < 2) || obj.defCasRate >= 0.33) {
					adjArr = defWinArr;
				} else if(obj.attCasRate >= 0.4 && obj.defCasRate < 0.33 && obj.attCasRate/obj.defCasRate >= 2) {

					if(obj.defCasRate > 0.85) {
						adjArr = destroyArr;
					} else {
						adjArr = blowOutArr;
					}

				} else {
					adjArr = defWinArr;
				}

			}

			var rand = _.random(0, (adjArr.length - 1));

			// Heavy casualties

			var casStr = '<ul><li>' + App.Utilities.addCommas(obj.defArmyCas) + ' ' + App.Models.clickedTerrModel.get('name') + ' Army casualties ('+Math.round((obj.defArmyCas / App.Models.clickedTerrModel.get('prvPopulation')) * 100) +'%)</li>' + 
							'<li>' + App.Utilities.addCommas(obj.attArmyCas) + ' ' + App.Models.selectedTerrModel.get('name') + ' Army casualties ('+Math.round((obj.attArmyCas / App.Models.selectedTerrModel.get('prvPopulation')) * 100) +'%)</li>' +
							'<li>' + App.Utilities.addCommas(obj.defCivCas) + ' ' + App.Models.clickedTerrModel.get('name') + ' Civilian casualties ('+Math.round((obj.defCivCas / App.Models.clickedTerrModel.get('prvEconPopulation')) * 100) +'%)</li></ul>';

			if (obj.defCasRate < obj.attCasRate && !isSkirmish) {
				title = App.Models.clickedTerrModel.get('name') + ' ' + adjArr[rand] + ' ' + App.Models.selectedTerrModel.get('name');
			} else {				
				title = App.Models.selectedTerrModel.get('name') + ' ' + adjArr[rand] + ' ' + App.Models.clickedTerrModel.get('name');
			}

			return 	{
						icon: "glyphicon glyphicon-globe",
						titleTxt: title,
						msgTxt : casStr,
						msgType: 'info',
						vert: 'bottom'
					};

		},
		randomSource: function() {

			var sourceArr = ["AP", "Reuters", "WSJ", "NYT", "CNBC", "Forbes"],
				rand = _.random(0, (sourceArr.length - 1));

			return sourceArr[rand];

		},
		recruitMax: function() {
			var side = this.activeSide(),
				armyLevel = App.Models.nationStats.get(side).get('armyTechLvl'),
				affordMax = parseInt(this.getTreasury() / (App.Constants.ARMY_UNIT_COST * armyLevel)),
				popMax = Math.round(App.Models.selectedTerrModel.get('econPopulation') / 2) - App.Constants.MIN_ECON_POP_RECRUITING;

			return Math.min(affordMax, popMax); 
		},
		removeClassName: function(className) {
			if(typeof className == 'object') {
				
				var i = 0;
				var len = className.length;
				for(i = 0; i < len; i++) {
					$('.' + className[i]).removeClass(className[i]);
				}
			} else {
				$('.' + className).removeClass(className);
			}
		},
		restartSkipBeginning: function() {

			App.Models.battleMapModel = new App.Models.BattleZone({
				'territories' : App.Models.battleMapModel.get('territories'),
				'mobileMode' : App.Defaults.mobileMode,
				'randomMap' : App.Models.battleMapModel.get('randomMap')
			});
			App.Views.battleMap = new App.Views.BattleZone({model: App.Models.battleMapModel});
			$('#game').html(App.Views.battleMap.$el);

			var initTreasury = App.Utilities.isMobile() ? App.Constants.STARTING_TREASURY_MOB : App.Constants.STARTING_TREASURY,
				initInfraCost = App.Utilities.isMobile() ? 18000000000 : 50000000000,
				initEconPopulation = App.Utilities.isMobile() ? 90000000 : 250000000,
				initArmyPopulation = App.Utilities.isMobile() && !App.Constants.TESTING_MODE ? 2250000 : 6250000;

			var LeftModel = new Emp({
				armyPopulationStart: initArmyPopulation,
				color: App.Models.nationStats.get('left').get('color'),
				econPopulationStart: initEconPopulation,
				econPopulationNow: initEconPopulation,
				nextTreasuryAddedEst: initTreasury,
				repairAllInfrastructureCost: initInfraCost,
				treasury: initTreasury,
				treasuryPrev: initTreasury,
				treasuryStart: initTreasury
			});
			        	
			var RightModel = new Emp({
				armyPopulationStart: initArmyPopulation,
				color: App.Models.nationStats.get('right').get('color'),
				econPopulationStart: initEconPopulation,
				econPopulationNow: initEconPopulation,
				nextTreasuryAddedEst: initTreasury,
				repairAllInfrastructureCost: initInfraCost,
				treasury: initTreasury,
				treasuryPrev: initTreasury,
				treasuryStart: initTreasury
			});
			App.Models.nationStats = new App.Models.NationStats({
				'left' : LeftModel,
				'right' : RightModel
			});
			App.Views.nationStatsView = new App.Views.NationStats({model: App.Models.nationStats});
			App.Collections.terrCollection = new App.Collections.Territories();
			App.Utilities.makeTerritories();
		},
		returnHighTaxLimit: function() {
			return App.Constants.HIGH_TAX_MORALE_AMT * 100;
		},
		returnLowTaxLimit: function() {
			return App.Constants.LOW_TAX_EC_CRASH_AMT * 100;
		},
		returnNextElectionYear: function() {
			return App.Models.nationStats.get('currentTurn') - App.Models.nationStats.get('currentTurn')%4 + 4;
		},
		returnRecentCrash: function(turns) {
			if(typeof turn == 'undefined') { // Shouldn't this be 'turns'?
				turns = 3;
			}

			return App.Models.nationStats.get('currentTurn') - App.Models.nationStats.get(App.Utilities.activeSide()).get('econCrashTurnPrv') > turns;

		},
		returnSelectedTerritoryIsLimited: function() {
			var popLimit = this.enoughPopToAttack(App.Models.selectedTerrModel),
				moraleLimit = this.enoughMoraleToAttack(App.Models.selectedTerrModel),
				invLimit = this.enoughPopToInvade(App.Models.selectedTerrModel);

			return popLimit === false || moraleLimit === false || invLimit === false;

		},
		returnSelectedTerritoryLimits: function() {
			var popLimit = this.enoughPopToAttack(App.Models.selectedTerrModel) ? "" : "Repair damaged infrastructure in the territory.",
				popLimit = App.Models.selectedTerrModel.get('armyPopulation') < (2 * App.Constants.ATTACK_ARMY_MINIMUM) ? "Recruit more units or send reinforcements from another territory." : popLimit,
				invLimit = this.enoughPopToInvade(App.Models.selectedTerrModel) ? "" : "Repair the infrastructure, recruit more units, or send reinforcements from another territory.",
				moraleLimit = this.enoughMoraleToAttack(App.Models.selectedTerrModel) ? "" : "Improve morale by training units, repairing and upgrading forts, and by adding units to the army.",
				limitsObj = {};

			if(popLimit.length > 0) {
				limitsObj.popLimit = popLimit;
			}

			if(invLimit.length > 0) {
				limitsObj.invLimit = invLimit;
			}

			if(moraleLimit.length > 0) {
				limitsObj.moraleLimit = moraleLimit;
			}

			return limitsObj;

		},
		returnTerrFortCost: function(model) {
			return App.Constants.FORT_STR_COST * model.get('fortLevel') * (100 - model.get('fortStrength'));
		},
		returnTerrInfraCost: function(model) {
			return Math.round(App.Constants.ECON_STR_COST * model.get('econLevel') * ((100 - model.get('econStrength')) / 10));
		},
		selectOrFocus: function(inputId) {
			var thisInput = $('#' + inputId);

			if(thisInput.val().length > 0 && !this.smallScreenOnly()) {
				thisInput.select();
			} else if (!this.smallScreenOnly()) {
				thisInput.focus();
			}

		},
		showModal: function() {
			$('#oneModal').modal({
				backdrop: 'static',
				keyboard: false
			});

			$('#oneModal').on('shown.bs.modal', function() {
				App.Views.battleMap.smoothScroll('.terr:first-child');
			});

		},
		template: function(id){
			return _.template( $('#' + id).html() );
		},
		territoryNames: function(namesTogether) {

			var terrNames = [
						'America', 'United Kingdom', 'France', 'Germany', 'Poland', 'Estonia', 'Ukraine', 'Sweden', 'Norway', 'Iceland', 'Mexico', 'Brazil',
						'Finland', 'Ireland', 'Russia', 'India', 'Pakistan', 'Iran', 'Iraq', 'Libya', 'Kuwait', 'UAE', 'Yemen', 'Syria', 'Australia',
						'China', 'North Korea', 'South Korea', 'Vietnam', 'Egypt', 'Tunisia', 'Greece', 'Italy', 'Spain', 'Portugal', 'Denmark', 'Switzerland',
						'Japan', 'Turkey', 'Chile', 'Peru', 'Cameroon', 'Morocco', 'Jamaica', 'Senegal', 'Mozambique', 'Afghanistan', 'New Zealand',
						'Canada', 'Colombia', 'Honduras', 'Bolivia', 'Ecuador', 'Panama', 'South Africa', 'Sierra Leone', 'Saudi Arabia', 'Philippines',
						'Bolivia', 'Argentina', 'Paraguay', 'Uruguay', 'Latvia', 'Belarus', 'Belgium', 'Romania', 'Algeria', 'Chad', 'Nigeria', 'Nicaragua',
						'Niger', 'Israel', 'Georgia', 'Liberia', 'Gabon', 'Ghana', 'Lebanon', 'Jordan', 'Oman', 'Nepal', 'Madagascar', 'Luxembourg', 'Singapore',
						'Burma', 'Mongolia', 'Laos', 'Taiwan', 'Bangledash', 'Malaysia', 'Thailand', 'Togo', 'Argentina', 'Venezuela', 'Greenland', 'Indonesia'
					];

			switch (namesTogether) {

				case 'civilwar':
					terrNames = [
						'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
						'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
						'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
						'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
						'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin',
						'Wyoming'
					];
					App.Models.battleMapModel.set('mapMode', namesTogether);
					break;
				case 'wallstreet':
					terrNames = [
						'Boeing', 'Apple', 'Microsoft', 'Google', 'IBM', '3M', 'Caterpillar', 'Chevron', 'Cisco', 'Coca Cola',
						'Exxon Mobil', 'General Electric', 'Goldman Sachs', 'Home Depot', 'Intel', 'Johnson', 'JP Morgan Chase',
						'McDonalds', 'Merck', 'Nike', 'Pfizer', 'Verizon', 'Starbucks', 'Tesla', 'Dominos',
						'Visa', 'Walmart', 'Disney', 'Facebook', 'Toyota', 'Wells Fargo', 'BP', 'GlaxoSmithkline',
						'Siemens', 'BASF','Samsung', 'Qualcomm', 'Philip Morris', 'Novartis', 'Citigroup', 'Amazon.com', 'Pfizer', 'Biogen',
						'MasterCard', 'Oracle', 'Intel', 'SAP', 'Nestle', 'Pepsi', 'Unilever', 'Volkswagen', 'Daimler', 'Shell',
						'Comcast', 'Spectrum', 'Walgreens', 'UPS', 'AT&T', 'Bayer', 'CVS Health', 'eBay', 'McKesson', 'GM', 'Ford',
						'Honda', 'Costco', 'Kroger', 'Nissan', 'Fannie Mae', 'BMW', 'Prudential', 'Hitachi', 'Hyundai', 'State Farm', 'Philips 66', 'Sony',
						'Target', 'Panasonic', 'Freddie Mac', 'Lowes', 'Dell', 'Metlife', 'Aetna', 'Mitsubishi', 'AIG', 'FedEx', 'HP', 
						'Dow Chemical', 'Cigna', 'Delta', 'Best Buy', 'Honeywell', 'Morgan Stanley', 'Tyson Foods', 'Allstate', 'Volvo',
						'Rite Aid', 'Subaru', 'Mazda', 'Deere', 'Macys', 'Raytheon', 'Progressive', 'Heineken', 'Aflac'
						];
					App.Models.battleMapModel.set('mapMode', namesTogether);
				 	break;
				case 'makebelieve':
					terrNames = [
						'Lilliput', 'Ecotopia', 'Gilead', 'Panem', 'Petoria', 'Joehio', 'Franklin', 'Arixo', 'Xanadu',
						'Pacifica', 'Tropico', 'Anchuria', 'Chimerica', 'Hidalgo', 'Tijata', 'Aldorria', 'Wadiya', 'Vadeem',
						'Vespugia', 'Urkesh', 'Urk', 'Tecala', 'Sangala', 'Sardovia', 'Sarkhan', 'Sokovia', 'Sunda', 'Rhelasia',
						'Ruritania', 'Latveria', 'Laurania', 'Kamistan', 'Kangan', 'Kasnia', 'Illyria', 'Ixania', 'Halla', 'Genosha',
						'Glovania', 'Guilder', 'Groland', 'Florin', 'Franchia', 'Erewhon', 'Estoccia', 'Danu', 'Deltora', 'Caledonia',
						'Carpathia', 'Cordinia', 'Cortuguay', 'Atlantis', 'Bahari', 'Honahlee', 'Basran', 'Balavia', 'Blefuscu', 'Bolumbia',
						'Buranda', 'Gondor', 'Mordor', 'Rohan', 'Rivendell', 'Isengard', 'Narnia', 'Hogwarts'
					];
					App.Models.battleMapModel.set('mapMode', namesTogether);
					break;
				case 'joshua':
				case 'wargames':
					App.Models.battleMapModel.set('mapMode', namesTogether);
					break;
				default:
					App.Models.battleMapModel.set('mapMode', '');
					// terrNames = [
					// 	'America', 'United Kingdom', 'France', 'Germany', 'Poland', 'Estonia', 'Ukraine', 'Sweden', 'Norway', 'Iceland', 'Mexico', 'Brazil',
					// 	'Finland', 'Ireland', 'Russia', 'India', 'Pakistan', 'Iran', 'Iraq', 'Libya', 'Kuwait', 'UAE', 'Yemen', 'Syria', 'Australia',
					// 	'China', 'North Korea', 'South Korea', 'Vietnam', 'Egypt', 'Tunisia', 'Greece', 'Italy', 'Spain', 'Portugal', 'Denmark', 'Switzerland',
					// 	'Japan', 'Turkey', 'Chile', 'Peru', 'Cameroon', 'Morocco', 'Jamaica', 'Senegal', 'Mozambique', 'Afghanistan', 'New Zealand',
					// 	'Canada', 'Colombia', 'Honduras', 'Bolivia', 'Ecuador', 'Panama', 'South Africa', 'Sierra Leone', 'Saudi Arabia', 'Philippines',
					// 	'Bolivia', 'Argentina', 'Paraguay', 'Uruguay', 'Latvia', 'Belarus', 'Belgium', 'Romania', 'Algeria', 'Chad', 'Nigeria', 'Nicaragua',
					// 	'Niger', 'Israel', 'Georgia', 'Liberia', 'Gabon', 'Ghana', 'Lebanon', 'Jordan', 'Oman', 'Nepal', 'Madagascar', 'Luxembourg', 'Singapore',
					// 	'Burma', 'Mongolia', 'Laos', 'Taiwan', 'Bangledash', 'Malaysia', 'Thailand', 'Togo', 'Argentina', 'Venezuela', 'Greenland', 'Indonesia'
					// ];
					// To Do: University and City territory names

			}

			return terrNames;

		},
		updateEconMorale: function(econMorObj) {
			// Returns a single territory's updated GDP when variables change within a turn
			// econMorObj only needs property if its value has CHANGED since the last action

			var side = econMorObj.side ? econMorObj.side : 'left',
				econStrength = econMorObj.econStrength ? econMorObj.econStrength : 0,
				econPopulation = econMorObj.econPopulation ? econMorObj.econPopulation : 0,
				econLevel = econMorObj.econLevel ? econMorObj.econLevel : 0,
				selectedArmyPop = econMorObj.selectedArmyPop ? econMorObj.selectedArmyPop : 0,
				selectedFortLevel = econMorObj.selectedFortLevel ? econMorObj.selectedFortLevel : 0,
				selectedFortStrength = econMorObj.selectedFortStrength ? econMorObj.selectedFortStrength : 0,
				selectedTaxRate = econMorObj.selectedTaxRate ? (100 * econMorObj.selectedTaxRate) : 0,
				oldTaxRate = econMorObj.oldTaxRate ? (100 * econMorObj.oldTaxRate) : 0,
				taxRateChange = selectedTaxRate - oldTaxRate != 0,
				genTaxBonuses = econMorObj.genTaxBonuses,
				leftHighTaxTurns = econMorObj.leftHighTaxTurnLength >= 3 ? econMorObj.leftHighTaxTurnLength * 5 : 0,
				rightHighTaxTurns = econMorObj.rightHighTaxTurnLength >= 3 ? econMorObj.rightHighTaxTurnLength * 5 : 0,
				leftLowTaxTurns = econMorObj.leftLowTaxTurnLength >= 3 ? econMorObj.leftLowTaxTurnLength : 0,
				rightLowTaxTurns = econMorObj.rightLowTaxTurnLength >= 3 ? econMorObj.rightLowTaxTurnLength : 0,
				morale = econMorObj.newMorale;

			var ecLowTaxTurnsImpact = 0;
			if(leftLowTaxTurns != 0 || rightLowTaxTurns != 0) {
				ecLowTaxTurnsImpact = side === 'left' ? Math.min(econMorObj.leftLowTaxTurnLength, 5) : Math.min(econMorObj.rightLowTaxTurnLength, 5);
				ecLowTaxTurnsImpact = App.Models.nationStats.get(side).get('econCrash') ? ecLowTaxTurnsImpact * -5 : ecLowTaxTurnsImpact * 3;
			}

			var ecFortStrBonus = selectedFortStrength >= 75 ? 2 : 0,
				ecLvlBonus = econLevel > 1 ? econLevel : 0,
				ftLvlBonus = selectedFortLevel ? selectedFortLevel : 0,
				armyPopBonus = econMorObj.selectedArmyPop ? Math.floor(selectedArmyPop / App.Constants.MIN_ARMY_FOR_MORALE) : 0,
				ecStrBonus = econStrength >= 75 ? Math.round((econStrength / 100) * 10) : 0,
				ecLowTaxBonus = genTaxBonuses && econMorObj.selectedTaxRate && selectedTaxRate < 15 ? Math.round(5 * ((15 - selectedTaxRate)/15))  : 0,
				ecLoweredTaxes = oldTaxRate - selectedTaxRate > 0 ? oldTaxRate - selectedTaxRate : 0,
				ecMoraleBonuses = ecFortStrBonus + ecLvlBonus + selectedFortLevel + ftLvlBonus + armyPopBonus + ecStrBonus + ecLowTaxBonus + ecLoweredTaxes;

			function fortDrag(fortStr) {
				var drag = Math.min(fortStr / 200, 10);
				drag = Math.max(drag, 3);
				return Math.round(drag);
			}

			var ecHighTaxManyTurnsDrag = 0;
			if(leftHighTaxTurns != 0 || rightHighTaxTurns != 0) {
				ecHighTaxManyTurnsDrag = side === 'left' ? Math.min(econMorObj.leftHighTaxTurnLength * 8, 50) : Math.min(50, econMorObj.rightHighTaxTurnLength * 8);
			}

			var ecStrengthDrag = econMorObj.econStrength ? Math.round((1 - (econStrength / 100)) * 10) : 0,
				ecArmyDrag =  econMorObj.selectedArmyPop && armyPopBonus === 0 ? 10 : 0,
				ecArmyLossesDrag = econMorObj.oldTerrArmyPop - econMorObj.selectedArmyPop > 0 ? Math.round(20 * ((econMorObj.oldTerrArmyPop - econMorObj.selectedArmyPop) / econMorObj.oldTerrArmyPop)) : 0,
				ecFortDrag = econMorObj.selectedFortStrength && selectedFortStrength < 50 ? fortDrag(selectedFortStrength) : 0,
				ecPopulationDrag = econMorObj.econPopulation ? econMorObj.oldEconPop - econMorObj.econPopulation : 0,
				ecPopulationDrag = ecPopulationDrag > 0 ? Math.round(ecPopulationDrag / 10000) : 0,
				ecHighTaxDrag = genTaxBonuses && econMorObj.selectedTaxRate && selectedTaxRate > App.Constants.HIGH_TAX_MORALE_AMT ? ecHighTaxManyTurnsDrag : 0,
				ecRaisedTaxes = selectedTaxRate - oldTaxRate > 0 ? selectedTaxRate - oldTaxRate : 0,
				ecMoraleDrags = ecStrengthDrag + ecArmyDrag + ecArmyLossesDrag + ecFortDrag + ecPopulationDrag + ecRaisedTaxes + ecHighTaxDrag;

			morale += ecMoraleBonuses - ecMoraleDrags + ecLowTaxTurnsImpact;
			morale = Math.min(morale, 100);
			morale = Math.max(morale, 1);

			return Math.round(morale);

		},
		updateGDP: function(newObj) {
			//Returns a single territory's updated GDP when variables are updated during a turn
			var newEconPopulation = newObj.newEconPopulation,
				perPersonBase = ((1 + (newObj.newLevel - 1)/5) * 1000) * ((newObj.newEconStrength / 20) + (newObj.newMorale / 20)),
				updateThisGDP = Math.round(perPersonBase * newEconPopulation) + Math.round(perPersonBase * newEconPopulation * (newObj.ecGrowthRate / 100));

			return updateThisGDP;
		},
		validateName: function(name, type) {

			var maxLength = function() {
				if(type == 'empire') {
					return 8;
				} else if (type == 'territory') {
					return 15;
				}
			}

			var errMsgObj = {};

			if(name.length > maxLength()) {
				errMsgObj.errCode = 1;
				errMsgObj.msg = 'Your ' + type + ' name can not exceed ' + maxLength() + ' characters.';
			} else if (name.length < 2) {
				errMsgObj.errCode = 2;
				errMsgObj.msg = 'Your ' + type + ' name must contain at least 2 characters.';
			} else if(!name.match(/^[a-zA-Z_ \.]*$/)) {
				errMsgObj.errCode = 3;
				errMsgObj.msg = 'Your ' + type + ' name must contain only letters and spaces.';
			} else if(App.Collections.terrCollection.duplicateNameCheck(name, type)) {
				errMsgObj.errCode = 4;
				errMsgObj.msg = 'Your ' + type + ' name must be unique.';
			} else {
				errMsgObj.errCode = 0;
				errMsgObj.msg = '';
			}

			return errMsgObj;

		},
		validName: function(name, maxLength) {
			// Regex matches letters & spaces only

			if(name.length > maxLength || name.length < 2 || !name.match(/^[a-zA-Z_ \.]*$/)) {
				return false;
			} else {
				return true;
			}
		},
		warpEls: function(els) {
			for(var i = 0; i < els.length; i++) {
				$(els[i]).each(function() {
					$(this).removeClass('tada').addClass('tada');
				});
			}
		}
	}

};