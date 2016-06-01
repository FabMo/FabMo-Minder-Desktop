/**
 * @author jimmy
 */
var uniq = require('uniq');
var http = require('http');
var detection = require('./detection_tool');

var tools_list = [];

/*
the where_is_my_tool function use the detection tool to get the list of devices detected,.
It will then compute it to transform it in an array of detectable machines.
It will filter the non-used interfaces and only display the networks that are reacheable.

	How to use :  Currently the function is only implemented as a web request. so you need to do a GET request at /where_is_my_tool to get the list.

	Example :
	[
		{
			"hostname" : "My_machine",
			"server_port" : "8080",
			"network":[
				{
					"ip_address":"127.0.0.1",
					"interface" : "lo0"
				},
				{
					"ip_address":"192.168.10.2",
					"interface" : "usb0"
				},
			]
		},
		{

			"hostname" : "My_machine",
			"server_port" : "1234",
			"network":[
				{
					"ip_address":"192.168.1.3",
					"interface" : "wlan0"
				}
			]
		}
	]

*/

exports.where_is_my_tool = function(req, res, next) {
		var detect = new detection(1200);// timeout en millisecondes;
		detect.on('devices', function (data) {
		/*****************************************************************/
		if( data === []) // false in every case
		{
			// NOT TRIGGERED FOR NOW ! Should be replace by (data.length === 0)
			res.send('no device found');
		}
		else
		{
			try{
				var devices_list = data;
			}
			catch (e) {
				var devices_list= [];
			}

			var count_array = []; // used for getting a unique device list.

			// make a list of unique devices ( currently based on the hostname and need to be replace with a serial number )
			for(var dev in devices_list)
			{
				if(devices_list[dev])
					count_array.push(devices_list[dev].device.hostname);
			}
			count_array = uniq(count_array);


			var new_device_array = []; // new JSON object, represent the devices that you can connect to.

			// new JSON object constructor
			for (var single_dev in count_array)
			{
				var dev_interfaces = []; // reset the interfaces array for every new device
				var dev_hostname = count_array[single_dev]; // get the hostname
				var server_port;
				// get the interface array
				for(var device in devices_list) // array with all the ips and net interfaces separately
				{
					if( devices_list[device] && devices_list[device].device.hostname === count_array[single_dev] ) //select the ones corresponding to the current device
					{
						for(var network in devices_list[device].device.networks) // list the interfaces
						{
							if (  devices_list[device].device.networks[network].ip_address === devices_list[device].active_ip ) //select active interfaces.
							{
								dev_interfaces.push({'interface' :  devices_list[device].device.networks[network].interface, 'ip_address' :  devices_list[device].device.networks[network].ip_address}); // add theses to the network section
							}
						}
						server_port = devices_list[device].device.server_port ;
					}
				}
				// add the device to the new_device_array
				new_device_array.push({ "hostname" : dev_hostname, "network" : dev_interfaces, "server_port" : server_port});
			}
		}
			/*********************************************************************/
			detected_tool_registered_index = [];
			for (var detected_tool in new_device_array) {
				tool_already_registered = false;
				for (var registered_tool in tools_list) {
					if (new_device_array[detected_tool].hostname === tools_list[registered_tool].hostname) { // if tool is still present.
						tool_already_registered = true;
						detected_tool_registered_index.push(registered_tool);
					}
				}
				if (!tool_already_registered) { // new tool
					detected_tool_registered_index.push(tools_list.push(new_device_array[detected_tool]) - 1); // add the tool to the list and its index to the dedicated array
				}
			}
			for (var registered_tool_index in tools_list) {
				if (detected_tool_registered_index.indexOf(registered_tool_index) !== -1) { // if the registered tool was detected
					tools_list[registered_tool_index].unregister_counter = 0; // reset the unregister counter
				} else {
					tools_list[registered_tool_index].unregister_counter++; //if not increment the unregister counter
				}
				if (tools_list[registered_tool_index].unregister_counter > 4) { // delete the tool from the list after 5 times without detection.
					tools_list.splice(registered_tool_index,1);
				}
			}
		res.json(tools_list);
	});
    next();
};
