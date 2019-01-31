Multiple criteria filter for jQuery plug-in DataTables employs 'multiple-criteria-multiple-column' inclusive OR logic using DataTables API.

Filter itself implemented as a DataTables feature plug-in, so in order to use that, you must specify 'F' among your DataTable dom/sDom options:
	
	var dataTable = $('#mytable').DataTable({
			sDom: 'tF'
	});
  
Search is implemented using external search plug-in, so filtering logic is different from standard, DataTables smart search feature is not in effect.

To start using plug-in, you may simply refer to mFilter.js, mFilter.css within <head> section:

	  <head>
	    <script src="js/mFilter.js"></script>
	    <link rel="stylesheet" type="text/css" href="css/mFilter.css">
	  </head>

Custom SVG-icons are loaded from /img directory.
