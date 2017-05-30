$(document).ready(function() {
  var opener = require("opener");
  init_options();
  last_tools = [];


  function displayTools(tools) {
    $('.fabmo_devices_list').empty();
    if (tools == undefined || Object.keys(tools).length <= 0) { // tools.length doesn't work as we doesn't decrease the size of the array each time we delete a tool
      spinner_html =
        '<div class="spinner">' +
        '<div class="double-bounce1"></div>' +
        '<div class="double-bounce2"></div>' +
        '</div>' +
        "<div class='apologies'>" +
        "<p>Cannot detect any tools on this network.</p><p>Please check to make sure you are on the right network.</p>" +
        "</div> ";

      $('.fabmo_devices_list').append(spinner_html);

    } else {
      tools.forEach(function(tool, index, array) {
        toolInfo = {};

        ChooseBestWayToConnect(tool, function(ip, port) {
          toolInfo.ip = ip;
          toolInfo.port = port;

        });
        var ip = toolInfo.ip;
        var port = toolInfo.port;


        
        var old_state, old_job, old_percentage, isCrashed;
        if (last_tools && last_tools[tool.machine_id]) {
          old_percentage = last_tools[tool.machine_id].percentage;
          old_state = last_tools[tool.machine_id].state;
          old_job = last_tools[tool.machine_id].job;
          isCrashed = last_tools[tool.machine_id].isCrashed;
        }

       var tool_html = makeHTML (tool, ip, port, old_state, old_job, old_percentage, isCrashed);
        
        $('.fabmo_devices_list').append(tool_html);
        bindEvents();


        $.ajax({
          url: 'http://' + ip + ':' + port + '/status',
          type: "GET"
        }).done(function(data) {
          var state = data.data.status.state;
          var job = (data.data.status.job) ? data.data.status.job.name : undefined;

          $('.' + tool.hostname + ' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('.' + tool.hostname + ' .statusTitle').text(state);
          if (job) {
            $('.' + tool.hostname + ' .job_label').text('Job : ');
            $('.' + tool.hostname + ' .job_title').text(job);
            percentage = Math.round((data.data.status.line / data.data.status.nb_lines) * 100);
            $('.' + tool.hostname + ' .job_progress').removeClass().addClass("job_progress c100 p" + percentage + " very_small");
            $('.' + tool.hostname + ' .job_progress span').text(percentage + ' %');
          } else {
            $('.' + tool.hostname + ' .job_label').text('');
            $('.' + tool.hostname + ' .job_title').text('');
            $('.' + tool.hostname + ' .job_progress').removeClass("job_progress").addClass("hidden");
            percentage = "";
          }
          last_tools[tool.hostname] = {};
          last_tools[tool.hostname].percentage = percentage;
          last_tools[tool.hostname].state = state;
          last_tools[tool.hostname].job = job;
          last_tools[tool.hostname].isCrashed = false;
        }).fail(function() {
          // Engine is not responding
          var state = 'crashed';
          $('.' + tool.hostname + ' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('.' + tool.hostname + ' .statusTitle').text(state);
          $('.' + tool.hostname + ' .job_label').text('');
          $('.' + tool.hostname + ' .job_title').text('');
          $('.' + tool.hostname + ' .job_progress').removeClass("job_progress").addClass("hidden");
          percentage = "";
          $('.' + tool.hostname + ' .goHere').attr('href', 'http://' + ip + ':' + (port + 1));

          last_tools[tool.hostname] = {};
          last_tools[tool.hostname].percentage = percentage;
          last_tools[tool.hostname].state = state;
          last_tools[tool.hostname].job = undefined;
          last_tools[tool.hostname].isCrashed = true;
        });
      });


    }
  };

  function displayToolsFromCloud(localData, dataFromCloud) {

    if (dataFromCloud) {
    var uniqueIps = removeDuplicates(dataFromCloud.data, 'machine_id');
   
     if (Object.keys(localData).length) {
      for (var i = 0 ; i < Object.keys(localData).length; i++){
       ChooseBestWayToConnect(localData[i], function(ip, port) {
         var newObj = {}
          newObj.local_ip = ip;
          newObj.port = port;
          newObj.machine_id= localData[i].hostname;
          var results = uniqueIps.filter(function (entry) { return entry.local_ip === ip; });
          if(!results.length){
            uniqueIps.push(newObj);
          }
        });
      }
     }
      $('.tool').each(function(){
      var match = false;
      for(var i = 0; i < uniqueIps.length; i++){
        if (this.id === uniqueIps[i].machine_id){
          match = true;
        }
      }
      if (!match){
        $(this).remove();
      }
    });
    uniqueIps.forEach(function(tool, index, array) {
      var ip = tool.local_ip;
      var port = tool.port || 80;
      $.ajax({
        url: 'http://' + tool.local_ip + ':' + port + '/updater/config',
        type: "GET"
      }).done(function(data) {
        tool.hostname = data.data.config.name;
        tool.port = data.data.config.engine_server_port;


        var currentToolEl = document.getElementById(tool.machine_id);
        if (currentToolEl === null) {
          $('.spinner').remove();
          $('.apologies').remove();
          var tool_html = makeHTML(tool, ip, port);
           

          $('.fabmo_devices_list').append(tool_html);
          bindEvents()
        }

        $.ajax({
          url: 'http://' + ip + ':' + port + '/status',
          type: "GET"
        }).done(function(data) {
          var state = data.data.status.state;
          var job = (data.data.status.job) ? data.data.status.job.name : undefined;
          var percentage;
          var isCrashed = false;
          $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('#' + tool.machine_id + ' .statusTitle').text(state);
          $('#' + tool.machine_id + ' .goHere').removeClass("goUpdater");
          if (job) {
            $('#' + tool.machine_id + ' .job_label').text('Job : ');
            $('#' + tool.machine_id + ' .job_title').text(job);
            percentage = Math.round((data.data.status.line / data.data.status.nb_lines) * 100);
            $('#' + tool.machine_id + ' .job_progress').removeClass().addClass("job_progress c100 p" + percentage + " very_small");
            $('#' + tool.machine_id + ' .job_progress span').text(percentage + ' %');
          } else {
            $('#' + tool.machine_id + ' .job_label').text('');
            $('#' + tool.machine_id + ' .job_title').text('');
            $('#' + tool.machine_id + ' .job_progress').removeClass().addClass("hidden job_progress c100 p0 very_small");
            percentage = "";
          }
          
        }).fail(function() {
          console.log("this engine is not responding");
          // var state = 'crashed';
          // $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          // $('#' + tool.machine_id + ' .statusTitle').text(state);
          // $('#' + tool.machine_id + ' .job_label').text('');
          // $('#' + tool.machine_id + ' .job_title').text('');
          // $('#' + tool.machine_id + ' .job_progress').removeClass("job_progress").addClass("hidden");
          // percentage = "";
          // $('#' + tool.machine_id + ' .goHere').addClass("goUpdater").attr('href', 'http://' + ip + ':' + (port + 1));

          // last_tools[tool.machine_id] = {};
          // last_tools[tool.machine_id].percentage = percentage;
          // last_tools[tool.machine_id].state = state;
          // last_tools[tool.machine_id].job = undefined;
          // last_tools[tool.machine_id].isCrashed = true;
        });

      }).fail(function() {

        $.ajax({
          url: 'http://' + ip + ':' + (port + 1) + '/config',
          type: "GET"
        }).done(function(data) {
          var state = 'crashed';
          $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('#' + tool.machine_id + ' .statusTitle').text(state);
          $('#' + tool.machine_id + ' .job_label').text('');
          $('#' + tool.machine_id + ' .job_title').text('');
          $('#' + tool.machine_id + ' .job_progress').removeClass("job_progress").addClass("hidden");
          percentage = "";
          $('#' + tool.machine_id + ' .goHere').addClass("goUpdater").attr('href', 'http://' + ip + ':' + (port + 1));

        }).fail(function() {
          if ($('#'+tool.machine_id).length){
            $('#'+tool.machine_id).remove();
          }
          
        })

      });
    })
    if ($('.fabmo_devices_list').length === 0){
      displayTools(localData);
    }
    } else {
      displayTools(localData);
    }
  }

function makeHTML (tool, ip, port, old_state, old_job, old_percentage, isCrashed) {
  return  '<div class="pure-g tool '+tool.hostname+'" id="' + tool.machine_id + '">' +
            '<div class="pure-u-1-12"></div>' +
            '<div class="panel pure-u-5-6">' +
            '<div class="panelHeader">' +
            '<div class="wifi"><img src="images/wifi110.png"></div>' +
            '<div class=" toolName-scroll-box scroll-box"><div class="toolName scroll-text">' + tool.hostname + '</div></div>' +
            '<div class="statusContainer">' +
            '<div class="statusColor ' + (old_state || '') + '"></div>' +
            '<p class="statusTitle">' + (old_state || '') + '</p>' +
            '</div>' +
            '</div>' +
            '<p class="ipAddress">' + ip + '</p>' +
            '<a class="goHere ' + (isCrashed ? "goUpdater" : "") + '" href="http://' + ip + ':' + ((old_state === 'crashed') ? port + 1 : port) + '"><img src="images/newwindow.png"></a>' +
            '<div class="job">' +
            '<div class="' + ((old_job) ? '' : 'hidden') + ' job_progress c100 p' + (old_percentage || 0) + ' very_small">' +
            '<span>' + (old_percentage || 0) + ' %</span>' +
            '<div class="slice"><div class="bar"></div><div class="fill"></div></div>' +
            '</div>' +
            '<span class="job_label">' + ((old_job) ? 'Job : ' : '') + '</span>' +
            '<div class="jobName-scroll-box scroll-box"><div class="scroll-text"><span class="job_title">' + (old_job || '') + '</span></div></div>' +
            '</div>' +
            '</div>' +
            '</div>';
}

function bindEvents(){
  $('.goHere').on("click", function(e) {
    e.preventDefault();
    opener(this.href);
    return false;
  });

  $('.scroll-box').mouseenter(function() {
    $(this).active = true;
    $(this).stop();
    var boxWidth = $(this).width();
    var textWidth = $('.scroll-text', $(this)).width();
    if (textWidth > boxWidth) {
      var animSpeed = textWidth * 5;
      $(this).animate({
        scrollLeft: (textWidth - boxWidth)
      }, animSpeed, function() {
        $(this).animate({
          scrollLeft: 0
        }, animSpeed, function() {
          $(this).trigger('mouseenter');
        });
      });
    }
  }).mouseleave(function() {
    var animSpeed = $(this).scrollLeft() * 5;
    $(this).stop().animate({
      scrollLeft: 0
    }, animSpeed);
  });
}




  setInterval(function() {

    checkBeacon(
      function(err, data) {
        if (err) {
          DetectToolsOnTheNetworks(
            function(err, data, dataFromCloud) {
              if (err) {
                console.error(err);
                displayToolsFromCloud(data, dataFromCloud);
              } else if (dataFromCloud) {
                displayToolsFromCloud(data, dataFromCloud);
              } else {
                displayTools(data);
              }
            }, err
          )
        } else {
          DetectToolsOnTheNetworks(
            function(err, data, dataFromCloud) {
              if (err) {
                console.error(err);
                displayToolsFromCloud(data, dataFromCloud);
              } else if (dataFromCloud) {
                displayToolsFromCloud(data, dataFromCloud);
              } else {
                displayTools(data);
              }
            }, data
          )
        }
      }
    );
  }, 2000);

});
