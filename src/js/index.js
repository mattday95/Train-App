// JavaScript Document

class App {
	
	constructor() {
		
		this.init();
	}
	
	init() {
		
		alert('hi from app');
	}
}


$(document).ready( () => {
	
	
	const App = new App();
	App.init();
	
});