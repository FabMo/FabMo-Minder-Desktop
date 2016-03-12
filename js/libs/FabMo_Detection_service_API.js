

function FabMoAutoConnect(callback,linker_port){
	if (!callback)
		throw "this function need a callback to work !";
	var that=this;
	DetectToolsOnTheNetworks(function(err,list_tools){
		if (err){ callback(err);return;} 
		SelectATool(list_tools,function(err,tool){
			if (err){ callback(err);return;}
			ChooseBestWayToConnect(tool,function(ip_address,port){
				callback(undefined, 'http://'+ip_address +':'+(port ? port.toString() : '8080'));	
			});
		});
	},linker_port);
}



function ChooseBestWayToConnect(tool,callback){ 
	// Returns an IP address and port
	// Automatic selection of the best way to talk to the tool
	// Based on this priority : USB > ethernet > wifi > wifi-direct
	if (!callback)
		throw "this function need a callback to work !";
	list_itr = [];
	for(var idx in tool.network){
		list_itr.push(tool.network[idx].interface);
	}

	var hasEmbeddedItr=false;
	var EmbededdeItrRegEx='en*';
  for (var i in list_itr) {
    if (list_itr[i].match(EmbededdeItrRegEx)) {
        hasEmbeddedItr=true;
    }
  }
  
  if(hasEmbeddedItr){
  	tool.network.forEach(function(val,key){
			if(val.interface.match(EmbededdeItrRegEx))
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
  }

	if(list_itr.indexOf("usb0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "usb0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("eth0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "eth0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("en0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "en0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}	
	if(list_itr.indexOf("wlan0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "wlan0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("wlan1") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "wlan1")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}		
}


function DetectToolsOnTheNetworks(callback, linker_port){
	if (!callback)
		throw "this function need a callback to work !";
	var port = linker_port || 8080; //port of the link API
	$.ajax({
		url: 'http://127.0.0.1:' + port + '/where_is_my_tool',
		type: "GET",
		dataType : 'json'
	}).done(function(data){
		callback(undefined,data);
	}).fail(function(){
		err="Link API not responding !";
		callback(err);
	});
}

function SelectATool(list_tools,callback){
	if (!callback)
		throw "this function need a callback to work !";
	if (list_tools.length === 0)
	{
		var err = "No tools detected";
		callback(err);
	}
	else if (list_tools.length === 1) // perfect case !, a single tool on the network !
	{
		callback(undefined,list_tools[0]);
	}
	else
	{	

		if($('#device_picker').length){
			list_tools.forEach(function(val,key){
				if(key===0){
					$('#device_picker').append('<input type="radio" name="devices" id="'+key+'" value=\''+JSON.stringify(val)+'\' checked="checked" /><label for="'+key+'"> '+ val.hostname+'</label><br>');
				}
				else{
					$('#device_picker').append('<input type="radio" name="devices" id="'+key+'" value=\''+JSON.stringify(val)+'\' /><label for="'+key+'"> '+ val.hostname+'</label><br>');
				}
			});
			$('#device_picker').append($('<button id="device_picker_button">Select</button>'));
			$('#device_picker_button').click(function(){
				if($("input[name='devices']:checked").length)
					callback(undefined,JSON.parse($("input[name='devices']:checked").val()));
			});
			$('#device_picker').trigger('activated',[this]);		
		}
		else{
			var $dialog = $('<div/>').addClass('dialog');
			list_tools.forEach(function(val,key){
				$dialog.append('<input type="radio" name="devices" id="'+key+'" value=\''+JSON.stringify(val)+'\' /><label for="'+key+'"> '+ val.hostname+'</label><br>');
			});
			$('body').append($dialog);
			$dialog.dialog({
				autoOpen: true,
				title: "Select a device",
				height: 300,
				width: 350,
				modal: true,
				buttons: {
					Select: function() {
						callback(undefined,JSON.parse($("input[name='devices']:checked").val()));
						$( this ).dialog( "close" );
					}
				}
	      		});

		}
	}
 
}


