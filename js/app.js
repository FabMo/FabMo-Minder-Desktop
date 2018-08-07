$(document).ready(function() {
  var opener = require("opener");
  init_options();
  last_tools = [];



  function displayToolsFromCloud(localData, dataFromCloud) {
    var uniqueIps = [];
    if (dataFromCloud) {
      uniqueIps = removeDuplicates(dataFromCloud.data, 'machine_id');
    }
     if (localData) {
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
           

          $('.fabmo_devices_list').prepend(tool_html);
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
          $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped down').addClass(state);
          $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped down').addClass(state);
          $('#' + tool.machine_id + ' .statusTitle').text(state);
          $('#' + tool.machine_id).parent('a').attr('href', 'http://' + ip + ':' + (port));
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
          
        })

      }).fail(function() {

        $.ajax({
          url: 'http://' + ip + ':' + (port + 1) + '/config',
          type: "GET"
        }).done(function(data) {
          tool.hostname = data.data.config.name;
          var currentToolEl = document.getElementById(tool.machine_id);
          if (currentToolEl === null) {
            $('.spinner').remove();
            $('.apologies').remove();
            var tool_html = makeHTML(tool, ip, port);
            $('.fabmo_devices_list').append(tool_html);
            bindEvents()
          }

          var state = 'down';
          $('#' + tool.machine_id + ' .statusColor').removeClass('running idle manual paused stopped down').addClass(state);
          $('#' + tool.machine_id + ' .statusTitle').text(state);
          $('#' + tool.machine_id + ' .job_label').text('');
          $('#' + tool.machine_id + ' .job_title').text('');
          $('#' + tool.machine_id + ' .job_progress').removeClass("job_progress").addClass("hidden");
          percentage = "";
          $('#' + tool.machine_id).parent('a').attr('href', 'http://' + ip + ':' + (port + 1));;

        }).fail(function() {
          if ($('#'+tool.machine_id).length){
            $('#'+tool.machine_id).remove();
          }
        })
      });
    })
  }

function makeHTML (tool, ip, port, old_state, old_job, old_percentage, isCrashed) {
  console.log(tool);
  return    '<a class="goHere"  href="http://' + ip + ':' + ((old_state == 'down') ? (port + 1) : '') + '">'+
              '<div class="tool" id="' + tool.machine_id + '">' +
                '<div class=""></div>' +
                '<div class="panel">' +
                  '<div class="panelHeader">' +
                    '<div class=" toolName-scroll-box scroll-box"><div class="toolName scroll-text">' + tool.hostname + '</div></div>' +
                    '<div class="statusContainer">' +
                      '<span class="statusTitle">' + (old_state || '') + '</span>' +
                      '<div class="statusColor ' + (old_state || '') + '"></div>' +
                    '</div>' +
                  '</div>' +
                  '<p class="ipAddress">' + ip + '</p>' +
                  '<div class="job">' +
                    '<span class="job_label">' + ((old_job) ? 'Job : ' : '') + '</span>' +
                    '<div class="jobName-scroll-box scroll-box"><div class="scroll-text"><span class="job_title">' + (old_job || '') + '</span></div></div>' +
                    '<div class="job_progress_container">'+
                      '<div class="' + ((old_job) ? '' : 'hidden') + ' job_progress c100 p' + (old_percentage || 0) + ' very_small">' +
                        '<span>' + (old_percentage || 0) + ' %</span>' +
                        '<div class="slice"><div class="bar"></div><div class="fill"></div></div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</a>'
            ;
}

function bindEvents(){
  $('.goHere').off();
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
      function(err, dataFromCloud) {
        if (err) {
          console.log('cloud');
          console.log(err);
          DetectToolsOnTheNetworks(
            function(err, data) {
              if (err) {
                console.log('local');
                console.error(err);
                displayToolsFromCloud(data, null);
              } else  {
                displayToolsFromCloud(data, null);
              }
            }
          )
        } else {
          DetectToolsOnTheNetworks(
            function(err, data) {
              if (err) {
                console.error(err);
                displayToolsFromCloud(null, dataFromCloud);
              } else if (dataFromCloud) {
                displayToolsFromCloud(null, dataFromCloud);
              } 
            }
          )
        }
      }
    );
  }, 2000);

});
