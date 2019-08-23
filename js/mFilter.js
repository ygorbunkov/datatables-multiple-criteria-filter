//Global mfilter data
var mfilterGlobal = new Array();
//Global functions
	//Display filter menu
	const displayFilterMenu = event => {
		//Clean previously opened filter menus
		$('#filterMenu').fadeOut(250).remove();
		//Detect table
		const dataTable = $(event.target).closest('table').DataTable();
		//Append filter menu div to the page body and place it considering distance to the right edge of the document
		const menuX = $(window).width() - event.pageX > 220 ? event.pageX : event.pageX - 220;
		const menuY = event.pageY;
		const columnIndex = dataTable.column($(event.target).closest('th')).index();
		//Get cheked/unchecked/semichecked states of each category
		const categoryVisible = dataTable.column(columnIndex, {search: 'applied'}).data();
		const categoryInvisible = dataTable.column(columnIndex, {search: 'removed'}).data();
		const allChecked = categoryVisible.length == 0 ? 'unchecked' : categoryInvisible.length == 0 ? 'checked' : 'semichecked';
		$('body').append(`
				<div id="filterMenu" colindex="${columnIndex}" style="left:${menuX}px; top:${menuY}px">
					<div class="searchRow">
						<input id="filterInput"></input>
						<div class="tinyButton" action="clearFilter"></div>
						<div class="tinyButton" action="applyFilter"></div>
					</div>
					<div id="scrollUp" class="scrollButton"></div>
					<div id="criteriaList">
						<div class="filterRow persistent">
							<div class="categoryLabel noSelectionHighlight">All</div>
							<div type="checkbox" value="all" status="${allChecked}"></div>
						</div>
					</div>
					<div id="scrollDown" class="scrollButton"></div>
					<div id="submitButtons" class="noSelectionHighlight">
						<div action="apply" class="submitButton" match="1">Filter</div>
						<div action="apply" class="submitButton" match="2">Append</div>
						<div action="cancel" class="submitButton">Cancel</div>
					</div>
				</div>
				`);
		//Extract unique and sorted column cells values
		const category = dataTable.column(columnIndex).data().sort().unique();
		$.each(category, function (index, value) {
			const checkStatus = categoryVisible.indexOf(value) == -1 ? 'unchecked' : categoryInvisible.indexOf(value) == -1 ? 'checked' : 'semichecked';
			$('#criteriaList').append(`
					<div class="filterRow">
						<div class="categoryLabel noSelectionHighlight">${value}</div>
						<div type="checkbox" status="${checkStatus}" value="${String(value).toLowerCase()}"></div>
					</div>
				`);
		});
		adjustFilterButtons();
		//Show filter menu on the screen
		$('#filterMenu').fadeIn(150);
		//Display scrollDown div if criteriaList contents height exceeds 250px
		adjustScrollButtons();
	};
	//Adjust clearFilter button visibility
	const adjustFilterButtons = () => {
		const clearFilterStatus = $('.filterRow [status="unchecked"],[status="semichedked"]').length > 0 ? 'active' : 'inactive';
		const applyFilterStatus = $('#filterInput').val().length > 0 && $('.filterRow:visible').length > 1 ? 'active' : 'inactive';
		$('[action="clearFilter"]').attr('status', clearFilterStatus);
		$('[action="applyFilter"]').attr('status', applyFilterStatus);
	};
	//Adjust scroll buttons visibility
	const adjustScrollButtons = () => {
		const scrollDownDisplay = $('#criteriaList').get(0).offsetHeight < $('#criteriaList').get(0).scrollHeight && $('#criteriaList').scrollTop() < $('#criteriaList').get(0).scrollHeight - $('#criteriaList').get(0).offsetHeight ? 'block' : 'none';
		const scrollUpDisplay = $('#criteriaList').scrollTop() > 0 ? 'block' : 'none';
		$('#scrollDown').css('display', scrollDownDisplay);
		$('#scrollUp').css('display', scrollUpDisplay);
	};
	//Filter criteria list based on input field
	const filterCriteria = () => {
		$('.filterRow:hidden').has(`[value*="${$('#filterInput').val().toLowerCase()}"]`).show();
		$('.filterRow:visible').not(`:has([value*="${$('#filterInput').val().toLowerCase()}"])`).not('.persistent').hide();
		$('#filterInput').val() === '' ? $('.filterRow').show() : null;
	};
//Filter feature insertion
$.fn.dataTable.ext.feature.push({
	fnInit: function (context) {
		//Push table specific block into global data object
		mfilterGlobal.push({
			tableid: context.sTableId,
			filterData: context.aoColumns.map(column => ({
					dataSrc: column.mData,
					index: column.idx
				}))
		});
		//Append filtering button to column headers
		context.aoInitComplete.push({fn:() => {
			$(`#${context.sTableId} .columnFilter`).remove();
			$(`#${context.sTableId} th`).append('<span class="columnFilter"></span>');
		}});
	},
	cFeature: 'F'
});
//Heavy lifting done upon document ready
$(document).ready(()=>{
	[...$('table')].forEach(table => table.addEventListener('mousedown', e => {
		if($(e.target).is('.columnFilter')) {
			//Prevent column header active state upon 'mousedown' at column filter
			e.preventDefault();
			//Clean previously opened filter menus
			$('#filterMenu').fadeOut(250).remove();
			//Grab DataTables object being interacted
			const dataTable = $(e.target).closest('table').DataTable();
			//Append filter menu div to the page body and place it considering distance to the right edge of the document
			const menuX = $(window).width() - event.pageX > 220 ? event.pageX : event.pageX - 220;
			const menuY = event.pageY;
			const columnIndex = dataTable.column($(e.target).closest('th')).index();
			//Get cheked/unchecked/semichecked states of each category
			const categoryVisible = dataTable.column(columnIndex, {
					search: 'applied'
				}).data();
			const categoryInvisible = dataTable.column(columnIndex, {
					search: 'removed'
				}).data();
			const allChecked = categoryVisible.length == 0 ? 'unchecked' : categoryInvisible.length == 0 ? 'checked' : 'semichecked';
			$('body').append(`
					<div id="filterMenu" colindex="${columnIndex}" style="left:${menuX}px; top:${menuY}px">
						<div class="searchRow">
							<input id="filterInput"></input>
							<div class="tinyButton" action="clearFilter"></div>
							<div class="tinyButton" action="applyFilter"></div>
						</div>
						<div id="scrollUp" class="scrollButton"></div>
						<div id="criteriaList">
							<div class="filterRow persistent">
								<div class="categoryLabel noSelectionHighlight">All</div>
								<div type="checkbox" value="all" status="${allChecked}"></div>
							</div>
						</div>
						<div id="scrollDown" class="scrollButton"></div>
						<div id="submitButtons" class="noSelectionHighlight">
							<div action="apply" class="submitButton" match="1">Filter</div>
							<div action="apply" class="submitButton" match="2">Append</div>
							<div action="cancel" class="submitButton">Cancel</div>
						</div>
					</div>
					`);
			//Extract unique and sorted column cells values
			const category = dataTable.column(columnIndex).data().sort().unique();
			$.each(category, function (index, value) {
				const checkStatus = categoryVisible.indexOf(value) == -1 ? 'unchecked' : categoryInvisible.indexOf(value) == -1 ? 'checked' : 'semichecked';
				$('#criteriaList').append(`
						<div class="filterRow">
							<div class="categoryLabel noSelectionHighlight">${value}</div>
							<div type="checkbox" status="${checkStatus}" value="${String(value).toLowerCase()}"></div>
						</div>
					`);
			});
			adjustFilterButtons();
			//Show filter menu on the screen
			//$('#filterMenu').css('display', 'block');
			$('#filterMenu').fadeIn(150);
			//Display scrollDown div if criteriaList contents height exceeds 250px
			adjustScrollButtons();
		}
	}, true));
	//Prevent column filter click from propagating (triggering sort order change)
	[...document.getElementsByTagName('table')].forEach(table => table.addEventListener('click', e => {if($(e.target).is('.columnFilter')) e.stopPropagation()}, true));
	//Remove filter menu upon clicking elsewhere on the page
	$(window).on('click', function (event) {
		$(event.target).closest('#filterMenu').length == 0 ? $('#filterMenu').fadeOut(150).remove() : null;
	});
	//Listen for check/uncheck event
	$(document).on('click', '.filterRow', function () {
		const checkbox = $(this).find('[type="checkbox"]');
		const newStatus = ['checked', 'semichecked'].indexOf(checkbox.attr('status')) > -1 ? 'unchecked' : 'checked';
		checkbox.attr('value') == 'all' ?
		$('.filterRow [type="checkbox"]').attr('status', newStatus) :
		checkbox.attr('status', newStatus);
		adjustFilterButtons();
	});
	//clearFilter button click handler
	$(document).on('click', '[action="clearFilter"][status="active"]', function () {
		$('.filterRow [type="checkbox"]').attr('status', 'checked');
		adjustFilterButtons();
	});
	//applyFilter button click handler
	$(document).on('click', '[action="applyFilter"][status="active"]', function () {
		//First off, make all visible entries selected
		$('.filterRow:visible [type="checkbox"]').attr('status', 'checked');
		//If it is first applyFilter invocation uncheck all invisible entries
		$('.filterRow [type="checkbox"]:not([status="checked"])').length == 0 ?
		$('.filterRow:not(:visible) [type="checkbox"]').attr('status', 'unchecked') :
		null;
		//Adjust clearFilter button state (active/inactive), clean up filterInput
		$('#filterInput').val('');
		filterCriteria();
		adjustFilterButtons();
	});
	//Listen for input and hide what's not matching
	$(document).on('keyup', '#filterInput', function () {
		filterCriteria();
		adjustScrollButtons();
		adjustFilterButtons();
	});
	//Listen for criteriaList scrolling to control scroll buttons visibility
	document.addEventListener('scroll', function (event) {
		if (event.target.id == 'criteriaList')
			adjustScrollButtons();
	}, true);
	//Scroll when scrollbuttons clicked
	$(document).on('click', '.scrollButton', function () {
		const scrollDelta = $(this).is('#scrollUp') ? -20 : $(this).is('#scrollDown') ? 20 : null;
		const currentPos = $('#criteriaList').scrollTop();
		$('#criteriaList').scrollTop(currentPos + scrollDelta);
	});
	//Submit buttons ('OK'/'Cancel') mousedown prevent default
	$(document).on('mousedown', '.submitButton', function (event) {
		event.preventDefault();
	});
	//Submit buttons click handler
	$(document).on('click', '.submitButton', function (event) {
		//Close the menu, ignore changes if 'cancel' is clicked or all
		//category rows are checked and 'ok' button is clicked or checked
		//categories stayed without changes since previous filtering
		let columnIndex = $('#filterMenu').attr('colindex');
		searchData[columnIndex].match = null;
		searchData[columnIndex].criteria = [];
		if ($(event.target).is('[action="apply"]') &&
			$('.filterRow').has('[status="unchecked"],[status="semichecked"]').length > 0) {
			searchData[columnIndex].criteria = [...$('.filterRow:has([status="checked"]) .categoryLabel')].map(label => $(label).text());
			searchData[columnIndex].column = columnIndex;
			searchData[columnIndex].match = $(event.target).attr('match');
		}
		$.each($('.columnFilter'), function () {
			searchData[$(this).attr('colindex')].criteria.length > 0 ? $(this).attr('status', 'active') : $(this).attr('status', 'inactive');
		});
		dataTable.draw();
		$('#filterMenu').fadeOut(150).remove();
	});
});


