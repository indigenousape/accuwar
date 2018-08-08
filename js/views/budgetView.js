 /*
 	[accuwar]: Turn-based Strategy Game
	Budget View
*/ 

App.Views.BudgetView = Backbone.View.extend({
	template: App.Utilities.template('budgetList'),
	initialize: function() {
		this.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}

});