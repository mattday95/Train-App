// JavaScript Document

export default class App {
	
	constructor() {
		
		this.app = $('#app');
		this.inputs = this.app.find('input');
		this.baseURL = "https://huxley.apphb.com";
		this.suggestionLists = this.app.find('.suggestion-list');
		this.regAccessToken = "d683dbbd-129a-40c7-92b8-3c74f2f012e4";
		this.loadDuration = 1500;
		this.stationNames = [];
		
	}
	
	init() {
		
		this.getStations( (data) => {
			
			data.forEach( (station) => {
				
				this.stationNames.push(station.stationName);
				
			});
			
		});
		
		this.addListeners();
		
	}
	
	addListeners() {
		
		var that = this;
		
		this.app.find('.get-delays').click( (e) => {
			
			e.preventDefault();
			
			this.runApp();
					
		});
		
		$(document).on('keydown', (e) => {
			
			if(e.which == 39) {
				
				this.runApp();
			}
			
		});
		
		this.inputs.keyup( (e) => {
			
			let that = this;
			
			this.suggestionLists.html("");
				
			let input = e.currentTarget.value;
			let index = e.currentTarget.id === 'from' ? 0 : 1;
			
			if (input != ''){
				this.suggestionLists.eq(index).addClass('show-suggestions');
			}
			
			else {
				this.suggestionLists.eq(index).removeClass('show-suggestions');
			}
			
			let suggestions = this.stationNames.filter( (stationName) => { 
					
				return stationName.toUpperCase().startsWith(input.toUpperCase());
				
			});
				
			suggestions.slice(0,3).forEach( (station) => {
				
				let li = $('<li></li>');
				li.text(station);
				
				this.suggestionLists.eq(index).append(li);
				
			});
			
			this.suggestionLists.find('li').click( function() {
			
				let selectedStation = $(this).text();
				$(this).closest('.form-input').find('input').val(selectedStation);
				that.suggestionLists.eq(index).html("");
				that.suggestionLists.eq(index).removeClass('show-suggestions');
			});

		});
		
		
		
	}
	
	runApp() {
		
		let from = this.app.find('#from').val();
		let to = this.app.find('#to').val();		
					
		this.getDelays(from, to, (data) =>{
					
			this.renderResults(data, () => {
				
				$('.loading-container').addClass('loading');
				
				setTimeout( () => {
					
					$('.loading-container').removeClass('loading');
					this.animateForward();
			
				}, this.loadDuration);
				
			});
		});
						
	}
	
	getDelays(from, to, callback) {
		
		let request = new XMLHttpRequest();
		let that = this;
		
		request.open("GET", this.baseURL + "/delays/" + from + "/to/" + to + "/20?accessToken=" + this.regAccessToken, true);
		
		request.onreadystatechange = function () {
			
			if (request.readyState == 4 && request.status == 200){
				
				if (request.responseText){
					
					var response = JSON.parse(request.response);
					
					if(callback){callback(response)};
				}
				
			}
			
			if (request.status == 500){
				
				alert('invalid station input!');
			}
			
		};
		
		request.send();
	}
	
	getStations(callback) {
		
		let request = new XMLHttpRequest();
		let that = this;
		
		request.open("GET", this.baseURL + "/crs/" + "?accessToken=" + this.regAccessToken, true);
		
		request.onreadystatechange = function () {
			
			if (request.readyState == 4 && request.status == 200){
				
				if (request.responseText){
					
					var response = JSON.parse(request.response);
					
					if(callback) callback(response);
				}
				
			}
			
		};
		
		request.send();
	}
	
	
	animateForward() {
		
		this.app.find('form').addClass('slide-right');
		this.app.find('#results').addClass('show-results');
		
	}
	
	animateBackward() {
		
		this.app.find('#results').html("");
		this.app.find('#results').removeClass('show-results');
		this.app.find('form').removeClass('slide-right');
		
	}
	
	renderResults(data, callback) {
		
		this.app.find('#results').html("");
		
		let results = data;
		
		if (results.delayedTrains.length > 0){
			
			let rows = '';
			
			results.delayedTrains.forEach( (train) => {
				
				let delayReason;
				let cancelReason;
				let estimatedDeparture;
				
				if (train.isCancelled){
					
					cancelReason = (train.cancelReason === null) ? 'No reason provided.' : train.cancelReason + '.';
				}
				
				else {
					estimatedDeparture = (train.etd === "Delayed") ? 'No time provided.' : train.etd;
					delayReason = (train.delayReason === null) ? 'No reason provided.' : train.delayReason + '.';
				}
				
				let row = `
				
				<tr>
					<td>${train.std}</td>
					<td class="operator">${train.operator}</td>
					<td class="${train.isCancelled ? 'cancelled' : 'delayed'}">${train.isCancelled ? 'Cancelled' : 'Delayed'}</td>
					<td>${train.isCancelled ? 'N/A' : estimatedDeparture}</td>
					<td class="reason">${train.isCancelled ? cancelReason : delayReason}</td>
				</tr> `
				
				rows += row;
				
			});
			
			let displayHTML = `

			<div class="results-header">
				<h2>There ${results.delayedTrains.length === 1 ? 'is' : 'are'} currently <b>${results.delayedTrains.length}</b> ${results.delayedTrains.length ===1 ? 'issue' : 'issues'} with your selected route.</h2>
			</div>

			<div class="results-body">
				<table>
					<tr class="table-header">
						<th>Normally Departs</th>
						<th>Operator</th>
						<th>Status</th>
						<th>ETA @ ${results.locationName}</th>
						<th>Reason</th>
					</tr>
					${rows}
				</table>
			</div>

			<div class="go-back">
				<i class="fas fa-long-arrow-alt-left"></i>
				<span>back</span>
			</div>
			
			`;
			
			this.app.find('#results').removeClass('no-delays');
			this.app.find('#results').html(displayHTML);
			
		}
		
		else {
			
			let displayHTML = `

			<div class="results-header">
				<h2>There are currently no delays between ${results.locationName} and ${results.filterLocationName}</h2>
			</div>

			<div class="go-back">
				<i class="fas fa-long-arrow-alt-left"></i>
				<span>back</span>
			</div>
			
			`;
			
			this.app.find('#results').addClass('no-delays');
			this.app.find('#results').html(displayHTML);
			
		}
		
		this.app.find('.go-back').click( () => {
		
			this.app.find('#results').html("");
			this.animateBackward();
			
		});
		
		if (callback){callback()};
		
	}
}