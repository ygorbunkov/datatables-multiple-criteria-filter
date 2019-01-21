$.fn.dataTable.ext.feature.push({
	fnInit: function () {
		//Wait until document is ready
		$(document).ready(function(){
			//Grab all visible DataTables on the page to attach filtering feature to all of them
			var dataTables = Array($.fn.dataTable.tables({visible:true, api:true}));
			$.each(dataTables, function(){
				mFilter(this);
			});
			//Filtering feature definition
			function mFilter(dataTable){
				//Append filter div to each column header and mark it with corresponding column index
				$.each(dataTable.columns().header(), function () {
					$(this).append(`<div class="columnFilter" colindex="${this.cellIndex}"></div>`);
				});
				//Attach click-handlers to filter icons
				$('.columnFilter')
				.on('click', function (event) {
					//Prevent default behaviour on clicking onto parent element (column sorting)
					event.stopPropagation();
					//Clean previously opened filter menus
					$('#filterMenu').remove();
					//Append filter menu div to the page body and place it considering distance to the right edge of the document
					let menuX = $(window).width()-event.pageX > 220 ? event.pageX : event.pageX-220;
					let menuY = event.pageY;
					let columnIndex = $(this).attr('colindex');
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
									<label class="noSelectionHighlight">All</label>
									<input type="checkbox" value="all" checked></input>
								</div>
							</div>
							<div id="scrollDown" class="scrollButton"></div>
							<div id="submitButtons" class="noSelectionHighlight">
								<button action="ok" class="submitButton">OK</button>
								<button action="cancel" class="submitButton">Cancel</button>
							</div>
						</div>
						`);
					//Extract unique and sorted column cells values
					let category = dataTable.column(columnIndex).data().sort().unique();
					let categoryVisible = dataTable.column(columnIndex, {search:'applied'}).data().sort().unique();
					$.each(category, function(index, value){
						let checked = categoryVisible.indexOf(value) > -1 ? ' checked' : '';
						$('#criteriaList').append(`
							<div class="filterRow">
								<label class="noSelectionHighlight">${value}</label>
								<input type="checkbox" value="${value.toLowerCase()}"${checked}></input>
							</div>
						`);
					});
					//Adjust initial filter button visibility
					if(categoryVisible.length < category.length) $('[action="clearFilter"]').addClass('active');
					//Show filter menu on the screen
					$('#filterMenu').css('display', 'block');
					//Display scrollDown div if criteriaList contents height exceeds 250px
					if($('#criteriaList').get(0).offsetHeight<$('#criteriaList').get(0).scrollHeight) $('#scrollDown').css('display', 'block');
				})
				//Prevent column header focus upon clicking filter icon
				.on('mousedown', function (event) {
					event.preventDefault();
				});
				//Remove filter menu upon clicking elsewhere on the page
				$(window).on('click', function (event) {
						if($(event.target).closest('#filterMenu').length == 0) $('#filterMenu').remove();
				});
				//Listen for check/uncheck event
				$(document).on('click', '.filterRow', function(event){
					if(event.target.type == 'checkbox') event.target.checked = !event.target.checked;
					let checked = $(this).find('[type="checkbox"]').get(0).checked;
					//Do check/uncheck all if 'All' row is clicked
					if($(this).is('.persistent')){
						$.each($('.filterRow [type="checkbox"]'), function(){
							this.checked = !checked;
						});
						$('#filterInput').val('');
						$('#filterInput').trigger('keyup');
					}
					//Do check/uncheck individually for the rest of the rows
					else $(this).find('[type="checkbox"]').get(0).checked = !$(this).find('[type="checkbox"]').get(0).checked;
					//Adjust clearFilter button active/inactive state accordingly
					if($('.filterRow [type="checkbox"]').not(':checked').length>0) $('[action="clearFilter"]').addClass('active');
					else $('[action="clearFilter"]').removeClass('active');
				});
				//clearFilter button click handler
				$(document).on('click', '[action="clearFilter"].active', function(){
					$(this).removeClass('active');
					$.each($('.filterRow [type="checkbox"]'), function(){
						this.checked = true;
					});
				});
				//applyFilter button click handler
				$(document).on('click', '[action="applyFilter"].active', function(){
					//First off, make all visible entries selected
					$.each($('.filterRow:visible [type="checkbox"]'), function(){
						this.checked = true;
					})
					//If it is first applyFilter invocation uncheck all invisible entries
					if($('.filterRow [type="checkbox"]:not(:checked)').length == 0){
						$.each($('.filterRow:not(:visible) [type="checkbox"]'), function(){
							this.checked = false;
						})
					}
					//Adjust clearFilter button state (active/inactive), clean up filterInput
					$('[action="clearFilter"]').addClass('active');
					$('#filterInput').val('');
					$('#filterInput').trigger('keyup');
				});
				//Listen for input and hide what's not matching
				$(document).on('keyup', '#filterInput', function(){
					$('.filterRow:hidden').has(`[value*="${$(this).val()}"]`).show();
					$('.filterRow:visible').not(`:has([value*="${$(this).val()}"])`).not('.persistent').hide();
					if($(this).val() === ''){
						$('.filterRow').show();
						$('[action="applyFilter"]').removeClass('active');
					}
					else $('[action="applyFilter"]').addClass('active');
					scrollButtonsDisplay();
				});
				//Listen for criteriaList scrolling to control scroll buttons visibility
				var scrollButtonsDisplay = function(){
					let scrollUpDisplay = $('#criteriaList').scrollTop() > 0 ? 'block' : 'none';
					let scrollDownDisplay = $('#criteriaList').get(0).scrollHeight > $('#criteriaList').get(0).offsetHeight && $('#criteriaList').scrollTop() < $('#criteriaList').get(0).scrollHeight - $('#criteriaList').get(0).offsetHeight ? 'block' : 'none';
					$('#scrollUp').css('display', scrollUpDisplay);
					$('#scrollDown').css('display', scrollDownDisplay);
				};
				document.addEventListener('scroll', function(event){
					if(event.target.id == 'criteriaList') scrollButtonsDisplay();
				}, true);
				//Scroll when scrollbuttons clicked
				$(document).on('click', '.scrollButton', function(){
					let scrollDelta = $(this).is('#scrollUp') ? -20 : $(this).is('#scrollDown') ? 20 : null;
					let currentPos = $('#criteriaList').scrollTop();
					$('#criteriaList').scrollTop(currentPos+scrollDelta);
				});
				//Submit buttons ('OK'/'Cancel') mousedown prevent default
				$(document).on('mousedown', '.submitButton', function(event){
					event.preventDefault();
				});
				//Submit buttons click handler
				$(document).on('click', '.submitButton', function(event){
					if($(event.target).is('[action="cancel"]')) $('#filterMenu').remove();
					if($(event.target).is('[action="ok"]')) {
						let criteriaChecked = [];
						if($('.filterRow input:not(:checked)').length > 0) {
							$.each($('.filterRow:not(.persistent):has(input:checked) label'), function(){
								criteriaChecked.push(this.innerText);
							});
						};
						let columnIndex = $(this).parents('#filterMenu').attr('colindex');
						//Reset previous filters
						$('#filterMenu').remove();
						dataTable.columns().every(function(){
							this.search('');
						});
						dataTable.column(columnIndex).search(criteriaChecked.join('|'), true, false).draw();
					}
				});
			};
		});
	},
	cFeature: 'F'
});
