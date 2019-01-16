$(document).ready(function () {
	//Source data definition	
	var tableData = [{
			name: 'Clark Kent',
			city: 'Metropolis'
		}, {
			name: 'Bruce Wayne',
			city: 'Gotham'
		}, {
			name: 'Steve Rogers',
			city: 'New York'
		}, {
			name: 'Peter Parker',
			city: 'New York'
		}, {
			name: 'Thor Odinson',
			city: 'Asgard'
		}
	];
	//DataTable definition	
	window.dataTable = $('#mytable').DataTable({
			sDom: 't',
			data: tableData,
			columns: [{
					data: 'name',
					title: 'Name'
				}, {
					data: 'city',
					title: 'City'
				}
			]
		});
	//Append filter div to each column header along with corresponding column index
	$.each(dataTable.columns($('#mytable th')).header(), function () {
		$(this).append(`<div class="columnFilter" colindex="${this.cellIndex}"></div>`);
	});
	//Attach click-handlers to filter icons
	$('.columnFilter')
	.on('click', function (e) {
		//Prevent default behaviour of clicking onto parent element (column sorting)
		e.stopPropagation();
		//Clean previously opened filter menus
		$('#filterMenu').remove();
		//Append filter menu div to the page body
		$('body').append(`
			<div id="filterMenu" style="left:${e.pageX}px; top:${e.pageY}px">
				<div class="searchRow">
					<input id="filterInput"></input>
					<div class="tinyButton" action="applyFilter"></div>
					<div class="tinyButton" action="clearFilter"></div>
				</div>
				<div class="criteriaList">
					<div class="filterRow">
						<label>All</label>
						<input type="checkbox" value="All" checked></input>
					</div>
				</div>
			`);
		//Extract unique column values
		let criteria = [];
		$.each(dataTable.column($(this).attr('colindex')).data(), function(index, value){
			if(criteria.indexOf(value) == -1) criteria.push(value);
		});
		//Prepare criteria row for each unique value
 		$.each(criteria, function(index, value){
			$('.criteriaList').append(`
				<div class="filterRow">
					<label>${value}</label>
					<input type="checkbox" value="${value}" checked></input>
				</div>

			`);
		});
		//Show filter menu on the screen
		$('#filterMenu').css('display', 'block');
	})
 	//Prevent column header focus upon clicking filter icon
	.on('mousedown', function (e) {
		e.preventDefault();
	});
	//Remove filter menu upon clicking elsewhere on the page
	$(window).on('click', function () {
			$('#filterMenu').remove();
	});
	$(document).on('click', '#filterMenu *', function(e){
		e.stopPropagation();
	});
	//Check/uncheck all the criteria upon clicking 'All'
	$(document).on('click', '.filterRow input[value="All"]:first', function(e){
		e.stopPropagation();
		let checked = this.checked;
		$.each($('.filterRow input[type="checkbox"]'), function(){
			this.checked = checked;
		});
	});
});
