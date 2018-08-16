 /*
 	[accuwar]: Turn-based Strategy Game
	Release: 3.1 Alpha
	Author: Josh Harris
	8/17/2018
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
		ARMY_TRAINING_COST: 10000000, // Training cost per 1000 units
		ARMY_UNIT_COST: 50000, // Per unit cost
		ATTACK_ARMY_MINIMUM: 2000, // Minimum army units required to attack 
		ATTACK_INVADE_ARMY_MINIMUM: 10000, // Minimum army units required to invade
		ATTACK_MORALE_MINIMUM: 20, // Minimum unit morale required to attack
		COLOR_OPTIONS: ['blue', 'orange', 'green', 'purple', 'pink'],
		COLOR_OPTIONS_DISP: ['Blue', 'Orange', 'Green', 'Purple', 'Pink'],
		COST_PER_RECRUIT: 50000,
		DELAY_SHORTEST: 3, // Notification delays (in seconds)
		DELAY_DEFAULT: 6,
		DELAY_INFINITE: 0,
		ECON_LVL_UP_AMT: 10000000000,
		ECON_STR_COST: 1000000000, // Per 10 strength added
		FORT_LVL_COST: 10000000000, // Per fort level, per territory
		FORT_STR_COST: 500000000, // Per 10 strength added
		GDP_PENALTY_LOW_TAX: 0.86,
		GDP_PENALTY_REG_CRASH: 0.88,
		HIGH_TAX_MORALE_AMT: 0.5,
		LEVEL_0_MOR_PER_TURN_MULT: 1.05, // Army morale growth rate
		LOGGING: false, // Sets whether console messages are logged
		LOW_TAX_EC_CRASH_AMT: 0.15,
		MAX_FORT_LEVEL: 10,
		MAX_RANK: 5,
		MAX_TECH_LEVEL: 10,
		MIN_ARMY_FOR_MORALE: 250000,
		MIN_ECON_POP_RECRUITING: 1000,
		PLAYER_1_DEF_START_COLOR: 'blue',
		PLAYER_2_DEF_START_COLOR: 'orange',
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
				side: 'left',
				id: 'upgrade_forts',
				title: 'Upgrade forts',
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
			},
			{
				side: 'right',
				id: 'upgrade_forts',
				title: 'Upgrade forts',
				priority: 0
			}
		],
		RECRUIT_ARMY_MINIMUM: 1000, // Minimum army units that can be recruited
		START_TURN: startYear,
		START_ARMY_UNITS: 250000,
		STARTING_TERRITORIES: 25,
		STARTING_TERRITORIES_MOB: 9,
		STARTING_TREASURY: 500000000000,
		STARTING_TREASURY_MOB: 180000000000,
		TERR_WARNINGS: [
			{
				army_cant_invade: 'Not enough units to invade.',
				army_trapped: 'Army unable to mobilize due to damaged infrastructure.',
				gdp_shrinking: 'Economy shrinking.',
				pop_shrinking: 'Population shrinking.',
				below_min_army_units: 'Not enough army units to attack.',
				below_min_army_morale: 'Severely low army morale.',
				below_25_infr_str: 'Severely damaged infrastructure.',
				below_25_fort_str: 'Severely damaged fort.',
				below_25_econ_mor: 'Severely low civilian morale.'
			}
		],
		TESTING_MODE: false, // Set to true to give left side a huge advantage and other test conditions
		VICTORY_MUSIC: [
			{
				def: 'audio/victory.mp3',
				rebels: 'audio/victory_rebels.mp3',
				union: 'audio/victory_union.mp3',
				college: 'audio/victory_college.mp3',
				wallstreet: 'audio/victory_wallstreet.mp3',
				wargames: 'audio/victory_wargames.mp3'
			}
		],
		XP_PER_BATTLE: 5 // Base XP per battle. Actual XP earned is computed based on this value.
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
		console: function(msg) {
			if(App.Constants.LOGGING) {
				console.log(msg);
			}
		},
		crashNotification: function(currGDPPenalty) {

			var formattedGDPPenalty = currGDPPenalty > 1000000000 ? currGDPPenalty - (currGDPPenalty%1000000000) : currGDPPenalty - (currGDPPenalty%1000000),
				sinceLastCrash = App.Models.nationStats.get(this.activeSide()).get('econCrashTurn') - App.Models.nationStats.get(this.activeSide()).get('econCrashTurnPrv');

			var againTxt = sinceLastCrash <= 2 && sinceLastCrash > 0 ? 'again' : '';

			var msgObj = {
				icon: "glyphicon glyphicon-globe",
				titleTxt : this.randomSource() + ": Market " + this.marketAdjective() + " "+ againTxt + " in&nbsp;" + App.Models.nationStats.get(this.activeSide()).get('empName'),
				msgTxt : "$" + this.addCommas(Math.round(formattedGDPPenalty)) + " wiped out from the economy in " + App.Models.nationStats.get('currentTurn') + ". Market fever blamed. Economists recommend raising taxes to stabilize&nbsp;nerves."
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
		getEmpireName: function(side) {
			return App.Models.nationStats.get(side).get('empName') ? App.Models.nationStats.get(side).get('empName') : '';
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
			        msgText = "<p>Business leaders warn that high taxes will damage the " + this.getActiveEmpireName() + " economy over&nbsp;time.</p>";
			        showMsg = true;
			        break;
			    case 3:
			        msgTitle = "Bloomberg: " + this.getActiveEmpireName() + " Shoppers Spend Less";
			        msgText = "<p>Citizens across " + this.getActiveEmpireName() + " are spending less after tax hike. Business owners are nervous for the&nbsp;future.</p>";
			        showMsg = true;
			        break;
			    case 4:
			        msgTitle = "WSJ: " + this.getActiveEmpireName() + " Businesses Flee";
			        msgText = "<p>Recession fears as major employers close up shop and seek lower tax rates elsewhere. Citizens are scrambling to find&nbsp;work.</p>";
			        showMsg = true;
			        break;
			    case 5:
			        msgTitle = "CNN: Citizens Demand Lower Taxes";
			        msgText = "<p>Angry citizens pack town halls across " + this.getActiveEmpireName() + " demanding tax relief to combat shrinking&nbsp;economy.</p>";
			        showMsg = true;
			        break;
			    case 6:
			        msgTitle = "NPR: Homelessness in " + this.getActiveEmpireName();
			        msgText = "<p>Desperation across " + this.getActiveEmpireName() + " as high taxes drive jobs away. Community leaders urge tax&nbsp;relief.</p>";
			        showMsg = true;
			        break;
			    case 7:
			        msgTitle = "MSNBC: Nationwide Protests Erupt";
			        msgText = "<p>Protests disrupt peaceful communities across " + this.getActiveEmpireName() + " as angry citizens take to the streets over high taxes, scarce jobs, and unresponsive&nbsp;leaders.</p>";
			        showMsg = true;
			        break;
			    case 8:
			        msgTitle = "Fox: Riots Grip " + this.getActiveEmpireName();
			        msgText = "<p>Thousands injured as demonstrations against failing economy grow violent. Hundreds&nbsp;arrested.</p>";
			        showMsg = true;
			        break;
			    case 9:
			        msgTitle = "WSJ: " + this.getActiveEmpireName() + " Economy in Danger Zone";
			        msgText = "<p>Economists warn tax relief needed soon or the " + this.getActiveEmpireName() + " economy may never&nbsp;recover.</p>";
			        showMsg = true;
			        break;
			    case 10:
			        msgTitle = "NPR: Citizens Leaving " + this.getActiveEmpireName();
			        msgText = "<p>Long lines at the border as citizens flee " + this.getActiveEmpireName() + " to seek a better life&nbsp;elsewhere.</p>";
			        showMsg = true;
			        break;
			    case 11:
			        msgTitle = "Fox: Crime Wave Strikes " + this.getActiveEmpireName();
			        msgText = "<p>Murders, robberies, and gang violence on the increase as depression continues. Citizens desperate for&nbsp;help.</p>";
			        showMsg = true;
			        break;
			    case 12:
			        msgTitle = "NYT: " + this.getActiveEmpireName() + " Economy Continues Plunge";
			        msgText = "<p>No end in sight as the " + this.getActiveEmpireName() + " economy continues to shrink. Advisors recommend tax&nbsp;cuts.</p>";
			        showMsg = true;
			        break;
			    case 13:
			        msgTitle = "AP: Depression Continues in " + this.getActiveEmpireName();
			        msgText = "<p>Citizens desperate as crime and unemployment spiral out of control in " + this.getActiveEmpireName() + ". Business leaders urge tax&nbsp;cut.</p>";
			        showMsg = true;
			        break;
			    case 14:
			        msgTitle = "NYT: Leaders Silent in " + this.getActiveEmpireName();
			        msgText = "<p>Citizens furious as government officials refuse to take steps to save crashing&nbsp;economy.</p>";
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
		lowTaxNotification: function(lowTaxTurnLength) {

			var msgTitle = "",
				msgText = "",
				showMsg = false,
				lowTaxTurnLength = lowTaxTurnLength > 15 ? _.random(0, (lowTaxTurnLength)) : lowTaxTurnLength;

			switch(lowTaxTurnLength) {
			    case 2:
			    	var growthTxt = this.returnRecentCrash() ? 'growing' : 'recovering';
			        msgTitle = "WaPo: Spending Up Across&nbsp;" + this.getActiveEmpireName();
			        msgText = "<p>Shops stay open late as citizens open their wallets in the rapidly " + growthTxt + "&nbsp;economy.</p>";
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
			        msgText = "<p>Experts warn keeping taxes too low for too long risks frequent market crashes in " + this.getActiveEmpireName() + ".</p>";
			        showMsg = true;
			        break;
			    case 5:
			    	var reTxt = this.returnRecentCrash() ? 'Soars' : 'Recovering';
			        msgTitle = this.randomSource() + ": Real Estate Market "+reTxt+" in&nbsp;" + App.Models.nationStats.get('currentTurn');
			        msgText = "<p>People are taking advantage of low interest rates and buying second and third homes across the&nbsp;empire.</p>";
			        showMsg = true;
			        break;
			    case 6:
			        msgTitle = "NPR: Infrastructure Crumbling Across&nbsp;" + this.getActiveEmpireName();
			        msgText = "<p>Territories are struggling to maintain roads, bridges, and tunnels with less funding from the empire. Experts suggest raising&nbsp;taxes.</p>";
			        showMsg = true;
			        break;
			    case 7:
			    	var mktTxt = this.returnRecentCrash() ? 'Breaks&nbsp;Records' : '&nbsp;Strengthening';
			        msgTitle = this.randomSource() + ": " + this.getActiveEmpireName() + " Stock Market " + mktTxt;
			        msgText = "<p>Stock traders rejoice as the " + this.getActiveEmpireName() + " stock market sets new records for growth in&nbsp;" + App.Models.nationStats.get('currentTurn') + ".</p>";
			        showMsg = true;
			        break;
			    case 8:
			    	var empTxt = this.returnRecentCrash() ? ' at All Time&nbsp;Lows' : '&nbsp;Shrinking';
			    	var ecTxt = this.returnRecentCrash() ? 'to boom' : 'strong recovery';
			        msgTitle = "WaPo: " + this.getActiveEmpireName() + " Unemployment" + empTxt;
			        msgText = "<p>Employers scramble to find workers as economy continues "+ecTxt+" in&nbsp;" + App.Models.nationStats.get('currentTurn') + ".</p>";
			        showMsg = true;
			        break;
			    case 9:
			        msgTitle = "NPR: Poverty Declines Across&nbsp;" + this.getActiveEmpireName();
			        msgText = "<p>Citizens enjoying higher pay and higher standards of living all across the empire. Leaders credit business-friendly tax environment.</p>";
			        showMsg = true;
			        break;
			    case 10:
			    	var crashTxt = this.returnRecentCrash(4) ? 'a Thing of the&nbsp;Past?' : 'Here to&nbsp;Stay?';
			    	var specTxt = this.returnRecentCrash(4) ? 'and self-regulation are the keys to a healthy&nbsp;economy' : 'are like gambling with the ' + this.getActiveEmpireName() + '&nbsp;economy';
			        msgTitle = this.randomSource() + ": Market Crashes " + crashTxt;
			        msgText = "<p>Experts say low taxes&nbsp;"+specTxt+".</p>";
			        showMsg = true;
			        break;
			    case 11:
			        msgTitle = "AAA: Citizens On The&nbsp;Go";
			        msgText = "<p>Citizens in " + this.getActiveEmpireName() + " planning longer vacations, more family trips in&nbsp;" + App.Models.nationStats.get('currentTurn') + ".</p>";
			        showMsg = true;
			        break;
			    case 12:
			    	var strongTxt = this.returnRecentCrash() ? 'another strong year for the&nbsp;economy' : 'a strong economic&nbsp;recovery';
			        msgTitle = this.randomSource() + ": Strong Growth Forecast in&nbsp;" + App.Models.nationStats.get('currentTurn');
			        msgText = "<p>Low taxes mean big business in " + this.getActiveEmpireName() + ". Experts predict&nbsp;"+strongTxt+".</p>";
			        showMsg = true;
			        break;
			    case 13:
			        msgTitle = "WaPo: Higher Taxes&nbsp;Ahead?";
			        msgText = "<p>Leaders seeking re-election in " + this.returnNextElectionYear() + " face increasing pressure to raise taxes to shore up crumbling infrastructure, fund the military, and stabilize the&nbsp;economy.</p>";
			        showMsg = true;
			        break;
			    case 14:
			    	var extraTxt = this.returnRecentCrash() ? '' : ' despite recent&nbsp;hardships';
			        msgTitle = "Fox News: Immigrants Flock to&nbsp;" + this.getActiveEmpireName();
			        msgText = "<p>The Red Cross reports long lines at the border as immigrants come to " + this.getActiveEmpireName() + " seeking new&nbsp;opportunities"+extraTxt+".</p>";
			        showMsg = true;
			        break;
			    case 15:
			    	var fraudAmt = App.Models.nationStats.get(this.activeSide()).get('treasury') > 100000000000 ? _.random(50, 250) + '&nbsp;billion' : _.random(50, 250) + '&nbsp;million';
			        msgTitle = "MSNBC: Corporate Scandals Make&nbsp;Headlines";
			        msgText = "<p>Industry titans face charges as investors seek damages following $"+fraudAmt+" financial fraud. Leaders promise stronger&nbsp;regulations.</p>";
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

			var starGroup = newRankObj.updateRank ? '<span class="rank-stars" aria-hidden="true"><strong>' : '<span class="rank-stars" aria-hidden="true"><strong>',
				emptyStarHTML = '<span class="glyphicon glyphicon-star-empty"></span>',
				filledStarHTML = '<span class="glyphicon glyphicon-star"></span>';
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
			var startingTerritories = App.Utilities.territoryNames('left', 'right');

			for(var i = 1; i <= (eachSide * 2); ++i) {

				var thisTerrIndex = _.random(0, (startingTerritories.length - 1)),
				 	thisTerr = startingTerritories[thisTerrIndex];
				
				startingTerritories.splice(thisTerrIndex, 1);

				if(counter < (eachSide / rows)) {

					leftRow++;

					var armyPopulation = App.Constants.TESTING_MODE ? 2500000 : App.Constants.START_ARMY_UNITS;
					var xp = App.Constants.TESTING_MODE ? 99 : 0;

					var fortLevel = counter === borderStartLeft ? 2 : 1;

					if(leftTotal != capitalLeft) {
						terrArr[i] = new App.Models.Territory({
							'name' : thisTerr,
							'side': 'left',
							'color' : 'blue',
							'armyPopulation' : armyPopulation,
							'startPopulation' : armyPopulation,
							'armyXP' : xp,
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
		playNextTrack: function() {
			App.Utilities.setNextTrack();

		    $('#ambientMusic')[0].pause();
		    $('#ambientMusic')[0].load();//suspends and restores all audio element

		    $('#ambientMusic')[0].oncanplaythrough = $('#ambientMusic')[0].play();

		},
		playVictoryTrack: function() {
			$('#ambientMusic').off()
			$('#ambientMusic').attr('src', App.Utilities.victoryTrackSource());
		    $('#ambientMusic')[0].pause();
		    $('#ambientMusic')[0].load();
		    $('#ambientMusic')[0].oncanplaythrough = $('#ambientMusic')[0].play();
	    	$('#ambientMusic').bind('ended', App.Utilities.playVictoryTrack);
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
		recruitUnitsModal: function(model) {
			var spModalModel = new App.Models.Modal({
					title: 'Recruit Army Units: ' + model.get('name'),
					confBtnId: 'confNewRecruits',
					modalMsg: '<p class="form-text" id="recruit-label">How many army units should ' + model.get('name') + ' recruit from the civilian population?</p>',
					impactMsg: '<span>Cost $<span id="recruitCost">' + App.Utilities.addCommas( Math.round(10000 * App.Constants.COST_PER_RECRUIT)) + '</span></span><span class="pull-right"><span id="recruitCount">10,000</span> Units</span>',
					impactClass: 'text-muted',
					noTurnsMsg: 'Ends turn for ' + model.get('name') + '.',
					confBtnClass: 'btn-danger',
					showRange: true,
					rangeMin: App.Constants.RECRUIT_ARMY_MINIMUM,
					rangeMax: App.Utilities.recruitMax() - App.Utilities.recruitMax()%100,
					rangeVal: 10000,
					ariaLabel: 'recruit-label'
				});

			var spModalView = new App.Views.SinglePromptModal({model: spModalModel});
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
		restartSkipBeginning: function() {

			App.Models.battleMapModel = new App.Models.BattleZone({
				'territories' : App.Models.battleMapModel.get('territories'),
				'mobileMode' : App.Defaults.mobileMode,
				'randomMap' : App.Models.battleMapModel.get('randomMap'),
				'audio' : App.Models.battleMapModel.get('audio'),
				'tipsMode': App.Models.battleMapModel.get('tipsMode')
			});
			App.Views.battleMap = new App.Views.BattleZone({model: App.Models.battleMapModel});
			$('#game').html(App.Views.battleMap.$el);

			var initTreasury = App.Utilities.isMobile() ? App.Constants.STARTING_TREASURY_MOB : App.Constants.STARTING_TREASURY,
				initInfraCost = App.Utilities.isMobile() ? 18000000000 : 50000000000,
				initEconPopulation = App.Utilities.isMobile() ? 90000000 : 250000000,
				initArmyPopulation = App.Utilities.isMobile() && !App.Constants.TESTING_MODE ? 2250000 : 6250000,
				initEconOutput = App.Utilities.isMobile() && !App.Constants.TESTING_MODE ? 720000000000 : 2000000000000;

			var LeftModel = new Emp({
				armyPopulationStart: initArmyPopulation,
				color: App.Models.nationStats.get('left').get('color'),
				econPopulationStart: initEconPopulation,
				econPopulationNow: initEconPopulation,
				nextTreasuryAddedEst: initTreasury,
				repairAllInfrastructureCost: initInfraCost,
				treasury: initTreasury,
				treasuryPrev: initTreasury,
				treasuryStart: initTreasury,
				econOutput: initEconOutput,
				econOutputStart: initEconOutput
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
				treasuryStart: initTreasury,
				econOutput: initEconOutput,
				econOutputStart: initEconOutput
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
		returnNextElectionYear: function() {
			return App.Models.nationStats.get('currentTurn') - App.Models.nationStats.get('currentTurn')%4 + 4;
		},
		returnRecentCrash: function(turns) {
			if(typeof turn == 'undefined') { // Shouldn't this be 'turns'?
				turns = 3;
			}

			return App.Models.nationStats.get('currentTurn') - App.Models.nationStats.get(App.Utilities.activeSide()).get('econCrashTurnPrv') > turns;

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
		returnSelectedTerritoryIsLimited: function() {
			var popLimit = this.enoughPopToAttack(App.Models.selectedTerrModel),
				moraleLimit = this.enoughMoraleToAttack(App.Models.selectedTerrModel),
				invLimit = this.enoughPopToInvade(App.Models.selectedTerrModel);

			return popLimit === false || moraleLimit === false || invLimit === false;

		},
		returnSelectedTerritoryLimits: function() {
			var popLimit = this.enoughPopToAttack(App.Models.selectedTerrModel) ? "" : "Repair damaged infrastructure in the&nbsp;territory.",
				popLimit = App.Models.selectedTerrModel.get('armyPopulation') < (2 * App.Constants.ATTACK_ARMY_MINIMUM) ? "Recruit more units or send reinforcements from another&nbsp;territory." : popLimit,
				invLimit = this.enoughPopToInvade(App.Models.selectedTerrModel) ? "" : "Repair the infrastructure, recruit more units, or send reinforcements from another&nbsp;territory.",
				moraleLimit = this.enoughMoraleToAttack(App.Models.selectedTerrModel) ? "" : "Improve morale by training units, repairing and upgrading forts, and by adding units to the&nbsp;army.",
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
		returnSimpleBarColors: function(model, property) {
			if (model.get(property) > 80) {
				return {
					'background' : 'green',
					'text': 'white'
				}
			} else if(model.get(property) > 25) {
				return {
					'background' : 'yellow',
					'text': ''
				}
			} else {
				return {
					'background' : 'red',
					'text' : ''
				}
			}
		},
		returnSimpleTerrBarColors: function(model, property) {
			if (model.get(property) > 75) { 
				return {
					'background' : 'green',
					'text' : 'white'
				}
			} else if(model.get(property) > 25) {
				return {
					'background' : 'yellow',
					'text' : ''
				}
			} else {
				return {
					'background': 'red',
					'text' : ''
				}
			}
		},
		returnStandardBarColors: function(model, property, startProperty) {
			if ((model.get(property) / model.get(startProperty)) * 100 > 80) {
				return {
							'background' : 'green',
							'text': 'white'
						};
			} else if((model.get(property) / model.get(startProperty)) * 100 > 25) {
				return {
						'background' : 'yellow',
						'text' : ''
					};
			} else {
				return {
					'background' : 'red',
					'text' : ''
				};
			}
		},
		returnTerrFortCost: function(model) {
			return App.Constants.FORT_STR_COST * model.get('fortLevel') * (100 - model.get('fortStrength'));
		},
		returnTerrInfraCost: function(model) {
			return Math.round(App.Constants.ECON_STR_COST * model.get('econLevel') * ((100 - model.get('econStrength')) / 10));
		},
		returnTerrWarnings: function(model) {

			var warnings = [];

			if(model.get('econGrowthPct') < 0) {
				warnings.push('gdp_shrinking');
			}
					
			if(model.get('econPopulationGrowthPct') < 0) {
				warnings.push('pop_shrinking');
			}

			if((model.get('armyPopulation') * model.get('econStrength') / 100) < 2 * App.Constants.ATTACK_ARMY_MINIMUM && (model.get('armyPopulation') > (2 * App.Constants.ATTACK_ARMY_MINIMUM))) {
				warnings.push('army_trapped');
			}

			if((model.get('armyPopulation') * model.get('econStrength') / 100) < 2 * App.Constants.ATTACK_INVADE_ARMY_MINIMUM && 
				(model.get('armyPopulation') * model.get('econStrength') / 100) >= 2 * App.Constants.ATTACK_ARMY_MINIMUM) {
				warnings.push('army_cant_invade');
			}

			if(model.get('armyPopulation') < (2 * App.Constants.ATTACK_ARMY_MINIMUM)) {
				warnings.push('below_min_army_units');
			}

			if(model.get('morale') < App.Constants.ATTACK_MORALE_MINIMUM) {
				warnings.push('below_min_army_morale');
			}

			if(model.get('econStrength') < 25) {
				warnings.push('below_25_infr_str');
			}

			if(model.get('fortStrength') < 25) {
				warnings.push('below_25_fort_str');
			}

			if(model.get('econMorale') < 25) {
				warnings.push('below_25_econ_mor');
			}

			return warnings;

		},
		selectOrFocus: function(inputId) {
			var thisInput = $('#' + inputId);

			if(thisInput.val().length > 0 && !this.smallScreenOnly()) {
				thisInput.select();
			} else if (!this.smallScreenOnly()) {
				thisInput.focus();
			}

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
		showModal: function() {
			$('#oneModal').modal({
				backdrop: 'static',
				keyboard: false
			});

			$('#oneModal').on('shown.bs.modal', function() {
				App.Views.battleMap.smoothScroll('.terr:first-child');
			});

		},
		smallScreenOnly: function() {

			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
				h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
				smallScreen = w <= 1200 || (w < 1280 && h < 813);

			return smallScreen;
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
				case 'college':
					terrNames = [
						'NC State', 'Duke', 'UNC', 'Central Michigan', 'Kennesaw State', 'Pittsburgh', 'Full Sail', 'Kansas State', 'CUNY Manhattan',
						'Connecticut', 'Oklahoma', 'SoCal', 'Riverside', 'Wisconsin', 'Oklahoma State', 'George Mason', 'James Madison', 'SUNY Buffalo',
						'Oregon State', 'Oregon', 'Fresno State', 'Georgia State', 'Wake Forest', 'Kent State', 'East Carolina', 'Arkansas', 'Auburn', 'UNC Charlotte',
						'Iowa', 'VCU', 'California St.', 'UCLA', 'Colorado State', 'Tennessee', 'West Virginia', 'Cincinnati', 'San Jose State', 'LSU', 'Virginia Tech',
						'Virginia', 'Temple', 'Maryland', 'Texas Tech', 'Kentucky', 'Kansas', 'Michigan', 'Michigan State', 'Ohio', 'Ohio State', 'BYU', 'Liberty', 'UC Davis',
						'Purdue', 'Alabama', 'Florida', 'Florida State', 'Georgia Tech', 'Georgia State', 'Arizona', 'Indiana', 'Rutgers', 'Central Florida', 'Arizona State',
						'Penn State', 'Texas', 'Texas A M', 'Boston College', 'Syracuse', 'Clemson', 'Notre Dame', 'Army', 'Navy', 'Miami', 'Georgia', 'Louisville'
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

			}

			return terrNames;

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
				ecGovernorKilledDrag = econMorObj.governorCasualty ? 3 : 0;
				ecHighTaxDrag = genTaxBonuses && econMorObj.selectedTaxRate && selectedTaxRate > App.Constants.HIGH_TAX_MORALE_AMT ? ecHighTaxManyTurnsDrag : 0,
				ecRaisedTaxes = selectedTaxRate - oldTaxRate > 0 ? selectedTaxRate - oldTaxRate : 0,
				ecMoraleDrags = ecStrengthDrag + ecArmyDrag + ecArmyLossesDrag + ecFortDrag + ecPopulationDrag + ecRaisedTaxes + ecHighTaxDrag + ecGovernorKilledDrag;

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
		upgradeTerrArmyFortLevel: function(model, policyMode) {

			if(typeof model === "undefined") {
				model = App.Models.selectedTerrModel;
			}

			var newLvl = 1 + model.get('fortLevel'),
				armyMorale = model.get('morale'),
				armyMorale = Math.round(armyMorale + (newLvl * 10)),
				armyMorale = Math.min(armyMorale, 100),
				econMorale = App.Utilities.updateEconMorale({
					selectedFortLevel : newLvl,
					newMorale : model.get('econMorale')
				}),
				updateThisGDP = App.Utilities.updateGDP({
					newMorale : econMorale,
					newEconStrength: model.get('econStrength'),
					newEconPopulation : model.get('econPopulation'),
					newLevel : model.get('econLevel'),
					ecGrowthRate: model.get('econGrowthPct')

				});

			var removeLevelUpButton = policyMode ? false : true;

			model.set({
				'economicOutput' : updateThisGDP,
				'fortLevel' : newLvl,
				'econMorale' : econMorale,
				'fortLeveledUp': removeLevelUpButton,
				'morale' : armyMorale,
				'diffToNextFortLvl' : App.Constants.FORT_LVL_COST * (1 + newLvl)
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
				errMsgObj.msg = 'Your ' + type + ' name can not exceed ' + maxLength() + '&nbsp;characters.';
			} else if (name.length < 2) {
				errMsgObj.errCode = 2;
				errMsgObj.msg = 'Your ' + type + ' name must contain at least 2&nbsp;characters.';
			} else if(!name.match(/^[a-zA-Z_ \.]*$/)) {
				errMsgObj.errCode = 3;
				errMsgObj.msg = 'Your ' + type + ' name must contain only letters and&nbsp;spaces.';
			} else if(App.Collections.terrCollection.duplicateNameCheck(name, type)) {
				errMsgObj.errCode = 4;
				errMsgObj.msg = 'Your ' + type + ' name must be&nbsp;unique.';
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
		victoryTrackSource: function() {
			var mode = App.Models.battleMapModel.get('mapMode');
			switch (mode) {

				case 'civilwar':
					if(App.Utilities.activeSide() == 'left') {
						return App.Constants.VICTORY_MUSIC[0]['union'];
					} else {
						return App.Constants.VICTORY_MUSIC[0]['rebels'];
					}
					break;
				case 'wargames':
					return App.Constants.VICTORY_MUSIC[0]['wargames'];
					break;
				case 'college':
					return App.Constants.VICTORY_MUSIC[0]['college']
					break;
				case 'wallstreet':
					return App.Constants.VICTORY_MUSIC[0]['wallstreet'];
					break;
				default:
					return App.Constants.VICTORY_MUSIC[0]['def'];

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