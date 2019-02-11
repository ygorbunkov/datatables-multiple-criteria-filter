//--------------------------------------------------------------------------------
// Copyright 2019 Yevgen Gorbunkov
//
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the "Software"), to deal 
// in the Software without restriction, including without limitation the rights 
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is furnished 
// to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
// SOFTWARE.
//--------------------------------------------------------------------------------

$.fn.dataTable.ext.feature.push({
	fnInit: function () {
		//Wait until document is ready
		$(document).ready(function(){			
			//Grab all visible DataTables on the page to attach filtering feature to all of them
			var dataTables = Array($.fn.dataTable.tables({visible:true, api:true}));
			$.each(dataTables, function(){
				mFilter(this);
			});
			//Globally used functions
				//Adjust clearFilter button visibility
				var adjustFilterButtons = () => {
					$('.filterRow [status="unchecked"],[status="semichedked"]').length > 0 ? 
					$('[action="clearFilter"]').attr('status', 'active') : 
					$('[action="clearFilter"]').attr('status', 'inactive') ;
					$('#filterInput').val().length > 0 && $('.filterRow:visible').length > 1 ? 
					$('[action="applyFilter"]').attr('status', 'active') : 
					$('[action="applyFilter"]').attr('status', 'inactive');
				};
				//Adjust scroll buttons visibility
				var adjustScrollButtons = () => {
					$('#criteriaList').get(0).offsetHeight<$('#criteriaList').get(0).scrollHeight && 
					$('#criteriaList').scrollTop() < $('#criteriaList').get(0).scrollHeight - $('#criteriaList').get(0).offsetHeight ? 
					$('#scrollDown').css('display', 'block') : 
					$('#scrollDown').css('display', 'none');
					$('#criteriaList').scrollTop() > 0 ?
					$('#scrollUp').css('display', 'block') : 
					$('#scrollUp').css('display', 'none');
				};
				//Filter criteria list based on input field
				var filterCriteria = () => {
					$('.filterRow:hidden').has(`[value*="${$('#filterInput').val().toLowerCase()}"]`).show();
					$('.filterRow:visible').not(`:has([value*="${$('#filterInput').val().toLowerCase()}"])`).not('.persistent').hide();
					$('#filterInput').val() === '' ? $('.filterRow').show() : null;
				};
			//Filtering feature definition
			function mFilter(dataTable){
				//Global search variable, each entry contains column index, match type (1-sharp, 2-soft), criteria list
				var searchData = [...Array(dataTable.columns().visible().count())].map(entry => {return {match: null, column: null, criteria: []}});
				//Prepare external filter
				$.fn.DataTable.ext.search.push(function(settings, row){
					return searchData.filter(entry => entry.match == 1).every(entry => 
						entry.criteria.indexOf(row[entry.column]) > -1
					) ||
					searchData.filter(entry => entry.match == 2).some(entry => 
						entry.criteria.indexOf(row[entry.column]) > -1
					);
				});
				//Append filter div to each column header and mark it with corresponding column index
				dataTable.columns().every(function () {
					const headerElement = this.header();
					const headerDataSrc = this.dataSrc();
					const headerIndex = this.index();
					$(headerElement).append(`<div class="columnFilter" colindex="${headerIndex}"coldataname="${headerDataSrc}"></div>`);
				});
				//Attach click-handlers to filter icons
				$('.columnFilter')
				.on('click', function (event) {
					//Prevent default behaviour on clicking onto parent element (column sorting)
					event.stopPropagation();
					//Clean previously opened filter menus
					$('#filterMenu').fadeOut(250).remove();
					//Append filter menu div to the page body and place it considering distance to the right edge of the document
					const menuX = $(window).width()-event.pageX > 220 ? event.pageX : event.pageX-220;
					const menuY = event.pageY;
					const columnIndex = $(this).attr('colindex');
					//Get cheked/unchecked/semichecked states of each category
					const categoryVisible = dataTable.column(columnIndex, {search:'applied'}).data();
					const categoryInvisible = dataTable.column(columnIndex, {search:'removed'}).data();
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
					$.each(category, function(index, value){
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
				})
				//Prevent column header focus upon clicking filter icon
				.on('mousedown', function (event) {
					event.preventDefault();
				});
				//Remove filter menu upon clicking elsewhere on the page
				$(window).on('click', function (event) {
						$(event.target).closest('#filterMenu').length == 0 ? $('#filterMenu').fadeOut(150).remove() : null;
				});
				//Listen for check/uncheck event
				$(document).on('click', '.filterRow', function(){
					const checkbox = $(this).find('[type="checkbox"]');
					const newStatus = ['checked', 'semichecked'].indexOf(checkbox.attr('status')) > -1 ? 'unchecked' : 'checked';
					checkbox.attr('value') == 'all' ? 
					$('.filterRow [type="checkbox"]').attr('status', newStatus) : 
					checkbox.attr('status', newStatus);
					adjustFilterButtons();
				});
				//clearFilter button click handler
				$(document).on('click', '[action="clearFilter"][status="active"]', function(){
					$('.filterRow [type="checkbox"]').attr('status', 'checked');
					adjustFilterButtons();
				});
				//applyFilter button click handler
				$(document).on('click', '[action="applyFilter"][status="active"]', function(){
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
				$(document).on('keyup', '#filterInput', function(){
					filterCriteria();
					adjustScrollButtons();
					adjustFilterButtons();
				});
				//Listen for criteriaList scrolling to control scroll buttons visibility
				document.addEventListener('scroll', function(event){
					if(event.target.id == 'criteriaList') adjustScrollButtons();
				}, true);
				//Scroll when scrollbuttons clicked
				$(document).on('click', '.scrollButton', function(){
					const scrollDelta = $(this).is('#scrollUp') ? -20 : $(this).is('#scrollDown') ? 20 : null;
					const currentPos = $('#criteriaList').scrollTop();
					$('#criteriaList').scrollTop(currentPos+scrollDelta);
				});
				//Submit buttons ('OK'/'Cancel') mousedown prevent default
				$(document).on('mousedown', '.submitButton', function(event){
					event.preventDefault();
				});
				//Submit buttons click handler
				$(document).on('click', '.submitButton', function(event){
					//Close the menu, ignore changes if 'cancel' is clicked or all 
					//category rows are checked and 'ok' button is clicked or checked
					//categories stayed without changes since previous filtering
					let columnIndex = $('#filterMenu').attr('colindex');
					searchData[columnIndex].match = null;
					searchData[columnIndex].criteria = [];
					if($(event.target).is('[action="apply"]') && 
					$('.filterRow').has('[status="unchecked"],[status="semichecked"]').length>0){
						searchData[columnIndex].criteria = [...$('.filterRow:has([status="checked"]) .categoryLabel')].map(label=>$(label).text());
						searchData[columnIndex].column = columnIndex; 
						searchData[columnIndex].match = $(event.target).attr('match');
					}
					$.each($('.columnFilter'), function() {
						searchData[$(this).attr('colindex')].criteria.length > 0 ? $(this).attr('status','active') : $(this).attr('status','inactive');
					});
					dataTable.draw();
					$('#filterMenu').fadeOut(150).remove();	
				});
			};
		});
	},
	cFeature: 'F'
});
