jQuery DataTables plug-in employs 'multiple-criteria-multiple-column' filtering using DataTables API. In addition to conventional 'match all the criteria' logic, 'append to selection' operation is available.

Filter itself coded as a DataTables feature plug-in, so in order to use that, you must specify 'F' among your DataTable 'dom'/'sDom' options:
	
	var dataTable = $('#mytable').DataTable({
			sDom: 'tF'
	});
  
Search is implemented using external search plug-in, so DataTables smart search feature is not in effect.

To start using plug-in, you may simply refer to mFilter.js, mFilter.css within 'head' section:

	  <head>
	    <script src="js/mFilter.js"></script>
	    <link rel="stylesheet" type="text/css" href="css/mFilter.css">
	  </head>

To include mFilter remotely:

	  <script type="application/javascript" src="https://cdn.mfilter.cf/js/mfilter.min.js"></script>
	  <link rel="stylesheet" type="text/css" href="https://cdn.mfilter.cf/css/mfilter.min.css">
	  
Prerequisites:
	  <script type="application/javascript" src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
	  <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css">
