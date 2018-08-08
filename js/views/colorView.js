 /*
 	[accuwar]: Turn-based Strategy Game
	Color Menu Views
*/ 

App.Views.ColorView = Backbone.View.extend({
	template: App.Utilities.template('menuTemplate'),
	initialize: function() {
		this.model.on('change', this.render, this); // when the model changes, re-render the view
		this.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}

});

App.Views.RightColorView = Backbone.View.extend({
	template: App.Utilities.template('rightMenuTemplate'),
	initialize: function() {
		this.model.on('change', this.render, this); // when the model changes, re-render the view
		this.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}

});