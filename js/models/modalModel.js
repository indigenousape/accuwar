 /*
 	[accuwar]: Turn-based Strategy Game
 	Modal Model
*/ 

App.Models.Modal = Backbone.Model.extend({
	defaults: {
		title: '',
		showCancelBtn: true,
		confBtnClass: 'btn-primary',
		confBtnId: '',
		confBtnTxt: 'Confirm',
		noTurnsMsg: '',
		impactMsg: '',
		impactClass: 'text-success',
		field1: '',
		field2: '',
		errorMsg1: 'Test',
		errorMsg2: '',
		modalMsg: '',
		modalMsg2: '',
		modalView: {},
		attacking: {},
		defending: {},
		newObj: {},
		animationOver : false,
		rangeMax: 0,
		rangeMin: 0,
		rangeDef: 0,
		rangeStep: 100,
		showRange: false,
		stopClick: false,
		notification: {}
	}
});