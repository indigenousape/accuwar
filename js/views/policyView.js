 /*
 	[accuwar]: Turn-based Strategy Game
	Enacted Policy View
*/ 

App.Views.PolicyView = Backbone.View.extend({
	template: App.Utilities.template('enactedPolicies'),
	initialize: function() {
		this.model.on('change', this.render, this); // when the model changes, re-render the view
		this.render();

	 	// Have to bind and unbind the range slider events on the fly
	 	// Event is different in IE
	 	if($('#confUpdatePolicy').length != -1 && !App.Utilities.detectIE()) {
	 		this.events['input #armyUnitsRange'] = "showRecruits";
	 		this.delegateEvents();
	 	} else if($('#confUpdatePolicy').length != -1) {
	 		this.events['change #armyUnitsRange'] = "showRecruits";
	 		this.delegateEvents();	
	 	}

	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	events: {
		'click .glyphicon-chevron-up' : 'moveUp',
		'click .glyphicon-chevron-down' : 'moveDown'
	},
	moveUp: function(e) {
		var thisEl = $(e.currentTarget);

		if(!thisEl.hasClass('disabled')) {
			var policyID = $(e.currentTarget).parent().parent().attr('data-enacted-id');
			var currentPriority = parseInt($(e.currentTarget).parent().parent().attr('data-priority'));
			var currPolicies = App.Utilities.activeEmpire().get('activePolicies');
			var reorderedIndex = _.indexOf(_.pluck(currPolicies, 'id'), policyID);

			currPolicies[reorderedIndex].priority = currentPriority - 1;
			currPolicies[(reorderedIndex - 1)].priority = currentPriority;
			currPolicies = _.sortBy(currPolicies, 'priority');
			App.Utilities.activeEmpire().set({
				'activePolicies': currPolicies,
				'activePolicyChange' : true
			});
		}
	},
	moveDown: function(e) {

		var thisEl = $(e.currentTarget);

		if(!thisEl.hasClass('disabled')) {
			var policyID = $(e.currentTarget).parent().parent().attr('data-enacted-id');
			var currentPriority = parseInt($(e.currentTarget).parent().parent().attr('data-priority'));
			var currPolicies = App.Utilities.activeEmpire().get('activePolicies');
			var reorderedIndex = _.indexOf(_.pluck(currPolicies, 'id'), policyID);

			currPolicies[reorderedIndex].priority = currentPriority + 1;
			currPolicies[(reorderedIndex + 1)].priority = currentPriority;
			currPolicies = _.sortBy(currPolicies, 'priority');
			App.Utilities.activeEmpire().set({
				'activePolicies': currPolicies,
				'activePolicyChange': true
			});
		}
	},
	showRecruits: function(e) {
		var thisVal = parseInt($('#armyUnitsRange').val());
		var policiesArr = App.Utilities.activeEmpire().get('activePolicies');
		var policyIndex = _.indexOf(_.pluck(policiesArr, 'id'), 'recruit_army');
		policiesArr[policyIndex].amount = thisVal;

		var perYearCost = App.Utilities.returnRecruitCost(policiesArr[policyIndex].amount) * App.Utilities.activeEmpire().get('terrs').length;
		$('#recruitsPerYearPol').text(App.Utilities.addCommas(thisVal));
		$('#recruitPerYearPolCost').text(App.Utilities.addCommas(perYearCost));
	}

});