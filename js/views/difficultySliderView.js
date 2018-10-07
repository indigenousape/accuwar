 /*
 	[accuwar]: Turn-based Strategy Game
	Color Menu Views
*/ 

App.Views.DifficultySlider = Backbone.View.extend({
	template: App.Utilities.template('aiDifficultySlider'),
	initialize: function() {
		this.model.on('change', this.render, this); // when the model changes, re-render the view
		this.render();
	},
	render: function() {
		var oldDifficulty = this.model.get('aiDifficulty');
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.parent().addClass(this.className());
		if(typeof App.Models.gameStartModel.changed.aiDifficulty != "undefined") {
			$('#difficultyInput').focus();
		} else {
			App.Utilities.selectOrFocus('leftName');
		}

		return this;
	},
	className: function() {
		if(this.model.get('aiMode')) {
			return 'ai-mode';
		} else {
			return '';
		}
	},

});
