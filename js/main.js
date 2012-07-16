//Used by distinct
Array.prototype.contains = function(toFind) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i] === toFind) {
            return true;
        }
    }
    return false;
};

Array.prototype.distinct = function() {
    var derivedArray = new Array();
    for (var i = 0; i < this.length; i += 1) {
        if (!derivedArray.contains(this[i])) {
            derivedArray.push(this[i])
        }
    }
    return derivedArray;
};

Array.prototype.containsViolation = function(resourceIn, ruleIn) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i].resource === resourceIn && this[i].rule === ruleIn) {
            return true;
        }
    }
    return false;
};

Array.prototype.incCnt = function(resourceIn, ruleIn) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i].resource === resourceIn && this[i].rule === ruleIn) {
            this[i].cnt = this[i].cnt + 1;
            break;
        }
    }
};

Array.prototype.returnCnt = function(resourceIn, ruleIn) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i].resource === resourceIn && this[i].rule === ruleIn) {
            return this[i].cnt;
            break;
        }
    }
    return 0;
};

//Taken from http://www.kevinleary.net/get-url-parameters-javascript-jquery/
function url_query( query ) {
	query = query.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var expr = "[\\?&]"+query+"=([^&#]*)";
	var regex = new RegExp( expr );
	var results = regex.exec( window.location.href );
	if( results !== null ) {
		return results[1];
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	} else {
		return false;
	}
}

function loadDataset ()
{
	var url_param = url_query('resource');

	if( !url_param ) {
		url_param='1';
	}

	var violations = new Miso.Dataset({
	url : 'http://sonar/api/violations?resource='+ url_param +'&depth=-1&format=json&callback=',
	jsonp : true
	});

	violations.fetch({ 
	  success : function() {
	  	var rules = [];
	  	var resources = [];
	  	var vioCnt = [];

	  	this.each(
	  		function(row){
	  			rules.push(row.rule.name);
	  			resources.push(row.resource.name);

	  			if (vioCnt.length > 0 && vioCnt.containsViolation(row.resource.name, row.rule.name))
	  			{
	  				vioCnt.incCnt(row.resource.name, row.rule.name);
	  			}
	  			else {
	  				var ruleViolationInst = new Object();
	  				ruleViolationInst.resource = row.resource.name;
	  				ruleViolationInst.rule = row.rule.name;
	  				ruleViolationInst.cnt = 1;
	  				vioCnt.push(ruleViolationInst);
	  			}
	  		}
	  	);

	 	rules = rules.distinct();
	 	resources = resources.distinct();

	 	var out = document.getElementById('content');

	 	var header = "resource";
	 	for (var i = 0; i < rules.length; i += 1) {
	 		header = header + ", " + rules[i];
	 	}

	 	var body = "";

	 	for (var i = 0; i < resources.length; i += 1) {
	 		body = body + resources[i];
	 		for (var j = 0; j < rules.length; j += 1) {
	 			body = body + ", " + vioCnt.returnCnt(resources[i], rules[j]);
	 		}
	 		body = body + "<br/>";
	 	}

	 	out.innerHTML = header + "<br/>" + body;
	  }
	});
}