$(document).ready(function() {
  init_options();
  last_tools=[];

  function displayTools(tools) {
    $('.fabmo_devices_list').empty();
    if(Object.keys(tools).length<=0){ // tools.length doesn't work as we doesn't decrease the size of the array each time we delete a tool
      spinner_html=
      '<div class="spinner">'+
        '<div class="double-bounce1"></div>'+
        '<div class="double-bounce2"></div>'+
      '</div>'+
        "<div class='apologies'>"+
        "<p>Sorry. Despite my best efforts, I wasn't able to locate any tools...</p>"+
        "<p>I will persist though !</p>"+
      "</div> ";

      $('.fabmo_devices_list').append(spinner_html);

    }
    else{
      tools.forEach(function(tool, index, array) {
        toolInfo = {};

        ChooseBestWayToConnect(tool, function(ip, port) {
          toolInfo.ip = ip;
          toolInfo.port = port;

        });
        var ip = toolInfo.ip;
        var port = toolInfo.port;


        var old_state,old_job,old_percentage,isCrashed;
        if(last_tools && last_tools[tool.hostname]){
          old_percentage =last_tools[tool.hostname].percentage;
          old_state =last_tools[tool.hostname].state;
          old_job =last_tools[tool.hostname].job;
                        isCrashed = last_tools[tool.hostname].isCrashed;
        }


        tool_html =
                '<div class="pure-g '+tool.hostname+'">'+
                  '<div class="pure-u-1-12"></div>'+
                    '<div class="panel pure-u-5-6">' +
                  '<div class="panelHeader">'+
                '<div class="wifi"><img src="images/wifi110.png"></div>' +
                    '<div class=" toolName-scroll-box scroll-box"><div class="toolName scroll-text">' + tool.hostname + '</div></div>'+
                '<div class="statusContainer">'+
                          '<div class="statusColor '+(old_state||'')+'"></div>'+
                          '<p class="statusTitle">'+(old_state||'')+'</p>' +
                '</div>'+
              '</div>'+
              '<p class="ipAddress">' + ip + '</p>' +
              '<a class="goHere '+(isCrashed?"goUpdater":"")+'" href="http://' + ip + ':' + ((old_state==='crashed')?port+1:port) + '"><img src="images/newwindow.png"></a>' +
                  '<div class="job">'+
                '<div class="'+((old_job)?'':'hidden')+' job_progress c100 p'+(old_percentage||0)+' very_small">'+
                  '<span>'+(old_percentage||0)+' %</span>'+
                  '<div class="slice"><div class="bar"></div><div class="fill"></div></div>'+
                '</div>'+
                          '<span class="job_label">'+((old_job)?'Job : ':'')+'</span>'+
                          '<div class="jobName-scroll-box scroll-box"><div class="scroll-text"><span class="job_title">'+(old_job||'')+'</span></div></div>'+
              '</div>' +
              '</div>'+
                '</div>';
        $('.fabmo_devices_list').append(tool_html);


        $.ajax({
          url: 'http://' + ip + ':' + port + '/status',
          type: "GET"
        }).done(function(data) {
          var state = data.data.status.state;
          var job = (data.data.status.job)?data.data.status.job.name:undefined;

          $('.'+tool.hostname+' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('.'+tool.hostname+' .statusTitle').text(state);
          if(job){
            $('.'+tool.hostname+' .job_label').text('Job : ');
            $('.'+tool.hostname+' .job_title').text(job);
            percentage=Math.round((data.data.status.line/data.data.status.nb_lines)*100);
            $('.'+tool.hostname+' .job_progress').removeClass().addClass("job_progress c100 p"+percentage+" very_small");
            $('.'+tool.hostname+' .job_progress span').text(percentage+' %');
          }else{
            $('.'+tool.hostname+' .job_label').text('');
            $('.'+tool.hostname+' .job_title').text('');
            $('.'+tool.hostname+' .job_progress').removeClass("job_progress").addClass("hidden");
            percentage="";
          }
          last_tools[tool.hostname]={};
          last_tools[tool.hostname].percentage=percentage;
          last_tools[tool.hostname].state=state;
          last_tools[tool.hostname].job=job;
          last_tools[tool.hostname].isCrashed=false;
        }).fail(function() {
          // Engine is not responding
          var state = 'crashed';
          $('.'+tool.hostname+' .statusColor').removeClass('running idle manual paused stopped crashed').addClass(state);
          $('.'+tool.hostname+' .statusTitle').text(state);
          $('.'+tool.hostname+' .job_label').text('');
          $('.'+tool.hostname+' .job_title').text('');
          $('.'+tool.hostname+' .job_progress').removeClass("job_progress").addClass("hidden");
          percentage="";
          $('.'+tool.hostname+' .goHere').attr('href','http://' + ip + ':' + (port+1));

          last_tools[tool.hostname]={};
          last_tools[tool.hostname].percentage=percentage;
          last_tools[tool.hostname].state=state;
          last_tools[tool.hostname].job=undefined;
          last_tools[tool.hostname].isCrashed = true;
        });
      });

      $('.goHere').on("click", function(e) {
        e.preventDefault();
        open_link(this.href);
        return false;
      });

    $('.scroll-box').mouseenter(function () {
      $(this).active =true;
      $(this).stop();
      var boxWidth = $(this).width();
      var textWidth = $('.scroll-text', $(this)).width();
      if (textWidth > boxWidth) {
        var animSpeed = textWidth * 5;
        $(this).animate({
          scrollLeft: (textWidth - boxWidth)
        }, animSpeed, function () {
          $(this).animate({
            scrollLeft: 0
          }, animSpeed, function () {
            $(this).trigger('mouseenter');
          });
        });
      }
    }).mouseleave(function () {
      var animSpeed = $(this).scrollLeft() * 5;
      $(this).stop().animate({
        scrollLeft: 0
      }, animSpeed);
    });

    }
  }


  setInterval(function() {
  DetectToolsOnTheNetworks(
    function(err, data) {
      if (err) {
        console.error(err);
      } else {
        displayTools(data);
      }
    });
  }, 2000);

});
