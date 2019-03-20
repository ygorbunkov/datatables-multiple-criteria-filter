# Overview

jQuery DataTables plug-in employs 'multiple-criteria-multiple-column' filtering using DataTables API. In addition to conventional 'match all the criteria' logic, 'append to selection' operation is available.

# How to use
Filter itself coded as a DataTables feature plug-in, so in order to use that, you must specify 'F' among your DataTable 'dom'/'sDom' options:

```javascript	
var dataTable = $('#mytable').DataTable({
		sDom: 'tF'
});
```

Search is implemented using external search plug-in, so DataTables smart search feature is not in effect.

Since the filtering is done client side, plug-in is not capable to filter DataTables operating in server-side processing mode (`serverSide: true` option).

To start using plug-in, you may simply refer to mFilter.js, mFilter.css within 'head' section:

```HTML
<head>
	<script src="js/mFilter.js"></script>
	<link rel="stylesheet" type="text/css" href="css/mFilter.css">
</head>
```

To include mFilter remotely:

```HTML
<script type="application/javascript" src="https://cdn.mfilter.tk/js/mfilter.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.mfilter.tk/css/mfilter.min.css">
```

Live demo is available at [Codepen](https://codepen.io/ygorbunkov/pen/drqEyY?editors=1010)

# Prerequisites

```HTML
<script type="application/javascript" src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script type="application/javascript" src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css">
```

