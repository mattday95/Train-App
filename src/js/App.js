// JavaScript Document

export default class App {
	
	constructor() {
		
		this.app = $('#app');
		this.baseURL = "https://huxley.apphb.com";
		this.accessToken = "d683dbbd-129a-40c7-92b8-3c74f2f012e4";
		
	}
	
	init() {
		
		this.addListeners();

	}
	
	addListeners() {
		
		this.app.find('.get-delays').click( (e) => {
			
			e.preventDefault();
			
			let from = this.app.find('#from').val();
			let to = this.app.find('#to').val();
			
			this.getData(from, to);
			
		});
		
		$(document).on('keypress', (e) => {
			
			if(e.which == 13) {
				
				let from = this.app.find('#from').val();
				let to = this.app.find('#to').val();
				
				this.getData(from, to);
			}
			
		});
		
	}
	
	getData(from, to) {
		
		let request = new XMLHttpRequest();
		let that = this;
		
		request.open("GET", this.baseURL + "/delays/" + from + "/to/" + to + "/20?accessToken=" + this.accessToken, true);
		
		request.onreadystatechange = function () {
			
			if (request.readyState == 4 && request.status == 200){
				
				if (request.responseText){
					
					var response = JSON.parse(request.response);
					
					that.app.find("#results").html("");
					that.animateForward();
					that.displayResults(response);
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
	
	displayResults(data) {
		
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
					<td>${train.operator}</td>
					<td class="${train.isCancelled ? 'cancelled' : 'delayed'}">${train.isCancelled ? 'Cancelled' : 'Delayed'}</td>
					<td>${train.isCancelled ? 'N/A' : estimatedDeparture}</td>
					<td>${train.isCancelled ? cancelReason : delayReason}</td>
				</tr> `
				
				rows += row;
				
			});
			
			let displayHTML = `

			<div class="results-header">
				<h2>There ${results.delayedTrains.length === 1 ? 'is' : 'are'} currently <b>${results.delayedTrains.length}</b> ${results.delayedTrains.length ===1 ? 'issue' : 'issues'} with trains from ${results.locationName} to ${results.filterLocationName}</h2>
			</div>

			<div class="results-body">
				<table>
					<tr class="table-header">
						<th>Normally Departs</th>
						<th>Operator</th>
						<th>Status</th>
						<th>ETA @ ${results.locationName}</th>
						<th class="reason">Reason</th>
					</tr>
					${rows}
				</table>
			</div>

			<div class="go-back">
				<i class="fas fa-long-arrow-alt-left"></i>
				<span>back</span>
			</div>
			
			`;
			
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
	}
}